from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import User, IAMRole, IAMPermission, RolePermission, AccessLog, ServiceDependency
from app.utils.auth import get_password_hash
from datetime import datetime, timedelta, timezone
import random

async def seed_database(db: AsyncSession):
    # Check if empty
    result = await db.execute(select(User))
    if result.scalars().first():
        return

    # Create Users
    users = [
        User(username="admin", email="admin@example.com", hashed_password=get_password_hash("admin123"), full_name="Security Admin", role="admin"),
        User(username="analyst1", email="analyst1@example.com", hashed_password=get_password_hash("pass"), full_name="Analyst One", role="analyst"),
        User(username="analyst2", email="analyst2@example.com", hashed_password=get_password_hash("pass"), full_name="Analyst Two", role="analyst"),
        User(username="dev1", email="dev1@example.com", hashed_password=get_password_hash("pass"), full_name="Dev One", role="viewer"),
        User(username="dev2", email="dev2@example.com", hashed_password=get_password_hash("pass"), full_name="Dev Two", role="viewer"),
        User(username="payment-service", email="payment@example.com", hashed_password=get_password_hash("pass"), full_name="Payment Service Account", role="viewer"),
        User(username="data-pipeline", email="data@example.com", hashed_password=get_password_hash("pass"), full_name="Data Pipeline Account", role="viewer"),
        User(username="auth-service", email="auth@example.com", hashed_password=get_password_hash("pass"), full_name="Auth Service Account", role="viewer"),
        User(username="monitor-service", email="monitor@example.com", hashed_password=get_password_hash("pass"), full_name="Monitor Service Account", role="viewer"),
        User(username="backup-admin", email="backup@example.com", hashed_password=get_password_hash("pass"), full_name="Backup Admin Account", role="viewer"),
    ]
    db.add_all(users)
    await db.commit()

    # Create Roles
    roles = [
        IAMRole(role_name="PaymentServiceRole", arn="arn:aws:iam::123456789012:role/PaymentServiceRole", service="Payment Processing", description="Role for payment processing service", trust_policy={}, total_permissions=12, used_permissions=5, unused_permissions=7, excessive_permissions=5, risk_score=85.0, risk_level="HIGH", status="needs_review", last_activity=datetime.now(timezone.utc)),
        IAMRole(role_name="DataPipelineRole", arn="arn:aws:iam::123456789012:role/DataPipelineRole", service="Data Pipeline", description="Role for data pipeline ETL", trust_policy={}, total_permissions=8, used_permissions=6, unused_permissions=2, excessive_permissions=1, risk_score=60.0, risk_level="MEDIUM", status="needs_review", last_activity=datetime.now(timezone.utc)),
        IAMRole(role_name="UserAuthRole", arn="arn:aws:iam::123456789012:role/UserAuthRole", service="Authentication", description="Role for user authentication service", trust_policy={}, total_permissions=8, used_permissions=7, unused_permissions=1, excessive_permissions=1, risk_score=75.0, risk_level="HIGH", status="needs_review", last_activity=datetime.now(timezone.utc)),
        IAMRole(role_name="MonitoringRole", arn="arn:aws:iam::123456789012:role/MonitoringRole", service="Monitoring", description="Role for monitoring service", trust_policy={}, total_permissions=6, used_permissions=6, unused_permissions=0, excessive_permissions=0, risk_score=20.0, risk_level="LOW", status="compliant", last_activity=datetime.now(timezone.utc)),
        IAMRole(role_name="AdminBackupRole", arn="arn:aws:iam::123456789012:role/AdminBackupRole", service="Backup & Admin", description="Role for backup and admin tasks", trust_policy={}, total_permissions=9, used_permissions=0, unused_permissions=9, excessive_permissions=9, risk_score=95.0, risk_level="CRITICAL", status="excessive", last_activity=None),
    ]
    db.add_all(roles)
    await db.commit()
    await db.refresh(roles[0])
    await db.refresh(roles[1])
    await db.refresh(roles[2])
    await db.refresh(roles[3])
    await db.refresh(roles[4])

    # Create Permissions
    perms_data = [
        ("s3:GetObject", "arn:aws:s3:::*", "Allow", "s3", False, False, "LOW", "Read objects"),
        ("s3:PutObject", "arn:aws:s3:::*", "Allow", "s3", False, False, "MEDIUM", "Write objects"),
        ("s3:DeleteObject", "arn:aws:s3:::*", "Allow", "s3", False, False, "HIGH", "Delete objects"),
        ("s3:*", "arn:aws:s3:::*", "Allow", "s3", True, False, "CRITICAL", "All S3 actions"),
        ("s3:ListBucket", "arn:aws:s3:::*", "Allow", "s3", False, False, "LOW", "List bucket"),
        ("dynamodb:GetItem", "arn:aws:dynamodb:*:*:table/*", "Allow", "dynamodb", False, False, "LOW", "Read items"),
        ("dynamodb:PutItem", "arn:aws:dynamodb:*:*:table/*", "Allow", "dynamodb", False, False, "MEDIUM", "Write items"),
        ("dynamodb:DeleteItem", "arn:aws:dynamodb:*:*:table/*", "Allow", "dynamodb", False, False, "HIGH", "Delete items"),
        ("dynamodb:Query", "arn:aws:dynamodb:*:*:table/*", "Allow", "dynamodb", False, False, "LOW", "Query items"),
        ("dynamodb:*", "arn:aws:dynamodb:*:*:table/*", "Allow", "dynamodb", True, False, "CRITICAL", "All Dynamo actions"),
        ("logs:PutLogEvents", "arn:aws:logs:*:*:log-group:*", "Allow", "cloudwatch", False, False, "LOW", "Write logs"),
        ("logs:GetLogEvents", "arn:aws:logs:*:*:log-group:*", "Allow", "cloudwatch", False, False, "LOW", "Read logs"),
        ("lambda:InvokeFunction", "arn:aws:lambda:*:*:function:*", "Allow", "lambda", False, False, "MEDIUM", "Invoke lambda"),
        ("lambda:CreateFunction", "arn:aws:lambda:*:*:function:*", "Allow", "lambda", False, False, "HIGH", "Create lambda"),
        ("lambda:*", "arn:aws:lambda:*:*:function:*", "Allow", "lambda", True, False, "CRITICAL", "All lambda actions"),
        ("ec2:DescribeInstances", "arn:aws:ec2:*:*:instance/*", "Allow", "ec2", False, False, "LOW", "Describe instances"),
        ("ec2:TerminateInstances", "arn:aws:ec2:*:*:instance/*", "Allow", "ec2", False, False, "HIGH", "Terminate instances"),
        ("ec2:*", "arn:aws:ec2:*:*:instance/*", "Allow", "ec2", True, False, "CRITICAL", "All ec2 actions"),
        ("iam:GetUser", "arn:aws:iam::*:user/*", "Allow", "iam", False, False, "LOW", "Get user"),
        ("iam:GetRole", "arn:aws:iam::*:role/*", "Allow", "iam", False, False, "LOW", "Get role"),
        ("iam:DeleteRole", "arn:aws:iam::*:role/*", "Allow", "iam", False, True, "CRITICAL", "Delete role"),
        ("iam:CreateUser", "arn:aws:iam::*:user/*", "Allow", "iam", False, True, "CRITICAL", "Create user"),
        ("iam:DeleteUser", "arn:aws:iam::*:user/*", "Allow", "iam", False, True, "CRITICAL", "Delete user"),
        ("iam:AttachRolePolicy", "arn:aws:iam::*:role/*", "Allow", "iam", False, True, "CRITICAL", "Attach policy"),
        ("iam:*", "arn:aws:iam::*", "Allow", "iam", True, True, "CRITICAL", "All iam actions"),
        ("cloudwatch:PutMetricData", "*", "Allow", "cloudwatch", False, False, "LOW", "Put metrics"),
        ("cloudwatch:GetMetricData", "*", "Allow", "cloudwatch", False, False, "LOW", "Get metrics"),
        ("cloudwatch:DescribeAlarms", "*", "Allow", "cloudwatch", False, False, "LOW", "Describe alarms"),
        ("cloudwatch:*", "*", "Allow", "cloudwatch", True, False, "CRITICAL", "All cloudwatch actions"),
        ("sns:Publish", "arn:aws:sns:*:*:*", "Allow", "sns", False, False, "MEDIUM", "Publish SNS"),
    ]
    perms = {}
    for pd in perms_data:
        p = IAMPermission(action=pd[0], resource=pd[1], effect=pd[2], service=pd[3], is_wildcard=pd[4], is_admin=pd[5], risk_level=pd[6], description=pd[7])
        db.add(p)
        perms[pd[0]] = p
    await db.commit()
    for p in perms.values(): await db.refresh(p)

    def add_rp(role, action, is_used, count, rec):
        return RolePermission(role_id=role.id, permission_id=perms[action].id, is_used=is_used, usage_count=count, last_used=datetime.now(timezone.utc) if is_used else None, recommendation=rec)

    # PaymentServiceRole
    rps = [
        add_rp(roles[0], "s3:GetObject", True, 1245, "KEEP"),
        add_rp(roles[0], "s3:PutObject", True, 834, "KEEP"),
        add_rp(roles[0], "s3:DeleteObject", False, 0, "REMOVE"),
        add_rp(roles[0], "s3:*", False, 0, "RESTRICT"),
        add_rp(roles[0], "ec2:*", False, 0, "REMOVE"),
        add_rp(roles[0], "iam:*", False, 0, "REMOVE"),
        add_rp(roles[0], "lambda:InvokeFunction", True, 456, "KEEP"),
        add_rp(roles[0], "dynamodb:GetItem", True, 2301, "KEEP"),
        add_rp(roles[0], "dynamodb:PutItem", True, 1122, "KEEP"),
        add_rp(roles[0], "dynamodb:DeleteItem", False, 0, "REMOVE"),
        add_rp(roles[0], "cloudwatch:PutMetricData", True, 5543, "KEEP"),
        add_rp(roles[0], "iam:GetRole", False, 0, "REMOVE"), # Intentionally unused but needed
    ]
    
    # DataPipelineRole
    rps += [
        add_rp(roles[1], "s3:GetObject", True, 3421, "KEEP"),
        add_rp(roles[1], "s3:PutObject", True, 2100, "KEEP"),
        add_rp(roles[1], "s3:ListBucket", True, 890, "KEEP"),
        add_rp(roles[1], "lambda:InvokeFunction", True, 1205, "KEEP"),
        add_rp(roles[1], "lambda:CreateFunction", False, 0, "REMOVE"),
        add_rp(roles[1], "ec2:DescribeInstances", True, 234, "KEEP"),
        add_rp(roles[1], "ec2:TerminateInstances", False, 0, "REMOVE"),
        add_rp(roles[1], "cloudwatch:GetMetricData", True, 1567, "KEEP"),
    ]
    
    # UserAuthRole
    rps += [
        add_rp(roles[2], "dynamodb:GetItem", True, 8900, "KEEP"),
        add_rp(roles[2], "dynamodb:PutItem", True, 4500, "KEEP"),
        add_rp(roles[2], "dynamodb:Query", True, 6700, "KEEP"),
        add_rp(roles[2], "iam:GetUser", True, 3400, "KEEP"),
        add_rp(roles[2], "iam:GetRole", True, 1200, "KEEP"),
        add_rp(roles[2], "iam:*", False, 0, "RESTRICT"),
        add_rp(roles[2], "lambda:InvokeFunction", True, 2300, "KEEP"),
        add_rp(roles[2], "sns:Publish", True, 1100, "KEEP"),
    ]
    
    # MonitoringRole
    rps += [
        add_rp(roles[3], "cloudwatch:GetMetricData", True, 12000, "KEEP"),
        add_rp(roles[3], "cloudwatch:PutMetricData", True, 8900, "KEEP"),
        add_rp(roles[3], "cloudwatch:DescribeAlarms", True, 3400, "KEEP"),
        add_rp(roles[3], "logs:GetLogEvents", True, 6700, "KEEP"),
        add_rp(roles[3], "logs:PutLogEvents", True, 4500, "KEEP"),
        add_rp(roles[3], "ec2:DescribeInstances", True, 2300, "KEEP"),
    ]
    
    # AdminBackupRole
    rps += [
        add_rp(roles[4], "s3:*", False, 2, "RESTRICT"),
        add_rp(roles[4], "ec2:*", False, 1, "RESTRICT"),
        add_rp(roles[4], "iam:*", False, 0, "REMOVE"),
        add_rp(roles[4], "dynamodb:*", False, 3, "RESTRICT"),
        add_rp(roles[4], "lambda:*", False, 0, "REMOVE"),
        add_rp(roles[4], "cloudwatch:*", False, 0, "REMOVE"),
        add_rp(roles[4], "iam:CreateUser", False, 0, "REMOVE"),
        add_rp(roles[4], "iam:DeleteUser", False, 0, "REMOVE"),
        add_rp(roles[4], "iam:AttachRolePolicy", False, 0, "REMOVE"),
    ]
    
    db.add_all(rps)
    await db.commit()

    # Access Logs
    logs = []
    now = datetime.now(timezone.utc)
    ips = ["10.0.1.5", "10.0.2.10", "192.168.1.100", "54.21.33.12"]
    regions = ["us-east-1", "us-west-2", "eu-west-1"]
    
    for rp in rps:
        if rp.is_used:
            for _ in range(5):
                logs.append(AccessLog(
                    role_id=rp.role_id,
                    permission_id=rp.permission_id,
                    action=perms[[k for k,v in perms.items() if v.id == rp.permission_id][0]].action,
                    resource="arn:aws:*",
                    timestamp=now - timedelta(days=random.randint(1, 80)),
                    source_ip=random.choice(ips),
                    user_agent="aws-cli/2.0",
                    status="success",
                    region=random.choice(regions)
                ))
    db.add_all(logs)
    await db.commit()

    # Service Dependencies
    deps = [
        ServiceDependency(source_service="Payment Service", target_service="Lambda", source_role_id=roles[0].id, dependency_type="invokes", required_permissions=["lambda:InvokeFunction"], description="Payment triggers lambda", is_critical=True),
        ServiceDependency(source_service="Payment Service", target_service="S3", source_role_id=roles[0].id, dependency_type="writes", required_permissions=["s3:GetObject", "s3:PutObject"], description="Payment stores receipts", is_critical=True),
        ServiceDependency(source_service="Payment Service", target_service="DynamoDB", source_role_id=roles[0].id, dependency_type="reads/writes", required_permissions=["dynamodb:GetItem", "dynamodb:PutItem"], description="Payment ledger", is_critical=True),
        ServiceDependency(source_service="Payment Service", target_service="CloudWatch", source_role_id=roles[0].id, dependency_type="writes", required_permissions=["cloudwatch:PutMetricData"], description="Metrics", is_critical=False),
        ServiceDependency(source_service="Payment Service", target_service="IAM", source_role_id=roles[0].id, dependency_type="reads", required_permissions=["iam:GetRole"], description="Needs GetRole for Lambda assume role process", is_critical=True),
        
        ServiceDependency(source_service="Data Pipeline", target_service="S3", source_role_id=roles[1].id, dependency_type="reads/writes", required_permissions=["s3:GetObject", "s3:PutObject", "s3:ListBucket"], description="Data lake", is_critical=True),
        ServiceDependency(source_service="Data Pipeline", target_service="Lambda", source_role_id=roles[1].id, dependency_type="invokes", required_permissions=["lambda:InvokeFunction"], description="Transform jobs", is_critical=True),
        ServiceDependency(source_service="Data Pipeline", target_service="EC2", source_role_id=roles[1].id, dependency_type="reads", required_permissions=["ec2:DescribeInstances"], description="Discovery", is_critical=False),
        
        ServiceDependency(source_service="Auth Service", target_service="DynamoDB", source_role_id=roles[2].id, dependency_type="reads/writes", required_permissions=["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query"], description="User DB", is_critical=True),
        ServiceDependency(source_service="Auth Service", target_service="IAM", source_role_id=roles[2].id, dependency_type="reads", required_permissions=["iam:GetUser", "iam:GetRole"], description="IAM sync", is_critical=True),
        ServiceDependency(source_service="Auth Service", target_service="Lambda", source_role_id=roles[2].id, dependency_type="invokes", required_permissions=["lambda:InvokeFunction"], description="Hooks", is_critical=False),
        ServiceDependency(source_service="Auth Service", target_service="SNS", source_role_id=roles[2].id, dependency_type="writes", required_permissions=["sns:Publish"], description="Alerts", is_critical=False),
        
        ServiceDependency(source_service="Monitoring", target_service="CloudWatch", source_role_id=roles[3].id, dependency_type="reads/writes", required_permissions=["cloudwatch:GetMetricData", "cloudwatch:PutMetricData", "cloudwatch:DescribeAlarms"], description="Dashboards", is_critical=True),
        ServiceDependency(source_service="Monitoring", target_service="CloudWatch Logs", source_role_id=roles[3].id, dependency_type="reads/writes", required_permissions=["logs:GetLogEvents", "logs:PutLogEvents"], description="Log aggregation", is_critical=True),
        ServiceDependency(source_service="Monitoring", target_service="EC2", source_role_id=roles[3].id, dependency_type="reads", required_permissions=["ec2:DescribeInstances"], description="Instance health", is_critical=True),
    ]
    db.add_all(deps)
    await db.commit()
