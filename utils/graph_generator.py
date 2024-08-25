import plotly.graph_objects as go
import json
import asyncio
import aiohttp
from bs4 import BeautifulSoup
from typing import Dict, Any, List, Tuple
import logging
from utils.multimodal_model import MultiModalModel
from langchain.tools import Tool
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.schema import AIMessage


logger = logging.getLogger(__name__)

class GraphGenerator:
    def __init__(self):
        self.multimodal_model = MultiModalModel()
        self.llm = ChatOpenAI(temperature=0.7)
        self.search_tool = Tool(
            name="Search",
            func=lambda query: asyncio.run(self._web_search(query)),
            description="A tool for performing web searches to find information."
        )
        self.search_agent = IterativeSearchAgent(self.llm, self.search_tool)

    async def process_graph_request(self, query: str, image: Any = None) -> Dict[str, Any]:
        """그래프 생성 요청을 처리합니다."""
        try:
            logger.info(f"그래프 생성 요청 처리 시작: {query}")
            
            results, final_query = await self.search_agent.run(query)
            
            if not results:
                return {
                    "text_response": "요청하신 정보를 찾지 못했습니다.",
                    "graph_data": None
                }
            
            graph_data = self.generate_graph({"query": final_query}, results)
            
            return {
                "graph_data": json.loads(graph_data.to_json()),
                "text_response": self._generate_graph_explanation(results)
            }
        except Exception as e:
            logger.error(f"그래프 요청 처리 중 예기치 않은 오류 발생: {str(e)}", exc_info=True)
            return {"error": str(e)}

    def generate_graph(self, graph_info: Dict[str, str], data: List[Dict[str, Any]]) -> go.Figure:
        """주어진 데이터로 그래프를 생성합니다."""
        try:
            fig = go.Figure(go.Bar(
                x=[item['name'] for item in data],
                y=[item['value'] for item in data],
                text=[item['value'] for item in data],
                textposition='auto'
            ))
            
            fig.update_layout(
                title=f"{graph_info.get('query', '검색 결과')} 그래프",
                xaxis_title="항목",
                yaxis_title="값"
            )
            
            return fig
        except Exception as e:
            logger.error(f"그래프 생성 중 오류 발생: {str(e)}", exc_info=True)
            return self._create_error_graph("그래프 생성 오류")

    def _create_error_graph(self, error_message: str) -> go.Figure:
        """오류 메시지를 포함한 오류 그래프를 생성합니다."""
        fig = go.Figure()
        fig.add_annotation(
            x=0.5, y=0.5, xref="paper", yref="paper",
            text=f"그래프를 생성할 수 없습니다: {error_message}",
            showarrow=False, font=dict(size=20)
        )
        fig.update_layout(
            title="오류 발생",
            xaxis=dict(visible=False),
            yaxis=dict(visible=False)
        )
        return fig

    def _generate_graph_explanation(self, results: List[Dict[str, Any]]) -> str:
        """그래프 결과에 대한 설명을 생성합니다."""
        explanation = "검색 결과에 대한 그래프입니다. "
        if results:
            top_item = max(results, key=lambda x: x['value'])
            bottom_item = min(results, key=lambda x: x['value'])
            explanation += f"가장 높은 값은 {top_item['name']}로 {top_item['value']}입니다. "
            explanation += f"가장 낮은 값은 {bottom_item['name']}로 {bottom_item['value']}입니다."
        return explanation

    async def _web_search(self, query: str) -> List[Dict[str, Any]]:
        """웹 검색을 수행하고 결과를 처리합니다."""
        search_url = f"https://www.google.com/search?q={query}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(search_url) as response:
                html = await response.text()

        soup = BeautifulSoup(html, 'html.parser')
        search_results = soup.find_all('div', class_='g')

        processed_results = []
        for result in search_results[:5]:  # 상위 5개 결과만 처리
            title_elem = result.find('h3', class_='r')
            snippet_elem = result.find('div', class_='s')
            
            if title_elem and snippet_elem:
                title = title_elem.text
                snippet = snippet_elem.text
                processed_results.append({
                    "name": title,
                    "value": len(snippet)  # 스니펫의 길이를 값으로 사용
                })

        if not processed_results:
            return [{"name": "No results", "value": 0}]

        return processed_results

class IterativeSearchAgent:
    def __init__(self, llm, search_tool):
        self.llm = llm
        self.search_tool = search_tool

    async def _search(self, state):
        """주어진 쿼리로 검색을 수행합니다."""
        results = await self.search_tool.run(state["query"])
        state["results"] = results
        return state

    def _process_results(self, state):
        """검색 결과를 처리하고 충분한지 확인합니다."""
        if self._is_sufficient(state["results"]):
            return "END"
        return state

    def _refine_query(self, state):
        """이전 결과를 바탕으로 쿼리를 개선합니다."""
        refined_query = self._generate_refined_query(state["query"], state["results"])
        state["query"] = refined_query
        return state

    def _is_sufficient(self, results):
        """결과가 충분한지 확인합니다."""
        if not results or (len(results) == 1 and results[0]["name"] == "No results"):
            return False
        return len(results) >= 5 and all('name' in result and 'value' in result for result in results)

    def _generate_refined_query(self, original_query, previous_results):
        """이전 결과를 바탕으로 개선된 쿼리를 생성합니다."""
        prompt = PromptTemplate(
            input_variables=["query", "results"],
            template="이전 쿼리: {query}\n이전 결과: {results}\n더 나은 결과를 위해 쿼리를 개선해주세요."
        )
        response = self.llm(prompt.format(query=original_query, results=previous_results))
        if isinstance(response, AIMessage):
            return response.content  # AIMessage 객체에서 content를 추출
        return str(response)  # 다른 타입의 응답이라면 문자열로 변환

    async def run(self, query: str) -> Tuple[List[Dict[str, Any]], str]:
        """반복적인 검색 프로세스를 실행합니다."""
        state = {"query": query, "results": []}
        while True:
            state = await self._search(state)
            process_result = self._process_results(state)
            if process_result == "END":
                break
            state = self._refine_query(state)
        return state["results"], state["query"]