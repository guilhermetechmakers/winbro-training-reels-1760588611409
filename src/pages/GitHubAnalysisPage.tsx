import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Github, 
  ArrowLeft, 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Shield,
  Database,
  Wifi
} from 'lucide-react';
import { toast } from 'sonner';

// Import error handling components
import ErrorBoundary from '@/components/error/ErrorBoundary';
import GitHubAnalysisError from '@/components/error/GitHubAnalysisError';
import useGitHubAnalysis from '@/hooks/use-github-analysis';
import type { GitHubAnalysisRequest } from '@/services/github-analysis';

export default function GitHubAnalysisPage() {
  const navigate = useNavigate();
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [branch, setBranch] = useState('main');

  const {
    isLoading,
    isAnalyzing,
    error,
    data,
    retryCount,
    canRetry,
    retryDelay,
    analyze,
    retry,
    cancel,
    reset,
    status,
  } = useGitHubAnalysis({
    onSuccess: (response) => {
      toast.success('Repository analysis completed successfully!');
      console.log('Analysis result:', response);
    },
    onError: (error) => {
      toast.error(`Analysis failed: ${error.message}`);
    },
    onRetry: (attempt) => {
      toast.info(`Retrying analysis (attempt ${attempt})...`);
    },
    onMaxRetriesReached: () => {
      toast.error('Maximum retry attempts reached. Please try again later.');
    },
  });

  const handleAnalyze = async () => {
    if (!repositoryUrl.trim()) {
      toast.error('Please enter a repository URL');
      return;
    }

    const request: GitHubAnalysisRequest = {
      repositoryUrl: repositoryUrl.trim(),
      token: githubToken || undefined,
      branch: branch || 'main',
      includeSubmodules: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      timeout: 300000, // 5 minutes
    };

    await analyze(request);
  };

  const handleRetry = async () => {
    await retry();
  };

  const handleCancel = () => {
    cancel();
    toast.info('Analysis cancelled');
  };

  const handleReset = () => {
    reset();
    setRepositoryUrl('');
    setGithubToken('');
    setBranch('main');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
      case 'analyzing':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Search className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return 'Validating repository access...';
      case 'analyzing':
        return 'Analyzing repository structure and code...';
      case 'success':
        return 'Analysis completed successfully';
      case 'error':
        return 'Analysis failed';
      case 'cancelled':
        return 'Analysis cancelled';
      default:
        return 'Ready to analyze';
    }
  };

  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'timeout':
        return <Clock className="h-4 w-4" />;
      case 'permission':
        return <Shield className="h-4 w-4" />;
      case 'size':
        return <Database className="h-4 w-4" />;
      case 'network':
        return <Wifi className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Show error page if there's an error
  if (error && status === 'error') {
    return (
      <ErrorBoundary
        fallback={
          <GitHubAnalysisError
            onRetry={handleRetry}
            onCancel={handleCancel}
            errorType={error.type}
            retryCount={retryCount}
            maxRetries={3}
          />
        }
      >
        <GitHubAnalysisError
          onRetry={handleRetry}
          onCancel={handleCancel}
          errorType={error.type}
          retryCount={retryCount}
          maxRetries={3}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Github className="h-6 w-6" />
                <h1 className="text-2xl font-bold">GitHub Repository Analysis</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Analysis Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Repository Analysis</CardTitle>
                  <CardDescription>
                    Analyze a GitHub repository to understand its structure, complexity, and maintainability.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Repository URL */}
                  <div className="space-y-2">
                    <Label htmlFor="repositoryUrl">Repository URL *</Label>
                    <Input
                      id="repositoryUrl"
                      value={repositoryUrl}
                      onChange={(e) => setRepositoryUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      disabled={isLoading || isAnalyzing}
                    />
                  </div>

                  {/* GitHub Token */}
                  <div className="space-y-2">
                    <Label htmlFor="githubToken">GitHub Token (Optional)</Label>
                    <Input
                      id="githubToken"
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      disabled={isLoading || isAnalyzing}
                    />
                    <p className="text-xs text-muted-foreground">
                      Required for private repositories. Generate a token with repo access.
                    </p>
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                      disabled={isLoading || isAnalyzing}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAnalyze}
                      disabled={isLoading || isAnalyzing || !repositoryUrl.trim()}
                      className="flex-1 btn-primary"
                    >
                      {isLoading || isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isLoading ? 'Validating...' : 'Analyzing...'}
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Analyze Repository
                        </>
                      )}
                    </Button>

                    {(isLoading || isAnalyzing) && (
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={!isLoading && !isAnalyzing}
                      >
                        Cancel
                      </Button>
                    )}

                    {status === 'error' && (
                      <Button
                        variant="outline"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon()}
                    Analysis Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{getStatusText()}</span>
                    {retryCount > 0 && (
                      <Badge variant="outline">
                        Attempt {retryCount + 1} of 4
                      </Badge>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {(isLoading || isAnalyzing) && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  )}

                  {/* Retry Information */}
                  {error && canRetry && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-800">
                          Next retry in {Math.ceil(retryDelay / 1000)} seconds
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error Details */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        {getErrorIcon(error.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800">{error.message}</p>
                          {error.details && (
                            <p className="text-xs text-red-600 mt-1">{error.details}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {data && data.success && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Repository Info */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Repository Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{data.data?.repository.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Language:</span>
                          <p className="font-medium">{data.data?.repository.language}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Size:</span>
                          <p className="font-medium">
                            {data.data?.repository.size ? 
                              `${(data.data.repository.size / 1024).toFixed(1)} MB` : 
                              'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stars:</span>
                          <p className="font-medium">{data.data?.repository.stars}</p>
                        </div>
                      </div>
                    </div>

                    {/* Analysis Metrics */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Analysis Metrics</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Complexity:</span>
                          <p className="font-medium">{data.data?.analysis.complexity}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Maintainability:</span>
                          <p className="font-medium">{data.data?.analysis.maintainability}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Files:</span>
                          <p className="font-medium">{data.data?.structure.totalFiles}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Directories:</span>
                          <p className="font-medium">{data.data?.structure.totalDirectories}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Use</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">1</span>
                    </div>
                    <p>Enter the GitHub repository URL you want to analyze</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">2</span>
                    </div>
                    <p>Optionally provide a GitHub token for private repositories</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">3</span>
                    </div>
                    <p>Click "Analyze Repository" to start the analysis</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">4</span>
                    </div>
                    <p>View the analysis results and repository metrics</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
