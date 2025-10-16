# Error Handling System

This directory contains a comprehensive error handling system for the Winbro Training Reels application, specifically designed to handle GitHub repository analysis failures and other application errors.

## Components

### ErrorBoundary.tsx
A React error boundary component that catches JavaScript errors anywhere in the child component tree, logs those errors, and displays a fallback UI instead of the component tree that crashed.

**Features:**
- Catches and handles React component errors
- Displays user-friendly error messages
- Provides retry, reload, and navigation options
- Shows detailed error information in development mode
- Logs errors to monitoring services

**Usage:**
```tsx
import ErrorBoundary from '@/components/error/ErrorBoundary';

<ErrorBoundary onError={(error, errorInfo) => console.log(error, errorInfo)}>
  <YourComponent />
</ErrorBoundary>
```

### GitHubAnalysisError.tsx
A specialized error component for GitHub repository analysis failures with specific error types and troubleshooting steps.

**Features:**
- Different error types: timeout, permission, size, network, unknown
- Contextual troubleshooting steps for each error type
- Retry mechanism with exponential backoff
- Visual indicators and progress tracking
- User-friendly error messages

**Error Types:**
- **Timeout**: Repository too large or complex
- **Permission**: Insufficient GitHub token permissions
- **Size**: Repository exceeds size limits
- **Network**: Connection or server issues
- **Unknown**: Unexpected errors

**Usage:**
```tsx
import GitHubAnalysisError from '@/components/error/GitHubAnalysisError';

<GitHubAnalysisError
  onRetry={handleRetry}
  onCancel={handleCancel}
  errorType="timeout"
  retryCount={2}
  maxRetries={3}
/>
```

### ErrorDashboard.tsx
A comprehensive dashboard for monitoring and managing application errors.

**Features:**
- Error metrics and statistics
- Error categorization by type and level
- Recent error logs with details
- Export and clear functionality
- Real-time error monitoring

**Metrics Displayed:**
- Total errors count
- Error rate (errors per hour)
- Average retry count
- Recent errors (last 24 hours)
- Errors by type and severity

## Hooks

### useRetry.ts
A custom hook for implementing retry logic with exponential backoff.

**Features:**
- Configurable retry attempts and delays
- Exponential backoff strategy
- Retry state management
- Callback support for retry events

**Usage:**
```tsx
import { useRetry } from '@/hooks/use-retry';

const { retryCount, isRetrying, canRetry, retry, reset } = useRetry(
  async () => {
    // Your retry logic here
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    onRetry: (attempt) => console.log(`Retry attempt ${attempt}`),
  }
);
```

### useGitHubAnalysis.ts
A specialized hook for GitHub repository analysis with built-in error handling and retry logic.

**Features:**
- Repository analysis with error handling
- Automatic retry for retryable errors
- Progress tracking and status management
- Error logging integration
- Cancellation support

**Usage:**
```tsx
import { useGitHubAnalysis } from '@/hooks/use-github-analysis';

const {
  isLoading,
  isAnalyzing,
  error,
  data,
  retryCount,
  canRetry,
  analyze,
  retry,
  cancel,
  reset,
  status,
} = useGitHubAnalysis({
  onSuccess: (response) => console.log('Success:', response),
  onError: (error) => console.log('Error:', error),
  autoRetry: true,
  maxRetries: 3,
});
```

## Services

### github-analysis.ts
Service for GitHub repository analysis with comprehensive error handling.

**Features:**
- Repository analysis API calls
- Error type detection and classification
- Retry delay calculation
- Access validation
- Metadata retrieval

**Error Handling:**
- HTTP status code mapping to error types
- Retryable vs non-retryable error classification
- Contextual error messages and details
- Rate limiting and timeout handling

### error-logging.ts
Service for comprehensive error logging and monitoring.

**Features:**
- Error logging with context
- Error metrics calculation
- Log retention and cleanup
- Export functionality
- Integration with monitoring services

**Error Log Structure:**
```typescript
interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  retryCount?: number;
  errorType?: string;
}
```

## Error Types and Handling

### GitHub Analysis Errors

1. **Timeout Errors**
   - Repository too large or complex
   - Analysis exceeds time limits
   - Retryable with longer delays

2. **Permission Errors**
   - Invalid or insufficient GitHub token
   - Private repository access denied
   - Not retryable without token update

3. **Size Errors**
   - Repository exceeds size limits
   - File size restrictions
   - Not retryable without configuration change

4. **Network Errors**
   - Connection timeouts
   - Server unavailability
   - Rate limiting
   - Retryable with exponential backoff

5. **Unknown Errors**
   - Unexpected server responses
   - Unhandled error conditions
   - Retryable with caution

### Retry Strategy

The system implements an exponential backoff retry strategy:

- **Initial Delay**: 1 second
- **Backoff Multiplier**: 2x
- **Maximum Delay**: 10 seconds
- **Maximum Retries**: 3 attempts
- **Jitter**: Random variation to prevent thundering herd

### Error Logging

All errors are logged with:
- Unique error ID
- Timestamp and context
- User and session information
- Retry attempt tracking
- Error classification

## Best Practices

1. **Error Boundaries**: Wrap major components with ErrorBoundary
2. **Specific Error Handling**: Use GitHubAnalysisError for analysis failures
3. **Retry Logic**: Implement retry for transient errors only
4. **User Feedback**: Provide clear error messages and next steps
5. **Monitoring**: Use ErrorDashboard for error monitoring and debugging
6. **Logging**: Log errors with sufficient context for debugging

## Integration

The error handling system is integrated throughout the application:

- **App.tsx**: Wrapped with ErrorBoundary
- **GitHub Analysis Page**: Uses specialized error components
- **Error Dashboard**: Accessible via navigation
- **All API Calls**: Integrated with error logging service

## Development

To add new error types or handling:

1. Add error type to `GitHubAnalysisError` component
2. Update error classification in `github-analysis.ts`
3. Add specific handling in `useGitHubAnalysis` hook
4. Update error logging service if needed
5. Test error scenarios and retry logic

## Monitoring

The error handling system provides:

- Real-time error metrics
- Error trend analysis
- Retry success rates
- User impact assessment
- Debugging information

Access the Error Dashboard at `/dashboard/error-dashboard` to monitor application health and error patterns.
