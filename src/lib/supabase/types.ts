import { z } from 'zod';

// ==============================================================================
// 1. Zod Validation Schemas
// ==============================================================================

export const CategorySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  icon: z.string().default('BookOpen'),
  sort_order: z.number().int().default(0),
  parent_category_id: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CourseSchema = z.object({
  id: z.string().min(1),
  category_id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  level: z
    .enum(['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'Comprehensive'])
    .default('All Levels'),
  estimated_hours: z.number().int().default(10),
  sort_order: z.number().int().default(0),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CourseModuleSchema = z.object({
  id: z.string().min(1),
  course_id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CourseLessonSchema = z.object({
  id: z.string().min(1),
  module_id: z.string().min(1),
  course_id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional().nullable(),
  content_html: z.string().default(''),
  block_data: z.record(z.string(), z.any()).default({}),
  original_docx_path: z.string().optional().nullable(),
  rendered_docx_url: z.string().optional().nullable(),
  word_count: z.number().int().default(0),
  estimated_read_time: z.number().int().default(3),
  sort_order: z.number().int().default(0),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  published_at: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const InterviewQuestionSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  technology: z.string().min(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Architect', 'Junior', 'Mid', 'Senior']),
  experience_level: z.string().optional().nullable(),
  min_years: z.number().int().default(0),
  max_years: z.number().int().default(30),
  topic: z.string().min(1),
  question: z.string().min(1),
  expected_focus: z.string().optional().nullable(),
  answer_summary: z.string().min(1),
  code_snippet: z.string().default(''),
  best_practice: z.string().min(1),
  pitfall_to_avoid: z.string().min(1),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const UserProfileSchema = z.object({
  id: z.string().min(1),
  firebase_uid: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  display_name: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  target_role: z.string().default('Manual QA'),
  primary_track: z.string().default('playwright-ts'),
  experience_years: z.number().optional().nullable(),
  streak_count: z.number().int().default(0),
  role: z.enum(['user', 'admin']).default('user'),
  profile_completed: z.boolean().default(false),
  last_active_date: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const UserLessonProgressSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().min(1),
  course_id: z.string().min(1),
  lesson_id: z.string().min(1),
  completion_status: z.enum(['not_started', 'in_progress', 'completed']).default('in_progress'),
  last_accessed_at: z.string().optional(),
  completed_at: z.string().optional().nullable(),
});

export const UserExerciseRecordSchema = z.object({
  id: z.string().min(1),
  user_id: z.string().min(1),
  language: z.string().min(1),
  user_answers: z.record(z.string(), z.any()).default({}),
  score: z.number().int().default(0),
  total_answered: z.number().int().default(0),
  updated_at: z.string().optional(),
});

export const UserCodingProjectSchema = z.object({
  id: z.string().min(1),
  user_id: z.string().min(1),
  language: z.string().min(1),
  project_id: z.string().min(1),
  code: z.string().default(''),
  updated_at: z.string().optional(),
});

// ==============================================================================
// 2. TypeScript Inferred Types
// ==============================================================================

export type CategoryRecord = z.infer<typeof CategorySchema>;
export type CourseRecord = z.infer<typeof CourseSchema>;
export type CourseModuleRecord = z.infer<typeof CourseModuleSchema>;
export type CourseLessonRecord = z.infer<typeof CourseLessonSchema>;
export type InterviewQuestionRecord = z.infer<typeof InterviewQuestionSchema>;
export type UserProfileRecord = z.infer<typeof UserProfileSchema>;
export type UserLessonProgressRecord = z.infer<typeof UserLessonProgressSchema>;
export type UserExerciseRecord = z.infer<typeof UserExerciseRecordSchema>;
export type UserCodingProjectRecord = z.infer<typeof UserCodingProjectSchema>;

export interface KnowledgeChunkRecord {
  id: string;
  source_type: 'lesson' | 'interview_question' | 'documentation' | 'code_example';
  source_id: string;
  course_id?: string | null;
  lesson_id?: string | null;
  chunk_index: number;
  chunk_content: string;
  token_count: number;
  embedding: number[];
  metadata: Record<string, any>;
  is_active: boolean;
  created_at?: string;
}

export interface ChatSessionRecord {
  id: string;
  user_identifier: string;
  session_mode: 'sdet_mentor' | 'interview_griller' | 'code_auditor' | 'academy_tutor';
  title: string;
  context_filters: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessageRecord {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  token_usage: Record<string, any>;
  created_at?: string;
}
