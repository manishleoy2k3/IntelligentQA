import { QADatabase } from './qa-db';
import { checkGuideDuplicate, DuplicateCheckReport } from './guide-duplicate-detector';
export { checkGuideDuplicate };
export type { DuplicateCheckReport };

export interface CodeSnippet {
  language: string; // 'java' | 'typescript' | 'python' | 'json' | 'csharp';
  code: string;
  caption?: string;
}

export interface ConceptGuide {
  id: string;
  trackId: 'selenium' | 'playwright' | 'api-testing' | 'ai-qa' | string;
  title: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  overview: string;
  architectureOrMechanism?: string;
  codeSnippets: CodeSnippet[];
  bestPractices?: string[];
  antiPatterns?: string[];
  interviewTips?: string;
  isCustom?: boolean;
  status?: 'pending_admin_approval' | 'approved' | 'rejected' | 'draft';
  submittedBy?: {
    id: string;
    name: string;
    email: string;
  };
  submittedAt?: string;
  adminFeedback?: string;
  duplicateScore?: number;
  duplicateStatus?: 'unique' | 'potential_duplicate' | 'duplicate';
  highestMatchTitle?: string;
}

export const TRACK_META: Record<string, { id: string; name: string; tag: string; color: string; badgeClass: string }> = {
  selenium: {
    id: 'selenium',
    name: 'Selenium',
    tag: '',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  'selenium-java': {
    id: 'selenium',
    name: 'Selenium',
    tag: '',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  playwright: {
    id: 'playwright',
    name: 'Playwright (TS)',
    tag: '',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  'playwright-ts': {
    id: 'playwright',
    name: 'Playwright (TS)',
    tag: '',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  'api-testing': {
    id: 'api-testing',
    name: 'Rest Assured (API)',
    tag: '',
    color: 'purple',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  'ai-qa': {
    id: 'ai-qa',
    name: 'AI Academy',
    tag: '',
    color: 'cyan',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  articles: {
    id: 'articles',
    name: 'Tutorials & Articles',
    tag: 'Articles',
    color: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  'tutorials-articles': {
    id: 'articles',
    name: 'Tutorials & Articles',
    tag: 'Articles',
    color: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
};

export const DEFAULT_CONCEPT_GUIDES: ConceptGuide[] = [
  // ==========================================
  // SELENIUM GUIDES
  // ==========================================
  {
    id: 'sel-framework-from-scratch',
    trackId: 'selenium',
    title: 'Selenium WebDriver Architecture & Complete Framework Setup from Scratch',
    category: 'Foundations & Setup',
    level: 'Beginner',
    summary: 'Understand why WebDriver is required under the W3C protocol and build a complete enterprise Maven + TestNG framework from scratch.',
    overview: `Manual testers often ask: "Why can't Java just click buttons in Chrome directly?"
Browsers run in isolated OS sandboxes for user security. An external program cannot reach into Chrome's memory to click elements.

The W3C WebDriver Architecture bridges this gap:
1. Java Code (Language Bindings) creates HTTP requests conforming to W3C WebDriver standard.
2. ChromeDriver Binary (the Driver) acts as a local lightweight HTTP server on port 9515.
3. Native Browser Process receives commands from the driver binary over internal browser debugging pipes.

Starting a framework from scratch requires setting up Maven, establishing standard Maven directory layouts (src/main/java and src/test/java), and managing browser binaries automatically via Selenium 4 Selenium Manager.`,
    architectureOrMechanism: `Test Script (Java) ===[W3C REST/BiDi Protocols]===> ChromeDriver Server (Port 9515) ===[Native DevTools/CDP]===> Chrome Browser Process. Selenium 4 eliminates legacy JSON Wire Protocol overhead.`,
    codeSnippets: [
      {
        language: 'xml',
        caption: 'pom.xml: Enterprise Dependencies for Selenium 4 & TestNG',
        code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.intelligentqa</groupId>
    <artifactId>selenium-enterprise-framework</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <selenium.version>4.21.0</selenium.version>
        <testng.version>7.10.2</testng.version>
        <allure.version>2.27.0</allure.version>
    </properties>

    <dependencies>
        <!-- Selenium 4 Java Bindings -->
        <dependency>
            <groupId>org.seleniumhq.selenium</groupId>
            <artifactId>selenium-java</artifactId>
            <version>\${selenium.version}</version>
        </dependency>

        <!-- TestNG Test Runner -->
        <dependency>
            <groupId>org.testng</groupId>
            <artifactId>testng</artifactId>
            <version>\${testng.version}</version>
        </dependency>

        <!-- Allure TestNG Reporting -->
        <dependency>
            <groupId>io.qameta.allure</groupId>
            <artifactId>allure-testng</artifactId>
            <version>\${allure.version}</version>
        </dependency>
    </dependencies>
</project>`,
      },
      {
        language: 'java',
        caption: 'Java: DriverFactory with Clean Browser Setup',
        code: `package com.intelligentqa.factory;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.time.Duration;

public class DriverFactory {
    public static WebDriver createDriver(String browser) {
        WebDriver driver;
        switch (browser.toLowerCase().trim()) {
            case "firefox":
                FirefoxOptions ffOptions = new FirefoxOptions();
                ffOptions.addArguments("-headless");
                driver = new FirefoxDriver(ffOptions);
                break;
            case "chrome":
            default:
                ChromeOptions options = new ChromeOptions();
                options.addArguments("--headless=new"); // Modern headless mode
                options.addArguments("--disable-gpu");
                options.addArguments("--no-sandbox");
                options.addArguments("--disable-dev-shm-usage");
                options.addArguments("--window-size=1920,1080");
                driver = new ChromeDriver(options);
                break;
        }

        // Standard timeouts
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
        return driver;
    }
}`,
      },
    ],
    bestPractices: [
      'Always program to the WebDriver interface (WebDriver driver = new ChromeDriver()) to switch browsers via polymorphism.',
      'Rely on Selenium 4 Selenium Manager for automated binary resolution instead of downloading chromedriver.exe manually.',
      'Organize your repository into: src/main/java (pages, components, factory, utils) and src/test/java (tests, listeners).',
    ],
    antiPatterns: [
      'Hardcoding System.setProperty("webdriver.chrome.driver", "C:/chromedriver.exe") which breaks on different machines/CI.',
      'Instantiating ChromeDriver directly inside test methods instead of using a centralized Factory pattern.',
    ],
    interviewTips: 'Test Architects love asking: "Explain what happens under the hood when you run WebDriver driver = new ChromeDriver()?" Explain the W3C HTTP session creation, port binding, and binary handshake.',
  },
  {
    id: 'sel-dynamic-waits',
    trackId: 'selenium',
    title: 'Dynamic Synchronization: Explicit vs FluentWait vs Thread.sleep',
    category: 'Synchronization & Waits',
    level: 'Intermediate',
    summary: 'Master dynamic synchronization to eliminate flaky tests, understand polling intervals, and replace brittle sleep calls.',
    overview: `Synchronization is the #1 cause of flaky automation tests in enterprise CI/CD pipelines.

Modern web applications use asynchronous AJAX calls, React state hydration, and animations where elements exist in the DOM but cannot receive click actions yet. Using Thread.sleep() freezes the JVM thread unconditionally, dramatically slowing down suites.

Selenium provides WebDriverWait (Explicit Wait) and FluentWait to poll the DOM dynamically until ExpectedConditions (such as elementToBeClickable or visibilityOfElementLocated) evaluate to true, proceeding instantly without unnecessary delays.`,
    architectureOrMechanism: `WebDriverWait polls the browser every 500ms by default and ignores NoSuchElementException. FluentWait allows custom polling intervals (e.g., 250ms) and custom ignored exception lists (e.g., StaleElementReferenceException).`,
    codeSnippets: [
      {
        language: 'java',
        caption: 'Java: WebDriverWait & FluentWait Implementation',
        code: `// Enterprise Explicit Wait
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("submit-order")));
submitBtn.click();

// Custom FluentWait with fine-grained polling
Wait<WebDriver> fluentWait = new FluentWait<>(driver)
    .withTimeout(Duration.ofSeconds(15))
    .pollingEvery(Duration.ofMillis(250))
    .ignoring(NoSuchElementException.class)
    .ignoring(StaleElementReferenceException.class);

WebElement status = fluentWait.until(d -> d.findElement(By.id("txn-status")));`,
      },
      {
        language: 'python',
        caption: 'Python: WebDriverWait with Expected Conditions',
        code: `from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Explicit wait for element to be clickable
wait = WebDriverWait(driver, 10, poll_frequency=0.25)
submit_btn = wait.until(EC.element_to_be_clickable((By.ID, "submit-order")))
submit_btn.click()`,
      },
    ],
    bestPractices: [
      'Always favor Explicit Waits over Implicit Waits. Mixing both causes unexpected timeout compounding in Selenium.',
      'Use expected condition elementToBeClickable before click() and visibilityOf for assertions.',
      'Never commit Thread.sleep() in production framework suites.',
    ],
    antiPatterns: [
      'Setting a global implicit wait of 30 seconds and using Thread.sleep(5000) for animations.',
      'Catching TimeoutException silently and continuing test execution without assertion.',
    ],
    interviewTips: 'In interviews, emphasize why mixing Implicit and Explicit waits is undefined behavior in WebDriver specifications, and explain how FluentWait customizes polling intervals.',
  },
  {
    id: 'sel-threadlocal-driver',
    trackId: 'selenium',
    title: 'ThreadLocal WebDriver for Parallel Test Execution',
    category: 'Framework Architecture',
    level: 'Advanced',
    summary: 'Design thread-safe WebDriver architectures for multi-threaded parallel execution in TestNG and CI/CD pipelines.',
    overview: `When executing tests in parallel using TestNG (parallel="methods" or parallel="classes"), sharing a single static WebDriver instance results in race conditions, session collisions, and tests failing unpredictably.

ThreadLocal<WebDriver> isolates each browser instance to its own dedicated worker thread, allowing 10+ parallel tests on a multi-core machine or grid node without cross-test state leakage.`,
    architectureOrMechanism: `ThreadLocal stores values scoped strictly to the current executing Java Thread. When TestNG spins up worker threads, each thread calls getDriver() to retrieve its own browser session. In @AfterMethod, calling remove() prevents JVM thread-pool memory leaks.`,
    codeSnippets: [
      {
        language: 'java',
        caption: 'Java: DriverManager with ThreadLocal<WebDriver>',
        code: `public class DriverManager {
    private static final ThreadLocal<WebDriver> driverThread = new ThreadLocal<>();

    public static WebDriver getDriver() {
        return driverThread.get();
    }

    public static void setDriver(WebDriver driver) {
        driverThread.set(driver);
    }

    public static void quitDriver() {
        if (driverThread.get() != null) {
            driverThread.get().quit();
            driverThread.remove(); // Critical to avoid ThreadLocal memory leak
        }
    }
}

// BaseTest integration
public abstract class BaseTest {
    @BeforeMethod
    @Parameters({"browser"})
    public void setUp(@Optional("chrome") String browser) {
        WebDriver driver = DriverFactory.createDriver(browser);
        DriverManager.setDriver(driver);
    }

    @AfterMethod
    public void tearDown() {
        DriverManager.quitDriver();
    }
}`,
      },
    ],
    bestPractices: [
      'Always call driverThread.remove() after driver.quit() to prevent PermGen / Metaspace memory leaks.',
      'Wrap driver initialization inside a Factory pattern (e.g. DriverFactory).',
    ],
    antiPatterns: [
      'Using public static WebDriver driver; across base classes in parallel suites.',
      'Forgetting to invoke remove(), causing zombie browser sessions on CI runners.',
    ],
    interviewTips: 'Test architects always ask: "How do you handle parallel execution without collision?" Answer with ThreadLocal<WebDriver>, DriverFactory, and cleanup in TestNG listeners.',
  },
  {
    id: 'sel-pom-pattern',
    trackId: 'selenium',
    title: 'Page Object Model (POM) & Component Architecture',
    category: 'Design Patterns',
    level: 'Intermediate',
    summary: 'Build scalable, maintainable test architectures by cleanly decoupling page locators and user actions from assertions.',
    overview: `Page Object Model (POM) is the industry-standard design pattern for test automation. Each web page is represented as a Java/Python class, encapsulating web elements (locators) and business actions (methods) while hiding WebDriver implementation details from test scripts.

This drastically reduces maintenance costs: when a developer alters a button ID or DOM structure, changes are made in only one place (the Page class), without modifying 50 test cases.`,
    architectureOrMechanism: `Tests interact only with Page Objects. Page Objects return other Page Objects upon navigation (Method Chaining / Fluent interface), keeping test methods descriptive and declarative.`,
    codeSnippets: [
      {
        language: 'java',
        caption: 'Java: Fluent Page Object with Encapsulated Locators',
        code: `public class LoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    // Encapsulated locators
    private final By emailInput = By.id("user-email");
    private final By passwordInput = By.id("user-password");
    private final By loginBtn = By.cssSelector("button[type='submit']");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public DashboardPage loginAs(String email, String password) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput)).sendKeys(email);
        driver.findElement(passwordInput).sendKeys(password);
        driver.findElement(loginBtn).click();
        return new DashboardPage(driver); // Fluent transition
    }
}`,
      },
    ],
    bestPractices: [
      'Never write test assertions inside Page Objects (assert in @Test classes).',
      'Keep locators private final By to enforce encapsulation.',
    ],
    antiPatterns: [
      'Overusing PageFactory @FindBy in modern Selenium (can cause StaleElementReferenceException during dynamic DOM rerenders).',
    ],
    interviewTips: 'Explain how returning next Page Objects creates a Fluent API and why assertions belong strictly in test classes.',
  },
  {
    id: 'sel-listeners-reports-cicd',
    trackId: 'selenium',
    title: 'TestNG Listeners & Extent / Allure Reports with Automated Failure Screenshots',
    category: 'Enterprise Observability & CI/CD',
    level: 'Advanced',
    summary: 'Intercept test outcomes via TestNG ITestListener, capture automatic failure screenshots, and publish visual Allure reports in CI/CD.',
    overview: `Manual testers take screenshots manually whenever a test fails. In unattended CI/CD runs (GitHub Actions, Jenkins), if a test fails and leaves no visual evidence, debugging requires hours of guessing.

TestNG Listeners implement the Observer pattern: they listen for lifecycle events (onTestStart, onTestSuccess, onTestFailure, onTestSkipped). When onTestFailure fires, the listener automatically grabs the active ThreadLocal WebDriver, captures a timestamped screenshot, and embeds it directly into the Allure or Extent report.`,
    architectureOrMechanism: `Test Method Fails ===> TestNG Runner triggers ITestListener.onTestFailure() ===> TakesScreenshot cast ===> PNG byte array attached to Allure report attachment.`,
    codeSnippets: [
      {
        language: 'java',
        caption: 'Java: TestListener with TakesScreenshot & Allure Attachment',
        code: `package com.intelligentqa.listeners;

import com.intelligentqa.factory.DriverManager;
import io.qameta.allure.Attachment;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.testng.ITestListener;
import org.testng.ITestResult;

public class TestListener implements ITestListener {

    @Override
    public void onTestFailure(ITestResult result) {
        WebDriver driver = DriverManager.getDriver();
        if (driver != null) {
            saveScreenshotToReport(driver);
        }
        System.err.println("Test Failed: " + result.getMethod().getMethodName());
    }

    @Attachment(value = "Failure Screenshot", type = "image/png")
    public byte[] saveScreenshotToReport(WebDriver driver) {
        return ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
    }
}`,
      },
      {
        language: 'xml',
        caption: 'testng.xml: Suite Configuration with Listeners & Parallel Threads',
        code: `<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd" >
<suite name="Enterprise Regression Suite" parallel="methods" thread-count="4">
    <listeners>
        <listener class-name="com.intelligentqa.listeners.TestListener" />
    </listeners>
    <test name="Chrome Regression">
        <parameter name="browser" value="chrome" />
        <packages>
            <package name="com.intelligentqa.tests.*" />
        </packages>
    </test>
</suite>`,
      },
    ],
    bestPractices: [
      'Attach screenshots as raw byte arrays directly to reporting contexts to avoid disk I/O bottlenecks.',
      'Declare listeners globally in testng.xml rather than annotating every individual test class with @Listeners.',
    ],
    antiPatterns: [
      'Writing try-catch blocks with screenshot logic inside test methods.',
      'Taking screenshots on successful tests, filling CI runner disk storage unnecessarily.',
    ],
    interviewTips: 'Explain the difference between ITestListener, IAnnotationTransformer (dynamic retry), and ISuiteListener in TestNG architecture.',
  },

  // ==========================================
  // PLAYWRIGHT GUIDES
  // ==========================================
  {
    id: 'pw-framework-from-scratch',
    trackId: 'playwright',
    title: 'Playwright Framework Architecture & Setup from Scratch',
    category: 'Foundations & Architecture',
    level: 'Beginner',
    summary: 'Why Browser vs BrowserContext vs Page matters for speed and isolation, and how to build a complete TypeScript automation framework from scratch.',
    overview: `Manual testers migrating to Playwright often wonder: "Why does Playwright have Browser, BrowserContext, AND Page instead of just a WebDriver?"

In legacy Selenium, launching a new browser window for every test creates a heavy operating system process that takes 3 to 4 seconds and consumes 300MB+ RAM. If you run 20 tests in parallel, your machine runs out of memory.

Playwright revolutionizes this with a 3-tier hierarchy:
1. Browser: A single Chromium, Firefox, or WebKit process launched once.
2. BrowserContext: A lightweight, in-memory incognito sandbox created in ~5 milliseconds. Each context has its own cookies, localStorage, session cache, and permissions.
3. Page: A single tab within that context.

This architecture enables true parallel test execution with complete data isolation at near-instant speed.`,
    architectureOrMechanism: `Node.js Test Runner <== Bi-directional WebSocket (Chrome DevTools Protocol) ==> Browser Process -> [Context 1 (User A)] + [Context 2 (User B)]. Zero HTTP polling latency.`,
    codeSnippets: [
      {
        language: 'typescript',
        caption: 'playwright.config.ts: Enterprise Configuration Blueprint',
        code: `import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // Run all tests in parallel worker processes
  forbidOnly: !!process.env.CI, // Fail build if test.only was left in code
  retries: process.env.CI ? 2 : 0, // Auto-retry flaky tests in CI
  workers: process.env.CI ? 4 : undefined, // Scale workers based on hardware
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://staging.intelligentqa.io',
    trace: 'on-first-retry', // Capture full DOM snapshots on failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});`,
      },
      {
        language: 'typescript',
        caption: 'TypeScript: First Test with Page Object Model & Web-First Assertions',
        code: `import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication Flow', () => {
  test('User successfully logs in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('qa.architect@intelligentqa.io', 'SecurePass123!');

    // Web-first assertion: auto-waits until element passes condition
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });
});`,
      },
    ],
    bestPractices: [
      'Scaffold using npm init playwright@latest with TypeScript for type safety and auto-completion.',
      'Always use Web-First Assertions (expect(locator).toBeVisible()) which feature built-in auto-retry polling.',
      'Organize your repository into tests/, pages/, fixtures/, and utils/ directories.',
    ],
    antiPatterns: [
      'Using page.waitForTimeout(5000) instead of relying on Playwright built-in auto-waiting.',
      'Launching separate browser.launch() instances inside individual test methods.',
    ],
    interviewTips: 'Explain the difference between Browser, BrowserContext, and Page, and how BrowserContext achieves 10x faster isolation than Selenium WebDriver restarts.',
  },
  {
    id: 'pw-browser-context',
    trackId: 'playwright',
    title: 'Browser Context Architecture in Playwright',
    category: 'Architecture & Engine',
    level: 'Beginner',
    summary: 'Understand how Playwright uses lightweight browser contexts to achieve instant isolation and blazing-fast parallel execution.',
    overview: `Unlike Selenium where every test must launch a heavy operating system browser process (taking 2-4 seconds per test), Playwright launches a single Browser instance once and creates isolated BrowserContexts for each test.

A BrowserContext operates like an incognito browser window: it has completely separate cookies, localStorage, session storage, and cache, isolated from other contexts at negligible RAM cost (< 20ms startup).`,
    architectureOrMechanism: `Browser (Process) -> BrowserContext (Isolated Sandbox) -> Page (Tab). Tests run independently and concurrently in isolated contexts without interfering with each other.`,
    codeSnippets: [
      {
        language: 'typescript',
        caption: 'TypeScript: Multi-User Context Testing in Single Test',
        code: `import { test, expect } from '@playwright/test';

test('Real-time chat between Buyer and Seller', async ({ browser }) => {
  // Create isolated context for Buyer
  const buyerContext = await browser.newContext();
  const buyerPage = await buyerContext.newPage();
  await buyerPage.goto('https://market.com/login');
  // Login buyer...

  // Create isolated context for Seller (separate cookies & session)
  const sellerContext = await browser.newContext();
  const sellerPage = await sellerContext.newPage();
  await sellerPage.goto('https://market.com/login');
  // Login seller...

  // Buyer sends message
  await buyerPage.fill('#chat-input', 'Is this item available?');
  await buyerPage.click('#send-btn');

  // Seller receives message instantly
  await expect(sellerPage.locator('.chat-bubble')).toContainText('Is this item available?');

  await buyerContext.close();
  await sellerContext.close();
});`,
      },
    ],
    bestPractices: [
      'Rely on standard { page } fixture which automatically creates and disposes of a fresh context per test.',
      'Use browser.newContext() explicitly when testing multi-role or multi-persona workflows (e.g. Admin approving User request).',
    ],
    antiPatterns: [
      'Reusing the same browser context across multiple tests without clearing state.',
      'Launching multiple browser.launch() processes inside tests instead of using contexts.',
    ],
    interviewTips: 'Explain the hierarchy: Browser -> BrowserContext -> Page, and emphasize the memory and speed advantages over opening multiple WebDriver instances.',
  },
  {
    id: 'pw-fixtures-hierarchy',
    trackId: 'playwright',
    title: 'Test Fixtures vs Worker Fixtures vs Custom Fixtures',
    category: 'Fixtures & DI',
    level: 'Advanced',
    summary: 'Master Playwright’s dependency injection system, fixture scoping, and custom composable test environments.',
    overview: `Playwright’s fixture system is inspired by Pytest and acts as an advanced dependency injection (DI) engine. Fixtures provide setup and teardown for tests in a modular, reusable fashion.

Fixtures have two primary scopes:
1. Test Scope (default): Initialized before each test and torn down after each test.
2. Worker Scope: Initialized once when a worker thread spins up, shared across all tests running on that worker, and torn down when the worker terminates (e.g. database connections).`,
    architectureOrMechanism: `Playwright determines fixture execution order via topological dependency sorting. If a fixture depends on another fixture, Playwright resolves the tree automatically.`,
    codeSnippets: [
      {
        language: 'typescript',
        caption: 'TypeScript: Custom Authenticated User Fixture',
        code: `import { test as base, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';

// Declare custom fixture types
type CustomFixtures = {
  authenticatedPage: DashboardPage;
  testOrderId: string;
};

export const test = base.extend<CustomFixtures>({
  // Test-scoped fixture
  authenticatedPage: async ({ page }, use) => {
    // Setup: Navigate and inject login credentials
    await page.goto('/login');
    await page.fill('#email', 'sdet@company.com');
    await page.fill('#password', 'SecretPass123!');
    await page.click('#submit');
    const dashboard = new DashboardPage(page);

    // Pass control to test
    await use(dashboard);

    // Teardown: Clean up user session
    await page.evaluate(() => localStorage.clear());
  },

  testOrderId: async ({}, use) => {
    const id = \`ORD-\${Date.now()}\`;
    await use(id);
  },
});`,
      },
    ],
    bestPractices: [
      'Use custom fixtures instead of bloated beforeEach and afterEach hooks for composable setup.',
      'Place expensive database connections and API tokens in worker-scoped fixtures.',
    ],
    antiPatterns: [
      'Storing mutable global state in test-scoped fixtures.',
      'Putting long teardown logic in afterEach when a fixture yield / use cleanly handles cleanup.',
    ],
    interviewTips: 'Interviewers love to ask: "Why choose custom fixtures over beforeEach hooks?" Mention encapsulation, automatic teardown, lazy evaluation, and parallel safety.',
  },
  {
    id: 'pw-api-mocking',
    trackId: 'playwright',
    title: 'API Mocking & Network Interception with page.route()',
    category: 'Network & API Mocking',
    level: 'Intermediate',
    summary: 'Intercept HTTP requests, mock backend responses, and simulate network failures without touching server code.',
    overview: `End-to-end tests frequently break when backend third-party APIs (Stripe payments, SMS OTP, external credit bureaus) are slow or offline.

Playwright’s page.route() allows intercepting outgoing HTTP network traffic and returning mock JSON fixtures, modifying request headers, or simulating HTTP 500 errors and network aborts instantly.`,
    architectureOrMechanism: `Playwright hooks directly into the browser CDP network layer. When the browser initiates fetch() or XMLHttpRequest, Playwright routes the request before it leaves the browser client.`,
    codeSnippets: [
      {
        language: 'typescript',
        caption: 'TypeScript: Mocking API Responses & Error Simulation',
        code: `import { test, expect } from '@playwright/test';

test('Simulate 500 Internal Server Error and verify alert', async ({ page }) => {
  // Intercept GET /api/v1/orders and return mock error
  await page.route('**/api/v1/orders', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Service Unavailable' }),
    });
  });

  await page.goto('/orders');
  await expect(page.locator('.error-banner')).toBeVisible();
  await expect(page.locator('.error-banner')).toContainText('Service Unavailable');
});

test('Mock third-party payment gateway response', async ({ page }) => {
  await page.route('https://api.stripe.com/v1/charges', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ status: 'succeeded', chargeId: 'ch_mock_12345' }),
    });
  });

  await page.goto('/checkout');
  await page.click('#pay-now');
  await expect(page.locator('.order-success')).toBeVisible();
});`,
      },
    ],
    bestPractices: [
      'Always register page.route() before navigating with page.goto().',
      'Use route.continue() if you only need to modify request headers or log payloads.',
    ],
    antiPatterns: [
      'Hardcoding reliance on flaky external sandbox APIs for payment processing.',
      'Forgetting wildcard patterns like **/api/* resulting in unmatched routes.',
    ],
    interviewTips: 'Explain how network mocking allows testing edge-case errors (e.g. HTTP 429 Rate Limited, 502 Bad Gateway) that are impossible to reliably trigger in live staging.',
  },
  {
    id: 'pw-storagestate-auth',
    trackId: 'playwright',
    title: 'Authentication Reuse with storageState & Global Setup',
    category: 'State Management & Performance',
    level: 'Intermediate',
    summary: 'Eliminate repetitive UI logins across 100+ tests by authenticating once and caching session tokens/cookies with storageState.',
    overview: `Manual testers and junior automation engineers often write login steps into every single test: visit login page, enter email, enter password, submit, and wait for 2FA.
In an enterprise suite of 250 tests, logging in 250 times wastes 35+ minutes of pipeline run time and frequently triggers account lockout or rate-limiting in test environments.

Playwright's storageState feature completely eliminates this overhead:
1. A setup project runs once before all tests, performs the UI login, and captures browser cookies and localStorage into a JSON file (\`playwright/.auth/user.json\`).
2. Subsequent tests inject this storageState file directly into their BrowserContext in 2ms, launching the page already authenticated.`,
    architectureOrMechanism: `Setup Project (Logs in via UI) ===> writes auth/user.json ===> Test Projects inject storageState: 'playwright/.auth/user.json' ===> Tests navigate directly to protected pages.`,
    codeSnippets: [
      {
        language: 'typescript',
        caption: 'auth.setup.ts: Global Authentication Script',
        code: `import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate user once', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(process.env.TEST_USER_EMAIL || 'sdet@intelligentqa.io');
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD || 'Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for login redirect to complete
  await expect(page).toHaveURL(/.*dashboard/);

  // Save session cookies & localStorage to disk
  await page.context().storageState({ path: authFile });
});`,
      },
      {
        language: 'typescript',
        caption: 'playwright.config.ts: Setup Dependency Configuration',
        code: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // Setup project runs first
    {
      name: 'setup',
      testMatch: /.*\\.setup\\.ts/,
    },
    // Main test project depends on setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json', // Reuses saved auth state
      },
      dependencies: ['setup'],
    },
  ],
});`,
      },
    ],
    bestPractices: [
      'Store saved session files in playwright/.auth/ and add that directory to .gitignore.',
      'Create separate setup files for different user roles (e.g., admin.setup.ts, buyer.setup.ts).',
      'Use API login requests in setup where possible to speed up authentication even further.',
    ],
    antiPatterns: [
      'Logging in via UI in a beforeEach hook for every test method.',
      'Checking hardcoded credentials into source control.',
    ],
    interviewTips: 'Explain how storageState works under the hood (persisting cookies and localStorage) and how project dependencies enforce execution order.',
  },
  {
    id: 'pw-sharding-cicd',
    trackId: 'playwright',
    title: 'Enterprise Test Sharding & GitHub Actions CI/CD Pipeline',
    category: 'Enterprise CI/CD & Scaling',
    level: 'Advanced',
    summary: 'Distribute 1,000+ tests across parallel cloud runners using Playwright --shard and merge blob reports into a single unified dashboard.',
    overview: `When an automation test suite grows beyond 500 tests, running them on a single CI machine takes 40+ minutes, delaying development feedback loops.

Playwright provides native test sharding: by passing \`--shard=x/y\`, Playwright slices the test suite into equal parts across independent CI runners. For instance, with 4 shards, each runner executes 25% of the suite simultaneously, slashing total pipeline duration from 40 minutes to under 10 minutes.

Each shard produces a binary \`blob-report\`. A final CI job downloads all blob reports and merges them into a single comprehensive HTML report with traces and video recordings.`,
    architectureOrMechanism: `GitHub Actions Matrix [Runner 1/4, 2/4, 3/4, 4/4] ===> blob reports uploaded as artifacts ===> Merge Job executes 'npx playwright merge-reports' ===> Unified HTML Report published to GitHub Pages.`,
    codeSnippets: [
      {
        language: 'yaml',
        caption: '.github/workflows/playwright.yml: Matrix Sharding Pipeline',
        code: `name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Run Sharded Tests
        run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: blob-report-\${{ matrix.shardIndex }}
          path: blob-report/
          retention-days: 1

  merge-reports:
    if: always()
    needs: [test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true
      - name: Merge Blob Reports
        run: npx playwright merge-reports --reporter html ./all-blob-reports
      - uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/`,
      },
    ],
    bestPractices: [
      'Set fail-fast: false in CI matrix so all shards run even if one encounters a test failure.',
      'Always merge blob reports into a single consolidated HTML report for dev team inspection.',
      'Shard only when test suites take longer than 15 minutes locally or on a single agent.',
    ],
    antiPatterns: [
      'Creating 20+ shards on small test suites (CI VM boot time will exceed actual test run time).',
      'Discarding blob reports on failure, losing trace artifacts needed for root cause analysis.',
    ],
    interviewTips: 'Explain the difference between worker parallelization (threads on one machine) and test sharding (distributing across multiple separate CI machines).',
  },

  // ==========================================
  // REST ASSURED & API GUIDES
  // ==========================================
  {
    id: 'api-framework-from-scratch',
    trackId: 'api-testing',
    title: 'REST Assured Enterprise Framework Architecture from Scratch',
    category: 'Foundations & Architecture',
    level: 'Beginner',
    summary: 'Transition from manual Postman clicking to code: complete Maven pom.xml, Given-When-Then BDD syntax, and enterprise directory structure.',
    overview: `Manual testers often rely on Postman GUI to test APIs by manually clicking "Send", verifying JSON tabs, and copying tokens. While Postman is great for exploratory testing, it struggles with enterprise CI/CD automation:
- Postman collections are stored as bulky JSON files that cause painful Git merge conflicts.
- Automating complex database verification, message queues (Kafka), or multi-step business logic requires cumbersome JavaScript workarounds.
- Postman runs sequentially in Newman, while code frameworks run hundreds of tests concurrently.

REST Assured brings API automation into Java/Kotlin using clean Given-When-Then BDD syntax. It integrates seamlessly with TestNG for parallel execution, Jackson for typed POJO mapping, and Allure for enterprise reporting.`,
    architectureOrMechanism: `given() [Headers, Auth, QueryParams, Body] .when() [GET/POST/PUT/DELETE HTTP Request] .then() [Status Code, JSONPath Assertions, Response Time].`,
    codeSnippets: [
      {
        language: 'xml',
        caption: 'pom.xml: Maven Dependencies for REST Assured + Jackson + TestNG',
        code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.intelligentqa</groupId>
    <artifactId>rest-assured-framework</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <rest-assured.version>5.4.0</rest-assured.version>
        <testng.version>7.9.0</testng.version>
        <jackson.version>2.17.0</jackson.version>
        <allure.version>2.27.0</allure.version>
    </properties>

    <dependencies>
        <!-- REST Assured Core -->
        <dependency>
            <groupId>io.rest-assured</groupId>
            <artifactId>rest-assured</artifactId>
            <version>\${rest-assured.version}</version>
            <scope>test</scope>
        </dependency>

        <!-- Jackson Databind for POJO Serialization -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>\${jackson.version}</version>
        </dependency>

        <!-- TestNG Test Runner -->
        <dependency>
            <groupId>org.testng</groupId>
            <artifactId>testng</artifactId>
            <version>\${testng.version}</version>
            <scope>test</scope>
        </dependency>

        <!-- JSON Schema Validator -->
        <dependency>
            <groupId>io.rest-assured</groupId>
            <artifactId>json-schema-validator</artifactId>
            <version>\${rest-assured.version}</version>
            <scope>test</scope>
        </dependency>

        <!-- Allure REST Assured Filter -->
        <dependency>
            <groupId>io.qameta.allure</groupId>
            <artifactId>allure-rest-assured</artifactId>
            <version>\${allure.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>`,
      },
      {
        language: 'java',
        caption: 'Java: End-to-End CRUD Test with Given-When-Then BDD Syntax',
        code: `package com.intelligentqa.api.tests;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class UserApiTests {

    @BeforeClass
    public void setup() {
        RestAssured.baseURI = "https://api.intelligentqa.io";
        RestAssured.basePath = "/api/v1";
    }

    @Test
    public void testCreateAndRetrieveUser() {
        String requestBody = "{\\"name\\": \\"Jane SDET\\", \\"role\\": \\"Architect\\"}";

        // Step 1: POST Create User
        int userId = given()
            .contentType(ContentType.JSON)
            .body(requestBody)
        .when()
            .post("/users")
        .then()
            .statusCode(201)
            .body("name", equalTo("Jane SDET"))
            .extract()
            .path("id");

        // Step 2: GET Retrieve Created User
        given()
            .pathParam("id", userId)
        .when()
            .get("/users/{id}")
        .then()
            .statusCode(200)
            .body("id", equalTo(userId))
            .body("role", equalTo("Architect"))
            .time(lessThan(2000L)); // Performance SLA verification
    }
}`,
      },
    ],
    bestPractices: [
      'Structure the framework cleanly: client/, models/, config/, and tests/ packages.',
      'Always assert HTTP status codes first before parsing JSON response bodies.',
      'Add response time assertions (e.g. time(lessThan(2000L))) to enforce API SLAs.',
    ],
    antiPatterns: [
      'Hardcoding API base URLs inside individual test methods instead of a central configuration file.',
      'Relying on manual Postman runs for pull-request regression gates.',
    ],
    interviewTips: 'Explain the Given-When-Then BDD DSL in REST Assured and why compiling tests in Maven/Gradle is superior to Newman runner scripts.',
  },
  {
    id: 'api-req-res-spec',
    trackId: 'api-testing',
    title: 'RequestSpecification & ResponseSpecification Architecture',
    category: 'Architecture & DRY',
    level: 'Intermediate',
    summary: 'Build clean, reusable API automation suites using specifications to eliminate boilerplate header and auth configuration.',
    overview: `In large-scale API test suites with 500+ endpoints, repeating base URLs, Bearer tokens, Content-Type headers, and status code assertions in every test method creates thousands of lines of duplicate code.

Rest Assured’s RequestSpecBuilder and ResponseSpecBuilder consolidate shared HTTP configurations into reusable templates that can be applied to entire test classes or suites.`,
    architectureOrMechanism: `RequestSpecification defines common precondition headers, query params, and base paths. ResponseSpecification predefines standard assertions like HTTP 200 and Content-Type: application/json.`,
    codeSnippets: [
      {
        language: 'java',
        caption: 'Java: Rest Assured SpecBuilder Architecture',
        code: `public class ApiBaseTest {
    protected static RequestSpecification reqSpec;
    protected static ResponseSpecification resSpec;

    @BeforeClass
    public static void setupSpecs() {
        reqSpec = new RequestSpecBuilder()
            .setBaseUri("https://api.company.com")
            .setBasePath("/api/v2")
            .addHeader("Authorization", "Bearer " + getAuthToken())
            .setContentType(ContentType.JSON)
            .addFilter(new RequestLoggingFilter())
            .addFilter(new ResponseLoggingFilter())
            .build();

        resSpec = new ResponseSpecBuilder()
            .expectContentType(ContentType.JSON)
            .expectResponseTime(lessThan(3000L))
            .build();
    }
}

// Clean concise test implementation
public class UserApiTests extends ApiBaseTest {
    @Test
    public void testGetUserProfile() {
        given()
            .spec(reqSpec)
            .pathParam("userId", "1024")
        .when()
            .get("/users/{userId}")
        .then()
            .spec(resSpec)
            .statusCode(200)
            .body("username", equalTo("sdet_pro"));
    }
}`,
      },
    ],
    bestPractices: [
      'Combine RequestSpecBuilder with custom logging filters to automatically log failing requests in CI artifacts.',
      'Keep environment URLs in configuration files (.properties / .yaml) instead of hardcoding in specs.',
    ],
    antiPatterns: [
      'Copy-pasting given().header("Auth", token).contentType("application/json") in every single @Test method.',
    ],
    interviewTips: 'Explain how ResponseSpecBuilder enforces uniform SLAs across microservices, such as guaranteeing all API responses complete under 2000ms.',
  },
  {
    id: 'api-json-schema',
    trackId: 'api-testing',
    title: 'JSON Schema Validation & Contract Testing',
    category: 'Contract Validation',
    level: 'Intermediate',
    summary: 'Verify API response payloads against strict JSON schema definitions to catch breaking contract regressions before clients fail.',
    overview: `Validating specific fields (like body("id", equalTo(1))) only checks values, not contract integrity. If a backend developer changes a field from an Integer to a String or removes a required array, simple field assertions might pass while client apps crash.

JSON Schema Validation checks the entire response payload against a predefined Draft v7/v12 JSON Schema definition, validating field types, mandatory properties, and allowed values in one assertion.`,
    architectureOrMechanism: `Rest Assured uses JsonSchemaValidator to parse the JSON response and validate it against schema definition files stored in src/test/resources/schemas/.`,
    codeSnippets: [
      {
        language: 'java',
        caption: 'Java: Rest Assured matchesJsonSchemaInClasspath',
        code: `import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

@Test
public void verifyUserPayloadContract() {
    given()
        .spec(reqSpec)
    .when()
        .get("/users/42")
    .then()
        .statusCode(200)
        // Validates entire structure against src/test/resources/schemas/user-schema.json
        .body(matchesJsonSchemaInClasspath("schemas/user-schema.json"));
}`,
      },
      {
        language: 'json',
        caption: 'JSON Schema Definition (user-schema.json)',
        code: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "username", "email", "roles"],
  "properties": {
    "id": { "type": "integer" },
    "username": { "type": "string", "minLength": 3 },
    "email": { "type": "string", "format": "email" },
    "roles": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}`,
      },
    ],
    bestPractices: [
      'Store schema files in src/test/resources/schemas/ and version-control them alongside test code.',
      'Validate schema on every GET list and detail endpoint as a first-line regression barrier.',
    ],
    antiPatterns: [
      'Writing 40 individual body() assertions to test data types instead of using JSON Schema.',
    ],
    interviewTips: 'Emphasize that JSON Schema validation is true contract testing that catches subtle breaking API changes before mobile or web frontend teams are impacted.',
  },
  {
    id: 'api-pojo-jackson',
    trackId: 'api-testing',
    title: 'POJO Serialization & Deserialization with Jackson & Java Records',
    category: 'Payload & Data Modeling',
    level: 'Intermediate',
    summary: 'Replace brittle JSON string concatenation with type-safe Jackson POJOs and Java Records for resilient API automation.',
    overview: `Manual testers starting automation often build JSON payloads using raw String concatenation:
\`String payload = "{\\"username\\": \\"" + user + "\\", \\"age\\": " + age + "}";\`

This creates fragile syntax errors (escaped quotes, missing commas), offers zero IDE auto-completion or compile-time safety, and becomes impossible to maintain when payload schemas evolve.

Jackson Object Mapper automates this completely:
1. Serialization: Converts Java objects (POJOs or Java Records) into JSON strings sent in HTTP request bodies.
2. Deserialization: Parses HTTP JSON response bodies directly into strongly typed Java objects, allowing getters like \`response.getOrderId()\` with full type safety.`,
    architectureOrMechanism: `Java Object (POJO / Record) === Jackson Serializer ===> HTTP Request Body (JSON String) === Network ===> HTTP Response (JSON String) === Jackson Deserializer ===> Java Object.`,
    codeSnippets: [
      {
        language: 'java',
        caption: 'Java: Immutable Request Model with Jackson Annotations',
        code: `package com.intelligentqa.api.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateUserRequest {

    @JsonProperty("name")
    private String name;

    @JsonProperty("job")
    private String job;

    public CreateUserRequest() {}

    public CreateUserRequest(String name, String job) {
        this.name = name;
        this.job = job;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getJob() { return job; }
    public void setJob(String job) { this.job = job; }
}`,
      },
      {
        language: 'java',
        caption: 'Java: Type-Safe Test with Serialization & Deserialization',
        code: `package com.intelligentqa.api.tests;

import com.intelligentqa.api.models.CreateUserRequest;
import com.intelligentqa.api.models.CreateUserResponse;
import io.restassured.http.ContentType;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class UserPojoTests {

    @Test
    public void testCreateUserWithPojo() {
        CreateUserRequest requestBody = new CreateUserRequest("Sarah SDET", "Automation Architect");

        CreateUserResponse response = given()
            .baseUri("https://api.intelligentqa.io")
            .contentType(ContentType.JSON)
            .body(requestBody) // Jackson automatically serializes object to JSON
        .when()
            .post("/api/v1/users")
        .then()
            .statusCode(201)
            .extract()
            .as(CreateUserResponse.class); // Deserializes JSON into Java object

        Assert.assertNotNull(response.getId(), "User ID must not be null");
        Assert.assertEquals(response.getName(), "Sarah SDET");
        Assert.assertEquals(response.getJob(), "Automation Architect");
    }
}`,
      },
    ],
    bestPractices: [
      'Always add @JsonIgnoreProperties(ignoreUnknown = true) to prevent test breakage when new optional fields are added to backend APIs.',
      'Use Lombok (@Getter, @Builder, @Jacksonized) or Java Records to eliminate boilerplate getters and constructors.',
      'Store models in a dedicated com.intelligentqa.api.models package for team reusability.',
    ],
    antiPatterns: [
      'Using manual string concatenation to construct JSON payloads.',
      'Relying on fragile HashMap<String, Object> structures that lack compile-time field validation.',
    ],
    interviewTips: 'Explain the difference between Jackson ObjectMapper serialization and deserialization, and why @JsonIgnoreProperties is crucial for API backward compatibility.',
  },
  {
    id: 'api-allure-cicd',
    trackId: 'api-testing',
    title: 'Allure Reporting & TestNG Listeners for REST Assured CI/CD',
    category: 'Enterprise Observability & CI/CD',
    level: 'Advanced',
    summary: 'Intercept every HTTP request/response with AllureRestAssured filter to capture full payloads and headers in CI/CD test reports.',
    overview: `When an API test fails in an unattended CI/CD pipeline (e.g. Jenkins, GitHub Actions) with a generic error like:
\`java.lang.AssertionError: 1 expectation failed. Expected status code <200> but was <500>.\`
Without seeing the exact HTTP request URL, query parameters, authorization headers, and backend response body, engineers waste hours trying to reproduce the failure.

The \`AllureRestAssured\` filter acts as an automated network interceptor. It records:
- Complete HTTP Method and URL
- Request Headers and Request Body (formatted JSON)
- Response Headers, Status Code, and Response Body
- Curl command to reproduce the issue in one click.`,
    architectureOrMechanism: `Rest Assured Request ===> AllureRestAssured Filter intercepts ===> Attaches Request & Response to Allure Lifecycle ===> mvn clean test generates allure-results ===> Allure CLI renders interactive HTML report.`,
    codeSnippets: [
      {
        language: 'java',
        caption: 'Java: BaseApiTest with Automatic Allure Network Logging',
        code: `package com.intelligentqa.api.base;

import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import org.testng.annotations.BeforeSuite;

public abstract class BaseApiTest {
    protected static RequestSpecification reqSpec;

    @BeforeSuite(alwaysRun = true)
    public void setupAllureLogging() {
        reqSpec = new RequestSpecBuilder()
            .setBaseUri(System.getProperty("base.url", "https://api.intelligentqa.io"))
            .setContentType(ContentType.JSON)
            // Automatically attaches request & response details to Allure report
            .addFilter(new AllureRestAssured())
            .build();

        RestAssured.requestSpecification = reqSpec;
    }
}`,
      },
      {
        language: 'yaml',
        caption: '.github/workflows/api-tests.yml: CI/CD Execution & Allure Report Hosting',
        code: `name: API Automation Regression
on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'maven'
      - name: Run REST Assured Regression
        run: mvn clean test -DsuiteXmlFile=testng-api.xml
      - name: Generate Allure Report
        if: always()
        run: |
          mvn allure:report
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: allure-api-report
          path: target/site/allure-maven-plugin/`,
      },
    ],
    bestPractices: [
      'Register AllureRestAssured filter globally in a BaseApiTest class so all test classes inherit logging automatically.',
      'Pass environment variables via Maven flags: mvn test -Denv=staging -Dbase.url=https://stage-api.company.com.',
      'Configure testng.xml with parallel="methods" and thread-count="5" for fast multi-threaded API execution.',
    ],
    antiPatterns: [
      'Manually adding System.out.println() for request and response bodies in test methods.',
      'Discarding report artifacts when builds fail in CI/CD.',
    ],
    interviewTips: 'Explain how TestNG Listeners and REST Assured Filters work together to give 100% transparency into HTTP transactions during unattended CI/CD test runs.',
  },

  // ==========================================
  // AI FOR QA GUIDES
  // ==========================================
  {
    id: 'ai-prompt-engineering',
    trackId: 'ai-qa',
    title: 'Prompt Engineering for Test Scenario Generation',
    category: 'LLM & Prompts',
    level: 'Beginner',
    summary: 'Craft structured, deterministic prompts with JSON schemas to generate exhaustive positive, negative, and edge-case test suites.',
    overview: `Generative AI tools (Gemini, Claude, GPT-4) can produce thorough QA test scenarios in seconds when guided with structured prompt techniques.

Ad-hoc casual prompts like "write tests for login" produce shallow, repetitive tests. Professional SDET prompt engineering uses Role-Prompting, Few-Shot examples, and Strict JSON Schema enforcement to output production-grade test cases.`,
    architectureOrMechanism: `Prompt Structure: System Context (Persona) -> Business Rules & Requirements -> Few-Shot Output Examples -> Explicit Constraints & Negative Scenarios -> JSON Schema output format.`,
    codeSnippets: [
      {
        language: 'json',
        caption: 'Prompt Template: Few-Shot Test Case Generator',
        code: `{
  "role": "Principal SDET & Test Architect",
  "instruction": "Analyze the following user story and output exhaustive test cases covering Happy Path, Boundary Conditions, Negative Inputs, and Security Edge Cases.",
  "response_format": {
    "type": "json_object",
    "schema": {
      "test_cases": [
        {
          "id": "TC-001",
          "title": "Short descriptive title",
          "type": "Positive | Negative | Boundary | Security",
          "preconditions": "Initial state",
          "steps": ["Step 1", "Step 2"],
          "expected_result": "Exact verifiable outcome",
          "priority": "P0 | P1 | P2"
        }
      ]
    }
  }
}`,
      },
    ],
    bestPractices: [
      'Always enforce a strict JSON output schema to easily feed generated test cases into Jira or test suites.',
      'Explicitly prompt for edge cases: SQL injection characters, boundary lengths, expired tokens, and race conditions.',
    ],
    antiPatterns: [
      'Trusting LLM output without human validation.',
      'Using open-ended prose prompts that require manual reformatting.',
    ],
    interviewTips: 'Discuss how you combine prompt engineering with autonomous validation agents to continuously verify generated requirements against live systems.',
  },
  {
    id: 'ai-self-healing-locators',
    trackId: 'ai-qa',
    title: 'Self-Healing Locator Architecture & AST DOM Recovery',
    category: 'Autonomous Agents & AI',
    level: 'Advanced',
    summary: 'How AI algorithms compute multi-attribute DOM fingerprints to heal broken locators in real-time without failing CI builds.',
    overview: `In agile software development, frontend engineers frequently modify button IDs, CSS classes, or DOM hierarchy during rapid UI redesigns. In traditional automation, a renamed class instantly causes NoSuchElementException or TimeoutError, halting entire CI/CD test runs.

Self-healing test automation resolves this:
1. When a test first succeeds, the healing engine captures a comprehensive multi-attribute fingerprint of the element (tag, text, aria-role, parent hierarchy, bounding box, sibling tags, and data attributes).
2. If the primary locator fails in a future test run, the engine computes a weighted cosine / Jaccard similarity score across all DOM nodes to locate the element with > 85% confidence.
3. The test continues without failure, and the engine logs a pull-request recommendation to update the test script.`,
    architectureOrMechanism: `Locator Fails ===> Extract DOM Tree Snapshot ===> Compute Multi-Attribute Similarity (Tag 20%, Text 30%, Hierarchy 30%, ARIA 20%) ===> Match Best Candidate (Confidence > 85%) ===> Execute Action & Auto-Create PR.`,
    codeSnippets: [
      {
        language: 'typescript',
        caption: 'TypeScript: Self-Healing Element Finder Algorithm',
        code: `export interface ElementFingerprint {
  tag: string;
  text: string;
  ariaRole?: string;
  testId?: string;
  classes: string[];
}

export function computeElementSimilarity(
  baseline: ElementFingerprint,
  candidate: ElementFingerprint
): number {
  let score = 0;

  // 1. Tag match (20 points)
  if (baseline.tag === candidate.tag) score += 0.20;

  // 2. Exact or substring text match (35 points)
  if (baseline.text && candidate.text) {
    if (baseline.text.trim() === candidate.text.trim()) score += 0.35;
    else if (candidate.text.includes(baseline.text)) score += 0.20;
  }

  // 3. Accessibility role match (25 points)
  if (baseline.ariaRole && baseline.ariaRole === candidate.ariaRole) {
    score += 0.25;
  }

  // 4. Shared CSS classes (20 points)
  const sharedClasses = baseline.classes.filter(c => candidate.classes.includes(c));
  if (baseline.classes.length > 0) {
    score += 0.20 * (sharedClasses.length / baseline.classes.length);
  }

  return Math.round(score * 100); // Returns confidence 0-100%
}`,
      },
    ],
    bestPractices: [
      'Prioritize accessible semantic attributes (role, aria-label) over volatile CSS utility classes (Tailwind).',
      'Never silently heal tests without notifying engineers; always flag healed locators for human review in PRs.',
    ],
    antiPatterns: [
      'Relying on brittle absolute XPaths like /html/body/div[2]/div/div[3]/button.',
      'Allowing self-healing to click wrong elements when confidence falls below 80%.',
    ],
    interviewTips: 'Explain the difference between heuristic fallback locators and ML-driven AST semantic healing in modern SDET frameworks.',
  },
  {
    id: 'ai-synthetic-test-data',
    trackId: 'ai-qa',
    title: 'Autonomous Synthetic Test Data Generation & Edge Case Coverage',
    category: 'Test Data Management',
    level: 'Intermediate',
    summary: 'Generate production-realistic, GDPR-compliant synthetic test data with complex relational constraints using LLMs.',
    overview: `Test automation frequently breaks or produces false positives due to corrupted, stale, or shared test data. Using production data backups violates privacy regulations (GDPR, HIPAA, CCPA) and risks data leaks.

AI-driven synthetic data generation creates realistic datasets that adhere to strict relational schemas, edge cases (boundary values, special Unicode characters, extreme date formats), and business validation rules with zero real customer PII.`,
    architectureOrMechanism: `Schema Definition (JSON/SQL) + Constraints ===> LLM Few-Shot Generation with Faker Seeds ===> Relational Constraint Validation ===> In-Memory Test DB Pre-Population.`,
    codeSnippets: [
      {
        language: 'typescript',
        caption: 'TypeScript: Generating Validated Test Personas with LLM & Zod',
        code: `import { z } from 'zod';

export const UserRegistrationSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(3),
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'auditor']),
  creditLimit: z.number().min(100).max(50_000),
  birthDate: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
});

export type UserRegistration = z.infer<typeof UserRegistrationSchema>;

// Mock AI Data Generator function
export function generateSyntheticUser(overrides: Partial<UserRegistration> = {}): UserRegistration {
  const timestamp = Date.now();
  return UserRegistrationSchema.parse({
    id: '550e8400-e29b-41d4-a716-446655440000',
    fullName: 'Jane SDET',
    email: \`test.user.\${timestamp}@intelligentqa.io\`,
    role: 'member',
    creditLimit: 15_000,
    birthDate: '1992-05-18',
    ...overrides,
  });
}`,
      },
    ],
    bestPractices: [
      'Validate synthetic data against runtime schema validators (Zod, Pydantic, or Hibernate Validator).',
      'Generate deterministic unique test emails with timestamps or UUIDs to avoid collision in parallel test runs.',
    ],
    antiPatterns: [
      'Reusing the exact same test account across multiple parallel threads.',
      'Copying unmasked production customer databases into development or staging environments.',
    ],
    interviewTips: 'Discuss the risks of test data pollution in parallel automation suites and how automated data teardown or synthetic generation resolves it.',
  },
];

export const LOCAL_STORAGE_KEY_PREFIX = 'intelligentqa_custom_guides_';
export const STAGED_STORAGE_KEY_PREFIX = 'intelligentqa_staged_guides_';

export function getStagedGuides(trackId?: string): ConceptGuide[] {
  if (typeof window === 'undefined') return [];
  try {
    const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;
    const key = normTrack ? `${STAGED_STORAGE_KEY_PREFIX}${normTrack}` : `${STAGED_STORAGE_KEY_PREFIX}selenium`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStagedGuide(guide: ConceptGuide): ConceptGuide {
  if (typeof window === 'undefined') return guide;
  const normTrack = guide.trackId === 'selenium-java' ? 'selenium' : guide.trackId === 'playwright-ts' ? 'playwright' : guide.trackId;
  const existing = getStagedGuides(normTrack);
  const updated = [guide, ...existing.filter(g => g.id !== guide.id)];
  localStorage.setItem(`${STAGED_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(updated));
  return guide;
}

export function updateStagedGuide(guide: ConceptGuide): ConceptGuide {
  if (typeof window === 'undefined') return guide;
  const normTrack = guide.trackId === 'selenium-java' ? 'selenium' : guide.trackId === 'playwright-ts' ? 'playwright' : guide.trackId;
  const existing = getStagedGuides(normTrack);
  const updated = existing.map(g => (g.id === guide.id ? guide : g));
  localStorage.setItem(`${STAGED_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(updated));
  return guide;
}

export function deleteStagedGuide(id: string, trackId?: string): void {
  if (typeof window === 'undefined') return;
  const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;
  const existing = getStagedGuides(normTrack);
  const updated = existing.filter(g => g.id !== id);
  localStorage.setItem(`${STAGED_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(updated));
}

export function clearStagedGuides(trackId?: string): void {
  if (typeof window === 'undefined') return;
  const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;
  localStorage.removeItem(`${STAGED_STORAGE_KEY_PREFIX}${normTrack}`);
}

// Retrieve any staged guides across all tracks awaiting submission or publish
export function getAllStagedGuidesAcrossTracks(): Array<{ trackId: string; guide: ConceptGuide }> {
  if (typeof window === 'undefined') return [];
  const tracks = ['selenium', 'playwright', 'api-testing', 'ai-qa', 'articles'];
  const results: Array<{ trackId: string; guide: ConceptGuide }> = [];
  for (const tid of tracks) {
    const list = getStagedGuides(tid);
    for (const g of list) {
      results.push({ trackId: tid, guide: g });
    }
  }
  return results;
}

export function confirmAndSubmitStagedGuides(
  trackId?: string,
  guideIds?: string[]
): { count: number; saved: ConceptGuide[] } {
  if (typeof window === 'undefined') return { count: 0, saved: [] };
  const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;
  const staged = getStagedGuides(normTrack);
  if (staged.length === 0) return { count: 0, saved: [] };

  const toConfirm = guideIds ? staged.filter(g => guideIds.includes(g.id)) : staged;
  const remaining = guideIds ? staged.filter(g => !guideIds.includes(g.id)) : [];

  // Save to confirmed list
  const existingConfirmed = getStoredCustomGuides(normTrack);
  const newConfirmed = toConfirm.map(g => ({ ...g, isCustom: true, status: 'approved' as const }));
  const updatedConfirmed = [...newConfirmed, ...existingConfirmed.filter(e => !newConfirmed.some(n => n.id === e.id))];
  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(updatedConfirmed));

  // Update or clear staging
  if (remaining.length > 0) {
    localStorage.setItem(`${STAGED_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(remaining));
  } else {
    localStorage.removeItem(`${STAGED_STORAGE_KEY_PREFIX}${normTrack}`);
  }

  return { count: toConfirm.length, saved: toConfirm };
}

// Submit staged guides for Admin review & approval (with real-time duplicate detection)
export function submitStagedGuidesForApproval(
  trackId?: string,
  guideIds?: string[],
  user?: any
): { count: number; submitted: ConceptGuide[] } {
  if (typeof window === 'undefined') return { count: 0, submitted: [] };
  const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;
  const staged = getStagedGuides(normTrack);
  if (staged.length === 0) return { count: 0, submitted: [] };

  const toSubmit = guideIds ? staged.filter(g => guideIds.includes(g.id)) : staged;
  const remaining = guideIds ? staged.filter(g => !guideIds.includes(g.id)) : [];

  const currentUser = user || QADatabase.getCurrentUser();
  const submittedList: ConceptGuide[] = [];

  for (const guide of toSubmit) {
    const dupReport = checkGuideDuplicate({
      title: guide.title,
      summary: guide.summary,
      overview: guide.overview,
      code: guide.codeSnippets?.[0]?.code,
      category: guide.category,
      trackId: normTrack,
    });

    const enrichedGuide: ConceptGuide = {
      ...guide,
      status: 'pending_admin_approval',
      submittedAt: new Date().toISOString(),
      submittedBy: {
        id: currentUser?.id || 'guest-author',
        name: currentUser?.name || 'Community SDET Contributor',
        email: currentUser?.email || 'contributor@intelligentqa.io',
      },
      duplicateScore: dupReport.similarityScore,
      duplicateStatus: dupReport.status,
      highestMatchTitle: dupReport.highestMatch?.title,
    };

    // Push into Admin Moderation Queue
    QADatabase.submitContentForReview({
      type: 'guide',
      title: guide.title,
      trackOrLanguage: normTrack || 'selenium',
      category: guide.category,
      summary: guide.summary,
      submittedBy: enrichedGuide.submittedBy!,
      contentPayload: {
        ...enrichedGuide,
        duplicateReport: dupReport,
      },
    });

    submittedList.push(enrichedGuide);
  }

  // Update staged guides with status or clear
  if (remaining.length > 0) {
    localStorage.setItem(`${STAGED_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(remaining));
  } else {
    localStorage.removeItem(`${STAGED_STORAGE_KEY_PREFIX}${normTrack}`);
  }

  return { count: submittedList.length, submitted: submittedList };
}

export function getStoredCustomGuides(trackId?: string): ConceptGuide[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = trackId ? `${LOCAL_STORAGE_KEY_PREFIX}${trackId}` : `${LOCAL_STORAGE_KEY_PREFIX}all`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getAllGuides(trackId?: string): ConceptGuide[] {
  const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;
  const defaults = normTrack ? DEFAULT_CONCEPT_GUIDES.filter(g => g.trackId === normTrack) : DEFAULT_CONCEPT_GUIDES;
  const custom = getStoredCustomGuides(normTrack);
  return [...custom, ...defaults];
}

export function saveCustomGuide(guide: ConceptGuide): ConceptGuide {
  if (typeof window === 'undefined') return guide;
  const normTrack = guide.trackId === 'selenium-java' ? 'selenium' : guide.trackId === 'playwright-ts' ? 'playwright' : guide.trackId;
  const existing = getStoredCustomGuides(normTrack);
  const updated = [guide, ...existing.filter(g => g.id !== guide.id)];
  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(updated));
  return guide;
}

export function deleteCustomGuide(id: string, trackId?: string): void {
  if (typeof window === 'undefined') return;
  const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;
  const existing = getStoredCustomGuides(normTrack);
  const updated = existing.filter(g => g.id !== id);
  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(updated));
}

import { downloadOfficeTemplate, extractTextFromOfficeZip, SampleGuideData } from './office-documents';
export { extractTextFromOfficeZip };
function getTrackSampleData(normTrack: string) {
  if (normTrack === 'playwright') {
    return {
      title: 'Auto-Waiting Engine & Actionability Assertions',
      category: 'Core Mechanics & Synchronization',
      level: 'Intermediate',
      summary: 'How Playwright eliminates flaky tests through automated actionability state verification before executing user actions.',
      overview: 'Playwright automatically verifies that elements are attached to the DOM, visible, stable (not animating), enabled, and receive pointer events before performing actions like click() or fill(). This eliminates flaky tests without manual wait logic.\n\nUnlike legacy tools that require explicit Thread.sleep or polling loops, Playwright checks the actionability status of target elements continuously until the timeout is reached.',
      architecture: 'Actionability checks run repeatedly within the actionTimeout window (default 30s) until all checks pass simultaneously before firing the browser CDP event.',
      language: 'typescript',
      caption: 'TypeScript: Playwright Auto-Waiting & Expect Assertions',
      code: `import { test, expect } from '@playwright/test';

test('resilient checkout action', async ({ page }) => {
  await page.goto('/checkout');
  // Playwright automatically verifies actionability (visible, stable, enabled)
  await page.locator('#confirm-order-btn').click();
  await expect(page.locator('.order-success-badge')).toBeVisible();
});`,
      bestPractices: [
        'Prefer user-facing locators (getByRole, getByText) over brittle CSS/XPath',
        'Use web-first assertions like await expect(locator).toBeVisible()',
        'Avoid page.waitForTimeout() in automated CI pipelines'
      ],
      antiPatterns: [
        'Using manual page.waitForTimeout(5000) for UI animation delays',
        'Mixing Playwright locators with legacy page.$ query selectors'
      ],
      interviewTips: 'Explain why Playwright does not require explicit sleep or wait statements and how auto-waiting differs from Selenium Implicit Wait.',
    };
  }

  if (normTrack === 'api-testing') {
    return {
      title: 'RequestSpecification & ResponseSpecification Architecture',
      category: 'API Framework Architecture',
      level: 'Advanced',
      summary: 'Centralizing base URIs, OAuth authentication headers, and response status code validation into reusable specifications.',
      overview: 'Large API test suites often duplicate headers, tokens, and base paths across hundreds of tests. RequestSpecBuilder and ResponseSpecBuilder consolidate configurations into immutable specifications that can be injected across all test endpoints.\n\nThis enforces contract consistency and enables seamless switching between staging, QA, and production environments.',
      architecture: 'Specifications decouple environment configuration from test assertions, allowing global filter logging and environment switching.',
      language: 'java',
      caption: 'Java: RequestSpecification & Logging Filters with REST Assured',
      code: `RequestSpecification baseReq = new RequestSpecBuilder()
    .setBaseUri("https://api.enterprise.com/v2")
    .addHeader("Authorization", "Bearer " + authToken)
    .setContentType(ContentType.JSON)
    .build();

ResponseSpecification baseRes = new ResponseSpecBuilder()
    .expectStatusCode(200)
    .expectContentType(ContentType.JSON)
    .build();

given().spec(baseReq).when().get("/users").then().spec(baseRes);`,
      bestPractices: [
        'Build specifications once in a BaseApiTest class and reuse across tests',
        'Attach RequestLoggingFilter and ResponseLoggingFilter for CI diagnostic traces',
        'Use POJOs for serialization instead of raw string JSON bodies'
      ],
      antiPatterns: [
        'Hardcoding authorization headers or URLs inside individual @Test methods',
        'Asserting HTTP status codes manually with if-statements instead of then().statusCode()'
      ],
      interviewTips: 'Explain how Specifications decouple environment configuration from test assertions and how filters intercept HTTP traffic for logging.',
    };
  }

  if (normTrack === 'ai-qa') {
    return {
      title: 'Self-Healing Test Automation with LLM DOM Embeddings',
      category: 'Autonomous QA Agents',
      level: 'Advanced',
      summary: 'Using vector embeddings to resolve broken locators when UI designs change dynamically.',
      overview: 'When an element ID or class name changes in a release, self-healing agents compute semantic similarity between the old DOM node attributes and new candidate elements to continue execution without test suite failures.\n\nThe agent captures historical attribute snapshots and uses cosine similarity to identify the closest match.',
      architecture: 'Vector embeddings compare tag, text, and accessibility role against historical baseline snapshots with confidence score thresholds (>0.85).',
      language: 'python',
      caption: 'Python: Self-Healing Element Resolution Workflow',
      code: `def self_heal_locator(driver, failed_locator, dom_snapshot):
    candidate = agent.find_semantic_match(failed_locator, dom_snapshot)
    if candidate.confidence > 0.88:
        driver.find_element(By.XPATH, candidate.xpath).click()`,
      bestPractices: [
        'Set high confidence score thresholds (e.g., >0.85) to prevent clicking wrong elements',
        'Log all self-healing mutations to a dashboard so developers can update baseline locators',
        'Keep self-healing enabled on regression suites but disabled on strict unit tests'
      ],
      antiPatterns: [
        'Silently self-healing without notifying the test reporter or team',
        'Relying on self-healing as an excuse for writing brittle locators'
      ],
      interviewTips: 'Discuss latency trade-offs and confidence thresholds in self-healing engines compared to strict assertions.',
    };
  }

  if (normTrack === 'articles' || normTrack === 'tutorials-articles') {
    return {
      title: 'Enterprise Test Automation Architecture & CI/CD Pipeline Design',
      category: 'Tutorials & Articles',
      level: 'Advanced',
      summary: 'Design patterns and strategies for architecting scalable, parallelized test automation frameworks across distributed CI/CD environments.',
      overview: 'Modern test automation frameworks require clean separation of concerns: test runners, configuration managers, page abstractions, assertion engines, and reporting listeners.\n\nIn this technical article, we explore how to build resilient pipelines that run hundreds of parallel tests without flaky failures or environment collisions.',
      architecture: 'Decoupled multi-layer architecture separating execution logic, test data providers, and reporting adapters.',
      language: 'java',
      caption: 'Technical Architecture & Pipeline Implementation',
      code: `// Enterprise Test Engine Configuration
public class AutomationEngineConfig {
    public static void initializePipeline() {
        System.out.println("Configuring distributed test runners...");
    }
}`,
      bestPractices: [
        'Decouple test configuration from environment execution parameters',
        'Implement parallel-safe WebDriver and HTTP client thread-local factories',
        'Integrate automated retry analyzers only for transient infrastructure network blips'
      ],
      antiPatterns: [
        'Sharing mutable state or browser instances across concurrent test threads',
        'Hardcoding environment URLs and credentials inside test classes'
      ],
      interviewTips: 'Explain the principles of the Test Automation Pyramid and how you design frameworks for high concurrency and CI/CD maintainability.'
    };
  }

  // Default Selenium
  return {
    title: 'Dynamic Synchronization: Explicit vs FluentWait vs Thread.sleep',
    category: 'Synchronization & Waits',
    level: 'Intermediate',
    summary: 'Master dynamic synchronization to eliminate flaky tests, understand polling intervals, and replace brittle sleep calls.',
    overview: 'Synchronization is the #1 cause of flaky automation tests in enterprise CI/CD pipelines.\n\nModern web applications use asynchronous AJAX calls, React state hydration, and animations where elements exist in the DOM but cannot receive click actions yet. Using Thread.sleep() freezes the JVM thread unconditionally, dramatically slowing down suites.\n\nSelenium provides WebDriverWait (Explicit Wait) and FluentWait to poll the DOM dynamically until ExpectedConditions evaluate to true, proceeding instantly without unnecessary delays.',
    architecture: 'WebDriverWait polls the browser every 500ms by default and ignores NoSuchElementException. FluentWait allows custom polling intervals (e.g., 250ms) and custom ignored exception lists (e.g., StaleElementReferenceException).',
    language: 'java',
    caption: 'Java: WebDriverWait & FluentWait Implementation',
    code: `// Enterprise Explicit Wait
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("submit-order")));
submitBtn.click();

// Custom FluentWait with fine-grained polling
Wait<WebDriver> fluentWait = new FluentWait<>(driver)
    .withTimeout(Duration.ofSeconds(15))
    .pollingEvery(Duration.ofMillis(250))
    .ignoring(NoSuchElementException.class)
    .ignoring(StaleElementReferenceException.class);

WebElement status = fluentWait.until(d -> d.findElement(By.id("txn-status")));`,
    bestPractices: [
      'Always favor Explicit Waits over Implicit Waits. Mixing both causes unexpected timeout compounding in Selenium.',
      'Use expected condition elementToBeClickable before click() and visibilityOf for assertions.',
      'Never commit Thread.sleep() in production framework suites.'
    ],
    antiPatterns: [
      'Setting a global implicit wait of 30 seconds and using Thread.sleep(5000) for animations.',
      'Catching TimeoutException silently and continuing test execution without assertion.'
    ],
    interviewTips: 'In interviews, emphasize why mixing Implicit and Explicit waits is undefined behavior in WebDriver specifications, and explain how FluentWait customizes polling intervals.',
  };
}

// Generate Excel Spreadsheet (.xls XML/HTML format) with all Mandatory and Optional fields
export function generateExcelTemplate(trackId: string = 'selenium'): string {
  const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;
  const sample = getTrackSampleData(normTrack);
  const trackName = normTrack === 'selenium' ? 'Selenium (Java)' : normTrack === 'playwright' ? 'Playwright (TS)' : normTrack === 'api-testing' ? 'Rest Assured (API)' : 'AI Academy';

  const bestPracticesStr = sample.bestPractices.join('; ');
  const antiPatternsStr = sample.antiPatterns.join('; ');

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>SDET Concept Guides</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  .guide-header { font-family: Calibri, Arial, sans-serif; font-size: 14pt; font-weight: bold; color: #1e3a8a; }
  .guide-note { font-family: Calibri, Arial, sans-serif; font-size: 10pt; color: #475569; font-style: italic; }
  th.mandatory { background-color: #1e3a8a; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 10px; font-family: Calibri, Arial, sans-serif; font-size: 10.5pt; text-align: left; }
  th.optional { background-color: #334155; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 10px; font-family: Calibri, Arial, sans-serif; font-size: 10.5pt; text-align: left; }
  td { border: 1px solid #cbd5e1; padding: 8px; font-family: Calibri, Arial, sans-serif; font-size: 10pt; vertical-align: top; }
  td.placeholder { color: #64748b; font-style: italic; }
  .code { font-family: Consolas, monospace; background-color: #f8fafc; white-space: pre-wrap; }
</style>
</head>
<body>
<table>
  <tr>
    <td colspan="12" class="guide-header">IntelligentQA - ${trackName} Guide Import Template</td>
  </tr>
  <tr>
    <td colspan="12" class="guide-note">
      Blue headers = [MANDATORY] fields. Gray headers = [OPTIONAL] fields. Filling all fields ensures automatic, seamless Admin approval. Semicolons (;) can be used to separate multiple Best Practices or Anti-Patterns.
    </td>
  </tr>
  <tr><td></td></tr>
  <thead>
    <tr>
      <th class="mandatory" style="width: 220px;">Title [MANDATORY]</th>
      <th class="mandatory" style="width: 160px;">Category [MANDATORY]</th>
      <th class="mandatory" style="width: 110px;">Level [MANDATORY]</th>
      <th class="mandatory" style="width: 260px;">Summary [MANDATORY]</th>
      <th class="mandatory" style="width: 360px;">Overview [MANDATORY]</th>
      <th class="optional" style="width: 260px;">ArchitectureOrMechanism [OPTIONAL]</th>
      <th class="mandatory" style="width: 110px;">CodeLanguage [MANDATORY]</th>
      <th class="optional" style="width: 220px;">CodeCaption [OPTIONAL]</th>
      <th class="mandatory" style="width: 420px;">CodeSnippet [MANDATORY]</th>
      <th class="optional" style="width: 280px;">BestPractices [OPTIONAL]</th>
      <th class="optional" style="width: 280px;">AntiPatterns [OPTIONAL]</th>
      <th class="optional" style="width: 260px;">InterviewTips [OPTIONAL]</th>
    </tr>
  </thead>
  <tbody>
    <!-- Sample Guide 1 with All Mandatory & Optional Fields Populated -->
    <tr>
      <td>${sample.title}</td>
      <td>${sample.category}</td>
      <td>${sample.level}</td>
      <td>${sample.summary}</td>
      <td>${sample.overview.replace(/\n/g, '<br/>')}</td>
      <td>${sample.architecture.replace(/\n/g, '<br/>')}</td>
      <td>${sample.language}</td>
      <td>${sample.caption}</td>
      <td class="code">${sample.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
      <td>${bestPracticesStr}</td>
      <td>${antiPatternsStr}</td>
      <td>${sample.interviewTips}</td>
    </tr>
    <!-- Blank Template Row Ready for User Input -->
    <tr>
      <td class="placeholder">[Enter Guide Title - MANDATORY]</td>
      <td class="placeholder">[Category / Module Group - MANDATORY]</td>
      <td class="placeholder">Beginner | Intermediate | Advanced</td>
      <td class="placeholder">[1-2 sentence concise definition - MANDATORY]</td>
      <td class="placeholder">[Multi-paragraph in-depth technical explanation, tradeoffs, architecture - MANDATORY]</td>
      <td class="placeholder">[Internal engine mechanics, lifecycle, or diagram flow - OPTIONAL]</td>
      <td class="placeholder">${sample.language}</td>
      <td class="placeholder">[Caption for snippet - OPTIONAL]</td>
      <td class="code">// Add runnable code snippet here - MANDATORY</td>
      <td class="placeholder">[Recommendation 1; Recommendation 2 - OPTIONAL]</td>
      <td class="placeholder">[Common pitfall 1; Common mistake 2 - OPTIONAL]</td>
      <td class="placeholder">[Key SDET interview questions &amp; talking points - OPTIONAL]</td>
    </tr>
  </tbody>
</table>
</body>
</html>`;
}

// Generate Word Document (.doc HTML format) with all Mandatory and Optional fields
export function generateWordTemplate(trackId: string = 'selenium'): string {
  const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;
  const sample = getTrackSampleData(normTrack);
  const trackName = normTrack === 'selenium' ? 'Selenium (Java)' : normTrack === 'playwright' ? 'Playwright (TS)' : normTrack === 'api-testing' ? 'Rest Assured (API)' : 'AI Academy';

  return `<html xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>SDET Concept Guides Template - ${trackName}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.5; margin: 30px; }
  h1 { color: #1e3a8a; font-size: 18pt; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; margin-bottom: 6px; }
  .instructions-box { background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 12px; margin-bottom: 24px; font-size: 10pt; color: #166534; }
  h2 { color: #0f172a; font-size: 13pt; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #2563eb; padding-left: 8px; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 28px; }
  th { background-color: #2563eb; color: #ffffff; padding: 8px 10px; font-weight: bold; border: 1px solid #94a3b8; text-align: left; }
  td { border: 1px solid #cbd5e1; padding: 8px 10px; vertical-align: top; }
  td.label-mandatory { background-color: #eff6ff; font-weight: bold; width: 26%; color: #1e3a8a; }
  td.label-optional { background-color: #f8fafc; font-weight: bold; width: 26%; color: #475569; }
  td.val { width: 74%; }
  .badge-mandatory { background-color: #dbeafe; color: #1e40af; font-size: 8.5pt; padding: 2px 5px; border-radius: 3px; font-weight: bold; }
  .badge-optional { background-color: #e2e8f0; color: #475569; font-size: 8.5pt; padding: 2px 5px; border-radius: 3px; font-weight: bold; }
  pre, code { font-family: Consolas, monospace; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 4px; display: block; white-space: pre-wrap; font-size: 9.5pt; color: #0f172a; }
  .bullet-list { margin: 0; padding-left: 18px; }
  .placeholder-text { color: #64748b; font-style: italic; }
</style>
</head>
<body>
  <h1>IntelligentQA - Concept Guides Submission Template (${trackName})</h1>
  <div class="instructions-box">
    <strong>Admin Submission Guidelines:</strong><br/>
    • Use this standardized document to prepare your QA / SDET concept guides before submitting.<br/>
    • <strong>[MANDATORY]</strong> fields must be filled for successful submission and validation.<br/>
    • <strong>[OPTIONAL]</strong> fields enrich the guide (Best Practices, Anti-Patterns, Interview Tips). Filling them allows the Admin to approve the guide directly with 0 manual modifications.<br/>
    • When finished, save this document and upload it via <strong>Import Excel / Word Guides</strong> in IntelligentQA.
  </div>

  <h2>Table 1: Complete Production Sample Guide (All Fields Demonstrated)</h2>
  <table>
    <tr>
      <td class="label-mandatory">Title <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val"><strong>${sample.title}</strong></td>
    </tr>
    <tr>
      <td class="label-mandatory">Category <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val">${sample.category}</td>
    </tr>
    <tr>
      <td class="label-mandatory">Level <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val">${sample.level}</td>
    </tr>
    <tr>
      <td class="label-mandatory">Summary <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val">${sample.summary}</td>
    </tr>
    <tr>
      <td class="label-mandatory">Overview <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val">${sample.overview.replace(/\n/g, '<br/>')}</td>
    </tr>
    <tr>
      <td class="label-optional">Architecture / Mechanism <span class="badge-optional">OPTIONAL</span></td>
      <td class="val">${sample.architecture.replace(/\n/g, '<br/>')}</td>
    </tr>
    <tr>
      <td class="label-mandatory">Code Language <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val">${sample.language}</td>
    </tr>
    <tr>
      <td class="label-optional">Code Snippet Caption <span class="badge-optional">OPTIONAL</span></td>
      <td class="val">${sample.caption}</td>
    </tr>
    <tr>
      <td class="label-mandatory">Code Snippet <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val"><pre>${sample.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></td>
    </tr>
    <tr>
      <td class="label-optional">Best Practices <span class="badge-optional">OPTIONAL</span></td>
      <td class="val">
        <ul class="bullet-list">
          ${sample.bestPractices.map(bp => `<li>${bp}</li>`).join('')}
        </ul>
      </td>
    </tr>
    <tr>
      <td class="label-optional">Anti-Patterns <span class="badge-optional">OPTIONAL</span></td>
      <td class="val">
        <ul class="bullet-list">
          ${sample.antiPatterns.map(ap => `<li>${ap}</li>`).join('')}
        </ul>
      </td>
    </tr>
    <tr>
      <td class="label-optional">Interview Tips <span class="badge-optional">OPTIONAL</span></td>
      <td class="val">${sample.interviewTips}</td>
    </tr>
  </table>

  <h2>Table 2: Blank Guide Template (Fill in Your Concept Details Here)</h2>
  <table>
    <tr>
      <td class="label-mandatory">Title <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val placeholder-text">[Enter the clear, descriptive concept or architecture title]</td>
    </tr>
    <tr>
      <td class="label-mandatory">Category <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val placeholder-text">[e.g., Synchronization, Framework Architecture, POM, API Testing]</td>
    </tr>
    <tr>
      <td class="label-mandatory">Level <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val placeholder-text">Beginner | Intermediate | Advanced</td>
    </tr>
    <tr>
      <td class="label-mandatory">Summary <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val placeholder-text">[Concise 1-2 sentence definition explaining why this concept matters for SDETs]</td>
    </tr>
    <tr>
      <td class="label-mandatory">Overview <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val placeholder-text">[Detailed multi-paragraph explanation, architectural solution, and tradeoffs]</td>
    </tr>
    <tr>
      <td class="label-optional">Architecture / Mechanism <span class="badge-optional">OPTIONAL</span></td>
      <td class="val placeholder-text">[Internal engine mechanics, polling lifecycle, or diagram flow]</td>
    </tr>
    <tr>
      <td class="label-mandatory">Code Language <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val placeholder-text">${sample.language} (or java / typescript / python / csharp)</td>
    </tr>
    <tr>
      <td class="label-optional">Code Snippet Caption <span class="badge-optional">OPTIONAL</span></td>
      <td class="val placeholder-text">[e.g., Primary Implementation Snippet]</td>
    </tr>
    <tr>
      <td class="label-mandatory">Code Snippet <span class="badge-mandatory">MANDATORY</span></td>
      <td class="val"><pre>// Paste your complete, working code snippet here</pre></td>
    </tr>
    <tr>
      <td class="label-optional">Best Practices <span class="badge-optional">OPTIONAL</span></td>
      <td class="val placeholder-text">• Best practice recommendation 1<br/>• Best practice recommendation 2</td>
    </tr>
    <tr>
      <td class="label-optional">Anti-Patterns <span class="badge-optional">OPTIONAL</span></td>
      <td class="val placeholder-text">• Common pitfall or anti-pattern to avoid 1<br/>• Common anti-pattern 2</td>
    </tr>
    <tr>
      <td class="label-optional">Interview Tips <span class="badge-optional">OPTIONAL</span></td>
      <td class="val placeholder-text">[Key talking points, tricky interview questions, and architect-level watchouts]</td>
    </tr>
  </table>
  <p class="placeholder-text"><em>Tip: To add additional guides in this document, simply copy Table 2 above and paste it below.</em></p>
</body>
</html>`;
}

// Generate standardized Concept Guide Import Template (Excel .XLSX, Word .DOCX, JSON, CSV)
export function generateConceptGuideTemplate(
  format: 'xlsx' | 'docx' | 'excel' | 'word' | 'json' | 'csv' = 'xlsx',
  trackId: string = 'selenium'
): string {
  const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;
  const sample = getTrackSampleData(normTrack);

  if (format === 'xlsx' || format === 'excel') {
    return `================================================================================
IntelligentQA Concept Guide Import Template: Excel (.XLSX) Format
Blue Headers = [MANDATORY] | Gray Headers = [OPTIONAL]
================================================================================

[SPREADSHEET COLUMNS]:
1. Title [MANDATORY]
2. Category [MANDATORY]
3. Level [MANDATORY] (Beginner | Intermediate | Advanced)
4. Summary [MANDATORY] (1-2 sentence concise definition)
5. Overview [MANDATORY] (Multi-paragraph architecture & conceptual explanation)
6. ArchitectureOrMechanism [OPTIONAL] (Engine mechanics, polling loop, diagram flow)
7. CodeLanguage [MANDATORY] (${sample.language})
8. CodeCaption [OPTIONAL] (Short label for code snippet)
9. CodeSnippet [MANDATORY] (Complete, runnable implementation)
10. BestPractices [OPTIONAL] (Semicolon-separated recommendations)
11. AntiPatterns [OPTIONAL] (Semicolon-separated pitfalls to avoid)
12. InterviewTips [OPTIONAL] (Senior SDET interview talking points)

--------------------------------------------------------------------------------
[SAMPLE ROW 1 - FULLY POPULATED]:
Title: ${sample.title}
Category: ${sample.category}
Level: ${sample.level}
Summary: ${sample.summary}
Overview: ${sample.overview.replace(/\n/g, ' ')}
Architecture: ${sample.architecture}
Language: ${sample.language}
Caption: ${sample.caption}
Code:
${sample.code}
Best Practices: ${sample.bestPractices.join('; ')}
Anti-Patterns: ${sample.antiPatterns.join('; ')}
Interview Tips: ${sample.interviewTips}

--------------------------------------------------------------------------------
[TEMPLATE ROW 2 - FILL IN YOUR DETAILS]:
Title: [Enter Guide Title - MANDATORY]
Category: [Category / Module Group - MANDATORY]
Level: Beginner | Intermediate | Advanced
Summary: [1-2 sentence concise definition - MANDATORY]
Overview: [Multi-paragraph architectural explanation & tradeoffs - MANDATORY]
Architecture: [Internal engine mechanics or diagram flow - OPTIONAL]
Language: ${sample.language}
Caption: [Caption for snippet - OPTIONAL]
Code: // Paste runnable code snippet here - MANDATORY
Best Practices: [Recommendation 1; Recommendation 2 - OPTIONAL]
Anti-Patterns: [Common pitfall 1; Anti-pattern 2 - OPTIONAL]
Interview Tips: [Key SDET interview talking points & watchouts - OPTIONAL]`;
  }

  if (format === 'docx' || format === 'word') {
    return `================================================================================
IntelligentQA Concept Guide Import Template: Word (.DOCX) Format
================================================================================

[TABLE 1: COMPLETE PRODUCTION SAMPLE GUIDE]
• Title [MANDATORY]: ${sample.title}
• Category [MANDATORY]: ${sample.category}
• Level [MANDATORY]: ${sample.level}
• Summary [MANDATORY]: ${sample.summary}
• Overview [MANDATORY]:
  ${sample.overview}
• Architecture / Mechanism [OPTIONAL]:
  ${sample.architecture}
• Code Language [MANDATORY]: ${sample.language}
• Code Snippet Caption [OPTIONAL]: ${sample.caption}
• Code Snippet [MANDATORY]:
${sample.code}
• Best Practices [OPTIONAL]:
  ${sample.bestPractices.map(b => `• ${b}`).join('\n  ')}
• Anti-Patterns [OPTIONAL]:
  ${sample.antiPatterns.map(a => `• ${a}`).join('\n  ')}
• Interview Tips [OPTIONAL]:
  ${sample.interviewTips}

--------------------------------------------------------------------------------
[TABLE 2: BLANK GUIDE TEMPLATE (READY TO FILL)]
• Title [MANDATORY]: [Enter Guide Title]
• Category [MANDATORY]: [e.g., Synchronization, Framework Architecture, POM, API Testing]
• Level [MANDATORY]: Beginner | Intermediate | Advanced
• Summary [MANDATORY]: [Concise 1-2 sentence definition explaining why this concept matters for SDETs]
• Overview [MANDATORY]: [Detailed multi-paragraph explanation, architectural solution, and tradeoffs]
• Architecture / Mechanism [OPTIONAL]: [Internal engine mechanics, polling lifecycle, or diagram flow]
• Code Language [MANDATORY]: ${sample.language} (or java / typescript / python / csharp)
• Code Snippet Caption [OPTIONAL]: [e.g., Primary Implementation Snippet]
• Code Snippet [MANDATORY]: // Paste your complete, working code snippet here
• Best Practices [OPTIONAL]: • Best practice recommendation 1; • Best practice recommendation 2
• Anti-Patterns [OPTIONAL]: • Common pitfall or anti-pattern to avoid 1; • Common anti-pattern 2
• Interview Tips [OPTIONAL]: [Key talking points, tricky interview questions, and architect-level watchouts]`;
  }

  if (format === 'csv') {
    return `Title,Category,Level,Summary,Overview,CodeSnippetLanguage,CodeSnippetCode,InterviewTips
"StaleElementReferenceException Resilience","Error Handling","Intermediate","Root cause of stale elements and how to implement resilient retry mechanisms.","When the DOM updates in Single Page Applications, previously located elements become detached.","java","public WebElement waitForStale(By locator) { return new WebDriverWait(driver, Duration.ofSeconds(10)).until(ExpectedConditions.refreshed(ExpectedConditions.presenceOfElementLocated(locator))); }","Explain DOM detachment vs visibility in React state updates."
"PageFactory and Lazy Element Initialization","Design Patterns","Beginner","How @FindBy annotations defer driver queries until element access.","PageFactory initializes elements on demand, reducing initialization overhead.","java","@FindBy(id = \\"submit\\") private WebElement submitBtn;","Discuss why modern Selenium 4 prefers By locators over PageFactory for ThreadLocal safety."`;
  }

  const sampleTemplate: Partial<ConceptGuide>[] = [
    {
      title: "Sample Concept Title (Mandatory)",
      trackId: (normTrack as any) || 'selenium',
      category: "Framework Design (Mandatory)",
      level: "Intermediate",
      summary: "Concise 1-2 sentence overview explaining why this concept matters for SDETs.",
      overview: "Detailed multi-paragraph explanation of the concept, pain points in manual/legacy QA, and how modern automation solves it.",
      architectureOrMechanism: "Internal mechanics, lifecycle flow, or diagram explanation.",
      codeSnippets: [
        {
          language: normTrack === 'playwright' ? 'typescript' : 'java',
          caption: "Primary implementation snippet",
          code: normTrack === 'playwright' 
            ? "import { test, expect } from '@playwright/test';\n\ntest('sample concept', async ({ page }) => {\n  await page.goto('/');\n  await expect(page.locator('h1')).toBeVisible();\n});"
            : "public class SampleConcept {\n    public static void execute() {\n        System.out.println(\"Concept executed\");\n    }\n}",
        },
      ],
      bestPractices: [
        "Best practice recommendation 1",
        "Best practice recommendation 2"
      ],
      antiPatterns: [
        "Common mistake / anti-pattern to avoid 1"
      ],
      interviewTips: "Key points to emphasize during senior SDET interview rounds.",
    },
  ];

  return JSON.stringify(sampleTemplate, null, 2);
}

// Download Concept Guide Template as Genuine Binary .xlsx or .docx
export function downloadConceptGuideTemplate(
  format: 'xlsx' | 'docx' | 'excel' | 'word' | 'json' | 'csv' = 'xlsx',
  trackId: string = 'selenium'
): void {
  const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;
  const sample = getTrackSampleData(normTrack);

  const targetFormat: 'xlsx' | 'docx' | 'json' | 'csv' =
    format === 'excel' || format === 'xlsx'
      ? 'xlsx'
      : format === 'word' || format === 'docx'
      ? 'docx'
      : format === 'csv'
      ? 'csv'
      : 'json';

  downloadOfficeTemplate(targetFormat, normTrack, sample);
}

// Parse imported guides from Excel (.xls, table, TSV), Word (.doc, tables), JSON, or CSV
export function parseImportedGuides(
  content: string,
  trackId: string = 'selenium',
  stageOnly: boolean = true,
  singleGuide: boolean = true
): { guides: ConceptGuide[]; error?: string } {
  const normTrack = (trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId) as any;
  const trimmed = content.trim();

  if (!trimmed) {
    return { guides: [], error: 'Import content is empty.' };
  }

  const defaultLang = normTrack === 'playwright' ? 'typescript' : normTrack === 'ai-qa' ? 'python' : 'java';
  const valid: ConceptGuide[] = [];

  // Helper to sanitize extracted cell text
  const cleanText = (str: string) => str.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();

  // Helper to parse semicolon, bullet, or newline separated lists
  const parseList = (val?: string): string[] => {
    if (!val) return [];
    return val
      .split(/[\n;•]+/)
      .map(s => s.trim().replace(/^[-*•]\s*/, ''))
      .filter(s => s && !s.startsWith('[') && !s.startsWith('Recommendation') && !s.startsWith('Common'));
  };

  // 1. Try JSON parsing
  if (trimmed.startsWith('[') || (trimmed.startsWith('{') && trimmed.includes('"title"'))) {
    try {
      const parsed = JSON.parse(trimmed);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.title || typeof item.title !== 'string') continue;
        if (!item.category && !item.summary) continue;

        valid.push({
          id: item.id || `custom-guide-${Date.now()}-${i}`,
          trackId: normTrack,
          title: item.title,
          category: item.category || 'General',
          level: ['Beginner', 'Intermediate', 'Advanced'].includes(item.level) ? item.level : 'Intermediate',
          summary: item.summary || item.title,
          overview: item.overview || item.summary || item.title,
          architectureOrMechanism: item.architectureOrMechanism || '',
          codeSnippets: Array.isArray(item.codeSnippets) && item.codeSnippets.length > 0 ? item.codeSnippets : [
            {
              language: item.language || defaultLang,
              caption: item.caption || `${item.title} Implementation`,
              code: typeof item.code === 'string' ? item.code : typeof item.codeSnippet === 'string' ? item.codeSnippet : '// Add concept implementation here',
            }
          ],
          bestPractices: Array.isArray(item.bestPractices) ? item.bestPractices : parseList(item.bestPractices),
          antiPatterns: Array.isArray(item.antiPatterns) ? item.antiPatterns : parseList(item.antiPatterns),
          interviewTips: item.interviewTips || '',
          isCustom: true,
        });
      }

      if (valid.length > 0) {
        return finalizeImportResult(valid, normTrack, stageOnly, singleGuide);
      }
    } catch {
      // Fall through to other parsers
    }
  }

  // 2. Try HTML / XML Table parsing (Excel .xls or Word .doc tables)
  if (trimmed.includes('<table') || trimmed.includes('<tr')) {
    try {
      // Check for Word Key-Value tables (<td class="label">Title</td><td>...</td>)
      const tableMatches = trimmed.match(/<table[\s\S]*?<\/table>/gi) || [trimmed];

      for (let t = 0; t < tableMatches.length; t++) {
        const tableHtml = tableMatches[t];
        const rowMatches = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];

        // Check if table is Key-Value format (Word style)
        let isKeyValueTable = false;
        const kvMap: Record<string, string> = {};

        for (const row of rowMatches) {
          const cells = (row.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map(cleanText);
          if (cells.length >= 2) {
            const rawKey = cells[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const rawVal = cells.slice(1).join(' ').trim();
            if (['title', 'category', 'level', 'difficulty', 'summary', 'overview', 'explanation', 'architecture', 'mechanism', 'code', 'codelanguage', 'codecaption', 'caption', 'codesnippet', 'bestpractices', 'antipatterns', 'interviewtips'].some(k => rawKey.includes(k))) {
              isKeyValueTable = true;
              kvMap[rawKey] = rawVal;
            }
          }
        }

        const getKvVal = (keyword: string): string => {
          const matchKey = Object.keys(kvMap).find(k => k.includes(keyword));
          return matchKey && kvMap[matchKey] ? kvMap[matchKey].trim() : '';
        };

        const title = getKvVal('title');

        if (isKeyValueTable && title) {
          const category = getKvVal('category') || 'General';
          const levelRaw = getKvVal('level') || getKvVal('difficulty');
          const levelVal = ['Beginner', 'Advanced'].find(l => levelRaw.toLowerCase().includes(l.toLowerCase())) || 'Intermediate';
          const summary = getKvVal('summary') || title;
          const overview = getKvVal('overview') || getKvVal('explanation') || summary;
          const architecture = getKvVal('architecture') || getKvVal('mechanism') || '';
          const codeLang = getKvVal('codelanguage') || getKvVal('language') || defaultLang;
          const caption = getKvVal('codecaption') || getKvVal('caption') || `${title} Implementation`;
          const codeSnippet = getKvVal('codesnippet') || getKvVal('code') || `// Code example for ${title}`;
          const bestPractices = parseList(getKvVal('bestpractice'));
          const antiPatterns = parseList(getKvVal('antipattern'));
          const interviewTips = getKvVal('interview');

          // Filter out placeholders like "[Enter Guide Title]"
          if (!title.includes('[Enter Guide') && !title.includes('[Your New Guide') && !title.includes('[FILL YOUR GUIDE')) {
            valid.push({
              id: `imported-word-${Date.now()}-${valid.length}`,
              trackId: normTrack,
              title,
              category,
              level: levelVal as any,
              summary,
              overview,
              architectureOrMechanism: architecture,
              codeSnippets: [{ language: codeLang, code: codeSnippet, caption }],
              bestPractices,
              antiPatterns,
              interviewTips,
              isCustom: true,
            });
          }
          continue;
        }

        // Standard Excel horizontal row table (th header + tr data rows)
        // ONLY parse rows as individual guides if header explicitly contains Title AND Guide columns
        if (rowMatches.length > 0) {
          let headers: string[] = [];
          for (let r = 0; r < rowMatches.length; r++) {
            const row = rowMatches[r];
            const cells = (row.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map(cleanText);
            if (cells.length === 0) continue;

            const isHeader = r === 0 && (row.includes('<th') || cells[0].toLowerCase().includes('title'));
            if (isHeader) {
              headers = cells.map(c => c.toLowerCase().replace(/[^a-z]/g, ''));
              continue;
            }

            // Only parse if header has explicit guide columns (prevents converting a 13-row data/step/status table into 13 guides)
            const hasGuideHeaders = headers.length > 0 &&
              headers.some(h => h.includes('title')) &&
              headers.some(h => h.includes('category') || h.includes('summary') || h.includes('level') || h.includes('code') || h.includes('snippet') || h.includes('overview'));

            if (!hasGuideHeaders) {
              continue;
            }

            // Map data row with resilient keyword matching
            const getCol = (keyword: string, fallbackIdx: number): string => {
              const idx = headers.findIndex(h => h.includes(keyword));
              return (idx !== -1 && cells[idx] !== undefined ? cells[idx] : cells[fallbackIdx]) || '';
            };

            const title = getCol('title', 0);
            if (!title || title.includes('[Enter Guide') || title.includes('[FILL YOUR GUIDE')) continue;

            const category = getCol('category', 1) || 'General';
            const levelRaw = getCol('level', 2) || 'Intermediate';
            const level = ['Beginner', 'Intermediate', 'Advanced'].includes(levelRaw) ? levelRaw as any : 'Intermediate';
            const summary = getCol('summary', 3) || title;
            const overview = getCol('overview', 4) || summary;
            const architecture = getCol('architecture', 5) || getCol('mechanism', 5) || '';
            const codeLang = getCol('language', 6) || defaultLang;
            const caption = getCol('caption', 7) || `${title} Implementation`;
            const code = getCol('snippet', 8) || getCol('code', 8) || cells[8] || cells[7] || `// Code example for ${title}`;
            const bestPractices = parseList(getCol('bestpractice', 9));
            const antiPatterns = parseList(getCol('antipattern', 10));
            const interviewTips = getCol('interview', 11);

            valid.push({
              id: `imported-excel-${Date.now()}-${valid.length}`,
              trackId: normTrack,
              title,
              category,
              level,
              summary,
              overview,
              architectureOrMechanism: architecture,
              codeSnippets: [{ language: codeLang, code, caption }],
              bestPractices,
              antiPatterns,
              interviewTips,
              isCustom: true,
            });
          }
        }
      }

      if (valid.length > 0) {
        return finalizeImportResult(valid, normTrack, stageOnly, singleGuide);
      }
    } catch {
      // Fall through to next parser
    }
  }

  // 3. Try Tab-Separated Values (TSV) - Direct Copy & Paste from Excel / Google Sheets
  if (trimmed.includes('\t')) {
    try {
      const rawLines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      const tsvCandidateLines = rawLines.filter(l => l.split('\t').length >= 3);

      if (tsvCandidateLines.length > 0) {
        let headers: string[] = [];

        for (let i = 0; i < rawLines.length; i++) {
          const parts = rawLines[i].split('\t').map(s => s.replace(/^["']|["']$/g, '').trim());
          if (parts.length < 3 || !parts[0]) continue;

          if (i === 0 && parts[0].toLowerCase().includes('title')) {
            headers = parts.map(p => p.toLowerCase().replace(/[^a-z]/g, ''));
            continue;
          }

          const getTsvCol = (keyword: string, fallbackIdx: number): string => {
            const idx = headers.findIndex(h => h.includes(keyword));
            return (idx !== -1 && parts[idx] !== undefined ? parts[idx] : parts[fallbackIdx]) || '';
          };

          const title = getTsvCol('title', 0);
          if (!title || title.startsWith('[Enter') || title.startsWith('[FILL YOUR GUIDE')) continue;

          const category = getTsvCol('category', 1) || (normTrack === 'articles' ? 'Tutorials & Articles' : 'General');
          const levelRaw = getTsvCol('level', 2) || 'Intermediate';
          const level = ['Beginner', 'Intermediate', 'Advanced'].includes(levelRaw) ? levelRaw as any : 'Intermediate';
          const summary = getTsvCol('summary', 3) || title;
          const overview = getTsvCol('overview', 4) || summary;
          const architecture = getTsvCol('architecture', 5) || getTsvCol('mechanism', 5) || '';
          const codeLang = getTsvCol('language', 6) || defaultLang;
          const caption = getTsvCol('caption', 7) || `${title} Implementation`;
          const code = getTsvCol('snippet', 8) || getTsvCol('code', 8) || parts[8] || parts[7] || `// Code example for ${title}`;
          const bestPractices = parseList(getTsvCol('bestpractice', 9));
          const antiPatterns = parseList(getTsvCol('antipattern', 10));
          const interviewTips = getTsvCol('interview', 11);

          valid.push({
            id: `imported-tsv-${Date.now()}-${valid.length}`,
            trackId: normTrack,
            title,
            category,
            level,
            summary,
            overview,
            architectureOrMechanism: architecture,
            codeSnippets: [{ language: codeLang, code, caption }],
            bestPractices,
            antiPatterns,
            interviewTips,
            isCustom: true,
          });
        }

        if (valid.length > 0) {
          return finalizeImportResult(valid, normTrack, stageOnly, singleGuide);
        }
      }
    } catch {
      // Fall through to next parser
    }
  }

  // 4. Try True CSV Parsing (Must have multiple rows with >= 3 comma-separated columns or header row)
  if (trimmed.includes(',')) {
    try {
      const rawLines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      const csvCandidateLines = rawLines.filter(l => l.includes(',') && l.split(',').length >= 3);

      // Only treat as CSV if at least 2 lines have 3+ comma-separated columns, or line 0 has a clear Title header
      const hasTitleHeader = rawLines[0]?.toLowerCase().includes('title') && rawLines[0]?.includes(',');
      if (csvCandidateLines.length >= 2 || (hasTitleHeader && csvCandidateLines.length >= 1)) {
        let headers: string[] = [];
        const startIndex = hasTitleHeader ? 1 : 0;
        if (hasTitleHeader) {
          headers = rawLines[0].split(',').map(s => s.toLowerCase().replace(/[^a-z]/g, ''));
        }

        for (let i = startIndex; i < rawLines.length; i++) {
          const line = rawLines[i];
          const parts = line.split(',').map(s => s.replace(/^["']|["']$/g, '').trim());
          if (parts.length < 3 || !parts[0] || parts[0].startsWith('[Enter') || parts[0].startsWith('[FILL YOUR GUIDE')) continue;

          const getCsvCol = (keyword: string, fallbackIdx: number): string => {
            const idx = headers.findIndex(h => h.includes(keyword));
            return (idx !== -1 && parts[idx] !== undefined ? parts[idx] : parts[fallbackIdx]) || '';
          };

          const title = getCsvCol('title', 0);
          if (!title) continue;

          const category = getCsvCol('category', 1) || (normTrack === 'articles' ? 'Tutorials & Articles' : 'General');
          const levelRaw = getCsvCol('level', 2) || 'Intermediate';
          const level = ['Beginner', 'Intermediate', 'Advanced'].includes(levelRaw) ? levelRaw as any : 'Intermediate';
          const summary = getCsvCol('summary', 3) || title;
          const overview = getCsvCol('overview', 4) || summary;
          const codeLang = getCsvCol('language', 5) || defaultLang;
          const code = getCsvCol('code', 6) || parts[6] || `// Code example for ${title}`;
          const interviewTips = getCsvCol('interview', 7) || '';

          valid.push({
            id: `custom-guide-csv-${Date.now()}-${valid.length}`,
            trackId: normTrack,
            title,
            category,
            level,
            summary,
            overview,
            codeSnippets: [{ language: codeLang, code, caption: `${title} Example` }],
            interviewTips,
            isCustom: true,
          });
        }

        if (valid.length > 0) {
          return finalizeImportResult(valid, normTrack, stageOnly, singleGuide);
        }
      }
    } catch {
      // Fall through
    }
  }

  // 5. Try Explicit Multi-Guide Structured Text
  // ONLY split into MULTIPLE guides if explicit multiple guide markers exist (e.g. Guide 1:, Guide 2: or >= 2 Title: declarations)
  const titleHeaderMatches = trimmed.match(/(?:^|\n)\s*\*{0,2}(?:guide\s*\d+|title|concept\s*title|guide\s*title)(?:\s*\[[^\]]*\])?\*{0,2}\s*:/gi) || [];
  const guideNumMatches = trimmed.match(/(?:^|\n)\s*guide\s*\d+\s*:/gi) || [];

  if (guideNumMatches.length >= 2 || titleHeaderMatches.length >= 2) {
    try {
      const splitRegex = guideNumMatches.length >= 2
        ? /(?:^|\n)(?=guide\s*\d+\s*:)/i
        : /(?:^|\n)(?=(?:\*{0,2}(?:guide\s*\d+|title|concept\s*title|guide\s*title)(?:\s*\[[^\]]*\])?\*{0,2}\s*:))/i;
      const blocks = trimmed.split(splitRegex).filter(b => b.trim());

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const getField = (pattern: RegExp) => {
          const match = block.match(pattern);
          return match ? match[1].trim() : '';
        };

        const title = getField(/(?:\*{0,2}(?:title|concept\s*title|guide\s*title|topic)(?:\s*\[[^\]]*\])?\*{0,2})\s*:\s*([^\n\r]+)/i);
        if (!title || title.startsWith('[Enter') || title.startsWith('[FILL YOUR GUIDE')) continue;

        const category = getField(/(?:\*{0,2}(?:category)(?:\s*\[[^\]]*\])?\*{0,2})\s*:\s*([^\n\r]+)/i) || (normTrack === 'articles' ? 'Tutorials & Articles' : 'General');
        const levelRaw = getField(/(?:\*{0,2}(?:level|difficulty)(?:\s*\[[^\]]*\])?\*{0,2})\s*:\s*([^\n\r]+)/i) || 'Intermediate';
        const level = ['Beginner', 'Intermediate', 'Advanced'].find(l => levelRaw.toLowerCase().includes(l.toLowerCase())) || 'Intermediate';
        const summary = getField(/(?:\*{0,2}(?:summary)(?:\s*\[[^\]]*\])?\*{0,2})\s*:\s*([^\n\r]+)/i) || title;
        const overview = getField(/(?:\*{0,2}(?:overview|explanation)(?:\s*\[[^\]]*\])?\*{0,2})\s*:\s*([\s\S]*?)(?=(?:\*{0,2}(?:architecture|mechanism|code|best\s*practices|anti[- ]patterns|interview)|\n#|$))/i) || summary;
        const architecture = getField(/(?:\*{0,2}(?:architecture|mechanism)(?:\s*\[[^\]]*\])?\*{0,2})\s*:\s*([\s\S]*?)(?=(?:\*{0,2}(?:code|best\s*practices|anti[- ]patterns|interview)|\n#|$))/i) || '';
        const codeLang = getField(/(?:\*{0,2}(?:code\s*language|language)(?:\s*\[[^\]]*\])?\*{0,2})\s*:\s*([^\n\r]+)/i) || defaultLang;
        const caption = getField(/(?:\*{0,2}(?:code\s*caption|caption)(?:\s*\[[^\]]*\])?\*{0,2})\s*:\s*([^\n\r]+)/i) || `${title} Implementation`;
        let code = getField(/(?:\*{0,2}(?:code\s*snippet|snippet|code)(?:\s*\[[^\]]*\])?\*{0,2})\s*:\s*([\s\S]*?)(?=(?:\*{0,2}(?:best\s*practices|anti[- ]patterns|interview)|\n#|$))/i);

        if (!code) {
          const fencedMatch = block.match(/```(?:[a-z0-9_-]+)?\s*([\s\S]*?)```/i);
          if (fencedMatch) {
            code = fencedMatch[1].trim();
          }
        }
        if (!code) {
          code = `// Code example for ${title}`;
        }

        const bestPractices = parseList(getField(/(?:\*{0,2}best\s*practices?(?:\s*\[[^\]]*\])?\*{0,2})\s*:\s*([\s\S]*?)(?=(?:\*{0,2}anti[- ]patterns?|\*{0,2}interview|\n#|$))/i));
        const antiPatterns = parseList(getField(/(?:\*{0,2}anti[- ]patterns?(?:\s*\[[^\]]*\])?\*{0,2})\s*:\s*([\s\S]*?)(?=(?:\*{0,2}interview|\n#|$))/i));
        const interviewTips = getField(/(?:\*{0,2}interview\s*tips?(?:\s*\[[^\]]*\])?\*{0,2})\s*:\s*([\s\S]*?)$/i) || '';

        valid.push({
          id: `imported-text-${Date.now()}-${valid.length}`,
          trackId: normTrack,
          title,
          category,
          level: level as any,
          summary,
          overview,
          architectureOrMechanism: architecture,
          codeSnippets: [{ language: codeLang, code, caption }],
          bestPractices,
          antiPatterns,
          interviewTips,
          isCustom: true,
        });
      }

      if (valid.length > 0) {
        return finalizeImportResult(valid, normTrack, stageOnly, singleGuide);
      }
    } catch {
      // Fall through
    }
  }

  // 6. Single Document / Article / Tutorial / Notes Import (Default for uploaded .docx, Google Docs, articles)
  // When an author uploads or pastes a document, it must be imported as ONE comprehensive guide,
  // NOT split line-by-line or bullet-by-bullet!
  try {
    // 1. Extract Title:
    let title = '';
    const titleMatch = trimmed.match(/(?:^|\n)\s*\*{0,2}(?:title|concept\s*title|guide\s*title|topic)(?:\s*\[[^\]]*\])?\*{0,2}\s*:\s*([^\n\r]+)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      const headingMatch = trimmed.match(/^#+\s*([^\n\r]+)/m);
      if (headingMatch) {
        title = headingMatch[1].replace(/^\*+|\*+$/g, '').trim();
      } else {
        // Look for the first non-empty line that isn't a bullet point or code comment
        const docLines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of docLines) {
          const cleanLine = line.replace(/^\*+|\*+$/g, '').replace(/^[#•\-\d\.]+\s*/, '').trim();
          if (cleanLine && cleanLine.length >= 4 && cleanLine.length <= 120 && !cleanLine.startsWith('//') && !cleanLine.startsWith('/*')) {
            title = cleanLine;
            break;
          }
        }
      }
    }

    if (!title || title.startsWith('[Enter') || title.startsWith('[FILL YOUR GUIDE')) {
      title = normTrack === 'articles' ? 'Technical Tutorial & Deep Dive' : 'Imported Concept Guide';
    }

    // 2. Extract Category:
    let category = '';
    const categoryMatch = trimmed.match(/(?:^|\n)\s*\*{0,2}(?:category)(?:\s*\[[^\]]*\])?\*{0,2}\s*:\s*([^\n\r]+)/i);
    if (categoryMatch) {
      category = categoryMatch[1].trim();
    } else {
      category = normTrack === 'articles'
        ? 'Tutorials & Articles'
        : normTrack === 'api-testing'
        ? 'Rest Assured (API)'
        : normTrack === 'playwright'
        ? 'Playwright (TS)'
        : normTrack === 'selenium'
        ? 'Selenium WebDriver'
        : 'AI Academy';
    }

    // 3. Extract Level:
    let levelVal: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
    const levelMatch = trimmed.match(/(?:^|\n)\s*\*{0,2}(?:level|difficulty)(?:\s*\[[^\]]*\])?\*{0,2}\s*:\s*([^\n\r]+)/i);
    if (levelMatch) {
      const lStr = levelMatch[1].toLowerCase();
      if (lStr.includes('beg')) levelVal = 'Beginner';
      else if (lStr.includes('adv')) levelVal = 'Advanced';
    }

    // 4. Extract Summary:
    let summary = '';
    const summaryMatch = trimmed.match(/(?:^|\n)\s*\*{0,2}(?:summary)(?:\s*\[[^\]]*\])?\*{0,2}\s*:\s*([^\n\r]+)/i);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    } else {
      // Find the first narrative paragraph (after title) that isn't a code or bullet line
      const paragraphs = trimmed.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      for (const p of paragraphs) {
        const cleanP = p.replace(/^[#•\-\*\d\.\s]+/, '').trim();
        if (cleanP && !cleanP.startsWith('//') && cleanP !== title && cleanP.length >= 20) {
          summary = cleanP.slice(0, 250);
          if (cleanP.length > 250) summary += '...';
          break;
        }
      }
      if (!summary) summary = title;
    }

    // 5. Overview: The ENTIRE document content with rich formatting preserved
    const overview = trimmed;

    // 6. Architecture / Mechanism:
    let architecture = '';
    const archMatch = trimmed.match(/(?:^|\n)\s*\*{0,2}(?:architecture|mechanism)(?:\s*\[[^\]]*\])?\*{0,2}\s*:\s*([\s\S]*?)(?=(?:\n\s*\*{0,2}(?:code|best\s*practices|anti[- ]patterns|interview)|\n#|$))/i);
    if (archMatch) {
      architecture = archMatch[1].trim();
    }

    // 7. Code Snippets:
    const codeSnippets: CodeSnippet[] = [];
    const fencedBlocks = Array.from(trimmed.matchAll(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g));
    if (fencedBlocks.length > 0) {
      for (let i = 0; i < Math.min(fencedBlocks.length, 3); i++) {
        const fb = fencedBlocks[i];
        const lang = fb[1]?.trim() || defaultLang;
        const codeText = fb[2]?.trim();
        if (codeText) {
          codeSnippets.push({
            language: lang,
            code: codeText,
            caption: `${title} Code Example ${i + 1}`,
          });
        }
      }
    }

    if (codeSnippets.length === 0) {
      const codeMatch = trimmed.match(/(?:^|\n)\s*\*{0,2}(?:code|snippet)(?:\s*\[[^\]]*\])?\*{0,2}\s*:\s*([\s\S]*?)(?=(?:\n\s*\*{0,2}(?:best\s*practices|anti[- ]patterns|interview)|\n#|$))/i);
      const codeText = codeMatch ? codeMatch[1].trim() : `// Code example for ${title}`;
      codeSnippets.push({
        language: defaultLang,
        code: codeText,
        caption: `${title} Implementation`,
      });
    }

    // 8. Best Practices, Anti-Patterns, Interview Tips:
    const bpMatch = trimmed.match(/(?:^|\n)\s*\*{0,2}best\s*practices?(?:\s*\[[^\]]*\])?\*{0,2}\s*:\s*([\s\S]*?)(?=(?:\n\s*\*{0,2}anti[- ]patterns?|\n\s*\*{0,2}interview|\n#|$))/i);
    const bestPractices = bpMatch ? parseList(bpMatch[1]) : [];

    const apMatch = trimmed.match(/(?:^|\n)\s*\*{0,2}anti[- ]patterns?(?:\s*\[[^\]]*\])?\*{0,2}\s*:\s*([\s\S]*?)(?=(?:\n\s*\*{0,2}interview|\n#|$))/i);
    const antiPatterns = apMatch ? parseList(apMatch[1]) : [];

    const itMatch = trimmed.match(/(?:^|\n)\s*\*{0,2}interview\s*tips?(?:\s*\[[^\]]*\])?\*{0,2}\s*:\s*([\s\S]*?)$/i);
    const interviewTips = itMatch ? itMatch[1].trim() : '';

    valid.push({
      id: `imported-doc-${Date.now()}-0`,
      trackId: normTrack,
      title,
      category,
      level: levelVal,
      summary,
      overview,
      architectureOrMechanism: architecture,
      codeSnippets,
      bestPractices,
      antiPatterns,
      interviewTips,
      isCustom: true,
    });

    if (valid.length > 0) {
      return finalizeImportResult(valid, normTrack, stageOnly, singleGuide);
    }
  } catch {
    // Fall through
  }

  return {
    guides: [],
    error: 'Could not extract valid guides. Please use the Excel (.XLS) or Word (.DOC) template, or paste rows with Title, Category, and Summary.'
  };
}

// Consolidate multiple guide sections, tables, and notes into 1 comprehensive guide
export function consolidateGuidesIntoSingle(guides: ConceptGuide[], normTrack: string): ConceptGuide {
  if (guides.length === 0) {
    throw new Error('No guides to consolidate');
  }
  if (guides.length === 1) {
    return guides[0];
  }

  // 1. Pick the best primary title (ignore placeholders like "[Enter Guide Title]")
  const validGuides = guides.filter(g => g.title && !g.title.includes('[Enter') && !g.title.includes('[FILL'));
  const primary = validGuides.length > 0 ? validGuides[0] : guides[0];

  const primaryTitle = primary.title.replace(/^\[.*?\]\s*/, '').trim() || 'Comprehensive Technical Guide';
  const category = primary.category || (normTrack === 'articles' ? 'Tutorials & Articles' : 'General');
  const level = primary.level || 'Intermediate';
  const summary = primary.summary && !primary.summary.includes('[Enter')
    ? primary.summary
    : `${primaryTitle} - Comprehensive architecture, practical code examples, and production test automation guide.`;

  // 2. Consolidate full Overview & Explanation with rich formatting
  const sections: string[] = [];

  for (let i = 0; i < guides.length; i++) {
    const g = guides[i];
    if (!g.title && !g.overview && !g.summary) continue;

    const parts: string[] = [];
    const isDistinctSection = g.title && g.title !== primaryTitle && !g.title.includes('[Enter');

    if (isDistinctSection) {
      parts.push(`### ${g.title}`);
    }

    if (g.overview && !g.overview.includes('[Detailed multi-paragraph')) {
      parts.push(g.overview);
    } else if (g.summary && g.summary !== primary.summary && !g.summary.includes('[Concise 1-2')) {
      parts.push(g.summary);
    }

    if (g.architectureOrMechanism && !g.architectureOrMechanism.includes('[Internal engine')) {
      parts.push(`**Mechanism & Architecture:**\n${g.architectureOrMechanism}`);
    }

    if (g.bestPractices && g.bestPractices.length > 0) {
      const bp = g.bestPractices.filter(b => !b.includes('Recommendation'));
      if (bp.length > 0) {
        parts.push(`**Best Practices:**\n${bp.map(b => `• ${b}`).join('\n')}`);
      }
    }

    if (g.antiPatterns && g.antiPatterns.length > 0) {
      const ap = g.antiPatterns.filter(a => !a.includes('Common pitfall'));
      if (ap.length > 0) {
        parts.push(`**Anti-Patterns to Avoid:**\n${ap.map(a => `• ${a}`).join('\n')}`);
      }
    }

    if (g.interviewTips && !g.interviewTips.includes('[Key talking points')) {
      parts.push(`**Interview Tips:**\n${g.interviewTips}`);
    }

    if (parts.length > 0) {
      sections.push(parts.join('\n\n'));
    }
  }

  const finalOverview = sections.length > 0
    ? sections.join('\n\n---\n\n')
    : primary.overview || summary;

  // 3. Consolidate code snippets across all guides
  const allSnippets: CodeSnippet[] = [];
  const seenCodes = new Set<string>();

  for (const g of guides) {
    if (g.codeSnippets && g.codeSnippets.length > 0) {
      for (const cs of g.codeSnippets) {
        if (!cs.code || cs.code.includes('// Paste your complete') || cs.code.includes('// Code example for [') || seenCodes.has(cs.code.trim())) {
          continue;
        }
        seenCodes.add(cs.code.trim());
        allSnippets.push(cs);
      }
    }
  }

  if (allSnippets.length === 0) {
    allSnippets.push({
      language: normTrack === 'playwright' ? 'typescript' : normTrack === 'ai-qa' ? 'python' : 'java',
      caption: `${primaryTitle} Implementation`,
      code: primary.codeSnippets?.[0]?.code || `// Technical implementation for ${primaryTitle}`,
    });
  }

  // 4. Consolidate interview tips, best practices, and anti-patterns
  const consolidatedBp = Array.from(new Set(guides.flatMap(g => g.bestPractices || []))).filter(b => !b.includes('Recommendation'));
  const consolidatedAp = Array.from(new Set(guides.flatMap(g => g.antiPatterns || []))).filter(a => !a.includes('Common pitfall'));
  const consolidatedTips = Array.from(new Set(guides.map(g => g.interviewTips).filter(Boolean))).join('\n• ');

  return {
    id: `imported-single-${Date.now()}`,
    trackId: normTrack,
    title: primaryTitle,
    category,
    level,
    summary,
    overview: finalOverview,
    architectureOrMechanism: primary.architectureOrMechanism || '',
    codeSnippets: allSnippets,
    bestPractices: consolidatedBp,
    antiPatterns: consolidatedAp,
    interviewTips: consolidatedTips,
    isCustom: true,
  };
}

// Helper to save parsed guides to storage
function finalizeImportResult(
  valid: ConceptGuide[],
  normTrack: string,
  stageOnly: boolean,
  singleGuide: boolean = true
): { guides: ConceptGuide[] } {
  let finalGuides = valid;
  if (singleGuide && finalGuides.length > 1) {
    finalGuides = [consolidateGuidesIntoSingle(finalGuides, normTrack)];
  }

  if (stageOnly) {
    const existing = getStagedGuides(normTrack);
    const updated = [...finalGuides, ...existing.filter(e => !finalGuides.some(v => v.id === e.id))];
    localStorage.setItem(`${STAGED_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(updated));
  } else {
    const existing = getStoredCustomGuides(normTrack);
    const updated = [...finalGuides, ...existing.filter(e => !finalGuides.some(v => v.id === e.id))];
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(updated));
  }
  return { guides: finalGuides };
}
