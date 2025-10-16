# Email Verification API Endpoints

This document describes the backend API endpoints that need to be implemented for the email verification system.

## POST /api/auth/verify-email

Verifies a user's email address using a verification token.

### Request Body
```json
{
  "token": "string"
}
```

### Response
```json
{
  "success": true,
  "message": "Email verified successfully",
  "userId": "uuid"
}
```

### Error Responses
- `400 Bad Request`: Invalid token format
- `404 Not Found`: Token not found
- `410 Gone`: Token expired
- `409 Conflict`: Email already verified

## POST /api/auth/resend-verification

Resends a verification email to the specified email address.

### Request Body
```json
{
  "email": "string"
}
```

### Response
```json
{
  "success": true,
  "message": "Verification email sent",
  "canResend": true,
  "resendCooldown": 300
}
```

### Error Responses
- `400 Bad Request`: Invalid email format
- `404 Not Found`: User not found
- `429 Too Many Requests`: Rate limited (too many attempts)

## Rate Limiting

- Maximum 5 verification attempts per email per hour
- Maximum 10 verification attempts per IP per hour
- Resend cooldown: 5 minutes between resend attempts

## Security Considerations

1. **Token Generation**: Use cryptographically secure random tokens (32+ bytes)
2. **Token Expiration**: Tokens expire after 24 hours
3. **Rate Limiting**: Implement IP and email-based rate limiting
4. **Audit Logging**: Log all verification attempts and outcomes
5. **Token Hashing**: Store hashed versions of tokens in the database

## Database Schema

The following tables are required:

### users table additions
- `email_verified` (BOOLEAN, DEFAULT FALSE)
- `email_verification_token` (VARCHAR(255))
- `email_verification_expires_at` (TIMESTAMP)
- `email_verification_sent_at` (TIMESTAMP)

### verification_attempts table
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR(255))
- `attempted_at` (TIMESTAMP)
- `ip_address` (INET)
- `user_agent` (TEXT)

### email_verification_logs table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (UUID, REFERENCES users(id))
- `email` (VARCHAR(255))
- `action` (VARCHAR(50)) // 'sent', 'verified', 'expired', 'invalid'
- `token_hash` (VARCHAR(255))
- `ip_address` (INET)
- `user_agent` (TEXT)
- `created_at` (TIMESTAMP)

## Implementation Notes

1. **Token Security**: Generate tokens using crypto.randomBytes(32).toString('hex')
2. **Token Hashing**: Use bcrypt or similar to hash tokens before storing
3. **Email Templates**: Create branded email templates with verification links
4. **Error Handling**: Provide user-friendly error messages
5. **Logging**: Log all verification activities for security auditing
