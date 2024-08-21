import json
import logging
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.chatbot import Chatbot
from services.models import (
    ChatInput, 
    ChatResponse, 
    CompanyInfo, 
    CompanyInput, 
    CompanySearchResult, 
    SupportProgramInfo,
    SimilaritySearchRequest,
    SimilaritySearchResponse,
    SupportProgramInfoSearchRequest,
    ContentInfo
)
from utils.database import get_collection
from utils.embedding_utils import get_company_embedding, get_support_program_embedding
from utils.vector_store import VectorStore

logger = logging.getLogger(__name__)

router = APIRouter()
chatbot = Chatbot()
vector_store = VectorStore()

@router.post("/insert_company", response_model=dict)
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
    company_info = json.dumps({"businessName": input.businessName, "info": input.info.dict()})
    url = str(input.url) if input.url else ""  # URL이 제공되지 않으면 빈 문자열 사용
    data = [[company_info], [url], [embedding]]  # 회사 정보, URL, 임베딩 벡터
    try:
        result = collection.insert(data)
        logger.info(f"Company inserted successfully: {input.businessName}")
        return {
            "message": "Company inserted successfully",
            "id": result.primary_keys[0],
        }
    except Exception as e:
        logger.error(f"Failed to insert company: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to insert company: {str(e)}")

@router.post("/search_similar_companies", response_model=List[CompanySearchResult])
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
        output_fields=["content"],
    )

    # 검색 결과 처리
    search_results = []
    for hits in results:
        for hit in hits:
            try:
                content = json.loads(hit.entity.get("content"))
                search_results.append(
                    CompanySearchResult(
                        businessName=content.get("businessName"),
                        info=CompanyInfo(**content.get("info")),
                        similarityScore=1 - hit.distance,
                    )
                )
            except json.JSONDecodeError as e:
                logger.error(f"JSON Decode Error: {e}")
    logger.info(f"Found {len(search_results)} similar companies")
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
        logger.info("Chat response generated successfully")
        return ChatResponse(message=response)
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/similarity_search", response_model=List[ContentInfo])
async def similarity_search(request: SimilaritySearchRequest):
    """
    벡터 저장소에서 유사한 문서를 검색하는 엔드포인트
    :param request: 검색 쿼리와 반환할 결과 수를 포함한 요청 객체
    :return: 유사한 문서 리스트
    """
    try:
        results = vector_store.similarity_search(request.query, request.k)
        logger.info(f"Similarity search completed. Found {len(results)} results")
        return [ContentInfo(content=result['content']) for result in results]
    except Exception as e:
        logger.error(f"Error in similarity search: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/viability_search", response_model=List[ContentInfo])
async def business_viability_assessment_search(input: SupportProgramInfoSearchRequest):
    """
    입력된 지원 목록 중 회사의 지원 가능성을 평가하여 결과를 반환
    :param input: 검색 기준이 되는 회사 정보
    :return: 유사한 회사들의 목록
    """
    collection = get_collection()
    query_embedding = get_support_program_embedding(input.query)
    # Milvus 검색 파라미터 설정
    search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
    # Milvus에서 유사한 회사 검색
    results = collection.search(
        data=[query_embedding],
        anns_field="embedding",
        param=search_params,
        limit=input.k,
        output_fields=["content"],
    )

    # 검색 결과 처리
    search_results = []
    for hits in results:
        for hit in hits:
            distance = hit.distance
            similarity = 1 - (distance / max(results[0][0].distance, 1))  # 거리 기반 유사도 계산
            if similarity >= input.threshold:
                content = hit.entity.get("content")
                logger.debug(f"Content: {content}")  # 디버그 로그 추가
                try:
                    parsed_content = json.loads(content) if isinstance(content, str) else content
                except json.JSONDecodeError as e:
                    logger.error(f"JSON Decode Error: {e}")  # JSON 디코드 오류 로그
                    parsed_content = content  # 파싱 실패 시 원본 사용
                search_results.append(ContentInfo(content=str(parsed_content)))

    logger.info(f"Viability search completed. Found {len(search_results)} results")
    return search_results