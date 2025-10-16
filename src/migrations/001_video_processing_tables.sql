-- Video Processing Tables Migration
-- This migration creates the necessary tables for video processing and storage

-- Video processing jobs table
CREATE TABLE IF NOT EXISTS video_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  message TEXT,
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_details JSONB,
  processing_config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Video formats table
CREATE TABLE IF NOT EXISTS video_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL,
  format VARCHAR(10) NOT NULL CHECK (format IN ('hls', 'dash', 'mp4')),
  quality VARCHAR(10) NOT NULL CHECK (quality IN ('240p', '360p', '480p', '720p', '1080p', '4k')),
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  bitrate INTEGER NOT NULL, -- in bps
  resolution_width INTEGER NOT NULL,
  resolution_height INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Video thumbnails table
CREATE TABLE IF NOT EXISTS video_thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL,
  thumbnail_url TEXT NOT NULL,
  timestamp_seconds INTEGER NOT NULL, -- timestamp in video where thumbnail was taken
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Video transcripts table
CREATE TABLE IF NOT EXISTS video_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL,
  transcript_text TEXT NOT NULL,
  segments JSONB, -- array of {start, end, text} objects
  language VARCHAR(10) DEFAULT 'en',
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Upload sessions table for resumable uploads
CREATE TABLE IF NOT EXISTS upload_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL,
  upload_id VARCHAR(255) UNIQUE NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  chunk_size INTEGER NOT NULL DEFAULT 5242880, -- 5MB default
  total_chunks INTEGER NOT NULL,
  uploaded_chunks INTEGER[] DEFAULT '{}',
  upload_url TEXT NOT NULL,
  resume_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Video storage configuration table
CREATE TABLE IF NOT EXISTS video_storage_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_name VARCHAR(255) NOT NULL,
  region VARCHAR(50) NOT NULL,
  cdn_url TEXT,
  max_file_size BIGINT NOT NULL DEFAULT 536870912, -- 500MB default
  allowed_formats TEXT[] NOT NULL DEFAULT '{"mp4", "mov", "avi", "webm"}',
  chunk_size INTEGER NOT NULL DEFAULT 5242880, -- 5MB default
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Video processing configuration table
CREATE TABLE IF NOT EXISTS video_processing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enable_transcoding BOOLEAN DEFAULT TRUE,
  enable_thumbnails BOOLEAN DEFAULT TRUE,
  enable_transcription BOOLEAN DEFAULT TRUE,
  output_formats TEXT[] NOT NULL DEFAULT '{"mp4", "hls", "dash"}',
  thumbnail_count INTEGER DEFAULT 5,
  thumbnail_timestamps INTEGER[], -- specific timestamps for thumbnails
  transcoding_qualities TEXT[] NOT NULL DEFAULT '{"240p", "360p", "480p", "720p", "1080p"}',
  max_concurrent_jobs INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Processing metrics table for analytics
CREATE TABLE IF NOT EXISTS processing_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  failed_jobs INTEGER DEFAULT 0,
  average_processing_time_seconds INTEGER DEFAULT 0,
  total_processing_time_seconds BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_processing_jobs_video_id ON video_processing_jobs(video_id);
CREATE INDEX IF NOT EXISTS idx_video_processing_jobs_status ON video_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_processing_jobs_priority ON video_processing_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_video_processing_jobs_created_at ON video_processing_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_video_formats_video_id ON video_formats(video_id);
CREATE INDEX IF NOT EXISTS idx_video_formats_format ON video_formats(format);
CREATE INDEX IF NOT EXISTS idx_video_formats_quality ON video_formats(quality);

CREATE INDEX IF NOT EXISTS idx_video_thumbnails_video_id ON video_thumbnails(video_id);
CREATE INDEX IF NOT EXISTS idx_video_thumbnails_primary ON video_thumbnails(video_id, is_primary) WHERE is_primary = TRUE;

CREATE INDEX IF NOT EXISTS idx_video_transcripts_video_id ON video_transcripts(video_id);

CREATE INDEX IF NOT EXISTS idx_upload_sessions_upload_id ON upload_sessions(upload_id);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_video_id ON upload_sessions(video_id);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_status ON upload_sessions(status);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_expires_at ON upload_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_processing_metrics_date ON processing_metrics(date);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_video_processing_jobs_updated_at 
  BEFORE UPDATE ON video_processing_jobs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_transcripts_updated_at 
  BEFORE UPDATE ON video_transcripts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upload_sessions_updated_at 
  BEFORE UPDATE ON upload_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_storage_config_updated_at 
  BEFORE UPDATE ON video_storage_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_processing_config_updated_at 
  BEFORE UPDATE ON video_processing_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default configurations
INSERT INTO video_storage_config (bucket_name, region, cdn_url, max_file_size, allowed_formats, chunk_size)
VALUES (
  'winbro-training-videos',
  'us-east-1',
  'https://cdn.winbro.com',
  536870912, -- 500MB
  ARRAY['mp4', 'mov', 'avi', 'webm', 'mkv'],
  5242880 -- 5MB
) ON CONFLICT DO NOTHING;

INSERT INTO video_processing_config (
  enable_transcoding,
  enable_thumbnails,
  enable_transcription,
  output_formats,
  thumbnail_count,
  transcoding_qualities,
  max_concurrent_jobs
)
VALUES (
  TRUE,
  TRUE,
  TRUE,
  ARRAY['mp4', 'hls', 'dash'],
  5,
  ARRAY['240p', '360p', '480p', '720p', '1080p'],
  3
) ON CONFLICT DO NOTHING;

-- Create a view for video processing status
CREATE OR REPLACE VIEW video_processing_status AS
SELECT 
  v.id as video_id,
  v.title,
  v.status as video_status,
  vpj.status as processing_status,
  vpj.progress,
  vpj.message,
  vpj.priority,
  vpj.started_at,
  vpj.completed_at,
  vpj.error_details,
  vpj.created_at as job_created_at,
  CASE 
    WHEN vpj.status = 'completed' THEN TRUE
    ELSE FALSE
  END as is_processing_complete,
  CASE 
    WHEN vpj.status = 'failed' THEN TRUE
    ELSE FALSE
  END as has_processing_error
FROM videos v
LEFT JOIN video_processing_jobs vpj ON v.id = vpj.video_id
WHERE vpj.id IS NOT NULL;

-- Create a function to clean up expired upload sessions
CREATE OR REPLACE FUNCTION cleanup_expired_upload_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM upload_sessions 
  WHERE expires_at < NOW() AND status = 'active';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get processing queue
CREATE OR REPLACE FUNCTION get_processing_queue()
RETURNS TABLE (
  job_id UUID,
  video_id UUID,
  priority VARCHAR(10),
  created_at TIMESTAMP,
  estimated_wait_time INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vpj.id,
    vpj.video_id,
    vpj.priority,
    vpj.created_at,
    CASE 
      WHEN vpj.priority = 'high' THEN 0
      WHEN vpj.priority = 'normal' THEN 300 -- 5 minutes
      WHEN vpj.priority = 'low' THEN 900 -- 15 minutes
      ELSE 600 -- 10 minutes default
    END as estimated_wait_time
  FROM video_processing_jobs vpj
  WHERE vpj.status = 'queued'
  ORDER BY 
    CASE vpj.priority 
      WHEN 'high' THEN 1 
      WHEN 'normal' THEN 2 
      WHEN 'low' THEN 3 
    END,
    vpj.created_at ASC;
END;
$$ LANGUAGE plpgsql;