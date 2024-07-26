FROM python:3.10-slim

# 빌드 도구 설치
RUN apt-get update && apt-get install -y gcc g++

# 환경 변수 설정
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 컨테이너 내 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 로컬 src 디렉토리의 내용을 컨테이너의 /app 디렉토리로 복사
COPY . /app/

# 컨테이너 시작 시 실행할 명령어
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]