import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, userApi } from '@/lib/api';
import { emailVerificationApi } from '@/api/email-verification';
import { toast } from 'sonner';
// import type { SignInInput, SignUpInput, PasswordResetRequest, PasswordResetConfirm } from '@/types/auth';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
};

// Get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: userApi.getCurrent,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!localStorage.getItem('auth_token'),
  });
};

// Sign in mutation
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      // Update the user in the cache
      if (data.user) {
        queryClient.setQueryData(authKeys.user, data.user);
      }
      
      toast.success('Signed in successfully!');
    },
    onError: (error: any) => {
      toast.error(`Sign in failed: ${error.response?.data?.message || error.message}`);
    },
  });
};

// Sign up mutation
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signUp,
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      // Update the user in the cache
      if (data.user) {
        queryClient.setQueryData(authKeys.user, data.user);
      }
      
      toast.success('Account created! Please check your email to verify your account.');
    },
    onError: (error: any) => {
      toast.error(`Sign up failed: ${error.response?.data?.message || error.message}`);
    },
  });
};

// Sign out mutation
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      // Clear all cached data
      queryClient.clear();
      
      toast.success('Signed out successfully!');
    },
    onError: (error: any) => {
      toast.error(`Sign out failed: ${error.response?.data?.message || error.message}`);
    },
  });
};

// Password reset mutation
export const usePasswordReset = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('Password reset email sent! Check your inbox.');
    },
    onError: (error: any) => {
      toast.error(`Password reset failed: ${error.response?.data?.message || error.message}`);
    },
  });
};

// Confirm password reset mutation
export const useConfirmPasswordReset = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully! You can now sign in.');
    },
    onError: (error: any) => {
      toast.error(`Password reset failed: ${error.response?.data?.message || error.message}`);
    },
  });
};

// Email verification mutation
export const useEmailVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: emailVerificationApi.verifyEmail,
    onSuccess: (data) => {
      if (data.success) {
        // Update user verification status in cache
        queryClient.setQueryData(authKeys.user, (oldData: any) => {
          if (oldData) {
            return { ...oldData, email_verified: true };
          }
          return oldData;
        });
        toast.success('Email verified successfully!');
      } else {
        toast.error(data.message || 'Email verification failed');
      }
    },
    onError: (error: any) => {
      toast.error(`Email verification failed: ${error.response?.data?.message || error.message}`);
    },
  });
};

// Resend verification email mutation
export const useResendVerification = () => {
  return useMutation({
    mutationFn: emailVerificationApi.resendVerification,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Verification email sent! Check your inbox.');
      } else {
        toast.error(data.message || 'Failed to send verification email');
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to send verification email: ${error.response?.data?.message || error.message}`);
    },
  });
};
