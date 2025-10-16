import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  History, 
  Star, 
  Filter
} from 'lucide-react';
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch, useSearchHistory, useSavedSearches } from '@/hooks/use-search';

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState('search');
  
  // Initialize search hook
  const {
    query,
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

  // Initialize history and saved searches
  const { history, clearHistory, deleteHistoryItem } = useSearchHistory();
  const { savedSearches, createSavedSearch, deleteSavedSearch } = useSavedSearches();

  // Handle search
  const handleSearch = (searchQuery: string) => {
    handleSearchInputChange(searchQuery);
  };

  // Handle saved search creation
  const handleSaveSearch = () => {
    if (query.query.trim()) {
      createSavedSearch({
        name: `Search: ${query.query}`,
        query: query.query,
        filters: query.filters,
      });
    }
  };

  // Handle saved search selection
  const handleSavedSearchSelect = (savedSearch: typeof savedSearches[0]) => {
    updateQuery({
      query: savedSearch.query,
      filters: savedSearch.filters,
      page: 1,
    });
  };

  // Handle history search selection
  const handleHistorySearchSelect = (historyItem: typeof history[0]) => {
    updateQuery({
      query: historyItem.query,
      filters: historyItem.filters,
      page: 1,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Search Videos</h1>
              <p className="text-muted-foreground">
                Find training videos using advanced search and filters
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Interface */}
        <div className="mb-8">
          <GlobalSearchBar
            onSearch={handleSearch}
            placeholder="Search videos, tags, machine models, or processes..."
            recentSearches={recentSearches}
            suggestions={suggestions}
            isSuggestionsOpen={isSuggestionsOpen}
            onSuggestionSelect={handleSuggestionSelect}
            onCloseSuggestions={closeSuggestions}
            size="lg"
            className="max-w-3xl mx-auto"
          />
        </div>

        {/* Main Content Tabs */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-3">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'search' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Search className="h-4 w-4" />
              Search Results
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'history' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <History className="h-4 w-4" />
              Search History
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'saved' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Star className="h-4 w-4" />
              Saved Searches
            </button>
          </div>

          {/* Search Results Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
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
          )}

          {/* Search History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Search History</h2>
              {history.length > 0 && (
                <Button variant="outline" onClick={() => clearHistory()}>
                  Clear All
                </Button>
              )}
            </div>

            {history.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No search history</h3>
                  <p className="text-muted-foreground">
                    Your recent searches will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.query}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.result_count} results • {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                          {Object.keys(item.filters).length > 0 && (
                            <div className="flex gap-1 mt-2">
                              <Filter className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Filters applied
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleHistorySearchSelect(item)}
                          >
                            Search Again
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteHistoryItem(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            </div>
          )}

          {/* Saved Searches Tab */}
          {activeTab === 'saved' && (
            <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Saved Searches</h2>
              {query.query.trim() && (
                <Button onClick={handleSaveSearch}>
                  <Star className="h-4 w-4 mr-2" />
                  Save Current Search
                </Button>
              )}
            </div>

            {savedSearches.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved searches</h3>
                  <p className="text-muted-foreground">
                    Save frequently used searches for quick access
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {savedSearches.map((saved) => (
                  <Card key={saved.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{saved.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Query: "{saved.query}"
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Saved {new Date(saved.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSavedSearchSelect(saved)}
                          >
                            Use Search
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSavedSearch(saved.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}