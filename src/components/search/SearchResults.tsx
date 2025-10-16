import { useState, useMemo } from 'react';
import { Search, Grid, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import VideoCard from '@/components/video/VideoCard';
import { SearchFilters } from './SearchFilters';
import { cn } from '@/lib/utils';
import type { SearchVideo, SearchQuery, SortOption } from '@/types/search';

interface SearchResultsProps {
  videos: SearchVideo[];
  total: number;
  query: SearchQuery;
  onQueryChange: (query: SearchQuery) => void;
  facets?: import('@/types/search').SearchFacets;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  className?: string;
}

type ViewMode = 'grid' | 'list';

// Skeleton component for loading state
function SearchResultsSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex gap-4">
            <Skeleton className="h-24 w-32 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Empty state component
function EmptySearchResults({ 
  hasQuery, 
  onClearFilters 
}: { 
  hasQuery: boolean; 
  onClearFilters: () => void;
}) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {hasQuery ? 'No videos found' : 'Start searching'}
        </h3>
        <p className="text-muted-foreground mb-4">
          {hasQuery 
            ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
            : 'Enter a search term or use filters to find training videos.'
          }
        </p>
        {hasQuery && (
          <Button onClick={onClearFilters} variant="outline">
            Clear Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Error state component
function SearchError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Search Error</h3>
        <p className="text-muted-foreground mb-4">
          {error.message || 'Something went wrong while searching. Please try again.'}
        </p>
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

export function SearchResults({
  videos,
  total,
  query,
  onQueryChange,
  facets,
  isLoading = false,
  isError = false,
  error = null,
  className,
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Sort options
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most_viewed', label: 'Most Viewed' },
    { value: 'most_liked', label: 'Most Liked' },
    { value: 'duration_asc', label: 'Duration (Shortest)' },
    { value: 'duration_desc', label: 'Duration (Longest)' },
    { value: 'title_asc', label: 'Title A-Z' },
    { value: 'title_desc', label: 'Title Z-A' },
  ];

  // Handle sort change
  const handleSortChange = (sort: SortOption) => {
    onQueryChange({
      ...query,
      sort,
      page: 1, // Reset to first page when sorting
    });
  };

  // Handle filters change
  const handleFiltersChange = (filters: typeof query.filters) => {
    onQueryChange({
      ...query,
      filters,
      page: 1, // Reset to first page when filtering
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    onQueryChange({
      ...query,
      page,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    onQueryChange({
      ...query,
      filters: {
        machineModels: [],
        processes: [],
        tags: [],
        durationRange: [0, 3600],
        dateRange: [new Date(0), new Date()],
        accessLevel: undefined,
        status: ['published'],
      },
      page: 1,
    });
  };

  // Check if there are active filters
  const hasActiveFilters = useMemo(() => {
    const { filters } = query;
    return (
      filters.machineModels.length > 0 ||
      filters.processes.length > 0 ||
      filters.tags.length > 0 ||
      filters.durationRange[0] > 0 ||
      filters.durationRange[1] < 3600 ||
      filters.dateRange[0].getTime() > new Date(0).getTime() ||
      filters.dateRange[1].getTime() < new Date().getTime() ||
      (filters.status && filters.status.length !== 1) ||
      filters.status?.[0] !== 'published'
    );
  }, [query.filters]);

  // Pagination info
  const pagination = query.page ? {
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
    hasNext: query.page < Math.ceil(total / query.limit),
    hasPrev: query.page > 1,
  } : null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              {query.query ? `Search Results for "${query.query}"` : 'All Videos'}
            </h2>
            <p className="text-muted-foreground">
              {isLoading ? 'Searching...' : `${total} video${total !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            )}
          </Button>

          {/* Sort Dropdown */}
          <Select value={query.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="animate-fade-in">
          <SearchFilters
            filters={query.filters}
            onFiltersChange={handleFiltersChange}
            facets={facets}
            defaultOpen={true}
          />
        </div>
      )}

      {/* Results */}
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <SearchResultsSkeleton viewMode={viewMode} />
        )}

        {/* Error State */}
        {isError && error && (
          <SearchError 
            error={error} 
            onRetry={() => onQueryChange({ ...query, page: 1 })} 
          />
        )}

        {/* Empty State */}
        {!isLoading && !isError && videos.length === 0 && (
          <EmptySearchResults 
            hasQuery={!!query.query || hasActiveFilters}
            onClearFilters={clearFilters}
          />
        )}

        {/* Results Grid/List */}
        {!isLoading && !isError && videos.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    viewMode="grid"
                    onPlay={(videoId) => {
                      console.log('Play video:', videoId);
                    }}
                    onRetry={(videoId) => {
                      console.log('Retry processing for video:', videoId);
                    }}
                    onCancel={(videoId) => {
                      console.log('Cancel processing for video:', videoId);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    viewMode="list"
                    onPlay={(videoId) => {
                      console.log('Play video:', videoId);
                    }}
                    onRetry={(videoId) => {
                      console.log('Retry processing for video:', videoId);
                    }}
                    onCancel={(videoId) => {
                      console.log('Cancel processing for video:', videoId);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}