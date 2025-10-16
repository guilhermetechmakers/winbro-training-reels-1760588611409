import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle, RotateCcw, Pause, Clock, Zap } from 'lucide-react';
import { useVideoProcessing } from '@/hooks/use-video-processing';
import type { UploadFile, VideoProcessingStatus } from '@/types/video';

interface UploadProgressProps {
  files: UploadFile[];
  onPause: (fileId: string) => void;
  onRetry: (fileId: string) => void;
  onCancel: (fileId: string) => void;
  className?: string;
  processingVideoId?: string;
}

export default function UploadProgress({
  files,
  onPause,
  onRetry,
  onCancel,
  className,
  processingVideoId
}: UploadProgressProps) {
  const { status: processingStatus, isProcessing, retry, cancel } = useVideoProcessing({
    videoId: processingVideoId,
    enableWebSocket: true,
  });
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

  const getProcessingStatusText = (status: VideoProcessingStatus['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'queued':
        return 'Queued for processing';
      case 'processing':
        return 'Processing video...';
      case 'completed':
        return 'Processing complete';
      case 'failed':
        return 'Processing failed';
      default:
        return 'Unknown';
    }
  };

  const getProcessingStatusIcon = (status: VideoProcessingStatus['status']) => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Zap className="h-4 w-4 text-primary animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
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

  if (files.length === 0 && !processingStatus) {
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
        {/* Processing Status */}
        {processingStatus && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getProcessingStatusIcon(processingStatus.status)}
                <div>
                  <p className="text-sm font-medium">Video Processing</p>
                  <p className="text-xs text-muted-foreground">
                    {getProcessingStatusText(processingStatus.status)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {processingStatus.status === 'failed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => retry()}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                
                {isProcessing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancel()}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={processingStatus.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(processingStatus.progress)}% complete</span>
                  <span>{processingStatus.message}</span>
                </div>
              </div>
            )}

            {/* Processing Status Badge */}
            <div className="flex items-center gap-2">
              <Badge 
                variant={processingStatus.status === 'completed' ? 'default' : 
                        processingStatus.status === 'failed' ? 'destructive' : 'secondary'}
              >
                {processingStatus.status}
              </Badge>
              
              {processingStatus.estimatedTimeRemaining && (
                <span className="text-xs text-muted-foreground">
                  ~{Math.round(processingStatus.estimatedTimeRemaining / 60)}m remaining
                </span>
              )}
            </div>

            {/* Error Message */}
            {processingStatus.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{processingStatus.error}</p>
              </div>
            )}

            {/* Success Message */}
            {processingStatus.status === 'completed' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Video processing completed successfully
                </p>
              </div>
            )}
          </div>
        )}

        {/* File Upload Progress */}
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
