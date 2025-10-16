import { api } from '@/lib/api';
import type {
  UploadInitiateRequest,
  UploadInitiateResponse,
  UploadCompleteRequest,
  UploadCompleteResponse,
  PublishVideoRequest,
  PublishVideoResponse,
} from '@/types/video';

export class UploadService {
  private static readonly CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

  /**
   * Initiate upload session
   */
  static async initiateUpload(request: UploadInitiateRequest): Promise<UploadInitiateResponse> {
    return api.post<UploadInitiateResponse>('/upload/initiate', request);
  }

  /**
   * Upload file in chunks with progress tracking
   */
  static async uploadFile(
    file: File,
    uploadUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * this.CHUNK_SIZE;
      const end = Math.min(start + this.CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed at chunk ${chunkIndex}: ${response.statusText}`);
      }
      
      const progress = ((chunkIndex + 1) / totalChunks) * 100;
      onProgress?.(progress);
    }
  }

  /**
   * Complete upload and start processing
   */
  static async completeUpload(request: UploadCompleteRequest): Promise<UploadCompleteResponse> {
    return api.post<UploadCompleteResponse>('/upload/complete', request);
  }

  /**
   * Publish video or submit for review
   */
  static async publishVideo(request: PublishVideoRequest): Promise<PublishVideoResponse> {
    return api.post<PublishVideoResponse>('/videos', request);
  }

  /**
   * Cancel upload
   */
  static async cancelUpload(uploadId: string): Promise<void> {
    await api.delete(`/upload/${uploadId}`);
  }

  /**
   * Resume interrupted upload
   */
  static async resumeUpload(uploadId: string, resumeUrl: string): Promise<void> {
    await api.post(`/upload/${uploadId}/resume`, { resumeUrl });
  }
}
