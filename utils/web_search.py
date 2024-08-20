import logging
import os
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSearch:
    """Exa API를 사용한 웹 검색 기능을 제공하는 클래스"""

    def __init__(self):
        """Exa API 키 설정 및 기본 URL 초기화"""
        self.api_key = os.getenv("EXA_API_KEY")
        self.base_url = "https://api.exa.ai/search"

    def search(self, query: str, num_results: int = 3):
        """
        주어진 쿼리에 대해 웹 검색을 수행
        :param query: 검색 쿼리
        :param num_results: 반환할 결과 수
        :return: 검색 결과 리스트
        """
        logger.info(f"Executing web search for query: '{query}' with num_results={num_results}")

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "query": query,
                "num_results": num_results
            }
            response = requests.post(self.base_url, headers=headers, json=data)
            response.raise_for_status()
            results = response.json()

            if "results" in results:
                search_results = [{"content": result.get("text", "")} for result in results["results"]]
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