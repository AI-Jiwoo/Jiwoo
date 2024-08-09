import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import routes
from utils.database import connect_to_milvus, close_milvus_connection
from utils.vector_store import VectorStore
import logging
from config.settings import settings

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 전역 변수로 VectorStore 인스턴스 선언
vector_store = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 시작 시 실행될 코드
    global vector_store
    try:
        # Milvus 연결
        connect_to_milvus(host=settings.MILVUS_HOST, port=settings.MILVUS_PORT)
        vector_store = VectorStore()
        logger.info("Startup completed successfully")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise
    yield
    # 종료 시 실행될 코드
    close_milvus_connection()
    logger.info("Shutting down")

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 오리진 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

app.include_router(routes.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)