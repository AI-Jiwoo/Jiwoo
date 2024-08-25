import json
import logging
from typing import List
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.chatbot import Chatbot
from services.models import (
    ChatInput, 
    ChatResponse, 
    CompanyInfo, 
    CompanyInput, 
    CompanySearchResult, 
    SupportProgramInfoSearchRequest,
    WebSearchResult
)
from utils.database import get_collection
from utils.embedding_utils import get_company_embedding, get_support_program_embedding

logger = logging.getLogger(__name__)

router = APIRouter()
chatbot = Chatbot()

@router.post("/insert_company", response_model=dict)
async def insert_company(input: CompanyInput):
    """회사 정보를 데이터베이스에 저장하는 엔드포인트"""
    try:
        collection = get_collection()
        embedding = get_company_embedding(input.info)
        company_info = json.dumps({"businessName": input.businessName, "info": input.info.dict()})
        url = str(input.url) if input.url else ""
        created_at = int(datetime.now().timestamp())
        data = [[company_info], [url], [embedding], [created_at]]
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
    """입력된 회사 정보와 유사한 회사들을 검색하는 엔드포인트"""
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
async def chat(request: ChatInput):
    try:
        response = await chatbot.get_response(request.message)
        
        logger.info(f"Raw chatbot response: {response}")
        
        # WebSearchResult 객체 리스트로 변환
        web_results = []
        for result in response.get("relevant_info", []):
            try:
                web_result = WebSearchResult(
                    title=result.get('title') or "제목 없음",
                    snippet=result.get('snippet') or "",
                    url=result.get('url') or "https://example.com",
                    image_url=result.get('image_url') or None
                )
                web_results.append(web_result)
            except ValueError as ve:
                logger.error(f"WebSearchResult 생성 중 오류: {ve}")

        # graph_data 타입 확인 및 처리
        graph_data = response.get("graph_data")
        if not isinstance(graph_data, dict):
            logger.warning(f"Unexpected graph_data type: {type(graph_data)}. Setting to None.")
            graph_data = None

        chat_response = ChatResponse(
            text_response=response.get("text_response", "응답을 생성하는 데 문제가 발생했습니다."),
            web_results=web_results,
            graph_data=graph_data,
            multimodal_result=response.get("multimodal_result"),
            image_url=response.get("image_url")
        )

        logger.info(f"챗봇 응답이 성공적으로 생성되었습니다. 응답: {chat_response}")
        return chat_response

    except Exception as e:
        logger.error(f"챗봇 응답 생성 중 오류 발생: {str(e)}", exc_info=True)
        return ChatResponse(
            text_response="내부 서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.",
            web_results=[],
            graph_data=None,
            multimodal_result=None,
            image_url=None
        )


@router.post("/viability_search", response_model=List[dict])
async def business_viability_assessment_search(input: SupportProgramInfoSearchRequest):
    """입력된 지원 프로그램 정보를 바탕으로 유사한 회사들을 검색하는 엔드포인트"""
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

        logger.info(f"Raw search results: {results}")

        search_results = []
        for hits in results:
            for hit in hits:
                try:
                    content_str = hit.entity.get("content")
                    
                    # JSON 파싱 시도
                    try:
                        content = json.loads(content_str)
                    except json.JSONDecodeError:
                        # JSON 파싱 실패 시 텍스트를 그대로 사용
                        content = {"businessName": "Unknown", "info": {"description": content_str}}

                    # 'businessName'과 'info'가 없는 경우 처리
                    if 'businessName' not in content:
                        content['businessName'] = 'Unknown'
                    if 'info' not in content:
                        content['info'] = {'description': str(content)}

                    # 유사도 계산: 0에 가까울수록 유사, 1에 가까울수록 상이
                    similarity = 1 - (hit.distance / (max(hit.distance, 1) * 2))
                    logger.info(f"Calculated similarity: {similarity}")
                    if similarity >= input.threshold:
                        search_results.append({
                            "content": {
                                "businessName": content.get("businessName"),
                                "info": content.get("info")
                            },
                            "metadata": {}
                        })
                except Exception as e:
                    logger.error(f"처리 중 오류 발생: {str(e)}, 원본 데이터: {hit.entity}")

        logger.info(f"Processed search results: {search_results}")
        return search_results
    except Exception as e:
        logger.error(f"사업 가능성 검색 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))