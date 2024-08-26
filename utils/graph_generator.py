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

logger = logging.getLogger(__name__)

class GraphGenerator:
    def __init__(self):
        # 정확성을 위해 낮은 temperature 사용
        self.llm = ChatOpenAI(temperature=0.2)

    async def process_graph_request(self, query: str, search_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        그래프 생성 요청을 처리합니다.
        
        :param query: 사용자 쿼리 문자열
        :param search_results: 웹 검색 결과
        :return: 그래프 데이터와 설명을 포함한 딕셔너리
        """
        try:
            logger.info(f"그래프 생성 요청 처리 시작: {query}")
            
            graph_type, data_fields = self._analyze_query(query)
            
            if not search_results or not search_results.get("organic"):
                return {
                    "text_response": "요청하신 정보를 찾지 못했습니다.",
                    "graph_data": None
                }
            
            processed_data = self._process_data(search_results["organic"], data_fields)
            
            if not processed_data:
                return {
                    "text_response": "유효한 그래프 데이터가 없습니다.",
                    "graph_data": None
                }
            
            graph_data = self.generate_graph(processed_data, graph_type, query)
            
            return {
                "graph_data": json.loads(graph_data.to_json()),
                "text_response": self._generate_graph_explanation(processed_data, graph_type)
            }
        except Exception as e:
            logger.error(f"그래프 요청 처리 중 예기치 않은 오류 발생: {str(e)}", exc_info=True)
            return {"error": str(e)}

    def _analyze_query(self, query: str) -> Tuple[str, List[str]]:
        """
        쿼리를 분석하여 그래프 유형과 데이터 필드를 결정합니다.
        
        :param query: 사용자 쿼리 문자열
        :return: 그래프 유형과 데이터 필드 리스트를 포함한 튜플
        """
        prompt = PromptTemplate(
            input_variables=["query"],
            template="다음 쿼리에서 요청된 그래프 유형(line, bar 또는 pie)과 데이터 필드를 추출하세요. 시계열 데이터인 경우 line을 선택하세요. 형식: 그래프 유형: [TYPE], 데이터 필드: [FIELD]\n\n쿼리: {query}"
        )
        response = self.llm(prompt.format(query=query))
        response_lines = response.content.split('\n')
        graph_type = 'bar'  # 기본값으로 bar 설정
        data_fields = []
        
        for line in response_lines:
            if line.startswith("그래프 유형:"):
                type_value = line.split(':')[1].strip().lower()
                if type_value in ['line', 'bar', 'pie']:
                    graph_type = type_value
            elif line.startswith("데이터 필드:"):
                data_fields = [field.strip() for field in line.split(':')[1].split(',')]
        
        return graph_type, data_fields

    def _extract_data_with_llm(self, text: str) -> List[Dict[str, Any]]:
        """
        LLM을 사용하여 텍스트에서 관련 데이터를 추출합니다.
        
        :param text: 분석할 텍스트
        :return: 추출된 데이터 리스트
        """
        prompt = PromptTemplate(
            input_variables=["text"],
            template="""
            다음 텍스트에서 기업명, 분야, 관련 수치(점유율, 매출, 성장률 등)를 추출하세요.
            각 항목은 새로운 줄에 "기업: [기업명], 분야: [분야], 수치: [수치] [단위], 날짜: [YYYY-MM-DD]" 형식으로 작성하세요.
            수치는 숫자만 포함하고, 단위는 별도로 표시하세요. 예를 들어, "1조9884억원"은 "19884 억원"으로 표시하세요.
            정확한 정보만 추출하고, 추측하지 마세요. 정보가 없으면 빈 줄을 반환하세요.

            텍스트:
            {text}

            추출된 정보:
            """
        )
        response = self.llm(prompt.format(text=text))
        
        extracted_data = []
        for line in response.content.split('\n'):
            if line.strip():
                try:
                    parts = line.split(', ')
                    if len(parts) >= 3:
                        company = parts[0].split(': ')[1]
                        field = parts[1].split(': ')[1]
                        value_part = parts[2].split(': ')[1]
                        date = parts[3].split(': ')[1] if len(parts) > 3 else None
                        
                        # 정규 표현식을 사용하여 값과 단위 분리 (더 유연한 버전)
                        match = re.match(r'([-]?[\d,.]+)\s*(.*)', value_part)
                        if match:
                            value_str, unit = match.groups()
                            value_str = value_str.replace(',', '')  # 쉼표 제거
                            
                            # 값 변환
                            try:
                                if '%' in unit:
                                    value = float(value_str) / 100
                                    unit = '%'
                                elif '조' in unit:
                                    value = float(value_str) * 10000  # 조 단위를 억 단위로 변환
                                    unit = '억원'
                                else:
                                    value = float(value_str)
                            except ValueError:
                                logger.warning(f"숫자로 변환할 수 없는 값: {value_str}")
                                continue

                            extracted_data.append({
                                "name": company,
                                "field": field,
                                "value": value,
                                "unit": unit,
                                "date": datetime.strptime(date, "%Y-%m-%d") if date else None
                            })
                        else:
                            logger.warning(f"값을 추출할 수 없음: {value_part}")
                except Exception as e:
                    logger.warning(f"데이터 추출 중 오류 발생: {str(e)}")
                    continue
        
        return extracted_data

    def _process_data(self, search_results: List[Dict[str, Any]], fields: List[str]) -> List[Dict[str, Any]]:
        """
        검색 결과를 그래프에 적합한 형식으로 처리합니다.
        
        :param search_results: 웹 검색 결과 리스트
        :param fields: 추출할 데이터 필드 리스트
        :return: 처리된 데이터 리스트
        """
        processed_data = []
        field = fields[0] if fields else "값"
        
        for item in search_results:
            extracted_data = self._extract_data_with_llm(item.get("title", "") + " " + item.get("snippet", ""))
            processed_data.extend(extracted_data)
        
        # 데이터가 부족한 경우 처리
        if len(processed_data) < 2:
            logger.warning("충분한 데이터를 추출하지 못했습니다.")
            return []

        # 날짜 정보가 있는 경우 날짜순으로 정렬
        if all(item.get('date') for item in processed_data):
            processed_data.sort(key=lambda x: x['date'])

        return processed_data
    
    def generate_graph(self, data: List[Dict[str, Any]], graph_type: str, query: str) -> go.Figure:
        """
        주어진 데이터와 그래프 유형으로 그래프를 생성합니다.
        
        :param data: 그래프 데이터 리스트
        :param graph_type: 그래프 유형 (line, bar, pie)
        :param query: 원본 쿼리 문자열
        :return: Plotly 그래프 객체
        """
        try:
            if not data:
                raise ValueError("그래프를 생성할 데이터가 없습니다.")

            field = data[0]['field']

            if graph_type == 'line':
                fig = go.Figure(go.Scatter(
                    x=[item['date'] for item in data],
                    y=[item['value'] for item in data],
                    mode='lines+markers',
                    name=field
                ))
                fig.update_layout(
                    title=f"{field} 추이",
                    xaxis_title="날짜",
                    yaxis_title=field
                )
            elif '점유율' in field.lower() or graph_type == 'pie':
                fig = go.Figure(go.Pie(
                    labels=[item['name'] for item in data],
                    values=[item['value'] for item in data],
                    textinfo='label+percent'
                ))
                fig.update_layout(title=f"{field} 분포")
            else:
                fig = go.Figure(go.Bar(
                    x=[item['name'] for item in data],
                    y=[item['value'] for item in data],
                    text=[item['value'] for item in data],
                    textposition='auto'
                ))
                fig.update_layout(
                    title=f"{field} 그래프",
                    xaxis_title="기업/분야",
                    yaxis_title=field
                )

            return fig
        except Exception as e:
            logger.error(f"그래프 생성 중 오류 발생: {str(e)}", exc_info=True)
            return self._create_error_graph(str(e))

    def _create_error_graph(self, error_message: str) -> go.Figure:
        """
        오류 메시지를 포함한 오류 그래프를 생성합니다.
        
        :param error_message: 오류 메시지
        :return: 오류 그래프 객체
        """
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

    def _generate_graph_explanation(self, data: List[Dict[str, Any]], graph_type: str) -> str:
        """
        그래프 결과에 대한 설명을 생성합니다.
        
        :param data: 그래프 데이터 리스트
        :param graph_type: 그래프 유형
        :return: 그래프 설명 문자열
        """
        if not data:
            return "그래프를 생성할 데이터가 없습니다."

        field = data[0]['field']
        explanation = f"{field}에 대한 "

        if graph_type == "line":
            start_date = data[0]['date'].strftime('%Y-%m-%d')
            end_date = data[-1]['date'].strftime('%Y-%m-%d')
            max_value = max(data, key=lambda x: x['value'])
            min_value = min(data, key=lambda x: x['value'])
            explanation += f"시계열 그래프입니다. {start_date}부터 {end_date}까지의 데이터를 보여줍니다. "
            explanation += f"최고값은 {max_value['date'].strftime('%Y-%m-%d')}의 {self._format_value(max_value['value'], max_value['unit'])}, "
            explanation += f"최저값은 {min_value['date'].strftime('%Y-%m-%d')}의 {self._format_value(min_value['value'], min_value['unit'])}입니다."
        elif graph_type == "bar" or '점유율' not in field.lower():
            explanation += "막대 그래프입니다. "
            top_item = max(data, key=lambda x: x['value'])
            bottom_item = min(data, key=lambda x: x['value'])
            explanation += f"가장 높은 값은 {top_item['name']}로 {self._format_value(top_item['value'], top_item['unit'])}입니다. "
            explanation += f"가장 낮은 값은 {bottom_item['name']}로 {self._format_value(bottom_item['value'], bottom_item['unit'])}입니다."
        else:
            explanation += "원형 그래프입니다. "
            total = sum(item['value'] for item in data)
            explanation += ", ".join(f"{item['name']}이(가) {item['value']/total*100:.1f}%" for item in data)
            explanation += "의 비율을 차지합니다."

        return explanation

    def _format_value(self, value: float, unit: str) -> str:
        """
        값과 단위를 적절한 형식으로 변환합니다.
        
        :param value: 수치 값
        :param unit: 단위 문자열
        :return: 형식화된 값 문자열
        """
        if unit == '%':
            return f"{value*100:.2f}%"
        elif unit == '만대':
            return f"{value:.2f}만대"
        elif unit == '억원':
            return f"{value:.0f}억원"
        elif unit == '원':
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

        from bs4 import BeautifulSoup
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
                    "title": title,
                    "snippet": snippet
                })

        if not processed_results:
            logger.warning(f"검색 결과가 없습니다: {search_results}")

        return processed_results