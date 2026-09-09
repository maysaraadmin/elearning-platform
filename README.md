# E-Learning Platform

Large-scale open-source e-learning platform built with microservices architecture.

## Architecture

- **API Gateway**: Kong/APISIX
- **Backend**: Python + FastAPI microservices
- **Database**: PostgreSQL
- **Cache**: Redis
- **Storage**: MinIO (S3-compatible)
- **Message Queue**: RabbitMQ
- **Container**: Docker + Kubernetes

## Services

| Service | Port | Description |
|---------|------|-------------|
| Gateway | 8000 | API Gateway |
| User Service | 8001 | User management & auth |
| Course Service | 8002 | Course management |
| Video Processor | 8003 | Video transcoding |
| Quiz Service | 8004 | Assessments & quizzes |
| Progress Service | 8005 | Progress tracking |
| Payment Service | 8006 | Payments & monetization |
| Analytics Service | 8007 | Analytics & reporting |
| Notification Service | 8008 | Notifications |

## Getting Started

```bash
# Start infrastructure
docker compose -f infrastructure/docker/compose.yaml up -d

# Start all services
docker compose -f infrastructure/docker/compose.dev.yaml up -d
```

## Documentation

See `docs/` for detailed documentation.
