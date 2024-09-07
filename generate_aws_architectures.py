import argparse
import os
from diagrams import Diagram, Edge, Cluster
from diagrams.aws.compute import EC2, ECS, Lambda, ElasticBeanstalk, Fargate, EKS
from diagrams.aws.database import RDS, Dynamodb, ElastiCache, Redshift, Aurora
from diagrams.aws.network import ELB, APIGateway, CloudFront, Route53, VPC, DirectConnect
from diagrams.aws.storage import S3, EFS, FSx
from diagrams.aws.security import WAF, IAM, KMS, Shield
from diagrams.aws.integration import SQS, SNS, Eventbridge
from diagrams.aws.analytics import Athena, EMR, Kinesis
from diagrams.aws.ml import Sagemaker
from diagrams.aws.devtools import Codepipeline, Codebuild, Codedeploy
from diagrams.aws.mobile import Amplify
from diagrams.aws.management import Cloudwatch, Cloudtrail

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
        if "high security" in performance_requirements:
            arch["components"].extend(["WAF", "Shield", "KMS"])
        if scale != "small":
            arch["components"].extend(["Cloudwatch", "Cloudtrail"])
        arch["components"].extend(["IAM", "VPC"])
        return arch

    def add_budget_based_components(arch):
        if budget > 10000:
            arch["components"].extend(["Direct Connect", "AWS Global Accelerator"])
        elif budget > 5000:
            arch["components"].append("AWS Global Accelerator")
        return arch

    if project_type in ["web", "full-stack"]:
        arch = {
            "name": f"{project_type.capitalize()} 애플리케이션 아키텍처",
            "components": ["Route53", "CloudFront", "ELB", "EC2 Auto Scaling", "RDS Multi-AZ", "ElastiCache", "S3"]
        }
        if "serverless" in technologies:
            arch["components"].extend(["Lambda", "API Gateway"])
        if "containers" in technologies or "docker" in technologies:
            arch["components"].extend(["ECS", "ECR"])
        if scale == "large":
            arch["components"].extend(["Aurora", "DynamoDB"])
        if "react" in technologies:
            arch["components"].extend(["S3", "CloudFront"])
        if "flutter" in technologies:
            arch["components"].extend(["Amplify", "API Gateway"])
        architectures.append(add_common_components(add_budget_based_components(arch)))

    if "microservices" in technologies:
        arch = {
            "name": "마이크로서비스 아키텍처",
            "components": ["EKS" if budget > 10000 else "ECS", "ECR", "API Gateway", "RDS", "ElastiCache", "SQS", "SNS"]
        }
        if "serverless" in technologies:
            arch["components"].extend(["Lambda", "Step Functions"])
        architectures.append(add_common_components(add_budget_based_components(arch)))

    if project_type == "mobile":
        arch = {
            "name": "모바일 백엔드 아키텍처",
            "components": ["Amplify", "API Gateway", "Lambda", "DynamoDB", "S3", "Cognito"]
        }
        if "push notifications" in technologies:
            arch["components"].append("SNS")
        architectures.append(add_common_components(add_budget_based_components(arch)))

    if "machine learning" in technologies:
        arch = {
            "name": "머신러닝 아키텍처",
            "components": ["SageMaker", "S3", "EC2", "Lambda", "Athena", "EMR"]
        }
        architectures.append(add_common_components(add_budget_based_components(arch)))

    if "big data" in technologies:
        arch = {
            "name": "빅데이터 처리 아키텍처",
            "components": ["Kinesis", "EMR", "Redshift", "Athena", "S3", "QuickSight"]
        }
        architectures.append(add_common_components(add_budget_based_components(arch)))

    if "real-time processing" in performance_requirements or "real-time interaction" in performance_requirements:
        for arch in architectures:
            arch["components"].extend(["Kinesis", "Lambda"])

    if "high availability" in performance_requirements or "high scalability" in performance_requirements:
        for arch in architectures:
            if "RDS" in arch["components"]:
                arch["components"].remove("RDS")
                arch["components"].append("RDS Multi-AZ")
            if "EC2" in arch["components"] and "EC2 Auto Scaling" not in arch["components"]:
                arch["components"].remove("EC2")
                arch["components"].append("EC2 Auto Scaling")

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
            for component in architecture["components"]:
                if component == "ELB":
                    components[component] = ELB("로드 밸런서")
                elif component == "EC2" or component == "EC2 Auto Scaling":
                    components[component] = EC2("EC2 Auto Scaling")
                elif component == "RDS" or component == "RDS Multi-AZ":
                    components[component] = RDS("RDS Multi-AZ")
                elif component == "ElastiCache":
                    components[component] = ElastiCache("ElastiCache")
                elif component == "S3":
                    components[component] = S3("S3")
                elif component == "CloudFront":
                    components[component] = CloudFront("CloudFront")
                elif component == "API Gateway":
                    components[component] = APIGateway("API Gateway")
                elif component == "Lambda":
                    components[component] = Lambda("Lambda")
                elif component == "DynamoDB":
                    components[component] = Dynamodb("DynamoDB")
                elif component == "WAF":
                    components[component] = WAF("WAF")
                elif component == "Route53":
                    components[component] = Route53("Route53")
                elif component == "ECS":
                    components[component] = ECS("ECS")
                elif component == "EKS":
                    components[component] = EKS("EKS")
                elif component == "SQS":
                    components[component] = SQS("SQS")
                elif component == "SNS":
                    components[component] = SNS("SNS")
                elif component == "Kinesis":
                    components[component] = Kinesis("Kinesis")
                elif component == "Sagemaker":
                    components[component] = Sagemaker("Sagemaker")
                elif component == "Aurora":
                    components[component] = Aurora("Aurora")
                elif component == "Amplify":
                    components[component] = Amplify("Amplify")
                elif component == "Shield":
                    components[component] = Shield("Shield")
                elif component == "KMS":
                    components[component] = KMS("KMS")
                elif component == "IAM":
                    components[component] = IAM("IAM")
                elif component == "VPC":
                    components[component] = VPC("VPC")
                elif component == "Cloudwatch":
                    components[component] = Cloudwatch("Cloudwatch")
                elif component == "Cloudtrail":
                    components[component] = Cloudtrail("Cloudtrail")
                elif component == "Direct Connect":
                    components[component] = DirectConnect("Direct Connect")
                elif component == "Eventbridge":
                    components[component] = Eventbridge("Eventbridge")
                elif component == "Athena":
                    components[component] = Athena("Athena")
                elif component == "EMR":
                    components[component] = EMR("EMR")
                elif component == "Redshift":
                    components[component] = Redshift("Redshift")

            # 컴포넌트 간 연결 로직
            if "Route53" in components:
                components["Route53"] >> Edge(color="darkgreen") >> components.get("CloudFront", components.get("ELB", next(iter(components.values()))))
            
            if "CloudFront" in components:
                components["CloudFront"] >> Edge(color="darkgreen") >> components.get("S3", components.get("API Gateway", components.get("ELB", next(iter(components.values())))))
            
            if "ELB" in components:
                elb_targets = [comp for comp in ["EC2 Auto Scaling", "ECS", "EKS"] if comp in components]
                for target in elb_targets:
                    components["ELB"] >> Edge(color="darkgreen") >> components[target]
            
            compute_components = ["EC2 Auto Scaling", "ECS", "EKS", "Lambda"]
            for comp in compute_components:
                if comp in components:
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
            
            if "WAF" in components:
                waf_targets = [comp for comp in ["CloudFront", "API Gateway", "ELB"] if comp in components]
                for target in waf_targets:
                    components["WAF"] >> Edge(color="red", style="bold") >> components[target]

            if "Shield" in components:
                shield_targets = [comp for comp in ["Route53", "CloudFront", "ELB"] if comp in components]
                for target in shield_targets:
                    components["Shield"] >> Edge(color="red", style="bold") >> components[target]

            if "VPC" in components:
                vpc_components = [comp for comp in ["EC2 Auto Scaling", "ECS", "EKS", "RDS Multi-AZ", "ElastiCache"] if comp in components]
                for comp in vpc_components:
                    components["VPC"] - Edge(color="darkblue", style="dashed") - components[comp]

            if "IAM" in components:
                iam_targets = [comp for comp in compute_components + ["S3", "DynamoDB", "RDS Multi-AZ"] if comp in components]
                for target in iam_targets:
                    components["IAM"] >> Edge(color="darkred", style="dashed") >> components[target]

            if "Cloudwatch" in components:
                cloudwatch_targets = [comp for comp in compute_components + ["RDS Multi-AZ", "DynamoDB", "ElastiCache"] if comp in components]
                for target in cloudwatch_targets:
                    components["Cloudwatch"] >> Edge(color="darkorange", style="dashed") >> components[target]

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

            if "KMS" in components:
                kms_targets = [comp for comp in ["S3", "RDS Multi-AZ", "DynamoDB"] if comp in components]
                for target in kms_targets:
                    components["KMS"] >> Edge(color="darkred", style="dashed") >> components[target]

            if "Cloudtrail" in components and "S3" in components:
                components["Cloudtrail"] >> Edge(color="darkorange", style="dashed") >> components["S3"]

            if "Direct Connect" in components and "VPC" in components:
                components["Direct Connect"] >> Edge(color="darkblue") >> components["VPC"]

            if "ECR" in components:
                ecr_targets = [comp for comp in ["ECS", "EKS"] if comp in components]
                for target in ecr_targets:
                    components["ECR"] >> Edge(color="darkgreen") >> components[target]

            if "Step Functions" in components and "Lambda" in components:
                components["Step Functions"] >> Edge(color="darkgreen") >> components["Lambda"]

            if "Cognito" in components:
                cognito_targets = [comp for comp in ["API Gateway", "Lambda"] if comp in components]
                for target in cognito_targets:
                    components["Cognito"] >> Edge(color="darkgreen") >> components[target]

            if "Athena" in components and "S3" in components:
                components["Athena"] >> Edge(color="darkgreen") >> components["S3"]

            if "QuickSight" in components:
                quicksight_targets = [comp for comp in ["Athena", "Redshift", "S3"] if comp in components]
                for target in quicksight_targets:
                    components["QuickSight"] >> Edge(color="darkgreen") >> components[target]

def main():
    """
    메인 함수: 명령줄 인자를 파싱하고 아키텍처 분석 및 다이어그램 생성을 수행합니다.
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