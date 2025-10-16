import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Settings
} from 'lucide-react';
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch } from '@/hooks/use-search';
import { useSearchAnalytics } from '@/hooks/use-search';


export default function ContentLibraryPage() {
  // Initialize search hook
  const {
    query,
    searchResults,
    suggestions,
    isSuggestionsOpen,
    recentSearches,
    updateQuery,
    handleSearchInputChange,
    handleSuggestionSelect,
    closeSuggestions,
    isLoading,
    isError,
    error,
    videos,
    total,
    facets,
  } = useSearch();

  // Initialize analytics
  const { trackSearch } = useSearchAnalytics();

  // Track search events
  const handleSearch = (searchQuery: string) => {
    handleSearchInputChange(searchQuery);
  };

  // Track search completion when results change
  React.useEffect(() => {
    if (query.query && !isLoading && searchResults.data) {
      const responseTime = 500; // Approximate response time
      trackSearch(query.query, total, query.filters, responseTime);
    }
  }, [query.query, total, query.filters, isLoading, searchResults.data, trackSearch]);


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Content Library</h1>
              <p className="text-muted-foreground">
                Search and manage your training videos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Global Search Bar */}
        <div className="mb-6">
          <GlobalSearchBar
            onSearch={handleSearch}
            placeholder="Search videos, tags, machine models, or processes..."
            recentSearches={recentSearches}
            suggestions={suggestions}
            isSuggestionsOpen={isSuggestionsOpen}
            onSuggestionSelect={handleSuggestionSelect}
            onCloseSuggestions={closeSuggestions}
            size="lg"
            className="max-w-2xl"
          />
        </div>

        {/* Search Results */}
        <SearchResults
          videos={videos}
          total={total}
          query={query}
          onQueryChange={updateQuery}
          facets={facets}
          isLoading={isLoading}
          isError={isError}
          error={error}
        />
      </div>
    </div>
  );
}
