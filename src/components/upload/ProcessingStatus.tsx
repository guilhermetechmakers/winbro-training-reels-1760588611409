import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  Pause, 
  Clock, 
  Zap,
  Video,
  Image,
  FileText
} from 'lucide-react';
import { useVideoProcessing } from '@/hooks/use-video-processing';
import type { VideoProcessingStatus } from '@/types/video';

interface ProcessingStatusProps {
  videoId: string;
  onComplete?: (videoId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function ProcessingStatus({
  videoId,
  onComplete,
  onError,
  className
}: ProcessingStatusProps) {
  const { 
    status, 
    isProcessing, 
    isCompleted, 
    isFailed, 
    progress, 
    message, 
    error, 
    retry, 
    cancel 
  } = useVideoProcessing({
    videoId,
    enableWebSocket: true,
    onStatusChange: (status) => {
      if (status.status === 'completed') {
        onComplete?.(videoId);
      }
      if (status.status === 'failed' && status.error) {
        onError?.(status.error);
      }
    },
  });

  const getStatusIcon = (status: VideoProcessingStatus['status']) => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'queued':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Zap className="h-5 w-5 text-primary animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Video className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: VideoProcessingStatus['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading video...';
      case 'queued':
        return 'Queued for processing';
      case 'processing':
        return 'Processing video...';
      case 'completed':
        return 'Processing complete';
      case 'failed':
        return 'Processing failed';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = (status: VideoProcessingStatus['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'queued':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProcessingSteps = () => {
    if (!status) return [];
    
    const steps = [
      { id: 'upload', label: 'Upload', icon: Upload, completed: status.status !== 'uploading' },
      { id: 'transcode', label: 'Transcode', icon: Video, completed: status.status === 'completed' },
      { id: 'thumbnails', label: 'Thumbnails', icon: Image, completed: status.status === 'completed' },
      { id: 'transcript', label: 'Transcript', icon: FileText, completed: status.status === 'completed' },
    ];

    return steps;
  };

  if (!status) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(status.status)}
          Video Processing
        </CardTitle>
        <CardDescription>
          {getStatusText(status.status)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge 
            variant={status.status === 'completed' ? 'default' : 
                    status.status === 'failed' ? 'destructive' : 'secondary'}
            className={getStatusColor(status.status)}
          >
            {status.status}
          </Badge>
          
          {status.estimatedTimeRemaining && (
            <span className="text-sm text-muted-foreground">
              ~{Math.round(status.estimatedTimeRemaining / 60)}m remaining
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.round(progress)}% complete</span>
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Processing Steps */}
        {status.status === 'processing' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Processing Steps</h4>
            <div className="grid grid-cols-2 gap-2">
              {getProcessingSteps().map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                    step.completed 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                  <span>{step.label}</span>
                  {step.completed && <CheckCircle className="h-4 w-4 ml-auto" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}

        {/* Success Message */}
        {isCompleted && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Video processing completed successfully
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isFailed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => retry()}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retry Processing
            </Button>
          )}
          
          {isProcessing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancel()}
              className="flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              Cancel Processing
            </Button>
          )}
        </div>

        {/* Processing Result */}
        {status.result && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Processing Result</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Formats:</span>
                <span>{status.result.formats.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thumbnails:</span>
                <span>{status.result.thumbnails.length}</span>
              </div>
              {status.result.transcript && (
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">Transcript:</span>
                  <span className="text-green-600">Generated</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}