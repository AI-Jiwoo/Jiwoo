import logging

from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI

from config.settings import settings
from utils.vector_store import VectorStore
from utils.web_search import WebSearch

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Chatbot:
    """OpenAI의 ChatGPT를 이용한 대화형 챗봇 클래스"""

    def __init__(self):
        """Chatbot 초기화: OpenAI 모델, 대화 메모리, 대화 체인, 벡터 스토어, 웹 검색 설정"""
        self.llm = ChatOpenAI(temperature=0.7, api_key=settings.OPENAI_API_KEY)
        self.memory = ConversationBufferMemory()
        self.conversation = ConversationChain(llm=self.llm, memory=self.memory, verbose=True)
        self.vector_store = VectorStore()
        self.web_search = WebSearch()

    def get_response(self, user_input: str) -> str:
        """
        사용자 입력에 대한 응답을 생성
        :param user_input: 사용자의 질문 또는 입력
        :return: AI의 응답
        """
        try:
            # 벡터 스토어에서 관련 정보 검색
            logger.info("Searching for relevant information in vector store...")
            relevant_info = self.vector_store.search_with_similarity_threshold(user_input, k=3, threshold=0.7)

            # 검색된 정보가 없거나 부족할 경우 웹 검색 수행
            if not relevant_info:
                logger.info("No relevant information found in vector store. Performing web search...")
                web_results = self.web_search.search(user_input)

                if web_results:
                    logger.info("Web search results found. Adding to vector store...")
                    self.vector_store.add_texts([result["content"] for result in web_results])
                    relevant_info = self.vector_store.similarity_search(user_input, k=3)

                if not relevant_info:
                    logger.info("No relevant information found after web search.")
                    return "죄송합니다. 현재 관련된 정보를 찾을 수 없습니다."

            # 관련 정보를 문자열로 변환하여 프롬프트 생성
            context = "\n".join(info["content"] for info in relevant_info)
            prompt = f"""다음 정보를 참고하여 사용자의 질문에 답하세요.
            필요한 경우 추가 정보를 제공하고, 구체적인 단계나 예시를 들어 설명해주세요.
            참고 정보:
            {context}
            사용자: {user_input}
            AI 조수:"""

            # 대화 생성 및 응답 반환
            response = self.conversation.predict(input=prompt)
            logger.info("Response generated successfully.")
            return response

        except Exception as e:
            logger.error(f"An error occurred while generating response: {str(e)}")
            return "An error occurred while processing your request."
