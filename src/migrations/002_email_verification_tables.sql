-- Email verification system migration
-- This migration adds email verification fields to the users table and creates supporting tables

-- Add email verification fields to users table
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verification_token VARCHAR(255),
ADD COLUMN email_verification_expires_at TIMESTAMP,
ADD COLUMN email_verification_sent_at TIMESTAMP;

-- Create index for email verification token lookups
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);

-- Create verification attempts table for rate limiting
CREATE TABLE verification_attempts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- Create index for rate limiting queries
CREATE INDEX idx_verification_attempts_email_attempted ON verification_attempts(email, attempted_at);
CREATE INDEX idx_verification_attempts_ip_attempted ON verification_attempts(ip_address, attempted_at);

-- Create email verification logs table for audit trail
CREATE TABLE email_verification_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'sent', 'verified', 'expired', 'invalid'
  token_hash VARCHAR(255), -- hashed version of token for security
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for audit queries
CREATE INDEX idx_email_verification_logs_user_id ON email_verification_logs(user_id);
CREATE INDEX idx_email_verification_logs_email ON email_verification_logs(email);
CREATE INDEX idx_email_verification_logs_created_at ON email_verification_logs(created_at);

-- Add comments for documentation
COMMENT ON COLUMN users.email_verified IS 'Whether the user has verified their email address';
COMMENT ON COLUMN users.email_verification_token IS 'Cryptographically secure token for email verification';
COMMENT ON COLUMN users.email_verification_expires_at IS 'When the verification token expires (typically 24 hours)';
COMMENT ON COLUMN users.email_verification_sent_at IS 'When the verification email was last sent';

COMMENT ON TABLE verification_attempts IS 'Tracks verification attempts for rate limiting';
COMMENT ON TABLE email_verification_logs IS 'Audit trail for email verification activities';
