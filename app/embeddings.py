from typing import List
from sentence_transformers import SentenceTransformer
from app.models import CompanyInfo

# 다국어 지원 문장 임베딩 모델 로드
model = SentenceTransformer('intfloat/multilingual-e5-base')

# CompanyInfo 객체를 텍스트 문자열로 변환하는 함수
def company_info_to_text(info: CompanyInfo) -> str:
    # 회사 정보를 공백으로 구분된 문자열로 변환
    return f"{info.business_type} {info.business_scale} {info.founding_date} {info.investment_status} {info.customer_type}"

# 텍스트를 임베딩 벡터로 변환하는 함수
def get_embedding(text: str):
    # 텍스트를 인코딩하고 리스트로 변환
    return model.encode(text).tolist()

# CompanyInfo 객체를 임베딩 벡터로 변환하는 함수
def get_company_embedding(info: CompanyInfo) -> List[float]:
    # CompanyInfo를 텍스트로 변환
    text = company_info_to_text(info)
    # 텍스트를 임베딩 벡터로 변환
    return get_embedding(text)