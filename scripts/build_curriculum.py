import json
import os

def generate():
    tracks = [
        # =========================================================================
        # COURSE 1: Selenium WebDriver + Java (26 Hours · 10 Lessons)
        # =========================================================================
        {
            "id": "selenium-java",
            "title": "Selenium WebDriver + Java",
            "tagline": "Enterprise SDET & Java Framework Design",
            "description": "Master Core Java OOPs, Selenium WebDriver 4, TestNG data-driven suites, synchronization, and PageFactory architecture.",
            "color": "amber",
            "badgeColor": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
            "iconName": "Terminal",
            "totalLessons": 10,
            "estimatedHours": 26,
            "modules": [
                {
                    "id": "java-oops-qa",
                    "trackId": "selenium-java",
                    "title": "Core Java OOPs & Selenium Framework Architecture",
                    "description": "Enterprise test architecture from object-oriented programming to synchronization and parallel execution.",
                    "order": 1,
                    "lessons": [
                        {
                            "id": "java-oops-framework",
                            "title": "1. Core Java OOPs for Automation",
                            "desc": "Map Encapsulation, Inheritance, Polymorphism, and Abstraction directly to QA framework architecture.",
                            "mins": 150, # 2.5h
                            "level": "Beginner",
                            "manualTitle": "Manual Tester Mental Model",
                            "steps": ["Every test needs browser launch, maximize, cookies clear, and teardown.", "Copying setup code across 100 classes causes chaos."],
                            "pains": ["Copy-pasting 'new ChromeDriver()' into every test creates memory leaks and unmaintainable code."],
                            "pwCode": "import { test } from '@playwright/test';\ntest('login', async ({ page }) => { await page.goto('/login'); });",
                            "selCode": "// Inheritance & Polymorphism in BaseTest\npublic abstract class BaseTest {\n    protected WebDriver driver;\n    @BeforeMethod\n    public void setUp() {\n        driver = DriverFactory.getDriver(\"chrome\");\n        driver.manage().window().maximize();\n    }\n    @AfterMethod\n    public void tearDown() {\n        if (driver != null) driver.quit();\n    }\n}",
                            "expl": "Encapsulation hides WebElements inside Page Objects. Inheritance shares driver lifecycle in BaseTest. Polymorphism switches Chrome/Firefox.",
                            "best": ["Always quit WebDriver in @AfterMethod to prevent orphan browser processes", "Use ThreadLocal<WebDriver> for parallel multi-threaded runs"],
                            "anti": ["Using static WebDriver in parallel execution", "Hardcoding System.setProperty in modern Selenium 4"],
                            "prompt": "Generate a Java BaseTest class with TestNG annotations and ThreadLocal WebDriver.",
                            "instr": "Implement a BaseTest class with @BeforeMethod setUp and @AfterMethod tearDown methods.",
                            "starterJava": "public class BaseTest {\n    protected WebDriver driver;\n    // Add setUp and tearDown\n}",
                            "solJava": "public class BaseTest {\n    protected WebDriver driver;\n    @BeforeMethod\n    public void setUp() {\n        driver = new ChromeDriver();\n    }\n    @AfterMethod\n    public void tearDown() {\n        if (driver != null) driver.quit();\n    }\n}",
                            "reqs": ["@BeforeMethod", "setUp", "@AfterMethod", "tearDown", "driver.quit()"]
                        },
                        {
                            "id": "sel-webdriver-setup",
                            "title": "2. WebDriver 4 Architecture & Browser Setup",
                            "desc": "W3C standardization, Selenium Manager automated binary resolution, ChromeOptions, and headless execution.",
                            "mins": 150, # 2.5h
                            "level": "Beginner",
                            "manualTitle": "Manual Testing Context",
                            "steps": ["Tester launches browser with custom viewport and disables popup notifications.", "Requires testing in headless mode on Linux CI servers."],
                            "pains": ["Browser version mismatches (Chrome 126 vs driver 124) constantly broke old frameworks."],
                            "pwCode": "import { chromium } from '@playwright/test';\nconst browser = await chromium.launch({ headless: true });",
                            "selCode": "ChromeOptions options = new ChromeOptions();\noptions.addArguments(\"--headless=new\");\noptions.addArguments(\"--disable-notifications\");\nWebDriver driver = new ChromeDriver(options);\ndriver.get(\"https://intelligentqa.io\");",
                            "expl": "Selenium 4 natively resolves matching browser drivers via Selenium Manager without external driver utilities.",
                            "best": ["Use ChromeOptions for headless execution in CI/CD", "Set standardized 1920x1080 viewport dimensions"],
                            "anti": ["Hardcoding absolute paths to chromedriver.exe", "Using legacy '--headless' flag"],
                            "prompt": "Write a Selenium 4 DriverFactory in Java configuring Chrome, Firefox, and Edge with headless flags.",
                            "instr": "Configure ChromeOptions with headless=new and instantiate ChromeDriver with options.",
                            "starterJava": "public class BrowserSetup {\n    public WebDriver initChrome() {\n        // Configure ChromeOptions and return ChromeDriver\n    }\n}",
                            "solJava": "public class BrowserSetup {\n    public WebDriver initChrome() {\n        ChromeOptions options = new ChromeOptions();\n        options.addArguments(\"--headless=new\");\n        return new ChromeDriver(options);\n    }\n}",
                            "reqs": ["ChromeOptions", "--headless=new", "new ChromeDriver(options)"]
                        },
                        {
                            "id": "sel-locators-xpath",
                            "title": "3. Advanced Dynamic Locators (XPath & CSS)",
                            "desc": "Master relative XPath axes (following-sibling, ancestor, parent), text normalization, and robust CSS selectors.",
                            "mins": 180, # 3.0h
                            "level": "Intermediate",
                            "manualTitle": "Manual Verification Context",
                            "steps": ["Tester identifies a table row by customer name, then clicks the Edit button in that specific row."],
                            "pains": ["Copying absolute XPath (/html/body/div[2]/...) breaks with every frontend release."],
                            "pwCode": "await page.locator('tr', { hasText: 'John Doe' }).getByRole('button', { name: 'Edit' }).click();",
                            "selCode": "WebElement editBtn = driver.findElement(By.xpath(\n    \"//tr[td[normalize-space()='John Doe']]//button[contains(@class, 'edit')]\"\n));\neditBtn.click();",
                            "expl": "Dynamic XPath axes locate elements based on semantic relationships rather than fragile layout paths.",
                            "best": ["Anchor to stable text and navigate to relative targets using axes", "Use normalize-space() for clean text matching"],
                            "anti": ["Using absolute full XPath starting with /html", "Relying on auto-generated indexes like div[14]"],
                            "prompt": "Generate resilient relative XPath for a table row action button next to an account ID.",
                            "instr": "Write an XPath locator targeting the Delete button within a row containing 'Active'.",
                            "starterJava": "public class Locators {\n    public By getDeleteForActive() {\n        // Return By.xpath for button in row with 'Active'\n    }\n}",
                            "solJava": "public class Locators {\n    public By getDeleteForActive() {\n        return By.xpath(\"//tr[td[contains(text(), 'Active')]]//button[contains(@class, 'delete')]\");\n    }\n}",
                            "reqs": ["By.xpath", "//tr", "Active", "button"]
                        },
                        {
                            "id": "sel-webelement-actions",
                            "title": "4. WebElement Actions & Form Interactions",
                            "desc": "Handling inputs, select dropdowns (single/multi-select), checkboxes, radio buttons, and JavaScript clicks.",
                            "mins": 120, # 2.0h
                            "level": "Beginner",
                            "manualTitle": "Form Verification Flow",
                            "steps": ["Selecting country from dropdown, checking terms checkbox, clearing old values and typing new values."],
                            "pains": ["Calling sendKeys without clear appends to existing text creating invalid submissions."],
                            "pwCode": "await page.fill('#email', 'qa@intelligentqa.io');\nawait page.selectOption('#country', { label: 'United States' });",
                            "selCode": "WebElement emailInput = driver.findElement(By.id(\"email\"));\nemailInput.clear();\nemailInput.sendKeys(\"qa@intelligentqa.io\");\n\nSelect country = new Select(driver.findElement(By.id(\"country\")));\ncountry.selectByVisibleText(\"United States\");",
                            "expl": "The Select class handles dropdown options by visible text or value. Always clear text boxes before typing.",
                            "best": ["Use Select class for native select elements", "Clear inputs before sendKeys"],
                            "anti": ["Calling .click() directly on option elements", "Overusing JavaScript click when standard click works"],
                            "prompt": "Write a reusable Java helper to select dropdown options safely with error logging.",
                            "instr": "Use the Select class to choose 'Premium Plan' by visible text.",
                            "starterJava": "public class FormHelper {\n    public void selectPlan(WebElement dropdown) {\n        // Select 'Premium Plan'\n    }\n}",
                            "solJava": "public class FormHelper {\n    public void selectPlan(WebElement dropdown) {\n        Select select = new Select(dropdown);\n        select.selectByVisibleText(\"Premium Plan\");\n    }\n}",
                            "reqs": ["Select", "new Select(dropdown)", "selectByVisibleText(\"Premium Plan\")"]
                        },
                        {
                            "id": "sel-sync-waits",
                            "title": "5. Synchronization & Dynamic Waits Strategy",
                            "desc": "Eliminate flakiness: Implicit vs Explicit vs FluentWait. Solving StaleElementReferenceException.",
                            "mins": 180, # 3.0h
                            "level": "Intermediate",
                            "manualTitle": "Manual Timing Flow",
                            "steps": ["Click search, see spinner for 2 seconds, verify search results table renders."],
                            "pains": ["Hardcoded Thread.sleep(5000) makes test suites painfully slow and still flaky on slower CI runners."],
                            "pwCode": "await expect(page.locator('#spinner')).toBeHidden();\nawait page.locator('.results-row').first().click();",
                            "selCode": "WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));\nwait.until(ExpectedConditions.invisibilityOfElementLocated(By.id(\"spinner\")));\nWebElement result = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(\".results-row\")));\nresult.click();",
                            "expl": "Explicit wait evaluates conditions at polling intervals and continues immediately when satisfied.",
                            "best": ["Wait for spinners to disappear before interacting with targets", "Use FluentWait with ignored exceptions for flaky elements"],
                            "anti": ["Using Thread.sleep() in automation scripts", "Mixing Implicit and Explicit waits together"],
                            "prompt": "Refactor this flaky Selenium script with Thread.sleep to use WebDriverWait with ExpectedConditions.",
                            "instr": "Create a WebDriverWait with 10-second timeout and wait for visibility of element with ID 'dashboard'.",
                            "starterJava": "public class WaitHelper {\n    public WebElement waitForDashboard(WebDriver driver) {\n        // Return element waiting for visibility\n    }\n}",
                            "solJava": "public class WaitHelper {\n    public WebElement waitForDashboard(WebDriver driver) {\n        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));\n        return wait.until(ExpectedConditions.visibilityOfElementLocated(By.id(\"dashboard\")));\n    }\n}",
                            "reqs": ["WebDriverWait", "Duration.ofSeconds(10)", "ExpectedConditions.visibilityOfElementLocated", "By.id(\"dashboard\")"]
                        },
                        {
                            "id": "sel-actions-api",
                            "title": "6. Advanced User Interactions (Actions API)",
                            "desc": "Master mouse hover, context-click (right-click), drag and drop, and keyboard shortcuts with Actions class.",
                            "mins": 120, # 2.0h
                            "level": "Intermediate",
                            "manualTitle": "Complex Gestures",
                            "steps": ["Hovering over user avatar to reveal menu, dragging cards in a Kanban board."],
                            "pains": ["Standard .click() fails on elements that are rendered only during active mouse hover."],
                            "pwCode": "await page.hover('#user-avatar');\nawait page.dragAndDrop('#card-1', '#done-col');",
                            "selCode": "Actions actions = new Actions(driver);\nactions.moveToElement(driver.findElement(By.id(\"user-avatar\"))).perform();\nactions.dragAndDrop(sourceElem, targetElem).perform();",
                            "expl": "Actions builds sequences of user gestures. Calling .perform() executes the entire gesture chain.",
                            "best": ["Always call .perform() to execute Actions sequences", "Wait for menus to render after moveToElement"],
                            "anti": ["Forgetting .perform() resulting in silent non-execution"],
                            "prompt": "Write a Selenium Java Actions snippet to perform drag and drop between two Kanban columns.",
                            "instr": "Use Actions to hover over an element and click a sub-item.",
                            "starterJava": "public class ActionHelper {\n    public void hoverAndClick(WebDriver driver, WebElement menu, WebElement item) {\n        // Hover then click\n    }\n}",
                            "solJava": "public class ActionHelper {\n    public void hoverAndClick(WebDriver driver, WebElement menu, WebElement item) {\n        Actions actions = new Actions(driver);\n        actions.moveToElement(menu).click(item).perform();\n    }\n}",
                            "reqs": ["new Actions(driver)", "moveToElement", "perform()"]
                        },
                        {
                            "id": "sel-frames-windows-shadow",
                            "title": "7. Frames, Windows & Shadow DOM Handling",
                            "desc": "Navigate nested iframes, switch between multi-browser tabs/windows, and pierce native Shadow DOM in Selenium 4.",
                            "mins": 150, # 2.5h
                            "level": "Advanced",
                            "manualTitle": "Multi-Context Verification",
                            "steps": ["Entering card details in Stripe iframe, clicking terms link that opens in a new browser tab."],
                            "pains": ["WebDriver searches only the top-level DOM; iframe elements throw NoSuchElementException unless switched."],
                            "pwCode": "await page.frameLocator('iframe.payment').locator('#card').fill('424242424242');",
                            "selCode": "// Switch to iframe and return\ndriver.switchTo().frame(driver.findElement(By.cssSelector(\"iframe.payment\")));\ndriver.findElement(By.id(\"card\")).sendKeys(\"424242424242\");\ndriver.switchTo().defaultContent();\n\n// Selenium 4 Shadow DOM\nSearchContext shadow = driver.findElement(By.id(\"picker\")).getShadowRoot();\nshadow.findElement(By.cssSelector(\"button.now\")).click();",
                            "expl": "Selenium requires explicit context switching. Always return to defaultContent() after iframe actions.",
                            "best": ["Always return to defaultContent() immediately after iframe interactions", "Store parent window handle before opening new tabs"],
                            "anti": ["Using numeric frame index (switchTo.frame(0)) which breaks when ads inject hidden iframes"],
                            "prompt": "Write a Selenium 4 helper that accesses a shadow DOM element using getShadowRoot().",
                            "instr": "Switch into an iframe, click an element, and switch back to defaultContent.",
                            "starterJava": "public class FrameHelper {\n    public void clickInFrame(WebDriver driver, WebElement frame, By target) {\n        // Switch to frame, click target, revert to defaultContent\n    }\n}",
                            "solJava": "public class FrameHelper {\n    public void clickInFrame(WebDriver driver, WebElement frame, By target) {\n        driver.switchTo().frame(frame);\n        driver.findElement(target).click();\n        driver.switchTo().defaultContent();\n    }\n}",
                            "reqs": ["driver.switchTo().frame", "driver.switchTo().defaultContent()"]
                        },
                        {
                            "id": "sel-pom-pagefactory",
                            "title": "8. Page Object Model & PageFactory Architecture",
                            "desc": "Architect scalable test frameworks: By locators vs @FindBy PageFactory annotations, method chaining, and clean separation.",
                            "mins": 210, # 3.5h
                            "level": "Advanced",
                            "manualTitle": "Maintainable Test Suites",
                            "steps": ["Login -> Product Catalog -> Cart -> Payment. If button changes, updating 50 test files wastes days."],
                            "pains": ["Spreading raw driver.findElement() calls across test files makes maintenance an unbearable chore."],
                            "pwCode": "export class CheckoutPage {\n  constructor(private readonly page: Page) {}\n  readonly applyBtn = this.page.locator('#apply');\n}",
                            "selCode": "public class CheckoutPage {\n    private final WebDriver driver;\n    private final By couponInput = By.id(\"coupon\");\n    private final By applyBtn = By.id(\"apply\");\n    public CheckoutPage(WebDriver driver) { this.driver = driver; }\n    public CheckoutPage applyCoupon(String code) {\n        driver.findElement(couponInput).sendKeys(code);\n        driver.findElement(applyBtn).click();\n        return this;\n    }\n}",
                            "expl": "Page Object Model encapsulates web locators and actions. UI changes are modified in 1 Page Object without touching tests.",
                            "best": ["Keep locators private to enforce encapsulation", "Never put assertions inside Page Objects"],
                            "anti": ["Exposing public WebElements to test classes", "Writing Assert.assertEquals inside Page Object action methods"],
                            "prompt": "Generate a Selenium Java Page Object class with private By locators, constructor, and fluent methods.",
                            "instr": "Implement a LoginPage class with private By locators, constructor, and login(user, pass) method.",
                            "starterJava": "public class LoginPage {\n    private WebDriver driver;\n    // Add locators and login method\n}",
                            "solJava": "public class LoginPage {\n    private WebDriver driver;\n    private By userInput = By.id(\"username\");\n    private By passInput = By.id(\"password\");\n    private By loginBtn = By.id(\"login\");\n    public LoginPage(WebDriver driver) { this.driver = driver; }\n    public void login(String user, String pass) {\n        driver.findElement(userInput).sendKeys(user);\n        driver.findElement(passInput).sendKeys(pass);\n        driver.findElement(loginBtn).click();\n    }\n}",
                            "reqs": ["LoginPage(WebDriver driver)", "driver.findElement", "login(", "sendKeys"]
                        },
                        {
                            "id": "sel-testng-parallel",
                            "title": "9. TestNG Suite & Parallel Multi-Threading",
                            "desc": "Master testng.xml, @DataProvider for data-driven testing, @Parameters, ThreadLocal<WebDriver>, and parallel suites.",
                            "mins": 180, # 3.0h
                            "level": "Senior",
                            "manualTitle": "Data-Driven Scenarios",
                            "steps": ["Testing registration with 10 different dataset variations (valid, invalid email, max length)."],
                            "pains": ["Sequential execution takes 1 hour. Parallel execution without ThreadLocal causes browser session collisions."],
                            "pwCode": "test.describe.configure({ mode: 'parallel' });",
                            "selCode": "public class DriverFactory {\n    private static final ThreadLocal<WebDriver> tlDriver = new ThreadLocal<>();\n    public static WebDriver getDriver() { return tlDriver.get(); }\n    public static void setDriver(WebDriver d) { tlDriver.set(d); }\n    public static void quitDriver() {\n        if (tlDriver.get() != null) { tlDriver.get().quit(); tlDriver.remove(); }\n    }\n}",
                            "expl": "ThreadLocal isolates WebDriver instances per worker thread, enabling TestNG to run suites in parallel safely.",
                            "best": ["Always call tlDriver.remove() in teardown to prevent thread pool memory leaks", "Use parallel='methods' in testng.xml"],
                            "anti": ["Using public static WebDriver driver in parallel frameworks"],
                            "prompt": "Write a thread-safe ThreadLocal DriverFactory with support for Chrome and Firefox.",
                            "instr": "Implement ThreadLocal getter and setter in DriverFactory.",
                            "starterJava": "public class DriverFactory {\n    private static ThreadLocal<WebDriver> tlDriver = new ThreadLocal<>();\n    // Implement getDriver and setDriver\n}",
                            "solJava": "public class DriverFactory {\n    private static ThreadLocal<WebDriver> tlDriver = new ThreadLocal<>();\n    public static WebDriver getDriver() { return tlDriver.get(); }\n    public static void setDriver(WebDriver driver) { tlDriver.set(driver); }\n}",
                            "reqs": ["tlDriver.get()", "tlDriver.set(driver)"]
                        },
                        {
                            "id": "sel-listeners-reports-cicd",
                            "title": "10. Listeners, Screenshots & Maven CI/CD Execution",
                            "desc": "Implement ITestListener, automatic screenshot capture on test failure, ExtentReports / Allure, and Maven CI/CD integration.",
                            "mins": 120, # 2.0h
                            "level": "Senior",
                            "manualTitle": "Defect Reporting",
                            "steps": ["When a bug is found, manual tester takes a screenshot, logs browser console errors, and files a Jira issue."],
                            "pains": ["Nightly CI tests failing without screenshots force testers to manually reproduce errors from scratch."],
                            "pwCode": "// screenshot: 'only-on-failure', trace: 'retain-on-failure'",
                            "selCode": "public class TestListener implements ITestListener {\n    @Override\n    public void onTestFailure(ITestResult result) {\n        WebDriver driver = DriverFactory.getDriver();\n        File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);\n        // Copy to reports/screenshots/\n    }\n}",
                            "expl": "ITestListener intercepts the exact moment a test fails, taking a screenshot and recording stack traces into HTML reports.",
                            "best": ["Embed base64 failure screenshots directly into ExtentReports", "Execute tests via Maven surefire plugin in CI"],
                            "anti": ["Swallowing exceptions in test methods with catch blocks that mark failures as PASSED"],
                            "prompt": "Write a TestNG ITestListener class that captures failure screenshots and attaches them to ExtentReports.",
                            "instr": "Capture a screenshot as a File using TakesScreenshot onTestFailure.",
                            "starterJava": "public class FailureListener implements ITestListener {\n    public void onTestFailure(ITestResult result) {\n        // Capture screenshot\n    }\n}",
                            "solJava": "public class FailureListener implements ITestListener {\n    public void onTestFailure(ITestResult result) {\n        WebDriver driver = DriverFactory.getDriver();\n        File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);\n    }\n}",
                            "reqs": ["TakesScreenshot", "getScreenshotAs(OutputType.FILE)"]
                        }
                    ]
                }
            ]
        },

        # =========================================================================
        # COURSE 2: Playwright + TypeScript (24 Hours · 12 Lessons)
        # =========================================================================
        {
            "id": "playwright-ts",
            "title": "Playwright + TypeScript",
            "tagline": "Modern High-Speed Web & Component Automation",
            "description": "Master fast, reliable end-to-end automation with TypeScript, modern locators, auto-waiting, Page Object Models, and CI/CD pipelines.",
            "color": "emerald",
            "badgeColor": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
            "iconName": "PlayCircle",
            "totalLessons": 12,
            "estimatedHours": 24,
            "modules": [
                {
                    "id": "pw-fundamentals",
                    "trackId": "playwright-ts",
                    "title": "TypeScript Foundations & Playwright Core Architecture",
                    "description": "From async/await to resilient locators, auto-waiting, fixtures, and network mocking.",
                    "order": 1,
                    "lessons": [
                        {
                            "id": "pw-ts-basics",
                            "title": "1. TypeScript Essentials & Async/Await",
                            "desc": "Understand promises, asynchronous execution, and why UI automation demands async/await.",
                            "mins": 120, # 2.0h
                            "level": "Beginner",
                            "manualTitle": "Manual Verification Flow",
                            "steps": ["Open login page, wait for spinner to disappear, enter credentials, press enter, confirm dashboard."],
                            "pains": ["Manual testing is sequential; code executes in microseconds. Without 'await', code races ahead before page responds!"],
                            "pwCode": "import { test, expect } from '@playwright/test';\ntest('login', async ({ page }) => {\n  await page.goto('/login');\n  await page.locator('#email').fill('sdet@tech.io');\n  await page.locator('button[type=\"submit\"]').click();\n  await expect(page).toHaveURL(/.*dashboard/);\n});",
                            "selCode": "driver.get(\"https://intelligentqa.io/login\");",
                            "expl": "Every browser action returns a Promise. Prepending await pauses JavaScript execution until the promise settles.",
                            "best": ["Always await page actions and expect() assertions", "Use TypeScript interfaces for typed test data"],
                            "anti": ["Forgetting await leading to unhandled promise rejections"],
                            "prompt": "Convert this synchronous test into Playwright TypeScript async/await.",
                            "instr": "Write an asynchronous Playwright test that navigates to '/login' and clicks submit.",
                            "starterJava": "",
                            "starterTs": "import { test } from '@playwright/test';\ntest('nav', async ({ page }) => {\n  // Navigate and click\n});",
                            "solJava": "",
                            "solTs": "import { test } from '@playwright/test';\ntest('nav', async ({ page }) => {\n  await page.goto('/login');\n  await page.click('button[type=\"submit\"]');\n});",
                            "reqs": ["await page.goto", "await page.click"]
                        },
                        {
                            "id": "pw-setup-arch",
                            "title": "2. Playwright Architecture & Project Scaffold",
                            "desc": "Understand browser processes, isolated browser contexts, workers, and playwright.config.ts tuning.",
                            "mins": 90, # 1.5h
                            "level": "Beginner",
                            "manualTitle": "Multi-Context Verification",
                            "steps": ["Testing multiple user roles (Admin vs Guest) in isolated incognito sessions."],
                            "pains": ["Launching full browser processes for every test adds 5 seconds per test in Selenium."],
                            "pwCode": "import { defineConfig, devices } from '@playwright/test';\nexport default defineConfig({\n  fullyParallel: true,\n  use: { trace: 'retain-on-failure' },\n});",
                            "selCode": "// Requires separate browser processes in Selenium",
                            "expl": "Playwright uses a single browser process with lightweight isolated BrowserContexts created in under 10ms.",
                            "best": ["Set fullyParallel: true for ultra-fast multi-core runs", "Configure trace: 'retain-on-failure' in CI"],
                            "anti": ["Manually managing browser processes instead of worker fixtures"],
                            "prompt": "Generate an enterprise playwright.config.ts with retry policies and trace recording.",
                            "instr": "Define a Playwright config with fullyParallel set to true and trace set to 'retain-on-failure'.",
                            "starterJava": "",
                            "starterTs": "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  // Add config\n});",
                            "solJava": "",
                            "solTs": "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  fullyParallel: true,\n  use: { trace: 'retain-on-failure' }\n});",
                            "reqs": ["fullyParallel: true", "trace: 'retain-on-failure'"]
                        },
                        {
                            "id": "pw-auto-waiting",
                            "title": "3. Auto-Waiting & Web-First Assertions",
                            "desc": "Why Playwright tests never need sleep: actionability checks (visible, stable, enabled) and expect() polling.",
                            "mins": 120, # 2.0h
                            "level": "Beginner",
                            "manualTitle": "Dynamic UI Timing",
                            "steps": ["Clicking an element after a 500ms CSS animation or AJAX request finishes."],
                            "pains": ["Selenium throws ElementClickInterceptedException if clicked mid-animation. Playwright waits automatically!"],
                            "pwCode": "await page.locator('#submit-btn').click(); // Auto-waits for visible, stable, enabled!\nawait expect(page.locator('.toast')).toBeVisible({ timeout: 5000 });",
                            "selCode": "wait.until(ExpectedConditions.elementToBeClickable(By.id(\"submit-btn\"))).click();",
                            "expl": "Playwright checks 5 actionability criteria before executing actions. Web-first assertions poll until the assertion succeeds.",
                            "best": ["Use web-first expect(locator).toBeVisible()", "Trust auto-waiting before adding manual timeouts"],
                            "anti": ["Using page.waitForTimeout(5000)", "Using non-retrying boolean assertions"],
                            "prompt": "Refactor these boolean asserts to Playwright web-first assertions with auto-retries.",
                            "instr": "Use a web-first assertion to assert that #success-banner is visible.",
                            "starterJava": "",
                            "starterTs": "async function verify(page) {\n  // Assert visibility of #success-banner\n}",
                            "solJava": "",
                            "solTs": "async function verify(page) {\n  await expect(page.locator('#success-banner')).toBeVisible();\n}",
                            "reqs": ["await expect", "page.locator", "toBeVisible()"]
                        },
                        {
                            "id": "pw-resilient-locators",
                            "title": "4. Resilient Locators & User-Facing Roles",
                            "desc": "Master getByRole, getByText, getByLabel, getByTestId, and CSS chaining for rock-solid element targeting.",
                            "mins": 120, # 2.0h
                            "level": "Intermediate",
                            "manualTitle": "User Perception Testing",
                            "steps": ["Find input labeled 'Work Email', click button 'Log In', verify 'Welcome' banner."],
                            "pains": ["If frontend changes div.col-4 > input to flexbox, CSS/XPath locators break instantly."],
                            "pwCode": "await page.getByRole('button', { name: 'Log In' }).click();\nawait page.getByLabel('Work Email').fill('sdet@qa.io');\nawait expect(page.getByText('Welcome back')).toBeVisible();",
                            "selCode": "driver.findElement(By.xpath(\"//button[contains(text(), 'Log In')]\")).click();",
                            "expl": "Playwright prioritizes accessible roles and user-facing text, ensuring tests remain stable across CSS refactorings.",
                            "best": ["Default to getByRole(role, { name }) first", "Use getByLabel for forms"],
                            "anti": ["Using hashed CSS classes like .css-1a7bc8e", "Writing deep fragile CSS paths"],
                            "prompt": "Inspect this React component and generate resilient Playwright locators using getByRole.",
                            "instr": "Use getByRole to locate a button with accessible name 'Sign In' and click it.",
                            "starterJava": "",
                            "starterTs": "async function submit(page) {\n  // Click 'Sign In' button using getByRole\n}",
                            "solJava": "",
                            "solTs": "async function submit(page) {\n  await page.getByRole('button', { name: 'Sign In' }).click();\n}",
                            "reqs": ["page.getByRole", "'button'", "Sign In", "click()"]
                        },
                        {
                            "id": "pw-shadow-iframes",
                            "title": "5. Shadow DOM Piercing & Nested Iframes",
                            "desc": "Automatic shadow root piercing without JavaScript hacks, frameLocator for secure payment widgets, and cross-origin handling.",
                            "mins": 120, # 2.0h
                            "level": "Intermediate",
                            "manualTitle": "Embedded Widgets",
                            "steps": ["Interacting with Stripe credit card iframes or web components in shadow roots."],
                            "pains": ["In Selenium, developers had to write custom JavaScript to penetrate shadow roots."],
                            "pwCode": "// Playwright automatically pierces shadow DOM!\nawait page.locator('#shadow-toggle').click();\n// frameLocator for nested iframes:\nawait page.frameLocator('iframe.stripe').getByPlaceholder('Card Number').fill('424242424242');",
                            "selCode": "driver.switchTo().frame(driver.findElement(By.cssSelector(\"iframe.stripe\")));",
                            "expl": "Playwright pierces open shadow roots automatically. For iframes, frameLocator() provides seamless targeting without focus switching.",
                            "best": ["Chain frameLocator instances for deeply nested iframes", "Avoid switching global browser focus"],
                            "anti": ["Executing manual querySelector scripts to reach shadow roots"],
                            "prompt": "Write a Playwright test filling credit card inputs inside an iframe using frameLocator.",
                            "instr": "Use frameLocator to target '#payment-frame' and fill input 'card-cvv'.",
                            "starterJava": "",
                            "starterTs": "async function fill(page) {\n  // Use frameLocator on #payment-frame\n}",
                            "solJava": "",
                            "solTs": "async function fill(page) {\n  await page.frameLocator('#payment-frame').locator('input[name=\"card-cvv\"]').fill('123');\n}",
                            "reqs": ["page.frameLocator('#payment-frame')", "fill"]
                        },
                        {
                            "id": "pw-pom-design",
                            "title": "6. Modern Page Object Model (POM)",
                            "desc": "Class-based Page Objects with readonly locators, atomic action methods, and TypeScript return type guarantees.",
                            "mins": 150, # 2.5h
                            "level": "Intermediate",
                            "manualTitle": "Reusable Workflows",
                            "steps": ["Executing multi-step checkout: Login -> Catalog -> Cart -> Payment."],
                            "pains": ["Writing raw page.click() calls in 100 test files creates a maintenance disaster when URLs change."],
                            "pwCode": "export class TransferPage {\n  readonly fromSelect: Locator;\n  readonly amountInput: Locator;\n  constructor(private readonly page: Page) {\n    this.fromSelect = page.getByLabel('Transfer From');\n    this.amountInput = page.getByLabel('Amount ($)');\n  }\n  async transfer(from: string, amount: string) {\n    await this.fromSelect.selectOption(from);\n    await this.amountInput.fill(amount);\n  }\n}",
                            "selCode": "// Class-based POM in Java",
                            "expl": "Playwright Page Objects store lazy Locator declarations. No network requests are made until an action is called.",
                            "best": ["Declare locators as readonly Locator properties in constructor", "Keep assertions inside test files"],
                            "anti": ["Calling await inside Page Object constructors", "Returning raw element handles"],
                            "prompt": "Generate a TypeScript Page Object class for this user settings page with readonly Locators.",
                            "instr": "Create a SearchPage class with searchInput locator, submitBtn locator, and search(query) method.",
                            "starterJava": "",
                            "starterTs": "import { Page, Locator } from '@playwright/test';\nexport class SearchPage {\n  // Implement class\n}",
                            "solJava": "",
                            "solTs": "import { Page, Locator } from '@playwright/test';\nexport class SearchPage {\n  readonly page: Page;\n  readonly searchInput: Locator;\n  readonly submitBtn: Locator;\n  constructor(page: Page) {\n    this.page = page;\n    this.searchInput = page.locator('#search');\n    this.submitBtn = page.getByRole('button', { name: 'Search' });\n  }\n  async search(query: string) {\n    await this.searchInput.fill(query);\n    await this.submitBtn.click();\n  }\n}",
                            "reqs": ["readonly searchInput", "constructor(page: Page)", "async search(query: string)"]
                        },
                        {
                            "id": "pw-fixtures",
                            "title": "7. Custom Test Fixtures & Page Setup Hooks",
                            "desc": "Leverage test.extend() for dependency injection: auto-instantiated Page Objects, logged-in user fixtures, and zero-boilerplate tests.",
                            "mins": 120, # 2.0h
                            "level": "Advanced",
                            "manualTitle": "Setup Boilerplate",
                            "steps": ["Every test in admin suite requires logging in and navigating to settings."],
                            "pains": ["Repeating beforeEach boilerplate across dozens of spec files causes copy-paste errors."],
                            "pwCode": "import { test as base } from '@playwright/test';\nimport { TransferPage } from './TransferPage';\n\nexport const test = base.extend<{ transferPage: TransferPage }>({\n  transferPage: async ({ page }, use) => {\n    const transferPage = new TransferPage(page);\n    await page.goto('/transfer');\n    await use(transferPage);\n  },\n});",
                            "selCode": "// Implemented via BaseTest in Java",
                            "expl": "Fixtures provide lazy, isolated dependency injection for tests, handling setup and teardown automatically.",
                            "best": ["Create fixtures for frequently used Page Objects and API clients", "Use fixtures for authentication setups"],
                            "anti": ["Overloading beforeEach with sequential steps that could be modular fixtures"],
                            "prompt": "Write a Playwright test.extend fixture that auto-authenticates an admin user.",
                            "instr": "Extend base test with a custom fixture named 'dashboardPage'.",
                            "starterJava": "",
                            "starterTs": "import { test as base } from '@playwright/test';\nexport const test = base.extend({\n  // Add dashboardPage fixture\n});",
                            "solJava": "",
                            "solTs": "import { test as base } from '@playwright/test';\nexport const test = base.extend({\n  dashboardPage: async ({ page }, use) => {\n    await page.goto('/dashboard');\n    await use(page);\n  }\n});",
                            "reqs": ["base.extend", "dashboardPage", "await use("]
                        },
                        {
                            "id": "pw-network-mocking",
                            "title": "8. Network Interception & Route Mocking",
                            "desc": "Master page.route() to mock API responses, simulate 500 server errors, test slow 3G networks, and abort heavy third-party assets.",
                            "mins": 150, # 2.5h
                            "level": "Advanced",
                            "manualTitle": "Edge-Case Simulation",
                            "steps": ["Testing how frontend behaves when payment gateway returns 503 or network drops."],
                            "pains": ["You cannot take down production payment servers just to test negative frontend states."],
                            "pwCode": "await page.route('**/api/v1/profile', async (route) => {\n  await route.fulfill({\n    status: 200,\n    body: JSON.stringify({ name: 'Alex', role: 'ADMIN' }),\n  });\n});\n// Abort heavy trackers:\nawait page.route('**/{google-analytics}/**', route => route.abort());",
                            "selCode": "// Requires complex proxy tools (BrowserMob) in Selenium",
                            "expl": "page.route() intercepts network requests at the browser layer, enabling deterministic API response mocking.",
                            "best": ["Mock flaky third-party APIs during frontend regression", "Abort ads and analytics to speed up execution by 3x"],
                            "anti": ["Mocking internal APIs when the actual test goal is end-to-end integration"],
                            "prompt": "Write a Playwright page.route mock that returns an empty results list to test zero-state UI.",
                            "instr": "Use page.route to intercept '**/api/transactions' and return status 500.",
                            "starterJava": "",
                            "starterTs": "async function mockError(page) {\n  // Intercept and return 500\n}",
                            "solJava": "",
                            "solTs": "async function mockError(page) {\n  await page.route('**/api/transactions', async (route) => {\n    await route.fulfill({ status: 500, body: JSON.stringify({ error: 'Down' }) });\n  });\n}",
                            "reqs": ["page.route", "**/api/transactions", "route.fulfill", "status: 500"]
                        },
                        {
                            "id": "pw-auth-storage-state",
                            "title": "9. Auth State Sharing (StorageState)",
                            "desc": "Log in once during global setup, save cookies and localStorage to storageState.json, and reuse across 1,000 parallel tests.",
                            "mins": 120, # 2.0h
                            "level": "Advanced",
                            "manualTitle": "Session Reuse",
                            "steps": ["Logging into an application once and navigating directly to deep protected routes."],
                            "pains": ["Logging in via UI 500 times in a test suite adds 25 minutes of unnecessary execution."],
                            "pwCode": "// auth.setup.ts\nawait page.goto('/login');\nawait page.getByLabel('Email').fill('user@qa.io');\nawait page.getByRole('button', { name: 'Log in' }).click();\nawait page.context().storageState({ path: 'playwright/.auth/user.json' });",
                            "selCode": "// Managing session cookies manually in Selenium",
                            "expl": "storageState saves cookies and localStorage to a JSON file. Worker contexts load it in 1ms, bypassing UI login.",
                            "best": ["Add auth JSON files to .gitignore to avoid committing tokens", "Create separate storageState for different user roles"],
                            "anti": ["Testing login UI inside tests that require authenticated state"],
                            "prompt": "Configure Playwright storageState setup project for automated multi-role authentication.",
                            "instr": "Save context storageState to 'auth.json'.",
                            "starterJava": "",
                            "starterTs": "async function save(context) {\n  // Save storageState to 'auth.json'\n}",
                            "solJava": "",
                            "solTs": "async function save(context) {\n  await context.storageState({ path: 'auth.json' });\n}",
                            "reqs": ["context.storageState", "path: 'auth.json'"]
                        },
                        {
                            "id": "pw-multi-browser-mobile",
                            "title": "10. Multi-Browser & Mobile Emulation Testing",
                            "desc": "Run automated suites across Chromium, Firefox, WebKit (Safari), and mobile devices (iPhone 14, Pixel 7) with touch emulation.",
                            "mins": 90, # 1.5h
                            "level": "Intermediate",
                            "manualTitle": "Responsive & Safari Checks",
                            "steps": ["Opening Safari on macOS and resizing viewport to test hamburger menus on mobile."],
                            "pains": ["Cross-browser testing triples execution time if done manually."],
                            "pwCode": "// In playwright.config.ts:\nimport { devices } from '@playwright/test';\nexport default {\n  projects: [\n    { name: 'Mobile Safari', use: { ...devices['iPhone 14 Pro'], isMobile: true } },\n    { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } },\n  ],\n};",
                            "selCode": "// Selenium grid setup with DesiredCapabilities",
                            "expl": "Playwright bundles real open-source Chromium, Firefox, and WebKit binaries. Emulation simulates screen dimensions and touch.",
                            "best": ["Use isMobile fixture to assert mobile-specific UI like drawer menus", "Run WebKit tests in CI to catch Safari layout bugs"],
                            "anti": ["Testing only in Chrome and assuming it works in Safari"],
                            "prompt": "Generate Playwright device emulation profiles for iPad tablet and Android devices.",
                            "instr": "Conditionally assert visibility of #mobile-drawer if isMobile is true.",
                            "starterJava": "",
                            "starterTs": "async function check(page, isMobile) {\n  // Assert visibility of #mobile-drawer if isMobile\n}",
                            "solJava": "",
                            "solTs": "async function check(page, isMobile) {\n  if (isMobile) {\n    await expect(page.locator('#mobile-drawer')).toBeVisible();\n  }\n}",
                            "reqs": ["if (isMobile)", "await expect", "#mobile-drawer", "toBeVisible()"]
                        },
                        {
                            "id": "pw-trace-viewer",
                            "title": "11. Playwright Trace Viewer & Video Debugging",
                            "desc": "Time-travel debugging: inspect exact DOM snapshots before and after every action, review network requests, console logs, and videos.",
                            "mins": 120, # 2.0h
                            "level": "Senior",
                            "manualTitle": "Bug Reproduction",
                            "steps": ["Investigating why a test failed on CI by replaying the exact steps leading to failure."],
                            "pains": ["CI test failures with only console logs are notoriously difficult to debug."],
                            "pwCode": "// Open trace via CLI:\n// npx playwright show-trace trace.zip\nawait context.tracing.start({ screenshots: true, snapshots: true });\n// ... run steps ...\nawait context.tracing.stop({ path: 'trace.zip' });",
                            "selCode": "// Requires custom screenshot and network logging listeners in Selenium",
                            "expl": "Trace Viewer records DOM snapshots, network waterfalls, action timelines, and console output for time-travel debugging.",
                            "best": ["Configure trace: 'retain-on-failure' to save disk space while debugging all failures", "Upload trace.zip as CI artifact"],
                            "anti": ["Recording traces on every passed test in production"],
                            "prompt": "Analyze this Playwright trace error log to diagnose why the locator click timed out.",
                            "instr": "Start tracing on a browser context with screenshots and snapshots enabled.",
                            "starterJava": "",
                            "starterTs": "async function record(context) {\n  // Start tracing\n}",
                            "solJava": "",
                            "solTs": "async function record(context) {\n  await context.tracing.start({ screenshots: true, snapshots: true });\n}",
                            "reqs": ["context.tracing.start", "screenshots: true", "snapshots: true"]
                        },
                        {
                            "id": "pw-ci-sharding",
                            "title": "12. Parallel Sharding & GitHub Actions CI/CD",
                            "desc": "Run 500 tests in 4 minutes using test sharding (--shard=1/4), matrix builds, artifact merging, and automated Slack notifications.",
                            "mins": 120, # 2.0h
                            "level": "Architect",
                            "manualTitle": "Release Velocity",
                            "steps": ["Waiting for full regression suite to pass before deploying to production."],
                            "pains": ["Running 500 tests on a single machine takes 40 minutes, delaying deployments."],
                            "pwCode": "# In GitHub Actions matrix:\n# run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}",
                            "selCode": "// Selenium grid with distributed Hub and Nodes",
                            "expl": "Playwright sharding divides test suites evenly across multiple cloud VM runners. 4 shards run 4x faster.",
                            "best": ["Use GitHub Actions matrix strategy for horizontal scaling", "Merge blob reports from all shards using merge-reports"],
                            "anti": ["Setting fail-fast: true in test matrix (cancels other shards before full results gather)"],
                            "prompt": "Generate a GitHub Actions workflow that shards Playwright tests across 4 runners.",
                            "instr": "Return the Playwright CLI flag for shard 1 of 4.",
                            "starterJava": "",
                            "starterTs": "function getShard(): string {\n  return '';\n}",
                            "solJava": "",
                            "solTs": "function getShard(): string {\n  return '--shard=1/4';\n}",
                            "reqs": ["--shard=1/4"]
                        }
                    ]
                }
            ]
        },

        # =========================================================================
        # COURSE 3: REST Assured & API Automation (18 Hours · 8 Lessons)
        # =========================================================================
        {
            "id": "api-testing",
            "title": "REST Assured & API Automation",
            "tagline": "Postman to Code: Contract Testing, Microservices & Auth",
            "description": "Master REST Assured, Given-When-Then BDD syntax, JSONPath assertions, POJO serialization, OAuth2/JWT auth, and CI/CD pipelines.",
            "color": "purple",
            "badgeColor": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
            "iconName": "Server",
            "totalLessons": 8,
            "estimatedHours": 18,
            "modules": [
                {
                    "id": "api-fundamentals",
                    "trackId": "api-testing",
                    "title": "REST Architecture & Automated Contract Validation",
                    "description": "From Postman manual testing to automated REST Assured suites, POJOs, and JSON schema verification.",
                    "order": 1,
                    "lessons": [
                        {
                            "id": "api-rest-basics",
                            "title": "1. REST Fundamentals & Postman Transition",
                            "desc": "Understand HTTP request headers, query parameters, path params, status codes, and mapping Postman collections to code.",
                            "mins": 120, # 2.0h
                            "level": "Beginner",
                            "manualTitle": "Manual Postman Testing",
                            "steps": ["Open Postman, select POST, enter URL, write JSON body, click Send, verify 200 OK."],
                            "pains": ["Postman collections are hard to version control and integrate into developer PR pipelines."],
                            "pwCode": "const response = await request.get('/api/users', { params: { status: 'active' } });\nexpect(response.status()).toBe(200);",
                            "selCode": "",
                            "restCode": "RestAssured.baseURI = \"https://intelligentqa.io/api\";\nResponse response = given()\n    .queryParam(\"status\", \"active\")\n.when()\n    .get(\"/users\")\n.then()\n    .statusCode(200)\n    .extract().response();",
                            "expl": "REST Assured provides a domain-specific language in Java that reads like plain English while executing real HTTP calls.",
                            "best": ["Centralize baseURI in an APIBase class", "Verify both HTTP status code and response payload structure"],
                            "anti": ["Hardcoding hostnames inside every single test method"],
                            "prompt": "Convert this Postman request JSON export into a REST Assured Java test class.",
                            "instr": "Set RestAssured.baseURI and write a GET request asserting 200 status code.",
                            "starterJava": "public class ApiStarter {\n    public void testGet() {\n        // Set baseURI and assert 200\n    }\n}",
                            "solJava": "public class ApiStarter {\n    public void testGet() {\n        RestAssured.baseURI = \"https://api.intelligentqa.io\";\n        RestAssured.when().get(\"/users\").then().statusCode(200);\n    }\n}",
                            "reqs": ["RestAssured.baseURI", ".when().get", ".statusCode(200)"]
                        },
                        {
                            "id": "api-given-when-then",
                            "title": "2. Given-When-Then BDD Syntax & Requests",
                            "desc": "Master the Given (preconditions), When (actions), Then (assertions) BDD pattern in automated API tests.",
                            "mins": 120, # 2.0h
                            "level": "Beginner",
                            "manualTitle": "BDD Requirement Flow",
                            "steps": ["GIVEN an API key and header, WHEN sending a request, THEN assert status is 200 and body is valid."],
                            "pains": ["Legacy Java HTTP clients require 30 lines of boilerplate to make a single GET request."],
                            "pwCode": "const res = await request.post('/api/users', { data: { name: 'New User' } });\nexpect(res.status()).toBe(201);",
                            "selCode": "",
                            "restCode": "given()\n    .header(\"Authorization\", \"Bearer \" + token)\n    .contentType(ContentType.JSON)\n    .body(\"{\\\"name\\\": \\\"New User\\\"}\")\n.when()\n    .post(\"/api/v1/users\")\n.then()\n    .statusCode(201)\n    .body(\"id\", notNullValue());",
                            "expl": "Given-When-Then structures tests into setup, action, and assertion phases. Static Hamcrest matchers keep assertions clean.",
                            "best": ["Group headers and auth into given()", "Keep HTTP method triggers in when()", "Chain assertions in then()"],
                            "anti": ["Extracting raw string response and using string.contains() for validation"],
                            "prompt": "Write a REST Assured test using Given-When-Then syntax to create a customer and assert 201 Created.",
                            "instr": "Chain given(), when(), then() to send a POST request with body and assert statusCode 201.",
                            "starterJava": "public class BddTest {\n    public void testPost() {\n        // Chain given, when, then with statusCode 201\n    }\n}",
                            "solJava": "public class BddTest {\n    public void testPost() {\n        given().body(\"{\\\"test\\\": true}\").when().post(\"/items\").then().statusCode(201);\n    }\n}",
                            "reqs": ["given()", "body(", "when().post", "then().statusCode(201)"]
                        },
                        {
                            "id": "api-rest-crud",
                            "title": "3. CRUD Operations & Status Code Assertions",
                            "desc": "Automate complete entity lifecycles: POST (Create), GET (Read), PUT/PATCH (Update), DELETE with 200, 201, 204, 404 assertions.",
                            "mins": 150, # 2.5h
                            "level": "Intermediate",
                            "manualTitle": "Manual CRUD Flow",
                            "steps": ["Create item (POST 201) -> Read item (GET 200) -> Delete item (DELETE 204) -> Verify gone (GET 404)."],
                            "pains": ["Manual CRUD testing takes 5 minutes per run and leaves dirty test records in the database."],
                            "pwCode": "const res = await request.post('/api/tickets', { data: { title: 'Bug' } });\nconst { id } = await res.json();\nconst del = await request.delete(`/api/tickets/${id}`);\nexpect(del.status()).toBe(204);",
                            "selCode": "",
                            "restCode": "String id = given().contentType(ContentType.JSON).body(\"{\\\"title\\\": \\\"Bug\\\"}\")\n    .when().post(\"/api/tickets\").then().statusCode(201).extract().path(\"id\");\n\ngiven().pathParam(\"id\", id)\n    .when().delete(\"/api/tickets/{id}\").then().statusCode(204);",
                            "expl": "Automating end-to-end CRUD guarantees full state lifecycle verification and keeps the environment clean.",
                            "best": ["Use pathParam() rather than string concatenation", "Verify negative cases (404 on deleted items)"],
                            "anti": ["Leaving created test records in staging databases without teardown"],
                            "prompt": "Generate an end-to-end CRUD lifecycle test suite in REST Assured with automatic ID chaining.",
                            "instr": "Send a DELETE request to '/api/items/{id}' with pathParam and assert status code 204.",
                            "starterJava": "public class DeleteHelper {\n    public void deleteItem(String id) {\n        // Send DELETE with pathParam id and verify 204\n    }\n}",
                            "solJava": "public class DeleteHelper {\n    public void deleteItem(String id) {\n        given().pathParam(\"id\", id).when().delete(\"/api/items/{id}\").then().statusCode(204);\n    }\n}",
                            "reqs": ["pathParam(\"id\", id)", ".delete(\"/api/items/{id}\")", "statusCode(204)"]
                        },
                        {
                            "id": "api-request-specs",
                            "title": "4. Request & Response Specification Reusability",
                            "desc": "Eliminate duplicate headers: build reusable RequestSpecBuilder and ResponseSpecBuilder instances for framework modularity.",
                            "mins": 120, # 2.0h
                            "level": "Intermediate",
                            "manualTitle": "Shared Headers",
                            "steps": ["Setting Authorization and Content-Type headers at collection level in Postman."],
                            "pains": ["Copy-pasting .header('Authorization', ...) into 200 test methods creates massive technical debt."],
                            "pwCode": "const apiContext = await request.newContext({ baseURL: 'https://api.io', extraHTTPHeaders: { 'Auth': token } });",
                            "selCode": "",
                            "restCode": "RequestSpecification requestSpec = new RequestSpecBuilder()\n    .setBaseUri(\"https://intelligentqa.io/api\")\n    .addHeader(\"Authorization\", \"Bearer \" + token)\n    .setContentType(ContentType.JSON)\n    .build();\n\ngiven().spec(requestSpec).when().get(\"/users\").then().statusCode(200);",
                            "expl": "RequestSpecBuilder and ResponseSpecBuilder encapsulate shared headers, logging filters, and SLA thresholds.",
                            "best": ["Build separate adminSpec and guestSpec for role-based testing", "Include response time assertions in response specs"],
                            "anti": ["Repeating baseUrl and auth headers in every single test method"],
                            "prompt": "Write a reusable REST Assured SpecFactory providing authenticated RequestSpecification instances.",
                            "instr": "Create a RequestSpecification using RequestSpecBuilder with baseUri and ContentType.JSON.",
                            "starterJava": "public class SpecHelper {\n    public RequestSpecification createSpec(String uri) {\n        // Build RequestSpecification\n    }\n}",
                            "solJava": "public class SpecHelper {\n    public RequestSpecification createSpec(String uri) {\n        return new RequestSpecBuilder().setBaseUri(uri).setContentType(ContentType.JSON).build();\n    }\n}",
                            "reqs": ["RequestSpecBuilder", "setBaseUri", "setContentType(ContentType.JSON)", "build()"]
                        },
                        {
                            "id": "api-json-path",
                            "title": "5. JSONPath Querying & Deep Payload Validation",
                            "desc": "Extract nested attributes, parse arrays, filter collections with Groovy expressions (findAll, collect), and assert schema nodes.",
                            "mins": 150, # 2.5h
                            "level": "Intermediate",
                            "manualTitle": "Deep Payload Verification",
                            "steps": ["Verifying that item ID 105 in a 50-item array has price $49.99 and stock > 0."],
                            "pains": ["Manually scanning 500 lines of JSON in Postman response window is slow and error-prone."],
                            "pwCode": "const data = await response.json();\nconst item = data.items.find(i => i.id === 105);\nexpect(item.price).toBe(49.99);",
                            "selCode": "",
                            "restCode": "Response res = get(\"/api/orders/101\");\nString city = res.jsonPath().getString(\"customer.address.city\");\nfloat price = res.jsonPath().get(\"items.find { it.name == 'Mouse' }.price\");",
                            "expl": "REST Assured integrates Groovy GPath syntax for deep querying, filtering, and aggregation on JSON trees without manual loops.",
                            "best": ["Use jsonPath().get('items.find { it.id == target }') to locate specific objects", "Verify list sizes before inspecting elements"],
                            "anti": ["Using regex or string parsing on JSON payloads"],
                            "prompt": "Write a REST Assured JSONPath query to filter users with balance > 1000 and extract their emails.",
                            "instr": "Use jsonPath() to extract string value at path 'user.profile.email'.",
                            "starterJava": "public class JsonPathHelper {\n    public String getEmail(Response res) {\n        // Return email from jsonPath\n    }\n}",
                            "solJava": "public class JsonPathHelper {\n    public String getEmail(Response res) {\n        return res.jsonPath().getString(\"user.profile.email\");\n    }\n}",
                            "reqs": ["res.jsonPath()", "getString(\"user.profile.email\")"]
                        },
                        {
                            "id": "api-pojo-serialization",
                            "title": "6. POJO Serialization & Deserialization (Jackson)",
                            "desc": "Type-safe API automation: Jackson object mapping, builder pattern for test data payloads, and deserializing responses into Java models.",
                            "mins": 150, # 2.5h
                            "level": "Advanced",
                            "manualTitle": "Payload Construction",
                            "steps": ["Typing JSON payloads into Postman body tabs with quotes, brackets, and commas."],
                            "pains": ["Constructing JSON strings with manual string concatenation leads to typo errors and syntax breaks."],
                            "pwCode": "interface UserReq { name: string; email: string; }\nconst res = await request.post('/api/users', { data: { name: 'Jordan' } });",
                            "selCode": "",
                            "restCode": "UserRequest newUser = new UserRequest(\"Jordan Lee\", \"jordan@qa.io\");\nUserResponse created = given()\n    .contentType(ContentType.JSON)\n    .body(newUser) // Auto-serialized by Jackson\n.when().post(\"/api/users\")\n.then().statusCode(201).extract().as(UserResponse.class);",
                            "expl": "Object mapping converts Java POJOs into JSON payloads and responses back into typed Java objects automatically.",
                            "best": ["Use Lombok (@Data, @Builder) to keep POJOs clean and maintainable", "Deserialize error responses into ErrorResponse POJOs"],
                            "anti": ["Writing JSON bodies as escaped raw strings (\\\"name\\\": \\\"value\\\") in test code"],
                            "prompt": "Generate Java POJO classes with Jackson annotations and Lombok builder for this API payload schema.",
                            "instr": "Send a POST request passing a POJO into body and deserialize into UserResponse.class.",
                            "starterJava": "public class PojoHelper {\n    public UserResponse create(UserRequest req) {\n        // Send POST with POJO body and extract as UserResponse.class\n    }\n}",
                            "solJava": "public class PojoHelper {\n    public UserResponse create(UserRequest req) {\n        return given().contentType(ContentType.JSON).body(req).when().post(\"/users\").then().extract().as(UserResponse.class);\n    }\n}",
                            "reqs": [".body(req)", ".extract().as(UserResponse.class)"]
                        },
                        {
                            "id": "api-auth-tokens",
                            "title": "7. Auth Tokens (JWT, OAuth2 & API Keys)",
                            "desc": "Automate authentication flows: logging in to extract JWT tokens, refreshing expired tokens, and injecting Bearer headers.",
                            "mins": 150, # 2.5h
                            "level": "Advanced",
                            "manualTitle": "Token Management",
                            "steps": ["Logging in via Postman, copying the Bearer token, and pasting it into other requests."],
                            "pains": ["JWT tokens expire every 15 minutes. Manual testers waste time re-logging in and re-pasting tokens."],
                            "pwCode": "const loginRes = await request.post('/api/auth/login', { data: { user, pass } });\nconst { token } = await loginRes.json();",
                            "selCode": "",
                            "restCode": "String token = given().body(\"{\\\"email\\\": \\\"admin@qa.io\\\", \\\"pass\\\": \\\"123\\\"}\")\n    .post(\"/api/auth/login\").jsonPath().getString(\"token\");\n\ngiven().auth().oauth2(token).when().get(\"/api/details\").then().statusCode(200);",
                            "expl": "Automating token retrieval and refresh eliminates manual token handling and keeps suites running seamlessly.",
                            "best": ["Cache tokens and refresh only when near expiration", "Inject credentials via environment variables"],
                            "anti": ["Re-authenticating via login API on every single test method (adds massive latency)"],
                            "prompt": "Write a thread-safe token manager in Java that handles OAuth2 token caching with auto-refresh.",
                            "instr": "Use RestAssured auth().oauth2(token) to authenticate a GET request to '/api/secure'.",
                            "starterJava": "public class SecureApi {\n    public void callSecure(String token) {\n        // GET /api/secure with oauth2 token\n    }\n}",
                            "solJava": "public class SecureApi {\n    public void callSecure(String token) {\n        given().auth().oauth2(token).when().get(\"/api/secure\").then().statusCode(200);\n    }\n}",
                            "reqs": [".auth().oauth2(token)", ".get(\"/api/secure\")"]
                        },
                        {
                            "id": "api-schema-validation",
                            "title": "8. JSON Schema Validation & CI/CD Regression",
                            "desc": "Enforce API contract stability: validate response schemas against JSON Schema Draft v7 to catch breaking API changes before production.",
                            "mins": 120, # 2.0h
                            "level": "Senior",
                            "manualTitle": "Contract Stability",
                            "steps": ["Verifying that response has all required fields and correct data types (number vs string)."],
                            "pains": ["If backend changes userId: 101 to userId: '101', frontend mobile apps crash in production!"],
                            "pwCode": "import { z } from 'zod';\nconst UserSchema = z.object({ id: z.number(), name: z.string() });",
                            "selCode": "",
                            "restCode": "import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;\n\nwhen().get(\"/api/users/1\")\n.then().statusCode(200)\n.body(matchesJsonSchemaInClasspath(\"schemas/user-schema.json\"));",
                            "expl": "JSON Schema Validation asserts data types, required fields, and nested structures in a single line of code.",
                            "best": ["Store schema files in src/test/resources/schemas", "Run schema validation in PR pipelines to catch breaking changes"],
                            "anti": ["Writing 50 individual field assertions when a JSON schema validates the entire contract"],
                            "prompt": "Generate a valid JSON Schema Draft-07 specification from this sample API response.",
                            "instr": "Validate that response body matches 'schemas/product.json' using matchesJsonSchemaInClasspath.",
                            "starterJava": "public class SchemaTest {\n    public void testSchema() {\n        // Verify response matches schemas/product.json\n    }\n}",
                            "solJava": "public class SchemaTest {\n    public void testSchema() {\n        when().get(\"/products/1\").then().body(matchesJsonSchemaInClasspath(\"schemas/product.json\"));\n    }\n}",
                            "reqs": ["matchesJsonSchemaInClasspath(\"schemas/product.json\")"]
                        }
                    ]
                }
            ]
        },

        # =========================================================================
        # COURSE 4: Step-by-Step AI for QA Professionals (20 Hours · 8 Lessons)
        # =========================================================================
        {
            "id": "ai-qa",
            "title": "Step-by-Step AI for QA Professionals",
            "tagline": "The 8-Step Progressive AI Journey for Manual QA",
            "description": "A transformative 8-step journey for manual testers: prompt engineering, synthetic test data generation, self-healing locators, autonomous QA agents, and testing LLM applications.",
            "color": "cyan",
            "badgeColor": "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800",
            "iconName": "Sparkles",
            "totalLessons": 8,
            "estimatedHours": 20,
            "modules": [
                {
                    "id": "ai-qa-journey",
                    "trackId": "ai-qa",
                    "title": "The 8-Step Progressive AI Journey for Manual QA",
                    "description": "From mental shift and prompt architecture to self-healing automation and testing Generative AI.",
                    "order": 1,
                    "lessons": [
                        {
                            "id": "step-0-demystifying-ai",
                            "title": "1. Step 0: Demystifying AI for QA (The Mental Shift)",
                            "desc": "Understand what AI can and cannot do: transitioning from manual test executor to AI-augmented Quality Architect.",
                            "mins": 120, # 2.0h
                            "level": "Beginner",
                            "manualTitle": "Manual Tester Mental Shift",
                            "steps": ["Old Way: Writing 15 test cases in Excel and executing them click-by-click.", "New Way: Prompting AI for 50 edge-case permutations, applying domain critical thinking, and automating resilient scripts."],
                            "pains": ["Fear of AI replacing testers: AI does not replace QA testers; QAs who use AI replace QAs who do not!"],
                            "pwCode": "// AI generates repetitive permutations; the SDET designs the architecture and security boundaries.",
                            "selCode": "",
                            "restCode": "",
                            "expl": "View AI as a tireless junior SDET. You provide strict system instructions and domain context, while the AI generates test permutations.",
                            "best": ["Never trust AI outputs blindly; always verify generated locators against real DOM", "Focus human energy on boundary conditions and risk"],
                            "anti": ["Pasting sensitive customer PII or company secrets into public AI chats"],
                            "prompt": "Act as a Senior SDET. Analyze this requirement and identify 5 high-risk edge cases that manual testers typically overlook.",
                            "instr": "Write a professional SDET prompt template asking AI to identify 5 edge-case failure modes for a feature.",
                            "starterJava": "",
                            "starterTs": "function createPrompt(feature: string): string {\n  return '';\n}",
                            "solJava": "",
                            "solTs": "function createPrompt(feature: string): string {\n  return `Act as a Senior SDET. Analyze ${feature} and list 5 edge-case failure scenarios.`;\n}",
                            "reqs": ["Senior SDET", "edge-case", "feature"]
                        },
                        {
                            "id": "step-1-prompt-engineering",
                            "title": "2. Step 1: Prompt Engineering Mastery for Testers",
                            "desc": "Master few-shot prompting, system instructions, Gherkin output formats, and boundary value exploration.",
                            "mins": 150, # 2.5h
                            "level": "Beginner",
                            "manualTitle": "Basic vs Professional Prompting",
                            "steps": ["Weak Prompt: 'Write tests for login'.", "SDET Prompt: 'Act as Principal QA. Generate Gherkin test matrix covering valid login, expired token, lockout, and SQL injection with P0-P2 priorities.'"],
                            "pains": ["Vague prompts yield generic, useless test cases that miss real production bugs."],
                            "pwCode": "// Feature: User Authentication & Security\n// Scenario: Account lockout after 5 consecutive failed attempts\n// Given an active user account\n// When user enters invalid password 5 consecutive times\n// Then account status transitions to LOCKED",
                            "selCode": "",
                            "restCode": "",
                            "expl": "Effective prompting requires 4 ingredients: 1. Role Definition, 2. Task & Context, 3. Constraints & Edge Cases, 4. Output Schema (Markdown table, Gherkin).",
                            "best": ["Always specify output format (Markdown table or Gherkin)", "Instruct the model on what NOT to do"],
                            "anti": ["Using open-ended single-sentence prompts without context"],
                            "prompt": "System: You are an expert QA Engineer. Generate 10 boundary test cases for a currency transfer input ($0.01 min, $10,000 max).",
                            "instr": "Construct an AI prompt containing Role, Gherkin format, and edge cases constraint.",
                            "starterJava": "",
                            "starterTs": "function buildPrompt(): string {\n  return '';\n}",
                            "solJava": "",
                            "solTs": "function buildPrompt(): string {\n  return 'Role: Principal SDET. Generate Gherkin test cases for checkout with edge cases.';\n}",
                            "reqs": ["Role:", "Gherkin", "edge cases"]
                        },
                        {
                            "id": "step-2-synthetic-test-data",
                            "title": "3. Step 2: AI Synthetic Test Data Generation",
                            "desc": "Generate realistic, PII-compliant test data: valid/invalid credit cards, international phone numbers, and boundary JSON payloads.",
                            "mins": 150, # 2.5h
                            "level": "Intermediate",
                            "manualTitle": "Manual Data Creation",
                            "steps": ["Manual tester creates mock data: 'test1@test.com', '1234567890'."],
                            "pains": ["Lazy test data misses real defects: German umlauts (Müller), Arabic RTL text, and leap-year edge dates."],
                            "pwCode": "export const SYNTHETIC_DATA = [\n  { name: 'Dr. Jane Müller', locale: 'de-DE', email: 'jane.muller@example.de' },\n  { name: 'A'.repeat(255), locale: 'en-US', email: 'max_len@example.com' },\n];",
                            "selCode": "",
                            "restCode": "",
                            "expl": "AI-generated synthetic data produces realistic diversity while ensuring 100% compliance with data privacy regulations (GDPR/HIPAA).",
                            "best": ["Never use production customer data for testing", "Include extreme string boundaries (0 chars, 255 chars, 10,000 chars)"],
                            "anti": ["Using real personal emails or phone numbers in test databases"],
                            "prompt": "Generate a JSON array of 10 synthetic customer profiles with valid Luhn credit cards and international addresses.",
                            "instr": "Write a TypeScript function that validates synthetic email formats before injecting into tests.",
                            "starterJava": "",
                            "starterTs": "function isValidEmail(email: string): boolean {\n  // Validate email\n}",
                            "solJava": "",
                            "solTs": "function isValidEmail(email: string): boolean {\n  return email.includes('@') && email.includes('.');\n}",
                            "reqs": ["email.includes('@')", "email.includes('.')"]
                        },
                        {
                            "id": "step-3-ai-code-scaffolding",
                            "title": "4. Step 3: AI-Driven POM Code Scaffolding",
                            "desc": "Feed raw HTML and DOM trees into AI agents to scaffold complete Page Object Model classes with web-first assertions.",
                            "mins": 180, # 3.0h
                            "level": "Intermediate",
                            "manualTitle": "Coding Bottlenecks",
                            "steps": ["Manually inspecting 30 elements on a form, writing locators and methods takes 3 hours per page."],
                            "pains": ["Repetitive boilerplate coding burns out engineers and delays automation coverage."],
                            "pwCode": "export class RegistrationPage {\n  readonly firstName: Locator;\n  constructor(private readonly page: Page) {\n    this.firstName = page.getByLabel('First Name');\n  }\n}",
                            "selCode": "",
                            "restCode": "",
                            "expl": "AI agents transform structured HTML markup into object-oriented design patterns in seconds.",
                            "best": ["Supply the exact tech stack in prompt (Playwright TypeScript with getByRole)", "Review locators to ensure no fragile CSS was generated"],
                            "anti": ["Pasting 5,000 lines of minified JavaScript into the prompt (provide clean semantic HTML)"],
                            "prompt": "Generate a Playwright TypeScript Page Object class for this HTML form markup using getByRole and getByLabel.",
                            "instr": "Construct an AI prompt instructing the model to scaffold a Playwright Page Object Model class in TypeScript.",
                            "starterJava": "",
                            "starterTs": "function getScaffoldPrompt(html: string): string {\n  return '';\n}",
                            "solJava": "",
                            "solTs": "function getScaffoldPrompt(html: string): string {\n  return `Scaffold a Playwright Page Object Model class in TypeScript for: ${html}`;\n}",
                            "reqs": ["Playwright", "Page Object Model", "TypeScript"]
                        },
                        {
                            "id": "step-4-self-healing-locators",
                            "title": "5. Step 4: Self-Healing Locators & Visual Testing AI",
                            "desc": "Implement resilient locator fallback strategies: DOM cosine similarity, multi-attribute weighting, and visual AI regression.",
                            "mins": 150, # 2.5h
                            "level": "Advanced",
                            "manualTitle": "Brittle Locators",
                            "steps": ["Developers rename button ID from #submit-btn to #checkout-submit. Next morning 40 tests fail."],
                            "pains": ["False positives destroy trust in automated test suites."],
                            "pwCode": "export async function findResilientElement(page: Page, primary: string, role: string, name: string) {\n  try {\n    return await page.waitForSelector(primary, { timeout: 2000 });\n  } catch {\n    return page.getByRole(role as any, { name });\n  }\n}",
                            "selCode": "",
                            "restCode": "",
                            "expl": "Self-healing systems store element fingerprints (ID, text, accessibility role). If the primary ID changes, fallback queries resolve the element.",
                            "best": ["Log self-healing activations as warnings so SDETs can update locators in next PR", "Combine with visual snapshot assertions"],
                            "anti": ["Silently healing without logging (masks developer regressions)"],
                            "prompt": "Analyze this broken selector and updated DOM snapshot to identify the new selector for Submit button.",
                            "instr": "Implement try-catch fallback that tries primary selector and falls back to getByRole.",
                            "starterJava": "",
                            "starterTs": "async function safeClick(page, sel, role, name) {\n  // Try sel, fallback to getByRole\n}",
                            "solJava": "",
                            "solTs": "async function safeClick(page, sel, role, name) {\n  try {\n    await page.click(sel, { timeout: 1000 });\n  } catch {\n    await page.getByRole(role, { name }).click();\n  }\n}",
                            "reqs": ["try", "catch", "getByRole"]
                        },
                        {
                            "id": "step-5-ai-failure-triage",
                            "title": "6. Step 5: AI Failure Log Triage & Root Cause Analysis",
                            "desc": "Automate CI/CD failure analysis: feed stack traces and DOM snapshots to LLMs for automated root-cause classification and Jira bug filing.",
                            "mins": 150, # 2.5h
                            "level": "Advanced",
                            "manualTitle": "Triage Fatigue",
                            "steps": ["Nightly CI run has 15 failed tests. QA spends 2 hours reading raw logs to find root causes."],
                            "pains": ["90% of triage time is spent identifying common patterns: expired tokens or network timeouts."],
                            "pwCode": "export function classifyFailure(stackTrace: string): string {\n  if (stackTrace.includes('ERR_CONNECTION_REFUSED')) return 'INFRA_TIMEOUT';\n  if (stackTrace.includes('500 Internal Server Error')) return 'PRODUCT_BUG';\n  if (stackTrace.includes('Timeout')) return 'LOCATOR_DRIFT';\n  return 'OTHER';\n}",
                            "selCode": "",
                            "restCode": "",
                            "expl": "Automating triage parses stack traces and classifies failures into infrastructure blips vs genuine software regressions.",
                            "best": ["Include last 3 network requests in AI triage payload", "Automatically tag flaky tests and open draft Jira issues"],
                            "anti": ["Blindly re-running failed tests 5 times without logging root cause triage"],
                            "prompt": "Analyze this Playwright test failure stack trace. Determine if Product Bug or Script Issue and generate Jira ticket.",
                            "instr": "Write failure triage classifier returning PRODUCT_BUG on 500 and LOCATOR_DRIFT on Timeout.",
                            "starterJava": "",
                            "starterTs": "function triage(msg: string): string {\n  // Classify msg\n}",
                            "solJava": "",
                            "solTs": "function triage(msg: string): string {\n  if (msg.includes('500')) return 'PRODUCT_BUG';\n  if (msg.includes('Timeout')) return 'LOCATOR_DRIFT';\n  return 'OTHER';\n}",
                            "reqs": ["msg.includes('500')", "'PRODUCT_BUG'", "'LOCATOR_DRIFT'"]
                        },
                        {
                            "id": "step-6-testing-ai-applications",
                            "title": "7. Step 6: Testing AI, Chatbots & LLM Applications",
                            "desc": "How to test Generative AI applications: hallucination detection, prompt injection vulnerabilities, semantic distance, and LLM-as-a-Judge.",
                            "mins": 150, # 2.5h
                            "level": "Senior",
                            "manualTitle": "Non-Deterministic Testing",
                            "steps": ["Testing a customer support AI chatbot: response wording changes on every run, but semantic fact must remain true."],
                            "pains": ["Traditional assert.equals() fails completely on LLM responses because wording varies dynamically."],
                            "pwCode": "export async function assertSemanticAccuracy(actual: string, fact: string): Promise<boolean> {\n  const prompt = `Fact: ${fact}\nActual: ${actual}\nDoes Actual accurately convey Fact? Answer YES or NO:`;\n  return (await callJudge(prompt)).trim().toUpperCase() === 'YES';\n}",
                            "selCode": "",
                            "restCode": "",
                            "expl": "Testing AI requires probabilistic quality engineering: semantic similarity scores, prompt injection defenses, and LLM-as-a-Judge.",
                            "best": ["Define strict factual benchmarks for RAG applications", "Test safety guardrails: attempts to jailbreak or leak system prompts"],
                            "anti": ["Using string exact-match assertions on generative model outputs"],
                            "prompt": "Generate 5 adversarial prompt injection attacks to test if a customer support bot will leak its system prompt.",
                            "instr": "Implement an assertion checking that an LLM response does not contain 'SYSTEM_PROMPT'.",
                            "starterJava": "",
                            "starterTs": "function verifySafety(res: string): boolean {\n  // Check no SYSTEM_PROMPT leak\n}",
                            "solJava": "",
                            "solTs": "function verifySafety(res: string): boolean {\n  return !res.includes('SYSTEM_PROMPT');\n}",
                            "reqs": ["!res.includes('SYSTEM_PROMPT')"]
                        },
                        {
                            "id": "step-7-autonomous-qa-agents",
                            "title": "8. Step 7: Autonomous QA Agent Workflows in CI/CD",
                            "desc": "Multi-agent quality engineering: autonomous requirement generation, automated test matrix synthesis, self-remediating CI/CD pipelines.",
                            "mins": 150, # 2.5h
                            "level": "Architect",
                            "manualTitle": "Autonomous Quality",
                            "steps": ["Agent triggers on PR creation, analyzes code diff, writes Playwright tests, runs them in Docker, and reports results."],
                            "pains": ["Teams struggle to maintain 100% test coverage as feature velocity accelerates."],
                            "pwCode": "// Agent 1: Requirement Generator -> Agent 2: Test Case Generator\n// Agent 3: Automation Generator -> Agent 4: Code Auditor -> Agent 5: SDET Mentor",
                            "selCode": "",
                            "restCode": "",
                            "expl": "Autonomous QA agents coordinate in multi-agent workflows, each owning specialized stages of the quality lifecycle.",
                            "best": ["Keep human SDET in the loop to review and approve agent PR submissions", "Enforce strict linter rules on agent test files"],
                            "anti": ["Deploying auto-generated test scripts directly to production without human review"],
                            "prompt": "Run autonomous QA agent suite to generate requirements, test cases, and Playwright code for this shopping cart user story.",
                            "instr": "Write a workflow coordinator that calls generateReqs, generateTests, and generateCode in sequence.",
                            "starterJava": "",
                            "starterTs": "async function runPipeline(story: string) {\n  // Run 3 agent steps\n}",
                            "solJava": "",
                            "solTs": "async function runPipeline(story: string) {\n  const reqs = await generateReqs(story);\n  const tests = await generateTests(reqs);\n  return await generateCode(tests);\n}",
                            "reqs": ["generateReqs", "generateTests", "generateCode"]
                        }
                    ]
                }
            ]
        },

        # =========================================================================
        # CAPSTONE: QA Interview Mastery & Coding Griller (20 Hours · 6 Lessons)
        # =========================================================================
        {
            "id": "interview-griller",
            "title": "QA Interview Mastery & Coding Griller",
            "tagline": "Technical Scenarios, Architecture Rounds & Live Simulator",
            "description": "Master senior SDET interview rounds: framework architecture design, flakiness elimination, concurrency, and live AI grilling simulations.",
            "color": "rose",
            "badgeColor": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
            "iconName": "Award",
            "totalLessons": 6,
            "estimatedHours": 20,
            "modules": [
                {
                    "id": "interview-scenarios",
                    "trackId": "interview-griller",
                    "title": "Top SDET Technical Scenarios",
                    "description": "Deep dives into the hardest interview questions asked by top tech companies.",
                    "order": 1,
                    "lessons": [
                        {
                            "id": "flakiness-and-retries",
                            "title": "1. Flakiness Elimination & CI/CD Sharding",
                            "desc": "How to answer 'How do you eliminate flaky tests?' and architect resilient retry algorithms.",
                            "mins": 200,
                            "level": "Architect",
                            "manualTitle": "The Flaky Test Problem",
                            "steps": ["In interviews, architects want to know how you stop tests from passing locally but failing on CI."],
                            "pains": ["Junior testers answer 'I add retries'. Senior SDETs know retries mask bugs and latency!"],
                            "pwCode": "// Architecture: Eliminate race conditions with web-first assertions, ensure test isolation, use Trace Viewer.",
                            "selCode": "",
                            "restCode": "",
                            "expl": "The correct interview response tackles root causes (dynamic synchronization, isolated contexts) before mentioning retries.",
                            "best": ["Never use retries as a replacement for proper synchronization", "Quarantine flaky tests to separate build targets"],
                            "anti": ["Saying 'I increase implicit wait to 60 seconds' in an interview"],
                            "prompt": "Give me 3 probing follow-up questions an interviewer will ask when I explain my test framework architecture.",
                            "instr": "Configure retries and trace recording on failure in Playwright configuration.",
                            "starterJava": "",
                            "starterTs": "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  // Add retries and trace\n});",
                            "solJava": "",
                            "solTs": "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  retries: 2,\n  use: { trace: 'retain-on-failure' }\n});",
                            "reqs": ["retries", "retain-on-failure"]
                        }
                    ]
                }
            ]
        }
    ]

    # Convert to TypeScript file content
    output_lines = [
        "import { Track, Lesson } from '@/types/qa';",
        "",
        "export function getLessonHours(durationMinutes: number): string {",
        "  const h = durationMinutes / 60;",
        "  return Number.isInteger(h) ? `${h}.0h` : `${h.toFixed(1)}h`;",
        "}",
        "",
        "export const QA_TRACKS: Track[] = ["
    ]

    for track in tracks:
        output_lines.append("  {")
        output_lines.append(f"    id: '{track['id']}',")
        output_lines.append(f"    title: '{track['title']}',")
        output_lines.append(f"    tagline: '{track['tagline']}',")
        output_lines.append(f"    description: '{track['description']}',")
        output_lines.append(f"    color: '{track['color']}',")
        output_lines.append(f"    badgeColor: '{track['badgeColor']}',")
        output_lines.append(f"    iconName: '{track['iconName']}',")
        output_lines.append(f"    totalLessons: {track['totalLessons']},")
        output_lines.append(f"    estimatedHours: {track['estimatedHours']},")
        output_lines.append("    modules: [")
        for module in track['modules']:
            output_lines.append("      {")
            output_lines.append(f"        id: '{module['id']}',")
            output_lines.append(f"        trackId: '{module['trackId']}',")
            output_lines.append(f"        title: '{module['title']}',")
            output_lines.append(f"        description: '{module['description']}',")
            output_lines.append(f"        order: {module['order']},")
            output_lines.append("        lessons: [")
            for lesson in module['lessons']:
                output_lines.append("          {")
                output_lines.append(f"            id: '{lesson['id']}',")
                output_lines.append(f"            moduleId: '{module['id']}',")
                output_lines.append(f"            trackId: '{track['id']}',")
                output_lines.append(f"            title: {json.dumps(lesson['title'])},")
                output_lines.append(f"            description: {json.dumps(lesson['desc'])},")
                output_lines.append(f"            durationMinutes: {lesson['mins']},")
                badge = 'selenium' if 'sel' in track['id'] or 'java' in track['id'] else ('playwright' if 'playwright' in track['id'] else ('api-testing' if 'api' in track['id'] else ('ai-qa' if 'ai' in track['id'] else 'interview')))
                output_lines.append(f"            badge: '{badge}',")
                output_lines.append(f"            level: '{lesson['level']}',")
                output_lines.append("            manualContext: {")
                output_lines.append(f"              title: {json.dumps(lesson['manualTitle'])},")
                output_lines.append(f"              steps: {json.dumps(lesson['steps'])},")
                output_lines.append(f"              painPoints: {json.dumps(lesson['pains'])}")
                output_lines.append("            },")
                output_lines.append("            automationContext: {")
                output_lines.append(f"              playwrightTs: {json.dumps(lesson.get('pwCode', ''))},")
                if lesson.get('selCode'):
                    output_lines.append(f"              seleniumJava: {json.dumps(lesson['selCode'])},")
                if lesson.get('restCode'):
                    output_lines.append(f"              restAssuredJava: {json.dumps(lesson['restCode'])},")
                output_lines.append(f"              explanation: {json.dumps(lesson['expl'])},")
                output_lines.append(f"              bestPractices: {json.dumps(lesson['best'])},")
                output_lines.append(f"              antiPatterns: {json.dumps(lesson['anti'])}")
                output_lines.append("            },")
                output_lines.append("            aiAugmentation: {")
                output_lines.append(f"              promptExample: {json.dumps(lesson['prompt'])},")
                output_lines.append(f"              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',")
                output_lines.append(f"              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'")
                output_lines.append("            },")
                output_lines.append("            challenge: {")
                output_lines.append(f"              instruction: {json.dumps(lesson['instr'])},")
                output_lines.append("              starterCode: {")
                if lesson.get('starterTs'):
                    output_lines.append(f"                typescript: {json.dumps(lesson['starterTs'])},")
                if lesson.get('starterJava'):
                    output_lines.append(f"                java: {json.dumps(lesson['starterJava'])}")
                output_lines.append("              },")
                output_lines.append("              solutionCode: {")
                if lesson.get('solTs'):
                    output_lines.append(f"                typescript: {json.dumps(lesson['solTs'])},")
                if lesson.get('solJava'):
                    output_lines.append(f"                java: {json.dumps(lesson['solJava'])}")
                output_lines.append("              },")
                output_lines.append("              validationRules: [")
                output_lines.append("                {")
                output_lines.append(f"                  requiredPatterns: {json.dumps(lesson['reqs'])},")
                output_lines.append("                  forbiddenPatterns: ['Thread.sleep'],")
                output_lines.append("                  description: 'Validates required patterns'")
                output_lines.append("                }")
                output_lines.append("              ]")
                output_lines.append("            }")
                output_lines.append("          },")
            output_lines.append("        ]")
            output_lines.append("      },")
        output_lines.append("    ]")
        output_lines.append("  },")

    output_lines.append("];")
    output_lines.append("")
    output_lines.append("export function getTrackById(id: string): Track | undefined {")
    output_lines.append("  return QA_TRACKS.find(t => t.id === id);")
    output_lines.append("}")
    output_lines.append("")
    output_lines.append("export function getAllLessons(): Lesson[] {")
    output_lines.append("  return QA_TRACKS.flatMap(t => t.modules.flatMap(m => m.lessons));")
    output_lines.append("}")
    output_lines.append("")
    output_lines.append("export function getLessonById(trackId: string, lessonId: string): { track: Track; module: any; lesson: Lesson } | undefined {")
    output_lines.append("  const track = getTrackById(trackId);")
    output_lines.append("  if (!track) return undefined;")
    output_lines.append("  for (const module of track.modules) {")
    output_lines.append("    const lesson = module.lessons.find(l => l.id === lessonId);")
    output_lines.append("    if (lesson) {")
    output_lines.append("      return { track, module, lesson };")
    output_lines.append("    }")
    output_lines.append("  }")
    output_lines.append("  return undefined;")
    output_lines.append("}")

    content = "\n".join(output_lines)
    with open("src/lib/qa-curriculum.ts", "w") as f:
        f.write(content)
    print(f"Generated src/lib/qa-curriculum.ts ({len(output_lines)} lines)")

if __name__ == '__main__':
    generate()
