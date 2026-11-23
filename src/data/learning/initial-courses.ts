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
  modules: AcademyClientModule[];
}

export const INITIAL_PUBLISHED_COURSES: AcademyClientCourse[] = [
  {
    "id": "course-ai-qa-mastery",
    "slug": "ai-for-qa-mastery",
    "title": "AI Academy",
    "subtitle": "From LLM Prompt Evals to Autonomous Self-Healing Test Agents",
    "description": "A practical learning path for Software Test Engineers, QA Automation Engineers, SDETs and Test Architects to understand and implement Artificial Intelligence in Software Quality Engineering.",
    "level": "All Levels",
    "estimatedHours": 12,
    "modules": [
      {
        "id": "mod-intro-ai",
        "courseId": "course-ai-qa-mastery",
        "slug": "introduction-to-ai",
        "title": "Module 1 — Introduction to AI",
        "description": "Foundations of artificial intelligence, machine learning paradigms, generative models, transformer mechanics, and LLM token processing.",
        "lessons": [
          {
            "id": "les-what-is-ai",
            "moduleId": "mod-intro-ai",
            "courseId": "course-ai-qa-mastery",
            "slug": "what-is-artificial-intelligence",
            "title": "What is Artificial Intelligence?",
            "summary": "Foundational AI paradigms, symbolic reasoning, and deep neural networks in quality engineering.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-what-is-machine-learning",
            "moduleId": "mod-intro-ai",
            "courseId": "course-ai-qa-mastery",
            "slug": "what-is-machine-learning",
            "title": "What is Machine Learning?",
            "summary": "Supervised, unsupervised, and reinforcement learning applied to automated test classification and defect prediction.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-what-is-genai",
            "moduleId": "mod-intro-ai",
            "courseId": "course-ai-qa-mastery",
            "slug": "what-is-generative-ai",
            "title": "What is Generative AI?",
            "summary": "Diffusion models, autoregressive decoders, and multimodal generative pipelines for synthetic test asset synthesis.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-what-is-llm",
            "moduleId": "mod-intro-ai",
            "courseId": "course-ai-qa-mastery",
            "slug": "what-is-an-llm",
            "title": "What is an LLM?",
            "summary": "Large Language Model architectures, token probability distributions, and parameter scale dynamics in SDET workflows.",
            "estimatedReadingTime": 3
          },
          {
            "id": "les-how-llms-work",
            "moduleId": "mod-intro-ai",
            "courseId": "course-ai-qa-mastery",
            "slug": "how-llms-work",
            "title": "How LLMs Work",
            "summary": "Inference loops, next-token prediction, softmax sampling, top-p, and temperature tuning in test automation.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-transformer-architecture",
            "moduleId": "mod-intro-ai",
            "courseId": "course-ai-qa-mastery",
            "slug": "transformer-architecture",
            "title": "Transformer Architecture",
            "summary": "Multi-head self-attention, query-key-value vector matrices, feed-forward layers, and positional embeddings.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-tokens-embeddings-and-attention",
            "moduleId": "mod-intro-ai",
            "courseId": "course-ai-qa-mastery",
            "slug": "tokens-embeddings-and-attention",
            "title": "Tokens, Embeddings and Attention",
            "summary": "Byte-Pair Encoding, high-dimensional vector representations, cosine similarity, and contextual attention matrices.",
            "estimatedReadingTime": 5
          }
        ]
      },
      {
        "id": "mod-prompt-engineering",
        "courseId": "course-ai-qa-mastery",
        "slug": "prompt-engineering",
        "title": "Module 2 — Prompt Engineering",
        "description": "Systematic prompt design, few-shot patterns, reasoning chains, and deterministic test code synthesis.",
        "lessons": [
          {
            "id": "les-what-is-prompt-eng",
            "moduleId": "mod-prompt-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "what-is-prompt-engineering",
            "title": "What is Prompt Engineering?",
            "summary": "The discipline of structuring inputs to guide generative LLMs toward deterministic, high-accuracy test code output.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-anatomy-of-a-good-prompt",
            "moduleId": "mod-prompt-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "anatomy-of-a-good-prompt",
            "title": "Anatomy of a Good Prompt",
            "summary": "Role definitions, context framing, explicit constraints, input data boundaries, and output format schemas.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-zero-shot-prompting",
            "moduleId": "mod-prompt-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "zero-shot-prompting",
            "title": "Zero-shot Prompting",
            "summary": "Direct task instruction without demonstrations: strengths, limitations, and baseline testing prompts.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-few-shot-prompting",
            "moduleId": "mod-prompt-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "few-shot-prompting",
            "title": "Few-shot Prompting",
            "summary": "In-context exemplar pairs to anchor style, syntax compliance, and locator conventions in test generation.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-chain-of-thought-concepts",
            "moduleId": "mod-prompt-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "chain-of-thought-concepts",
            "title": "Chain-of-Thought Concepts",
            "summary": "Step-by-step reasoning elicitation for complex test scenario synthesis, edge case discovery, and test data derivation.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-prompt-best-practices",
            "moduleId": "mod-prompt-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "prompting-best-practices",
            "title": "Prompting Best Practices",
            "summary": "System prompt isolation, negative constraints, defensive escaping, and automated evaluation harnesses.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-common-prompting-mistakes",
            "moduleId": "mod-prompt-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "common-prompting-mistakes",
            "title": "Common Prompting Mistakes",
            "summary": "Ambiguous scopes, excessive temperature, conflicting instructions, and missing boundary constraints.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-adv-prompt-patterns",
            "moduleId": "mod-prompt-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "advanced-prompt-patterns",
            "title": "Advanced Prompt Patterns",
            "summary": "Production-grade prompt templates for Playwright POMs, REST Assured specs, Gherkin features, and test matrices.",
            "estimatedReadingTime": 5
          }
        ]
      },
      {
        "id": "mod-context-engineering",
        "courseId": "course-ai-qa-mastery",
        "slug": "context-engineering",
        "title": "Module 3 — Context Engineering",
        "description": "Context window optimization, system instructions, vector embeddings, and Retrieval-Augmented Generation (RAG).",
        "lessons": [
          {
            "id": "les-what-is-context-eng",
            "moduleId": "mod-context-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "what-is-context-engineering",
            "title": "What is Context Engineering?",
            "summary": "Dynamic information staging, semantic token budget allocation, and context retrieval for quality agents.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-context-window",
            "moduleId": "mod-context-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "context-window",
            "title": "Context Window",
            "summary": "Input/output token limits, context degradation, needle-in-a-haystack recall, and sliding window chunking.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-system-instructions",
            "moduleId": "mod-context-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "system-instructions",
            "title": "System Instructions",
            "summary": "Immutable persona guidelines, behavioral guardrails, and deterministic code constraints in SDET copilots.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-rag-architecture",
            "moduleId": "mod-context-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "rag-architecture",
            "title": "RAG Architecture",
            "summary": "Retrieval-Augmented Generation: Document chunking, vector indexing, dense retrieval, and augmented prompt synthesis.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-vector-databases",
            "moduleId": "mod-context-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "vector-databases",
            "title": "Vector Databases",
            "summary": "ChromaDB, Pinecone, and pgvector: indexing DOM snapshots, test failure logs, and enterprise API specifications.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-embeddings-and-retrieval",
            "moduleId": "mod-context-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "embeddings-and-retrieval",
            "title": "Embeddings and Retrieval",
            "summary": "Text embedding models, dense vector search, cosine distance thresholds, and reciprocal rank fusion (RRF).",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-context-management",
            "moduleId": "mod-context-engineering",
            "courseId": "course-ai-qa-mastery",
            "slug": "context-management",
            "title": "Context Management",
            "summary": "Deduplication, hierarchical context summarization, metadata filtering, and token cache optimization.",
            "estimatedReadingTime": 5
          }
        ]
      },
      {
        "id": "mod-mcp",
        "courseId": "course-ai-qa-mastery",
        "slug": "model-context-protocol",
        "title": "Module 4 — Model Context Protocol (MCP)",
        "description": "Standardized client-host-server protocol for exposing development tools, databases, and test frameworks to AI models.",
        "lessons": [
          {
            "id": "les-what-is-mcp",
            "moduleId": "mod-mcp",
            "courseId": "course-ai-qa-mastery",
            "slug": "what-is-mcp",
            "title": "What is MCP?",
            "summary": "The open Model Context Protocol standard: eliminating point-to-point tool integrations for autonomous AI agents.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-why-mcp-is-needed",
            "moduleId": "mod-mcp",
            "courseId": "course-ai-qa-mastery",
            "slug": "why-mcp-is-needed",
            "title": "Why MCP is Needed",
            "summary": "The M×N integration problem between LLM hosts and software development toolchains in automated testing.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-mcp-arch",
            "moduleId": "mod-mcp",
            "courseId": "course-ai-qa-mastery",
            "slug": "mcp-architecture",
            "title": "MCP Architecture",
            "summary": "Host-Client-Server topology, JSON-RPC 2.0 transport layers (stdio and Server-Sent Events), and protocol lifecycle.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-mcp-host-client-and-server",
            "moduleId": "mod-mcp",
            "courseId": "course-ai-qa-mastery",
            "slug": "mcp-host-client-and-server",
            "title": "MCP Host, Client and Server",
            "summary": "Responsibilities of hosts (IDEs/Agents), clients (session managers), and servers (tool/resource providers).",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-resources-tools-and-prompts",
            "moduleId": "mod-mcp",
            "courseId": "course-ai-qa-mastery",
            "slug": "resources-tools-and-prompts",
            "title": "Resources, Tools and Prompts",
            "summary": "The three core primitives of MCP: read-only resources, callable tools, and standardized prompt templates.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-mcp-communication-flow",
            "moduleId": "mod-mcp",
            "courseId": "course-ai-qa-mastery",
            "slug": "mcp-communication-flow",
            "title": "MCP Communication Flow",
            "summary": "Initialization handshakes, tool listing, sampling requests, progress reporting, and notification streams.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-create-mcp-server",
            "moduleId": "mod-mcp",
            "courseId": "course-ai-qa-mastery",
            "slug": "creating-custom-mcp-servers",
            "title": "Creating Custom MCP Servers",
            "summary": "Step-by-step TypeScript/Python MCP server authoring exposing Playwright runners, database queries, and log parsers.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-connect-ext-tools",
            "moduleId": "mod-mcp",
            "courseId": "course-ai-qa-mastery",
            "slug": "connecting-external-tools",
            "title": "Connecting External Tools",
            "summary": "Integrating Jira, GitHub, Postman, Selenium Grid, and CloudWatch into agentic QA workflows via MCP.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-mcp-security-best-practices",
            "moduleId": "mod-mcp",
            "courseId": "course-ai-qa-mastery",
            "slug": "mcp-security-best-practices",
            "title": "MCP Security Best Practices",
            "summary": "Permission boundaries, tool execution sandboxing, input parameter validation, and rate limiting.",
            "estimatedReadingTime": 5
          }
        ]
      },
      {
        "id": "mod-ai-agents",
        "courseId": "course-ai-qa-mastery",
        "slug": "ai-agents-for-qa",
        "title": "Module 5 — AI Agents for QA",
        "description": "Autonomous reasoning loops, tool invocation, multi-agent systems, and self-directing quality engineering agents.",
        "lessons": [
          {
            "id": "les-what-are-agents",
            "moduleId": "mod-ai-agents",
            "courseId": "course-ai-qa-mastery",
            "slug": "what-are-ai-agents",
            "title": "What are AI Agents?",
            "summary": "Autonomous software entities pairing LLM reasoning with perception, working memory, and tool actuation capabilities.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-agentic-testing",
            "moduleId": "mod-ai-agents",
            "courseId": "course-ai-qa-mastery",
            "slug": "agentic-testing",
            "title": "Agentic Testing",
            "summary": "Perceive-Plan-Act-Reflect loops, ReAct patterns, long-term memory, and goal-directed state machines.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-ai-agent-vs-traditional-automation",
            "moduleId": "mod-ai-agents",
            "courseId": "course-ai-qa-mastery",
            "slug": "ai-agent-vs-traditional-automation",
            "title": "AI Agent vs Traditional Automation",
            "summary": "Static procedural execution scripts versus dynamic adaptive goal resolution in flakiness reduction.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-tool-calling",
            "moduleId": "mod-ai-agents",
            "courseId": "course-ai-qa-mastery",
            "slug": "tool-calling",
            "title": "Tool Calling",
            "summary": "JSON Schema tool contracts, function argument generation, execution callbacks, and error recovery loops.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-multi-agent-systems",
            "moduleId": "mod-ai-agents",
            "courseId": "course-ai-qa-mastery",
            "slug": "multi-agent-systems",
            "title": "Multi-Agent Systems",
            "summary": "Specialized agent orchestration: Test Planner, Code Synthesizer, Locator Healer, and RCA Investigator swarms.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-building-qa-agents",
            "moduleId": "mod-ai-agents",
            "courseId": "course-ai-qa-mastery",
            "slug": "building-qa-automation-agents",
            "title": "Building QA Automation Agents",
            "summary": "End-to-end implementation of an autonomous agent navigating web apps, detecting defects, and reporting issues.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-ai-powered-test-case-generation",
            "moduleId": "mod-ai-agents",
            "courseId": "course-ai-qa-mastery",
            "slug": "ai-powered-test-case-generation",
            "title": "AI-Powered Test Case Generation",
            "summary": "Autonomous derivation of edge cases, pairwise parameter combinations, and executable test suites from requirements.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-ai-powered-test-failure-analysis",
            "moduleId": "mod-ai-agents",
            "courseId": "course-ai-qa-mastery",
            "slug": "ai-powered-test-failure-analysis",
            "title": "AI-Powered Test Failure Analysis",
            "summary": "Automated correlation of stack traces, network telemetry, and visual snapshots to diagnose root cause.",
            "estimatedReadingTime": 5
          }
        ]
      },
      {
        "id": "mod-ai-automation",
        "courseId": "course-ai-qa-mastery",
        "slug": "ai-powered-test-automation",
        "title": "Module 6 — AI-Powered Test Automation",
        "description": "Practical application of AI across Selenium, Playwright, API testing, synthetic data, and self-healing automation.",
        "lessons": [
          {
            "id": "les-ai-with-selenium",
            "moduleId": "mod-ai-automation",
            "courseId": "course-ai-qa-mastery",
            "slug": "ai-with-selenium",
            "title": "AI with Selenium",
            "summary": "Augmenting Selenium WebDriver 4 with LLM-based element discovery, dynamic waits, and automated Page Object synthesis.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-ai-with-playwright",
            "moduleId": "mod-ai-automation",
            "courseId": "course-ai-qa-mastery",
            "slug": "ai-with-playwright",
            "title": "AI with Playwright",
            "summary": "Leveraging Playwright's auto-waiting and CDP protocol alongside AI agents for resilient web testing.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-ai-api-testing",
            "moduleId": "mod-ai-automation",
            "courseId": "course-ai-qa-mastery",
            "slug": "ai-api-testing",
            "title": "AI API Testing",
            "summary": "OpenAPI schema-driven test generation, intelligent payload mutation, and automated contract drift detection.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-ai-test-data-generation",
            "moduleId": "mod-ai-automation",
            "courseId": "course-ai-qa-mastery",
            "slug": "ai-test-data-generation",
            "title": "AI Test Data Generation",
            "summary": "Synthesizing production-realistic, GDPR-compliant relational test data using generative models.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-ai-test-case-optimization",
            "moduleId": "mod-ai-automation",
            "courseId": "course-ai-qa-mastery",
            "slug": "ai-test-case-optimization",
            "title": "AI Test Case Optimization",
            "summary": "Test suite reduction, flakiness scoring, risk-based test selection, and regression minimization algorithms.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-self-healing-test-automation",
            "moduleId": "mod-ai-automation",
            "courseId": "course-ai-qa-mastery",
            "slug": "self-healing-test-automation",
            "title": "Self-Healing Test Automation",
            "summary": "Multi-attribute weighted distance algorithms for locator healing in dynamic DOM environments without test failure.",
            "estimatedReadingTime": 5
          },
          {
            "id": "les-ai-based-root-cause-analysis",
            "moduleId": "mod-ai-automation",
            "courseId": "course-ai-qa-mastery",
            "slug": "ai-based-root-cause-analysis",
            "title": "AI-Based Root Cause Analysis",
            "summary": "Correlating CI/CD pipeline logs, container metrics, and application traces to isolate defect origins automatically.",
            "estimatedReadingTime": 5
          }
        ]
      }
    ]
  },
  {
    "id": "course-selenium-mastery",
    "slug": "selenium-webdriver-enterprise",
    "title": "Selenium WebDriver 4 Enterprise Framework Architecture",
    "subtitle": "Production-Grade Java Test Automation Frameworks",
    "description": "Deep dive into WebDriver 4 W3C protocol, dynamic wait strategies, ThreadLocal thread safety, and scalable Page Object Models.",
    "level": "Intermediate",
    "estimatedHours": 24,
    "modules": [
      {
        "id": "mod-sel-1",
        "courseId": "course-selenium-mastery",
        "slug": "module-1-core-java-oops-for-automation",
        "title": "Module 1: Core Java OOPs for Automation",
        "description": "Enterprise automation practices for Module 1: Core Java OOPs for Automation.",
        "lessons": [
          {
            "id": "les-sel-java-oops-framework",
            "moduleId": "mod-sel-1",
            "courseId": "course-selenium-mastery",
            "slug": "java-oops-framework",
            "title": "1. Core Java OOPs for Automation",
            "summary": "Map Encapsulation, Inheritance, Polymorphism, and Abstraction directly to QA framework architecture.",
            "estimatedReadingTime": 10
          },
          {
            "id": "les-sel-sel-webdriver-setup",
            "moduleId": "mod-sel-1",
            "courseId": "course-selenium-mastery",
            "slug": "sel-webdriver-setup",
            "title": "2. WebDriver 4 Architecture & Browser Setup",
            "summary": "W3C standardization, Selenium Manager automated binary resolution, ChromeOptions, and headless execution.",
            "estimatedReadingTime": 10
          },
          {
            "id": "les-sel-sel-locators-xpath",
            "moduleId": "mod-sel-1",
            "courseId": "course-selenium-mastery",
            "slug": "sel-locators-xpath",
            "title": "3. Advanced Dynamic Locators (XPath & CSS)",
            "summary": "Master relative XPath axes (following-sibling, ancestor, parent), text normalization, and robust CSS selectors.",
            "estimatedReadingTime": 12
          }
        ]
      },
      {
        "id": "mod-sel-2",
        "courseId": "course-selenium-mastery",
        "slug": "module-2-selenium-4-webdriver-setup-locators",
        "title": "Module 2: Selenium 4 WebDriver Setup & Locators",
        "description": "Enterprise automation practices for Module 2: Selenium 4 WebDriver Setup & Locators.",
        "lessons": [
          {
            "id": "les-sel-sel-webelement-actions",
            "moduleId": "mod-sel-2",
            "courseId": "course-selenium-mastery",
            "slug": "sel-webelement-actions",
            "title": "4. WebElement Actions & Form Interactions",
            "summary": "Handling inputs, select dropdowns (single/multi-select), checkboxes, radio buttons, and JavaScript clicks.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-sel-sel-sync-waits",
            "moduleId": "mod-sel-2",
            "courseId": "course-selenium-mastery",
            "slug": "sel-sync-waits",
            "title": "5. Synchronization & Dynamic Waits Strategy",
            "summary": "Eliminate flakiness: Implicit vs Explicit vs FluentWait. Solving StaleElementReferenceException.",
            "estimatedReadingTime": 12
          },
          {
            "id": "les-sel-sel-actions-api",
            "moduleId": "mod-sel-2",
            "courseId": "course-selenium-mastery",
            "slug": "sel-actions-api",
            "title": "6. Advanced User Interactions (Actions API)",
            "summary": "Master mouse hover, context-click (right-click), drag and drop, and keyboard shortcuts with Actions class.",
            "estimatedReadingTime": 8
          }
        ]
      },
      {
        "id": "mod-sel-3",
        "courseId": "course-selenium-mastery",
        "slug": "module-3-dynamic-waits-synchronization-frames",
        "title": "Module 3: Dynamic Waits, Synchronization & Frames",
        "description": "Enterprise automation practices for Module 3: Dynamic Waits, Synchronization & Frames.",
        "lessons": [
          {
            "id": "les-sel-sel-frames-windows-shadow",
            "moduleId": "mod-sel-3",
            "courseId": "course-selenium-mastery",
            "slug": "sel-frames-windows-shadow",
            "title": "7. Frames, Windows & Shadow DOM Handling",
            "summary": "Navigate nested iframes, switch between multi-browser tabs/windows, and pierce native Shadow DOM in Selenium 4.",
            "estimatedReadingTime": 10
          },
          {
            "id": "les-sel-sel-pom-pagefactory",
            "moduleId": "mod-sel-3",
            "courseId": "course-selenium-mastery",
            "slug": "sel-pom-pagefactory",
            "title": "8. Page Object Model & PageFactory Architecture",
            "summary": "Architect scalable test frameworks: By locators vs @FindBy PageFactory annotations, method chaining, and clean separation.",
            "estimatedReadingTime": 14
          },
          {
            "id": "les-sel-sel-testng-parallel",
            "moduleId": "mod-sel-3",
            "courseId": "course-selenium-mastery",
            "slug": "sel-testng-parallel",
            "title": "9. TestNG Suite & Parallel Multi-Threading",
            "summary": "Master testng.xml, @DataProvider for data-driven testing, @Parameters, ThreadLocal<WebDriver>, and parallel suites.",
            "estimatedReadingTime": 12
          }
        ]
      },
      {
        "id": "mod-sel-4",
        "courseId": "course-selenium-mastery",
        "slug": "module-4-enterprise-page-object-model-grids",
        "title": "Module 4: Enterprise Page Object Model & Grids",
        "description": "Enterprise automation practices for Module 4: Enterprise Page Object Model & Grids.",
        "lessons": [
          {
            "id": "les-sel-sel-listeners-reports-cicd",
            "moduleId": "mod-sel-4",
            "courseId": "course-selenium-mastery",
            "slug": "sel-listeners-reports-cicd",
            "title": "10. Listeners, Screenshots & Maven CI/CD Execution",
            "summary": "Implement ITestListener, automatic screenshot capture on test failure, ExtentReports / Allure, and Maven CI/CD integration.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-sel-sel-dynamic-waits",
            "moduleId": "mod-sel-4",
            "courseId": "course-selenium-mastery",
            "slug": "sel-dynamic-waits",
            "title": "11. Dynamic Synchronization: Explicit vs FluentWait vs Thread.sleep",
            "summary": "Master dynamic synchronization to eliminate flaky tests, configure WebDriverWait, customize FluentWait polling intervals, and replace brittle sleep calls.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-sel-sel-threadlocal-driver",
            "moduleId": "mod-sel-4",
            "courseId": "course-selenium-mastery",
            "slug": "sel-threadlocal-driver",
            "title": "12. ThreadLocal WebDriver for Parallel Test Execution",
            "summary": "Design thread-safe WebDriver architectures for multi-threaded parallel execution in TestNG and CI/CD pipelines.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-sel-sel-pom-pattern",
            "moduleId": "mod-sel-4",
            "courseId": "course-selenium-mastery",
            "slug": "sel-pom-pattern",
            "title": "13. Page Object Model (POM) & Component Architecture",
            "summary": "Build scalable, maintainable test architectures by cleanly decoupling page locators and user actions from assertions.",
            "estimatedReadingTime": 8
          }
        ]
      }
    ]
  },
  {
    "id": "course-playwright-mastery",
    "slug": "playwright-ts-mastery",
    "title": "Playwright Automation with TypeScript",
    "subtitle": "Modern End-to-End Testing for Web Applications",
    "description": "Learn Playwright from scratch: auto-waiting, isolated browser contexts, parallel execution, API mocking, and Trace Viewer debugging.",
    "level": "Beginner",
    "estimatedHours": 20,
    "modules": [
      {
        "id": "mod-pw-1",
        "courseId": "course-playwright-mastery",
        "slug": "module-1-modern-web-automation-fundamentals",
        "title": "Module 1: Modern Web Automation Fundamentals",
        "description": "Modern end-to-end testing with Module 1: Modern Web Automation Fundamentals.",
        "lessons": [
          {
            "id": "les-pw-pw-ts-basics",
            "moduleId": "mod-pw-1",
            "courseId": "course-playwright-mastery",
            "slug": "pw-ts-basics",
            "title": "1. Playwright Architecture & Browser Context",
            "summary": "Understand Browser vs BrowserContext vs Page, why BrowserContext provides 10ms incognito isolation, and why never to open multiple pages in the same context.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-pw-pw-locator-vs-elementhandle",
            "moduleId": "mod-pw-1",
            "courseId": "course-playwright-mastery",
            "slug": "pw-locator-vs-elementhandle",
            "title": "2. Modern Locators vs page.$() & ElementHandle",
            "summary": "Why modern SDETs never use page.$() or ElementHandle: lazy evaluation, auto-waiting, strict mode, and eliminating StaleElementReference errors.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-pw-pw-getbyrole-vs-testid",
            "moduleId": "mod-pw-1",
            "courseId": "course-playwright-mastery",
            "slug": "pw-getbyrole-vs-testid",
            "title": "3. Locator Strategy: getByRole() vs data-testid",
            "summary": "Master user-facing accessible locators via getByRole, understand the Accessibility Tree, and learn when data-testid is strictly necessary.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-pw-pw-auto-waiting",
            "moduleId": "mod-pw-1",
            "courseId": "course-playwright-mastery",
            "slug": "pw-auto-waiting",
            "title": "4. Auto-Waiting Mechanics & Web-First Assertions",
            "summary": "Why Playwright tests never need sleep: 5 actionability checks (visible, stable, enabled, editable, receiving pointer events) and expect() polling.",
            "estimatedReadingTime": 8
          }
        ]
      },
      {
        "id": "mod-pw-2",
        "courseId": "course-playwright-mastery",
        "slug": "module-2-auto-waiting-network-interception-mocking",
        "title": "Module 2: Auto-Waiting, Network Interception & Mocking",
        "description": "Modern end-to-end testing with Module 2: Auto-Waiting, Network Interception & Mocking.",
        "lessons": [
          {
            "id": "les-pw-pw-config-management",
            "moduleId": "mod-pw-2",
            "courseId": "course-playwright-mastery",
            "slug": "pw-config-management",
            "title": "5. Enterprise Config Management (playwright.config.ts)",
            "summary": "Architect enterprise configuration: multi-environment dotenv (.env.staging, .env.prod), timeouts hierarchy, project browser matrices, and reporters.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-pw-pw-fixtures-architecture",
            "moduleId": "mod-pw-2",
            "courseId": "course-playwright-mastery",
            "slug": "pw-fixtures-architecture",
            "title": "6. Test Fixtures vs Worker Fixtures vs Custom Fixtures",
            "summary": "Understand fixture scopes, worker-scoped resource pooling (DB/API connections), test-scoped isolation, and custom fixture extensions with yield.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-pw-pw-storagestate-auth",
            "moduleId": "mod-pw-2",
            "courseId": "course-playwright-mastery",
            "slug": "pw-storagestate-auth",
            "title": "7. Authentication & storageState Implementation",
            "summary": "Capture login cookies and localStorage once into .auth/user.json, bypassing login UI across hundreds of regression tests for 10x execution speed.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-pw-pw-framework-from-scratch",
            "moduleId": "mod-pw-2",
            "courseId": "course-playwright-mastery",
            "slug": "pw-framework-from-scratch",
            "title": "8. Designing an Enterprise Playwright Framework from Scratch",
            "summary": "Full architectural blueprint: directory structure, Page Object Model + Fixtures Dependency Injection, BasePage utilities, and typed test data.",
            "estimatedReadingTime": 8
          }
        ]
      },
      {
        "id": "mod-pw-3",
        "courseId": "course-playwright-mastery",
        "slug": "module-3-advanced-contexts-multi-tab-storage-state",
        "title": "Module 3: Advanced Contexts, Multi-Tab & Storage State",
        "description": "Modern end-to-end testing with Module 3: Advanced Contexts, Multi-Tab & Storage State.",
        "lessons": [
          {
            "id": "les-pw-pw-api-mocking-framework",
            "moduleId": "mod-pw-3",
            "courseId": "course-playwright-mastery",
            "slug": "pw-api-mocking-framework",
            "title": "9. API Mocking & Network Interception in Framework Code",
            "summary": "Intercept network traffic with page.route(), implement a reusable NetworkMockManager, simulate 500 errors, network latency, and replay HAR files.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-pw-pw-independent-tests-apis",
            "moduleId": "mod-pw-3",
            "courseId": "course-playwright-mastery",
            "slug": "pw-independent-tests-apis",
            "title": "10. Designing 100% Independent Tests Using Fixtures and APIs",
            "summary": "Eliminate test inter-dependencies: UI for target feature verification, fast REST API fixtures for instant preconditions and deterministic teardown.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-pw-pw-parallel-test-data",
            "moduleId": "mod-pw-3",
            "courseId": "course-playwright-mastery",
            "slug": "pw-parallel-test-data",
            "title": "11. Managing Test Data in High-Concurrency Parallel Execution",
            "summary": "Prevent shared data collisions: worker-partitioned datasets using workerIndex, dynamic UUID data factories, and immutable seed strategies.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-pw-pw-retry-philosophy",
            "moduleId": "mod-pw-3",
            "courseId": "course-playwright-mastery",
            "slug": "pw-retry-philosophy",
            "title": "12. Playwright Retry Philosophy & Flakiness Elimination",
            "summary": "Why 0 retries locally and 2 in CI: worker process termination on failure, root-cause flakiness analysis, and flaky test quarantine strategies.",
            "estimatedReadingTime": 8
          }
        ]
      },
      {
        "id": "mod-pw-4",
        "courseId": "course-playwright-mastery",
        "slug": "module-4-scalable-page-object-model-ci-sharding",
        "title": "Module 4: Scalable Page Object Model & CI Sharding",
        "description": "Modern end-to-end testing with Module 4: Scalable Page Object Model & CI Sharding.",
        "lessons": [
          {
            "id": "les-pw-pw-trace-retention",
            "moduleId": "mod-pw-4",
            "courseId": "course-playwright-mastery",
            "slug": "pw-trace-retention",
            "title": "13. Trace Retention Strategy & Production Debugging",
            "summary": "Zero storage overhead for passing tests: configuring trace: 'on-first-retry', S3/blob artifact upload pipelines, and deep debugging in Trace Viewer.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-pw-pw-sharding-architecture",
            "moduleId": "mod-pw-4",
            "courseId": "course-playwright-mastery",
            "slug": "pw-sharding-architecture",
            "title": "14. Playwright Test Sharding Architecture",
            "summary": "Divide test suites horizontally across cloud runners with --shard=x/y and GitHub Actions matrix strategy for linear pipeline acceleration.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-pw-pw-sharding-realtime-challenges",
            "moduleId": "mod-pw-4",
            "courseId": "course-playwright-mastery",
            "slug": "pw-sharding-realtime-challenges",
            "title": "15. Real-Time Challenges in Test Sharding & Architectural Solutions",
            "summary": "Solve uneven shard runtimes (stragglers), shared database bottlenecks, matrix fail-fast cancellations, and merging blob reports with merge-reports.",
            "estimatedReadingTime": 8
          }
        ]
      }
    ]
  },
  {
    "id": "course-rest-assured",
    "slug": "rest-assured-api-automation",
    "title": "REST Assured: Enterprise API Automation with Java",
    "subtitle": "From RequestSpecBuilder to JSON Schema & Contract Validation",
    "description": "Learn REST Assured for automating RESTful microservices: authentication, OAuth2, POJO serialization with Jackson, and JSON schema assertions.",
    "level": "Intermediate",
    "estimatedHours": 18,
    "modules": [
      {
        "id": "mod-ra-1",
        "courseId": "course-rest-assured",
        "slug": "module-1-http-protocols-rest-assured-fundamentals",
        "title": "Module 1: HTTP Protocols & REST Assured Fundamentals",
        "description": "API test automation with Module 1: HTTP Protocols & REST Assured Fundamentals.",
        "lessons": [
          {
            "id": "les-ra-api-rest-basics",
            "moduleId": "mod-ra-1",
            "courseId": "course-rest-assured",
            "slug": "api-rest-basics",
            "title": "1. REST Fundamentals & Postman Transition",
            "summary": "Understand HTTP request headers, query parameters, path params, status codes, and mapping Postman collections to code.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-ra-api-given-when-then",
            "moduleId": "mod-ra-1",
            "courseId": "course-rest-assured",
            "slug": "api-given-when-then",
            "title": "2. Given-When-Then BDD Syntax & Requests",
            "summary": "Master the Given (preconditions), When (actions), Then (assertions) BDD pattern in automated API tests.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-ra-api-rest-crud",
            "moduleId": "mod-ra-1",
            "courseId": "course-rest-assured",
            "slug": "api-rest-crud",
            "title": "3. CRUD Operations & Status Code Assertions",
            "summary": "Automate complete entity lifecycles: POST (Create), GET (Read), PUT/PATCH (Update), DELETE with 200, 201, 204, 404 assertions.",
            "estimatedReadingTime": 10
          }
        ]
      },
      {
        "id": "mod-ra-2",
        "courseId": "course-rest-assured",
        "slug": "module-2-authentication-oauth2-specifications",
        "title": "Module 2: Authentication, OAuth2 & Specifications",
        "description": "API test automation with Module 2: Authentication, OAuth2 & Specifications.",
        "lessons": [
          {
            "id": "les-ra-api-request-specs",
            "moduleId": "mod-ra-2",
            "courseId": "course-rest-assured",
            "slug": "api-request-specs",
            "title": "4. Request & Response Specification Reusability",
            "summary": "Eliminate duplicate headers: build reusable RequestSpecBuilder and ResponseSpecBuilder instances for framework modularity.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-ra-api-json-path",
            "moduleId": "mod-ra-2",
            "courseId": "course-rest-assured",
            "slug": "api-json-path",
            "title": "5. JSONPath Querying & Deep Payload Validation",
            "summary": "Extract nested attributes, parse arrays, filter collections with Groovy expressions (findAll, collect), and assert schema nodes.",
            "estimatedReadingTime": 10
          },
          {
            "id": "les-ra-api-pojo-serialization",
            "moduleId": "mod-ra-2",
            "courseId": "course-rest-assured",
            "slug": "api-pojo-serialization",
            "title": "6. POJO Serialization & Deserialization (Jackson)",
            "summary": "Type-safe API automation: Jackson object mapping, builder pattern for test data payloads, and deserializing responses into Java models.",
            "estimatedReadingTime": 10
          }
        ]
      },
      {
        "id": "mod-ra-3",
        "courseId": "course-rest-assured",
        "slug": "module-3-json-schema-pojo-serialization-framework-design",
        "title": "Module 3: JSON Schema, POJO Serialization & Framework Design",
        "description": "API test automation with Module 3: JSON Schema, POJO Serialization & Framework Design.",
        "lessons": [
          {
            "id": "les-ra-api-auth-tokens",
            "moduleId": "mod-ra-3",
            "courseId": "course-rest-assured",
            "slug": "api-auth-tokens",
            "title": "7. Auth Tokens (JWT, OAuth2 & API Keys)",
            "summary": "Automate authentication flows: logging in to extract JWT tokens, refreshing expired tokens, and injecting Bearer headers.",
            "estimatedReadingTime": 10
          },
          {
            "id": "les-ra-api-schema-validation",
            "moduleId": "mod-ra-3",
            "courseId": "course-rest-assured",
            "slug": "api-schema-validation",
            "title": "8. JSON Schema Validation & CI/CD Regression",
            "summary": "Enforce API contract stability: validate response schemas against JSON Schema Draft v7 to catch breaking API changes before production.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-ra-api-json-schema",
            "moduleId": "mod-ra-3",
            "courseId": "course-rest-assured",
            "slug": "api-json-schema",
            "title": "9. JSON Schema Validation & Contract Testing",
            "summary": "Verify API response payloads against strict JSON schema definitions to catch breaking contract regressions before clients fail.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-ra-api-req-res-spec",
            "moduleId": "mod-ra-3",
            "courseId": "course-rest-assured",
            "slug": "api-req-res-spec",
            "title": "10. RequestSpecification & ResponseSpecification Architecture",
            "summary": "Build clean, reusable API automation suites using specifications to eliminate boilerplate header and auth configuration.",
            "estimatedReadingTime": 8
          }
        ]
      }
    ]
  },
  {
    "id": "course-api-testing",
    "slug": "api-testing-and-contracts",
    "title": "Full-Stack API Testing & Consumer-Driven Contracts",
    "subtitle": "Postman, Newman, Pact, and OpenAPI Schema Verification",
    "description": "Comprehensive guide to testing distributed microservices, REST APIs, GraphQL endpoints, and consumer-driven contracts.",
    "level": "All Levels",
    "estimatedHours": 16,
    "modules": [
      {
        "id": "mod-apifull-1",
        "courseId": "course-api-testing",
        "slug": "contract-testing-principles",
        "title": "Module 1: Consumer-Driven Contracts with Pact",
        "description": "Prevent microservice integration breaking changes using Pact contract definitions.",
        "lessons": [
          {
            "id": "les-consumer-driven-contracts-with-pact",
            "moduleId": "mod-apifull-1",
            "courseId": "course-api-testing",
            "slug": "consumer-driven-contracts-with-pact",
            "title": "1.1 Consumer-Driven Contracts with Pact",
            "summary": "Write consumer expectations in code and generate contract JSON files for provider verification.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-pact-provider-verification-contracts",
            "moduleId": "mod-apifull-1",
            "courseId": "course-api-testing",
            "slug": "pact-provider-verification-contracts",
            "title": "1.2 Provider Verification & Breaking Changes",
            "summary": "Run automated provider verification in CI pipelines against published Pact contracts.",
            "estimatedReadingTime": 8
          }
        ]
      },
      {
        "id": "mod-apifull-2",
        "courseId": "course-api-testing",
        "slug": "wiremock-and-k6-performance",
        "title": "Module 2: WireMock Stubs & k6 Performance Benchmarking",
        "description": "Isolate upstream dependencies with WireMock stubs and enforce SLOs with k6 scripts.",
        "lessons": [
          {
            "id": "les-wiremock-api-mocking-stubs",
            "moduleId": "mod-apifull-2",
            "courseId": "course-api-testing",
            "slug": "wiremock-api-mocking-stubs",
            "title": "2.1 WireMock Dynamic Stubs & Fault Injection",
            "summary": "Simulate slow network latency, 503 gateway outages, and dynamic responses.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-k6-api-performance-benchmarks",
            "moduleId": "mod-apifull-2",
            "courseId": "course-api-testing",
            "slug": "k6-api-performance-benchmarks",
            "title": "2.2 k6 Performance Benchmarking & Error Budgets",
            "summary": "Validate p95 latency thresholds and error rates under concurrent virtual user load.",
            "estimatedReadingTime": 8
          }
        ]
      }
    ]
  },
  {
    "id": "course-appium",
    "slug": "appium-mobile-automation",
    "title": "Appium 2.0 Mobile Automation Masterclass",
    "subtitle": "Cross-Platform Automation for Android and iOS",
    "description": "Master Appium 2.0 modular driver architecture, UiAutomator2, XCUITest, mobile gestures, and device cloud integration.",
    "level": "Intermediate",
    "estimatedHours": 20,
    "modules": [
      {
        "id": "mod-app-1",
        "courseId": "course-appium",
        "slug": "appium-2-modular-ecosystem",
        "title": "Module 1: Appium 2.0 Architecture & Driver Setup",
        "description": "Master decoupled Appium 2.0 CLI drivers, UiAutomator2, and XCUITest engines.",
        "lessons": [
          {
            "id": "les-appium-2-modular-ecosystem",
            "moduleId": "mod-app-1",
            "courseId": "course-appium",
            "slug": "appium-2-modular-ecosystem",
            "title": "1.1 Appium 2.0 Modular Drivers & Plugins",
            "summary": "Understand independent driver lifecycle, CLI management, and plugin architecture.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-android-ios-driver-capabilities",
            "moduleId": "mod-app-1",
            "courseId": "course-appium",
            "slug": "android-ios-driver-capabilities",
            "title": "1.2 UiAutomator2 & XCUITest Capabilities Matrix",
            "summary": "Configure W3C compliant capabilities for real devices, emulators, and cloud farms.",
            "estimatedReadingTime": 8
          }
        ]
      },
      {
        "id": "mod-app-2",
        "courseId": "course-appium",
        "slug": "mobile-gestures-and-pom",
        "title": "Module 2: W3C Mobile Gestures & Framework Design",
        "description": "Master pointer action swipes, pinch-to-zoom, and Page Object Models for native apps.",
        "lessons": [
          {
            "id": "les-w3c-mobile-actions-gestures",
            "moduleId": "mod-app-2",
            "courseId": "course-appium",
            "slug": "w3c-mobile-actions-gestures",
            "title": "2.1 W3C Pointer Actions & Smooth Scrolling",
            "summary": "Zero-flake mobile gesture automation without brittle absolute coordinate taps.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-mobile-page-object-model",
            "moduleId": "mod-app-2",
            "courseId": "course-appium",
            "slug": "mobile-page-object-model",
            "title": "2.2 Mobile Page Object Model & Cloud Execution",
            "summary": "Structure scalable cross-platform Android/iOS tests running on BrowserStack and Sauce Labs.",
            "estimatedReadingTime": 8
          }
        ]
      }
    ]
  },
  {
    "id": "course-github-actions",
    "slug": "github-actions-for-qa",
    "title": "GitHub Actions: CI/CD Pipelines for QA Automation",
    "subtitle": "Automated Test Matrix, Artifact Uploads & PR Gates",
    "description": "Design robust CI/CD workflows for executing Playwright, Selenium, and API tests on every pull request with rich HTML reports.",
    "level": "Beginner",
    "estimatedHours": 14,
    "modules": [
      {
        "id": "mod-gha-1",
        "courseId": "course-github-actions",
        "slug": "github-actions-workflows-triggers",
        "title": "Module 1: Workflow Triggers & Parallel Execution",
        "description": "Build enterprise CI pipelines that trigger on PRs and run tests concurrently.",
        "lessons": [
          {
            "id": "les-pr-test-gate-workflow",
            "moduleId": "mod-gha-1",
            "courseId": "course-github-actions",
            "slug": "pr-test-gate-workflow",
            "title": "1.1 Building a PR Quality Gate Workflow",
            "summary": "Trigger fast smoke tests on PRs to block broken merges before they hit main.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-matrix-sharding-execution",
            "moduleId": "mod-gha-1",
            "courseId": "course-github-actions",
            "slug": "matrix-sharding-execution",
            "title": "1.2 Matrix Builds & Playwright Sharding",
            "summary": "Slash regression test time from 45 minutes to 5 minutes using 8-way matrix shards.",
            "estimatedReadingTime": 8
          }
        ]
      },
      {
        "id": "mod-gha-2",
        "courseId": "course-github-actions",
        "slug": "secrets-artifacts-reporting",
        "title": "Module 2: Secrets, Artifacts & Test Reporting",
        "description": "Secure credentials, publish JUnit reports, and deploy interactive Allure test dashboards.",
        "lessons": [
          {
            "id": "les-github-secrets-env-management",
            "moduleId": "mod-gha-2",
            "courseId": "course-github-actions",
            "slug": "github-secrets-env-management",
            "title": "2.1 Secrets Management & Dynamic Environment Variables",
            "summary": "Inject staging passwords and API keys without leaking plain-text credentials in logs.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-test-artifacts-allure-deployments",
            "moduleId": "mod-gha-2",
            "courseId": "course-github-actions",
            "slug": "test-artifacts-allure-deployments",
            "title": "2.2 Test Artifacts & Allure Report Deployments",
            "summary": "Archive failure screenshots, video recordings, and auto-deploy HTML test reports to GitHub Pages.",
            "estimatedReadingTime": 8
          }
        ]
      }
    ]
  },
  {
    "id": "course-azure-devops",
    "slug": "azure-devops-test-pipelines",
    "title": "Azure DevOps Pipelines for SDETs",
    "subtitle": "YAML Pipelines, Test Plan Sync, and Release Gates",
    "description": "Learn how to build enterprise testing pipelines in Azure DevOps: agent pools, published test results, and quality release approvals.",
    "level": "Intermediate",
    "estimatedHours": 16,
    "modules": [
      {
        "id": "mod-ado-1",
        "courseId": "course-azure-devops",
        "slug": "multi-stage-ado-yaml",
        "title": "Module 1: Multi-Stage YAML Pipelines & Publishing",
        "description": "Create multi-stage Azure DevOps YAML pipelines with PublishTestResults tasks.",
        "lessons": [
          {
            "id": "les-publishing-test-results-in-ado",
            "moduleId": "mod-ado-1",
            "courseId": "course-azure-devops",
            "slug": "publishing-test-results-in-ado",
            "title": "1.1 PublishTestResults@2 Task & Reporting",
            "summary": "Ingest JUnit XML results directly into Azure DevOps Analytics and track flaky test metrics.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-azure-pipelines-agent-pools",
            "moduleId": "mod-ado-1",
            "courseId": "course-azure-devops",
            "slug": "azure-pipelines-agent-pools",
            "title": "1.2 Self-Hosted vs Microsoft-Hosted Build Agents",
            "summary": "Optimize execution costs and hardware performance by configuring self-hosted Linux agents.",
            "estimatedReadingTime": 8
          }
        ]
      },
      {
        "id": "mod-ado-2",
        "courseId": "course-azure-devops",
        "slug": "ado-test-plans-and-gates",
        "title": "Module 2: Azure Test Plans & Quality Release Gates",
        "description": "Link automated tests to Azure Test Cases and enforce pre-deployment quality gates.",
        "lessons": [
          {
            "id": "les-azure-test-plans-automation-link",
            "moduleId": "mod-ado-2",
            "courseId": "course-azure-devops",
            "slug": "azure-test-plans-automation-link",
            "title": "2.1 Azure Test Plans Automated Test Association",
            "summary": "Associate automated test methods with Manual Test Case IDs for real-time requirement traceability.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-ado-release-pipeline-gates",
            "moduleId": "mod-ado-2",
            "courseId": "course-azure-devops",
            "slug": "ado-release-pipeline-gates",
            "title": "2.2 Automated Release Gates & Quality Metrics",
            "summary": "Halt CD deployments to production when automated regression pass rates drop below 98%.",
            "estimatedReadingTime": 8
          }
        ]
      }
    ]
  },
  {
    "id": "course-jenkins",
    "slug": "declarative-jenkins-pipelines",
    "title": "Declarative Jenkins Pipelines for QA Automation",
    "subtitle": "Distributed Test Execution & Allure Report Dashboard",
    "description": "Master Declarative Jenkinsfiles, Dockerized agent containers, parallel test stage execution, and Slack notification integration.",
    "level": "Advanced",
    "estimatedHours": 18,
    "modules": [
      {
        "id": "mod-jen-1",
        "courseId": "course-jenkins",
        "slug": "declarative-jenkinsfile-structure",
        "title": "Module 1: Declarative Jenkinsfile Structure",
        "description": "Master Declarative pipeline syntax, agent stages, and parameterized builds.",
        "lessons": [
          {
            "id": "les-declarative-syntax-essentials",
            "moduleId": "mod-jen-1",
            "courseId": "course-jenkins",
            "slug": "declarative-syntax-essentials",
            "title": "1.1 Declarative Jenkinsfile Structure for QA",
            "summary": "Structure enterprise Jenkins pipelines with clean stages, parameters, and post-actions.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-multibranch-webhook-triggers",
            "moduleId": "mod-jen-1",
            "courseId": "course-jenkins",
            "slug": "multibranch-webhook-triggers",
            "title": "1.2 Multi-Branch Pipelines & Webhook Triggers",
            "summary": "Automatically scan Git branches, trigger PR verification builds, and post commit statuses.",
            "estimatedReadingTime": 8
          }
        ]
      },
      {
        "id": "mod-jen-2",
        "courseId": "course-jenkins",
        "slug": "parallel-stages-and-reporting",
        "title": "Module 2: Parallel Stages & Slack Notifications",
        "description": "Scale tests across multiple Docker nodes and broadcast test summaries to Slack.",
        "lessons": [
          {
            "id": "les-parallel-stages-docker-agents",
            "moduleId": "mod-jen-2",
            "courseId": "course-jenkins",
            "slug": "parallel-stages-docker-agents",
            "title": "2.1 Parallel Test Execution on Docker Agents",
            "summary": "Run UI tests and API tests concurrently on isolated containerized nodes.",
            "estimatedReadingTime": 8
          },
          {
            "id": "les-jenkins-html-reporting-slack",
            "moduleId": "mod-jen-2",
            "courseId": "course-jenkins",
            "slug": "jenkins-html-reporting-slack",
            "title": "2.2 Automated HTML Reports & Slack Notifications",
            "summary": "Publish HTML test reports and send formatted Slack alerts with pass/fail counts.",
            "estimatedReadingTime": 8
          }
        ]
      }
    ]
  }
];
