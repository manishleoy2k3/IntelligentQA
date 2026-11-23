/**
 * scripts/populate-phase8-complete-catalogue.js
 * Generates Phase 8 standardized 9-course curriculum:
 * 1. Selenium Automation (10 modules, 90 lessons)
 * 2. Playwright Automation (9 modules, 63 lessons)
 * 3. API Testing (8 modules, 57 lessons)
 * 4. Appium Mobile Automation (8 modules, 53 lessons)
 * 5. Rest Assured Automation (7 modules, 40 lessons)
 * 6. Git & CI/CD (7 modules, 38 lessons)
 * 7. GitHub Actions (6 modules, 30 lessons)
 * 8. APM & Performance Testing (7 modules, 39 lessons)
 * 9. AI Academy (6 modules, 46 lessons intact)
 */

const fs = require('fs');
const path = require('path');
const { makeStandardHtml } = require('./build-phase8-complete-catalogue');

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

// Ensure required categories exist
const requiredCategories = [
  {
    id: 'cat-ai-for-qa',
    slug: 'ai-for-qa',
    title: 'AI Academy',
    description: 'AI-driven test automation, LLM evaluations, autonomous agents, and intelligent quality engineering.',
    icon: 'Bot',
    sortOrder: 1,
    parentCategoryId: null,
    isActive: true,
  },
  {
    id: 'cat-selenium',
    slug: 'selenium',
    title: 'Selenium',
    description: 'Enterprise Selenium WebDriver 4, W3C protocol, dynamic waits, and Page Object Model frameworks.',
    icon: 'Globe',
    sortOrder: 2,
    parentCategoryId: null,
    isActive: true,
  },
  {
    id: 'cat-playwright',
    slug: 'playwright',
    title: 'Playwright',
    description: 'Modern end-to-end automation with Microsoft Playwright, auto-waiting, trace viewer, and network mocking.',
    icon: 'Code2',
    sortOrder: 3,
    parentCategoryId: null,
    isActive: true,
  },
  {
    id: 'cat-api-testing',
    slug: 'api-testing',
    title: 'API Testing',
    description: 'Contract testing with Pact, Postman/Newman automation, GraphQL validation, and performance tests.',
    icon: 'Layers',
    sortOrder: 4,
    parentCategoryId: null,
    isActive: true,
  },
  {
    id: 'cat-appium',
    slug: 'appium',
    title: 'Appium',
    description: 'Cross-platform mobile automation for iOS and Android native, hybrid, and web applications.',
    icon: 'Smartphone',
    sortOrder: 5,
    parentCategoryId: null,
    isActive: true,
  },
  {
    id: 'cat-rest-assured',
    slug: 'rest-assured',
    title: 'Rest Assured',
    description: 'REST Assured Java automation, JSON schema validation, OAuth2, and scalable API testing.',
    icon: 'Server',
    sortOrder: 6,
    parentCategoryId: null,
    isActive: true,
  },
  {
    id: 'cat-git-cicd',
    slug: 'git-cicd',
    title: 'Git & CI/CD',
    description: 'Continuous Integration and Continuous Delivery pipelines, automated test runs, and Git workflows.',
    icon: 'GitBranch',
    sortOrder: 7,
    parentCategoryId: null,
    isActive: true,
  },
  {
    id: 'cat-github-actions',
    slug: 'github-actions',
    title: 'GitHub Actions',
    description: 'Automated test execution, matrix runs, secrets management, and custom composite actions.',
    icon: 'Workflow',
    sortOrder: 8,
    parentCategoryId: 'cat-git-cicd',
    isActive: true,
  },
  {
    id: 'cat-apm-performance',
    slug: 'apm-performance',
    title: 'APM & Performance Testing',
    description: 'Application Performance Monitoring, JMeter load testing, distributed tracing, and metrics.',
    icon: 'Activity',
    sortOrder: 9,
    parentCategoryId: null,
    isActive: true,
  },
  {
    id: 'cat-azure-devops',
    slug: 'azure-devops',
    title: 'Azure DevOps',
    description: 'Azure DevOps Pipelines, Test Plans, and CI/CD quality gates.',
    icon: 'Terminal',
    sortOrder: 10,
    parentCategoryId: 'cat-git-cicd',
    isActive: true,
  },
  {
    id: 'cat-jenkins',
    slug: 'jenkins',
    title: 'Jenkins',
    description: 'Declarative Jenkins Pipelines, master-agent architecture, and Allure integration.',
    icon: 'Cpu',
    sortOrder: 11,
    parentCategoryId: 'cat-git-cicd',
    isActive: true,
  },
];

requiredCategories.forEach(rc => {
  const existing = store.academyCategories.find(c => c.id === rc.id || c.slug === rc.slug);
  if (existing) {
    existing.title = rc.title;
    existing.slug = rc.slug;
    existing.description = rc.description;
    existing.icon = rc.icon;
  } else {
    store.academyCategories.push({
      ...rc,
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
    });
  }
});

// Helper to create lesson item with 13 standard sections
function createStandardLesson(courseId, modId, modIdx, lsnIdx, title, customData = null) {
  const lsnSlug = slugify(title);
  const id = `les-${courseId.replace('course-', '')}-${modIdx + 1}-${lsnIdx + 1}-${lsnSlug.substring(0, 32)}`;

  let standardData = null;
  let summary = `Master ${title} in enterprise software quality engineering and automated testing architectures.`;

  if (customData) {
    standardData = customData;
    if (customData.overview && customData.overview.whatIsIt) {
      summary = customData.overview.whatIsIt;
    }
  } else {
    standardData = {
      overview: {
        whatIsIt: `${title} is a critical capability in modern enterprise quality engineering and automated test suites.`,
        whyImportant: `Understanding ${title} prevents test flakiness, optimizes feedback loops, and aligns automation with production requirements.`,
        whereUsed: `Applied in continuous integration pipelines, regression suites, and automated test frameworks.`,
      },
      learningObjectives: [
        `Understand the core technical principles and runtime behavior of ${title}.`,
        `Apply industry best practices and avoid common anti-patterns in enterprise frameworks.`,
        `Synthesize deterministic, maintainable automation scripts covering positive and edge-case scenarios.`,
        `Troubleshoot and diagnose common exceptions and failures relating to ${title}.`,
      ],
      conceptExplanation: {
        theory: [
          `In modern quality engineering, <strong>${title}</strong> provides deterministic verification boundaries across distributed software architectures. By isolating test preconditions and enforcing explicit contracts, engineering teams eliminate flakiness and accelerate release confidence.`,
          `When implementing ${title}, automation architects balance test execution velocity against system isolation depth to ensure resilient, reproducible outcomes across both local and CI/CD execution environments.`,
        ],
        terminology: [
          { term: 'Deterministic Verification', definition: 'A test run that yields identical outcomes on every execution given identical inputs and preconditions.' },
          { term: 'Boundary Condition', definition: 'An input value or state transition at the extreme edge of an equivalence partition.' },
          { term: 'Shift-Left Verification', definition: 'Integrating automated quality gates early in the design and code phases to prevent defects.' },
        ],
        practicalUnderstanding: `QA professionals utilize ${title} to transform complex customer journeys into atomic, repeatable verification steps without brittle manual dependencies.`,
      },
      architectureDiagram: {
        type: 'pipeline',
        title: `${title} Execution Architecture`,
        caption: `Runtime lifecycle and component flow for ${title}`,
        nodes: [
          { id: '1', label: '1. Test Fixture Initialization', subtitle: 'Driver / Client setup', badge: 'Precondition', highlight: false },
          { id: '2', label: '2. Action Dispatch', subtitle: 'Execute command or payload', badge: 'Execution', highlight: true },
          { id: '3', label: '3. State Synchronization', subtitle: 'Await dynamic DOM/network stabilization', badge: 'Wait Guard', highlight: false },
          { id: '4', label: '4. Assertion Engine', subtitle: 'Assert expected invariants', badge: 'Verification', highlight: true },
        ],
        componentsExplanation: [
          { name: 'Driver / Client', details: 'Directly coordinates protocol communication with the system under test.' },
          { name: 'Synchronization Layer', details: 'Guarantees race-condition prevention before assertion execution.' },
          { name: 'Assertion Engine', details: 'Evaluates state invariants and generates rich failure diagnostics.' },
        ],
      },
      howItWorks: {
        internalMechanism: `${title} coordinates protocol communication, state verification, and assertion engines to evaluate system correctness.`,
        steps: [
          { stepNumber: 1, title: 'Initialize Test Fixture', description: 'Configure drivers, client sessions, and isolated test preconditions.' },
          { stepNumber: 2, title: 'Execute Action & Dispatch Request', description: 'Trigger user interactions, HTTP dispatches, or state mutations.' },
          { stepNumber: 3, title: 'Dynamic Synchronization', description: 'Await asynchronous state stabilization using zero-flake wait conditions.' },
          { stepNumber: 4, title: 'Assert State & Teardown', description: 'Verify atomic assertions and cleanly release hardware resources.' },
        ],
      },
      practicalImplementation: {
        description: `Implementing ${title} in enterprise test automation frameworks requires modular layering and explicit synchronization.`,
        prerequisites: ['Configured test runner', 'Runtime dependencies installed', 'Isolated environment access'],
        steps: [
          'Declare isolated preconditions and test data fixtures.',
          'Execute the primary interaction through domain-specific abstractions.',
          'Verify outcomes with explicit assertions and clean up resources.',
        ],
      },
      codeExamples: [
        {
          title: `${title} Implementation Example`,
          language: 'typescript',
          filename: `${slugify(title)}.spec.ts`,
          code: `import { test, expect } from '@playwright/test';\n\ntest.describe('${title} Enterprise Test', () => {\n  test('should execute deterministically with dynamic assertion', async ({ page }) => {\n    // 1. Arrange & Navigate\n    await page.goto('/dashboard');\n    \n    // 2. Act: Dispatch user interaction\n    const targetElement = page.getByRole('button', { name: 'Submit' });\n    await expect(targetElement).toBeVisible();\n    await targetElement.click();\n    \n    // 3. Assert: Verify state invariant\n    await expect(page.locator('.status-banner')).toHaveText('Success');\n  });\n});`,
          explanation: `Demonstrates deterministic execution, role-based locators, and auto-waiting assertions for ${title}.`,
        },
      ],
      qaUseCases: [
        {
          title: 'Automated Regression Suite Quality Gate',
          scenario: `Validating critical paths and boundary transitions for ${title} on every Pull Request merge.`,
          enterpriseApplication: 'Executing 500+ parallel tests in under 10 minutes within GitHub Actions or Jenkins pipelines.',
        },
      ],
      commonProblems: [
        {
          error: 'ElementNotInteractableException / TimeoutError',
          rootCause: 'Element is present in DOM but obscured by animation overlays or disabled pending network payload.',
          troubleshootingSteps: [
            'Inspect network activity to ensure pending AJAX requests resolve.',
            'Replace static Thread.sleep with explicit state condition polling.',
            'Verify element coordinates and scroll into viewport if necessary.',
          ],
          codeFix: `// Wait dynamically for interactable state\nawait expect(locator).toBeVisible({ timeout: 5000 });\nawait locator.click();`,
        },
      ],
      bestPractices: [
        {
          title: 'Fail-Fast Precondition Checks',
          category: 'Industry Standard',
          recommendation: 'Verify environment connectivity and database seeding before launching heavy UI browser sessions.',
          impact: 'Preserves CI worker compute time and eliminates cascading false positives.',
        },
        {
          title: 'Zero Hardcoded Sleep Intervals',
          category: 'Performance',
          recommendation: 'Always utilize dynamic, event-driven polling waits instead of static thread sleep timers.',
          impact: 'Reduces overall test execution duration by 40% - 60%.',
        },
      ],
      comparison: {
        title: `${title} vs Traditional Verification`,
        comparedTo: 'Manual / Brittle Verification',
        advantages: [
          'Deterministic repeatability across local and CI environments',
          'Immediate regression feedback on developer pull requests',
          'Self-documenting executable specifications',
        ],
        limitations: [
          'Requires upfront framework investment and maintenance',
          'Vulnerable to brittle selectors if not abstracted behind Page Objects',
        ],
      },
      interviewQuestions: [
        {
          level: 'Intermediate',
          question: `How do you handle flakiness and synchronization issues when working with ${title}?`,
          answer: `Flakiness is prevented by eliminating arbitrary thread sleeps and adopting explicit expected conditions (e.g., WebDriverWait in Selenium, auto-waiting in Playwright). All network and animation states must stabilize before interacting with elements.`,
        },
        {
          level: 'Architect-Level',
          question: `How would you architect a scalable test automation pipeline incorporating ${title} across 100+ microservices?`,
          answer: `Decouple UI tests from backend state by seeding test fixtures via fast API endpoints or Kafka events. Execute tests in ephemeral Docker containers in parallel via GitHub Actions matrix workflows, with automated trace capture on failure.`,
        },
      ],
      summary: {
        takeaways: [
          `${title} forms a foundational pillar in enterprise test automation architecture.`,
          `Deterministic assertions and dynamic waits are mandatory to prevent flakiness in continuous integration.`,
          `Abstract low-level framework APIs behind reusable service and page object layers.`,
        ],
        keyTerminology: ['Deterministic Verification', 'Zero-Flake Synchronization', 'Idempotent Execution'],
        nextSteps: 'Proceed to next module to integrate advanced assertions and framework abstractions.',
      },
    };
  }

  const contentHtml = makeStandardHtml(standardData);

  return {
    id,
    moduleId: modId,
    courseId,
    slug: lsnSlug,
    title,
    summary,
    shortDescription: summary,
    contentType: 'html',
    contentHtml,
    blockData: {
      standardData,
    },
    wordCount: 850,
    estimatedReadTime: 6,
    estimatedReadingTime: 6,
    sortOrder: lsnIdx + 1,
    status: 'published',
    publishedAt: '2026-11-23T00:00:00.000Z',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
  };
}

// ==========================================
// RICH FOUNDATIONAL LESSON DATA REPOSITORY
// ==========================================

const richFoundationalLessons = {
  // 1. Selenium
  'selenium-what-is-selenium': {
    overview: {
      whatIsIt: 'Selenium is the industry-standard open-source automated testing suite for web applications across multiple browsers and platforms.',
      whyImportant: 'It powers browser automation across enterprise regression suites, supporting W3C standard WebDriver protocols natively recognized by all major browser vendors.',
      whereUsed: 'End-to-end regression testing, cross-browser validation (Chrome, Firefox, Safari, Edge), and large-scale parallel test execution grids.',
    },
    learningObjectives: [
      'Understand the history, evolution, and W3C standardization of Selenium WebDriver.',
      'Differentiate between Selenium WebDriver, Selenium Grid, and Selenium IDE.',
      'Analyze browser driver communication protocols and client-server bindings.',
      'Evaluate when to choose Selenium versus modern alternatives like Playwright.',
    ],
    conceptExplanation: {
      theory: [
        'Selenium began in 2004 as JavaScript-injected automation (Selenium Core) and evolved into Selenium WebDriver, which communicates directly with browser native engines via the <strong>W3C WebDriver Standard (RFC 7497)</strong>.',
        'In Selenium 4, the architecture was fully standardized: client language bindings (Java, Python, C#, JS) communicate directly over HTTP/HTTPS with browser drivers (ChromeDriver, GeckoDriver, msedgedriver) without legacy JSON Wire Protocol encoding wrappers.',
      ],
      terminology: [
        { term: 'W3C WebDriver Protocol', definition: 'The official W3C standard RESTful web service API exposed by browser drivers to control user agents.' },
        { term: 'Browser Driver', definition: 'A standalone executable (e.g. chromedriver.exe) that translates W3C HTTP commands into browser internal commands.' },
        { term: 'BiDi (Bidirectional) API', definition: 'Next-gen protocol enabling real-time WebSocket communication for console logs, DOM mutations, and network interception.' },
      ],
      practicalUnderstanding: 'SDETs write test scripts in Java or Python. The script dispatches HTTP commands to ChromeDriver, which uses Chrome DevTools Protocol / C++ APIs to drive real browser processes.',
    },
    architectureDiagram: {
      type: 'client-server',
      title: 'Selenium 4 W3C WebDriver Architecture',
      caption: 'Direct W3C HTTP/HTTPS communication between Client Bindings and Browser Drivers',
      nodes: [
        { id: '1', label: 'Selenium Client Library', subtitle: 'Java / Python / C# Test Scripts', badge: 'Client', highlight: false },
        { id: '2', label: 'W3C WebDriver Protocol', subtitle: 'RESTful HTTP / JSON over HTTPS', badge: 'Transport', highlight: true },
        { id: '3', label: 'Browser Drivers', subtitle: 'ChromeDriver / GeckoDriver / EdgeDriver', badge: 'Driver', highlight: false },
        { id: '4', label: 'Target Browsers', subtitle: 'Chrome / Firefox / Edge / Safari', badge: 'User Agent', highlight: true },
      ],
      componentsExplanation: [
        { name: 'Selenium Client Bindings', details: 'Language-specific SDKs providing WebDriver, WebElement, and WebDriverWait classes.' },
        { name: 'W3C Standard Endpoint', details: 'Enforces uniform command structure across all browser implementations without dialect mismatch.' },
        { name: 'Browser Driver Process', details: 'Lightweight HTTP server running locally on machine or container translating endpoints to native browser events.' },
        { name: 'Browser Engine', details: 'Renders DOM, runs JavaScript V8, and generates graphical display.' },
      ],
    },
    howItWorks: {
      internalMechanism: 'Test methods invoke WebDriver commands which serialize into standard HTTP POST/GET requests dispatched to the driver port.',
      steps: [
        { stepNumber: 1, title: 'Session Creation', description: 'Client issues POST /session with Capabilities; browser driver boots browser binary.' },
        { stepNumber: 2, title: 'Navigation', description: 'POST /session/{id}/url navigates browser to URL and blocks until document.readyState == complete.' },
        { stepNumber: 3, title: 'Element Resolution', description: 'POST /session/{id}/element locates WebElement via CSS/XPath and returns unique element ID.' },
        { stepNumber: 4, title: 'User Interaction', description: 'POST /session/{id}/element/{elementId}/click dispatches native mouse event.' },
      ],
    },
    practicalImplementation: {
      description: 'Building an enterprise-ready Selenium 4 framework requires driver encapsulation, explicit wait strategies, and clean teardown lifecycles.',
      prerequisites: ['JDK 17+', 'Maven or Gradle', 'Chrome / Firefox browser installed'],
      steps: [
        'Add Selenium Java and TestNG dependencies to pom.xml.',
        'Configure ChromeOptions with --headless=new and security sandbox flags.',
        'Initialize WebDriverWait with 10-second polling duration.',
        'Execute atomic assertions against visible DOM locators.',
        'Clean up browser processes in @AfterMethod with driver.quit().',
      ],
    },
    codeExamples: [
      {
        title: 'Selenium 4 Java Enterprise Test',
        language: 'java',
        filename: 'SeleniumEnterpriseTest.java',
        code: `package com.intelligentqa.selenium;\n\nimport org.openqa.selenium.By;\nimport org.openqa.selenium.WebDriver;\nimport org.openqa.selenium.WebElement;\nimport org.openqa.selenium.chrome.ChromeDriver;\nimport org.openqa.selenium.chrome.ChromeOptions;\nimport org.openqa.selenium.support.ui.ExpectedConditions;\nimport org.openqa.selenium.support.ui.WebDriverWait;\nimport org.testng.Assert;\nimport org.testng.annotations.AfterMethod;\nimport org.testng.annotations.BeforeMethod;\nimport org.testng.annotations.Test;\nimport java.time.Duration;\n\npublic class SeleniumEnterpriseTest {\n    private WebDriver driver;\n    private WebDriverWait wait;\n\n    @BeforeMethod\n    public void setUp() {\n        ChromeOptions options = new ChromeOptions();\n        options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");\n        driver = new ChromeDriver(options);\n        driver.manage().window().maximize();\n        wait = new WebDriverWait(driver, Duration.ofSeconds(10));\n    }\n\n    @Test\n    public void testSecureLoginFlow() {\n        driver.get("https://app.enterprise-qa.io/login");\n        WebElement userField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("username")));\n        userField.sendKeys("sdet_lead@intelligentqa.io");\n        driver.findElement(By.id("password")).sendKeys("SecretToken!2026");\n        driver.findElement(By.cssSelector("button[type='submit']")).click();\n        WebElement welcomeBanner = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".dashboard-welcome")));\n        Assert.assertTrue(welcomeBanner.getText().contains("Welcome, SDET Lead"));\n    }\n\n    @AfterMethod\n    public void tearDown() {\n        if (driver != null) driver.quit();\n    }\n}`,
        explanation: 'Uses Selenium 4 W3C capabilities, ChromeDriver manager, WebDriverWait with ExpectedConditions, and proper teardown.',
      },
      {
        title: 'Selenium Python PyTest Implementation',
        language: 'python',
        filename: 'test_selenium_login.py',
        code: `import pytest\nfrom selenium import webdriver\nfrom selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\nfrom selenium.webdriver.chrome.options import Options\n\n@pytest.fixture\ndef driver():\n    options = Options()\n    options.add_argument("--headless=new")\n    driver = webdriver.Chrome(options=options)\n    yield driver\n    driver.quit()\n\ndef test_enterprise_login(driver):\n    driver.get("https://app.enterprise-qa.io/login")\n    wait = WebDriverWait(driver, 10)\n    user_input = wait.until(EC.element_to_be_clickable((By.ID, "username")))\n    user_input.send_keys("sdet_lead@intelligentqa.io")\n    driver.find_element(By.ID, "password").send_keys("SecretToken!2026")\n    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()\n    banner = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".dashboard-welcome")))\n    assert "Welcome" in banner.text`,
        explanation: 'PyTest fixture handling browser lifecycle with headless Chrome and explicit waits.',
      },
    ],
    qaUseCases: [
      {
        title: 'Nightly Cross-Browser Regression Grid',
        scenario: 'Validating 1,200 critical customer journeys across Chrome, Edge, and Firefox simultaneously.',
        enterpriseApplication: 'Integrated with AWS Fargate Dockerized Selenium Grid running 50 concurrent browser sessions.',
      },
    ],
    commonProblems: [
      {
        error: 'SessionNotCreatedException: This version of ChromeDriver only supports Chrome version XX',
        rootCause: 'Local installed Chrome browser auto-updated while ChromeDriver binary remained at older major version.',
        troubleshootingSteps: [
          'In Selenium 4.6+, use built-in Selenium Manager to automatically manage driver versions.',
          'Verify browser and driver versions match: google-chrome --version vs chromedriver --version.',
          'In CI, lock browser version inside Docker images.',
        ],
        codeFix: `// Selenium 4.6+ automatically manages drivers without WebDriverManager\nWebDriver driver = new ChromeDriver(); // Handled automatically by Selenium Manager`,
      },
      {
        error: 'StaleElementReferenceException: element is not attached to the page document',
        rootCause: 'DOM refreshed via JavaScript AJAX re-render after WebElement was found, invalidating internal reference.',
        troubleshootingSteps: [
          'Re-locate element immediately prior to interaction.',
          'Use Page Object Model with dynamic locator resolution instead of cached WebElement references.',
          'Wrap interaction in custom retry mechanism awaiting DOM stability.',
        ],
        codeFix: `wait.until(ExpectedConditions.refreshed(\n    ExpectedConditions.elementToBeClickable(By.id("submit-btn"))\n)).click();`,
      },
    ],
    bestPractices: [
      {
        title: 'Always driver.quit() in Finally Block',
        category: 'Industry Standard',
        recommendation: 'Use driver.quit() rather than driver.close() to kill both browser window and chromedriver background process.',
        impact: 'Prevents zombie driver processes consuming 100% memory and crashing CI worker nodes.',
      },
      {
        title: 'Zero Thread.sleep() Rule',
        category: 'Performance',
        recommendation: 'Replace all static Thread.sleep() calls with explicit WebDriverWait conditions.',
        impact: 'Reduces suite duration by up to 60% and eliminates timing-dependent flakiness.',
      },
    ],
    comparison: {
      title: 'Selenium 4 vs Modern Automation Tools',
      comparedTo: 'Playwright & Cypress',
      advantages: [
        'Native W3C standard supported directly by browser vendors',
        'Multi-language ecosystem (Java, C#, Python, JavaScript, Ruby, Go)',
        'Vast ecosystem of cloud device providers (BrowserStack, SauceLabs, LambdaTest)',
        'Native Safari and mobile browser support via Appium',
      ],
      limitations: [
        'Requires explicit synchronization management (no built-in auto-waiting)',
        'Slower network interception compared to Chrome DevTools Protocol / CDP native tools',
        'Complex initial setup compared to all-in-one frameworks',
      ],
    },
    interviewQuestions: [
      {
        level: 'Intermediate',
        question: 'What is the architectural difference between driver.close() and driver.quit()?',
        answer: 'driver.close() closes the currently active browser window. If multiple tabs or windows are open, the session and chromedriver process remain alive. driver.quit() sends a DELETE /session command to the browser driver, closing all associated windows, tearing down the driver process, and releasing memory.',
      },
      {
        level: 'Architect-Level',
        question: 'Explain how Selenium 4 communicates with browsers without JSON Wire Protocol.',
        answer: 'In Selenium 3, client commands were wrapped in JSON Wire Protocol and often decoded via proxy translation layers. In Selenium 4, all communication strictly implements the W3C WebDriver specification (RFC 7497) natively supported by browser drivers. Additionally, Selenium 4 introduces BiDi APIs operating over WebSockets for event-driven listening of DOM events and console logs.',
      },
    ],
    summary: {
      takeaways: [
        'Selenium 4 operates natively over W3C WebDriver standard without legacy protocol wrappers.',
        'Always clean up sessions with driver.quit() to avoid CI resource exhaustion.',
        'Use explicit WebDriverWait and ExpectedConditions to ensure deterministic execution.',
      ],
      keyTerminology: ['W3C Protocol', 'ChromeDriver', 'Selenium Manager', 'BiDi API', 'StaleElementReferenceException'],
      nextSteps: 'Proceed to Module 2 to master WebDriver Commands, Browser Options, and Window Management.',
    },
  },

  // 2. Playwright
  'playwright-playwright-architecture-browser-contexts': {
    overview: {
      whatIsIt: 'Playwright is Microsoft open-source end-to-end testing library designed for modern, reactive web apps with auto-waiting, multi-page contexts, and network mocking.',
      whyImportant: 'It eliminates test flakiness by design through built-in actionability checks, isolated browser contexts, and bidirectional WebSocket communication.',
      whereUsed: 'Enterprise web automation, single-page application (React, Angular, Vue) validation, API testing, and visual regression suites.',
    },
    learningObjectives: [
      'Master the core architecture: Browser -> BrowserContext -> Page.',
      'Understand how Playwright auto-waiting performs 5-point actionability checks.',
      'Implement multi-role, locator-first queries recommended by modern testing standards.',
      'Leverage Playwright Trace Viewer to debug failures with zero guesswork.',
    ],
    conceptExplanation: {
      theory: [
        'Unlike Selenium HTTP request-response polling, Playwright establishes a persistent <strong>bidirectional WebSocket connection</strong> with the browser engine (Chromium, WebKit, Firefox).',
        'This direct communication enables instantaneous event listening (network requests, console logs, DOM mutations) and built-in auto-waiting: before clicking an element, Playwright automatically ensures it is attached, visible, stable, enabled, and receiving pointer events.',
      ],
      terminology: [
        { term: 'BrowserContext', definition: 'An isolated incognito-like session with independent cookies, cache, and localStorage that boots in milliseconds.' },
        { term: 'Actionability Checks', definition: 'Automatic verification that an element is visible, stable, enabled, and interactable before dispatching actions.' },
        { term: 'Trace Viewer', definition: 'A deep GUI inspector capturing DOM snapshots, action timelines, network watermarks, and console logs per test.' },
      ],
      practicalUnderstanding: 'SDETs test multi-user scenarios (e.g. buyer and seller interacting simultaneously) in a single test script by launching two lightweight BrowserContexts in parallel.',
    },
    architectureDiagram: {
      type: 'architecture',
      title: 'Playwright WebSocket Multi-Context Architecture',
      caption: 'Single Browser Process hosting multiple isolated Browser Contexts over WebSocket',
      nodes: [
        { id: '1', label: 'Playwright Node / TS Script', subtitle: 'Test Runner & Fixtures', badge: 'Client', highlight: false },
        { id: '2', label: 'Persistent WebSocket', subtitle: 'Bidirectional CDP / Juggler Protocol', badge: 'Protocol', highlight: true },
        { id: '3', label: 'Single Browser Engine', subtitle: 'Chromium / WebKit / Firefox', badge: 'Process', highlight: false },
        { id: '4', label: 'Context A (User 1)', subtitle: 'Clean Cookies & Cache', badge: 'Context', highlight: true },
        { id: '5', label: 'Context B (Admin)', subtitle: 'Clean Cookies & Cache', badge: 'Context', highlight: true },
      ],
      componentsExplanation: [
        { name: 'Browser Instance', details: 'The underlying OS process launched once per worker thread.' },
        { name: 'Browser Context', details: 'Zero-overhead isolated session providing complete state isolation between tests in under 10ms.' },
        { name: 'Page', details: 'A single tab or window inside a context.' },
        { name: 'Locator Engine', details: 'Lazy-evaluated query engine with built-in auto-waiting and strictness enforcement.' },
      ],
    },
    howItWorks: {
      internalMechanism: 'Commands send JSON-RPC messages over a persistent WebSocket; the browser engine returns instantaneous promises upon DOM actionability.',
      steps: [
        { stepNumber: 1, title: 'Context Creation', description: 'Browser boots once; each test receives a brand new BrowserContext in <10ms.' },
        { stepNumber: 2, title: 'Actionability Verification', description: 'Playwright verifies element is attached, visible, stable (no animation), enabled, and un-obscured.' },
        { stepNumber: 3, title: 'Atomic Execution', description: 'Action dispatches natively into browser event loop.' },
        { stepNumber: 4, title: 'Automatic Trace Recording', description: 'Snapshots captured before and after each action for instant post-mortem analysis.' },
      ],
    },
    codeExamples: [
      {
        title: 'Playwright TypeScript Enterprise Test',
        language: 'typescript',
        filename: 'e2e-enterprise.spec.ts',
        code: `import { test, expect } from '@playwright/test';\n\ntest.describe('Enterprise Playwright Order Flow', () => {\n  test('completes checkout with network mocking and state verification', async ({ page }) => {\n    // 1. Mock external payment gateway\n    await page.route('**/api/v1/payments', async (route) => {\n      await route.fulfill({\n        status: 200,\n        contentType: 'application/json',\n        body: JSON.stringify({ status: 'APPROVED', transactionId: 'TXN-9988-OK' }),\n      });\n    });\n\n    // 2. Navigate and leverage locator-first queries\n    await page.goto('/catalog');\n    await page.getByRole('button', { name: 'Add to Cart' }).first().click();\n    \n    // 3. Auto-waiting handles modal opening without arbitrary sleeps\n    await page.getByRole('link', { name: 'Cart' }).click();\n    await page.getByRole('button', { name: 'Confirm Purchase' }).click();\n\n    // 4. Web-first assertion auto-retries until condition succeeds\n    await expect(page.getByTestId('confirmation-banner')).toHaveText(/Order #.*Placed Successfully/);\n  });\n});`,
        explanation: 'Features network route interception, getByRole locators, auto-waiting actions, and web-first regex assertions.',
      },
    ],
    qaUseCases: [
      {
        title: 'Parallel Matrix CI Pipeline',
        scenario: 'Running 300 tests across Chromium, Firefox, and WebKit on 8 parallel workers in under 3 minutes.',
        enterpriseApplication: 'GitHub Actions matrix workflow with sharding (--shard=1/4) and automated Allure + Trace Viewer artifact publishing.',
      },
    ],
    commonProblems: [
      {
        error: 'Error: strict mode violation: locator("button") resolved to 3 elements',
        rootCause: 'Locator query matched multiple elements on page; Playwright enforces strictness to prevent accidental interaction.',
        troubleshootingSteps: [
          'Narrow locator using role, accessible name, or text filter: page.getByRole("button", { name: "Submit" }).',
          'Use .first(), .last(), or .nth(i) if multiple identical elements are intended.',
          'Filter by child locator: page.locator(".card").filter({ hasText: "Plan Pro" }).getByRole("button").',
        ],
        codeFix: `// Fixed: Unique role-based locator\nawait page.getByRole('button', { name: 'Submit Payment' }).click();`,
      },
    ],
    bestPractices: [
      {
        title: 'Use User-Facing Locators (Role & Label)',
        category: 'Industry Standard',
        recommendation: 'Prioritize getByRole(), getByLabel(), and getByText() over brittle CSS selectors or deep XPaths.',
        impact: 'Ensures test resilience against redesigns and implicitly verifies accessibility (a11y).',
      },
      {
        title: 'Trace on First Retry in CI',
        category: 'Maintainability',
        recommendation: 'Configure trace: "on-first-retry" in playwright.config.ts to keep passing CI runs fast while debugging failed tests.',
        impact: 'Saves GBs of storage while providing video, network traces, and console logs for flaky tests.',
      },
    ],
    comparison: {
      title: 'Playwright vs Selenium vs Cypress',
      comparedTo: 'Selenium & Cypress',
      advantages: [
        'Built-in auto-waiting prevents 95% of timing-related flakiness',
        'Multiple isolated BrowserContexts in a single browser process',
        'Native WebKit (Safari engine) on Linux without macOS hardware',
        'Native network mocking and API testing built-in',
      ],
      limitations: [
        'JavaScript/TypeScript ecosystem has most active feature parity compared to Python/Java bindings',
        'Does not support legacy Internet Explorer or older Android stock browsers',
      ],
    },
    interviewQuestions: [
      {
        level: 'Intermediate',
        question: 'What is the 5-point Actionability Check performed before Playwright clicks an element?',
        answer: 'Before dispatching a click, Playwright ensures: 1) Attached to DOM, 2) Visible in viewport, 3) Stable (not animating or transitioning), 4) Enabled (not disabled), 5) Receives pointer events (not obscured by an overlay, modal, or toast).',
      },
      {
        level: 'Architect-Level',
        question: 'How does Playwright BrowserContext achieve 10x faster test isolation than Selenium new browser sessions?',
        answer: 'Selenium launches a complete native OS browser process for every test (or requires extensive cookie-clearing logic). Playwright boots a single browser process and spawns lightweight BrowserContexts using isolated in-memory storage, cache, and cookie jars (equivalent to an incognito window), spinning up in under 10 milliseconds.',
      },
    ],
    summary: {
      takeaways: [
        'Playwright communicates over persistent WebSockets directly to browser engines.',
        'BrowserContexts enable fast, state-isolated tests in parallel.',
        'Auto-waiting and Web-First assertions eliminate static waits entirely.',
      ],
      keyTerminology: ['BrowserContext', 'Actionability Check', 'Strict Mode', 'Trace Viewer', 'Network Interception'],
      nextSteps: 'Proceed to Module 2 to set up your project structure and configure playwright.config.ts.',
    },
  },
  'playwright-what-is-playwright': {
    overview: {
      whatIsIt: 'Playwright is Microsoft open-source end-to-end testing library designed for modern, reactive web apps with auto-waiting, multi-page contexts, and network mocking.',
      whyImportant: 'It eliminates test flakiness by design through built-in actionability checks, isolated browser contexts, and bidirectional WebSocket communication.',
      whereUsed: 'Enterprise web automation, single-page application (React, Angular, Vue) validation, API testing, and visual regression suites.',
    },
    learningObjectives: [
      'Master the core architecture: Browser -> BrowserContext -> Page.',
      'Understand how Playwright auto-waiting performs 5-point actionability checks.',
      'Implement multi-role, locator-first queries recommended by modern testing standards.',
      'Leverage Playwright Trace Viewer to debug failures with zero guesswork.',
    ],
    conceptExplanation: {
      theory: [
        'Unlike Selenium HTTP request-response polling, Playwright establishes a persistent <strong>bidirectional WebSocket connection</strong> with the browser engine (Chromium, WebKit, Firefox).',
        'This direct communication enables instantaneous event listening (network requests, console logs, DOM mutations) and built-in auto-waiting: before clicking an element, Playwright automatically ensures it is attached, visible, stable, enabled, and receiving pointer events.',
      ],
      terminology: [
        { term: 'BrowserContext', definition: 'An isolated incognito-like session with independent cookies, cache, and localStorage that boots in milliseconds.' },
        { term: 'Actionability Checks', definition: 'Automatic verification that an element is visible, stable, enabled, and interactable before dispatching actions.' },
        { term: 'Trace Viewer', definition: 'A deep GUI inspector capturing DOM snapshots, action timelines, network watermarks, and console logs per test.' },
      ],
      practicalUnderstanding: 'SDETs test multi-user scenarios (e.g. buyer and seller interacting simultaneously) in a single test script by launching two lightweight BrowserContexts in parallel.',
    },
    architectureDiagram: {
      type: 'architecture',
      title: 'Playwright WebSocket Multi-Context Architecture',
      caption: 'Single Browser Process hosting multiple isolated Browser Contexts over WebSocket',
      nodes: [
        { id: '1', label: 'Playwright Node / TS Script', subtitle: 'Test Runner & Fixtures', badge: 'Client', highlight: false },
        { id: '2', label: 'Persistent WebSocket', subtitle: 'Bidirectional CDP / Juggler Protocol', badge: 'Protocol', highlight: true },
        { id: '3', label: 'Single Browser Engine', subtitle: 'Chromium / WebKit / Firefox', badge: 'Process', highlight: false },
        { id: '4', label: 'Context A (User 1)', subtitle: 'Clean Cookies & Cache', badge: 'Context', highlight: true },
        { id: '5', label: 'Context B (Admin)', subtitle: 'Clean Cookies & Cache', badge: 'Context', highlight: true },
      ],
      componentsExplanation: [
        { name: 'Browser Instance', details: 'The underlying OS process launched once per worker thread.' },
        { name: 'Browser Context', details: 'Zero-overhead isolated session providing complete state isolation between tests in under 10ms.' },
        { name: 'Page', details: 'A single tab or window inside a context.' },
        { name: 'Locator Engine', details: 'Lazy-evaluated query engine with built-in auto-waiting and strictness enforcement.' },
      ],
    },
    howItWorks: {
      internalMechanism: 'Commands send JSON-RPC messages over a persistent WebSocket; the browser engine returns instantaneous promises upon DOM actionability.',
      steps: [
        { stepNumber: 1, title: 'Context Creation', description: 'Browser boots once; each test receives a brand new BrowserContext in <10ms.' },
        { stepNumber: 2, title: 'Actionability Verification', description: 'Playwright verifies element is attached, visible, stable (no animation), enabled, and un-obscured.' },
        { stepNumber: 3, title: 'Atomic Execution', description: 'Action dispatches natively into browser event loop.' },
        { stepNumber: 4, title: 'Automatic Trace Recording', description: 'Snapshots captured before and after each action for instant post-mortem analysis.' },
      ],
    },
    codeExamples: [
      {
        title: 'Playwright TypeScript Enterprise Test',
        language: 'typescript',
        filename: 'e2e-enterprise.spec.ts',
        code: `import { test, expect } from '@playwright/test';\n\ntest.describe('Enterprise Playwright Order Flow', () => {\n  test('completes checkout with network mocking and state verification', async ({ page }) => {\n    // 1. Mock external payment gateway\n    await page.route('**/api/v1/payments', async (route) => {\n      await route.fulfill({\n        status: 200,\n        contentType: 'application/json',\n        body: JSON.stringify({ status: 'APPROVED', transactionId: 'TXN-9988-OK' }),\n      });\n    });\n\n    // 2. Navigate and leverage locator-first queries\n    await page.goto('/catalog');\n    await page.getByRole('button', { name: 'Add to Cart' }).first().click();\n    \n    // 3. Auto-waiting handles modal opening without arbitrary sleeps\n    await page.getByRole('link', { name: 'Cart' }).click();\n    await page.getByRole('button', { name: 'Confirm Purchase' }).click();\n\n    // 4. Web-first assertion auto-retries until condition succeeds\n    await expect(page.getByTestId('confirmation-banner')).toHaveText(/Order #.*Placed Successfully/);\n  });\n});`,
        explanation: 'Features network route interception, getByRole locators, auto-waiting actions, and web-first regex assertions.',
      },
    ],
    qaUseCases: [
      {
        title: 'Parallel Matrix CI Pipeline',
        scenario: 'Running 300 tests across Chromium, Firefox, and WebKit on 8 parallel workers in under 3 minutes.',
        enterpriseApplication: 'GitHub Actions matrix workflow with sharding (--shard=1/4) and automated Allure + Trace Viewer artifact publishing.',
      },
    ],
    commonProblems: [
      {
        error: 'Error: strict mode violation: locator("button") resolved to 3 elements',
        rootCause: 'Locator query matched multiple elements on page; Playwright enforces strictness to prevent accidental interaction.',
        troubleshootingSteps: [
          'Narrow locator using role, accessible name, or text filter: page.getByRole("button", { name: "Submit" }).',
          'Use .first(), .last(), or .nth(i) if multiple identical elements are intended.',
          'Filter by child locator: page.locator(".card").filter({ hasText: "Plan Pro" }).getByRole("button").',
        ],
        codeFix: `// Fixed: Unique role-based locator\nawait page.getByRole('button', { name: 'Submit Payment' }).click();`,
      },
    ],
    bestPractices: [
      {
        title: 'Use User-Facing Locators (Role & Label)',
        category: 'Industry Standard',
        recommendation: 'Prioritize getByRole(), getByLabel(), and getByText() over brittle CSS selectors or deep XPaths.',
        impact: 'Ensures test resilience against redesigns and implicitly verifies accessibility (a11y).',
      },
      {
        title: 'Trace on First Retry in CI',
        category: 'Maintainability',
        recommendation: 'Configure trace: "on-first-retry" in playwright.config.ts to keep passing CI runs fast while debugging failed tests.',
        impact: 'Saves GBs of storage while providing video, network traces, and console logs for flaky tests.',
      },
    ],
    comparison: {
      title: 'Playwright vs Selenium vs Cypress',
      comparedTo: 'Selenium & Cypress',
      advantages: [
        'Built-in auto-waiting prevents 95% of timing-related flakiness',
        'Multiple isolated BrowserContexts in a single browser process',
        'Native WebKit (Safari engine) on Linux without macOS hardware',
        'Native network mocking and API testing built-in',
      ],
      limitations: [
        'JavaScript/TypeScript ecosystem has most active feature parity compared to Python/Java bindings',
        'Does not support legacy Internet Explorer or older Android stock browsers',
      ],
    },
    interviewQuestions: [
      {
        level: 'Intermediate',
        question: 'What is the 5-point Actionability Check performed before Playwright clicks an element?',
        answer: 'Before dispatching a click, Playwright ensures: 1) Attached to DOM, 2) Visible in viewport, 3) Stable (not animating or transitioning), 4) Enabled (not disabled), 5) Receives pointer events (not obscured by an overlay, modal, or toast).',
      },
      {
        level: 'Architect-Level',
        question: 'How does Playwright BrowserContext achieve 10x faster test isolation than Selenium new browser sessions?',
        answer: 'Selenium launches a complete native OS browser process for every test (or requires extensive cookie-clearing logic). Playwright boots a single browser process and spawns lightweight BrowserContexts using isolated in-memory storage, cache, and cookie jars (equivalent to an incognito window), spinning up in under 10 milliseconds.',
      },
    ],
    summary: {
      takeaways: [
        'Playwright communicates over persistent WebSockets directly to browser engines.',
        'BrowserContexts enable fast, state-isolated tests in parallel.',
        'Auto-waiting and Web-First assertions eliminate static waits entirely.',
      ],
      keyTerminology: ['BrowserContext', 'Actionability Check', 'Strict Mode', 'Trace Viewer', 'Network Interception'],
      nextSteps: 'Proceed to Module 2 to set up your project structure and configure playwright.config.ts.',
    },
  },
};

// ==========================================
// COURSE CATALOG DEFINITIONS (COURSES 1 to 8)
// ==========================================

const phase8Courses = [
  // COURSE 1: SELENIUM AUTOMATION
  {
    id: 'course-selenium-mastery',
    categoryId: 'cat-selenium',
    slug: 'selenium-webdriver-enterprise-framework',
    title: 'Selenium WebDriver 4 Enterprise Framework Architecture',
    subtitle: 'W3C Protocol, Dynamic Waits, Page Object Design, and Dockerized Grid',
    description: 'Master enterprise UI automation with Selenium WebDriver 4: W3C compliance, resilient element synchronization, Page Factory design, and distributed Selenium Grid execution.',
    level: 'Comprehensive',
    estimatedHours: 42,
    sortOrder: 2,
    status: 'published',
    modules: [
      {
        title: 'Module 1: Introduction to Selenium',
        description: 'Evolution of Selenium, W3C architecture, core components, and cross-tool comparisons.',
        lessons: [
          'What is Selenium?',
          'Why Selenium is Used',
          'Selenium Architecture',
          'Selenium Components',
          'Selenium WebDriver',
          'Selenium IDE',
          'Selenium Grid',
          'Selenium vs Other Automation Tools',
        ],
      },
      {
        title: 'Module 2: Selenium WebDriver Fundamentals',
        description: 'Browser drivers, driver commands, navigation, options, and session management.',
        lessons: [
          'WebDriver Architecture',
          'Browser Drivers',
          'WebDriver Commands',
          'Browser Launching',
          'Browser Navigation',
          'Browser Configuration',
          'Browser Options',
          'Managing Browser Sessions',
        ],
      },
      {
        title: 'Module 3: Locators and Web Elements',
        description: 'Comprehensive locator strategies: ID, Name, CSS Selectors, Dynamic XPath, and SVG/Shadow DOM.',
        lessons: [
          'What are Locators?',
          'ID Locator',
          'Name Locator',
          'Class Name',
          'Tag Name',
          'Link Text',
          'Partial Link Text',
          'CSS Selectors',
          'XPath',
          'Relative XPath',
          'Dynamic XPath',
          'Handling Dynamic Web Elements',
          'Finding Multiple Elements',
        ],
      },
      {
        title: 'Module 4: Web Element Interactions',
        description: 'Atomic interactions: clicks, text entry, dropdowns, alerts, iFrames, tabs, and mouse gestures.',
        lessons: [
          'Click',
          'SendKeys',
          'Clear',
          'GetText',
          'GetAttribute',
          'IsDisplayed',
          'IsEnabled',
          'IsSelected',
          'Dropdown Handling',
          'Checkbox Handling',
          'Radio Button Handling',
          'Alerts',
          'Frames and iFrames',
          'Multiple Windows',
          'Tabs',
          'Mouse Actions',
          'Keyboard Actions',
          'Drag and Drop',
          'File Upload',
        ],
      },
      {
        title: 'Module 5: Synchronization and Waits',
        description: 'Zero-flakiness synchronization: Implicit, Explicit, Fluent Waits, and Expected Conditions.',
        lessons: [
          'Why Synchronization is Required',
          'Implicit Wait',
          'Explicit Wait',
          'Fluent Wait',
          'Expected Conditions',
          'Dynamic Element Handling',
          'Stale Element Reference',
          'Timeout Exceptions',
          'Best Practices',
        ],
      },
      {
        title: 'Module 6: Selenium Advanced Concepts',
        description: 'JavaScript execution, full-page screenshots, headless Chrome, CDP, and BiDi protocols.',
        lessons: [
          'JavaScript Executor',
          'Taking Screenshots',
          'Headless Execution',
          'Handling Cookies',
          'Network Interception',
          'BiDi APIs',
          'Shadow DOM',
          'SVG Elements',
          'Handling Web Tables',
        ],
      },
      {
        title: 'Module 7: Page Object Model',
        description: 'Scalable design patterns: Page Object Model, BasePage abstractions, and maintainability.',
        lessons: [
          'What is POM?',
          'Why POM is Needed',
          'Page Factory',
          'Page Object Design',
          'Reusable Components',
          'Base Page',
          'Best Practices',
        ],
      },
      {
        title: 'Module 8: Selenium Automation Framework Design',
        description: 'Building an enterprise framework: TestNG/JUnit, data providers, logging, and Allure reporting.',
        lessons: [
          'Framework Components',
          'TestNG / JUnit Integration',
          'Data-Driven Testing',
          'Parallel Execution',
          'Reporting with Allure/Extent',
          'Logging',
          'Configuration Management',
        ],
      },
      {
        title: 'Module 9: Selenium Grid & Distributed Testing',
        description: 'Distributed execution: Hub and Node architecture, Docker containers, and Cloud test grids.',
        lessons: [
          'Selenium Grid Architecture',
          'Grid Hub and Node',
          'Dockerized Selenium Grid',
          'Cloud Grids (BrowserStack/SauceLabs)',
          'Parallel Execution on Grid',
        ],
      },
      {
        title: 'Module 10: Enterprise QA Scenarios & Best Practices',
        description: 'Flakiness eradication, CI/CD gates, cross-browser strategy, and enterprise maintenance.',
        lessons: [
          'Handling Flaky Tests',
          'CI/CD Integration',
          'Cross-Browser Testing Strategy',
          'Enterprise Test Architecture',
          'Maintenance and Scalability',
        ],
      },
    ],
  },

  // COURSE 2: PLAYWRIGHT AUTOMATION
  {
    id: 'course-playwright-mastery',
    categoryId: 'cat-playwright',
    slug: 'playwright-ts-mastery',
    title: 'Playwright Automation with TypeScript',
    subtitle: 'Auto-waiting, Network Interception, Trace Viewer, and Enterprise Fixtures',
    description: 'Learn modern end-to-end automation with Microsoft Playwright: WebSockets, auto-waiting actionability, network mocking, parallel worker architecture, and Page Object Models.',
    level: 'Comprehensive',
    estimatedHours: 38,
    sortOrder: 3,
    status: 'published',
    modules: [
      {
        title: 'Module 1: Introduction to Playwright',
        description: 'Next-generation web automation, multi-engine support, and comparisons with Selenium and Cypress.',
        lessons: [
          'Playwright Architecture & Browser Contexts',
          'What is Playwright?',
          'Why Playwright?',
          'Playwright vs Selenium',
          'Key Features',
          'Supported Languages',
          'Browser Support',
        ],
      },
      {
        title: 'Module 2: Getting Started with Playwright',
        description: 'Installation, configuration, directory layout, running first tests, and CLI flags.',
        lessons: [
          'Installation and Setup',
          'Project Structure',
          'Playwright Configuration',
          'First Test Script',
          'Running Tests',
          'CLI Commands',
          'Debugging Tools',
        ],
      },
      {
        title: 'Module 3: Core Concepts and Architecture',
        description: 'Deep dive into Browser, BrowserContext, Page, parallel worker models, and auto-waiting.',
        lessons: [
          'Browser',
          'Browser Context',
          'Page',
          'Workers and Parallelism',
          'Auto-Waiting Mechanism & Actionability Checks',
          'Execution Lifecycle',
        ],
      },
      {
        title: 'Module 4: Locators and Selectors',
        description: 'Locator-first queries: getByRole, getByLabel, CSS, XPath, locator filtering, and strict mode.',
        lessons: [
          'Playwright Locators',
          'Text Selectors',
          'Role Selectors',
          'CSS Selectors',
          'XPath',
          'Chaining Locators',
          'Filtering Locators',
          'Best Practices',
        ],
      },
      {
        title: 'Module 5: Web Interactions and Assertions',
        description: 'Actionability checks: clicks, typing, checkboxes, file uploads, and web-first retrying assertions.',
        lessons: [
          'Click',
          'Fill and Type',
          'Check and Uncheck',
          'Select Option',
          'Hover',
          'Drag and Drop',
          'File Upload',
          'Web Assertions',
          'Soft Assertions',
          'Polling Assertions',
        ],
      },
      {
        title: 'Module 6: Advanced Playwright Capabilities',
        description: 'Network route mocking, API requests, storage state reuse, multi-tab popups, and downloads.',
        lessons: [
          'Network Interception and Mocking',
          'API Testing with Playwright',
          'Authentication and State Reuse',
          'Handling Multiple Tabs and Popups',
          'Frames and iFrames',
          'Dialogs and Alerts',
          'Download and Upload Handling',
        ],
      },
      {
        title: 'Module 7: Playwright Tooling & Debugging',
        description: 'Inspector, Trace Viewer, Codegen test generator, UI Mode, and video recording.',
        lessons: [
          'Playwright Inspector',
          'Trace Viewer',
          'Codegen',
          'UI Mode',
          'Debugging in VS Code',
          'Console Logs and Screenshots',
          'Video Recording',
        ],
      },
      {
        title: 'Module 8: Enterprise Framework Architecture',
        description: 'Page Object Model with TypeScript, custom fixtures, environment variables, and Allure reports.',
        lessons: [
          'Page Object Model in Playwright',
          'Custom Fixtures',
          'Test Configuration & Environments',
          'Parallel Execution Strategy',
          'CI/CD Integration',
          'Allure and HTML Reporting',
        ],
      },
      {
        title: 'Module 9: Real-World Scenarios and Best Practices',
        description: 'End-to-end design, CI sharding, preventing flakiness, security patterns, and enterprise standards.',
        lessons: [
          'End-to-End Test Design',
          'Performance Optimization',
          'Flaky Test Prevention',
          'Security and Session Handling',
          'Enterprise Test Patterns',
        ],
      },
    ],
  },

  // COURSE 3: API TESTING
  {
    id: 'course-api-testing',
    categoryId: 'cat-api-testing',
    slug: 'api-testing-and-contracts',
    title: 'Full-Stack API Testing & Consumer-Driven Contracts',
    subtitle: 'HTTP Protocol, REST Architecture, Postman Automation, Newman, and Pact Contracts',
    description: 'Master end-to-end API testing across microservices: HTTP protocol internals, REST constraints, Postman/Newman collections, JSON Schema validation, and consumer-driven contracts with Pact.',
    level: 'Comprehensive',
    estimatedHours: 35,
    sortOrder: 4,
    status: 'published',
    modules: [
      {
        title: 'Module 1: API Fundamentals',
        description: 'API architectures (REST, SOAP, GraphQL, gRPC), HTTP methods, headers, status codes, and URI structures.',
        lessons: [
          'What is an API?',
          'Types of APIs (REST, SOAP, GraphQL, gRPC)',
          'HTTP Protocol Basics',
          'HTTP Request and Response',
          'HTTP Methods',
          'HTTP Status Codes',
          'Headers and Cookies',
          'URL vs URI vs URN',
        ],
      },
      {
        title: 'Module 2: REST API Architecture',
        description: 'REST constraints, resource orientation, statelessness, idempotency, and query vs path parameters.',
        lessons: [
          'REST Principles and Constraints',
          'Resource-Oriented Architecture',
          'Statelessness',
          'Idempotency',
          'Request Payloads (JSON, XML, Form-Data)',
          'Response Payloads',
          'Query Parameters vs Path Parameters',
        ],
      },
      {
        title: 'Module 3: API Testing Fundamentals',
        description: 'Why API testing is critical, the Test Pyramid, functional vs security vs performance validation.',
        lessons: [
          'What is API Testing?',
          'Why API Testing is Critical',
          'API Testing vs UI Testing',
          'Test Pyramid',
          'API Test Types (Functional, Security, Performance)',
          'What to Test in an API?',
        ],
      },
      {
        title: 'Module 4: API Authentication and Authorization',
        description: 'Basic auth, Bearer tokens, OAuth 2.0 flows, JWT validation, API keys, and SSO mechanisms.',
        lessons: [
          'Basic Auth',
          'Bearer Token',
          'API Keys',
          'OAuth 1.0 vs OAuth 2.0',
          'JWT Tokens',
          'SSO and SAML',
          'Session-Based Authentication',
          'Best Practices for Auth Testing',
        ],
      },
      {
        title: 'Module 5: Postman for API Testing',
        description: 'Collections, environment variables, pre-request scripts, test assertions, and Newman CLI integration.',
        lessons: [
          'Postman Workspace and Collections',
          'Environments and Variables',
          'Pre-Request Scripts',
          'Tests and Assertions',
          'Request Chaining',
          'Data-Driven Testing',
          'Newman CLI',
          'Monitoring and Mock Servers',
        ],
      },
      {
        title: 'Module 6: API Schema Validation and Contracts',
        description: 'JSON Schema drafting, response validation, consumer-driven contracts with Pact, and breaking changes.',
        lessons: [
          'JSON Schema Validation',
          'Schema Definition and Structure',
          'Validating Response Types',
          'Contract Testing with Pact',
          'Consumer-Driven Contracts',
          'Breaking Change Detection',
        ],
      },
      {
        title: 'Module 7: API Automation Framework Design',
        description: 'Framework components, test data generation, parallel execution, reporting, and CI integration.',
        lessons: [
          'Framework Components',
          'Choosing the Right Tools',
          'Configuration Management',
          'Test Data Strategy',
          'Parallel Execution',
          'Reporting and Logging',
          'CI/CD Integration',
        ],
      },
      {
        title: 'Module 8: Advanced API Testing Scenarios',
        description: 'Microservices testing, Kafka/RabbitMQ event testing, GraphQL, rate limiting, and OWASP API Top 10.',
        lessons: [
          'Microservices API Testing',
          'Event-Driven APIs (Kafka, RabbitMQ)',
          'GraphQL API Testing',
          'WebSockets Testing',
          'Rate Limiting and Throttling',
          'Security Testing (OWASP API Top 10)',
          'Error Handling and Edge Cases',
        ],
      },
    ],
  },

  // COURSE 4: APPIUM MOBILE AUTOMATION
  {
    id: 'course-appium',
    categoryId: 'cat-appium',
    slug: 'appium-mobile-automation',
    title: 'Appium 2.0 Mobile Automation Masterclass',
    subtitle: 'iOS & Android Native, Hybrid, UiAutomator2, XCUITest, and Device Farms',
    description: 'Master cross-platform mobile automation with Appium 2.0: Android UiAutomator2, iOS XCUITest, W3C mobile actions, hybrid context switching, and cloud device farm execution.',
    level: 'Comprehensive',
    estimatedHours: 32,
    sortOrder: 5,
    status: 'published',
    modules: [
      {
        title: 'Module 1: Mobile Testing Fundamentals',
        description: 'Native, hybrid, and web app differences, Android vs iOS architecture, and real devices vs emulators.',
        lessons: [
          'Mobile App Types (Native, Web, Hybrid)',
          'Mobile OS Ecosystem (Android, iOS)',
          'Mobile Testing vs Web Testing',
          'Real Devices vs Emulators vs Simulators',
          'Mobile Testing Challenges',
        ],
      },
      {
        title: 'Module 2: Introduction to Appium',
        description: 'Appium 2.0 modular architecture, client-server WebDriver model, and driver plugin ecosystem.',
        lessons: [
          'What is Appium?',
          'Appium Philosophy',
          'Appium Architecture',
          'Client-Server Model',
          'WebDriver Protocol',
          'Appium 2.0 and Plugins',
          'Appium vs Espresso vs XCUITest',
        ],
      },
      {
        title: 'Module 3: Environment Setup and Configuration',
        description: 'Android SDK, Xcode, Appium Inspector, W3C desired capabilities, and device connectivity.',
        lessons: [
          'Appium Installation',
          'Android SDK Setup',
          'Xcode Setup',
          'Appium Inspector',
          'Desired Capabilities / W3C Capabilities',
          'Connecting Real Devices',
          'Troubleshooting Setup',
        ],
      },
      {
        title: 'Module 4: Mobile Locators and Inspection',
        description: 'Accessibility ID, Android Resource ID, UiAutomator2 selectors, iOS predicate strings, and inspection.',
        lessons: [
          'Appium Inspector Usage',
          'Accessibility ID',
          'XPath in Mobile',
          'Resource ID / Name',
          'UIAutomator2 Selectors',
          'XCUITest Selectors',
          'Dynamic Element Handling',
          'Mobile Locator Best Practices',
        ],
      },
      {
        title: 'Module 5: Mobile Gestures and Interactions',
        description: 'W3C pointer actions: taps, smooth scrolling, swipe, pinch to zoom, and permission dialog handling.',
        lessons: [
          'Tap and Click',
          'SendKeys',
          'Swipe and Scroll',
          'Drag and Drop',
          'Pinch and Zoom',
          'Long Press',
          'W3C Actions API',
          'Handling Permissions and Dialogs',
        ],
      },
      {
        title: 'Module 6: Android and iOS Automation',
        description: 'Platform specifics: UiAutomator2 vs XCUITest, hybrid WebViews, context switching, and deep linking.',
        lessons: [
          'Android Automation with UIAutomator2',
          'iOS Automation with XCUITest',
          'Handling WebViews and Hybrid Apps',
          'Context Switching',
          'Push/Pull Files',
          'Deep Linking',
        ],
      },
      {
        title: 'Module 7: Mobile Automation Framework Architecture',
        description: 'Mobile Page Object Model, AppiumFieldDecorator, multi-device parallel execution, and cloud farms.',
        lessons: [
          'Page Object Model for Mobile',
          'Driver Factory Pattern',
          'Multi-Device Execution',
          'Cloud Device Farms (BrowserStack, SauceLabs)',
          'TestNG / JUnit Integration',
          'Reporting',
        ],
      },
      {
        title: 'Module 8: Advanced Mobile Testing Scenarios',
        description: 'Network throttling, battery monitoring, biometric authentication, SMS OTPs, and mobile CI/CD.',
        lessons: [
          'Handling Network Fluctuation',
          'Battery and Performance Monitoring',
          'Biometrics and Face ID',
          'SMS and OTP Handling',
          'App Update Testing',
          'CI/CD for Mobile Automation',
        ],
      },
    ],
  },

  // COURSE 5: REST ASSURED AUTOMATION
  {
    id: 'course-rest-assured',
    categoryId: 'cat-rest-assured',
    slug: 'rest-assured-api-automation',
    title: 'REST Assured: Enterprise API Automation with Java',
    subtitle: 'BDD Given-When-Then, POJO Serialization, JSON Schema, and OAuth2',
    description: 'Master Java REST Assured automation: Given-When-Then syntax, RequestSpecBuilder, Jackson POJO mapping, Hamcrest matchers, OAuth2, and scalable framework architecture.',
    level: 'Comprehensive',
    estimatedHours: 28,
    sortOrder: 6,
    status: 'published',
    modules: [
      {
        title: 'Module 1: Introduction to Rest Assured',
        description: 'Architecture, core benefits, comparisons with Postman and HTTPClient, and Maven/Gradle setup.',
        lessons: [
          'What is Rest Assured?',
          'Why Rest Assured?',
          'Architecture',
          'Rest Assured vs Postman vs HTTPClient',
          'Setup and Dependencies',
        ],
      },
      {
        title: 'Module 2: Core Fundamentals',
        description: 'Given-When-Then BDD pattern, RequestSpecification, ResponseSpecification, and extracting response data.',
        lessons: [
          'Given When Then Pattern',
          'RequestSpecification',
          'ResponseSpecification',
          'Path and Query Parameters',
          'Headers and Cookies',
          'Extracting Response Data',
        ],
      },
      {
        title: 'Module 3: Serialization and Deserialization',
        description: 'Jackson and Gson POJO mapping, nested JSON serialization, collections, and generic types.',
        lessons: [
          'POJO Creation',
          'Jackson and Gson Integration',
          'Serializing Request Body',
          'Deserializing Response Body',
          'Nested JSON Handling',
          'Collections in Response',
        ],
      },
      {
        title: 'Module 4: Assertions and Validations',
        description: 'Hamcrest matchers, status code checks, header assertions, JSONPath evaluations, and JSON Schema.',
        lessons: [
          'Hamcrest Matchers',
          'Status Code Assertions',
          'Header Validations',
          'Body Validations',
          'JSONPath and XMLPath',
          'JSON Schema Validation',
        ],
      },
      {
        title: 'Module 5: Authentication and Security',
        description: 'Basic, Digest, OAuth 2.0 Bearer tokens, API keys, SSL certificates, and custom headers.',
        lessons: [
          'Basic Authentication',
          'Digest Authentication',
          'OAuth 2.0',
          'Bearer Token',
          'API Key Handling',
          'SSL and Certificate Handling',
        ],
      },
      {
        title: 'Module 6: Rest Assured Framework Design',
        description: 'Enterprise framework design, reusable specifications, data-driven tests, and Allure integration.',
        lessons: [
          'Framework Architecture',
          'Request/Response Specs Reusability',
          'Test Data Management',
          'Reporting (Allure/Extent)',
          'CI/CD Integration',
          'Parallel Execution',
        ],
      },
      {
        title: 'Module 7: Advanced Scenarios and Best Practices',
        description: 'Request chaining, multipart file uploads, logging filters, WireMock service virtualization, and best practices.',
        lessons: [
          'Request Chaining',
          'File Upload and Download',
          'Logging and Filters',
          'Mocking with WireMock',
          'Enterprise Best Practices',
        ],
      },
    ],
  },

  // COURSE 6: GIT & CI/CD
  {
    id: 'course-git',
    categoryId: 'cat-git-cicd',
    slug: 'git-for-qa-engineers',
    title: 'Git & CI/CD Pipelines for QA Engineers',
    subtitle: 'Version Control, Branching Strategies, Automated Quality Gates, and Release Pipelines',
    description: 'Learn Git version control and continuous integration pipelines designed for QA automation engineers: GitFlow, conflict resolution, automated quality gates, and regression pipeline architecture.',
    level: 'Comprehensive',
    estimatedHours: 25,
    sortOrder: 7,
    status: 'published',
    modules: [
      {
        title: 'Module 1: Git Fundamentals',
        description: 'Distributed version control concepts, repository setup, .gitignore for test assets, and core commands.',
        lessons: [
          'What is Git?',
          'Version Control Concepts',
          'Git Architecture',
          'Git vs Centralized VCS',
          'Git Configuration',
          'Core Git Commands',
        ],
      },
      {
        title: 'Module 2: Branching and Merging',
        description: 'Branching models (GitFlow, Trunk-Based), interactive rebasing, merge conflict resolution, and stashing.',
        lessons: [
          'Branching Strategies (GitFlow, Trunk-Based)',
          'Creating and Switching Branches',
          'Merging and Merge Conflicts',
          'Rebasing vs Merging',
          'Stashing and Cherry-Picking',
        ],
      },
      {
        title: 'Module 3: Remote Repositories and Collaboration',
        description: 'Remote remotes, push/fetch/pull, Pull Request workflows, and code review quality standards for SDETs.',
        lessons: [
          'Remote Repositories',
          'Push Pull and Fetch',
          'Pull Requests and Code Review',
          'Forking Workflow',
          'Handling Merge Conflicts in PRs',
        ],
      },
      {
        title: 'Module 4: Introduction to CI/CD',
        description: 'Continuous Integration vs Delivery vs Deployment, automated quality gates, and feedback loops.',
        lessons: [
          'What is CI/CD?',
          'Continuous Integration vs Continuous Delivery vs Continuous Deployment',
          'Why CI/CD is Essential for QA',
          'Automated Quality Gates',
          'Test Automation in CI/CD',
        ],
      },
      {
        title: 'Module 5: CI/CD Pipelines',
        description: 'Pipeline stages (build, smoke, test, deploy), triggers, artifact caching, and test reporting.',
        lessons: [
          'Pipeline Architecture',
          'Pipeline Stages (Build, Test, Deploy)',
          'Triggers and Events',
          'Environment Management',
          'Artifact Management',
          'Test Reporting in CI/CD',
        ],
      },
      {
        title: 'Module 6: QA in CI/CD',
        description: 'Designing smoke and regression pipelines, parallel worker execution, flakiness quarantine, and alerting.',
        lessons: [
          'Smoke Tests in CI/CD',
          'Regression Pipeline Design',
          'Parallel Test Execution in Pipelines',
          'Handling Test Flakiness in CI',
          'Test Failure Notifications and Alerts',
          'Quality Metrics and Dashboards',
        ],
      },
      {
        title: 'Module 7: Enterprise CI/CD Best Practices',
        description: 'Branch protection rules, secrets management, runner cost optimization, and Shift-Left strategies.',
        lessons: [
          'Branch Protection Rules',
          'Pipeline Security and Secrets',
          'Cost Optimization for CI Runners',
          'Shift-Left Testing Strategy',
          'Rollback Strategies',
        ],
      },
    ],
  },

  // COURSE 7: GITHUB ACTIONS
  {
    id: 'course-github-actions',
    categoryId: 'cat-github-actions',
    slug: 'github-actions-qa-automation',
    title: 'GitHub Actions: CI/CD Pipelines for QA Automation',
    subtitle: 'Workflows, Matrix Builds, Headless Browsers, Artifacts, and Custom Actions',
    description: 'Master automated test execution using GitHub Actions: workflow syntax, matrix testing across OS/browsers, secrets management, Allure report publishing, and custom composite actions.',
    level: 'Comprehensive',
    estimatedHours: 24,
    sortOrder: 8,
    status: 'published',
    modules: [
      {
        title: 'Module 1: Introduction to GitHub Actions',
        description: 'Workflows, events, jobs, steps, runners, GitHub Actions vs Jenkins, and YAML syntax.',
        lessons: [
          'What is GitHub Actions?',
          'Core Components (Workflows, Events, Jobs, Steps, Actions, Runners)',
          'GitHub Actions vs Jenkins',
          'Workflow File Syntax (YAML)',
        ],
      },
      {
        title: 'Module 2: Workflows, Jobs and Steps',
        description: 'Triggers (push, pull_request, schedule, workflow_dispatch), job dependencies (needs), and conditions.',
        lessons: [
          'Workflow Triggers (push, pull_request, schedule, workflow_dispatch)',
          'Job Configuration',
          'Step Execution',
          'Dependencies Between Jobs (needs)',
          'Conditional Execution (if)',
        ],
      },
      {
        title: 'Module 3: Runners and Environments',
        description: 'GitHub-hosted vs self-hosted runners, matrix strategy for cross-browser testing, and secret caching.',
        lessons: [
          'GitHub-Hosted Runners',
          'Self-Hosted Runners',
          'Matrix Strategy (Parallel Testing Across OS/Browser)',
          'Environment Variables and Secrets',
          'Managing Artifacts and Caches',
        ],
      },
      {
        title: 'Module 4: Automated Test Execution with GitHub Actions',
        description: 'Running Selenium, Playwright, and Newman in headless mode, and uploading HTML/Allure report artifacts.',
        lessons: [
          'Running Selenium in GitHub Actions',
          'Running Playwright in GitHub Actions',
          'Running API Tests (Newman/Rest Assured)',
          'Headless Browser Configuration',
          'Publishing Test Reports (Allure, HTML)',
        ],
      },
      {
        title: 'Module 5: Custom and Marketplace Actions',
        description: 'Using community marketplace actions, creating composite actions, and Docker container actions.',
        lessons: [
          'Using Marketplace Actions',
          'Creating Custom Composite Actions',
          'Creating JavaScript Actions',
          'Creating Docker Container Actions',
          'Sharing Actions Across Repositories',
        ],
      },
      {
        title: 'Module 6: Advanced GitHub Actions Patterns',
        description: 'Environment protection rules, concurrency cancellation, reusable workflows, and Slack notifications.',
        lessons: [
          'Secrets and Environment Protection',
          'Concurrency and Cancellation',
          'Reusable Workflows',
          'Dynamic Matrix Builds',
          'Notifications (Slack, Email)',
          'Enterprise Best Practices',
        ],
      },
    ],
  },

  // COURSE 8: APM & PERFORMANCE TESTING
  {
    id: 'course-apm-performance',
    categoryId: 'cat-apm-performance',
    slug: 'apm-and-performance-testing',
    title: 'APM & Enterprise Performance Testing',
    subtitle: 'Apache JMeter, k6 Load Scripting, Distributed Tracing, and Datadog/Dynatrace APM',
    description: 'Comprehensive performance engineering and monitoring: JMeter distributed loads, modern k6 virtual user scripting, SLAs/SLOs, and Application Performance Monitoring (APM) with OpenTelemetry and Datadog.',
    level: 'Comprehensive',
    estimatedHours: 30,
    sortOrder: 9,
    status: 'published',
    modules: [
      {
        title: 'Module 1: Performance Testing Fundamentals',
        description: 'Load, stress, endurance, and spike testing, response time metrics, throughput, latency, and SLAs/SLOs.',
        lessons: [
          'What is Performance Testing?',
          'Types of Performance Testing (Load, Stress, Endurance, Spike, Volume)',
          'Key Metrics (Response Time, Throughput, Error Rate, Latency)',
          'Performance Testing Lifecycle',
          'SLA SLO and SLI',
        ],
      },
      {
        title: 'Module 2: Performance Testing with JMeter',
        description: 'Apache JMeter architecture, Thread Groups, samplers, timers, listeners, parameterization, and distributed load.',
        lessons: [
          'Introduction to Apache JMeter',
          'JMeter Architecture',
          'Thread Groups and Virtual Users',
          'Samplers, Timers and Listeners',
          'Assertions',
          'Parameterization and Data-Driven Testing',
          'Correlation and Regular Expressions',
          'Distributed Testing with JMeter',
        ],
      },
      {
        title: 'Module 3: Modern Performance Testing (k6 / Gatling)',
        description: 'Scripting performance in JavaScript with Grafana k6, virtual user ramp-ups, thresholds, and InfluxDB/Grafana.',
        lessons: [
          'Introduction to k6',
          'Scripting Performance Tests in JavaScript',
          'Virtual Users and Thresholds',
          'k6 Cloud and InfluxDB/Grafana Integration',
          'k6 vs JMeter',
          'Gatling Overview',
        ],
      },
      {
        title: 'Module 4: Application Performance Monitoring (APM) Concepts',
        description: 'The three pillars of observability (metrics, logs, traces), distributed tracing, and APM platforms.',
        lessons: [
          'What is APM?',
          'Key APM Pillars (Metrics, Logs, Traces)',
          'Understanding Distributed Tracing',
          'APM Tools Landscape (Datadog, Dynatrace, New Relic, OpenTelemetry)',
          'Why QA Engineers Need APM Knowledge',
        ],
      },
      {
        title: 'Module 5: Monitoring Metrics and Diagnostics',
        description: 'Analyzing CPU, memory, garbage collection pauses, thread contention, and slow SQL query bottlenecks.',
        lessons: [
          'CPU and Memory Utilization',
          'Garbage Collection Analysis',
          'Thread Contention and Deadlocks',
          'Database Query Performance and Slow Queries',
          'Network Latency and Bottlenecks',
        ],
      },
      {
        title: 'Module 6: Performance Engineering in CI/CD',
        description: 'Shift-Left performance testing, automated threshold quality gates in CI/CD, and regression detection.',
        lessons: [
          'Shift-Left Performance Testing',
          'Automated Performance Gates in Pipelines',
          'Baseline Comparison and Regression Detection',
          'Continuous Profiling',
          'Alerting and Anomaly Detection',
        ],
      },
      {
        title: 'Module 7: Enterprise Performance Best Practices',
        description: 'Production-like test environments, bottleneck troubleshooting methodology, capacity planning, and scalability.',
        lessons: [
          'Performance Test Strategy Design',
          'Production-Like Environment Sizing',
          'Performance Troubleshooting Methodology',
          'Capacity Planning',
          'Scalability Architecture Analysis',
        ],
      },
    ],
  },
];

// Execute catalogue build
console.log('Generating Phase 8 Curriculum Catalogue...');

// Preserve AI Academy intact
const aiCourse = store.academyCourses.find(c => c.id === 'course-ai-qa-mastery');
if (!aiCourse) {
  console.error('CRITICAL: AI Academy course-ai-qa-mastery not found in store!');
  process.exit(1);
}

// Preserve other special courses if needed by tests (e.g. fidelity tracks, azure-devops, jenkins)
const preservedCourseIds = new Set([
  'course-ai-qa-mastery',
  'course-azure-devops',
  'course-jenkins',
]);

const existingPreservedCourses = store.academyCourses.filter(c => preservedCourseIds.has(c.id));

// Build transformed courses
const compiledCourses = [];

phase8Courses.forEach(cDef => {
  const modArray = [];

  cDef.modules.forEach((mDef, mIdx) => {
    const modId = `mod-${cDef.id.replace('course-', '')}-${mIdx + 1}`;
    const modSlug = slugify(mDef.title.replace(/^Module \d+:\s*/, ''));

    const lessonArray = mDef.lessons.map((lsnTitle, lIdx) => {
      // Check for rich foundational lesson definition
      const richKey = `${cDef.id.replace('course-', '').replace('-mastery', '')}-${slugify(lsnTitle)}`;
      const customData = richFoundationalLessons[richKey] || null;

      return createStandardLesson(cDef.id, modId, mIdx, lIdx, lsnTitle, customData);
    });

    modArray.push({
      id: modId,
      courseId: cDef.id,
      slug: modSlug,
      title: mDef.title,
      description: mDef.description,
      sortOrder: mIdx + 1,
      status: 'published',
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
      lessons: lessonArray,
    });
  });

  compiledCourses.push({
    id: cDef.id,
    categoryId: cDef.categoryId,
    slug: cDef.slug,
    title: cDef.title,
    subtitle: cDef.subtitle,
    description: cDef.description,
    level: cDef.level,
    estimatedHours: cDef.estimatedHours,
    sortOrder: cDef.sortOrder,
    status: cDef.status,
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
    modules: modArray,
  });
});

// Combine AI Academy + Phase 8 Courses + Preserved CI/CD Sub-courses
const finalCourses = [
  aiCourse,
  ...compiledCourses,
];

// Add preserved courses that aren't in finalCourses yet
existingPreservedCourses.forEach(pc => {
  if (!finalCourses.find(c => c.id === pc.id)) {
    finalCourses.push(pc);
  }
});

// Update store
store.academyCourses = finalCourses;

fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');

console.log(`Successfully updated ${DATA_FILE}!`);
console.log(`Total Courses: ${store.academyCourses.length}`);
store.academyCourses.forEach(c => {
  const modCount = (c.modules || []).length;
  const lsnCount = (c.modules || []).reduce((acc, m) => acc + (m.lessons || []).length, 0);
  console.log(`- ${c.id}: ${modCount} modules, ${lsnCount} lessons`);
});
