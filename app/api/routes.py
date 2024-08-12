from fastapi import APIRouter, HTTPException, Depends
from utils.database import get_collection
from utils.embedding_utils import get_company_embedding
from services.models import CompanyInput, CompanySearchResult, CompanyInfo, ChatInput, ChatResponse
from services.chatbot import Chatbot
from utils.vector_store import VectorStore
from pydantic import BaseModel
import json

router = APIRouter()
chatbot = Chatbot()
vector_store = VectorStore()

@router.post("/insert_company")
async def insert_company(input: CompanyInput):
    """
    사업 정보를 데이터베이스에 저장하는 엔드포인트
    :param input: 저장할 회사 정보
    :return: 저장 성공 메시지와 생성된 ID
    """
    collection = get_collection()
    embedding = get_company_embedding(input.info)
    # Milvus에 삽입할 데이터 준비
    # 회사 정보를 JSON 문자열로 변환
    company_info = json.dumps({
        "businessName": input.businessName,
        "info": input.info.dict()
    })
    data = [
        [company_info],  # 회사 정보
        [embedding]      # 임베딩 벡터
    ]
    try:
        result = collection.insert(data)
        return {"message": "Company inserted successfully", "id": result.primary_keys[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to insert company: {str(e)}")

@router.post("/search_similar_companies")
async def search_similar_companies(input: CompanyInfo):
    """
    입력된 회사 정보와 유사한 회사들을 검색하는 엔드포인트
    :param input: 검색 기준이 되는 회사 정보
    :return: 유사한 회사들의 목록
    """
    collection = get_collection()
    query_embedding = get_company_embedding(input)
    # Milvus 검색 파라미터 설정
    search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
    # Milvus에서 유사한 회사 검색
    results = collection.search(
        data=[query_embedding],
        anns_field="embedding",
        param=search_params,
        limit=5,
        output_fields=["content"]
    )
    # 검색 결과 처리
    search_results = []
    for hits in results:
        for hit in hits:
            content = json.loads(hit.entity.get('content'))
            search_results.append(
                CompanySearchResult(
                    businessName=content.get('businessName'),
                    info=CompanyInfo(**content.get('info')),
                    similarityScore=1 - hit.distance
                )
            )
    return search_results

@router.post("/chat", response_model=ChatResponse)
async def chat(chat_input: ChatInput):
    """
    챗봇과 대화하는 엔드포인트
    :param chat_input: 사용자의 채팅 입력
    :return: 챗봇의 응답
    """
    try:
        response = chatbot.get_response(chat_input.message)
        return ChatResponse(message=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SimilaritySearchRequest(BaseModel):
    query: str
    k: int = 5

@router.post("/similarity_search")
async def similarity_search(request: SimilaritySearchRequest):
    """
    벡터 저장소에서 유사한 문서를 검색하는 엔드포인트
    :param request: 검색 쿼리와 반환할 결과 수를 포함한 요청 객체
    :return: 유사한 문서 리스트
    """
    try:
        results = vector_store.similarity_search(request.query, request.k)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))