from typing import Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableSequence
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

class MultiModalModel:
    def __init__(self):
        # OpenAI GPT-4 모델 초기화
        self.llm = ChatOpenAI(temperature=0.7, model="gpt-4", api_key=settings.OPENAI_API_KEY)

    def process(self, text: str, image: Any = None) -> Dict[str, Any]:
        # 사용자 요청을 분석하고 주요 정보를 추출
        prompt = PromptTemplate(
            input_variables=["text"],
            template="다음 요청을 분석하고 주요 정보를 추출하세요:\n{text}\n\n추출된 정보:"
        )
        chain = RunnableSequence(
            {"text": RunnablePassthrough()} | prompt | self.llm
        )
        try:
            result = chain.invoke(text)
            # 추출된 정보를 딕셔너리 형태로 변환
            extracted_info = {}
            for line in result.content.strip().split('\n'):
                key, value = line.split(':', 1)
                extracted_info[key.strip()] = value.strip()
            return extracted_info
        except Exception as e:
            logger.error(f"MultiModalModel 처리 중 오류 발생: {str(e)}")
            return {"error": str(e)}