// Auto-generated client-safe catalog of published Learning Academy courses
export interface AcademyClientLesson {
  id: string;
  moduleId: string;
  courseId: string;
  slug: string;
  title: string;
  summary: string;
  estimatedReadingTime: number;
}

export interface AcademyClientModule {
  id: string;
  courseId: string;
  slug: string;
  title: string;
  description: string;
  lessons: AcademyClientLesson[];
}

export interface AcademyClientCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  estimatedHours: number;
  sortOrder?: number;
  status?: string;
  modules: AcademyClientModule[];
}

export const INITIAL_PUBLISHED_COURSES: AcademyClientCourse[] = [
  {
    id: 'course-ai-qa-mastery',
    slug: 'ai-for-qa-mastery',
    title: 'AI Academy',
    subtitle: 'From LLM Prompt Evals to Autonomous Self-Healing Test Agents',
    description:
      'A practical learning path for Software Test Engineers, QA Automation Engineers, SDETs and Test Architects to understand and implement Artificial Intelligence in Software Quality Engineering.',
    level: 'All Levels',
    estimatedHours: 12,
    modules: [
      {
        id: 'mod-intro-ai',
        courseId: 'course-ai-qa-mastery',
        slug: 'introduction-to-ai',
        title: 'Module 1 — Introduction to AI',
        description:
          'Foundations of artificial intelligence, machine learning paradigms, generative models, transformer mechanics, and LLM token processing.',
        lessons: [
          {
            id: 'les-what-is-ai',
            moduleId: 'mod-intro-ai',
            courseId: 'course-ai-qa-mastery',
            slug: 'what-is-artificial-intelligence',
            title: 'What is Artificial Intelligence?',
            summary:
              'Foundational AI paradigms, symbolic reasoning, and deep neural networks in quality engineering.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-what-is-machine-learning',
            moduleId: 'mod-intro-ai',
            courseId: 'course-ai-qa-mastery',
            slug: 'what-is-machine-learning',
            title: 'What is Machine Learning?',
            summary:
              'Supervised, unsupervised, and reinforcement learning applied to automated test classification and defect prediction.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-what-is-genai',
            moduleId: 'mod-intro-ai',
            courseId: 'course-ai-qa-mastery',
            slug: 'what-is-generative-ai',
            title: 'What is Generative AI?',
            summary:
              'Diffusion models, autoregressive decoders, and multimodal generative pipelines for synthetic test asset synthesis.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-what-is-llm',
            moduleId: 'mod-intro-ai',
            courseId: 'course-ai-qa-mastery',
            slug: 'what-is-an-llm',
            title: 'What is an LLM?',
            summary:
              'Large Language Model architectures, token probability distributions, and parameter scale dynamics in SDET workflows.',
            estimatedReadingTime: 3,
          },
          {
            id: 'les-how-llms-work',
            moduleId: 'mod-intro-ai',
            courseId: 'course-ai-qa-mastery',
            slug: 'how-llms-work',
            title: 'How LLMs Work',
            summary:
              'Inference loops, next-token prediction, softmax sampling, top-p, and temperature tuning in test automation.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-transformer-architecture',
            moduleId: 'mod-intro-ai',
            courseId: 'course-ai-qa-mastery',
            slug: 'transformer-architecture',
            title: 'Transformer Architecture',
            summary:
              'Multi-head self-attention, query-key-value vector matrices, feed-forward layers, and positional embeddings.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-tokens-embeddings-and-attention',
            moduleId: 'mod-intro-ai',
            courseId: 'course-ai-qa-mastery',
            slug: 'tokens-embeddings-and-attention',
            title: 'Tokens, Embeddings and Attention',
            summary:
              'Byte-Pair Encoding, high-dimensional vector representations, cosine similarity, and contextual attention matrices.',
            estimatedReadingTime: 5,
          },
        ],
      },
      {
        id: 'mod-prompt-engineering',
        courseId: 'course-ai-qa-mastery',
        slug: 'prompt-engineering',
        title: 'Module 2 — Prompt Engineering',
        description:
          'Systematic prompt design, few-shot patterns, reasoning chains, and deterministic test code synthesis.',
        lessons: [
          {
            id: 'les-what-is-prompt-eng',
            moduleId: 'mod-prompt-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'what-is-prompt-engineering',
            title: 'What is Prompt Engineering?',
            summary:
              'The discipline of structuring inputs to guide generative LLMs toward deterministic, high-accuracy test code output.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-anatomy-of-a-good-prompt',
            moduleId: 'mod-prompt-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'anatomy-of-a-good-prompt',
            title: 'Anatomy of a Good Prompt',
            summary:
              'Role definitions, context framing, explicit constraints, input data boundaries, and output format schemas.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-zero-shot-prompting',
            moduleId: 'mod-prompt-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'zero-shot-prompting',
            title: 'Zero-shot Prompting',
            summary:
              'Direct task instruction without demonstrations: strengths, limitations, and baseline testing prompts.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-few-shot-prompting',
            moduleId: 'mod-prompt-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'few-shot-prompting',
            title: 'Few-shot Prompting',
            summary:
              'In-context exemplar pairs to anchor style, syntax compliance, and locator conventions in test generation.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-chain-of-thought-concepts',
            moduleId: 'mod-prompt-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'chain-of-thought-concepts',
            title: 'Chain-of-Thought Concepts',
            summary:
              'Step-by-step reasoning elicitation for complex test scenario synthesis, edge case discovery, and test data derivation.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-prompt-best-practices',
            moduleId: 'mod-prompt-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'prompting-best-practices',
            title: 'Prompting Best Practices',
            summary:
              'System prompt isolation, negative constraints, defensive escaping, and automated evaluation harnesses.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-common-prompting-mistakes',
            moduleId: 'mod-prompt-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'common-prompting-mistakes',
            title: 'Common Prompting Mistakes',
            summary:
              'Ambiguous scopes, excessive temperature, conflicting instructions, and missing boundary constraints.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-adv-prompt-patterns',
            moduleId: 'mod-prompt-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'advanced-prompt-patterns',
            title: 'Advanced Prompt Patterns',
            summary:
              'Production-grade prompt templates for Playwright POMs, REST Assured specs, Gherkin features, and test matrices.',
            estimatedReadingTime: 5,
          },
        ],
      },
      {
        id: 'mod-context-engineering',
        courseId: 'course-ai-qa-mastery',
        slug: 'context-engineering',
        title: 'Module 3 — Context Engineering',
        description:
          'Context window optimization, system instructions, vector embeddings, and Retrieval-Augmented Generation (RAG).',
        lessons: [
          {
            id: 'les-what-is-context-eng',
            moduleId: 'mod-context-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'what-is-context-engineering',
            title: 'What is Context Engineering?',
            summary:
              'Dynamic information staging, semantic token budget allocation, and context retrieval for quality agents.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-context-window',
            moduleId: 'mod-context-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'context-window',
            title: 'Context Window',
            summary:
              'Input/output token limits, context degradation, needle-in-a-haystack recall, and sliding window chunking.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-system-instructions',
            moduleId: 'mod-context-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'system-instructions',
            title: 'System Instructions',
            summary:
              'Immutable persona guidelines, behavioral guardrails, and deterministic code constraints in SDET copilots.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-rag-architecture',
            moduleId: 'mod-context-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'rag-architecture',
            title: 'RAG Architecture',
            summary:
              'Retrieval-Augmented Generation: Document chunking, vector indexing, dense retrieval, and augmented prompt synthesis.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-vector-databases',
            moduleId: 'mod-context-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'vector-databases',
            title: 'Vector Databases',
            summary:
              'ChromaDB, Pinecone, and pgvector: indexing DOM snapshots, test failure logs, and enterprise API specifications.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-embeddings-and-retrieval',
            moduleId: 'mod-context-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'embeddings-and-retrieval',
            title: 'Embeddings and Retrieval',
            summary:
              'Text embedding models, dense vector search, cosine distance thresholds, and reciprocal rank fusion (RRF).',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-context-management',
            moduleId: 'mod-context-engineering',
            courseId: 'course-ai-qa-mastery',
            slug: 'context-management',
            title: 'Context Management',
            summary:
              'Deduplication, hierarchical context summarization, metadata filtering, and token cache optimization.',
            estimatedReadingTime: 5,
          },
        ],
      },
      {
        id: 'mod-mcp',
        courseId: 'course-ai-qa-mastery',
        slug: 'model-context-protocol',
        title: 'Module 4 — Model Context Protocol (MCP)',
        description:
          'Standardized client-host-server protocol for exposing development tools, databases, and test frameworks to AI models.',
        lessons: [
          {
            id: 'les-what-is-mcp',
            moduleId: 'mod-mcp',
            courseId: 'course-ai-qa-mastery',
            slug: 'what-is-mcp',
            title: 'What is MCP?',
            summary:
              'The open Model Context Protocol standard: eliminating point-to-point tool integrations for autonomous AI agents.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-why-mcp-is-needed',
            moduleId: 'mod-mcp',
            courseId: 'course-ai-qa-mastery',
            slug: 'why-mcp-is-needed',
            title: 'Why MCP is Needed',
            summary:
              'The M×N integration problem between LLM hosts and software development toolchains in automated testing.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-mcp-arch',
            moduleId: 'mod-mcp',
            courseId: 'course-ai-qa-mastery',
            slug: 'mcp-architecture',
            title: 'MCP Architecture',
            summary:
              'Host-Client-Server topology, JSON-RPC 2.0 transport layers (stdio and Server-Sent Events), and protocol lifecycle.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-mcp-host-client-and-server',
            moduleId: 'mod-mcp',
            courseId: 'course-ai-qa-mastery',
            slug: 'mcp-host-client-and-server',
            title: 'MCP Host, Client and Server',
            summary:
              'Responsibilities of hosts (IDEs/Agents), clients (session managers), and servers (tool/resource providers).',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-resources-tools-and-prompts',
            moduleId: 'mod-mcp',
            courseId: 'course-ai-qa-mastery',
            slug: 'resources-tools-and-prompts',
            title: 'Resources, Tools and Prompts',
            summary:
              'The three core primitives of MCP: read-only resources, callable tools, and standardized prompt templates.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-mcp-communication-flow',
            moduleId: 'mod-mcp',
            courseId: 'course-ai-qa-mastery',
            slug: 'mcp-communication-flow',
            title: 'MCP Communication Flow',
            summary:
              'Initialization handshakes, tool listing, sampling requests, progress reporting, and notification streams.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-create-mcp-server',
            moduleId: 'mod-mcp',
            courseId: 'course-ai-qa-mastery',
            slug: 'creating-custom-mcp-servers',
            title: 'Creating Custom MCP Servers',
            summary:
              'Step-by-step TypeScript/Python MCP server authoring exposing Playwright runners, database queries, and log parsers.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-connect-ext-tools',
            moduleId: 'mod-mcp',
            courseId: 'course-ai-qa-mastery',
            slug: 'connecting-external-tools',
            title: 'Connecting External Tools',
            summary:
              'Integrating Jira, GitHub, Postman, Selenium Grid, and CloudWatch into agentic QA workflows via MCP.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-mcp-security-best-practices',
            moduleId: 'mod-mcp',
            courseId: 'course-ai-qa-mastery',
            slug: 'mcp-security-best-practices',
            title: 'MCP Security Best Practices',
            summary:
              'Permission boundaries, tool execution sandboxing, input parameter validation, and rate limiting.',
            estimatedReadingTime: 5,
          },
        ],
      },
      {
        id: 'mod-ai-agents',
        courseId: 'course-ai-qa-mastery',
        slug: 'ai-agents-for-qa',
        title: 'Module 5 — AI Agents for QA',
        description:
          'Autonomous reasoning loops, tool invocation, multi-agent systems, and self-directing quality engineering agents.',
        lessons: [
          {
            id: 'les-what-are-agents',
            moduleId: 'mod-ai-agents',
            courseId: 'course-ai-qa-mastery',
            slug: 'what-are-ai-agents',
            title: 'What are AI Agents?',
            summary:
              'Autonomous software entities pairing LLM reasoning with perception, working memory, and tool actuation capabilities.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-agentic-testing',
            moduleId: 'mod-ai-agents',
            courseId: 'course-ai-qa-mastery',
            slug: 'agentic-testing',
            title: 'Agentic Testing',
            summary:
              'Perceive-Plan-Act-Reflect loops, ReAct patterns, long-term memory, and goal-directed state machines.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-ai-agent-vs-traditional-automation',
            moduleId: 'mod-ai-agents',
            courseId: 'course-ai-qa-mastery',
            slug: 'ai-agent-vs-traditional-automation',
            title: 'AI Agent vs Traditional Automation',
            summary:
              'Static procedural execution scripts versus dynamic adaptive goal resolution in flakiness reduction.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-tool-calling',
            moduleId: 'mod-ai-agents',
            courseId: 'course-ai-qa-mastery',
            slug: 'tool-calling',
            title: 'Tool Calling',
            summary:
              'JSON Schema tool contracts, function argument generation, execution callbacks, and error recovery loops.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-multi-agent-systems',
            moduleId: 'mod-ai-agents',
            courseId: 'course-ai-qa-mastery',
            slug: 'multi-agent-systems',
            title: 'Multi-Agent Systems',
            summary:
              'Specialized agent orchestration: Test Planner, Code Synthesizer, Locator Healer, and RCA Investigator swarms.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-building-qa-agents',
            moduleId: 'mod-ai-agents',
            courseId: 'course-ai-qa-mastery',
            slug: 'building-qa-automation-agents',
            title: 'Building QA Automation Agents',
            summary:
              'End-to-end implementation of an autonomous agent navigating web apps, detecting defects, and reporting issues.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-ai-powered-test-case-generation',
            moduleId: 'mod-ai-agents',
            courseId: 'course-ai-qa-mastery',
            slug: 'ai-powered-test-case-generation',
            title: 'AI-Powered Test Case Generation',
            summary:
              'Autonomous derivation of edge cases, pairwise parameter combinations, and executable test suites from requirements.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-ai-powered-test-failure-analysis',
            moduleId: 'mod-ai-agents',
            courseId: 'course-ai-qa-mastery',
            slug: 'ai-powered-test-failure-analysis',
            title: 'AI-Powered Test Failure Analysis',
            summary:
              'Automated correlation of stack traces, network telemetry, and visual snapshots to diagnose root cause.',
            estimatedReadingTime: 5,
          },
        ],
      },
      {
        id: 'mod-ai-automation',
        courseId: 'course-ai-qa-mastery',
        slug: 'ai-powered-test-automation',
        title: 'Module 6 — AI-Powered Test Automation',
        description:
          'Practical application of AI across Selenium, Playwright, API testing, synthetic data, and self-healing automation.',
        lessons: [
          {
            id: 'les-ai-with-selenium',
            moduleId: 'mod-ai-automation',
            courseId: 'course-ai-qa-mastery',
            slug: 'ai-with-selenium',
            title: 'AI with Selenium',
            summary:
              'Augmenting Selenium WebDriver 4 with LLM-based element discovery, dynamic waits, and automated Page Object synthesis.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-ai-with-playwright',
            moduleId: 'mod-ai-automation',
            courseId: 'course-ai-qa-mastery',
            slug: 'ai-with-playwright',
            title: 'AI with Playwright',
            summary:
              "Leveraging Playwright's auto-waiting and CDP protocol alongside AI agents for resilient web testing.",
            estimatedReadingTime: 5,
          },
          {
            id: 'les-ai-api-testing',
            moduleId: 'mod-ai-automation',
            courseId: 'course-ai-qa-mastery',
            slug: 'ai-api-testing',
            title: 'AI API Testing',
            summary:
              'OpenAPI schema-driven test generation, intelligent payload mutation, and automated contract drift detection.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-ai-test-data-generation',
            moduleId: 'mod-ai-automation',
            courseId: 'course-ai-qa-mastery',
            slug: 'ai-test-data-generation',
            title: 'AI Test Data Generation',
            summary:
              'Synthesizing production-realistic, GDPR-compliant relational test data using generative models.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-ai-test-case-optimization',
            moduleId: 'mod-ai-automation',
            courseId: 'course-ai-qa-mastery',
            slug: 'ai-test-case-optimization',
            title: 'AI Test Case Optimization',
            summary:
              'Test suite reduction, flakiness scoring, risk-based test selection, and regression minimization algorithms.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-self-healing-test-automation',
            moduleId: 'mod-ai-automation',
            courseId: 'course-ai-qa-mastery',
            slug: 'self-healing-test-automation',
            title: 'Self-Healing Test Automation',
            summary:
              'Multi-attribute weighted distance algorithms for locator healing in dynamic DOM environments without test failure.',
            estimatedReadingTime: 5,
          },
          {
            id: 'les-ai-based-root-cause-analysis',
            moduleId: 'mod-ai-automation',
            courseId: 'course-ai-qa-mastery',
            slug: 'ai-based-root-cause-analysis',
            title: 'AI-Based Root Cause Analysis',
            summary:
              'Correlating CI/CD pipeline logs, container metrics, and application traces to isolate defect origins automatically.',
            estimatedReadingTime: 5,
          },
        ],
      },
    ],
    sortOrder: 1,
    status: 'published',
  },
  {
    id: 'course-playwright-mastery',
    slug: 'playwright-ts-mastery',
    title: 'Playwright Automation with TypeScript',
    subtitle: 'Modern End-to-End Testing for Web Applications',
    description:
      'Learn Playwright from scratch: auto-waiting, isolated browser contexts, parallel execution, API mocking, and Trace Viewer debugging.',
    level: 'Beginner',
    estimatedHours: 20,
    modules: [
      {
        id: 'mod-pw-1',
        courseId: 'course-playwright-mastery',
        slug: 'module-1-modern-web-automation-fundamentals',
        title: 'Module 1: Modern Web Automation Fundamentals',
        description: 'Modern end-to-end testing with Module 1: Modern Web Automation Fundamentals.',
        lessons: [
          {
            id: 'les-pw-pw-ts-basics',
            moduleId: 'mod-pw-1',
            courseId: 'course-playwright-mastery',
            slug: 'pw-ts-basics',
            title: '1. Playwright Architecture & Browser Context',
            summary:
              'Understand Browser vs BrowserContext vs Page, why BrowserContext provides 10ms incognito isolation, and why never to open multiple pages in the same context.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-pw-pw-locator-vs-elementhandle',
            moduleId: 'mod-pw-1',
            courseId: 'course-playwright-mastery',
            slug: 'pw-locator-vs-elementhandle',
            title: '2. Modern Locators vs page.$() & ElementHandle',
            summary:
              'Why modern SDETs never use page.$() or ElementHandle: lazy evaluation, auto-waiting, strict mode, and eliminating StaleElementReference errors.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-pw-pw-getbyrole-vs-testid',
            moduleId: 'mod-pw-1',
            courseId: 'course-playwright-mastery',
            slug: 'pw-getbyrole-vs-testid',
            title: '3. Locator Strategy: getByRole() vs data-testid',
            summary:
              'Master user-facing accessible locators via getByRole, understand the Accessibility Tree, and learn when data-testid is strictly necessary.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-pw-pw-auto-waiting',
            moduleId: 'mod-pw-1',
            courseId: 'course-playwright-mastery',
            slug: 'pw-auto-waiting',
            title: '4. Auto-Waiting Mechanics & Web-First Assertions',
            summary:
              'Why Playwright tests never need sleep: 5 actionability checks (visible, stable, enabled, editable, receiving pointer events) and expect() polling.',
            estimatedReadingTime: 8,
          },
        ],
      },
      {
        id: 'mod-pw-2',
        courseId: 'course-playwright-mastery',
        slug: 'module-2-auto-waiting-network-interception-mocking',
        title: 'Module 2: Auto-Waiting, Network Interception & Mocking',
        description:
          'Modern end-to-end testing with Module 2: Auto-Waiting, Network Interception & Mocking.',
        lessons: [
          {
            id: 'les-pw-pw-config-management',
            moduleId: 'mod-pw-2',
            courseId: 'course-playwright-mastery',
            slug: 'pw-config-management',
            title: '5. Enterprise Config Management (playwright.config.ts)',
            summary:
              'Architect enterprise configuration: multi-environment dotenv (.env.staging, .env.prod), timeouts hierarchy, project browser matrices, and reporters.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-pw-pw-fixtures-architecture',
            moduleId: 'mod-pw-2',
            courseId: 'course-playwright-mastery',
            slug: 'pw-fixtures-architecture',
            title: '6. Test Fixtures vs Worker Fixtures vs Custom Fixtures',
            summary:
              'Understand fixture scopes, worker-scoped resource pooling (DB/API connections), test-scoped isolation, and custom fixture extensions with yield.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-pw-pw-storagestate-auth',
            moduleId: 'mod-pw-2',
            courseId: 'course-playwright-mastery',
            slug: 'pw-storagestate-auth',
            title: '7. Authentication & storageState Implementation',
            summary:
              'Capture login cookies and localStorage once into .auth/user.json, bypassing login UI across hundreds of regression tests for 10x execution speed.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-pw-pw-framework-from-scratch',
            moduleId: 'mod-pw-2',
            courseId: 'course-playwright-mastery',
            slug: 'pw-framework-from-scratch',
            title: '8. Designing an Enterprise Playwright Framework from Scratch',
            summary:
              'Full architectural blueprint: directory structure, Page Object Model + Fixtures Dependency Injection, BasePage utilities, and typed test data.',
            estimatedReadingTime: 8,
          },
        ],
      },
      {
        id: 'mod-pw-3',
        courseId: 'course-playwright-mastery',
        slug: 'module-3-advanced-contexts-multi-tab-storage-state',
        title: 'Module 3: Advanced Contexts, Multi-Tab & Storage State',
        description:
          'Modern end-to-end testing with Module 3: Advanced Contexts, Multi-Tab & Storage State.',
        lessons: [
          {
            id: 'les-pw-pw-api-mocking-framework',
            moduleId: 'mod-pw-3',
            courseId: 'course-playwright-mastery',
            slug: 'pw-api-mocking-framework',
            title: '9. API Mocking & Network Interception in Framework Code',
            summary:
              'Intercept network traffic with page.route(), implement a reusable NetworkMockManager, simulate 500 errors, network latency, and replay HAR files.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-pw-pw-independent-tests-apis',
            moduleId: 'mod-pw-3',
            courseId: 'course-playwright-mastery',
            slug: 'pw-independent-tests-apis',
            title: '10. Designing 100% Independent Tests Using Fixtures and APIs',
            summary:
              'Eliminate test inter-dependencies: UI for target feature verification, fast REST API fixtures for instant preconditions and deterministic teardown.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-pw-pw-parallel-test-data',
            moduleId: 'mod-pw-3',
            courseId: 'course-playwright-mastery',
            slug: 'pw-parallel-test-data',
            title: '11. Managing Test Data in High-Concurrency Parallel Execution',
            summary:
              'Prevent shared data collisions: worker-partitioned datasets using workerIndex, dynamic UUID data factories, and immutable seed strategies.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-pw-pw-retry-philosophy',
            moduleId: 'mod-pw-3',
            courseId: 'course-playwright-mastery',
            slug: 'pw-retry-philosophy',
            title: '12. Playwright Retry Philosophy & Flakiness Elimination',
            summary:
              'Why 0 retries locally and 2 in CI: worker process termination on failure, root-cause flakiness analysis, and flaky test quarantine strategies.',
            estimatedReadingTime: 8,
          },
        ],
      },
      {
        id: 'mod-pw-4',
        courseId: 'course-playwright-mastery',
        slug: 'module-4-scalable-page-object-model-ci-sharding',
        title: 'Module 4: Scalable Page Object Model & CI Sharding',
        description:
          'Modern end-to-end testing with Module 4: Scalable Page Object Model & CI Sharding.',
        lessons: [
          {
            id: 'les-pw-pw-trace-retention',
            moduleId: 'mod-pw-4',
            courseId: 'course-playwright-mastery',
            slug: 'pw-trace-retention',
            title: '13. Trace Retention Strategy & Production Debugging',
            summary:
              "Zero storage overhead for passing tests: configuring trace: 'on-first-retry', S3/blob artifact upload pipelines, and deep debugging in Trace Viewer.",
            estimatedReadingTime: 8,
          },
          {
            id: 'les-pw-pw-sharding-architecture',
            moduleId: 'mod-pw-4',
            courseId: 'course-playwright-mastery',
            slug: 'pw-sharding-architecture',
            title: '14. Playwright Test Sharding Architecture',
            summary:
              'Divide test suites horizontally across cloud runners with --shard=x/y and GitHub Actions matrix strategy for linear pipeline acceleration.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-pw-pw-sharding-realtime-challenges',
            moduleId: 'mod-pw-4',
            courseId: 'course-playwright-mastery',
            slug: 'pw-sharding-realtime-challenges',
            title: '15. Real-Time Challenges in Test Sharding & Architectural Solutions',
            summary:
              'Solve uneven shard runtimes (stragglers), shared database bottlenecks, matrix fail-fast cancellations, and merging blob reports with merge-reports.',
            estimatedReadingTime: 8,
          },
        ],
      },
    ],
    sortOrder: 2,
    status: 'published',
  },
  {
    id: 'course-selenium-mastery',
    slug: 'selenium-webdriver-enterprise',
    title: 'Selenium WebDriver 4 Enterprise Framework Architecture',
    subtitle: 'Production-Grade Java Test Automation Frameworks',
    description:
      'Deep dive into WebDriver 4 W3C protocol, dynamic wait strategies, ThreadLocal thread safety, and scalable Page Object Models.',
    level: 'Intermediate',
    estimatedHours: 24,
    modules: [
      {
        id: 'mod-sel-1',
        courseId: 'course-selenium-mastery',
        slug: 'module-1-core-java-oops-for-automation',
        title: 'Module 1: Core Java OOPs for Automation',
        description: 'Enterprise automation practices for Module 1: Core Java OOPs for Automation.',
        lessons: [
          {
            id: 'les-sel-java-oops-framework',
            moduleId: 'mod-sel-1',
            courseId: 'course-selenium-mastery',
            slug: 'java-oops-framework',
            title: '1. Core Java OOPs for Automation',
            summary:
              'Map Encapsulation, Inheritance, Polymorphism, and Abstraction directly to QA framework architecture.',
            estimatedReadingTime: 10,
          },
          {
            id: 'les-sel-sel-webdriver-setup',
            moduleId: 'mod-sel-1',
            courseId: 'course-selenium-mastery',
            slug: 'sel-webdriver-setup',
            title: '2. WebDriver 4 Architecture & Browser Setup',
            summary:
              'W3C standardization, Selenium Manager automated binary resolution, ChromeOptions, and headless execution.',
            estimatedReadingTime: 10,
          },
          {
            id: 'les-sel-sel-locators-xpath',
            moduleId: 'mod-sel-1',
            courseId: 'course-selenium-mastery',
            slug: 'sel-locators-xpath',
            title: '3. Advanced Dynamic Locators (XPath & CSS)',
            summary:
              'Master relative XPath axes (following-sibling, ancestor, parent), text normalization, and robust CSS selectors.',
            estimatedReadingTime: 12,
          },
        ],
      },
      {
        id: 'mod-sel-2',
        courseId: 'course-selenium-mastery',
        slug: 'module-2-selenium-4-webdriver-setup-locators',
        title: 'Module 2: Selenium 4 WebDriver Setup & Locators',
        description:
          'Enterprise automation practices for Module 2: Selenium 4 WebDriver Setup & Locators.',
        lessons: [
          {
            id: 'les-sel-sel-webelement-actions',
            moduleId: 'mod-sel-2',
            courseId: 'course-selenium-mastery',
            slug: 'sel-webelement-actions',
            title: '4. WebElement Actions & Form Interactions',
            summary:
              'Handling inputs, select dropdowns (single/multi-select), checkboxes, radio buttons, and JavaScript clicks.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-sel-sel-sync-waits',
            moduleId: 'mod-sel-2',
            courseId: 'course-selenium-mastery',
            slug: 'sel-sync-waits',
            title: '5. Synchronization & Dynamic Waits Strategy',
            summary:
              'Eliminate flakiness: Implicit vs Explicit vs FluentWait. Solving StaleElementReferenceException.',
            estimatedReadingTime: 12,
          },
          {
            id: 'les-sel-sel-actions-api',
            moduleId: 'mod-sel-2',
            courseId: 'course-selenium-mastery',
            slug: 'sel-actions-api',
            title: '6. Advanced User Interactions (Actions API)',
            summary:
              'Master mouse hover, context-click (right-click), drag and drop, and keyboard shortcuts with Actions class.',
            estimatedReadingTime: 8,
          },
        ],
      },
      {
        id: 'mod-sel-3',
        courseId: 'course-selenium-mastery',
        slug: 'module-3-dynamic-waits-synchronization-frames',
        title: 'Module 3: Dynamic Waits, Synchronization & Frames',
        description:
          'Enterprise automation practices for Module 3: Dynamic Waits, Synchronization & Frames.',
        lessons: [
          {
            id: 'les-sel-sel-frames-windows-shadow',
            moduleId: 'mod-sel-3',
            courseId: 'course-selenium-mastery',
            slug: 'sel-frames-windows-shadow',
            title: '7. Frames, Windows & Shadow DOM Handling',
            summary:
              'Navigate nested iframes, switch between multi-browser tabs/windows, and pierce native Shadow DOM in Selenium 4.',
            estimatedReadingTime: 10,
          },
          {
            id: 'les-sel-sel-pom-pagefactory',
            moduleId: 'mod-sel-3',
            courseId: 'course-selenium-mastery',
            slug: 'sel-pom-pagefactory',
            title: '8. Page Object Model & PageFactory Architecture',
            summary:
              'Architect scalable test frameworks: By locators vs @FindBy PageFactory annotations, method chaining, and clean separation.',
            estimatedReadingTime: 14,
          },
          {
            id: 'les-sel-sel-testng-parallel',
            moduleId: 'mod-sel-3',
            courseId: 'course-selenium-mastery',
            slug: 'sel-testng-parallel',
            title: '9. TestNG Suite & Parallel Multi-Threading',
            summary:
              'Master testng.xml, @DataProvider for data-driven testing, @Parameters, ThreadLocal<WebDriver>, and parallel suites.',
            estimatedReadingTime: 12,
          },
        ],
      },
      {
        id: 'mod-sel-4',
        courseId: 'course-selenium-mastery',
        slug: 'module-4-enterprise-page-object-model-grids',
        title: 'Module 4: Enterprise Page Object Model & Grids',
        description:
          'Enterprise automation practices for Module 4: Enterprise Page Object Model & Grids.',
        lessons: [
          {
            id: 'les-sel-sel-listeners-reports-cicd',
            moduleId: 'mod-sel-4',
            courseId: 'course-selenium-mastery',
            slug: 'sel-listeners-reports-cicd',
            title: '10. Listeners, Screenshots & Maven CI/CD Execution',
            summary:
              'Implement ITestListener, automatic screenshot capture on test failure, ExtentReports / Allure, and Maven CI/CD integration.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-sel-sel-dynamic-waits',
            moduleId: 'mod-sel-4',
            courseId: 'course-selenium-mastery',
            slug: 'sel-dynamic-waits',
            title: '11. Dynamic Synchronization: Explicit vs FluentWait vs Thread.sleep',
            summary:
              'Master dynamic synchronization to eliminate flaky tests, configure WebDriverWait, customize FluentWait polling intervals, and replace brittle sleep calls.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-sel-sel-threadlocal-driver',
            moduleId: 'mod-sel-4',
            courseId: 'course-selenium-mastery',
            slug: 'sel-threadlocal-driver',
            title: '12. ThreadLocal WebDriver for Parallel Test Execution',
            summary:
              'Design thread-safe WebDriver architectures for multi-threaded parallel execution in TestNG and CI/CD pipelines.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-sel-sel-pom-pattern',
            moduleId: 'mod-sel-4',
            courseId: 'course-selenium-mastery',
            slug: 'sel-pom-pattern',
            title: '13. Page Object Model (POM) & Component Architecture',
            summary:
              'Build scalable, maintainable test architectures by cleanly decoupling page locators and user actions from assertions.',
            estimatedReadingTime: 8,
          },
        ],
      },
    ],
    sortOrder: 3,
    status: 'published',
  },
  {
    id: 'course-rest-assured',
    slug: 'rest-assured-api-automation',
    title: 'REST Assured: Enterprise API Automation with Java',
    subtitle: 'From RequestSpecBuilder to JSON Schema & Contract Validation',
    description:
      'Learn REST Assured for automating RESTful microservices: authentication, OAuth2, POJO serialization with Jackson, and JSON schema assertions.',
    level: 'Intermediate',
    estimatedHours: 18,
    modules: [
      {
        id: 'mod-ra-1',
        courseId: 'course-rest-assured',
        slug: 'module-1-http-protocols-rest-assured-fundamentals',
        title: 'Module 1: HTTP Protocols & REST Assured Fundamentals',
        description:
          'API test automation with Module 1: HTTP Protocols & REST Assured Fundamentals.',
        lessons: [
          {
            id: 'les-ra-api-rest-basics',
            moduleId: 'mod-ra-1',
            courseId: 'course-rest-assured',
            slug: 'api-rest-basics',
            title: '1. REST Fundamentals & Postman Transition',
            summary:
              'Understand HTTP request headers, query parameters, path params, status codes, and mapping Postman collections to code.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-ra-api-given-when-then',
            moduleId: 'mod-ra-1',
            courseId: 'course-rest-assured',
            slug: 'api-given-when-then',
            title: '2. Given-When-Then BDD Syntax & Requests',
            summary:
              'Master the Given (preconditions), When (actions), Then (assertions) BDD pattern in automated API tests.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-ra-api-rest-crud',
            moduleId: 'mod-ra-1',
            courseId: 'course-rest-assured',
            slug: 'api-rest-crud',
            title: '3. CRUD Operations & Status Code Assertions',
            summary:
              'Automate complete entity lifecycles: POST (Create), GET (Read), PUT/PATCH (Update), DELETE with 200, 201, 204, 404 assertions.',
            estimatedReadingTime: 10,
          },
        ],
      },
      {
        id: 'mod-ra-2',
        courseId: 'course-rest-assured',
        slug: 'module-2-authentication-oauth2-specifications',
        title: 'Module 2: Authentication, OAuth2 & Specifications',
        description: 'API test automation with Module 2: Authentication, OAuth2 & Specifications.',
        lessons: [
          {
            id: 'les-ra-api-request-specs',
            moduleId: 'mod-ra-2',
            courseId: 'course-rest-assured',
            slug: 'api-request-specs',
            title: '4. Request & Response Specification Reusability',
            summary:
              'Eliminate duplicate headers: build reusable RequestSpecBuilder and ResponseSpecBuilder instances for framework modularity.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-ra-api-json-path',
            moduleId: 'mod-ra-2',
            courseId: 'course-rest-assured',
            slug: 'api-json-path',
            title: '5. JSONPath Querying & Deep Payload Validation',
            summary:
              'Extract nested attributes, parse arrays, filter collections with Groovy expressions (findAll, collect), and assert schema nodes.',
            estimatedReadingTime: 10,
          },
          {
            id: 'les-ra-api-pojo-serialization',
            moduleId: 'mod-ra-2',
            courseId: 'course-rest-assured',
            slug: 'api-pojo-serialization',
            title: '6. POJO Serialization & Deserialization (Jackson)',
            summary:
              'Type-safe API automation: Jackson object mapping, builder pattern for test data payloads, and deserializing responses into Java models.',
            estimatedReadingTime: 10,
          },
        ],
      },
      {
        id: 'mod-ra-3',
        courseId: 'course-rest-assured',
        slug: 'module-3-json-schema-pojo-serialization-framework-design',
        title: 'Module 3: JSON Schema, POJO Serialization & Framework Design',
        description:
          'API test automation with Module 3: JSON Schema, POJO Serialization & Framework Design.',
        lessons: [
          {
            id: 'les-ra-api-auth-tokens',
            moduleId: 'mod-ra-3',
            courseId: 'course-rest-assured',
            slug: 'api-auth-tokens',
            title: '7. Auth Tokens (JWT, OAuth2 & API Keys)',
            summary:
              'Automate authentication flows: logging in to extract JWT tokens, refreshing expired tokens, and injecting Bearer headers.',
            estimatedReadingTime: 10,
          },
          {
            id: 'les-ra-api-schema-validation',
            moduleId: 'mod-ra-3',
            courseId: 'course-rest-assured',
            slug: 'api-schema-validation',
            title: '8. JSON Schema Validation & CI/CD Regression',
            summary:
              'Enforce API contract stability: validate response schemas against JSON Schema Draft v7 to catch breaking API changes before production.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-ra-api-json-schema',
            moduleId: 'mod-ra-3',
            courseId: 'course-rest-assured',
            slug: 'api-json-schema',
            title: '9. JSON Schema Validation & Contract Testing',
            summary:
              'Verify API response payloads against strict JSON schema definitions to catch breaking contract regressions before clients fail.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-ra-api-req-res-spec',
            moduleId: 'mod-ra-3',
            courseId: 'course-rest-assured',
            slug: 'api-req-res-spec',
            title: '10. RequestSpecification & ResponseSpecification Architecture',
            summary:
              'Build clean, reusable API automation suites using specifications to eliminate boilerplate header and auth configuration.',
            estimatedReadingTime: 8,
          },
        ],
      },
    ],
    sortOrder: 4,
    status: 'published',
  },
  {
    id: 'course-api-testing',
    slug: 'api-testing-and-contracts',
    title: 'Full-Stack API Testing & Consumer-Driven Contracts',
    subtitle: 'Postman, Newman, Pact, and OpenAPI Schema Verification',
    description:
      'Comprehensive guide to testing distributed microservices, REST APIs, GraphQL endpoints, and consumer-driven contracts.',
    level: 'All Levels',
    estimatedHours: 16,
    modules: [
      {
        id: 'mod-apifull-1',
        courseId: 'course-api-testing',
        slug: 'contract-testing-principles',
        title: 'Module 1: Consumer-Driven Contracts with Pact',
        description:
          'Prevent microservice integration breaking changes using Pact contract definitions.',
        lessons: [
          {
            id: 'les-consumer-driven-contracts-with-pact',
            moduleId: 'mod-apifull-1',
            courseId: 'course-api-testing',
            slug: 'consumer-driven-contracts-with-pact',
            title: '1.1 Consumer-Driven Contracts with Pact',
            summary:
              'Write consumer expectations in code and generate contract JSON files for provider verification.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-pact-provider-verification-contracts',
            moduleId: 'mod-apifull-1',
            courseId: 'course-api-testing',
            slug: 'pact-provider-verification-contracts',
            title: '1.2 Provider Verification & Breaking Changes',
            summary:
              'Run automated provider verification in CI pipelines against published Pact contracts.',
            estimatedReadingTime: 8,
          },
        ],
      },
      {
        id: 'mod-apifull-2',
        courseId: 'course-api-testing',
        slug: 'wiremock-and-k6-performance',
        title: 'Module 2: WireMock Stubs & k6 Performance Benchmarking',
        description:
          'Isolate upstream dependencies with WireMock stubs and enforce SLOs with k6 scripts.',
        lessons: [
          {
            id: 'les-wiremock-api-mocking-stubs',
            moduleId: 'mod-apifull-2',
            courseId: 'course-api-testing',
            slug: 'wiremock-api-mocking-stubs',
            title: '2.1 WireMock Dynamic Stubs & Fault Injection',
            summary: 'Simulate slow network latency, 503 gateway outages, and dynamic responses.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-k6-api-performance-benchmarks',
            moduleId: 'mod-apifull-2',
            courseId: 'course-api-testing',
            slug: 'k6-api-performance-benchmarks',
            title: '2.2 k6 Performance Benchmarking & Error Budgets',
            summary:
              'Validate p95 latency thresholds and error rates under concurrent virtual user load.',
            estimatedReadingTime: 8,
          },
        ],
      },
    ],
    sortOrder: 5,
    status: 'published',
  },
  {
    id: 'course-appium',
    slug: 'appium-mobile-automation',
    title: 'Appium 2.0 Mobile Automation Masterclass',
    subtitle: 'Cross-Platform Automation for Android and iOS',
    description:
      'Master Appium 2.0 modular driver architecture, UiAutomator2, XCUITest, mobile gestures, and device cloud integration.',
    level: 'Intermediate',
    estimatedHours: 20,
    modules: [
      {
        id: 'mod-app-1',
        courseId: 'course-appium',
        slug: 'appium-2-modular-ecosystem',
        title: 'Module 1: Appium 2.0 Architecture & Driver Setup',
        description: 'Master decoupled Appium 2.0 CLI drivers, UiAutomator2, and XCUITest engines.',
        lessons: [
          {
            id: 'les-appium-2-modular-ecosystem',
            moduleId: 'mod-app-1',
            courseId: 'course-appium',
            slug: 'appium-2-modular-ecosystem',
            title: '1.1 Appium 2.0 Modular Drivers & Plugins',
            summary:
              'Understand independent driver lifecycle, CLI management, and plugin architecture.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-android-ios-driver-capabilities',
            moduleId: 'mod-app-1',
            courseId: 'course-appium',
            slug: 'android-ios-driver-capabilities',
            title: '1.2 UiAutomator2 & XCUITest Capabilities Matrix',
            summary:
              'Configure W3C compliant capabilities for real devices, emulators, and cloud farms.',
            estimatedReadingTime: 8,
          },
        ],
      },
      {
        id: 'mod-app-2',
        courseId: 'course-appium',
        slug: 'mobile-gestures-and-pom',
        title: 'Module 2: W3C Mobile Gestures & Framework Design',
        description:
          'Master pointer action swipes, pinch-to-zoom, and Page Object Models for native apps.',
        lessons: [
          {
            id: 'les-w3c-mobile-actions-gestures',
            moduleId: 'mod-app-2',
            courseId: 'course-appium',
            slug: 'w3c-mobile-actions-gestures',
            title: '2.1 W3C Pointer Actions & Smooth Scrolling',
            summary:
              'Zero-flake mobile gesture automation without brittle absolute coordinate taps.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-mobile-page-object-model',
            moduleId: 'mod-app-2',
            courseId: 'course-appium',
            slug: 'mobile-page-object-model',
            title: '2.2 Mobile Page Object Model & Cloud Execution',
            summary:
              'Structure scalable cross-platform Android/iOS tests running on BrowserStack and Sauce Labs.',
            estimatedReadingTime: 8,
          },
        ],
      },
    ],
    sortOrder: 6,
    status: 'published',
  },
  {
    id: 'course-cicd-concepts',
    slug: 'cicd-concepts',
    title: 'CI/CD Concepts',
    subtitle: 'Git Version Control, GitHub Actions, Azure DevOps & Declarative Jenkins Pipelines',
    description:
      'Master modern Continuous Integration, automated quality gating, and Continuous Delivery for QA automation: Git branching models, GitHub Actions matrix runners, Azure DevOps quality release gates, and distributed Jenkins container pipelines.',
    level: 'Comprehensive',
    estimatedHours: 46,
    modules: [
      {
        id: 'mod-cicd-1-git',
        courseId: 'course-cicd-concepts',
        slug: 'git-version-control',
        title: 'Module 1: Git & Version Control for QA',
        description:
          'Git fundamentals, commit DAG architecture, branching models (Trunk-Based, GitFlow), conflict resolution, and PR review quality gates.',
        lessons: [
          {
            id: 'les-git-1-1-what-is-git',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'what-is-git',
            title: 'What is Git?',
            summary:
              'Git is a distributed version control system (DVCS) that tracks changes in source code and test automation frameworks over time, enabling multiple SDETs and developers to collaborate concurrently.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-1-2-version-control-concepts',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'version-control-concepts',
            title: 'Version Control Concepts',
            summary:
              'Git is a distributed version control system (DVCS) that tracks changes in source code and test automation frameworks over time, enabling multiple SDETs and developers to collaborate concurrently.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-1-3-git-architecture',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'git-architecture',
            title: 'Git Architecture',
            summary:
              'Git architecture is structured as a Directed Acyclic Graph (DAG) of content-addressable objects: Blobs (file contents), Trees (directories), Commits (snapshots with metadata), and Annotated Tags.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-1-4-git-vs-centralized-vcs',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'git-vs-centralized-vcs',
            title: 'Git vs Centralized VCS',
            summary:
              'Git vs Centralized VCS is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-1-5-git-configuration',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'git-configuration',
            title: 'Git Configuration',
            summary:
              'Core Git commands form the daily CLI toolkit for test automation engineers: staging changes, creating atomic commits, inspecting diffs, and viewing history.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-1-6-core-git-commands',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'core-git-commands',
            title: 'Core Git Commands',
            summary:
              'Core Git commands form the daily CLI toolkit for test automation engineers: staging changes, creating atomic commits, inspecting diffs, and viewing history.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-2-1-branching-strategies-gitflow-tru',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'branching-strategies-gitflow-trunk-based',
            title: 'Branching Strategies (GitFlow, Trunk-Based)',
            summary:
              'Git branching creates isolated lines of development, allowing engineers to develop and test new features without destabilizing the main branch.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-2-2-creating-and-switching-branches',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'creating-and-switching-branches',
            title: 'Creating and Switching Branches',
            summary:
              'Git branching creates isolated lines of development, allowing engineers to develop and test new features without destabilizing the main branch.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-2-3-merging-and-merge-conflicts',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'merging-and-merge-conflicts',
            title: 'Merging and Merge Conflicts',
            summary:
              'Merging integrates changes from one branch into another, while rebasing reapplies commits on top of a new base tip, creating a linear history.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-2-4-rebasing-vs-merging',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'rebasing-vs-merging',
            title: 'Rebasing vs Merging',
            summary:
              'Merging integrates changes from one branch into another, while rebasing reapplies commits on top of a new base tip, creating a linear history.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-2-5-stashing-and-cherry-picking',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'stashing-and-cherry-picking',
            title: 'Stashing and Cherry-Picking',
            summary:
              'Stashing and Cherry-Picking is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-3-1-remote-repositories',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'remote-repositories',
            title: 'Remote Repositories',
            summary:
              'Pull Requests (PRs) and remote collaboration workflows facilitate peer code review, automated CI quality checks, and shared repository governance.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-3-2-push-pull-and-fetch',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'push-pull-and-fetch',
            title: 'Push Pull and Fetch',
            summary:
              'Pull Requests (PRs) and remote collaboration workflows facilitate peer code review, automated CI quality checks, and shared repository governance.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-3-3-pull-requests-and-code-review',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'pull-requests-and-code-review',
            title: 'Pull Requests and Code Review',
            summary:
              'Pull Requests (PRs) and remote collaboration workflows facilitate peer code review, automated CI quality checks, and shared repository governance.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-3-4-forking-workflow',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'forking-workflow',
            title: 'Forking Workflow',
            summary:
              'Forking Workflow is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-3-5-handling-merge-conflicts-in-prs',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'handling-merge-conflicts-in-prs',
            title: 'Handling Merge Conflicts in PRs',
            summary:
              'Merging integrates changes from one branch into another, while rebasing reapplies commits on top of a new base tip, creating a linear history.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-4-1-what-is-cicd',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'what-is-cicd',
            title: 'What is CI/CD?',
            summary:
              'What is CI/CD? is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-4-2-continuous-integration-vs-contin',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'continuous-integration-vs-continuous-delivery-vs-continuous-deployment',
            title: 'Continuous Integration vs Continuous Delivery vs Continuous Deployment',
            summary:
              'CI/CD (Continuous Integration and Continuous Delivery/Deployment) is the automated practice of integrating code changes into a shared repository and automatically deploying verified artifacts to environments.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-4-3-why-cicd-is-essential-for-qa',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'why-cicd-is-essential-for-qa',
            title: 'Why CI/CD is Essential for QA',
            summary:
              'CI/CD (Continuous Integration and Continuous Delivery/Deployment) is the automated practice of integrating code changes into a shared repository and automatically deploying verified artifacts to environments.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-4-4-automated-quality-gates',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'automated-quality-gates',
            title: 'Automated Quality Gates',
            summary:
              'Automated Quality Gates is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-4-5-test-automation-in-cicd',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'test-automation-in-cicd',
            title: 'Test Automation in CI/CD',
            summary:
              'Test Automation in CI/CD is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-5-1-pipeline-architecture',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'pipeline-architecture',
            title: 'Pipeline Architecture',
            summary:
              'Git architecture is structured as a Directed Acyclic Graph (DAG) of content-addressable objects: Blobs (file contents), Trees (directories), Commits (snapshots with metadata), and Annotated Tags.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-5-2-pipeline-stages-build-test-deplo',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'pipeline-stages-build-test-deploy',
            title: 'Pipeline Stages (Build, Test, Deploy)',
            summary:
              'Pipeline Stages (Build, Test, Deploy) is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-5-3-triggers-and-events',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'triggers-and-events',
            title: 'Triggers and Events',
            summary:
              'Triggers and Events is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-5-4-environment-management',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'environment-management',
            title: 'Environment Management',
            summary:
              'Pipeline security and secrets management ensures sensitive credentials (API tokens, database passwords, private keys) are injected securely without being exposed in logs or code.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-5-5-artifact-management',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'artifact-management',
            title: 'Artifact Management',
            summary:
              'Artifact Management is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-5-6-test-reporting-in-cicd',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'test-reporting-in-cicd',
            title: 'Test Reporting in CI/CD',
            summary:
              'Test Reporting in CI/CD is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-6-1-smoke-tests-in-cicd',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'smoke-tests-in-cicd',
            title: 'Smoke Tests in CI/CD',
            summary:
              'Smoke Tests in CI/CD is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-6-2-regression-pipeline-design',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'regression-pipeline-design',
            title: 'Regression Pipeline Design',
            summary:
              'Regression Pipeline Design is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-6-3-parallel-test-execution-in-pipel',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'parallel-test-execution-in-pipelines',
            title: 'Parallel Test Execution in Pipelines',
            summary:
              'Matrix strategies execute test jobs concurrently across combinations of variables (e.g., Operating Systems, Node/Java versions, and Browser engines).',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-6-4-handling-test-flakiness-in-ci',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'handling-test-flakiness-in-ci',
            title: 'Handling Test Flakiness in CI',
            summary:
              'Handling Test Flakiness in CI is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-6-5-test-failure-notifications-and-a',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'test-failure-notifications-and-alerts',
            title: 'Test Failure Notifications and Alerts',
            summary:
              'Test Failure Notifications and Alerts is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-6-6-quality-metrics-and-dashboards',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'quality-metrics-and-dashboards',
            title: 'Quality Metrics and Dashboards',
            summary:
              'Quality Metrics and Dashboards is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-7-1-branch-protection-rules',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'branch-protection-rules',
            title: 'Branch Protection Rules',
            summary:
              'Branch Protection Rules is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-7-2-pipeline-security-and-secrets',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'pipeline-security-and-secrets',
            title: 'Pipeline Security and Secrets',
            summary:
              'Pipeline security and secrets management ensures sensitive credentials (API tokens, database passwords, private keys) are injected securely without being exposed in logs or code.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-7-3-cost-optimization-for-ci-runners',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'cost-optimization-for-ci-runners',
            title: 'Cost Optimization for CI Runners',
            summary:
              'Runners are the compute instances (virtual machines or containers) that execute the steps defined in your CI/CD workflows.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-git-7-4-shift-left-testing-strategy',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'shift-left-testing-strategy',
            title: 'Shift-Left Testing Strategy',
            summary:
              'Shift-Left Testing Strategy is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-git-7-5-rollback-strategies',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'rollback-strategies',
            title: 'Rollback Strategies',
            summary:
              'Rollback Strategies is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
        ],
      },
      {
        id: 'mod-cicd-2-github-actions',
        courseId: 'course-cicd-concepts',
        slug: 'github-actions-pipelines',
        title: 'Module 2: GitHub Actions CI/CD Pipelines',
        description:
          'Workflow triggers, job matrices, parallel test sharding, artifact caching, headless browser configurations, and custom composite actions.',
        lessons: [
          {
            id: 'les-github-actions-1-1-what-is-github-actions',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'what-is-github-actions',
            title: 'What is GitHub Actions?',
            summary:
              'Git is a distributed version control system (DVCS) that tracks changes in source code and test automation frameworks over time, enabling multiple SDETs and developers to collaborate concurrently.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-1-2-core-components-workflows-events',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'core-components-workflows-events-jobs-steps-actions-runners',
            title: 'Core Components (Workflows, Events, Jobs, Steps, Actions, Runners)',
            summary:
              'Runners are the compute instances (virtual machines or containers) that execute the steps defined in your CI/CD workflows.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-1-3-github-actions-vs-jenkins',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'github-actions-vs-jenkins',
            title: 'GitHub Actions vs Jenkins',
            summary:
              'GitHub Actions vs Jenkins is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-1-4-workflow-file-syntax-yaml',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'workflow-file-syntax-yaml',
            title: 'Workflow File Syntax (YAML)',
            summary:
              'Workflow File Syntax (YAML) is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-2-1-workflow-triggers-push-pull-requ',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'workflow-triggers-push-pull-request-schedule-workflow-dispatch',
            title: 'Workflow Triggers (push, pull_request, schedule, workflow_dispatch)',
            summary:
              'Pull Requests (PRs) and remote collaboration workflows facilitate peer code review, automated CI quality checks, and shared repository governance.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-2-2-job-configuration',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'job-configuration',
            title: 'Job Configuration',
            summary:
              'Core Git commands form the daily CLI toolkit for test automation engineers: staging changes, creating atomic commits, inspecting diffs, and viewing history.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-2-3-step-execution',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'step-execution',
            title: 'Step Execution',
            summary:
              'Step Execution is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-github-actions-2-4-dependencies-between-jobs-needs',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'dependencies-between-jobs-needs',
            title: 'Dependencies Between Jobs (needs)',
            summary:
              'Dependencies Between Jobs (needs) is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-2-5-conditional-execution-if',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'conditional-execution-if',
            title: 'Conditional Execution (if)',
            summary:
              'Conditional Execution (if) is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-github-actions-3-1-github-hosted-runners',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'github-hosted-runners',
            title: 'GitHub-Hosted Runners',
            summary:
              'Runners are the compute instances (virtual machines or containers) that execute the steps defined in your CI/CD workflows.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-github-actions-3-2-self-hosted-runners',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'self-hosted-runners',
            title: 'Self-Hosted Runners',
            summary:
              'Runners are the compute instances (virtual machines or containers) that execute the steps defined in your CI/CD workflows.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-github-actions-3-3-matrix-strategy-parallel-testing',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'matrix-strategy-parallel-testing-across-osbrowser',
            title: 'Matrix Strategy (Parallel Testing Across OS/Browser)',
            summary:
              'Matrix strategies execute test jobs concurrently across combinations of variables (e.g., Operating Systems, Node/Java versions, and Browser engines).',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-3-4-environment-variables-and-secret',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'environment-variables-and-secrets',
            title: 'Environment Variables and Secrets',
            summary:
              'Pipeline security and secrets management ensures sensitive credentials (API tokens, database passwords, private keys) are injected securely without being exposed in logs or code.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-3-5-managing-artifacts-and-caches',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'managing-artifacts-and-caches',
            title: 'Managing Artifacts and Caches',
            summary:
              'Managing Artifacts and Caches is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-4-1-running-selenium-in-github-actio',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'running-selenium-in-github-actions',
            title: 'Running Selenium in GitHub Actions',
            summary:
              'Automated test execution in GitHub Actions involves configuring headless browser drivers, dependencies, test execution commands, and result archiving in workflow files.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-4-2-running-playwright-in-github-act',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'running-playwright-in-github-actions',
            title: 'Running Playwright in GitHub Actions',
            summary:
              'Automated test execution in GitHub Actions involves configuring headless browser drivers, dependencies, test execution commands, and result archiving in workflow files.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-4-3-running-api-tests-newmanrest-ass',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'running-api-tests-newmanrest-assured',
            title: 'Running API Tests (Newman/Rest Assured)',
            summary:
              'Automated test execution in GitHub Actions involves configuring headless browser drivers, dependencies, test execution commands, and result archiving in workflow files.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-4-4-headless-browser-configuration',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'headless-browser-configuration',
            title: 'Headless Browser Configuration',
            summary:
              'Core Git commands form the daily CLI toolkit for test automation engineers: staging changes, creating atomic commits, inspecting diffs, and viewing history.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-4-5-publishing-test-reports-allure-h',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'publishing-test-reports-allure-html',
            title: 'Publishing Test Reports (Allure, HTML)',
            summary:
              'Publishing Test Reports (Allure, HTML) is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-5-1-using-marketplace-actions',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'using-marketplace-actions',
            title: 'Using Marketplace Actions',
            summary:
              'Custom and composite actions encapsulate reusable multi-step automation logic into versioned, shareable modules across multiple repositories.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-5-2-creating-custom-composite-action',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'creating-custom-composite-actions',
            title: 'Creating Custom Composite Actions',
            summary:
              'Custom and composite actions encapsulate reusable multi-step automation logic into versioned, shareable modules across multiple repositories.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-5-3-creating-javascript-actions',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'creating-javascript-actions',
            title: 'Creating JavaScript Actions',
            summary:
              'Creating JavaScript Actions is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-github-actions-5-4-creating-docker-container-action',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'creating-docker-container-actions',
            title: 'Creating Docker Container Actions',
            summary:
              'Creating Docker Container Actions is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-5-5-sharing-actions-across-repositor',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'sharing-actions-across-repositories',
            title: 'Sharing Actions Across Repositories',
            summary:
              'Sharing Actions Across Repositories is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-6-1-secrets-and-environment-protecti',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'secrets-and-environment-protection',
            title: 'Secrets and Environment Protection',
            summary:
              'Pipeline security and secrets management ensures sensitive credentials (API tokens, database passwords, private keys) are injected securely without being exposed in logs or code.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-github-actions-6-2-concurrency-and-cancellation',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'concurrency-and-cancellation',
            title: 'Concurrency and Cancellation',
            summary:
              'Reusable workflows (workflow_call) allow teams to define centralized CI/CD pipelines that can be invoked by multiple downstream repositories with parameterized inputs.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-github-actions-6-3-reusable-workflows',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'reusable-workflows',
            title: 'Reusable Workflows',
            summary:
              'Reusable workflows (workflow_call) allow teams to define centralized CI/CD pipelines that can be invoked by multiple downstream repositories with parameterized inputs.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-github-actions-6-4-dynamic-matrix-builds',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'dynamic-matrix-builds',
            title: 'Dynamic Matrix Builds',
            summary:
              'Matrix strategies execute test jobs concurrently across combinations of variables (e.g., Operating Systems, Node/Java versions, and Browser engines).',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-github-actions-6-5-notifications-slack-email',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'notifications-slack-email',
            title: 'Notifications (Slack, Email)',
            summary:
              'Notifications (Slack, Email) is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-github-actions-6-6-enterprise-best-practices',
            moduleId: 'mod-cicd-2-github-actions',
            courseId: 'course-cicd-concepts',
            slug: 'enterprise-best-practices',
            title: 'Enterprise Best Practices',
            summary:
              'Enterprise Best Practices is a key architectural capability in modern continuous testing, version control, and CI/CD automation pipelines.',
            estimatedReadingTime: 6,
          },
        ],
      },
      {
        id: 'mod-cicd-3-azure-devops',
        courseId: 'course-cicd-concepts',
        slug: 'azure-devops-pipelines',
        title: 'Module 3: Azure DevOps Pipelines for SDETs',
        description:
          'Multi-stage YAML pipelines, PublishTestResults@2 task, self-hosted vs Microsoft agent pools, Azure Test Plans traceability, and automated quality gates.',
        lessons: [
          {
            id: 'les-publishing-test-results-in-ado',
            moduleId: 'mod-cicd-3-azure-devops',
            courseId: 'course-cicd-concepts',
            slug: 'publishing-test-results-in-ado',
            title: '1.1 PublishTestResults@2 Task & Reporting',
            summary:
              'PublishTestResults@2 is a core Azure DevOps pipeline task that parses JUnit, NUnit, VSTest, or xUnit XML report files generated by test automation runners and publishes them directly into the Azure Test Analytics engine.',
            estimatedReadingTime: 9,
          },
          {
            id: 'les-azure-pipelines-agent-pools',
            moduleId: 'mod-cicd-3-azure-devops',
            courseId: 'course-cicd-concepts',
            slug: 'azure-pipelines-agent-pools',
            title: '1.2 Self-Hosted vs Microsoft-Hosted Build Agents',
            summary:
              'Azure Pipelines agent pools are execution compute resources that run your pipeline jobs. SDETs must choose between Microsoft-hosted agents (ephemeral, cloud-managed VMs) and Self-hosted agents (dedicated physical or virtual machines in your own network).',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-azure-test-plans-automation-link',
            moduleId: 'mod-cicd-3-azure-devops',
            courseId: 'course-cicd-concepts',
            slug: 'azure-test-plans-automation-link',
            title: '2.1 Azure Test Plans Automated Test Association',
            summary:
              'Azure Test Plans Automated Test Association is the mechanism for linking automated test methods (in Java, C#, TypeScript, Python) to work item Test Cases in Azure Test Plans.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-ado-release-pipeline-gates',
            moduleId: 'mod-cicd-3-azure-devops',
            courseId: 'course-cicd-concepts',
            slug: 'ado-release-pipeline-gates',
            title: '2.2 Automated Release Gates & Quality Metrics',
            summary:
              'Automated Release Gates in Azure DevOps are pre-deployment and post-deployment quality checks that evaluate automated test metrics, pass rates, and system health before allowing code to deploy to staging or production environments.',
            estimatedReadingTime: 8,
          },
        ],
      },
      {
        id: 'mod-cicd-4-jenkins',
        courseId: 'course-cicd-concepts',
        slug: 'declarative-jenkins-pipelines',
        title: 'Module 4: Declarative Jenkins Pipelines for QA Automation',
        description:
          'Declarative Jenkinsfile structure, multibranch webhook triggers, parallel test execution on Docker agents, HTML test reporting, and Slack alerts.',
        lessons: [
          {
            id: 'les-declarative-syntax-essentials',
            moduleId: 'mod-cicd-4-jenkins',
            courseId: 'course-cicd-concepts',
            slug: 'declarative-syntax-essentials',
            title: '1.1 Declarative Jenkinsfile Structure for QA',
            summary:
              'Declarative Pipeline is the modern, standardized syntax for writing Jenkinsfiles in Jenkins. It provides a structured, opinionated syntax (pipeline { agent ... stages ... post ... }) that replaces fragile legacy Scripted Groovy pipelines.',
            estimatedReadingTime: 8,
          },
          {
            id: 'les-multibranch-webhook-triggers',
            moduleId: 'mod-cicd-4-jenkins',
            courseId: 'course-cicd-concepts',
            slug: 'multibranch-webhook-triggers',
            title: '1.2 Multi-Branch Pipelines & Webhook Triggers',
            summary:
              'Multibranch Pipeline is a Jenkins project type that automatically discovers branches and pull requests in your Git repository, creating separate child pipelines for each branch that contains a Jenkinsfile.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-parallel-stages-docker-agents',
            moduleId: 'mod-cicd-4-jenkins',
            courseId: 'course-cicd-concepts',
            slug: 'parallel-stages-docker-agents',
            title: '2.1 Parallel Test Execution on Docker Agents',
            summary:
              'Parallel test execution on Docker agents is the enterprise architecture of distributing test suites across multiple concurrent Docker containers running on Jenkins agents.',
            estimatedReadingTime: 7,
          },
          {
            id: 'les-jenkins-html-reporting-slack',
            moduleId: 'mod-cicd-4-jenkins',
            courseId: 'course-cicd-concepts',
            slug: 'jenkins-html-reporting-slack',
            title: '2.2 Automated HTML Reports & Slack Notifications',
            summary:
              'Automated HTML Reporting and Slack Notifications is the pipeline stage responsible for publishing interactive test reports (Playwright HTML, Allure, ExtentReports) and dispatching actionable, rich alert notifications to QA and development communication channels.',
            estimatedReadingTime: 8,
          },
        ],
      },
    ],
    sortOrder: 7,
    status: 'published',
  },
  {
    id: 'course-apm-performance',
    slug: 'apm-and-performance-testing',
    title: 'Performance Testing',
    subtitle: 'Apache JMeter, k6 Load Scripting, Distributed Tracing, and Datadog/Dynatrace APM',
    description:
      'Comprehensive performance engineering and monitoring: JMeter distributed loads, modern k6 virtual user scripting, SLAs/SLOs, and Application Performance Monitoring (APM) with OpenTelemetry and Datadog.',
    level: 'Comprehensive',
    estimatedHours: 30,
    modules: [
      {
        id: 'mod-apm-performance-1',
        courseId: 'course-apm-performance',
        slug: 'performance-testing-fundamentals',
        title: 'Module 1: Performance Testing Fundamentals',
        description:
          'Load, stress, endurance, and spike testing, response time metrics, throughput, latency, and SLAs/SLOs.',
        lessons: [
          {
            id: 'les-apm-performance-1-1-what-is-performance-testing',
            moduleId: 'mod-apm-performance-1',
            courseId: 'course-apm-performance',
            slug: 'what-is-performance-testing',
            title: 'What is Performance Testing?',
            summary:
              'Master What is Performance Testing? in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-1-2-types-of-performance-testing-loa',
            moduleId: 'mod-apm-performance-1',
            courseId: 'course-apm-performance',
            slug: 'types-of-performance-testing-load-stress-endurance-spike-volume',
            title: 'Types of Performance Testing (Load, Stress, Endurance, Spike, Volume)',
            summary:
              'Master Types of Performance Testing (Load, Stress, Endurance, Spike, Volume) in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-1-3-key-metrics-response-time-throug',
            moduleId: 'mod-apm-performance-1',
            courseId: 'course-apm-performance',
            slug: 'key-metrics-response-time-throughput-error-rate-latency',
            title: 'Key Metrics (Response Time, Throughput, Error Rate, Latency)',
            summary:
              'Master Key Metrics (Response Time, Throughput, Error Rate, Latency) in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-1-4-performance-testing-lifecycle',
            moduleId: 'mod-apm-performance-1',
            courseId: 'course-apm-performance',
            slug: 'performance-testing-lifecycle',
            title: 'Performance Testing Lifecycle',
            summary:
              'Master Performance Testing Lifecycle in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-1-5-sla-slo-and-sli',
            moduleId: 'mod-apm-performance-1',
            courseId: 'course-apm-performance',
            slug: 'sla-slo-and-sli',
            title: 'SLA SLO and SLI',
            summary:
              'Master SLA SLO and SLI in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
        ],
      },
      {
        id: 'mod-apm-performance-2',
        courseId: 'course-apm-performance',
        slug: 'performance-testing-with-jmeter',
        title: 'Module 2: Performance Testing with JMeter',
        description:
          'Apache JMeter architecture, Thread Groups, samplers, timers, listeners, parameterization, and distributed load.',
        lessons: [
          {
            id: 'les-apm-performance-2-1-introduction-to-apache-jmeter',
            moduleId: 'mod-apm-performance-2',
            courseId: 'course-apm-performance',
            slug: 'introduction-to-apache-jmeter',
            title: 'Introduction to Apache JMeter',
            summary:
              'Master Introduction to Apache JMeter in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-2-2-jmeter-architecture',
            moduleId: 'mod-apm-performance-2',
            courseId: 'course-apm-performance',
            slug: 'jmeter-architecture',
            title: 'JMeter Architecture',
            summary:
              'Master JMeter Architecture in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-2-3-thread-groups-and-virtual-users',
            moduleId: 'mod-apm-performance-2',
            courseId: 'course-apm-performance',
            slug: 'thread-groups-and-virtual-users',
            title: 'Thread Groups and Virtual Users',
            summary:
              'Master Thread Groups and Virtual Users in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-2-4-samplers-timers-and-listeners',
            moduleId: 'mod-apm-performance-2',
            courseId: 'course-apm-performance',
            slug: 'samplers-timers-and-listeners',
            title: 'Samplers, Timers and Listeners',
            summary:
              'Master Samplers, Timers and Listeners in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-2-5-assertions',
            moduleId: 'mod-apm-performance-2',
            courseId: 'course-apm-performance',
            slug: 'assertions',
            title: 'Assertions',
            summary:
              'Master Assertions in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-2-6-parameterization-and-data-driven',
            moduleId: 'mod-apm-performance-2',
            courseId: 'course-apm-performance',
            slug: 'parameterization-and-data-driven-testing',
            title: 'Parameterization and Data-Driven Testing',
            summary:
              'Master Parameterization and Data-Driven Testing in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-2-7-correlation-and-regular-expressi',
            moduleId: 'mod-apm-performance-2',
            courseId: 'course-apm-performance',
            slug: 'correlation-and-regular-expressions',
            title: 'Correlation and Regular Expressions',
            summary:
              'Master Correlation and Regular Expressions in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-2-8-distributed-testing-with-jmeter',
            moduleId: 'mod-apm-performance-2',
            courseId: 'course-apm-performance',
            slug: 'distributed-testing-with-jmeter',
            title: 'Distributed Testing with JMeter',
            summary:
              'Master Distributed Testing with JMeter in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
        ],
      },
      {
        id: 'mod-apm-performance-3',
        courseId: 'course-apm-performance',
        slug: 'modern-performance-testing-k6-gatling',
        title: 'Module 3: Modern Performance Testing (k6 / Gatling)',
        description:
          'Scripting performance in JavaScript with Grafana k6, virtual user ramp-ups, thresholds, and InfluxDB/Grafana.',
        lessons: [
          {
            id: 'les-apm-performance-3-1-introduction-to-k6',
            moduleId: 'mod-apm-performance-3',
            courseId: 'course-apm-performance',
            slug: 'introduction-to-k6',
            title: 'Introduction to k6',
            summary:
              'Master Introduction to k6 in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-3-2-scripting-performance-tests-in-j',
            moduleId: 'mod-apm-performance-3',
            courseId: 'course-apm-performance',
            slug: 'scripting-performance-tests-in-javascript',
            title: 'Scripting Performance Tests in JavaScript',
            summary:
              'Master Scripting Performance Tests in JavaScript in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-3-3-virtual-users-and-thresholds',
            moduleId: 'mod-apm-performance-3',
            courseId: 'course-apm-performance',
            slug: 'virtual-users-and-thresholds',
            title: 'Virtual Users and Thresholds',
            summary:
              'Master Virtual Users and Thresholds in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-3-4-k6-cloud-and-influxdbgrafana-int',
            moduleId: 'mod-apm-performance-3',
            courseId: 'course-apm-performance',
            slug: 'k6-cloud-and-influxdbgrafana-integration',
            title: 'k6 Cloud and InfluxDB/Grafana Integration',
            summary:
              'Master k6 Cloud and InfluxDB/Grafana Integration in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-3-5-k6-vs-jmeter',
            moduleId: 'mod-apm-performance-3',
            courseId: 'course-apm-performance',
            slug: 'k6-vs-jmeter',
            title: 'k6 vs JMeter',
            summary:
              'Master k6 vs JMeter in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-3-6-gatling-overview',
            moduleId: 'mod-apm-performance-3',
            courseId: 'course-apm-performance',
            slug: 'gatling-overview',
            title: 'Gatling Overview',
            summary:
              'Master Gatling Overview in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
        ],
      },
      {
        id: 'mod-apm-performance-4',
        courseId: 'course-apm-performance',
        slug: 'application-performance-monitoring-apm-concepts',
        title: 'Module 4: Application Performance Monitoring (APM) Concepts',
        description:
          'The three pillars of observability (metrics, logs, traces), distributed tracing, and APM platforms.',
        lessons: [
          {
            id: 'les-apm-performance-4-1-what-is-apm',
            moduleId: 'mod-apm-performance-4',
            courseId: 'course-apm-performance',
            slug: 'what-is-apm',
            title: 'What is APM?',
            summary:
              'Master What is APM? in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-4-2-key-apm-pillars-metrics-logs-tra',
            moduleId: 'mod-apm-performance-4',
            courseId: 'course-apm-performance',
            slug: 'key-apm-pillars-metrics-logs-traces',
            title: 'Key APM Pillars (Metrics, Logs, Traces)',
            summary:
              'Master Key APM Pillars (Metrics, Logs, Traces) in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-4-3-understanding-distributed-tracin',
            moduleId: 'mod-apm-performance-4',
            courseId: 'course-apm-performance',
            slug: 'understanding-distributed-tracing',
            title: 'Understanding Distributed Tracing',
            summary:
              'Master Understanding Distributed Tracing in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-4-4-apm-tools-landscape-datadog-dyna',
            moduleId: 'mod-apm-performance-4',
            courseId: 'course-apm-performance',
            slug: 'apm-tools-landscape-datadog-dynatrace-new-relic-opentelemetry',
            title: 'APM Tools Landscape (Datadog, Dynatrace, New Relic, OpenTelemetry)',
            summary:
              'Master APM Tools Landscape (Datadog, Dynatrace, New Relic, OpenTelemetry) in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-4-5-why-qa-engineers-need-apm-knowle',
            moduleId: 'mod-apm-performance-4',
            courseId: 'course-apm-performance',
            slug: 'why-qa-engineers-need-apm-knowledge',
            title: 'Why QA Engineers Need APM Knowledge',
            summary:
              'Master Why QA Engineers Need APM Knowledge in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
        ],
      },
      {
        id: 'mod-apm-performance-5',
        courseId: 'course-apm-performance',
        slug: 'monitoring-metrics-and-diagnostics',
        title: 'Module 5: Monitoring Metrics and Diagnostics',
        description:
          'Analyzing CPU, memory, garbage collection pauses, thread contention, and slow SQL query bottlenecks.',
        lessons: [
          {
            id: 'les-apm-performance-5-1-cpu-and-memory-utilization',
            moduleId: 'mod-apm-performance-5',
            courseId: 'course-apm-performance',
            slug: 'cpu-and-memory-utilization',
            title: 'CPU and Memory Utilization',
            summary:
              'Master CPU and Memory Utilization in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-5-2-garbage-collection-analysis',
            moduleId: 'mod-apm-performance-5',
            courseId: 'course-apm-performance',
            slug: 'garbage-collection-analysis',
            title: 'Garbage Collection Analysis',
            summary:
              'Master Garbage Collection Analysis in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-5-3-thread-contention-and-deadlocks',
            moduleId: 'mod-apm-performance-5',
            courseId: 'course-apm-performance',
            slug: 'thread-contention-and-deadlocks',
            title: 'Thread Contention and Deadlocks',
            summary:
              'Master Thread Contention and Deadlocks in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-5-4-database-query-performance-and-s',
            moduleId: 'mod-apm-performance-5',
            courseId: 'course-apm-performance',
            slug: 'database-query-performance-and-slow-queries',
            title: 'Database Query Performance and Slow Queries',
            summary:
              'Master Database Query Performance and Slow Queries in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-5-5-network-latency-and-bottlenecks',
            moduleId: 'mod-apm-performance-5',
            courseId: 'course-apm-performance',
            slug: 'network-latency-and-bottlenecks',
            title: 'Network Latency and Bottlenecks',
            summary:
              'Master Network Latency and Bottlenecks in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
        ],
      },
      {
        id: 'mod-apm-performance-6',
        courseId: 'course-apm-performance',
        slug: 'performance-engineering-in-cicd',
        title: 'Module 6: Performance Engineering in CI/CD',
        description:
          'Shift-Left performance testing, automated threshold quality gates in CI/CD, and regression detection.',
        lessons: [
          {
            id: 'les-apm-performance-6-1-shift-left-performance-testing',
            moduleId: 'mod-apm-performance-6',
            courseId: 'course-apm-performance',
            slug: 'shift-left-performance-testing',
            title: 'Shift-Left Performance Testing',
            summary:
              'Master Shift-Left Performance Testing in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-6-2-automated-performance-gates-in-p',
            moduleId: 'mod-apm-performance-6',
            courseId: 'course-apm-performance',
            slug: 'automated-performance-gates-in-pipelines',
            title: 'Automated Performance Gates in Pipelines',
            summary:
              'Master Automated Performance Gates in Pipelines in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-6-3-baseline-comparison-and-regressi',
            moduleId: 'mod-apm-performance-6',
            courseId: 'course-apm-performance',
            slug: 'baseline-comparison-and-regression-detection',
            title: 'Baseline Comparison and Regression Detection',
            summary:
              'Master Baseline Comparison and Regression Detection in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-6-4-continuous-profiling',
            moduleId: 'mod-apm-performance-6',
            courseId: 'course-apm-performance',
            slug: 'continuous-profiling',
            title: 'Continuous Profiling',
            summary:
              'Master Continuous Profiling in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-6-5-alerting-and-anomaly-detection',
            moduleId: 'mod-apm-performance-6',
            courseId: 'course-apm-performance',
            slug: 'alerting-and-anomaly-detection',
            title: 'Alerting and Anomaly Detection',
            summary:
              'Master Alerting and Anomaly Detection in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
        ],
      },
      {
        id: 'mod-apm-performance-7',
        courseId: 'course-apm-performance',
        slug: 'enterprise-performance-best-practices',
        title: 'Module 7: Enterprise Performance Best Practices',
        description:
          'Production-like test environments, bottleneck troubleshooting methodology, capacity planning, and scalability.',
        lessons: [
          {
            id: 'les-apm-performance-7-1-performance-test-strategy-design',
            moduleId: 'mod-apm-performance-7',
            courseId: 'course-apm-performance',
            slug: 'performance-test-strategy-design',
            title: 'Performance Test Strategy Design',
            summary:
              'Master Performance Test Strategy Design in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-7-2-production-like-environment-sizi',
            moduleId: 'mod-apm-performance-7',
            courseId: 'course-apm-performance',
            slug: 'production-like-environment-sizing',
            title: 'Production-Like Environment Sizing',
            summary:
              'Master Production-Like Environment Sizing in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-7-3-performance-troubleshooting-meth',
            moduleId: 'mod-apm-performance-7',
            courseId: 'course-apm-performance',
            slug: 'performance-troubleshooting-methodology',
            title: 'Performance Troubleshooting Methodology',
            summary:
              'Master Performance Troubleshooting Methodology in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-7-4-capacity-planning',
            moduleId: 'mod-apm-performance-7',
            courseId: 'course-apm-performance',
            slug: 'capacity-planning',
            title: 'Capacity Planning',
            summary:
              'Master Capacity Planning in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
          {
            id: 'les-apm-performance-7-5-scalability-architecture-analysi',
            moduleId: 'mod-apm-performance-7',
            courseId: 'course-apm-performance',
            slug: 'scalability-architecture-analysis',
            title: 'Scalability Architecture Analysis',
            summary:
              'Master Scalability Architecture Analysis in enterprise software quality engineering and automated testing architectures.',
            estimatedReadingTime: 6,
          },
        ],
      },
    ],
    sortOrder: 8,
    status: 'published',
  },
];
