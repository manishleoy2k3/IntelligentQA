export interface MockScreenshot {
  windowTitle: string;
  caption: string;
  type: 'ide' | 'terminal' | 'browser' | 'postman-vs-code';
  fileTree?: string[];
  activeFile?: string;
  codeOrOutput: string;
}

export interface TutorialStep {
  stepNumber: number;
  title: string;
  badge?: string;
  summary: string;
  description: string;
  mockScreenshot?: MockScreenshot;
  codeSnippet?: {
    language: string;
    code: string;
    caption: string;
  };
  keyTakeaways: string[];
}

export interface TrackTutorial {
  trackId: string;
  title: string;
  subtitle: string;
  sourceAttribution?: string;
  sourceUrl?: string;
  overview: string;
  architectureDiagram: {
    title: string;
    layers: { layer: string; name: string; description: string; color: string }[];
    flowSummary: string;
  };
  steps: TutorialStep[];
}

export const TRACK_TUTORIALS: Record<string, TrackTutorial> = {
  // ==========================================
  // SELENIUM WITH JAVA TUTORIAL
  // ==========================================
  selenium: {
    trackId: 'selenium',
    title: 'Selenium with Java Complete Step-by-Step Tutorial & Setup',
    subtitle: 'Comprehensive guide covering environment setup, IDE configuration, W3C WebDriver architecture, locators, dynamic synchronization, and framework design.',
    overview: `Selenium is the world's most widely adopted open-source web browser automation tool. Combined with Java, it provides enterprise-grade scalability, type safety, and seamless integration with continuous delivery pipelines. This tutorial guides you from initial JDK setup and IDE configuration through writing your first script, mastering dynamic locators, and architecting Page Object Model test suites.`,
    architectureDiagram: {
      title: 'Selenium 4 W3C WebDriver Architecture',
      layers: [
        { layer: 'Layer 1: Bindings', name: 'Java Client Library', description: 'Selenium Java API (ChromeDriver, By, WebDriverWait)', color: 'blue' },
        { layer: 'Layer 2: Standard', name: 'W3C WebDriver Protocol', description: 'Universal JSON HTTP REST commands over standard port', color: 'emerald' },
        { layer: 'Layer 3: Driver', name: 'Browser Executable Driver', description: 'ChromeDriver / GeckoDriver running as local HTTP server (port 9515)', color: 'amber' },
        { layer: 'Layer 4: Target', name: 'Web Browsers', description: 'Chrome, Firefox, Edge, Safari rendering real DOM sessions', color: 'purple' },
      ],
      flowSummary: 'Java Code ===> W3C HTTP Commands ===> ChromeDriver (Local Port 9515) ===> Chrome Browser OS Process ===> Real User DOM Interactions.',
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Prerequisites & Java Development Kit (JDK) Setup',
        badge: 'Environment Setup',
        summary: 'Download and install JDK 17 or 21, and configure JAVA_HOME environment variables.',
        description: `Before writing Selenium code, you must install the Java Development Kit (JDK 17 LTS or JDK 21 LTS is recommended). Once installed, configure your system environment variables so your terminal and IDE can compile Java programs.

On Windows:
1. Set System Variable: JAVA_HOME = C:\\Program Files\\Java\\jdk-17
2. Edit Path variable: Append %JAVA_HOME%\\bin

On macOS / Linux:
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH`,
        mockScreenshot: {
          windowTitle: 'Terminal: JDK Verification',
          caption: 'Verifying JDK installation and version in terminal',
          type: 'terminal',
          codeOrOutput: `$ java -version
openjdk version "17.0.10" 2024-01-16 LTS
OpenJDK Runtime Environment (build 17.0.10+7)
OpenJDK 64-Bit Server VM (build 17.0.10+7, mixed mode)

$ echo $JAVA_HOME
/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home`,
        },
        keyTakeaways: [
          'Selenium 4 requires Java 11 or higher (Java 17 LTS is strongly recommended).',
          'Always verify both java -version and javac -version output in your terminal.',
        ],
      },
      {
        stepNumber: 2,
        title: 'IDE Installation & Workspace Setup (IntelliJ IDEA / Eclipse)',
        badge: 'IDE Setup',
        summary: 'Set up an integrated development environment with Maven for dependency management.',
        description: `Download and install either IntelliJ IDEA Community Edition (recommended for modern Java development) or Eclipse IDE for Java Developers. 

In your IDE:
1. Open IntelliJ IDEA -> New Project -> Select 'Maven'.
2. Enter GroupId: com.intelligentqa, ArtifactId: selenium-java-tutorial.
3. Select your JDK 17 as the Project SDK.
4. Click 'Create'. Your project will generate a standard Maven layout: src/main/java, src/test/java, and pom.xml.`,
        mockScreenshot: {
          windowTitle: 'IntelliJ IDEA - Project Explorer & Workspace',
          caption: 'Standard Maven Project structure for Selenium Java automation',
          type: 'ide',
          fileTree: [
            'selenium-java-tutorial/',
            '├── src/test/java/',
            '│   └── com/intelligentqa/tests/',
            '│       └── FirstSeleniumTest.java',
            '├── src/test/resources/',
            '│   └── testng.xml',
            '└── pom.xml',
          ],
          activeFile: 'FirstSeleniumTest.java',
          codeOrOutput: `package com.intelligentqa.tests;

// Project workspace ready for Selenium WebDriver 4
public class FirstSeleniumTest {
    // Ready to automate!
}`,
        },
        keyTakeaways: [
          'Using Maven eliminates the manual task of downloading and attaching JAR files to the classpath.',
          'Project dependencies are managed centrally in pom.xml.',
        ],
      },
      {
        stepNumber: 3,
        title: 'Maven pom.xml Configuration (Selenium 4 & TestNG)',
        badge: 'Dependencies',
        summary: 'Add Selenium 4, TestNG, and WebDriverManager dependencies to your pom.xml file.',
        description: `Open pom.xml and declare the official Selenium Java and TestNG dependencies inside the <dependencies> block. Selenium 4 features 'Selenium Manager' built-in, which automatically detects your browser version and downloads the matching driver binary without any manual configuration!`,
        mockScreenshot: {
          windowTitle: 'pom.xml - Maven Dependency Configuration',
          caption: 'Maven dependencies for Selenium 4 and TestNG test runner',
          type: 'ide',
          activeFile: 'pom.xml',
          codeOrOutput: `<!-- pom.xml snippet -->
<dependencies>
    <!-- Selenium Java 4 -->
    <dependency>
        <groupId>org.openqa.seleniumhq.selenium</groupId>
        <artifactId>selenium-java</artifactId>
        <version>4.21.0</version>
    </dependency>
    <!-- TestNG Runner -->
    <dependency>
        <groupId>org.testng</groupId>
        <artifactId>testng</artifactId>
        <version>7.10.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>`,
        },
        codeSnippet: {
          language: 'xml',
          caption: 'pom.xml: Complete Enterprise Selenium 4 Dependencies',
          code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.intelligentqa</groupId>
    <artifactId>selenium-java-tutorial</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <selenium.version>4.21.0</selenium.version>
        <testng.version>7.10.2</testng.version>
    </properties>

    <dependencies>
        <!-- Selenium Java -->
        <dependency>
            <groupId>org.openqa.seleniumhq.selenium</groupId>
            <artifactId>selenium-java</artifactId>
            <version>\${selenium.version}</version>
        </dependency>

        <!-- TestNG -->
        <dependency>
            <groupId>org.testng</groupId>
            <artifactId>testng</artifactId>
            <version>\${testng.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>`,
        },
        keyTakeaways: [
          'In Selenium 4, you no longer need System.setProperty("webdriver.chrome.driver", ...) thanks to Selenium Manager.',
          'Maven automatically downloads transitive dependencies (HTTP clients, Guava, Netty).',
        ],
      },
      {
        stepNumber: 4,
        title: 'Writing Your First Selenium Test Script',
        badge: 'First Script',
        summary: 'Launch Google Chrome, maximize the window, navigate to a URL, fetch title, and quit the browser.',
        description: `Create a new class FirstSeleniumTest.java under src/test/java/com/intelligentqa/tests/. In this test, we instantiate ChromeDriver(), maximize the window, navigate to an address using driver.get(), assert the page title, and gracefully release OS resources using driver.quit().`,
        mockScreenshot: {
          windowTitle: 'IntelliJ Run Console: First Test Executed',
          caption: 'Terminal console output showing test execution and passed assertion',
          type: 'terminal',
          codeOrOutput: `[INFO] Running com.intelligentqa.tests.FirstSeleniumTest
Starting ChromeDriver 124.0.6367.91 on port 9515
Chrome opened successfully!
Page Title is: Google
Title verified successfully!
PASSED: testLaunchGoogleSearch

===============================================
Default test
Tests run: 1, Failures: 0, Skips: 0
===============================================`,
        },
        codeSnippet: {
          language: 'java',
          caption: 'FirstSeleniumTest.java: Complete runnable Selenium Java test',
          code: `package com.intelligentqa.tests;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class FirstSeleniumTest {
    private WebDriver driver;

    @BeforeMethod
    public void setUp() {
        // Selenium 4 automatically resolves matching ChromeDriver binary
        driver = new ChromeDriver();
        driver.manage().window().maximize();
    }

    @Test
    public void testLaunchGoogleSearch() {
        // Step 1: Navigate to target URL
        driver.get("https://www.google.com");

        // Step 2: Fetch and verify page title
        String actualTitle = driver.getTitle();
        System.out.println("Page Title is: " + actualTitle);

        Assert.assertEquals(actualTitle, "Google", "Page title does not match!");
    }

    @AfterMethod
    public void tearDown() {
        // Step 3: Always quit driver to close browser and kill chromedriver process
        if (driver != null) {
            driver.quit();
        }
    }
}`,
        },
        keyTakeaways: [
          'Always use driver.quit() instead of driver.close() to kill background driver processes and prevent memory leaks.',
          'Use TestNG @BeforeMethod and @AfterMethod to encapsulate browser lifecycle management.',
        ],
      },
      {
        stepNumber: 5,
        title: 'Locators in Selenium (ID, Name, CSS & XPath Axes)',
        badge: 'Element Locators',
        summary: 'Locate web elements reliably using the 8 standard locators and master advanced XPath axes.',
        description: `Selenium uses the By class to identify elements on a page. Locators are the foundation of all test automation.

Standard Locators:
1. By.id("user-email") -> Fastest and most reliable locator.
2. By.name("password") -> Standard form input identification.
3. By.className("btn-primary") -> Select by CSS class.
4. By.tagName("button") -> Select by HTML tag.
5. By.linkText("Forgot Password?") -> Exact anchor tag link text.
6. By.partialLinkText("Forgot") -> Partial matching anchor text.
7. By.cssSelector("input[type='submit'].btn") -> Blazing fast CSS selector.
8. By.xpath("//div[@class='card']//button[contains(text(),'Submit')]") -> Dynamic DOM traversal.`,
        mockScreenshot: {
          windowTitle: 'Chrome DevTools - DOM Inspection & XPath Verification',
          caption: 'Inspecting elements in Chrome DevTools using $x() and document.querySelector()',
          type: 'browser',
          codeOrOutput: `// Chrome DevTools Console:
> $x("//input[@id='user-name']")
< [input#user-name.input_error.form_input] (1 element matched)

> document.querySelector("button[type='submit']")
< <button type="submit" class="submit-button btn_action">Login</button>`,
        },
        codeSnippet: {
          language: 'java',
          caption: 'LocatorsDemo.java: Practical Locator Strategies',
          code: `package com.intelligentqa.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.Test;

public class LocatorsDemo {

    @Test
    public void testLocatorStrategies() {
        WebDriver driver = new ChromeDriver();
        driver.get("https://example.com/login");

        // 1. By ID (Recommended)
        WebElement emailInput = driver.findElement(By.id("email"));
        emailInput.sendKeys("architect@intelligentqa.io");

        // 2. By CSS Selector
        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit'].btn-primary"));
        
        // 3. Advanced XPath with Contains & Text
        WebElement forgotLink = driver.findElement(By.xpath("//a[contains(@href,'forgot-password') and text()='Reset']"));

        // 4. XPath Axes (following-sibling) for dynamic tables
        WebElement userStatus = driver.findElement(
            By.xpath("//td[text()='John Doe']/following-sibling::td[contains(@class,'status')]")
        );

        driver.quit();
    }
}`,
        },
        keyTakeaways: [
          'Prefer By.id or By.cssSelector whenever IDs or unique attributes exist.',
          'Never use absolute XPaths like /html/body/div[2]/div/div[3]/button because minor DOM changes break tests.',
          'Master XPath axes: following-sibling, parent::, ancestor:: for complex data tables.',
        ],
      },
      {
        stepNumber: 6,
        title: 'Synchronization: Implicit vs Explicit vs FluentWait',
        badge: 'Waits & Timing',
        summary: 'Master dynamic synchronization to eliminate flaky tests and replace brittle Thread.sleep calls.',
        description: `Modern web applications load content asynchronously using AJAX, fetch(), and frontend frameworks (React, Angular, Vue). If Selenium searches for an element before it renders, it throws NoSuchElementException.

1. Thread.sleep(5000): Hard static wait. Freezes the JVM thread. If an element loads in 100ms, it wastes 4.9 seconds. If it takes 5.1s, the test fails. Never use in production!
2. Implicit Wait: Global poll timeout for findElement. Once set, applies to all elements. Cannot wait for specific conditions (visibility, clickability).
3. Explicit Wait (WebDriverWait): Pauses execution until a specific ExpectedCondition is met (e.g. elementToBeClickable, visibilityOfElementLocated). Polling occurs every 500ms.
4. FluentWait: Advanced explicit wait that allows customizing polling frequency and explicitly ignoring specific exceptions (StaleElementReferenceException).`,
        mockScreenshot: {
          windowTitle: 'Timeline: Thread.sleep vs WebDriverWait',
          caption: 'Visual comparison of rigid static sleep vs intelligent dynamic polling',
          type: 'ide',
          codeOrOutput: `Thread.sleep(5000):
|---------------------- 5.0s WASTED (Even if DOM ready at 0.2s) --------------------->|

WebDriverWait (10s Max Timeout):
|- 0.2s -| Element Ready! ===> Test proceeds immediately! (Saved 4.8 seconds!)`,
        },
        codeSnippet: {
          language: 'java',
          caption: 'WaitStrategies.java: Production Dynamic Wait Implementation',
          code: `package com.intelligentqa.tests;

import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class WaitStrategies {

    public static void main(String[] args) {
        WebDriver driver = new ChromeDriver();
        driver.get("https://example.com/dynamic-dashboard");

        // 1. Explicit Wait (Standard for 90% of scenarios)
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement checkoutBtn = wait.until(
            ExpectedConditions.elementToBeClickable(By.id("checkout-btn"))
        );
        checkoutBtn.click();

        // 2. FluentWait with customized polling and ignored exceptions
        FluentWait<WebDriver> fluentWait = new FluentWait<>(driver)
            .withTimeout(Duration.ofSeconds(15))
            .pollingEvery(Duration.ofMillis(250)) // Fast polling
            .ignoring(NoSuchElementException.class)
            .ignoring(StaleElementReferenceException.class);

        WebElement successBanner = fluentWait.until(d -> {
            WebElement el = d.findElement(By.id("order-success-banner"));
            return el.isDisplayed() ? el : null;
        });

        driver.quit();
    }
}`,
        },
        keyTakeaways: [
          'Always prefer WebDriverWait with ExpectedConditions over Thread.sleep.',
          'Never mix implicit waits with explicit waits (can cause indeterminate timeout calculations).',
        ],
      },
      {
        stepNumber: 7,
        title: 'Handling Alerts, Popups, Frames & Windows',
        badge: 'Advanced Interactions',
        summary: 'Switch execution context seamlessly across JavaScript alert dialogs, iframes, and multiple browser tabs.',
        description: `When a browser spawns a JavaScript alert, inline iframe, or opens a link in a new tab, standard findElement() fails because the element belongs to a separate execution context. Use driver.switchTo() to shift the WebDriver context.

1. JavaScript Alerts:
   Alert alert = driver.switchTo().alert();
   alert.accept(); // Clicks OK
   alert.dismiss(); // Clicks Cancel

2. Frames / Iframes:
   driver.switchTo().frame("frame-name-or-id");
   // interact with elements inside frame
   driver.switchTo().defaultContent(); // Return to main page

3. Multiple Tabs / Windows:
   String parentWindow = driver.getWindowHandle();
   for (String handle : driver.getWindowHandles()) {
       if (!handle.equals(parentWindow)) {
           driver.switchTo().window(handle);
       }
   }`,
        codeSnippet: {
          language: 'java',
          caption: 'WindowAndAlertsDemo.java: Context Switching Implementation',
          code: `package com.intelligentqa.tests;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class WindowAndAlertsDemo {

    public void handlePopupsAndTabs(WebDriver driver) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // 1. Handle JavaScript Alert
        driver.findElement(By.id("trigger-alert")).click();
        Alert alert = wait.until(ExpectedConditions.alertIsPresent());
        System.out.println("Alert text: " + alert.getText());
        alert.accept(); // Dismiss popup

        // 2. Handle Iframes
        driver.switchTo().frame(driver.findElement(By.cssSelector("iframe.payment-frame")));
        driver.findElement(By.id("credit-card-number")).sendKeys("424242424242");
        driver.switchTo().defaultContent(); // Crucial: return to root document

        // 3. Handle Multiple Browser Tabs
        String originalTab = driver.getWindowHandle();
        driver.findElement(By.linkText("Open Terms in New Tab")).click();

        wait.until(d -> d.getWindowHandles().size() > 1);
        for (String windowHandle : driver.getWindowHandles()) {
            if (!windowHandle.equals(originalTab)) {
                driver.switchTo().window(windowHandle);
                break;
            }
        }

        System.out.println("New Tab Title: " + driver.getTitle());
        driver.close(); // Close active tab
        driver.switchTo().window(originalTab); // Return to original tab
    }
}`,
        },
        keyTakeaways: [
          'Always call driver.switchTo().defaultContent() after interacting with an iframe.',
          'Store original window handle before clicking links that open new tabs.',
        ],
      },
      {
        stepNumber: 8,
        title: 'Test Automation Framework: Page Object Model (POM)',
        badge: 'Enterprise Architecture',
        summary: 'Build clean, maintainable test architectures by decoupling page locators and actions from test assertions.',
        description: `Page Object Model (POM) is the premier design pattern in test automation. Each web page is represented as a distinct Java class. The class encapsulates locators as private fields and exposes business user actions as public methods. Test methods interact with Page Objects and perform Assertions.

Rules of Enterprise POM:
1. Locators must be private final By.
2. Page Objects must NEVER contain Assert statements (assertions belong exclusively in @Test methods).
3. Methods that navigate to a new page should return a new instance of that Page Object (Fluent Page Object).`,
        codeSnippet: {
          language: 'java',
          caption: 'LoginPage.java: Fluent Page Object with Encapsulation',
          code: `package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class LoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    // Encapsulated Locators
    private final By emailInput = By.id("user-email");
    private final By passwordInput = By.id("user-password");
    private final By submitBtn = By.cssSelector("button[type='submit']");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public DashboardPage loginAs(String email, String password) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput)).sendKeys(email);
        driver.findElement(passwordInput).sendKeys(password);
        driver.findElement(submitBtn).click();
        return new DashboardPage(driver); // Fluent navigation
    }
}`,
        },
        keyTakeaways: [
          'Page Objects represent services offered by the UI, not an exact HTML dump.',
          'Assertions stay strictly in test classes for clean separation of concerns.',
        ],
      },
    ],
  },

  // ==========================================
  // PLAYWRIGHT WITH TYPESCRIPT TUTORIAL (DOCS EDITION)
  // ==========================================
  playwright: {
    trackId: 'playwright',
    title: 'Playwright with TypeScript: Complete Guide to Writing Tests',
    subtitle: 'Step-by-step masterclass covering Playwright test runner, resilient user-facing locators, auto-waiting actionability, web-first assertions, and interactive UI mode.',
    overview: `Playwright was created by Microsoft to deliver reliable, fast, and evergreen end-to-end automation. It communicates directly with Chromium, Firefox, and WebKit rendering engines via WebSocket using the Chrome DevTools Protocol (CDP), completely bypassing legacy HTTP proxy overhead. This tutorial covers everything from CLI initialization to resilient locators and time-travel UI debugging.`,
    architectureDiagram: {
      title: 'Playwright WebSocket CDP Architecture',
      layers: [
        { layer: 'Layer 1: Runner', name: 'Playwright Test Runner', description: 'Parallel worker processes, custom fixtures, retry engine', color: 'blue' },
        { layer: 'Layer 2: Protocol', name: 'Bi-Directional WebSocket', description: 'Direct Chrome DevTools Protocol (CDP) connection stream', color: 'emerald' },
        { layer: 'Layer 3: Engine', name: 'Browser Process', description: 'Single OS process hosting isolated BrowserContexts (incognito)', color: 'amber' },
        { layer: 'Layer 4: Target', name: 'Browser Engines', description: 'Chromium, WebKit (Safari), Firefox headless & headed sessions', color: 'purple' },
      ],
      flowSummary: 'Node.js Test Runner <== Bi-directional WebSocket (CDP) ==> Browser Process -> [Isolated Contexts in 5ms] -> Real Browser DOM.',
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Project Scaffolding with npm init playwright@latest',
        badge: 'Setup & CLI',
        summary: 'Initialize a production-ready Playwright suite with one interactive CLI command.',
        description: `Install Node.js (version 18 or 20 LTS). Run the official Playwright initialization script in your terminal. It sets up package.json, playwright.config.ts, and downloads isolated browser binaries.

$ npm init playwright@latest
✔ Do you want to use TypeScript or JavaScript? · TypeScript
✔ Where to put your end-to-end tests? · tests
✔ Add a GitHub Actions workflow? · true
✔ Install Playwright browsers (can be done manually via 'npx playwright install')? · true`,
        mockScreenshot: {
          windowTitle: 'Terminal: Scaffolding Playwright Suite',
          caption: 'Interactive CLI output generating TypeScript Playwright framework',
          type: 'terminal',
          codeOrOutput: `$ npm init playwright@latest
Getting started with writing end-to-end tests with Playwright:
Initializing project in /Users/developer/playwright-suite
✔ Installing @playwright/test...
✔ Downloading Chromium, Firefox, WebKit binaries...
✔ Generated playwright.config.ts
✔ Generated tests/example.spec.ts

Happy hacking for QA! Run: npx playwright test`,
        },
        keyTakeaways: [
          'Playwright bundles its own isolated browser binaries, insulating your tests from machine Chrome updates.',
          'TypeScript is recommended for first-class type safety and IDE auto-complete.',
        ],
      },
      {
        stepNumber: 2,
        title: 'Understanding playwright.config.ts & File Hierarchy',
        badge: 'Configuration',
        summary: 'Master the central configuration file controlling parallel workers, devices, retries, and traces.',
        description: `Playwright centralizes all framework configurations inside playwright.config.ts. This includes multi-browser projects, parallel worker count, CI retries, base URLs, and failure artifact retention (screenshots, videos, traces).`,
        codeSnippet: {
          language: 'typescript',
          caption: 'playwright.config.ts: Production Configuration Blueprint',
          code: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // Run specs in parallel
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // Auto-retry flaky tests in CI
  workers: process.env.CI ? 4 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://staging.intelligentqa.io',
    trace: 'on-first-retry', // Capture full DOM filmstrip on retry
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});`,
        },
        keyTakeaways: [
          'Set trace: "on-first-retry" to record full DOM snapshots only on test failures with zero overhead on passes.',
          'fullyParallel: true enables worker-level multi-threading across CPU cores.',
        ],
      },
      {
        stepNumber: 3,
        title: 'Writing Your First Playwright Test (test, expect)',
        badge: 'First Test',
        summary: 'Create an end-to-end spec with navigation, link clicking, and Web-First assertions.',
        description: `Create tests/homepage.spec.ts. In Playwright, tests are declared with test('title', async ({ page }) => { ... }). The { page } argument is a built-in test fixture that provides an isolated incognito browser page for every single test.`,
        mockScreenshot: {
          windowTitle: 'tests/homepage.spec.ts - VS Code Editor',
          caption: 'Clean, asynchronous Playwright test script in TypeScript',
          type: 'ide',
          activeFile: 'homepage.spec.ts',
          codeOrOutput: `import { test, expect } from '@playwright/test';

test('has title and navigates to get started', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring
  await expect(page).toHaveTitle(/Playwright/);

  // Click the get started link
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});`,
        },
        codeSnippet: {
          language: 'typescript',
          caption: 'tests/example.spec.ts: First Playwright Test Spec',
          code: `import { test, expect } from '@playwright/test';

test.describe('Playwright Documentation Suite', () => {
  test('verify homepage title and installation guide', async ({ page }) => {
    // 1. Navigate to target URL (auto-waits for DOM ready)
    await page.goto('https://playwright.dev/');

    // 2. Web-first assertion with built-in auto-retry
    await expect(page).toHaveTitle(/Playwright/);

    // 3. User-facing locator click
    await page.getByRole('link', { name: 'Get started' }).click();

    // 4. Verify heading element is visible
    const heading = page.getByRole('heading', { name: 'Installation' });
    await expect(heading).toBeVisible();
  });
});`,
        },
        keyTakeaways: [
          'Never add arbitrary wait calls; page.goto() auto-waits for the load state.',
          'expect(page).toHaveTitle() automatically retries until matching or timing out.',
        ],
      },
      {
        stepNumber: 4,
        title: 'User-Facing Resilient Locators (getByRole, getByLabel)',
        badge: 'Locators',
        summary: 'Prioritize accessibility tree locators over volatile CSS class names and XPaths.',
        description: `Playwright recommends using user-facing locators that reflect how real users and screen readers perceive your application:

1. page.getByRole('button', { name: 'Sign in' }) -> Highest priority. Targets ARIA roles.
2. page.getByLabel('Password') -> Targets form controls with matching label tags.
3. page.getByPlaceholder('Search products...') -> Targets input placeholder text.
4. page.getByText('Welcome back, Sarah!') -> Targets non-interactive element text.
5. page.getByTestId('cart-checkout-btn') -> Dedicated QA data-testid hook when roles are ambiguous.`,
        codeSnippet: {
          language: 'typescript',
          caption: 'LocatorsExample.ts: Priority Locator Strategy',
          code: `import { test, expect } from '@playwright/test';

test('interact with user-facing semantic locators', async ({ page }) => {
  await page.goto('/login');

  // Priority 1: getByRole
  await page.getByRole('heading', { name: 'Account Login' }).toBeVisible();

  // Priority 2: getByLabel
  await page.getByLabel('Work Email').fill('sdet@company.com');
  await page.getByLabel('Password').fill('SecurePassword123!');

  // Priority 3: Checkbox role
  await page.getByRole('checkbox', { name: 'Remember me' }).check();

  // Submit via role
  await page.getByRole('button', { name: 'Sign in' }).click();
});`,
        },
        keyTakeaways: [
          'Using getByRole aligns test automation with web accessibility (a11y) standards.',
          'Avoid CSS utility classes (Tailwind) which frequently change during UI redesigns.',
        ],
      },
      {
        stepNumber: 5,
        title: 'Auto-Waiting Mechanics & Web-First Assertions',
        badge: 'Actionability',
        summary: 'Understand the 5 actionability criteria that eliminate test flakiness completely.',
        description: `Before performing any action (click, fill, check, hover), Playwright automatically validates that the element satisfies 5 actionability criteria:
1. Attached: Element is attached to the DOM.
2. Visible: Element is visible and has a non-empty bounding box.
3. Stable: Element is not undergoing CSS transitions or animations.
4. Receives Events: Element is not obscured by modal overlays or spinners.
5. Enabled: Element is not disabled.

If any check fails, Playwright keeps polling until the condition passes or timeout is hit!`,
        mockScreenshot: {
          windowTitle: 'Playwright Actionability Matrix',
          caption: 'Built-in actionability verification checks before click() or fill()',
          type: 'browser',
          codeOrOutput: `Action: locator.click()
✓ Element is Attached to DOM
✓ Element is Visible (opacity > 0, display != none)
✓ Element is Stable (coordinates stable across consecutive animation frames)
✓ Element Receives Pointer Events (no transparent backdrop blocking)
✓ Element is Enabled (not [disabled])
===> ACTION DISPATCHED! (0ms wait needed from developer)`,
        },
        keyTakeaways: [
          'Playwright eliminates the need for manual Thread.sleep or polling loops.',
          'Web-First assertions (expect(locator).toBeVisible()) retry automatically.',
        ],
      },
      {
        stepNumber: 6,
        title: 'Interactive UI Mode & Time-Travel Trace Viewer',
        badge: 'Visual Debugging',
        summary: 'Debug tests interactively with live DOM inspection, network waterfall, and action filmstrips.',
        description: `Run tests using the groundbreaking UI Mode:
$ npx playwright test --ui

In UI Mode:
- See all test suites in a sidebar with live search and watch mode.
- Hover over any test step to time-travel: see the exact visual DOM state before and after the action.
- Inspect network requests, console logs, source code, and locator picker in real time!`,
        mockScreenshot: {
          windowTitle: 'Playwright UI Mode - Interactive Visual Runner',
          caption: 'Interactive UI mode with action filmstrip, network tab, and source viewer',
          type: 'browser',
          codeOrOutput: `▶ Playwright Test Runner (UI Mode)
  ✓ tests/checkout.spec.ts (1.2s)
    ✓ Navigate to cart
    ✓ Fill shipping details
    ✓ Click place order [Snapshot captured]
      - DOM Tree: <div class="order-confirmation">Order #98214</div>
      - Network: POST /api/v1/orders ➔ 201 Created (142ms)
      - Console: 0 errors`,
        },
        keyTakeaways: [
          'UI Mode makes debugging 10x faster than reading terminal stack traces.',
          'Trace files (.zip) can be shared with developers and opened via trace.playwright.dev.',
        ],
      },
    ],
  },

  // ==========================================
  // REST ASSURED API TESTING TUTORIAL (GEEKSFORGEEKS EDITION)
  // ==========================================
  'api-testing': {
    trackId: 'api-testing',
    title: 'API Testing with REST Assured: Complete Step-by-Step Tutorial',
    subtitle: 'Comprehensive guide covering BDD Given-When-Then DSL, Maven dependencies, CRUD request execution, Hamcrest assertions, POJO serialization, and JSON schema validation.',
    overview: `REST Assured is an open-source Java library that brings clean, readable Behavior-Driven Development (BDD) syntax to API automation. It eliminates the limitations of manual Postman testing by integrating directly into your Java/Maven build cycle, running hundreds of concurrent requests in seconds, and enforcing strict JSON contract integrity.`,
    architectureDiagram: {
      title: 'REST Assured BDD Architecture Pipeline',
      layers: [
        { layer: 'Layer 1: Preconditions', name: 'given() Specification', description: 'Base URI, Headers, Query/Path Params, Auth Token, Body Payload', color: 'blue' },
        { layer: 'Layer 2: Execution', name: 'when() HTTP Action', description: 'GET, POST, PUT, PATCH, DELETE dispatch via Apache HTTP client', color: 'emerald' },
        { layer: 'Layer 3: Assertion', name: 'then() Verification', description: 'Status code, Hamcrest body assertions, response time, JSON schema', color: 'amber' },
        { layer: 'Layer 4: Modeling', name: 'Jackson / POJOs', description: 'Bidirectional serialization of Java Objects to/from JSON payloads', color: 'purple' },
      ],
      flowSummary: 'given() [Headers & Auth] ===> when() [GET/POST Request] ===> then() [Status 200 & Hamcrest Body Assertions] ===> Jackson POJO Extraction.',
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Introduction & Why Migrate from Postman to Code',
        badge: 'Core Architecture',
        summary: 'Understand the limitations of manual Postman collections in enterprise CI/CD and why code automation scales.',
        description: `While Postman GUI is excellent for manual exploratory requests, enterprise automation teams migrate to REST Assured because:
1. Postman collections are bulky JSON files that cause painful Git merge conflicts across multi-engineer teams.
2. Newman runner executes tests sequentially, while REST Assured runs 500 tests in parallel in 10 seconds via TestNG.
3. Code-based automation easily connects to databases, Kafka event streams, and cloud vaults in the same JVM.`,
        mockScreenshot: {
          windowTitle: 'Comparison: Postman GUI vs REST Assured Code',
          caption: 'Visual contrast of manual Postman GUI clicking vs automated Java BDD pipeline',
          type: 'postman-vs-code',
          codeOrOutput: `Postman GUI:
- Click "Send" button manually
- View JSON tab
- 10 tests take 15 seconds sequentially

REST Assured Code:
given().spec(reqSpec).when().get("/users/1").then().statusCode(200);
- 100 tests execute in 1.8 seconds in parallel via TestNG!
- Gates pull requests automatically in GitHub Actions CI!`,
        },
        keyTakeaways: [
          'Postman is an exploratory tool; REST Assured is an enterprise regression engine.',
          'REST Assured integrates natively with Maven, TestNG, and Allure reporting.',
        ],
      },
      {
        stepNumber: 2,
        title: 'Maven pom.xml Setup for REST Assured',
        badge: 'Dependencies',
        summary: 'Configure pom.xml with REST Assured, Jackson, TestNG, and JSON Schema Validator.',
        description: `Create a Maven project in IntelliJ or Eclipse and configure your pom.xml with the required dependencies:
1. io.rest-assured:rest-assured (Core BDD library)
2. com.fasterxml.jackson.core:jackson-databind (POJO serialization)
3. org.testng:testng (Test execution runner)
4. io.rest-assured:json-schema-validator (Contract testing)`,
        codeSnippet: {
          language: 'xml',
          caption: 'pom.xml: Complete REST Assured Dependencies',
          code: `<!-- pom.xml snippet -->
<dependencies>
    <!-- REST Assured Core -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>rest-assured</artifactId>
        <version>5.4.0</version>
        <scope>test</scope>
    </dependency>

    <!-- Jackson Databind for POJO serialization -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.17.0</version>
    </dependency>

    <!-- TestNG -->
    <dependency>
        <groupId>org.testng</groupId>
        <artifactId>testng</artifactId>
        <version>7.10.2</version>
        <scope>test</scope>
    </dependency>

    <!-- JSON Schema Validator -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>json-schema-validator</artifactId>
        <version>5.4.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>`,
        },
        keyTakeaways: [
          'Always import static io.restassured.RestAssured.* and static org.hamcrest.Matchers.* for clean DSL syntax.',
        ],
      },
      {
        stepNumber: 3,
        title: 'Writing Your First GET Request with Given-When-Then',
        badge: 'First API Test',
        summary: 'Execute a GET request, verify HTTP 200 status code, and assert JSON response fields using Hamcrest.',
        description: `Create UserApiTest.java under src/test/java. We use REST Assured's Given-When-Then DSL:
- given(): Specifies base URI and Content-Type.
- when(): Dispatches the HTTP GET request to /users/1.
- then(): Asserts status code is 200 and validates fields with Hamcrest equalTo().`,
        mockScreenshot: {
          windowTitle: 'Run Console: GET Request Verification',
          caption: 'Terminal output showing HTTP 200 OK and response body validation',
          type: 'terminal',
          codeOrOutput: `Request method: GET
Request URI:    https://jsonplaceholder.typicode.com/users/1
Headers:        Content-Type=application/json

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
{
  "id": 1,
  "name": "Leanne Graham",
  "username": "Bret",
  "email": "Sincere@april.biz"
}

PASSED: testGetUserById`,
        },
        codeSnippet: {
          language: 'java',
          caption: 'UserApiTest.java: First GET Request Script',
          code: `package com.intelligentqa.api;

import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class UserApiTest {

    @Test
    public void testGetUserById() {
        given()
            .baseUri("https://jsonplaceholder.typicode.com")
            .header("Content-Type", "application/json")
        .when()
            .get("/users/1")
        .then()
            .statusCode(200)
            .body("id", equalTo(1))
            .body("username", equalTo("Bret"))
            .body("email", containsString("@"))
            .time(lessThan(2000L)); // SLA response time verification
    }
}`,
        },
        keyTakeaways: [
          'Always verify status code first before evaluating body attributes.',
          'Use .time(lessThan(2000L)) to enforce API performance standards.',
        ],
      },
      {
        stepNumber: 4,
        title: 'Complete CRUD Operations (POST, PUT, DELETE)',
        badge: 'CRUD Operations',
        summary: 'Send JSON payloads with POST to create entities, PUT to update, and DELETE to remove.',
        description: `Automating full CRUD lifecycles is essential for testing stateful microservices.
1. POST: Sends a JSON payload in body() and asserts HTTP 201 Created.
2. PUT: Modifies an existing resource and asserts HTTP 200 OK.
3. DELETE: Deletes an entity and asserts HTTP 204 No Content or HTTP 200.`,
        codeSnippet: {
          language: 'java',
          caption: 'CrudApiTests.java: Full CRUD Suite',
          code: `package com.intelligentqa.api;

import io.restassured.http.ContentType;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class CrudApiTests {
    private static final String BASE_URL = "https://jsonplaceholder.typicode.com";

    @Test
    public void testCreateUser() {
        String requestBody = "{\\"name\\": \\"Jane Doe\\", \\"username\\": \\"janedoe\\", \\"email\\": \\"jane@qa.com\\"}";

        given()
            .baseUri(BASE_URL)
            .contentType(ContentType.JSON)
            .body(requestBody)
        .when()
            .post("/users")
        .then()
            .statusCode(201)
            .body("name", equalTo("Jane Doe"))
            .body("id", notNullValue());
    }

    @Test
    public void testDeleteUser() {
        given()
            .baseUri(BASE_URL)
        .when()
            .delete("/users/1")
        .then()
            .statusCode(200);
    }
}`,
        },
        keyTakeaways: [
          'Set contentType(ContentType.JSON) explicitly when dispatching POST and PUT payloads.',
          'Extract dynamic IDs from POST responses using extract().path("id") to chain into subsequent GET or DELETE requests.',
        ],
      },
      {
        stepNumber: 5,
        title: 'POJO Serialization & Deserialization with Jackson',
        badge: 'Data Modeling',
        summary: 'Replace fragile string concatenation with strongly typed Java classes and Jackson Object Mapper.',
        description: `Manual testers often start by writing JSON strings: String json = "{\\"name\\":\\"" + name + "\\"}";. This causes escaped quote syntax errors and zero compile-time safety. 

Jackson automatically maps Java POJOs or Java 17 Records to JSON request bodies, and deserializes JSON response bodies back into typed Java objects:
UserResponse user = response.as(UserResponse.class);`,
        codeSnippet: {
          language: 'java',
          caption: 'UserPojoTest.java: Type-Safe API Testing',
          code: `package com.intelligentqa.api;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.restassured.http.ContentType;
import org.testng.Assert;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.given;

// POJO Model
@JsonIgnoreProperties(ignoreUnknown = true)
class UserModel {
    private String name;
    private String job;

    public UserModel() {}
    public UserModel(String name, String job) { this.name = name; this.job = job; }
    public String getName() { return name; }
    public String getJob() { return job; }
}

public class UserPojoTest {

    @Test
    public void testCreateWithPojo() {
        UserModel userRequest = new UserModel("Jane SDET", "Automation Architect");

        UserModel userResponse = given()
            .baseUri("https://jsonplaceholder.typicode.com")
            .contentType(ContentType.JSON)
            .body(userRequest) // Jackson serializes POJO to JSON
        .when()
            .post("/users")
        .then()
            .statusCode(201)
            .extract()
            .as(UserModel.class); // Deserializes JSON into Java object

        Assert.assertEquals(userResponse.getName(), "Jane SDET");
        Assert.assertEquals(userResponse.getJob(), "Automation Architect");
    }
}`,
        },
        keyTakeaways: [
          'Always annotate models with @JsonIgnoreProperties(ignoreUnknown = true) to prevent breaking on new API fields.',
          'POJOs eliminate string-formatting bugs and provide full IDE autocomplete.',
        ],
      },
      {
        stepNumber: 6,
        title: 'RequestSpecification, ResponseSpecification & Schema Testing',
        badge: 'Enterprise DRY',
        summary: 'Centralize reusable headers, base URIs, and JSON schema validation across hundreds of tests.',
        description: `In an enterprise suite of 500+ endpoints, repeating headers and URLs violates DRY (Don't Repeat Yourself). Use RequestSpecBuilder and ResponseSpecBuilder to build shared templates, and validate response contracts using json-schema-validator.`,
        codeSnippet: {
          language: 'java',
          caption: 'SpecsAndSchemaTest.java: Specification and Schema Validation',
          code: `package com.intelligentqa.api;

import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import io.restassured.specification.ResponseSpecification;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

public class SpecsAndSchemaTest {
    private RequestSpecification reqSpec;
    private ResponseSpecification resSpec;

    @BeforeClass
    public void setup() {
        reqSpec = new RequestSpecBuilder()
            .setBaseUri("https://jsonplaceholder.typicode.com")
            .setContentType(ContentType.JSON)
            .build();

        resSpec = new ResponseSpecBuilder()
            .expectStatusCode(200)
            .expectContentType(ContentType.JSON)
            .build();
    }

    @Test
    public void testUserContractSchema() {
        given()
            .spec(reqSpec)
        .when()
            .get("/users/1")
        .then()
            .spec(resSpec)
            // Validates entire JSON response contract against schema file
            .body(matchesJsonSchemaInClasspath("schemas/user-schema.json"));
    }
}`,
        },
        keyTakeaways: [
          'RequestSpecification and ResponseSpecification keep test classes clean and DRY.',
          'JSON Schema validation catches breaking API contract changes before client apps fail.',
        ],
      },
    ],
  },

  // ==========================================
  // AI FOR QA & AUTONOMOUS AGENTS TUTORIAL
  // ==========================================
  'ai-qa': {
    trackId: 'ai-qa',
    title: 'AI for QA & Autonomous Testing: Complete Step-by-Step Masterclass',
    subtitle: 'Comprehensive guide covering AI prompt engineering for SDETs, synthetic test data generation, self-healing locators, CI/CD failure triage, LLM evaluation, and autonomous QA agents.',
    overview: `Artificial Intelligence is fundamentally revolutionizing quality engineering. AI does not replace manual testers—rather, manual testers who master AI agents and test automation will replace those who do not. This step-by-step masterclass takes you from foundational prompt engineering and synthetic test data generation through self-healing locators and autonomous QA agents integrated into continuous delivery pipelines.`,
    architectureDiagram: {
      title: 'Autonomous AI-Augmented QA Lifecycle Architecture',
      layers: [
        { layer: 'Layer 1: Input Ingestion', name: 'Jira Story & Acceptance Criteria', description: 'Parse product specs, Gherkin scenarios, and boundary constraints directly from tickets', color: 'cyan' },
        { layer: 'Layer 2: Reasoning Engine', name: 'Gemini LLM Cognitive Layer', description: 'Few-shot prompting, structured schema output, and boundary test synthesis', color: 'purple' },
        { layer: 'Layer 3: Self-Healing & Scaffolding', name: 'DOM Fingerprinting & POM', description: 'Multi-attribute element similarity scoring (tag, text, role, hierarchy) for resilient locators', color: 'emerald' },
        { layer: 'Layer 4: Autonomous Execution', name: 'Playwright & MCP CI/CD Loop', description: 'Headless browser execution, trace log triage, and automated GitHub PR patch generation', color: 'amber' },
      ],
      flowSummary: 'User Story Ingestion ===> LLM Cognitive Strategy ===> Synthetic Data & POM Code ===> Playwright Headless Run ===> Self-Healing & Triage CI/CD Loop.',
    },
    steps: [
      {
        stepNumber: 1,
        title: 'The AI Mindset Shift: From Manual Tester to AI Quality Architect',
        badge: 'Mental Model',
        summary: 'Understand the role of Generative AI in software quality and how to transition from repetitive manual clicking to strategic quality orchestration.',
        description: `Manual testers spend up to 70% of their time writing repetitive test cases, clicking identical UI flows, and manually entering test data. Generative AI flips this dynamic:
1. AI handles the rote mechanical synthesis (writing boilerplate assertions, generating 100 variations of test data, drafting Gherkin feature files).
2. The QA Engineer acts as the Quality Architect: defining domain constraints, verifying boundary coverage, spotting edge-case omissions, and orchestrating autonomous test pipelines.
3. Instead of writing tests from scratch, you review, refine, and validate AI-generated test scaffolding in minutes.`,
        mockScreenshot: {
          windowTitle: 'Mental Model: Manual Tester vs AI-Augmented SDET',
          caption: 'Visual workflow transformation from manual repetitive clicking to high-leverage AI orchestration',
          type: 'terminal',
          codeOrOutput: `Traditional Manual QA Workflow:
[Read Jira Ticket] -> [Spend 4 hours drafting 25 test cases in Excel] -> [Manually click form 25 times]

AI-Augmented QA Architect Workflow:
[Jira Acceptance Criteria]
   |
   v [Role-Context-Constraint Prompt]
[Gemini LLM Engine] -> Synthesizes 50 BDD Scenarios + Boundary Matrices + SQL Injection vectors in 3 seconds!
   |
   v [Human SDET Quality Review]
[1-Click Playwright Code Generation & CI/CD Pipeline Execution]`,
        },
        keyTakeaways: [
          'AI handles repetitive synthesis; human engineers provide domain judgment and strategic governance.',
          'Learning prompt engineering and AI tool integration is the fastest path from manual QA to high-earning SDET.',
        ],
      },
      {
        stepNumber: 2,
        title: 'Precision Prompt Engineering for Test Case Generation',
        badge: 'Prompt Craft',
        summary: 'Master the Role-Context-Constraint-Format (RCCF) prompting framework for generating exhaustive, production-grade test cases.',
        description: `Generic prompts like "write test cases for checkout" produce shallow, generic bullet points that miss critical production bugs. The RCCF framework guarantees deep, edge-case-dense output:
- [ROLE]: Tell the AI who it is (e.g. Principal SDET & Security Specialist).
- [CONTEXT]: Provide domain context (e.g. Stripe 3D Secure checkout with coupon discounts).
- [CONSTRAINTS]: Mandate specific coverage (e.g. 3 happy paths, 4 boundary edge cases, 2 security attack vectors).
- [FORMAT]: Specify exact output schema (e.g. Gherkin BDD with Given-When-Then and Acceptance Criteria).`,
        codeSnippet: {
          language: 'markdown',
          caption: 'sdet-prompt-template.md: Production SDET Prompt Blueprint',
          code: `[ROLE]: Principal SDET & Security Specialist
[CONTEXT]: Fintech checkout portal with 2FA OTP verification and Stripe tokenization
[INPUTS]: email (string), password (bcrypt), otp_pin (6 digits), coupon_code (optional)
[RULES & CONSTRAINTS]:
1. Include 3 positive happy paths, 4 boundary value edge cases (e.g. 128-char password, expired OTP, invalid Luhn card).
2. Include 2 security test scenarios (SQL injection and XSS payload injection in email field).
3. Do NOT provide generic placeholders. Use realistic test values.
[OUTPUT FORMAT]:
Gherkin BDD format:
Feature: <Feature Name>
  Scenario: <TC-ID> <Scenario Title>
    Given <Precondition>
    When <Action>
    Then <Assertion>`,
        },
        keyTakeaways: [
          'Always provide Role, Context, Constraints, and Output Format in your prompts.',
          'Ask explicitly for boundary edge cases and security attack vectors to expose hidden vulnerabilities.',
        ],
      },
      {
        stepNumber: 3,
        title: 'AI Synthetic Test Data Generation & Zero-PII Compliance',
        badge: 'Data Strategy',
        summary: 'Generate high-fidelity, boundary-dense synthetic test datasets without violating GDPR or risking customer data breaches.',
        description: `Copying production customer databases into staging or QA test environments violates privacy laws (GDPR, CCPA, HIPAA) and exposes companies to multi-million-dollar fines. AI allows QA teams to generate synthetic datasets that perfectly mirror production schema distributions, relational foreign keys, and edge cases with zero actual customer PII.`,
        codeSnippet: {
          language: 'typescript',
          caption: 'synthetic-data-generator.ts: Schema-Constrained Synthetic Data with Zod',
          code: `import { z } from 'zod';

// Define strict schema constraints for synthetic user generator
export const UserPersonaSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2).max(50),
  email: z.string().email(),
  birthDate: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  accountTier: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
  balance: z.number().min(0).max(100000),
  creditCardLuhnValid: z.string().regex(/^\\d{16}$/),
  testTag: z.enum(['HAPPY_PATH', 'BOUNDARY_MAX', 'UNICODE_NAME', 'SECURITY_INJECTION']),
});

export type UserPersona = z.infer<typeof UserPersonaSchema>;

// Example AI prompt output adheres 100% to this schema for programmatic injection!`,
        },
        keyTakeaways: [
          'Never use real customer data in staging or automated test runs.',
          'Use schema validation libraries (Zod / JSON Schema) to validate AI-generated datasets before injecting into databases.',
        ],
      },
      {
        stepNumber: 4,
        title: 'Self-Healing Locators & Resilient DOM Fingerprinting',
        badge: 'Self-Healing',
        summary: 'Eliminate 80% of test maintenance flakiness by implementing multi-attribute heuristic locator matching.',
        description: `In traditional automation frameworks, whenever a frontend engineer modifies a CSS class or updates a button ID from "login-btn-v1" to "btn-submit-v2", test runs throw NoSuchElementException and halt the deployment pipeline.
Self-healing engines resolve this by capturing a multi-attribute fingerprint during test authoring:
1. Accessibility Role (role="button")
2. Accessible Name / Text Content ("Sign In")
3. Parent Element Hierarchy (<form class="auth-form">)
4. Tag Name & ARIA Attributes (aria-label, data-testid)
When the primary selector fails, the engine scans DOM candidates, calculates a Levenshtein/cosine similarity score, and executes the click if confidence exceeds 85%.`,
        codeSnippet: {
          language: 'typescript',
          caption: 'self-healing-engine.ts: Multi-Attribute Similarity Matching',
          code: `export interface ElementFingerprint {
  primarySelector: string;
  role: string;
  text: string;
  tag: string;
  parentClass?: string;
}

export function findBestMatch(candidates: Element[], target: ElementFingerprint): { element: Element; confidence: number } | null {
  let bestMatch: Element | null = null;
  let highestScore = 0;

  for (const el of candidates) {
    let score = 0;
    if (el.tagName.toLowerCase() === target.tag.toLowerCase()) score += 0.25;
    if (el.getAttribute('role') === target.role) score += 0.30;
    if (el.textContent?.trim().toLowerCase() === target.text.toLowerCase()) score += 0.35;
    if (target.parentClass && el.parentElement?.className.includes(target.parentClass)) score += 0.10;

    if (score > highestScore && score >= 0.80) {
      highestScore = score;
      bestMatch = el;
    }
  }

  return bestMatch ? { element: bestMatch, confidence: highestScore } : null;
}`,
        },
        keyTakeaways: [
          'Self-healing prevents false-positive test failures when frontend styling changes.',
          'Prioritize accessibility roles and user-facing text over brittle CSS IDs or hierarchical XPaths.',
        ],
      },
      {
        stepNumber: 5,
        title: 'AI Failure Triage & Root Cause Analysis in CI/CD',
        badge: 'Observability',
        summary: 'Automatically diagnose failed test traces, distinguish environment flakes from genuine regression bugs, and draft Jira tickets.',
        description: `When an enterprise suite of 1,000 tests executes in CI/CD, 10-15 tests might fail. Manually sifting through thousands of lines of terminal logs, network HAR files, and browser console errors takes hours.
An AI triage agent ingests the failure stack trace, the Playwright trace filmstrip, and the Git commit diff:
1. Analyzes the exception (e.g. HTTP 504 Gateway Timeout vs AssertionError).
2. Categorizes the failure: Infrastructure Flake, Test Script Bug, or Genuine Application Regression.
3. If genuine, drafts a complete Jira bug ticket with reproduction steps, exact payload, and console errors.`,
        codeSnippet: {
          language: 'typescript',
          caption: 'ci-failure-triage-agent.ts: Intelligent Stack Trace Triage',
          code: `import { GoogleGenAI } from '@google/genai';

export async function triageTestFailure(errorStack: string, gitDiff: string, networkLogs: string) {
  const ai = new GoogleGenAI();
  const prompt = \`
Analyze this CI test failure and determine the root cause:
[ERROR STACK]: \${errorStack}
[RECENT COMMIT DIFF]: \${gitDiff}
[NETWORK HAR / LOGS]: \${networkLogs}

Classify into one of:
- BUG: Application regression introduced by commit
- FLAKE: Network timeout or slow third-party dependency
- SCRIPT_ISSUE: Outdated test selector or invalid test assertion

Provide:
1. Root Cause Summary (2 sentences)
2. Confidence Score (0-100%)
3. Recommended Resolution\`;

  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text;
}`,
        },
        keyTakeaways: [
          'AI failure triage cuts regression analysis time from hours to minutes.',
          'Correlating test failures with recent Git commit diffs pinpoints the exact line of application code responsible.',
        ],
      },
      {
        stepNumber: 6,
        title: 'Testing AI Applications: Hallucination & RAG Guardrails',
        badge: 'LLM Testing',
        summary: 'Learn how to test AI chatbots, Copilots, and RAG pipelines using LLM-as-a-Judge and deterministic assertion harnesses.',
        description: `Testing software that contains LLMs requires a new testing paradigm. Unlike traditional deterministic software where input "2 + 2" always returns "4", LLM outputs are non-deterministic.
To test AI applications effectively, QA engineers implement:
1. LLM-as-a-Judge: A second, more capable model (e.g. Gemini 2.5 Pro) evaluates the application output against strict rubrics (Faithfulness, Groundedness, Toxicity, Prompt Injection Defense).
2. Semantic Embedding Similarity: Comparing vector cosine distance between expected answer and model response.
3. Security Red-Teaming: Systematically testing for jailbreaks, prompt injection, and unauthorized data exfiltration.`,
        codeSnippet: {
          language: 'typescript',
          caption: 'llm-evaluator.ts: LLM-as-a-Judge Assertion Harness',
          code: `export interface EvaluationRubric {
  faithfulness: boolean; // Does the answer strictly rely on provided document context?
  noHallucination: boolean; // Did the model avoid inventing facts?
  noPiiLeak: boolean; // Did the model avoid printing sensitive user records?
}

export async function evaluateLLMResponse(userPrompt: string, contextDocs: string, modelOutput: string): Promise<{ passed: boolean; score: number; reason: string }> {
  // Judge prompt passes rubrics and extracts structured evaluation
  const judgePrompt = \`
[EVALUATION PROMPT]: Rate the response on a scale of 1-5 for faithfulness and hallucination.
Context: \${contextDocs}
User Query: \${userPrompt}
Model Response: \${modelOutput}
\`;
  // Return deterministic pass/fail based on rubric threshold
  return { passed: true, score: 0.95, reason: "Response 100% grounded in provided context documents." };
}`,
        },
        keyTakeaways: [
          'Traditional exact string matching fails on AI responses; use semantic evaluation and LLM-as-a-Judge rubrics.',
          'Always test AI applications for prompt injection attacks and unauthorized data exfiltration.',
        ],
      },
      {
        stepNumber: 7,
        title: 'Autonomous QA Agents & Model Context Protocol (MCP) in CI/CD',
        badge: 'Future SDET',
        summary: 'Orchestrate autonomous multi-agent QA workflows where agents write tests, run headless browsers, fix broken locators, and open pull requests.',
        description: `The pinnacle of AI in software testing is the Autonomous QA Agent. By leveraging the Model Context Protocol (MCP), an AI agent can safely interact with local tools, run commands, inspect the DOM tree, execute Playwright scripts, and open GitHub pull requests with zero human intervention.
The autonomous agent loop:
1. Ingests Jira ticket acceptance criteria.
2. Scaffolds Page Object Model code and test specs.
3. Runs the test suite via terminal tools.
4. If a test fails, inspects DOM snapshots and heals the locator.
5. Re-runs the test to verify a green pass.
6. Pushes a Git branch and creates a pull request for human sign-off!`,
        mockScreenshot: {
          windowTitle: 'Autonomous QA Agent CI/CD Terminal Loop',
          caption: 'Autonomous agent executing test suite, detecting locator failure, healing in real time, and passing the build',
          type: 'terminal',
          codeOrOutput: `[AI QA Agent]: Reading Jira Ticket PROJ-482 "Update Checkout 2FA Flow"...
[AI QA Agent]: Scaffolding Playwright spec 'tests/checkout-2fa.spec.ts'...
[AI QA Agent]: Executing: npx playwright test tests/checkout-2fa.spec.ts
[Playwright]: Running 1 test using 1 worker...
[Playwright]: ⚠️ Timeout 5000ms waiting for locator('#checkout-pay-btn')
[AI QA Agent]: Primary locator failed. Calling tool 'inspect_dom_tree'...
[AI QA Agent]: Found matching button: <button data-testid="submit-payment">Pay Now</button>
[AI QA Agent]: Confidence: 96.8%. Updating Page Object locator to page.getByTestId('submit-payment')...
[AI QA Agent]: Re-running test...
[Playwright]: ✔ tests/checkout-2fa.spec.ts passed (1.4s)
[AI QA Agent]: Git commit: "fix(qa): self-heal checkout button locator"
[AI QA Agent]: Pull Request #142 opened successfully on GitHub!`,
        },
        keyTakeaways: [
          'Model Context Protocol (MCP) connects AI reasoning engines with real execution tools (Playwright, Git, Terminal).',
          'Autonomous QA agents do not replace testers—they handle the mechanical fixes, freeing engineers to focus on architectural excellence.',
        ],
      },
    ],
  },
};
