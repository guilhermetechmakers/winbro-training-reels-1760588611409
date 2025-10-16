import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Edit3, Save, RotateCcw } from 'lucide-react';
import type { AIProcessingResult } from '@/types/video';

interface TranscriptEditorProps {
  aiResult: AIProcessingResult;
  onTranscriptChange: (transcript: string) => void;
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export default function TranscriptEditor({
  aiResult,
  onTranscriptChange,
  onTagsChange,
  className
}: TranscriptEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(aiResult.transcript.text);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    setEditedTranscript(aiResult.transcript.text);
  }, [aiResult.transcript.text]);

  const handleSaveTranscript = () => {
    onTranscriptChange(editedTranscript);
    setIsEditing(false);
  };

  const handleTagToggle = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    onTagsChange(newSelectedTags);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const suggestedTags = aiResult.suggestedTags.sort((a, b) => b.confidence - a.confidence);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                AI Processing Complete
              </CardTitle>
              <CardDescription>
                Review and edit the auto-generated transcript and tags
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transcript */}
          <div className="space-y-3">
            <h4 className="font-medium">Transcript</h4>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  className="min-h-[120px] resize-none"
                  placeholder="Edit the transcript..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveTranscript}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditedTranscript(aiResult.transcript.text);
                      setIsEditing(false);
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{editedTranscript}</p>
              </div>
            )}
          </div>

          {/* Suggested Tags */}
          <div className="space-y-3">
            <h4 className="font-medium">Suggested Tags</h4>
            <p className="text-sm text-muted-foreground">
              Click to add tags to your video. Confidence scores are shown in parentheses.
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((suggestion) => (
                <Badge
                  key={suggestion.tag}
                  variant={selectedTags.includes(suggestion.tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleTagToggle(suggestion.tag)}
                >
                  {suggestion.tag}
                  <span className="ml-1 text-xs opacity-70">
                    ({Math.round(suggestion.confidence * 100)}%)
                  </span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Selected Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Transcript Segments */}
          <div className="space-y-3">
            <h4 className="font-medium">Timeline</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {aiResult.transcript.segments.map((segment, index) => (
                <div key={index} className="flex gap-3 text-sm">
                  <span className="text-muted-foreground font-mono text-xs mt-1 flex-shrink-0">
                    {formatTime(segment.start)}
                  </span>
                  <span className="flex-1">{segment.text}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
