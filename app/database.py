from pymilvus import connections, Collection, utility

# Milvus 데이터베이스에 연결하는 함수
def connect_to_milvus():
    # 'default' 별칭으로 로컬 Milvus 서버에 연결
    connections.connect("default", host="localhost", port="19530")

# 지정된 이름의 컬렉션을 가져오는 함수
def get_collection(collection_name: str) -> Collection:
    # 컬렉션이 존재하는지 확인
    if not utility.has_collection(collection_name):
        # 컬렉션이 존재하지 않으면 예외 발생
        raise Exception(f"Collection {collection_name} does not exist.")
    
    # 컬렉션 객체 생성
    collection = Collection(collection_name)
    
    # 컬렉션을 메모리에 로드 (검색 속도 향상을 위해)
    collection.load()
    
    return collection