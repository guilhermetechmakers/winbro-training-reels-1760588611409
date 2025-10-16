export interface ErrorLog {
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

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByLevel: Record<string, number>;
  recentErrors: ErrorLog[];
  errorRate: number;
  averageRetryCount: number;
}

export class ErrorLoggingService {
  private static readonly STORAGE_KEY = 'error_logs';
  private static readonly MAX_LOGS = 1000;
  private static readonly RETENTION_DAYS = 30;

  /**
   * Log an error with context
   */
  static logError(
    error: Error | string,
    context?: Record<string, any>,
    level: 'error' | 'warning' | 'info' = 'error'
  ): string {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.saveErrorLog(errorLog);
    this.sendToMonitoring(errorLog);

    return errorLog.id;
  }

  /**
   * Log a GitHub analysis error specifically
   */
  static logGitHubAnalysisError(
    error: {
      type: string;
      message: string;
      details?: string;
    },
    context?: Record<string, any>
  ): string {
    return this.logError(
      `GitHub Analysis Error: ${error.message}`,
      {
        ...context,
        errorType: 'github_analysis',
        githubErrorType: error.type,
        githubErrorDetails: error.details,
      },
      'error'
    );
  }

  /**
   * Log a retry attempt
   */
  static logRetryAttempt(
    operation: string,
    attempt: number,
    maxAttempts: number,
    error?: Error
  ): string {
    return this.logError(
      `Retry attempt ${attempt}/${maxAttempts} for ${operation}`,
      {
        operation,
        attempt,
        maxAttempts,
        errorType: 'retry',
        originalError: error?.message,
      },
      'info'
    );
  }

  /**
   * Get error metrics
   */
  static getErrorMetrics(): ErrorMetrics {
    const logs = this.getErrorLogs();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentLogs = logs.filter(log => log.timestamp > oneDayAgo);
    const errorsByType: Record<string, number> = {};
    const errorsByLevel: Record<string, number> = {};
    let totalRetryCount = 0;
    let retryCount = 0;

    logs.forEach(log => {
      errorsByType[log.errorType || 'unknown'] = (errorsByType[log.errorType || 'unknown'] || 0) + 1;
      errorsByLevel[log.level] = (errorsByLevel[log.level] || 0) + 1;
      
      if (log.retryCount) {
        totalRetryCount += log.retryCount;
        retryCount++;
      }
    });

    return {
      totalErrors: logs.length,
      errorsByType,
      errorsByLevel,
      recentErrors: recentLogs.slice(-10),
      errorRate: recentLogs.length / 24, // errors per hour
      averageRetryCount: retryCount > 0 ? totalRetryCount / retryCount : 0,
    };
  }

  /**
   * Get error logs
   */
  static getErrorLogs(): ErrorLog[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const logs = JSON.parse(stored);
      return logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));
    } catch (error) {
      console.error('Failed to get error logs:', error);
      return [];
    }
  }

  /**
   * Clear old error logs
   */
  static clearOldLogs(): void {
    const logs = this.getErrorLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.RETENTION_DAYS);
    
    const filteredLogs = logs.filter(log => log.timestamp > cutoffDate);
    this.saveErrorLogs(filteredLogs);
  }

  /**
   * Clear all error logs
   */
  static clearAllLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Export error logs
   */
  static exportLogs(): string {
    const logs = this.getErrorLogs();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Save error log to localStorage
   */
  private static saveErrorLog(errorLog: ErrorLog): void {
    const logs = this.getErrorLogs();
    logs.push(errorLog);
    
    // Keep only the most recent logs
    if (logs.length > this.MAX_LOGS) {
      logs.splice(0, logs.length - this.MAX_LOGS);
    }
    
    this.saveErrorLogs(logs);
  }

  /**
   * Save error logs to localStorage
   */
  private static saveErrorLogs(logs: ErrorLog[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save error logs:', error);
    }
  }

  /**
   * Send error to monitoring service
   */
  private static sendToMonitoring(errorLog: ErrorLog): void {
    // In a real application, this would send to a monitoring service like Sentry, LogRocket, etc.
    if (import.meta.env.DEV) {
      console.group('Error Logged');
      console.log('ID:', errorLog.id);
      console.log('Level:', errorLog.level);
      console.log('Message:', errorLog.message);
      console.log('Context:', errorLog.context);
      console.log('Stack:', errorLog.stack);
      console.groupEnd();
    }

    // Example: Send to external monitoring service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorLog),
    // }).catch(console.error);
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current user ID
   */
  private static getCurrentUserId(): string | undefined {
    // In a real application, this would get the user ID from auth context
    return localStorage.getItem('user_id') || undefined;
  }

  /**
   * Get session ID
   */
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
}

export default ErrorLoggingService;
