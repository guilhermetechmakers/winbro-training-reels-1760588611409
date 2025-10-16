import { api } from '@/lib/api';

// Email verification API endpoints
export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
  canResend: boolean;
  resendCooldown?: number;
}

export const emailVerificationApi = {
  verifyEmail: (token: string) => 
    api.post<VerifyEmailResponse>('/auth/verify-email', { token }),
  
  resendVerification: (email: string) => 
    api.post<ResendVerificationResponse>('/auth/resend-verification', { email }),
};
