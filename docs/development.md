# Development Setup

## Requirements

- Python 3.11+
- PostgreSQL 16+
- Redis 7+
- RabbitMQ 3+
- MinIO
- FFmpeg

## Setup

```bash
# Clone repository
git clone <repo-url>
cd elearning-platform

# Install dependencies
pip install -e .[dev]

# Run tests
pytest tests/
```

## Project Structure

```
services/
  user-service/
  course-service/
  video-processor/
  quiz-service/
  progress-service/
  payment-service/
  analytics-service/
  notification-service/
  gateway-service/
shared/
  domain/
infrastructure/
```

## Contributing

1. Create feature branch
2. Make changes
3. Run tests and lint
4. Submit PR