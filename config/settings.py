from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # 프로젝트 기본 설정
    PROJECT_NAME: str = "Jiwoo-AI-Server"
    DEBUG: bool = True

    # OpenAI API 설정
    OPENAI_API_KEY: str = Field(default="")

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

    # SerpAPI 설정 (웹 검색용)
    SERPAPI_KEY: str = Field(default="")

    # 환경 변수 설정
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
