import logging
import os

import requests

# 로그 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class WebSearch:
    """SerpAPI를 사용한 웹 검색 기능을 제공하는 클래스"""

    def __init__(self):
        """SerpAPI 키 설정 및 기본 URL 초기화"""
        self.api_key = os.getenv("SERPAPI_KEY")
        self.base_url = "https://serpapi.com/search"

    def search(self, query: str, num_results: int = 3):
        """
        주어진 쿼리에 대해 웹 검색을 수행
        :param query: 검색 쿼리
        :param num_results: 반환할 결과 수
        :return: 검색 결과 리스트
        """
        logger.info(f"Executing web search for query: '{query}' with num_results={num_results}")

        try:
            # SerpAPI 요청 파라미터 설정
            params = {"q": query, "num": num_results, "api_key": self.api_key}
            # API 요청 수행
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            results = response.json()

            # 검색 결과 처리 및 반환
            if "organic_results" in results:
                search_results = [{"content": result.get("snippet", "")} for result in results["organic_results"]]
                logger.info(f"Search completed. Number of results found: {len(search_results)}")
                return search_results
            else:
                logger.warning(f"No results found for query: '{query}'")
                return []

        except requests.RequestException as e:
            logger.error(f"Request error occurred: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"An unexpected error occurred: {str(e)}")
            return []
