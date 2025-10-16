export interface Course {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  organization_id?: string;
  estimated_duration?: number; // minutes
  passing_score: number; // percentage
  is_published: boolean;
  created_at: string;
  updated_at: string;
  modules: CourseModule[];
  quizzes: CourseQuiz[];
  enrollment_count?: number;
  completion_count?: number;
  average_rating?: number;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  sort_order: number;
  created_at: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  video_id: string;
  title?: string;
  sort_order: number;
  is_required: boolean;
  created_at: string;
  video?: import('./video').VideoClip; // Populated when needed
}

export interface CourseQuiz {
  id: string;
  course_id: string;
  module_id?: string;
  title: string;
  description?: string;
  time_limit?: number; // minutes
  sort_order: number;
  created_at: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  correct_answer: string;
  answer_options?: string[]; // For multiple choice
  points: number;
  sort_order: number;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  current_lesson_id?: string;
  progress_percentage: number;
  final_score?: number;
  certificate_issued_at?: string;
  course?: Course; // Populated when needed
  user?: import('./user').User; // Populated when needed
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  enrollment_id: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  passed?: boolean;
  answers: Record<string, string | number>; // question_id -> answer
}

export interface Certificate {
  id: string;
  enrollment_id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  pdf_url?: string;
  verification_code: string;
  course?: Course; // Populated when needed
  user?: import('./user').User; // Populated when needed
}

// Input types for creating/updating courses
export interface CreateCourseInput {
  title: string;
  description?: string;
  estimated_duration?: number;
  passing_score?: number;
  organization_id?: string;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  estimated_duration?: number;
  passing_score?: number;
  is_published?: boolean;
}

export interface CreateModuleInput {
  course_id: string;
  title: string;
  description?: string;
  sort_order: number;
}

export interface CreateLessonInput {
  module_id: string;
  video_id: string;
  title?: string;
  sort_order: number;
  is_required?: boolean;
}

export interface CreateQuizInput {
  course_id: string;
  module_id?: string;
  title: string;
  description?: string;
  time_limit?: number;
  sort_order: number;
}

export interface CreateQuestionInput {
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  correct_answer: string;
  answer_options?: string[];
  points?: number;
  sort_order: number;
}

// Course player specific types
export interface CoursePlayerData {
  course: Course;
  enrollment: CourseEnrollment;
  currentLesson?: CourseLesson;
  nextLesson?: CourseLesson;
  progress: {
    completedLessons: number;
    totalLessons: number;
    completedQuizzes: number;
    totalQuizzes: number;
    percentage: number;
  };
}

export interface QuizSubmission {
  quiz_id: string;
  answers: Record<string, string | number>;
}

export interface CourseProgress {
  course_id: string;
  user_id: string;
  current_module_id?: string;
  current_lesson_id?: string;
  completed_lessons: string[];
  quiz_attempts: QuizAttempt[];
  progress_percentage: number;
  started_at: string;
  last_accessed_at: string;
  completed_at?: string;
}
