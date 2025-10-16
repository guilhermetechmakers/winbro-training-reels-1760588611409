import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Calendar, Clock, Tag, Settings, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { SearchFilters, SearchFacets, FacetItem } from '@/types/search';

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  facets?: SearchFacets;
  className?: string;
  defaultOpen?: boolean;
}

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  badgeCount?: number;
}

function FilterSection({ title, icon, children, isOpen, onToggle, badgeCount }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="w-full justify-between p-0 h-auto font-medium text-left"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
          {badgeCount && badgeCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {badgeCount}
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      {isOpen && (
        <div className="space-y-3 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export function SearchFilters({
  filters,
  onFiltersChange,
  facets,
  className,
  defaultOpen = false,
}: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    machineModels: defaultOpen,
    processes: defaultOpen,
    tags: defaultOpen,
    duration: defaultOpen,
    dateRange: defaultOpen,
    status: defaultOpen,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Update individual filter
  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Toggle array filter item
  const toggleArrayFilter = <K extends keyof SearchFilters>(
    key: K,
    value: string
  ) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray as SearchFilters[K]);
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      machineModels: [],
      processes: [],
      tags: [],
      durationRange: [0, 3600],
      dateRange: [new Date(0), new Date()],
      accessLevel: undefined,
      status: ['published'],
    });
  };

  // Count active filters
  const activeFilterCount = [
    filters.machineModels.length,
    filters.processes.length,
    filters.tags.length,
    filters.durationRange[0] > 0 || filters.durationRange[1] < 3600 ? 1 : 0,
    filters.dateRange[0].getTime() > new Date(0).getTime() || 
    filters.dateRange[1].getTime() < new Date().getTime() ? 1 : 0,
    filters.status?.length !== 1 || filters.status?.[0] !== 'published' ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  // Format duration for display
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="default" className="text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Machine Models */}
        <FilterSection
          title="Machine Models"
          icon={<Settings className="h-4 w-4" />}
          isOpen={expandedSections.machineModels}
          onToggle={() => toggleSection('machineModels')}
          badgeCount={filters.machineModels.length}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {facets?.machineModels?.map((item: FacetItem) => (
              <div key={item.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`machine-${item.value}`}
                  checked={filters.machineModels.includes(item.value)}
                  onCheckedChange={() => toggleArrayFilter('machineModels', item.value)}
                />
                <Label
                  htmlFor={`machine-${item.value}`}
                  className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.count}
                  </Badge>
                </Label>
              </div>
            )) || (
              <div className="text-sm text-muted-foreground">No machine models available</div>
            )}
          </div>
        </FilterSection>

        <Separator />

        {/* Processes */}
        <FilterSection
          title="Process Types"
          icon={<Settings className="h-4 w-4" />}
          isOpen={expandedSections.processes}
          onToggle={() => toggleSection('processes')}
          badgeCount={filters.processes.length}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {facets?.processes?.map((item: FacetItem) => (
              <div key={item.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`process-${item.value}`}
                  checked={filters.processes.includes(item.value)}
                  onCheckedChange={() => toggleArrayFilter('processes', item.value)}
                />
                <Label
                  htmlFor={`process-${item.value}`}
                  className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.count}
                  </Badge>
                </Label>
              </div>
            )) || (
              <div className="text-sm text-muted-foreground">No processes available</div>
            )}
          </div>
        </FilterSection>

        <Separator />

        {/* Tags */}
        <FilterSection
          title="Tags"
          icon={<Tag className="h-4 w-4" />}
          isOpen={expandedSections.tags}
          onToggle={() => toggleSection('tags')}
          badgeCount={filters.tags.length}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {facets?.tags?.map((item: FacetItem) => (
              <div key={item.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${item.value}`}
                  checked={filters.tags.includes(item.value)}
                  onCheckedChange={() => toggleArrayFilter('tags', item.value)}
                />
                <Label
                  htmlFor={`tag-${item.value}`}
                  className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.count}
                  </Badge>
                </Label>
              </div>
            )) || (
              <div className="text-sm text-muted-foreground">No tags available</div>
            )}
          </div>
        </FilterSection>

        <Separator />

        {/* Duration Range */}
        <FilterSection
          title="Duration"
          icon={<Clock className="h-4 w-4" />}
          isOpen={expandedSections.duration}
          onToggle={() => toggleSection('duration')}
        >
          <div className="space-y-4">
            <div className="px-2">
              <div className="w-full">
                <div className="text-sm text-muted-foreground mb-2">
                  Duration: {formatDuration(filters.durationRange[0])} - {formatDuration(filters.durationRange[1])}
                </div>
                <input
                  type="range"
                  min="0"
                  max="3600"
                  step="30"
                  value={filters.durationRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    updateFilter('durationRange', [filters.durationRange[0], value]);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{formatDuration(filters.durationRange[0])}</span>
                <span>{formatDuration(filters.durationRange[1])}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="duration-min" className="text-xs">Min Duration</Label>
                <Input
                  id="duration-min"
                  type="number"
                  value={filters.durationRange[0]}
                  onChange={(e) => {
                    const value = Math.max(0, parseInt(e.target.value) || 0);
                    updateFilter('durationRange', [value, filters.durationRange[1]]);
                  }}
                  className="text-xs"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="duration-max" className="text-xs">Max Duration</Label>
                <Input
                  id="duration-max"
                  type="number"
                  value={filters.durationRange[1]}
                  onChange={(e) => {
                    const value = Math.min(3600, parseInt(e.target.value) || 3600);
                    updateFilter('durationRange', [filters.durationRange[0], value]);
                  }}
                  className="text-xs"
                  placeholder="3600"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        <Separator />

        {/* Date Range */}
        <FilterSection
          title="Upload Date"
          icon={<Calendar className="h-4 w-4" />}
          isOpen={expandedSections.dateRange}
          onToggle={() => toggleSection('dateRange')}
        >
          <div className="space-y-3">
            <div>
              <Label htmlFor="date-from" className="text-xs">From</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.dateRange[0].toISOString().split('T')[0]}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : new Date(0);
                  updateFilter('dateRange', [date, filters.dateRange[1]]);
                }}
                className="text-xs"
              />
            </div>
            <div>
              <Label htmlFor="date-to" className="text-xs">To</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.dateRange[1].toISOString().split('T')[0]}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : new Date();
                  updateFilter('dateRange', [filters.dateRange[0], date]);
                }}
                className="text-xs"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(filters.dateRange[0])} - {formatDate(filters.dateRange[1])}
            </div>
          </div>
        </FilterSection>

        <Separator />

        {/* Status */}
        <FilterSection
          title="Status"
          icon={<Settings className="h-4 w-4" />}
          isOpen={expandedSections.status}
          onToggle={() => toggleSection('status')}
          badgeCount={filters.status?.length || 0}
        >
          <div className="space-y-2">
            {[
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
              { value: 'processing', label: 'Processing' },
              { value: 'review', label: 'Review' },
              { value: 'archived', label: 'Archived' },
            ].map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={filters.status?.includes(status.value) || false}
                  onCheckedChange={() => toggleArrayFilter('status', status.value)}
                />
                <Label
                  htmlFor={`status-${status.value}`}
                  className="text-sm font-normal cursor-pointer capitalize"
                >
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      </CardContent>
    </Card>
  );
}