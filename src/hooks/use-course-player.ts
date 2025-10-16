import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/lib/api';
import type {
  QuizSubmission
} from '@/types/course';

interface UseCoursePlayerProps {
  courseId: string;
  enrollmentId?: string;
}

export function useCoursePlayer({ courseId, enrollmentId }: UseCoursePlayerProps) {
  const queryClient = useQueryClient();
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);

  // Course player data query
  const {
    data: courseData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['course-player', courseId],
    queryFn: () => courseApi.getPlayerData(courseId),
    enabled: !!courseId,
  });

  // Enrollment query
  const {
    data: enrollment,
    isLoading: enrollmentLoading
  } = useQuery({
    queryKey: ['enrollment', enrollmentId],
    queryFn: () => enrollmentId ? courseApi.getEnrollment(enrollmentId) : null,
    enabled: !!enrollmentId,
  });

  // Progress query
  const {
    data: progress,
    isLoading: progressLoading
  } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => courseApi.getProgress(courseId),
    enabled: !!courseId,
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data: { lesson_id: string; completed: boolean } }) => 
      courseApi.updateProgress(enrollmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', enrollmentId] });
    },
  });

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: (data: QuizSubmission) => {
      // Create a quiz attempt first, then submit
      return courseApi.startQuizAttempt(data.quiz_id).then(attempt => 
        courseApi.submitQuiz(attempt.id, data)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', enrollmentId] });
    },
  });

  // Generate certificate mutation
  const generateCertificateMutation = useMutation({
    mutationFn: (enrollmentId: string) => courseApi.generateCertificate(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', enrollmentId] });
    },
  });

  // Helper functions
  const updateProgress = useCallback(async (data: { enrollmentId: string; data: { lesson_id: string; completed: boolean } }) => {
    try {
      await updateProgressMutation.mutateAsync(data);
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }, [updateProgressMutation]);

  const submitQuiz = useCallback(async (data: QuizSubmission) => {
    try {
      await submitQuizMutation.mutateAsync(data);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  }, [submitQuizMutation]);

  const generateCertificate = useCallback(async (enrollmentId: string) => {
    try {
      const certificate = await generateCertificateMutation.mutateAsync(enrollmentId);
      return certificate;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }, [generateCertificateMutation]);

  const startQuiz = useCallback(() => {
    setIsQuizActive(true);
    // Additional quiz start logic can be added here
  }, []);

  const completeQuiz = useCallback(() => {
    setIsQuizActive(false);
    // Additional quiz completion logic can be added here
  }, []);

  const goToLesson = useCallback((lessonId: string) => {
    setCurrentLessonId(lessonId);
  }, []);

  const goToNextLesson = useCallback(() => {
    if (!courseData?.course?.modules) return;

    const allLessons = courseData.course.modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setCurrentLessonId(nextLesson.id);
    }
  }, [courseData, currentLessonId]);

  const goToPreviousLesson = useCallback(() => {
    if (!courseData?.course?.modules) return;

    const allLessons = courseData.course.modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    
    if (currentIndex > 0) {
      const previousLesson = allLessons[currentIndex - 1];
      setCurrentLessonId(previousLesson.id);
    }
  }, [courseData, currentLessonId]);

  // Get current lesson
  const currentLesson = courseData?.course?.modules
    ?.flatMap(m => m.lessons)
    .find(l => l.id === currentLessonId) || null;

  // Get next lesson
  const nextLesson = courseData?.course?.modules
    ?.flatMap(m => m.lessons)
    .find((_, index, array) => {
      const currentIndex = array.findIndex(l => l.id === currentLessonId);
      return index === currentIndex + 1;
    }) || null;

  return {
    // Data
    courseData,
    enrollment,
    progress,
    currentLesson,
    nextLesson,
    currentLessonId,
    isQuizActive,
    
    // Loading states
    isLoading: isLoading || enrollmentLoading || progressLoading,
    error,
    
    // Actions
    setCurrentLessonId,
    setIsQuizActive,
    updateProgress,
    submitQuiz,
    generateCertificate,
    startQuiz,
    completeQuiz,
    goToLesson,
    goToNextLesson,
    goToPreviousLesson,
    
    // Mutation states
    isUpdatingProgress: updateProgressMutation.isPending,
    isSubmittingQuiz: submitQuizMutation.isPending,
    isGeneratingCertificate: generateCertificateMutation.isPending,
  };
}
