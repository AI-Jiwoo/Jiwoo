# services/chatbot.py

from langchain_openai import ChatOpenAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from utils.vector_store import VectorStore
from config.settings import settings

class Chatbot:
    """
    OpenAI의 ChatGPT를 이용한 대화형 챗봇 클래스
    """
    def __init__(self):
        """
        Chatbot 초기화: OpenAI 모델, 대화 메모리, 대화 체인, 벡터 스토어를 설정
        """
        self.llm = ChatOpenAI(
            temperature=0.7,
            api_key=settings.OPENAI_API_KEY
        )
        self.memory = ConversationBufferMemory()
        self.conversation = ConversationChain(
            llm=self.llm,
            memory=self.memory,
            verbose=True
        )
        self.vector_store = VectorStore()

    def get_response(self, user_input: str) -> str:
        """
        사용자 입력에 대한 응답을 생성
        :param user_input: 사용자의 질문 또는 입력
        :return: AI의 응답
        """
        # 벡터 스토어에서 관련 정보 검색
        relevant_info = self.vector_store.similarity_search(user_input, k=3)
        
        # 관련 정보를 문자열로 변환
        context = "\n".join(info['page_content'] for info in relevant_info)
        
        # 프롬프트 생성
        prompt = f"""다음 정보를 참고하여 사용자의 질문에 답하세요.
        필요한 경우 추가 정보를 제공하고, 구체적인 단계나 예시를 들어 설명해주세요.
        참고 정보:
        {context}
        사용자: {user_input}
        AI 조수:"""
        
        # 대화 생성 및 응답 반환
        return self.conversation.predict(input=prompt)