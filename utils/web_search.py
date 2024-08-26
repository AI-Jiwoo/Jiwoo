import logging
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict, Optional, Any
from config.settings import settings
from cachetools import TTLCache
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class WebSearch:
    def __init__(self):
        self.api_key = settings.SERPER_API_KEY
        self.endpoint = "https://google.serper.dev/search"

    async def search(self, queries: List[str], num_results: int = 10) -> Dict[str, Any]:
        """
        여러 쿼리에 대해 Serper API를 사용하여 검색을 수행합니다.
        :param queries: 검색할 쿼리 리스트
        :param num_results: 각 쿼리당 반환할 결과 수
        :return: 검색 결과를 포함하는 딕셔너리
        """
        headers = {"X-API-KEY": self.api_key, "Content-Type": "application/json"}
        all_results = []

        async with aiohttp.ClientSession() as session:
            for query in queries:
                payload = {"q": query, "num": num_results}
                try:
                    async with session.post(self.endpoint, json=payload, headers=headers) as response:
                        if response.status == 200:
                            result = await response.json()
                            all_results.append(result)
                        else:
                            logger.error(f"API 요청 실패: {response.status}")
                except Exception as e:
                    logger.error(f"검색 중 오류 발생: {str(e)}")

        return self._merge_results(all_results)

    def _process_results(self, search_results: Dict[str, Any]) -> Dict[str, Any]:
        processed = {
            "searchParameters": {
                "q": search_results.get("searchParameters", {}).get("q", ""),
                "gl": search_results.get("searchParameters", {}).get("gl", "kr"),
                "hl": search_results.get("searchParameters", {}).get("hl", "ko"),
                "type": "search",
                "engine": "google",
            },
            "organic": [],
            "relatedSearches": [],
        }

        for i, item in enumerate(search_results.get("organic", []), 1):
            processed["organic"].append(
                {"title": item.get("title", ""), "link": item.get("link", ""), "snippet": item.get("snippet", ""), "date": item.get("date", ""), "position": i}
            )

        for item in search_results.get("relatedSearches", []):
            processed["relatedSearches"].append({"query": item})

        return processed

    def _get_fallback_results(self, query: str) -> Dict[str, Any]:
        return {
            "searchParameters": {"q": query, "gl": "kr", "hl": "ko", "type": "search", "engine": "google"},
            "organic": [{"title": "검색 결과 없음", "link": "https://example.com", "snippet": "요청하신 정보에 대한 검색 결과를 찾지 못했습니다.", "date": "", "position": 1}],
            "relatedSearches": [],
        }

    def _merge_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        여러 쿼리의 결과를 하나의 결과 셋으로 병합합니다.
        :param results: 각 쿼리의 검색 결과 리스트
        :return: 병합된 검색 결과
        """
        merged = {"organic": [], "relatedSearches": []}
        seen_links = set()
        seen_related_searches = set()

        for result in results:
            for item in result.get("organic", []):
                if item["link"] not in seen_links:
                    merged["organic"].append(item)
                    seen_links.add(item["link"])

            for related in result.get("relatedSearches", []):
                if isinstance(related, dict):
                    query = related.get("query", "")
                elif isinstance(related, str):
                    query = related
                else:
                    continue

                if query and query not in seen_related_searches:
                    merged["relatedSearches"].append({"query": query})
                    seen_related_searches.add(query)

        # 중복 제거 및 상위 결과 선택
        merged["organic"] = merged["organic"][:10]  # 상위 10개 결과만 유지
        merged["relatedSearches"] = merged["relatedSearches"][:5]  # 상위 5개 관련 검색어만 유지

        return merged
