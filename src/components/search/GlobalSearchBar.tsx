import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SearchSuggestion } from '@/types/search';

interface GlobalSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  recentSearches?: string[];
  suggestions?: SearchSuggestion[];
  isSuggestionsOpen?: boolean;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  onCloseSuggestions?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GlobalSearchBar({
  onSearch,
  placeholder = "Search videos, tags, or descriptions...",
  recentSearches = [],
  suggestions = [],
  isSuggestionsOpen = false,
  onSuggestionSelect,
  onCloseSuggestions,
  className,
  size = 'md',
}: GlobalSearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value);
    onSearch(value);
    setSelectedIndex(-1);
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSuggestionsOpen || (!suggestions.length && !recentSearches.length)) return;

    const totalItems = suggestions.length + recentSearches.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : totalItems - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            // Select suggestion
            const suggestion = suggestions[selectedIndex];
            handleSuggestionSelect(suggestion);
          } else {
            // Select recent search
            const recentIndex = selectedIndex - suggestions.length;
            const recentQuery = recentSearches[recentIndex];
            handleRecentSearchSelect(recentQuery);
          }
        } else {
          // Search current input
          handleSearch();
        }
        break;
      case 'Escape':
        onCloseSuggestions?.();
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setInputValue(suggestion.text);
    onSuggestionSelect?.(suggestion);
    onCloseSuggestions?.();
    setSelectedIndex(-1);
  };

  // Handle recent search selection
  const handleRecentSearchSelect = (query: string) => {
    setInputValue(query);
    onSearch(query);
    onCloseSuggestions?.();
    setSelectedIndex(-1);
  };

  // Handle search
  const handleSearch = () => {
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
      onCloseSuggestions?.();
    }
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
    onSearch('');
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        onCloseSuggestions?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCloseSuggestions]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions, recentSearches]);

  const hasSuggestions = suggestions.length > 0;
  const hasRecentSearches = recentSearches.length > 0;
  const showDropdown = isSuggestionsOpen && (hasSuggestions || hasRecentSearches);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground",
          iconSizes[size]
        )} />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10",
            sizeClasses[size],
            isFocused && "ring-2 ring-primary border-primary"
          )}
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className={cn(
              "absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted",
              size === 'sm' && "h-5 w-5",
              size === 'lg' && "h-8 w-8"
            )}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <Card 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border-0 bg-popover"
        >
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {/* Suggestions */}
              {hasSuggestions && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                    <Search className="h-3 w-3" />
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-muted rounded-md transition-colors",
                        selectedIndex === index && "bg-muted"
                      )}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{suggestion.text}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {suggestion.type.replace('_', ' ')}
                          {suggestion.count && ` • ${suggestion.count} results`}
                        </div>
                      </div>
                      {suggestion.type === 'query' && (
                        <Search className="h-3 w-3 text-muted-foreground" />
                      )}
                      {suggestion.type === 'tag' && (
                        <Badge variant="secondary" className="text-xs">
                          Tag
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {hasRecentSearches && (
                <div className="p-2 border-t">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Recent Searches
                  </div>
                  {recentSearches.map((query, index) => (
                    <button
                      key={`recent-${index}`}
                      onClick={() => handleRecentSearchSelect(query)}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-muted rounded-md transition-colors",
                        selectedIndex === suggestions.length + index && "bg-muted"
                      )}
                    >
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{query}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!hasSuggestions && !hasRecentSearches && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No suggestions available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}