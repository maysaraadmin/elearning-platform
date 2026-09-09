# Deployment Guide

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- kubectl
- Kubernetes cluster

## Local Development

```bash
# Start infrastructure
docker compose -f infrastructure/docker/compose.yaml up -d

# Start services
docker compose -f infrastructure/docker/compose.dev.yaml up -d
```

## Production

```bash
# Apply Kubernetes manifests
kubectl apply -f infrastructure/kubernetes/

# Verify deployments
kubectl get pods -n elearning
```

## Environment Variables

See `.env.example` in each service directory.