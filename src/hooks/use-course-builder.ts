import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/lib/api';
import { videoApi } from '@/lib/api';
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CreateModuleInput,
} from '@/types/course';
// import type { VideoClip } from '@/types/video';

interface UseCourseBuilderProps {
  courseId?: string;
}

export function useCourseBuilder({ courseId }: UseCourseBuilderProps = {}) {
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Course queries
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError
  } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseId ? courseApi.getById(courseId) : null,
    enabled: !!courseId,
  });

  const {
    data: modules = [],
    isLoading: modulesLoading
  } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: () => courseId ? courseApi.getModules(courseId) : [],
    enabled: !!courseId,
  });

  const {
    data: quizzes = [],
    isLoading: quizzesLoading
  } = useQuery({
    queryKey: ['course-quizzes', courseId],
    queryFn: () => courseId ? courseApi.getQuizzes(courseId) : [],
    enabled: !!courseId,
  });

  // Video library query
  const {
    data: videos = [],
    isLoading: videosLoading
  } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videoApi.getAll(),
  });

  // Course mutations
  const createCourseMutation = useMutation({
    mutationFn: (data: CreateCourseInput) => courseApi.create(data),
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      return newCourse;
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseInput }) => 
      courseApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });

  const publishCourseMutation = useMutation({
    mutationFn: (id: string) => courseApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  // Module mutations
  const createModuleMutation = useMutation({
    mutationFn: (data: CreateModuleInput) => courseApi.createModule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] });
    },
  });

  // Helper functions
  const addVideoToModule = useCallback((moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const nextOrder = Math.max(...module.lessons.map(l => l.sort_order), 0) + 1;
    
    createModuleMutation.mutate({
      course_id: courseId!,
      title: 'New Module',
      sort_order: nextOrder,
    });
  }, [modules, createModuleMutation]);

  const calculateEstimatedDuration = useCallback(() => {
    if (!modules.length) return 0;
    
    return modules.reduce((total, module) => {
      return total + module.lessons.reduce((moduleTotal, lesson) => {
        // Assuming each video has duration in seconds, convert to minutes
        return moduleTotal + (lesson.video?.duration || 0) / 60;
      }, 0);
    }, 0);
  }, [modules]);

  return {
    // State
    course,
    modules,
    quizzes,
    videos,
    selectedModule,
    selectedQuiz,
    isPreviewMode,
    
    // Loading states
    courseLoading,
    modulesLoading,
    quizzesLoading,
    videosLoading,
    courseError,
    
    // Actions
    setSelectedModule,
    setSelectedQuiz,
    setIsPreviewMode,
    
    // Course actions
    createCourse: createCourseMutation.mutate,
    updateCourse: updateCourseMutation.mutate,
    publishCourse: publishCourseMutation.mutate,
    
    // Module actions
    createModule: createModuleMutation.mutate,
    
    // Lesson actions
    addVideoToModule,
    
    // Helper functions
    calculateEstimatedDuration,
    
    // Mutation states
    isCreatingCourse: createCourseMutation.isPending,
    isUpdatingCourse: updateCourseMutation.isPending,
    isPublishingCourse: publishCourseMutation.isPending,
    isCreatingModule: createModuleMutation.isPending,
  };
}
