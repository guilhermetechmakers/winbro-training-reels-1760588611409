-- Search Analytics Tables
-- This migration adds tables for tracking search analytics and user behavior

-- Search analytics table
CREATE TABLE search_analytics (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  filters_applied JSONB DEFAULT '{}',
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT
);

-- Search history table
CREATE TABLE search_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  result_count INTEGER NOT NULL DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved searches table
CREATE TABLE saved_searches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search facets cache table
CREATE TABLE search_facets_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  facets_data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_search_analytics_query ON search_analytics(query);
CREATE INDEX idx_search_analytics_timestamp ON search_analytics(timestamp);
CREATE INDEX idx_search_analytics_user_id ON search_analytics(user_id);
CREATE INDEX idx_search_analytics_session_id ON search_analytics(session_id);

CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_timestamp ON search_history(timestamp);
CREATE INDEX idx_search_history_query ON search_history(query);

CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_name ON saved_searches(name);

CREATE INDEX idx_search_facets_cache_key ON search_facets_cache(cache_key);
CREATE INDEX idx_search_facets_cache_expires ON search_facets_cache(expires_at);

-- Full-text search indexes for videos table (if not already exists)
CREATE INDEX IF NOT EXISTS idx_videos_search_text ON videos USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_videos_tags ON videos USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_videos_machine_model ON videos(machine_model);
CREATE INDEX IF NOT EXISTS idx_videos_process ON videos(process);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_privacy_level ON videos(privacy_level);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
CREATE INDEX IF NOT EXISTS idx_videos_duration ON videos(duration);

-- Composite indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_videos_search_composite ON videos(status, privacy_level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_filters_composite ON videos(machine_model, process, status, privacy_level);

-- Function to clean up expired facet cache
CREATE OR REPLACE FUNCTION cleanup_expired_facet_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM search_facets_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired cache (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-facet-cache', '0 2 * * *', 'SELECT cleanup_expired_facet_cache();');

-- Add comments
COMMENT ON TABLE search_analytics IS 'Tracks search queries and their performance metrics';
COMMENT ON TABLE search_history IS 'Stores user search history for autocomplete and suggestions';
COMMENT ON TABLE saved_searches IS 'Allows users to save frequently used search queries';
COMMENT ON TABLE search_facets_cache IS 'Caches search facets data for performance';

COMMENT ON COLUMN search_analytics.filters_applied IS 'JSON object containing applied filters';
COMMENT ON COLUMN search_analytics.response_time_ms IS 'Search response time in milliseconds';
COMMENT ON COLUMN search_analytics.session_id IS 'Session identifier for tracking user sessions';

COMMENT ON COLUMN search_history.filters IS 'JSON object containing applied filters';
COMMENT ON COLUMN saved_searches.filters IS 'JSON object containing saved filter configuration';
COMMENT ON COLUMN search_facets_cache.facets_data IS 'Cached search facets data as JSON';