from typing import List, Callable
from sentence_transformers import SentenceTransformer
from services.models import CompanyInfo
import logging
from config.settings import settings

# 로깅 설정
logger = logging.getLogger(__name__)

# 다국어 지원 문장 임베딩 모델 로드
try:
    model = SentenceTransformer(settings.EMBEDDING_MODEL)
    logger.info("Successfully loaded SentenceTransformer model")
except Exception as e:
    logger.error(f"Failed to load SentenceTransformer model: {str(e)}")
    raise

def company_info_to_text(info: CompanyInfo) -> str:
    """
    CompanyInfo 객체를 텍스트 문자열로 변환하는 함수
    :param info: 변환할 CompanyInfo 객체
    :return: 변환된 텍스트 문자열
    """
    return f"{info.businessPlatform} {info.businessScale} {info.business_field} {info.businessStartDate} {info.investmentStatus} {info.customerType}"

def get_embedding(text: str) -> List[float]:
    """
    텍스트를 임베딩 벡터로 변환하는 함수
    :param text: 임베딩할 텍스트
    :return: 임베딩 벡터 (float 리스트)
    :raises: Exception 임베딩 과정에서 오류 발생 시
    """
    try:
        return model.encode(text).tolist()
    except Exception as e:
        logger.error(f"Error encoding text: {str(e)}")
        raise

def get_company_embedding(info: CompanyInfo) -> List[float]:
    """
    CompanyInfo 객체를 임베딩 벡터로 변환하는 함수
    :param info: 변환할 CompanyInfo 객체
    :return: 임베딩 벡터 (float 리스트)
    """
    text = company_info_to_text(info)
    return get_embedding(text)

def get_embedding_function() -> Callable[[str], List[float]]:
    """
    임베딩 함수를 반환하는 함수
    :return: 텍스트를 임베딩 벡터로 변환하는 함수
    """
    return lambda text: model.encode(text).tolist()