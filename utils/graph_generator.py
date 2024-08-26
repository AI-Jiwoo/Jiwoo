import plotly.graph_objects as go
import json
import asyncio
import aiohttp
import re
from typing import Dict, Any, List, Tuple
import logging
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from datetime import datetime
from dateutil.parser import parse
from dateutil.relativedelta import relativedelta
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

class GraphGenerator:
    def __init__(self):
        self.llm = ChatOpenAI(temperature=0.2)

    async def process_graph_request(self, query: str, search_results: Dict[str, Any]) -> Dict[str, Any]:
        try:
            logger.info(f"그래프 생성 요청 처리 시작: {query}")

            graph_type, data_fields = self._analyze_query(query)
            logger.info(f"분석된 그래프 유형: {graph_type}, 데이터 필드: {data_fields}")

            if not search_results or not search_results.get("organic"):
                logger.warning("검색 결과가 없습니다.")
                return {"text_response": "요청하신 정보를 찾지 못했습니다.", "graph_data": None}

            most_relevant_url = await self._select_most_relevant_url(query, search_results["organic"])
            if not most_relevant_url:
                raise ValueError("관련성 높은 URL을 찾지 못했습니다.")

            page_content = await self._fetch_page_content(most_relevant_url)
            if not page_content:
                raise ValueError("웹 페이지 내용을 가져오지 못했습니다.")

            processed_data = await self._extract_data_from_content(page_content, data_fields)
            if not processed_data:
                raise ValueError("데이터 추출에 실패했습니다.")

            logger.info(f"처리된 데이터: {json.dumps(processed_data, ensure_ascii=False, default=str)}")

            graph_data = self.generate_graph(processed_data, graph_type, query)
            
            if isinstance(graph_data, go.Figure):
                return {
                    "graph_data": json.loads(graph_data.to_json()),
                    "text_response": self._generate_graph_explanation(processed_data, graph_type)
                }
            else:
                logger.error(f"그래프 생성 실패: {graph_data}")
                return {"text_response": f"그래프 생성 중 오류가 발생했습니다: {graph_data}", "graph_data": None}

        except Exception as e:
            logger.error(f"그래프 요청 처리 중 예기치 않은 오류 발생: {str(e)}", exc_info=True)
            return {"text_response": f"요청을 처리하는 동안 오류가 발생했습니다: {str(e)}", "graph_data": None}

    def _analyze_query(self, query: str) -> Tuple[str, List[str]]:
        """
        쿼리를 분석하여 그래프 유형과 데이터 필드를 결정합니다.

        :param query: 사용자 쿼리 문자열
        :return: 그래프 유형과 데이터 필드 리스트를 포함한 튜플
        """
        prompt = PromptTemplate(
            input_variables=["query"],
            template="당신은 쿼리를 분석하여 그래프 유형과 필드를 결정해주는 AI 어시스턴트입니다. 다음 쿼리에서 요청된 그래프 유형(line, bar 또는 pie)과 데이터 필드를 추출하세요. 시계열 데이터인 경우 line을 선택하세요. 형식: 그래프 유형: [TYPE], 데이터 필드: [FIELD]\n\n쿼리: {query}",
        )
        response = self.llm(prompt.format(query=query))
        response_lines = response.content.split("\n")
        graph_type = "line"  # 기본값으로 line 설정 (시계열 데이터 가정)
        data_fields = ["경제성장률"]  # 기본 데이터 필드 설정

        for line in response_lines:
            if line.startswith("그래프 유형:"):
                type_value = line.split(":")[1].strip().lower()
                if type_value in ["line", "bar", "pie"]:
                    graph_type = type_value
            elif line.startswith("데이터 필드:"):
                fields = [field.strip() for field in line.split(":")[1].split(",")]
                if fields:
                    data_fields = fields

        logger.info(f"분석된 쿼리 - 그래프 유형: {graph_type}, 데이터 필드: {data_fields}")
        return graph_type, data_fields

    async def _select_most_relevant_url(self, query: str, search_results: List[Dict[str, Any]]) -> str:
        logger.info(f"URL 선택 시작: {query}")
        prompt = PromptTemplate(
            input_variables=["query", "results"],
            template="다음 검색 결과 중에서 '{query}'와 가장 관련성 높은 URL을 선택하세요:\n\n{results}\n\n가장 관련성 높은 URL:"
        )
        
        results_text = "\n".join([f"제목: {result.get('title', '')}\nURL: {result.get('link', '')}\n" for result in search_results])
        response = self.llm(prompt.format(query=query, results=results_text))
        
        selected_url = response.content.strip()
        logger.info(f"선택된 URL: {selected_url}")
        return selected_url if selected_url.startswith("http") else None

    async def _fetch_page_content(self, url: str) -> str:
        logger.info(f"웹 페이지 내용 가져오기 시작: {url}")
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                content = soup.get_text()
                logger.info(f"웹 페이지 내용 가져오기 완료: {url}")
                return content

    async def _extract_data_from_content(self, content: str, data_fields: List[str]) -> List[Dict[str, Any]]:
        logger.info("데이터 추출 시작")
        prompt = PromptTemplate(
            input_variables=["content", "fields"],
            template="""다음 텍스트에서 {fields}에 관한 데이터를 추출하세요. 
            각 데이터 포인트는 새 줄에 "연도: [YYYY], 값: [VALUE]" 형식으로 작성하세요.
            정확한 정보만 추출하고, 추측하지 마세요.

            텍스트:
            {content}

            추출된 데이터:
            """
        )
        response = self.llm(prompt.format(content=content, fields=", ".join(data_fields)))
        
        extracted_data = []
        for line in response.content.split("\n"):
            if line.strip():
                parts = line.split(", ")
                if len(parts) == 2:
                    year = parts[0].split(": ")[1]
                    value = parts[1].split(": ")[1]
                    try:
                        extracted_data.append({
                            "date": f"{year}-01-01",
                            "value": float(value),
                            "name": "대한민국",
                            "field": data_fields[0] if data_fields else "경제성장률"
                        })
                    except ValueError:
                        logger.warning(f"Invalid data point: {line}")
        
        logger.info(f"추출된 데이터: {extracted_data}")
        return extracted_data

    def generate_graph(self, data: List[Dict[str, Any]], graph_type: str, query: str) -> go.Figure:
        try:
            if not data:
                raise ValueError("그래프를 생성할 데이터가 없습니다.")

            field = data[0]["field"]
            logger.info(f"그래프 생성 시작 - 유형: {graph_type}, 필드: {field}")

            if graph_type == "line":
                fig = go.Figure(go.Scatter(x=[item["date"] for item in data], y=[item["value"] for item in data], mode="lines+markers", name=field))
                fig.update_layout(title=f"{field} 추이", xaxis_title="날짜", yaxis_title=field)
            elif "점유율" in field.lower() or graph_type == "pie":
                fig = go.Figure(go.Pie(labels=[item["name"] for item in data], values=[item["value"] for item in data], textinfo="label+percent"))
                fig.update_layout(title=f"{field} 분포")
            else:
                fig = go.Figure(go.Bar(x=[item["name"] for item in data], y=[item["value"] for item in data], text=[item["value"] for item in data], textposition="auto"))
                fig.update_layout(title=f"{field} 그래프", xaxis_title="기업/분야", yaxis_title=field)

            logger.info("그래프 생성 완료")
            return fig
        except Exception as e:
            logger.error(f"그래프 생성 중 오류 발생: {str(e)}", exc_info=True)
            return str(e)

    def _create_error_graph(self, error_message: str) -> go.Figure:
        """
        오류 메시지를 포함한 오류 그래프를 생성합니다.

        :param error_message: 오류 메시지
        :return: 오류 그래프 객체
        """
        fig = go.Figure()
        fig.add_annotation(x=0.5, y=0.5, xref="paper", yref="paper", text=f"그래프를 생성할 수 없습니다: {error_message}", showarrow=False, font=dict(size=20))
        fig.update_layout(title="오류 발생", xaxis=dict(visible=False), yaxis=dict(visible=False))
        return fig

    def _generate_graph_explanation(self, data: List[Dict[str, Any]], graph_type: str) -> str:
        """
        그래프 결과에 대한 설명을 생성합니다.

        :param data: 그래프 데이터 리스트
        :param graph_type: 그래프 유형
        :return: 그래프 설명 문자열
        """
        if not data:
            return "그래프를 생성할 데이터가 없습니다."

        field = data[0]["field"]
        explanation = f"{field}에 대한 "

        if graph_type == "line":
            start_date = data[0]["date"]
            end_date = data[-1]["date"]
            max_value = max(data, key=lambda x: x["value"])
            min_value = min(data, key=lambda x: x["value"])
            explanation += f"시계열 그래프입니다. {start_date}부터 {end_date}까지의 데이터를 보여줍니다. "
            explanation += f"최고값은 {max_value['date']}의 {self._format_value(max_value['value'], '%')}, "
            explanation += f"최저값은 {min_value['date']}의 {self._format_value(min_value['value'], '%')}입니다."
        elif graph_type == "bar" or "점유율" not in field.lower():
            explanation += "막대 그래프입니다. "
            top_item = max(data, key=lambda x: x["value"])
            bottom_item = min(data, key=lambda x: x["value"])
            explanation += f"가장 높은 값은 {top_item['date']}의 {self._format_value(top_item['value'], '%')}입니다. "
            explanation += f"가장 낮은 값은 {bottom_item['date']}의 {self._format_value(bottom_item['value'], '%')}입니다."
        else:
            explanation += "원형 그래프입니다. "
            total = sum(item["value"] for item in data)
            explanation += ", ".join(f"{item['date']}년이 {item['value']/total*100:.1f}%" for item in data)
            explanation += "의 비율을 차지합니다."

        return explanation

    def _format_value(self, value: float, unit: str) -> str:
        """
        값과 단위를 적절한 형식으로 변환합니다.

        :param value: 수치 값
        :param unit: 단위 문자열
        :return: 형식화된 값 문자열
        """
        if unit == "%":
            return f"{value:.2f}%"
        elif unit == "만대":
            return f"{value:.2f}만대"
        elif unit == "억원":
            return f"{value:.0f}억원"
        elif unit == "원":
            return f"{value:,.0f}원"
        else:
            return f"{value:.2f}"

    async def _web_search(self, query: str) -> List[Dict[str, Any]]:
        """
        웹 검색을 수행하고 결과를 처리합니다.

        :param query: 검색 쿼리 문자열
        :return: 처리된 검색 결과 리스트
        """
        search_url = f"https://www.google.com/search?q={query}"

        async with aiohttp.ClientSession() as session:
            async with session.get(search_url) as response:
                html = await response.text()

        soup = BeautifulSoup(html, "html.parser")
        search_results = soup.find_all("div", class_="g")

        processed_results = []
        for result in search_results[:5]:  # 상위 5개 결과만 처리
            title_elem = result.find("h3", class_="r")
            snippet_elem = result.find("div", class_="s")

            if title_elem and snippet_elem:
                title = title_elem.text
                snippet = snippet_elem.text
                processed_results.append({"title": title, "snippet": snippet})

        if not processed_results:
            logger.warning(f"검색 결과가 없습니다: {search_results}")

        return processed_results