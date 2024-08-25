import asyncio
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from config.settings import settings
from utils.vector_store import VectorStore
from utils.web_search import WebSearch
from utils.intent_analyzer import IntentAnalyzer
from utils.graph_generator import GraphGenerator
from utils.query_generator import QueryGenerator
import logging
import json
import re
from collections import deque

# 로거 설정
logger = logging.getLogger(__name__)

class Chatbot:
    def __init__(self):
        """
        Chatbot 클래스의 초기화 메서드.
        필요한 모든 유틸리티 객체와 설정을 초기화합니다.
        """
        self.llm = ChatOpenAI(temperature=settings.TEMPERATURE, api_key=settings.OPENAI_API_KEY)
        self.memory = ConversationBufferMemory()
        self.conversation = ConversationChain(llm=self.llm, memory=self.memory, verbose=True)
        self.vector_store = VectorStore()
        self.web_search = WebSearch()
        self.intent_analyzer = IntentAnalyzer()
        self.query_generator = QueryGenerator()
        self.graph_generator = GraphGenerator()
        self.short_term_memory = deque(maxlen=20)  # 최근 20개의 대화 기록 유지
        
    async def get_response(self, user_input: str) -> Dict[str, Any]:
        """
        사용자의 입력을 받아 적절한 응답을 생성합니다.
        
        :param user_input: 사용자 입력 문자열
        :return: 응답 데이터를 포함한 딕셔너리
        """
        try:
            intent = self.intent_analyzer.analyze_intent(user_input)
            logger.info(f"분석된 의도: {intent}")

            self._save_to_short_term_memory(user_input)
            
            if self._is_graph_request(intent, user_input):
                return await self._handle_graph_request(user_input)
            else:
                return await self._handle_text_request(user_input, intent)

        except Exception as e:
            logger.error(f"응답 생성 중 오류 발생: {str(e)}", exc_info=True)
            return {
                "text_response": "요청을 처리하는 동안 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
                "error": str(e)
            }

    async def _handle_graph_request(self, user_input: str) -> Dict[str, Any]:
        """
        그래프 요청을 처리합니다.
        
        :param user_input: 사용자 입력 문자열
        :return: 그래프 데이터와 설명을 포함한 딕셔너리
        """
        queries = self.query_generator.generate_queries(user_input, {'intent': 'data_visualization'})
        
        vector_results = self.vector_store.search_with_similarity_threshold(queries[0], k=5, threshold=settings.SIMILARITY_THRESHOLD)
        
        if vector_results:
            search_results = self._process_vector_results(vector_results)
        else:
            search_results = await self.web_search.search(queries)

        logger.info(f"검색 결과 형식: {type(search_results)}, 내용: {search_results}")

        # 검색 결과 유효성 검사 및 처리
        if not isinstance(search_results, dict) or 'organic' not in search_results:
            return {"text_response": "잘못된 검색 결과 형식입니다.", "graph_data": None}

        organic_results = search_results['organic']
        if not isinstance(organic_results, list):
            return {"text_response": "그래프 데이터를 구성하는 항목이 올바르지 않습니다.", "graph_data": None}

        # 검색 결과를 그래프 데이터로 변환
        processed_results = [
            {"name": result['title'], "value": len(result['snippet'])}
            for result in organic_results
            if isinstance(result, dict) and 'title' in result and 'snippet' in result
        ]

        if not processed_results:
            return {"text_response": "유효한 그래프 데이터가 없습니다.", "graph_data": None}

        # 그래프 생성
        graph_data = self.graph_generator.generate_graph(data=processed_results)

        if not graph_data:
            return {"text_response": "그래프를 생성할 수 없습니다.", "graph_data": None}

        response = {
            "text_response": "요청하신 정보에 대한 그래프 정보입니다.",
            "graph_data": json.loads(graph_data.to_json()) if graph_data else None
        }
        
        self._save_to_short_term_memory(user_input, response["text_response"])
        if self._should_save_response(response["text_response"]):
            self._save_to_vector_store(user_input, response["text_response"])

        return response

    async def _handle_text_request(self, user_input: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """
        텍스트 요청을 처리합니다.
        
        :param user_input: 사용자 입력 문자열
        :param intent: 분석된 사용자 의도
        :return: 텍스트 응답과 관련 정보를 포함한 딕셔너리
        """
        queries = self.query_generator.generate_queries(user_input, intent)
        logger.info(f"생성된 쿼리: {queries}")
        
        # 과거 대화에 대한 질문인지 확인
        is_historical_query = self._check_historical_query(user_input)
        
        if is_historical_query:
            logger.info("과거 대화에 대한 질문 감지")
            relevant_info = self._get_conversation_history()
        else:
            # 유사도 기준을 적용한 벡터 검색 수행
            vector_results = self.vector_store.search_with_similarity_threshold(
                queries[0], 
                k=5, 
                threshold=0.8
            )
        
            if vector_results:
                logger.info("벡터 검색 결과를 찾았습니다.")
                relevant_info = self._process_vector_results(vector_results)
            else:
                logger.info("벡터 검색 결과가 없습니다. 웹 검색을 수행합니다.")
                try:
                    search_results = await self.web_search.search(queries)
                    relevant_info = self._process_web_results(search_results)
                except Exception as e:
                    logger.error(f"웹 검색 중 오류 발생: {str(e)}")
                    relevant_info = []
        
        context = self._prepare_context(relevant_info)
        prompt = self._create_prompt(user_input, context)
        response = self.conversation.predict(input=prompt)
    
        self.memory.save_context({"input": user_input}, {"output": response})
        self._save_to_short_term_memory(user_input, response)
        if self._should_save_response(response):
            self._save_to_vector_store(user_input, response)
    
        # 벡터 검색 결과가 있는 경우 relevant_info를 포함하지 않음
        if vector_results:
            return {
                "text_response": response,
                "graph_data": None
            }
        else:
            return {
                "text_response": response,
                "relevant_info": relevant_info,
                "graph_data": None
            }
        
    def _check_historical_query(self, user_input: str) -> bool:
        """
        사용자 입력이 과거 대화에 대한 질문인지 확인합니다.
        
        :param user_input: 사용자 입력 문자열
        :return: 과거 대화 질문 여부
        """
        historical_keywords = ["지금까지", "이전에", "과거에", "어떤 질문", "뭘 물어봤어", "대화 기록"]
        return any(keyword in user_input for keyword in historical_keywords)
    
    def _get_conversation_history(self) -> List[Dict[str, str]]:
        """
        대화 기록을 가져옵니다.
        
        :return: 대화 기록 리스트
        """
        return [
            {
                "title": f"대화 {i+1}",
                "snippet": f"사용자: {item['user_input']}\nAI: {item['response']}",
                "url": "",
                "date": "",
                "image_url": ""
            }
            for i, item in enumerate(self.short_term_memory)
        ]

    def _is_graph_request(self, intent: Dict[str, Any], user_input: str) -> bool:
        """
        사용자의 입력이 그래프 요청인지 확인합니다.
        
        :param intent: 분석된 사용자 의도
        :param user_input: 사용자 입력 문자열
        :return: 그래프 요청 여부
        """
        graph_keywords = ['그래프', '차트', '추이', '통계', '시각화']
        return intent.get('intent') == 'data_visualization' or any(keyword in user_input for keyword in graph_keywords)

    def _process_vector_results(self, vector_results: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        VectorDB 검색 결과를 처리합니다.
        
        :param vector_results: VectorDB 검색 결과 리스트
        :return: 처리된 검색 결과 리스트
        """
        processed_results = []
        for result in vector_results:
            created_at = result.get("created_at")
            date_str = (
                created_at.strftime("%Y-%m-%d") if isinstance(created_at, datetime)
                else datetime.fromtimestamp(created_at).strftime("%Y-%m-%d") if isinstance(created_at, (int, float))
                else "Unknown Date"
            )

            processed_results.append({
                "title": result.get("content", "").split('\n')[0],  # 첫 줄을 제목으로 사용
                "url": result.get("url", ""),
                "snippet": result.get("content", ""),
                "date": date_str,
                "image_url": ""  # VectorStore에는 이미지 URL이 저장되어 있지 않음
            })
        return processed_results

    def _process_web_results(self, search_results: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        웹 검색 결과를 처리하여 필요한 정보를 추출합니다.
        
        :param search_results: 웹 검색 결과 딕셔너리
        :return: 처리된 웹 검색 결과 리스트
        """
        return [
            {
                "title": item.get("title", ""),
                "url": item.get("link", ""),
                "snippet": item.get("snippet", ""),
                "date": item.get("date", ""),
                "image_url": item.get("imageUrl", "")
            }
            for item in search_results.get("organic", [])
        ]

    def _prepare_context(self, relevant_info: List[Dict[str, str]]) -> str:
        """
        검색 결과와 단기 기억을 기반으로 문맥을 준비합니다.

        :param relevant_info: 관련 정보 리스트
        :return: 준비된 문맥 문자열
        """
        context_parts = []
        for info in relevant_info:
            part = f"[제목: {info['title']}]\n{info['snippet']}"
            if info['url']:
                part += f"\n[출처: {info['url']}]"
            if info['date']:
                part += f"\n[날짜: {info['date']}]"
            if info['image_url']:
                part += f"\n[이미지: {info['image_url']}]"
            context_parts.append(part)
        
        return "\n\n".join(context_parts) if context_parts else "관련된 구체적인 정보를 찾지 못했습니다."

    def _create_prompt(self, user_input: str, context: str) -> str:
        """
        사용자 입력과 문맥을 바탕으로 프롬프트를 생성합니다.
        
        :param user_input: 사용자 입력 문자열
        :param context: 준비된 문맥 문자열
        :return: 생성된 프롬프트 문자열
        """
        return f"""다음은 사용자의 요청사항에 관련된 정보입니다. 이 정보를 바탕으로 다음과 같이 응답해주세요:

        1. 관련 정보를 간결한 bullet point 리스트로 정리해주고 간단한 설명을 해주세요.
        2. 각 bullet point에는 구체적인 예시, 수치, 날짜 등을 포함해주세요.
        3. 정보가 부족하거나 없는 경우, 그 사실을 언급해주세요.
        4. 관련 이미지 URL이 있다면 별도의 bullet point로 언급해주세요.
        5. 마지막으로, 사용자가 답변에 대해 궁금해 할만한 사항이나 더 자세히 알고 싶어할 내용에 대하여 1-2개의 추천 질문을 작성해주세요.
        6. 만약 사용자가 이전 대화 내용 중 특정 항목에 대해 질문한다면, 해당 항목에 대해 더 자세히 설명해주세요.

        참고 정보:
        {context}

        사용자: {user_input}
        AI 조수:"""

    def _save_to_short_term_memory(self, user_input: str, response: Optional[str] = None):
        """
        단기 기억에 텍스트와 응답을 저장합니다.
        
        :param user_input: 사용자 입력 문자열
        :param response: AI 응답 문자열 
        """
        if response is None:
            self.short_term_memory.append({"user_input": user_input, "response": ""})
    
    def _should_save_response(self, response: str) -> bool:
        """
        응답을 저장해야 하는지 결정합니다.
        
        :param response: AI 응답 문자열
        :return: 저장 여부
        """
        # 저장하지 않을 키워드 목록
        skip_keywords = ["죄송합니다", "찾지 못했습니다", "정보가 없습니다"]
        return not any(keyword in response for keyword in skip_keywords)

    def _save_to_vector_store(self, user_input: str, response: str):
        """
        대화 내용을 벡터 저장소에 저장합니다.
        
        :param user_input: 사용자 입력 문자열
        :param response: AI 응답 문자열
        """
        if not self._should_save_response(response):
            logger.info("응답이 저장 조건을 충족하지 않아 벡터 저장소에 저장하지 않습니다.")
            return

        conversation_text = f"User: {user_input}\nAI: {response}"
        try:
            # 대화 내용을 벡터 저장소에 추가
            self.vector_store.add_texts([conversation_text], urls=[""])
            logger.info("대화 내용이 벡터 저장소에 성공적으로 저장되었습니다.")
        except Exception as e:
            logger.error(f"벡터 저장소에 대화 내용을 저장하는 중 오류 발생: {str(e)}")

    def clear_conversation_history(self):
        """
        대화 기록과 단기 기억을 초기화합니다.
        """
        self.memory.clear()
        self.short_term_memory.clear()
        logger.info("대화 기록과 단기 기억이 초기화되었습니다.")

    def add_company_info(self, company_name: str, info: Dict[str, Any]):
        """
        회사 정보를 벡터 저장소에 추가합니다.
        
        :param company_name: 회사 이름
        :param info: 회사 정보 딕셔너리
        """
        self.vector_store.add_company_info(company_name, info)
        logger.info(f"회사 정보가 벡터 저장소에 추가되었습니다: {company_name}")

    def add_support_program_info(self, program: Dict[str, Any]):
        """
        지원 프로그램 정보를 벡터 저장소에 추가합니다.
        
        :param program: 지원 프로그램 정보 딕셔너리
        """
        self.vector_store.add_support_program_info(program)
        logger.info(f"지원 프로그램 정보가 벡터 저장소에 추가되었습니다: {program.get('name', 'Unknown')}")