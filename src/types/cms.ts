// 100% Open-Source CMS & Editor Types (Editor.js Compatible Specification)

export type ArticleStatus = 'draft' | 'in_review' | 'published' | 'scheduled' | 'archived';

export type BlockType =
  | 'header'
  | 'paragraph'
  | 'list'
  | 'code'
  | 'terminal'
  | 'image'
  | 'sideBySideImages'
  | 'table'
  | 'callout'
  | 'stepByStep'
  | 'faq'
  | 'comparisonTable'
  | 'embed'
  | 'resource'
  | 'related'
  | 'quote'
  | 'delimiter';

export interface EditorHeaderBlock {
  id: string;
  type: 'header';
  data: {
    text: string;
    level: 1 | 2 | 3 | 4;
    anchor?: string;
  };
}

export interface EditorParagraphBlock {
  id: string;
  type: 'paragraph';
  data: {
    text: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
  };
}

export interface EditorListBlock {
  id: string;
  type: 'list';
  data: {
    style: 'ordered' | 'unordered';
    items: string[];
  };
}

export interface EditorCodeBlock {
  id: string;
  type: 'code';
  data: {
    code: string;
    language: string;
    caption?: string;
    highlightLines?: number[];
  };
}

export interface EditorTerminalBlock {
  id: string;
  type: 'terminal';
  data: {
    code: string;
    prompt?: string;
    caption?: string;
  };
}

export interface EditorImageBlock {
  id: string;
  type: 'image';
  data: {
    file: {
      url: string;
    };
    caption?: string;
    alt?: string;
    alignment?: 'left' | 'center' | 'right' | 'full';
    size?: 'small' | 'medium' | 'large' | 'full';
    withBorder?: boolean;
    withBackground?: boolean;
    stretched?: boolean;
  };
}

export interface EditorSideBySideImagesBlock {
  id: string;
  type: 'sideBySideImages';
  data: {
    images: {
      url: string;
      caption?: string;
      alt?: string;
    }[];
  };
}

export interface EditorTableBlock {
  id: string;
  type: 'table';
  data: {
    withHeadings: boolean;
    content: string[][];
  };
}

export interface EditorCalloutBlock {
  id: string;
  type: 'callout';
  data: {
    type: 'info' | 'warning' | 'tip' | 'danger';
    title: string;
    message: string;
  };
}

export interface EditorStepItem {
  stepNumber: number;
  title: string;
  badge?: string;
  summary?: string;
  explanation: string;
  codeSnippet?: {
    language: string;
    code: string;
    caption?: string;
  };
  proTip?: string;
}

export interface EditorStepByStepBlock {
  id: string;
  type: 'stepByStep';
  data: {
    title?: string;
    steps: EditorStepItem[];
  };
}

export interface EditorFAQItem {
  question: string;
  answer: string;
}

export interface EditorFAQBlock {
  id: string;
  type: 'faq';
  data: {
    title?: string;
    items: EditorFAQItem[];
  };
}

export interface EditorComparisonTableBlock {
  id: string;
  type: 'comparisonTable';
  data: {
    title?: string;
    columns: string[];
    rows: {
      feature: string;
      values: string[];
    }[];
  };
}

export interface EditorEmbedBlock {
  id: string;
  type: 'embed';
  data: {
    service: 'youtube' | 'vimeo' | 'mp4';
    source: string;
    caption?: string;
  };
}

export interface EditorResourceBlock {
  id: string;
  type: 'resource';
  data: {
    title: string;
    description: string;
    downloadUrl: string;
    fileSize?: string;
    fileType?: string;
  };
}

export interface EditorRelatedBlock {
  id: string;
  type: 'related';
  data: {
    title?: string;
    items: {
      title: string;
      url: string;
      category?: string;
      readTime?: string;
    }[];
  };
}

export interface EditorQuoteBlock {
  id: string;
  type: 'quote';
  data: {
    text: string;
    caption?: string;
    alignment?: 'left' | 'center';
  };
}

export interface EditorDelimiterBlock {
  id: string;
  type: 'delimiter';
  data: Record<string, never>;
}

export type EditorBlock =
  | EditorHeaderBlock
  | EditorParagraphBlock
  | EditorListBlock
  | EditorCodeBlock
  | EditorTerminalBlock
  | EditorImageBlock
  | EditorSideBySideImagesBlock
  | EditorTableBlock
  | EditorCalloutBlock
  | EditorStepByStepBlock
  | EditorFAQBlock
  | EditorComparisonTableBlock
  | EditorEmbedBlock
  | EditorResourceBlock
  | EditorRelatedBlock
  | EditorQuoteBlock
  | EditorDelimiterBlock;

export interface EditorJSData {
  time?: number;
  blocks: EditorBlock[];
  version?: string;
}

export interface CMSRevision {
  id: string;
  articleId: string;
  title: string;
  content: EditorJSData;
  createdAt: string;
  createdBy: string;
  summary: string;
}

export interface CMSArticleAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  bio?: string;
}

export interface CMSArticle {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  shortDescription: string;
  featuredImage?: string;
  featuredImageCaption?: string;
  category: string;
  tags: string[];
  content: EditorJSData;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  status: ArticleStatus;
  publishedDate?: string;
  scheduledDate?: string;
  updatedDate: string;
  readingTimeMinutes: number;
  createdBy: CMSArticleAuthor;
  updatedBy?: { id: string; name: string };
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  revisions?: CMSRevision[];
  viewCount?: number;
}

export interface CMSCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  count: number;
}

export interface CMSTag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface CMSMediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  dimensions?: { width: number; height: number };
  alt: string;
  caption?: string;
  category?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface CMSAuditLog {
  id: string;
  timestamp: string;
  user: { id: string; name: string; email: string };
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'restore_revision' | 'upload_media';
  entityType: 'article' | 'course' | 'module' | 'lesson' | 'media' | 'category' | 'tag';
  entityId: string;
  entityTitle?: string;
  details?: string;
}

export interface CMSStats {
  totalCourses: number;
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  scheduledArticles: number;
  archivedArticles: number;
  totalMediaItems: number;
  recentlyUpdated: CMSArticle[];
  recentlyPublished: CMSArticle[];
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}
