import { api } from '@/lib/api';
import type { 
  SearchQuery, 
  SearchResult, 
  SearchSuggestion, 
  SearchFacets,
  SearchAnalytics,
  SearchHistory,
  SavedSearch
} from '@/types/search';

export const searchApi = {
  // Main search endpoint
  searchVideos: (query: SearchQuery) => 
    api.post<SearchResult>('/api/search/videos', query),
  
  // Autocomplete suggestions
  getAutocompleteSuggestions: (q: string) =>
    api.get<SearchSuggestion[]>(`/api/search/suggestions?q=${encodeURIComponent(q)}`),
  
  // Search facets for filtering
  getSearchFacets: () =>
    api.get<SearchFacets>('/api/search/facets'),
  
  // Search analytics
  trackSearchEvent: (data: Omit<SearchAnalytics, 'id' | 'timestamp'>) =>
    api.post<SearchAnalytics>('/api/search/analytics', data),
  
  // Search history
  getSearchHistory: () =>
    api.get<SearchHistory[]>('/api/search/history'),
  
  deleteSearchHistory: (historyId: string) =>
    api.delete(`/api/search/history/${historyId}`),
  
  clearSearchHistory: () =>
    api.delete('/api/search/history'),
  
  // Saved searches
  getSavedSearches: () =>
    api.get<SavedSearch[]>('/api/search/saved'),
  
  createSavedSearch: (data: Omit<SavedSearch, 'id' | 'created_at' | 'updated_at' | 'user_id'>) =>
    api.post<SavedSearch>('/api/search/saved', data),
  
  updateSavedSearch: (id: string, data: Partial<Omit<SavedSearch, 'id' | 'created_at' | 'user_id'>>) =>
    api.put<SavedSearch>(`/api/search/saved/${id}`, data),
  
  deleteSavedSearch: (id: string) =>
    api.delete(`/api/search/saved/${id}`),
  
  // Recent searches (cached locally)
  getRecentSearches: (): string[] => {
    try {
      const recent = localStorage.getItem('recent_searches');
      return recent ? JSON.parse(recent) : [];
    } catch {
      return [];
    }
  },
  
  addRecentSearch: (query: string) => {
    try {
      const recent = searchApi.getRecentSearches();
      const filtered = recent.filter(q => q !== query);
      const updated = [query, ...filtered].slice(0, 10); // Keep last 10
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch {
      // Silently fail if localStorage is not available
    }
  },
  
  clearRecentSearches: () => {
    try {
      localStorage.removeItem('recent_searches');
    } catch {
      // Silently fail if localStorage is not available
    }
  },
};