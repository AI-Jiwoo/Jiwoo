from fastapi import APIRouter, HTTPException
from app.database import get_collection
from app.embeddings import get_company_embedding
from app.models import CompanyInput, CompanySearchResult, CompanyInfo

router = APIRouter()

# 사업 정보 저장
@router.post("/insert_company")
async def insert_company(input: CompanyInput):
    # "company_collection" 컬렉션 가져오기
    collection = get_collection("company_collection")
    # 회사 정보를 임베딩 벡터로 변환
    embedding = get_company_embedding(input.info)
    
    # Milvus에 삽입할 데이터 준비
    data = [
        [input.company_name],  # 회사명
        [input.info.dict()],   # 회사 정보 (JSON 형태로 변환)
        [embedding]            # 임베딩 벡터
    ]
    
    # 데이터를 Milvus 컬렉션에 삽입
    result = collection.insert(data)
    return {"message": "Company inserted successfully", "id": result.primary_keys[0]}

# 유사 사업 조회
@router.post("/search_similar_companies")
async def search_similar_companies(input: CompanyInfo):
    # "company_collection" 컬렉션 가져오기
    collection = get_collection("company_collection")
    # 입력된 회사 정보를 임베딩 벡터로 변환
    query_embedding = get_company_embedding(input)
    
    # 검색 파라미터 설정
    search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
    
    # Milvus에서 유사한 회사 검색
    result = collection.search([query_embedding], "embedding", search_params, limit=5, output_fields=["company_name", "info"])
    
    search_results = []
    for hits in result:
        for hit in hits:
            # 검색 결과의 회사 정보를 CompanyInfo 객체로 변환
            company_info = CompanyInfo(**hit.entity.get('info'))
            # 검색 결과를 CompanySearchResult 객체로 변환하여 리스트에 추가
            search_results.append(CompanySearchResult(
                company_name=hit.entity.get('company_name'),
                info=company_info,
                similarity_score=1 - hit.distance  # 거리를 유사도 점수로 변환 (1에 가까울수록 유사)
            ))
    
    return search_results