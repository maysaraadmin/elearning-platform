const API_BASE = '/api/v1';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: { detail: string; status_code: number } = await response.json().catch(() => ({
        detail: response.statusText,
        status_code: response.status,
      }));
      throw new ApiError(error.detail, error.status_code);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const headers: HeadersInit = {};
    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: response.statusText,
        status_code: response.status,
      }));
      throw new ApiError(error.detail, error.status_code);
    }

    return response.json();
  }
}

export class ApiError extends Error {
  constructor(
    public readonly detail: string,
    public readonly statusCode: number
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

export const api = new ApiClient();

export const authApi = {
  login: (email: string, password: string) =>
    api.post<import('../types').TokenResponse>('/users/login', { email, password }),
  register: (data: import('../types').RegisterRequest) =>
    api.post<import('../types').User>('/users/register', data),
  getMe: () => api.get<import('../types').User>('/users/me'),
};

export const usersApi = {
  list: (page = 1, pageSize = 20) =>
    api.get<import('../types').PaginatedResponse<import('../types').User>>(`/users?page=${page}&page_size=${pageSize}`),
  get: (id: string) => api.get<import('../types').User>(`/users/${id}`),
  create: (data: import('../types').RegisterRequest) =>
    api.post<import('../types').User>('/users/register', data),
  update: (id: string, data: Partial<import('../types').User>) =>
    api.patch<import('../types').User>(`/users/${id}`, data),
  delete: (id: string) => api.delete<void>(`/users/${id}`),
};

export const coursesApi = {
  list: (page = 1, pageSize = 20) =>
    api.get<import('../types').PaginatedResponse<import('../types').Course>>(`/courses?page=${page}&page_size=${pageSize}`),
  get: (id: string) => api.get<import('../types').Course>(`/courses/${id}`),
  create: (data: Partial<import('../types').Course>) =>
    api.post<import('../types').Course>('/courses', data),
  update: (id: string, data: Partial<import('../types').Course>) =>
    api.patch<import('../types').Course>(`/courses/${id}`, data),
  delete: (id: string) => api.delete<void>(`/courses/${id}`),
};

export const modulesApi = {
  list: (courseId: string) =>
    api.get<import('../types').Module[]>(`/courses/${courseId}/modules`),
  get: (id: string) => api.get<import('../types').Module>(`/modules/${id}`),
  create: (courseId: string, data: Partial<import('../types').Module>) =>
    api.post<import('../types').Module>(`/courses/${courseId}/modules`, data),
  update: (id: string, data: Partial<import('../types').Module>) =>
    api.patch<import('../types').Module>(`/modules/${id}`, data),
  delete: (id: string) => api.delete<void>(`/modules/${id}`),
};

export const lessonsApi = {
  list: (moduleId: string) =>
    api.get<import('../types').Lesson[]>(`/modules/${moduleId}/lessons`),
  get: (id: string) => api.get<import('../types').Lesson>(`/lessons/${id}`),
  create: (moduleId: string, data: Partial<import('../types').Lesson>) =>
    api.post<import('../types').Lesson>(`/modules/${moduleId}/lessons`, data),
  update: (id: string, data: Partial<import('../types').Lesson>) =>
    api.patch<import('../types').Lesson>(`/lessons/${id}`, data),
  delete: (id: string) => api.delete<void>(`/lessons/${id}`),
};

export const videosApi = {
  list: (page = 1, pageSize = 20) =>
    api.get<import('../types').PaginatedResponse<import('../types').VideoAsset>>(`/videos?page=${page}&page_size=${pageSize}`),
  get: (id: string) => api.get<import('../types').VideoAsset>(`/videos/${id}`),
  upload: (file: File, title: string, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) formData.append('description', description);
    return api.upload<import('../types').VideoAsset>('/videos/upload', formData);
  },
  getStatus: (id: string) => api.get<import('../types').VideoStatusResponse>(`/videos/${id}/status`),
  delete: (id: string) => api.delete<void>(`/videos/${id}`),
};

export const quizzesApi = {
  list: (page = 1, pageSize = 20) =>
    api.get<import('../types').PaginatedResponse<import('../types').Quiz>>(`/quizzes?page=${page}&page_size=${pageSize}`),
  get: (id: string) => api.get<import('../types').Quiz>(`/quizzes/${id}`),
  create: (data: Partial<import('../types').Quiz>) =>
    api.post<import('../types').Quiz>('/quizzes', data),
  update: (id: string, data: Partial<import('../types').Quiz>) =>
    api.patch<import('../types').Quiz>(`/quizzes/${id}`, data),
  delete: (id: string) => api.delete<void>(`/quizzes/${id}`),
};

export const attemptsApi = {
  list: (quizId: string) =>
    api.get<import('../types').QuizAttempt[]>(`/quizzes/${quizId}/attempts`),
  get: (id: string) => api.get<import('../types').QuizAttempt>(`/attempts/${id}`),
  create: (data: { quiz_id: string; user_id: string }) =>
    api.post<import('../types').QuizAttempt>('/attempts', data),
};

export const enrollmentsApi = {
  list: (page = 1, pageSize = 20) =>
    api.get<import('../types').PaginatedResponse<import('../types').Enrollment>>(`/progress/enrollments?page=${page}&page_size=${pageSize}`),
  get: (id: string) => api.get<import('../types').Enrollment>(`/progress/enrollments/${id}`),
  create: (data: { user_id: string; course_id: string }) =>
    api.post<import('../types').Enrollment>('/progress/enrollments', data),
  update: (id: string, data: Partial<import('../types').Enrollment>) =>
    api.patch<import('../types').Enrollment>(`/progress/enrollments/${id}`, data),
  delete: (id: string) => api.delete<void>(`/progress/enrollments/${id}`),
};

export const progressApi = {
  list: (enrollmentId: string) =>
    api.get<import('../types').LessonProgress[]>(`/progress/enrollments/${enrollmentId}/progress`),
  get: (id: string) => api.get<import('../types').LessonProgress>(`/progress/progress/${id}`),
  update: (enrollmentId: string, lessonId: string, data: { completed: boolean; watch_time_seconds: number; last_position_seconds: number }) =>
    api.post<import('../types').LessonProgress>(`/progress/enrollments/${enrollmentId}/progress`, { ...data, lesson_id: lessonId }),
};

export const certificatesApi = {
  get: (userId: string, courseId: string) =>
    api.get<import('../types').Certificate>(`/progress/users/${userId}/courses/${courseId}/certificate`),
  list: (page = 1, pageSize = 20) =>
    api.get<import('../types').PaginatedResponse<import('../types').Certificate>>(`/progress/certificates?page=${page}&page_size=${pageSize}`),
};

export const ordersApi = {
  list: (page = 1, pageSize = 20) =>
    api.get<import('../types').PaginatedResponse<import('../types').Order>>(`/payments/orders?page=${page}&page_size=${pageSize}`),
  get: (id: string) => api.get<import('../types').Order>(`/payments/orders/${id}`),
  create: (data: { user_id: string; course_id: string; amount: number; currency: string; payment_method: string }) =>
    api.post<import('../types').Order>('/payments/orders', data),
  update: (id: string, data: Partial<import('../types').Order>) =>
    api.patch<import('../types').Order>(`/payments/orders/${id}`, data),
  delete: (id: string) => api.delete<void>(`/payments/orders/${id}`),
};

export const analyticsApi = {
  events: {
    list: (page = 1, pageSize = 20) =>
      api.get<import('../types').PaginatedResponse<import('../types').Event>>(`/analytics/events?page=${page}&page_size=${pageSize}`),
    create: (data: Partial<import('../types').Event>) =>
      api.post<import('../types').Event>('/analytics/events', data),
  },
  metrics: {
    list: (page = 1, pageSize = 20) =>
      api.get<import('../types').PaginatedResponse<import('../types').Metric>>(`/analytics/metrics?page=${page}&page_size=${pageSize}`),
    create: (data: Partial<import('../types').Metric>) =>
      api.post<import('../types').Metric>('/analytics/metrics', data),
  },
  reports: {
    list: (page = 1, pageSize = 20) =>
      api.get<import('../types').PaginatedResponse<import('../types').Report>>(`/analytics/reports?page=${page}&page_size=${pageSize}`),
    create: (data: Partial<import('../types').Report>) =>
      api.post<import('../types').Report>('/analytics/reports', data),
  },
};

export const notificationsApi = {
  list: (userId: string) =>
    api.get<import('../types').Notification[]>(`/notifications/user/${userId}`),
  create: (data: Partial<import('../types').Notification>) =>
    api.post<import('../types').Notification>('/notifications', data),
  markRead: (id: string) =>
    api.patch<import('../types').Notification>(`/notifications/${id}/read`, {}),
};

export const healthApi = {
  checkAll: () => api.get<import('../types').ServiceHealth[]>('/health/services'),
  check: (service: string) => api.get<import('../types').ServiceHealth>(`/health/services/${service}`),
};