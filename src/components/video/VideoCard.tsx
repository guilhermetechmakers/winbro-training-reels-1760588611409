import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Eye,
  Star,
  Calendar,
  User,
  MoreVertical,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { useVideoProcessing } from '@/hooks/use-video-processing';
import type { VideoClip } from '@/types/video';

interface VideoCardProps {
  video: VideoClip;
  viewMode: 'grid' | 'list';
  onPlay?: (videoId: string) => void;
  onRetry?: (videoId: string) => void;
  onCancel?: (videoId: string) => void;
}

export default function VideoCard({ 
  video, 
  viewMode, 
  onPlay, 
  onRetry
}: VideoCardProps) {
  const { 
    status: processingStatus, 
    isProcessing, 
    isFailed, 
    progress, 
    message, 
    retry
  } = useVideoProcessing({
    videoId: video.id,
    enableWebSocket: video.status === 'processing',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'queued':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Zap className="h-3 w-3 animate-pulse" />;
      case 'queued':
        return <Clock className="h-3 w-3" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3" />;
      case 'published':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry(video.id);
    } else {
      retry();
    }
  };

  // const handleCancel = () => {
  //   if (onCancel) {
  //     onCancel(video.id);
  //   } else {
  //     cancel();
  //   }
  // };

  if (viewMode === 'grid') {
    return (
      <Card className="group card-hover overflow-hidden">
        <div className="relative aspect-video bg-muted">
          <img
            src={video.thumbnail_url || '/api/placeholder/300/200'}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button 
              size="sm" 
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={() => onPlay?.(video.id)}
              disabled={video.status !== 'published'}
            >
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
          </div>
          <div className="absolute top-2 right-2">
            <Badge className={`${getStatusColor(video.status)} flex items-center gap-1`}>
              {getStatusIcon(video.status)}
              {video.status}
            </Badge>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {video.description}
            </p>
            
            {/* Processing Status */}
            {isProcessing && processingStatus && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{message}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}

            {/* Failed Status with Retry */}
            {isFailed && (
              <div className="space-y-2">
                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  Processing failed
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="w-full text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Retry Processing
                </Button>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {video.view_count}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {video.like_count}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {video.owner_id}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {video.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {video.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{video.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List view
  return (
    <Card className="group card-hover">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={video.thumbnail_url || '/api/placeholder/300/200'}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Button 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white"
                onClick={() => onPlay?.(video.id)}
                disabled={video.status !== 'published'}
              >
                <Play className="h-3 w-3" />
              </Button>
            </div>
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                  {video.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {video.description}
                </p>
                
                {/* Processing Status */}
                {isProcessing && processingStatus && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{message}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>
                )}

                {/* Failed Status with Retry */}
                {isFailed && (
                  <div className="mt-2 space-y-1">
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      Processing failed
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Retry Processing
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge className={`${getStatusColor(video.status)} flex items-center gap-1`}>
                  {getStatusIcon(video.status)}
                  {video.status}
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {video.view_count} views
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {video.like_count}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {video.owner_id}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(video.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {video.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}