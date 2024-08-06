from fastapi import APIRouter, HTTPException
from app.database import get_collection
from app.embeddings import get_company_embedding
from app.models import CompanyInput, CompanySearchResult, CompanyInfo, ChatInput, ChatResponse
from app.chatbot import Chatbot

router = APIRouter()
chatbot = Chatbot()

@router.post("/insert_company")
async def insert_company(input: CompanyInput):
    """
    사업 정보를 데이터베이스에 저장하는 엔드포인트
    
    :param input: 저장할 회사 정보
    :return: 저장 성공 메시지와 생성된 ID
    """
    collection = get_collection("company_collection")
    embedding = get_company_embedding(input.info)
    
    # Milvus에 삽입할 데이터 준비
    data = [
        [input.businessName],
        [input.info.dict()],
        [embedding]
    ]
    
    result = collection.insert(data)
    return {"message": "Company inserted successfully", "id": result.primary_keys[0]}

@router.post("/search_similar_companies")
async def search_similar_companies(input: CompanyInfo):
    """
    입력된 회사 정보와 유사한 회사들을 검색하는 엔드포인트
    
    :param input: 검색 기준이 되는 회사 정보
    :return: 유사한 회사들의 목록
    """
    collection = get_collection("company_collection")
    query_embedding = get_company_embedding(input)
    
    # Milvus 검색 파라미터 설정
    search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
    
    # Milvus에서 유사한 회사 검색
    results = collection.search(
        [query_embedding], 
        "embedding", 
        search_params, 
        limit=5, 
        output_fields=["businessName", "info"]
    )
    
    # 검색 결과 처리
    search_results = [
        CompanySearchResult(
            businessName=hit.entity.get('businessName'),
            info=CompanyInfo(**hit.entity.get('info')),
            similarityScore=1 - hit.distance
        )
        for hits in results
        for hit in hits
    ]
    
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