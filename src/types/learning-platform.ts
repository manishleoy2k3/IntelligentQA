/**
 * IntelligentQA Learning Academy & Technical Documentation Platform
 * Core Type Definitions
 */

export type AcademyPublishStatus = 'draft' | 'published' | 'archived';

export interface AcademyCategory {
  id: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  parentCategoryId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademyCourse {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  estimatedHours?: number;
  displayOrder?: number;
  sortOrder: number;
  status: AcademyPublishStatus;
  modules?: AcademyModule[];
  createdAt: string;
  updatedAt: string;
}

export interface AcademyModule {
  id: string;
  courseId: string;
  slug: string;
  title: string;
  description?: string;
  displayOrder?: number;
  sortOrder: number;
  status: AcademyPublishStatus;
  lessons?: AcademyLesson[];
  createdAt: string;
  updatedAt: string;
}

export interface AcademyLesson {
  id: string;
  moduleId: string;
  courseId: string;
  slug: string;
  title: string;
  summary?: string;
  shortDescription?: string;
  contentType?: 'html' | 'markdown' | 'docx' | 'blocks';
  contentHtml: string;
  blockData?: any; // Structured block AST (Editor.js / Tiptap compatible)
  originalDocxPath?: string;
  originalDocumentPath?: string;
  renderedDocxUrl?: string;
  renderedHtmlPath?: string;
  pdfPath?: string;
  wordCount?: number;
  estimatedReadTime?: number; // in minutes
  estimatedReadingTime?: number; // in minutes
  displayOrder?: number;
  sortOrder: number;
  status: AcademyPublishStatus;
  publishedAt?: string | null;
  assets?: AcademyLessonAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface AcademyLessonAsset {
  id: string;
  lessonId: string;
  assetType: 'image' | 'diagram' | 'code' | 'attachment' | 'pdf';
  filePath: string;
  originalFilename: string;
  displayOrder: number;
  createdAt?: string;
}

export interface UserLessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  lastAccessedAt: string;
  completedAt?: string | null;
}

export interface ModuleProgressStat {
  moduleId: string;
  moduleTitle: string;
  moduleSlug: string;
  totalLessons: number;
  completedLessons: number;
  visitedLessons: number;
  percentCompleted: number;
}

export interface CourseProgressStat {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  level: string;
  totalLessons: number;
  completedLessons: number;
  visitedLessons: number;
  percentCompleted: number;
  modules: ModuleProgressStat[];
}

export interface UserLearningStats {
  userId: string;
  totalLessons: number;
  totalVisited: number;
  totalCompleted: number;
  overallPercentCompleted: number;
  lastAccessedLesson: {
    lessonId: string;
    lessonSlug: string;
    lessonTitle: string;
    moduleTitle: string;
    courseTitle: string;
    courseSlug: string;
    lastAccessedAt: string;
  } | null;
  courseProgress: CourseProgressStat[];
  completedLessons: {
    lessonId: string;
    lessonSlug: string;
    lessonTitle: string;
    moduleTitle: string;
    courseTitle: string;
    courseSlug: string;
    completedAt: string;
  }[];
  recentlyViewedLessons: {
    lessonId: string;
    lessonSlug: string;
    lessonTitle: string;
    moduleTitle: string;
    courseTitle: string;
    courseSlug: string;
    lastAccessedAt: string;
    completionStatus: 'in_progress' | 'completed';
  }[];
  enrolledCourseIds: string[];
}

export interface AcademyLessonBookmark {
  id: string;
  userId: string;
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  moduleTitle: string;
  courseTitle: string;
  courseSlug: string;
  createdAt: string;
}

export interface AcademySearchResult {
  id: string;
  type: 'course' | 'module' | 'lesson' | 'content';
  title: string;
  snippet?: string;
  lessonSlug: string;
  courseTitle: string;
  courseSlug: string;
  moduleTitle: string;
  matchedField: 'title' | 'summary' | 'content' | 'module' | 'course';
}

export interface AcademyDocumentSource {
  id: string;
  lessonId: string;
  originalFilename: string;
  storagePath: string;
  fileHashSha256: string;
  fileSizeBytes: number;
  mimeType: string;
  extractionMetadata?: {
    headingsCount?: number;
    tablesCount?: number;
    imagesCount?: number;
    codeBlocksCount?: number;
    warnings?: string[];
  };
  uploadedAt: string;
}

export interface AcademyMediaAttachment {
  id: string;
  lessonId?: string;
  fileName: string;
  filePath: string;
  fileHashSha256: string;
  width?: number;
  height?: number;
  mimeType: string;
  createdAt: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface LessonNavPointer {
  id: string;
  title: string;
  slug: string;
  courseSlug: string;
  categorySlug: string;
  moduleTitle: string;
}

export interface AcademyNavigationTreeCategory {
  id: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  parentCategoryId?: string | null;
  subcategories?: AcademyNavigationTreeCategory[];
  courses: AcademyNavigationTreeCourse[];
  totalLessons: number;
}

export interface AcademyNavigationTreeCourse {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  subtitle?: string;
  level: string;
  sortOrder: number;
  status: AcademyPublishStatus;
  modules: AcademyNavigationTreeModule[];
  totalLessons: number;
}

export interface AcademyNavigationTreeModule {
  id: string;
  courseId: string;
  slug: string;
  title: string;
  sortOrder: number;
  status: AcademyPublishStatus;
  lessons: AcademyNavigationTreeLesson[];
}

export interface AcademyNavigationTreeLesson {
  id: string;
  moduleId: string;
  courseId: string;
  slug: string;
  title: string;
  sortOrder: number;
  status: AcademyPublishStatus;
  estimatedReadTime?: number;
}

export interface AcademyReorderPayload {
  type: 'category' | 'course' | 'module' | 'lesson';
  parentId?: string;
  orderedIds: string[];
}
