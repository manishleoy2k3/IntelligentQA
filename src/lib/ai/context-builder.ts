import { LessonContextPackage } from './types';

export function buildLessonPromptContext(context: LessonContextPackage): string {
  const parts: string[] = [];

  parts.push('=== CURRICULUM CONTEXT ===');
  if (context.course) {
    parts.push(`Course Name: ${context.course.name}`);
    if (context.course.category) parts.push(`Course Category: ${context.course.category}`);
    if (context.course.description) parts.push(`Course Description: ${context.course.description}`);
    if (context.course.objectives && context.course.objectives.length > 0) {
      parts.push(`Course Objectives:\n- ${context.course.objectives.join('\n- ')}`);
    }
  }

  if (context.module) {
    parts.push(`\nModule Name: ${context.module.name}`);
    if (context.module.description) parts.push(`Module Description: ${context.module.description}`);
    if (context.module.position) parts.push(`Module Position in Course: ${context.module.position}`);
    if (context.module.relatedLessons && context.module.relatedLessons.length > 0) {
      parts.push(`Sibling Lessons in Module: ${context.module.relatedLessons.join(', ')}`);
    }
  }

  if (context.curriculum) {
    if (context.curriculum.previousLessonTitle) parts.push(`Previous Lesson: ${context.curriculum.previousLessonTitle}`);
    if (context.curriculum.nextLessonTitle) parts.push(`Next Lesson: ${context.curriculum.nextLessonTitle}`);
    if (context.curriculum.moduleHierarchy && context.curriculum.moduleHierarchy.length > 0) {
      parts.push(`Module Hierarchy: ${context.curriculum.moduleHierarchy.join(' -> ')}`);
    }
  }

  parts.push('\n=== TARGET AUDIENCE ===');
  const audience = context.audience && context.audience.length > 0
    ? context.audience
    : [
        'Beginner QA Engineers',
        'Manual Test Engineers transitioning to automation',
        'SDETs',
        'QA Automation Engineers',
        'Senior Automation Engineers',
        'Test Architects',
        'QA Managers',
        'Engineering Leaders',
      ];
  parts.push(`Target Audience Profiles: ${audience.join(', ')}`);

  parts.push('\n=== CURRENT LESSON UNDER EDIT ===');
  parts.push(`Lesson ID: ${context.currentLesson.id}`);
  parts.push(`Lesson Title: ${context.currentLesson.title}`);
  if (context.currentLesson.description) {
    parts.push(`Lesson Summary: ${context.currentLesson.description}`);
  }

  if (context.selectedText && context.selectedText.trim()) {
    parts.push(`\n--- SELECTED CONTENT IN EDITOR (User Highlighted Target) ---\n${context.selectedText.trim()}\n--- END SELECTED CONTENT ---`);
  }

  // Sanitize content length if too enormous to stay within free-tier model context limits (max ~100k chars)
  const fullContent = context.currentLesson.contentHtml || '';
  const truncatedContent = fullContent.length > 60000 
    ? fullContent.slice(0, 60000) + '\n\n[... Lesson content truncated for token conservation ...]'
    : fullContent;

  parts.push(`\n--- COMPLETE CURRENT LESSON CONTENT ---\n${truncatedContent}\n--- END CURRENT LESSON CONTENT ---`);

  return parts.join('\n');
}
