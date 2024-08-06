from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from app.embeddings import get_embedding_function
import logging

logger = logging.getLogger(__name__)

class VectorStore:
    """Milvus를 사용한 벡터 저장소 클래스"""

    def __init__(self, host="localhost", port="19530"):
        """
        VectorStore 초기화
        :param host: Milvus 서버 호스트
        :param port: Milvus 서버 포트
        """
        self.embedding_function = get_embedding_function()
        self.collection_name = "business_info"
        self._connect_to_milvus(host, port)
        self._ensure_collection_exists()

    def _connect_to_milvus(self, host, port):
        """Milvus 서버에 연결"""
        try:
            connections.connect("default", host=host, port=port)
            logger.info(f"Connected to Milvus server at {host}:{port}")
        except Exception as e:
            logger.error(f"Failed to connect to Milvus: {str(e)}")
            raise

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
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=768)
        ]
        schema = CollectionSchema(fields, "Business information for similarity search")
        collection = Collection(name=self.collection_name, schema=schema)
        self._create_index(collection)
        logger.info(f"Created collection and index: {self.collection_name}")

    def _check_and_create_index(self):
        """기존 컬렉션의 인덱스 확인 및 생성"""
        collection = Collection(self.collection_name)
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
            "params": {"nlist": 1024}
        }
        collection.create_index("embedding", index_params)

    def add_texts(self, texts, metadatas=None):
        """
        텍스트를 벡터 저장소에 추가
        :param texts: 추가할 텍스트 리스트
        :param metadatas: 텍스트에 대한 메타데이터 (사용되지 않음)
        """
        collection = Collection(self.collection_name)
        collection.load()
        embeddings = [self.embedding_function(text) for text in texts]
        entities = [texts, embeddings]
        collection.insert(entities)
        collection.flush()
        logger.info(f"Added {len(texts)} texts to the collection")

    def similarity_search(self, query, k=5):
        """
        유사도 검색 수행
        :param query: 검색 쿼리
        :param k: 반환할 결과 수
        :return: 유사한 문서 리스트
        """
        collection = Collection(self.collection_name)
        collection.load()
        search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
        results = collection.search(
            data=[self.embedding_function(query)],
            anns_field="embedding",
            param=search_params,
            limit=k,
            output_fields=["content"]
        )
        return [{"page_content": hit.entity.get('content'), "metadata": {}} for hit in results[0]]

    def load_documents(self, file_path):
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