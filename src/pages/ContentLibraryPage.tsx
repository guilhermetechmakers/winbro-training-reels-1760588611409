import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Settings,
  Tag
} from 'lucide-react';
import VideoCard from '@/components/video/VideoCard';
import type { VideoClip } from '@/types/video';

// Mock data - in a real app, this would come from API
const mockVideos: VideoClip[] = [
  {
    id: '1',
    title: 'CNC Mill Setup - Part 1',
    description: 'Complete guide to setting up the CNC mill for precision machining operations',
    duration: 150, // 2:30 in seconds
    view_count: 45,
    like_count: 12,
    download_count: 3,
    status: 'published',
    thumbnail_url: '/api/placeholder/300/200',
    video_url: '/api/videos/1/stream',
    tags: ['CNC', 'Setup', 'Machining'],
    machine_model: 'Haas VF-2',
    process: 'Setup',
    tooling: 'End Mill, Vise',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    owner_id: 'user-1',
    privacy_level: 'public',
  },
  {
    id: '2',
    title: 'Safety Procedures Overview',
    description: 'Essential safety protocols for machine operation and maintenance',
    duration: 105, // 1:45 in seconds
    view_count: 23,
    like_count: 8,
    download_count: 1,
    status: 'published',
    thumbnail_url: '/api/placeholder/300/200',
    video_url: '/api/videos/2/stream',
    tags: ['Safety', 'Protocols', 'Maintenance'],
    machine_model: 'General',
    process: 'Safety',
    tooling: '',
    created_at: '2024-01-14T10:00:00Z',
    updated_at: '2024-01-14T10:00:00Z',
    owner_id: 'user-2',
    privacy_level: 'public',
  },
  {
    id: '3',
    title: 'Tool Change Process',
    description: 'Step-by-step guide for changing tools on the CNC machine',
    duration: 195, // 3:15 in seconds
    view_count: 0,
    like_count: 0,
    download_count: 0,
    status: 'processing',
    thumbnail_url: '/api/placeholder/300/200',
    video_url: '/api/videos/3/stream',
    tags: ['Tool Change', 'CNC', 'Maintenance'],
    machine_model: 'Haas VF-2',
    process: 'Maintenance',
    tooling: 'Tool Holder, Wrench',
    created_at: '2024-01-13T10:00:00Z',
    updated_at: '2024-01-13T10:00:00Z',
    owner_id: 'user-3',
    privacy_level: 'organization',
    customer_id: 'customer-1',
  },
  {
    id: '4',
    title: 'Quality Control Check',
    description: 'How to perform quality control checks on machined parts',
    duration: 120, // 2:00 in seconds
    view_count: 67,
    like_count: 15,
    download_count: 5,
    status: 'published',
    thumbnail_url: '/api/placeholder/300/200',
    video_url: '/api/videos/4/stream',
    tags: ['Quality', 'Inspection', 'Measurement'],
    machine_model: 'General',
    process: 'Quality Control',
    tooling: 'Calipers, Micrometer',
    created_at: '2024-01-12T10:00:00Z',
    updated_at: '2024-01-12T10:00:00Z',
    owner_id: 'user-4',
    privacy_level: 'public',
  },
  {
    id: '5',
    title: 'Emergency Stop Procedures',
    description: 'Critical emergency procedures for machine operation',
    duration: 90, // 1:30 in seconds
    view_count: 89,
    like_count: 22,
    download_count: 8,
    status: 'published',
    thumbnail_url: '/api/placeholder/300/200',
    video_url: '/api/videos/5/stream',
    tags: ['Emergency', 'Safety', 'Stop'],
    machine_model: 'General',
    process: 'Safety',
    tooling: '',
    created_at: '2024-01-11T10:00:00Z',
    updated_at: '2024-01-11T10:00:00Z',
    owner_id: 'user-1',
    privacy_level: 'public',
  },
  {
    id: '6',
    title: 'Advanced Machining Techniques',
    description: 'Advanced techniques for complex machining operations',
    duration: 260, // 4:20 in seconds
    view_count: 34,
    like_count: 9,
    download_count: 2,
    status: 'published',
    thumbnail_url: '/api/placeholder/300/200',
    video_url: '/api/videos/6/stream',
    tags: ['Advanced', 'Techniques', 'Machining'],
    machine_model: 'Haas VF-2',
    process: 'Machining',
    tooling: 'Special End Mill, Coolant',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    owner_id: 'user-3',
    privacy_level: 'organization',
    customer_id: 'customer-1',
  },
];

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'views' | 'rating' | 'title';

export default function ContentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    mockVideos.forEach(video => {
      video.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    let filtered = mockVideos.filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (video.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.every(tag => video.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });

    // Sort videos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'views':
          return b.view_count - a.view_count;
        case 'rating':
          return b.like_count - a.like_count;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedTags, sortBy]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Content Library</h1>
              <p className="text-muted-foreground">
                Manage and organize your training videos
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
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos, tags, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="animate-fade-in">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Sort by</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'newest', label: 'Newest' },
                        { value: 'oldest', label: 'Oldest' },
                        { value: 'views', label: 'Most Views' },
                        { value: 'rating', label: 'Highest Rated' },
                        { value: 'title', label: 'Title A-Z' },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={sortBy === option.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSortBy(option.value as SortOption)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <Button
                          key={tag}
                          variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleTagToggle(tag)}
                          className="flex items-center gap-1"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredVideos.length} of {mockVideos.length} videos
            {selectedTags.length > 0 && ` • Filtered by ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Video Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                viewMode="grid"
                onPlay={(videoId) => {
                  // Navigate to video player
                  console.log('Play video:', videoId);
                }}
                onRetry={(videoId) => {
                  // Retry processing
                  console.log('Retry processing for video:', videoId);
                }}
                onCancel={(videoId) => {
                  // Cancel processing
                  console.log('Cancel processing for video:', videoId);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                viewMode="list"
                onPlay={(videoId) => {
                  // Navigate to video player
                  console.log('Play video:', videoId);
                }}
                onRetry={(videoId) => {
                  // Retry processing
                  console.log('Retry processing for video:', videoId);
                }}
                onCancel={(videoId) => {
                  // Cancel processing
                  console.log('Cancel processing for video:', videoId);
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No videos found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedTags([]);
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
