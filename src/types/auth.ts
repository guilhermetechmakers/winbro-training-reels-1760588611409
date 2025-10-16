export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name?: string;
    role: 'admin' | 'curator' | 'user';
    organization_id?: string;
  };
  token: string;
  refresh_token: string;
}

export interface SignInInput {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  full_name: string;
  organization_name: string;
  role: 'admin' | 'curator' | 'user';
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordResetConfirmation {
  success: boolean;
  message: string;
}

export interface TokenValidation {
  valid: boolean;
  expired: boolean;
  email?: string;
}

export interface EmailVerificationRequest {
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

export interface SSOConfig {
  provider: 'google' | 'microsoft' | 'saml' | 'oidc';
  client_id: string;
  redirect_uri: string;
  scope?: string;
  metadata_url?: string; // for SAML
}
