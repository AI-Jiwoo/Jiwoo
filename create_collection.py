from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def connect_to_milvus(host="localhost", port="19530"):
    """Milvus 데이터베이스에 연결"""
    try:
        connections.connect("default", host=host, port=port)
        logger.info(f"Connected to Milvus server at {host}:{port}")
    except Exception as e:
        logger.error(f"Failed to connect to Milvus: {str(e)}")
        raise

def create_collection(collection_name="company_collection"):
    """Milvus 컬렉션 생성 및 설정"""
    try:
        # 현재 존재하는 모든 컬렉션 목록 출력
        logger.info(f"Existing collections: {utility.list_collections()}")

        # 컬렉션이 이미 존재하는 경우 삭제
        if utility.has_collection(collection_name):
            utility.drop_collection(collection_name)
            logger.info(f"Existing collection {collection_name} has been dropped.")

        # 컬렉션의 스키마 정의
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="businessName", dtype=DataType.VARCHAR, max_length=255),
            FieldSchema(name="info", dtype=DataType.JSON),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=768)
        ]

        # 컬렉션 스키마 생성
        schema = CollectionSchema(fields, "Business information collection for similarity search and chatbot")

        # 컬렉션 생성
        collection = Collection(collection_name, schema)

        # 인덱스 생성
        create_index(collection)

        logger.info(f"Collection {collection_name} created successfully")
    except Exception as e:
        logger.error(f"Error creating collection: {str(e)}")
        raise

def create_index(collection):
    """컬렉션에 인덱스 생성"""
    index_params = {
        "index_type": "IVF_FLAT",
        "metric_type": "L2",
        "params": {"nlist": 1024}
    }
    collection.create_index("embedding", index_params)
    logger.info("Index created successfully")

def main():
    """메인 함수"""
    try:
        connect_to_milvus()
        create_collection()
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()