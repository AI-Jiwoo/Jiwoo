import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import routes
from utils.database import connect_to_milvus, close_milvus_connection
from utils.vector_store import VectorStore
from config.settings import settings
from dotenv import load_dotenv
import logging
import os

# .env 파일에서 환경 변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 전역 변수로 VectorStore 인스턴스 선언
vector_store = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    애플리케이션 생명주기 관리
    시작 시 Milvus 연결 및 VectorStore 초기화
    종료 시 Milvus 연결 해제
    """
    global vector_store
    try:
        # Milvus 연결 및 VectorStore 초기화
        connect_to_milvus()
        vector_store = VectorStore()
        logger.info("Startup completed successfully")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise
    yield
    # 종료 시 Milvus 연결 해제
    close_milvus_connection()
    logger.info("Shutting down")

# FastAPI 애플리케이션 인스턴스 생성
app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 오리진 허용 (프로덕션에서는 구체적인 오리진 지정 필요)
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 HTTP 헤더 허용
)

# API 라우터 포함
app.include_router(routes.router)

if __name__ == "__main__":
    # 개발 서버 실행
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)