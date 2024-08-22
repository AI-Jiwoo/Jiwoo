from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # 프로젝트 기본 설정
    PROJECT_NAME: str = "Jiwoo-AI-Server"
    DEBUG: bool = True

    # OpenAI API 설정
    OPENAI_API_KEY: str = Field(default="")
    OPENAI_MODEL: str = Field(default="gpt-3.5-turbo")

    # Milvus 벡터 데이터베이스 설정
    MILVUS_HOST: str = Field(default="localhost")
    MILVUS_PORT: str = Field(default="19530")
    COLLECTION_NAME: str = "business_info"

    # 임베딩 모델 설정
    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-base"
    EMBEDDING_DIMENSION: int = 768

    # FastAPI 설정
    API_V1_STR: str = "/api/v1"

    # 로깅 설정
    LOG_LEVEL: str = Field(default="INFO")

    # 서버 설정
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)

    # Serper API 설정 (웹 검색용)
    SERPER_API_KEY: str = Field(default="")
    
    # 챗봇 및 검색 설정
    MAX_QUERIES: int = Field(default=3)  # 생성할 최대 쿼리 수
    SIMILARITY_THRESHOLD: float = Field(default=0.7)  # 유사도 임계값
    MAX_TOKENS: int = Field(default=4096)  # 생성할 최대 토큰 수
    TEMPERATURE: float = Field(default=0.7)  # 생성 모델의 온도 설정
    
    # 그래프 생성 설정
    MAX_GRAPH_DATA_POINTS: int = Field(default=100)  # 그래프에 표시할 최대 데이터 포인트 수
    DEFAULT_GRAPH_WIDTH: int = Field(default=800)  # 기본 그래프 너비
    DEFAULT_GRAPH_HEIGHT: int = Field(default=600)  # 기본 그래프 높이
    GRAPH_DPI: int = Field(default=100)  # 그래프 이미지 DPI

    # 환경 변수 설정
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()