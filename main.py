import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
from app.database import connect_to_milvus
from app.vector_store import VectorStore
from pymilvus import connections
import os
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 오리진 허용. 프로덕션에서는 구체적인 오리진을 지정하는 것이 좋습니다.
    allow_credentials=True,
    allow_methods=["*"],  # 모든 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 전역 변수로 VectorStore 인스턴스 선언
vector_store = None

@app.on_event("startup")
async def startup_event():
    """
    애플리케이션 시작 시 실행되는 이벤트 핸들러
    - Milvus 연결
    - VectorStore 초기화
    - 데이터 파일 로딩
    """
    global vector_store
    try:
        # Milvus 연결
        await connect_milvus()
        # VectorStore 초기화
        vector_store = VectorStore()
        # 데이터 파일 로딩
        await load_data_files()
        logger.info("Startup completed successfully")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise

async def connect_milvus():
    """Milvus 데이터베이스 연결"""
    try:
        connections.connect("default", host="localhost", port="19530")
        connect_to_milvus()
        logger.info("Connected to Milvus database")
    except Exception as e:
        logger.error(f"Failed to connect to Milvus: {str(e)}")
        raise

async def load_data_files():
    """데이터 파일 로딩"""
    data_files = [
        "data/business_info.txt",
        "data/startup_guide.txt",
        "data/side_projects.txt"
    ]
    for file in data_files:
        if os.path.exists(file):
            vector_store.load_documents(file)
            logger.info(f"Loaded data from {file}")
        else:
            logger.warning(f"File not found - {file}")

# API 라우터 포함
app.include_router(routes.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)