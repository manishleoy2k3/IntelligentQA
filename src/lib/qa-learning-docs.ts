export interface DocStep {
  stepNumber: number;
  title: string;
  badge?: string;
  summary: string;
  explanation: string;
  codeSnippet?: {
    language: string;
    code: string;
    caption?: string;
  };
  proTip?: string;
}

export interface ManualBridgeRow {
  manualAction: string;
  automatedApproach: string;
  whyItMatters: string;
}

export interface LessonDoc {
  title: string;
  category: string;
  tagline: string;
  overview: string;
  whyItMattersForManualQA: string;
  architectureUnderTheHood: {
    title: string;
    flowOrMechanism: string;
    keyTakeaway: string;
  };
  stepByStepGuide: DocStep[];
  manualToAutomatedBridge: ManualBridgeRow[];
  productionCodeExample: {
    title: string;
    description: string;
    code: string;
    language: string;
    annotations: { lineOrPattern: string; explanation: string }[];
  };
  bestPractices: string[];
  antiPatterns: string[];
  interviewQnA: {
    question: string;
    answer: string;
  };
}

// Comprehensive Playwright-Docs-Style Content Repository
export const DETAILED_LESSON_DOCS: Record<string, Partial<LessonDoc>> = {
  // ==========================================
  // PLAYWRIGHT TRACK: LESSON 1 - INTRO & MODERN TESTING
  // ==========================================
  'pw-setup-intro': {
    title: 'Modern Web Testing & Playwright Intro',
    category: 'Playwright (TypeScript) • Architecture & Setup',
    tagline: 'Why Modern Engineering Teams are Migrating from Selenium/Cypress to Playwright',
    overview:
      'Playwright was created by Microsoft engineers specifically to eliminate the 3 biggest pain points of web automation: test flakiness, slow execution speed, and brittle locator maintenance. Unlike legacy tools that communicate through external HTTP WebDriver server bridges, Playwright connects directly to modern browser rendering engines (Chromium, WebKit, Firefox) via a bi-directional WebSocket connection using the Chrome DevTools Protocol (CDP).',
    whyItMattersForManualQA:
      'In manual testing, you instinctively wait for page spinners to vanish before clicking, handle popups, and verify elements. In legacy automation (like Selenium), you had to write tedious Thread.sleep() or complex ExpectedConditions loops. Playwright automates this human intuition through built-in auto-waiting: it performs 5 actionability checks before every single click, typing, or hover action.',
    architectureUnderTheHood: {
      title: 'Bi-Directional WebSocket vs HTTP JSON Wire Protocol',
      flowOrMechanism:
        'Test Script (Node.js) <== Direct WebSocket Stream ==> Browser Engine (Chromium/WebKit/Firefox). Zero intermediary drivers, zero HTTP handshake latency per command, and real-time DOM mutation events listener.',
      keyTakeaway:
        'Because Playwright runs over a continuous WebSocket, it can listen to browser network idle events, DOM mutations, and animation frame completion in real-time, executing tests up to 5x faster than legacy tools.',
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Project Scaffolding in 30 Seconds',
        badge: 'Terminal CLI',
        summary: 'Initialize a production-ready Playwright suite with one command.',
        explanation:
          'Run the official Playwright initializer. It creates your configuration, downloads isolated headless browser binaries, and sets up sample specs.',
        codeSnippet: {
          language: 'bash',
          code: 'npm init playwright@latest\n# Select: TypeScript\n# Select: tests folder\n# Select: Install Playwright browsers (true)',
          caption: 'Interactive CLI command to scaffold Playwright',
        },
        proTip: 'Playwright bundles its own isolated browser binaries, so your local Chrome version or updates will never break your automated pipeline.',
      },
      {
        stepNumber: 2,
        title: 'Understanding the Directory Structure',
        badge: 'File Layout',
        summary: 'Explore the scaffolded files and configuration blueprint.',
        explanation:
          'Playwright generates `playwright.config.ts` (the central engine config), `tests/` directory for test files, and `package.json` for npm scripts.',
        codeSnippet: {
          language: 'typescript',
          code: '// playwright.config.ts preview\nimport { defineConfig, devices } from "@playwright/test";\n\nexport default defineConfig({\n  testDir: "./tests",\n  fullyParallel: true,\n  retries: process.env.CI ? 2 : 0,\n  reporter: "html",\n  use: {\n    baseURL: "http://localhost:3000",\n    trace: "on-first-retry",\n    screenshot: "only-on-failure",\n  },\n});',
          caption: 'playwright.config.ts enterprise setup',
        },
        proTip: 'Always configure `trace: "on-first-retry"` in CI to record full DOM snapshots, network requests, and console logs on any test failure.',
      },
      {
        stepNumber: 3,
        title: 'Executing Tests & Exploring the UI Mode',
        badge: 'Test Runner',
        summary: 'Run headless, headed, or inside the interactive time-travel UI Mode.',
        explanation:
          'Playwright provides a revolutionary UI Mode with time-travel debugging, watch mode, and visual locator picking directly in your browser.',
        codeSnippet: {
          language: 'bash',
          code: '# Run all tests in headless mode\nnpx playwright test\n\n# Open interactive Time-Travel UI Mode (Recommended for learning!)\nnpx playwright test --ui\n\n# Open HTML Test Report\nnpx playwright show-report',
          caption: 'Running tests and inspecting results',
        },
        proTip: 'UI mode allows you to step back and forward through each locator action, inspect the live DOM at that exact millisecond, and see network responses.',
      },
    ],
    manualToAutomatedBridge: [
      {
        manualAction: 'Open browser, type URL in address bar',
        automatedApproach: 'await page.goto("http://localhost:3000")',
        whyItMatters: 'Waits automatically for document "load" event before proceeding.',
      },
      {
        manualAction: 'Wait 3 seconds for login modal to appear',
        automatedApproach: 'await expect(page.getByRole("dialog")).toBeVisible()',
        whyItMatters: 'Zero arbitrary sleep: polls DOM every 100ms and advances immediately.',
      },
      {
        manualAction: 'Inspect element and copy full XPath',
        automatedApproach: 'page.getByRole("button", { name: "Submit" })',
        whyItMatters: 'Uses accessibility tree role; immune to DOM layout & class changes.',
      },
    ],
    productionCodeExample: {
      title: 'First Production Playwright Test: End-to-End Search & Verification',
      description: 'Clean, modern Playwright test demonstrating user-facing locators, auto-waiting, and web-first assertions.',
      language: 'typescript',
      code: `import { test, expect } from '@playwright/test';

test.describe('Platform Navigation & Verification', () => {
  test('should search and verify curriculum lessons', async ({ page }) => {
    // 1. Navigate to target URL
    await page.goto('/tracks/playwright-ts');

    // 2. Locate input by semantic placeholder and fill text
    const searchInput = page.getByPlaceholder('Search curriculum...');
    await searchInput.fill('Auto-Waiting');

    // 3. Click search result button with user-facing role
    await page.getByRole('button', { name: 'Auto-Waiting & Web-First Assertions' }).click();

    // 4. Assert header visibility using web-first auto-retrying assertion
    const pageHeading = page.getByRole('heading', { level: 2 });
    await expect(pageHeading).toContainText('Auto-Waiting');
  });
});`,
      annotations: [
        { lineOrPattern: 'test.describe', explanation: 'Groups related test cases for clean reporting and parallel grouping.' },
        { lineOrPattern: 'async ({ page })', explanation: 'Injects an isolated browser tab fixture with clean cookies and cache.' },
        { lineOrPattern: 'page.getByPlaceholder', explanation: 'Target elements the way human users identify them on screen.' },
        { lineOrPattern: 'await expect(pageHeading).toContainText', explanation: 'Web-first assertion: auto-retries for up to 5000ms until passing.' },
      ],
    },
    bestPractices: [
      'Write tests like user stories: use getByRole, getByText, getByLabel over cryptic CSS/XPaths.',
      'Rely on built-in auto-waiting rather than manual page.waitForTimeout() calls.',
      'Keep each test completely isolated and independent with its own fresh test data.',
      'Run tests in parallel by default to slash CI build times from 30 minutes to 3 minutes.',
    ],
    antiPatterns: [
      'Using page.waitForTimeout(5000) - this causes flaky tests when servers are slow or wastes time when fast.',
      'Testing implementation details like internal CSS class names (.btn-primary-v2-active).',
      'Creating inter-dependent tests where Test 2 fails if Test 1 does not run first.',
    ],
    interviewQnA: {
      question: 'How does Playwright achieve 0ms flaky wait times compared to Selenium WebDriver?',
      answer:
        'Playwright communicates directly with the browser rendering engine via a bi-directional WebSocket connection using the Chrome DevTools Protocol. Before executing any user action (click, fill, hover), Playwright performs automatic actionability checks: verifying the element is attached to DOM, visible, stable (no ongoing CSS animations), enabled, and can receive pointer events without being covered by modals or overlays. This eliminates the need for manual Thread.sleep or explicit wait boilerplate.',
    },
  },

  // ==========================================
  // PLAYWRIGHT TRACK: LESSON 3 - AUTO-WAITING & ASSERTIONS
  // ==========================================
  'pw-auto-waiting': {
    title: 'Auto-Waiting & Web-First Assertions',
    category: 'Playwright (TypeScript) • Reliability Engine',
    tagline: 'Why Playwright Tests Never Need Thread.sleep: Actionability Checks & Async Polling',
    overview:
      'Flakiness is the #1 reason automation projects fail in software teams. A test that passes on your laptop but fails in CI because an element took 200ms longer to render damages engineering confidence. Playwright completely solves this by introducing two foundational pillars: Actionability Checks before every action, and Web-First Assertions with automatic asynchronous polling.',
    whyItMattersForManualQA:
      'Manual testers frequently see loading spinners, disabled buttons during form validation, or slow AJAX responses. When writing code, manual testers often try to fix errors by throwing `sleep(5000)` into the script. Playwright removes this guesswork: when you call `await page.getByRole("button").click()`, Playwright waits under the hood until the button is truly clickable before firing the event.',
    architectureUnderTheHood: {
      title: 'The 5 Actionability Checks Performed on Every Action',
      flowOrMechanism:
        'Action Triggered => 1. Attached to DOM? => 2. Visible on Screen? => 3. Stable (Bounding Box Not Moving)? => 4. Receives Pointer Events (No Modal Overlay)? => 5. Enabled (Not disabled)? => Fire Click Event!',
      keyTakeaway:
        'If any check fails (e.g., an animation is still sliding the button across the screen), Playwright retries continuously until all 5 conditions are satisfied or the action timeout (default 30s) expires.',
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Actionability Checks in Action',
        badge: 'Auto-Wait',
        summary: 'How clicks and fills wait automatically without custom wait code.',
        explanation:
          'When you call `click()` or `fill()`, Playwright checks if the element is attached, visible, stable, enabled, and editable.',
        codeSnippet: {
          language: 'typescript',
          code: '// Playwright automatically waits for:\n// 1. Attached to DOM\n// 2. Visible (non-zero width & height)\n// 3. Stable (no ongoing CSS transition)\n// 4. Receives events (not obstructed)\n// 5. Enabled\nawait page.getByRole("button", { name: "Save Changes" }).click();',
          caption: 'Auto-waiting click action',
        },
        proTip: 'You do not need to write `waitForElementToBeClickable`. Playwright already does it for you.',
      },
      {
        stepNumber: 2,
        title: 'Web-First Assertions with expect()',
        badge: 'Auto-Retrying',
        summary: 'Assertions that poll the DOM until the condition passes.',
        explanation:
          'Standard assertions evaluate a boolean once and fail immediately if the condition is not met. Web-first assertions poll the DOM repeatedly for up to 5 seconds.',
        codeSnippet: {
          language: 'typescript',
          code: '// ❌ WRONG (Non-retrying assertion: evaluated once, fails if 1ms late)\nexpect(await page.locator(".toast").isVisible()).toBe(true);\n\n// ✔ CORRECT (Web-first assertion: polls until visible or timeout)\nawait expect(page.locator(".toast")).toBeVisible({ timeout: 5000 });\nawait expect(page.locator(".toast")).toHaveText("Account created successfully!");',
          caption: 'Web-first retrying assertions',
        },
        proTip: 'Notice the `await expect(...)` syntax. The `await` tells Playwright to poll asynchronously.',
      },
      {
        stepNumber: 3,
        title: 'Waiting for Inverted States (Spinners Disappearing)',
        badge: 'Disappearance',
        summary: 'Asserting that loading states and skeletons have completed.',
        explanation:
          'Verifying an element has disappeared is as easy as `toBeHidden()` or `not.toBeVisible()`.',
        codeSnippet: {
          language: 'typescript',
          code: '// Wait for loading skeleton/spinner to disappear\nawait expect(page.getByTestId("loading-spinner")).toBeHidden();\n\n// Verify submit button is now enabled\nawait expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();',
          caption: 'Waiting for element to disappear',
        },
        proTip: 'Always wait for spinners to be hidden before interacting with newly rendered table rows.',
      },
    ],
    manualToAutomatedBridge: [
      {
        manualAction: 'Watch spinner spin and wait for table data to appear',
        automatedApproach: 'await expect(page.getByTestId("spinner")).toBeHidden()',
        whyItMatters: 'Guarantees the DOM has settled before your test reads row values.',
      },
      {
        manualAction: 'Check that error message turns red with text "Invalid Email"',
        automatedApproach: 'await expect(page.locator("#err")).toHaveText("Invalid Email")',
        whyItMatters: 'Waits for async validation debouncing (e.g. formik/zod) to finish.',
      },
      {
        manualAction: 'Verify input value changes after typing',
        automatedApproach: 'await expect(page.getByLabel("Username")).toHaveValue("john_doe")',
        whyItMatters: 'Ensures state management (React/Vue/Angular) has rendered the value.',
      },
    ],
    productionCodeExample: {
      title: 'Production Scenario: Asynchronous Checkout with Payment Verification',
      description: 'Real-world checkout flow handling async price calculations, coupon debounce, and order confirmation.',
      language: 'typescript',
      code: `import { test, expect } from '@playwright/test';

test('async checkout flow with dynamic coupon validation', async ({ page }) => {
  await page.goto('/checkout');

  // Apply promo code (triggers 800ms backend AJAX debounce)
  const promoInput = page.getByPlaceholder('Promo code');
  await promoInput.fill('SAVE20');
  await page.getByRole('button', { name: 'Apply' }).click();

  // 1. Web-first assertion: polls until backend returns discount banner
  const discountBanner = page.getByTestId('discount-applied');
  await expect(discountBanner).toBeVisible({ timeout: 6000 });
  await expect(discountBanner).toContainText('20% Off Applied');

  // 2. Verify total updates automatically
  await expect(page.getByTestId('total-amount')).toHaveText('$80.00');

  // 3. Click Place Order (auto-waits for button to be enabled)
  const orderButton = page.getByRole('button', { name: 'Place Order' });
  await expect(orderButton).toBeEnabled();
  await orderButton.click();

  // 4. Assert order success modal appears and URL redirects
  await expect(page).toHaveURL(/.*order-success/);
  await expect(page.getByRole('heading', { name: 'Thank You!' })).toBeVisible();
});`,
      annotations: [
        { lineOrPattern: 'await promoInput.fill("SAVE20")', explanation: 'Fills input and triggers change/input DOM events.' },
        { lineOrPattern: 'await expect(discountBanner).toBeVisible', explanation: 'Polls for up to 6000ms, succeeding the exact millisecond the backend responds.' },
        { lineOrPattern: 'await expect(page).toHaveURL', explanation: 'Polls the browser URL until route transition completes.' },
      ],
    },
    bestPractices: [
      'Always use `await expect(locator).toBeVisible()` instead of `expect(await locator.isVisible()).toBe(true)`.',
      'Use `toBeAttached()`, `toBeVisible()`, `toBeEnabled()`, and `toHaveText()` for bulletproof assertions.',
      'Configure global expectation timeouts in `playwright.config.ts` (e.g. `expect: { timeout: 7000 }`).',
    ],
    antiPatterns: [
      'Calling `await page.waitForTimeout(3000)` - this is the #1 indicator of low-quality automation.',
      'Hardcoding fixed sleep intervals: your test takes 3 seconds even if the app responded in 50ms!',
      'Ignoring auto-wait and adding unnecessary manual `page.waitForSelector()` before every click.',
    ],
    interviewQnA: {
      question: 'What is the critical difference between `expect(await locator.isVisible()).toBe(true)` and `await expect(locator).toBeVisible()`?',
      answer:
        'The first statement executes `await locator.isVisible()` exactly ONCE at that specific millisecond and passes boolean true/false to Jest/Expect. If the element takes 50ms to fade in, it immediately fails. The second statement is a Web-First Assertion that passes the Locator object to Playwright\'s async assertion engine, which continuously polls the DOM every 100ms for up to 5000ms until the element becomes visible. Web-first assertions eliminate timing race conditions.',
    },
  },

  // ==========================================
  // PLAYWRIGHT TRACK: LESSON 4 - RESILIENT LOCATORS
  // ==========================================
  'pw-resilient-locators': {
    title: 'Resilient Locators & User-Facing Roles',
    category: 'Playwright (TypeScript) • Locator Architecture',
    tagline: 'Write Resilient Locators That Never Break When UI Classes or Layouts Change',
    overview:
      'Traditional automation relied on brittle DOM selectors like full XPaths (`/html/body/div[2]/div/form/div[3]/button`) or obfuscated CSS classes (`.css-175oi2r`). When frontend developers refactor code or update CSS frameworks, 100% of these selectors break. Playwright introduces User-Facing Locators that match elements the same way real humans and screen readers do: by role, label, text, and accessible name.',
    whyItMattersForManualQA:
      'When a manual tester tests a login page, they do not look at `<div class="login-wrapper__inner-2">`. They look for an input labeled "Username", an input labeled "Password", and a button named "Sign In". By using Playwright\'s `getByRole` and `getByLabel`, your automation mirrors human testing and becomes immune to styling changes.',
    architectureUnderTheHood: {
      title: 'The Accessibility Tree (AOM) vs The HTML DOM',
      flowOrMechanism:
        'HTML Element (<button aria-label="Close">X</button>) => Browser Accessibility Engine calculates Role: "button", Accessible Name: "Close" => Playwright getByRole("button", { name: "Close" }) finds the element with 100% accuracy.',
      keyTakeaway:
        'Browsers compute an Accessibility Object Model (AOM) for screen readers. Since accessible roles and names rarely change during UI redesigns, accessible locators are 10x more resilient than CSS or XPath.',
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Priority 1: getByRole (The Gold Standard)',
        badge: 'Semantic Role',
        summary: 'Target buttons, headings, dialogs, checkboxes, and links by role.',
        explanation:
          'ARIA roles define the purpose of an element: button, link, heading, textbox, checkbox, alert, dialog.',
        codeSnippet: {
          language: 'typescript',
          code: '// Locate buttons by role and accessible name\nawait page.getByRole("button", { name: "Submit" }).click();\n\n// Locate heading by level\nawait expect(page.getByRole("heading", { level: 1 })).toHaveText("Dashboard");\n\n// Locate checkbox and check it\nawait page.getByRole("checkbox", { name: "Subscribe to newsletter" }).check();',
          caption: 'User-facing getByRole examples',
        },
        proTip: 'If your test fails to find an element with getByRole, it usually means your frontend has an accessibility bug that affects real users too!',
      },
      {
        stepNumber: 2,
        title: 'Priority 2: getByLabel & getByPlaceholder',
        badge: 'Form Inputs',
        summary: 'Target form fields using their associated visible labels.',
        explanation:
          'When testing forms, target input fields using `getByLabel("Email Address")` or `getByPlaceholder("Enter your email")`.',
        codeSnippet: {
          language: 'typescript',
          code: '// Associated <label for="email">Email Address</label>\nawait page.getByLabel("Email Address").fill("tester@intelligentqa.com");\n\n// Input with placeholder\nawait page.getByPlaceholder("Search documentation...").fill("Locators");',
          caption: 'Form input targeting',
        },
        proTip: '`getByLabel` automatically clicks the input associated with `<label for="...">` or wrapping `<label>`.',
      },
      {
        stepNumber: 3,
        title: 'Priority 3: getByTestId (Dedicated QA Hook)',
        badge: 'Enterprise QA',
        summary: 'Target complex dynamic canvas or graph elements using data-testid.',
        explanation:
          'For complex elements without clean text, collaborate with developers to add `data-testid="user-profile-badge"`.',
        codeSnippet: {
          language: 'typescript',
          code: '// Configured in playwright.config.ts as testIdAttribute: "data-testid"\nawait page.getByTestId("metrics-card-revenue").click();',
          caption: 'data-testid locator hook',
        },
        proTip: 'Use `data-testid` only when semantic user-facing locators (role, text, label) are not feasible.',
      },
    ],
    manualToAutomatedBridge: [
      {
        manualAction: 'Find the button that says "Save" and click it',
        automatedApproach: 'page.getByRole("button", { name: "Save" }).click()',
        whyItMatters: 'Immune to changing classes from `.btn-blue` to `.btn-emerald`.',
      },
      {
        manualAction: 'Find input labeled "Password" and enter secret',
        automatedApproach: 'page.getByLabel("Password").fill("Secret123!")',
        whyItMatters: 'Guarantees the form label is correctly linked to the input.',
      },
      {
        manualAction: 'Check the error banner showing "Card Expired"',
        automatedApproach: 'page.getByText("Card Expired").toBeVisible()',
        whyItMatters: 'Validates what the human user actually sees on screen.',
      },
    ],
    productionCodeExample: {
      title: 'Production Locator Strategy: Chaining & Filtering on Complex Tables',
      description: 'How to target specific rows inside a data table without brittle indexed XPaths.',
      language: 'typescript',
      code: `import { test, expect } from '@playwright/test';

test('manage user roles inside complex dynamic data table', async ({ page }) => {
  await page.goto('/admin/users');

  // Locate the specific row that contains the user "Sarah Connor"
  const targetRow = page.getByRole('row').filter({ hasText: 'Sarah Connor' });

  // Within that specific row, verify status is Active
  await expect(targetRow.getByText('Active')).toBeVisible();

  // Within that specific row, click the Edit button
  await targetRow.getByRole('button', { name: 'Edit Role' }).click();

  // In the opened modal, select Admin role
  const modal = page.getByRole('dialog', { name: 'Update User Role' });
  await modal.getByLabel('Role').selectOption('Administrator');
  await modal.getByRole('button', { name: 'Save' }).click();

  // Verify toast notification
  await expect(page.getByRole('status')).toHaveText('User role updated successfully');
});`,
      annotations: [
        { lineOrPattern: 'page.getByRole("row").filter({ hasText: ... })', explanation: 'Locates the exact table row by content without relying on tr[2] index.' },
        { lineOrPattern: 'targetRow.getByRole("button")', explanation: 'Scopes the locator inside targetRow, ignoring buttons in other rows.' },
      ],
    },
    bestPractices: [
      'Locator priority order: 1. getByRole -> 2. getByLabel -> 3. getByText -> 4. getByTestId -> 5. CSS/XPath (last resort).',
      'Use locator chaining (`page.getByRole("dialog").getByRole("button")`) to avoid global selector collisions.',
      'Use `.filter({ hasText: ... })` to target dynamic lists and tables instead of hardcoded indices.',
    ],
    antiPatterns: [
      'Using absolute XPaths: `/html/body/div[3]/div[2]/ul/li[4]/a` breaks the second any HTML element is added.',
      'Using auto-generated framework CSS classes like `.MuiButton-root-129` or `._3xLkP`.',
      'Targeting by element index (`locator.nth(4)`) - what happens when a new item is added to the list?',
    ],
    interviewQnA: {
      question: 'Why does Playwright discourage XPath in favor of User-Facing Locators (getByRole)?',
      answer:
        'XPath selectors couple your test suite tightly to the underlying DOM layout and implementation details. If a developer wraps a button inside a new `<div>` for styling or switches from an `<a>` tag to a `<button>` tag, the XPath breaks even though the user experience did not change. User-facing locators (`getByRole`, `getByLabel`) test the application from the user\'s perspective using the browser\'s Accessibility Tree, ensuring tests only fail when user functionality is genuinely broken.',
    },
  },

  // ==========================================
  // SELENIUM TRACK: LESSON 1 - CORE JAVA OOPS FOR AUTOMATION
  // ==========================================
  'java-oops-framework': {
    title: 'Core Java OOPs for Automation',
    category: 'Selenium (Java) • Enterprise Architecture',
    tagline: 'Map Encapsulation, Inheritance, Polymorphism, and Abstraction Directly to QA Architecture',
    overview:
      'In manual testing, every test case is an isolated set of steps in an Excel sheet. When manual testers start automating, they often write linear scripts where each test creates a new ChromeDriver, logs in, clicks buttons, and tears down. This creates code duplication, memory leaks, and maintenance nightmares. Object-Oriented Programming (OOPs) is the architectural foundation that allows test suites to scale to 10,000+ tests cleanly.',
    whyItMattersForManualQA:
      'If you have 100 test cases that all log in, and the login button ID changes from "btn-submit" to "btn-login": in bad automation, you must manually edit 100 files! With OOPs Encapsulation (Page Object Model), you edit the locator in ONE line inside the LoginPage class, and all 100 tests pass instantly.',
    architectureUnderTheHood: {
      title: 'How the 4 OOPs Pillars Construct an Enterprise Test Framework',
      flowOrMechanism:
        '1. Encapsulation: Locators are private in Page classes => 2. Inheritance: Tests extend BaseTest to reuse driver => 3. Polymorphism: DriverFactory returns ChromeDriver or FirefoxDriver => 4. Abstraction: WebDriver interface hides browser binary details.',
      keyTakeaway:
        'OOPs is not academic theory: each pillar maps directly to solving a concrete automation challenge (locators maintenance, driver lifecycle, multi-browser execution, and browser API abstraction).',
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Encapsulation: The Foundation of Page Object Model',
        badge: 'Data Hiding',
        summary: 'Keep web element locators private inside Page Classes.',
        explanation:
          'Declare locators as `private final By` and expose public action methods like `loginAs(user, pass)`. Never let test classes touch raw locators directly.',
        codeSnippet: {
          language: 'java',
          code: 'public class LoginPage {\n    private final WebDriver driver;\n    // Encapsulated locators: hidden from outside world\n    private final By usernameField = By.id("username");\n    private final By passwordField = By.id("password");\n    private final By loginButton = By.cssSelector("button[type=\'submit\']");\n\n    public LoginPage(WebDriver driver) {\n        this.driver = driver;\n    }\n\n    // Public action method\n    public DashboardPage loginAs(String username, String password) {\n        driver.findElement(usernameField).sendKeys(username);\n        driver.findElement(passwordField).sendKeys(password);\n        driver.findElement(loginButton).click();\n        return new DashboardPage(driver);\n    }\n}',
          caption: 'Encapsulation inside LoginPage class',
        },
        proTip: 'Notice the method returns `new DashboardPage(driver)`. This is the Fluent Page Object pattern that models real page navigation in code.',
      },
      {
        stepNumber: 2,
        title: 'Inheritance: Eliminating Setup & Teardown Boilerplate',
        badge: 'BaseTest Reuse',
        summary: 'Manage browser lifecycle once in BaseTest; all test classes inherit it.',
        explanation:
          'Create an abstract `BaseTest` with `@BeforeMethod` and `@AfterMethod`. Every test class simply extends `BaseTest`.',
        codeSnippet: {
          language: 'java',
          code: 'public abstract class BaseTest {\n    protected WebDriver driver;\n\n    @BeforeMethod\n    public void setUp() {\n        driver = DriverFactory.createInstance("chrome");\n        driver.manage().window().maximize();\n    }\n\n    @AfterMethod\n    public void tearDown() {\n        if (driver != null) {\n            driver.quit(); // Always quit to prevent zombie processes\n        }\n    }\n}',
          caption: 'Inheritance in BaseTest class',
        },
        proTip: 'Always call `driver.quit()` rather than `driver.close()`. `close()` only closes the active tab, leaving the chromedriver process running in system memory.',
      },
      {
        stepNumber: 3,
        title: 'Polymorphism: Multi-Browser Dynamic Dispatch',
        badge: 'Dynamic Dispatch',
        summary: 'Switch between Chrome, Firefox, and Edge with zero test changes.',
        explanation:
          '`WebDriver` is an interface. `ChromeDriver`, `FirefoxDriver`, and `EdgeDriver` are concrete implementations. You write tests against the interface.',
        codeSnippet: {
          language: 'java',
          code: 'public class DriverFactory {\n    public static WebDriver createInstance(String browser) {\n        switch (browser.toLowerCase()) {\n            case "firefox":\n                return new FirefoxDriver();\n            case "edge":\n                return new EdgeDriver();\n            default:\n                return new ChromeDriver();\n        }\n    }\n}',
          caption: 'Factory Pattern using Polymorphism',
        },
        proTip: 'In parallel CI execution, wrap the WebDriver in `ThreadLocal<WebDriver>` to give each concurrent thread its own isolated browser session.',
      },
      {
        stepNumber: 4,
        title: 'Abstraction: Hiding Browser Plumbing Behind Clean Interfaces',
        badge: 'Clean API',
        summary: 'Interact with high-level contracts while hiding complex WebDriver logic.',
        explanation:
          'When you call `driver.get("url")`, you don\'t care about HTTP POST commands or JSON wire protocols. Abstraction hides the mechanics behind a clean contract.',
        codeSnippet: {
          language: 'java',
          code: '// WebDriver is a pure Java interface with 10+ abstract methods\nWebDriver driver = new ChromeDriver();\n\n// You call clean abstract methods:\ndriver.get("https://intelligentqa.com");\nWebElement btn = driver.findElement(By.id("start"));',
          caption: 'Abstraction in WebDriver interface',
        },
        proTip: 'Create a custom `BasePage` abstract class that wraps common wait utilities (e.g. `waitForVisibility`) so page objects don\'t repeat wait code.',
      },
    ],
    manualToAutomatedBridge: [
      {
        manualAction: 'Execute Login steps in 50 different test sheets',
        automatedApproach: 'loginPage.loginAs("admin", "pass123")',
        whyItMatters: 'One reusable method called by 50 test classes; 100% DRY (Don\'t Repeat Yourself).',
      },
      {
        manualAction: 'Launch and close browser for every test manually',
        automatedApproach: '@BeforeMethod and @AfterMethod in BaseTest',
        whyItMatters: 'Guarantees a clean, unpolluted browser session for every single test automatically.',
      },
      {
        manualAction: 'Manually verify tests on Chrome, then repeat on Firefox',
        automatedApproach: 'mvn test -Dbrowser=firefox',
        whyItMatters: 'Polymorphic factory switches the browser engine dynamically via a CLI flag.',
      },
    ],
    productionCodeExample: {
      title: 'Production Test Class: Extending BaseTest with Clean Page Objects',
      description: 'Clean TestNG test class containing zero raw locators and zero driver management code.',
      language: 'java',
      code: `package com.intelligentqa.tests;

import com.intelligentqa.base.BaseTest;
import com.intelligentqa.pages.LoginPage;
import com.intelligentqa.pages.DashboardPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginValidationTest extends BaseTest {

    @Test(description = "Verify successful authentication and dashboard redirect")
    public void testValidUserLogin() {
        // 1. Initialize Page Object with inherited driver
        LoginPage loginPage = new LoginPage(driver);

        // 2. Perform business action
        DashboardPage dashboard = loginPage.loginAs("standard_user", "secret_sauce");

        // 3. Verify business outcome
        Assert.assertTrue(dashboard.isHeaderVisible(), "Dashboard header should be visible after login");
        Assert.assertEquals(dashboard.getActiveUserRole(), "Standard", "User role must match standard credentials");
    }
}`,
      annotations: [
        { lineOrPattern: 'extends BaseTest', explanation: 'Inherits browser setup and teardown lifecycle automatically.' },
        { lineOrPattern: 'loginPage.loginAs', explanation: 'Encapsulated action returning the next page object in the workflow.' },
        { lineOrPattern: 'Assert.assertTrue', explanation: 'TestNG assertion verifying business expectations.' },
      ],
    },
    bestPractices: [
      'Always keep locators `private final By` inside Page classes; never expose them to test classes.',
      'Always extend a common `BaseTest` for consistent driver initialization and teardown.',
      'Use `ThreadLocal<WebDriver>` when running parallel tests in TestNG to avoid race conditions.',
      'Return next Page Objects from action methods (e.g. `login()` returns `new DashboardPage(driver)`).',
    ],
    antiPatterns: [
      'Using `public static WebDriver driver` - static drivers break immediately in multi-threaded parallel runs.',
      'Writing `Thread.sleep(5000)` instead of explicit WebDriverWait in page action methods.',
      'Hardcoding credentials or URLs inside test classes instead of loading from config.properties.',
    ],
    interviewQnA: {
      question: 'How do you explain the 4 pillars of OOPs in the context of your test automation framework during an interview?',
      answer:
        'In my framework, Encapsulation is applied via the Page Object Model by keeping element locators private inside Page classes and exposing only business actions. Inheritance is implemented via a BaseTest and BasePage class, allowing all test and page classes to inherit driver lifecycle and common wait mechanisms. Polymorphism is used in our DriverFactory where a single WebDriver interface reference dynamically instantiates ChromeDriver, FirefoxDriver, or EdgeDriver based on runtime configuration. Finally, Abstraction is achieved through the WebDriver interface itself, hiding the underlying network and browser binary socket complexity behind intuitive methods like get(), findElement(), and click().',
    },
  },

  // ==========================================
  // REST ASSURED TRACK: LESSON 2 - GIVEN-WHEN-THEN BDD
  // ==========================================
  'api-given-when-then': {
    title: 'Given-When-Then BDD Syntax & Requests',
    category: 'REST Assured (API) • BDD Testing',
    tagline: 'Master the Given-When-Then BDD Syntax for Expressive, Self-Documenting API Tests',
    overview:
      'REST Assured is the industry-standard Java library for testing RESTful web services. Built with a Domain-Specific Language (DSL) inspired by Behavior-Driven Development (BDD), it structures API tests into 3 intuitive phases: Given (preconditions, headers, auth, parameters), When (HTTP action: GET, POST, PUT, DELETE), and Then (assertions on status codes, response headers, and JSON body).',
    whyItMattersForManualQA:
      'In Postman, manual testers configure headers in one tab, query params in another, click "Send", and visually inspect the JSON response body. REST Assured translates this exact workflow into clean, fluent Java code that executes in 20 milliseconds inside CI/CD pipelines without launching any browser.',
    architectureUnderTheHood: {
      title: 'REST Assured Fluent Builder Pipeline',
      flowOrMechanism:
        'Given() [RequestSpecification: Headers, Body, Auth] => When() [HttpExecution: GET/POST to URL] => Then() [ResponseSpecification & ValidatableResponse: Assertions on Status & JSON Body].',
      keyTakeaway:
        'The method chaining pattern allows you to write tests that read like plain English sentences, making API regressions transparent to both developers and QA leads.',
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Phase 1: GIVEN (Preconditions)',
        badge: 'Request Setup',
        summary: 'Specify headers, authentication tokens, query params, and payload.',
        explanation:
          'In the `given()` block, configure everything needed before firing the request: Content-Type, Bearer Token, query params, or JSON body.',
        codeSnippet: {
          language: 'java',
          code: 'given()\n    .baseUri("https://api.intelligentqa.com")\n    .header("Authorization", "Bearer eyJhbGciOi...")\n    .contentType(ContentType.JSON)\n    .queryParam("status", "active")',
          caption: 'given() setup block',
        },
        proTip: 'Use RequestSpecBuilder to extract common baseUri and auth headers into a reusable specification.',
      },
      {
        stepNumber: 2,
        title: 'Phase 2: WHEN (HTTP Action Execution)',
        badge: 'HTTP Action',
        summary: 'Trigger the HTTP method against the target endpoint.',
        explanation:
          'The `when()` block executes the HTTP action: `.get("/users")`, `.post("/orders")`, `.put("/users/1")`, or `.delete("/sessions")`.',
        codeSnippet: {
          language: 'java',
          code: 'when()\n    .get("/api/v1/users/{userId}", 101)',
          caption: 'when() action block',
        },
        proTip: 'Path parameters can be passed directly as arguments: `.get("/users/{id}", 42)`.',
      },
      {
        stepNumber: 3,
        title: 'Phase 3: THEN (Validations & Assertions)',
        badge: 'Assertions',
        summary: 'Validate status codes, headers, and JSON response body fields.',
        explanation:
          'In the `then()` block, assert the HTTP status code, verify response times, and use Hamcrest matchers to validate JSON values.',
        codeSnippet: {
          language: 'java',
          code: 'then()\n    .statusCode(200)\n    .contentType(ContentType.JSON)\n    .body("user.name", equalTo("Sarah Connor"))\n    .body("user.role", equalTo("Admin"))\n    .body("user.permissions", hasItems("READ", "WRITE"));',
          caption: 'then() assertion block with Hamcrest',
        },
        proTip: 'REST Assured integrates Hamcrest matchers (`equalTo`, `hasItem`, `greaterThan`, `notNullValue`) out of the box.',
      },
    ],
    manualToAutomatedBridge: [
      {
        manualAction: 'Paste Bearer token into Postman Authorization tab',
        automatedApproach: 'given().auth().oauth2(jwtToken)',
        whyItMatters: 'Token is injected automatically into every automated API regression run.',
      },
      {
        manualAction: 'Click Send button in Postman',
        automatedApproach: 'when().post("/api/v1/login")',
        whyItMatters: 'Executes over pure HTTP in 15ms without UI rendering overhead.',
      },
      {
        manualAction: 'Scroll down to check if "status: 200 OK" and "id" is present',
        automatedApproach: 'then().statusCode(200).body("id", notNullValue())',
        whyItMatters: 'Fails instantly in CI if the contract or response schema changes.',
      },
    ],
    productionCodeExample: {
      title: 'Production REST Assured Test: Create & Validate Order Contract',
      description: 'End-to-end BDD API test validating payload creation, 201 Created status, and response contract.',
      language: 'java',
      code: `package com.intelligentqa.api.tests;

import io.restassured.http.ContentType;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class OrderApiTest {

    @Test(description = "Verify order creation returns 201 Created and correct price calculation")
    public void testCreateOrderSuccessfully() {
        String payload = "{\\"itemId\\": 401, \\"quantity\\": 2, \\"unitPrice\\": 19.99}";

        given()
            .baseUri("http://localhost:3000/api/sandbox/v1")
            .header("Authorization", "Bearer valid_sdet_token")
            .contentType(ContentType.JSON)
            .body(payload)
        .when()
            .post("/orders")
        .then()
            .statusCode(201)
            .contentType(ContentType.JSON)
            .header("X-RateLimit-Remaining", notNullValue())
            .body("status", equalTo("CONFIRMED"))
            .body("orderId", notNullValue())
            .body("totalPrice", equalTo(39.98f))
            .time(lessThan(2000L)); // Assert response time < 2 seconds
    }
}`,
      annotations: [
        { lineOrPattern: 'given()', explanation: 'Preconditions: Base URL, JWT auth, JSON content type, and request body.' },
        { lineOrPattern: 'when().post("/orders")', explanation: 'Executes HTTP POST request against the orders endpoint.' },
        { lineOrPattern: 'then().statusCode(201)', explanation: 'Verifies HTTP 201 Created status code.' },
        { lineOrPattern: 'time(lessThan(2000L))', explanation: 'Performance SLA assertion verifying sub-2-second response time.' },
      ],
    },
    bestPractices: [
      'Separate RequestSpecification and ResponseSpecification to avoid repeating baseUri and auth tokens.',
      'Always assert HTTP status code first (`.statusCode(200)`) before querying the JSON body.',
      'Use POJO classes (Jackson/Gson) instead of raw JSON strings for complex request and response bodies.',
      'Assert response times (`.time(lessThan(1500L))`) to catch API performance degradations early in CI.',
    ],
    antiPatterns: [
      'Hardcoding authentication tokens directly inside individual test methods.',
      'Testing UI workflows through browser automation when a 10x faster API endpoint is available.',
      'Ignoring negative status codes (400, 401, 403, 404, 500) - robust SDETs test error contracts rigorously.',
    ],
    interviewQnA: {
      question: 'What is the advantage of REST Assured Given-When-Then syntax over Apache HttpClient or Unirest?',
      answer:
        'REST Assured provides a domain-specific BDD language tailored specifically for test automation. With standard HTTP clients, you must write extensive boilerplate to parse input streams, deserialize JSON into maps, and write manual assertions. REST Assured combines request building, JSONPath expression evaluation, Hamcrest matchers, schema validation, and logging into a single fluent chain, reducing test code volume by 70% while producing self-documenting tests.',
    },
  },

  // ==========================================
  // AI FOR QA TRACK: LESSON 1 - AI TESTING PARADIGM
  // ==========================================
  'ai-qa-intro': {
    title: 'AI in Testing: The Paradigm Shift',
    category: 'AI for QA • Next-Gen Autonomous Testing',
    tagline: 'How Autonomous Agents, Self-Healing, and LLMs are Transforming Quality Engineering',
    overview:
      'Artificial Intelligence is fundamentally reshaping the software testing discipline. Traditional automation requires human engineers to manually inspect every DOM element, hand-craft every XPath, write static test data, and investigate every CI failure log. Modern AI for QA introduces three transformative capabilities: Autonomous Requirements Generation, Self-Healing Locators, and Automated Failure Root Cause Analysis.',
    whyItMattersForManualQA:
      'For manual testers, AI is the ultimate career accelerator. Instead of being replaced by AI, QA professionals who learn to orchestrate AI agents become "Super-SDETs". You use AI to generate exhaustive Gherkin test matrices from rough Jira tickets in seconds, scaffold resilient Page Object Models, and auto-triage flaky CI failures.',
    architectureUnderTheHood: {
      title: 'The Modern Autonomous QA Architecture',
      flowOrMechanism:
        'Jira Ticket / PRD => Requirement Generator Agent => Test Case Synthesizer => Code Scaffolding Agent (POM) => CI/CD Test Execution => AI Log Triage & Flakiness Classifier => JIRA Bug Filed Automatically.',
      keyTakeaway:
        'AI does not replace the tester\'s critical thinking: it removes the repetitive grunt work (data generation, locator updates, log reading) so engineers can focus on architecture, edge cases, and security.',
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Step 1: Automated Acceptance Criteria Generation',
        badge: 'Gherkin BDD',
        summary: 'Transform ambiguous user stories into structured Gherkin test matrices.',
        explanation:
          'Pass raw business requirements into the Requirement Generator. The agent analyzes boundary values, security constraints, and negative paths.',
        codeSnippet: {
          language: 'gherkin',
          code: 'Feature: Bank Account Transfer with 2FA\n\n  Scenario: Successful transfer under daily limit\n    Given customer has active checking account with balance $5,000\n    When customer initiates transfer of $500 to savings account\n    And customer inputs valid 6-digit OTP code\n    Then transfer status is "APPROVED"\n    And checking account balance updates to $4,500',
          caption: 'AI-generated Gherkin BDD criteria',
        },
        proTip: 'Always prompt the AI with explicit boundary constraints (e.g. daily limits, decimal precision, concurrency) to generate deep edge cases.',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Self-Healing Locators',
        badge: 'Runtime Healing',
        summary: 'How smart agents adapt when frontend developers change button IDs.',
        explanation:
          'When a selector fails, a self-healing agent inspects surrounding DOM context, text, and visual position to find the element and update the locator blueprint.',
        codeSnippet: {
          language: 'typescript',
          code: '// Self-healing mechanism pseudo-code\ntry {\n  await page.locator("#old-btn-id").click();\n} catch (e) {\n  // AI analyzes accessibility tree & visual similarity\n  const healedLocator = await aiAgent.healLocator(page, "Submit Payment Button");\n  await healedLocator.click();\n  console.warn("✔ Self-healed locator updated in POM repository");\n}',
          caption: 'Self-healing locator resilience',
        },
        proTip: 'Self-healing reduces false-alarm test failures in nightly CI regression runs by up to 80%.',
      },
      {
        stepNumber: 3,
        title: 'Step 3: AI-Assisted Failure Log Triage',
        badge: 'RCA Agent',
        summary: 'Diagnose whether a failure is a real bug, environment issue, or flaky locator.',
        explanation:
          'Feed stack traces, browser console logs, and network HAR files to the QA Log Triage agent to receive root cause analysis and refactoring recommendations in seconds.',
        codeSnippet: {
          language: 'json',
          code: '{\n  "verdict": "FLAKINESS_DETECTED",\n  "rootCause": "Race condition: element clicked while CSS transform opacity was 0.4",\n  "fixRecommendation": "Replace page.locator().click() with await expect(locator).toBeVisible() before click.",\n  "confidence": 0.96\n}',
          caption: 'AI Root Cause Analysis output',
        },
        proTip: 'Include network response codes and timestamps in the prompt to allow the agent to pinpoint backend 504 timeouts vs frontend DOM race conditions.',
      },
    ],
    manualToAutomatedBridge: [
      {
        manualAction: 'Read Jira ticket and brainstorm test cases in Excel for 4 hours',
        automatedApproach: 'Prompt Requirement Generator Agent with PRD specs',
        whyItMatters: 'Synthesizes positive, negative, and security test matrix in 15 seconds.',
      },
      {
        manualAction: 'Manually generate 50 fake user emails, credit cards, and addresses',
        automatedApproach: 'AI Synthetic Data Generator with localized schemas',
        whyItMatters: 'Produces realistic, valid test datasets with boundary edge cases on demand.',
      },
      {
        manualAction: 'Spend 2 hours reading 500-line Jenkins stack trace to find why build failed',
        automatedApproach: 'AI Log Triage Agent analyzes error logs instantly',
        whyItMatters: 'Pins root cause in 3 seconds: "API 500 on /users endpoint, not a UI locator bug".',
      },
    ],
    productionCodeExample: {
      title: 'Production Agent Workflow: Automated Test Case Synthesis',
      description: 'End-to-end prompt engineering and test matrix synthesis workflow using Gemini AI.',
      language: 'typescript',
      code: `// IntelligentQA AI Agent Orchestrator Workflow
export async function synthesizeTestMatrix(userStory: string, apiKey: string) {
  const systemPrompt = \`You are an expert Principal SDET.
Analyze the user story and generate a comprehensive test matrix.
Include:
1. Positive Happy Paths
2. Negative Boundary Cases (BVA)
3. Security & Injection Checks
4. Idempotency & Concurrency Edges
Format output as structured Gherkin BDD scenarios.\`;

  const response = await fetch('/api/ai/qa-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-gemini-api-key': apiKey },
    body: JSON.stringify({ prompt: userStory, agentType: 'test_cases' }),
  });

  const data = await response.json();
  return data.result;
}`,
      annotations: [
        { lineOrPattern: 'systemPrompt', explanation: 'Defines the agent persona with strict SDET engineering domain rules.' },
        { lineOrPattern: 'agentType: "test_cases"', explanation: 'Routes prompt to the specialized autonomous Test Case Synthesizer agent.' },
      ],
    },
    bestPractices: [
      'Always use AI as a co-pilot: review and validate generated test criteria before committing to production.',
      'Provide concrete domain context (business rules, error codes, limits) in prompts for high-fidelity outputs.',
      'Export AI-generated test matrices directly to Excel or Jira for cross-team visibility.',
    ],
    antiPatterns: [
      'Blindly trusting AI output without verifying against actual application business rules.',
      'Using public LLMs with sensitive production customer data or unmasked credentials.',
      'Relying solely on UI automation when autonomous agents can test API and contract layers directly.',
    ],
    interviewQnA: {
      question: 'How do you see AI impacting the role of Quality Assurance and SDETs in the next 3-5 years?',
      answer:
        'AI will not eliminate QA engineers; it will eliminate manual, repetitive test execution and brittle maintenance. The role of the SDET is evolving from writing low-level selector scripts to orchestrating autonomous agent pipelines. SDETs will design test architectures, validate AI-generated test matrices, build self-healing test frameworks, and evaluate the non-deterministic outputs of AI and LLM applications (testing for hallucinations, bias, and latency). Engineers who master both core automation and AI agent workflows will lead software quality.',
    },
  },
};

// ==========================================
// DEDICATED SELENIUM CURRICULUM GENERATOR (JAVA & PYTHON)
// ==========================================
export function getSeleniumLessonDoc(
  lessonId: string,
  isPython: boolean,
  lessonTitle?: string,
  lessonDesc?: string
): LessonDoc {
  const category = isPython ? 'Selenium (Python) • Enterprise Architecture' : 'Selenium (Java) • Enterprise Architecture';
  const cleanTitle = lessonTitle || 'Selenium Automation';

  // 1. Core Java OOPs for Automation / Python Automation OOPs
  if (lessonId === 'java-oops-framework' || lessonId === 'java-oops-qa') {
    return {
      title: '1. Core Java OOPs for Automation',
      category,
      tagline: 'Map Encapsulation, Inheritance, Polymorphism, and Abstraction Directly to QA Architecture',
      overview: 'In manual testing, every test case in your spreadsheet is an isolated row with steps like "Launch Chrome, type user, click submit". If you automate like a manual tester by copy-pasting code into 100 script files, you end up with 100 browser instances running in memory, memory leaks, and when a single button ID changes, you have to manually edit 100 files! Object-Oriented Programming (OOPs) solves this completely.',
      whyItMattersForManualQA: 'If you have 100 test cases that all log in, and the login button ID changes: in bad automation, you must manually edit 100 files. With OOPs Encapsulation (Page Object Model), you edit the locator in ONE line inside the LoginPage class, and all 100 tests pass instantly.',
      architectureUnderTheHood: {
        title: 'How the 4 OOPs Pillars Construct an Enterprise Test Framework',
        flowOrMechanism: '1. Encapsulation: Locators are private in Page classes => 2. Inheritance: Tests extend BaseTest to reuse driver => 3. Polymorphism: DriverFactory returns ChromeDriver or FirefoxDriver => 4. Abstraction: WebDriver interface hides browser binary details.',
        keyTakeaway: 'OOPs is not academic theory: each pillar maps directly to solving a concrete automation challenge.',
      },
      stepByStepGuide: isPython ? [
        {
          stepNumber: 1,
          title: 'Encapsulation: The Foundation of Page Object Model (Python)',
          badge: 'Data Hiding',
          summary: 'Keep web element locators private inside Python Page Classes.',
          explanation: 'Declare locators as private tuple members self._username_field and expose public action methods like login_as(user, pass).',
          codeSnippet: {
            language: 'python',
            caption: 'Python Page Object Encapsulation',
            code: `from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver

class LoginPage:
    def __init__(self, driver: WebDriver):
        self._driver = driver
        # Private encapsulated locators
        self._username_field = (By.ID, "username")
        self._password_field = (By.ID, "password")
        self._submit_btn = (By.CSS_SELECTOR, "button[type='submit']")

    def login_as(self, username: str, password: str):
        self._driver.find_element(*self._username_field).send_keys(username)
        self._driver.find_element(*self._password_field).send_keys(password)
        self._driver.find_element(*self._submit_btn).click()
        return DashboardPage(self._driver)`
          },
          proTip: 'Returning DashboardPage(self._driver) creates a fluent interface matching real user navigation.'
        },
        {
          stepNumber: 2,
          title: 'Inheritance: Eliminating Driver Setup & Teardown with pytest (Python)',
          badge: 'BaseTest Reuse',
          summary: 'Manage browser lifecycle once in BaseTest fixture; all test classes inherit it.',
          explanation: 'Create a BaseTest with @pytest.fixture(autouse=True) setup and teardown.',
          codeSnippet: {
            language: 'python',
            caption: 'Python BaseTest Fixture with Selenium',
            code: `import pytest
from selenium import webdriver

class BaseTest:
    @pytest.fixture(autouse=True)
    def setup_driver(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        yield
        if self.driver:
            self.driver.quit() # Always quit to prevent zombie processes`
          },
          proTip: 'Always call driver.quit() rather than driver.close() to kill the chromedriver binary in memory.'
        },
        {
          stepNumber: 3,
          title: 'Polymorphism: Multi-Browser Dynamic Dispatch (Python)',
          badge: 'Dynamic Dispatch',
          summary: 'Switch between Chrome, Firefox, and Edge with zero test changes.',
          explanation: 'Create a polymorphic DriverFactory that instantiates the requested browser dynamically at runtime.',
          codeSnippet: {
            language: 'python',
            caption: 'Polymorphic Factory in Python',
            code: `from selenium import webdriver

class DriverFactory:
    @staticmethod
    def create_driver(browser: str = "chrome"):
        browser = browser.lower()
        if browser == "firefox":
            return webdriver.Firefox()
        elif browser == "edge":
            return webdriver.Edge()
        return webdriver.Chrome()`
          },
          proTip: 'Parameterize browser execution via pytest -s --browser=firefox for cross-browser matrix testing.'
        },
        {
          stepNumber: 4,
          title: 'Abstraction: Hiding Browser Plumbing Behind Clean Interfaces (Python)',
          badge: 'Clean API',
          summary: 'Interact with high-level contracts while hiding complex WebDriver logic.',
          explanation: 'When you call driver.get("url"), you do not care about HTTP POST commands or W3C wire protocols. Abstraction hides the mechanics.',
          codeSnippet: {
            language: 'python',
            caption: 'Abstraction in Selenium WebDriver',
            code: `from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("http://localhost:3000/sandbox/web")
btn = driver.find_element(By.ID, "start")
btn.click()`
          },
          proTip: 'Wrap reusable waits in a BasePage class so individual page objects do not repeat wait boilerplate.'
        }
      ] : [
        {
          stepNumber: 1,
          title: 'Encapsulation: The Foundation of Page Object Model (Java)',
          badge: 'Data Hiding',
          summary: 'Keep web element locators private inside Java Page Classes.',
          explanation: 'Declare locators as private By usernameField = By.id("username") and expose public action methods like loginAs(user, pass).',
          codeSnippet: {
            language: 'java',
            caption: 'Java Page Object Encapsulation',
            code: `package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage {
    private final WebDriver driver;
    // Private encapsulated locators
    private final By usernameField = By.id("username");
    private final By passwordField = By.id("password");
    private final By submitBtn = By.cssSelector("button[type='submit']");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }

    public DashboardPage loginAs(String username, String password) {
        driver.findElement(usernameField).sendKeys(username);
        driver.findElement(passwordField).sendKeys(password);
        driver.findElement(submitBtn).click();
        return new DashboardPage(driver);
    }
}`
          },
          proTip: 'Returning new DashboardPage(driver) creates a fluent interface matching real user navigation.'
        },
        {
          stepNumber: 2,
          title: 'Inheritance: Eliminating Driver Setup & Teardown with BaseTest (Java)',
          badge: 'BaseTest Reuse',
          summary: 'Manage browser lifecycle once in BaseTest; all test classes inherit it.',
          explanation: 'Create a BaseTest with @BeforeMethod setup and @AfterMethod teardown.',
          codeSnippet: {
            language: 'java',
            caption: 'Java BaseTest Setup & Teardown',
            code: `package com.intelligentqa.base;

import org.openqa.selenium.WebDriver;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.AfterMethod;

public abstract class BaseTest {
    protected WebDriver driver;

    @BeforeMethod
    public void setUp() {
        driver = DriverFactory.createDriver("chrome");
        driver.manage().window().maximize();
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit(); // Always quit to kill chromedriver process
        }
    }
}`
          },
          proTip: 'Always call driver.quit() rather than driver.close() to kill the chromedriver binary in memory.'
        },
        {
          stepNumber: 3,
          title: 'Polymorphism: Multi-Browser Dynamic Dispatch (Java)',
          badge: 'Dynamic Dispatch',
          summary: 'Switch between Chrome, Firefox, and Edge with zero test changes.',
          explanation: 'Create a polymorphic DriverFactory that instantiates the requested browser dynamically at runtime.',
          codeSnippet: {
            language: 'java',
            caption: 'Polymorphic Factory in Java',
            code: `package com.intelligentqa.factory;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.edge.EdgeDriver;

public class DriverFactory {
    public static WebDriver createDriver(String browser) {
        switch (browser.toLowerCase()) {
            case "firefox":
                return new FirefoxDriver();
            case "edge":
                return new EdgeDriver();
            default:
                return new ChromeDriver();
        }
    }
}`
          },
          proTip: 'Parameterize browser execution via TestNG XML parameters for cross-browser matrix testing.'
        },
        {
          stepNumber: 4,
          title: 'Abstraction: Hiding Browser Plumbing Behind Clean Interfaces (Java)',
          badge: 'Clean API',
          summary: 'Interact with high-level contracts while hiding complex WebDriver logic.',
          explanation: 'When you call driver.get("url"), you do not care about HTTP POST commands or W3C wire protocols. Abstraction hides the mechanics.',
          codeSnippet: {
            language: 'java',
            caption: 'Abstraction in Selenium WebDriver',
            code: `import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.By;

WebDriver driver = new ChromeDriver();
driver.get("http://localhost:3000/sandbox/web");
driver.findElement(By.id("start")).click();`
          },
          proTip: 'Wrap reusable waits in an abstract BasePage class so individual page objects do not repeat wait boilerplate.'
        }
      ],
      manualToAutomatedBridge: [
        {
          manualAction: 'Manual Tester copies and pastes browser open and login steps into every spreadsheet tab',
          automatedApproach: 'Inherit BaseTest with @BeforeMethod / pytest fixture setup',
          whyItMatters: 'Zero boilerplate duplication; updating browser startup config happens in exactly 1 file.',
        },
        {
          manualAction: 'When button ID changes, manual tester updates all 100 test scenario documents',
          automatedApproach: 'Encapsulated Page Object Model with private locators',
          whyItMatters: 'Change the locator in 1 class; all 100 test runs automatically use the new locator.',
        }
      ],
      productionCodeExample: {
        title: isPython ? 'Production Implementation (Python Selenium): OOPs Framework' : 'Production Implementation (Java Selenium): OOPs Framework',
        description: isPython ? 'Complete pytest test class extending BaseTest with Page Object Model.' : 'Complete TestNG test class extending BaseTest with Page Object Model.',
        language: isPython ? 'python' : 'java',
        code: isPython ? `# ==========================================
# Production Test with Page Object Model in Selenium (Python)
# ==========================================
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By

class TestLoginValidation:
    @pytest.fixture(autouse=True)
    def setup_and_teardown(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        yield
        if self.driver:
            self.driver.quit()

    def test_valid_user_authentication(self):
        self.driver.get("http://localhost:3000/sandbox/web")
        login_page = LoginPage(self.driver)
        dashboard = login_page.login_as("standard_user", "secret_pass")
        assert dashboard.is_loaded(), "Dashboard failed to load after login"` : `// ==========================================
// Production Test with Page Object Model in Selenium (Java)
// ==========================================
package com.intelligentqa.tests;

import com.intelligentqa.base.BaseTest;
import com.intelligentqa.pages.LoginPage;
import com.intelligentqa.pages.DashboardPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginValidationTest extends BaseTest {

    @Test(description = "Verify user can login cleanly with valid credentials")
    public void testValidUserAuthentication() {
        driver.get("http://localhost:3000/sandbox/web");
        LoginPage loginPage = new LoginPage(driver);
        DashboardPage dashboard = loginPage.loginAs("standard_user", "secret_pass");
        Assert.assertTrue(dashboard.isLoaded(), "Dashboard failed to load after login");
    }
}`,
        annotations: [
          { lineOrPattern: 'test', explanation: 'Test execution entrypoint boundary.' },
          { lineOrPattern: 'loginPage.login', explanation: 'High-level business action hiding low-level element finding.' }
        ]
      },
      bestPractices: [
        'Keep locators private within Page classes',
        'Use BaseTest / fixtures for driver setup and teardown',
        'Never use hardcoded sleep calls; rely on explicit dynamic synchronization'
      ],
      antiPatterns: [
        'Exposing raw By locators to test methods',
        'Copy-pasting driver initialization into every test file',
        'Mixing test assertions directly inside Page Object classes'
      ],
      interviewQnA: {
        question: 'How do you structure an enterprise Selenium framework using OOPs?',
        answer: 'We encapsulate locators inside Page Classes, manage browser lifecycle in a BaseTest class or pytest fixture, use a DriverFactory for multi-browser polymorphism, and wrap common wait utilities inside an abstract BasePage class.'
      }
    };
  }

  // 2. WebDriver 4 Architecture & Browser Setup
  if (lessonId === 'sel-webdriver-setup') {
    return {
      title: '2. WebDriver 4 Architecture & Browser Setup',
      category,
      tagline: 'Selenium 4 W3C WebDriver Architecture, Browser Binaries & Headless Execution',
      overview: 'Selenium 4 communicates directly with browsers using the standardized W3C WebDriver protocol over HTTP/REST and BiDi WebSockets, completely removing the legacy JSON Wire Protocol overhead.',
      whyItMattersForManualQA: 'Manual testers launch browsers by clicking desktop icons. In automation, the test runner must orchestrate browser binary processes, apply security flags, set window viewports, and cleanly terminate processes.',
      architectureUnderTheHood: {
        title: 'Selenium 4 Direct W3C Communication Mechanism',
        flowOrMechanism: 'Test Script => Selenium 4 Client => Direct W3C Protocol => ChromeDriver / GeckoDriver Binary => Native Browser Process',
        keyTakeaway: 'No JSON Wire encoding/decoding overhead: actions execute faster and standard W3C error codes are returned directly.',
      },
      stepByStepGuide: isPython ? [
        {
          stepNumber: 1,
          title: 'WebDriver Initialization & Window Management (Python)',
          badge: 'Binary Setup',
          summary: 'Initialize the Chrome WebDriver instance and configure viewport dimensions.',
          explanation: 'Use selenium.webdriver to spawn a clean browser session with maximized window dimensions.',
          codeSnippet: {
            language: 'python',
            caption: 'Python WebDriver 4 Setup',
            code: `from selenium import webdriver

# Selenium 4 automatically resolves driver binaries via Selenium Manager
driver = webdriver.Chrome()
driver.maximize_window()
driver.set_page_load_timeout(30)`
          },
          proTip: 'Selenium 4 includes built-in Selenium Manager, so webdriver-manager third-party package is no longer needed.'
        },
        {
          stepNumber: 2,
          title: 'Configuring ChromeOptions for Headless & CI/CD Execution (Python)',
          badge: 'CI Options',
          summary: 'Configure headless flags and sandbox flags for Linux/Docker environments.',
          explanation: 'Pass Options instance to webdriver.Chrome() with --headless=new for modern headless execution.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Headless ChromeOptions',
            code: `from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-gpu")

driver = webdriver.Chrome(options=options)`
          },
          proTip: 'Use --headless=new rather than legacy --headless for full modern Chrome rendering engine support.'
        },
        {
          stepNumber: 3,
          title: 'Navigating & Verifying Browser Readiness (Python)',
          badge: 'Verification',
          summary: 'Navigate to application URL and verify the session title.',
          explanation: 'Call driver.get() and perform a fast sanity assertion against driver.title.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Page Navigation & Assertion',
            code: `driver.get("http://localhost:3000/sandbox/web")
assert "Sandbox" in driver.title, f"Unexpected page title: {driver.title}"
print("Successfully loaded target sandbox URL in Python!")`
          },
          proTip: 'Always verify the initial page title or URL before attempting to interact with web elements.'
        }
      ] : [
        {
          stepNumber: 1,
          title: 'WebDriver Initialization & Window Management (Java)',
          badge: 'Binary Setup',
          summary: 'Initialize the ChromeDriver instance and configure viewport dimensions.',
          explanation: 'Use Selenium 4 ChromeDriver to spawn a clean browser session with maximized window dimensions.',
          codeSnippet: {
            language: 'java',
            caption: 'Java WebDriver 4 Setup',
            code: `package com.intelligentqa.setup;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import java.time.Duration;

// Selenium 4 automatically downloads binaries via Selenium Manager
WebDriver driver = new ChromeDriver();
driver.manage().window().maximize();
driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));`
          },
          proTip: 'Selenium 4 includes built-in Selenium Manager, so webdrivermanager dependency is completely optional.'
        },
        {
          stepNumber: 2,
          title: 'Configuring ChromeOptions for Headless & CI/CD Execution (Java)',
          badge: 'CI Options',
          summary: 'Configure headless flags and sandbox flags for Linux/Docker environments.',
          explanation: 'Pass ChromeOptions instance to new ChromeDriver(options) with --headless=new.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Headless ChromeOptions',
            code: `import org.openqa.selenium.chrome.ChromeOptions;

ChromeOptions options = new ChromeOptions();
options.addArguments("--headless=new");
options.addArguments("--no-sandbox");
options.addArguments("--disable-dev-shm-usage");
options.addArguments("--disable-gpu");

WebDriver driver = new ChromeDriver(options);`
          },
          proTip: 'Use --headless=new rather than legacy --headless for modern Blink-engine headless support.'
        },
        {
          stepNumber: 3,
          title: 'Navigating & Verifying Browser Readiness (Java)',
          badge: 'Verification',
          summary: 'Navigate to application URL and verify the session title.',
          explanation: 'Call driver.get() and perform a fast sanity assertion using TestNG.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Page Navigation & Assertion',
            code: `import org.testng.Assert;

driver.get("http://localhost:3000/sandbox/web");
Assert.assertTrue(driver.getTitle().contains("Sandbox"), "Title mismatch");
System.out.println("Successfully loaded target sandbox URL in Java!");`
          },
          proTip: 'Always verify the initial page title or URL before attempting to interact with web elements.'
        }
      ],
      manualToAutomatedBridge: [
        {
          manualAction: 'Tester manually launches Chrome, resizes window, and types URL',
          automatedApproach: 'DriverFactory with ChromeOptions and window.maximize()',
          whyItMatters: 'Guarantees uniform screen resolution and isolated browser cache across all test runs.',
        }
      ],
      productionCodeExample: {
        title: isPython ? 'Production Implementation (Python Selenium): Driver Factory & Fixture' : 'Production Implementation (Java Selenium): Enterprise DriverFactory',
        description: isPython ? 'Pytest fixture managing browser lifecycle with headless support and auto-teardown.' : 'Thread-safe DriverFactory class supporting Chrome, Firefox, and Edge with ChromeOptions.',
        language: isPython ? 'python' : 'java',
        code: isPython ? `# ==========================================
# Python Selenium 4 Production Driver Fixture
# ==========================================
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions

@pytest.fixture(scope="function")
def driver(request):
    browser = request.config.getoption("--browser", default="chrome").lower()
    is_headless = request.config.getoption("--headless", default=False)

    if browser == "chrome":
        options = ChromeOptions()
        if is_headless:
            options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        driver_instance = webdriver.Chrome(options=options)
    elif browser == "firefox":
        driver_instance = webdriver.Firefox()
    else:
        raise ValueError(f"Unsupported browser: {browser}")

    driver_instance.maximize_window()
    yield driver_instance
    driver_instance.quit() # Clean process teardown` : `// ==========================================
// Java Selenium 4 Production DriverFactory
// ==========================================
package com.intelligentqa.factory;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.edge.EdgeDriver;

public class DriverFactory {
    public static WebDriver createDriver(String browser, boolean headless) {
        switch (browser.toLowerCase()) {
            case "firefox":
                return new FirefoxDriver();
            case "edge":
                return new EdgeDriver();
            default:
                ChromeOptions options = new ChromeOptions();
                if (headless) {
                    options.addArguments("--headless=new");
                }
                options.addArguments("--no-sandbox", "--disable-dev-shm-usage");
                return new ChromeDriver(options);
        }
    }
}`,
        annotations: [
          { lineOrPattern: 'createDriver', explanation: 'Factory pattern isolating browser creation.' },
          { lineOrPattern: 'headless=new', explanation: 'Modern headless rendering flag.' }
        ]
      },
      bestPractices: [
        'Always call driver.quit() in teardown to prevent orphan browser processes in memory',
        'Use --headless=new for Docker / CI execution',
        'Avoid hardcoded executable paths; rely on Selenium Manager'
      ],
      antiPatterns: [
        'Calling driver.close() instead of driver.quit() at end of suite',
        'Hardcoding Windows/Mac paths like C:\\chromedriver.exe',
        'Omitting --no-sandbox in containerized CI environments'
      ],
      interviewQnA: {
        question: 'What is the architectural difference between Selenium 3 and Selenium 4?',
        answer: 'Selenium 3 required the JSON Wire Protocol to translate language bindings into HTTP requests that browser drivers understood. Selenium 4 is 100% W3C compliant, communicating natively with browser drivers without intermediate translation, and adds BiDi (Bidirectional) WebSocket capabilities.'
      }
    };
  }

  // 3. Advanced Dynamic Locators (XPath & CSS)
  if (lessonId === 'sel-locators-xpath') {
    return {
      title: '3. Advanced Dynamic Locators (XPath & CSS)',
      category,
      tagline: 'Master Resilient CSS Selectors, Dynamic XPath Axes & Anti-Fragile DOM Queries',
      overview: 'Locators are the number one source of flakiness in web test automation. Brittle absolute XPaths break whenever developers tweak HTML structure. Modern SDETs use resilient CSS selectors and dynamic XPath axes that target stable semantics and relationships.',
      whyItMattersForManualQA: 'Manual testers visually recognize buttons by their label, icon, or proximity to table rows. Automators must translate that human visual recognition into robust locators that do not depend on fragile DOM nesting indexes.',
      architectureUnderTheHood: {
        title: 'DOM Query Engine & Selector Evaluation',
        flowOrMechanism: 'Selector String => Native Browser document.querySelector / evaluate => DOM Node Traversal => WebElement Reference Token',
        keyTakeaway: 'CSS selectors execute natively in the browser layout engine faster than XPath; use XPath primarily for text matching and reverse parent/sibling axes navigation.',
      },
      stepByStepGuide: isPython ? [
        {
          stepNumber: 1,
          title: 'Resilient CSS Attribute & Pseudo Selectors (Python)',
          badge: 'CSS Strategy',
          summary: 'Use resilient CSS selectors targeting data-testid, aria attributes, or stable placeholders.',
          explanation: 'CSS attribute selectors (e.g. input[placeholder*="Search"]) remain stable even when layout CSS classes are refactored.',
          codeSnippet: {
            language: 'python',
            caption: 'Python CSS Locators',
            code: `from selenium.webdriver.common.by import By

# Search input and button with resilient CSS
search_box = (By.CSS_SELECTOR, "input[placeholder*='Search']")
submit_btn = (By.CSS_SELECTOR, "button[type='submit'].btn-primary")
active_badge = (By.CSS_SELECTOR, "[data-status='active']")`
          },
          proTip: 'Prefer [data-testid="..."] or [aria-label="..."] over class names generated by Tailwind or CSS modules.'
        },
        {
          stepNumber: 2,
          title: 'Dynamic XPath Axes: Ancestor & Sibling Traversal (Python)',
          badge: 'XPath Axes',
          summary: 'Locate action buttons relative to target data inside table rows.',
          explanation: 'Traverse parent rows and descendant buttons using XPath axes (e.g. //tr[contains(., "User")]//button).',
          codeSnippet: {
            language: 'python',
            caption: 'Python Dynamic XPath with Axes',
            code: `from selenium.webdriver.common.by import By

def get_edit_button_for_user(username: str):
    # Dynamically locate the edit button inside the table row containing the username
    xpath = f"//tr[contains(., '{username}')]//button[contains(@class, 'edit-btn')]"
    return (By.XPATH, xpath)

# Usage in Python:
edit_locator = get_edit_button_for_user("Sarah Connor")
driver.find_element(*edit_locator).click()`
          },
          proTip: 'Never use indexed paths like //tr[3]/td[5]/button because row ordering dynamically changes with sorting.'
        },
        {
          stepNumber: 3,
          title: 'Normalized Text & Compound Conditions (Python)',
          badge: 'Text Matching',
          summary: 'Match exact button text stripped of extra whitespace and linebreaks.',
          explanation: 'Use normalize-space() to eliminate hidden whitespace differences in modern frontend web apps.',
          codeSnippet: {
            language: 'python',
            caption: 'Python normalize-space() XPath',
            code: `from selenium.webdriver.common.by import By

# Matches button cleanly even with leading/trailing spaces or inner spans
save_btn = driver.find_element(By.XPATH, "//button[normalize-space()='Save Changes']")
save_btn.click()`
          },
          proTip: 'normalize-space(.) collapses multi-line text into a clean single string for reliable matching.'
        }
      ] : [
        {
          stepNumber: 1,
          title: 'Resilient CSS Attribute & Pseudo Selectors (Java)',
          badge: 'CSS Strategy',
          summary: 'Use resilient CSS selectors targeting data-testid, aria attributes, or stable placeholders.',
          explanation: 'CSS attribute selectors (e.g. input[placeholder*="Search"]) remain stable even when layout CSS classes are refactored.',
          codeSnippet: {
            language: 'java',
            caption: 'Java CSS Locators',
            code: `package com.intelligentqa.locators;

import org.openqa.selenium.By;

// Search input and button with resilient CSS
By searchBox = By.cssSelector("input[placeholder*='Search']");
By submitBtn = By.cssSelector("button[type='submit'].btn-primary");
By activeBadge = By.cssSelector("[data-status='active']");`
          },
          proTip: 'Prefer [data-testid="..."] or [aria-label="..."] over class names generated by Tailwind or CSS modules.'
        },
        {
          stepNumber: 2,
          title: 'Dynamic XPath Axes: Ancestor & Sibling Traversal (Java)',
          badge: 'XPath Axes',
          summary: 'Locate action buttons relative to target data inside table rows.',
          explanation: 'Traverse parent rows and descendant buttons using XPath axes (e.g. //tr[contains(., "User")]//button).',
          codeSnippet: {
            language: 'java',
            caption: 'Java Dynamic XPath with Axes',
            code: `package com.intelligentqa.locators;

import org.openqa.selenium.By;

public class TableLocators {
    // Dynamically locate the edit button inside the table row containing the username
    public static By getEditButtonForUser(String username) {
        String xpath = "//tr[contains(., '" + username + "')]//button[contains(@class, 'edit-btn')]";
        return By.xpath(xpath);
    }
}`
          },
          proTip: 'Never use indexed paths like //tr[3]/td[5]/button because row ordering dynamically changes with sorting.'
        },
        {
          stepNumber: 3,
          title: 'Normalized Text & Compound Conditions (Java)',
          badge: 'Text Matching',
          summary: 'Match exact button text stripped of extra whitespace and linebreaks.',
          explanation: 'Use normalize-space() to eliminate hidden whitespace differences in modern frontend web apps.',
          codeSnippet: {
            language: 'java',
            caption: 'Java normalize-space() XPath',
            code: `import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

// Matches button cleanly even with leading/trailing spaces or inner spans
WebElement saveBtn = driver.findElement(By.xpath("//button[normalize-space()='Save Changes']"));
saveBtn.click();`
          },
          proTip: 'normalize-space(.) collapses multi-line text into a clean single string for reliable matching.'
        }
      ],
      manualToAutomatedBridge: [
        {
          manualAction: 'Manual tester scans table for Sarah Connor and clicks the edit pencil icon on that row',
          automatedApproach: 'Relative XPath axes: //tr[contains(., "Sarah Connor")]//button',
          whyItMatters: 'Locates the exact user button regardless of table sorting or pagination index changes.',
        }
      ],
      productionCodeExample: {
        title: isPython ? 'Production Implementation (Python Selenium): Dynamic Locators' : 'Production Implementation (Java Selenium): Dynamic Table Locators',
        description: isPython ? 'Python Page class with robust locator methods for dynamic data tables.' : 'Java Page class with robust locator methods for dynamic data tables.',
        language: isPython ? 'python' : 'java',
        code: isPython ? `# ==========================================
# Python Selenium Production Dynamic Table Page
# ==========================================
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class UsersTablePage:
    def __init__(self, driver: WebDriver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.search_field = (By.CSS_SELECTOR, "input[placeholder*='Search']")

    def search_user(self, query: str):
        elem = self.wait.until(EC.visibility_of_element_located(self.search_field))
        elem.clear()
        elem.send_keys(query)

    def click_edit_user(self, username: str):
        # Anti-fragile relative XPath axis
        row_edit_xpath = f"//tr[contains(., '{username}')]//button[contains(@class, 'edit-btn')]"
        btn = self.wait.until(EC.element_to_be_clickable((By.XPATH, row_edit_xpath)))
        btn.click()` : `// ==========================================
// Java Selenium Production Dynamic Table Page
// ==========================================
package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class UsersTablePage {
    private final WebDriver driver;
    private final WebDriverWait wait;
    private final By searchField = By.cssSelector("input[placeholder*='Search']");

    public UsersTablePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void searchUser(String query) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(searchField));
        input.clear();
        input.sendKeys(query);
    }

    public void clickEditUser(String username) {
        // Anti-fragile relative XPath axis
        String rowEditXpath = "//tr[contains(., '" + username + "')]//button[contains(@class, 'edit-btn')]";
        WebElement editBtn = wait.until(ExpectedConditions.elementToBeClickable(By.xpath(rowEditXpath)));
        editBtn.click();
    }
}`,
        annotations: [
          { lineOrPattern: 'searchUser', explanation: 'Encapsulated text search.' },
          { lineOrPattern: 'clickEditUser', explanation: 'Dynamic XPath based on user row text.' }
        ]
      },
      bestPractices: [
        'Prefer CSS selectors for simple attribute lookups and IDs',
        'Use XPath ancestor/following-sibling axes for table rows',
        'Always wrap locator actions in explicit waits'
      ],
      antiPatterns: [
        'Using full absolute XPath starting from /html/body/...',
        'Relying on auto-generated styling class names like .css-1729x',
        'Targeting elements by brittle numeric indexes like [4]'
      ],
      interviewQnA: {
        question: 'When should an SDET use CSS Selectors vs XPath in Selenium?',
        answer: 'CSS Selectors are evaluated natively by browser layout engines, making them faster and cleaner for IDs, attributes, classes, and hierarchy. XPath is required when navigating backwards up the DOM tree (parent or ancestor axes) or locating elements by text content using text() or contains().'
      }
    };
  }

  // 4. WebElement Actions & Form Interactions
  if (lessonId === 'sel-webelement-actions') {
    return {
      title: '4. WebElement Actions & Form Interactions',
      category,
      tagline: 'Form Automation: Text Inputs, Select Dropdowns, Checkboxes & Radio Controls',
      overview: 'Interacting with form elements requires robust handling: clearing input buffers before typing, selecting dropdown options via the Select class rather than fragile clicks, and verifying checked states before toggling checkboxes.',
      whyItMattersForManualQA: 'A manual tester selects a country from a dropdown and notices if the input cleared cleanly. Automation scripts execute in milliseconds and will accidentally append text or fail to trigger JavaScript change events if not coded properly.',
      architectureUnderTheHood: {
        title: 'Browser Event Firing on WebElements',
        flowOrMechanism: 'driver.sendKeys() => Native Focus Event => KeyDown / KeyPress => DOM Value Mutation => Change / Blur Event',
        keyTakeaway: 'Always call clear() before sendKeys() to ensure legacy default text does not corrupt test data inputs.',
      },
      stepByStepGuide: isPython ? [
        {
          stepNumber: 1,
          title: 'Safe Text Typing & Input Buffer Clearing (Python)',
          badge: 'Input Handling',
          summary: 'Clear existing values and type test strings.',
          explanation: 'Call clear() first, then send_keys() to input valid email or username values.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Text Field Interaction',
            code: `from selenium.webdriver.common.by import By

email_field = driver.find_element(By.ID, "user-email")
email_field.clear() # Clear default placeholder text
email_field.send_keys("sdet@intelligentqa.com")`
          },
          proTip: 'For tricky React controlled inputs, select all with Keys.CONTROL + "a" followed by Keys.BACK_SPACE.'
        },
        {
          stepNumber: 2,
          title: 'HTML Select Dropdown Handling (Python)',
          badge: 'Select Class',
          summary: 'Use Selenium Select helper class to select dropdown options by text or value.',
          explanation: 'The Select class automatically manages option elements and triggers browser change events.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Select Dropdown',
            code: `from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By

dropdown_element = driver.find_element(By.ID, "role-dropdown")
select = Select(dropdown_element)

# Select by visible text or value
select.select_by_visible_text("Lead SDET")
assert select.first_selected_option.text == "Lead SDET"`
          },
          proTip: 'Never use hardcoded clicks on <option> tags; always wrap native <select> in the Select class.'
        },
        {
          stepNumber: 3,
          title: 'Checkbox & Radio Button Verification (Python)',
          badge: 'State Verification',
          summary: 'Check whether checkbox is selected before clicking to avoid unchecking.',
          explanation: 'Use is_selected() to inspect boolean state before triggering toggle click.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Checkbox State Toggle',
            code: `terms_checkbox = driver.find_element(By.ID, "agree-terms")

# Only click if not already checked
if not terms_checkbox.is_selected():
    terms_checkbox.click()

assert terms_checkbox.is_selected()`
          },
          proTip: 'If checkbox has an overlapping custom CSS pseudo-element, click the parent <label> instead.'
        }
      ] : [
        {
          stepNumber: 1,
          title: 'Safe Text Typing & Input Buffer Clearing (Java)',
          badge: 'Input Handling',
          summary: 'Clear existing values and type test strings.',
          explanation: 'Call clear() first, then sendKeys() to input valid email or username values.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Text Field Interaction',
            code: `package com.intelligentqa.forms;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

WebElement emailField = driver.findElement(By.id("user-email"));
emailField.clear(); // Clear default placeholder text
emailField.sendKeys("sdet@intelligentqa.com");`
          },
          proTip: 'For tricky React controlled inputs, select all with Keys.CONTROL + "a" followed by Keys.BACK_SPACE.'
        },
        {
          stepNumber: 2,
          title: 'HTML Select Dropdown Handling (Java)',
          badge: 'Select Class',
          summary: 'Use Selenium Select helper class to select dropdown options by text or value.',
          explanation: 'The Select class automatically manages option elements and triggers browser change events.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Select Dropdown',
            code: `import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

WebElement dropdownElem = driver.findElement(By.id("role-dropdown"));
Select select = new Select(dropdownElem);

// Select by visible text or value
select.selectByVisibleText("Lead SDET");
Assert.assertEquals(select.getFirstSelectedOption().getText(), "Lead SDET");`
          },
          proTip: 'Never use hardcoded clicks on <option> tags; always wrap native <select> in the Select class.'
        },
        {
          stepNumber: 3,
          title: 'Checkbox & Radio Button Verification (Java)',
          badge: 'State Verification',
          summary: 'Check whether checkbox is selected before clicking to avoid unchecking.',
          explanation: 'Use isSelected() to inspect boolean state before triggering toggle click.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Checkbox State Toggle',
            code: `import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

WebElement termsCheckbox = driver.findElement(By.id("agree-terms"));

// Only click if not already checked
if (!termsCheckbox.isSelected()) {
    termsCheckbox.click();
}
Assert.assertTrue(termsCheckbox.isSelected());`
          },
          proTip: 'If checkbox has an overlapping custom CSS pseudo-element, click the parent <label> instead.'
        }
      ],
      manualToAutomatedBridge: [
        {
          manualAction: 'Tester double clicks text box to overwrite existing text and selects dropdown',
          automatedApproach: 'element.clear() + Select(elem).selectByVisibleText()',
          whyItMatters: 'Ensures reliable payload without corrupted duplicate strings or unselected defaults.',
        }
      ],
      productionCodeExample: {
        title: isPython ? 'Production Implementation (Python Selenium): Form Actions' : 'Production Implementation (Java Selenium): Registration Form Page',
        description: isPython ? 'Complete Python Page Object automating input fields, dropdowns, and checkboxes.' : 'Complete Java Page Object automating input fields, dropdowns, and checkboxes.',
        language: isPython ? 'python' : 'java',
        code: isPython ? `# ==========================================
# Python Selenium Production Form Automation
# ==========================================
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

class RegistrationPage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.email_input = (By.ID, "user-email")
        self.role_select = (By.ID, "role-dropdown")
        self.terms_checkbox = (By.ID, "agree-terms")
        self.submit_btn = (By.CSS_SELECTOR, "button[type='submit']")

    def fill_registration_form(self, email: str, role: str):
        # 1. Type email cleanly
        email_elem = self.wait.until(EC.visibility_of_element_located(self.email_input))
        email_elem.clear()
        email_elem.send_keys(email)

        # 2. Select dropdown
        select = Select(self.wait.until(EC.visibility_of_element_located(self.role_select)))
        select.select_by_visible_text(role)

        # 3. Check agreement terms
        terms = self.driver.find_element(*self.terms_checkbox)
        if not terms.is_selected():
            terms.click()

        # 4. Submit
        self.driver.find_element(*self.submit_btn).click()` : `// ==========================================
// Java Selenium Production Form Automation
// ==========================================
package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class RegistrationPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By emailInput = By.id("user-email");
    private final By roleSelect = By.id("role-dropdown");
    private final By termsCheckbox = By.id("agree-terms");
    private final By submitBtn = By.cssSelector("button[type='submit']");

    public RegistrationPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void fillRegistrationForm(String email, String role) {
        // 1. Type email cleanly
        WebElement emailElem = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        emailElem.clear();
        emailElem.sendKeys(email);

        // 2. Select dropdown
        Select select = new Select(wait.until(ExpectedConditions.visibilityOfElementLocated(roleSelect)));
        select.selectByVisibleText(role);

        // 3. Check agreement terms
        WebElement terms = driver.findElement(termsCheckbox);
        if (!terms.isSelected()) {
            terms.click();
        }

        // 4. Submit
        driver.findElement(submitBtn).click();
    }
}`,
        annotations: [
          { lineOrPattern: 'fillRegistrationForm', explanation: 'Atomic business operation.' },
          { lineOrPattern: 'Select', explanation: 'Safe dropdown option selection.' }
        ]
      },
      bestPractices: [
        'Always clear() input fields before typing test strings',
        'Verify isSelected() before clicking checkboxes',
        'Use the Select class rather than raw CSS option clicks'
      ],
      antiPatterns: [
        'Typing into pre-filled fields without calling clear()',
        'Hardcoding Thread.sleep after selecting a dropdown option',
        'Assuming checkboxes start unchecked without verification'
      ],
      interviewQnA: {
        question: 'How do you handle custom non-native dropdowns in Selenium (e.g. React/Tailwind custom selects)?',
        answer: 'Custom dropdowns are rendered with <div> and <ul> tags rather than native <select> elements, so the Selenium Select class throws an UnexpectedTagNameException. For custom dropdowns, click the trigger button element, explicitly wait for the dropdown panel visibility, and click the target option by its text or role locator.'
      }
    };
  }

  // 5. Synchronization & Dynamic Waits Strategy
  if (lessonId === 'sel-sync-waits') {
    return {
      title: '5. Synchronization & Dynamic Waits Strategy',
      category,
      tagline: 'Eliminate Flakiness with WebDriverWait, ExpectedConditions & Fluent Synchronization',
      overview: 'Modern single page apps (SPAs) load content asynchronously via AJAX and fetch calls. Tests that run faster than network requests throw NoSuchElementException. Explicit synchronization with WebDriverWait polls the DOM dynamically until the required state is reached.',
      whyItMattersForManualQA: 'A manual tester sees a loading spinner and intuitively waits for it to vanish before clicking. If an automated script clicks while the spinner is active, the click is intercepted or fails.',
      architectureUnderTheHood: {
        title: 'WebDriverWait Dynamic Polling Mechanism',
        flowOrMechanism: 'Test Runner => Loop every 500ms => Evaluate ExpectedCondition => DOM Ready or Exception Caught => Timeout (TimeoutException) or Resume Test',
        keyTakeaway: 'Explicit waits advance the exact millisecond the element is ready, saving hundreds of hours of CI pipeline time compared to Thread.sleep.',
      },
      stepByStepGuide: isPython ? [
        {
          stepNumber: 1,
          title: 'Initializing WebDriverWait with Polling Interval (Python)',
          badge: 'Wait Setup',
          summary: 'Create a WebDriverWait instance with configurable timeout and ignored exceptions.',
          explanation: 'WebDriverWait continually executes expected conditions at 500ms polling intervals.',
          codeSnippet: {
            language: 'python',
            caption: 'Python WebDriverWait Setup',
            code: `from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException

# Wait up to 10 seconds, polling every 500ms
wait = WebDriverWait(
    driver,
    timeout=10,
    poll_frequency=0.5,
    ignored_exceptions=[NoSuchElementException, StaleElementReferenceException]
)`
          },
          proTip: 'Never mix implicit wait (implicitly_wait) with explicit wait; it causes unpredictable timeout compounding.'
        },
        {
          stepNumber: 2,
          title: 'Waiting for Element Clickability (Python)',
          badge: 'Clickability',
          summary: 'Wait until the target button is attached, visible, and enabled.',
          explanation: 'element_to_be_clickable ensures the element is both visible and enabled so clicks are never intercepted.',
          codeSnippet: {
            language: 'python',
            caption: 'Python element_to_be_clickable',
            code: `from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

trigger_btn = wait.until(EC.element_to_be_clickable((By.ID, "ajax-trigger")))
trigger_btn.click()
print("Clicked button safely after element was clickable!")`
          },
          proTip: 'element_to_be_clickable protects against ElementClickInterceptedException.'
        },
        {
          stepNumber: 3,
          title: 'Inverted Waits: Spinner Invisibility & Content Presence (Python)',
          badge: 'Inverted Wait',
          summary: 'Wait for loading indicators to vanish, then assert result banner.',
          explanation: 'Use invisibility_of_element_located to wait for spinners to leave the DOM.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Inverted Spinner Wait',
            code: `from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

# 1. Wait for spinner to disappear
wait.until(EC.invisibility_of_element_located((By.CLASS_NAME, "loading-spinner")))

# 2. Assert dynamic result content is now visible
result_banner = wait.until(EC.visibility_of_element_located((By.ID, "result-banner")))
assert "Data Loaded Successfully" in result_banner.text`
          },
          proTip: 'Waiting for spinner invisibility is the most reliable way to synchronize on slow AJAX API responses.'
        }
      ] : [
        {
          stepNumber: 1,
          title: 'Initializing WebDriverWait with Polling Interval (Java)',
          badge: 'Wait Setup',
          summary: 'Create a WebDriverWait instance with configurable timeout and ignored exceptions.',
          explanation: 'WebDriverWait continually executes expected conditions at 500ms polling intervals.',
          codeSnippet: {
            language: 'java',
            caption: 'Java WebDriverWait Setup',
            code: `package com.intelligentqa.sync;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import java.time.Duration;

// Wait up to 10 seconds, polling every 500ms
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
wait.pollingEvery(Duration.ofMillis(500))
    .ignoring(NoSuchElementException.class)
    .ignoring(StaleElementReferenceException.class);`
          },
          proTip: 'Never mix implicit wait (driver.manage().timeouts().implicitlyWait) with explicit wait.'
        },
        {
          stepNumber: 2,
          title: 'Waiting for Element Clickability (Java)',
          badge: 'Clickability',
          summary: 'Wait until the target button is attached, visible, and enabled.',
          explanation: 'elementToBeClickable ensures the element is both visible and enabled so clicks are never intercepted.',
          codeSnippet: {
            language: 'java',
            caption: 'Java elementToBeClickable',
            code: `import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

WebElement triggerBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("ajax-trigger")));
triggerBtn.click();
System.out.println("Clicked button safely after element was clickable!");`
          },
          proTip: 'elementToBeClickable protects against ElementClickInterceptedException.'
        },
        {
          stepNumber: 3,
          title: 'Inverted Waits: Spinner Invisibility & Content Presence (Java)',
          badge: 'Inverted Wait',
          summary: 'Wait for loading indicators to vanish, then assert result banner.',
          explanation: 'Use invisibilityOfElementLocated to wait for spinners to leave the DOM.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Inverted Spinner Wait',
            code: `import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;

// 1. Wait for spinner to disappear
wait.until(ExpectedConditions.invisibilityOfElementLocated(By.className("loading-spinner")));

// 2. Assert dynamic result content is now visible
WebElement resultBanner = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("result-banner")));
Assert.assertTrue(resultBanner.getText().contains("Data Loaded Successfully"));`
          },
          proTip: 'Waiting for spinner invisibility is the most reliable way to synchronize on slow AJAX API responses.'
        }
      ],
      manualToAutomatedBridge: [
        {
          manualAction: 'Tester waits for loading spinner to stop spinning before clicking submit',
          automatedApproach: 'wait.until(ExpectedConditions.invisibilityOfElementLocated(spinner))',
          whyItMatters: 'Advances test execution the exact millisecond the API responds; zero wasted wait time.',
        }
      ],
      productionCodeExample: {
        title: isPython ? 'Production Implementation (Python Selenium): Synchronization Strategy' : 'Production Implementation (Java Selenium): Synchronization Strategy',
        description: isPython ? 'Complete Python wait utility handling dynamic AJAX calls and avoiding sleep.' : 'Complete Java wait utility handling dynamic AJAX calls and avoiding sleep.',
        language: isPython ? 'python' : 'java',
        code: isPython ? `# ==========================================
# Python Selenium Production Synchronization Utility
# ==========================================
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_dynamic_ajax_synchronization(driver):
    driver.get("http://localhost:3000/sandbox/web")
    wait = WebDriverWait(driver, 10)

    # 1. Wait for clickable trigger
    btn = wait.until(EC.element_to_be_clickable((By.ID, "ajax-trigger")))
    btn.click()

    # 2. Wait for loading spinner to vanish
    wait.until(EC.invisibility_of_element_located((By.CLASS_NAME, "loading-spinner")))

    # 3. Assert loaded result text
    banner = wait.until(EC.visibility_of_element_located((By.ID, "result-banner")))
    assert "Data Loaded" in banner.text` : `// ==========================================
// Java Selenium Production Synchronization Utility
// ==========================================
package com.intelligentqa.sync;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import java.time.Duration;

public class DynamicSyncTest {
    public static void verifyAjaxSync(WebDriver driver) {
        driver.get("http://localhost:3000/sandbox/web");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // 1. Wait for clickable trigger
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(By.id("ajax-trigger")));
        btn.click();

        // 2. Wait for loading spinner to vanish
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.className("loading-spinner")));

        // 3. Assert loaded result text
        WebElement banner = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("result-banner")));
        Assert.assertTrue(banner.getText().contains("Data Loaded"));
    }
}`,
        annotations: [
          { lineOrPattern: 'WebDriverWait', explanation: 'Explicit synchronization polling.' },
          { lineOrPattern: 'invisibility_of_element_located', explanation: 'Inverted condition waiting for spinner disappearance.' }
        ]
      },
      bestPractices: [
        'Use WebDriverWait with ExpectedConditions for all element interactions',
        'Wait for spinner/overlay invisibility before interacting with underlying forms',
        'Avoid Thread.sleep / time.sleep in all test code'
      ],
      antiPatterns: [
        'Mixing implicitWait with WebDriverWait (causes unpredictable timeout multiplier)',
        'Using hardcoded Thread.sleep(5000)',
        'Checking element presence without verifying element clickability'
      ],
      interviewQnA: {
        question: 'Why should you never mix Implicit Wait and Explicit Wait in Selenium?',
        answer: 'Selenium documentation explicitly warns that mixing implicit and explicit waits produces undefined behavior. If an element is missing, the implicit wait timeout will delay the evaluation of the explicit wait, causing compounding timeout loops and slow, unpredictable test runs.'
      }
    };
  }

  // 6. Advanced User Interactions (Actions API)
  if (lessonId === 'sel-actions-api') {
    return {
      title: '6. Advanced User Interactions (Actions API)',
      category,
      tagline: 'Simulate Complex User Gestures: Hover, Drag-and-Drop, Right-Click & Keyboard Chords',
      overview: 'Standard WebElement.click() cannot perform mouse hover navigation, drag-and-drop operations, context right-clicks, or multi-key keyboard shortcuts (like Ctrl+A). The Actions API builds composite user gesture chains that execute natively.',
      whyItMattersForManualQA: 'Manual testers hover over navigation bars to open submenus or drag cards on a Kanban board. The Actions API allows automators to replicate these mouse gestures accurately.',
      architectureUnderTheHood: {
        title: 'Actions API Virtual Input Device Mechanism',
        flowOrMechanism: 'ActionChains / Actions => Compile Pointer / Key Event Queue => Send W3C Actions Payload => OS Synthesizes Native Device Events',
        keyTakeaway: 'Always remember to call .perform() in Java or Python, otherwise the queued actions will never execute!',
      },
      stepByStepGuide: isPython ? [
        {
          stepNumber: 1,
          title: 'Mouse Hover Submenu Navigation (Python)',
          badge: 'Hover',
          summary: 'Hover over a parent menu element to display a dropdown submenu.',
          explanation: 'Use ActionChains(driver).move_to_element(menu).perform() to reveal hovered UI.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Hover with ActionChains',
            code: `from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By

actions = ActionChains(driver)
menu_trigger = driver.find_element(By.ID, "nav-products-menu")

# Hover over menu trigger to expand sub-items
actions.move_to_element(menu_trigger).perform()`
          },
          proTip: 'Always call .perform() at the end of the action chain.'
        },
        {
          stepNumber: 2,
          title: 'Drag and Drop File / Card Movement (Python)',
          badge: 'Drag & Drop',
          summary: 'Drag source web element and release it on the target dropzone.',
          explanation: 'Use drag_and_drop(source, target) to simulate click-and-hold, move, and release.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Drag and Drop',
            code: `source_card = driver.find_element(By.ID, "draggable-card")
target_zone = driver.find_element(By.ID, "dropzone-target")

actions.drag_and_drop(source_card, target_zone).perform()`
          },
          proTip: 'For HTML5 native drag and drop, standard dragAndDrop might fail; use JavaScript or custom offsets.'
        },
        {
          stepNumber: 3,
          title: 'Keyboard Chords & Modifier Keys (Python)',
          badge: 'Key Chords',
          summary: 'Simulate pressing Ctrl/Cmd keys simultaneously with text.',
          explanation: 'Use key_down and key_up with Keys.CONTROL to trigger OS shortcuts.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Keyboard Chords',
            code: `from selenium.webdriver.common.keys import Keys

# Select All (Ctrl+A) and Delete
actions.key_down(Keys.CONTROL).send_keys("a").key_up(Keys.CONTROL).send_keys(Keys.BACK_SPACE).perform()`
          },
          proTip: 'Always release modifier keys with key_up to avoid sticking modifier state across tests.'
        }
      ] : [
        {
          stepNumber: 1,
          title: 'Mouse Hover Submenu Navigation (Java)',
          badge: 'Hover',
          summary: 'Hover over a parent menu element to display a dropdown submenu.',
          explanation: 'Use new Actions(driver).moveToElement(menu).perform() to reveal hovered UI.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Hover with Actions API',
            code: `package com.intelligentqa.actions;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

Actions actions = new Actions(driver);
WebElement menuTrigger = driver.findElement(By.id("nav-products-menu"));

// Hover over menu trigger to expand sub-items
actions.moveToElement(menuTrigger).perform();`
          },
          proTip: 'Always call .perform() at the end of the action chain.'
        },
        {
          stepNumber: 2,
          title: 'Drag and Drop File / Card Movement (Java)',
          badge: 'Drag & Drop',
          summary: 'Drag source web element and release it on the target dropzone.',
          explanation: 'Use dragAndDrop(source, target) to simulate click-and-hold, move, and release.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Drag and Drop',
            code: `WebElement sourceCard = driver.findElement(By.id("draggable-card"));
WebElement targetZone = driver.findElement(By.id("dropzone-target"));

actions.dragAndDrop(sourceCard, targetZone).perform();`
          },
          proTip: 'For HTML5 native drag and drop, standard dragAndDrop might fail; use custom drag offsets.'
        },
        {
          stepNumber: 3,
          title: 'Keyboard Chords & Modifier Keys (Java)',
          badge: 'Key Chords',
          summary: 'Simulate pressing Ctrl/Cmd keys simultaneously with text.',
          explanation: 'Use keyDown and keyUp with Keys.CONTROL to trigger OS shortcuts.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Keyboard Chords',
            code: `import org.openqa.selenium.Keys;

// Select All (Ctrl+A) and Delete
actions.keyDown(Keys.CONTROL).sendKeys("a").keyUp(Keys.CONTROL).sendKeys(Keys.BACK_SPACE).perform();`
          },
          proTip: 'Always release modifier keys with keyUp to avoid sticking modifier state across tests.'
        }
      ],
      manualToAutomatedBridge: [
        {
          manualAction: 'Tester hovers mouse over navigation menu and drags item to another container',
          automatedApproach: 'Actions.moveToElement() + Actions.dragAndDrop().perform()',
          whyItMatters: 'Triggers true CSS :hover states and HTML5 drag events reliably.',
        }
      ],
      productionCodeExample: {
        title: isPython ? 'Production Implementation (Python Selenium): Actions API' : 'Production Implementation (Java Selenium): Actions API Utilities',
        description: isPython ? 'Python Actions utility handling hover, drag-drop, and context-clicks.' : 'Java Actions utility handling hover, drag-drop, and context-clicks.',
        language: isPython ? 'python' : 'java',
        code: isPython ? `# ==========================================
# Python Selenium Production Actions API
# ==========================================
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By

class CanvasInteractionPage:
    def __init__(self, driver):
        self.driver = driver
        self.actions = ActionChains(driver)

    def hover_and_click_submenu(self, menu_id: str, item_id: str):
        menu = self.driver.find_element(By.ID, menu_id)
        self.actions.move_to_element(menu).perform()
        sub_item = self.driver.find_element(By.ID, item_id)
        sub_item.click()

    def right_click_context_menu(self, element_id: str):
        elem = self.driver.find_element(By.ID, element_id)
        self.actions.context_click(elem).perform()` : `// ==========================================
// Java Selenium Production Actions API
// ==========================================
package com.intelligentqa.actions;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

public class CanvasInteractionPage {
    private final WebDriver driver;
    private final Actions actions;

    public CanvasInteractionPage(WebDriver driver) {
        this.driver = driver;
        this.actions = new Actions(driver);
    }

    public void hoverAndClickSubmenu(String menuId, String itemId) {
        WebElement menu = driver.findElement(By.id(menuId));
        actions.moveToElement(menu).perform();
        WebElement subItem = driver.findElement(By.id(itemId));
        subItem.click();
    }

    public void rightClickContextMenu(String elementId) {
        WebElement elem = driver.findElement(By.id(elementId));
        actions.contextClick(elem).perform();
    }
}`,
        annotations: [
          { lineOrPattern: 'actions', explanation: 'W3C user gestures builder.' },
          { lineOrPattern: 'perform', explanation: 'Dispatches action queue to browser.' }
        ]
      },
      bestPractices: [
        'Always end action chains with .perform()',
        'Always release modifier keys with keyUp / key_up',
        'Use explicit wait before moving to elements'
      ],
      antiPatterns: [
        'Calling .build() without .perform() (actions will not execute)',
        'Forgetting to release mouse buttons after clickAndHold()',
        'Using Actions when simple element.click() is sufficient'
      ],
      interviewQnA: {
        question: 'What happens if you do not call .perform() on an Action chain?',
        answer: 'The Actions class builds an in-memory queue of user interaction events. Without calling .perform(), the queue is never transmitted across the W3C WebDriver endpoint to the browser, so the interaction never takes place.'
      }
    };
  }

  // 7. Frames, Windows & Shadow DOM Handling
  if (lessonId === 'sel-frames-windows-shadow') {
    return {
      title: '7. Frames, Windows & Shadow DOM Handling',
      category,
      tagline: 'Master Multi-Context Automation: Nested Iframes, Multiple Tabs & Shadow Roots',
      overview: 'Modern enterprise applications embed third-party payment forms inside iframes (like Stripe), open OAuth logins in popup tabs, and encapsulate web components in Shadow DOM. WebDriver requires explicitly switching context to interact with these elements.',
      whyItMattersForManualQA: 'A manual tester clicks an iframe form or a new browser tab without noticing the context boundary. In automated tests, finding an element inside an un-switched iframe throws NoSuchElementException every time.',
      architectureUnderTheHood: {
        title: 'Browser Context Boundary Management',
        flowOrMechanism: 'Main Document Context => driver.switchTo().frame() => Iframe Document Context => driver.switchTo().defaultContent() => Return to Root',
        keyTakeaway: 'Always return to defaultContent() after completing iframe actions to avoid getting stuck in a child context.',
      },
      stepByStepGuide: isPython ? [
        {
          stepNumber: 1,
          title: 'Switching into Iframes & Returning (Python)',
          badge: 'Iframe Switch',
          summary: 'Switch WebDriver focus into an iframe and return to default content.',
          explanation: 'Call driver.switch_to.frame() and always return using driver.switch_to.default_content().',
          codeSnippet: {
            language: 'python',
            caption: 'Python Iframe Context Switch',
            code: `from selenium.webdriver.common.by import By

# Switch into payment iframe
driver.switch_to.frame("stripe-payment-frame")
card_input = driver.find_element(By.ID, "card-number")
card_input.send_keys("4242424242424242")

# Always return to main document!
driver.switch_to.default_content()`
          },
          proTip: 'Use a try...finally block to guarantee switch_to.default_content() executes even on test failure.'
        },
        {
          stepNumber: 2,
          title: 'Switching Between Browser Windows / Tabs (Python)',
          badge: 'Window Handles',
          summary: 'Identify parent window and switch focus to a newly opened tab.',
          explanation: 'Iterate over driver.window_handles and switch to the handle different from current.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Window Handles',
            code: `parent_window = driver.current_window_handle

# Click link that opens new tab
driver.find_element(By.ID, "open-privacy-policy").click()

for handle in driver.window_handles:
    if handle != parent_window:
        driver.switch_to.window(handle)
        break

assert "Privacy Policy" in driver.title
driver.close() # Close child tab
driver.switch_to.window(parent_window) # Return to parent`
          },
          proTip: 'Always switch back to parent_window after closing the child tab.'
        },
        {
          stepNumber: 3,
          title: 'Querying Native Shadow DOM (Selenium 4 in Python)',
          badge: 'Shadow Root',
          summary: 'Extract the shadow_root attribute from web component host elements.',
          explanation: 'Selenium 4 provides native .shadow_root access without raw JavaScript execution.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Shadow DOM Query',
            code: `from selenium.webdriver.common.by import By

# 1. Locate shadow host element
shadow_host = driver.find_element(By.CSS_SELECTOR, "custom-clock")

# 2. Access shadow root (Selenium 4)
shadow_root = shadow_host.shadow_root

# 3. Locate element inside shadow DOM
time_display = shadow_root.find_element(By.CSS_SELECTOR, ".time-display")
print("Shadow time:", time_display.text)`
          },
          proTip: 'Inside a shadow root, you can only use CSS Selectors; XPath is not supported inside shadow DOM.'
        }
      ] : [
        {
          stepNumber: 1,
          title: 'Switching into Iframes & Returning (Java)',
          badge: 'Iframe Switch',
          summary: 'Switch WebDriver focus into an iframe and return to default content.',
          explanation: 'Call driver.switchTo().frame() and always return using driver.switchTo().defaultContent().',
          codeSnippet: {
            language: 'java',
            caption: 'Java Iframe Context Switch',
            code: `package com.intelligentqa.context;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

// Switch into payment iframe
driver.switchTo().frame("stripe-payment-frame");
WebElement cardInput = driver.findElement(By.id("card-number"));
cardInput.sendKeys("4242424242424242");

// Always return to main document!
driver.switchTo().defaultContent();`
          },
          proTip: 'Use a try...finally block to guarantee switchTo().defaultContent() executes even on test failure.'
        },
        {
          stepNumber: 2,
          title: 'Switching Between Browser Windows / Tabs (Java)',
          badge: 'Window Handles',
          summary: 'Identify parent window and switch focus to a newly opened tab.',
          explanation: 'Iterate over driver.getWindowHandles() and switch to the handle different from current.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Window Handles',
            code: `String parentWindow = driver.getWindowHandle();

// Click link that opens new tab
driver.findElement(By.id("open-privacy-policy")).click();

for (String handle : driver.getWindowHandles()) {
    if (!handle.equals(parentWindow)) {
        driver.switchTo().window(handle);
        break;
    }
}

Assert.assertTrue(driver.getTitle().contains("Privacy Policy"));
driver.close(); // Close child tab
driver.switchTo().window(parentWindow); // Return to parent`
          },
          proTip: 'Always switch back to parentWindow after closing the child tab.'
        },
        {
          stepNumber: 3,
          title: 'Querying Native Shadow DOM (Selenium 4 in Java)',
          badge: 'Shadow Root',
          summary: 'Extract the getShadowRoot() search context from host elements.',
          explanation: 'Selenium 4 provides native getShadowRoot() without raw JavaScript execution.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Shadow DOM Query',
            code: `import org.openqa.selenium.By;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;

// 1. Locate shadow host element
WebElement shadowHost = driver.findElement(By.cssSelector("custom-clock"));

// 2. Access shadow root (Selenium 4)
SearchContext shadowRoot = shadowHost.getShadowRoot();

// 3. Locate element inside shadow DOM
WebElement timeDisplay = shadowRoot.findElement(By.cssSelector(".time-display"));
System.out.println("Shadow time: " + timeDisplay.getText());`
          },
          proTip: 'Inside a shadow root, you can only use CSS Selectors; XPath is not supported inside shadow DOM.'
        }
      ],
      manualToAutomatedBridge: [
        {
          manualAction: 'Tester fills credit card form inside embedded payment frame',
          automatedApproach: 'driver.switchTo().frame("payment") -> type -> switchTo().defaultContent()',
          whyItMatters: 'Switches the WebDriver target execution document to the isolated sandbox frame.',
        }
      ],
      productionCodeExample: {
        title: isPython ? 'Production Implementation (Python Selenium): Multi-Context' : 'Production Implementation (Java Selenium): Multi-Context Manager',
        description: isPython ? 'Python context manager for nested frames and multi-tab automation.' : 'Java utility class for nested frames and multi-tab automation.',
        language: isPython ? 'python' : 'java',
        code: isPython ? `# ==========================================
# Python Selenium Production Multi-Context Manager
# ==========================================
from contextlib import contextmanager

class ContextManager:
    def __init__(self, driver):
        self.driver = driver

    @contextmanager
    def frame_context(self, frame_locator):
        self.driver.switch_to.frame(frame_locator)
        try:
            yield
        finally:
            self.driver.switch_to.default_content()

# Usage with Python 'with' statement:
# with context.frame_context("payment-frame"):
#     driver.find_element(By.ID, "card").send_keys("4242")` : `// ==========================================
// Java Selenium Production Multi-Context Manager
// ==========================================
package com.intelligentqa.context;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class ContextManager {
    private final WebDriver driver;

    public ContextManager(WebDriver driver) {
        this.driver = driver;
    }

    public void executeInFrame(String frameId, Runnable action) {
        driver.switchTo().frame(frameId);
        try {
            action.run();
        } finally {
            driver.switchTo().defaultContent();
        }
    }
}`,
        annotations: [
          { lineOrPattern: 'defaultContent', explanation: 'Guaranteed return to top-level document.' },
          { lineOrPattern: 'frame', explanation: 'Target iframe context switch.' }
        ]
      },
      bestPractices: [
        'Always wrap frame operations in try...finally to ensure defaultContent() is called',
        'Close child windows and return to parentWindow before proceeding with test flow',
        'Use CSS Selectors for Shadow DOM querying (XPath is unsupported in shadow roots)'
      ],
      antiPatterns: [
        'Forgetting defaultContent() and wondering why subsequent elements are not found',
        'Hardcoding window handle indexes like window_handles[1] without checking titles',
        'Using raw JavaScript document.querySelector() when Selenium 4 getShadowRoot() exists'
      ],
      interviewQnA: {
        question: 'How do you automate an element inside an open Shadow DOM in Selenium 4?',
        answer: 'In Selenium 4, first locate the host web element using standard findElement(By.cssSelector("host-tag")). Then call host.getShadowRoot() (or host.shadow_root in Python) to obtain a SearchContext instance. From that shadow root, find child elements using CSS Selectors.'
      }
    };
  }

  // 8. Page Object Model & PageFactory Architecture
  if (lessonId === 'sel-pom-pagefactory') {
    return {
      title: '8. Page Object Model & PageFactory Architecture',
      category,
      tagline: 'Enterprise Architecture: BasePage, Modern POM & Fluent Method Chaining',
      overview: 'Page Object Model (POM) is the premier design pattern in test automation. It separates page-specific UI locators and actions from test assertions. When a UI changes, only the Page class is updated, leaving all test classes untouched.',
      whyItMattersForManualQA: 'In manual testing, if a button label changes, you rewrite instructions across all test runs. With Page Object Model, you update a single locator variable in the Page Class, and hundreds of automated tests immediately pass.',
      architectureUnderTheHood: {
        title: 'POM Architectural Separation of Concerns',
        flowOrMechanism: 'Test Class (Assertions Only) => Page Object (User Actions & Private Locators) => BasePage (Shared Wait Helpers) => WebDriver Binary',
        keyTakeaway: 'Page objects should NEVER contain assertions! Page objects model the UI; test classes assert business rules.',
      },
      stepByStepGuide: isPython ? [
        {
          stepNumber: 1,
          title: 'BasePage Encapsulation with Explicit Wait Wrappers (Python)',
          badge: 'BasePage',
          summary: 'Create an abstract BasePage containing driver reference and wait helpers.',
          explanation: 'BasePage provides click(), type(), and is_visible() methods wrapping WebDriverWait.',
          codeSnippet: {
            language: 'python',
            caption: 'Python BasePage Class',
            code: `from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def click(self, locator):
        self.wait.until(EC.element_to_be_clickable(locator)).click()

    def type_text(self, locator, text):
        elem = self.wait.until(EC.visibility_of_element_located(locator))
        elem.clear()
        elem.send_keys(text)`
          },
          proTip: 'Centralizing waits in BasePage ensures individual page classes never duplicate wait boilerplate.'
        },
        {
          stepNumber: 2,
          title: 'Encapsulated Page Class with Fluent Return (Python)',
          badge: 'POM Class',
          summary: 'Inherit BasePage, declare private locators, and return target page objects.',
          explanation: 'Returning DashboardPage(self.driver) enables fluent method chaining in test scripts.',
          codeSnippet: {
            language: 'python',
            caption: 'Python LoginPage with Fluent Return',
            code: `from selenium.webdriver.common.by import By

class LoginPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self._username = (By.ID, "username")
        self._password = (By.ID, "password")
        self._submit = (By.CSS_SELECTOR, "button[type='submit']")

    def login_as(self, username: str, password: str):
        self.type_text(self._username, username)
        self.type_text(self._password, password)
        self.click(self._submit)
        return DashboardPage(self.driver)`
          },
          proTip: 'Fluent return types guide automators with auto-complete in their IDE for the next logical page.'
        },
        {
          stepNumber: 3,
          title: 'Clean, Assertion-Driven Test Function (Python)',
          badge: 'Test Class',
          summary: 'Write readable test cases that contain only business actions and assertions.',
          explanation: 'Test functions remain short, expressive, and completely free of By locators.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Pytest Test Class',
            code: `def test_valid_login_flow(driver):
    driver.get("http://localhost:3000/sandbox/web")
    login_page = LoginPage(driver)
    dashboard = login_page.login_as("standard_user", "secret_pass")

    # Assertion lives strictly in the test function
    assert dashboard.is_loaded(), "Dashboard failed to display after login"`
          },
          proTip: 'If a test fails, the assertion message tells you exactly what business requirement failed.'
        }
      ] : [
        {
          stepNumber: 1,
          title: 'BasePage Encapsulation with Explicit Wait Wrappers (Java)',
          badge: 'BasePage',
          summary: 'Create an abstract BasePage containing driver reference and wait helpers.',
          explanation: 'BasePage provides click(), type(), and isVisible() methods wrapping WebDriverWait.',
          codeSnippet: {
            language: 'java',
            caption: 'Java BasePage Class',
            code: `package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public abstract class BasePage {
    protected WebDriver driver;
    protected WebDriverWait wait;

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    protected void click(By locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
    }

    protected void type(By locator, String text) {
        WebElement elem = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
        elem.clear();
        elem.sendKeys(text);
    }
}`
          },
          proTip: 'Centralizing waits in BasePage ensures individual page classes never duplicate wait boilerplate.'
        },
        {
          stepNumber: 2,
          title: 'Encapsulated Page Class with Fluent Return (Java)',
          badge: 'POM Class',
          summary: 'Inherit BasePage, declare private locators, and return target page objects.',
          explanation: 'Returning new DashboardPage(driver) enables fluent method chaining in test scripts.',
          codeSnippet: {
            language: 'java',
            caption: 'Java LoginPage with Fluent Return',
            code: `package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {
    private final By usernameField = By.id("username");
    private final By passwordField = By.id("password");
    private final By submitBtn = By.cssSelector("button[type='submit']");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public DashboardPage loginAs(String username, String password) {
        type(usernameField, username);
        type(passwordField, password);
        click(submitBtn);
        return new DashboardPage(driver);
    }
}`
          },
          proTip: 'Fluent return types guide automators with auto-complete in their IDE for the next logical page.'
        },
        {
          stepNumber: 3,
          title: 'Clean, Assertion-Driven Test Method (Java)',
          badge: 'Test Class',
          summary: 'Write readable test cases that contain only business actions and assertions.',
          explanation: 'Test methods remain short, expressive, and completely free of By locators.',
          codeSnippet: {
            language: 'java',
            caption: 'Java TestNG Test Class',
            code: `package com.intelligentqa.tests;

import com.intelligentqa.base.BaseTest;
import com.intelligentqa.pages.LoginPage;
import com.intelligentqa.pages.DashboardPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    @Test
    public void testValidLoginFlow() {
        driver.get("http://localhost:3000/sandbox/web");
        LoginPage loginPage = new LoginPage(driver);
        DashboardPage dashboard = loginPage.loginAs("standard_user", "secret_pass");

        // Assertion lives strictly in the test method
        Assert.assertTrue(dashboard.isLoaded(), "Dashboard failed to display after login");
    }
}`
          },
          proTip: 'If a test fails, the assertion message tells you exactly what business requirement failed.'
        }
      ],
      manualToAutomatedBridge: [
        {
          manualAction: 'Manual tester logs in on Login page, then navigates to Dashboard',
          automatedApproach: 'loginPage.loginAs(user, pass) returns new DashboardPage(driver)',
          whyItMatters: 'Mimics real human workflow and guides subsequent test actions via compile-time types.',
        }
      ],
      productionCodeExample: {
        title: isPython ? 'Production Implementation (Python Selenium): POM Framework' : 'Production Implementation (Java Selenium): POM Architecture',
        description: isPython ? 'Complete Python Page Object Model with encapsulated locators and fluent actions.' : 'Complete Java Page Object Model with encapsulated locators and fluent actions.',
        language: isPython ? 'python' : 'java',
        code: isPython ? `# ==========================================
# Python Selenium Production Page Object Model
# ==========================================
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

class LoginPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self._user_input = (By.ID, "username")
        self._pass_input = (By.ID, "password")
        self._submit = (By.CSS_SELECTOR, "button[type='submit']")

    def login_as(self, user, pwd):
        self.wait.until(EC.visibility_of_element_located(self._user_input)).send_keys(user)
        self.driver.find_element(*self._pass_input).send_keys(pwd)
        self.wait.until(EC.element_to_be_clickable(self._submit)).click()
        return DashboardPage(self.driver)

class DashboardPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self._welcome_banner = (By.ID, "welcome-msg")

    def is_loaded(self):
        elem = self.wait.until(EC.visibility_of_element_located(self._welcome_banner))
        return elem.is_displayed()` : `// ==========================================
// Java Selenium Production Page Object Model
// ==========================================
package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class LoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By userInput = By.id("username");
    private final By passInput = By.id("password");
    private final By submitBtn = By.cssSelector("button[type='submit']");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public DashboardPage loginAs(String user, String pwd) {
        WebElement u = wait.until(ExpectedConditions.visibilityOfElementLocated(userInput));
        u.clear();
        u.sendKeys(user);
        driver.findElement(passInput).sendKeys(pwd);
        wait.until(ExpectedConditions.elementToBeClickable(submitBtn)).click();
        return new DashboardPage(driver);
    }
}`,
        annotations: [
          { lineOrPattern: 'loginAs', explanation: 'Fluent navigation method.' },
          { lineOrPattern: 'By.id', explanation: 'Encapsulated private locator.' }
        ]
      },
      bestPractices: [
        'Never write assertions inside Page Object classes; keep assertions in Test classes',
        'Declare element locators private final inside Page classes',
        'Return new Page instances on navigation actions to enable fluent method chaining'
      ],
      antiPatterns: [
        'Adding Assert.assertTrue() inside Page Object methods',
        'Using public static By locators across unrelated test files',
        'Writing giant 2,000-line monolithic page objects instead of modular components'
      ],
      interviewQnA: {
        question: 'Why should Page Object classes never contain Assert statements?',
        answer: 'Page Objects are architectural models of how the web application looks and behaves. Assertions represent test verification criteria. If assertions are placed inside Page Objects, the Page Object cannot be reused across different test scenarios (such as verifying negative validation errors versus happy-path logins).'
      }
    };
  }

  // 9. TestNG Suite & Parallel Multi-Threading / Pytest-xdist
  if (lessonId === 'sel-testng-parallel') {
    return {
      title: '9. TestNG Suite & Parallel Multi-Threading',
      category,
      tagline: 'Thread-Safe Multi-Threading: ThreadLocal WebDriver & Parallel Test Execution',
      overview: 'Running tests sequentially takes hours. Scaling to parallel execution requires thread isolation. If two parallel threads access a shared static WebDriver reference, one thread will navigate while the other clicks, causing instant test crashes.',
      whyItMattersForManualQA: 'A manual QA team distributes tests among 5 engineers to finish testing 5x faster. In automated frameworks, thread-safe parallel execution is how a 3-hour regression run completes in under 15 minutes.',
      architectureUnderTheHood: {
        title: 'ThreadLocal Memory Isolation Mechanism',
        flowOrMechanism: 'Thread 1 => ThreadLocal.set(DriverA) | Thread 2 => ThreadLocal.set(DriverB) => Memory Isolation => Zero Race Conditions',
        keyTakeaway: 'ThreadLocal allocates a separate memory slot for each executing thread, guaranteeing zero race conditions.',
      },
      stepByStepGuide: isPython ? [
        {
          stepNumber: 1,
          title: 'Function-Scoped Thread-Safe Pytest Fixture (Python)',
          badge: 'Thread Isolation',
          summary: 'Provide isolated browser instances for each test execution.',
          explanation: 'Function scope guarantees pytest allocates a brand new browser process per test.',
          codeSnippet: {
            language: 'python',
            caption: 'Python Function-Scoped Fixture',
            code: `import pytest
from selenium import webdriver

@pytest.fixture(scope="function")
def driver():
    # Each thread/worker gets its own isolated browser session
    driver_instance = webdriver.Chrome()
    driver_instance.maximize_window()
    yield driver_instance
    driver_instance.quit() # Always teardown`
          },
          proTip: 'Function-scoped fixtures ensure test independence and prevent state leakage.'
        },
        {
          stepNumber: 2,
          title: 'Parallel Test Execution with pytest-xdist (Python)',
          badge: 'xdist Execution',
          summary: 'Run automated tests concurrently across multiple CPU cores.',
          explanation: 'Use pytest -n auto or pytest -n 4 to distribute tests across worker processes.',
          codeSnippet: {
            language: 'python',
            caption: 'Python pytest-xdist CLI',
            code: `# Run tests concurrently across 4 CPU processes
# pip install pytest-xdist
pytest -n 4 --dist=loadfile tests/`
          },
          proTip: '--dist=loadfile groups tests in the same file to the same worker to optimize setup.'
        },
        {
          stepNumber: 3,
          title: 'Parameterized Data-Driven Execution (Python)',
          badge: 'Data Matrix',
          summary: 'Execute the same test scenario against multiple input data sets in parallel.',
          explanation: 'Use @pytest.mark.parametrize to create dynamic parallel test iterations.',
          codeSnippet: {
            language: 'python',
            caption: 'Python @pytest.mark.parametrize',
            code: `import pytest

@pytest.mark.parametrize("username,password,expected_error", [
    ("invalid_user", "pass123", "User not found"),
    ("locked_user", "pass123", "Account locked"),
    ("empty_user", "", "Password required")
])
def test_login_validation_matrix(driver, username, password, expected_error):
    driver.get("http://localhost:3000/sandbox/web")
    # Matrix runs concurrently across workers
    assert True`
          },
          proTip: 'Parameterized tests appear as distinct test cases in Allure and HTML reports.'
        }
      ] : [
        {
          stepNumber: 1,
          title: 'ThreadLocal WebDriver Storage (Java)',
          badge: 'Thread Isolation',
          summary: 'Provide thread-safe storage so each concurrent thread owns its driver.',
          explanation: 'ThreadLocal<WebDriver> prevents thread collision during parallel execution.',
          codeSnippet: {
            language: 'java',
            caption: 'Java ThreadLocal DriverManager',
            code: `package com.intelligentqa.driver;

import org.openqa.selenium.WebDriver;

public class DriverManager {
    private static final ThreadLocal<WebDriver> tlDriver = new ThreadLocal<>();

    public static void setDriver(WebDriver driver) {
        tlDriver.set(driver);
    }

    public static WebDriver getDriver() {
        return tlDriver.get();
    }

    public static void unload() {
        tlDriver.remove(); // Prevent memory leaks
    }
}`
          },
          proTip: 'Always call tlDriver.remove() in tearDown to prevent ThreadLocal memory leaks.'
        },
        {
          stepNumber: 2,
          title: 'Parallel TestNG Suite XML Configuration (Java)',
          badge: 'TestNG XML',
          summary: 'Configure testng.xml to run test methods across multiple threads.',
          explanation: 'Set parallel="methods" and thread-count="4" for multi-threaded execution.',
          codeSnippet: {
            language: 'java',
            caption: 'Java TestNG Suite XML',
            code: `<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="Enterprise Parallel Suite" parallel="methods" thread-count="4">
    <test name="Parallel Regression Tests">
        <packages>
            <package name="com.intelligentqa.tests.*"/>
        </packages>
    </test>
</suite>`
          },
          proTip: 'thread-count="4" is optimal for 8-core developer laptops.'
        },
        {
          stepNumber: 3,
          title: 'Parallel DataProvider Configuration (Java)',
          badge: 'DataProvider',
          summary: 'Run data-driven test rows concurrently across available threads.',
          explanation: 'Set @DataProvider(parallel = true) for multi-threaded test execution.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Parallel DataProvider',
            code: `import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

@DataProvider(name = "loginData", parallel = true)
public Object[][] provideLoginCredentials() {
    return new Object[][] {
        {"user1", "pass1"},
        {"user2", "pass2"},
        {"user3", "pass3"}
    };
}`
          },
          proTip: 'Ensure tests using parallel DataProviders do not share static mutable variables.'
        }
      ],
      manualToAutomatedBridge: [
        {
          manualAction: 'Manual QA team of 4 divides 100 test cases and runs them simultaneously',
          automatedApproach: 'TestNG parallel="methods" thread-count="4" or pytest -n 4',
          whyItMatters: 'Reduces regression test suite execution time by 75% without extra manual effort.',
        }
      ],
      productionCodeExample: {
        title: isPython ? 'Production Implementation (Python Selenium): Parallel Testing' : 'Production Implementation (Java Selenium): ThreadLocal Manager',
        description: isPython ? 'Complete conftest.py configured for isolated multi-process pytest-xdist.' : 'Complete thread-safe DriverManager class with TestNG BaseTest.',
        language: isPython ? 'python' : 'java',
        code: isPython ? `# ==========================================
# Python Selenium Production Parallel Suite
# ==========================================
import pytest
from selenium import webdriver

@pytest.fixture(scope="function")
def driver():
    # Each pytest-xdist worker process owns this isolated browser
    driver_instance = webdriver.Chrome()
    driver_instance.maximize_window()
    yield driver_instance
    driver_instance.quit()

# Run from terminal:
# pytest -n 4 --dist=loadfile tests/` : `// ==========================================
// Java Selenium Production ThreadLocal DriverManager
// ==========================================
package com.intelligentqa.base;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.AfterMethod;

public abstract class BaseTest {
    private static final ThreadLocal<WebDriver> driverThread = new ThreadLocal<>();

    public static WebDriver getDriver() {
        return driverThread.get();
    }

    @BeforeMethod
    public void setUp() {
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        driverThread.set(driver);
    }

    @AfterMethod
    public void tearDown() {
        if (getDriver() != null) {
            getDriver().quit();
            driverThread.remove(); // Prevent memory leak
        }
    }
}`,
        annotations: [
          { lineOrPattern: 'ThreadLocal', explanation: 'Per-thread memory isolation.' },
          { lineOrPattern: 'remove', explanation: 'Prevents thread pool memory leak.' }
        ]
      },
      bestPractices: [
        'Use ThreadLocal<WebDriver> for Java frameworks and function-scoped fixtures for Python',
        'Always clean up drivers in @AfterMethod or yield teardowns to avoid zombie browser processes',
        'Never write or read shared mutable static class variables during parallel runs'
      ],
      antiPatterns: [
        'Using a public static WebDriver driver without ThreadLocal in parallel suites',
        'Sharing test data IDs across concurrent threads (causes race conditions)',
        'Hardcoding fixed ports for mock servers used by parallel threads'
      ],
      interviewQnA: {
        question: 'What is a ThreadLocal variable and why is it essential for parallel Selenium execution?',
        answer: 'A ThreadLocal variable in Java provides thread-local variables. Each thread that accesses the variable gets its own independently initialized copy. In Selenium, wrapping WebDriver in ThreadLocal ensures that thread 1 executing Test A does not collide with thread 2 executing Test B, avoiding race conditions and browser session collisions.'
      }
    };
  }

  // 10. Listeners, Screenshots & Maven CI/CD Execution
  if (lessonId === 'sel-listeners-reports-cicd') {
    return {
      title: '10. Listeners, Screenshots & Maven CI/CD Execution',
      category,
      tagline: 'CI/CD Automation: Test Listeners, Automatic Failure Screenshots & Allure Reporting',
      overview: 'Automated tests that run unattended inside CI/CD pipelines (such as GitHub Actions or Jenkins) must provide automated diagnostics. Test listeners monitor test lifecycle events (pass, fail, skip) and automatically capture screenshots and browser logs on failure.',
      whyItMattersForManualQA: 'When a manual test fails, the tester captures a screenshot and files a ticket. Test listeners automate this completely by saving timestamped screenshots at the exact second a failure occurs.',
      architectureUnderTheHood: {
        title: 'Test Lifecycle Listener Interception Mechanism',
        flowOrMechanism: 'Test Execution => Test Failure Event => onTestFailure Hook Triggered => TakesScreenshot Captures Viewport => PNG Saved & Attached to Allure Report',
        keyTakeaway: 'Listeners decouple screenshot taking from test logic: test cases remain 100% clean of screenshot code.',
      },
      stepByStepGuide: isPython ? [
        {
          stepNumber: 1,
          title: 'Pytest Hook for Failure Interception (Python)',
          badge: 'Pytest Hook',
          summary: 'Intercept test failure outcomes using pytest_runtest_makereport in conftest.py.',
          explanation: 'The makereport hook yields the test outcome, allowing automated screenshot execution.',
          codeSnippet: {
            language: 'python',
            caption: 'Python conftest.py Failure Hook',
            code: `import pytest

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()

    # Trigger screenshot only when test execution call fails
    if report.when == "call" and report.failed:
        driver = item.funcargs.get("driver")
        if driver:
            screenshot_path = f"./screenshots/{item.name}.png"
            driver.save_screenshot(screenshot_path)
            print(f"Captured failure screenshot: {screenshot_path}")`
          },
          proTip: 'Item.name provides the exact test function name for readable screenshot filenames.'
        },
        {
          stepNumber: 2,
          title: 'HTML Test Report Generation (Python)',
          badge: 'HTML Report',
          summary: 'Generate standalone HTML reports with pytest-html.',
          explanation: 'Run tests with --html to output a self-contained test execution report.',
          codeSnippet: {
            language: 'python',
            caption: 'Python HTML Report Command',
            code: `# Run pytest with standalone HTML reporting
pytest --html=target/report.html --self-contained-html -v`
          },
          proTip: '--self-contained-html embeds CSS and images directly for easy email sharing.'
        },
        {
          stepNumber: 3,
          title: 'GitHub Actions CI/CD Pipeline Workflow (Python)',
          badge: 'CI Workflow',
          summary: 'Configure GitHub Actions YAML workflow to run tests on push.',
          explanation: 'Automate dependency installation, headless browser execution, and artifact upload.',
          codeSnippet: {
            language: 'python',
            caption: 'Python GitHub Actions Workflow',
            code: `name: Selenium Python CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pytest -n 4 --headless --html=report.html
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-report
          path: report.html`
          },
          proTip: 'Use if: always() on artifact upload so test reports are saved even if tests fail.'
        }
      ] : [
        {
          stepNumber: 1,
          title: 'Implementing TestNG ITestListener (Java)',
          badge: 'Test Listener',
          summary: 'Intercept test failure outcomes using ITestListener.',
          explanation: 'Implement onTestFailure to trigger automatic screenshot capture.',
          codeSnippet: {
            language: 'java',
            caption: 'Java TestListener Implementation',
            code: `package com.intelligentqa.listeners;

import org.testng.ITestListener;
import org.testng.ITestResult;

public class TestListener implements ITestListener {
    @Override
    public void onTestFailure(ITestResult result) {
        String testName = result.getMethod().getMethodName();
        ScreenshotUtils.captureScreenshot(testName);
        System.out.println("Captured failure screenshot for: " + testName);
    }
}`
          },
          proTip: 'Register the listener in testng.xml via <listeners><listener class-name="..."/></listeners>.'
        },
        {
          stepNumber: 2,
          title: 'Capturing Viewport Screenshots (Java)',
          badge: 'TakesScreenshot',
          summary: 'Cast WebDriver to TakesScreenshot and save file to target folder.',
          explanation: 'getScreenshotAs(OutputType.FILE) captures the active browser viewport.',
          codeSnippet: {
            language: 'java',
            caption: 'Java TakesScreenshot Utility',
            code: `import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class ScreenshotUtils {
    public static void captureScreenshot(WebDriver driver, String name) {
        TakesScreenshot ts = (TakesScreenshot) driver;
        File src = ts.getScreenshotAs(OutputType.FILE);
        try {
            Files.copy(src.toPath(), Paths.get("./target/screenshots/" + name + ".png"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}`
          },
          proTip: 'Attach timestamps to filenames (System.currentTimeMillis()) to prevent overwriting.'
        },
        {
          stepNumber: 3,
          title: 'Maven Surefire CI Execution in pom.xml (Java)',
          badge: 'Maven CI',
          summary: 'Configure Maven Surefire plugin to execute TestNG suites.',
          explanation: 'Run mvn clean test to trigger automated regression suites in CI/CD.',
          codeSnippet: {
            language: 'java',
            caption: 'Java Maven Surefire Plugin',
            code: `<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.1.2</version>
    <configuration>
        <suiteXmlFiles>
            <suiteXmlFile>testng.xml</suiteXmlFile>
        </suiteXmlFiles>
    </configuration>
</plugin>`
          },
          proTip: 'Pass system properties from command line: mvn clean test -Dbrowser=chrome -Dheadless=true.'
        }
      ],
      manualToAutomatedBridge: [
        {
          manualAction: 'Manual QA takes screenshot using Snipping Tool and pastes into Jira ticket',
          automatedApproach: 'ITestListener onTestFailure automatically attaches screenshot to Allure/HTML report',
          whyItMatters: 'Captures the exact DOM rendering at the millisecond of failure without human intervention.',
        }
      ],
      productionCodeExample: {
        title: isPython ? 'Production Implementation (Python Selenium): Reporting & CI' : 'Production Implementation (Java Selenium): TestNG Listener & Reporting',
        description: isPython ? 'Complete conftest.py with failure screenshots and HTML report hooks.' : 'Complete TestNG TestListener class with screenshot capture.',
        language: isPython ? 'python' : 'java',
        code: isPython ? `# ==========================================
# Python Selenium Production Failure Listener
# ==========================================
import pytest

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()

    if report.when == "call" and report.failed:
        driver = item.funcargs.get("driver")
        if driver:
            driver.save_screenshot(f"./target/screenshots/{item.name}.png")` : `// ==========================================
// Java Selenium Production TestNG Listener
// ==========================================
package com.intelligentqa.listeners;

import com.intelligentqa.base.BaseTest;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.testng.ITestListener;
import org.testng.ITestResult;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class ProductionTestListener implements ITestListener {
    @Override
    public void onTestFailure(ITestResult result) {
        TakesScreenshot ts = (TakesScreenshot) BaseTest.getDriver();
        if (ts != null) {
            File src = ts.getScreenshotAs(OutputType.FILE);
            try {
                Files.copy(src.toPath(), Paths.get("./target/screenshots/" + result.getName() + ".png"));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}`,
        annotations: [
          { lineOrPattern: 'onTestFailure', explanation: 'Lifecycle hook called only on test failure.' },
          { lineOrPattern: 'TakesScreenshot', explanation: 'Viewport screenshot capture.' }
        ]
      },
      bestPractices: [
        'Always configure automated screenshot capture inside listeners rather than inside test bodies',
        'Archive test reports and screenshot artifacts in your CI/CD pipeline configuration',
        'Use if: always() in GitHub Actions to preserve reports even when test steps fail'
      ],
      antiPatterns: [
        'Writing try/catch in every single test method just to call captureScreenshot()',
        'Saving screenshots to git-tracked directories without .gitignore',
        'Failing the build immediately without archiving the HTML test execution report'
      ],
      interviewQnA: {
        question: 'How do you automatically attach screenshots on failure in a CI/CD pipeline?',
        answer: 'We implement TestNG ITestListener (or pytest_runtest_makereport in Python). When a test throws an assertion error, the onTestFailure hook intercepts the event, grabs the active WebDriver instance from ThreadLocal, captures the screenshot using TakesScreenshot, and links the image artifact to the Allure or HTML test report.'
      }
    };
  }

  // Fallback for any unknown Selenium lesson
  return {
    title: cleanTitle,
    category,
    tagline: `Selenium Architecture & Implementation: ${cleanTitle}`,
    overview: `${lessonDesc || cleanTitle}. Master core test automation patterns with Selenium WebDriver.`,
    whyItMattersForManualQA: 'Transitioning from manual verification to automated test engineering requires reliable state modeling and explicit synchronization.',
    architectureUnderTheHood: {
      title: 'W3C WebDriver Execution Protocol',
      flowOrMechanism: 'Test Runner => W3C Protocol HTTP/BiDi => Browser Driver Binary => OS Native Event => DOM Evaluation',
      keyTakeaway: 'Always write tests against resilient semantic locators and leverage dynamic explicit waits.',
    },
    stepByStepGuide: isPython ? [
      {
        stepNumber: 1,
        title: `Initialize & Context Setup (Python)`,
        summary: `Prepare environment for ${cleanTitle}.`,
        explanation: 'Configure WebDriver session with clean options and maximized window.',
        codeSnippet: {
          language: 'python',
          caption: 'Python WebDriver Setup',
          code: `from selenium import webdriver\n\ndriver = webdriver.Chrome()\ndriver.maximize_window()\ndriver.get("http://localhost:3000/sandbox/web")`
        }
      },
      {
        stepNumber: 2,
        title: `Execute Core Mechanism (Python)`,
        summary: `Perform action for ${cleanTitle}.`,
        explanation: 'Use explicit wait before interaction to prevent timing issues.',
        codeSnippet: {
          language: 'python',
          caption: 'Python Action & Explicit Wait',
          code: `from selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\n\nwait = WebDriverWait(driver, 10)\nbtn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button.action-btn")))\nbtn.click()`
        }
      },
      {
        stepNumber: 3,
        title: `Verify Outcome & Assertions (Python)`,
        summary: `Assert target state for ${cleanTitle}.`,
        explanation: 'Assert that the DOM displays expected results.',
        codeSnippet: {
          language: 'python',
          caption: 'Python State Assertion',
          code: `result = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "success-msg")))\nassert result.is_displayed()`
        }
      }
    ] : [
      {
        stepNumber: 1,
        title: `Initialize & Context Setup (Java)`,
        summary: `Prepare environment for ${cleanTitle}.`,
        explanation: 'Configure WebDriver session with clean options and maximized window.',
        codeSnippet: {
          language: 'java',
          caption: 'Java WebDriver Setup',
          code: `WebDriver driver = new ChromeDriver();\ndriver.manage().window().maximize();\ndriver.get("http://localhost:3000/sandbox/web");`
        }
      },
      {
        stepNumber: 2,
        title: `Execute Core Mechanism (Java)`,
        summary: `Perform action for ${cleanTitle}.`,
        explanation: 'Use explicit wait before interaction to prevent timing issues.',
        codeSnippet: {
          language: 'java',
          caption: 'Java Action & Explicit Wait',
          code: `WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));\nWebElement btn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button.action-btn")));\nbtn.click();`
        }
      },
      {
        stepNumber: 3,
        title: `Verify Outcome & Assertions (Java)`,
        summary: `Assert target state for ${cleanTitle}.`,
        explanation: 'Assert that the DOM displays expected results.',
        codeSnippet: {
          language: 'java',
          caption: 'Java State Assertion',
          code: `WebElement result = wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("success-msg")));\nAssert.assertTrue(result.isDisplayed());`
        }
      }
    ],
    manualToAutomatedBridge: [
      {
        manualAction: `Perform ${cleanTitle} manually on web UI`,
        automatedApproach: 'Selenium script with explicit state assertions',
        whyItMatters: 'Runs predictably in CI/CD without manual human intervention.',
      }
    ],
    productionCodeExample: {
      title: isPython ? `Production Implementation (Python Selenium): ${cleanTitle}` : `Production Implementation (Java Selenium): ${cleanTitle}`,
      description: `Complete, production-ready blueprint illustrating best practices for ${cleanTitle}.`,
      language: isPython ? 'python' : 'java',
      code: isPython ? `# ==========================================
# SELENIUM WEBDRIVER (PYTHON): ${cleanTitle}
# ==========================================
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_${lessonId.replace(/[^a-zA-Z0-9]/g, '_')}_scenario():
    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:3000/sandbox/web")
        wait = WebDriverWait(driver, 10)
        btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button.action-btn")))
        btn.click()
        result = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "success-msg")))
        assert result.is_displayed()
    finally:
        driver.quit()` : `// ==========================================
// SELENIUM WEBDRIVER (JAVA): ${cleanTitle}
// ==========================================
package com.intelligentqa.concepts;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import java.time.Duration;

public class ${lessonId.replace(/[^a-zA-Z0-9]/g, '')}Execution {
    public static void run(WebDriver driver) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button.action-btn")));
        btn.click();
        WebElement result = wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("success-msg")));
        Assert.assertTrue(result.isDisplayed());
    }
}`,
      annotations: [
        { lineOrPattern: 'test', explanation: 'Test execution method boundary.' }
      ]
    },
    bestPractices: [
      'Write tests against user-facing attributes rather than internal layout classes',
      'Use WebDriverWait rather than hardcoded Thread.sleep / time.sleep',
      'Always call driver.quit() in teardown'
    ],
    antiPatterns: [
      'Mixing implicit and explicit waits',
      'Using absolute full-path XPaths',
      'Coupling tests to brittle database IDs'
    ],
    interviewQnA: {
      question: 'Why is explicit synchronization critical in modern test automation?',
      answer: 'Explicit synchronization polls the DOM at 500ms intervals until the requested condition is satisfied, advancing immediately when ready, preventing flakiness while keeping test execution as fast as possible.'
    }
  };
}

// Generic Fallback Generator that produces deep Playwright-Docs-Style content for ANY curriculum lesson
export function getLessonDoc(
  lessonId: string,
  trackId: string,
  lessonTitle?: string,
  lessonDesc?: string,
  selectedLanguage: 'java' | 'python' | 'typescript' = 'java'
): LessonDoc {
  const isSelenium = trackId === 'selenium-java';
  const isPython = selectedLanguage === 'python';

  // If Selenium track, route directly to dedicated Java & Python curriculum generator
  if (isSelenium) {
    return getSeleniumLessonDoc(lessonId, isPython, lessonTitle, lessonDesc);
  }

  if (DETAILED_LESSON_DOCS[lessonId]) {
    const doc = { ...DETAILED_LESSON_DOCS[lessonId] };

    // For Playwright track, adapt to Python Playwright when selected
    if (isPython && trackId === 'playwright-ts') {
      const pySnippet = getConceptCodeSnippet(lessonId, trackId, 'python', doc.title || lessonTitle);
      return {
        ...doc,
        title: doc.title || lessonTitle || 'Playwright Automation',
        category: 'Playwright (Python) • Core Concept',
        tagline: doc.tagline || 'Master Enterprise Playwright with Python & pytest',
        overview: doc.overview || lessonDesc || 'Detailed conceptual foundation.',
        whyItMattersForManualQA: doc.whyItMattersForManualQA || '',
        architectureUnderTheHood: doc.architectureUnderTheHood || {
          title: 'Playwright Python CDP WebSocket Mechanism',
          flowOrMechanism: 'Python sync/async API => Playwright Driver Node Server => CDP WebSocket => Browser Actions',
          keyTakeaway: 'Playwright Python uses the same browser automation engine as TypeScript, powered by pytest fixtures.',
        },
        stepByStepGuide: (doc.stepByStepGuide || []).map(step => ({
          ...step,
          codeSnippet: step.codeSnippet ? {
            ...step.codeSnippet,
            language: 'python',
            code: step.codeSnippet.code.includes('import') || step.codeSnippet.code.includes('test')
              ? `from playwright.sync_api import Page, expect\n\ndef test_step(page: Page):\n    page.goto('/sandbox/web')\n    action_btn = page.get_by_role("button").first\n    if action_btn.is_visible():\n        action_btn.click()\n    expect(page.get_by_role("heading", level=1)).to_be_visible()`
              : step.codeSnippet.code,
          } : undefined,
        })),
        manualToAutomatedBridge: doc.manualToAutomatedBridge || [],
        productionCodeExample: {
          title: `Production Implementation (Python Playwright): ${doc.title || lessonTitle}`,
          description: 'Production-ready Python Playwright pytest script.',
          language: 'python',
          code: pySnippet,
          annotations: [],
        },
        bestPractices: doc.bestPractices || [
          'Use pytest fixtures for browser page context',
          'Use resilient get_by_* locators with auto-wait',
          'Use expect(locator) for web-first assertions',
        ],
        antiPatterns: doc.antiPatterns || [
          'Using hardcoded time.sleep() instead of auto-waiting',
          'Using brittle CSS or XPath selectors',
        ],
        interviewQnA: doc.interviewQnA || {
          question: 'How do you structure Playwright tests in Python?',
          answer: 'We use pytest-playwright with page/context fixtures, resilient user-facing get_by_* locators, and expect web-first assertions.',
        },
      };
    }

    // For API Testing track, adapt to Python Requests when selected
    if (isPython && trackId === 'api-testing') {
      return {
        ...doc,
        title: doc.title || lessonTitle || 'REST API Testing',
        category: 'REST API Testing (Python Requests) • Contract Validation',
        tagline: doc.tagline || 'Master API Test Automation with Python Requests & pytest',
        overview: doc.overview || lessonDesc || 'Detailed conceptual foundation.',
        whyItMattersForManualQA: doc.whyItMattersForManualQA || '',
        architectureUnderTheHood: doc.architectureUnderTheHood || {
          title: 'Python Requests HTTP Client Architecture',
          flowOrMechanism: 'pytest fixture => requests.Session / requests.get() => urllib3 connection pool => HTTP wire transfer => Response validation',
          keyTakeaway: 'Python Requests provides a lightweight, clean syntax for testing REST endpoints and validating JSON schemas.',
        },
        stepByStepGuide: [
          {
            stepNumber: 1,
            title: 'Setup & Preconditions (Python)',
            badge: 'Step 1',
            summary: 'Initialize base URL and headers using requests session or pytest fixture.',
            explanation: 'Set up authorization tokens and base configuration.',
            codeSnippet: {
              language: 'python',
              caption: 'Python Requests Session Setup',
              code: 'import requests\nimport pytest\n\nBASE_URL = "http://localhost:3000/api/sandbox/v1"\n\n@pytest.fixture\ndef api_client():\n    session = requests.Session()\n    session.headers.update({"Authorization": "Bearer sample_token", "Content-Type": "application/json"})\n    return session',
            },
            proTip: 'Using requests.Session() reuses TCP connections across tests for faster execution.',
          },
          {
            stepNumber: 2,
            title: 'Executing HTTP Request (Python)',
            badge: 'Step 2',
            summary: 'Perform GET/POST/PUT/DELETE request and verify status code.',
            explanation: 'Send request payload and assert status code is 200/201.',
            codeSnippet: {
              language: 'python',
              caption: 'Executing HTTP Call',
              code: 'def test_get_users(api_client):\n    response = api_client.get(f"{BASE_URL}/users")\n    assert response.status_code == 200, f"Expected 200, got {response.status_code}"\n    data = response.json()\n    assert "users" in data',
            },
            proTip: 'Always check response.status_code before attempting to parse response.json().',
          },
          {
            stepNumber: 3,
            title: 'Schema & Field Assertions (Python)',
            badge: 'Step 3',
            summary: 'Validate schema types and required response fields.',
            explanation: 'Assert that JSON fields match expected types and business rules.',
            codeSnippet: {
              language: 'python',
              caption: 'JSON Schema Validation in Python',
              code: 'def test_user_payload(api_client):\n    response = api_client.get(f"{BASE_URL}/users")\n    users = response.json().get("users", [])\n    assert len(users) > 0\n    assert all("id" in u and "email" in u for u in users)',
            },
            proTip: 'Use pydantic or jsonschema for full strict schema validation in production suites.',
          },
        ],
        manualToAutomatedBridge: doc.manualToAutomatedBridge || [],
        productionCodeExample: {
          title: `Production Implementation (Python Requests): ${doc.title || lessonTitle}`,
          description: 'Production-ready Python requests test script.',
          language: 'python',
          code: 'import requests\nimport pytest\n\nBASE_URL = "http://localhost:3000/api/sandbox/v1"\n\n@pytest.fixture\ndef auth_headers():\n    return {\n        "Authorization": "Bearer sdet_jwt_token_sample",\n        "Content-Type": "application/json"\n    }\n\ndef test_api_contract_and_status(auth_headers):\n    """\n    Scenario: Verify API response contract and HTTP 200 status\n    """\n    response = requests.get(f"{BASE_URL}/users", headers=auth_headers, timeout=5)\n    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"\n    data = response.json()\n    assert isinstance(data.get("users"), list), "Payload should contain \'users\' array"\n    assert len(data["users"]) > 0, "Users list should not be empty"\n    print(f"✔ API Verified: {len(data[\'users\'])} records retrieved successfully.")',
          annotations: [],
        },
        bestPractices: [
          'Use requests.Session() for connection pooling',
          'Use pytest fixtures for auth tokens and environment URLs',
          'Validate response schemas with Pydantic or jsonschema',
        ],
        antiPatterns: [
          'Hardcoding credentials or API keys directly in test files',
          'Ignoring HTTP status codes and only checking payload body',
          'Not setting request timeouts, causing hanging tests',
        ],
        interviewQnA: {
          question: 'How do you build an enterprise API test framework in Python?',
          answer: 'We use pytest with requests.Session fixtures for token management, Pydantic models for JSON contract serialization/validation, and Allure for detailed HTTP request/response reporting.',
        },
      };
    }

    // For Selenium OOPs lesson, adapt code examples dynamically to selected language (Java vs Python)
    if (isSelenium && isPython && lessonId === 'java-oops-framework') {
      return {
        title: doc.title || lessonTitle || 'Core Java OOPs for Automation',
        category: 'Selenium (Python) • Enterprise Architecture',
        tagline: doc.tagline || 'Map Encapsulation, Inheritance, Polymorphism, and Abstraction Directly to QA Architecture',
        overview: doc.overview || lessonDesc || 'Detailed conceptual foundation and architectural walkthrough.',
        whyItMattersForManualQA: doc.whyItMattersForManualQA || '',
        architectureUnderTheHood: doc.architectureUnderTheHood || {
          title: 'How the 4 OOPs Pillars Construct an Enterprise Test Framework',
          flowOrMechanism: '1. Encapsulation: Locators are private in Page classes => 2. Inheritance: Tests extend BaseTest to reuse driver => 3. Polymorphism: DriverFactory returns ChromeDriver or FirefoxDriver => 4. Abstraction: WebDriver interface hides browser binary details.',
          keyTakeaway: 'OOPs is not academic theory: each pillar maps directly to solving a concrete automation challenge.',
        },
        stepByStepGuide: [
          {
            stepNumber: 1,
            title: 'Encapsulation: The Foundation of Page Object Model (Python)',
            badge: 'Data Hiding',
            summary: 'Keep web element locators private inside Python Page Classes.',
            explanation: 'Declare locators as private tuple members self._username_field and expose public action methods like login_as(user, pass).',
            codeSnippet: {
              language: 'python',
              code: 'from selenium.webdriver.common.by import By\nfrom selenium.webdriver.remote.webdriver import WebDriver\n\nclass LoginPage:\n    def __init__(self, driver: WebDriver):\n        self._driver = driver\n        # Private encapsulated locators\n        self._username_field = (By.ID, "username")\n        self._password_field = (By.ID, "password")\n        self._submit_btn = (By.CSS_SELECTOR, "button[type=\'submit\']")\n\n    def login_as(self, username: str, password: str):\n        self._driver.find_element(*self._username_field).send_keys(username)\n        self._driver.find_element(*self._password_field).send_keys(password)\n        self._driver.find_element(*self._submit_btn).click()\n        return DashboardPage(self._driver)',
              caption: 'Python Page Object Encapsulation',
            },
            proTip: 'Returning DashboardPage(self._driver) creates a fluent interface matching real user navigation.',
          },
          {
            stepNumber: 2,
            title: 'Inheritance: Eliminating Driver Setup & Teardown with pytest (Python)',
            badge: 'BaseTest Reuse',
            summary: 'Manage browser lifecycle once in BaseTest fixture; all test classes inherit it.',
            explanation: 'Create a BaseTest with @pytest.fixture(autouse=True) setup and teardown.',
            codeSnippet: {
              language: 'python',
              code: 'import pytest\nfrom selenium import webdriver\n\nclass BaseTest:\n    @pytest.fixture(autouse=True)\n    def setup_driver(self):\n        self.driver = webdriver.Chrome()\n        self.driver.maximize_window()\n        yield\n        if self.driver:\n            self.driver.quit() # Always quit to prevent zombie processes',
              caption: 'Python BaseTest Fixture with Selenium',
            },
            proTip: 'Always call driver.quit() rather than driver.close() to kill the chromedriver binary in memory.',
          },
          {
            stepNumber: 3,
            title: 'Polymorphism: Multi-Browser Dynamic Dispatch (Python)',
            badge: 'Dynamic Dispatch',
            summary: 'Switch between Chrome, Firefox, and Edge with zero test changes.',
            explanation: 'Create a polymorphic DriverFactory that instantiates the requested browser dynamically at runtime.',
            codeSnippet: {
              language: 'python',
              code: 'from selenium import webdriver\n\nclass DriverFactory:\n    @staticmethod\n    def create_driver(browser: str = "chrome"):\n        browser = browser.lower()\n        if browser == "firefox":\n            return webdriver.Firefox()\n        elif browser == "edge":\n            return webdriver.Edge()\n        return webdriver.Chrome()',
              caption: 'Polymorphic Factory in Python',
            },
            proTip: 'Parameterize browser execution via pytest -s --browser=firefox for cross-browser matrix testing.',
          },
          {
            stepNumber: 4,
            title: 'Abstraction: Hiding Browser Plumbing Behind Clean Interfaces (Python)',
            badge: 'Clean API',
            summary: 'Interact with high-level contracts while hiding complex WebDriver logic.',
            explanation: 'When you call driver.get("url"), you do not care about HTTP POST commands or W3C wire protocols. Abstraction hides the mechanics.',
            codeSnippet: {
              language: 'python',
              code: 'from selenium import webdriver\nfrom selenium.webdriver.common.by import By\n\ndriver = webdriver.Chrome()\ndriver.get("https://intelligentqa.com")\nbtn = driver.find_element(By.ID, "start")\nbtn.click()',
              caption: 'Abstraction in Selenium WebDriver',
            },
            proTip: 'Wrap reusable waits in a BasePage class so individual page objects do not repeat wait boilerplate.',
          },
        ],
        manualToAutomatedBridge: doc.manualToAutomatedBridge || [],
        productionCodeExample: {
          title: 'Production Test Class (Python Selenium): Extending BaseTest with POM',
          description: 'Clean pytest test class containing zero raw locators and zero driver management code.',
          language: 'python',
          code: `# ==========================================
# Production Test with Page Object Model in Selenium (Python)
# ==========================================
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By

class TestLoginValidation:
    @pytest.fixture(autouse=True)
    def setup_and_teardown(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        yield
        if self.driver:
            self.driver.quit()

    def test_valid_user_authentication(self):
        self.driver.get("http://localhost:3000/sandbox/web")
        login_page = LoginPage(self.driver)
        dashboard = login_page.login_as("standard_user", "secret_pass")
        assert dashboard.is_loaded(), "Dashboard failed to load after login"`,
          annotations: [
            { lineOrPattern: 'test_valid_user_authentication', explanation: 'Pytest test function boundary.' },
            { lineOrPattern: 'assert dashboard.is_loaded()', explanation: 'Clean assertion verifying business outcome.' },
          ],
        },
        bestPractices: [
          'Use Page Object Model with private locators',
          'Use autouse pytest fixtures for clean setup and teardown',
          'Never use time.sleep(); always use WebDriverWait',
        ],
        antiPatterns: [
          'Using hardcoded time.sleep(5)',
          'Copy-pasting webdriver.Chrome() into every single test file',
          'Using brittle absolute full-path XPaths',
        ],
        interviewQnA: doc.interviewQnA || {
          question: 'How do you structure an enterprise Python Selenium framework using OOPs?',
          answer: 'We encapsulate locators inside Page Classes, manage browser lifecycle in a BaseTest pytest fixture, use a DriverFactory for multi-browser polymorphism, and wrap common wait utilities inside a BasePage class.',
        },
      };
    }

    return {
      title: doc.title || lessonTitle || 'Concept Guide',
      category: isSelenium ? (isPython ? 'Selenium (Python) • Enterprise Architecture' : 'Selenium (Java) • Enterprise Architecture') : (doc.category || trackId),
      tagline: doc.tagline || 'Master Enterprise SDET & Modern Quality Engineering Concepts',
      overview: doc.overview || lessonDesc || 'Detailed conceptual foundation and architectural walkthrough.',
      whyItMattersForManualQA: doc.whyItMattersForManualQA || 'Essential knowledge for manual testers transitioning to automated SDET roles.',
      architectureUnderTheHood: doc.architectureUnderTheHood || {
        title: 'Core Architecture & Internal Mechanism',
        flowOrMechanism: 'Request / Action => Engine Verification => DOM / Protocol Event => Assertion Evaluation',
        keyTakeaway: 'Understanding how the engine works under the hood prevents flaky tests and enables scalable framework design.',
      },
      stepByStepGuide: doc.stepByStepGuide || [],
      manualToAutomatedBridge: doc.manualToAutomatedBridge || [],
      productionCodeExample: doc.productionCodeExample || {
        title: isSelenium ? `Production Implementation (Java Selenium): ${doc.title}` : 'Production Code Example',
        description: 'Clean, production-ready implementation of this concept.',
        code: isSelenium ? getConceptCodeSnippet(lessonId, trackId, isPython ? 'python' : 'java', doc.title || lessonTitle) : '// Production automation blueprint',
        language: isSelenium ? (isPython ? 'python' : 'java') : 'typescript',
        annotations: [],
      },
      bestPractices: doc.bestPractices || ['Write resilient user-facing tests', 'Avoid hardcoded timeouts'],
      antiPatterns: doc.antiPatterns || ['Using fixed sleep intervals', 'Coupling tests to brittle DOM details'],
      interviewQnA: doc.interviewQnA || {
        question: 'Why is this concept critical in enterprise SDET technical interviews?',
        answer: 'Interviewers look for engineers who understand underlying architecture and flakiness prevention rather than rote syntax.',
      },
    };
  }

  // Dynamic Generator tailored by track type
  const isPlaywright = trackId === 'playwright-ts';
  const isApi = trackId === 'api-testing';
  const cleanTitle = lessonTitle || 'Automation Concept';

  return {
    title: cleanTitle,
    category: isPlaywright
      ? (isPython ? 'Playwright (Python) • Core Concept' : 'Playwright (TypeScript) • Core Concept')
      : isSelenium
      ? (isPython ? 'Selenium (Python) • Enterprise Architecture' : 'Selenium (Java) • Enterprise Architecture')
      : isApi
      ? (isPython ? 'REST API (Python) • Contract Validation' : 'REST Assured (API) • Contract Validation')
      : 'AI for QA • Autonomous Engineering',
    tagline: `Enterprise Architecture & Implementation Guide: ${cleanTitle}`,
    overview: `${lessonDesc || cleanTitle}. In modern test automation, mastering this concept is essential to building fast, resilient, and deterministic test frameworks that run reliably in CI/CD pipelines without false alarms.`,
    whyItMattersForManualQA: `When manual testers transition to SDET roles, understanding ${cleanTitle} bridges the gap between manual verification steps and production-grade automated code. Instead of writing linear, brittle scripts, you learn to model the application cleanly, handle asynchronous timing, and write self-documenting tests.`,
    architectureUnderTheHood: {
      title: `${cleanTitle}: How it Works Under the Hood`,
      flowOrMechanism: isPlaywright
        ? 'Test Runner => Chrome DevTools Protocol (CDP) WebSocket => Browser Actionability Checks => DOM Execution => Auto-Retrying Assertion'
        : isSelenium
        ? 'Test Script => Selenium 4 W3C WebDriver BiDi Client => Browser Driver Binary => Native OS Events => Browser Response'
        : isApi
        ? 'RequestSpecification Builder => HTTP Transport Layer => Serialization (Jackson) => HTTP Response => Hamcrest / Schema Matchers'
        : 'User Story / PRD Input => Prompt Context Optimizer => AI Autonomous Agent => Synthesized Test Matrix / Scaffolded Code',
      keyTakeaway: 'Understanding the underlying event flow ensures you write tests that work in harmony with browser rendering and network protocols rather than fighting them.',
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Setup & Preconditions',
        badge: 'Step 1',
        summary: `Initialize configuration and prepare the test environment for ${cleanTitle}.`,
        explanation: 'Configure proper dependencies, base URLs, and isolated browser or client state before executing actions.',
        codeSnippet: {
          language: isPython ? 'python' : (isSelenium || isApi ? 'java' : 'typescript'),
          code: isPython
            ? (isPlaywright
              ? `from playwright.sync_api import Page, expect\n\ndef test_${lessonId.replace(/[^a-zA-Z0-9]/g, '_')}(page: Page):\n    page.goto('/sandbox/web')`
              : isApi
              ? `import requests\nimport pytest\n\nBASE_URL = "http://localhost:3000/api/sandbox/v1"\n\n@pytest.fixture\ndef auth_headers():\n    return {"Authorization": "Bearer sample_token"}`
              : `from selenium import webdriver\n\ndef test_${lessonId.replace(/[^a-zA-Z0-9]/g, '_')}():\n    driver = webdriver.Chrome()\n    driver.get("http://localhost:3000/sandbox/web")`)
            : (isPlaywright
              ? `// Step 1: Initialize test context\nimport { test, expect } from '@playwright/test';\n\ntest('${cleanTitle}', async ({ page }) => {\n  await page.goto('/sandbox/web');\n});`
              : isSelenium
              ? `// Step 1: Setup WebDriver instance\npublic class TestConcept extends BaseTest {\n    @Test\n    public void testExecution() {\n        driver.get("http://localhost:3000/sandbox/web");\n    }\n}`
              : isApi
              ? `// Step 1: Configure RequestSpecification\nRequestSpecification reqSpec = new RequestSpecBuilder()\n    .setBaseUri("http://localhost:3000/api/sandbox/v1")\n    .setContentType(ContentType.JSON)\n    .build();`
              : `// Step 1: Initialize AI Agent Context\nconst agent = new QAAgentClient({ role: "Test Architect" });`),
          caption: 'Preconditions and context setup',
        },
        proTip: 'Always isolate test state so each test execution starts from a clean, predictable baseline.',
      },
      {
        stepNumber: 2,
        title: 'Executing the Core Mechanism',
        badge: 'Step 2',
        summary: `Execute the target automation actions using best-practice patterns.`,
        explanation: 'Avoid hardcoded sleeps and brittle selectors. Leverage auto-waiting, explicit expectations, and resilient locators.',
        codeSnippet: {
          language: isPython ? 'python' : (isSelenium || isApi ? 'java' : 'typescript'),
          code: isPython
            ? (isPlaywright
              ? `    submit_btn = page.get_by_role("button", name="Submit").first\n    if submit_btn.is_visible():\n        submit_btn.click()`
              : isApi
              ? `def test_request(auth_headers):\n    response = requests.get(f"{BASE_URL}/users", headers=auth_headers)\n    assert response.status_code == 200`
              : `    wait = WebDriverWait(driver, 10)\n    btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button.action-btn")))\n    btn.click()`)
            : (isPlaywright
              ? `// Step 2: User-facing locator and action\nconst actionButton = page.getByRole('button', { name: 'Submit' });\nawait actionButton.click();`
              : isSelenium
              ? `// Step 2: Explicit wait before interaction\nWebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));\nWebElement element = wait.until(ExpectedConditions.elementToBeClickable(By.id("action-btn")));\nelement.click();`
              : isApi
              ? `// Step 2: Execute HTTP action\nResponse response = given().spec(reqSpec)\n    .when().get("/users")\n    .then().extract().response();`
              : `// Step 2: Execute autonomous synthesis\nconst testMatrix = await agent.generateRequirements(userStory);`),
          caption: 'Executing core mechanism',
        },
        proTip: 'Never mix implicit and explicit waits in Selenium, and trust Playwright auto-waiting before adding manual timeouts.',
      },
      {
        stepNumber: 3,
        title: 'State Verification & Assertions',
        badge: 'Step 3',
        summary: `Verify business outcomes with robust, auto-retrying assertions.`,
        explanation: 'Assert that the application reached the desired state (URL, banner visibility, data values, or response status).',
        codeSnippet: {
          language: isPython ? 'python' : (isSelenium || isApi ? 'java' : 'typescript'),
          code: isPython
            ? (isPlaywright
              ? `    expect(page.get_by_role("heading", level=1)).to_be_visible(timeout=5000)`
              : isApi
              ? `    data = response.json()\n    assert "users" in data\n    assert len(data["users"]) > 0`
              : `    alert = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "success-toast")))\n    assert alert.is_displayed()`)
            : (isPlaywright
              ? `// Step 3: Web-first assertion\nawait expect(page.getByRole('heading', { level: 1 })).toBeVisible();\nawait expect(page).toHaveURL(/.*success/);`
              : isSelenium
              ? `// Step 3: TestNG verification\nAssert.assertTrue(driver.findElement(By.id("success-msg")).isDisplayed());`
              : isApi
              ? `// Step 3: Validate status code and contract\nthen().statusCode(200)\n    .body("status", equalTo("SUCCESS"))\n    .body("data", notNullValue());`
              : `// Step 3: Validate generated coverage\nexpect(testMatrix.coverage).toBeGreaterThanOrEqual(95);`),
          caption: 'Outcome verification and assertion',
        },
        proTip: 'Verify negative error conditions as thoroughly as happy paths to prevent silent production regressions.',
      },
    ],
    manualToAutomatedBridge: [
      {
        manualAction: `Perform ${cleanTitle} by manually clicking and observing screen`,
        automatedApproach: 'Automated script with explicit state expectations',
        whyItMatters: 'Executes repeatedly in seconds across multiple environments with 100% precision.',
      },
      {
        manualAction: 'Wait visually for loading indicators to stop spinning',
        automatedApproach: 'Auto-retrying assertions and actionability checks',
        whyItMatters: 'Advances the exact millisecond the DOM settles, eliminating pipeline delays.',
      },
      {
        manualAction: 'Note down pass/fail status in spreadsheet',
        automatedApproach: 'Automated JUnit/Allure/HTML reports with trace artifacts',
        whyItMatters: 'Generates permanent, auditable test execution logs with screenshots on failure.',
      },
    ],
    productionCodeExample: {
      title: isPython
        ? `Production Implementation (Python ${isPlaywright ? 'Playwright' : isApi ? 'Requests' : 'Selenium'}): ${cleanTitle}`
        : `Production Implementation (${isPlaywright ? 'Playwright' : isApi ? 'Java REST Assured' : 'Java Selenium'}): ${cleanTitle}`,
      description: `Complete, production-ready blueprint illustrating best practices for ${cleanTitle}.`,
      language: isPython ? 'python' : (isSelenium || isApi ? 'java' : 'typescript'),
      code: isPython
        ? (isPlaywright
          ? getConceptCodeSnippet(lessonId, trackId, 'python', cleanTitle)
          : isApi
          ? `import requests\nimport pytest\n\nBASE_URL = "http://localhost:3000/api/sandbox/v1"\n\n@pytest.fixture\ndef auth_headers():\n    return {\n        "Authorization": "Bearer sdet_jwt_token_sample",\n        "Content-Type": "application/json"\n    }\n\ndef test_api_contract(auth_headers):\n    response = requests.get(f"{BASE_URL}/users", headers=auth_headers, timeout=5)\n    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"\n    assert "users" in response.json()`
          : getConceptCodeSnippet(lessonId, trackId, 'python', cleanTitle))
        : (isPlaywright
          ? `import { test, expect } from '@playwright/test';\n\ntest.describe('${cleanTitle} Suite', () => {\n  test('should execute scenario successfully', async ({ page }) => {\n    await page.goto('/sandbox/web');\n    const target = page.getByRole('button').first();\n    if (await target.isVisible()) {\n      await target.click();\n    }\n    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();\n  });\n});`
          : isSelenium
          ? `package com.intelligentqa.concepts;\n\nimport org.openqa.selenium.By;\nimport org.openqa.selenium.WebDriver;\nimport org.openqa.selenium.support.ui.ExpectedConditions;\nimport org.openqa.selenium.support.ui.WebDriverWait;\nimport java.time.Duration;\n\npublic class ${lessonId.replace(/[^a-zA-Z0-9]/g, '')} {\n    public static void execute(WebDriver driver) {\n        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));\n        wait.until(ExpectedConditions.visibilityOfElementLocated(By.tagName("h1")));\n    }\n}`
          : `import static io.restassured.RestAssured.given;\nimport static org.hamcrest.Matchers.*;\n\npublic class ApiTest {\n    public static void verify() {\n        given().baseUri("http://localhost:3000/api/sandbox/v1")\n            .when().get("/users")\n            .then().statusCode(200).body("users", notNullValue());\n    }\n}`),
      annotations: [
        { lineOrPattern: 'test', explanation: 'Declares test case or method boundary.' },
        { lineOrPattern: 'expect', explanation: 'Web-first or contract assertion verifying outcomes.' },
      ],
    },
    bestPractices: [
      'Write tests against user-facing accessibility attributes rather than internal DOM details.',
      'Rely on framework auto-waiting and explicit condition polling; never hardcode Thread.sleep.',
      'Maintain modular, encapsulated Page Object Models to isolate changes when the UI evolves.',
      'Ensure test independence: each test should create and clean up its own test data.',
    ],
    antiPatterns: [
      'Using arbitrary sleep timeouts to fix intermittent timing failures.',
      'Coupling tests to brittle full-path XPaths or auto-generated CSS classes.',
      'Writing monolithic tests that attempt to verify 20 unrelated features in a single script.',
    ],
    interviewQnA: {
      question: `How would you explain the practical significance of ${cleanTitle} in an SDET interview?`,
      answer: `In enterprise testing, ${cleanTitle} is critical for building reliable, deterministic automation suites. By replacing manual timing delays with framework-native synchronization and modeling tests from the user's perspective, we eliminate flakiness, reduce maintenance overhead, and ensure automated builds provide fast, actionable feedback in CI/CD pipelines.`,
    },
  };
}

// Concept Code Generator for Java, TypeScript, and Python that strictly maps to the Concept Guide
export function getConceptCodeSnippet(
  lessonId: string,
  trackId: string,
  lang: 'java' | 'typescript' | 'python',
  lessonTitle: string = 'Automation Concept'
): string {
  if (trackId === 'selenium-java') {
    const doc = getSeleniumLessonDoc(lessonId, lang === 'python', lessonTitle);
    return doc.productionCodeExample.code;
  }

  // 1. Core Java OOPs Framework
  if (lessonId === 'java-oops-framework') {
    if (lang === 'java') {
      return `// ==========================================
// 1. ENCAPSULATION: Page Object Class with Private Locators
// ==========================================
package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage {
    private final WebDriver driver;

    // Encapsulated locators: hidden from test classes
    private final By usernameField = By.id("username");
    private final By passwordField = By.id("password");
    private final By loginButton = By.cssSelector("button[type='submit']");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }

    public DashboardPage loginAs(String username, String password) {
        driver.findElement(usernameField).sendKeys(username);
        driver.findElement(passwordField).sendKeys(password);
        driver.findElement(loginButton).click();
        return new DashboardPage(driver);
    }
}

// ==========================================
// 2. INHERITANCE: BaseTest for Browser Lifecycle
// ==========================================
package com.intelligentqa.base;

import org.openqa.selenium.WebDriver;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.AfterMethod;

public abstract class BaseTest {
    protected WebDriver driver;

    @BeforeMethod
    public void setUp() {
        driver = DriverFactory.createDriver("chrome");
        driver.manage().window().maximize();
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) driver.quit(); // Always quit to prevent zombie processes
    }
}`;
    }
    if (lang === 'python') {
      return `# ==========================================
# 1. ENCAPSULATION: Python Page Object Model (Selenium)
# ==========================================
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver

class LoginPage:
    def __init__(self, driver: WebDriver):
        self._driver = driver
        # Encapsulated locators: private to the page class
        self._username_field = (By.ID, "username")
        self._password_field = (By.ID, "password")
        self._submit_btn = (By.CSS_SELECTOR, "button[type='submit']")

    def login_as(self, username: str, password: str):
        self._driver.find_element(*self._username_field).send_keys(username)
        self._driver.find_element(*self._password_field).send_keys(password)
        self._driver.find_element(*self._submit_btn).click()
        return DashboardPage(self._driver)

# ==========================================
# 2. INHERITANCE: BaseTest Fixture (Selenium)
# ==========================================
import pytest
from selenium import webdriver

class BaseTest:
    @pytest.fixture(autouse=True)
    def setup_driver(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        yield
        if self.driver:
            self.driver.quit()`;
    }
    return `// ==========================================
// 1. ENCAPSULATION: Modern TypeScript Page Object
// ==========================================
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  // Private encapsulated locators
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
  }

  async loginAs(username: string, pass: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}

// ==========================================
// 2. INHERITANCE: Extending Base Test Fixtures
// ==========================================
import { test as base } from '@playwright/test';

export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});`;
  }

  // 2. Auto-Waiting & Synchronization
  if (lessonId === 'pw-auto-waiting' || lessonId === 'sel-sync-waits') {
    if (lang === 'typescript') {
      return `import { test, expect } from '@playwright/test';

test('auto-waiting and web-first assertions', async ({ page }) => {
  await page.goto('/sandbox/web');

  // Auto-waiting: automatically checks attached, visible, stable, enabled
  const triggerBtn = page.getByRole('button', { name: 'Simulate AJAX Delay' });
  await triggerBtn.click();

  // Web-First assertion: continuously polls DOM until visible (up to 5s)
  const resultBanner = page.getByTestId('dynamic-result-banner');
  await expect(resultBanner).toBeVisible({ timeout: 5000 });
  await expect(resultBanner).toContainText('Data Loaded Successfully');

  // Inverted state verification: wait for loading spinner to disappear
  await expect(page.getByTestId('loading-spinner')).toBeHidden();
});`;
    }
    if (lang === 'java') {
      return `package com.intelligentqa.sync;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class SynchronizationStrategy {
    public static void verifyDynamicWait(WebDriver driver) {
        driver.get("http://localhost:3000/sandbox/web");

        // Explicit Wait: Avoid Thread.sleep at all costs!
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // 1. Wait for element to be clickable
        WebElement triggerBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("ajax-trigger")));
        triggerBtn.click();

        // 2. Wait for result text to be present in DOM
        WebElement banner = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("result-banner")));
        wait.until(ExpectedConditions.textToBePresentInElement(banner, "Data Loaded"));

        // 3. Wait for spinner invisibility
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.className("loading-spinner")));
    }
}`;
    }
    if (trackId === 'selenium-java' || lessonId === 'sel-sync-waits') {
      return `# ==========================================
# SELENIUM WEBDRIVER (PYTHON): Explicit Wait
# ==========================================
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_dynamic_wait(driver):
    driver.get("http://localhost:3000/sandbox/web")
    wait = WebDriverWait(driver, 10)

    # 1. Wait for element to be clickable
    btn = wait.until(EC.element_to_be_clickable((By.ID, "ajax-trigger")))
    btn.click()

    # 2. Wait for dynamic content visibility
    banner = wait.until(EC.visibility_of_element_located((By.ID, "result-banner")))
    assert "Data Loaded" in banner.text

    # 3. Wait for loading spinner to disappear
    wait.until(EC.invisibility_of_element_located((By.CLASS_NAME, "loading-spinner")))`;
    }
    return `from playwright.sync_api import Page, expect

def test_auto_waiting(page: Page):
    page.goto("http://localhost:3000/sandbox/web")

    # Playwright checks 5 actionability criteria before clicking
    page.get_by_role("button", name="Simulate AJAX Delay").click()

    # Web-first retrying assertions in Python
    result_banner = page.get_by_test_id("dynamic-result-banner")
    expect(result_banner).to_be_visible(timeout=5000)
    expect(result_banner).to_contain_text("Data Loaded")

    # Inverted check: wait for loading spinner to disappear
    expect(page.get_by_test_id("loading-spinner")).to_be_hidden()`;
  }

  // 3. Resilient Locators & User-Facing Roles
  if (lessonId === 'pw-resilient-locators' || lessonId === 'sel-locators-xpath') {
    if (lang === 'typescript') {
      return `import { test, expect } from '@playwright/test';

test('resilient user-facing locators strategy', async ({ page }) => {
  await page.goto('/sandbox/web');

  // Priority 1: getByRole (accessibility tree)
  await page.getByRole('button', { name: 'Submit' }).click();

  // Priority 2: getByLabel & getByPlaceholder
  await page.getByLabel('Work Email').fill('sdet@intelligentqa.com');
  await page.getByPlaceholder('Search lessons...').fill('Locators');

  // Priority 3: Scoped row filtering on dynamic tables
  const userRow = page.getByRole('row').filter({ hasText: 'Sarah Connor' });
  await expect(userRow.getByText('Active')).toBeVisible();
  await userRow.getByRole('button', { name: 'Edit' }).click();
});`;
    }
    if (lang === 'java') {
      return `package com.intelligentqa.locators;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class AdvancedDynamicLocators {
    private final WebDriver driver;

    // Resilient CSS Attribute & Dynamic XPath Selectors
    private final By submitButton = By.xpath("//button[normalize-space()='Submit' or @type='submit']");
    private final By searchInput = By.cssSelector("input[placeholder*='Search']");

    // Dynamic XPath Axes: Finding an active row's action button
    public By getEditButtonForUser(String userName) {
        return By.xpath("//tr[contains(., '" + userName + "')]//button[contains(@class, 'edit-btn')]");
    }

    public AdvancedDynamicLocators(WebDriver driver) {
        this.driver = driver;
    }

    public void clickSubmit() {
        driver.findElement(submitButton).click();
    }
}`;
    }
    if (trackId === 'selenium-java' || lessonId === 'sel-locators-xpath') {
      return `from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver

class UserTablePage:
    def __init__(self, driver: WebDriver):
        self.driver = driver
        self.submit_btn = (By.XPATH, "//button[normalize-space()='Submit' or @type='submit']")
        self.search_input = (By.CSS_SELECTOR, "input[placeholder*='Search']")

    def get_edit_button_for_user(self, username: str):
        # Dynamic XPath axes traversal without fragile index numbers
        xpath = f"//tr[contains(., '{username}')]//button[contains(@class, 'edit-btn')]"
        return (By.XPATH, xpath)

    def edit_user(self, username: str):
        locator = self.get_edit_button_for_user(username)
        self.driver.find_element(*locator).click()`;
    }
    return `from playwright.sync_api import Page, expect

def test_resilient_locators(page: Page):
    page.goto("http://localhost:3000/sandbox/web")

    # Semantic User-Facing Locators
    page.get_by_role("button", name="Submit").click()
    page.get_by_label("Work Email").fill("sdet@intelligentqa.com")
    page.get_by_placeholder("Search lessons...").fill("Locators")

    # Filtering rows by text content without fragile XPath indexes
    user_row = page.get_by_role("row").filter(has_text="Sarah Connor")
    expect(user_row.get_by_text("Active")).to_be_visible()
    user_row.get_by_role("button", name="Edit").click()`;
  }

  // 4. API Testing & REST Assured BDD
  if (trackId === 'api-testing') {
    if (lang === 'java') {
      return `package com.intelligentqa.api;

import io.restassured.http.ContentType;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class RestAssuredBddTest {

    @Test(description = "Verify API Contract using Given-When-Then BDD Syntax")
    public void testUserEndpointContract() {
        given()
            .baseUri("http://localhost:3000/api/sandbox/v1")
            .header("Authorization", "Bearer valid_sdet_token")
            .contentType(ContentType.JSON)
        .when()
            .get("/users")
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("users.size()", greaterThan(0))
            .body("users[0].role", notNullValue())
            .time(lessThan(1500L)); // Performance SLA verification
    }
}`;
    }
    if (lang === 'typescript') {
      return `import { test, expect } from '@playwright/test';

test('API contract validation with Playwright request fixture', async ({ request }) => {
  // GIVEN: Request context and auth headers
  const headers = {
    'Authorization': 'Bearer valid_sdet_token',
    'Content-Type': 'application/json',
  };

  // WHEN: HTTP request dispatched
  const response = await request.get('/api/sandbox/v1/users', { headers });

  // THEN: Status code and body contract assertions
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(Array.isArray(data.users)).toBe(true);
  expect(data.users.length).toBeGreaterThan(0);
  expect(data.users[0]).toHaveProperty('role');
});`;
    }
    return `import requests
import pytest

BASE_URL = "http://localhost:3000/api/sandbox/v1"

def test_api_contract_verification():
    headers = {
        "Authorization": "Bearer valid_sdet_token",
        "Content-Type": "application/json"
    }

    # Execute HTTP GET
    response = requests.get(f"{BASE_URL}/users", headers=headers, timeout=5)

    # Contract assertions
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
    data = response.json()
    assert "users" in data, "Payload missing 'users' key"
    assert len(data["users"]) > 0, "Users list should not be empty"
    assert "role" in data["users"][0], "User record missing 'role' field"`;
  }

  // 5. Generic Concept Matcher
  if (lang === 'java') {
    return `// ==========================================
// JAVA ENTERPRISE AUTOMATION: ${lessonTitle}
// ==========================================
package com.intelligentqa.concepts;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class ${lessonId.replace(/[^a-zA-Z0-9]/g, '')}Example {
    private final WebDriver driver;
    private final WebDriverWait wait;

    public ${lessonId.replace(/[^a-zA-Z0-9]/g, '')}Example(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void executeScenario() {
        // Concept: ${lessonTitle}
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button.action-btn")));
        element.click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("success-toast")));
    }
}`;
  }

  if (lang === 'python') {
    if (trackId === 'selenium-java') {
      return `# ==========================================
# SELENIUM WEBDRIVER (PYTHON): ${lessonTitle}
# ==========================================
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_${lessonId.replace(/[^a-zA-Z0-9]/g, '_')}_selenium():
    driver = webdriver.Chrome()
    try:
        driver.get("http://localhost:3000/sandbox/web")
        wait = WebDriverWait(driver, 10)
        
        # Concept: ${lessonTitle}
        element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button.action-btn")))
        element.click()
        
        alert = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "success-toast")))
        assert alert.is_displayed(), "Action should complete successfully"
    finally:
        driver.quit()`;
    }
    return `# ==========================================
# PYTHON AUTOMATION: ${lessonTitle}
# ==========================================
from playwright.sync_api import Page, expect

def test_${lessonId.replace(/[^a-zA-Z0-9]/g, '_')}(page: Page):
    """
    Concept: ${lessonTitle}
    Demonstrating resilient locators and web-first assertions.
    """
    page.goto("http://localhost:3000/sandbox/web")

    # Target element using accessible role
    action_button = page.get_by_role("button", name="Submit").first
    if action_button.is_visible():
        action_button.click()

    # Web-first auto-retrying assertion
    expect(page.get_by_role("status")).to_be_visible(timeout=5000)`;
  }

  // Never return Playwright TypeScript for Selenium track
  if (trackId === 'selenium-java') {
    return getConceptCodeSnippet(lessonId, trackId, 'java', lessonTitle);
  }

  return `// ==========================================
// PLAYWRIGHT (TYPESCRIPT): ${lessonTitle}
// ==========================================
import { test, expect } from '@playwright/test';

test.describe('${lessonTitle}', () => {
  test('execute scenario with modern best practices', async ({ page }) => {
    await page.goto('/sandbox/web');

    // User-facing locator
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await submitBtn.click();

    // Auto-retrying web-first assertion
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
  });
});`;
}

