import { api } from '@/lib/api';
import type { ProcessingStatusResponse } from '@/types/video';

export class VideoProcessingService {
  /**
   * Get processing status for a job
   */
  static async getProcessingStatus(jobId: string): Promise<ProcessingStatusResponse> {
    return api.get<ProcessingStatusResponse>(`/processing/status/${jobId}`);
  }

  /**
   * Poll processing status with exponential backoff
   */
  static async pollProcessingStatus(
    jobId: string,
    onUpdate: (status: ProcessingStatusResponse) => void,
    maxAttempts: number = 30
  ): Promise<ProcessingStatusResponse> {
    let attempts = 0;
    let delay = 1000; // Start with 1 second

    while (attempts < maxAttempts) {
      try {
        const status = await this.getProcessingStatus(jobId);
        onUpdate(status);

        if (status.status === 'completed' || status.status === 'failed') {
          return status;
        }

        // Exponential backoff with jitter
        await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 1000));
        delay = Math.min(delay * 1.5, 10000); // Max 10 seconds
        attempts++;
      } catch (error) {
        console.error('Error polling processing status:', error);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, 10000);
        attempts++;
      }
    }

    throw new Error('Processing timeout - maximum attempts reached');
  }

  /**
   * Retry failed processing job
   */
  static async retryProcessing(jobId: string): Promise<void> {
    await api.post(`/processing/${jobId}/retry`, {});
  }

  /**
   * Cancel processing job
   */
  static async cancelProcessing(jobId: string): Promise<void> {
    await api.delete(`/processing/${jobId}`);
  }
}
