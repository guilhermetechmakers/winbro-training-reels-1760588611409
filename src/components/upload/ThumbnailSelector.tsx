import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Upload, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThumbnailSelectorProps {
  thumbnails: string[];
  selectedThumbnail?: string;
  onThumbnailSelect: (thumbnailUrl: string) => void;
  onCustomUpload: (file: File) => void;
  className?: string;
}

export default function ThumbnailSelector({
  thumbnails,
  selectedThumbnail,
  onThumbnailSelect,
  onCustomUpload,
  className
}: ThumbnailSelectorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      try {
        onCustomUpload(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          Select Thumbnail
        </CardTitle>
        <CardDescription>
          Choose a thumbnail that best represents your video content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-generated Thumbnails */}
        {thumbnails.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Auto-generated Thumbnails</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {thumbnails.map((thumbnail, index) => (
                <div
                  key={index}
                  className={cn(
                    'relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 hover:scale-105',
                    selectedThumbnail === thumbnail
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  )}
                  onClick={() => onThumbnailSelect(thumbnail)}
                >
                  <img
                    src={thumbnail}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedThumbnail === thumbnail && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-primary bg-background rounded-full p-1" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Upload */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Custom Thumbnail</h4>
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">
              Upload custom thumbnail
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG up to 2MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomUpload}
            className="hidden"
          />
        </div>

        {/* Selected Thumbnail Preview */}
        {selectedThumbnail && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Selected Thumbnail</h4>
            <div className="relative aspect-video max-w-xs rounded-lg overflow-hidden border">
              <img
                src={selectedThumbnail}
                alt="Selected thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Upload Status */}
        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Uploading custom thumbnail...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
