import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoStorageService } from '@/services/storage';
import { VideoProcessor } from '@/services/video-processor';
import { VideoProcessingWebSocket } from '@/api/video-processing';
import type { 
  VideoProcessingStatus, 
  UploadProgress, 
  ProcessingJob,
  VideoFormat 
} from '@/types/video';

export interface UseVideoProcessingOptions {
  videoId?: string;
  enableWebSocket?: boolean;
  pollInterval?: number;
  onStatusChange?: (status: VideoProcessingStatus) => void;
  onError?: (error: Error) => void;
}

export interface UseVideoProcessingReturn {
  status: VideoProcessingStatus | null;
  isProcessing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  progress: number;
  message: string;
  error: string | null;
  retry: () => Promise<void>;
  cancel: () => void;
  refresh: () => Promise<void>;
}

/**
 * Hook for tracking video processing status
 */
export function useVideoProcessing(options: UseVideoProcessingOptions = {}): UseVideoProcessingReturn {
  const {
    videoId,
    enableWebSocket = true,
    pollInterval = 2000,
    onStatusChange,
    onError,
  } = options;

  const [status, setStatus] = useState<VideoProcessingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState(false);

  const wsRef = useRef<VideoProcessingWebSocket | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  // Update status and notify callback
  const updateStatus = useCallback((newStatus: VideoProcessingStatus) => {
    setStatus(newStatus);
    setError(newStatus.error || null);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  // Handle errors
  const handleError = useCallback((err: Error) => {
    setError(err.message);
    onError?.(err);
  }, [onError]);

  // Fetch status from API
  const fetchStatus = useCallback(async () => {
    if (!videoId) return;

    try {
      // setIsLoading(true);
      const newStatus = await VideoStorageService.getProcessingStatus(videoId);
      updateStatus(newStatus);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to fetch status'));
    } finally {
      // setIsLoading(false);
    }
  }, [videoId, updateStatus, handleError]);

  // Retry processing
  const retry = useCallback(async () => {
    if (!videoId) return;

    try {
      // setIsLoading(true);
      setError(null);
      await VideoStorageService.retryProcessing(videoId);
      await fetchStatus();
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to retry processing'));
    } finally {
      // setIsLoading(false);
    }
  }, [videoId, fetchStatus, handleError]);

  // Cancel processing
  const cancel = useCallback(() => {
    if (!videoId) return;
    VideoProcessor.cancelProcessing(videoId);
  }, [videoId]);

  // Refresh status
  const refresh = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  // Set up WebSocket connection
  useEffect(() => {
    if (!videoId || !enableWebSocket) return;

    const ws = new VideoProcessingWebSocket(videoId);
    wsRef.current = ws;

    ws.connect((newStatus) => {
      updateStatus(newStatus);
    });

    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, [videoId, enableWebSocket, updateStatus]);

  // Set up polling fallback
  useEffect(() => {
    if (!videoId || enableWebSocket) return;

    const poll = () => {
      fetchStatus();
    };

    pollIntervalRef.current = window.setInterval(poll, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [videoId, enableWebSocket, pollInterval, fetchStatus]);

  // Initial fetch
  useEffect(() => {
    if (videoId) {
      fetchStatus();
    }
  }, [videoId, fetchStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    status,
    isProcessing: status?.status === 'processing' || status?.status === 'uploading',
    isCompleted: status?.status === 'completed',
    isFailed: status?.status === 'failed',
    progress: status?.progress || 0,
    message: status?.message || '',
    error,
    retry,
    cancel,
    refresh,
  };
}

/**
 * Hook for resumable file uploads
 */
export interface UseResumableUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (videoId: string) => void;
  onError?: (error: Error) => void;
}

export interface UseResumableUploadReturn {
  upload: (file: File, metadata: any) => Promise<string>;
  pause: (uploadId: string) => void;
  resume: (uploadId: string, file: File) => Promise<string>;
  cancel: (uploadId: string) => void;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
}

export function useResumableUpload(options: UseResumableUploadOptions = {}): UseResumableUploadReturn {
  const { onProgress, onComplete, onError } = options;
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [, setCurrentUploadId] = useState<string | null>(null);

  const upload = useCallback(async (file: File, metadata: any): Promise<string> => {
    try {
      setIsUploading(true);
      setUploadProgress(null);

      // Validate file
      const config = await VideoStorageService.getStorageConfig();
      const validation = VideoStorageService.validateFile(file, config);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Initiate upload
      const session = await VideoStorageService.initiateUpload(file, metadata);
      setCurrentUploadId(session.uploadId);

      // Upload file with progress tracking
      const processingJobId = await VideoStorageService.uploadFile(
        file,
        session,
        (progress) => {
          setUploadProgress(progress);
          onProgress?.(progress);
        }
      );

      onComplete?.(session.videoId);
      return processingJobId;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      onError?.(error);
      throw error;
    } finally {
      setIsUploading(false);
      setCurrentUploadId(null);
    }
  }, [onProgress, onComplete, onError]);

  const pause = useCallback((uploadId: string) => {
    VideoStorageService.cancelUpload(uploadId);
    setIsUploading(false);
  }, []);

  const resume = useCallback(async (uploadId: string, file: File): Promise<string> => {
    try {
      setIsUploading(true);
      const processingJobId = await VideoStorageService.resumeUpload(uploadId, file, (progress) => {
        setUploadProgress(progress);
        onProgress?.(progress);
      });
      onComplete?.(uploadId);
      return processingJobId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Resume failed');
      onError?.(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [onProgress, onComplete, onError]);

  const cancel = useCallback((uploadId: string) => {
    VideoStorageService.cancelUpload(uploadId);
    setIsUploading(false);
    setUploadProgress(null);
  }, []);

  return {
    upload,
    pause,
    resume,
    cancel,
    isUploading,
    uploadProgress,
  };
}

/**
 * Hook for processing job management
 */
export interface UseProcessingJobsReturn {
  jobs: ProcessingJob[];
  metrics: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    averageProcessingTime: number;
    queueLength: number;
  };
  retryJob: (videoId: string) => Promise<void>;
  cancelJob: (videoId: string) => void;
  refreshJobs: () => void;
}

export function useProcessingJobs(): UseProcessingJobsReturn {
  const [jobs] = useState<ProcessingJob[]>([]);
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    averageProcessingTime: 0,
    queueLength: 0,
  });

  const refreshJobs = useCallback(() => {
    // In a real implementation, this would fetch jobs from the API
    // For now, we'll use the processor's internal state
    const newMetrics = VideoProcessor.getProcessingMetrics();
    setMetrics(newMetrics);
  }, []);

  const retryJob = useCallback(async (videoId: string) => {
    try {
      await VideoProcessor.retryProcessing(videoId);
      refreshJobs();
    } catch (error) {
      console.error('Failed to retry job:', error);
    }
  }, [refreshJobs]);

  const cancelJob = useCallback((videoId: string) => {
    VideoProcessor.cancelProcessing(videoId);
    refreshJobs();
  }, [refreshJobs]);

  // Refresh jobs periodically
  useEffect(() => {
    refreshJobs();
    const interval = setInterval(refreshJobs, 5000); // Every 5 seconds
    return () => window.clearInterval(interval);
  }, [refreshJobs]);

  return {
    jobs,
    metrics,
    retryJob,
    cancelJob,
    refreshJobs,
  };
}

/**
 * Hook for video formats
 */
export interface UseVideoFormatsReturn {
  formats: VideoFormat[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useVideoFormats(videoId?: string): UseVideoFormatsReturn {
  const [formats, setFormats] = useState<VideoFormat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!videoId) return;

    try {
      setIsLoading(true);
      setError(null);
      const videoFormats = await VideoStorageService.getVideoFormats(videoId);
      setFormats(videoFormats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch formats');
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (videoId) {
      refresh();
    }
  }, [videoId, refresh]);

  return {
    formats,
    isLoading,
    error,
    refresh,
  };
}