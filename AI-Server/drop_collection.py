from pymilvus import connections, utility

# Milvus 서버에 연결
connections.connect("default", host="localhost", port="19530")

collection_name = "business_info"

# 컬렉션이 존재하는지 확인하고 삭제
if utility.has_collection(collection_name):
    utility.drop_collection(collection_name)
    print(f"컬렉션 '{collection_name}'이(가) 성공적으로 삭제되었습니다.")
else:
    print(f"컬렉션 '{collection_name}'이(가) 존재하지 않습니다.")

# 연결 종료
connections.disconnect("default")
