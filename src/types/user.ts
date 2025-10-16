export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'curator' | 'user';
  organization_id?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  email_verified: boolean;
}

export interface UpdateUserInput {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'admin' | 'curator' | 'user';
  is_active?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  logo_url?: string;
  subscription_plan: 'trial' | 'basic' | 'premium' | 'enterprise';
  seats: number;
  created_at: string;
  updated_at: string;
}
