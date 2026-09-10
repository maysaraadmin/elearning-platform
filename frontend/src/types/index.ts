export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'instructor' | 'admin' | 'moderator';
  is_active: boolean;
  is_verified: boolean;
  avatar_url?: string;
  bio?: string;
  timezone: string;
  language: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: 'student' | 'instructor' | 'admin' | 'moderator';
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  short_description?: string;
  instructor_id: string;
  status: 'draft' | 'published' | 'archived' | 'pending_review';
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  is_free: boolean;
  thumbnail_url?: string;
  preview_video_id?: string;
  level: string;
  language: string;
  duration_minutes: number;
  total_lessons: number;
  rating: number;
  rating_count: number;
  enrollment_count: number;
  tags?: string[];
  meta?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: 'video' | 'pdf' | 'text' | 'quiz' | 'assignment' | 'live';
  content?: string;
  order_index: number;
  duration_minutes: number;
  is_free: boolean;
  video_id?: string;
  file_url?: string;
  quiz_id?: string;
  meta?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface VideoAsset {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  original_filename: string;
  file_size: number;
  duration_seconds: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  format: string;
  storage_path: string;
  hls_path?: string;
  thumbnail_path?: string;
  renditions?: string[];
  subtitles?: string[];
  error_message?: string;
  is_transcoded: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoStatusResponse {
  video_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
}

export interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  time_limit_minutes: number;
  max_attempts: number;
  passing_score: number;
  randomize_questions: boolean;
  show_correct_answers: boolean;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_in_the_blank' | 'essay' | 'matching' | 'ordering';
  question_text: string;
  points: number;
  order_index: number;
  explanation?: string;
  options?: string[];
  correct_answer?: string;
  media_url?: string;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  attempt_number: number;
  started_at: string;
  completed_at?: string;
  total_score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  answers?: Record<string, unknown>[];
  time_taken_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  watch_time_minutes: number;
  last_accessed_at?: string;
  completed_at?: string;
  certificate_url?: string;
  meta?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  lesson_id: string;
  enrollment_id: string;
  completed: boolean;
  watch_time_seconds: number;
  last_position_seconds: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id: string;
  certificate_url: string;
  certificate_number: string;
  final_score: number;
  issued_at: string;
  meta?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_method: 'stripe' | 'paypal' | 'credit_card' | 'bank_transfer';
  payment_intent_id?: string;
  receipt_url?: string;
  meta?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  user_id?: string;
  session_id?: string;
  event_type: string;
  entity_type?: string;
  entity_id?: string;
  properties?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  created_at: string;
  updated_at: string;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  dimensions?: Record<string, unknown>;
  period_start: string;
  period_end: string;
  aggregation: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  name: string;
  report_type: string;
  parameters?: Record<string, unknown>;
  result?: Record<string, unknown>;
  file_url?: string;
  generated_by: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'enrollment' | 'course_completion' | 'quiz_assigned' | 'quiz_result' | 'payment_success' | 'payment_failed' | 'instructor_reply' | 'system' | 'promotion';
  channel: 'email' | 'in_app' | 'websocket' | 'sms';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  sent_at?: string;
  delivery_status: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency_ms?: number;
  last_check: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}