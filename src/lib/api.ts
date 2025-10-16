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
  getAll: () => api.get<import('@/types/course').Course[]>('/courses'),
  getById: (id: string) => api.get<import('@/types/course').Course>(`/courses/${id}`),
  create: (data: import('@/types/course').CreateCourseInput) => 
    api.post<import('@/types/course').Course>('/courses', data),
  update: (id: string, data: Partial<import('@/types/course').CreateCourseInput>) => 
    api.put<import('@/types/course').Course>(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  enroll: (courseId: string) => api.post(`/courses/${courseId}/enroll`, {}),
  getProgress: (courseId: string) => 
    api.get<import('@/types/course').CourseProgress>(`/courses/${courseId}/progress`),
  submitQuiz: (courseId: string, quizId: string, answers: Record<string, string | number>) =>
    api.post(`/courses/${courseId}/quizzes/${quizId}/submit`, { answers }),
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
  resetPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  confirmPasswordReset: (data: import('@/types/auth').PasswordResetConfirm) => 
    api.post('/auth/reset-password', data),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  refreshToken: () => api.post<import('@/types/auth').AuthResponse>('/auth/refresh', {}),
};
