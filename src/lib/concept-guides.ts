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
}

export const TRACK_META: Record<string, { id: string; name: string; tag: string; color: string; badgeClass: string }> = {
  selenium: {
    id: 'selenium',
    name: 'Selenium WebDriver',
    tag: 'Java & Python',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  'selenium-java': {
    id: 'selenium',
    name: 'Selenium WebDriver',
    tag: 'Java & Python',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  playwright: {
    id: 'playwright',
    name: 'Playwright',
    tag: 'TypeScript & Python',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  'playwright-ts': {
    id: 'playwright',
    name: 'Playwright',
    tag: 'TypeScript & Python',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  'api-testing': {
    id: 'api-testing',
    name: 'Rest Assured & API',
    tag: 'Java & Python',
    color: 'purple',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  'ai-qa': {
    id: 'ai-qa',
    name: 'AI for QA & Autonomous Agents',
    tag: 'AI & LLM Tools',
    color: 'cyan',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
};

export const DEFAULT_CONCEPT_GUIDES: ConceptGuide[] = [
  // ==========================================
  // SELENIUM GUIDES
  // ==========================================
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
        WebDriver driver = DriverFactory.createInstance(browser);
        DriverManager.setDriver(driver);
    }

    @AfterMethod
    public void tearDown() {
        DriverManager.quitDriver();
    }
}`,
      },
      {
        language: 'python',
        caption: 'Python: Pytest function-scoped fixture isolation',
        code: `# In pytest, function-scoped fixtures guarantee independent driver lifecycle per test
import pytest
from selenium import webdriver

@pytest.fixture(scope="function")
def driver():
    driver = webdriver.Chrome()
    yield driver
    driver.quit() # Guaranteed teardown per test`,
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
      'Page Objects should NEVER contain assertions. Assertions belong exclusively in test methods.',
      'Use By locators instead of @FindBy PageFactory in modern Selenium 4 for thread safety.',
      'Return next Page Object on navigation actions for fluent method chaining.',
    ],
    antiPatterns: [
      'Putting Assert.assertEquals inside Page class methods.',
      'Exposing raw WebElement objects to test classes.',
    ],
    interviewTips: 'Highlight that Page Objects represent services offered by the UI, not just a 1:1 dump of HTML tags.',
  },

  // ==========================================
  // PLAYWRIGHT GUIDES
  // ==========================================
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

  // ==========================================
  // REST ASSURED & API GUIDES
  // ==========================================
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
  const newConfirmed = toConfirm.map(g => ({ ...g, isCustom: true }));
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

// Generate standardized Concept Guide Import Template
export function generateConceptGuideTemplate(format: 'json' | 'csv', trackId: string = 'selenium'): string {
  const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;

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

// Download Concept Guide Template
export function downloadConceptGuideTemplate(format: 'json' | 'csv', trackId: string = 'selenium'): void {
  const content = generateConceptGuideTemplate(format, trackId);
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';
  const extension = format === 'json' ? 'json' : 'csv';
  const filename = `sdet_${trackId}_guide_template.${extension}`;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Parse imported guides from JSON or CSV
export function parseImportedGuides(
  content: string,
  trackId: string = 'selenium',
  stageOnly: boolean = true
): { guides: ConceptGuide[]; error?: string } {
  const normTrack = (trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId) as any;
  const trimmed = content.trim();

  if (!trimmed) {
    return { guides: [], error: 'Import content is empty.' };
  }

  // 1. Try JSON parsing
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const valid: ConceptGuide[] = [];

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
          codeSnippets: Array.isArray(item.codeSnippets) ? item.codeSnippets : [
            {
              language: normTrack === 'playwright' ? 'typescript' : 'java',
              caption: 'Example Code',
              code: typeof item.code === 'string' ? item.code : '// Add concept implementation here',
            }
          ],
          bestPractices: Array.isArray(item.bestPractices) ? item.bestPractices : [],
          antiPatterns: Array.isArray(item.antiPatterns) ? item.antiPatterns : [],
          interviewTips: item.interviewTips || '',
          isCustom: true,
        });
      }

      if (valid.length === 0) {
        return { guides: [], error: 'No valid guides found in JSON. Expected objects with "title", "category", and "summary".' };
      }

      // Save to storage (Staged by default, or direct confirmed if stageOnly is false)
      if (stageOnly) {
        const existing = getStagedGuides(normTrack);
        const updated = [...valid, ...existing.filter(e => !valid.some(v => v.id === e.id))];
        localStorage.setItem(`${STAGED_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(updated));
      } else {
        const existing = getStoredCustomGuides(normTrack);
        const updated = [...valid, ...existing.filter(e => !valid.some(v => v.id === e.id))];
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(updated));
      }

      return { guides: valid };
    } catch (e: any) {
      return { guides: [], error: `Invalid JSON syntax: ${e.message}` };
    }
  }

  // 2. Try CSV parsing
  try {
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return { guides: [], error: 'CSV file is empty.' };

    const valid: ConceptGuide[] = [];
    const startIndex = lines[0].toLowerCase().includes('title') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(',').map(s => s.replace(/^["']|["']$/g, '').trim());
      if (parts.length >= 1 && parts[0]) {
        const title = parts[0];
        const category = parts[1] || 'Core Concepts';
        const level = ['Beginner', 'Intermediate', 'Advanced'].includes(parts[2]) ? parts[2] as any : 'Intermediate';
        const summary = parts[3] || title;
        const overview = parts[4] || summary;
        const codeLang = parts[5] || (normTrack === 'playwright' ? 'typescript' : 'java');
        const code = parts[6] || `// Code example for ${title}`;
        const interviewTips = parts[7] || '';

        valid.push({
          id: `custom-guide-csv-${Date.now()}-${i}`,
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
    }

    if (valid.length === 0) {
      return { guides: [], error: 'Could not extract valid guides from CSV.' };
    }

    // Save to storage (Staged by default, or direct confirmed if stageOnly is false)
    if (stageOnly) {
      const existing = getStagedGuides(normTrack);
      const updated = [...valid, ...existing.filter(e => !valid.some(v => v.id === e.id))];
      localStorage.setItem(`${STAGED_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(updated));
    } else {
      const existing = getStoredCustomGuides(normTrack);
      const updated = [...valid, ...existing.filter(e => !valid.some(v => v.id === e.id))];
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${normTrack}`, JSON.stringify(updated));
    }

    return { guides: valid };
  } catch (e: any) {
    return { guides: [], error: `CSV parsing failed: ${e.message}` };
  }
}
