/**
 * Phase 8 Complete 9-Course Catalogue & Standardized Content Generator
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../src/lib/curriculum-data-store.json');
const store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function makeStandardHtml(data) {
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

  // 2. Learning Objectives
  if (data.learningObjectives && data.learningObjectives.length > 0) {
    html += `
      <div class="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 p-6 space-y-3">
        <span class="text-xs font-mono font-bold uppercase text-indigo-500">Section 2 · Objectives</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Learning Objectives</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
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
          ${(data.conceptExplanation.theory || []).map(t => `<p>${t}</p>`).join('')}
        </div>
        ${data.conceptExplanation.terminology && data.conceptExplanation.terminology.length > 0 ? `
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

  // 4. Diagram
  if (data.architectureDiagram && data.architectureDiagram.nodes) {
    html += `
      <div class="my-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 pb-3">
          <div>
            <span class="text-xs font-mono font-bold uppercase text-emerald-500">Section 4 · Architecture</span>
            <h4 class="text-lg font-bold text-slate-900 dark:text-white">${escapeHtml(data.architectureDiagram.title)}</h4>
            ${data.architectureDiagram.caption ? `<p class="text-xs text-slate-500 dark:text-neutral-400">${escapeHtml(data.architectureDiagram.caption)}</p>` : ''}
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase">
            ${escapeHtml(data.architectureDiagram.type || 'Pipeline')}
          </span>
        </div>
        <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3 overflow-x-auto py-2">
          ${data.architectureDiagram.nodes.map((node, i) => `
            <div class="flex-1 min-w-[160px] p-4 rounded-xl border ${node.highlight ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 ring-1 ring-emerald-400/30' : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700'} text-center space-y-1">
              ${node.badge ? `<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400">${escapeHtml(node.badge)}</span>` : ''}
              <h5 class="text-xs font-bold text-slate-900 dark:text-white">${escapeHtml(node.label)}</h5>
              ${node.subtitle ? `<p class="text-[11px] text-slate-500 dark:text-neutral-400">${escapeHtml(node.subtitle)}</p>` : ''}
            </div>
            ${i < data.architectureDiagram.nodes.length - 1 ? `<div class="hidden md:block text-slate-400 font-bold text-base">→</div>` : ''}
          `).join('')}
        </div>
        ${data.architectureDiagram.componentsExplanation && data.architectureDiagram.componentsExplanation.length > 0 ? `
          <div class="pt-3 border-t border-slate-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            ${data.architectureDiagram.componentsExplanation.map(comp => `
              <div class="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                <strong class="text-slate-900 dark:text-white">${escapeHtml(comp.name)}:</strong> <span class="text-slate-600 dark:text-neutral-400">${escapeHtml(comp.details)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // 5. How It Works
  if (data.howItWorks && data.howItWorks.steps) {
    html += `
      <div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-amber-500">Section 5 · Execution Flow</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">How It Works</h3>
        ${data.howItWorks.internalMechanism ? `<p class="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">${escapeHtml(data.howItWorks.internalMechanism)}</p>` : ''}
        <div class="space-y-2.5 pt-1">
          ${data.howItWorks.steps.map(st => `
            <div class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs">
              <span class="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-bold font-mono flex items-center justify-center shrink-0">${st.stepNumber}</span>
              <div>
                <strong class="text-slate-900 dark:text-white block mb-0.5">${escapeHtml(st.title)}</strong>
                <span class="text-slate-600 dark:text-neutral-400 leading-relaxed">${escapeHtml(st.description)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 6. Code Examples
  if (data.codeExamples && data.codeExamples.length > 0) {
    html += `
      <div class="space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-emerald-500">Section 7 · Implementation Code</span>
        ${data.codeExamples.map(codeItem => `
          <div class="rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-900 overflow-hidden font-mono text-xs shadow-sm">
            <div class="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-slate-300">
              <span class="font-bold text-slate-200">${escapeHtml(codeItem.filename || codeItem.title)}</span>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-[10px] font-bold uppercase">${escapeHtml(codeItem.language)}</span>
            </div>
            <pre class="p-4 text-[#81FF89] overflow-x-auto leading-relaxed"><code>${escapeHtml(codeItem.code)}</code></pre>
            ${codeItem.explanation ? `<div class="px-4 py-2 bg-slate-950 text-[11px] text-slate-400 border-t border-slate-800">${escapeHtml(codeItem.explanation)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  // 7. QA Use Cases
  if (data.qaUseCases && data.qaUseCases.length > 0) {
    html += `
      <div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-cyan-500">Section 8 · Production Use Cases</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Real-World QA Applications</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          ${data.qaUseCases.map(uc => `
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 space-y-1.5">
              <h4 class="font-bold text-slate-900 dark:text-white">${escapeHtml(uc.title)}</h4>
              <p class="text-slate-600 dark:text-neutral-400"><strong>Scenario:</strong> ${escapeHtml(uc.scenario)}</p>
              <p class="text-emerald-600 dark:text-emerald-400"><strong>Enterprise Scale:</strong> ${escapeHtml(uc.enterpriseApplication)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 8. Troubleshooting
  if (data.commonProblems && data.commonProblems.length > 0) {
    html += `
      <div class="rounded-2xl border border-red-200 dark:border-red-950 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-red-500">Section 9 · Debugging &amp; Troubleshooting</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Common Errors &amp; Fixes</h3>
        <div class="space-y-3">
          ${data.commonProblems.map(p => `
            <div class="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20 text-xs space-y-2">
              <h4 class="font-bold font-mono text-red-600 dark:text-red-400">${escapeHtml(p.error)}</h4>
              <p class="text-slate-600 dark:text-neutral-400"><strong>Root Cause:</strong> ${escapeHtml(p.rootCause)}</p>
              ${p.codeFix ? `<pre class="p-3 rounded-lg bg-[#161616] text-[#81FF89] font-mono text-[11px] overflow-x-auto border border-[#2D2D2D]"><code>${escapeHtml(p.codeFix)}</code></pre>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 9. Best Practices
  if (data.bestPractices && data.bestPractices.length > 0) {
    html += `
      <div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-emerald-500">Section 10 · Best Practices</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Enterprise Standards</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          ${data.bestPractices.map(bp => `
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
              <div class="flex justify-between items-center mb-1">
                <strong class="text-slate-900 dark:text-white">${escapeHtml(bp.title)}</strong>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">${escapeHtml(bp.category)}</span>
              </div>
              <p class="text-slate-600 dark:text-neutral-300 leading-relaxed">${escapeHtml(bp.recommendation)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 10. Comparison
  if (data.comparison) {
    html += `
      <div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-purple-500">Section 11 · Comparison</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">${escapeHtml(data.comparison.title || 'Tool & Approach Comparison')}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
            <h4 class="font-bold text-emerald-700 dark:text-emerald-400 uppercase">Advantages</h4>
            <ul class="list-disc list-inside space-y-1 text-slate-700 dark:text-neutral-300">
              ${(data.comparison.advantages || []).map(a => `<li>${escapeHtml(a)}</li>`).join('')}
            </ul>
          </div>
          <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
            <h4 class="font-bold text-amber-700 dark:text-amber-400 uppercase">Limitations</h4>
            <ul class="list-disc list-inside space-y-1 text-slate-700 dark:text-neutral-300">
              ${(data.comparison.limitations || []).map(l => `<li>${escapeHtml(l)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // 11. Interview Questions
  if (data.interviewQuestions && data.interviewQuestions.length > 0) {
    html += `
      <div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-rose-500">Section 12 · Technical Interview Prep</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Interview Questions</h3>
        <div class="space-y-3">
          ${data.interviewQuestions.map(q => `
            <div class="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/50 text-xs space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">${escapeHtml(q.level)}</span>
                <strong class="text-slate-900 dark:text-white">${escapeHtml(q.question)}</strong>
              </div>
              <p class="text-slate-600 dark:text-neutral-400 leading-relaxed font-sans">${escapeHtml(q.answer)}</p>
              ${q.sampleCodeOrScenario ? `<pre class="p-3 rounded-lg bg-[#161616] text-[#81FF89] font-mono text-[11px] overflow-x-auto border border-[#2D2D2D]"><code>${escapeHtml(q.sampleCodeOrScenario)}</code></pre>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 12. Summary
  if (data.summary) {
    html += `
      <div class="rounded-2xl border border-emerald-200 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/20 p-6 space-y-4">
        <span class="text-xs font-mono font-bold uppercase text-emerald-500">Section 13 · Review &amp; Summary</span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Key Takeaways</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          ${(data.summary.takeaways || []).map(t => `<div class="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-100 dark:border-emerald-900/50 text-slate-700 dark:text-neutral-300">✓ ${escapeHtml(t)}</div>`).join('')}
        </div>
      </div>
    `;
  }

  html += `</div>`;
  return html;
}

module.exports = {
  makeStandardHtml,
};
