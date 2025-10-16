import { useState, useCallback } from 'react';
import { useRetry } from './use-retry';
import GitHubAnalysisService, { 
  type GitHubAnalysisRequest, 
  type GitHubAnalysisResponse, 
  type GitHubAnalysisError 
} from '@/services/github-analysis';
import ErrorLoggingService from '@/services/error-logging';

export interface UseGitHubAnalysisOptions {
  onSuccess?: (response: GitHubAnalysisResponse) => void;
  onError?: (error: GitHubAnalysisError) => void;
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: () => void;
  autoRetry?: boolean;
  maxRetries?: number;
}

export interface UseGitHubAnalysisReturn {
  // State
  isLoading: boolean;
  isAnalyzing: boolean;
  isRetrying: boolean;
  error: GitHubAnalysisError | null;
  data: GitHubAnalysisResponse | null;
  
  // Retry state
  retryCount: number;
  canRetry: boolean;
  retryDelay: number;
  
  // Actions
  analyze: (request: GitHubAnalysisRequest) => Promise<void>;
  retry: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
  
  // Status
  status: 'idle' | 'loading' | 'analyzing' | 'success' | 'error' | 'cancelled';
}

export function useGitHubAnalysis(
  options: UseGitHubAnalysisOptions = {}
): UseGitHubAnalysisReturn {
  const {
    onSuccess,
    onError,
    onRetry,
    onMaxRetriesReached,
    autoRetry = true,
    maxRetries = 3,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<GitHubAnalysisError | null>(null);
  const [data, setData] = useState<GitHubAnalysisResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'analyzing' | 'success' | 'error' | 'cancelled'>('idle');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Retry logic
  const retryFn = useCallback(async () => {
    if (!currentJobId) return;
    
    try {
      const response = await GitHubAnalysisService.getAnalysisStatus(currentJobId);
      
      if (response.success) {
        setData(response);
        setError(null);
        setStatus('success');
        onSuccess?.(response);
      } else if (response.error) {
        const analysisError = response.error as GitHubAnalysisError;
        setError(analysisError);
        setStatus('error');
        onError?.(analysisError);
      }
    } catch (err) {
      const analysisError = err as GitHubAnalysisError;
      setError(analysisError);
      setStatus('error');
      onError?.(analysisError);
    }
  }, [currentJobId, onSuccess, onError]);

  const {
    retryCount,
    isRetrying,
    canRetry,
    retry,
    reset: resetRetry,
    getRetryDelay,
  } = useRetry(retryFn, {
    maxRetries,
    onRetry: (attempt) => {
      ErrorLoggingService.logRetryAttempt('github_analysis', attempt, maxRetries);
      onRetry?.(attempt);
    },
    onMaxRetriesReached: () => {
      ErrorLoggingService.logError('Maximum retry attempts reached for GitHub analysis', {
        operation: 'github_analysis',
        maxRetries,
        retryCount
      });
      onMaxRetriesReached?.();
    },
  });

  const retryDelay = getRetryDelay();

  // Analyze repository
  const analyze = useCallback(async (request: GitHubAnalysisRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      setData(null);
      setStatus('loading');
      resetRetry();

      // Validate access first
      const hasAccess = await GitHubAnalysisService.validateAccess(
        request.repositoryUrl,
        request.token
      );

      if (!hasAccess) {
        const accessError: GitHubAnalysisError = {
          type: 'permission',
          message: 'Repository access denied',
          details: 'Unable to access the repository. Please check your permissions.',
        };
        setError(accessError);
        setStatus('error');
        onError?.(accessError);
        return;
      }

      // Start analysis
      setStatus('analyzing');
      setIsAnalyzing(true);
      
      const response = await GitHubAnalysisService.analyzeRepository(request);
      
      if (response.success) {
        setData(response);
        setError(null);
        setStatus('success');
        onSuccess?.(response);
      } else if (response.error) {
        const analysisError = response.error as GitHubAnalysisError;
        setError(analysisError);
        setStatus('error');
        
        // Log the error
        ErrorLoggingService.logGitHubAnalysisError(analysisError, {
          repositoryUrl: request.repositoryUrl,
          retryCount,
          operation: 'analyze_repository'
        });
        
        onError?.(analysisError);
        
        // Auto-retry if enabled and error is retryable
        if (autoRetry && GitHubAnalysisService.isRetryableError(analysisError)) {
          setTimeout(() => {
            retry();
          }, GitHubAnalysisService.getRetryDelay(analysisError, retryCount + 1));
        }
      }
    } catch (err) {
      const analysisError = err as GitHubAnalysisError;
      setError(analysisError);
      setStatus('error');
      
      // Log the error
      ErrorLoggingService.logGitHubAnalysisError(analysisError, {
        repositoryUrl: request.repositoryUrl,
        retryCount,
        operation: 'analyze_repository'
      });
      
      onError?.(analysisError);
      
      // Auto-retry if enabled and error is retryable
      if (autoRetry && GitHubAnalysisService.isRetryableError(analysisError)) {
        setTimeout(() => {
          retry();
        }, GitHubAnalysisService.getRetryDelay(analysisError, retryCount + 1));
      }
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  }, [onSuccess, onError, autoRetry, retry, retryCount, resetRetry]);

  // Cancel analysis
  const cancel = useCallback(async () => {
    if (currentJobId) {
      try {
        await GitHubAnalysisService.cancelAnalysis(currentJobId);
      } catch (error) {
        console.error('Failed to cancel analysis:', error);
      }
    }
    
    setCurrentJobId(null);
    setIsLoading(false);
    setIsAnalyzing(false);
    setStatus('cancelled');
  }, [currentJobId]);

  // Reset state
  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setIsLoading(false);
    setIsAnalyzing(false);
    setStatus('idle');
    setCurrentJobId(null);
    resetRetry();
  }, [resetRetry]);

  // Handle retry with error handling
  const handleRetry = useCallback(async () => {
    if (!canRetry || isRetrying) return;
    
    try {
      await retry();
    } catch (err) {
      const analysisError = err as GitHubAnalysisError;
      setError(analysisError);
      setStatus('error');
      onError?.(analysisError);
    }
  }, [canRetry, isRetrying, retry, onError]);

  return {
    // State
    isLoading,
    isAnalyzing,
    isRetrying,
    error,
    data,
    
    // Retry state
    retryCount,
    canRetry,
    retryDelay,
    
    // Actions
    analyze,
    retry: handleRetry,
    cancel,
    reset,
    
    // Status
    status,
  };
}

export default useGitHubAnalysis;
