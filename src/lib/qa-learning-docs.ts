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

  if (DETAILED_LESSON_DOCS[lessonId]) {
    const doc = { ...DETAILED_LESSON_DOCS[lessonId] };

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
    category: isPlaywright ? 'Playwright (TypeScript) • Core Concept' : isSelenium ? 'Selenium (Java) • Enterprise Architecture' : isApi ? 'REST Assured (API) • Contract Validation' : 'AI for QA • Autonomous Engineering',
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
          language: isSelenium || isApi ? 'java' : 'typescript',
          code: isPlaywright
            ? `// Step 1: Initialize test context\nimport { test, expect } from '@playwright/test';\n\ntest('${cleanTitle}', async ({ page }) => {\n  await page.goto('/sandbox/web');\n});`
            : isSelenium
            ? `// Step 1: Setup WebDriver instance\npublic class TestConcept extends BaseTest {\n    @Test\n    public void testExecution() {\n        driver.get("http://localhost:3000/sandbox/web");\n    }\n}`
            : isApi
            ? `// Step 1: Configure RequestSpecification\nRequestSpecification reqSpec = new RequestSpecBuilder()\n    .setBaseUri("http://localhost:3000/api/sandbox/v1")\n    .setContentType(ContentType.JSON)\n    .build();`
            : `// Step 1: Initialize AI Agent Context\nconst agent = new QAAgentClient({ role: "Test Architect" });`,
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
          language: isSelenium || isApi ? 'java' : 'typescript',
          code: isPlaywright
            ? `// Step 2: User-facing locator and action\nconst actionButton = page.getByRole('button', { name: 'Submit' });\nawait actionButton.click();`
            : isSelenium
            ? `// Step 2: Explicit wait before interaction\nWebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));\nWebElement element = wait.until(ExpectedConditions.elementToBeClickable(By.id("action-btn")));\nelement.click();`
            : isApi
            ? `// Step 2: Execute HTTP action\nResponse response = given().spec(reqSpec)\n    .when().get("/users")\n    .then().extract().response();`
            : `// Step 2: Execute autonomous synthesis\nconst testMatrix = await agent.generateRequirements(userStory);`,
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
          language: isSelenium || isApi ? 'java' : 'typescript',
          code: isPlaywright
            ? `// Step 3: Web-first assertion\nawait expect(page.getByRole('heading', { level: 1 })).toBeVisible();\nawait expect(page).toHaveURL(/.*success/);`
            : isSelenium
            ? `// Step 3: TestNG verification\nAssert.assertTrue(driver.findElement(By.id("success-msg")).isDisplayed());`
            : isApi
            ? `// Step 3: Validate status code and contract\nthen().statusCode(200)\n    .body("status", equalTo("SUCCESS"))\n    .body("data", notNullValue());`
            : `// Step 3: Validate generated coverage\nexpect(testMatrix.coverage).toBeGreaterThanOrEqual(95);`,
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
      title: `Production Implementation: ${cleanTitle}`,
      description: `Complete, production-ready blueprint illustrating best practices for ${cleanTitle}.`,
      language: isSelenium || isApi ? 'java' : 'typescript',
      code: isPlaywright
        ? `import { test, expect } from '@playwright/test';\n\ntest.describe('${cleanTitle} Suite', () => {\n  test('should execute scenario successfully', async ({ page }) => {\n    await page.goto('/sandbox/web');\n    const target = page.getByRole('button').first();\n    if (await target.isVisible()) {\n      await target.click();\n    }\n    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();\n  });\n});`
        : isSelenium
        ? `package com.intelligentqa.concepts;\n\nimport org.openqa.selenium.By;\nimport org.openqa.selenium.WebDriver;\nimport org.openqa.selenium.support.ui.ExpectedConditions;\nimport org.openqa.selenium.support.ui.WebDriverWait;\nimport java.time.Duration;\n\npublic class ${lessonId.replace(/[^a-zA-Z0-9]/g, '')} {\n    public static void execute(WebDriver driver) {\n        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));\n        wait.until(ExpectedConditions.visibilityOfElementLocated(By.tagName("h1")));\n    }\n}`
        : `import static io.restassured.RestAssured.given;\nimport static org.hamcrest.Matchers.*;\n\npublic class ApiTest {\n    public static void verify() {\n        given().baseUri("http://localhost:3000/api/sandbox/v1")\n            .when().get("/users")\n            .then().statusCode(200).body("users", notNullValue());\n    }\n}`,
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

