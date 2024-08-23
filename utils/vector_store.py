import logging
from typing import List, Dict, Any
from datetime import datetime
from pymilvus import Collection, CollectionSchema, DataType, FieldSchema, utility

from config.settings import settings
from utils.database import connect_to_milvus, get_collection
from utils.embedding_utils import get_embedding_function
from services.models import CompanyInfo, SupportProgramInfo

logger = logging.getLogger(__name__)

class VectorStore:
    """Milvus를 사용한 벡터 저장소 클래스"""

    def __init__(self, host=settings.MILVUS_HOST, port=settings.MILVUS_PORT):
        # 벡터 저장소 초기화
        self.embedding_function = get_embedding_function()
        self.collection_name = settings.COLLECTION_NAME
        connect_to_milvus()
        self._ensure_collection_exists()

    def _ensure_collection_exists(self):
        # 컬렉션 존재 여부 확인 및 생성
        if not utility.has_collection(self.collection_name):
            self._create_collection_and_index()
        else:
            self._check_and_create_index()

    def _create_collection_and_index(self):
        # 컬렉션 및 인덱스 생성
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=65535),
            FieldSchema(name="url", dtype=DataType.VARCHAR, max_length=1024),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=settings.EMBEDDING_DIMENSION),
            FieldSchema(name="created_at", dtype=DataType.INT64), 
        ]
        schema = CollectionSchema(fields, "비즈니스 정보 유사도 검색을 위한 스키마")
        collection = Collection(name=self.collection_name, schema=schema)
        self._create_index(collection)
        logger.info(f"컬렉션 및 인덱스 생성 완료: {self.collection_name}")

    def _check_and_create_index(self):
        # 기존 컬렉션의 인덱스 확인 및 생성
        collection = get_collection(self.collection_name)
        if not collection.has_index():
            self._create_index(collection)
            logger.info(f"기존 컬렉션에 인덱스 생성 완료: {self.collection_name}")
        else:
            logger.info(f"컬렉션 및 인덱스가 이미 존재함: {self.collection_name}")

    def _create_index(self, collection):
        # 인덱스 생성
        index_params = {
            "index_type": "IVF_FLAT",
            "metric_type": "L2",
            "params": {"nlist": 1024},
        }
        collection.create_index("embedding", index_params)

    def add_texts(self, texts: List[str], urls: List[str] = None):
        # 텍스트를 벡터 저장소에 추가
        collection = get_collection(self.collection_name)
        embeddings = [self.embedding_function(text) for text in texts]
        
        if urls is None:
            urls = [""] * len(texts)
        
        created_at = int(datetime.now().timestamp())
        entities = [texts, urls, embeddings, [created_at] * len(texts)]
        collection.insert(entities)
        collection.flush()
        logger.info(f"{len(texts)}개의 텍스트를 컬렉션에 추가함")
        
    def add_company_info(self, company_name: str, info: CompanyInfo):
        # 회사 정보를 벡터 저장소에 추가
        text = f"Company: {company_name}\n{info.json()}"
        url = f"company:{business_name}"
        self.add_texts([text], [f"company:{company_name}"])
    
    def add_support_program_info(self, program: SupportProgramInfo):
        # 지원 프로그램 정보를 벡터 저장소에 추가
        text = f"Support Program: {program.name}\n{program.json()}"
        self.add_texts([text], [f"program:{program.name}"])

    def search_with_similarity_threshold(self, query: str, k: int = 5, threshold: float = 0.4) -> List[Dict[str, Any]]:
        # 유사도 임계값을 적용한 검색 수행
        collection = get_collection(self.collection_name)
        search_params = {"metric_type": "L2", "params": {"nprobe": 10}}

        results = collection.search(
            data=[self.embedding_function(query)],
            anns_field="embedding",
            param=search_params,
            limit=k,
            output_fields=["content", "url", "created_at"],
        )

        if not results or len(results[0]) == 0:
            logger.info("벡터 저장소에서 결과를 찾지 못함")
            return []

        hits = []
        for hit in results[0]:
            distance = hit.distance
            similarity = 1 - (distance / max(results[0][0].distance, 1))
            if similarity >= threshold:
                hits.append({
                    "content": hit.entity.get("content"),
                    "url": hit.entity.get("url"),
                    "created_at": hit.entity.get("created_at"),
                    "metadata": {"similarity": similarity}
                })

        if not hits:
            logger.info(f"유사도 임계값 {threshold}를 충족하는 결과가 없음")

        return hits

    def search_by_date_range(self, query: str, start_date: datetime, end_date: datetime, k: int = 5) -> List[Dict[str, Any]]:
        # 날짜 범위를 지정하여 검색 수행
        collection = get_collection(self.collection_name)
        search_params = {"metric_type": "L2", "params": {"nprobe": 10}}

        results = collection.search(
            data=[self.embedding_function(query)],
            anns_field="embedding",
            param=search_params,
            limit=k,
            output_fields=["content", "url", "created_at"],
            expr=f"created_at >= {int(start_date.timestamp())} && created_at <= {int(end_date.timestamp())}"
        )

        if not results or len(results[0]) == 0:
            logger.info("지정된 날짜 범위에서 결과를 찾지 못함")
            return []

        hits = []
        for hit in results[0]:
            hits.append({
                "content": hit.entity.get("content"),
                "url": hit.entity.get("url"),
                "created_at": datetime.fromtimestamp(hit.entity.get("created_at")),
                "metadata": {"distance": hit.distance}
            })

        return hits