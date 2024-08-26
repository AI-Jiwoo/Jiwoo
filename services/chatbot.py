import asyncio
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferWindowMemory
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
import tiktoken
import re

logger = logging.getLogger(__name__)


class Chatbot:
    def __init__(self):
        """
        Chatbot 클래스의 초기화 메서드.
        필요한 모든 유틸리티 객체와 설정을 초기화합니다.
        """
        self.llm = ChatOpenAI(temperature=settings.TEMPERATURE, api_key=settings.OPENAI_API_KEY)
        self.memory = ConversationBufferWindowMemory(k=5)  # 최근 5개의 대화만 유지(LLM)
        self.short_term_memory = deque(maxlen=5)  # 최근 5개의 대화 기록 유지(요약 및 히스토리 관리)
        self.conversation = ConversationChain(llm=self.llm, memory=self.memory, verbose=True)
        self.vector_store = VectorStore()
        self.web_search = WebSearch()
        self.intent_analyzer = IntentAnalyzer()
        self.query_generator = QueryGenerator()
        self.graph_generator = GraphGenerator()
        self.max_tokens = 14000
        self.encoding = tiktoken.encoding_for_model(settings.OPENAI_MODEL)
        self.forbidden_words = ["씨발", "개새끼", "좆", "병신", "지랄", "애미", "찌질"]  # 금지어 목록

    async def get_response(self, user_input: str) -> Dict[str, Any]:
        """
        사용자의 입력을 받아 적절한 응답을 생성합니다.

        :param user_input: 사용자 입력 문자열
        :return: 응답 데이터를 포함한 딕셔너리
        """
        try:
            # 입력 검증
            validation_result = self._validate_input(user_input)
            if validation_result:
                return {"text_response": validation_result, "error": "Input validation failed"}

            intent = self.intent_analyzer.analyze_intent(user_input)
            logger.info(f"분석된 의도: {intent}")

            self._save_to_short_term_memory(user_input)

            if self._is_graph_request(intent, user_input):
                return await self._handle_graph_request(user_input)
            else:
                return await self._handle_text_request(user_input, intent)

        except Exception as e:
            logger.error(f"응답 생성 중 오류 발생: {str(e)}", exc_info=True)
            return {"text_response": "요청을 처리하는 동안 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", "error": str(e)}

    def _validate_input(self, user_input: str) -> Optional[str]:
        """
        사용자 입력을 검증합니다.

        :param user_input: 사용자 입력 문자열
        :return: 검증 실패 시 오류 메시지, 성공 시 None
        """
        # 기억 지우기 시도 감지
        memory_wipe_patterns = [r"기억.*지워", r"메모리.*삭제", r"대화.*초기화", r"forget.*conversation", r"clear.*memory"]
        for pattern in memory_wipe_patterns:
            if re.search(pattern, user_input, re.IGNORECASE):
                return "대화 기록을 임의로 지우거나 수정할 수 없습니다."

        # 금지어 감지
        for word in self.forbidden_words:
            if word in user_input:
                return "불쾌감을 줄 수 있는 언어는 사용하지 말아주세요."

        # 입력 길이 제한
        if len(user_input) > 500:  # 예: 500자로 제한
            return "입력이 너무 깁니다. 500자 이내로 작성해주세요."

        return None

    async def _handle_graph_request(self, user_input: str) -> Dict[str, Any]:
        """
        그래프 요청을 처리합니다.

        :param user_input: 사용자 입력 문자열
        :return: 그래프 데이터와 설명을 포함한 딕셔너리
        """
        try:
            logger.info(f"그래프 생성 요청 처리 시작: {user_input}")

            # 웹 검색 수행
            queries = self.query_generator.generate_queries(user_input, {"intent": "data_visualization"})
            search_results = await self.web_search.search(queries)

            if not search_results or not search_results.get("organic"):
                logger.warning("검색 결과가 없습니다.")
                return {"text_response": "요청하신 정보를 찾지 못했습니다. 다른 검색어로 시도해 보시겠습니까?", "graph_data": None}

            # 웹 검색 결과 처리
            relevant_info = self._process_web_results(search_results)

            # GraphGenerator를 사용하여 그래프 데이터 생성
            graph_response = await self.graph_generator.process_graph_request(user_input, search_results)

            if "error" in graph_response:
                return {"text_response": "그래프를 생성하는 동안 오류가 발생했습니다. 다시 시도해 주세요.", "error": graph_response["error"]}

            # LLM을 사용하여 그래프에 대한 설명 생성
            context = self._prepare_context(relevant_info)
            graph_data_str = json.dumps(graph_response["graph_data"])
            llm_prompt = self._create_graph_prompt(user_input, context, graph_data_str)

            llm_response = self.conversation.predict(input=llm_prompt)

            # 최종 응답 구성
            final_response = {"text_response": llm_response, "graph_data": graph_response["graph_data"]}

            self._save_to_short_term_memory(user_input, llm_response)
            if self._should_save_response(llm_response):
                self._save_to_vector_store(user_input, llm_response)

            return final_response
        except Exception as e:
            logger.error(f"그래프 요청 처리 중 예기치 않은 오류 발생: {str(e)}", exc_info=True)
            return {"text_response": "요청을 처리하는 동안 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", "error": str(e)}

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
            vector_results = self.vector_store.search_with_similarity_threshold(queries[0], k=3, threshold=settings.SIMILARITY_THRESHOLD)

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

        # 토큰 수 계산 및 제한
        total_tokens = len(self.encoding.encode(prompt))
        if total_tokens > self.max_tokens:
            prompt = self._reduce_context(prompt, self.max_tokens)

        response = self.conversation.predict(input=prompt)

        self._save_to_short_term_memory(user_input, response)
        if self._should_save_response(response):
            self._save_to_vector_store(user_input, response)

        return {"text_response": response, "relevant_info": relevant_info, "graph_data": None}

    def _check_historical_query(self, user_input: str) -> bool:
        """
        사용자 입력이 과거 대화에 대한 질문인지 확인합니다.
        """
        historical_keywords = ["지금까지", "이전에", "과거에", "어떤 질문", "뭘 물어봤어", "대화 기록"]
        return any(keyword in user_input for keyword in historical_keywords)

    def _get_conversation_history(self) -> List[Dict[str, str]]:
        """
        대화 기록을 가져옵니다.
        """
        return [
            {"title": f"대화 {i+1}", "snippet": f"사용자: {item['user_input']}\nAI: {item['response']}", "url": "", "date": "", "image_url": ""}
            for i, item in enumerate(self.short_term_memory)
        ]

    def _is_graph_request(self, intent: Dict[str, Any], user_input: str) -> bool:
        """
        사용자의 입력이 그래프 요청인지 확인합니다.
        """
        graph_keywords = ["그래프", "차트", "추이", "통계", "시각화"]
        return intent.get("intent") == "data_visualization" or any(keyword in user_input for keyword in graph_keywords)

    def _process_vector_results(self, vector_results: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        VectorDB 검색 결과를 처리합니다.
        """
        processed_results = []
        for result in vector_results:
            created_at = result.get("created_at")
            date_str = (
                created_at.strftime("%Y-%m-%d")
                if isinstance(created_at, datetime)
                else datetime.fromtimestamp(created_at).strftime("%Y-%m-%d") if isinstance(created_at, (int, float)) else "Unknown Date"
            )

            processed_results.append(
                {
                    "title": result.get("content", "").split("\n")[0],  # 첫 줄을 제목으로 사용
                    "url": result.get("url", ""),
                    "snippet": result.get("content", ""),
                    "date": date_str,
                    "image_url": "",  # VectorStore에는 이미지 URL이 저장되어 있지 않음
                }
            )
        return processed_results

    def _process_web_results(self, search_results: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        웹 검색 결과를 처리하여 필요한 정보를 추출합니다.
        """
        processed_results = []
        for item in search_results.get("organic", [])[:5]:  # 상위 5개 결과만 사용
            processed_results.append(
                {
                    "title": item.get("title", ""),
                    "snippet": item.get("snippet", ""),
                    "url": item.get("link", ""),
                    "date": item.get("date", ""),
                    "image_url": item.get("imageUrl", ""),
                }
            )
        return processed_results

    def _prepare_context(self, relevant_info: List[Dict[str, str]]) -> str:
        """
        검색 결과와 단기 기억을 기반으로 문맥을 준비합니다.
        """
        context_parts = []
        for info in relevant_info:
            part = f"[제목: {info['title']}]\n{info['snippet']}"
            if info["url"]:
                part += f"\n[출처: {info['url']}]"
            if info["date"]:
                part += f"\n[날짜: {info['date']}]"
            if info["image_url"]:
                part += f"\n[이미지: {info['image_url']}]"
            context_parts.append(part)

        return "\n\n".join(context_parts) if context_parts else "관련된 구체적인 정보를 찾지 못했습니다."

    def _create_prompt(self, user_input: str, context: str) -> str:
        """
        사용자 입력과 문맥을 바탕으로 프롬프트를 생성합니다.
        """
        return f"""당신은 창업 컨설턴트 입니다. 사용자의 요청과 참고 정보를 바탕으로 관련 정보에 대해 설명해주세요.

        1. 관련 정보를 간결한 bullet point 리스트로 정리해주고 간단한 설명을 해주세요.
        2. 각 bullet point에는 구체적인 예시, 수치, 날짜 등을 포함해주세요.
        3. 정보가 부족하거나 없는 경우, 그 사실을 언급해주세요.
        4. 관련 이미지 URL이 있다면 별도의 bullet point로 언급해주세요.
        5. 마지막으로, 사용자가 답변에 대해 궁금해 할만한 사항이나 더 자세히 알고 싶어할 내용에 대하여 1-2개의 추천 질문을 작성해주세요.
        6. 만약 사용자가 이전 대화 내용 중 특정 항목에 대해 질문한다면, 해당 항목에 대해 더 자세히 설명해주세요.
        7. "죄송합니다"라는 표현은 사용하지 마세요. 대신 긍정적이고 도움이 되는 방식으로 응답해주세요.

        참고 정보:
        {context}

        사용자: {user_input}
        AI 조수:"""

    def _create_graph_prompt(self, user_input: str, context: str, graph_data: str) -> str:
        """
        그래프 데이터와 웹 검색 결과를 바탕으로 LLM 프롬프트를 생성합니다.
        """
        return f"""당신은 데이터 분석 전문가입니다. 사용자의 그래프 요청, 관련 정보, 그리고 생성된 그래프 데이터를 바탕으로 분석 결과를 설명해주세요.

        1. 그래프의 주요 특징과 트렌드를 설명해주세요.
        2. 데이터에서 발견된 중요한 패턴이나 이상점을 언급해주세요.
        3. 그래프가 보여주는 정보의 의미와 시사점을 해석해주세요.
        4. 가능하다면, 데이터와 관련된 산업 동향이나 경제적 맥락을 제공해주세요.
        5. 사용자가 데이터를 더 잘 이해하는 데 도움이 될 만한 1-2개의 추가 질문을 제안해주세요.

        참고 정보:
        {context}

        그래프 데이터:
        {graph_data}

        사용자 요청: {user_input}
        분석가:"""

    def _reduce_context(self, prompt: str, max_tokens: int) -> str:
        """
        프롬프트의 컨텍스트를 줄여 토큰 수를 제한합니다.
        """
        tokens = self.encoding.encode(prompt)
        if len(tokens) <= max_tokens:
            return prompt

        context_start = prompt.find("참고 정보:")
        context_end = prompt.find("사용자:")
        if context_start == -1 or context_end == -1:
            return self.encoding.decode(tokens[:max_tokens])

        context = prompt[context_start:context_end]
        non_context = prompt[:context_start] + prompt[context_end:]
        available_tokens = max_tokens - len(self.encoding.encode(non_context))

        if available_tokens <= 0:
            return prompt[:context_start] + prompt[context_end:]

        context_lines = context.split("\n")
        reduced_context = []
        current_tokens = 0
        for line in context_lines:
            line_tokens = len(self.encoding.encode(line))
            if current_tokens + line_tokens > available_tokens:
                break
            reduced_context.append(line)
            current_tokens += line_tokens

        return prompt[:context_start] + "\n".join(reduced_context) + prompt[context_end:]

    def _save_to_short_term_memory(self, user_input: str, response: Optional[str] = None):
        """
        단기 기억에 텍스트와 응답을 저장합니다.
        """
        self.short_term_memory.append({"user_input": user_input, "response": response or ""})
        self._update_conversation_summary()

    def _should_save_response(self, response: str) -> bool:
        """
        응답을 저장해야 하는지 결정합니다.
        """
        skip_keywords = ["찾지 못했습니다", "정보가 없습니다"]
        return not any(keyword in response for keyword in skip_keywords)

    def _save_to_vector_store(self, user_input: str, response: str):
        """
        대화 내용을 벡터 저장소에 저장합니다.
        """
        if not self._should_save_response(response):
            logger.info("응답이 저장 조건을 충족하지 않아 벡터 저장소에 저장하지 않습니다.")
            return

        conversation_text = f"User: {user_input}\nAI: {response}"
        try:
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
        """
        self.vector_store.add_company_info(company_name, info)
        logger.info(f"회사 정보가 벡터 저장소에 추가되었습니다: {company_name}")

    def add_support_program_info(self, program: Dict[str, Any]):
        """
        지원 프로그램 정보를 벡터 저장소에 추가합니다.
        """
        self.vector_store.add_support_program_info(program)
        logger.info(f"지원 프로그램 정보가 벡터 저장소에 추가되었습니다: {program.get('name', 'Unknown')}")

    def _update_conversation_summary(self):
        """
        대화 요약을 업데이트합니다.
        """
        summary = self._summarize_conversation(list(self.short_term_memory))
        self.memory.chat_memory.add_user_message("대화 요약")
        self.memory.chat_memory.add_ai_message(summary)

    def _summarize_conversation(self, messages: List[Dict[str, str]], max_tokens: int = 500) -> str:
        """
        대화 내용을 요약합니다.
        """
        summary = "최근 대화 요약:\n\n"
        total_tokens = len(self.encoding.encode(summary))
        for message in reversed(messages):
            message_text = f"User: {message['user_input']}\nAI: {message['response']}\n\n"
            message_tokens = len(self.encoding.encode(message_text))
            if total_tokens + message_tokens > max_tokens:
                break
            summary += message_text
            total_tokens += message_tokens
        return summary
