import plotly.graph_objects as go
import json
from typing import List, Tuple, Dict, Any
from utils.web_search import WebSearch
from utils.multimodal_model import MultiModalModel
import logging

logger = logging.getLogger(__name__)

class GraphGenerator:
    def __init__(self):
        self.multimodal_model = MultiModalModel()
        self.web_search = WebSearch()

    def extract_graph_info(self, query: str) -> Dict[str, Any]:
        # 멀티모달 모델을 사용하여 쿼리에서 그래프 관련 정보 추출
        return self.multimodal_model.process(query)

    def search_and_process_data(self, info: Dict[str, Any]) -> List[Tuple[str, float]]:
        try:
            # 추출된 정보를 바탕으로 웹 검색 수행 및 데이터 처리
            search_query = f"{info.get('서비스 유형', 'AI 서비스')} 성장률"
            search_results = self.web_search.search([search_query])
            
            # 검색 결과에서 관련 데이터 추출
            data = []
            for result in search_results:
                year = result.get('year', '2023')
                rate = result.get('growth_rate', 0.0)
                if isinstance(rate, (int, float)):
                    data.append((year, rate))
            
            return sorted(data, key=lambda x: x[0])  # 연도별로 정렬
        except Exception as e:
            logger.error(f"데이터 검색 및 처리 중 오류 발생: {str(e)}")
            return [('2023', 0.0)]  # 기본 데이터 반환

    def generate_graph(self, graph_info: Dict[str, Any], data: List[Tuple[str, float]]) -> Dict[str, Any]:
        try:
            # 추출된 정보와 데이터를 바탕으로 그래프 생성
            service_type = graph_info.get('서비스 유형', 'AI 서비스')
            
            if not data:
                # 데이터가 없는 경우 더미 데이터 생성
                data = [('2023', 10.0), ('2024', 15.0)]
            
            years, rates = zip(*data)
            
            fig = go.Figure(data=go.Bar(x=years, y=rates))
            fig.update_layout(
                title=f'{service_type} 성장률',
                xaxis_title='연도',
                yaxis_title='성장률 (%)'
            )
            return json.loads(fig.to_json())
        except Exception as e:
            logger.error(f"그래프 생성 중 오류 발생: {str(e)}")
            return {"error": str(e)}

    def process_graph_request(self, query: str, image: Any = None) -> Dict[str, Any]:
        try:
            # 그래프 요청 처리 및 결과 반환
            graph_info = self.extract_graph_info(query)
            data = self.search_and_process_data(graph_info)
            graph_data = self.generate_graph(graph_info, data)
            
            return {
                "graph_data": graph_data,
                "extracted_info": graph_info
            }
        except Exception as e:
            logger.error(f"그래프 요청 처리 중 오류 발생: {str(e)}")
            return {"error": str(e)}