import asyncio
from typing import Dict, Any, List, Optional
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
from collections import deque
from datetime import datetime, timedelta

# 로거 설정
logger = logging.getLogger(__name__)

class Chatbot:
    def __init__(self):
        """
        Chatbot 클래스의 초기화 메서드.
        여기서 필요한 모든 유틸리티 객체를 생성합니다.
        """
        # OpenAI를 기반으로 하는 언어 모델 초기화
        self.llm = ChatOpenAI(temperature=settings.TEMPERATURE, api_key=settings.OPENAI_API_KEY)
        # 대화 내용을 저장하는 메모리 객체
        self.memory = ConversationBufferMemory()
        # 대화 체인을 구성하는 객체
        self.conversation = ConversationChain(llm=self.llm, memory=self.memory, verbose=True)
        # 유사도 검색을 위한 벡터 스토어
        self.vector_store = VectorStore()
        # 웹 검색 유틸리티
        self.web_search = WebSearch()
        # 사용자 의도를 분석하는 유틸리티
        self.intent_analyzer = IntentAnalyzer()
        # 질의 생성기
        self.query_generator = QueryGenerator()
        # 그래프 생성기
        self.graph_generator = GraphGenerator()
        # 단기 기억용 덱 (deque) 자료구조
        self.short_term_memory = deque(maxlen=5)  # 최근 5개의 대화만 저장
        
    async def get_response(self, user_input: str) -> Dict[str, Any]:
        """
        사용자의 입력을 받아 적절한 응답을 생성합니다.
        :param user_input: 사용자 입력
        :return: 생성된 응답과 관련 정보
        """
        try:
            # 사용자 입력에 대해 의도 분석 수행
            intent = self.intent_analyzer.analyze_intent(user_input)
            logger.info(f"분석된 의도: {intent}")

            # 단기 기억에 사용자 입력 저장
            self._save_to_short_term_memory(user_input)
            
            # 그래프 요청인지 확인
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
        :param user_input: 사용자 입력
        :return: 그래프 데이터 및 설명
        """
        # 사용자 요청에 기반한 질의 생성
        queries = self.query_generator.generate_queries(user_input, {'intent': 'data_visualization'})
        # 웹 검색 수행
        search_results = await self.web_search.search(queries)

        # 검색 결과의 형식 로그
        logger.info(f"검색 결과 형식: {type(search_results)}, 내용: {search_results}")

        # 검색 결과의 형식 검토
        if not isinstance(search_results, dict) or 'organic' not in search_results:
            return {
                "text_response": "잘못된 검색 결과 형식입니다.",
                "graph_data": None
            }

        # 검색 결과의 'organic' 항목 확인
        organic_results = search_results['organic']
        if not isinstance(organic_results, list):
            return {
                "text_response": "그래프 데이터를 구성하는 항목이 올바르지 않습니다.",
                "graph_data": None
            }

        # 기업 데이터 추출 (예: 제목과 링크만 추출)
        processed_results = []
        for result in organic_results:
            if isinstance(result, dict) and 'title' in result and 'snippet' in result:
                processed_results.append({
                    "name": result['title'],
                    "value": len(result['snippet'])  # 스니펫의 길이를 값으로 사용
                })

        if not processed_results:
            return {
                "text_response": "유효한 기업 데이터가 없습니다.",
                "graph_data": None
            }

        # 그래프 데이터 생성
        graph_data = self.graph_generator.generate_graph(data=processed_results)

        if not graph_data:
            return {
                "text_response": "그래프를 생성할 수 없습니다.",
                "graph_data": None
            }

        explanation = "요청하신 정보에 대한 그래프 정보입니다."

        return {
            "text_response": explanation,
            "graph_data": json.loads(graph_data.to_json()) if graph_data else None
        }

    async def _handle_text_request(self, user_input: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """
        텍스트 요청을 처리합니다.
        :param user_input: 사용자 입력
        :param intent: 분석된 의도
        :return: 텍스트 응답 및 관련 정보
        """
        # 사용자 입력과 의도에 기반한 질의 생성
        queries = self.query_generator.generate_queries(user_input, intent)
        # 웹 검색 수행
        search_results = await self.web_search.search(queries)
        # 검색 결과 처리
        relevant_info = self._process_web_results(search_results)

        # 응답에 사용할 문맥 생성
        context = self._prepare_context(relevant_info)
        # 생성된 문맥과 사용자 입력, 단기 기억을 바탕으로 프롬프트 생성
        prompt = self._create_prompt(user_input, context)
        # 대화 예측 수행
        response = self.conversation.predict(input=prompt)

        # 대화 메모리에 입력과 출력 저장
        self.memory.save_context({"input": user_input}, {"output": response})

        # 단기 기억에 AI의 응답 저장
        self._save_to_short_term_memory(response)

        return {
            "text_response": response,
            "relevant_info": relevant_info,
            "graph_data": None
        }

    def _is_graph_request(self, intent: Dict[str, Any], user_input: str) -> bool:
        """
        사용자의 입력이 그래프 요청인지 확인합니다.
        :param intent: 분석된 의도
        :param user_input: 사용자 입력
        :return: 그래프 요청 여부
        """
        # 그래프 관련 키워드 정의
        graph_keywords = ['그래프', '차트', '추이', '통계', '시각화']
        # 의도 분석 결과나 키워드가 포함되어 있는지 확인
        return intent.get('intent') == 'data_visualization' or any(keyword in user_input for keyword in graph_keywords)

    def _process_web_results(self, search_results: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        웹 검색 결과를 처리하여 필요한 정보를 추출합니다.
        :param search_results: 웹 검색 결과
        :return: 처리된 결과 리스트
        """
        processed_results = []
        for item in search_results.get("organic", []):
            processed_results.append({
                "title": item.get("title", ""),
                "url": item.get("link", ""),
                "snippet": item.get("snippet", ""),
                "date": item.get("date", ""),
                "image_url": item.get("imageUrl", "")  # 이미지 URL 포함
            })
        return processed_results

    def _prepare_context(self, relevant_info: List[Dict[str, str]]) -> str:
        """
        검색 결과와 단기 기억을 기반으로 문맥을 준비합니다.
        :param relevant_info: 관련 정보
        :return: 생성된 문맥 문자열
        """
        # 단기 기억을 문맥에 추가
        short_term_context = "\n\n".join([f"사용자: {mem['user_input']}\nAI: {mem['response']}" for mem in self.short_term_memory])
        
        # 웹 검색 결과로부터 문맥 생성
        if relevant_info:
            context_parts = []
            for info in relevant_info:
                context_part = f"[제목: {info['title']}]\n{info['snippet']}\n[출처: {info['url']}]"
                if info['image_url']:
                    context_part += f"\n[이미지: {info['image_url']}]"
                context_parts.append(context_part)
            context = "\n\n".join(context_parts)
        else:
            context = "관련된 구체적인 정보를 찾지 못했습니다."

        # 최종 문맥 반환 (단기 기억 + 웹 검색 결과)
        return f"최근 대화:\n{short_term_context}\n\n웹 검색 결과:\n{context}"

    def _create_prompt(self, user_input: str, context: str) -> str:
        """
        사용자 입력과 문맥을 바탕으로 프롬프트를 생성합니다.
        :param user_input: 사용자 입력
        :param context: 생성된 문맥
        :return: 최종 프롬프트 문자열
        """
        return f"""다음은 관련된 웹 검색 결과입니다. 이 정보를 바탕으로 사용자의 질문에 상세하게 답변해주세요.
        구체적인 예시, 수치, 날짜 등이 있다면 반드시 포함해주세요. 정보가 부족하거나 없는 경우, 그 사실을 언급하고 가능한 범위 내에서 추론해 답변해주세요.
        관련 이미지가 있다면 해당 이미지의 URL을 언급해주세요.

        참고 정보:
        {context}

        사용자: {user_input}
        AI 조수:"""

    def _save_to_short_term_memory(self, text: str, response: Optional[str] = None):
        """
        단기 기억에 텍스트와 응답을 저장합니다.
        :param text: 사용자 입력 또는 AI 응답
        :param response: AI 응답 (사용자 입력과 함께 저장할 때)
        """
        if response is None:
            # 사용자 입력만 있을 때
            self.short_term_memory.append({"user_input": text, "response": ""})
        else:
            # AI 응답일 경우, 기존 사용자 입력을 업데이트
            self.short_term_memory[-1]["response"] = response

    def clear_conversation_history(self):
        """
        대화 기록과 단기 기억을 초기화합니다.
        """
        self.memory.clear()
        self.short_term_memory.clear()
        logger.info("대화 기록과 단기 기억이 초기화되었습니다.")
