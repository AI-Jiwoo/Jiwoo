import logging
from typing import List, Dict
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from pymilvus import Collection, CollectionSchema, DataType, FieldSchema, utility

from config.settings import settings
from utils.database import connect_to_milvus, get_collection
from utils.embedding_utils import get_embedding_function

logger = logging.getLogger(__name__)

class VectorStore:
    """Milvus를 사용한 벡터 저장소 클래스"""

    def __init__(self, host=settings.MILVUS_HOST, port=settings.MILVUS_PORT):
        """
        VectorStore 초기화
        :param host: Milvus 서버 호스트
        :param port: Milvus 서버 포트
        """
        self.embedding_function = get_embedding_function()
        self.collection_name = settings.COLLECTION_NAME
        connect_to_milvus()
        self._ensure_collection_exists()

    def _ensure_collection_exists(self):
        """컬렉션 존재 여부 확인 및 생성"""
        if not utility.has_collection(self.collection_name):
            self._create_collection_and_index()
        else:
            self._check_and_create_index()

    def _create_collection_and_index(self):
        """컬렉션 및 인덱스 생성"""
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=65535),
            FieldSchema(name="url", dtype=DataType.VARCHAR, max_length=1024),  # URL 필드 추가
            FieldSchema(
                name="embedding",
                dtype=DataType.FLOAT_VECTOR,
                dim=settings.EMBEDDING_DIMENSION,
            ),
        ]
        schema = CollectionSchema(fields, "Business information for similarity search")
        collection = Collection(name=self.collection_name, schema=schema)
        self._create_index(collection)
        logger.info(f"Created collection and index: {self.collection_name}")

    def _check_and_create_index(self):
        """기존 컬렉션의 인덱스 확인 및 생성"""
        collection = get_collection(self.collection_name)
        if not collection.has_index():
            self._create_index(collection)
            logger.info(f"Created index for existing collection: {self.collection_name}")
        else:
            logger.info(f"Collection and index already exist: {self.collection_name}")

    def _create_index(self, collection):
        """인덱스 생성"""
        index_params = {
            "index_type": "IVF_FLAT",
            "metric_type": "L2",
            "params": {"nlist": 1024},
        }
        collection.create_index("embedding", index_params)

    def add_texts(self, texts: List[str], urls: List[str] = None):
        """
        텍스트를 벡터 저장소에 추가
        :param texts: 추가할 텍스트 리스트
        :param urls: 텍스트에 해당하는 URL 리스트 (선택적)
        """
        collection = get_collection(self.collection_name)
        embeddings = [self.embedding_function(text) for text in texts]
        
        if urls is None:
            urls = [""] * len(texts)
        
        entities = [texts, urls, embeddings]
        collection.insert(entities)
        collection.flush()
        logger.info(f"Added {len(texts)} texts to the collection")

    def add_search_results(self, results: List[Dict[str, str]]):
        """
        검색 결과를 벡터 저장소에 추가
        :param results: 검색 결과 리스트 (각 항목은 'content'와 'url' 키를 포함하는 딕셔너리)
        """
        texts = [result['content'] for result in results]
        urls = [result['url'] for result in results]
        self.add_texts(texts, urls)

    def similarity_search(self, query: str, k: int = 5) -> List[Dict[str, str]]:
        """
        유사도 검색 수행
        :param query: 검색 쿼리
        :param k: 반환할 결과 수
        :return: 유사한 문서 리스트
        """
        collection = get_collection(self.collection_name)
        search_params = {"metric_type": "L2", "params": {"nprobe": 10}}

        results = collection.search(
            data=[self.embedding_function(query)],
            anns_field="embedding",
            param=search_params,
            limit=k,
            output_fields=["content", "url"],
        )

        if not results or len(results[0]) == 0:
            logger.info("No results found in vector store.")
            return []

        hits = [
            {"content": hit.entity.get("content"), "url": hit.entity.get("url"), "metadata": {}}
            for hit in results[0] if hit.entity.get("content")
        ]

        if not hits:
            logger.info("No content found in the search results.")

        return hits

    def search_with_similarity_threshold(self, query: str, k: int = 5, threshold: float = 0.4) -> List[Dict[str, str]]:
        """
        유사도 임계값을 적용한 검색 수행
        :param query: 검색 쿼리
        :param k: 반환할 최대 결과 수
        :param threshold: 유사도 임계값
        :return: 임계값을 넘는 유사한 문서 리스트
        """
        collection = get_collection(self.collection_name)
        search_params = {"metric_type": "L2", "params": {"nprobe": 10}}

        results = collection.search(
            data=[self.embedding_function(query)],
            anns_field="embedding",
            param=search_params,
            limit=k,
            output_fields=["content", "url"],
        )

        if not results or len(results[0]) == 0:
            logger.info("No results found in vector store.")
            return []

        hits = []
        for hit in results[0]:
            distance = hit.distance
            similarity = 1 - (distance / max(results[0][0].distance, 1))
            if similarity >= threshold:
                hits.append({
                    "content": hit.entity.get("content"),
                    "url": hit.entity.get("url"),
                    "metadata": {"similarity": similarity}
                })

        if not hits:
            logger.info(f"No results met the similarity threshold of {threshold}.")

        return hits

    def get_relevant_info(self, query: str, k: int = 5) -> List[Dict[str, str]]:
        """
        주어진 쿼리에 대해 관련 정보를 검색
        :param query: 검색 쿼리
        :param k: 반환할 결과 수
        :return: 관련 정보 리스트
        """
        return self.search_with_similarity_threshold(query, k=k, threshold=settings.SIMILARITY_THRESHOLD)

    def load_documents(self, file_path: str):
        """
        파일에서 문서 로드 및 벡터 저장소에 추가
        :param file_path: 로드할 파일 경로
        """
        loader = TextLoader(file_path)
        documents = loader.load()
        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        texts = text_splitter.split_documents(documents)
        self.add_texts([doc.page_content for doc in texts])
        logger.info(f"Loaded and added documents from {file_path}")