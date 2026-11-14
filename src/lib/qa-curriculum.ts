import { Track, Lesson } from '@/types/qa';

export function getLessonHours(durationMinutes: number): string {
  const h = durationMinutes / 60;
  return Number.isInteger(h) ? `${h}.0h` : `${h.toFixed(1)}h`;
}

export const QA_TRACKS: Track[] = [
  {
    id: 'selenium-java',
    title: 'Selenium WebDriver + Java',
    tagline: 'Enterprise SDET & Java Framework Design',
    description: 'Master Core Java OOPs, Selenium WebDriver 4, TestNG data-driven suites, synchronization, and PageFactory architecture.',
    color: 'amber',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    iconName: 'Terminal',
    totalLessons: 10,
    estimatedHours: 26,
    modules: [
      {
        id: 'java-oops-qa',
        trackId: 'selenium-java',
        title: 'Core Java OOPs & Selenium Framework Architecture',
        description: 'Enterprise test architecture from object-oriented programming to synchronization and parallel execution.',
        order: 1,
        lessons: [
          {
            id: 'java-oops-framework',
            moduleId: 'java-oops-qa',
            trackId: 'selenium-java',
            title: "1. Core Java OOPs for Automation",
            description: "Map Encapsulation, Inheritance, Polymorphism, and Abstraction directly to QA framework architecture.",
            durationMinutes: 150,
            badge: 'selenium',
            level: 'Beginner',
            manualContext: {
              title: "Manual Tester Mental Model",
              steps: ["Every test needs browser launch, maximize, cookies clear, and teardown.", "Copying setup code across 100 classes causes chaos."],
              painPoints: ["Copy-pasting 'new ChromeDriver()' into every test creates memory leaks and unmaintainable code."]
            },
            automationContext: {
              playwrightTs: "import { test } from '@playwright/test';\ntest('login', async ({ page }) => { await page.goto('/login'); });",
              seleniumJava: "// Inheritance & Polymorphism in BaseTest\npublic abstract class BaseTest {\n    protected WebDriver driver;\n    @BeforeMethod\n    public void setUp() {\n        driver = DriverFactory.getDriver(\"chrome\");\n        driver.manage().window().maximize();\n    }\n    @AfterMethod\n    public void tearDown() {\n        if (driver != null) driver.quit();\n    }\n}",
              explanation: "Encapsulation hides WebElements inside Page Objects. Inheritance shares driver lifecycle in BaseTest. Polymorphism switches Chrome/Firefox.",
              bestPractices: ["Always quit WebDriver in @AfterMethod to prevent orphan browser processes", "Use ThreadLocal<WebDriver> for parallel multi-threaded runs"],
              antiPatterns: ["Using static WebDriver in parallel execution", "Hardcoding System.setProperty in modern Selenium 4"]
            },
            aiAugmentation: {
              promptExample: "Generate a Java BaseTest class with TestNG annotations and ThreadLocal WebDriver.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Implement a BaseTest class with @BeforeMethod setUp and @AfterMethod tearDown methods.",
              starterCode: {
                java: "public class BaseTest {\n    protected WebDriver driver;\n    // Add setUp and tearDown\n}"
              },
              solutionCode: {
                java: "public class BaseTest {\n    protected WebDriver driver;\n    @BeforeMethod\n    public void setUp() {\n        driver = new ChromeDriver();\n    }\n    @AfterMethod\n    public void tearDown() {\n        if (driver != null) driver.quit();\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["@BeforeMethod", "setUp", "@AfterMethod", "tearDown", "driver.quit()"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'sel-webdriver-setup',
            moduleId: 'java-oops-qa',
            trackId: 'selenium-java',
            title: "2. WebDriver 4 Architecture & Browser Setup",
            description: "W3C standardization, Selenium Manager automated binary resolution, ChromeOptions, and headless execution.",
            durationMinutes: 150,
            badge: 'selenium',
            level: 'Beginner',
            manualContext: {
              title: "Manual Testing Context",
              steps: ["Tester launches browser with custom viewport and disables popup notifications.", "Requires testing in headless mode on Linux CI servers."],
              painPoints: ["Browser version mismatches (Chrome 126 vs driver 124) constantly broke old frameworks."]
            },
            automationContext: {
              playwrightTs: "import { chromium } from '@playwright/test';\nconst browser = await chromium.launch({ headless: true });",
              seleniumJava: "ChromeOptions options = new ChromeOptions();\noptions.addArguments(\"--headless=new\");\noptions.addArguments(\"--disable-notifications\");\nWebDriver driver = new ChromeDriver(options);\ndriver.get(\"https://intelligentqa.io\");",
              explanation: "Selenium 4 natively resolves matching browser drivers via Selenium Manager without external driver utilities.",
              bestPractices: ["Use ChromeOptions for headless execution in CI/CD", "Set standardized 1920x1080 viewport dimensions"],
              antiPatterns: ["Hardcoding absolute paths to chromedriver.exe", "Using legacy '--headless' flag"]
            },
            aiAugmentation: {
              promptExample: "Write a Selenium 4 DriverFactory in Java configuring Chrome, Firefox, and Edge with headless flags.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Configure ChromeOptions with headless=new and instantiate ChromeDriver with options.",
              starterCode: {
                java: "public class BrowserSetup {\n    public WebDriver initChrome() {\n        // Configure ChromeOptions and return ChromeDriver\n    }\n}"
              },
              solutionCode: {
                java: "public class BrowserSetup {\n    public WebDriver initChrome() {\n        ChromeOptions options = new ChromeOptions();\n        options.addArguments(\"--headless=new\");\n        return new ChromeDriver(options);\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["ChromeOptions", "--headless=new", "new ChromeDriver(options)"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'sel-locators-xpath',
            moduleId: 'java-oops-qa',
            trackId: 'selenium-java',
            title: "3. Advanced Dynamic Locators (XPath & CSS)",
            description: "Master relative XPath axes (following-sibling, ancestor, parent), text normalization, and robust CSS selectors.",
            durationMinutes: 180,
            badge: 'selenium',
            level: 'Intermediate',
            manualContext: {
              title: "Manual Verification Context",
              steps: ["Tester identifies a table row by customer name, then clicks the Edit button in that specific row."],
              painPoints: ["Copying absolute XPath (/html/body/div[2]/...) breaks with every frontend release."]
            },
            automationContext: {
              playwrightTs: "await page.locator('tr', { hasText: 'John Doe' }).getByRole('button', { name: 'Edit' }).click();",
              seleniumJava: "WebElement editBtn = driver.findElement(By.xpath(\n    \"//tr[td[normalize-space()='John Doe']]//button[contains(@class, 'edit')]\"\n));\neditBtn.click();",
              explanation: "Dynamic XPath axes locate elements based on semantic relationships rather than fragile layout paths.",
              bestPractices: ["Anchor to stable text and navigate to relative targets using axes", "Use normalize-space() for clean text matching"],
              antiPatterns: ["Using absolute full XPath starting with /html", "Relying on auto-generated indexes like div[14]"]
            },
            aiAugmentation: {
              promptExample: "Generate resilient relative XPath for a table row action button next to an account ID.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Write an XPath locator targeting the Delete button within a row containing 'Active'.",
              starterCode: {
                java: "public class Locators {\n    public By getDeleteForActive() {\n        // Return By.xpath for button in row with 'Active'\n    }\n}"
              },
              solutionCode: {
                java: "public class Locators {\n    public By getDeleteForActive() {\n        return By.xpath(\"//tr[td[contains(text(), 'Active')]]//button[contains(@class, 'delete')]\");\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["By.xpath", "//tr", "Active", "button"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'sel-webelement-actions',
            moduleId: 'java-oops-qa',
            trackId: 'selenium-java',
            title: "4. WebElement Actions & Form Interactions",
            description: "Handling inputs, select dropdowns (single/multi-select), checkboxes, radio buttons, and JavaScript clicks.",
            durationMinutes: 120,
            badge: 'selenium',
            level: 'Beginner',
            manualContext: {
              title: "Form Verification Flow",
              steps: ["Selecting country from dropdown, checking terms checkbox, clearing old values and typing new values."],
              painPoints: ["Calling sendKeys without clear appends to existing text creating invalid submissions."]
            },
            automationContext: {
              playwrightTs: "await page.fill('#email', 'qa@intelligentqa.io');\nawait page.selectOption('#country', { label: 'United States' });",
              seleniumJava: "WebElement emailInput = driver.findElement(By.id(\"email\"));\nemailInput.clear();\nemailInput.sendKeys(\"qa@intelligentqa.io\");\n\nSelect country = new Select(driver.findElement(By.id(\"country\")));\ncountry.selectByVisibleText(\"United States\");",
              explanation: "The Select class handles dropdown options by visible text or value. Always clear text boxes before typing.",
              bestPractices: ["Use Select class for native select elements", "Clear inputs before sendKeys"],
              antiPatterns: ["Calling .click() directly on option elements", "Overusing JavaScript click when standard click works"]
            },
            aiAugmentation: {
              promptExample: "Write a reusable Java helper to select dropdown options safely with error logging.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Use the Select class to choose 'Premium Plan' by visible text.",
              starterCode: {
                java: "public class FormHelper {\n    public void selectPlan(WebElement dropdown) {\n        // Select 'Premium Plan'\n    }\n}"
              },
              solutionCode: {
                java: "public class FormHelper {\n    public void selectPlan(WebElement dropdown) {\n        Select select = new Select(dropdown);\n        select.selectByVisibleText(\"Premium Plan\");\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["Select", "new Select(dropdown)", "selectByVisibleText(\"Premium Plan\")"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'sel-sync-waits',
            moduleId: 'java-oops-qa',
            trackId: 'selenium-java',
            title: "5. Synchronization & Dynamic Waits Strategy",
            description: "Eliminate flakiness: Implicit vs Explicit vs FluentWait. Solving StaleElementReferenceException.",
            durationMinutes: 180,
            badge: 'selenium',
            level: 'Intermediate',
            manualContext: {
              title: "Manual Timing Flow",
              steps: ["Click search, see spinner for 2 seconds, verify search results table renders."],
              painPoints: ["Hardcoded Thread.sleep(5000) makes test suites painfully slow and still flaky on slower CI runners."]
            },
            automationContext: {
              playwrightTs: "await expect(page.locator('#spinner')).toBeHidden();\nawait page.locator('.results-row').first().click();",
              seleniumJava: "WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));\nwait.until(ExpectedConditions.invisibilityOfElementLocated(By.id(\"spinner\")));\nWebElement result = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(\".results-row\")));\nresult.click();",
              explanation: "Explicit wait evaluates conditions at polling intervals and continues immediately when satisfied.",
              bestPractices: ["Wait for spinners to disappear before interacting with targets", "Use FluentWait with ignored exceptions for flaky elements"],
              antiPatterns: ["Using Thread.sleep() in automation scripts", "Mixing Implicit and Explicit waits together"]
            },
            aiAugmentation: {
              promptExample: "Refactor this flaky Selenium script with Thread.sleep to use WebDriverWait with ExpectedConditions.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Create a WebDriverWait with 10-second timeout and wait for visibility of element with ID 'dashboard'.",
              starterCode: {
                java: "public class WaitHelper {\n    public WebElement waitForDashboard(WebDriver driver) {\n        // Return element waiting for visibility\n    }\n}"
              },
              solutionCode: {
                java: "public class WaitHelper {\n    public WebElement waitForDashboard(WebDriver driver) {\n        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));\n        return wait.until(ExpectedConditions.visibilityOfElementLocated(By.id(\"dashboard\")));\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["WebDriverWait", "Duration.ofSeconds(10)", "ExpectedConditions.visibilityOfElementLocated", "By.id(\"dashboard\")"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'sel-actions-api',
            moduleId: 'java-oops-qa',
            trackId: 'selenium-java',
            title: "6. Advanced User Interactions (Actions API)",
            description: "Master mouse hover, context-click (right-click), drag and drop, and keyboard shortcuts with Actions class.",
            durationMinutes: 120,
            badge: 'selenium',
            level: 'Intermediate',
            manualContext: {
              title: "Complex Gestures",
              steps: ["Hovering over user avatar to reveal menu, dragging cards in a Kanban board."],
              painPoints: ["Standard .click() fails on elements that are rendered only during active mouse hover."]
            },
            automationContext: {
              playwrightTs: "await page.hover('#user-avatar');\nawait page.dragAndDrop('#card-1', '#done-col');",
              seleniumJava: "Actions actions = new Actions(driver);\nactions.moveToElement(driver.findElement(By.id(\"user-avatar\"))).perform();\nactions.dragAndDrop(sourceElem, targetElem).perform();",
              explanation: "Actions builds sequences of user gestures. Calling .perform() executes the entire gesture chain.",
              bestPractices: ["Always call .perform() to execute Actions sequences", "Wait for menus to render after moveToElement"],
              antiPatterns: ["Forgetting .perform() resulting in silent non-execution"]
            },
            aiAugmentation: {
              promptExample: "Write a Selenium Java Actions snippet to perform drag and drop between two Kanban columns.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Use Actions to hover over an element and click a sub-item.",
              starterCode: {
                java: "public class ActionHelper {\n    public void hoverAndClick(WebDriver driver, WebElement menu, WebElement item) {\n        // Hover then click\n    }\n}"
              },
              solutionCode: {
                java: "public class ActionHelper {\n    public void hoverAndClick(WebDriver driver, WebElement menu, WebElement item) {\n        Actions actions = new Actions(driver);\n        actions.moveToElement(menu).click(item).perform();\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["new Actions(driver)", "moveToElement", "perform()"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'sel-frames-windows-shadow',
            moduleId: 'java-oops-qa',
            trackId: 'selenium-java',
            title: "7. Frames, Windows & Shadow DOM Handling",
            description: "Navigate nested iframes, switch between multi-browser tabs/windows, and pierce native Shadow DOM in Selenium 4.",
            durationMinutes: 150,
            badge: 'selenium',
            level: 'Advanced',
            manualContext: {
              title: "Multi-Context Verification",
              steps: ["Entering card details in Stripe iframe, clicking terms link that opens in a new browser tab."],
              painPoints: ["WebDriver searches only the top-level DOM; iframe elements throw NoSuchElementException unless switched."]
            },
            automationContext: {
              playwrightTs: "await page.frameLocator('iframe.payment').locator('#card').fill('424242424242');",
              seleniumJava: "// Switch to iframe and return\ndriver.switchTo().frame(driver.findElement(By.cssSelector(\"iframe.payment\")));\ndriver.findElement(By.id(\"card\")).sendKeys(\"424242424242\");\ndriver.switchTo().defaultContent();\n\n// Selenium 4 Shadow DOM\nSearchContext shadow = driver.findElement(By.id(\"picker\")).getShadowRoot();\nshadow.findElement(By.cssSelector(\"button.now\")).click();",
              explanation: "Selenium requires explicit context switching. Always return to defaultContent() after iframe actions.",
              bestPractices: ["Always return to defaultContent() immediately after iframe interactions", "Store parent window handle before opening new tabs"],
              antiPatterns: ["Using numeric frame index (switchTo.frame(0)) which breaks when ads inject hidden iframes"]
            },
            aiAugmentation: {
              promptExample: "Write a Selenium 4 helper that accesses a shadow DOM element using getShadowRoot().",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Switch into an iframe, click an element, and switch back to defaultContent.",
              starterCode: {
                java: "public class FrameHelper {\n    public void clickInFrame(WebDriver driver, WebElement frame, By target) {\n        // Switch to frame, click target, revert to defaultContent\n    }\n}"
              },
              solutionCode: {
                java: "public class FrameHelper {\n    public void clickInFrame(WebDriver driver, WebElement frame, By target) {\n        driver.switchTo().frame(frame);\n        driver.findElement(target).click();\n        driver.switchTo().defaultContent();\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["driver.switchTo().frame", "driver.switchTo().defaultContent()"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'sel-pom-pagefactory',
            moduleId: 'java-oops-qa',
            trackId: 'selenium-java',
            title: "8. Page Object Model & PageFactory Architecture",
            description: "Architect scalable test frameworks: By locators vs @FindBy PageFactory annotations, method chaining, and clean separation.",
            durationMinutes: 210,
            badge: 'selenium',
            level: 'Advanced',
            manualContext: {
              title: "Maintainable Test Suites",
              steps: ["Login -> Product Catalog -> Cart -> Payment. If button changes, updating 50 test files wastes days."],
              painPoints: ["Spreading raw driver.findElement() calls across test files makes maintenance an unbearable chore."]
            },
            automationContext: {
              playwrightTs: "export class CheckoutPage {\n  constructor(private readonly page: Page) {}\n  readonly applyBtn = this.page.locator('#apply');\n}",
              seleniumJava: "public class CheckoutPage {\n    private final WebDriver driver;\n    private final By couponInput = By.id(\"coupon\");\n    private final By applyBtn = By.id(\"apply\");\n    public CheckoutPage(WebDriver driver) { this.driver = driver; }\n    public CheckoutPage applyCoupon(String code) {\n        driver.findElement(couponInput).sendKeys(code);\n        driver.findElement(applyBtn).click();\n        return this;\n    }\n}",
              explanation: "Page Object Model encapsulates web locators and actions. UI changes are modified in 1 Page Object without touching tests.",
              bestPractices: ["Keep locators private to enforce encapsulation", "Never put assertions inside Page Objects"],
              antiPatterns: ["Exposing public WebElements to test classes", "Writing Assert.assertEquals inside Page Object action methods"]
            },
            aiAugmentation: {
              promptExample: "Generate a Selenium Java Page Object class with private By locators, constructor, and fluent methods.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Implement a LoginPage class with private By locators, constructor, and login(user, pass) method.",
              starterCode: {
                java: "public class LoginPage {\n    private WebDriver driver;\n    // Add locators and login method\n}"
              },
              solutionCode: {
                java: "public class LoginPage {\n    private WebDriver driver;\n    private By userInput = By.id(\"username\");\n    private By passInput = By.id(\"password\");\n    private By loginBtn = By.id(\"login\");\n    public LoginPage(WebDriver driver) { this.driver = driver; }\n    public void login(String user, String pass) {\n        driver.findElement(userInput).sendKeys(user);\n        driver.findElement(passInput).sendKeys(pass);\n        driver.findElement(loginBtn).click();\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["LoginPage(WebDriver driver)", "driver.findElement", "login(", "sendKeys"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'sel-testng-parallel',
            moduleId: 'java-oops-qa',
            trackId: 'selenium-java',
            title: "9. TestNG Suite & Parallel Multi-Threading",
            description: "Master testng.xml, @DataProvider for data-driven testing, @Parameters, ThreadLocal<WebDriver>, and parallel suites.",
            durationMinutes: 180,
            badge: 'selenium',
            level: 'Senior',
            manualContext: {
              title: "Data-Driven Scenarios",
              steps: ["Testing registration with 10 different dataset variations (valid, invalid email, max length)."],
              painPoints: ["Sequential execution takes 1 hour. Parallel execution without ThreadLocal causes browser session collisions."]
            },
            automationContext: {
              playwrightTs: "test.describe.configure({ mode: 'parallel' });",
              seleniumJava: "public class DriverFactory {\n    private static final ThreadLocal<WebDriver> tlDriver = new ThreadLocal<>();\n    public static WebDriver getDriver() { return tlDriver.get(); }\n    public static void setDriver(WebDriver d) { tlDriver.set(d); }\n    public static void quitDriver() {\n        if (tlDriver.get() != null) { tlDriver.get().quit(); tlDriver.remove(); }\n    }\n}",
              explanation: "ThreadLocal isolates WebDriver instances per worker thread, enabling TestNG to run suites in parallel safely.",
              bestPractices: ["Always call tlDriver.remove() in teardown to prevent thread pool memory leaks", "Use parallel='methods' in testng.xml"],
              antiPatterns: ["Using public static WebDriver driver in parallel frameworks"]
            },
            aiAugmentation: {
              promptExample: "Write a thread-safe ThreadLocal DriverFactory with support for Chrome and Firefox.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Implement ThreadLocal getter and setter in DriverFactory.",
              starterCode: {
                java: "public class DriverFactory {\n    private static ThreadLocal<WebDriver> tlDriver = new ThreadLocal<>();\n    // Implement getDriver and setDriver\n}"
              },
              solutionCode: {
                java: "public class DriverFactory {\n    private static ThreadLocal<WebDriver> tlDriver = new ThreadLocal<>();\n    public static WebDriver getDriver() { return tlDriver.get(); }\n    public static void setDriver(WebDriver driver) { tlDriver.set(driver); }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["tlDriver.get()", "tlDriver.set(driver)"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'sel-listeners-reports-cicd',
            moduleId: 'java-oops-qa',
            trackId: 'selenium-java',
            title: "10. Listeners, Screenshots & Maven CI/CD Execution",
            description: "Implement ITestListener, automatic screenshot capture on test failure, ExtentReports / Allure, and Maven CI/CD integration.",
            durationMinutes: 120,
            badge: 'selenium',
            level: 'Senior',
            manualContext: {
              title: "Defect Reporting",
              steps: ["When a bug is found, manual tester takes a screenshot, logs browser console errors, and files a Jira issue."],
              painPoints: ["Nightly CI tests failing without screenshots force testers to manually reproduce errors from scratch."]
            },
            automationContext: {
              playwrightTs: "// screenshot: 'only-on-failure', trace: 'retain-on-failure'",
              seleniumJava: "public class TestListener implements ITestListener {\n    @Override\n    public void onTestFailure(ITestResult result) {\n        WebDriver driver = DriverFactory.getDriver();\n        File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);\n        // Copy to reports/screenshots/\n    }\n}",
              explanation: "ITestListener intercepts the exact moment a test fails, taking a screenshot and recording stack traces into HTML reports.",
              bestPractices: ["Embed base64 failure screenshots directly into ExtentReports", "Execute tests via Maven surefire plugin in CI"],
              antiPatterns: ["Swallowing exceptions in test methods with catch blocks that mark failures as PASSED"]
            },
            aiAugmentation: {
              promptExample: "Write a TestNG ITestListener class that captures failure screenshots and attaches them to ExtentReports.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Capture a screenshot as a File using TakesScreenshot onTestFailure.",
              starterCode: {
                java: "public class FailureListener implements ITestListener {\n    public void onTestFailure(ITestResult result) {\n        // Capture screenshot\n    }\n}"
              },
              solutionCode: {
                java: "public class FailureListener implements ITestListener {\n    public void onTestFailure(ITestResult result) {\n        WebDriver driver = DriverFactory.getDriver();\n        File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["TakesScreenshot", "getScreenshotAs(OutputType.FILE)"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
        ]
      },
    ]
  },
  {
    id: 'playwright-ts',
    title: 'Playwright + TypeScript',
    tagline: 'Modern High-Speed Web & Component Automation',
    description: 'Master fast, reliable end-to-end automation with TypeScript, modern locators, auto-waiting, Page Object Models, and CI/CD pipelines.',
    color: 'emerald',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    iconName: 'PlayCircle',
    totalLessons: 12,
    estimatedHours: 24,
    modules: [
      {
        id: 'pw-fundamentals',
        trackId: 'playwright-ts',
        title: 'TypeScript Foundations & Playwright Core Architecture',
        description: 'From async/await to resilient locators, auto-waiting, fixtures, and network mocking.',
        order: 1,
        lessons: [
          {
            id: 'pw-ts-basics',
            moduleId: 'pw-fundamentals',
            trackId: 'playwright-ts',
            title: "1. TypeScript Essentials & Async/Await",
            description: "Understand promises, asynchronous execution, and why UI automation demands async/await.",
            durationMinutes: 120,
            badge: 'playwright',
            level: 'Beginner',
            manualContext: {
              title: "Manual Verification Flow",
              steps: ["Open login page, wait for spinner to disappear, enter credentials, press enter, confirm dashboard."],
              painPoints: ["Manual testing is sequential; code executes in microseconds. Without 'await', code races ahead before page responds!"]
            },
            automationContext: {
              playwrightTs: "import { test, expect } from '@playwright/test';\ntest('login', async ({ page }) => {\n  await page.goto('/login');\n  await page.locator('#email').fill('sdet@tech.io');\n  await page.locator('button[type=\"submit\"]').click();\n  await expect(page).toHaveURL(/.*dashboard/);\n});",
              seleniumJava: "driver.get(\"https://intelligentqa.io/login\");",
              explanation: "Every browser action returns a Promise. Prepending await pauses JavaScript execution until the promise settles.",
              bestPractices: ["Always await page actions and expect() assertions", "Use TypeScript interfaces for typed test data"],
              antiPatterns: ["Forgetting await leading to unhandled promise rejections"]
            },
            aiAugmentation: {
              promptExample: "Convert this synchronous test into Playwright TypeScript async/await.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Write an asynchronous Playwright test that navigates to '/login' and clicks submit.",
              starterCode: {
                typescript: "import { test } from '@playwright/test';\ntest('nav', async ({ page }) => {\n  // Navigate and click\n});",
              },
              solutionCode: {
                typescript: "import { test } from '@playwright/test';\ntest('nav', async ({ page }) => {\n  await page.goto('/login');\n  await page.click('button[type=\"submit\"]');\n});",
              },
              validationRules: [
                {
                  requiredPatterns: ["await page.goto", "await page.click"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'pw-setup-arch',
            moduleId: 'pw-fundamentals',
            trackId: 'playwright-ts',
            title: "2. Playwright Architecture & Project Scaffold",
            description: "Understand browser processes, isolated browser contexts, workers, and playwright.config.ts tuning.",
            durationMinutes: 90,
            badge: 'playwright',
            level: 'Beginner',
            manualContext: {
              title: "Multi-Context Verification",
              steps: ["Testing multiple user roles (Admin vs Guest) in isolated incognito sessions."],
              painPoints: ["Launching full browser processes for every test adds 5 seconds per test in Selenium."]
            },
            automationContext: {
              playwrightTs: "import { defineConfig, devices } from '@playwright/test';\nexport default defineConfig({\n  fullyParallel: true,\n  use: { trace: 'retain-on-failure' },\n});",
              seleniumJava: "// Requires separate browser processes in Selenium",
              explanation: "Playwright uses a single browser process with lightweight isolated BrowserContexts created in under 10ms.",
              bestPractices: ["Set fullyParallel: true for ultra-fast multi-core runs", "Configure trace: 'retain-on-failure' in CI"],
              antiPatterns: ["Manually managing browser processes instead of worker fixtures"]
            },
            aiAugmentation: {
              promptExample: "Generate an enterprise playwright.config.ts with retry policies and trace recording.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Define a Playwright config with fullyParallel set to true and trace set to 'retain-on-failure'.",
              starterCode: {
                typescript: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  // Add config\n});",
              },
              solutionCode: {
                typescript: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  fullyParallel: true,\n  use: { trace: 'retain-on-failure' }\n});",
              },
              validationRules: [
                {
                  requiredPatterns: ["fullyParallel: true", "trace: 'retain-on-failure'"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'pw-auto-waiting',
            moduleId: 'pw-fundamentals',
            trackId: 'playwright-ts',
            title: "3. Auto-Waiting & Web-First Assertions",
            description: "Why Playwright tests never need sleep: actionability checks (visible, stable, enabled) and expect() polling.",
            durationMinutes: 120,
            badge: 'playwright',
            level: 'Beginner',
            manualContext: {
              title: "Dynamic UI Timing",
              steps: ["Clicking an element after a 500ms CSS animation or AJAX request finishes."],
              painPoints: ["Selenium throws ElementClickInterceptedException if clicked mid-animation. Playwright waits automatically!"]
            },
            automationContext: {
              playwrightTs: "await page.locator('#submit-btn').click(); // Auto-waits for visible, stable, enabled!\nawait expect(page.locator('.toast')).toBeVisible({ timeout: 5000 });",
              seleniumJava: "wait.until(ExpectedConditions.elementToBeClickable(By.id(\"submit-btn\"))).click();",
              explanation: "Playwright checks 5 actionability criteria before executing actions. Web-first assertions poll until the assertion succeeds.",
              bestPractices: ["Use web-first expect(locator).toBeVisible()", "Trust auto-waiting before adding manual timeouts"],
              antiPatterns: ["Using page.waitForTimeout(5000)", "Using non-retrying boolean assertions"]
            },
            aiAugmentation: {
              promptExample: "Refactor these boolean asserts to Playwright web-first assertions with auto-retries.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Use a web-first assertion to assert that #success-banner is visible.",
              starterCode: {
                typescript: "async function verify(page) {\n  // Assert visibility of #success-banner\n}",
              },
              solutionCode: {
                typescript: "async function verify(page) {\n  await expect(page.locator('#success-banner')).toBeVisible();\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["await expect", "page.locator", "toBeVisible()"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'pw-resilient-locators',
            moduleId: 'pw-fundamentals',
            trackId: 'playwright-ts',
            title: "4. Resilient Locators & User-Facing Roles",
            description: "Master getByRole, getByText, getByLabel, getByTestId, and CSS chaining for rock-solid element targeting.",
            durationMinutes: 120,
            badge: 'playwright',
            level: 'Intermediate',
            manualContext: {
              title: "User Perception Testing",
              steps: ["Find input labeled 'Work Email', click button 'Log In', verify 'Welcome' banner."],
              painPoints: ["If frontend changes div.col-4 > input to flexbox, CSS/XPath locators break instantly."]
            },
            automationContext: {
              playwrightTs: "await page.getByRole('button', { name: 'Log In' }).click();\nawait page.getByLabel('Work Email').fill('sdet@qa.io');\nawait expect(page.getByText('Welcome back')).toBeVisible();",
              seleniumJava: "driver.findElement(By.xpath(\"//button[contains(text(), 'Log In')]\")).click();",
              explanation: "Playwright prioritizes accessible roles and user-facing text, ensuring tests remain stable across CSS refactorings.",
              bestPractices: ["Default to getByRole(role, { name }) first", "Use getByLabel for forms"],
              antiPatterns: ["Using hashed CSS classes like .css-1a7bc8e", "Writing deep fragile CSS paths"]
            },
            aiAugmentation: {
              promptExample: "Inspect this React component and generate resilient Playwright locators using getByRole.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Use getByRole to locate a button with accessible name 'Sign In' and click it.",
              starterCode: {
                typescript: "async function submit(page) {\n  // Click 'Sign In' button using getByRole\n}",
              },
              solutionCode: {
                typescript: "async function submit(page) {\n  await page.getByRole('button', { name: 'Sign In' }).click();\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["page.getByRole", "'button'", "Sign In", "click()"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'pw-shadow-iframes',
            moduleId: 'pw-fundamentals',
            trackId: 'playwright-ts',
            title: "5. Shadow DOM Piercing & Nested Iframes",
            description: "Automatic shadow root piercing without JavaScript hacks, frameLocator for secure payment widgets, and cross-origin handling.",
            durationMinutes: 120,
            badge: 'playwright',
            level: 'Intermediate',
            manualContext: {
              title: "Embedded Widgets",
              steps: ["Interacting with Stripe credit card iframes or web components in shadow roots."],
              painPoints: ["In Selenium, developers had to write custom JavaScript to penetrate shadow roots."]
            },
            automationContext: {
              playwrightTs: "// Playwright automatically pierces shadow DOM!\nawait page.locator('#shadow-toggle').click();\n// frameLocator for nested iframes:\nawait page.frameLocator('iframe.stripe').getByPlaceholder('Card Number').fill('424242424242');",
              seleniumJava: "driver.switchTo().frame(driver.findElement(By.cssSelector(\"iframe.stripe\")));",
              explanation: "Playwright pierces open shadow roots automatically. For iframes, frameLocator() provides seamless targeting without focus switching.",
              bestPractices: ["Chain frameLocator instances for deeply nested iframes", "Avoid switching global browser focus"],
              antiPatterns: ["Executing manual querySelector scripts to reach shadow roots"]
            },
            aiAugmentation: {
              promptExample: "Write a Playwright test filling credit card inputs inside an iframe using frameLocator.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Use frameLocator to target '#payment-frame' and fill input 'card-cvv'.",
              starterCode: {
                typescript: "async function fill(page) {\n  // Use frameLocator on #payment-frame\n}",
              },
              solutionCode: {
                typescript: "async function fill(page) {\n  await page.frameLocator('#payment-frame').locator('input[name=\"card-cvv\"]').fill('123');\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["page.frameLocator('#payment-frame')", "fill"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'pw-pom-design',
            moduleId: 'pw-fundamentals',
            trackId: 'playwright-ts',
            title: "6. Modern Page Object Model (POM)",
            description: "Class-based Page Objects with readonly locators, atomic action methods, and TypeScript return type guarantees.",
            durationMinutes: 150,
            badge: 'playwright',
            level: 'Intermediate',
            manualContext: {
              title: "Reusable Workflows",
              steps: ["Executing multi-step checkout: Login -> Catalog -> Cart -> Payment."],
              painPoints: ["Writing raw page.click() calls in 100 test files creates a maintenance disaster when URLs change."]
            },
            automationContext: {
              playwrightTs: "export class TransferPage {\n  readonly fromSelect: Locator;\n  readonly amountInput: Locator;\n  constructor(private readonly page: Page) {\n    this.fromSelect = page.getByLabel('Transfer From');\n    this.amountInput = page.getByLabel('Amount ($)');\n  }\n  async transfer(from: string, amount: string) {\n    await this.fromSelect.selectOption(from);\n    await this.amountInput.fill(amount);\n  }\n}",
              seleniumJava: "// Class-based POM in Java",
              explanation: "Playwright Page Objects store lazy Locator declarations. No network requests are made until an action is called.",
              bestPractices: ["Declare locators as readonly Locator properties in constructor", "Keep assertions inside test files"],
              antiPatterns: ["Calling await inside Page Object constructors", "Returning raw element handles"]
            },
            aiAugmentation: {
              promptExample: "Generate a TypeScript Page Object class for this user settings page with readonly Locators.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Create a SearchPage class with searchInput locator, submitBtn locator, and search(query) method.",
              starterCode: {
                typescript: "import { Page, Locator } from '@playwright/test';\nexport class SearchPage {\n  // Implement class\n}",
              },
              solutionCode: {
                typescript: "import { Page, Locator } from '@playwright/test';\nexport class SearchPage {\n  readonly page: Page;\n  readonly searchInput: Locator;\n  readonly submitBtn: Locator;\n  constructor(page: Page) {\n    this.page = page;\n    this.searchInput = page.locator('#search');\n    this.submitBtn = page.getByRole('button', { name: 'Search' });\n  }\n  async search(query: string) {\n    await this.searchInput.fill(query);\n    await this.submitBtn.click();\n  }\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["readonly searchInput", "constructor(page: Page)", "async search(query: string)"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'pw-fixtures',
            moduleId: 'pw-fundamentals',
            trackId: 'playwright-ts',
            title: "7. Custom Test Fixtures & Page Setup Hooks",
            description: "Leverage test.extend() for dependency injection: auto-instantiated Page Objects, logged-in user fixtures, and zero-boilerplate tests.",
            durationMinutes: 120,
            badge: 'playwright',
            level: 'Advanced',
            manualContext: {
              title: "Setup Boilerplate",
              steps: ["Every test in admin suite requires logging in and navigating to settings."],
              painPoints: ["Repeating beforeEach boilerplate across dozens of spec files causes copy-paste errors."]
            },
            automationContext: {
              playwrightTs: "import { test as base } from '@playwright/test';\nimport { TransferPage } from './TransferPage';\n\nexport const test = base.extend<{ transferPage: TransferPage }>({\n  transferPage: async ({ page }, use) => {\n    const transferPage = new TransferPage(page);\n    await page.goto('/transfer');\n    await use(transferPage);\n  },\n});",
              seleniumJava: "// Implemented via BaseTest in Java",
              explanation: "Fixtures provide lazy, isolated dependency injection for tests, handling setup and teardown automatically.",
              bestPractices: ["Create fixtures for frequently used Page Objects and API clients", "Use fixtures for authentication setups"],
              antiPatterns: ["Overloading beforeEach with sequential steps that could be modular fixtures"]
            },
            aiAugmentation: {
              promptExample: "Write a Playwright test.extend fixture that auto-authenticates an admin user.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Extend base test with a custom fixture named 'dashboardPage'.",
              starterCode: {
                typescript: "import { test as base } from '@playwright/test';\nexport const test = base.extend({\n  // Add dashboardPage fixture\n});",
              },
              solutionCode: {
                typescript: "import { test as base } from '@playwright/test';\nexport const test = base.extend({\n  dashboardPage: async ({ page }, use) => {\n    await page.goto('/dashboard');\n    await use(page);\n  }\n});",
              },
              validationRules: [
                {
                  requiredPatterns: ["base.extend", "dashboardPage", "await use("],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'pw-network-mocking',
            moduleId: 'pw-fundamentals',
            trackId: 'playwright-ts',
            title: "8. Network Interception & Route Mocking",
            description: "Master page.route() to mock API responses, simulate 500 server errors, test slow 3G networks, and abort heavy third-party assets.",
            durationMinutes: 150,
            badge: 'playwright',
            level: 'Advanced',
            manualContext: {
              title: "Edge-Case Simulation",
              steps: ["Testing how frontend behaves when payment gateway returns 503 or network drops."],
              painPoints: ["You cannot take down production payment servers just to test negative frontend states."]
            },
            automationContext: {
              playwrightTs: "await page.route('**/api/v1/profile', async (route) => {\n  await route.fulfill({\n    status: 200,\n    body: JSON.stringify({ name: 'Alex', role: 'ADMIN' }),\n  });\n});\n// Abort heavy trackers:\nawait page.route('**/{google-analytics}/**', route => route.abort());",
              seleniumJava: "// Requires complex proxy tools (BrowserMob) in Selenium",
              explanation: "page.route() intercepts network requests at the browser layer, enabling deterministic API response mocking.",
              bestPractices: ["Mock flaky third-party APIs during frontend regression", "Abort ads and analytics to speed up execution by 3x"],
              antiPatterns: ["Mocking internal APIs when the actual test goal is end-to-end integration"]
            },
            aiAugmentation: {
              promptExample: "Write a Playwright page.route mock that returns an empty results list to test zero-state UI.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Use page.route to intercept '**/api/transactions' and return status 500.",
              starterCode: {
                typescript: "async function mockError(page) {\n  // Intercept and return 500\n}",
              },
              solutionCode: {
                typescript: "async function mockError(page) {\n  await page.route('**/api/transactions', async (route) => {\n    await route.fulfill({ status: 500, body: JSON.stringify({ error: 'Down' }) });\n  });\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["page.route", "**/api/transactions", "route.fulfill", "status: 500"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'pw-auth-storage-state',
            moduleId: 'pw-fundamentals',
            trackId: 'playwright-ts',
            title: "9. Auth State Sharing (StorageState)",
            description: "Log in once during global setup, save cookies and localStorage to storageState.json, and reuse across 1,000 parallel tests.",
            durationMinutes: 120,
            badge: 'playwright',
            level: 'Advanced',
            manualContext: {
              title: "Session Reuse",
              steps: ["Logging into an application once and navigating directly to deep protected routes."],
              painPoints: ["Logging in via UI 500 times in a test suite adds 25 minutes of unnecessary execution."]
            },
            automationContext: {
              playwrightTs: "// auth.setup.ts\nawait page.goto('/login');\nawait page.getByLabel('Email').fill('user@qa.io');\nawait page.getByRole('button', { name: 'Log in' }).click();\nawait page.context().storageState({ path: 'playwright/.auth/user.json' });",
              seleniumJava: "// Managing session cookies manually in Selenium",
              explanation: "storageState saves cookies and localStorage to a JSON file. Worker contexts load it in 1ms, bypassing UI login.",
              bestPractices: ["Add auth JSON files to .gitignore to avoid committing tokens", "Create separate storageState for different user roles"],
              antiPatterns: ["Testing login UI inside tests that require authenticated state"]
            },
            aiAugmentation: {
              promptExample: "Configure Playwright storageState setup project for automated multi-role authentication.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Save context storageState to 'auth.json'.",
              starterCode: {
                typescript: "async function save(context) {\n  // Save storageState to 'auth.json'\n}",
              },
              solutionCode: {
                typescript: "async function save(context) {\n  await context.storageState({ path: 'auth.json' });\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["context.storageState", "path: 'auth.json'"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'pw-multi-browser-mobile',
            moduleId: 'pw-fundamentals',
            trackId: 'playwright-ts',
            title: "10. Multi-Browser & Mobile Emulation Testing",
            description: "Run automated suites across Chromium, Firefox, WebKit (Safari), and mobile devices (iPhone 14, Pixel 7) with touch emulation.",
            durationMinutes: 90,
            badge: 'playwright',
            level: 'Intermediate',
            manualContext: {
              title: "Responsive & Safari Checks",
              steps: ["Opening Safari on macOS and resizing viewport to test hamburger menus on mobile."],
              painPoints: ["Cross-browser testing triples execution time if done manually."]
            },
            automationContext: {
              playwrightTs: "// In playwright.config.ts:\nimport { devices } from '@playwright/test';\nexport default {\n  projects: [\n    { name: 'Mobile Safari', use: { ...devices['iPhone 14 Pro'], isMobile: true } },\n    { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } },\n  ],\n};",
              seleniumJava: "// Selenium grid setup with DesiredCapabilities",
              explanation: "Playwright bundles real open-source Chromium, Firefox, and WebKit binaries. Emulation simulates screen dimensions and touch.",
              bestPractices: ["Use isMobile fixture to assert mobile-specific UI like drawer menus", "Run WebKit tests in CI to catch Safari layout bugs"],
              antiPatterns: ["Testing only in Chrome and assuming it works in Safari"]
            },
            aiAugmentation: {
              promptExample: "Generate Playwright device emulation profiles for iPad tablet and Android devices.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Conditionally assert visibility of #mobile-drawer if isMobile is true.",
              starterCode: {
                typescript: "async function check(page, isMobile) {\n  // Assert visibility of #mobile-drawer if isMobile\n}",
              },
              solutionCode: {
                typescript: "async function check(page, isMobile) {\n  if (isMobile) {\n    await expect(page.locator('#mobile-drawer')).toBeVisible();\n  }\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["if (isMobile)", "await expect", "#mobile-drawer", "toBeVisible()"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'pw-trace-viewer',
            moduleId: 'pw-fundamentals',
            trackId: 'playwright-ts',
            title: "11. Playwright Trace Viewer & Video Debugging",
            description: "Time-travel debugging: inspect exact DOM snapshots before and after every action, review network requests, console logs, and videos.",
            durationMinutes: 120,
            badge: 'playwright',
            level: 'Senior',
            manualContext: {
              title: "Bug Reproduction",
              steps: ["Investigating why a test failed on CI by replaying the exact steps leading to failure."],
              painPoints: ["CI test failures with only console logs are notoriously difficult to debug."]
            },
            automationContext: {
              playwrightTs: "// Open trace via CLI:\n// npx playwright show-trace trace.zip\nawait context.tracing.start({ screenshots: true, snapshots: true });\n// ... run steps ...\nawait context.tracing.stop({ path: 'trace.zip' });",
              seleniumJava: "// Requires custom screenshot and network logging listeners in Selenium",
              explanation: "Trace Viewer records DOM snapshots, network waterfalls, action timelines, and console output for time-travel debugging.",
              bestPractices: ["Configure trace: 'retain-on-failure' to save disk space while debugging all failures", "Upload trace.zip as CI artifact"],
              antiPatterns: ["Recording traces on every passed test in production"]
            },
            aiAugmentation: {
              promptExample: "Analyze this Playwright trace error log to diagnose why the locator click timed out.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Start tracing on a browser context with screenshots and snapshots enabled.",
              starterCode: {
                typescript: "async function record(context) {\n  // Start tracing\n}",
              },
              solutionCode: {
                typescript: "async function record(context) {\n  await context.tracing.start({ screenshots: true, snapshots: true });\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["context.tracing.start", "screenshots: true", "snapshots: true"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'pw-ci-sharding',
            moduleId: 'pw-fundamentals',
            trackId: 'playwright-ts',
            title: "12. Parallel Sharding & GitHub Actions CI/CD",
            description: "Run 500 tests in 4 minutes using test sharding (--shard=1/4), matrix builds, artifact merging, and automated Slack notifications.",
            durationMinutes: 120,
            badge: 'playwright',
            level: 'Architect',
            manualContext: {
              title: "Release Velocity",
              steps: ["Waiting for full regression suite to pass before deploying to production."],
              painPoints: ["Running 500 tests on a single machine takes 40 minutes, delaying deployments."]
            },
            automationContext: {
              playwrightTs: "# In GitHub Actions matrix:\n# run: npx playwright test --shard=\\${{ matrix.shardIndex }}/\\${{ matrix.shardTotal }}",
              seleniumJava: "// Selenium grid with distributed Hub and Nodes",
              explanation: "Playwright sharding divides test suites evenly across multiple cloud VM runners. 4 shards run 4x faster.",
              bestPractices: ["Use GitHub Actions matrix strategy for horizontal scaling", "Merge blob reports from all shards using merge-reports"],
              antiPatterns: ["Setting fail-fast: true in test matrix (cancels other shards before full results gather)"]
            },
            aiAugmentation: {
              promptExample: "Generate a GitHub Actions workflow that shards Playwright tests across 4 runners.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Return the Playwright CLI flag for shard 1 of 4.",
              starterCode: {
                typescript: "function getShard(): string {\n  return '';\n}",
              },
              solutionCode: {
                typescript: "function getShard(): string {\n  return '--shard=1/4';\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["--shard=1/4"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
        ]
      },
    ]
  },
  {
    id: 'api-testing',
    title: 'REST Assured & API Automation',
    tagline: 'Postman to Code: Contract Testing, Microservices & Auth',
    description: 'Master REST Assured, Given-When-Then BDD syntax, JSONPath assertions, POJO serialization, OAuth2/JWT auth, and CI/CD pipelines.',
    color: 'purple',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
    iconName: 'Server',
    totalLessons: 8,
    estimatedHours: 18,
    modules: [
      {
        id: 'api-fundamentals',
        trackId: 'api-testing',
        title: 'REST Architecture & Automated Contract Validation',
        description: 'From Postman manual testing to automated REST Assured suites, POJOs, and JSON schema verification.',
        order: 1,
        lessons: [
          {
            id: 'api-rest-basics',
            moduleId: 'api-fundamentals',
            trackId: 'api-testing',
            title: "1. REST Fundamentals & Postman Transition",
            description: "Understand HTTP request headers, query parameters, path params, status codes, and mapping Postman collections to code.",
            durationMinutes: 120,
            badge: 'api-testing',
            level: 'Beginner',
            manualContext: {
              title: "Manual Postman Testing",
              steps: ["Open Postman, select POST, enter URL, write JSON body, click Send, verify 200 OK."],
              painPoints: ["Postman collections are hard to version control and integrate into developer PR pipelines."]
            },
            automationContext: {
              playwrightTs: "const response = await request.get('/api/users', { params: { status: 'active' } });\nexpect(response.status()).toBe(200);",
              restAssuredJava: "RestAssured.baseURI = \"https://intelligentqa.io/api\";\nResponse response = given()\n    .queryParam(\"status\", \"active\")\n.when()\n    .get(\"/users\")\n.then()\n    .statusCode(200)\n    .extract().response();",
              explanation: "REST Assured provides a domain-specific language in Java that reads like plain English while executing real HTTP calls.",
              bestPractices: ["Centralize baseURI in an APIBase class", "Verify both HTTP status code and response payload structure"],
              antiPatterns: ["Hardcoding hostnames inside every single test method"]
            },
            aiAugmentation: {
              promptExample: "Convert this Postman request JSON export into a REST Assured Java test class.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Set RestAssured.baseURI and write a GET request asserting 200 status code.",
              starterCode: {
                java: "public class ApiStarter {\n    public void testGet() {\n        // Set baseURI and assert 200\n    }\n}"
              },
              solutionCode: {
                java: "public class ApiStarter {\n    public void testGet() {\n        RestAssured.baseURI = \"https://api.intelligentqa.io\";\n        RestAssured.when().get(\"/users\").then().statusCode(200);\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["RestAssured.baseURI", ".when().get", ".statusCode(200)"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'api-given-when-then',
            moduleId: 'api-fundamentals',
            trackId: 'api-testing',
            title: "2. Given-When-Then BDD Syntax & Requests",
            description: "Master the Given (preconditions), When (actions), Then (assertions) BDD pattern in automated API tests.",
            durationMinutes: 120,
            badge: 'api-testing',
            level: 'Beginner',
            manualContext: {
              title: "BDD Requirement Flow",
              steps: ["GIVEN an API key and header, WHEN sending a request, THEN assert status is 200 and body is valid."],
              painPoints: ["Legacy Java HTTP clients require 30 lines of boilerplate to make a single GET request."]
            },
            automationContext: {
              playwrightTs: "const res = await request.post('/api/users', { data: { name: 'New User' } });\nexpect(res.status()).toBe(201);",
              restAssuredJava: "given()\n    .header(\"Authorization\", \"Bearer \" + token)\n    .contentType(ContentType.JSON)\n    .body(\"{\\\"name\\\": \\\"New User\\\"}\")\n.when()\n    .post(\"/api/v1/users\")\n.then()\n    .statusCode(201)\n    .body(\"id\", notNullValue());",
              explanation: "Given-When-Then structures tests into setup, action, and assertion phases. Static Hamcrest matchers keep assertions clean.",
              bestPractices: ["Group headers and auth into given()", "Keep HTTP method triggers in when()", "Chain assertions in then()"],
              antiPatterns: ["Extracting raw string response and using string.contains() for validation"]
            },
            aiAugmentation: {
              promptExample: "Write a REST Assured test using Given-When-Then syntax to create a customer and assert 201 Created.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Chain given(), when(), then() to send a POST request with body and assert statusCode 201.",
              starterCode: {
                java: "public class BddTest {\n    public void testPost() {\n        // Chain given, when, then with statusCode 201\n    }\n}"
              },
              solutionCode: {
                java: "public class BddTest {\n    public void testPost() {\n        given().body(\"{\\\"test\\\": true}\").when().post(\"/items\").then().statusCode(201);\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["given()", "body(", "when().post", "then().statusCode(201)"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'api-rest-crud',
            moduleId: 'api-fundamentals',
            trackId: 'api-testing',
            title: "3. CRUD Operations & Status Code Assertions",
            description: "Automate complete entity lifecycles: POST (Create), GET (Read), PUT/PATCH (Update), DELETE with 200, 201, 204, 404 assertions.",
            durationMinutes: 150,
            badge: 'api-testing',
            level: 'Intermediate',
            manualContext: {
              title: "Manual CRUD Flow",
              steps: ["Create item (POST 201) -> Read item (GET 200) -> Delete item (DELETE 204) -> Verify gone (GET 404)."],
              painPoints: ["Manual CRUD testing takes 5 minutes per run and leaves dirty test records in the database."]
            },
            automationContext: {
              playwrightTs: "const res = await request.post('/api/tickets', { data: { title: 'Bug' } });\nconst { id } = await res.json();\nconst del = await request.delete(`/api/tickets/${id}`);\nexpect(del.status()).toBe(204);",
              restAssuredJava: "String id = given().contentType(ContentType.JSON).body(\"{\\\"title\\\": \\\"Bug\\\"}\")\n    .when().post(\"/api/tickets\").then().statusCode(201).extract().path(\"id\");\n\ngiven().pathParam(\"id\", id)\n    .when().delete(\"/api/tickets/{id}\").then().statusCode(204);",
              explanation: "Automating end-to-end CRUD guarantees full state lifecycle verification and keeps the environment clean.",
              bestPractices: ["Use pathParam() rather than string concatenation", "Verify negative cases (404 on deleted items)"],
              antiPatterns: ["Leaving created test records in staging databases without teardown"]
            },
            aiAugmentation: {
              promptExample: "Generate an end-to-end CRUD lifecycle test suite in REST Assured with automatic ID chaining.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Send a DELETE request to '/api/items/{id}' with pathParam and assert status code 204.",
              starterCode: {
                java: "public class DeleteHelper {\n    public void deleteItem(String id) {\n        // Send DELETE with pathParam id and verify 204\n    }\n}"
              },
              solutionCode: {
                java: "public class DeleteHelper {\n    public void deleteItem(String id) {\n        given().pathParam(\"id\", id).when().delete(\"/api/items/{id}\").then().statusCode(204);\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["pathParam(\"id\", id)", ".delete(\"/api/items/{id}\")", "statusCode(204)"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'api-request-specs',
            moduleId: 'api-fundamentals',
            trackId: 'api-testing',
            title: "4. Request & Response Specification Reusability",
            description: "Eliminate duplicate headers: build reusable RequestSpecBuilder and ResponseSpecBuilder instances for framework modularity.",
            durationMinutes: 120,
            badge: 'api-testing',
            level: 'Intermediate',
            manualContext: {
              title: "Shared Headers",
              steps: ["Setting Authorization and Content-Type headers at collection level in Postman."],
              painPoints: ["Copy-pasting .header('Authorization', ...) into 200 test methods creates massive technical debt."]
            },
            automationContext: {
              playwrightTs: "const apiContext = await request.newContext({ baseURL: 'https://api.io', extraHTTPHeaders: { 'Auth': token } });",
              restAssuredJava: "RequestSpecification requestSpec = new RequestSpecBuilder()\n    .setBaseUri(\"https://intelligentqa.io/api\")\n    .addHeader(\"Authorization\", \"Bearer \" + token)\n    .setContentType(ContentType.JSON)\n    .build();\n\ngiven().spec(requestSpec).when().get(\"/users\").then().statusCode(200);",
              explanation: "RequestSpecBuilder and ResponseSpecBuilder encapsulate shared headers, logging filters, and SLA thresholds.",
              bestPractices: ["Build separate adminSpec and guestSpec for role-based testing", "Include response time assertions in response specs"],
              antiPatterns: ["Repeating baseUrl and auth headers in every single test method"]
            },
            aiAugmentation: {
              promptExample: "Write a reusable REST Assured SpecFactory providing authenticated RequestSpecification instances.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Create a RequestSpecification using RequestSpecBuilder with baseUri and ContentType.JSON.",
              starterCode: {
                java: "public class SpecHelper {\n    public RequestSpecification createSpec(String uri) {\n        // Build RequestSpecification\n    }\n}"
              },
              solutionCode: {
                java: "public class SpecHelper {\n    public RequestSpecification createSpec(String uri) {\n        return new RequestSpecBuilder().setBaseUri(uri).setContentType(ContentType.JSON).build();\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["RequestSpecBuilder", "setBaseUri", "setContentType(ContentType.JSON)", "build()"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'api-json-path',
            moduleId: 'api-fundamentals',
            trackId: 'api-testing',
            title: "5. JSONPath Querying & Deep Payload Validation",
            description: "Extract nested attributes, parse arrays, filter collections with Groovy expressions (findAll, collect), and assert schema nodes.",
            durationMinutes: 150,
            badge: 'api-testing',
            level: 'Intermediate',
            manualContext: {
              title: "Deep Payload Verification",
              steps: ["Verifying that item ID 105 in a 50-item array has price $49.99 and stock > 0."],
              painPoints: ["Manually scanning 500 lines of JSON in Postman response window is slow and error-prone."]
            },
            automationContext: {
              playwrightTs: "const data = await response.json();\nconst item = data.items.find(i => i.id === 105);\nexpect(item.price).toBe(49.99);",
              restAssuredJava: "Response res = get(\"/api/orders/101\");\nString city = res.jsonPath().getString(\"customer.address.city\");\nfloat price = res.jsonPath().get(\"items.find { it.name == 'Mouse' }.price\");",
              explanation: "REST Assured integrates Groovy GPath syntax for deep querying, filtering, and aggregation on JSON trees without manual loops.",
              bestPractices: ["Use jsonPath().get('items.find { it.id == target }') to locate specific objects", "Verify list sizes before inspecting elements"],
              antiPatterns: ["Using regex or string parsing on JSON payloads"]
            },
            aiAugmentation: {
              promptExample: "Write a REST Assured JSONPath query to filter users with balance > 1000 and extract their emails.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Use jsonPath() to extract string value at path 'user.profile.email'.",
              starterCode: {
                java: "public class JsonPathHelper {\n    public String getEmail(Response res) {\n        // Return email from jsonPath\n    }\n}"
              },
              solutionCode: {
                java: "public class JsonPathHelper {\n    public String getEmail(Response res) {\n        return res.jsonPath().getString(\"user.profile.email\");\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["res.jsonPath()", "getString(\"user.profile.email\")"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'api-pojo-serialization',
            moduleId: 'api-fundamentals',
            trackId: 'api-testing',
            title: "6. POJO Serialization & Deserialization (Jackson)",
            description: "Type-safe API automation: Jackson object mapping, builder pattern for test data payloads, and deserializing responses into Java models.",
            durationMinutes: 150,
            badge: 'api-testing',
            level: 'Advanced',
            manualContext: {
              title: "Payload Construction",
              steps: ["Typing JSON payloads into Postman body tabs with quotes, brackets, and commas."],
              painPoints: ["Constructing JSON strings with manual string concatenation leads to typo errors and syntax breaks."]
            },
            automationContext: {
              playwrightTs: "interface UserReq { name: string; email: string; }\nconst res = await request.post('/api/users', { data: { name: 'Jordan' } });",
              restAssuredJava: "UserRequest newUser = new UserRequest(\"Jordan Lee\", \"jordan@qa.io\");\nUserResponse created = given()\n    .contentType(ContentType.JSON)\n    .body(newUser) // Auto-serialized by Jackson\n.when().post(\"/api/users\")\n.then().statusCode(201).extract().as(UserResponse.class);",
              explanation: "Object mapping converts Java POJOs into JSON payloads and responses back into typed Java objects automatically.",
              bestPractices: ["Use Lombok (@Data, @Builder) to keep POJOs clean and maintainable", "Deserialize error responses into ErrorResponse POJOs"],
              antiPatterns: ["Writing JSON bodies as escaped raw strings (\\\"name\\\": \\\"value\\\") in test code"]
            },
            aiAugmentation: {
              promptExample: "Generate Java POJO classes with Jackson annotations and Lombok builder for this API payload schema.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Send a POST request passing a POJO into body and deserialize into UserResponse.class.",
              starterCode: {
                java: "public class PojoHelper {\n    public UserResponse create(UserRequest req) {\n        // Send POST with POJO body and extract as UserResponse.class\n    }\n}"
              },
              solutionCode: {
                java: "public class PojoHelper {\n    public UserResponse create(UserRequest req) {\n        return given().contentType(ContentType.JSON).body(req).when().post(\"/users\").then().extract().as(UserResponse.class);\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: [".body(req)", ".extract().as(UserResponse.class)"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'api-auth-tokens',
            moduleId: 'api-fundamentals',
            trackId: 'api-testing',
            title: "7. Auth Tokens (JWT, OAuth2 & API Keys)",
            description: "Automate authentication flows: logging in to extract JWT tokens, refreshing expired tokens, and injecting Bearer headers.",
            durationMinutes: 150,
            badge: 'api-testing',
            level: 'Advanced',
            manualContext: {
              title: "Token Management",
              steps: ["Logging in via Postman, copying the Bearer token, and pasting it into other requests."],
              painPoints: ["JWT tokens expire every 15 minutes. Manual testers waste time re-logging in and re-pasting tokens."]
            },
            automationContext: {
              playwrightTs: "const loginRes = await request.post('/api/auth/login', { data: { user, pass } });\nconst { token } = await loginRes.json();",
              restAssuredJava: "String token = given().body(\"{\\\"email\\\": \\\"admin@qa.io\\\", \\\"pass\\\": \\\"123\\\"}\")\n    .post(\"/api/auth/login\").jsonPath().getString(\"token\");\n\ngiven().auth().oauth2(token).when().get(\"/api/details\").then().statusCode(200);",
              explanation: "Automating token retrieval and refresh eliminates manual token handling and keeps suites running seamlessly.",
              bestPractices: ["Cache tokens and refresh only when near expiration", "Inject credentials via environment variables"],
              antiPatterns: ["Re-authenticating via login API on every single test method (adds massive latency)"]
            },
            aiAugmentation: {
              promptExample: "Write a thread-safe token manager in Java that handles OAuth2 token caching with auto-refresh.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Use RestAssured auth().oauth2(token) to authenticate a GET request to '/api/secure'.",
              starterCode: {
                java: "public class SecureApi {\n    public void callSecure(String token) {\n        // GET /api/secure with oauth2 token\n    }\n}"
              },
              solutionCode: {
                java: "public class SecureApi {\n    public void callSecure(String token) {\n        given().auth().oauth2(token).when().get(\"/api/secure\").then().statusCode(200);\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: [".auth().oauth2(token)", ".get(\"/api/secure\")"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'api-schema-validation',
            moduleId: 'api-fundamentals',
            trackId: 'api-testing',
            title: "8. JSON Schema Validation & CI/CD Regression",
            description: "Enforce API contract stability: validate response schemas against JSON Schema Draft v7 to catch breaking API changes before production.",
            durationMinutes: 120,
            badge: 'api-testing',
            level: 'Senior',
            manualContext: {
              title: "Contract Stability",
              steps: ["Verifying that response has all required fields and correct data types (number vs string)."],
              painPoints: ["If backend changes userId: 101 to userId: '101', frontend mobile apps crash in production!"]
            },
            automationContext: {
              playwrightTs: "import { z } from 'zod';\nconst UserSchema = z.object({ id: z.number(), name: z.string() });",
              restAssuredJava: "import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;\n\nwhen().get(\"/api/users/1\")\n.then().statusCode(200)\n.body(matchesJsonSchemaInClasspath(\"schemas/user-schema.json\"));",
              explanation: "JSON Schema Validation asserts data types, required fields, and nested structures in a single line of code.",
              bestPractices: ["Store schema files in src/test/resources/schemas", "Run schema validation in PR pipelines to catch breaking changes"],
              antiPatterns: ["Writing 50 individual field assertions when a JSON schema validates the entire contract"]
            },
            aiAugmentation: {
              promptExample: "Generate a valid JSON Schema Draft-07 specification from this sample API response.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Validate that response body matches 'schemas/product.json' using matchesJsonSchemaInClasspath.",
              starterCode: {
                java: "public class SchemaTest {\n    public void testSchema() {\n        // Verify response matches schemas/product.json\n    }\n}"
              },
              solutionCode: {
                java: "public class SchemaTest {\n    public void testSchema() {\n        when().get(\"/products/1\").then().body(matchesJsonSchemaInClasspath(\"schemas/product.json\"));\n    }\n}"
              },
              validationRules: [
                {
                  requiredPatterns: ["matchesJsonSchemaInClasspath(\"schemas/product.json\")"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
        ]
      },
    ]
  },
  {
    id: 'ai-qa',
    title: 'Step-by-Step AI for QA Professionals',
    tagline: 'The 8-Step Progressive AI Journey for Manual QA',
    description: 'A transformative 8-step journey for manual testers: prompt engineering, synthetic test data generation, self-healing locators, autonomous QA agents, and testing LLM applications.',
    color: 'cyan',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800',
    iconName: 'Sparkles',
    totalLessons: 8,
    estimatedHours: 20,
    modules: [
      {
        id: 'ai-qa-journey',
        trackId: 'ai-qa',
        title: 'The 8-Step Progressive AI Journey for Manual QA',
        description: 'From mental shift and prompt architecture to self-healing automation and testing Generative AI.',
        order: 1,
        lessons: [
          {
            id: 'step-0-demystifying-ai',
            moduleId: 'ai-qa-journey',
            trackId: 'ai-qa',
            title: "1. Step 0: Demystifying AI for QA (The Mental Shift)",
            description: "Understand what AI can and cannot do: transitioning from manual test executor to AI-augmented Quality Architect.",
            durationMinutes: 120,
            badge: 'ai-qa',
            level: 'Beginner',
            manualContext: {
              title: "Manual Tester Mental Shift",
              steps: ["Old Way: Writing 15 test cases in Excel and executing them click-by-click.", "New Way: Prompting AI for 50 edge-case permutations, applying domain critical thinking, and automating resilient scripts."],
              painPoints: ["Fear of AI replacing testers: AI does not replace QA testers; QAs who use AI replace QAs who do not!"]
            },
            automationContext: {
              playwrightTs: "// AI generates repetitive permutations; the SDET designs the architecture and security boundaries.",
              explanation: "View AI as a tireless junior SDET. You provide strict system instructions and domain context, while the AI generates test permutations.",
              bestPractices: ["Never trust AI outputs blindly; always verify generated locators against real DOM", "Focus human energy on boundary conditions and risk"],
              antiPatterns: ["Pasting sensitive customer PII or company secrets into public AI chats"]
            },
            aiAugmentation: {
              promptExample: "Act as a Senior SDET. Analyze this requirement and identify 5 high-risk edge cases that manual testers typically overlook.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Write a professional SDET prompt template asking AI to identify 5 edge-case failure modes for a feature.",
              starterCode: {
                typescript: "function createPrompt(feature: string): string {\n  return '';\n}",
              },
              solutionCode: {
                typescript: "function createPrompt(feature: string): string {\n  return `Act as a Senior SDET. Analyze ${feature} and list 5 edge-case failure scenarios.`;\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["Senior SDET", "edge-case", "feature"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'step-1-prompt-engineering',
            moduleId: 'ai-qa-journey',
            trackId: 'ai-qa',
            title: "2. Step 1: Prompt Engineering Mastery for Testers",
            description: "Master few-shot prompting, system instructions, Gherkin output formats, and boundary value exploration.",
            durationMinutes: 150,
            badge: 'ai-qa',
            level: 'Beginner',
            manualContext: {
              title: "Basic vs Professional Prompting",
              steps: ["Weak Prompt: 'Write tests for login'.", "SDET Prompt: 'Act as Principal QA. Generate Gherkin test matrix covering valid login, expired token, lockout, and SQL injection with P0-P2 priorities.'"],
              painPoints: ["Vague prompts yield generic, useless test cases that miss real production bugs."]
            },
            automationContext: {
              playwrightTs: "// Feature: User Authentication & Security\n// Scenario: Account lockout after 5 consecutive failed attempts\n// Given an active user account\n// When user enters invalid password 5 consecutive times\n// Then account status transitions to LOCKED",
              explanation: "Effective prompting requires 4 ingredients: 1. Role Definition, 2. Task & Context, 3. Constraints & Edge Cases, 4. Output Schema (Markdown table, Gherkin).",
              bestPractices: ["Always specify output format (Markdown table or Gherkin)", "Instruct the model on what NOT to do"],
              antiPatterns: ["Using open-ended single-sentence prompts without context"]
            },
            aiAugmentation: {
              promptExample: "System: You are an expert QA Engineer. Generate 10 boundary test cases for a currency transfer input ($0.01 min, $10,000 max).",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Construct an AI prompt containing Role, Gherkin format, and edge cases constraint.",
              starterCode: {
                typescript: "function buildPrompt(): string {\n  return '';\n}",
              },
              solutionCode: {
                typescript: "function buildPrompt(): string {\n  return 'Role: Principal SDET. Generate Gherkin test cases for checkout with edge cases.';\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["Role:", "Gherkin", "edge cases"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'step-2-synthetic-test-data',
            moduleId: 'ai-qa-journey',
            trackId: 'ai-qa',
            title: "3. Step 2: AI Synthetic Test Data Generation",
            description: "Generate realistic, PII-compliant test data: valid/invalid credit cards, international phone numbers, and boundary JSON payloads.",
            durationMinutes: 150,
            badge: 'ai-qa',
            level: 'Intermediate',
            manualContext: {
              title: "Manual Data Creation",
              steps: ["Manual tester creates mock data: 'test1@test.com', '1234567890'."],
              painPoints: ["Lazy test data misses real defects: German umlauts (M\u00fcller), Arabic RTL text, and leap-year edge dates."]
            },
            automationContext: {
              playwrightTs: "export const SYNTHETIC_DATA = [\n  { name: 'Dr. Jane M\u00fcller', locale: 'de-DE', email: 'jane.muller@example.de' },\n  { name: 'A'.repeat(255), locale: 'en-US', email: 'max_len@example.com' },\n];",
              explanation: "AI-generated synthetic data produces realistic diversity while ensuring 100% compliance with data privacy regulations (GDPR/HIPAA).",
              bestPractices: ["Never use production customer data for testing", "Include extreme string boundaries (0 chars, 255 chars, 10,000 chars)"],
              antiPatterns: ["Using real personal emails or phone numbers in test databases"]
            },
            aiAugmentation: {
              promptExample: "Generate a JSON array of 10 synthetic customer profiles with valid Luhn credit cards and international addresses.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Write a TypeScript function that validates synthetic email formats before injecting into tests.",
              starterCode: {
                typescript: "function isValidEmail(email: string): boolean {\n  // Validate email\n}",
              },
              solutionCode: {
                typescript: "function isValidEmail(email: string): boolean {\n  return email.includes('@') && email.includes('.');\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["email.includes('@')", "email.includes('.')"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'step-3-ai-code-scaffolding',
            moduleId: 'ai-qa-journey',
            trackId: 'ai-qa',
            title: "4. Step 3: AI-Driven POM Code Scaffolding",
            description: "Feed raw HTML and DOM trees into AI agents to scaffold complete Page Object Model classes with web-first assertions.",
            durationMinutes: 180,
            badge: 'ai-qa',
            level: 'Intermediate',
            manualContext: {
              title: "Coding Bottlenecks",
              steps: ["Manually inspecting 30 elements on a form, writing locators and methods takes 3 hours per page."],
              painPoints: ["Repetitive boilerplate coding burns out engineers and delays automation coverage."]
            },
            automationContext: {
              playwrightTs: "export class RegistrationPage {\n  readonly firstName: Locator;\n  constructor(private readonly page: Page) {\n    this.firstName = page.getByLabel('First Name');\n  }\n}",
              explanation: "AI agents transform structured HTML markup into object-oriented design patterns in seconds.",
              bestPractices: ["Supply the exact tech stack in prompt (Playwright TypeScript with getByRole)", "Review locators to ensure no fragile CSS was generated"],
              antiPatterns: ["Pasting 5,000 lines of minified JavaScript into the prompt (provide clean semantic HTML)"]
            },
            aiAugmentation: {
              promptExample: "Generate a Playwright TypeScript Page Object class for this HTML form markup using getByRole and getByLabel.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Construct an AI prompt instructing the model to scaffold a Playwright Page Object Model class in TypeScript.",
              starterCode: {
                typescript: "function getScaffoldPrompt(html: string): string {\n  return '';\n}",
              },
              solutionCode: {
                typescript: "function getScaffoldPrompt(html: string): string {\n  return `Scaffold a Playwright Page Object Model class in TypeScript for: ${html}`;\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["Playwright", "Page Object Model", "TypeScript"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'step-4-self-healing-locators',
            moduleId: 'ai-qa-journey',
            trackId: 'ai-qa',
            title: "5. Step 4: Self-Healing Locators & Visual Testing AI",
            description: "Implement resilient locator fallback strategies: DOM cosine similarity, multi-attribute weighting, and visual AI regression.",
            durationMinutes: 150,
            badge: 'ai-qa',
            level: 'Advanced',
            manualContext: {
              title: "Brittle Locators",
              steps: ["Developers rename button ID from #submit-btn to #checkout-submit. Next morning 40 tests fail."],
              painPoints: ["False positives destroy trust in automated test suites."]
            },
            automationContext: {
              playwrightTs: "export async function findResilientElement(page: Page, primary: string, role: string, name: string) {\n  try {\n    return await page.waitForSelector(primary, { timeout: 2000 });\n  } catch {\n    return page.getByRole(role as any, { name });\n  }\n}",
              explanation: "Self-healing systems store element fingerprints (ID, text, accessibility role). If the primary ID changes, fallback queries resolve the element.",
              bestPractices: ["Log self-healing activations as warnings so SDETs can update locators in next PR", "Combine with visual snapshot assertions"],
              antiPatterns: ["Silently healing without logging (masks developer regressions)"]
            },
            aiAugmentation: {
              promptExample: "Analyze this broken selector and updated DOM snapshot to identify the new selector for Submit button.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Implement try-catch fallback that tries primary selector and falls back to getByRole.",
              starterCode: {
                typescript: "async function safeClick(page, sel, role, name) {\n  // Try sel, fallback to getByRole\n}",
              },
              solutionCode: {
                typescript: "async function safeClick(page, sel, role, name) {\n  try {\n    await page.click(sel, { timeout: 1000 });\n  } catch {\n    await page.getByRole(role, { name }).click();\n  }\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["try", "catch", "getByRole"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'step-5-ai-failure-triage',
            moduleId: 'ai-qa-journey',
            trackId: 'ai-qa',
            title: "6. Step 5: AI Failure Log Triage & Root Cause Analysis",
            description: "Automate CI/CD failure analysis: feed stack traces and DOM snapshots to LLMs for automated root-cause classification and Jira bug filing.",
            durationMinutes: 150,
            badge: 'ai-qa',
            level: 'Advanced',
            manualContext: {
              title: "Triage Fatigue",
              steps: ["Nightly CI run has 15 failed tests. QA spends 2 hours reading raw logs to find root causes."],
              painPoints: ["90% of triage time is spent identifying common patterns: expired tokens or network timeouts."]
            },
            automationContext: {
              playwrightTs: "export function classifyFailure(stackTrace: string): string {\n  if (stackTrace.includes('ERR_CONNECTION_REFUSED')) return 'INFRA_TIMEOUT';\n  if (stackTrace.includes('500 Internal Server Error')) return 'PRODUCT_BUG';\n  if (stackTrace.includes('Timeout')) return 'LOCATOR_DRIFT';\n  return 'OTHER';\n}",
              explanation: "Automating triage parses stack traces and classifies failures into infrastructure blips vs genuine software regressions.",
              bestPractices: ["Include last 3 network requests in AI triage payload", "Automatically tag flaky tests and open draft Jira issues"],
              antiPatterns: ["Blindly re-running failed tests 5 times without logging root cause triage"]
            },
            aiAugmentation: {
              promptExample: "Analyze this Playwright test failure stack trace. Determine if Product Bug or Script Issue and generate Jira ticket.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Write failure triage classifier returning PRODUCT_BUG on 500 and LOCATOR_DRIFT on Timeout.",
              starterCode: {
                typescript: "function triage(msg: string): string {\n  // Classify msg\n}",
              },
              solutionCode: {
                typescript: "function triage(msg: string): string {\n  if (msg.includes('500')) return 'PRODUCT_BUG';\n  if (msg.includes('Timeout')) return 'LOCATOR_DRIFT';\n  return 'OTHER';\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["msg.includes('500')", "'PRODUCT_BUG'", "'LOCATOR_DRIFT'"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'step-6-testing-ai-applications',
            moduleId: 'ai-qa-journey',
            trackId: 'ai-qa',
            title: "7. Step 6: Testing AI, Chatbots & LLM Applications",
            description: "How to test Generative AI applications: hallucination detection, prompt injection vulnerabilities, semantic distance, and LLM-as-a-Judge.",
            durationMinutes: 150,
            badge: 'ai-qa',
            level: 'Senior',
            manualContext: {
              title: "Non-Deterministic Testing",
              steps: ["Testing a customer support AI chatbot: response wording changes on every run, but semantic fact must remain true."],
              painPoints: ["Traditional assert.equals() fails completely on LLM responses because wording varies dynamically."]
            },
            automationContext: {
              playwrightTs: "export async function assertSemanticAccuracy(actual: string, fact: string): Promise<boolean> {\n  const prompt = `Fact: ${fact}\nActual: ${actual}\nDoes Actual accurately convey Fact? Answer YES or NO:`;\n  return (await callJudge(prompt)).trim().toUpperCase() === 'YES';\n}",
              explanation: "Testing AI requires probabilistic quality engineering: semantic similarity scores, prompt injection defenses, and LLM-as-a-Judge.",
              bestPractices: ["Define strict factual benchmarks for RAG applications", "Test safety guardrails: attempts to jailbreak or leak system prompts"],
              antiPatterns: ["Using string exact-match assertions on generative model outputs"]
            },
            aiAugmentation: {
              promptExample: "Generate 5 adversarial prompt injection attacks to test if a customer support bot will leak its system prompt.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Implement an assertion checking that an LLM response does not contain 'SYSTEM_PROMPT'.",
              starterCode: {
                typescript: "function verifySafety(res: string): boolean {\n  // Check no SYSTEM_PROMPT leak\n}",
              },
              solutionCode: {
                typescript: "function verifySafety(res: string): boolean {\n  return !res.includes('SYSTEM_PROMPT');\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["!res.includes('SYSTEM_PROMPT')"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
          {
            id: 'step-7-autonomous-qa-agents',
            moduleId: 'ai-qa-journey',
            trackId: 'ai-qa',
            title: "8. Step 7: Autonomous QA Agent Workflows in CI/CD",
            description: "Multi-agent quality engineering: autonomous requirement generation, automated test matrix synthesis, self-remediating CI/CD pipelines.",
            durationMinutes: 150,
            badge: 'ai-qa',
            level: 'Architect',
            manualContext: {
              title: "Autonomous Quality",
              steps: ["Agent triggers on PR creation, analyzes code diff, writes Playwright tests, runs them in Docker, and reports results."],
              painPoints: ["Teams struggle to maintain 100% test coverage as feature velocity accelerates."]
            },
            automationContext: {
              playwrightTs: "// Agent 1: Requirement Generator -> Agent 2: Test Case Generator\n// Agent 3: Automation Generator -> Agent 4: Code Auditor -> Agent 5: SDET Mentor",
              explanation: "Autonomous QA agents coordinate in multi-agent workflows, each owning specialized stages of the quality lifecycle.",
              bestPractices: ["Keep human SDET in the loop to review and approve agent PR submissions", "Enforce strict linter rules on agent test files"],
              antiPatterns: ["Deploying auto-generated test scripts directly to production without human review"]
            },
            aiAugmentation: {
              promptExample: "Run autonomous QA agent suite to generate requirements, test cases, and Playwright code for this shopping cart user story.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Write a workflow coordinator that calls generateReqs, generateTests, and generateCode in sequence.",
              starterCode: {
                typescript: "async function runPipeline(story: string) {\n  // Run 3 agent steps\n}",
              },
              solutionCode: {
                typescript: "async function runPipeline(story: string) {\n  const reqs = await generateReqs(story);\n  const tests = await generateTests(reqs);\n  return await generateCode(tests);\n}",
              },
              validationRules: [
                {
                  requiredPatterns: ["generateReqs", "generateTests", "generateCode"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
        ]
      },
    ]
  },
  {
    id: 'interview-griller',
    title: 'QA Interview Mastery & Coding Griller',
    tagline: 'Technical Scenarios, Architecture Rounds & Live Simulator',
    description: 'Master senior SDET interview rounds: framework architecture design, flakiness elimination, concurrency, and live AI grilling simulations.',
    color: 'rose',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    iconName: 'Award',
    totalLessons: 6,
    estimatedHours: 20,
    modules: [
      {
        id: 'interview-scenarios',
        trackId: 'interview-griller',
        title: 'Top SDET Technical Scenarios',
        description: 'Deep dives into the hardest interview questions asked by top tech companies.',
        order: 1,
        lessons: [
          {
            id: 'flakiness-and-retries',
            moduleId: 'interview-scenarios',
            trackId: 'interview-griller',
            title: "1. Flakiness Elimination & CI/CD Sharding",
            description: "How to answer 'How do you eliminate flaky tests?' and architect resilient retry algorithms.",
            durationMinutes: 200,
            badge: 'interview',
            level: 'Architect',
            manualContext: {
              title: "The Flaky Test Problem",
              steps: ["In interviews, architects want to know how you stop tests from passing locally but failing on CI."],
              painPoints: ["Junior testers answer 'I add retries'. Senior SDETs know retries mask bugs and latency!"]
            },
            automationContext: {
              playwrightTs: "// Architecture: Eliminate race conditions with web-first assertions, ensure test isolation, use Trace Viewer.",
              explanation: "The correct interview response tackles root causes (dynamic synchronization, isolated contexts) before mentioning retries.",
              bestPractices: ["Never use retries as a replacement for proper synchronization", "Quarantine flaky tests to separate build targets"],
              antiPatterns: ["Saying 'I increase implicit wait to 60 seconds' in an interview"]
            },
            aiAugmentation: {
              promptExample: "Give me 3 probing follow-up questions an interviewer will ask when I explain my test framework architecture.",
              agenticWorkflow: 'QA AI Agent assists with generation and code reviews.',
              selfHealingTip: 'Self-healing monitors adapt dynamic locators at runtime.'
            },
            challenge: {
              instruction: "Configure retries and trace recording on failure in Playwright configuration.",
              starterCode: {
                typescript: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  // Add retries and trace\n});",
              },
              solutionCode: {
                typescript: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  retries: 2,\n  use: { trace: 'retain-on-failure' }\n});",
              },
              validationRules: [
                {
                  requiredPatterns: ["retries", "retain-on-failure"],
                  forbiddenPatterns: ['Thread.sleep'],
                  description: 'Validates required patterns'
                }
              ]
            }
          },
        ]
      },
    ]
  },
];

export function getTrackById(id: string): Track | undefined {
  return QA_TRACKS.find(t => t.id === id);
}

export function getAllLessons(): Lesson[] {
  return QA_TRACKS.flatMap(t => t.modules.flatMap(m => m.lessons));
}

export function getLessonById(trackId: string, lessonId: string): { track: Track; module: any; lesson: Lesson } | undefined {
  const track = getTrackById(trackId);
  if (!track) return undefined;
  for (const module of track.modules) {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (lesson) {
      return { track, module, lesson };
    }
  }
  return undefined;
}