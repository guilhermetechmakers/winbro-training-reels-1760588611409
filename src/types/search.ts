export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  sort: SortOption;
  page: number;
  limit: number;
}

export interface SearchFilters {
  machineModels: string[];
  processes: string[];
  tags: string[];
  durationRange: [number, number];
  dateRange: [Date, Date];
  accessLevel?: string;
  status?: string[];
}

export interface SearchResult {
  total: number;
  videos: SearchVideo[];
  facets: SearchFacets;
  suggestions: string[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchVideo {
  id: string;
  title: string;
  description?: string;
  duration: number;
  thumbnail_url?: string;
  video_url: string;
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
  relevance_score?: number;
  match_highlights?: {
    title?: string[];
    description?: string[];
    tags?: string[];
  };
}

export interface SearchFacets {
  machineModels: FacetItem[];
  processes: FacetItem[];
  tags: FacetItem[];
  status: FacetItem[];
  durationRanges: FacetRange[];
  dateRanges: FacetRange[];
}

export interface FacetItem {
  value: string;
  label: string;
  count: number;
}

export interface FacetRange {
  value: string;
  label: string;
  min: number;
  max: number;
  count: number;
}

export type SortOption = 
  | 'relevance'
  | 'newest'
  | 'oldest'
  | 'most_viewed'
  | 'most_liked'
  | 'duration_asc'
  | 'duration_desc'
  | 'title_asc'
  | 'title_desc';

export interface SearchAnalytics {
  id: string;
  query: string;
  results_count: number;
  user_id?: string;
  filters_applied: SearchFilters;
  timestamp: string;
  response_time_ms: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'tag' | 'machine_model' | 'process';
  count?: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilters;
  timestamp: string;
  result_count: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Default search query
export const defaultSearchQuery: SearchQuery = {
  query: '',
  filters: {
    machineModels: [],
    processes: [],
    tags: [],
    durationRange: [0, 3600], // 0 to 1 hour
    dateRange: [new Date(0), new Date()], // All time
    accessLevel: undefined,
    status: ['published'],
  },
  sort: 'relevance',
  page: 1,
  limit: 20,
};

// Search constants
export const SEARCH_CONSTANTS = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEBOUNCE_DELAY: 300,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;