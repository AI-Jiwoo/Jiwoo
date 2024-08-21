import logging
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from config.settings import settings
from utils.vector_store import VectorStore
from utils.web_search import WebSearch
from utils.query_generator import QueryGenerator
from utils.intent_analyzer import IntentAnalyzer
from typing import List, Optional, Dict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Chatbot:
    """OpenAI의 ChatGPT를 이용한 대화형 챗봇 클래스"""

    def __init__(self):
        self.llm = ChatOpenAI(temperature=0.7, api_key=settings.OPENAI_API_KEY)
        self.memory = ConversationBufferMemory()
        self.conversation = ConversationChain(llm=self.llm, memory=self.memory, verbose=True)
        self.vector_store = VectorStore()
        self.web_search = WebSearch()
        self.query_generator = QueryGenerator()
        self.intent_analyzer = IntentAnalyzer()
        
    def get_response(self, user_input: str) -> str:
        """사용자 입력에 대한 응답을 생성"""
        try:
            intent = self.intent_analyzer.analyze_intent(user_input)
            logger.info(f"분석된 의도: {intent}")

            relevant_info = self._get_relevant_info(user_input, intent)
            
            context = self._prepare_context(relevant_info, user_input)
            prompt = self._create_prompt(user_input, context)

            response = self.conversation.predict(input=prompt)
            logger.info("응답이 성공적으로 생성되었습니다.")
            return response

        except Exception as e:
            logger.error(f"응답 생성 중 오류 발생: {str(e)}")
            return "요청을 처리하는 동안 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."

    def _get_relevant_info(self, user_input: str, intent: str) -> List[Dict[str, str]]:
        """관련 정보를 벡터 스토어 또는 웹 검색을 통해 가져옴"""
        relevant_info = self.vector_store.search_with_similarity_threshold(user_input, k=3, threshold=0.7)
        
        if relevant_info:
            logger.info(f"벡터 스토어에서 관련 정보를 찾았습니다. 결과 수: {len(relevant_info)}")
            return relevant_info
        
        logger.info("벡터 스토어에서 관련 정보를 찾지 못했습니다. 웹 검색을 수행합니다...")
        generated_queries = self.query_generator.generate_queries(user_input, intent)
        web_results = self.web_search.search(generated_queries)
        
        if web_results:
            logger.info(f"웹 검색 결과를 찾았습니다. 결과 수: {len(web_results)}")
            relevant_results = [result for result in web_results if self._is_relevant(result['content'], user_input)]
            print("관련 정보:", relevant_results)
            
            if relevant_results:
                logger.info(f"관련성 있는 웹 검색 결과를 찾았습니다. 결과 수: {len(relevant_results)}")
                self.vector_store.add_search_results(relevant_results)
                return relevant_results
            else:
                logger.info("관련성 있는 웹 검색 결과를 찾지 못했습니다.")
        else:
            logger.info("웹 검색 결과를 찾지 못했습니다.")
        
        logger.info("관련 정보를 찾지 못했습니다. 일반적인 응답을 생성합니다.")
        return [{"content": "요청하신 정보에 대한 구체적인 데이터를 찾지 못했습니다. 일반적인 지식을 바탕으로 답변하겠습니다.", "url": ""}]

    def _prepare_context(self, relevant_info: List[Dict[str, str]], user_input: str) -> str:
        """관련 정보를 문자열로 변환"""
        if relevant_info:
            filtered_info = [info for info in relevant_info if self._is_relevant(info["content"], user_input)]
            if filtered_info:
                return "\n\n".join(f"[출처: {info['url']}]\n{info['content']}" for info in filtered_info)
        return f"'{user_input}'에 대한 구체적인 정보를 찾지 못했습니다. 일반적인 지식을 바탕으로 답변하겠습니다."

    def _is_relevant(self, content: str, query: str) -> bool:
        """컨텐츠의 관련성 체크"""
        query_words = set(query.lower().split())
        content_words = set(content.lower().split())
        overlap = len(query_words.intersection(content_words))
        return overlap >= 1  # 최소 1개의 단어가 일치해야 함

    def _create_prompt(self, user_input: str, context: str) -> str:
        """프롬프트 생성"""
        return f"""다음 정보를 참고하여 사용자의 질문에 답하세요.
        필요한 경우 추가 정보를 제공하고, 구체적인 단계나 예시를 들어 설명해주세요.
        정보가 부족하거나 없는 경우, 일반적인 지식을 활용하여 최선을 다해 답변해 주세요.
        참고 정보:
        {context}
        사용자: {user_input}
        AI 조수:"""

    def add_to_vector_store(self, texts: List[str], urls: Optional[List[str]] = None):
        """벡터 스토어에 텍스트 추가"""
        try:
            self.vector_store.add_texts(texts, urls)
            logger.info(f"벡터 스토어에 {len(texts)}개의 텍스트를 성공적으로 추가했습니다.")
        except Exception as e:
            logger.error(f"벡터 스토어에 텍스트 추가 중 오류 발생: {str(e)}")

    def clear_conversation_history(self):
        """대화 기록 초기화"""
        self.memory.clear()
        logger.info("대화 기록이 초기화되었습니다.")