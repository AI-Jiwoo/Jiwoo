from typing import Any, List, Optional, Dict
from pydantic import BaseModel, Field, HttpUrl, validator

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
    url: Optional[HttpUrl] = Field(None, description="회사 웹사이트 URL")

class CompanySearchResult(BaseModel):
    """유사 회사 검색 결과를 나타내는 모델"""
    businessName: str = Field(..., description="검색된 회사명")
    info: CompanyInfo = Field(..., description="검색된 회사 정보")
    similarityScore: float = Field(..., description="유사도 점수 (0에서 1 사이의 값, 1에 가까울수록 더 유사)")
    image_url: Optional[HttpUrl] = Field(None, description="회사 관련 이미지 URL")

class ChatInput(BaseModel):
    """채팅 입력을 위한 모델"""
    message: str = Field(..., description="사용자 메시지")

class WebSearchResult(BaseModel):
    """웹 검색 결과를 나타내는 모델"""
    title: str = Field(..., description="검색 결과 제목")
    snippet: str = Field(..., description="검색 결과 요약")
    url: HttpUrl = Field(..., description="검색 결과 URL")
    image_url: Optional[HttpUrl] = Field(None, description="검색 결과와 관련된 이미지 URL")

    @validator('url', 'image_url', pre=True)
    def ensure_url(cls, v):
        if not v:
            return None
        return v

class ChatResponse(BaseModel):
    text_response: str = Field(..., description="AI 응답 메시지")
    web_results: Optional[List[WebSearchResult]] = Field(None, description="웹 검색 결과 목록")
    graph_data: Optional[Dict[str, Any]] = Field(None, description="그래프 데이터 (Plotly 형식)")
    multimodal_result: Optional[Any] = Field(None, description="멀티모달 모델의 결과")
    image_url: Optional[str] = Field(None, description="응답과 관련된 이미지 URL")

class SupportProgramInfo(BaseModel):
    """지원 프로그램 정보를 나타내는 모델"""
    name: str = Field(..., description="지원 사업명")
    target: str = Field(..., description="지원 대상")
    scare_of_support: str = Field(..., description="지원 규모")
    support_content: str = Field(..., description="지원 내용")
    support_characteristics: str = Field(..., description="지원 특징")
    support_info: str = Field(..., description="사업 소개 정보")
    support_year: int = Field(..., description="사업 년도")

class SupportProgramInfoSearchRequest(BaseModel):
    query: SupportProgramInfo
    threshold: float = Field(0.7, description="유사도 임계값")
    k: int = Field(5, description="반환할 결과의 수")