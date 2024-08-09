# services/models.py

from pydantic import BaseModel, Field
from typing import List

class CompanyInfo(BaseModel):
    """회사 정보를 나타내는 모델"""
    businessPlatform: str = Field(..., description="사업 유형 (예: SaaS, 제조업 등)")
    businessScale: str = Field(..., description="사업 규모 (예: 스타트업, 중소기업, 대기업 등)")
    business_field: str = Field(..., description="사업 분야 (예: IT, 바이오, 금융, 교육 등)")
    businessStartDate: str = Field(..., description="창업일")
    investmentStatus: str = Field(..., description="투자 상태 (예: 시드, 시리즈 A, 시리즈 B 등)")
    customerType: str = Field(..., description="고객 유형 (예: B2B, B2C, B2G 등)")

class CompanyInput(BaseModel):
    """회사 정보 입력을 위한 모델"""
    businessName: str = Field(..., description="회사명")
    info: CompanyInfo = Field(..., description="회사 정보")

class CompanySearchResult(BaseModel):
    """유사 회사 검색 결과를 나타내는 모델"""
    businessName: str = Field(..., description="검색된 회사명")
    info: CompanyInfo = Field(..., description="검색된 회사 정보")
    similarityScore: float = Field(..., description="유사도 점수 (0에서 1 사이의 값, 1에 가까울수록 더 유사)")

class ChatInput(BaseModel):
    """채팅 입력을 위한 모델"""
    message: str = Field(..., description="사용자 메시지")

class ChatResponse(BaseModel):
    """채팅 응답을 위한 모델"""
    message: str = Field(..., description="AI 응답 메시지")

class SimilaritySearchInput(BaseModel):
    """유사도 검색 입력을 위한 모델"""
    query: str = Field(..., description="검색 쿼리")
    k: int = Field(5, description="반환할 결과의 수")

class SimilaritySearchResponse(BaseModel):
    """유사도 검색 응답을 위한 모델"""
    similar_companies: List[CompanySearchResult] = Field(..., description="유사한 회사 목록")

class ContentInfo(BaseModel):
    """텍스트 내용만 포함하는 모델 (벡터 저장소에서 사용)"""
    content: str = Field(..., description="텍스트 내용")