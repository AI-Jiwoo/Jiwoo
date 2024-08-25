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

logger = logging.getLogger(__name__)

class Chatbot:
    """OpenAI의 ChatGPT를 이용한 대화형 챗봇 클래스"""

    def __init__(self):
        self.llm = ChatOpenAI(temperature=settings.TEMPERATURE, api_key=settings.OPENAI_API_KEY)
        self.memory = ConversationBufferMemory()
        self.conversation = ConversationChain(llm=self.llm, memory=self.memory, verbose=True)
        self.vector_store = VectorStore()
        self.web_search = WebSearch()
        self.intent_analyzer = IntentAnalyzer()
        self.query_generator = QueryGenerator()
        self.graph_generator = GraphGenerator()
        

    async def get_response(self, user_input: str) -> Dict[str, Any]:
        try:
            # 의도 분석
            intent = self.intent_analyzer.analyze_intent(user_input)
            logger.info(f"분석된 의도: {intent}")

            # 그래프 요청 처리
            if self._is_graph_request(intent, user_input):
                return await self._handle_graph_request(user_input)

            # 쿼리 생성
            queries = self.query_generator.generate_queries(user_input, intent)
            logger.info(f"생성된 쿼리: {queries}")

            # 웹 검색 수행
            search_results = await self.web_search.search(queries)
            relevant_info = self._process_web_results(search_results)

            # 컨텍스트 준비 및 응답 생성
            context = self._prepare_context(relevant_info)
            prompt = self._create_prompt(user_input, context)
            response = self.conversation.predict(input=prompt)

            result = {
                "text_response": response,
                "relevant_info": relevant_info,
                "graph_data": None
            }

            self.memory.save_context({"input": user_input}, {"output": response})

            return result

        except Exception as e:
            logger.error(f"응답 생성 중 오류 발생: {str(e)}", exc_info=True)
            return {
                "text_response": "요청을 처리하는 동안 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
                "error": str(e)
            }

    def _process_web_results(self, search_results: Dict[str, Any]) -> List[Dict[str, str]]:
        processed_results = []
        for item in search_results.get("organic", []):
            processed_results.append({
                "title": item.get("title", ""),
                "url": item.get("link", ""),
                "snippet": item.get("snippet", ""),
                "date": item.get("date", "")
            })
        return processed_results

    def _prepare_context(self, relevant_info: List[Dict[str, str]]) -> str:
        if relevant_info:
            context_parts = []
            for info in relevant_info:
                context_part = f"[제목: {info['title']}]\n{info['snippet']}\n[출처: {info['url']}]"
                context_parts.append(context_part)
            return "\n\n".join(context_parts)
        return "관련된 구체적인 정보를 찾지 못했습니다."

    def _create_prompt(self, user_input: str, context: str) -> str:
        return f"""다음은 관련된 웹 검색 결과입니다. 이 정보를 바탕으로 사용자의 질문에 상세하게 답변해주세요.
        구체적인 예시, 수치, 날짜 등이 있다면 반드시 포함해주세요. 정보가 부족하거나 없는 경우, 그 사실을 언급하고 가능한 범위 내에서 추론해 답변해주세요.

        참고 정보:
        {context}

        사용자: {user_input}
        AI 조수:"""

    def _is_graph_request(self, intent: Dict[str, Any], user_input: str) -> bool:
        graph_keywords = ['그래프', '차트', '추이', '통계', '시각화']
        return intent.get('intent') == 'data_visualization' or any(keyword in user_input for keyword in graph_keywords)

    async def _handle_graph_request(self, user_input: str) -> Dict[str, Any]:
        try:
            # 쿼리 생성
            intent = self.intent_analyzer.analyze_intent(user_input)
            queries = self.query_generator.generate_queries(user_input, intent)
            
            # 웹 검색 수행
            search_results = await self.web_search.search(queries)
            
            # 그래프 생성
            graph_data = self.graph_generator.generate_graph(search_results)
            text_response = self._generate_graph_explanation(search_results)
            
            return {
                "text_response": text_response,
                "graph_data": json.loads(graph_data.to_json())
            }
        except Exception as e:
            logger.error(f"그래프 요청 처리 중 오류 발생: {str(e)}", exc_info=True)
            return {
                "text_response": "그래프를 생성하는 동안 오류가 발생했습니다. 일반 텍스트 응답으로 대체합니다.",
                "error": str(e)
            }

    def _generate_graph_explanation(self, search_results: Dict[str, Any]) -> str:
        organic_results = search_results.get("organic", [])
        if not organic_results:
            return "검색 결과에 대한 그래프를 생성할 수 없습니다."

        explanation = "검색 결과에 대한 그래프입니다. "
        top_result = organic_results[0]
        explanation += f"가장 관련성 높은 결과는 '{top_result.get('title', '제목 없음')}'입니다. "
        explanation += "그래프는 상위 5개 검색 결과의 관련도를 보여줍니다. 관련도는 각 결과의 스니펫 길이를 기준으로 측정되었습니다."
        return explanation

    def clear_conversation_history(self):
        self.memory.clear()
        logger.info("대화 기록이 초기화되었습니다.")