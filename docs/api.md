# API Documentation

## Base URL

```
http://localhost:8000/api/v1
```

## Services

### User Service
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /users/{user_id}` - Get user

### Course Service
- `POST /courses/` - Create course
- `GET /courses/{course_id}` - Get course
- `GET /courses/` - List courses

### Video Processor
- `POST /videos/upload` - Upload video
- `GET /videos/{video_id}` - Get video
- `GET /videos/{video_id}/status` - Get video status

### Quiz Service
- `POST /quizzes/` - Create quiz
- `GET /quizzes/{quiz_id}` - Get quiz
- `POST /attempts/` - Create attempt
- `GET /attempts/{attempt_id}` - Get attempt

### Progress Service
- `POST /enrollments/` - Create enrollment
- `GET /enrollments/{enrollment_id}` - Get enrollment
- `POST /progress/` - Update progress
- `GET /certificates/{user_id}/courses/{course_id}` - Get certificate

### Payment Service
- `POST /orders/` - Create order
- `GET /orders/{order_id}` - Get order
- `POST /webhooks/stripe` - Stripe webhook

### Analytics Service
- `POST /events/` - Track event
- `POST /metrics/` - Create metric
- `POST /reports/` - Generate report

### Notification Service
- `POST /notifications/` - Create notification
- `GET /notifications/user/{user_id}` - List notifications
