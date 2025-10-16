import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Play, 
  Download, 
  MoreVertical,
  Eye,
  Star,
  Tag,
  Calendar,
  User,
  Settings
} from 'lucide-react';

// Mock data - in a real app, this would come from API
const mockVideos = [
  {
    id: '1',
    title: 'CNC Mill Setup - Part 1',
    description: 'Complete guide to setting up the CNC mill for precision machining operations',
    duration: '2:30',
    views: 45,
    status: 'published',
    thumbnail: '/api/placeholder/300/200',
    tags: ['CNC', 'Setup', 'Machining'],
    machineModel: 'Haas VF-2',
    process: 'Setup',
    tooling: ['End Mill', 'Vise'],
    createdAt: '2024-01-15',
    author: 'John Doe',
    rating: 4.8,
    isCustomerSpecific: false,
  },
  {
    id: '2',
    title: 'Safety Procedures Overview',
    description: 'Essential safety protocols for machine operation and maintenance',
    duration: '1:45',
    views: 23,
    status: 'published',
    thumbnail: '/api/placeholder/300/200',
    tags: ['Safety', 'Protocols', 'Maintenance'],
    machineModel: 'General',
    process: 'Safety',
    tooling: [],
    createdAt: '2024-01-14',
    author: 'Sarah Miller',
    rating: 4.9,
    isCustomerSpecific: false,
  },
  {
    id: '3',
    title: 'Tool Change Process',
    description: 'Step-by-step guide for changing tools on the CNC machine',
    duration: '3:15',
    views: 0,
    status: 'processing',
    thumbnail: '/api/placeholder/300/200',
    tags: ['Tool Change', 'CNC', 'Maintenance'],
    machineModel: 'Haas VF-2',
    process: 'Maintenance',
    tooling: ['Tool Holder', 'Wrench'],
    createdAt: '2024-01-13',
    author: 'Mike Rodriguez',
    rating: 0,
    isCustomerSpecific: true,
  },
  {
    id: '4',
    title: 'Quality Control Check',
    description: 'How to perform quality control checks on machined parts',
    duration: '2:00',
    views: 67,
    status: 'published',
    thumbnail: '/api/placeholder/300/200',
    tags: ['Quality', 'Inspection', 'Measurement'],
    machineModel: 'General',
    process: 'Quality Control',
    tooling: ['Calipers', 'Micrometer'],
    createdAt: '2024-01-12',
    author: 'Jane Smith',
    rating: 4.7,
    isCustomerSpecific: false,
  },
  {
    id: '5',
    title: 'Emergency Stop Procedures',
    description: 'Critical emergency procedures for machine operation',
    duration: '1:30',
    views: 89,
    status: 'published',
    thumbnail: '/api/placeholder/300/200',
    tags: ['Emergency', 'Safety', 'Stop'],
    machineModel: 'General',
    process: 'Safety',
    tooling: [],
    createdAt: '2024-01-11',
    author: 'John Doe',
    rating: 4.9,
    isCustomerSpecific: false,
  },
  {
    id: '6',
    title: 'Advanced Machining Techniques',
    description: 'Advanced techniques for complex machining operations',
    duration: '4:20',
    views: 34,
    status: 'published',
    thumbnail: '/api/placeholder/300/200',
    tags: ['Advanced', 'Techniques', 'Machining'],
    machineModel: 'Haas VF-2',
    process: 'Machining',
    tooling: ['Special End Mill', 'Coolant'],
    createdAt: '2024-01-10',
    author: 'Mike Rodriguez',
    rating: 4.6,
    isCustomerSpecific: true,
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
                           video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.every(tag => video.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });

    // Sort videos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'views':
          return b.views - a.views;
        case 'rating':
          return b.rating - a.rating;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <Card key={video.id} className="group card-hover overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(video.status)}>
                      {video.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {video.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {video.author}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {video.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {video.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{video.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="group card-hover">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                            {video.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {video.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge className={getStatusColor(video.status)}>
                            {video.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {video.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {video.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(video.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {video.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
