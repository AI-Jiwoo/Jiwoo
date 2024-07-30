from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility

def create_collection():
    # Milvus 데이터베이스에 연결
    connections.connect("default", host="localhost", port="19530")
    
    # 현재 존재하는 모든 컬렉션 목록 출력
    print(utility.list_collections())
    
    collection_name = "company_collection"
    
    # 컬렉션이 이미 존재하는지 확인
    if utility.has_collection(collection_name):
        print(f"Collection {collection_name} already exists.")
        return
    
    # 컬렉션의 스키마 정의
    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),  # 자동 생성되는 고유 ID
        FieldSchema(name="businessName", dtype=DataType.VARCHAR, max_length=255),     # 회사명 (최대 255자)
        FieldSchema(name="info", dtype=DataType.JSON),                                # 회사 정보 (JSON 형식)
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=768)           # 임베딩 벡터 (768차원)
    ]
    
    # 컬렉션 스키마 생성
    schema = CollectionSchema(fields, "Company information collection for similarity search")
    
    # 컬렉션 생성
    collection = Collection(collection_name, schema)
    
    # 인덱스 파라미터 설정
    index_params = {
        "index_type": "IVF_FLAT",  # 인덱스 타입
        "metric_type": "L2",       # 거리 측정 방식 (L2: 유클리드 거리)
        "params": {"nlist": 1024}  # IVF_FLAT 인덱스의 클러스터 수
    }
    
    # 임베딩 필드에 인덱스 생성
    collection.create_index("embedding", index_params)
    
    print("Collection created successfully")

if __name__ == "__main__":
    create_collection()