# Jiwoo-AI

## Project Info
Python기반 VectorDB 유사도 검증 및 Jiwoo chat-bot서버입니다.
<br><br>
[주요 기능]<br>
- 입력받은 기업의 사업 정보를 저장하고 저장된 기업과 유사한 사업을 진행하는 기업의 데이터를 반환시켜줍니다.
- 입력받은 질문의 내용을 파악하고 사업자등록 및 창업을 할 수 있도록 가이드할 수 있는 답변을 제공합니다.


## 기능 명세서 (UPDATE 예정)

## API 명세서 (UPDATE 예정)
> ## 기업 사업 정보 저장
> URL: POST /insert_company
```
# Request
{
  "businessName": "지우",
  "info": {
    "businessPlatform": "SaaS",
    "businessScale": "스타트업",
    "business_field": "AI, 모바일",
    "businessStartDate": "2024-07-04",
    "investmentStatus": "주식회사",
    "customerType": "B2B, B2C"
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
  "businessPlatform": "SaaS",
  "businessScale": "스타트업",
  "business_field": "AI, 모바일", 
  "businessStartDate": "2024-07-04",
  "investmentStatus": "주식회사",
  "customerType": "B2B, B2C"
}
```

```
# Response
[
    {
        "businessName": "지우",
        "info": {
            "businessPlatform": "SaaS",
            "businessScale": "스타트업",
            "business_field": "AI, 모바일",
            "businessStartDate": "2024-07-04",
            "investmentStatus": "주식회사",
            "customerType": "B2B, B2C"
        },
        "similarityScore": 1.0
    },
    {
        "businessName": "SK",
        "info": {
            "businessPlatform": "SaaS",
            "businessScale": "대기업",
            "business_field": "통신, 전자",
            "businessStartDate": "1963-03-15",
            "investmentStatus": "주식회사",
            "customerType": "B2B, B2C"
        },
        "similarityScore": 0.8349735289812088
    }
]
```

> ## Chat-bot
> URL: POST /chat
```
# Request
{
  "message": "블로그 및 콘텐츠 제작해보고 싶은데 알려줄 수 있어?"
}
```

```
# Response
{
    "message": "물론이죠! 블로그 및 콘텐츠 제작은 매우 인기 있는 사이드 프로젝트 중 하나입니다. 먼저, 전문 분야 지식을 공유하기 위해 어떤 주제에 대해 글을 쓸 것인지 결정해야 합니다. 이후에는 광고 수익을 올리거나 제휴 마케팅을 통해 수익을 창출할 수 있습니다. 또한, 온라인 강의를 제작하여 블로그를 통해 지식을 공유하는 것도 좋은 방법입니다. 시작하기 위해 블로그 플랫폼을 선택하고, 콘텐츠를 작성하는 방법부터 마케팅 전략까지 고려해보세요. 이렇게 구체적인 단계를 따라가면 블로그 및 콘텐츠 제작을 성공적으로 시작할 수 있을 거예요. 어떤 주제로 블로그를 운영하고 싶으신가요?"
}
```


## Spec
> VectorDB: Milvus <br>
> Model: intfloat/multilingual-e5-base

```
Jiwoo-AI-Server
├─ .gitignore
├─ Dockerfile
├─ README.md
├─ app
│  ├─ __init__.py
│  ├─ api
│  │  └─ routes.py
│  ├─ chatbot.py
│  ├─ database.py
│  ├─ embeddings.py
│  ├─ models.py
│  └─ vector_store.py
├─ create_collection.py
├─ data
│  ├─ business_info.txt
│  ├─ side_projects.txt
│  └─ startup_guide.txt
├─ docker-compose.yml
├─ main.py
└─ requirements.txt

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