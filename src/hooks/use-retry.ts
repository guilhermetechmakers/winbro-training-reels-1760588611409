import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: () => void;
}

export interface UseRetryReturn {
  retryCount: number;
  isRetrying: boolean;
  canRetry: boolean;
  retry: () => Promise<void>;
  reset: () => void;
  getRetryDelay: () => number;
}

export function useRetry(
  retryFn: () => Promise<void>,
  options: UseRetryOptions = {}
): UseRetryReturn {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const canRetry = retryCount < maxRetries;

  const getRetryDelay = useCallback(() => {
    return Math.min(
      initialDelay * Math.pow(backoffMultiplier, retryCount),
      maxDelay
    );
  }, [initialDelay, backoffMultiplier, retryCount, maxDelay]);

  const retry = useCallback(async () => {
    if (!canRetry || isRetrying) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      onRetry?.(retryCount + 1);
      await retryFn();
    } catch (error) {
      console.error('Retry attempt failed:', error);
      
      if (retryCount + 1 >= maxRetries) {
        onMaxRetriesReached?.();
      }
    } finally {
      setIsRetrying(false);
    }
  }, [canRetry, isRetrying, retryCount, maxRetries, retryFn, onRetry, onMaxRetriesReached]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return {
    retryCount,
    isRetrying,
    canRetry,
    retry,
    reset,
    getRetryDelay,
  };
}

export default useRetry;
