const fs = require('fs');
const path = require('path');

const storePath = path.resolve(__dirname, '../src/lib/curriculum-data-store.json');
console.log('Loading store from:', storePath);
const raw = fs.readFileSync(storePath, 'utf-8');
const data = JSON.parse(raw);

const diagramMappings = [
  {
    slugs: [
      'selenium-architecture',
      'webdriver-architecture',
      'what-is-selenium',
      'selenium-components',
    ],
    src: '/uploads/curriculum-diagrams/selenium-architecture.svg',
    title: 'Selenium WebDriver Architecture & W3C Protocol',
    alt: 'Selenium WebDriver Architecture Diagram',
  },
  {
    slugs: ['playwright-architecture-browser-contexts', 'what-is-playwright', 'why-playwright'],
    src: '/uploads/curriculum-diagrams/playwright-architecture.svg',
    title: 'Playwright Architecture & Browser Context Isolation',
    alt: 'Playwright Architecture Diagram',
  },
  {
    slugs: ['appium-architecture', 'what-is-appium', 'appium-20-and-plugins'],
    src: '/uploads/curriculum-diagrams/appium-architecture.svg',
    title: 'Appium 2.0 Client-Server Driver Architecture',
    alt: 'Appium Architecture Diagram',
  },
  {
    slugs: [
      'basic-auth',
      'bearer-token',
      'jwt-tokens',
      'oauth-10-vs-oauth-20',
      'basic-authentication',
      'oauth-20',
    ],
    src: '/uploads/curriculum-diagrams/api-auth-infographic.png',
    title: 'API Authentication Flows: Basic, Bearer, JWT & OAuth 2.0',
    alt: 'API Authentication Infographic',
  },
  {
    slugs: [
      'mcp-architecture',
      'mcp-communication-flow',
      'mcp-host-client-and-server',
      'what-is-mcp',
    ],
    src: '/uploads/curriculum-diagrams/mcp-architecture.svg',
    title: 'Model Context Protocol (MCP) Host-Client-Server Architecture',
    alt: 'MCP Architecture Diagram',
  },
  {
    slugs: ['rag-architecture'],
    src: '/uploads/curriculum-diagrams/rag-architecture.png',
    title: 'Retrieval-Augmented Generation (RAG) Architecture for QA',
    alt: 'RAG Architecture Diagram',
  },
  {
    slugs: ['what-is-an-llm', 'how-llms-work'],
    src: '/uploads/curriculum-diagrams/llm-architecture.png',
    title: 'Large Language Model (LLM) Inference & Attention Architecture',
    alt: 'LLM Architecture Infographic',
  },
  {
    slugs: ['tokens-embeddings-and-attention', 'context-window'],
    src: '/uploads/curriculum-diagrams/tokenization-infographic.png',
    title: 'Tokenization, Subword Encoding & Embedding Space',
    alt: 'Tokenization Infographic',
  },
  {
    slugs: ['transformer-architecture'],
    src: '/uploads/curriculum-diagrams/self-attention-infographic.png',
    title: 'Self-Attention Mechanism & Transformer Encoder-Decoder',
    alt: 'Self-Attention Infographic',
  },
  {
    slugs: ['what-is-context-engineering', 'anatomy-of-a-good-prompt', 'context-management'],
    src: '/uploads/curriculum-diagrams/context-engineering-infographic.png',
    title: 'Context Engineering & Prompt Anatomy Architecture',
    alt: 'Context Engineering Infographic',
  },
  {
    slugs: ['test-pyramid', 'enterprise-test-architecture'],
    src: '/uploads/curriculum-diagrams/test-pyramid-infographic.png',
    title: 'Modern Test Automation Pyramid & Feedback Speed',
    alt: 'Test Pyramid Infographic',
  },
  {
    slugs: [
      'what-is-github-actions',
      'running-playwright-in-github-actions',
      'running-selenium-in-github-actions',
      'cicd-integration',
      'smoke-tests-in-cicd',
      'pipeline-architecture',
    ],
    src: '/uploads/curriculum-diagrams/github-actions-cicd.png',
    title: 'Enterprise CI/CD Automation Pipeline with GitHub Actions',
    alt: 'CI/CD Pipeline Diagram',
  },
  {
    slugs: ['what-is-git', 'git-architecture', 'version-control-concepts', 'core-git-commands'],
    src: '/uploads/curriculum-diagrams/git-workflow-architecture.svg',
    title: 'Git 4-Stage Lifecycle & Collaboration Architecture',
    alt: 'Git Workflow Architecture Diagram',
  },
  {
    slugs: [
      'branching-strategies-gitflow-trunk-based',
      'creating-and-switching-branches',
      'merging-and-merge-conflicts',
    ],
    src: '/uploads/curriculum-diagrams/git-branching-architecture.svg',
    title: 'Git Branching Models for Test Automation: Trunk-Based vs GitFlow',
    alt: 'Git Branching Models Diagram',
  },
  {
    slugs: [
      'publishing-test-results-in-ado',
      'azure-pipelines-agent-pools',
      'azure-test-plans-automation-link',
      'ado-release-pipeline-gates',
    ],
    src: '/uploads/curriculum-diagrams/azure-devops-pipeline-architecture.svg',
    title: 'Azure DevOps Multi-Stage YAML Pipeline & Quality Gates',
    alt: 'Azure DevOps Pipeline Architecture Diagram',
  },
  {
    slugs: [
      'declarative-syntax-essentials',
      'multibranch-webhook-triggers',
      'parallel-stages-docker-agents',
      'jenkins-html-reporting-slack',
    ],
    src: '/uploads/curriculum-diagrams/jenkins-pipeline-architecture.svg',
    title: 'Declarative Jenkins Distributed Test Architecture & Notifications',
    alt: 'Jenkins Pipeline Architecture Diagram',
  },
];

let embeddedCount = 0;
data.academyCourses.forEach((course) => {
  (course.modules || []).forEach((module) => {
    (module.lessons || []).forEach((lesson) => {
      const match = diagramMappings.find((m) => m.slugs.includes(lesson.slug));
      if (match) {
        let html = lesson.contentHtml || '';
        // Remove prior duplicate figure
        const figRegex = new RegExp(
          '<figure[^>]*data-curriculum-diagram[\\s\\S]*?<\\/figure>',
          'gi'
        );
        html = html.replace(figRegex, '').trim();

        const figureHtml = `\n<figure data-curriculum-diagram="true" class="my-8 p-4 sm:p-6 bg-slate-50 dark:bg-neutral-900/70 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-sm text-center">\n  <div class="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-neutral-700/80 bg-white dark:bg-neutral-950 flex items-center justify-center p-2 sm:p-4">\n    <img src="${match.src}" alt="${match.alt}" class="w-full max-h-[520px] object-contain mx-auto" loading="lazy" decoding="async" />\n  </div>\n  <figcaption class="mt-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-neutral-300">\n    📐 ${match.title}\n  </figcaption>\n</figure>\n`;

        if (html.includes('</h2>')) {
          const idx = html.indexOf('</h2>') + 5;
          html = html.slice(0, idx) + figureHtml + html.slice(idx);
        } else {
          html = figureHtml + html;
        }

        lesson.contentHtml = html;
        embeddedCount++;
      }
    });
  });
});

console.log(`Total diagrams embedded: ${embeddedCount}`);
fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Saved. Verify:');
const check = fs.readFileSync(storePath, 'utf-8');
console.log('Verify includes curriculum-diagrams:', check.includes('curriculum-diagrams'));
