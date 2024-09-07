import argparse
import os
from diagrams import Diagram, Edge, Cluster
from diagrams.aws.compute import EC2, ECS, Lambda, ElasticBeanstalk, Fargate, EKS
from diagrams.aws.database import RDS, Dynamodb, ElastiCache, Redshift, Aurora
from diagrams.aws.network import ELB, APIGateway, CloudFront, Route53, VPC, DirectConnect
from diagrams.aws.storage import S3, EFS, FSx
from diagrams.aws.security import WAF, IAM, KMS, Shield
from diagrams.aws.integration import SQS, SNS, EventBridge
from diagrams.aws.analytics import Athena, EMR, Kinesis
from diagrams.aws.ml import SageMaker
from diagrams.aws.devtools import CodePipeline, CodeBuild, CodeDeploy
from diagrams.aws.mobile import Amplify

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
            arch["components"].extend(["WAF", "Shield", "KMS"])
        if scale != "small":
            arch["components"].extend(["CloudWatch", "CloudTrail"])
        arch["components"].extend(["IAM", "VPC"])
        return arch

    def add_budget_based_components(arch):
        """예산에 따라 추가 컴포넌트를 아키텍처에 추가합니다."""
        if budget > 10000:
            arch["components"].extend(["Direct Connect", "AWS Global Accelerator"])
        elif budget > 5000:
            arch["components"].append("AWS Global Accelerator")
        return arch

    # 웹 프로젝트 아키텍처 선택
    if project_type == "web":
        arch = {
            "name": "웹 애플리케이션 아키텍처",
            "components": ["Route53", "CloudFront", "ELB", "EC2 Auto Scaling", "RDS Multi-AZ", "ElastiCache", "S3"]
        }
        if "serverless" in technologies:
            arch["components"].extend(["Lambda", "API Gateway"])
        if "containers" in technologies:
            arch["components"].extend(["ECS", "ECR"])
        if scale == "large":
            arch["components"].extend(["Aurora", "DynamoDB"])
        architectures.append(add_common_components(add_budget_based_components(arch)))

    # 마이크로서비스 아키텍처 선택
    if "microservices" in technologies:
        arch = {
            "name": "마이크로서비스 아키텍처",
            "components": ["EKS" if budget > 10000 else "ECS", "ECR", "API Gateway", "RDS", "ElastiCache", "SQS", "SNS"]
        }
        if "serverless" in technologies:
            arch["components"].extend(["Lambda", "Step Functions"])
        architectures.append(add_common_components(add_budget_based_components(arch)))

    # 모바일 백엔드 아키텍처 선택
    if project_type == "mobile":
        arch = {
            "name": "모바일 백엔드 아키텍처",
            "components": ["Amplify", "API Gateway", "Lambda", "DynamoDB", "S3", "Cognito"]
        }
        if "push notifications" in technologies:
            arch["components"].append("SNS")
        architectures.append(add_common_components(add_budget_based_components(arch)))

    # 머신러닝 아키텍처 선택
    if "machine learning" in technologies:
        arch = {
            "name": "머신러닝 아키텍처",
            "components": ["SageMaker", "S3", "EC2", "Lambda", "Athena", "EMR"]
        }
        architectures.append(add_common_components(add_budget_based_components(arch)))

    # 빅데이터 아키텍처 선택
    if "big data" in technologies:
        arch = {
            "name": "빅데이터 처리 아키텍처",
            "components": ["Kinesis", "EMR", "Redshift", "Athena", "S3", "QuickSight"]
        }
        architectures.append(add_common_components(add_budget_based_components(arch)))

    # 실시간 처리 요구사항 반영
    if "real-time processing" in performance_requirements:
        for arch in architectures:
            arch["components"].extend(["Kinesis", "Lambda"])

    # 고가용성 요구사항 반영
    if "high availability" in performance_requirements:
        for arch in architectures:
            if "RDS" in arch["components"]:
                arch["components"].remove("RDS")
                arch["components"].append("RDS Multi-AZ")

    # 기본 웹 아키텍처 (다른 조건에 해당하지 않을 경우)
    if not architectures:
        architectures.append(add_common_components({
            "name": "기본 웹 아키텍처",
            "components": ["EC2", "RDS"]
        }))
    
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
                elif component == "Lambda":
                    components[component] = Lambda("Lambda 함수")
                elif component == "DynamoDB":
                    components[component] = Dynamodb("NoSQL DB")
                elif component == "WAF":
                    components[component] = WAF("웹 애플리케이션 방화벽")
                elif component == "Route53":
                    components[component] = Route53("DNS")
                elif component == "ECS":
                    components[component] = ECS("컨테이너 서비스")
                elif component == "EKS":
                    components[component] = EKS("Kubernetes 서비스")
                elif component == "SQS":
                    components[component] = SQS("메시지 큐")
                elif component == "SNS":
                    components[component] = SNS("알림 서비스")
                elif component == "Kinesis":
                    components[component] = Kinesis("실시간 데이터 스트리밍")
                elif component == "SageMaker":
                    components[component] = SageMaker("기계 학습 플랫폼")
                # 새로 추가된 서비스들에 대한 객체 생성 로직 추가
                # ...

            # 컴포넌트 간 연결 로직
if "Route53" in components:
    route53_target = components.get("CloudFront") or components.get("ELB") or components.get("API Gateway") or next(iter(components.values()))
    components["Route53"] >> Edge(color="darkgreen") >> route53_target

if "CloudFront" in components:
    cf_target = components.get("S3") or components.get("API Gateway") or components.get("ELB") or next(iter(components.values()))
    components["CloudFront"] >> Edge(color="darkgreen") >> cf_target

if "ELB" in components:
    elb_targets = [comp for comp in ["EC2", "ECS", "EKS"] if comp in components]
    for target in elb_targets:
        components["ELB"] >> Edge(color="darkgreen") >> components[target]

if "API Gateway" in components:
    api_targets = [comp for comp in ["Lambda", "EC2", "ECS", "EKS"] if comp in components]
    for target in api_targets:
        components["API Gateway"] >> Edge(color="darkgreen") >> components[target]

compute_components = ["EC2", "ECS", "EKS", "Lambda"]
for comp in compute_components:
    if comp in components:
        if "RDS" in components:
            components[comp] >> Edge(color="darkgreen") >> components["RDS"]
        if "DynamoDB" in components:
            components[comp] >> Edge(color="darkgreen") >> components["DynamoDB"]
        if "ElastiCache" in components:
            components[comp] >> Edge(color="darkgreen") >> components["ElastiCache"]
        if "S3" in components:
            components[comp] >> Edge(color="darkgreen") >> components["S3"]

if "SQS" in components:
    sqs_sources = [comp for comp in compute_components if comp in components]
    for source in sqs_sources:
        components[source] >> Edge(color="darkgreen", style="dotted") >> components["SQS"]

if "SNS" in components:
    sns_sources = [comp for comp in compute_components if comp in components]
    for source in sns_sources:
        components[source] >> Edge(color="darkgreen", style="dotted") >> components["SNS"]

if "Kinesis" in components:
    kinesis_sources = [comp for comp in compute_components if comp in components]
    for source in kinesis_sources:
        components[source] >> Edge(color="darkgreen", style="dotted") >> components["Kinesis"]
    if "Lambda" in components:
        components["Kinesis"] >> Edge(color="darkgreen") >> components["Lambda"]

if "SageMaker" in components and "S3" in components:
    components["SageMaker"] >> Edge(color="darkgreen") >> components["S3"]

if "EMR" in components and "S3" in components:
    components["EMR"] >> Edge(color="darkgreen") >> components["S3"]

if "Redshift" in components:
    if "S3" in components:
        components["S3"] >> Edge(color="darkgreen") >> components["Redshift"]
    if "EMR" in components:
        components["EMR"] >> Edge(color="darkgreen") >> components["Redshift"]

if "Amplify" in components and "API Gateway" in components:
    components["Amplify"] >> Edge(color="darkgreen") >> components["API Gateway"]

if "WAF" in components:
    waf_targets = [comp for comp in ["CloudFront", "API Gateway", "ELB"] if comp in components]
    for target in waf_targets:
        components["WAF"] >> Edge(color="red", style="bold") >> components[target]

if "Shield" in components:
    shield_targets = [comp for comp in ["Route53", "CloudFront", "ELB"] if comp in components]
    for target in shield_targets:
        components["Shield"] >> Edge(color="red", style="bold") >> components[target]

if "VPC" in components:
    vpc_components = [comp for comp in ["EC2", "ECS", "EKS", "RDS", "ElastiCache"] if comp in components]
    for comp in vpc_components:
        components["VPC"] - Edge(color="darkblue", style="dashed") - components[comp]

if "IAM" in components:
    iam_targets = [comp for comp in compute_components + ["S3", "DynamoDB", "RDS"] if comp in components]
    for target in iam_targets:
        components["IAM"] >> Edge(color="darkred", style="dashed") >> components[target]

if "CloudWatch" in components:
    cloudwatch_targets = [comp for comp in compute_components + ["RDS", "DynamoDB", "ElastiCache"] if comp in components]
    for target in cloudwatch_targets:
        components["CloudWatch"] >> Edge(color="darkorange", style="dashed") >> components[target]

def main():
    """
    메인 함수: 명령줄 인자를 파싱하고 아키텍처 분석 및 다이어그램 생성을 수행합니다.
    """
    # 명령줄 인자 파싱
    parser = argparse.ArgumentParser(description='AWS 최적화 아키텍처 생성')
    parser.add_argument('--project-type', required=True, help='프로젝트 유형 (예: web, mobile, backend)')
    parser.add_argument('--scale', required=True, help='예상 프로젝트 규모 (small, medium, large)')
    parser.add_argument('--technologies', required=True, help='사용할 주요 기술 (쉼표로 구분)')
    parser.add_argument('--budget', required=True, type=float, help='예상 월 예산 (USD)')
    parser.add_argument('--performance-requirements', required=True, help='성능 요구사항 (쉼표로 구분)')
    args = parser.parse_args()

    # 입력값 처리
    project_type = args.project_type.lower()
    scale = args.scale.lower()
    technologies = [tech.strip().lower() for tech in args.technologies.split(',')]
    budget = args.budget
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