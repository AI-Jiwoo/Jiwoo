from pydantic import BaseModel
from typing import List

# 회사 정보를 나타내는 모델
class CompanyInfo(BaseModel):
    business_type: str       # 사업 유형 (예: SaaS, 제조업 등)
    business_scale: str      # 사업 규모 (예: 스타트업, 중소기업, 대기업 등)
    business_field: str      # 사업 분야 (예: IT, 바이오, 금융, 교육 등)
    founding_date: str       # 창업일
    investment_status: str   # 투자 상태 (예: 시드, 시리즈 A, 시리즈 B 등)
    customer_type: str       # 고객 유형 (예: B2B, B2C, B2G 등)

# 회사 정보 입력을 위한 모델
class CompanyInput(BaseModel):
    company_name: str        # 회사명
    info: CompanyInfo        # 회사 정보 (CompanyInfo 모델 사용)

# 유사 회사 검색 결과를 나타내는 모델
class CompanySearchResult(BaseModel):
    company_name: str        # 검색된 회사명
    info: CompanyInfo        # 검색된 회사 정보
    similarity_score: float  # 유사도 점수 (0에서 1 사이의 값, 1에 가까울수록 더 유사)