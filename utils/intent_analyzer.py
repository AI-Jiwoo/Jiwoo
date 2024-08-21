import logging
from openai import OpenAI
from config.settings import settings

logger = logging.getLogger(__name__)

class IntentAnalyzer:
    def __init__(self):
        # OpenAI 클라이언트 초기화
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def analyze_intent(self, user_input: str) -> dict:
        """
        사용자 입력의 의도를 분석합니다.
        :param user_input: 사용자 입력 문자열
        :return: 의도 분석 결과 (카테고리와 키워드를 포함하는 딕셔너리)
        """
        try:
            # OpenAI API를 사용하여 의도 분석 수행
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "당신은 사용자 의도를 분석하는 AI 어시스턴트입니다. 사용자의 의도를 분류하고 관련 키워드를 제공하세요."},
                    {"role": "user", "content": f"다음 사용자 입력의 의도를 분석하세요: {user_input}"}
                ],
                max_tokens=100,
                temperature=0.3
            )
            intent_analysis = response.choices[0].message.content
            return self._parse_intent_analysis(intent_analysis)
        except Exception as e:
            logger.error(f"의도 분석 중 오류 발생: {str(e)}")
            return {"category": "unknown", "keywords": []}

    def _parse_intent_analysis(self, analysis: str) -> dict:
        """
        OpenAI의 응답을 파싱하여 의도 카테고리와 키워드를 추출합니다.
        :param analysis: OpenAI 응답 문자열
        :return: 파싱된 의도 분석 결과 딕셔너리
        """
        # OpenAI의 응답을 파싱하여 카테고리와 키워드 추출
        lines = analysis.split('\n')
        category = lines[0].split(':')[-1].strip() if len(lines) > 0 else "unknown"
        keywords = lines[1].split(':')[-1].strip().split(', ') if len(lines) > 1 else []
        return {"category": category, "keywords": keywords}