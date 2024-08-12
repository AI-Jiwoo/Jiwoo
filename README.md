# Jiwoo-AI

## Project Info
Python기반 VectorDB 유사도 검증 및 Jiwoo chat-bot서버입니다.
<br><br>
[주요 기능]<br>
- 입력받은 기업의 사업 정보를 저장하고 저장된 기업과 유사한 사업을 진행하는 기업의 데이터를 반환시켜줍니다.
- 입력받은 질문의 내용을 파악하고 사업자등록 및 창업을 할 수 있도록 가이드할 수 있는 답변을 제공합니다.


## 기능 명세서 (UPDATE 예정)

## API 명세서
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
            "businessStartDate": "1953-04-08",
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

> ## Similarity-Search
> URL: POST /similarity_search
```
# Request
{
  "query": "1인 창업자를 위한 마케팅 전략",
  "k": 3
}
```

```
# Response
[
  {
    "content": "1인 창업자를 위한 효과적인 마케팅 전략에는 소셜 미디어 활용, 콘텐츠 마케팅, 이메일 마케팅 등이 있습니다. 제한된 예산으로 최대의 효과를 얻기 위해서는 타겟 고객을 명확히 정의하고, 그들이 자주 사용하는 채널을 중심으로 마케팅 활동을 집중해야 합니다.",
    "metadata": {
      "source": "marketing_guide_for_solo_entrepreneurs.txt",
      "date_added": "2023-05-15"
    }
  },
  {
    "content": "1인 창업자의 마케팅에서 가장 중요한 것은 브랜딩입니다. 자신만의 독특한 브랜드 스토리를 만들고, 이를 일관되게 전달하는 것이 중요합니다. 개인의 전문성과 경험을 강조하여 신뢰를 구축하고, 고객과의 직접적인 소통을 통해 관계를 형성하세요.",
    "metadata": {
      "source": "personal_branding_tips.pdf",
      "date_added": "2023-07-22"
    }
  },
  {
    "content": "디지털 마케팅은 1인 창업자에게 매우 효과적인 전략입니다. SEO를 통한 웹사이트 최적화, 구글 애즈를 활용한 타겟 광고, 인플루언서 마케팅 등을 활용할 수 있습니다. 적은 비용으로 시작할 수 있는 이러한 방법들은 시간이 지남에 따라 큰 효과를 볼 수 있습니다.",
    "metadata": {
      "source": "digital_marketing_for_startups.docx",
      "date_added": "2023-09-03"
    }
  }
]
```


## Spec
> VectorDB: Milvus <br>
> Model: intfloat/multilingual-e5-base

```
Jiwoo-AI-Server
├─ .github
├─ .gitignore
├─ Dockerfile
├─ docker-compose.yml
├─ main.py
├─ requirements.txt
├─ README.md
├─ app
│  ├─ __init__.py
│  └─ api
│     └─ routes.py
├─ config
│  └─ settings.py
├─ services
│  ├─ chatbot.py
│  └─ models.py
└─ utils
   ├─ database.py
   ├─ embedding_utils.py
   ├─ vector_store.py
   └─ web_search.py

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
