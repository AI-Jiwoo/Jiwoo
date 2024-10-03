import argparse
import os
from diagrams import Diagram, Edge, Cluster
from diagrams.aws.compute import EC2, ECS, Lambda
from diagrams.aws.database import RDS, Dynamodb, ElastiCache, Redshift
from diagrams.aws.network import ELB, APIGateway, CloudFront, Route53, VPC
from diagrams.aws.storage import S3
from diagrams.aws.security import IAM, Shield
from diagrams.aws.management import Cloudwatch, Cloudtrail
from diagrams.onprem.ci import GithubActions
from diagrams.onprem.vcs import Github
from diagrams.onprem.client import User
from diagrams.generic.database import SQL

# 공통 컴포넌트 정의
COMMON_COMPONENTS = {
    "security": ["IAM", "Shield"],  # 보안 관련 AWS 서비스
    "monitoring": ["Cloudwatch", "Cloudtrail"]  # 모니터링 및 로깅 서비스
}

# 기술 스택별로 추가될 컴포넌트 정의
TECHNOLOGY_COMPONENTS = {
    "serverless": ["Lambda", "APIGateway"],  # 서버리스 아키텍처
    "containers": ["ECS"],  # 컨테이너 서비스
    "react": ["S3", "CloudFront"],  # React 기반 프론트엔드 서비스
    "flutter": ["CloudFront"],  # Flutter 프론트엔드 서비스
    "milvus": ["Milvus"],  # Milvus 벡터 데이터베이스
    "microservices": ["ECS", "APIGateway", "RDS", "ElastiCache", "SQS", "SNS"],  # 마이크로서비스 아키텍처
    "database": ["RDS", "MariaDB"]  # 데이터베이스 서비스
}

# 공통 컴포넌트를 아키텍처에 추가하는 함수
def add_common_components(architecture):
    """
    공통 컴포넌트를 아키텍처에 추가
    """
    architecture["components"].extend(COMMON_COMPONENTS["security"])
    architecture["components"].extend(COMMON_COMPONENTS["monitoring"])

# 예산에 따라 추가할 컴포넌트를 설정하는 함수
def add_budget_based_components(architecture, budget):
    """
    예산에 따라 추가될 컴포넌트 설정
    """
    if budget > 10000:  # 예산이 $10,000 이상일 경우 Direct Connect 추가
        architecture["components"].append("Direct Connect")

# 프로젝트 요구사항을 분석하고 적절한 AWS 아키텍처를 생성하는 함수
def analyze_requirements(project_type, technologies, budget):
    """
    요구사항 분석 및 아키텍처 생성
    """
    architectures = []
    budget = float(budget)

    # 기본 아키텍처 생성 함수
    def create_architecture(name, base_components):
        architecture = {
            "name": name,
            "components": base_components.copy()
        }
        add_common_components(architecture)  # 공통 컴포넌트 추가
        add_budget_based_components(architecture, budget)  # 예산에 따른 추가 컴포넌트 설정
        return architecture

    # 프로젝트 유형이 풀스택인 경우
    if project_type == "full-stack":
        base_components = ["Route53", "CloudFront", "EC2", "RDS", "S3"]
        if "containers" in technologies:
            base_components.extend(TECHNOLOGY_COMPONENTS["containers"])
        if "serverless" in technologies:
            base_components.extend(TECHNOLOGY_COMPONENTS["serverless"])
        if "react" in technologies:
            base_components.extend(TECHNOLOGY_COMPONENTS["react"])
        if "flutter" in technologies:
            base_components.extend(TECHNOLOGY_COMPONENTS["flutter"])
        if "milvus" in technologies:
            base_components.append("Milvus")
        architectures.append(create_architecture("풀스택 애플리케이션", base_components))

    return architectures

# 다이어그램을 생성하는 함수
def generate_architecture_diagram(architecture, filename):
    """
    아키텍처 다이어그램 생성
    """
    os.environ["PATH"] += os.pathsep + '/usr/local/bin'
    os.environ["DIAGRAMS_FONT"] = "Arial"

    graph_attr = {
        "fontsize": "45",
        "bgcolor": "transparent",
        "dpi": "300"
    }
    
    with Diagram(architecture["name"], show=False, filename=filename, outformat="png", graph_attr=graph_attr):
        with Cluster("AWS Cloud"):
            components = {}
            
            # 각 컴포넌트별 인스턴스 생성
            for component in architecture["components"]:
                if component == "EC2":
                    components[component] = EC2("EC2")
                elif component == "RDS":
                    components[component] = RDS("RDS")
                elif component == "S3":
                    components[component] = S3("S3")
                elif component == "CloudFront":
                    components[component] = CloudFront("CloudFront")
                elif component == "Route53":
                    components[component] = Route53("Route53")
                elif component == "Docker":
                    components[component] = SQL("Docker")
                elif component == "Milvus":
                    components[component] = SQL("Milvus")
                elif component == "MariaDB":
                    components[component] = SQL("MariaDB")
                elif component == "IAM":
                    components[component] = IAM("IAM")
                elif component == "VPC":
                    components[component] = VPC("VPC")

            # 서비스 간 연결 설정
            components["Route53"] >> Edge(color="darkgreen") >> components["CloudFront"] >> Edge(color="darkgreen") >> components["S3"]
            components["CloudFront"] >> Edge(color="darkgreen") >> components["EC2"]
            components["EC2"] >> Edge(color="darkgreen") >> components["RDS"]
            components["EC2"] >> Edge(color="darkgreen") >> components["Milvus"]
            components["EC2"] >> Edge(color="darkgreen") >> components["MariaDB"]
            
            # CI/CD 파이프라인 설정
            with Cluster("CI/CD Pipeline"):
                actions = GithubActions("Github Actions")
                github = Github("Github")
                developer = User("Developer")
                
                developer >> github >> actions >> components["EC2"]

# 메인 함수
def main():
    """
    메인 함수: 명령줄 인자를 파싱하고 아키텍처 분석 및 다이어그램 생성
    """
    parser = argparse.ArgumentParser(description='AWS 아키텍처 생성')
    parser.add_argument('--project-type', required=True, help='프로젝트 유형')
    parser.add_argument('--scale', required=True, help='예상 프로젝트 규모 (small, medium, large)')
    parser.add_argument('--technologies', required=True, help='사용할 주요 기술 (쉼표로 구분)')
    parser.add_argument('--budget', required=True, type=float, help='예상 월 예산 (USD)')
    parser.add_argument('--performance-requirements', required=True, help='성능 요구사항 (쉼표로 구분)')
    args = parser.parse_args()

    project_type = args.project_type.lower()
    scale = args.scale.lower()
    technologies = [tech.strip().lower() for tech in args.technologies.split(',')]
    budget = args.budget
    performance_requirements = args.performance_requirements

    # 요구사항 분석 후 아키텍처 생성
    suggested_architectures = analyze_requirements(project_type, scale, technologies, budget, performance_requirements)

    # 각 아키텍처에 대해 다이어그램 생성
    for i, architecture in enumerate(suggested_architectures):
        generate_architecture_diagram(architecture, f'aws_architecture_{i+1}')
        print(f"{architecture['name']} 다이어그램 생성 완료: aws_architecture_{i+1}.png")


if __name__ == '__main__':
    main()
