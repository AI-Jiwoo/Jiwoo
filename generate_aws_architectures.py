import argparse
import os
from diagrams import Diagram, Edge, Cluster
from diagrams.aws.compute import EC2, ECS, Lambda, ElasticBeanstalk
from diagrams.aws.database import RDS, Dynamodb, ElastiCache
from diagrams.aws.network import ELB, APIGateway, CloudFront, Route53
from diagrams.aws.storage import S3
from diagrams.aws.security import WAF
from diagrams.aws.integration import SQS

def analyze_requirements(project_type, scale, technologies, budget, performance_requirements):
    """
    프로젝트 요구사항을 분석하고 적절한 AWS 아키텍처를 제안합니다.
    
    :param project_type: 프로젝트 유형 (예: web, mobile, backend)
    :param scale: 프로젝트 규모 (small, medium, large)
    :param technologies: 사용할 기술 리스트
    :param budget: 예상 월 예산 (USD)
    :param performance_requirements: 성능 요구사항 리스트
    :return: 제안된 아키텍처 리스트
    """
    architectures = []
    budget = float(budget)
    
    def add_common_components(arch):
        """공통 컴포넌트를 아키텍처에 추가합니다."""
        if "high security" in performance_requirements:
            arch["components"].append("WAF")
        if scale != "small":
            arch["components"].append("CloudWatch")
        return arch

    # 웹 프로젝트 아키텍처 선택
    if project_type == "web":
        if "high availability" in performance_requirements:
            if scale == "large" and budget > 10000:
                arch = {
                    "name": "고가용성 다중 AZ 웹 아키텍처",
                    "components": ["Route53", "CloudFront", "ELB", "EC2 Auto Scaling", "RDS Multi-AZ", "ElastiCache", "S3"]
                }
            else:
                arch = {
                    "name": "고가용성 웹 아키텍처",
                    "components": ["ELB", "EC2 Auto Scaling", "RDS"]
                }
            architectures.append(add_common_components(arch))
        
        if "low latency" in performance_requirements:
            arch = {
                "name": "저지연 웹 아키텍처",
                "components": ["CloudFront", "S3", "Lambda@Edge"]
            }
            if "dynamic content" in technologies:
                arch["components"].extend(["API Gateway", "Lambda"])
            architectures.append(add_common_components(arch))
    
    # 마이크로서비스 아키텍처 선택
    if "microservices" in technologies:
        if scale == "large" and budget > 15000:
            arch = {
                "name": "대규모 마이크로서비스 아키텍처",
                "components": ["ECS", "ECR", "API Gateway", "RDS", "ElastiCache", "SQS"]
            }
        else:
            arch = {
                "name": "마이크로서비스 아키텍처",
                "components": ["ECS", "ECR", "API Gateway", "RDS"]
            }
        architectures.append(add_common_components(arch))
    
    # 서버리스 아키텍처 선택
    if "serverless" in technologies:
        if "high performance" in performance_requirements and budget > 5000:
            arch = {
                "name": "고성능 서버리스 아키텍처",
                "components": ["API Gateway", "Lambda", "DynamoDB", "ElastiCache", "S3"]
            }
        else:
            arch = {
                "name": "기본 서버리스 아키텍처",
                "components": ["API Gateway", "Lambda", "DynamoDB"]
            }
        architectures.append(add_common_components(arch))
    
    # 모바일 백엔드 아키텍처 선택
    if project_type == "mobile":
        arch = {
            "name": "모바일 백엔드 아키텍처",
            "components": ["API Gateway", "Lambda", "DynamoDB", "S3"]
        }
        if "push notifications" in technologies:
            arch["components"].append("SNS")
        architectures.append(add_common_components(arch))
    
    # 머신러닝 아키텍처 선택
    if "machine learning" in technologies:
        arch = {
            "name": "머신러닝 아키텍처",
            "components": ["SageMaker", "S3", "EC2", "Lambda"]
        }
        architectures.append(add_common_components(arch))
    
    # 기본 웹 아키텍처 (다른 조건에 해당하지 않을 경우)
    if not architectures:
        architectures.append({
            "name": "기본 웹 아키텍처",
            "components": ["EC2", "RDS"]
        })
    
    return architectures

def generate_architecture_diagram(architecture, filename):
    """
    주어진 아키텍처에 대한 다이어그램을 생성합니다.
    
    :param architecture: 아키텍처 정보를 담은 딕셔너리
    :param filename: 생성될 다이어그램 파일 이름
    """
    # Graphviz 설정
    os.environ["PATH"] += os.pathsep + '/usr/local/bin'  # Graphviz 경로 추가
    os.environ["DIAGRAMS_FONT"] = "Arial"  # 시스템에 설치된 폰트 사용

    graph_attr = {
        "fontsize": "45",
        "bgcolor": "transparent",
        "dpi": "300",  # 해상도 증가
        "fontname": "Arial",
        "splines": "ortho",  # 직각 연결선 사용
    }
    
    node_attr = {
        "fontsize": "14",
        "fontname": "Arial",
    }
    
    edge_attr = {
        "fontsize": "12",
        "fontname": "Arial",
    }

    with Diagram(
        architecture["name"],
        show=False,
        filename=filename,
        outformat="png",  # PNG 형식 사용
        graph_attr=graph_attr,
        node_attr=node_attr,
        edge_attr=edge_attr
    ):
        with Cluster("AWS 클라우드"):
            components = {}
            # 각 컴포넌트에 대한 다이어그램 객체 생성
            for component in architecture["components"]:
                if component == "ELB":
                    components[component] = ELB("로드 밸런서")
                elif component == "EC2" or component == "EC2 Auto Scaling":
                    components[component] = EC2("웹 서버")
                elif component == "RDS" or component == "RDS Multi-AZ":
                    components[component] = RDS("데이터베이스")
                elif component == "ElastiCache":
                    components[component] = ElastiCache("캐시")
                elif component == "S3":
                    components[component] = S3("스토리지")
                elif component == "CloudFront":
                    components[component] = CloudFront("CDN")
                elif component == "API Gateway":
                    components[component] = APIGateway("API 게이트웨이")
                elif component == "Lambda" or component == "Lambda@Edge":
                    components[component] = Lambda("함수")
                elif component == "DynamoDB":
                    components[component] = Dynamodb("NoSQL DB")
                elif component == "WAF":
                    components[component] = WAF("웹 애플리케이션 방화벽")
                elif component == "Route53":
                    components[component] = Route53("DNS")
                elif component == "ECS":
                    components[component] = ECS("컨테이너 서비스")
                elif component == "SQS":
                    components[component] = SQS("메시지 큐")
            
            # 컴포넌트 간 연결
            if "Route53" in components:
                route53_target = components.get("CloudFront") or components.get("ELB") or next(iter(components.values()))
                components["Route53"] >> Edge(color="darkgreen") >> route53_target
            
            if "CloudFront" in components:
                cf_target = components.get("S3") or components.get("API Gateway") or next(iter(components.values()))
                components["CloudFront"] >> Edge(color="darkgreen") >> cf_target
            
            if "ELB" in components and "EC2" in components:
                components["ELB"] >> Edge(color="darkgreen") >> components["EC2"]
            
            if "EC2" in components and "RDS" in components:
                components["EC2"] >> Edge(color="darkgreen") >> components["RDS"]
            
            if "API Gateway" in components and "Lambda" in components:
                components["API Gateway"] >> Edge(color="darkgreen") >> components["Lambda"]
            
            if "Lambda" in components and "DynamoDB" in components:
                components["Lambda"] >> Edge(color="darkgreen") >> components["DynamoDB"]
            
            if "ElastiCache" in components:
                cache_source = components.get("EC2") or components.get("Lambda")
                if cache_source:
                    cache_source >> Edge(color="darkgreen") >> components["ElastiCache"]
            
            if "SQS" in components:
                sqs_source = components.get("EC2") or components.get("Lambda")
                if sqs_source:
                    sqs_source >> Edge(color="darkgreen", style="dotted") >> components["SQS"]

def main():
    """
    메인 함수: 명령줄 인자를 파싱하고 아키텍처 분석 및 다이어그램 생성을 수행합니다.
    """
    # 명령줄 인자 파싱
    parser = argparse.ArgumentParser(description='AWS 최적화 아키텍처 생성')
    parser.add_argument('--project-type', required=True, help='프로젝트 유형 (예: web, mobile, backend)')
    parser.add_argument('--scale', required=True, help='예상 프로젝트 규모 (small, medium, large)')
    parser.add_argument('--technologies', required=True, help='사용할 주요 기술 (쉼표로 구분)')
    parser.add_argument('--budget', required=True, help='예상 월 예산 (USD)')
    parser.add_argument('--performance-requirements', required=True, help='성능 요구사항 (쉼표로 구분)')
    args = parser.parse_args()

    # 입력값 처리 및 기본값 설정
    project_type = args.project_type.lower()
    scale = args.scale.lower()
    technologies = [tech.strip().lower() for tech in args.technologies.split(',')]
    try:
        budget = float(args.budget)
    except ValueError:
        print(f"Warning: Invalid budget value '{args.budget}'. Using default value of 1000.")
        budget = 1000.0
    performance_requirements = [req.strip().lower() for req in args.performance_requirements.split(',')]

    # 요구사항 분석 및 아키텍처 제안
    suggested_architectures = analyze_requirements(
        project_type,
        scale,
        technologies,
        budget,
        performance_requirements
    )

    # 제안된 아키텍처에 대한 다이어그램 생성
    for i, architecture in enumerate(suggested_architectures):
        generate_architecture_diagram(architecture, f'aws_architecture_{i+1}')
        print(f"{architecture['name']}에 대한 다이어그램 생성: aws_architecture_{i+1}.png")

if __name__ == '__main__':
    main()