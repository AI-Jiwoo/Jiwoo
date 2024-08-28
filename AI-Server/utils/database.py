import logging
import os
from pymilvus import Collection, CollectionSchema, DataType, FieldSchema, connections, utility
from config.settings import settings

logger = logging.getLogger(__name__)


def connect_to_milvus():
    """
    Milvus 데이터베이스에 연결하는 함수
    """
    host = os.getenv("MILVUS_HOST", settings.MILVUS_HOST)
    port = os.getenv("MILVUS_PORT", settings.MILVUS_PORT)
    try:
        connections.connect("default", host=host, port=port, ignore_partition=True)
        logger.info(f"Successfully connected to Milvus at {host}:{port}")
    except Exception as e:
        logger.error(f"Failed to connect to Milvus: {str(e)}")
        raise


def create_collection(collection_name: str, dim: int) -> Collection:
    """
    컬렉션을 생성하는 함수
    :param collection_name: 생성할 컬렉션의 이름
    :param dim: 벡터의 차원
    :return: 생성된 컬렉션 객체
    """
    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
        FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=65535),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=dim),
    ]
    schema = CollectionSchema(fields, f"Collection for {collection_name}")
    collection = Collection(collection_name, schema)

    index_params = {
        "index_type": "IVF_FLAT",
        "metric_type": "L2",
        "params": {"nlist": 1024},
    }
    collection.create_index("embedding", index_params)
    logger.info(f"Collection {collection_name} created successfully")
    return collection


def get_collection(collection_name: str = settings.COLLECTION_NAME) -> Collection:
    """
    지정된 이름의 컬렉션을 가져오는 함수
    :param collection_name: 가져올 컬렉션의 이름
    :return: 요청된 컬렉션 객체
    """
    try:
        if not utility.has_collection(collection_name):
            logger.warning(f"Collection {collection_name} does not exist. Creating a new one.")
            collection = create_collection(collection_name, settings.EMBEDDING_DIMENSION)
        else:
            collection = Collection(collection_name)
        collection.load()
        logger.info(f"Collection {collection_name} loaded successfully")
        return collection
    except Exception as e:
        logger.error(f"Error while getting collection {collection_name}: {str(e)}")
        raise


def close_milvus_connection() -> None:
    """
    Milvus 연결을 종료하는 함수
    """
    try:
        connections.disconnect("default")
        logger.info("Successfully disconnected from Milvus")
    except Exception as e:
        logger.error(f"Error while disconnecting from Milvus: {str(e)}")
        raise


# 데이터베이스 연결을 위한 컨텍스트 매니저
class MilvusConnectionManager:
    def __enter__(self):
        connect_to_milvus()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        close_milvus_connection()
