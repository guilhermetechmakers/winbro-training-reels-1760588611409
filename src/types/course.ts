export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  modules: CourseModule[];
  settings: CourseSettings;
  owner_id: string;
  organization_id?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  enrollment_count: number;
  completion_count: number;
  average_rating: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  video_clip_id: string;
  order: number;
  duration: number;
  quiz?: Quiz;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  time_limit?: number; // in minutes
  pass_score: number; // percentage
  attempts_allowed?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correct_answer: string | number;
  points: number;
}

export interface CourseSettings {
  visibility: 'public' | 'organization' | 'private';
  enrollment_type: 'open' | 'invite_only' | 'approval_required';
  certificate_enabled: boolean;
  completion_criteria: 'all_lessons' | 'quiz_pass' | 'custom';
  expiry_days?: number;
}

export interface CreateCourseInput {
  title: string;
  description?: string;
  modules: Omit<CourseModule, 'id'>[];
  settings: CourseSettings;
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

export interface QuizAttempt {
  quiz_id: string;
  attempt_number: number;
  answers: Record<string, string | number>;
  score: number;
  passed: boolean;
  completed_at: string;
}
