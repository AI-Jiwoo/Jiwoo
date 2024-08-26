from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # 프로젝트 기본 설정
    PROJECT_NAME: str = "Jiwoo-AI-Server"
    DEBUG: bool = True

    # OpenAI API 설정
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-3.5-turbo", env="OPENAI_MODEL")

    # Milvus 벡터 데이터베이스 설정
    MILVUS_HOST: str = Field(default="localhost", env="MILVUS_HOST")
    MILVUS_PORT: str = Field(default="19530", env="MILVUS_PORT")
    COLLECTION_NAME: str = "business_info"

    # 임베딩 모델 설정
    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-base"
    EMBEDDING_DIMENSION: int = 768

    # FastAPI 설정
    API_V1_STR: str = "/api/v1"

    # 로깅 설정
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")

    # 서버 설정
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")

    # Serper API 설정 (웹 검색용)
    SERPER_API_KEY: str = Field(default="", env="SERPER_API_KEY")

    # 챗봇 및 검색 설정
    MAX_QUERIES: int = Field(default=3, env="MAX_QUERIES")
    SIMILARITY_THRESHOLD: float = Field(default=0.8, env="SIMILARITY_THRESHOLD")
    MAX_TOKENS: int = Field(default=4096, env="MAX_TOKENS")
    TEMPERATURE: float = Field(default=0.7, env="TEMPERATURE")

    # 그래프 생성 설정
    MAX_GRAPH_DATA_POINTS: int = Field(default=100, env="MAX_GRAPH_DATA_POINTS")
    DEFAULT_GRAPH_WIDTH: int = Field(default=800, env="DEFAULT_GRAPH_WIDTH")
    DEFAULT_GRAPH_HEIGHT: int = Field(default=600, env="DEFAULT_GRAPH_HEIGHT")
    GRAPH_DPI: int = Field(default=100, env="GRAPH_DPI")

    # 환경 변수 설정
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()