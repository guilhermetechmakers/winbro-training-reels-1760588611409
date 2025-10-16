import { videoProcessingApi, VideoProcessingWebSocket } from '@/api/video-processing';
import type { 
  ResumableUploadSession, 
  VideoProcessingStatus, 
  VideoFormat,
  VideoStorageConfig 
} from '@/types/video';

export interface UploadProgress {
  videoId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  message: string;
  error?: string;
}

export interface ChunkUploadResult {
  success: boolean;
  chunkIndex: number;
  error?: string;
}

export class VideoStorageService {
  // private static readonly CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  private static uploadSessions = new Map<string, ResumableUploadSession>();
  private static activeUploads = new Map<string, AbortController>();

  /**
   * Initiate resumable upload session
   */
  static async initiateUpload(
    file: File,
    metadata: {
      title: string;
      description?: string;
      machineModel: string;
      process: string;
      tags: string[];
      customerAccess?: string[];
    }
  ): Promise<ResumableUploadSession> {
    const request = {
      file,
      metadata,
    };

    const session = await videoProcessingApi.initiateUpload(request);
    
    // Store session for potential resume
    this.uploadSessions.set(session.uploadId, session);
    
    return session;
  }

  /**
   * Upload file in chunks with progress tracking and resume capability
   */
  static async uploadFile(
    file: File,
    session: ResumableUploadSession,
    onProgress?: (progress: UploadProgress) => void,
    onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
  ): Promise<string> {
    const { uploadId, videoId, chunkSize, totalChunks, uploadedChunks } = session;
    
    // Create abort controller for this upload
    const abortController = new AbortController();
    this.activeUploads.set(uploadId, abortController);

    try {
      // Calculate which chunks need to be uploaded
      const chunksToUpload = [];
      for (let i = 0; i < totalChunks; i++) {
        if (!uploadedChunks.includes(i)) {
          chunksToUpload.push(i);
        }
      }

      // Upload missing chunks
      for (const chunkIndex of chunksToUpload) {
        if (abortController.signal.aborted) {
          throw new Error('Upload cancelled');
        }

        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const result = await this.uploadChunkWithRetry(
          uploadId,
          videoId,
          chunk,
          chunkIndex,
          totalChunks,
          abortController.signal
        );

        if (!result.success) {
          throw new Error(result.error || 'Chunk upload failed');
        }

        // Update progress
        const progress = ((chunkIndex + 1) / totalChunks) * 100;
        onProgress?.({
          videoId,
          progress,
          status: 'uploading',
          message: `Uploading chunk ${chunkIndex + 1} of ${totalChunks}`,
        });

        onChunkComplete?.(chunkIndex, totalChunks);
      }

      // Complete upload
      const { processingJobId } = await videoProcessingApi.completeUpload(uploadId, videoId);
      
      onProgress?.({
        videoId,
        progress: 100,
        status: 'processing',
        message: 'Upload complete, starting processing...',
      });

      // Clean up
      this.uploadSessions.delete(uploadId);
      this.activeUploads.delete(uploadId);

      return processingJobId;

    } catch (error) {
      // Clean up on error
      this.activeUploads.delete(uploadId);
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onProgress?.({
        videoId,
        progress: 0,
        status: 'failed',
        message: 'Upload failed',
        error: errorMessage,
      });

      throw error;
    }
  }

  /**
   * Upload single chunk with retry logic
   */
  private static async uploadChunkWithRetry(
    uploadId: string,
    videoId: string,
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    signal: AbortSignal
  ): Promise<ChunkUploadResult> {
    let lastError: string | undefined;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      if (signal.aborted) {
        return { success: false, chunkIndex, error: 'Upload cancelled' };
      }

      try {
        await videoProcessingApi.uploadChunk({
          uploadId,
          videoId,
          chunkData: chunk,
          chunkIndex,
          totalChunks,
        });

        return { success: true, chunkIndex };
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        
        if (attempt < this.MAX_RETRIES - 1) {
          // Wait before retry with exponential backoff
          const delay = this.RETRY_DELAY * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return { success: false, chunkIndex, error: lastError };
  }

  /**
   * Resume interrupted upload
   */
  static async resumeUpload(
    uploadId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const session = this.uploadSessions.get(uploadId);
    if (!session) {
      throw new Error('Upload session not found');
    }

    return this.uploadFile(file, session, onProgress);
  }

  /**
   * Cancel active upload
   */
  static cancelUpload(uploadId: string): void {
    const abortController = this.activeUploads.get(uploadId);
    if (abortController) {
      abortController.abort();
      this.activeUploads.delete(uploadId);
    }
  }

  /**
   * Get upload session for resume
   */
  static getUploadSession(uploadId: string): ResumableUploadSession | undefined {
    return this.uploadSessions.get(uploadId);
  }

  /**
   * Generate signed URL for video access
   */
  static async generateSignedUrl(videoPath: string): Promise<string> {
    const response = await videoProcessingApi.getPreviewUrl(videoPath);
    return response.previewUrl;
  }

  /**
   * Get video formats
   */
  static async getVideoFormats(videoId: string): Promise<VideoFormat[]> {
    return videoProcessingApi.getVideoFormats(videoId);
  }

  /**
   * Delete video and all associated files
   */
  static async deleteVideo(videoId: string): Promise<void> {
    await videoProcessingApi.deleteVideo(videoId);
  }

  /**
   * Get storage configuration
   */
  static async getStorageConfig(): Promise<VideoStorageConfig> {
    return videoProcessingApi.getStorageConfig();
  }

  /**
   * Monitor video processing with WebSocket
   */
  static createProcessingMonitor(
    videoId: string,
    _onStatusUpdate: (status: VideoProcessingStatus) => void
  ): VideoProcessingWebSocket {
    return new VideoProcessingWebSocket(videoId);
  }

  /**
   * Get processing status
   */
  static async getProcessingStatus(videoId: string): Promise<VideoProcessingStatus> {
    return videoProcessingApi.getProcessingStatus(videoId);
  }

  /**
   * Retry failed processing
   */
  static async retryProcessing(videoId: string): Promise<string> {
    const response = await videoProcessingApi.retryProcessing(videoId);
    return response.processingJobId;
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File, config: VideoStorageConfig): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > config.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(config.maxFileSize)}`,
      };
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !config.allowedFormats.includes(fileExtension)) {
      return {
        valid: false,
        error: `File format not supported. Allowed formats: ${config.allowedFormats.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Calculate upload progress
   */
  static calculateProgress(uploadedChunks: number[], totalChunks: number): number {
    return (uploadedChunks.length / totalChunks) * 100;
  }

  /**
   * Estimate upload time remaining
   */
  static estimateTimeRemaining(
    progress: number,
    startTime: number,
    currentTime: number
  ): number {
    if (progress <= 0) return 0;
    
    const elapsed = (currentTime - startTime) / 1000; // seconds
    const rate = progress / elapsed; // progress per second
    const remaining = (100 - progress) / rate; // seconds remaining
    
    return Math.round(remaining);
  }
}