import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchService } from '@/services/search-service';
import { toast } from 'sonner';
import type { 
  SearchQuery, 
  SearchSuggestion, 
  SearchFilters,
  SortOption
} from '@/types/search';
import { 
  defaultSearchQuery,
  SEARCH_CONSTANTS
} from '@/types/search';

// Query keys for React Query
export const searchKeys = {
  all: ['search'] as const,
  videos: (query: SearchQuery) => [...searchKeys.all, 'videos', query] as const,
  suggestions: (q: string) => [...searchKeys.all, 'suggestions', q] as const,
  facets: () => [...searchKeys.all, 'facets'] as const,
  history: () => [...searchKeys.all, 'history'] as const,
  saved: () => [...searchKeys.all, 'saved'] as const,
};

// Debounce utility
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = window.setTimeout(() => {
        callback(...args);
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [callback, delay, timeoutId]
  ) as T;

  return debouncedCallback;
}

// Main search hook
export function useSearch(initialQuery?: Partial<SearchQuery>) {
  const [query, setQuery] = useState<SearchQuery>({
    ...defaultSearchQuery,
    ...initialQuery,
  });
  
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  // Search videos query
  const searchResults = useQuery({
    queryKey: searchKeys.videos(query),
    queryFn: () => searchService.searchVideos(query),
    enabled: query.query.length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH,
    staleTime: SEARCH_CONSTANTS.CACHE_DURATION,
    retry: 2,
  });

  // Search facets query
  const facetsQuery = useQuery({
    queryKey: searchKeys.facets(),
    queryFn: searchService.getSearchFacets,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Debounced suggestions
  const debouncedSuggestions = useDebouncedCallback(
    async (searchText: string) => {
      if (searchText.length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH) {
        try {
          const results = await searchService.getAutocompleteSuggestions(searchText);
          setSuggestions(results);
          setIsSuggestionsOpen(true);
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
        }
      } else {
        setSuggestions([]);
        setIsSuggestionsOpen(false);
      }
    },
    SEARCH_CONSTANTS.DEBOUNCE_DELAY
  );

  // Update search query
  const updateQuery = useCallback((updates: Partial<SearchQuery>) => {
    setQuery(prev => ({
      ...prev,
      ...updates,
      // Reset page when changing search criteria
      page: updates.page ?? (updates.query !== undefined || updates.filters !== undefined ? 1 : prev.page),
    }));
  }, []);

  // Update filters
  const updateFilters = useCallback((filterUpdates: Partial<SearchFilters>) => {
    updateQuery({
      filters: {
        ...query.filters,
        ...filterUpdates,
      },
    });
  }, [query.filters, updateQuery]);

  // Update sort
  const updateSort = useCallback((sort: SortOption) => {
    updateQuery({ sort, page: 1 });
  }, [updateQuery]);

  // Update page
  const updatePage = useCallback((page: number) => {
    updateQuery({ page });
  }, [updateQuery]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    updateQuery({
      filters: defaultSearchQuery.filters,
      page: 1,
    });
  }, [updateQuery]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery(defaultSearchQuery);
    setSuggestions([]);
    setIsSuggestionsOpen(false);
  }, []);

  // Handle search input change
  const handleSearchInputChange = useCallback((value: string) => {
    updateQuery({ query: value });
    debouncedSuggestions(value);
  }, [updateQuery, debouncedSuggestions]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    updateQuery({ query: suggestion.text, page: 1 });
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    
    // Add to recent searches
    searchService.addRecentSearch(suggestion.text);
  }, [updateQuery]);

  // Close suggestions
  const closeSuggestions = useCallback(() => {
    setIsSuggestionsOpen(false);
  }, []);

  // Get recent searches
  const recentSearches = useMemo(() => {
    return searchService.getRecentSearches();
  }, []);

  return {
    // Query state
    query,
    searchResults,
    facetsQuery,
    suggestions,
    isSuggestionsOpen,
    recentSearches,
    
    // Actions
    updateQuery,
    updateFilters,
    updateSort,
    updatePage,
    clearFilters,
    clearSearch,
    handleSearchInputChange,
    handleSuggestionSelect,
    closeSuggestions,
    
    // Computed values
    isLoading: searchResults.isLoading,
    isError: searchResults.isError,
    error: searchResults.error,
    videos: searchResults.data?.videos ?? [],
    total: searchResults.data?.total ?? 0,
    facets: facetsQuery.data,
    pagination: searchResults.data?.pagination,
  };
}

// Search history hook
export function useSearchHistory() {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: searchKeys.history(),
    queryFn: searchService.getSearchHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const clearHistoryMutation = useMutation({
    mutationFn: searchService.clearSearchHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.history() });
      toast.success('Search history cleared');
    },
    onError: (error) => {
      toast.error(`Failed to clear history: ${error.message}`);
    },
  });

  const deleteHistoryItemMutation = useMutation({
    mutationFn: searchService.deleteSearchHistoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.history() });
    },
    onError: (error) => {
      toast.error(`Failed to delete history item: ${error.message}`);
    },
  });

  return {
    history: historyQuery.data ?? [],
    isLoading: historyQuery.isLoading,
    clearHistory: clearHistoryMutation.mutate,
    deleteHistoryItem: deleteHistoryItemMutation.mutate,
    isClearing: clearHistoryMutation.isPending,
    isDeleting: deleteHistoryItemMutation.isPending,
  };
}

// Saved searches hook
export function useSavedSearches() {
  const queryClient = useQueryClient();

  const savedQuery = useQuery({
    queryKey: searchKeys.saved(),
    queryFn: searchService.getSavedSearches,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createSavedSearchMutation = useMutation({
    mutationFn: searchService.createSavedSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.saved() });
      toast.success('Search saved successfully');
    },
    onError: (error) => {
      toast.error(`Failed to save search: ${error.message}`);
    },
  });

  const updateSavedSearchMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<import('@/types/search').SavedSearch, 'id' | 'created_at' | 'user_id'>> }) =>
      searchService.updateSavedSearch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.saved() });
      toast.success('Saved search updated');
    },
    onError: (error) => {
      toast.error(`Failed to update saved search: ${error.message}`);
    },
  });

  const deleteSavedSearchMutation = useMutation({
    mutationFn: searchService.deleteSavedSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.saved() });
      toast.success('Saved search deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete saved search: ${error.message}`);
    },
  });

  return {
    savedSearches: savedQuery.data ?? [],
    isLoading: savedQuery.isLoading,
    createSavedSearch: createSavedSearchMutation.mutate,
    updateSavedSearch: updateSavedSearchMutation.mutate,
    deleteSavedSearch: deleteSavedSearchMutation.mutate,
    isCreating: createSavedSearchMutation.isPending,
    isUpdating: updateSavedSearchMutation.isPending,
    isDeleting: deleteSavedSearchMutation.isPending,
  };
}

// Search analytics hook
export function useSearchAnalytics() {
  const trackSearchMutation = useMutation({
    mutationFn: searchService.trackSearchEvent,
    onError: (error) => {
      console.error('Failed to track search event:', error);
    },
  });

  const trackSearch = useCallback((query: string, resultsCount: number, filters: SearchFilters, responseTime: number) => {
    trackSearchMutation.mutate({
      query,
      results_count: resultsCount,
      filters_applied: filters,
      response_time_ms: responseTime,
    });
  }, [trackSearchMutation]);

  return {
    trackSearch,
    isTracking: trackSearchMutation.isPending,
  };
}