import { StandardLessonTemplateData } from '@/types/standard-lesson';

/**
 * Utility: Compiles StandardLessonTemplateData into rich semantic HTML
 * in a clean, uniform technical article format identical to AI Academy.
 */
export function generateStandardLessonHtml(data: StandardLessonTemplateData): string {
  const escapeHtml = (str: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  let html = '';

  // 1. Overview Prose (No boxed cards, clean lead paragraphs matching AI Academy)
  if (data.overview) {
    if (data.overview.whatIsIt) {
      html += `<p class="my-3 leading-relaxed text-slate-900 dark:text-slate-100">${escapeHtml(data.overview.whatIsIt)}</p>\n`;
    }
    if (data.overview.whyImportant) {
      html += `<p class="my-3 leading-relaxed text-slate-900 dark:text-slate-100">${escapeHtml(data.overview.whyImportant)}</p>\n`;
    }
    if (data.overview.whereUsed) {
      html += `<p class="my-3 leading-relaxed text-slate-900 dark:text-slate-100"><span style="color: #047857;"><strong>Testing Application: </strong></span>${escapeHtml(data.overview.whereUsed)}</p>\n`;
    }
  }

  // 2. Learning Objectives
  if (Array.isArray(data.learningObjectives) && data.learningObjectives.length > 0) {
    html += `
<h2 id="1-learning-objectives" class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">1. Learning Objectives</h2>
<ul class="list-disc pl-6 space-y-1.5 my-3 text-slate-900 dark:text-slate-100">
  ${data.learningObjectives.map((o) => `<li class="leading-relaxed">${escapeHtml(o)}</li>`).join('\n  ')}
</ul>
`;
  }

  // 2b. Visual Architecture Diagram / Infographic (Embedded within curriculum)
  if (data.architectureDiagram && data.architectureDiagram.imageUrl) {
    const title = data.architectureDiagram.title || 'Technical Architecture Diagram';
    const caption = data.architectureDiagram.caption || title;
    html += `
<figure data-curriculum-diagram="true" class="curriculum-diagram-card group my-8 p-4 sm:p-6 bg-slate-50 dark:bg-neutral-900/70 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-sm text-center">
  <div class="diagram-toolbar flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-neutral-800 text-left">
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        📐 Architectural Blueprint
      </span>
      <span class="text-[11px] text-slate-500 dark:text-neutral-400 hidden sm:inline font-medium">Click to enlarge crystal clear</span>
    </div>
    <button type="button" class="expand-diagram-btn inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all hover:scale-105 cursor-pointer" title="Expand to crystal clear high-resolution view">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
      <span>Expand View</span>
    </button>
  </div>
  <div class="diagram-img-wrapper group relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-neutral-700/80 bg-white dark:bg-neutral-950 flex items-center justify-center p-2 sm:p-4 cursor-zoom-in">
    <img src="${escapeHtml(data.architectureDiagram.imageUrl)}" alt="${escapeHtml(title)}" class="w-full max-h-[680px] object-contain mx-auto transition-transform duration-200 group-hover:scale-[1.01]" loading="lazy" decoding="async" title="Click to enlarge in crystal clear high-resolution" />
    <div class="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-xl z-10">
      <span class="px-3 py-1.5 rounded-full bg-neutral-900/90 text-white text-xs font-semibold shadow-lg backdrop-blur-xs flex items-center gap-1.5 border border-neutral-700">
        <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        Click to enlarge full-screen
      </span>
    </div>
  </div>
  <figcaption class="mt-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-neutral-300">
    📐 ${escapeHtml(caption)}
  </figcaption>
</figure>
`;
  }

  // 3. Concept Explanation
  if (data.conceptExplanation) {
    html += `
<h2 id="2-detailed-concept-explanation" class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">2. Detailed Concept Explanation</h2>
`;
    if (Array.isArray(data.conceptExplanation.theory)) {
      data.conceptExplanation.theory.forEach((t) => {
        html += `<p class="my-3 leading-relaxed text-slate-900 dark:text-slate-100">${escapeHtml(t)}</p>\n`;
      });
    }
    if (data.conceptExplanation.practicalUnderstanding) {
      html += `<p class="my-3 leading-relaxed text-slate-900 dark:text-slate-100"><span style="color: #047857;"><strong>Core Principle: </strong></span>${escapeHtml(data.conceptExplanation.practicalUnderstanding)}</p>\n`;
    }
    if (
      Array.isArray(data.conceptExplanation.terminology) &&
      data.conceptExplanation.terminology.length > 0
    ) {
      html += `
<div class="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-neutral-800">
  <table class="w-full text-left border-collapse text-xs bg-slate-50/50 dark:bg-neutral-950/60">
    <thead>
      <tr class="border-b border-slate-200 dark:border-neutral-800 bg-slate-100 dark:bg-neutral-900">
        <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">Terminology</th>
        <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">Definition</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-200 dark:divide-neutral-800">
      ${data.conceptExplanation.terminology.map((t) => `<tr><td class="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">${escapeHtml(t.term)}</td><td class="px-4 py-3 text-slate-800 dark:text-slate-200 leading-relaxed">${escapeHtml(t.definition)}</td></tr>`).join('\n      ')}
    </tbody>
  </table>
</div>
`;
    }
  }

  // 4. Execution Mechanics & Architecture
  if (data.howItWorks && Array.isArray(data.howItWorks.steps) && data.howItWorks.steps.length > 0) {
    html += `
<h2 id="3-architecture-and-execution-mechanics" class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">3. Architecture &amp; Execution Mechanics</h2>
`;
    if (data.howItWorks.internalMechanism) {
      html += `<p class="my-3 leading-relaxed text-slate-900 dark:text-slate-100">${escapeHtml(data.howItWorks.internalMechanism)}</p>\n`;
    }
    html += `
<ol class="list-decimal pl-6 space-y-2 my-3 text-slate-900 dark:text-slate-100">
  ${data.howItWorks.steps.map((s) => `<li class="leading-relaxed"><strong>${escapeHtml(s.title)}:</strong> ${escapeHtml(s.description)}</li>`).join('\n  ')}
</ol>
`;
  }

  // 5. Step-by-Step Implementation Guide
  if (
    data.practicalImplementation &&
    Array.isArray(data.practicalImplementation.steps) &&
    data.practicalImplementation.steps.length > 0
  ) {
    html += `
<h2 id="4-step-by-step-implementation-guide" class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">4. Step-by-Step Implementation Guide</h2>
`;
    if (data.practicalImplementation.overview) {
      html += `<p class="my-3 leading-relaxed text-slate-900 dark:text-slate-100">${escapeHtml(data.practicalImplementation.overview)}</p>\n`;
    }
    html += `
<ol class="list-decimal pl-6 space-y-2 my-3 text-slate-900 dark:text-slate-100">
  ${data.practicalImplementation.steps
    .map((st: any) => {
      if (typeof st === 'string') {
        return `<li class="leading-relaxed">${escapeHtml(st)}</li>`;
      }
      const label = st.title || st.action || '';
      const details = st.details || '';
      return `<li class="leading-relaxed">${label ? `<strong>${escapeHtml(label)}:</strong> ` : ''}${escapeHtml(details)}</li>`;
    })
    .join('\n  ')}
</ol>
`;
  }

  // 6. Production Implementation Code
  if (Array.isArray(data.codeExamples) && data.codeExamples.length > 0) {
    html += `
<h2 id="5-production-implementation-code" class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">5. Production Implementation Code</h2>
`;
    data.codeExamples.forEach((codeItem) => {
      const headerTitle = codeItem.filename || codeItem.title || 'Code Example';
      const lang = codeItem.language || 'text';
      html += `
<p class="text-xs font-mono font-bold text-slate-500 dark:text-neutral-400 mt-4 mb-2">${escapeHtml(headerTitle)} (${escapeHtml(lang)})</p>
<div class="my-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-[#0d1117] overflow-hidden text-xs font-mono">
  <pre class="p-4 text-[#81FF89] overflow-x-auto leading-relaxed"><code class="language-${escapeHtml(lang)}">${escapeHtml(codeItem.code)}</code></pre>
</div>
`;
      if (codeItem.explanation) {
        html += `<p class="text-xs text-slate-600 dark:text-neutral-400 my-2 leading-relaxed">${escapeHtml(codeItem.explanation)}</p>\n`;
      }
    });
  }

  // 7. Real-World QA Use Cases
  if (Array.isArray(data.qaUseCases) && data.qaUseCases.length > 0) {
    html += `
<h2 id="6-real-world-qa-use-cases" class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">6. Real-World QA Use Cases</h2>
<ul class="list-disc pl-6 space-y-2 my-3 text-slate-900 dark:text-slate-100">
  ${data.qaUseCases.map((u) => `<li class="leading-relaxed"><strong>${escapeHtml(u.title)}:</strong> ${escapeHtml(u.scenario)} — <em>${escapeHtml(u.enterpriseApplication)}</em></li>`).join('\n  ')}
</ul>
`;
  }

  // 8. Common Pitfalls and Mitigation Strategies
  if (Array.isArray(data.commonProblems) && data.commonProblems.length > 0) {
    html += `
<h2 id="7-common-pitfalls-and-mitigation-strategies" class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">7. Common Pitfalls and Mitigation Strategies</h2>
<div class="space-y-4 my-4">
  ${data.commonProblems
    .map((p) => {
      const steps = Array.isArray(p.troubleshooting)
        ? p.troubleshooting
        : Array.isArray(p.troubleshootingSteps)
          ? p.troubleshootingSteps
          : [];
      return `
    <div class="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/20 text-xs space-y-2">
      <p class="font-bold font-mono text-red-600 dark:text-red-400">⚠️ Error: ${escapeHtml(p.error)}</p>
      <p class="text-slate-900 dark:text-slate-100"><strong>Root Cause:</strong> ${escapeHtml(p.rootCause)}</p>
      ${steps.length > 0 ? `<ul class="list-disc pl-5 space-y-1 text-slate-800 dark:text-slate-200">${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>` : ''}
      ${p.codeFix ? `<pre class="p-3 rounded-lg bg-neutral-900 text-[#81FF89] font-mono text-[11px] overflow-x-auto my-2"><code>${escapeHtml(p.codeFix)}</code></pre>` : ''}
    </div>
    `;
    })
    .join('\n  ')}
</div>
`;
  }

  // 9. Enterprise Best Practices
  if (Array.isArray(data.bestPractices) && data.bestPractices.length > 0) {
    html += `
<h2 id="8-enterprise-best-practices" class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">8. Enterprise Best Practices</h2>
<ul class="list-disc pl-6 space-y-2 my-3 text-slate-900 dark:text-slate-100">
  ${data.bestPractices.map((bp) => `<li class="leading-relaxed"><strong>${escapeHtml(bp.title)} (${escapeHtml(bp.category)}):</strong> ${escapeHtml(bp.recommendation)}</li>`).join('\n  ')}
</ul>
`;
  }

  // 10. Key Takeaways & Summary
  if (data.summary) {
    html += `
<h2 id="9-key-takeaways-summary" class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">9. Key Takeaways &amp; Summary</h2>
`;
    if (Array.isArray(data.summary.takeaways) && data.summary.takeaways.length > 0) {
      html += `
<ul class="list-disc pl-6 space-y-1.5 my-3 text-slate-900 dark:text-slate-100">
  ${data.summary.takeaways.map((t) => `<li class="leading-relaxed">${escapeHtml(t)}</li>`).join('\n  ')}
</ul>
`;
    }
    if (data.summary.nextSteps) {
      html += `<p class="my-3 leading-relaxed text-slate-900 dark:text-slate-100"><strong>Next Steps:</strong> ${escapeHtml(data.summary.nextSteps)}</p>\n`;
    }
  }

  // 11. Top Interview Questions & Answers
  if (Array.isArray(data.interviewQuestions) && data.interviewQuestions.length > 0) {
    html += `
<h2 id="10-top-interview-questions-answers" class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">10. Top Interview Questions &amp; Answers</h2>
`;
    data.interviewQuestions.forEach((q, idx) => {
      html += `
<p class="my-3 leading-relaxed text-slate-900 dark:text-white"><strong>Q${idx + 1} (${escapeHtml(q.level)}): ${escapeHtml(q.question)}</strong></p>
<p class="my-3 leading-relaxed text-slate-900 dark:text-slate-100 pl-4 border-l-2 border-emerald-500/40">${escapeHtml(q.answer)}</p>
`;
    });
  }

  return `<div class="standard-lesson-container">\n${html}\n</div>`;
}
