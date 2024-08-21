import logging
import os
from typing import List, Dict
import requests

from config.settings import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSearch:
    """Serper API를 사용한 웹 검색 기능을 제공하는 클래스"""

    def __init__(self):
        """Serper API 키 설정 및 초기화"""
        self.api_key = settings.SERPER_API_KEY
        self.endpoint = "https://google.serper.dev/search"

        if not self.api_key:
            logger.error("Serper API 키가 설정되지 않았습니다.")
            raise ValueError("Serper API 키가 설정되지 않았습니다.")

    def search(self, queries: List[str], num_results: int = 5) -> List[Dict[str, str]]:
        """
        주어진 쿼리 리스트에 대해 웹 검색을 수행
        :param queries: 검색 쿼리 리스트
        :param num_results: 각 쿼리당 반환할 결과 수
        :return: 검색 결과 리스트
        """
        logger.info(f"다음 쿼리로 Serper 검색 실행: {queries}")
        all_results = []
        for query in queries:
            query = self._preprocess_query(query)
            if not query:
                continue
            results = self._search_single_query(query, num_results)
            if results:
                all_results.extend(results)
                logger.info(f"쿼리 '{query}'에 대한 검색 결과 찾음. 결과 수: {len(results)}")
                break  # 결과를 찾았으면 루프 종료
        
        if not all_results:
            logger.warning("모든 쿼리에 대한 검색 결과가 없습니다.")
            all_results = self._get_fallback_results(queries)
        
        logger.info(f"최종 검색 결과 수: {len(all_results)}")
        return all_results

    def _preprocess_query(self, query: str) -> str:
        """쿼리 전처리"""
        query = query.strip()
        if query.lower().startswith("검색 쿼리:"):
            query = query[len("검색 쿼리:"):].strip()
        if query.startswith('"') and query.endswith('"'):
            query = query[1:-1].strip()
        if query.startswith(f"{len(query)}. "):
            query = query[len(f"{len(query)}. "):].strip()
        return query

    def _search_single_query(self, query: str, num_results: int) -> List[Dict[str, str]]:
        """단일 쿼리에 대한 검색을 수행하고 결과를 반환"""
        try:
            headers = {
                "X-API-KEY": self.api_key,
                "Content-Type": "application/json"
            }
            payload = {
                "q": query,
                "num": num_results
            }
            response = requests.post(self.endpoint, json=payload, headers=headers)
            response.raise_for_status()
            search_results = response.json()
            
            results = []
            for item in search_results.get('organic', []):
                title = item.get('title', '제목 없음')
                snippet = item.get('snippet', '내용 없음')
                url = item.get('link', 'URL 없음')
                
                results.append({
                    "content": f"{title}\n\n{snippet}",
                    "url": url
                })
            
            logger.info(f"쿼리 '{query}'에 대한 검색 완료. 결과 수: {len(results)}")
            print("검색 결과:", results)
            return results
        except Exception as e:
            logger.error(f"쿼리 '{query}'에 대한 검색 중 오류 발생: {str(e)}")
            return []

    def _get_fallback_results(self, queries: List[str]) -> List[Dict[str, str]]:
        """대체 정보를 제공"""
        fallback_content = (
            "현재 Serper 검색 서비스에서 정확한 정보를 찾지 못했습니다. "
            "요청하신 정보에 대해 일반적인 지식을 바탕으로 답변하겠습니다. "
            f"검색했던 쿼리: {', '.join(queries)}"
        )
        return [{"content": fallback_content, "url": ""}]