import { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, FileVideo, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UploadFile } from '@/types/video';

interface UploadWidgetProps {
  onFileSelect: (file: File) => void;
  onFileRemove: (fileId: string) => void;
  files: UploadFile[];
  isUploading: boolean;
  className?: string;
}

export default function UploadWidget({
  onFileSelect,
  onFileRemove,
  files,
  isUploading,
  className
}: UploadWidgetProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const videoFile = droppedFiles.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      onFileSelect(videoFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const handleCameraClick = useCallback(() => {
    // TODO: Implement camera access for direct recording
    console.log('Camera recording not implemented yet');
  }, []);

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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
      case 'processing':
        return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <Card
        className={cn(
          'border-2 border-dashed transition-all duration-200 cursor-pointer',
          isDragOver
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          isUploading && 'pointer-events-none opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {isDragOver ? 'Drop your video here' : 'Upload Training Video'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your video file, or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supported formats: MP4, MOV, AVI, WebM (Max 500MB)
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
              >
                <FileVideo className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCameraClick();
                }}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4 mr-2" />
                Record Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Uploaded Files</h4>
          {files.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(file.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.file.size)} • {file.status}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {file.status === 'uploading' && (
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFileRemove(file.id)}
                    disabled={file.status === 'uploading'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
