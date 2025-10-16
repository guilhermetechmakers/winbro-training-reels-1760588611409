import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoApi } from '@/lib/api';
import { toast } from 'sonner';
import type { UpdateVideoClipInput } from '@/types/video';

// Query keys
export const videoKeys = {
  all: ['videos'] as const,
  lists: () => [...videoKeys.all, 'list'] as const,
  list: (filters: string) => [...videoKeys.lists(), { filters }] as const,
  details: () => [...videoKeys.all, 'detail'] as const,
  detail: (id: string) => [...videoKeys.details(), id] as const,
  search: (query: string) => [...videoKeys.all, 'search', query] as const,
};

// Get all videos
export const useVideos = (filters?: string) => {
  return useQuery({
    queryKey: videoKeys.list(filters || ''),
    queryFn: videoApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get video by ID
export const useVideo = (id: string) => {
  return useQuery({
    queryKey: videoKeys.detail(id),
    queryFn: () => videoApi.getById(id),
    enabled: !!id,
  });
};

// Search videos
export const useVideoSearch = (query: string) => {
  return useQuery({
    queryKey: videoKeys.search(query),
    queryFn: () => videoApi.search(query),
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Create video mutation
export const useCreateVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: videoApi.create,
    onSuccess: (newVideo) => {
      // Invalidate and refetch videos list
      queryClient.invalidateQueries({ queryKey: videoKeys.lists() });
      
      // Add the new video to the cache
      queryClient.setQueryData(videoKeys.detail(newVideo.id), newVideo);
      
      toast.success('Video created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create video: ${error.message}`);
    },
  });
};

// Update video mutation
export const useUpdateVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateVideoClipInput }) =>
      videoApi.update(id, updates),
    onSuccess: (updatedVideo) => {
      // Update the video in the cache
      queryClient.setQueryData(videoKeys.detail(updatedVideo.id), updatedVideo);
      
      // Invalidate videos list to ensure consistency
      queryClient.invalidateQueries({ queryKey: videoKeys.lists() });
      
      toast.success('Video updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update video: ${error.message}`);
    },
  });
};

// Delete video mutation
export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: videoApi.delete,
    onSuccess: (_, deletedId) => {
      // Remove the video from the cache
      queryClient.removeQueries({ queryKey: videoKeys.detail(deletedId) });
      
      // Invalidate videos list
      queryClient.invalidateQueries({ queryKey: videoKeys.lists() });
      
      toast.success('Video deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete video: ${error.message}`);
    },
  });
};

// Video upload hook
export const useVideoUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
      videoApi.upload(file, onProgress),
    onSuccess: () => {
      // Invalidate videos list to show new uploads
      queryClient.invalidateQueries({ queryKey: videoKeys.lists() });
      
      toast.success('Video uploaded successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to upload video: ${error.message}`);
    },
  });
};
