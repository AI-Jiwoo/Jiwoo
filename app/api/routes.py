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
    try:
        collection = get_collection()
        embedding = get_company_embedding(input.info)
        company_info = json.dumps({"businessName": input.businessName, "info": input.info.dict()})
        url = str(input.url) if input.url else ""
        data = [[company_info], [url], [embedding]]
        result = collection.insert(data)
        logger.info(f"회사 정보 삽입 성공: {input.businessName}")
        return {
            "message": "회사 정보가 성공적으로 삽입되었습니다",
            "id": result.primary_keys[0],
        }
    except Exception as e:
        logger.error(f"회사 정보 삽입 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"회사 정보 삽입 실패: {str(e)}")

@router.post("/search_similar_companies", response_model=List[CompanySearchResult])
async def search_similar_companies(input: CompanyInfo):
    """
    입력된 회사 정보와 유사한 회사들을 검색하는 엔드포인트
    :param input: 검색 기준이 되는 회사 정보
    :return: 유사한 회사들의 목록
    """
    try:
        collection = get_collection()
        query_embedding = get_company_embedding(input)
        search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
        results = collection.search(
            data=[query_embedding],
            anns_field="embedding",
            param=search_params,
            limit=5,
            output_fields=["content"],
        )

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
                    logger.error(f"JSON 디코드 오류: {e}")
        logger.info(f"{len(search_results)}개의 유사한 회사를 찾았습니다")
        return search_results
    except Exception as e:
        logger.error(f"유사 회사 검색 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat", response_model=ChatResponse)
async def chat(chat_input: ChatInput):
    """
    챗봇과 대화하는 엔드포인트
    :param chat_input: 사용자의 채팅 입력
    :return: 챗봇의 응답
    """
    try:
        response = chatbot.get_response(chat_input.message)
        logger.info("챗봇 응답이 성공적으로 생성되었습니다")
        return ChatResponse(message=response)
    except Exception as e:
        logger.error(f"챗봇 응답 생성 중 오류 발생: {str(e)}")
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
        logger.info(f"유사도 검색 완료. {len(results)}개의 결과를 찾았습니다")
        return [ContentInfo(content=result['content']) for result in results]
    except Exception as e:
        logger.error(f"유사도 검색 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/viability_search", response_model=List[ContentInfo])
async def business_viability_assessment_search(input: SupportProgramInfoSearchRequest):
    """
    입력된 지원 목록 중 회사의 지원 가능성을 평가하여 결과를 반환
    :param input: 검색 기준이 되는 회사 정보
    :return: 유사한 회사들의 목록
    """
    try:
        collection = get_collection()
        query_embedding = get_support_program_embedding(input.query)
        search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
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
                    search_results.append({"content": json.loads(hit.entity.get("content")), "metadata": {}})

        logger.info(f"사업 가능성 검색 완료. {len(search_results)}개의 결과를 찾았습니다")
        return [ContentInfo(**result) for result in search_results]
    except Exception as e:
        logger.error(f"사업 가능성 검색 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))