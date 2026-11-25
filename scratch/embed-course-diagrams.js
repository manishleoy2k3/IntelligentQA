process.env.NODE_ENV = 'test';

const path = require('path');
const fs = require('fs');

const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

const { generateEducationalInfographic, resetImageRateLimit } = jiti(
  '../src/lib/diagram/image-generation.ts'
);
const { generateArchitectureSvg } = jiti('../src/lib/diagram/svg-generator.ts');
const { generateSdetArchitectureTemplate } = jiti('../src/lib/diagram/ai-diagram-service.ts');
const { calculateElkLayout } = jiti('../src/lib/diagram/elk-layout.ts');
const sharp = require('sharp');

async function run() {
  resetImageRateLimit();
  console.log('🚀 Starting Full Curriculum Visual Diagram & Infographic Generation...');

  const outputDir = path.join(process.cwd(), 'public/uploads/curriculum-diagrams');
  fs.mkdirSync(outputDir, { recursive: true });

  const diagramCatalog = [
    {
      key: 'selenium-architecture',
      title: 'Selenium WebDriver 4 Enterprise Architecture',
      type: 'architecture',
      prompt: 'Selenium Architecture',
      theme: 'automation-framework',
      topics: [
        'selenium',
        'webdriver',
        'browser setup',
        'locators',
        'w3c protocol',
        'remote webdriver',
        'cross browser',
      ],
      caption:
        'Figure: Selenium WebDriver 4 Enterprise Architecture — Language Bindings, W3C WebDriver Protocol, Browser Driver Binaries & Browser Engines',
    },
    {
      key: 'playwright-architecture',
      title: 'Playwright Multi-Process Architecture',
      type: 'architecture',
      prompt: 'Playwright Architecture',
      theme: 'modern',
      topics: [
        'playwright',
        'browsercontext',
        'page',
        'fixtures',
        'trace viewer',
        'auto-waiting',
        'network interception',
      ],
      caption:
        'Figure: Playwright Unified Multi-Process Architecture — Single WebSocket Connection, Fast In-Memory BrowserContexts & Multi-Tab Isolation',
    },
    {
      key: 'appium-architecture',
      title: 'Appium 2.0 Mobile Automation Architecture',
      type: 'architecture',
      prompt: 'Appium Architecture',
      theme: 'cloud',
      topics: [
        'appium',
        'mobile',
        'ios',
        'android',
        'xcuitest',
        'uiautomator2',
        'emulator',
        'mobile automation',
      ],
      caption:
        'Figure: Appium 2.0 Decoupled Driver Architecture — Independent Platform Drivers (XCUITest, UiAutomator2), JSONWP/W3C Bridge & Native Devices',
    },
    {
      key: 'mcp-architecture',
      title: 'Model Context Protocol (MCP) Architecture',
      type: 'architecture',
      prompt: 'MCP Architecture',
      theme: 'ai',
      topics: ['mcp', 'model context protocol', 'tools', 'prompts', 'resources', 'agent protocol'],
      caption:
        'Figure: Model Context Protocol (MCP) Standard Architecture — MCP Hosts, Client Standard Transports, and Decoupled MCP Tool Servers',
    },
    {
      key: 'rag-architecture',
      title: 'Enterprise RAG Architecture for QA',
      type: 'infographic',
      prompt: 'How does RAG work?',
      topics: [
        'rag',
        'retrieval',
        'vector database',
        'embeddings',
        'chunking',
        'hybrid search',
        'knowledge base',
      ],
      caption:
        'Figure: Retrieval-Augmented Generation (RAG) Architecture — Document Chunking, Vector Embeddings, Semantic Search & Context Augmentation',
    },
    {
      key: 'llm-architecture',
      title: 'Large Language Models (LLM) Architecture',
      type: 'infographic',
      prompt: 'What is an LLM?',
      topics: [
        'what is an llm',
        'artificial intelligence',
        'foundation models',
        'transformer neural network',
        'generative ai',
      ],
      caption:
        'Figure: Large Language Model (LLM) Generative Architecture — Token Embeddings, Multi-Head Attention, Feedforward & Softmax Sampling',
    },
    {
      key: 'tokenization-infographic',
      title: 'Tokenization & Byte-Pair Encoding',
      type: 'infographic',
      prompt: 'What is Tokenization?',
      topics: [
        'tokenization',
        'tokens',
        'byte-pair',
        'bpe',
        'subword',
        'vocabulary',
        'numerical representation',
      ],
      caption:
        'Figure: Tokenization & Subword Representation Pipeline — BPE Merges, Vocab Indexing, and Vector Numerical Encoding',
    },
    {
      key: 'self-attention-infographic',
      title: 'Transformer Multi-Head Self-Attention Mechanism',
      type: 'infographic',
      prompt: 'What is Self-Attention?',
      topics: [
        'self-attention',
        'transformer',
        'query key value',
        'attention weights',
        'q k v',
        'dot product',
      ],
      caption:
        'Figure: Transformer Scaled Dot-Product Self-Attention — Query, Key, Value Projections & Softmax Context Scoring',
    },
    {
      key: 'context-engineering-infographic',
      title: 'Context Engineering for QA Engineers',
      type: 'infographic',
      prompt: 'What is Context Engineering?',
      topics: [
        'context engineering',
        'prompt engineering',
        'system prompt',
        'few-shot',
        'structured output',
        'context window',
      ],
      caption:
        'Figure: Enterprise Context Engineering Framework — System Roles, Few-Shot Demonstrations, Retrieval Anchors & Guardrails',
    },
    {
      key: 'test-pyramid-infographic',
      title: 'Test Automation Pyramid Strategy',
      type: 'infographic',
      prompt: 'What is Test Pyramid?',
      topics: [
        'test pyramid',
        'testing pyramid',
        'automation strategy',
        'unit testing',
        'api testing',
        'ui testing',
        'integration testing',
      ],
      caption:
        'Figure: Modern Test Automation Pyramid — Fast Unit Tests, Resilient API Contracts, Targeted E2E Scenarios & Execution ROI',
    },
    {
      key: 'api-auth-infographic',
      title: 'API Authentication & Token Management (OAuth 2.0 / JWT)',
      type: 'infographic',
      prompt: 'How does API Authentication work?',
      topics: [
        'api authentication',
        'oauth',
        'jwt',
        'bearer token',
        'rest api security',
        'requestspecbuilder',
        'token management',
        'api security',
      ],
      caption:
        'Figure: OAuth 2.0 & JWT API Authentication Flow — Client Credentials, Authorization Server, Access Token & Protected Microservices',
    },
    {
      key: 'github-actions-cicd',
      title: 'GitHub Actions CI/CD Test Pipeline Architecture',
      type: 'infographic',
      prompt: 'GitHub Actions Architecture CI/CD Pipeline',
      topics: [
        'github actions',
        'ci/cd',
        'pipeline',
        'workflow',
        'runner',
        'allure report',
        'automated test run',
        'continuous integration',
      ],
      caption:
        'Figure: Enterprise GitHub Actions CI/CD Quality Pipeline — Matrix Runners, Parallel Test Execution, Artifact Archiving & Slack Alerts',
    },
  ];

  const generatedAssets = {};

  for (const item of diagramCatalog) {
    console.log(`\n🎨 Generating: ${item.title}...`);
    try {
      if (item.type === 'architecture') {
        const templateData = generateSdetArchitectureTemplate(item.prompt);
        const layoutData = await calculateElkLayout(templateData);
        const svgContent = generateArchitectureSvg(templateData, layoutData, item.theme);

        const svgFileName = `${item.key}.svg`;
        const pngFileName = `${item.key}.png`;
        const svgPath = path.join(outputDir, svgFileName);
        const pngPath = path.join(outputDir, pngFileName);

        fs.writeFileSync(svgPath, svgContent, 'utf8');

        // Convert to high-res PNG via sharp
        await sharp(Buffer.from(svgContent)).png({ quality: 95 }).toFile(pngPath);

        generatedAssets[item.key] = {
          ...item,
          imageUrl: `/uploads/curriculum-diagrams/${pngFileName}`,
          svgUrl: `/uploads/curriculum-diagrams/${svgFileName}`,
        };
        console.log(`   ✓ Saved SVG & PNG for ${item.key}`);
      } else {
        const result = await generateEducationalInfographic({
          prompt: item.prompt,
          subject: item.title,
        });

        const targetPngPath = path.join(outputDir, `${item.key}.png`);
        fs.copyFileSync(path.join(process.cwd(), 'public', result.imageUrl), targetPngPath);

        generatedAssets[item.key] = {
          ...item,
          imageUrl: `/uploads/curriculum-diagrams/${item.key}.png`,
          svgUrl: result.svgUrl,
        };
        console.log(`   ✓ Generated educational infographic for ${item.key}`);
      }
    } catch (err) {
      console.error(`   ✗ Error generating ${item.key}:`, err.message);
    }
  }

  // Now link into curriculum-data-store.json
  console.log(
    '\n📚 Linking generated diagrams and infographics into curriculum-data-store.json...'
  );
  const storePath = path.join(process.cwd(), 'src/lib/curriculum-data-store.json');
  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

  let embeddedCount = 0;
  let coursesTouched = new Set();

  for (const course of store.academyCourses) {
    const courseTitleLower = (course.title || '').toLowerCase();
    for (const mod of course.modules || []) {
      const modTitleLower = (mod.title || '').toLowerCase();
      for (const lesson of mod.lessons || []) {
        const titleLower = (lesson.title || '').toLowerCase();
        const slugLower = (lesson.slug || '').toLowerCase();
        const combined = `${courseTitleLower} ${modTitleLower} ${titleLower} ${slugLower}`;

        let bestMatch = null;
        for (const [key, asset] of Object.entries(generatedAssets)) {
          const matchTopic = asset.topics.some((t) => combined.includes(t));
          if (matchTopic) {
            bestMatch = asset;
            break;
          }
        }

        if (bestMatch) {
          let html = lesson.contentHtml || '';
          if (!html.includes('data-curriculum-diagram') && !html.includes(bestMatch.imageUrl)) {
            const figureBlock = `
<figure class="my-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md" data-curriculum-diagram="${bestMatch.key}">
  <div class="p-2 sm:p-4 bg-slate-50 dark:bg-neutral-950 flex justify-center">
    <img src="${bestMatch.imageUrl}" alt="${bestMatch.title}" class="w-full h-auto object-contain max-h-[580px] rounded-xl shadow-xs" loading="lazy" />
  </div>
  <figcaption class="p-3.5 text-center text-xs font-semibold text-slate-600 dark:text-neutral-300 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/70">
    ${bestMatch.caption}
  </figcaption>
</figure>
`;
            const pCloseIdx = html.indexOf('</p>');
            if (pCloseIdx !== -1) {
              html = html.slice(0, pCloseIdx + 4) + figureBlock + html.slice(pCloseIdx + 4);
            } else {
              html = figureBlock + html;
            }

            lesson.contentHtml = html;
            embeddedCount++;
            coursesTouched.add(course.title);
          }
        }
      }
    }
  }

  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
  console.log(
    `\n✅ Embedded diagrams & infographics into ${embeddedCount} lessons across ${coursesTouched.size} courses in curriculum-data-store.json!`
  );
  console.log('Courses enhanced:', Array.from(coursesTouched));
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
