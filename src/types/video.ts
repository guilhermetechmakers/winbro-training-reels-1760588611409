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
