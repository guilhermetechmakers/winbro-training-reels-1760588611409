import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';

// Import upload components
import UploadWidget from '@/components/upload/UploadWidget';
import CaptureGuidelines from '@/components/upload/CaptureGuidelines';
import MetadataForm from '@/components/upload/MetadataForm';
import TranscriptEditor from '@/components/upload/TranscriptEditor';
import ThumbnailSelector from '@/components/upload/ThumbnailSelector';
import UploadProgress from '@/components/upload/UploadProgress';
import ProcessingStatus from '@/components/upload/ProcessingStatus';

// Import services
import { UploadService } from '@/services/uploadService';

// Import types
import type { UploadFile, VideoMetadata, AIProcessingResult } from '@/types/video';

type UploadStep = 'upload' | 'metadata' | 'processing' | 'review' | 'complete';

export default function UploadClipPage() {
  const navigate = useNavigate();
  
  // State management
  const [currentStep, setCurrentStep] = useState<UploadStep>('upload');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [metadata, setMetadata] = useState<VideoMetadata>({
    title: '',
    machineModel: '',
    process: '',
    tooling: [],
    step: '',
    tags: [],
    isCustomerSpecific: false,
  });
  const [aiResult, setAiResult] = useState<AIProcessingResult | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingVideoId, setProcessingVideoId] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    const newFile: UploadFile = {
      file,
      id: fileId,
      progress: 0,
      status: 'uploading',
    };

    setFiles(prev => [...prev, newFile]);
    setCurrentStep('metadata');
  }, []);

  // Handle upload completion
  const handleUploadComplete = useCallback((videoId: string) => {
    setProcessingVideoId(videoId);
    setCurrentStep('processing');
  }, []);

  // Handle file removal
  const handleFileRemove = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (files.length === 1) {
      setCurrentStep('upload');
    }
  }, [files.length]);

  // Handle metadata changes
  const handleMetadataChange = useCallback((newMetadata: VideoMetadata) => {
    setMetadata(newMetadata);
  }, []);

  // Handle transcript changes
  const handleTranscriptChange = useCallback((transcript: string) => {
    // Update metadata with new transcript
    setMetadata(prev => ({ ...prev, step: transcript }));
  }, []);

  // Handle tag changes
  const handleTagsChange = useCallback((tags: string[]) => {
    setMetadata(prev => ({ ...prev, tags }));
  }, []);

  // Handle thumbnail selection
  const handleThumbnailSelect = useCallback((thumbnailUrl: string) => {
    setSelectedThumbnail(thumbnailUrl);
  }, []);

  // Handle custom thumbnail upload
  const handleCustomThumbnailUpload = useCallback((file: File) => {
    // In a real implementation, this would upload the custom thumbnail
    const url = URL.createObjectURL(file);
    setSelectedThumbnail(url);
    toast.success('Custom thumbnail uploaded');
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!files[0] || !aiResult) return;

    setIsSubmitting(true);
    try {
      const finalMetadata = {
        ...metadata,
        thumbnailUrl: selectedThumbnail,
      };

      // Publish video
      const response = await UploadService.publishVideo({
        uploadId: files[0].id,
        metadata: finalMetadata,
        publishNow: true,
      });

      setCurrentStep('complete');
      toast.success('Video uploaded successfully!');
      
      // Navigate to video page after a delay
      setTimeout(() => {
        navigate(`/dashboard/video/${response.videoId}`);
      }, 2000);

    } catch (error) {
      console.error('Publish failed:', error);
      toast.error('Failed to publish video. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [files, metadata, selectedThumbnail, aiResult, navigate]);

  // Handle pause/resume/retry/cancel
  const handlePause = useCallback(() => {
    // TODO: Implement pause functionality
    toast.info('Pause functionality not implemented yet');
  }, []);

  const handleRetry = useCallback(() => {
    // TODO: Implement retry functionality
    toast.info('Retry functionality not implemented yet');
  }, []);

  const handleCancel = useCallback((fileId: string) => {
    handleFileRemove(fileId);
  }, [handleFileRemove]);

  const getStepTitle = () => {
    switch (currentStep) {
      case 'upload':
        return 'Upload Video';
      case 'metadata':
        return 'Add Metadata';
      case 'processing':
        return 'Processing Video';
      case 'review':
        return 'Review & Publish';
      case 'complete':
        return 'Upload Complete';
      default:
        return 'Upload Video';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'upload':
        return 'Upload your training video to get started';
      case 'metadata':
        return 'Add details about your video to help others find it';
      case 'processing':
        return 'AI is analyzing your video and generating a transcript';
      case 'review':
        return 'Review the AI-generated content and publish your video';
      case 'complete':
        return 'Your video has been successfully uploaded and published';
      default:
        return '';
    }
  };

  return (
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
            <div>
              <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
              <p className="text-muted-foreground">{getStepDescription()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Guidelines */}
          <div className="lg:col-span-1">
            <CaptureGuidelines />
          </div>

          {/* Center - Upload Widget */}
          <div className="lg:col-span-1">
            {currentStep === 'upload' && (
              <UploadWidget
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                onUploadComplete={handleUploadComplete}
                files={files}
                isUploading={files.some(f => f.status === 'uploading')}
              />
            )}

            {currentStep === 'metadata' && (
              <MetadataForm
                metadata={metadata}
                onChange={handleMetadataChange}
                onSubmit={() => setCurrentStep('processing')}
                isSubmitting={false}
              />
            )}

            {currentStep === 'processing' && processingVideoId && (
              <ProcessingStatus
                videoId={processingVideoId}
                onComplete={(_videoId) => {
                  // In a real implementation, fetch the processing result
                  const mockResult: AIProcessingResult = {
                    transcript: {
                      text: 'Mock transcript for testing',
                      segments: [
                        { start: 0, end: 30, text: 'This is a mock transcript segment' }
                      ]
                    },
                    suggestedTags: [
                      { tag: 'training', confidence: 0.9 },
                      { tag: 'manufacturing', confidence: 0.8 }
                    ],
                    thumbnails: [
                      '/api/thumbnails/1.jpg',
                      '/api/thumbnails/2.jpg',
                      '/api/thumbnails/3.jpg'
                    ]
                  };
                  setAiResult(mockResult);
                  setSelectedThumbnail(mockResult.thumbnails[0] || '');
                  setCurrentStep('review');
                }}
                onError={(error) => {
                  toast.error(`Processing failed: ${error}`);
                  setCurrentStep('upload');
                }}
              />
            )}

            {currentStep === 'review' && aiResult && (
              <div className="space-y-6">
                <TranscriptEditor
                  aiResult={aiResult}
                  onTranscriptChange={handleTranscriptChange}
                  onTagsChange={handleTagsChange}
                />
                
                <ThumbnailSelector
                  thumbnails={aiResult.thumbnails}
                  selectedThumbnail={selectedThumbnail}
                  onThumbnailSelect={handleThumbnailSelect}
                  onCustomUpload={handleCustomThumbnailUpload}
                />

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedThumbnail}
                        className="flex-1 btn-primary"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Publish Video
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 'complete' && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload Complete!</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Your video has been successfully uploaded and published.
                  </p>
                  <Button onClick={() => navigate('/dashboard/library')}>
                    View in Library
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Progress */}
          <div className="lg:col-span-1">
            {files.length > 0 && (
              <UploadProgress
                files={files}
                onPause={handlePause}
                onRetry={handleRetry}
                onCancel={handleCancel}
                processingVideoId={processingVideoId || undefined}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
