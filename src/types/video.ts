export interface VideoClip {
  id: string;
  title: string;
  description?: string;
  duration: number; // in seconds
  thumbnail_url?: string;
  video_url: string;
  transcript?: string;
  tags: string[];
  machine_model?: string;
  process?: string;
  tooling?: string;
  step?: string;
  privacy_level: 'public' | 'organization' | 'private';
  customer_id?: string;
  owner_id: string;
  status: 'draft' | 'processing' | 'review' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  view_count: number;
  like_count: number;
  download_count: number;
}

export interface CreateVideoClipInput {
  title: string;
  description?: string;
  machine_model?: string;
  process?: string;
  tooling?: string;
  step?: string;
  privacy_level: 'public' | 'organization' | 'private';
  customer_id?: string;
  tags: string[];
}

export interface UpdateVideoClipInput {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  machine_model?: string;
  process?: string;
  tooling?: string;
  step?: string;
  privacy_level?: 'public' | 'organization' | 'private';
  status?: 'draft' | 'processing' | 'review' | 'published' | 'archived';
}

export interface VideoUploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

// Upload-specific interfaces
export interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  uploadUrl?: string;
  processingJobId?: string;
  error?: string;
}

export interface VideoMetadata {
  title: string;
  machineModel: string;
  process: string;
  tooling: string[];
  step: string;
  tags: string[];
  isCustomerSpecific: boolean;
  thumbnailUrl?: string;
}

export interface AIProcessingResult {
  transcript: {
    text: string;
    segments: { start: number; end: number; text: string; }[];
  };
  suggestedTags: { tag: string; confidence: number; }[];
  thumbnails: string[];
}

export interface UploadInitiateRequest {
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface UploadInitiateResponse {
  uploadId: string;
  uploadUrl: string;
  resumeUrl?: string;
}

export interface UploadChunkRequest {
  uploadId: string;
  chunkIndex: number;
  chunkData: Blob;
  totalChunks: number;
}

export interface UploadChunkResponse {
  chunkId: string;
  nextChunkOffset: number;
}

export interface UploadCompleteRequest {
  uploadId: string;
  metadata: VideoMetadata;
}

export interface UploadCompleteResponse {
  videoId: string;
  processingJobId: string;
}

export interface ProcessingStatusResponse {
  status: string;
  progress: number;
  result?: AIProcessingResult;
  error?: string;
}

export interface PublishVideoRequest {
  uploadId: string;
  metadata: VideoMetadata;
  publishNow: boolean;
}

export interface PublishVideoResponse {
  videoId: string;
  status: 'published' | 'pending_review';
}

// Enhanced Video Processing Types
export interface VideoProcessingStatus {
  id: string;
  status: 'uploading' | 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
  error?: string;
  result?: {
    videoId: string;
    formats: VideoFormat[];
    thumbnails: string[];
    transcript?: string;
  };
}

export interface VideoFormat {
  id: string;
  format: 'hls' | 'dash' | 'mp4';
  quality: '240p' | '360p' | '480p' | '720p' | '1080p' | '4k';
  filePath: string;
  fileSize: number;
  duration: number;
  bitrate: number;
  resolution: {
    width: number;
    height: number;
  };
}

export interface ResumableUploadSession {
  uploadId: string;
  videoId: string;
  uploadUrl: string;
  resumeUrl: string;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  expiresAt: string;
}

export interface VideoStorageConfig {
  bucket: string;
  region: string;
  cdnUrl: string;
  maxFileSize: number;
  allowedFormats: string[];
}

export interface VideoProcessingConfig {
  enableTranscoding: boolean;
  enableThumbnails: boolean;
  enableTranscription: boolean;
  outputFormats: string[];
  thumbnailCount: number;
  thumbnailTimestamps: number[];
}

export interface UploadProgress {
  videoId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  message: string;
  error?: string;
}

export interface ProcessingJob {
  id: string;
  videoId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  priority: 'high' | 'normal' | 'low';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: {
    formats: VideoFormat[];
    thumbnails: string[];
    transcript?: string;
  };
}

export interface TranscodingJob {
  videoId: string;
  inputPath: string;
  outputFormats: string[];
  priority: 'high' | 'normal' | 'low';
}

export interface VideoUploadRequest {
  file: File;
  metadata: {
    title: string;
    description?: string;
    machineModel: string;
    process: string;
    tags: string[];
    customerAccess?: string[];
  };
}
