import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, AlertCircle, RotateCcw, Pause } from 'lucide-react';
import type { UploadFile } from '@/types/video';

interface UploadProgressProps {
  files: UploadFile[];
  onPause: (fileId: string) => void;
  onRetry: (fileId: string) => void;
  onCancel: (fileId: string) => void;
  className?: string;
}

export default function UploadProgress({
  files,
  onPause,
  onRetry,
  onCancel,
  className
}: UploadProgressProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <Upload className="h-5 w-5 text-primary animate-pulse" />;
      case 'processing':
        return <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getSpeedText = (file: UploadFile) => {
    // This would be calculated based on actual upload speed
    // For now, we'll show a placeholder
    if (file.status === 'uploading') {
      return '2.5 MB/s';
    }
    return '';
  };

  const getETA = (file: UploadFile) => {
    // This would be calculated based on remaining bytes and current speed
    // For now, we'll show a placeholder
    if (file.status === 'uploading' && file.progress > 0) {
      const remaining = 100 - file.progress;
      const estimatedSeconds = Math.round((remaining / file.progress) * 30); // Rough estimate
      return `${estimatedSeconds}s remaining`;
    }
    return '';
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Progress
        </CardTitle>
        <CardDescription>
          {files.length} file{files.length !== 1 ? 's' : ''} being processed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {files.map((file) => (
          <div key={file.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getStatusIcon(file.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.file.size)}</span>
                    <span>•</span>
                    <span>{getStatusText(file.status)}</span>
                    {file.status === 'uploading' && (
                      <>
                        <span>•</span>
                        <span>{getSpeedText(file)}</span>
                        <span>•</span>
                        <span>{getETA(file)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {file.status === 'uploading' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPause(file.id)}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                
                {file.status === 'error' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRetry(file.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(file.id)}
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {(file.status === 'uploading' || file.status === 'processing') && (
              <div className="space-y-1">
                <Progress value={file.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(file.progress)}% complete</span>
                  <span>{formatFileSize((file.file.size * file.progress) / 100)} of {formatFileSize(file.file.size)}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {file.status === 'error' && file.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{file.error}</p>
              </div>
            )}

            {/* Success Message */}
            {file.status === 'complete' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Upload completed successfully
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
