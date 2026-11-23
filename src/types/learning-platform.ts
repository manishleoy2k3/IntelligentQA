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
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  estimatedHours?: number;
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
  contentHtml: string;
  blockData?: any; // Structured block AST (Editor.js / Tiptap compatible)
  originalDocxPath?: string;
  renderedDocxUrl?: string;
  wordCount?: number;
  estimatedReadTime?: number; // in minutes
  sortOrder: number;
  status: AcademyPublishStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
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
