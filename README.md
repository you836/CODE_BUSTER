# 🛡️ Autonomous Cloud IAM Least-Privilege Mitigator

[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/release/python-3110/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## Overview

**Autonomous Cloud IAM Least-Privilege Mitigator** is an AI-powered cybersecurity platform that autonomously analyzes cloud IAM (Identity and Access Management) permissions, identifies excessive or unused permissions, creates least-privilege policies, simulates changes, analyzes failures, automatically revises policies, and verifies that required access is strictly preserved.

In enterprise cloud infrastructures, permissions accumulate over time—leading to widespread over-privileged roles, excessive wildcard permissions (`*`), and severe compliance drift. This platform solves the least-privilege problem by combining an autonomous feedback loop with deterministic fallback rules and optional LLM intelligence.

---

## Key Features

- **Autonomous IAM Analysis & Mitigation Workflow**: Identifies over-privileged roles, evaluates historic CloudTrail activity against policy permissions, and synthesizes scoped policies.
- **AI-Powered Policy Generation with Deterministic Fallback**: Leverages LLMs (OpenAI-compatible) to suggest precise IAM policies with automated fallback to deterministic rule-based algorithms when AI is disabled.
- **Policy Simulation & Failure Analysis**: Dry-runs proposed policies against historic and synthetic access patterns to intercept breaking denials before policy enforcement.
- **Autonomous Policy Revision Loop**: Iteratively re-evaluates simulated failures, refines action and resource definitions, and converges on an optimal policy within configurable iteration limits.
- **Service Dependency Graph Visualization**: Interactive node graph mapping IAM identities, roles, cloud services (S3, DynamoDB, Lambda, RDS, SQS), and access pathways.
- **Interactive Cybersecurity Dashboard**: Real-time visibility into least-privilege coverage, excessive wildcards, risk scores, and remediation statuses.
- **Complete Audit Trail & Evidence**: Full transparency for SecOps and compliance teams with detailed event history, rationale logs, and policy diffs.
- **PDF Report Generation**: Export executive summaries, risk posture assessments, and audit trails into structured compliance reports.
- **Secure JWT Authentication**: Role-based access control with bcrypt password hashing and token expiry.
- **Docker Deployment**: Fully containerized environment with Docker Compose for one-command orchestration.

---

## Architecture

The platform follows a modern microservices architecture with a decoupled frontend, high-performance async backend, relational database for audit logs and IAM definitions, and an autonomous policy analysis engine.

```mermaid
flowchart TD
    subgraph Client ["Frontend Layer"]
        UI["React 18 + Vite SPA<br/>(Tailwind CSS, React Flow, Recharts)"]
    end

    subgraph Gateway ["Reverse Proxy"]
        Nginx["Nginx Reverse Proxy<br/>(Port 3000)"]
    end

    subgraph BackendApp ["Backend Layer (FastAPI)"]
        API["FastAPI App (Port 8000)"]
        Auth["JWT Authentication & RBAC"]
        Analyzer["IAM Permission Analyzer"]
        Simulator["Policy Simulator Engine"]
        Reporter["PDF Report Generator"]
        
        subgraph MitigationEngine ["Autonomous Mitigation Agent"]
            LLM["AI Agent (OpenAI LLM)"]
            Fallback["Deterministic Rule Engine"]
            FeedbackLoop["Iterative Revision Loop"]
        end
    end

    subgraph Storage ["Persistence Layer"]
        Postgres[("PostgreSQL 16 Database<br/>(AsyncPG + SQLAlchemy 2.0)")]
    end

    subgraph CloudLayer ["Cloud Provider (Simulated / Live)"]
        IAMData["IAM Roles & Policies"]
        CloudTrail["Activity Logs / Telemetry"]
    end

    UI -->|HTTP / REST| Nginx
    Nginx -->|/api/*| API
    API --> Auth
    API --> Analyzer
    Analyzer --> IAMData
    Analyzer --> CloudTrail
    Analyzer --> MitigationEngine
    MitigationEngine --> LLM
    MitigationEngine --> Fallback
    MitigationEngine --> FeedbackLoop
    FeedbackLoop --> Simulator
    Simulator --> FeedbackLoop
    API --> Postgres
    API --> Reporter
```

---

## Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Modern component-based web UI |
| | Tailwind CSS & shadcn/ui | Clean, responsive cybersecurity dashboard styling |
| | React Flow | Interactive IAM identity and service dependency graph |
| | Recharts | Visual charts for risk metrics, permission distributions, and audit status |
| | Lucide Icons | Security and cloud icon set |
| **Backend** | Python 3.11 | High-performance modern Python runtime |
| | FastAPI | Asynchronous REST API framework with native OpenAPI / Swagger |
| | SQLAlchemy 2.0 | Async ORM and SQL toolkit |
| | Pydantic v2 | High-throughput data validation and schema management |
| | ReportLab / FPDF | PDF audit report generation |
| **Database** | PostgreSQL 16 | ACID-compliant relational storage for roles, policies, audits, and metrics |
| **AI / Mitigation** | OpenAI API / Local Fallback | Configurable LLM integration with robust deterministic rule fallback |
| **Containerization**| Docker & Docker Compose | Containerized development and production deployment |

---

## Quick Start

### Using Docker Compose (Recommended)

Get the complete application running with database, backend, and frontend in one command:

```bash
# Clone the repository
git clone <repo>
cd iam-mitigator

# Build and start all services
docker-compose up --build
```

### Accessing the Platform

- **Web Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative API Docs (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Demo Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` |

---

## Manual Setup

If you prefer to run services individually for development:

### Prerequisites
- Python 3.11+
- Node.js 20+ and npm
- PostgreSQL 16 running locally on port 5432

### 1. Database Setup
Create a PostgreSQL database named `iam_mitigator`:
```sql
CREATE DATABASE iam_mitigator;
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
# On Windows:
python -m venv venv
venv\Scripts\activate
# On Linux/macOS:
# python -m venv venv
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example from project root or set backend/.env
cp ../.env.example .env

# Run backend development server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (or proxy to `http://localhost:3000` via Nginx in Docker).

---

## Environment Variables

| Variable | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Yes | `postgresql+asyncpg://postgres:postgres@localhost:5432/iam_mitigator` | Asynchronous PostgreSQL connection string. |
| `SECRET_KEY` | Yes | `your-secret-key-change-in-production` | Secret key for JWT signature and password security. Change in production! |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` (24 hours) | Expiration time for authentication tokens. |
| `AI_PROVIDER` | No | `none` | AI provider for policy mitigation (`none`, `openai`). Defaults to deterministic rule engine when `none`. |
| `AI_API_KEY` | Conditional | *(empty)* | API key for OpenAI (required if `AI_PROVIDER=openai`). |
| `AI_MODEL` | No | `gpt-4` | Target model for AI policy synthesis. |
| `AWS_INTEGRATION_ENABLED` | No | `false` | Master safety switch. When `false`, simulated data engine is used. |
| `AWS_ACCESS_KEY_ID` | Conditional | *(empty)* | AWS Access Key ID (only used if AWS integration is enabled). |
| `AWS_SECRET_ACCESS_KEY` | Conditional | *(empty)* | AWS Secret Access Key (only used if AWS integration is enabled). |
| `AWS_REGION` | No | `us-east-1` | Default AWS region for API and log operations. |
| `MAX_SIMULATION_ITERATIONS` | No | `5` | Maximum number of iterative revision loops during autonomous simulation. |

---

## Database Setup & Initialization

- **Automatic Schema Migration**: Database tables are automatically inspected and created upon backend application startup via SQLAlchemy metadata.
- **Automated Data Seeding**: On the initial startup, if the database is empty, the platform automatically seeds:
  - Default administrative user (`admin` / `admin123`)
  - Realistic cloud IAM roles with overprivileged policies (e.g., `WildcardAdminRole`, `DataScientistRole`, `BackendMicroserviceRole`)
  - Simulated CloudTrail access history demonstrating actual service usage vs. excessive granted rights
  - Realistic service dependency links

---

## API Documentation

Interactive API documentation with test execution is available directly at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Core API Endpoints

#### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user credentials and return JWT bearer token. |
| `POST` | `/api/auth/register` | Register a new user account. |
| `GET` | `/api/auth/me` | Retrieve profile and role information for the currently authenticated user. |

#### IAM Management & Discovery
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/iam/roles` | List all IAM roles, attached policies, and current privilege status. |
| `GET` | `/api/iam/roles/{id}` | Get detailed permissions, usage logs, and policy breakdown for a role. |
| `GET` | `/api/iam/policies` | Retrieve all managed and inline policies with raw JSON document definitions. |
| `GET` | `/api/iam/policies/{id}` | Get specific policy version and statement details. |

#### Analysis & Findings
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/iam/analyze` | Execute complete least-privilege analysis across all identities. |
| `GET` | `/api/iam/findings` | Retrieve identified security findings, wildcard risks, and unused actions. |
| `GET` | `/api/iam/dependencies` | Fetch node and edge datasets for the service dependency graph visualization. |

#### Autonomous Mitigation & Simulation
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/iam/mitigate` | Trigger autonomous policy generator (AI or deterministic) for candidate policy. |
| `POST` | `/api/iam/simulate` | Execute dry-run simulation of candidate policy against historic access patterns. |
| `POST` | `/api/iam/remediate` | Run autonomous multi-iteration mitigation and simulation loop until convergence. |

#### Audit Trail & Reports
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/audit/logs` | Fetch comprehensive audit trail including remediation actions, diffs, and proofs. |
| `GET` | `/api/reports/pdf` | Export comprehensive executive and technical least-privilege audit report as PDF. |

#### Health
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning backend status and database connectivity. |

---

## Agent Workflow

The autonomous mitigation engine operates on a closed-loop 9-step workflow designed to eliminate over-privileged permissions while guaranteeing zero disruption to legitimate operational workflows.

```mermaid
sequenceDiagram
    autonumber
    participant Cloud as Cloud / Telemetry
    participant Analyzer as IAM Analyzer
    participant Generator as Policy Generator (AI/Rules)
    participant Simulator as Policy Simulator
    participant Verifier as Access Verifier
    participant Audit as Audit & Output

    Cloud->>Analyzer: 1. Ingest IAM & CloudTrail Activity Logs
    Analyzer->>Analyzer: 2. Map Effective & Historic Permissions
    Analyzer->>Analyzer: 3. Identify Overprivileged Roles & Policies
    Analyzer->>Generator: 4. Generate Candidate Least-Privilege Policy
    loop Iterative Remediation (Up to MAX_SIMULATION_ITERATIONS)
        Generator->>Simulator: 5. Policy Simulation & Dry-Run Evaluation
        Simulator->>Simulator: 6. Failure & Denial Analysis
        alt Denials Detected for Valid Traffic
            Simulator->>Generator: 7. Autonomous Policy Revision Loop (Add missing scoped action)
        else All Valid Traffic Permitted
            Simulator->>Verifier: 8. Verification & Access Preservation Confirmation
        end
    end
    Verifier->>Audit: 9. Audit Log Generation & Policy Rollout / Export
```

### 9-Step Breakdown
1. **Ingest IAM & CloudTrail Activity Logs**: Ingests active IAM roles, inline and managed policy documents, and CloudTrail event telemetry over a configurable lookback window.
2. **Map Effective & Historic Permissions**: Evaluates effective permissions (Allow vs. Deny, SCPs, permission boundaries) against observed API calls.
3. **Identify Overprivileged Roles & Policies**: Flags wildcard statements (`*`), excessive admin permissions (`iam:*`, `s3:*`), and granted actions never invoked in logs.
4. **Generate Candidate Least-Privilege Policy**: Uses LLM intelligence (or deterministic fallback) to generate scoped statements restricted to demonstrated actions and resource ARNs.
5. **Policy Simulation & Dry-Run Evaluation**: Evaluates proposed candidate policies against historical requests and synthetic edge-case scenarios.
6. **Failure & Denial Analysis**: Analyzes simulated denials to differentiate between rightfully restricted actions and accidental operational breakages.
7. **Autonomous Policy Revision Loop**: If a legitimate operational action was incorrectly restricted, the agent automatically refines the policy, expanding resources or actions conservatively, and re-triggers simulation.
8. **Verification & Access Preservation Confirmation**: Confirms that 100% of verified business traffic passes evaluation while minimizing wildcard attack surface.
9. **Audit Log Generation & Policy Rollout / Export**: Produces an immutable audit entry with complete before/after policy diffs, mathematical risk reduction metrics, and downloadable policy artifacts.

---

## AWS Integration Roadmap

By default, the platform runs in **safe simulation mode** with pre-seeded, realistic enterprise IAM roles, simulated CloudTrail activity, and offline dry-run evaluation. This guarantees that **no real cloud environments are impacted out-of-the-box**.

To transition from the simulation layer to live AWS cloud accounts:

1. **Set `AWS_INTEGRATION_ENABLED=true`** in `.env`.
2. **Provide AWS Credentials**:
   Configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`, or attach an IAM Instance Profile / ECS Task Execution Role with read-only permissions (`iam:Get*`, `iam:List*`, `cloudtrail:LookupEvents`).
3. **Replace Simulated Data Layer with Boto3 Calls**:
   Swap the repository layer in `app/services/iam_data.py` to query live IAM APIs via AWS SDK for Python (`boto3.client('iam')`).
4. **Enable CloudTrail Log Ingestion**:
   Connect AWS CloudTrail lake or Athena log queries to stream real event history into the analysis pipeline.
5. **Connect IAM Policy Simulator**:
   Hook into AWS IAM Policy Simulator API (`boto3.client('iam').simulate_principal_policy`) for cloud-native simulation verification.

---

## Security Considerations

- **Simulated Environment by Default**: The application operates on simulated data by default. No live cloud credentials are required for evaluation or testing.
- **Zero In-Place Mutation**: Even with AWS integration enabled, policy changes should default to creating proposed revisions rather than mutating production policies without SecOps approval.
- **Token Security**: JWT tokens expire after 24 hours (`ACCESS_TOKEN_EXPIRE_MINUTES=1440`) and are signed using a secure HMAC algorithm.
- **Password Protection**: User passwords are encrypted using industry-standard `bcrypt` hashing.
- **Strict CORS Policy**: By default, CORS is configured for local development. Restrict allowed origins to specific domains before deploying to production environments.
- **AI Key Isolation**: When `AI_PROVIDER=openai` is active, API keys are kept strictly on the backend server and never exposed to the client or written into audit logs.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
