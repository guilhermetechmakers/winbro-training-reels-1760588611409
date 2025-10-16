import { searchApi } from '@/api/search';
import type { 
  SearchQuery, 
  SearchResult, 
  SearchSuggestion, 
  SearchFacets,
  SearchAnalytics,
  SearchHistory,
  SavedSearch
} from '@/types/search';

export class SearchService {
  private static instance: SearchService;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  private constructor() {}

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  // Cache management
  private getCacheKey(prefix: string, key: string): string {
    return `${prefix}:${key}`;
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // Search videos with caching
  async searchVideos(query: SearchQuery): Promise<SearchResult> {
    const cacheKey = this.getCacheKey('search', JSON.stringify(query));
    const cached = this.getCached<SearchResult>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const result = await searchApi.searchVideos(query);
      this.setCache(cacheKey, result, 2 * 60 * 1000); // 2 minutes cache
      return result;
    } catch (error) {
      console.error('Search service error:', error);
      throw error;
    }
  }

  // Get autocomplete suggestions
  async getAutocompleteSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (query.length < 2) {
      return [];
    }

    const cacheKey = this.getCacheKey('suggestions', query);
    const cached = this.getCached<SearchSuggestion[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const suggestions = await searchApi.getAutocompleteSuggestions(query);
      this.setCache(cacheKey, suggestions, 10 * 60 * 1000); // 10 minutes cache
      return suggestions;
    } catch (error) {
      console.error('Suggestions service error:', error);
      return [];
    }
  }

  // Get search facets
  async getSearchFacets(): Promise<SearchFacets> {
    const cacheKey = this.getCacheKey('facets', 'all');
    const cached = this.getCached<SearchFacets>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const facets = await searchApi.getSearchFacets();
      this.setCache(cacheKey, facets, 30 * 60 * 1000); // 30 minutes cache
      return facets;
    } catch (error) {
      console.error('Facets service error:', error);
      throw error;
    }
  }

  // Track search analytics
  async trackSearchEvent(data: Omit<SearchAnalytics, 'id' | 'timestamp'>): Promise<void> {
    try {
      await searchApi.trackSearchEvent(data);
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Don't throw - analytics failures shouldn't break the search
    }
  }

  // Search history management
  async getSearchHistory(): Promise<SearchHistory[]> {
    try {
      return await searchApi.getSearchHistory();
    } catch (error) {
      console.error('Search history error:', error);
      return [];
    }
  }

  async deleteSearchHistoryItem(historyId: string): Promise<void> {
    try {
      await searchApi.deleteSearchHistory(historyId);
    } catch (error) {
      console.error('Delete history item error:', error);
      throw error;
    }
  }

  async clearSearchHistory(): Promise<void> {
    try {
      await searchApi.clearSearchHistory();
    } catch (error) {
      console.error('Clear history error:', error);
      throw error;
    }
  }

  // Saved searches management
  async getSavedSearches(): Promise<SavedSearch[]> {
    try {
      return await searchApi.getSavedSearches();
    } catch (error) {
      console.error('Saved searches error:', error);
      return [];
    }
  }

  async createSavedSearch(data: Omit<SavedSearch, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<SavedSearch> {
    try {
      return await searchApi.createSavedSearch(data);
    } catch (error) {
      console.error('Create saved search error:', error);
      throw error;
    }
  }

  async updateSavedSearch(id: string, data: Partial<Omit<SavedSearch, 'id' | 'created_at' | 'user_id'>>): Promise<SavedSearch> {
    try {
      return await searchApi.updateSavedSearch(id, data);
    } catch (error) {
      console.error('Update saved search error:', error);
      throw error;
    }
  }

  async deleteSavedSearch(id: string): Promise<void> {
    try {
      await searchApi.deleteSavedSearch(id);
    } catch (error) {
      console.error('Delete saved search error:', error);
      throw error;
    }
  }

  // Recent searches (local storage)
  getRecentSearches(): string[] {
    return searchApi.getRecentSearches();
  }

  addRecentSearch(query: string): void {
    searchApi.addRecentSearch(query);
  }

  clearRecentSearches(): void {
    searchApi.clearRecentSearches();
  }

  // Search query validation
  validateSearchQuery(query: SearchQuery): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (query.query.length > 100) {
      errors.push('Search query is too long (max 100 characters)');
    }

    if (query.page < 1) {
      errors.push('Page number must be at least 1');
    }

    if (query.limit < 1 || query.limit > 100) {
      errors.push('Limit must be between 1 and 100');
    }

    if (query.filters.durationRange[0] < 0 || query.filters.durationRange[1] < 0) {
      errors.push('Duration range cannot be negative');
    }

    if (query.filters.durationRange[0] > query.filters.durationRange[1]) {
      errors.push('Minimum duration cannot be greater than maximum duration');
    }

    if (query.filters.dateRange[0] > query.filters.dateRange[1]) {
      errors.push('Start date cannot be after end date');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Search query optimization
  optimizeSearchQuery(query: SearchQuery): SearchQuery {
    const optimized = { ...query };

    // Remove empty filters
    if (optimized.filters.machineModels.length === 0) {
      optimized.filters.machineModels = [];
    }

    if (optimized.filters.processes.length === 0) {
      optimized.filters.processes = [];
    }

    if (optimized.filters.tags.length === 0) {
      optimized.filters.tags = [];
    }

    // Normalize duration range
    if (optimized.filters.durationRange[0] < 0) {
      optimized.filters.durationRange[0] = 0;
    }

    if (optimized.filters.durationRange[1] > 3600) {
      optimized.filters.durationRange[1] = 3600;
    }

    // Normalize date range
    if (optimized.filters.dateRange[0] < new Date(0)) {
      optimized.filters.dateRange[0] = new Date(0);
    }

    if (optimized.filters.dateRange[1] > new Date()) {
      optimized.filters.dateRange[1] = new Date();
    }

    // Trim search query
    optimized.query = optimized.query.trim();

    return optimized;
  }

  // Clear all caches
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const searchService = SearchService.getInstance();