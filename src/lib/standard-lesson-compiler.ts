import { StandardLessonTemplateData } from '@/types/standard-lesson';

/**
 * Utility: Compiles StandardLessonTemplateData into rich semantic HTML
 * for storage in curriculum-data-store.json or DOCX export
 */
export function generateStandardLessonHtml(data: StandardLessonTemplateData): string {
  const escapeHtml = (str: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  let html = `<div class="standard-lesson-container space-y-8 text-slate-800 dark:text-neutral-200">`;

  // 1. Overview
  if (data.overview) {
    html += `
      <div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <div class="border-b border-slate-100 dark:border-neutral-800 pb-3">
          <span class="text-xs font-mono font-bold uppercase text-emerald-500">Section 1 · Overview</span>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-1">Lesson Overview</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
            <h4 class="font-bold uppercase text-slate-500 mb-1">What is this concept?</h4>
            <p class="text-slate-700 dark:text-neutral-300 leading-relaxed">${escapeHtml(data.overview.whatIsIt)}</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
            <h4 class="font-bold uppercase text-slate-500 mb-1">Why is it important?</h4>
            <p class="text-slate-700 dark:text-neutral-300 leading-relaxed">${escapeHtml(data.overview.whyImportant)}</p>
          </div>
          <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <h4 class="font-bold uppercase text-emerald-500 mb-1">Where is it used in testing?</h4>
            <p class="text-slate-700 dark:text-neutral-300 leading-relaxed">${escapeHtml(data.overview.whereUsed)}</p>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Objectives
  if (Array.isArray(data.learningObjectives) && data.learningObjectives.length > 0) {
    html += `
      <div class="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 p-6 space-y-3">
        <span class="text-xs font-mono font-bold uppercase text-indigo-500">Section 2 · Objectives</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Learning Objectives</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          ${data.learningObjectives.map(o => `<div class="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-indigo-100 dark:border-indigo-900 text-slate-700 dark:text-neutral-200 font-medium">✓ ${escapeHtml(o)}</div>`).join('')}
        </div>
      </div>
    `;
  }

  // 3. Concept Explanation
  if (data.conceptExplanation) {
    html += `
      <div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <div class="border-b border-slate-100 dark:border-neutral-800 pb-3">
          <span class="text-xs font-mono font-bold uppercase text-blue-500">Section 3 · Theory</span>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-1">Concept Explanation</h3>
        </div>
        <div class="space-y-3 text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">
          ${Array.isArray(data.conceptExplanation.theory) ? data.conceptExplanation.theory.map(t => `<p>${t}</p>`).join('') : ''}
        </div>
        ${Array.isArray(data.conceptExplanation.terminology) && data.conceptExplanation.terminology.length > 0 ? `
          <div class="pt-2">
            <h4 class="text-xs font-bold uppercase text-slate-500 mb-2">Key Terminology:</h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              ${data.conceptExplanation.terminology.map(t => `<div class="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs"><strong class="block text-slate-900 dark:text-white mb-1">${escapeHtml(t.term)}</strong><span class="text-slate-600 dark:text-neutral-400">${escapeHtml(t.definition)}</span></div>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 4. Code Examples
  if (Array.isArray(data.codeExamples) && data.codeExamples.length > 0) {
    html += `
      <div class="space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-emerald-500">Section 7 · Implementation Code</span>
        ${data.codeExamples.map(codeItem => `
          <div class="rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-900 overflow-hidden font-mono text-xs">
            <div class="px-4 py-2 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-slate-300">
              <span class="font-bold text-slate-200">${escapeHtml(codeItem.filename || codeItem.title)}</span>
              <span class="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 text-[10px] uppercase">${escapeHtml(codeItem.language)}</span>
            </div>
            <pre class="p-4 text-[#81FF89] overflow-x-auto leading-relaxed"><code>${escapeHtml(codeItem.code)}</code></pre>
            ${codeItem.explanation ? `<div class="px-4 py-2 bg-slate-950 text-[11px] text-slate-400 border-t border-slate-800">${escapeHtml(codeItem.explanation)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  // 5. Troubleshooting
  if (Array.isArray(data.commonProblems) && data.commonProblems.length > 0) {
    html += `
      <div class="rounded-2xl border border-red-200 dark:border-red-950 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-red-500">Section 9 · Troubleshooting</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Common Errors &amp; Solutions</h3>
        <div class="space-y-3">
          ${data.commonProblems.map(p => {
            const steps = Array.isArray(p.troubleshooting) ? p.troubleshooting : Array.isArray(p.troubleshootingSteps) ? p.troubleshootingSteps : [];
            return `
            <div class="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20 text-xs space-y-2">
              <h4 class="font-bold font-mono text-red-600 dark:text-red-400">${escapeHtml(p.error)}</h4>
              <p class="text-slate-600 dark:text-neutral-400"><strong>Root Cause:</strong> ${escapeHtml(p.rootCause)}</p>
              ${steps.length > 0 ? `<ul class="list-disc list-inside space-y-1 text-slate-600 dark:text-neutral-400">${steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>` : ''}
              ${p.codeFix ? `<pre class="p-3 rounded-lg bg-[#161616] text-[#81FF89] font-mono text-[11px] overflow-x-auto"><code>${escapeHtml(p.codeFix)}</code></pre>` : ''}
            </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 6. Best Practices
  if (Array.isArray(data.bestPractices) && data.bestPractices.length > 0) {
    html += `
      <div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-emerald-500">Section 10 · Best Practices</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Enterprise Recommendations</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          ${data.bestPractices.map(bp => `
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
              <div class="flex justify-between items-center mb-1">
                <strong class="text-slate-900 dark:text-white">${escapeHtml(bp.title)}</strong>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">${escapeHtml(bp.category)}</span>
              </div>
              <p class="text-slate-600 dark:text-neutral-300">${escapeHtml(bp.recommendation)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 7. Interview Questions
  if (Array.isArray(data.interviewQuestions) && data.interviewQuestions.length > 0) {
    html += `
      <div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-rose-500">Section 12 · Interview Questions</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Technical Interview Q&amp;A</h3>
        <div class="space-y-3">
          ${data.interviewQuestions.map(q => `
            <div class="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/50 text-xs space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-500">${escapeHtml(q.level)}</span>
                <strong class="text-slate-900 dark:text-white">${escapeHtml(q.question)}</strong>
              </div>
              <p class="text-slate-600 dark:text-neutral-400 leading-relaxed">${escapeHtml(q.answer)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 8. Summary
  if (data.summary) {
    html += `
      <div class="rounded-2xl border border-emerald-200 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/20 p-6 space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-emerald-500">Section 13 · Summary</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Key Takeaways</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          ${Array.isArray(data.summary.takeaways) ? data.summary.takeaways.map(t => `<div class="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-100 dark:border-emerald-900/50 text-slate-700 dark:text-neutral-300">✓ ${escapeHtml(t)}</div>`).join('') : ''}
        </div>
      </div>
    `;
  }

  html += `</div>`;
  return html;
}
