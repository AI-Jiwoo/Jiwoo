from pymilvus import connections, Collection, utility
import logging
from config.settings import settings

logger = logging.getLogger(__name__)

def connect_to_milvus(host: str = settings.MILVUS_HOST, port: str = settings.MILVUS_PORT) -> None:
    """
    Milvus 데이터베이스에 연결하는 함수
    :param host: Milvus 서버 호스트 주소
    :param port: Milvus 서버 포트 번호
    """
    try:
        connections.connect("default", host=host, port=port)
        logger.info(f"Successfully connected to Milvus at {host}:{port}")
    except Exception as e:
        logger.error(f"Failed to connect to Milvus: {str(e)}")
        raise

def get_collection(collection_name: str = settings.COLLECTION_NAME) -> Collection:
    """
    지정된 이름의 컬렉션을 가져오는 함수
    :param collection_name: 가져올 컬렉션의 이름
    :return: 요청된 컬렉션 객체
    :raises ValueError: 컬렉션이 존재하지 않을 경우
    """
    if not utility.has_collection(collection_name):
        logger.error(f"Collection {collection_name} does not exist")
        raise ValueError(f"Collection {collection_name} does not exist.")
    collection = Collection(collection_name)
    collection.load()
    logger.info(f"Collection {collection_name} loaded successfully")
    return collection

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