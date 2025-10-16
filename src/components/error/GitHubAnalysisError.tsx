import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  Shield, 
  Database,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface GitHubAnalysisErrorProps {
  onRetry: () => void;
  onCancel: () => void;
  errorType?: 'timeout' | 'permission' | 'size' | 'network' | 'unknown';
  retryCount?: number;
  maxRetries?: number;
}

const ERROR_TYPES = {
  timeout: {
    title: 'Repository Analysis Timeout',
    description: 'The repository is too large or complex to analyze within the time limit.',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    suggestions: [
      'Try again in a few minutes',
      'Check if the repository is publicly accessible',
      'Consider analyzing a smaller subset of the repository'
    ]
  },
  permission: {
    title: 'Repository Access Denied',
    description: 'The GitHub token does not have sufficient permissions to access this repository.',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    suggestions: [
      'Verify your GitHub token has the correct permissions',
      'Check if the repository is private and accessible',
      'Ensure the token has read access to the repository'
    ]
  },
  size: {
    title: 'Repository Too Large',
    description: 'The repository exceeds the maximum size limit for analysis.',
    icon: Database,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    suggestions: [
      'Try analyzing a specific branch or directory',
      'Consider using a different analysis approach',
      'Contact support for large repository analysis'
    ]
  },
  network: {
    title: 'Network Connection Error',
    description: 'Unable to connect to GitHub or the request timed out.',
    icon: AlertCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    suggestions: [
      'Check your internet connection',
      'Verify GitHub is accessible',
      'Try again in a few moments'
    ]
  },
  unknown: {
    title: 'Analysis Failed',
    description: 'An unexpected error occurred during repository analysis.',
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    suggestions: [
      'Try again in a few minutes',
      'Check the repository URL and access',
      'Contact support if the issue persists'
    ]
  }
};

export default function GitHubAnalysisError({ 
  onRetry, 
  onCancel, 
  errorType = 'unknown',
  retryCount = 0,
  maxRetries = 3
}: GitHubAnalysisErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const errorConfig = ERROR_TYPES[errorType];
  const IconComponent = errorConfig.icon;
  const canRetry = retryCount < maxRetries;

  const handleRetry = async () => {
    if (!canRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getRetryDelay = () => {
    // Exponential backoff: 2s, 4s, 8s
    return Math.min(2000 * Math.pow(2, retryCount), 10000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 ${errorConfig.bgColor} rounded-full flex items-center justify-center mb-4`}>
            <IconComponent className={`h-8 w-8 ${errorConfig.color}`} />
          </div>
          <CardTitle className="text-2xl">{errorConfig.title}</CardTitle>
          <CardDescription className="text-lg">
            {errorConfig.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Status */}
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Attempt {retryCount + 1} of {maxRetries + 1}
            </Badge>
            {retryCount > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Next retry in {getRetryDelay() / 1000}s
              </Badge>
            )}
          </div>

          {/* Troubleshooting Steps */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Troubleshooting Steps:</h4>
            <ol className="space-y-2">
              {errorConfig.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{suggestion}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {canRetry ? (
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex-1 btn-primary"
              >
                {isRetrying ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleRetry}
                disabled
                variant="outline"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Max Retries Reached
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel Analysis
            </Button>
          </div>

          {/* Additional Help */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Need Help?
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              If you continue to experience issues, please check our documentation or contact support.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" className="h-8">
                <ExternalLink className="h-3 w-3 mr-1" />
                Documentation
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                <ExternalLink className="h-3 w-3 mr-1" />
                Contact Support
              </Button>
            </div>
          </div>

          {/* Success Indicators */}
          {retryCount === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>First attempt - this is normal for large repositories</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
