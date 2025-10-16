import { api } from '@/lib/api';

// Video Processing Types
export interface VideoUploadRequest {
  file: File;
  metadata: {
    title: string;
    description?: string;
    machineModel: string;
    process: string;
    tags: string[];
    customerAccess?: string[];
  };
}

export interface VideoProcessingStatus {
  id: string;
  status: 'uploading' | 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
  error?: string;
  result?: {
    videoId: string;
    formats: VideoFormat[];
    thumbnails: string[];
    transcript?: string;
  };
}

export interface VideoFormat {
  id: string;
  format: 'hls' | 'dash' | 'mp4';
  quality: '240p' | '360p' | '480p' | '720p' | '1080p' | '4k';
  filePath: string;
  fileSize: number;
  duration: number;
  bitrate: number;
  resolution: {
    width: number;
    height: number;
  };
}

export interface TranscodingJob {
  videoId: string;
  inputPath: string;
  outputFormats: string[];
  priority: 'high' | 'normal' | 'low';
}

export interface VideoStorageConfig {
  bucket: string;
  region: string;
  cdnUrl: string;
  maxFileSize: number;
  allowedFormats: string[];
}

export interface ResumableUploadSession {
  uploadId: string;
  videoId: string;
  uploadUrl: string;
  resumeUrl: string;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  expiresAt: string;
}

export interface UploadChunkRequest {
  uploadId: string;
  chunkIndex: number;
  chunkData: Blob;
  totalChunks: number;
  videoId: string;
}

export interface UploadChunkResponse {
  chunkId: string;
  nextChunkOffset: number;
  isComplete: boolean;
}

export interface VideoProcessingConfig {
  enableTranscoding: boolean;
  enableThumbnails: boolean;
  enableTranscription: boolean;
  outputFormats: string[];
  thumbnailCount: number;
  thumbnailTimestamps: number[];
}

// Video Processing API
export const videoProcessingApi = {
  /**
   * Initiate video upload with metadata
   */
  initiateUpload: async (request: VideoUploadRequest): Promise<ResumableUploadSession> => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('metadata', JSON.stringify(request.metadata));
    
    return api.post<ResumableUploadSession>('/videos/upload/initiate', formData);
  },

  /**
   * Upload file chunk
   */
  uploadChunk: async (request: UploadChunkRequest): Promise<UploadChunkResponse> => {
    const formData = new FormData();
    formData.append('chunk', request.chunkData);
    formData.append('chunkIndex', request.chunkIndex.toString());
    formData.append('totalChunks', request.totalChunks.toString());
    formData.append('videoId', request.videoId);
    
    return api.post<UploadChunkResponse>(`/videos/upload/${request.uploadId}/chunk`, formData);
  },

  /**
   * Complete upload and start processing
   */
  completeUpload: async (uploadId: string, videoId: string): Promise<{ processingJobId: string }> => {
    return api.post<{ processingJobId: string }>(`/videos/upload/${uploadId}/complete`, {
      videoId,
    });
  },

  /**
   * Get video processing status
   */
  getProcessingStatus: async (videoId: string): Promise<VideoProcessingStatus> => {
    return api.get<VideoProcessingStatus>(`/videos/${videoId}/status`);
  },

  /**
   * Retry failed processing
   */
  retryProcessing: async (videoId: string): Promise<{ processingJobId: string }> => {
    return api.post<{ processingJobId: string }>(`/videos/${videoId}/retry`, {});
  },

  /**
   * Get video preview URL
   */
  getPreviewUrl: async (videoId: string): Promise<{ previewUrl: string }> => {
    return api.get<{ previewUrl: string }>(`/videos/${videoId}/preview`);
  },

  /**
   * Get video formats
   */
  getVideoFormats: async (videoId: string): Promise<VideoFormat[]> => {
    return api.get<VideoFormat[]>(`/videos/${videoId}/formats`);
  },

  /**
   * Delete video and all associated files
   */
  deleteVideo: async (videoId: string): Promise<void> => {
    await api.delete(`/videos/${videoId}`);
  },

  /**
   * Get storage configuration
   */
  getStorageConfig: async (): Promise<VideoStorageConfig> => {
    return api.get<VideoStorageConfig>('/videos/storage/config');
  },

  /**
   * Get processing configuration
   */
  getProcessingConfig: async (): Promise<VideoProcessingConfig> => {
    return api.get<VideoProcessingConfig>('/videos/processing/config');
  },

  /**
   * Update processing configuration
   */
  updateProcessingConfig: async (config: Partial<VideoProcessingConfig>): Promise<VideoProcessingConfig> => {
    return api.put<VideoProcessingConfig>('/videos/processing/config', config);
  },
};

// WebSocket connection for real-time updates
export class VideoProcessingWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private videoId: string;

  constructor(videoId: string) {
    this.videoId = videoId;
  }

  connect(onStatusUpdate: (status: VideoProcessingStatus) => void): void {
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:3000'}/videos/${this.videoId}/status`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected for video processing');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const status: VideoProcessingStatus = JSON.parse(event.data);
        onStatusUpdate(status);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(onStatusUpdate);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect(onStatusUpdate: (status: VideoProcessingStatus) => void): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket (attempt ${this.reconnectAttempts})`);
        this.connect(onStatusUpdate);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(message: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}