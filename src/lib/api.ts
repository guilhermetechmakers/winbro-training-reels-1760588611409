// Simple fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// API utilities
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  patch: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) => 
    apiRequest(endpoint, { method: 'DELETE' }),
};

// Video API
export const videoApi = {
  getAll: () => api.get<import('@/types/video').VideoClip[]>('/videos'),
  getById: (id: string) => api.get<import('@/types/video').VideoClip>(`/videos/${id}`),
  create: (data: import('@/types/video').CreateVideoClipInput) => 
    api.post<import('@/types/video').VideoClip>('/videos', data),
  update: (id: string, data: import('@/types/video').UpdateVideoClipInput) => 
    api.put<import('@/types/video').VideoClip>(`/videos/${id}`, data),
  delete: (id: string) => api.delete(`/videos/${id}`),
  search: (query: string) => api.get<import('@/types/video').VideoClip[]>(`/videos/search?q=${query}`),
  upload: (file: File, _onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/videos/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });
  },
};

// Upload API
export const uploadApi = {
  initiate: (data: import('@/types/video').UploadInitiateRequest) => 
    api.post<import('@/types/video').UploadInitiateResponse>('/upload/initiate', data),
  complete: (data: import('@/types/video').UploadCompleteRequest) => 
    api.post<import('@/types/video').UploadCompleteResponse>('/upload/complete', data),
  cancel: (uploadId: string) => api.delete(`/upload/${uploadId}`),
  resume: (uploadId: string, resumeUrl: string) => 
    api.post(`/upload/${uploadId}/resume`, { resumeUrl }),
};

// Processing API
export const processingApi = {
  getStatus: (jobId: string) => 
    api.get<import('@/types/video').ProcessingStatusResponse>(`/processing/status/${jobId}`),
  retry: (jobId: string) => api.post(`/processing/${jobId}/retry`, {}),
  cancel: (jobId: string) => api.delete(`/processing/${jobId}`),
};

// Video Processing API
export const videoProcessingApi = {
  initiateUpload: (request: import('@/types/video').VideoUploadRequest) => 
    api.post<import('@/types/video').ResumableUploadSession>('/videos/upload/initiate', request),
  uploadChunk: (request: import('@/types/video').UploadChunkRequest) => 
    api.post<import('@/types/video').UploadChunkResponse>(`/videos/upload/${request.uploadId}/chunk`, request),
  completeUpload: (uploadId: string, videoId: string) => 
    api.post<{ processingJobId: string }>(`/videos/upload/${uploadId}/complete`, { videoId }),
  getProcessingStatus: (videoId: string) => 
    api.get<import('@/types/video').VideoProcessingStatus>(`/videos/${videoId}/status`),
  retryProcessing: (videoId: string) => 
    api.post<{ processingJobId: string }>(`/videos/${videoId}/retry`, {}),
  getPreviewUrl: (videoId: string) => 
    api.get<{ previewUrl: string }>(`/videos/${videoId}/preview`),
  getVideoFormats: (videoId: string) => 
    api.get<import('@/types/video').VideoFormat[]>(`/videos/${videoId}/formats`),
  deleteVideo: (videoId: string) => api.delete(`/videos/${videoId}`),
  getStorageConfig: () => 
    api.get<import('@/types/video').VideoStorageConfig>('/videos/storage/config'),
  getProcessingConfig: () => 
    api.get<import('@/types/video').VideoProcessingConfig>('/videos/processing/config'),
  updateProcessingConfig: (config: Partial<import('@/types/video').VideoProcessingConfig>) => 
    api.put<import('@/types/video').VideoProcessingConfig>('/videos/processing/config', config),
};

// Course API
export const courseApi = {
  // Basic CRUD operations
  getAll: () => api.get<import('@/types/course').Course[]>('/courses'),
  getById: (id: string) => api.get<import('@/types/course').Course>(`/courses/${id}`),
  create: (data: import('@/types/course').CreateCourseInput) => 
    api.post<import('@/types/course').Course>('/courses', data),
  update: (id: string, data: import('@/types/course').UpdateCourseInput) => 
    api.put<import('@/types/course').Course>(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  
  // Course publishing and assignment
  publish: (id: string) => api.post<import('@/types/course').Course>(`/courses/${id}/publish`, {}),
  unpublish: (id: string) => api.post<import('@/types/course').Course>(`/courses/${id}/unpublish`, {}),
  assign: (id: string, data: { user_ids: string[]; team_ids?: string[]; customer_ids?: string[] }) => 
    api.post(`/courses/${id}/assign`, data),
  
  // Course modules
  getModules: (courseId: string) => api.get<import('@/types/course').CourseModule[]>(`/courses/${courseId}/modules`),
  createModule: (data: import('@/types/course').CreateModuleInput) => api.post<import('@/types/course').CourseModule>('/courses/modules', data),
  updateModule: (id: string, data: Partial<import('@/types/course').CreateModuleInput>) => 
    api.put<import('@/types/course').CourseModule>(`/courses/modules/${id}`, data),
  deleteModule: (id: string) => api.delete(`/courses/modules/${id}`),
  reorderModules: (courseId: string, moduleIds: string[]) => 
    api.put(`/courses/${courseId}/modules/reorder`, { module_ids: moduleIds }),
  
  // Course lessons
  getLessons: (moduleId: string) => api.get<import('@/types/course').CourseLesson[]>(`/courses/modules/${moduleId}/lessons`),
  createLesson: (data: import('@/types/course').CreateLessonInput) => api.post<import('@/types/course').CourseLesson>('/courses/lessons', data),
  updateLesson: (id: string, data: Partial<import('@/types/course').CreateLessonInput>) => 
    api.put<import('@/types/course').CourseLesson>(`/courses/lessons/${id}`, data),
  deleteLesson: (id: string) => api.delete(`/courses/lessons/${id}`),
  reorderLessons: (moduleId: string, lessonIds: string[]) => 
    api.put(`/courses/modules/${moduleId}/lessons/reorder`, { lesson_ids: lessonIds }),
  
  // Course quizzes
  getQuizzes: (courseId: string) => api.get<import('@/types/course').CourseQuiz[]>(`/courses/${courseId}/quizzes`),
  createQuiz: (data: import('@/types/course').CreateQuizInput) => api.post<import('@/types/course').CourseQuiz>('/courses/quizzes', data),
  updateQuiz: (id: string, data: Partial<import('@/types/course').CreateQuizInput>) => 
    api.put<import('@/types/course').CourseQuiz>(`/courses/quizzes/${id}`, data),
  deleteQuiz: (id: string) => api.delete(`/courses/quizzes/${id}`),
  
  // Quiz questions
  getQuestions: (quizId: string) => api.get<import('@/types/course').QuizQuestion[]>(`/courses/quizzes/${quizId}/questions`),
  createQuestion: (data: import('@/types/course').CreateQuestionInput) => api.post<import('@/types/course').QuizQuestion>('/courses/quiz-questions', data),
  updateQuestion: (id: string, data: Partial<import('@/types/course').CreateQuestionInput>) => 
    api.put<import('@/types/course').QuizQuestion>(`/courses/quiz-questions/${id}`, data),
  deleteQuestion: (id: string) => api.delete(`/courses/quiz-questions/${id}`),
  reorderQuestions: (quizId: string, questionIds: string[]) => 
    api.put(`/courses/quizzes/${quizId}/questions/reorder`, { question_ids: questionIds }),
  
  // Course enrollment and progress
  enroll: (courseId: string) => api.post<import('@/types/course').CourseEnrollment>(`/courses/${courseId}/enroll`, {}),
  getEnrollments: (courseId: string) => api.get<import('@/types/course').CourseEnrollment[]>(`/courses/${courseId}/enrollments`),
  getMyEnrollments: () => api.get<import('@/types/course').CourseEnrollment[]>('/courses/my-enrollments'),
  getEnrollment: (enrollmentId: string) => api.get<import('@/types/course').CourseEnrollment>(`/courses/enrollments/${enrollmentId}`),
  updateProgress: (enrollmentId: string, data: { lesson_id: string; completed: boolean }) => 
    api.put<import('@/types/course').CourseProgress>(`/courses/enrollments/${enrollmentId}/progress`, data),
  
  // Course player data
  getPlayerData: (courseId: string) => api.get<import('@/types/course').CoursePlayerData>(`/courses/${courseId}/player`),
  getProgress: (courseId: string) => api.get<import('@/types/course').CourseProgress>(`/courses/${courseId}/progress`),
  
  // Quiz attempts
  startQuizAttempt: (quizId: string) => api.post<import('@/types/course').QuizAttempt>(`/courses/quizzes/${quizId}/attempt`, {}),
  submitQuiz: (attemptId: string, data: import('@/types/course').QuizSubmission) => 
    api.put<import('@/types/course').QuizAttempt>(`/courses/quiz-attempts/${attemptId}/submit`, data),
  getQuizAttempts: (quizId: string) => api.get<import('@/types/course').QuizAttempt[]>(`/courses/quizzes/${quizId}/attempts`),
  
  // Certificates
  getCertificate: (enrollmentId: string) => api.get<import('@/types/course').Certificate>(`/courses/enrollments/${enrollmentId}/certificate`),
  generateCertificate: (enrollmentId: string) => api.post<import('@/types/course').Certificate>(`/courses/enrollments/${enrollmentId}/certificate`, {}),
  verifyCertificate: (verificationCode: string) => api.get<import('@/types/course').Certificate>(`/courses/certificates/verify/${verificationCode}`),
  
  // Search and filtering
  search: (query: string) => api.get<import('@/types/course').Course[]>(`/courses/search?q=${query}`),
  getByOrganization: (organizationId: string) => api.get<import('@/types/course').Course[]>(`/courses/organization/${organizationId}`),
  getPublished: () => api.get<import('@/types/course').Course[]>('/courses/published'),
  getDrafts: () => api.get<import('@/types/course').Course[]>('/courses/drafts'),
};

// User API
export const userApi = {
  getCurrent: () => api.get<import('@/types/user').User>('/users/me'),
  updateProfile: (data: import('@/types/user').UpdateUserInput) => 
    api.put<import('@/types/user').User>('/users/me', data),
  getAll: () => api.get<import('@/types/user').User[]>('/users'),
  getById: (id: string) => api.get<import('@/types/user').User>(`/users/${id}`),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Auth API
export const authApi = {
  signIn: (credentials: import('@/types/auth').SignInInput) => 
    api.post<import('@/types/auth').AuthResponse>('/auth/login', credentials),
  signUp: (credentials: import('@/types/auth').SignUpInput) => 
    api.post<import('@/types/auth').AuthResponse>('/auth/register', credentials),
  signOut: () => api.post('/auth/logout', {}),
  requestPasswordReset: (data: import('@/types/auth').PasswordResetRequest) => 
    api.post<import('@/types/auth').PasswordResetResponse>('/auth/request-password-reset', data),
  resetPassword: (data: import('@/types/auth').PasswordResetConfirm) => 
    api.post<import('@/types/auth').PasswordResetConfirmation>('/auth/reset-password', data),
  validateResetToken: (token: string) => 
    api.get<import('@/types/auth').TokenValidation>(`/auth/validate-reset-token/${token}`),
  verifyEmail: (token: string) => api.post<import('@/types/auth').VerifyEmailResponse>('/auth/verify-email', { token }),
  resendVerification: (email: string) => api.post<import('@/types/auth').ResendVerificationResponse>('/auth/resend-verification', { email }),
  refreshToken: () => api.post<import('@/types/auth').AuthResponse>('/auth/refresh', {}),
};
