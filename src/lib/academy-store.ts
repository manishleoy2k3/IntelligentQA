import fs from 'fs';
import path from 'path';
import { generateStandardLessonHtml } from './standard-lesson-compiler';
import { isSupabaseConfigured } from './supabase/env';
import { getSupabaseAdminClient } from './supabase/admin';
import {
  AcademyPublishStatus,
  AcademyCategory,
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  AcademyNavigationTreeCategory,
  AcademyNavigationTreeCourse,
  AcademyNavigationTreeModule,
  AcademyNavigationTreeLesson,
  AcademyReorderPayload,
  BreadcrumbItem,
  LessonNavPointer,
  AcademyDocumentSource,
  AcademyMediaAttachment,
  AcademyLessonAsset,
  UserLessonProgress,
  AcademyLessonBookmark,
  AcademySearchResult,
  UserLearningStats,
  CourseProgressStat,
  ModuleProgressStat,
} from '@/types/learning-platform';

const DATA_FILE = path.join(process.cwd(), 'src/lib/curriculum-data-store.json');
const TMP_DATA_FILE = path.join('/tmp', 'curriculum-data-store.json');

// Default initial categories requested in requirements
export const DEFAULT_ACADEMY_CATEGORIES: AcademyCategory[] = [
  {
    id: 'cat-ai-for-qa',
    slug: 'ai-for-qa',
    title: 'AI Academy',
    description:
      'AI-driven test automation, LLM evaluations, autonomous agents, and intelligent quality engineering.',
    icon: 'Bot',
    sortOrder: 1,
    parentCategoryId: null,
    isActive: true,
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
  },
  {
    id: 'cat-playwright',
    slug: 'playwright',
    title: 'Playwright',
    description:
      'Modern end-to-end automation with Microsoft Playwright, auto-waiting, trace viewer, and network mocking.',
    icon: 'Code2',
    sortOrder: 2,
    parentCategoryId: null,
    isActive: true,
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
  },
  {
    id: 'cat-selenium',
    slug: 'selenium',
    title: 'Selenium',
    description:
      'Enterprise Selenium WebDriver 4, W3C protocol, dynamic waits, and Page Object Model frameworks.',
    icon: 'Globe',
    sortOrder: 3,
    parentCategoryId: null,
    isActive: true,
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
  },
  {
    id: 'cat-rest-assured',
    slug: 'rest-assured',
    title: 'Rest Assured',
    description:
      'Microservice API automation, RequestSpecBuilder, JSON schema validation, and POJO mapping in Java.',
    icon: 'Zap',
    sortOrder: 4,
    parentCategoryId: null,
    isActive: true,
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
  },
  {
    id: 'cat-api-testing',
    slug: 'api-testing',
    title: 'API Testing',
    description:
      'Contract testing with Pact, Postman/Newman automation, GraphQL validation, and performance tests.',
    icon: 'Layers',
    sortOrder: 5,
    parentCategoryId: null,
    isActive: true,
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
  },
  {
    id: 'cat-appium',
    slug: 'appium',
    title: 'Appium',
    description:
      'Cross-platform mobile automation for iOS and Android native, hybrid, and web applications.',
    icon: 'Smartphone',
    sortOrder: 6,
    parentCategoryId: null,
    isActive: true,
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
  },
  {
    id: 'cat-git-cicd',
    slug: 'git-cicd',
    title: 'Git & CI/CD',
    description:
      'Continuous Integration and Continuous Delivery pipelines, automated test runs, and Git workflows.',
    icon: 'GitBranch',
    sortOrder: 7,
    parentCategoryId: null,
    isActive: true,
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
  },
  // Subcategories under Git & CI/CD
  {
    id: 'cat-github-actions',
    slug: 'github-actions',
    title: 'GitHub Actions',
    description:
      'Automated test execution, matrix runs, secrets management, and custom composite actions.',
    icon: 'GitMerge',
    sortOrder: 1,
    parentCategoryId: 'cat-git-cicd',
    isActive: true,
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
  },
  {
    id: 'cat-azure-devops',
    slug: 'azure-devops',
    title: 'Azure DevOps',
    description:
      'Azure Pipelines, YAML multi-stage test jobs, Test Plans integration, and self-hosted agents.',
    icon: 'Cloud',
    sortOrder: 2,
    parentCategoryId: 'cat-git-cicd',
    isActive: true,
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
  },
  {
    id: 'cat-jenkins',
    slug: 'jenkins',
    title: 'Jenkins',
    description:
      'Declarative Jenkinsfiles, distributed agent grids, parallel test suites, and Allure reporting.',
    icon: 'Server',
    sortOrder: 3,
    parentCategoryId: 'cat-git-cicd',
    isActive: true,
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
  },
];

// Initial starter courses matching each category
export const DEFAULT_ACADEMY_COURSES: AcademyCourse[] = [
  {
    id: 'course-ai-qa-mastery',
    categoryId: 'cat-ai-for-qa',
    slug: 'ai-for-qa-mastery',
    title: 'AI Academy: Modern Quality Engineering with AI',
    subtitle: 'From LLM Prompt Evals to Autonomous Self-Healing Test Agents',
    description:
      'Master how artificial intelligence is transforming software quality engineering, test case synthesis, and test automation maintenance.',
    level: 'All Levels',
    estimatedHours: 12,
    sortOrder: 1,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
    modules: [
      {
        id: 'mod-ai-qa-1',
        courseId: 'course-ai-qa-mastery',
        slug: 'foundations-of-ai-testing',
        title: 'Module 1: Foundations of AI in Software Testing',
        description:
          'Understand the landscape of generative AI, prompt engineering for test cases, and evaluation metrics.',
        sortOrder: 1,
        status: 'published',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
        lessons: [
          {
            id: 'les-ai-qa-1-1',
            moduleId: 'mod-ai-qa-1',
            courseId: 'course-ai-qa-mastery',
            slug: 'intro-to-ai-in-qa',
            title: '1.1 Introduction to AI-Driven Quality Assurance',
            summary:
              'Explore how generative models and computer vision are revolutionizing test automation and defect discovery.',
            contentHtml: `
              <h2>The Evolution of Quality Engineering with AI</h2>
              <p>Modern software development velocity demands automated testing that adapts to rapid UI changes without breaking. Traditional locator-based automation suffers from test flakiness, requiring substantial maintenance overhead.</p>
              <h3>Key Pillars of AI in QA:</h3>
              <ul>
                <li><strong>Self-Healing Test Automation:</strong> Using multi-attribute fingerprinting and cosine similarity to dynamically resolve broken locators at runtime.</li>
                <li><strong>Autonomous Test Generation:</strong> Converting Jira requirements and user stories directly into executable Gherkin feature files and Playwright scripts.</li>
                <li><strong>Visual Regression & Anomaly Detection:</strong> Utilizing computer vision models to identify visual regressions across viewports without brittle pixel-by-pixel comparisons.</li>
                <li><strong>LLM & Agent Evaluations:</strong> Benchmarking accuracy, hallucination rates, and security guardrails for AI-powered applications.</li>
              </ul>
              <div class="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 my-6">
                <h4 class="text-emerald-400 font-semibold mb-1">Architectural Insight</h4>
                <p class="text-sm text-neutral-300">AI does not replace foundational testing principles; it supercharges test coverage by eliminating boilerplate script maintenance and surfacing edge cases humans often overlook.</p>
              </div>
            `,
            wordCount: 350,
            estimatedReadTime: 3,
            sortOrder: 1,
            status: 'published',
            publishedAt: '2026-11-23T00:00:00.000Z',
            createdAt: '2026-11-23T00:00:00.000Z',
            updatedAt: '2026-11-23T00:00:00.000Z',
          },
        ],
      },
    ],
  },
  {
    id: 'course-playwright-mastery',
    categoryId: 'cat-playwright',
    slug: 'playwright-ts-mastery',
    title: 'Playwright Automation with TypeScript',
    subtitle: 'Modern End-to-End Testing for Web Applications',
    description:
      'Learn Playwright from scratch: auto-waiting, isolated browser contexts, parallel execution, API mocking, and Trace Viewer debugging.',
    level: 'Beginner',
    estimatedHours: 20,
    sortOrder: 1,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
    modules: [
      {
        id: 'mod-pw-1',
        courseId: 'course-playwright-mastery',
        slug: 'playwright-architecture-and-setup',
        title: 'Module 1: Architecture, Setup & Auto-Waiting',
        description: 'Set up your first Playwright project and master zero-flake test execution.',
        sortOrder: 1,
        status: 'published',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
        lessons: [
          {
            id: 'les-pw-1-1',
            moduleId: 'mod-pw-1',
            courseId: 'course-playwright-mastery',
            slug: 'playwright-core-concepts',
            title: '1.1 Playwright Architecture & Actionability Matrix',
            summary:
              'Discover how Playwright performs automatic checks before every click, fill, or tap to guarantee flake-free tests.',
            contentHtml: `
              <h2>Why Playwright is Built for Modern Web Apps</h2>
              <p>Unlike legacy tools, Microsoft Playwright communicates with browser processes via a single bidirectional WebSocket connection. This architecture eliminates HTTP connection overhead and unlocks instant event-driven DOM observation.</p>
              <h3>The Actionability Check:</h3>
              <p>Before clicking an element with <code>page.click('button')</code>, Playwright automatically checks that:</p>
              <ul>
                <li>The element is attached to the DOM.</li>
                <li>The element is visible (not hidden via opacity, display:none, or zero size).</li>
                <li>The element is stable (not moving due to CSS transitions).</li>
                <li>The element receives pointer events (not obscured by modal overlays).</li>
                <li>The element is enabled (not disabled).</li>
              </ul>
            `,
            wordCount: 310,
            estimatedReadTime: 3,
            sortOrder: 1,
            status: 'published',
            publishedAt: '2026-11-23T00:00:00.000Z',
            createdAt: '2026-11-23T00:00:00.000Z',
            updatedAt: '2026-11-23T00:00:00.000Z',
          },
        ],
      },
    ],
  },
  {
    id: 'course-selenium-mastery',
    categoryId: 'cat-selenium',
    slug: 'selenium-webdriver-enterprise',
    title: 'Selenium WebDriver 4 Enterprise Framework Architecture',
    subtitle: 'Production-Grade Java Test Automation Frameworks',
    description:
      'Deep dive into WebDriver 4 W3C protocol, dynamic wait strategies, ThreadLocal thread safety, and scalable Page Object Models.',
    level: 'Intermediate',
    estimatedHours: 24,
    sortOrder: 1,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
    modules: [
      {
        id: 'mod-sel-1',
        courseId: 'course-selenium-mastery',
        slug: 'webdriver-architecture-and-waits',
        title: 'Module 1: WebDriver Architecture & Dynamic Synchronization',
        description: 'Understand the W3C communication model and master zero-flake explicit waits.',
        sortOrder: 1,
        status: 'published',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
        lessons: [
          {
            id: 'les-sel-1-1',
            moduleId: 'mod-sel-1',
            courseId: 'course-selenium-mastery',
            slug: 'w3c-protocol-and-driver-architecture',
            title: '1.1 Selenium 4 Architecture & W3C Standardization',
            summary:
              'Learn how Selenium 4 communicates directly with browser drivers over W3C HTTP protocol without JSON Wire encoding.',
            contentHtml: `
              <h2>Selenium 4 Under the Hood</h2>
              <p>In Selenium 4, the legacy JSON Wire Protocol has been completely deprecated in favor of the official W3C WebDriver Standard. This ensures direct, low-latency communication between your test client and browser engines (ChromeDriver, GeckoDriver, SafariDriver).</p>
              <h3>Why W3C Standardization Matters:</h3>
              <ol>
                <li><strong>Native Browser Action Execution:</strong> Chrome, Firefox, and Safari execute commands directly without proxy translation layers.</li>
                <li><strong>Standardized Status Codes:</strong> Consistent exception handling across all browser vendors.</li>
                <li><strong>CDP & BiDi Protocol Integration:</strong> Direct access to Chrome DevTools Protocol for network throttling, console logs, and performance metrics.</li>
              </ol>
            `,
            wordCount: 280,
            estimatedReadTime: 3,
            sortOrder: 1,
            status: 'published',
            publishedAt: '2026-11-23T00:00:00.000Z',
            createdAt: '2026-11-23T00:00:00.000Z',
            updatedAt: '2026-11-23T00:00:00.000Z',
          },
        ],
      },
    ],
  },
  {
    id: 'course-rest-assured',
    categoryId: 'cat-rest-assured',
    slug: 'rest-assured-api-automation',
    title: 'REST Assured: Enterprise API Automation with Java',
    subtitle: 'From RequestSpecBuilder to JSON Schema & Contract Validation',
    description:
      'Learn REST Assured for automating RESTful microservices: authentication, OAuth2, POJO serialization with Jackson, and JSON schema assertions.',
    level: 'Intermediate',
    estimatedHours: 18,
    sortOrder: 1,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
    modules: [
      {
        id: 'mod-ra-1',
        courseId: 'course-rest-assured',
        slug: 'rest-assured-fundamentals',
        title: 'Module 1: REST Assured Architecture & BDD Syntax',
        description: 'Master given(), when(), then() fluent chaining and authentication handling.',
        sortOrder: 1,
        status: 'published',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
        lessons: [
          {
            id: 'les-ra-1-1',
            moduleId: 'mod-ra-1',
            courseId: 'course-rest-assured',
            slug: 'bdd-dsl-and-specs',
            title: '1.1 Fluent BDD Syntax & RequestSpecBuilder',
            summary:
              'Build clean, reusable request specifications and assert JSON payloads efficiently.',
            contentHtml: `
              <h2>Writing Clean REST Assured Tests</h2>
              <p>REST Assured utilizes a fluent BDD domain-specific language (DSL) inspired by Hamcrest and Cucumber. Tests follow the <strong>Given - When - Then</strong> structure:</p>
              <pre><code class="language-java">given()
    .spec(requestSpec)
    .body(payload)
.when()
    .post("/api/v1/orders")
.then()
    .statusCode(201)
    .body("status", equalTo("CONFIRMED"));</code></pre>
            `,
            wordCount: 220,
            estimatedReadTime: 2,
            sortOrder: 1,
            status: 'published',
            publishedAt: '2026-11-23T00:00:00.000Z',
            createdAt: '2026-11-23T00:00:00.000Z',
            updatedAt: '2026-11-23T00:00:00.000Z',
          },
        ],
      },
    ],
  },
  {
    id: 'course-api-testing',
    categoryId: 'cat-api-testing',
    slug: 'api-testing-and-contracts',
    title: 'Full-Stack API Testing & Consumer-Driven Contracts',
    subtitle: 'Postman, Newman, Pact, and OpenAPI Schema Verification',
    description:
      'Comprehensive guide to testing distributed microservices, REST APIs, GraphQL endpoints, and consumer-driven contracts.',
    level: 'All Levels',
    estimatedHours: 16,
    sortOrder: 1,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
    modules: [
      {
        id: 'mod-api-1',
        courseId: 'course-api-testing',
        slug: 'api-testing-foundations',
        title: 'Module 1: API Protocols & Contract Testing',
        description:
          'Understand HTTP status codes, headers, payloads, and contract validation principles.',
        sortOrder: 1,
        status: 'published',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
        lessons: [
          {
            id: 'les-api-1-1',
            moduleId: 'mod-api-1',
            courseId: 'course-api-testing',
            slug: 'consumer-driven-contracts-with-pact',
            title: '1.1 Consumer-Driven Contracts with Pact',
            summary:
              'Prevent breaking changes across frontend and backend services using automated contract testing.',
            contentHtml: `
              <h2>What is Contract Testing?</h2>
              <p>Contract testing ensures that two separate systems (such as a Next.js web application and a Go backend microservice) have a shared agreement on the messages they exchange. By verifying contracts in isolation, teams eliminate the need for brittle end-to-end integration environments.</p>
            `,
            wordCount: 260,
            estimatedReadTime: 3,
            sortOrder: 1,
            status: 'published',
            publishedAt: '2026-11-23T00:00:00.000Z',
            createdAt: '2026-11-23T00:00:00.000Z',
            updatedAt: '2026-11-23T00:00:00.000Z',
          },
        ],
      },
    ],
  },
  {
    id: 'course-appium',
    categoryId: 'cat-appium',
    slug: 'appium-mobile-automation',
    title: 'Appium 2.0 Mobile Automation Masterclass',
    subtitle: 'Cross-Platform Automation for Android and iOS',
    description:
      'Master Appium 2.0 modular driver architecture, UiAutomator2, XCUITest, mobile gestures, and device cloud integration.',
    level: 'Intermediate',
    estimatedHours: 20,
    sortOrder: 1,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
    modules: [
      {
        id: 'mod-app-1',
        courseId: 'course-appium',
        slug: 'appium-2-architecture',
        title: 'Module 1: Appium 2.0 Modular Architecture & Setup',
        description:
          'Understand the decoupled driver model and install plugins for automated device interaction.',
        sortOrder: 1,
        status: 'published',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
        lessons: [
          {
            id: 'les-app-1-1',
            moduleId: 'mod-app-1',
            courseId: 'course-appium',
            slug: 'appium-2-modular-ecosystem',
            title: '1.1 Appium 2.0 Modular Drivers & Plugins',
            summary:
              'Learn how Appium 2 separates core automation server from device drivers (uiautomator2, xcuitest).',
            contentHtml: `
              <h2>Appium 2.0 Architecture</h2>
              <p>In Appium 2.0, drivers and plugins are completely decoupled from the main server. You can install only the drivers your team needs, minimizing installation footprint and simplifying version management.</p>
            `,
            wordCount: 240,
            estimatedReadTime: 2,
            sortOrder: 1,
            status: 'published',
            publishedAt: '2026-11-23T00:00:00.000Z',
            createdAt: '2026-11-23T00:00:00.000Z',
            updatedAt: '2026-11-23T00:00:00.000Z',
          },
        ],
      },
    ],
  },
  {
    id: 'course-cicd-concepts',
    categoryId: 'cat-git-cicd',
    slug: 'cicd-concepts',
    title: 'CI/CD Concepts',
    subtitle: 'Git Version Control, GitHub Actions, Azure DevOps & Declarative Jenkins Pipelines',
    description:
      'Master modern Continuous Integration, automated quality gating, and Continuous Delivery for QA automation: Git branching models, GitHub Actions matrix runners, Azure DevOps quality release gates, and distributed Jenkins container pipelines.',
    level: 'All Levels',
    estimatedHours: 46,
    sortOrder: 7,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
    modules: [
      {
        id: 'mod-cicd-1-git',
        courseId: 'course-cicd-concepts',
        slug: 'git-version-control',
        title: 'Module 1: Git & Version Control for QA',
        description:
          'Git fundamentals, commit DAG architecture, branching models (Trunk-Based, GitFlow), conflict resolution, and PR review quality gates.',
        sortOrder: 1,
        status: 'published',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
        lessons: [
          {
            id: 'les-git-1-1-what-is-git',
            moduleId: 'mod-cicd-1-git',
            courseId: 'course-cicd-concepts',
            slug: 'what-is-git',
            title: 'What is Git?',
            summary:
              'Git is a distributed version control system (DVCS) that tracks changes in source code and test automation frameworks over time, enabling multiple SDETs and developers to collaborate concurrently.',
            contentHtml:
              '<h2>What is Git?</h2><p>Git is a distributed version control system (DVCS) that tracks changes in source code and test automation frameworks over time, enabling multiple SDETs and developers to collaborate concurrently.</p>',
            wordCount: 300,
            estimatedReadTime: 4,
            sortOrder: 1,
            status: 'published',
            publishedAt: '2026-11-23T00:00:00.000Z',
            createdAt: '2026-11-23T00:00:00.000Z',
            updatedAt: '2026-11-23T00:00:00.000Z',
          },
        ],
      },
    ],
  },
  {
    id: 'course-apm-performance',
    categoryId: 'cat-apm-perf',
    slug: 'apm-and-performance-testing',
    title: 'Performance Testing',
    subtitle: 'Apache JMeter, k6 Load Scripting, Distributed Tracing, and Datadog/Dynatrace APM',
    description:
      'Comprehensive performance engineering and monitoring: JMeter distributed loads, modern k6 virtual user scripting, SLAs/SLOs, and Application Performance Monitoring (APM) with OpenTelemetry and Datadog.',
    level: 'All Levels',
    estimatedHours: 30,
    sortOrder: 8,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
    modules: [
      {
        id: 'mod-apm-performance-1',
        courseId: 'course-apm-performance',
        slug: 'performance-testing-fundamentals',
        title: 'Module 1: Performance Testing Fundamentals',
        description:
          'Core metrics (latency, throughput, percentiles p95/p99), load test types, and capacity planning.',
        sortOrder: 1,
        status: 'published',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
        lessons: [
          {
            id: 'les-apm-perf-1-1-what-is-performance-testing',
            moduleId: 'mod-apm-performance-1',
            courseId: 'course-apm-performance',
            slug: 'what-is-performance-testing',
            title: 'What is Performance Testing?',
            summary:
              'Comprehensive guide to software performance testing, metrics, and quality goals.',
            contentHtml:
              '<h2>What is Performance Testing?</h2><p>Comprehensive guide to software performance testing, metrics, and quality goals.</p>',
            wordCount: 300,
            estimatedReadTime: 4,
            sortOrder: 1,
            status: 'published',
            publishedAt: '2026-11-23T00:00:00.000Z',
            createdAt: '2026-11-23T00:00:00.000Z',
            updatedAt: '2026-11-23T00:00:00.000Z',
          },
        ],
      },
    ],
  },
];

export class AcademyStore {
  private static instance: AcademyStore;
  private categories: Map<string, AcademyCategory> = new Map();
  private courses: Map<string, AcademyCourse> = new Map();
  private docSources: Map<string, AcademyDocumentSource> = new Map();
  private mediaAttachments: Map<string, AcademyMediaAttachment> = new Map();
  private lessonAssets: Map<string, AcademyLessonAsset> = new Map();
  private userProgress: Map<string, UserLessonProgress> = new Map();
  private userBookmarks: Map<string, AcademyLessonBookmark> = new Map();
  private enrolledCourses: Map<string, Set<string>> = new Map();
  private searchIndexCache: Array<{
    id: string;
    courseId: string;
    courseTitle: string;
    courseSlug: string;
    moduleTitle: string;
    lessonTitle: string;
    lessonSlug: string;
    summary: string;
    status: AcademyPublishStatus;
    searchMetaLower: string;
    contentHtml?: string;
    contentLower?: string;
  }> | null = null;
  private initialized = false;

  private constructor() {
    this.loadFromDisk();
  }

  public static getInstance(): AcademyStore {
    if (!AcademyStore.instance) {
      AcademyStore.instance = new AcademyStore();
    }
    return AcademyStore.instance;
  }

  public reloadFromDisk(): void {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      this.searchIndexCache = null;
      let raw: string | null = null;

      // Check /tmp first for serverless persisted state
      if (fs.existsSync(TMP_DATA_FILE)) {
        try {
          raw = fs.readFileSync(TMP_DATA_FILE, 'utf-8');
        } catch {
          raw = null;
        }
      }
      if (!raw && fs.existsSync(DATA_FILE)) {
        raw = fs.readFileSync(DATA_FILE, 'utf-8');
      }

      if (raw) {
        const data = JSON.parse(raw);

        // Load Categories
        if (Array.isArray(data.academyCategories) && data.academyCategories.length > 0) {
          this.categories.clear();
          data.academyCategories.forEach((cat: AcademyCategory) =>
            this.categories.set(cat.id, cat)
          );
        } else {
          // Initialize with default categories
          this.categories.clear();
          DEFAULT_ACADEMY_CATEGORIES.forEach((cat) => this.categories.set(cat.id, cat));
        }

        // Load Courses
        if (Array.isArray(data.academyCourses) && data.academyCourses.length > 0) {
          this.courses.clear();
          data.academyCourses.forEach((c: AcademyCourse) => {
            // Keep default ordering only if sortOrder is not already configured by Admin
            if (c.sortOrder === undefined || c.sortOrder === null) {
              if (c.id === 'course-ai-qa-mastery') c.sortOrder = 1;
              if (c.id === 'course-playwright-mastery') c.sortOrder = 2;
              if (c.id === 'course-selenium-mastery') c.sortOrder = 3;
            }

            // Ensure all lessons with standardData compile into uniform prose and strip any section labels
            if (c.modules) {
              for (const mod of c.modules) {
                if (mod.lessons) {
                  for (const lsn of mod.lessons) {
                    if (lsn.blockData?.standardData) {
                      lsn.contentHtml = generateStandardLessonHtml(lsn.blockData.standardData);
                    }
                    if (lsn.contentHtml) {
                      lsn.contentHtml = lsn.contentHtml
                        .replace(/<span[^>]*>\s*(?:section|SECTION)\s*\d+[^<]*<\/span>/gi, '')
                        .replace(
                          /\btext-(?:white|slate-100|slate-200|slate-300|slate-400|neutral-100|neutral-200|neutral-300|neutral-400|zinc-100|zinc-200|zinc-300|zinc-400)\b/g,
                          ''
                        )
                        .replace(
                          /\bstyle="[^"]*color:\s*(?:#ffffff|#fff|#cbd5e1|#d4d4d8|#64748B|#94a3b8|#e2e8f0)[^"]*"/gi,
                          ''
                        );
                    }
                  }
                }
              }
            }
            this.courses.set(c.id, c);
          });
        } else {
          // Initialize with default courses
          this.courses.clear();
          DEFAULT_ACADEMY_COURSES.forEach((c) => this.courses.set(c.id, c));
        }

        // Load Doc Sources
        if (Array.isArray(data.academyDocSources)) {
          this.docSources.clear();
          data.academyDocSources.forEach((d: AcademyDocumentSource) =>
            this.docSources.set(d.id, d)
          );
        }

        // Load Media Attachments
        if (Array.isArray(data.academyMedia)) {
          this.mediaAttachments.clear();
          data.academyMedia.forEach((m: AcademyMediaAttachment) =>
            this.mediaAttachments.set(m.id, m)
          );
        }

        // Load Lesson Assets
        if (Array.isArray(data.academyLessonAssets)) {
          this.lessonAssets.clear();
          data.academyLessonAssets.forEach((a: AcademyLessonAsset) =>
            this.lessonAssets.set(a.id, a)
          );
        }

        // Load User Lesson Progress
        if (Array.isArray(data.academyUserProgress)) {
          this.userProgress.clear();
          data.academyUserProgress.forEach((p: UserLessonProgress) => {
            this.userProgress.set(`${p.userId}:${p.lessonId}`, p);
          });
        }

        // Load User Bookmarks
        if (Array.isArray(data.academyBookmarks)) {
          this.userBookmarks.clear();
          data.academyBookmarks.forEach((b: AcademyLessonBookmark) => {
            this.userBookmarks.set(`${b.userId}:${b.lessonId}`, b);
          });
        }

        // Load Enrolled Courses
        if (Array.isArray(data.academyEnrolledCourses)) {
          this.enrolledCourses.clear();
          data.academyEnrolledCourses.forEach((item: { userId: string; courses: string[] }) => {
            this.enrolledCourses.set(item.userId, new Set(item.courses));
          });
        }

        this.initialized = true;

        // If categories or courses were populated with defaults because file didn't have them, save to disk
        if (!data.academyCategories || !data.academyCourses) {
          this.saveToDisk();
        }

        // Pre-build search index for sub-millisecond query performance
        this.buildSearchIndex();
      }
    } catch (e) {
      console.error('Failed to load Academy data from disk:', e);
    }
  }

  private buildSearchIndex(): void {
    this.searchIndexCache = [];
    for (const course of this.courses.values()) {
      const courseTitleLower = course.title.toLowerCase();
      for (const mod of course.modules || []) {
        const modTitleLower = mod.title.toLowerCase();
        for (const lsn of mod.lessons || []) {
          const lsnTitleLower = lsn.title.toLowerCase();
          const summaryLower = (lsn.summary || lsn.shortDescription || '').toLowerCase();
          const searchMetaLower = `${courseTitleLower} ${modTitleLower} ${lsnTitleLower} ${summaryLower}`;
          const contentHtml = lsn.contentHtml || '';
          this.searchIndexCache.push({
            id: lsn.id,
            courseId: course.id,
            courseTitle: course.title,
            courseSlug: course.slug,
            moduleTitle: mod.title,
            lessonTitle: lsn.title,
            lessonSlug: lsn.slug,
            summary: lsn.summary || lsn.shortDescription || '',
            status: lsn.status,
            searchMetaLower,
            contentHtml,
          });
        }
      }
    }
  }

  private saveToDisk() {
    try {
      this.searchIndexCache = null;
      let existingData: Record<string, any> = {};
      if (fs.existsSync(TMP_DATA_FILE)) {
        try {
          existingData = JSON.parse(fs.readFileSync(TMP_DATA_FILE, 'utf-8'));
        } catch {
          existingData = {};
        }
      } else if (fs.existsSync(DATA_FILE)) {
        try {
          existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        } catch {
          existingData = {};
        }
      }

      existingData.academyCategories = Array.from(this.categories.values());
      existingData.academyCourses = Array.from(this.courses.values());
      existingData.academyDocSources = Array.from(this.docSources.values());
      existingData.academyMedia = Array.from(this.mediaAttachments.values());
      existingData.academyLessonAssets = Array.from(this.lessonAssets.values());
      existingData.academyUserProgress = Array.from(this.userProgress.values());
      existingData.academyBookmarks = Array.from(this.userBookmarks.values());
      existingData.academyEnrolledCourses = Array.from(this.enrolledCourses.entries()).map(
        ([userId, courses]) => ({
          userId,
          courses: Array.from(courses),
        })
      );

      const payloadStr = JSON.stringify(existingData, null, 2);

      // Attempt primary write to DATA_FILE atomically
      try {
        const tempFile = `${DATA_FILE}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}`;
        fs.writeFileSync(tempFile, payloadStr, 'utf-8');
        try {
          fs.renameSync(tempFile, DATA_FILE);
        } catch {
          // Fallback for filesystem collision
          fs.writeFileSync(DATA_FILE, payloadStr, 'utf-8');
          try {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
          } catch {
            // ignore
          }
        }
      } catch (writeErr: any) {
        // Fall back to /tmp/curriculum-data-store.json for serverless environments (e.g. AWS Lambda / Vercel Serverless /var/task)
        console.warn(
          '[AcademyStore] Primary write to DATA_FILE failed (' +
            (writeErr?.code || writeErr?.message) +
            '). Persisting to /tmp fallback.'
        );
        try {
          fs.writeFileSync(TMP_DATA_FILE, payloadStr, 'utf-8');
        } catch (tmpErr) {
          console.warn('[AcademyStore] Failed to write to /tmp fallback:', tmpErr);
        }
      }

      // Synchronize with Supabase PostgreSQL if configured
      this.syncToSupabaseAsync(existingData);
    } catch (e: any) {
      console.warn(
        '[AcademyStore] Non-fatal error persisting Academy data to disk:',
        e?.message || e
      );
    }
  }

  private syncToSupabaseAsync(data: Record<string, any>): void {
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = getSupabaseAdminClient();
      if (!supabase) return;
      Promise.resolve().then(async () => {
        try {
          if (Array.isArray(data.academyCategories) && data.academyCategories.length > 0) {
            await supabase.from('categories').upsert(
              data.academyCategories.map((c: any) => ({
                id: c.id,
                slug: c.slug,
                title: c.title,
                description: c.description || null,
                icon: c.icon || 'BookOpen',
                sort_order: c.sortOrder || 0,
                parent_category_id: c.parentCategoryId || null,
                is_active: c.isActive !== false,
              })),
              { onConflict: 'id' }
            );
          }
          if (Array.isArray(data.academyCourses) && data.academyCourses.length > 0) {
            await supabase.from('courses').upsert(
              data.academyCourses.map((c: any) => ({
                id: c.id,
                category_id: c.categoryId,
                slug: c.slug,
                title: c.title,
                subtitle: c.subtitle || null,
                description: c.description || null,
                icon: c.icon || null,
                thumbnail: c.thumbnail || null,
                level: c.level || 'All Levels',
                estimated_hours: c.estimatedHours || 10,
                sort_order: c.sortOrder || 0,
                status: c.status || 'published',
              })),
              { onConflict: 'id' }
            );
          }
        } catch (syncErr: any) {
          console.warn('[AcademyStore] Supabase async sync notice:', syncErr?.message);
        }
      });
    } catch {
      // ignore
    }
  }

  // ==========================================
  // CATEGORIES
  // ==========================================

  public getCategories(options: { includeInactive?: boolean } = {}): AcademyCategory[] {
    const list = Array.from(this.categories.values());
    const filtered = options.includeInactive ? list : list.filter((c) => c.isActive);
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getCategory(idOrSlug: string): AcademyCategory | undefined {
    return (
      this.categories.get(idOrSlug) ||
      Array.from(this.categories.values()).find((c) => c.slug === idOrSlug)
    );
  }

  public createCategory(
    input: Omit<AcademyCategory, 'id' | 'createdAt' | 'updatedAt'>
  ): AcademyCategory {
    const id = `cat-${input.slug || Date.now()}`;
    const now = new Date().toISOString();
    const category: AcademyCategory = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.categories.set(id, category);
    this.saveToDisk();
    return category;
  }

  public updateCategory(
    id: string,
    updates: Partial<AcademyCategory>
  ): AcademyCategory | undefined {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updated: AcademyCategory = {
      ...category,
      ...updates,
      id: category.id, // prevent id modification
      updatedAt: new Date().toISOString(),
    };

    this.categories.set(id, updated);
    this.saveToDisk();
    return updated;
  }

  public deleteCategory(id: string, cascade = false): boolean {
    const category = this.categories.get(id);
    if (!category) return false;

    // Check if courses exist under this category
    const hasCourses = Array.from(this.courses.values()).some((c) => c.categoryId === id);
    if (hasCourses && !cascade) {
      throw new Error(
        'Cannot delete category with associated courses. Delete courses first or use cascade=true.'
      );
    }

    if (cascade) {
      // Remove courses belonging to this category
      for (const [courseId, course] of this.courses.entries()) {
        if (course.categoryId === id) {
          this.courses.delete(courseId);
        }
      }
    }

    this.categories.delete(id);
    this.saveToDisk();
    return true;
  }

  // ==========================================
  // COURSES
  // ==========================================

  public isCourseSlugUnique(slug: string, excludeId?: string): boolean {
    const normalized = slug.trim().toLowerCase();
    for (const course of this.courses.values()) {
      if (excludeId && course.id === excludeId) continue;
      if (course.slug.trim().toLowerCase() === normalized) {
        return false;
      }
    }
    return true;
  }

  public getCourses(filter?: {
    categoryId?: string;
    status?: string;
    includeDrafts?: boolean;
  }): AcademyCourse[] {
    let list = Array.from(this.courses.values());
    if (filter?.categoryId) {
      list = list.filter((c) => c.categoryId === filter.categoryId);
    }
    if (filter?.status) {
      list = list.filter((c) => c.status === filter.status);
    } else if (!filter?.includeDrafts) {
      list = list.filter((c) => c.status === 'published');
    }

    if (!filter?.includeDrafts) {
      // Filter nested modules and lessons to published only
      list = list.map((c) => ({
        ...c,
        modules: (c.modules || [])
          .filter((m) => m.status === 'published')
          .map((m) => ({
            ...m,
            lessons: (m.lessons || []).filter((l) => l.status === 'published'),
          })),
      }));
    }

    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getCourse(
    idOrSlug: string,
    options?: { includeDrafts?: boolean }
  ): AcademyCourse | undefined {
    const aliasMap: Record<string, string> = {
      'course-git': 'course-cicd-concepts',
      'git-for-qa-engineers': 'course-cicd-concepts',
      'course-github-actions': 'course-cicd-concepts',
      'github-actions-for-qa': 'course-cicd-concepts',
      'github-actions-qa-automation': 'course-cicd-concepts',
      'course-azure-devops': 'course-cicd-concepts',
      'azure-devops-test-pipelines': 'course-cicd-concepts',
      'course-jenkins': 'course-cicd-concepts',
      'declarative-jenkins-pipelines': 'course-cicd-concepts',
      'course-mobile-testing': 'course-appium',
      'mobile-testing-fundamentals': 'course-appium',
    };
    const resolvedId = aliasMap[idOrSlug] || idOrSlug;

    const raw =
      this.courses.get(resolvedId) ||
      Array.from(this.courses.values()).find((c) => c.slug === resolvedId) ||
      this.courses.get(idOrSlug) ||
      Array.from(this.courses.values()).find((c) => c.slug === idOrSlug);
    if (!raw) return undefined;

    if (!options?.includeDrafts) {
      if (raw.status !== 'published') return undefined;
      return {
        ...raw,
        modules: (raw.modules || [])
          .filter((m) => m.status === 'published')
          .map((m) => ({
            ...m,
            lessons: (m.lessons || []).filter((l) => l.status === 'published'),
          })),
      };
    }

    return raw;
  }

  public getCourseBySlug(
    slug: string,
    options?: { includeDrafts?: boolean }
  ): AcademyCourse | undefined {
    return this.getCourse(slug, options);
  }

  public createCourse(input: Omit<AcademyCourse, 'id' | 'createdAt' | 'updatedAt'>): AcademyCourse {
    if (!this.isCourseSlugUnique(input.slug)) {
      throw new Error(`Course slug "${input.slug}" is already in use.`);
    }

    const id = `course-${input.slug || Date.now()}`;
    const now = new Date().toISOString();
    const course: AcademyCourse = {
      ...input,
      id,
      modules: input.modules || [],
      createdAt: now,
      updatedAt: now,
    };
    this.courses.set(id, course);
    this.saveToDisk();
    return course;
  }

  public updateCourse(id: string, updates: Partial<AcademyCourse>): AcademyCourse | undefined {
    const course = this.courses.get(id);
    if (!course) return undefined;

    if (updates.slug && updates.slug !== course.slug) {
      if (!this.isCourseSlugUnique(updates.slug, id)) {
        throw new Error(`Course slug "${updates.slug}" is already in use.`);
      }
    }

    const updated: AcademyCourse = {
      ...course,
      ...updates,
      id: course.id,
      updatedAt: new Date().toISOString(),
    };

    this.courses.set(id, updated);
    this.saveToDisk();
    return updated;
  }

  public deleteCourse(id: string): boolean {
    if (!this.courses.has(id)) return false;
    this.courses.delete(id);
    this.saveToDisk();
    return true;
  }

  // ==========================================
  // MODULES
  // ==========================================

  public isModuleSlugUnique(courseId: string, slug: string, excludeId?: string): boolean {
    const course = this.getCourse(courseId, { includeDrafts: true });
    if (!course || !course.modules) return true;
    const normalized = slug.trim().toLowerCase();
    for (const mod of course.modules) {
      if (excludeId && mod.id === excludeId) continue;
      if (mod.slug.trim().toLowerCase() === normalized) {
        return false;
      }
    }
    return true;
  }

  public getModules(
    courseIdOrSlug: string,
    options?: { includeDrafts?: boolean }
  ): AcademyModule[] {
    const course = this.getCourse(courseIdOrSlug, options);
    if (!course || !course.modules) return [];

    let mods = [...course.modules];
    if (!options?.includeDrafts) {
      mods = mods
        .filter((m) => m.status === 'published')
        .map((m) => ({
          ...m,
          lessons: (m.lessons || []).filter((l) => l.status === 'published'),
        }));
    }
    return mods.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getModule(
    courseIdOrSlug: string,
    moduleIdOrSlug: string,
    options?: { includeDrafts?: boolean }
  ): AcademyModule | undefined {
    const course = this.getCourse(courseIdOrSlug, options);
    if (!course || !course.modules) return undefined;

    const mod = course.modules.find((m) => m.id === moduleIdOrSlug || m.slug === moduleIdOrSlug);
    if (!mod) return undefined;

    if (!options?.includeDrafts) {
      if (mod.status !== 'published') return undefined;
      return {
        ...mod,
        lessons: (mod.lessons || []).filter((l) => l.status === 'published'),
      };
    }

    return mod;
  }

  public createModule(
    courseId: string,
    input: Omit<AcademyModule, 'id' | 'courseId' | 'createdAt' | 'updatedAt'>
  ): AcademyModule {
    const course = this.courses.get(courseId);
    if (!course) throw new Error(`Course with id ${courseId} not found`);

    if (!this.isModuleSlugUnique(courseId, input.slug)) {
      throw new Error(`Module slug "${input.slug}" is already in use for course ${course.title}.`);
    }

    if (!course.modules) course.modules = [];

    const id = `mod-${input.slug || Date.now()}`;
    const now = new Date().toISOString();
    const newModule: AcademyModule = {
      ...input,
      id,
      courseId,
      lessons: input.lessons || [],
      createdAt: now,
      updatedAt: now,
    };

    course.modules.push(newModule);
    course.updatedAt = now;
    this.saveToDisk();
    return newModule;
  }

  public updateModule(
    courseId: string,
    moduleId: string,
    updates: Partial<AcademyModule>
  ): AcademyModule | undefined {
    const course = this.courses.get(courseId);
    if (!course || !course.modules) return undefined;

    const modIndex = course.modules.findIndex((m) => m.id === moduleId);
    if (modIndex === -1) return undefined;

    if (updates.slug && updates.slug !== course.modules[modIndex].slug) {
      if (!this.isModuleSlugUnique(courseId, updates.slug, moduleId)) {
        throw new Error(
          `Module slug "${updates.slug}" is already in use for course ${course.title}.`
        );
      }
    }

    const updated: AcademyModule = {
      ...course.modules[modIndex],
      ...updates,
      id: course.modules[modIndex].id,
      courseId,
      updatedAt: new Date().toISOString(),
    };

    course.modules[modIndex] = updated;
    course.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return updated;
  }

  public deleteModule(courseId: string, moduleId: string): boolean {
    const course = this.courses.get(courseId);
    if (!course || !course.modules) return false;

    const initialLength = course.modules.length;
    course.modules = course.modules.filter((m) => m.id !== moduleId);
    if (course.modules.length === initialLength) return false;

    course.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return true;
  }

  // ==========================================
  // LESSONS
  // ==========================================

  public isLessonSlugUnique(moduleId: string, slug: string, excludeId?: string): boolean {
    const normalized = slug.trim().toLowerCase();
    for (const course of this.courses.values()) {
      const mod = course.modules?.find((m) => m.id === moduleId);
      if (mod && mod.lessons) {
        for (const lsn of mod.lessons) {
          if (excludeId && lsn.id === excludeId) continue;
          if (lsn.slug.trim().toLowerCase() === normalized) {
            return false;
          }
        }
      }
    }
    return true;
  }

  public getLessons(
    courseIdOrSlug: string,
    moduleIdOrSlug: string,
    options?: { includeDrafts?: boolean }
  ): AcademyLesson[] {
    const course = this.getCourse(courseIdOrSlug, options);
    if (!course || !course.modules) return [];
    const mod = course.modules.find((m) => m.id === moduleIdOrSlug || m.slug === moduleIdOrSlug);
    if (!mod || !mod.lessons) return [];

    let lessons = [...mod.lessons];
    if (!options?.includeDrafts) {
      lessons = lessons.filter((l) => l.status === 'published');
    }
    return lessons.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getLessonsByModule(
    moduleIdOrSlug: string,
    options?: { includeDrafts?: boolean }
  ): AcademyLesson[] {
    for (const course of this.courses.values()) {
      if (!course.modules) continue;
      if (!options?.includeDrafts && course.status !== 'published') continue;
      const mod = course.modules.find((m) => m.id === moduleIdOrSlug || m.slug === moduleIdOrSlug);
      if (mod && mod.lessons) {
        if (!options?.includeDrafts && mod.status !== 'published') return [];
        let lessons = [...mod.lessons];
        if (!options?.includeDrafts) {
          lessons = lessons.filter((l) => l.status === 'published');
        }
        return lessons.sort((a, b) => a.sortOrder - b.sortOrder);
      }
    }
    return [];
  }

  public getLesson(
    idOrSlug: string,
    options?: { includeDrafts?: boolean }
  ): { lesson: AcademyLesson; course: AcademyCourse; module: AcademyModule } | undefined {
    for (const course of this.courses.values()) {
      if (!course.modules) continue;
      for (const mod of course.modules) {
        if (!mod.lessons) continue;
        const lesson = mod.lessons.find((l) => l.id === idOrSlug || l.slug === idOrSlug);
        if (lesson) {
          if (!options?.includeDrafts) {
            if (
              lesson.status !== 'published' ||
              mod.status !== 'published' ||
              course.status !== 'published'
            ) {
              continue;
            }
          }
          // Attach assets
          const assets = this.getLessonAssets(lesson.id);
          const decoratedLesson: AcademyLesson = {
            ...lesson,
            assets,
          };
          return { lesson: decoratedLesson, course, module: mod };
        }
      }
    }
    return undefined;
  }

  public getLessonBySlug(
    slug: string,
    options?: { includeDrafts?: boolean }
  ): { lesson: AcademyLesson; course: AcademyCourse; module: AcademyModule } | undefined {
    return this.getLesson(slug, options);
  }

  public createLesson(
    courseId: string,
    moduleId: string,
    input: Omit<AcademyLesson, 'id' | 'courseId' | 'moduleId' | 'createdAt' | 'updatedAt'>
  ): AcademyLesson {
    const course = this.courses.get(courseId);
    if (!course || !course.modules) throw new Error(`Course ${courseId} not found`);

    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod) throw new Error(`Module ${moduleId} not found`);

    if (!this.isLessonSlugUnique(moduleId, input.slug)) {
      throw new Error(`Lesson slug "${input.slug}" is already in use in module ${mod.title}.`);
    }

    if (!mod.lessons) mod.lessons = [];

    const id = `les-${input.slug || Date.now()}`;
    const now = new Date().toISOString();
    const newLesson: AcademyLesson = {
      ...input,
      id,
      courseId,
      moduleId,
      createdAt: now,
      updatedAt: now,
    };

    mod.lessons.push(newLesson);
    mod.updatedAt = now;
    course.updatedAt = now;
    this.saveToDisk();
    return newLesson;
  }

  public updateLesson(
    lessonId: string,
    updates: Partial<AcademyLesson>
  ): AcademyLesson | undefined {
    let lastUpdated: AcademyLesson | undefined;
    for (const course of this.courses.values()) {
      if (!course.modules) continue;
      for (const mod of course.modules) {
        if (!mod.lessons) continue;
        for (let idx = 0; idx < mod.lessons.length; idx++) {
          if (mod.lessons[idx].id === lessonId || mod.lessons[idx].slug === lessonId) {
            if (updates.slug && updates.slug !== mod.lessons[idx].slug) {
              if (!this.isLessonSlugUnique(mod.id, updates.slug, lessonId)) {
                throw new Error(
                  `Lesson slug "${updates.slug}" is already in use in module ${mod.title}.`
                );
              }
            }

            const updated: AcademyLesson = {
              ...mod.lessons[idx],
              ...updates,
              id: mod.lessons[idx].id,
              updatedAt: new Date().toISOString(),
            };
            mod.lessons[idx] = updated;
            mod.updatedAt = new Date().toISOString();
            course.updatedAt = new Date().toISOString();
            lastUpdated = updated;
          }
        }
      }
    }
    if (lastUpdated) {
      this.saveToDisk();
      return lastUpdated;
    }
    return undefined;
  }

  public deleteLesson(lessonIdOrCourseId: string, moduleId?: string, lessonId?: string): boolean {
    const targetId = lessonId || lessonIdOrCourseId;
    let found = false;
    for (const course of this.courses.values()) {
      if (!course.modules) continue;
      for (const mod of course.modules) {
        if (!mod.lessons) continue;
        const initLen = mod.lessons.length;
        mod.lessons = mod.lessons.filter((l) => l.id !== targetId && l.slug !== targetId);
        if (mod.lessons.length !== initLen) {
          mod.updatedAt = new Date().toISOString();
          course.updatedAt = new Date().toISOString();
          found = true;
        }
      }
    }
    if (found) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // ==========================================
  // NAVIGATION TREE & CONTEXT RESOLVER
  // ==========================================

  public getNavigationTree(
    options: { includeDrafts?: boolean } = {}
  ): AcademyNavigationTreeCategory[] {
    const categories = this.getCategories({ includeInactive: options.includeDrafts });
    const allCourses = Array.from(this.courses.values());

    // Map top-level categories
    const topLevelCategories = categories.filter((c) => !c.parentCategoryId);
    const subCategories = categories.filter((c) => !!c.parentCategoryId);

    const buildCategoryTree = (cat: AcademyCategory): AcademyNavigationTreeCategory => {
      // Find courses belonging to this category
      let matchingCourses = allCourses.filter((c) => c.categoryId === cat.id);
      if (!options.includeDrafts) {
        matchingCourses = matchingCourses.filter((c) => c.status === 'published');
      }
      matchingCourses.sort((a, b) => a.sortOrder - b.sortOrder);

      const treeCourses: AcademyNavigationTreeCourse[] = matchingCourses.map((course) => {
        let mods = course.modules || [];
        if (!options.includeDrafts) {
          mods = mods.filter((m) => m.status === 'published');
        }
        mods.sort((a, b) => a.sortOrder - b.sortOrder);

        let totalCourseLessons = 0;
        const treeModules: AcademyNavigationTreeModule[] = mods.map((m) => {
          let les = m.lessons || [];
          if (!options.includeDrafts) {
            les = les.filter((l) => l.status === 'published');
          }
          les.sort((a, b) => a.sortOrder - b.sortOrder);
          totalCourseLessons += les.length;

          const treeLessons: AcademyNavigationTreeLesson[] = les.map((l) => ({
            id: l.id,
            moduleId: l.moduleId,
            courseId: l.courseId,
            slug: l.slug,
            title: l.title,
            sortOrder: l.sortOrder,
            status: l.status,
            estimatedReadTime: l.estimatedReadTime,
          }));

          return {
            id: m.id,
            courseId: m.courseId,
            slug: m.slug,
            title: m.title,
            sortOrder: m.sortOrder,
            status: m.status,
            lessons: treeLessons,
          };
        });

        return {
          id: course.id,
          categoryId: course.categoryId,
          slug: course.slug,
          title: course.title,
          subtitle: course.subtitle,
          level: course.level,
          sortOrder: course.sortOrder,
          status: course.status,
          modules: treeModules,
          totalLessons: totalCourseLessons,
        };
      });

      // Find subcategories if any
      const childSubs = subCategories
        .filter((sub) => sub.parentCategoryId === cat.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((sub) => buildCategoryTree(sub));

      const totalLessons =
        treeCourses.reduce((acc, c) => acc + c.totalLessons, 0) +
        childSubs.reduce((acc, s) => acc + s.totalLessons, 0);

      return {
        id: cat.id,
        slug: cat.slug,
        title: cat.title,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        parentCategoryId: cat.parentCategoryId,
        subcategories: childSubs.length > 0 ? childSubs : undefined,
        courses: treeCourses,
        totalLessons,
      };
    };

    return topLevelCategories.map((cat) => buildCategoryTree(cat));
  }

  public getLessonWithContext(idOrSlug: string):
    | {
        lesson: AcademyLesson;
        course: AcademyCourse;
        module: AcademyModule;
        category: AcademyCategory;
        breadcrumbs: BreadcrumbItem[];
        previousLesson?: LessonNavPointer;
        nextLesson?: LessonNavPointer;
        relatedLessons?: {
          id: string;
          slug: string;
          title: string;
          moduleTitle: string;
          estimatedReadTime?: number;
        }[];
        backToCourse?: {
          courseId: string;
          courseSlug: string;
          courseTitle: string;
          categorySlug: string;
        };
        courseOverview?: {
          title: string;
          subtitle?: string;
          description?: string;
          level: string;
          estimatedHours?: number;
          totalModules: number;
          totalLessons: number;
        };
        moduleOverview?: {
          id: string;
          title: string;
          slug: string;
          description?: string;
          totalLessons: number;
        };
      }
    | undefined {
    const res = this.getLesson(idOrSlug);
    if (!res) return undefined;

    const { lesson, course, module } = res;
    const category = this.categories.get(course.categoryId) || {
      id: course.categoryId || 'cat-general',
      slug: 'academy',
      title: 'Academy',
      description: 'Test Automation Academy',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Breadcrumbs resolution
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Academy', href: '/learning' }];

    if (category.parentCategoryId) {
      const parentCat = this.categories.get(category.parentCategoryId);
      if (parentCat) {
        breadcrumbs.push({ label: parentCat.title, href: `/learning/${parentCat.slug}` });
      }
    }

    breadcrumbs.push({ label: category.title, href: `/learning/${category.slug}` });
    breadcrumbs.push({ label: course.title, href: `/learning/${category.slug}/${course.slug}` });
    breadcrumbs.push({ label: module.title });
    breadcrumbs.push({ label: lesson.title, active: true });

    // Flatten all published lessons in course to resolve previous & next
    const allCourseLessons: Array<{
      lesson: AcademyLesson;
      modTitle: string;
    }> = [];

    const sortedMods = (course.modules || [])
      .filter((m) => m.status === 'published')
      .sort((a, b) => a.sortOrder - b.sortOrder);

    for (const m of sortedMods) {
      const sortedLes = (m.lessons || [])
        .filter((l) => l.status === 'published')
        .sort((a, b) => a.sortOrder - b.sortOrder);

      for (const l of sortedLes) {
        allCourseLessons.push({ lesson: l, modTitle: m.title });
      }
    }

    const currentIndex = allCourseLessons.findIndex((item) => item.lesson.id === lesson.id);

    let previousLesson: LessonNavPointer | undefined;
    if (currentIndex > 0) {
      const prev = allCourseLessons[currentIndex - 1];
      previousLesson = {
        id: prev.lesson.id,
        title: prev.lesson.title,
        slug: prev.lesson.slug,
        courseSlug: course.slug,
        categorySlug: category.slug,
        moduleTitle: prev.modTitle,
      };
    }

    let nextLesson: LessonNavPointer | undefined;
    if (currentIndex !== -1 && currentIndex < allCourseLessons.length - 1) {
      const next = allCourseLessons[currentIndex + 1];
      nextLesson = {
        id: next.lesson.id,
        title: next.lesson.title,
        slug: next.lesson.slug,
        courseSlug: course.slug,
        categorySlug: category.slug,
        moduleTitle: next.modTitle,
      };
    }

    const relatedLessons = (module.lessons || [])
      .filter((l) => l.status === 'published' && l.id !== lesson.id)
      .slice(0, 3)
      .map((l) => ({
        id: l.id,
        slug: l.slug,
        title: l.title,
        moduleTitle: module.title,
        estimatedReadTime: l.estimatedReadingTime || l.estimatedReadTime || 5,
      }));

    if (relatedLessons.length < 2) {
      for (const item of allCourseLessons) {
        if (item.lesson.id !== lesson.id && !relatedLessons.some((r) => r.id === item.lesson.id)) {
          relatedLessons.push({
            id: item.lesson.id,
            slug: item.lesson.slug,
            title: item.lesson.title,
            moduleTitle: item.modTitle,
            estimatedReadTime:
              item.lesson.estimatedReadingTime || item.lesson.estimatedReadTime || 5,
          });
          if (relatedLessons.length >= 3) break;
        }
      }
    }

    const backToCourse = {
      courseId: course.id,
      courseSlug: course.slug,
      courseTitle: course.title,
      categorySlug: category.slug,
    };

    const courseOverview = {
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      level: course.level,
      estimatedHours: course.estimatedHours,
      totalModules: sortedMods.length,
      totalLessons: allCourseLessons.length,
    };

    const moduleOverview = {
      id: module.id,
      title: module.title,
      slug: module.slug,
      description: module.description,
      totalLessons: (module.lessons || []).filter((l) => l.status === 'published').length,
    };

    const cleanContentHtml = lesson.contentHtml
      ? lesson.contentHtml
          .replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '')
          .replace(
            /^\s*<p\b[^>]*>\s*(?:<span\b[^>]*>)?\s*<em\b[^>]*>[\s\S]*?<\/em>\s*(?:<\/span>)?\s*<\/p>\s*/i,
            ''
          )
      : lesson.contentHtml;

    return {
      lesson: {
        ...lesson,
        contentHtml: cleanContentHtml,
      },
      course,
      module,
      category,
      breadcrumbs,
      previousLesson,
      nextLesson,
      relatedLessons,
      backToCourse,
      courseOverview,
      moduleOverview,
    };
  }

  // ==========================================
  // REORDERING
  // ==========================================

  public reorderItems(payload: AcademyReorderPayload): boolean {
    const { type, parentId, orderedIds } = payload;

    if (type === 'category') {
      orderedIds.forEach((id, idx) => {
        const cat = this.categories.get(id);
        if (cat) cat.sortOrder = idx + 1;
      });
      this.saveToDisk();
      return true;
    }

    if (type === 'course') {
      orderedIds.forEach((id, idx) => {
        const course = this.courses.get(id);
        if (course) course.sortOrder = idx + 1;
      });
      this.saveToDisk();
      return true;
    }

    if (type === 'module' && parentId) {
      const course = this.courses.get(parentId);
      if (!course || !course.modules) return false;

      const modMap = new Map(course.modules.map((m) => [m.id, m]));
      orderedIds.forEach((id, idx) => {
        const mod = modMap.get(id);
        if (mod) mod.sortOrder = idx + 1;
      });
      course.modules.sort((a, b) => a.sortOrder - b.sortOrder);
      this.saveToDisk();
      return true;
    }

    if (type === 'lesson' && parentId) {
      // parentId is moduleId
      for (const course of this.courses.values()) {
        const mod = course.modules?.find((m) => m.id === parentId);
        if (mod && mod.lessons) {
          const lsnMap = new Map(mod.lessons.map((l) => [l.id, l]));
          orderedIds.forEach((id, idx) => {
            const lsn = lsnMap.get(id);
            if (lsn) lsn.sortOrder = idx + 1;
          });
          mod.lessons.sort((a, b) => a.sortOrder - b.sortOrder);
          this.saveToDisk();
          return true;
        }
      }
    }

    return false;
  }

  // ==========================================
  // DOCUMENT & MEDIA PERSISTENCE
  // ==========================================

  public saveDocumentSource(doc: AcademyDocumentSource): void {
    this.docSources.set(doc.id, doc);
    this.saveToDisk();
  }

  public getDocumentSource(id: string): AcademyDocumentSource | undefined {
    return this.docSources.get(id);
  }

  public saveMediaAttachment(media: AcademyMediaAttachment): void {
    this.mediaAttachments.set(media.id, media);
    this.saveToDisk();
  }

  public getMediaAttachment(id: string): AcademyMediaAttachment | undefined {
    return this.mediaAttachments.get(id);
  }
  // ==========================================
  // LESSON ASSETS
  // ==========================================

  public getLessonAssets(lessonId: string): AcademyLessonAsset[] {
    const list: AcademyLessonAsset[] = [];
    for (const asset of this.lessonAssets.values()) {
      if (asset.lessonId === lessonId) {
        list.push(asset);
      }
    }
    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public saveLessonAsset(
    assetInput: Omit<AcademyLessonAsset, 'id'> & { id?: string }
  ): AcademyLessonAsset {
    const id = assetInput.id || `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const asset: AcademyLessonAsset = {
      ...assetInput,
      id,
      createdAt: assetInput.createdAt || now,
    };
    this.lessonAssets.set(id, asset);
    this.saveToDisk();
    return asset;
  }

  public deleteLessonAsset(id: string): boolean {
    if (!this.lessonAssets.has(id)) return false;
    this.lessonAssets.delete(id);
    this.saveToDisk();
    return true;
  }

  // ==========================================
  // USER LESSON PROGRESS
  // ==========================================

  public getUserProgress(userId: string, lessonId?: string): UserLessonProgress[] {
    const list: UserLessonProgress[] = [];
    for (const prog of this.userProgress.values()) {
      if (prog.userId === userId) {
        if (!lessonId || prog.lessonId === lessonId) {
          list.push(prog);
        }
      }
    }
    return list;
  }

  public recordUserProgress(input: {
    userId: string;
    lessonId: string;
    completionStatus: 'not_started' | 'in_progress' | 'completed';
  }): UserLessonProgress {
    const key = `${input.userId}:${input.lessonId}`;
    const now = new Date().toISOString();
    const existing = this.userProgress.get(key);

    const updated: UserLessonProgress = {
      id: existing ? existing.id : `prog-${input.userId}-${input.lessonId}`,
      userId: input.userId,
      lessonId: input.lessonId,
      completionStatus: input.completionStatus,
      lastAccessedAt: now,
      completedAt: input.completionStatus === 'completed' ? existing?.completedAt || now : null,
    };

    this.userProgress.set(key, updated);
    this.saveToDisk();
    return updated;
  }

  public getUserLearningStats(userId: string): UserLearningStats {
    const userProgs = this.getUserProgress(userId);
    const progMap = new Map<string, UserLessonProgress>();
    userProgs.forEach((p) => progMap.set(p.lessonId, p));

    const publishedCourses = Array.from(this.courses.values()).filter(
      (c) => c.status === 'published'
    );

    let totalLessonsCount = 0;
    let totalCompletedCount = 0;
    let totalVisitedCount = 0;

    let lastAccessedRecord: {
      lesson: AcademyLesson;
      course: AcademyCourse;
      module: AcademyModule;
      lastAccessedAt: string;
    } | null = null;

    const completedLessonsList: {
      lessonId: string;
      lessonSlug: string;
      lessonTitle: string;
      moduleTitle: string;
      courseTitle: string;
      courseSlug: string;
      completedAt: string;
    }[] = [];

    const recentlyViewedList: {
      lessonId: string;
      lessonSlug: string;
      lessonTitle: string;
      moduleTitle: string;
      courseTitle: string;
      courseSlug: string;
      lastAccessedAt: string;
      completionStatus: 'in_progress' | 'completed';
    }[] = [];

    const courseProgressList: CourseProgressStat[] = [];

    for (const course of publishedCourses) {
      let courseTotalLessons = 0;
      let courseCompletedLessons = 0;
      let courseVisitedLessons = 0;
      const moduleStats: ModuleProgressStat[] = [];

      const sortedMods = (course.modules || [])
        .filter((m) => m.status === 'published')
        .sort((a, b) => a.sortOrder - b.sortOrder);

      for (const mod of sortedMods) {
        const publishedLessons = (mod.lessons || [])
          .filter((l) => l.status === 'published')
          .sort((a, b) => a.sortOrder - b.sortOrder);

        let modCompleted = 0;
        let modVisited = 0;

        for (const lsn of publishedLessons) {
          courseTotalLessons++;
          totalLessonsCount++;
          const p = progMap.get(lsn.id) || progMap.get(lsn.slug);
          if (p) {
            modVisited++;
            courseVisitedLessons++;
            totalVisitedCount++;

            if (
              !lastAccessedRecord ||
              new Date(p.lastAccessedAt) > new Date(lastAccessedRecord.lastAccessedAt)
            ) {
              lastAccessedRecord = {
                lesson: lsn,
                course,
                module: mod,
                lastAccessedAt: p.lastAccessedAt,
              };
            }

            recentlyViewedList.push({
              lessonId: lsn.id,
              lessonSlug: lsn.slug,
              lessonTitle: lsn.title,
              moduleTitle: mod.title,
              courseTitle: course.title,
              courseSlug: course.slug,
              lastAccessedAt: p.lastAccessedAt,
              completionStatus: p.completionStatus === 'completed' ? 'completed' : 'in_progress',
            });

            if (p.completionStatus === 'completed') {
              modCompleted++;
              courseCompletedLessons++;
              totalCompletedCount++;
              completedLessonsList.push({
                lessonId: lsn.id,
                lessonSlug: lsn.slug,
                lessonTitle: lsn.title,
                moduleTitle: mod.title,
                courseTitle: course.title,
                courseSlug: course.slug,
                completedAt: p.completedAt || p.lastAccessedAt,
              });
            }
          }
        }

        const modPercent =
          publishedLessons.length > 0
            ? Math.round((modCompleted / publishedLessons.length) * 100)
            : 0;
        moduleStats.push({
          moduleId: mod.id,
          moduleTitle: mod.title,
          moduleSlug: mod.slug,
          totalLessons: publishedLessons.length,
          completedLessons: modCompleted,
          visitedLessons: modVisited,
          percentCompleted: modPercent,
        });
      }

      const coursePercent =
        courseTotalLessons > 0
          ? Math.round((courseCompletedLessons / courseTotalLessons) * 100)
          : 0;
      courseProgressList.push({
        courseId: course.id,
        courseTitle: course.title,
        courseSlug: course.slug,
        level: course.level,
        totalLessons: courseTotalLessons,
        completedLessons: courseCompletedLessons,
        visitedLessons: courseVisitedLessons,
        percentCompleted: coursePercent,
        modules: moduleStats,
      });
    }

    recentlyViewedList.sort(
      (a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    );
    completedLessonsList.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    const enrolledSet = this.enrolledCourses.get(userId) || new Set<string>();
    courseProgressList.forEach((cp) => {
      if (cp.visitedLessons > 0) {
        enrolledSet.add(cp.courseId);
      }
    });

    return {
      userId,
      totalLessons: totalLessonsCount,
      totalVisited: totalVisitedCount,
      totalCompleted: totalCompletedCount,
      overallPercentCompleted:
        totalLessonsCount > 0 ? Math.round((totalCompletedCount / totalLessonsCount) * 100) : 0,
      lastAccessedLesson: lastAccessedRecord
        ? {
            lessonId: lastAccessedRecord.lesson.id,
            lessonSlug: lastAccessedRecord.lesson.slug,
            lessonTitle: lastAccessedRecord.lesson.title,
            moduleTitle: lastAccessedRecord.module.title,
            courseTitle: lastAccessedRecord.course.title,
            courseSlug: lastAccessedRecord.course.slug,
            lastAccessedAt: lastAccessedRecord.lastAccessedAt,
          }
        : null,
      courseProgress: courseProgressList,
      completedLessons: completedLessonsList,
      recentlyViewedLessons: recentlyViewedList.slice(0, 10),
      enrolledCourseIds: Array.from(enrolledSet),
    };
  }

  // ==========================================
  // USER LESSON BOOKMARKS
  // ==========================================

  public getUserBookmarks(userId: string): AcademyLessonBookmark[] {
    const list: AcademyLessonBookmark[] = [];
    for (const b of this.userBookmarks.values()) {
      if (b.userId === userId) {
        list.push(b);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public isLessonBookmarked(userId: string, lessonId: string): boolean {
    return this.userBookmarks.has(`${userId}:${lessonId}`);
  }

  public toggleBookmark(
    userId: string,
    lessonId: string
  ): { bookmarked: boolean; bookmark?: AcademyLessonBookmark } {
    const key = `${userId}:${lessonId}`;
    if (this.userBookmarks.has(key)) {
      this.userBookmarks.delete(key);
      this.saveToDisk();
      return { bookmarked: false };
    }

    const lessonCtx = this.getLessonWithContext(lessonId);
    let courseTitle = lessonCtx?.course?.title || 'Learning Course';
    let courseSlug = lessonCtx?.course?.slug || 'course';
    let moduleTitle = lessonCtx?.module?.title || 'Learning Module';
    let lessonTitle = lessonCtx?.lesson?.title || lessonId;
    let lessonSlug = lessonCtx?.lesson?.slug || lessonId;

    if (!lessonCtx) {
      for (const course of this.courses.values()) {
        for (const mod of course.modules || []) {
          const lsn = (mod.lessons || []).find((l) => l.id === lessonId || l.slug === lessonId);
          if (lsn) {
            courseTitle = course.title;
            courseSlug = course.slug;
            moduleTitle = mod.title;
            lessonTitle = lsn.title;
            lessonSlug = lsn.slug;
            break;
          }
        }
      }
    }

    const bookmark: AcademyLessonBookmark = {
      id: `bm-${userId}-${lessonId}`,
      userId,
      lessonId,
      lessonSlug,
      lessonTitle,
      moduleTitle,
      courseTitle,
      courseSlug,
      createdAt: new Date().toISOString(),
    };

    this.userBookmarks.set(key, bookmark);
    this.saveToDisk();
    return { bookmarked: true, bookmark };
  }

  public removeBookmark(userId: string, lessonId: string): boolean {
    const key = `${userId}:${lessonId}`;
    if (this.userBookmarks.has(key)) {
      this.userBookmarks.delete(key);
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // ==========================================
  // COURSE ENROLLMENT
  // ==========================================

  public enrollUserInCourse(userId: string, courseId: string): boolean {
    let userCourses = this.enrolledCourses.get(userId);
    if (!userCourses) {
      userCourses = new Set<string>();
      this.enrolledCourses.set(userId, userCourses);
    }
    userCourses.add(courseId);
    this.saveToDisk();
    return true;
  }

  public getUserEnrolledCourses(userId: string): string[] {
    const stats = this.getUserLearningStats(userId);
    return stats.enrolledCourseIds;
  }

  // ==========================================
  // GLOBAL CURRICULUM SEARCH
  // ==========================================

  public searchCurriculum(
    query: string,
    options: { limit?: number; includeDrafts?: boolean } = {}
  ): AcademySearchResult[] {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const limit = options.limit || 20;
    const includeDrafts = !!options.includeDrafts;
    const tokens = q.split(/\s+/).filter(Boolean);

    // Build in-memory search index if not yet ready
    if (!this.searchIndexCache) {
      this.buildSearchIndex();
    }

    const scoredResults: Array<{ result: AcademySearchResult; score: number }> = [];

    for (const item of this.searchIndexCache || []) {
      if (!includeDrafts && item.status !== 'published') continue;

      const titleLower = item.lessonTitle.toLowerCase();
      const summaryLower = item.summary.toLowerCase();
      const courseLower = item.courseTitle.toLowerCase();
      const modLower = item.moduleTitle.toLowerCase();

      const titleMatches = titleLower.includes(q);
      const summaryMatches = summaryLower.includes(q);
      const courseMatches = courseLower.includes(q);
      const modMatches = modLower.includes(q);
      const allTokensMatch =
        tokens.length > 1 && tokens.every((t) => item.searchMetaLower.includes(t));

      let contentMatches = false;
      if (
        !titleMatches &&
        !summaryMatches &&
        !courseMatches &&
        !modMatches &&
        !allTokensMatch &&
        item.contentHtml
      ) {
        if (!item.contentLower) {
          item.contentLower = item.contentHtml.toLowerCase();
        }
        contentMatches = item.contentLower.includes(q);
      }

      if (
        titleMatches ||
        summaryMatches ||
        courseMatches ||
        modMatches ||
        allTokensMatch ||
        contentMatches
      ) {
        let matchedField: 'title' | 'summary' | 'content' | 'module' | 'course' = 'title';
        let snippet = item.summary;
        let score = 0;

        if (allTokensMatch) {
          score += 70;
          matchedField = 'title';
        }
        if (courseMatches) {
          score += 100;
          matchedField = 'course';
          snippet = `Course: ${item.courseTitle}`;
        }
        if (modMatches) {
          score += 60;
          matchedField = 'module';
          snippet = `Module: ${item.moduleTitle}`;
        }
        if (titleMatches) {
          score += 80;
          matchedField = 'title';
        }
        if (summaryMatches) {
          score += 30;
          if (matchedField === 'course' || matchedField === 'module') matchedField = 'summary';
        }
        if (contentMatches && item.contentHtml) {
          score += 15;
          matchedField = 'content';
          const cleanContent = item.contentHtml.replace(/<[^>]*>/g, ' ');
          const idx = cleanContent.toLowerCase().indexOf(q);
          const start = Math.max(0, idx - 40);
          const end = Math.min(cleanContent.length, idx + q.length + 60);
          snippet =
            (start > 0 ? '...' : '') +
            cleanContent.substring(start, end).trim() +
            (end < cleanContent.length ? '...' : '');
        }

        scoredResults.push({
          result: {
            id: item.id,
            type: 'lesson',
            title: item.lessonTitle,
            snippet,
            lessonSlug: item.lessonSlug,
            courseTitle: item.courseTitle,
            courseSlug: item.courseSlug,
            moduleTitle: item.moduleTitle,
            matchedField,
          },
          score,
        });
      }
    }

    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.slice(0, limit).map((s) => s.result);
  }

  // ==========================================
  // PUBLISHING HELPERS
  // ==========================================

  public setPublishStatus(
    entityType: 'course' | 'module' | 'lesson',
    id: string,
    status: AcademyPublishStatus
  ): boolean {
    if (entityType === 'course') {
      const course = this.courses.get(id);
      if (!course) return false;
      course.status = status;
      course.updatedAt = new Date().toISOString();
      this.saveToDisk();
      return true;
    }

    if (entityType === 'module') {
      let found = false;
      for (const course of this.courses.values()) {
        if (!course.modules) continue;
        for (const mod of course.modules) {
          if (mod.id === id || mod.slug === id) {
            mod.status = status;
            mod.updatedAt = new Date().toISOString();
            course.updatedAt = new Date().toISOString();
            found = true;
          }
        }
      }
      if (found) {
        this.saveToDisk();
        return true;
      }
      return false;
    }

    if (entityType === 'lesson') {
      let found = false;
      for (const course of this.courses.values()) {
        if (!course.modules) continue;
        for (const mod of course.modules) {
          if (!mod.lessons) continue;
          for (const lsn of mod.lessons) {
            if (lsn.id === id || lsn.slug === id) {
              lsn.status = status;
              lsn.updatedAt = new Date().toISOString();
              if (status === 'published' && !lsn.publishedAt) {
                lsn.publishedAt = new Date().toISOString();
              }
              mod.updatedAt = new Date().toISOString();
              course.updatedAt = new Date().toISOString();
              found = true;
            }
          }
        }
      }
      if (found) {
        this.saveToDisk();
        return true;
      }
      return false;
    }

    return false;
  }
}

export const academyStore = AcademyStore.getInstance();
