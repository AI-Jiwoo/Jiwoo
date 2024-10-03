import argparse
import os
from diagrams import Diagram, Edge, Cluster
from diagrams.aws.compute import EC2, ECS, Lambda, ElasticBeanstalk, Fargate, EKS
from diagrams.aws.database import RDS, Dynamodb, ElastiCache, Redshift, Aurora
from diagrams.aws.network import ELB, APIGateway, CloudFront, Route53, VPC, DirectConnect
from diagrams.aws.storage import S3
from diagrams.aws.security import WAF, IAM, KMS, Shield
from diagrams.aws.integration import SQS, SNS
from diagrams.aws.analytics import Athena, EMR, Kinesis
from diagrams.aws.ml import Sagemaker
from diagrams.aws.management import Cloudwatch, Cloudtrail

# 공통 컴포넌트 정의
COMMON_COMPONENTS = {
    "security": ["WAF", "Shield", "KMS"],
    "monitoring": ["Cloudwatch", "Cloudtrail"],
    "basic": ["IAM", "VPC"]
}

# 성능 요구 사항에 따라 추가될 컴포넌트 정의
PERFORMANCE_REQUIREMENTS = {
    "high availability": ["RDS Multi-AZ", "EC2 Auto Scaling"],
    "high scalability": ["EC2 Auto Scaling"],
    "real-time processing": ["Kinesis", "Lambda"]
}

# 기술별로 추가될 컴포넌트 정의
TECHNOLOGY_COMPONENTS = {
    "serverless": ["Lambda", "API Gateway"],
    "containers": ["ECS", "ECR"],
    "react": ["S3", "CloudFront"],
    "flutter": ["Amplify", "API Gateway"],
    "microservices": ["ECS", "API Gateway", "RDS", "ElastiCache", "SQS", "SNS"],
    "machine learning": ["SageMaker", "S3", "EC2", "Athena", "EMR"],
    "big data": ["Kinesis", "EMR", "Redshift", "Athena", "S3"],
}

def add_common_components(architecture, scale, performance_requirements):
    """
    공통 컴포넌트 및 성능 요구 사항에 따른 컴포넌트 추가
    """
    architecture["components"].extend(COMMON_COMPONENTS["basic"])

    if "high security" in performance_requirements:
        architecture["components"].extend(COMMON_COMPONENTS["security"])

    if scale != "small":
        architecture["components"].extend(COMMON_COMPONENTS["monitoring"])

    for req in performance_requirements:
        if req in PERFORMANCE_REQUIREMENTS:
            architecture["components"].extend(PERFORMANCE_REQUIREMENTS[req])

def add_budget_based_components(architecture, budget):
    """
    예산에 따라 추가될 컴포넌트 설정
    """
    if budget > 10000:
        architecture["components"].extend(["Direct Connect", "AWS Global Accelerator"])
    elif budget > 5000:
        architecture["components"].append("AWS Global Accelerator")

def analyze_requirements(project_type, scale, technologies, budget, performance_requirements):
    """
    프로젝트 요구사항을 분석하고 적절한 AWS 아키텍처를 제안
    """
    architectures = []
    budget = float(budget)

    def create_architecture(name, base_components):
        architecture = {
            "name": name,
            "components": base_components.copy()
        }
        add_common_components(architecture, scale, performance_requirements)
        add_budget_based_components(architecture, budget)
        return architecture

    if project_type in ["web", "full-stack"]:
        base_components = ["Route53", "CloudFront", "ELB", "EC2 Auto Scaling", "RDS Multi-AZ", "ElastiCache", "S3"]
        if "serverless" in technologies or "containers" in technologies:
            base_components.extend(TECHNOLOGY_COMPONENTS["serverless"])
        if "containers" in technologies:
            base_components.extend(TECHNOLOGY_COMPONENTS["containers"])
        architectures.append(create_architecture(f"{project_type.capitalize()} 애플리케이션 아키텍처", base_components))

    if "microservices" in technologies:
        architectures.append(create_architecture("마이크로서비스 아키텍처", TECHNOLOGY_COMPONENTS["microservices"]))

    if project_type == "mobile":
        base_components = ["Amplify", "API Gateway", "Lambda", "DynamoDB", "S3", "Cognito"]
        if "push notifications" in technologies:
            base_components.append("SNS")
        architectures.append(create_architecture("모바일 백엔드 아키텍처", base_components))

    if "machine learning" in technologies:
        architectures.append(create_architecture("머신러닝 아키텍처", TECHNOLOGY_COMPONENTS["machine learning"]))

    if "big data" in technologies:
        architectures.append(create_architecture("빅데이터 처리 아키텍처", TECHNOLOGY_COMPONENTS["big data"]))

    if not architectures:
        architectures.append(create_architecture("기본 웹 아키텍처", ["EC2", "RDS"]))

    return architectures

def generate_architecture_diagram(architecture, filename):
    """
    주어진 아키텍처에 대한 다이어그램을 생성
    """
    os.environ["PATH"] += os.pathsep + '/usr/local/bin'
    os.environ["DIAGRAMS_FONT"] = "Arial"

    graph_attr = {
        "fontsize": "45",
        "bgcolor": "transparent",
        "dpi": "300",
        "fontname": "Arial",
        "splines": "ortho",
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
        outformat="png",
        graph_attr=graph_attr,
        node_attr=node_attr,
        edge_attr=edge_attr
    ):
        with Cluster("AWS 클라우드"):
            components = {}
            
            # 컴포넌트 인스턴스 생성
            for component in architecture["components"]:
                if component in globals():
                    components[component] = globals()[component](component)

            # 컴포넌트 간 연결 설정
            if "Route53" in components and "CloudFront" in components:
                components["Route53"] >> Edge(color="darkgreen") >> components["CloudFront"]
            elif "Route53" in components and "ELB" in components:
                components["Route53"] >> Edge(color="darkgreen") >> components["ELB"]

            if "CloudFront" in components:
                if "S3" in components:
                    components["CloudFront"] >> Edge(color="darkgreen") >> components["S3"]
                elif "API Gateway" in components:
                    components["CloudFront"] >> Edge(color="darkgreen") >> components["API Gateway"]
                else:
                    components["CloudFront"] >> Edge(color="darkgreen") >> components["ELB"]

            if "ELB" in components:
                elb_targets = [comp for comp in ["EC2 Auto Scaling", "ECS", "EKS"] if comp in components]
                for target in elb_targets:
                    components["ELB"] >> Edge(color="darkgreen") >> components[target]

            if "EC2 Auto Scaling" in components or "ECS" in components or "EKS" in components:
                compute_components = [comp for comp in ["EC2 Auto Scaling", "ECS", "EKS"] if comp in components]
                for comp in compute_components:
                    if "RDS Multi-AZ" in components:
                        components[comp] >> Edge(color="darkgreen") >> components["RDS Multi-AZ"]
                    if "DynamoDB" in components:
                        components[comp] >> Edge(color="darkgreen") >> components["DynamoDB"]
                    if "ElastiCache" in components:
                        components[comp] >> Edge(color="darkgreen") >> components["ElastiCache"]
                    if "S3" in components:
                        components[comp] >> Edge(color="darkgreen") >> components["S3"]

            if "API Gateway" in components:
                api_targets = [comp for comp in ["Lambda", "EC2 Auto Scaling", "ECS", "EKS"] if comp in components]
                for target in api_targets:
                    components["API Gateway"] >> Edge(color="darkgreen") >> components[target]

            if "VPC" in components:
                vpc_components = [comp for comp in ["EC2 Auto Scaling", "ECS", "EKS", "RDS Multi-AZ", "ElastiCache"] if comp in components]
                for comp in vpc_components:
                    components["VPC"] - Edge(color="darkblue", style="dashed") - components[comp]

            if "IAM" in components:
                iam_targets = [comp for comp in ["EC2 Auto Scaling", "ECS", "EKS", "S3", "DynamoDB", "RDS Multi-AZ"] if comp in components]
                for target in iam_targets:
                    components["IAM"] >> Edge(color="darkred", style="dashed") >> components[target]

            if "Cloudwatch" in components:
                cloudwatch_targets = [comp for comp in ["EC2 Auto Scaling", "ECS", "EKS", "RDS Multi-AZ", "DynamoDB", "ElastiCache"] if comp in components]
                for target in cloudwatch_targets:
                    components["Cloudwatch"] >> Edge(color="darkorange", style="dashed") >> components[target]
def main():
    """
    메인 함수: 명령줄 인자를 파싱하고 아키텍처 분석 및 다이어그램 생성을 수행
    """
    parser = argparse.ArgumentParser(description='AWS 최적화 아키텍처 생성')
    parser.add_argument('--project-type', required=True, help='프로젝트 유형 (예: web, full-stack, mobile)')
    parser.add_argument('--scale', required=True, help='예상 프로젝트 규모 (small, medium, large)')
    parser.add_argument('--technologies', required=True, help='사용할 주요 기술 (쉼표로 구분)')
    parser.add_argument('--budget', required=True, type=float, help='예상 월 예산 (USD)')
    parser.add_argument('--performance-requirements', required=True, help='성능 요구사항 (쉼표로 구분)')
    args = parser.parse_args()

    project_type = args.project_type.lower()
    scale = args.scale.lower()
    technologies = [tech.strip().lower() for tech in args.technologies.split(',')]
    budget = args.budget
    performance_requirements = [req.strip().lower() for req in args.performance_requirements.split(',')]

    suggested_architectures = analyze_requirements(
        project_type,
        scale,
        technologies,
        budget,
        performance_requirements
    )

    for i, architecture in enumerate(suggested_architectures):
        generate_architecture_diagram(architecture, f'aws_architecture_{i+1}')
        print(f"{architecture['name']}에 대한 다이어그램 생성: aws_architecture_{i+1}.png")

if __name__ == '__main__':
    main()
