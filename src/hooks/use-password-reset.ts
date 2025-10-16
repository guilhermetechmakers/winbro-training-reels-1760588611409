import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import type { PasswordResetRequest, PasswordResetConfirm } from '@/types/auth';

// Query keys
export const passwordResetKeys = {
  tokenValidation: (token: string) => ['password-reset', 'token-validation', token] as const,
};

// Password reset request hook
export const usePasswordResetRequest = () => {
  return useMutation({
    mutationFn: (data: PasswordResetRequest) => authApi.requestPasswordReset(data),
    onSuccess: (data) => {
      toast.success('Password reset email sent! Check your inbox.');
      if (data.rateLimitInfo) {
        toast.info(`Rate limit: ${data.rateLimitInfo.remaining} requests remaining`);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to send password reset email';
      toast.error(message);
    },
  });
};

// Password reset confirmation hook
export const usePasswordReset = () => {
  return useMutation({
    mutationFn: (data: PasswordResetConfirm) => authApi.resetPassword(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Password reset successfully! You can now sign in with your new password.');
      } else {
        toast.error(data.message || 'Password reset failed');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Password reset failed';
      toast.error(message);
    },
  });
};

// Token validation hook
export const useTokenValidation = (token: string) => {
  return useQuery({
    queryKey: passwordResetKeys.tokenValidation(token),
    queryFn: () => authApi.validateResetToken(token),
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};