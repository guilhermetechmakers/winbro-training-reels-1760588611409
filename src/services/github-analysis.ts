import { api } from '@/lib/api';

export interface GitHubAnalysisRequest {
  repositoryUrl: string;
  token?: string;
  branch?: string;
  includeSubmodules?: boolean;
  maxFileSize?: number;
  timeout?: number;
}

export interface GitHubAnalysisResponse {
  success: boolean;
  data?: {
    repository: {
      name: string;
      fullName: string;
      description: string;
      language: string;
      size: number;
      stars: number;
      forks: number;
      lastCommit: string;
    };
    files: Array<{
      path: string;
      size: number;
      language: string;
      lastModified: string;
    }>;
    structure: {
      directories: string[];
      files: string[];
      totalFiles: number;
      totalDirectories: number;
    };
    analysis: {
      complexity: number;
      maintainability: number;
      testCoverage?: number;
      securityIssues?: number;
    };
  };
  error?: {
    type: 'timeout' | 'permission' | 'size' | 'network' | 'unknown';
    message: string;
    details?: string;
  };
  retryAfter?: number;
}

export interface GitHubAnalysisError {
  type: 'timeout' | 'permission' | 'size' | 'network' | 'unknown';
  message: string;
  details?: string;
  retryAfter?: number;
}

export class GitHubAnalysisService {
  private static readonly RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

  /**
   * Analyze a GitHub repository
   */
  static async analyzeRepository(
    request: GitHubAnalysisRequest
  ): Promise<GitHubAnalysisResponse> {
    try {
      const response = await api.post<GitHubAnalysisResponse>('/github/analyze', request);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get analysis status for a running job
   */
  static async getAnalysisStatus(jobId: string): Promise<GitHubAnalysisResponse> {
    try {
      const response = await api.get<GitHubAnalysisResponse>(`/github/analysis/${jobId}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a running analysis
   */
  static async cancelAnalysis(jobId: string): Promise<void> {
    try {
      await api.delete(`/github/analysis/${jobId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate repository access
   */
  static async validateAccess(repositoryUrl: string, token?: string): Promise<boolean> {
    try {
      const response = await api.post<{ valid: boolean }>('/github/validate', {
        repositoryUrl,
        token
      });
      return response.valid;
    } catch (error) {
      console.error('Repository access validation failed:', error);
      return false;
    }
  }

  /**
   * Get repository metadata without full analysis
   */
  static async getRepositoryMetadata(repositoryUrl: string): Promise<{
    name: string;
    fullName: string;
    description: string;
    language: string;
    size: number;
    stars: number;
    forks: number;
    lastCommit: string;
    isPrivate: boolean;
  }> {
    try {
      const response = await api.post<{
        name: string;
        fullName: string;
        description: string;
        language: string;
        size: number;
        stars: number;
        forks: number;
        lastCommit: string;
        isPrivate: boolean;
      }>('/github/metadata', { repositoryUrl });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors and convert to standardized error format
   */
  private static handleError(error: any): GitHubAnalysisError {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 408:
        case 504:
          return {
            type: 'timeout',
            message: 'Repository analysis timed out',
            details: 'The repository is too large or complex to analyze within the time limit.',
            retryAfter: 30000 // 30 seconds
          };

        case 401:
        case 403:
          return {
            type: 'permission',
            message: 'Repository access denied',
            details: 'The GitHub token does not have sufficient permissions to access this repository.',
            retryAfter: 0
          };

        case 413:
          return {
            type: 'size',
            message: 'Repository too large',
            details: 'The repository exceeds the maximum size limit for analysis.',
            retryAfter: 0
          };

        case 429:
          return {
            type: 'network',
            message: 'Rate limit exceeded',
            details: 'Too many requests. Please try again later.',
            retryAfter: data.retryAfter || 60000 // 1 minute default
          };

        case 500:
        case 502:
        case 503:
          return {
            type: 'network',
            message: 'Server error',
            details: 'The analysis service is temporarily unavailable.',
            retryAfter: 30000 // 30 seconds
          };

        default:
          return {
            type: 'unknown',
            message: data?.message || 'Analysis failed',
            details: data?.details || 'An unexpected error occurred during repository analysis.',
            retryAfter: 60000 // 1 minute
          };
      }
    }

    if (error.request) {
      return {
        type: 'network',
        message: 'Network connection error',
        details: 'Unable to connect to the analysis service. Please check your internet connection.',
        retryAfter: 10000 // 10 seconds
      };
    }

    return {
      type: 'unknown',
      message: 'Analysis failed',
      details: error.message || 'An unexpected error occurred.',
      retryAfter: 60000 // 1 minute
    };
  }

  /**
   * Check if an error is retryable
   */
  static isRetryableError(error: GitHubAnalysisError): boolean {
    return ['timeout', 'network'].includes(error.type);
  }

  /**
   * Get retry delay for an error
   */
  static getRetryDelay(error: GitHubAnalysisError, attempt: number): number {
    if (error.retryAfter) {
      return error.retryAfter;
    }

    const baseDelay = this.RETRY_DELAYS[Math.min(attempt - 1, this.RETRY_DELAYS.length - 1)];
    return baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
  }
}

export default GitHubAnalysisService;
