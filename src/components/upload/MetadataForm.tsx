import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Tag } from 'lucide-react';
import type { VideoMetadata } from '@/types/video';

interface MetadataFormProps {
  metadata: VideoMetadata;
  onChange: (metadata: VideoMetadata) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  className?: string;
}

const MACHINE_MODELS = [
  'CNC Mill',
  'CNC Lathe',
  'Manual Mill',
  'Manual Lathe',
  'Grinder',
  'Drill Press',
  'Band Saw',
  'Other'
];

const PROCESS_CATEGORIES = [
  'Setup',
  'Operation',
  'Maintenance',
  'Safety',
  'Quality Control',
  'Troubleshooting',
  'Tool Change',
  'Measurement'
];

const COMMON_TOOLING = [
  'End Mill',
  'Drill Bit',
  'Tap',
  'Reamer',
  'Boring Bar',
  'Insert',
  'Collet',
  'Chuck',
  'Vise',
  'Fixture'
];

export default function MetadataForm({
  metadata,
  onChange,
  onSubmit,
  isSubmitting,
  className
}: MetadataFormProps) {
  const [newTag, setNewTag] = useState('');
  const [newTooling, setNewTooling] = useState('');

  const handleInputChange = (field: keyof VideoMetadata, value: string | boolean) => {
    onChange({
      ...metadata,
      [field]: value
    });
  };

  const handleArrayChange = (field: 'tags' | 'tooling', value: string) => {
    if (value.trim() && !metadata[field].includes(value.trim())) {
      onChange({
        ...metadata,
        [field]: [...metadata[field], value.trim()]
      });
    }
  };

  const removeFromArray = (field: 'tags' | 'tooling', value: string) => {
    onChange({
      ...metadata,
      [field]: metadata[field].filter(item => item !== value)
    });
  };

  const isFormValid = metadata.title.trim() && metadata.machineModel && metadata.process;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Video Metadata</CardTitle>
        <CardDescription>
          Provide details about your training video to help others find and use it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={metadata.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter a descriptive title for your video"
            className="input-focus"
          />
        </div>

        {/* Machine Model */}
        <div className="space-y-2">
          <Label htmlFor="machineModel">Machine Model *</Label>
          <select
            id="machineModel"
            value={metadata.machineModel}
            onChange={(e) => handleInputChange('machineModel', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Select machine model</option>
            {MACHINE_MODELS.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Process Category */}
        <div className="space-y-2">
          <Label htmlFor="process">Process Category *</Label>
          <select
            id="process"
            value={metadata.process}
            onChange={(e) => handleInputChange('process', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Select process category</option>
            {PROCESS_CATEGORIES.map((process) => (
              <option key={process} value={process}>{process}</option>
            ))}
          </select>
        </div>

        {/* Step Description */}
        <div className="space-y-2">
          <Label htmlFor="step">Step/Procedure Description</Label>
          <textarea
            id="step"
            value={metadata.step}
            onChange={(e) => handleInputChange('step', e.target.value)}
            placeholder="Describe the specific step or procedure shown in the video"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary min-h-[80px] resize-none"
          />
        </div>

        {/* Tooling Tags */}
        <div className="space-y-2">
          <Label>Tooling Used</Label>
          <div className="flex gap-2">
            <Input
              value={newTooling}
              onChange={(e) => setNewTooling(e.target.value)}
              placeholder="Add tooling (e.g., End Mill, Drill Bit)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayChange('tooling', newTooling);
                  setNewTooling('');
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                handleArrayChange('tooling', newTooling);
                setNewTooling('');
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {metadata.tooling.map((tool) => (
              <Badge key={tool} variant="secondary" className="flex items-center gap-1">
                {tool}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeFromArray('tooling', tool)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {COMMON_TOOLING.map((tool) => (
              <Button
                key={tool}
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => handleArrayChange('tooling', tool)}
              >
                {tool}
              </Button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tags for better searchability"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayChange('tags', newTag);
                  setNewTag('');
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                handleArrayChange('tags', newTag);
                setNewTag('');
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {metadata.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeFromArray('tags', tag)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isCustomerSpecific"
            checked={metadata.isCustomerSpecific}
            onCheckedChange={(checked) => handleInputChange('isCustomerSpecific', checked as boolean)}
          />
          <Label htmlFor="isCustomerSpecific" className="text-sm">
            Customer-specific content (restricted to your organization)
          </Label>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={!isFormValid || isSubmitting}
          className="w-full btn-primary"
        >
          {isSubmitting ? 'Processing...' : 'Continue to Review'}
        </Button>
      </CardContent>
    </Card>
  );
}
