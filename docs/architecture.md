# Architecture

## Overview

The platform follows a microservices architecture with clean architecture principles.

## Service Mesh

- API Gateway routes requests to backend services
- Services communicate via REST and message queues
- Shared domain models in `shared/domain/`

## Data Flow

1. Client -> API Gateway -> Microservice
2. Microservice -> PostgreSQL (persistence)
3. Microservice -> Redis (caching)
4. Microservice -> MinIO (object storage)
5. Async tasks via RabbitMQ

## Deployment

- Docker Compose for local development
- Kubernetes for production
- ArgoCD for GitOps deployment