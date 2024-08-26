import logging
from openai import OpenAI
from config.settings import settings
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class QueryGenerator:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def generate_queries(self, user_input: str, intent: Dict[str, Any]) -> List[str]:
        """
        사용자 입력과 의도 분석을 바탕으로 여러 개의 검색 쿼리를 생성합니다.
        :param user_input: 사용자 입력 문자열
        :param intent: 의도 분석 결과 딕셔너리
        :return: 생성된 검색 쿼리 리스트
        """
        try:
            # 의도 분석 결과에서 키워드 추출
            keywords = intent.get("keywords", [])
            keyword_str = ", ".join(keywords) if keywords else user_input

            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "당신은 사용자 입력과 키워드를 바탕으로 다양한 검색 쿼리를 생성하는 AI 어시스턴트입니다."},
                    {"role": "user", "content": f"다음 키워드를 바탕으로 5개의 다양한 검색 쿼리를 생성하세요. 각 쿼리는 새로운 줄에 작성하세요: {keyword_str}"},
                ],
                max_tokens=200,
                temperature=0.7,
            )
            queries = response.choices[0].message.content.split("\n")
            return [query.strip() for query in queries if query.strip()][:5]  # 최대 5개의 쿼리만 반환
        except Exception as e:
            logger.error(f"쿼리 생성 중 오류 발생: {str(e)}")
            return [user_input]  # 오류 발생 시 원래 사용자 입력을 그대로 반환
