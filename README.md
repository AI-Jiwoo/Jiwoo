# Jiwoo-AI

## Project Info
Python기반 VectorDB 유사도 검증 서버입니다.
<br>
주요 기능으로는 입력받은 기업의 사업 정보를 저장하고 저장된 기업과 유사한 사업을 진행하는 기업의 데이터를 반환시켜줍니다.

## 기능 명세서 (UPDATE 예정)

## API 명세서 (UPDATE 예정)
> ## 기업 사업 정보 저장
> URL: POST /insert_company
```
# Request
{
  "company_name": "테크스타트업",
  "info": {
    "business_type": "SaaS",
    "business_scale": "중소기업",
    "founding_date": "2020-01-01",
    "investment_status": "시리즈 A",
    "customer_type": "B2B"
  }
}
```

```
# Response
{
    "message": "Company inserted successfully",
    "id": 451406042500956438
}
```

> ## 유사 기업 정보 조회
> URL: POST /search_similar_companies
```
# Request
{
  "business_type": "SaaS",
  "business_scale": "중소기업",
  "founding_date": "2021-05-15",
  "investment_status": "시리즈 A",
  "customer_type": "B2B"
}
```

```
# Response
[
    {
        "company_name": "테크스타트업",
        "info": {
            "business_type": "SaaS",
            "business_scale": "중소기업",
            "founding_date": "2020-01-01",
            "investment_status": "시리즈 A",
            "customer_type": "B2B"
        },
        "similarity_score": 0.9364195689558983
    }
]
```


## Spec
> VectorDB: Milvus <br>
> Model: intfloat/multilingual-e5-base


```
Jiwoo-AI-Server
├─ Dockerfile
├─ docker-compose.yml
├─ create_collection.py
├─ main.py
├─ README.md
├─ requirements.txt
└─ app
    ├─ __init__.py
    ├─ database.py
    ├─ embeddings.py
    ├─ models.py
    └─ api
        └─ routes.py


```

## How to use
### 프로젝트 Root directory에서 terminal 실행하여 하위 명령어 수행

```
% conda create -n <환경이름> python=3.10
% conda activate <환경이름>
% docker-compose up -d
% python create_collection.py
% python main.py
```
이후 POSTMAN 또는 FastAPI로 테스팅 진행