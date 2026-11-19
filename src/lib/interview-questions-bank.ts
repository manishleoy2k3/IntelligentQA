import {
  InterviewQuestionItem,
  InterviewDifficulty,
  InterviewExperienceTier,
  InterviewDomainCategory,
} from '@/types/qa';

export type {
  InterviewQuestionItem,
  InterviewDifficulty,
  InterviewExperienceTier,
  InterviewDomainCategory,
};

/**
 * Helper to map numerical years of experience to standard experience tiers.
 */
export function mapYearsToExperienceTier(years: number): InterviewExperienceTier {
  if (years <= 2) return '0-2 Years';
  if (years <= 5) return '3-5 Years';
  if (years <= 9) return '6-9 Years';
  return '10+ Years';
}

/**
 * Comprehensive Knowledge Base for SDET and Test Architect roles.
 * Tagged by category, difficulty ('Easy' | 'Medium' | 'Hard'), and experience level ('0-2 Years' | '3-5 Years' | '6-9 Years' | '10+ Years').
 * Covers:
 * 1. Manual QA Processes
 * 2. Coding & DSA
 * 3. Selenium & Playwright Automation
 * 4. Reporting
 * 5. CI/CD Pipelines
 * 6. API Testing & Automation (Postman, REST Assured, Playwright)
 * 7. Mobile Manual Testing (Android & iOS)
 * 8. Mobile Automation (Appium)
 */
export const INTERVIEW_KNOWLEDGE_BASE: InterviewQuestionItem[] = [
  // ==========================================
  // TEST ARCHITECT CURATED PORTFOLIO
  // ==========================================
  {
    id: 'arch-pw-1',
    technology: 'Playwright',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Architect',
    experienceLevel: '10+ Years',
    minYears: 10,
    maxYears: 25,
    topic: 'Enterprise CI/CD Sharding & Ephemeral Environments',
    question: 'How do you architect an enterprise Playwright test suite of 5,000+ tests to run in under 8 minutes on PR triggers?',
    expectedFocus: 'Matrix sharding, storageState auth, network mocking via page.route(), ephemeral environments.',
    answerSummary: 'Design horizontal matrix sharding across 20-30 CI containers, leverage storageState for 1-time global auth, mock third-party external dependencies at network level via page.route(), and spin up ephemeral staging environments per PR.',
    codeSnippet: `// playwright.config.ts for CI sharding & tracing\nexport default defineConfig({\n  testDir: './e2e',\n  workers: process.env.CI ? 4 : undefined,\n  retries: process.env.CI ? 1 : 0,\n  use: {\n    storageState: 'state/auth.json',\n    trace: 'retain-on-failure',\n  },\n});`,
    bestPractice: 'Shard across GitHub Actions / GitLab matrix jobs: --shard=${{ matrix.shard }}/${{ matrix.totalShards }}. Merge blob reports into a single HTML dashboard.',
    pitfallToAvoid: 'Running un-sharded suites sequentially or launching fresh browser login flows in every test before hook.'
  },
  {
    id: 'arch-sel-1',
    technology: 'Selenium',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Architect',
    experienceLevel: '10+ Years',
    minYears: 10,
    maxYears: 25,
    topic: 'Kubernetes Distributed Grid & Cost Optimization',
    question: 'How do you architect a scalable Selenium 4 Grid on Kubernetes (K8s) that dynamically autoscales from 0 to 200 nodes and tears down to save cloud costs?',
    expectedFocus: 'Selenium Grid Helm chart, KEDA autoscaling, ephemeral spot instances.',
    answerSummary: 'Deploy Selenium Grid using Helm with KEDA (Kubernetes Event-driven Autoscaling). Monitor the Selenium Hub session queue; when queue length spikes, KEDA triggers scaling of browser pods. Pods scale to zero when idle.',
    bestPractice: 'Use ephemeral spot/preemptible instances for browser nodes with session timeouts to prevent zombie pods.',
    pitfallToAvoid: 'Maintaining 24/7 static VM browser farms that burn budget during non-working hours.'
  },
  {
    id: 'arch-java-1',
    technology: 'Java',
    category: 'Coding & DSA',
    difficulty: 'Architect',
    experienceLevel: '10+ Years',
    minYears: 10,
    maxYears: 25,
    topic: 'Virtual Threads (Project Loom) & Parallel Test Workers',
    question: 'How do Virtual Threads (Java 21 Project Loom) revolutionize parallel test execution and ThreadLocal management in enterprise Java test frameworks?',
    expectedFocus: 'Carrier threads vs virtual threads, thread-per-task model, ScopedValue replacing ThreadLocal.',
    answerSummary: 'Virtual threads are lightweight user-mode threads managed by the JVM rather than OS kernel threads. You can spawn 100,000+ virtual threads with minimal RAM. In test runners, replace ThreadLocal with Java 21 ScopedValue to pass immutable test context safely without memory leak risks.',
    bestPractice: 'Use Executors.newVirtualThreadPerTaskExecutor() for high-concurrency API and asynchronous test validation.',
    pitfallToAvoid: 'Pinning virtual threads by executing blocking synchronized blocks or JNI calls.'
  },
  {
    id: 'arch-api-1',
    technology: 'API Testing',
    category: 'API Testing & Automation',
    difficulty: 'Architect',
    experienceLevel: '10+ Years',
    minYears: 10,
    maxYears: 25,
    topic: 'Microservices Distributed Tracing & Service Mesh Contract Testing',
    question: 'How do you architect automated integration testing for a mesh of 100+ microservices using OpenTelemetry traces and distributed correlation IDs?',
    expectedFocus: 'W3C TraceContext (traceparent header), injecting correlation IDs in RestAssured, verifying traces in Jaeger/Zipkin.',
    answerSummary: 'Inject W3C traceparent headers into automated HTTP requests. After initiating an asynchronous transaction, query OpenTelemetry/Jaeger collectors via API to assert that downstream spans completed within SLA and with zero error tags.',
    bestPractice: 'Correlate API tests with backend spans to identify exact slow microservice hops.',
    pitfallToAvoid: 'Relying solely on external HTTP response codes without verifying downstream database writes and async event processing.'
  },
  {
    id: 'arch-ai-1',
    technology: 'AI & LLM',
    category: 'Manual QA Processes',
    difficulty: 'Architect',
    experienceLevel: '10+ Years',
    minYears: 10,
    maxYears: 25,
    topic: 'Multi-Model LLM Benchmarking & Automated Evals Engine',
    question: 'How do you architect an enterprise LLM Evaluation Benchmarking platform across multi-model providers (OpenAI, Gemini, Claude, Llama)?',
    expectedFocus: 'LLM-as-a-Judge, semantic similarity metrics, token latency, prompt drift detection.',
    answerSummary: 'Build an evaluation harness that dispatches normalized prompts across model APIs in parallel, computes latency, cost-per-token, hallucination rate, and produces automated radar comparison charts.',
    bestPractice: 'Track drift metrics across model version deprecations (e.g. gemini-1.5 to gemini-2.0).',
    pitfallToAvoid: 'Relying on a single proprietary vendor model without cross-validation benchmarks.'
  },
  {
    id: 'arch-fw-1',
    technology: 'Framework Design',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Architect',
    experienceLevel: '10+ Years',
    minYears: 10,
    maxYears: 25,
    topic: 'Enterprise Monorepo Multi-Platform Test Engine',
    question: 'How do you architect a unified test automation framework across Web, Mobile, and API for a multi-app monorepo with 50+ squads?',
    expectedFocus: 'Nx / Turborepo workspace, shared core assertion and client libraries, decoupled domain modules.',
    answerSummary: 'Design an Nx or Turborepo monorepo with shared packages (@company/qa-core, @company/api-clients, @company/playwright-fixtures). Feature squads create independent test packages consuming core libraries, preventing duplicate code and standardizing reporting.',
    bestPractice: 'Enforce semantic versioning and strict lint rules on shared test utilities.',
    pitfallToAvoid: 'Creating a monolithic shared repository where any change by one team breaks the test runs of 49 other squads.'
  },
  {
    "id": "ah-pw-1",
    "technology": "Playwright",
    "category": "Selenium & Playwright Automation",
    "difficulty": "Easy",
    "experienceLevel": "0-2 Years",
    "minYears": 0,
    "maxYears": 3,
    "topic": "getByRole vs CSS Selectors & Accessibility Tree",
    "question": "To start, what is the difference between using page.getByRole() and page.locator() with a CSS selector in Playwright, and when would you choose one over the other?",
    "expectedFocus": "Accessibility Tree vs raw HTML DOM, ARIA roles and accessible names, UI refactoring resilience, mirroring real user interactions.",
    "answerSummary": "page.getByRole() queries the browser's Accessibility Tree (exposed via ARIA roles and accessible names), mirroring how a real user or screen reader perceives and interacts with the page. In contrast, page.locator() with a CSS selector queries the raw HTML DOM structure (tags, classes, attributes, and hierarchy). In a CI/CD pipeline, CSS locators break on harmless UI refactoring, while role-based locators remain resilient.",
    "codeSnippet": "// Accessible role-based locator:\nawait page.getByRole('button', { name: 'Submit Order' }).click();\n\n// Raw CSS locator (brittle on redesign):\nawait page.locator('button.btn-primary.submit-btn').click();",
    "bestPractice": "Prioritize user-facing role locators (getByRole, getByLabel, getByText) to ensure test resilience and promote web accessibility.",
    "pitfallToAvoid": "Coupling tests to internal DOM classes or tag hierarchies that change during frontend refactoring."
  },
  {
    "id": "ah-pw-2",
    "technology": "Playwright",
    "category": "Selenium & Playwright Automation",
    "difficulty": "Easy",
    "experienceLevel": "0-2 Years",
    "minYears": 0,
    "maxYears": 3,
    "topic": "Playwright Auto-Waiting & Web-First Assertions",
    "question": "How does Playwright's auto-waiting work when you click a button or fill in a field, and when would you still need an explicit wait or assertion?",
    "expectedFocus": "Actionability checks (attached, visible, stable, receives events, enabled), web-first assertions expect(locator).toBeVisible(), avoiding Thread.sleep/waitForTimeout.",
    "answerSummary": "Playwright performs automatic actionability checks prior to executing actions like click() or fill(). It ensures the element is attached to DOM, visible, stable (not animating), enabled, and receives pointer events. Explicit waits or web-first assertions (e.g. expect(locator).toHaveText()) are only needed when verifying an asynchronous state change, delayed API response, or navigation event.",
    "codeSnippet": "// Auto-waited action (checks attached, visible, stable, enabled):\nawait page.getByRole('button', { name: 'Save Changes' }).click();\n\n// Web-first polling assertion for async state:\nawait expect(page.getByText('Saved successfully')).toBeVisible({ timeout: 5000 });",
    "bestPractice": "Rely on Playwright's built-in actionability checks and web-first expect() assertions; never inject hardcoded sleep timeouts.",
    "pitfallToAvoid": "Using page.waitForTimeout() or Thread.sleep() to guess network timing."
  },
  {
    "id": "kb-j-med-01",
    "category": "Coding & DSA",
    "difficulty": "Medium",
    "experienceLevel": "0-2 Years",
    "minYears": 0,
    "maxYears": 2,
    "topic": "Two Sum Problem & HashMap Lookup",
    "question": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. What is the time complexity of the HashMap approach vs brute force?",
    "expectedFocus": "Brute force O(N^2) vs HashMap complement lookup O(N) time and O(N) space. Storing num -> index in Map.",
    "answerSummary": "Iterate through the array while checking if complement = target - nums[i] exists in a HashMap. If present, return [map.get(complement), i]. If not, insert nums[i] -> i into the map. Time: O(N) single pass, Space: O(N).",
    "codeSnippet": "function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}",
    "bestPractice": "Use a HashMap for O(1) average lookup time rather than nested loops.",
    "pitfallToAvoid": "Using the same element twice by inserting into the map before checking the complement."
  },
  {
    "id": "kb-j-med-02",
    "category": "Selenium & Playwright Automation",
    "difficulty": "Medium",
    "experienceLevel": "0-2 Years",
    "minYears": 0,
    "maxYears": 2,
    "topic": "Dynamic Auto-Suggest Dropdown & Keyboard Navigation",
    "question": "How do you reliably automate an AJAX auto-suggest search dropdown (e.g. Google Search or Flight Booking) where results populate asynchronously?",
    "expectedFocus": "Typing input, waiting for suggestions container visibility, collecting list items or using ArrowDown + Enter, avoiding static sleeps.",
    "answerSummary": "In Playwright: type into the search box, wait for the locator locator(\".suggestion-item\").first() to be visible, then click the matching item using getByRole(\"option\", { name: \"Target City\" }). In Selenium: use WebDriverWait with visibilityOfAllElementsLocatedBy, loop through WebElements to match text, and click.",
    "codeSnippet": "// Playwright auto-suggest:\nawait page.getByPlaceholder(\"Search flights\").fill(\"San Fran\");\nconst option = page.getByRole(\"option\", { name: \"San Francisco (SFO)\" });\nawait expect(option).toBeVisible();\nawait option.click();",
    "bestPractice": "Wait explicitly for the list container to populate and assert on the selected value after click.",
    "pitfallToAvoid": "Clicking immediately after typing before the asynchronous AJAX suggestion response has rendered."
  },
  {
    "id": "kb-j-med-03",
    "category": "API Testing & Automation",
    "difficulty": "Medium",
    "experienceLevel": "0-2 Years",
    "minYears": 0,
    "maxYears": 2,
    "topic": "Postman Environment Variables & Dynamic Token Chaining",
    "question": "In Postman, how do you extract a Bearer Auth token from a login response and automatically pass it to subsequent requests in a collection?",
    "expectedFocus": "pm.response.json(), pm.environment.set(\"jwt_token\", token), {{jwt_token}} in Authorization header.",
    "answerSummary": "In the Tests tab of the Login request, parse the JSON response: const data = pm.response.json(); pm.environment.set(\"authToken\", data.token); In subsequent requests in the collection, configure Authorization -> Type: Bearer Token with value: {{authToken}}.",
    "codeSnippet": "// Postman Tests Script:\nconst res = pm.response.json();\npm.expect(pm.response.code).to.eq(200);\npm.expect(res.token).to.be.a(\"string\");\npm.environment.set(\"authToken\", res.token);",
    "bestPractice": "Use collection-level authorization so child requests inherit the Bearer token automatically.",
    "pitfallToAvoid": "Hardcoding expired tokens manually into request headers before running collections."
  },
  {
    "id": "kb-j-med-04",
    "category": "Mobile Automation (Appium)",
    "difficulty": "Medium",
    "experienceLevel": "0-2 Years",
    "minYears": 0,
    "maxYears": 2,
    "topic": "Appium Desired Capabilities & Scroll-to-Element",
    "question": "How do you configure Appium 2.x UiAutomator2Options to launch an Android app without reinstalling or resetting app data, and how do you scroll to an element off-screen?",
    "expectedFocus": "setNoReset(true), UiScrollable locator or W3C scroll action, automationName UiAutomator2.",
    "answerSummary": "Set options.setNoReset(true) so Appium retains existing cache and login state. To scroll to an element off-screen in Android: use AppiumBy.androidUIAutomator(\"new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text(\\\"Target Item\\\"))\").",
    "codeSnippet": "UiAutomator2Options options = new UiAutomator2Options()\n  .setPlatformName(\"Android\")\n  .setNoReset(true)\n  .setAppPackage(\"com.example.shop\")\n  .setAppActivity(\".MainActivity\");",
    "bestPractice": "Use noReset=true during feature testing to avoid slow APK re-installation on every test method.",
    "pitfallToAvoid": "Setting fullReset=true on every single test method, which inflates test runtime by 30 seconds per test."
  },
  {
    "id": "kb-j-hrd-01",
    "category": "Selenium & Playwright Automation",
    "difficulty": "Hard",
    "experienceLevel": "0-2 Years",
    "minYears": 0,
    "maxYears": 2,
    "topic": "StaleElementReferenceException Root Cause & Resolution",
    "question": "What is the root cause of StaleElementReferenceException in Selenium? How do you resolve it properly, and why does Playwright not suffer from this issue?",
    "expectedFocus": "DOM re-rendering / AJAX replacing nodes, WebElement reference pointing to detached node, solving with dynamic polling or re-finding element, Playwright locators are lazy evaluators with automatic re-query.",
    "answerSummary": "StaleElementReferenceException occurs when an element was located, but the DOM updated (AJAX, re-render, React virtual DOM reconciliation) and the element was destroyed and replaced. In Selenium, resolve by re-finding the element inside a retry loop or using FluentWait. In Playwright, locators do not store static DOM node pointers; they re-query the DOM automatically before every action, eliminating stale element exceptions by design.",
    "codeSnippet": "// Selenium StaleElement Retry Handler:\npublic void clickWithRetry(By locator) {\n  new WebDriverWait(driver, Duration.ofSeconds(10))\n    .ignoring(StaleElementReferenceException.class)\n    .until(d -> { d.findElement(locator).click(); return true; });\n}",
    "bestPractice": "Use lazy locators and avoid storing WebElements as class member variables.",
    "pitfallToAvoid": "Catching Exception with empty catch blocks to hide stale element failures."
  },
  {
    "id": "kb-j-hrd-02",
    "category": "Coding & DSA",
    "difficulty": "Hard",
    "experienceLevel": "0-2 Years",
    "minYears": 0,
    "maxYears": 2,
    "topic": "Valid Palindrome with Alphanumeric Filtering",
    "question": "Write a function to verify if a string is a palindrome, considering only alphanumeric characters and ignoring cases (e.g. \"A man, a plan, a canal: Panama\"). Analyze time and space complexity.",
    "expectedFocus": "Two pointers (left and right), skipping non-alphanumeric characters, comparing lowercased characters, O(N) time and O(1) auxiliary space.",
    "answerSummary": "Use two pointers initialized at start and end. Move left forward while non-alphanumeric; move right backward while non-alphanumeric. Compare lowercased characters; if unequal, return false. If pointers cross, return true. Time: O(N), Space: O(1) without creating intermediate strings.",
    "codeSnippet": "function isPalindrome(s: string): boolean {\n  let l = 0, r = s.length - 1;\n  while (l < r) {\n    while (l < r && !/[a-zA-Z0-9]/.test(s[l])) l++;\n    while (l < r && !/[a-zA-Z0-9]/.test(s[r])) r--;\n    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;\n    l++; r--;\n  }\n  return true;\n}",
    "bestPractice": "Use two pointers in place rather than creating new reversed string copies in memory.",
    "pitfallToAvoid": "Using s.replace(/[^a-zA-Z0-9]/g, \"\").split(\"\").reverse().join(\"\"), which allocates multiple temporary heap objects."
  },
  {
    "id": "kb-j-hrd-03",
    "category": "CI/CD Pipelines",
    "difficulty": "Hard",
    "experienceLevel": "0-2 Years",
    "minYears": 0,
    "maxYears": 2,
    "topic": "Git Merge Conflicts in Test Automation Branches",
    "question": "You and a teammate both modified the same Page Object class in separate feature branches, causing a Git merge conflict upon pull request. How do you resolve this conflict safely?",
    "expectedFocus": "git fetch, git checkout feature-branch, git merge main / rebase main, inspecting conflict markers (<<<<<<<, =======, >>>>>>>), running tests locally to verify, pushing resolved branch.",
    "answerSummary": "Fetch latest main branch. Checkout your feature branch and rebase or merge main (git merge origin/main). Open conflicted files, locate conflict markers (<<<<<<< HEAD ... >>>>>>>), discuss with teammate to preserve both sets of new locators and methods, run the local test suite (npm test) to verify zero compilation or runtime breaks, then commit and push.",
    "bestPractice": "Keep Page Objects modular and adhere to Single Responsibility to minimize merge conflicts between squads.",
    "pitfallToAvoid": "Blindly accepting \"ours\" or \"theirs\" without inspecting the other engineer changes, silently deleting their locators."
  },
  {
    "id": "kb-j-hrd-04",
    "category": "Manual QA Processes",
    "difficulty": "Hard",
    "experienceLevel": "0-2 Years",
    "minYears": 0,
    "maxYears": 2,
    "topic": "Asynchronous State Transition & Race Condition Testing",
    "question": "How do you design manual and automated test scenarios for a payment checkout button that allows users to click \"Pay\" multiple times while the server is processing?",
    "expectedFocus": "Double-click race condition, client-side button disabling, backend idempotency keys, verifying only one debit occurs in DB, network throttling test.",
    "answerSummary": "Test scenarios: 1) Rapid double-click on Pay button: verify button disables immediately after first click and shows loading spinner. 2) Network latency simulation: throttle network to Slow 3G and click Pay; verify multiple submissions are rejected. 3) Backend verification: verify backend uses Idempotency-Key header so even if two requests reach server, only one payment transaction is processed.",
    "bestPractice": "Always combine client-side UI disabling with backend idempotency checks.",
    "pitfallToAvoid": "Only testing happy path fast clicks on high-speed office fiber networks."
  },
  {
    "id": "kb-m-esy-01",
    "category": "Selenium & Playwright Automation",
    "difficulty": "Easy",
    "experienceLevel": "3-5 Years",
    "minYears": 3,
    "maxYears": 5,
    "topic": "Page Object Model Clean Code & Encapsulation",
    "question": "What are the core design principles of a well-architected Page Object Model (POM)? What should and should not be included inside a Page Object class?",
    "expectedFocus": "Encapsulating locators (private/readonly), exposing public business actions, returning new Page Objects on navigation, NEVER placing test assertions inside Page Objects.",
    "answerSummary": "A Page Object should encapsulate web elements and provide user-centric business methods (e.g. login(user, pass), selectProduct(id)). It should return new Page Objects when an action navigates (fluent pattern). It should NEVER contain test assertions (assertions belong in test specifications).",
    "codeSnippet": "export class LoginPage {\n  constructor(private page: Page) {}\n  private usernameInput = this.page.getByLabel(\"Username\");\n  private passwordInput = this.page.getByLabel(\"Password\");\n  private submitBtn = this.page.getByRole(\"button\", { name: \"Sign In\" });\n\n  async login(user: string, pass: string): Promise<DashboardPage> {\n    await this.usernameInput.fill(user);\n    await this.passwordInput.fill(pass);\n    await this.submitBtn.click();\n    return new DashboardPage(this.page);\n  }\n}",
    "bestPractice": "Keep Page Objects clean of test assertions; let test classes assert on state returned by Page Objects.",
    "pitfallToAvoid": "Scattering assert and expect statements across 50 different Page Object helper classes."
  },
  {
    "id": "kb-m-esy-02",
    "category": "API Testing & Automation",
    "difficulty": "Easy",
    "experienceLevel": "3-5 Years",
    "minYears": 3,
    "maxYears": 5,
    "topic": "REST Assured Given-When-Then Structure & Status Verification",
    "question": "Explain the Given-When-Then BDD syntax in REST Assured. How do you configure base URI, query parameters, headers, and assert on HTTP response code and response time?",
    "expectedFocus": "given() sets preconditions (baseUri, queryParams, headers), when() triggers HTTP verb (get, post), then() asserts on response (statusCode, responseTime, body).",
    "answerSummary": "given() configures headers, query/path parameters, cookies, and auth. when() sends the HTTP request (.get(\"/users\")). then() performs validations: .statusCode(200), .time(lessThan(2000L)), .body(\"status\", equalTo(\"ACTIVE\")).",
    "codeSnippet": "given()\n  .baseUri(\"https://api.intelligentqa.io\")\n  .queryParam(\"role\", \"SDET\")\n  .header(\"Accept\", \"application/json\")\n.when()\n  .get(\"/api/v1/users\")\n.then()\n  .statusCode(200)\n  .time(lessThan(3000L))\n  .body(\"users.size()\", greaterThan(0));",
    "bestPractice": "Use Hamcrest matchers (equalTo, hasItem, lessThan) for readable assertions in the then() block.",
    "pitfallToAvoid": "Omitting response time assertions on critical user-facing microservice endpoints."
  },
  {
    "id": "kb-m-esy-03",
    "category": "Manual QA Processes",
    "difficulty": "Easy",
    "experienceLevel": "3-5 Years",
    "minYears": 3,
    "maxYears": 5,
    "topic": "Bug Triage Process & Defect Governance",
    "question": "How do you structure and facilitate a weekly Bug Triage meeting between QA, Engineering Leads, and Product Managers?",
    "expectedFocus": "Reviewing New/Unassigned bugs, verifying reproducibility, agreeing on Severity and Priority, assigning target sprint/release, rejecting non-reproducible bugs.",
    "answerSummary": "Bug triage aligns QA, Dev, and Product. Process: 1) Review incoming unresolved defects. 2) Verify bug report has reproducible steps, environment, and logs. 3) Engineering confirms Severity (technical impact); Product determines Priority (business urgency). 4) Assign to a developer for the current sprint or schedule for backlog.",
    "bestPractice": "Require all bug reports to have video recordings, HAR files, or console logs before bringing them to triage.",
    "pitfallToAvoid": "Allowing un-triaged bugs to linger in \"New\" status for weeks without review."
  },
  {
    "id": "kb-m-esy-04",
    "category": "Reporting",
    "difficulty": "Easy",
    "experienceLevel": "3-5 Years",
    "minYears": 3,
    "maxYears": 5,
    "topic": "Test Execution Reports & TestNG Listeners",
    "question": "How do you create an automated HTML summary report of test results in TestNG using ITestListener and ExtentReports?",
    "expectedFocus": "Implementing ITestListener (onStart, onTestSuccess, onTestFailure, onFinish), ExtentReports initialization, attaching failure stack traces.",
    "answerSummary": "Create a custom listener implementing ITestListener. In onStart, initialize ExtentReports and ExtentSparkReporter. In onTestStart, call createTest(methodName). In onTestFailure, log Status.FAIL and attach screenshot. In onFinish, call extent.flush() to write the final HTML report file.",
    "codeSnippet": "public class ExtentListener implements ITestListener {\n  private static ExtentReports extent = new ExtentReports();\n  @Override\n  public void onTestFailure(ITestResult result) {\n    ExtentTest test = extent.createTest(result.getMethod().getMethodName());\n    test.log(Status.FAIL, result.getThrowable());\n  }\n  @Override\n  public void onFinish(ITestContext context) { extent.flush(); }\n}",
    "bestPractice": "Always register listeners in testng.xml or via ServiceLoader rather than manual instantiation in test classes.",
    "pitfallToAvoid": "Forgetting to call extent.flush() on suite completion, which results in empty or corrupted HTML report files."
  },
  {
    "id": "kb-m-hrd-01",
    "category": "Coding & DSA",
    "difficulty": "Hard",
    "experienceLevel": "3-5 Years",
    "minYears": 3,
    "maxYears": 5,
    "topic": "Longest Substring Without Repeating Characters (Sliding Window)",
    "question": "Given a string s, find the length of the longest substring without duplicate characters. Explain how the Sliding Window with a character index Map operates in O(N) time.",
    "expectedFocus": "Sliding window with left and right pointers, Map<char, index> to jump left pointer past duplicate, O(N) time, O(min(N, M)) space.",
    "answerSummary": "Maintain a sliding window [l..r] and a Map storing character to its latest index. As right pointer expands, if s[r] was seen at index >= l, update l = map.get(s[r]) + 1. Update map with latest index of s[r] and compute maxLen = max(maxLen, r - l + 1). Time: O(N), Space: O(K) where K is unique characters.",
    "codeSnippet": "function lengthOfLongestSubstring(s: string): number {\n  const seen = new Map<string, number>();\n  let maxLen = 0, l = 0;\n  for (let r = 0; r < s.length; r++) {\n    if (seen.has(s[r]) && seen.get(s[r])! >= l) {\n      l = seen.get(s[r])! + 1;\n    }\n    seen.set(s[r], r);\n    maxLen = Math.max(maxLen, r - l + 1);\n  }\n  return maxLen;\n}",
    "bestPractice": "Jump the left pointer directly past the previous duplicate instead of incrementing one-by-one.",
    "pitfallToAvoid": "Moving the left pointer backwards when an old duplicate character is found outside the current window."
  },
  {
    "id": "kb-m-hrd-02",
    "category": "Selenium & Playwright Automation",
    "difficulty": "Hard",
    "experienceLevel": "3-5 Years",
    "minYears": 3,
    "maxYears": 5,
    "topic": "Nested Shadow DOM & Cross-Origin iFrame Automation",
    "question": "How do you automate a web payment modal embedded inside nested Shadow DOMs and a cross-origin Stripe iframe using Playwright and Selenium 4?",
    "expectedFocus": "Playwright CSS pierces open shadow root by default, page.frameLocator() for cross-origin iframe, Selenium 4 getShadowRoot() and driver.switchTo().frame().",
    "answerSummary": "In Playwright, open shadow roots are traversed automatically by CSS engine. For cross-origin iframes, use page.frameLocator(\"iframe#stripe\").getByRole(\"button\"). In Selenium 4: WebElement host = driver.findElement(By.cssSelector(\"custom-component\")); SearchContext root = host.getShadowRoot(); WebElement iframe = root.findElement(By.cssSelector(\"iframe\")); driver.switchTo().frame(iframe);",
    "codeSnippet": "// Playwright Nested Frame & Shadow DOM:\nconst paymentFrame = page.frameLocator(\"app-checkout\").frameLocator(\"iframe#stripe-element\");\nawait paymentFrame.getByPlaceholder(\"Card number\").fill(\"4242424242424242\");",
    "bestPractice": "Use frameLocator for iframes in Playwright to retain automatic auto-waiting inside the frame.",
    "pitfallToAvoid": "Using driver.switchTo().defaultContent() blindly after each action in Selenium."
  },
  {
    "id": "kb-m-hrd-03",
    "category": "CI/CD Pipelines",
    "difficulty": "Hard",
    "experienceLevel": "3-5 Years",
    "minYears": 3,
    "maxYears": 5,
    "topic": "Parallel Test Data Isolation & Race Condition Prevention",
    "question": "When running 10 parallel test workers in CI, tests collide when modifying shared database records (e.g. updating the same user account). How do you architect data isolation?",
    "expectedFocus": "Unique UUID test data fixtures, dynamic account provisioning per worker, database transaction rollback, isolated schema per test runner.",
    "answerSummary": "1) Dynamic Fixtures: Generate unique email and usernames per test using UUIDs (user-uuid@test.com). 2) Factory Pattern: Create dedicated test data via API in test before hooks. 3) Worker ID Sharding: In Playwright, use testInfo.workerIndex to assign pre-seeded accounts per worker (e.g. worker-1 uses account-1).",
    "bestPractice": "Make tests completely self-contained: create prerequisites via API, execute test, teardown data.",
    "pitfallToAvoid": "Sharing a single hardcoded admin@company.com user across parallel test threads."
  },
  {
    "id": "kb-m-hrd-04",
    "category": "Mobile Automation (Appium)",
    "difficulty": "Hard",
    "experienceLevel": "3-5 Years",
    "minYears": 3,
    "maxYears": 5,
    "topic": "Hybrid App WebView Automation & Context Switching",
    "question": "In a React Native / Ionic mobile app, how do you inspect and automate elements inside an embedded WebView using Appium? What causes context switching to hang?",
    "expectedFocus": "driver.getContextHandles(), driver.context(\"WEBVIEW_...\"), matching ChromeDriver version with device WebView version, switching back to NATIVE_APP.",
    "answerSummary": "Retrieve available contexts via driver.getContextHandles(). Switch to the webview: driver.context(\"WEBVIEW_com.example.app\"). Now standard web locators (CSS, XPath) work. To return to mobile native controls, call driver.context(\"NATIVE_APP\"). Common hang cause: mismatched ChromeDriver executable version with the Android System WebView version installed on the device.",
    "codeSnippet": "Set<String> contexts = driver.getContextHandles();\nfor (String contextName : contexts) {\n  if (contextName.contains(\"WEBVIEW\")) {\n    driver.context(contextName);\n    break;\n  }\n}\ndriver.findElement(By.cssSelector(\"#checkout-btn\")).click();\ndriver.context(\"NATIVE_APP\");",
    "bestPractice": "Configure chromedriverAutodownload: true in UiAutomator2Options to let Appium auto-download matching ChromeDriver binaries.",
    "pitfallToAvoid": "Trying to automate WebView DOM elements while still in NATIVE_APP context mode."
  },
  {
    "id": "kb-s-esy-01",
    "category": "Manual QA Processes",
    "difficulty": "Easy",
    "experienceLevel": "6-9 Years",
    "minYears": 6,
    "maxYears": 9,
    "topic": "Test Strategy vs Test Plan Documentation",
    "question": "Explain the fundamental differences between a Test Strategy and a Test Plan. When is each created, and what are their mandatory sections?",
    "expectedFocus": "Test Strategy: org-wide / product-level, long term, defines test levels, tooling, quality gates, environment strategy. Test Plan: project/sprint-level, short term, defines scope, schedule, resources, risks, deliverables.",
    "answerSummary": "Test Strategy is a high-level organizational document defining how quality is managed across the product (test levels, automation standards, tools, defect SLA, environments). Test Plan is a tactical document for a specific release or sprint defining what is tested, who tests it, schedule, entry/exit criteria, and deliverable test cases.",
    "bestPractice": "Review and update the Test Strategy quarterly to align with architectural and cloud tooling migrations.",
    "pitfallToAvoid": "Writing a 50-page static Test Plan for a 2-week Agile sprint that nobody ever reads."
  },
  {
    "id": "kb-s-esy-02",
    "category": "Manual QA Processes",
    "difficulty": "Easy",
    "experienceLevel": "6-9 Years",
    "minYears": 6,
    "maxYears": 9,
    "topic": "Three Amigos & BDD Example Mapping",
    "question": "How do you lead a Three Amigos session with Product Owners and Developers using BDD Example Mapping to prevent requirement defects before sprint commitment?",
    "expectedFocus": "Three Amigos roles (Product, Dev, QA), Example Mapping components (User Story, Rules, Examples, Questions/Unresolved), converting rules to Given-When-Then.",
    "answerSummary": "Example Mapping brings together Business (Rule), Development (How), and Testing (What-if). Color-coded index cards: Yellow (Story), Blue (Business Rules), Green (Concrete Examples / Given-When-Then), Red (Questions/Ambiguities). If red questions outnumber green examples, the story is not ready for sprint planning.",
    "bestPractice": "Enforce that stories cannot enter sprint backlog until all Red questions are resolved.",
    "pitfallToAvoid": "Treating Three Amigos as a QA status meeting rather than an interactive requirement discovery workshop."
  },
  {
    "id": "kb-s-esy-03",
    "category": "Selenium & Playwright Automation",
    "difficulty": "Easy",
    "experienceLevel": "6-9 Years",
    "minYears": 6,
    "maxYears": 9,
    "topic": "Code Review Guidelines for SDET Automation PRs",
    "question": "As a Senior SDET / QA Lead, what specific checklist criteria do you enforce when reviewing automation test code submitted by engineers?",
    "expectedFocus": "Zero Thread.sleep, resilient accessible locators, atomic independent tests, no shared mutable state, proper assertions, clean teardown, no secret leaks.",
    "answerSummary": "Checklist: 1) Independence: Tests must run in random order without state dependencies. 2) Synchronization: Zero hardcoded sleeps; only web-first assertions or explicit waits. 3) Locators: Accessible roles/labels, no absolute XPaths. 4) Modularity: Code separated into Page Objects or Fixtures. 5) Assertions: Meaningful error messages on failure. 6) Secrets: No plain-text credentials.",
    "bestPractice": "Automate linting (ESLint, Checkstyle) and typechecking in PR checks before human review.",
    "pitfallToAvoid": "Approving PRs that add arbitrary 5-second sleep delays to \"fix\" CI pipeline flakiness."
  },
  {
    "id": "kb-s-esy-04",
    "category": "Reporting",
    "difficulty": "Easy",
    "experienceLevel": "6-9 Years",
    "minYears": 6,
    "maxYears": 9,
    "topic": "Quality Metrics & ROI Communication to Leadership",
    "question": "What quantitative quality metrics do you track to measure the effectiveness and ROI of your test engineering organization?",
    "expectedFocus": "DORA metrics (Change Failure Rate, MTTR), Defect Escape Rate, Automated Test Execution Time, Flakiness Index, Defect Detection Percentage (DDP).",
    "answerSummary": "Key metrics: 1) Defect Escape Rate (% bugs found in production vs pre-prod). 2) Flakiness Rate (% tests failing intermittently without code changes). 3) Test Execution Velocity (pipeline duration). 4) DORA Change Failure Rate (% deployments causing outages). 5) Automation ROI (engineering hours saved per release regression cycle).",
    "bestPractice": "Present quality trends as business impact (hours saved, outages prevented) rather than vanity metrics like \"number of test cases automated\".",
    "pitfallToAvoid": "Focusing exclusively on 100% test pass rate while defect escape rate to production continues rising."
  },
  {
    "id": "kb-s-med-01",
    "category": "CI/CD Pipelines",
    "difficulty": "Medium",
    "experienceLevel": "6-9 Years",
    "minYears": 6,
    "maxYears": 9,
    "topic": "Matrix Test Sharding & Blob Report Aggregation",
    "question": "How do you configure GitHub Actions matrix jobs to shard a 2,000-test Playwright suite across 10 runners and aggregate their results into a single Allure report?",
    "expectedFocus": "strategy.matrix.shard: [1..10], --shard=${matrix.shard}/10, blob reporter, actions/upload-artifact, merge-reports CLI.",
    "answerSummary": "Define a matrix with shard indices 1..10. Each job executes: npx playwright test --shard=${matrix.shard}/10 with reporter: [\"blob\"]. In a downstream merge job: download all blob artifacts into one folder, run npx playwright merge-reports --reporter=html,allure-playwright, and publish the unified dashboard.",
    "codeSnippet": "# GitHub Actions Matrix Sharding:\nstrategy:\n  matrix:\n    shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\nsteps:\n  - run: npx playwright test --shard=${matrix.shard}/10\n- uses: actions/upload-artifact@v4\n  with:\n    name: blob-${matrix.shard}\n    path: blob-report",
    "bestPractice": "Set fail-fast: false so one shard failure does not prematurely abort the other 9 running shards.",
    "pitfallToAvoid": "Leaving 10 separate unmerged test reports in CI, forcing developers to click through 10 jobs to find failures."
  },
  {
    "id": "kb-s-med-02",
    "category": "API Testing & Automation",
    "difficulty": "Medium",
    "experienceLevel": "6-9 Years",
    "minYears": 6,
    "maxYears": 9,
    "topic": "REST Assured JSON Schema Validation & Contract Integrity",
    "question": "How do you perform automated JSON Schema validation in REST Assured using json-schema-validator, and why is schema validation superior to asserting individual fields?",
    "expectedFocus": "matchesJsonSchemaInClasspath, OpenAPI/JSON Schema standard, catches unexpected nulls, missing fields, type mutations, and backward compatibility breaks.",
    "answerSummary": "Use REST Assured matchesJsonSchemaInClasspath(\"schemas/user-schema.json\"). Schema validation verifies data types, required fields, enum values, and structural contracts in a single assertion. This immediately detects when backend developers inadvertently rename fields, change integers to strings, or drop mandatory properties.",
    "codeSnippet": "given()\n  .spec(requestSpec)\n.when()\n  .get(\"/api/v1/users/123\")\n.then()\n  .statusCode(200)\n  .body(matchesJsonSchemaInClasspath(\"schemas/user-schema.json\"));",
    "bestPractice": "Export JSON Schemas directly from backend OpenAPI/Swagger specs to prevent drift between docs and tests.",
    "pitfallToAvoid": "Writing 50 individual body(\"field\", equalTo(val)) lines that fail to notice when 10 other required fields are dropped from the response."
  },
  {
    "id": "kb-s-med-03",
    "category": "Mobile Manual Testing (Android & iOS)",
    "difficulty": "Medium",
    "experienceLevel": "6-9 Years",
    "minYears": 6,
    "maxYears": 9,
    "topic": "Mobile Network Throttling & Battery Profiling",
    "question": "How do you test mobile applications under adverse network conditions (high latency, jitter, packet loss) and profile battery/CPU consumption using developer tools?",
    "expectedFocus": "Proxyman / Charles Proxy network conditioners, simulating 2G/3G and 20% packet drop, Xcode Energy Gauge, Android Studio Profiler, inspecting wake locks.",
    "answerSummary": "Use Proxyman or Charles Proxy Network Conditioner to throttle connection to 150kbps, 500ms latency, and 10% packet drop. Verify the app displays non-blocking loading states, prevents double clicks, and handles timeouts gracefully. For battery profiling, use Android Studio Energy Profiler and Xcode Instruments Energy Gauge to verify CPU utilization drops to 0% when the app is backgrounded.",
    "bestPractice": "Test app behavior during network transitions: switching from Wi-Fi to cellular data in the middle of a checkout transaction.",
    "pitfallToAvoid": "Assuming mobile applications only encounter binary online/offline states; edge-network packet loss is where most silent transaction drops occur."
  },
  {
    "id": "kb-s-med-04",
    "category": "Reporting",
    "difficulty": "Medium",
    "experienceLevel": "6-9 Years",
    "minYears": 6,
    "maxYears": 9,
    "topic": "Allure Report Defect Categorization & History Trends",
    "question": "How do you configure Allure Report categories.json to automatically classify test failures into Product Defects vs Test Flakiness vs Environment Outages in CI?",
    "expectedFocus": "categories.json syntax, regex pattern matching on messageRegex and traceRegex, matchedStatus, allure-history retention in CI.",
    "answerSummary": "Create categories.json in the test resources folder. Define rules with name, matchedStatuses ([\"failed\", \"broken\"]), and messageRegex. For instance: match 502|504 Bad Gateway as \"Infrastructure Outage\"; match StaleElementReferenceException as \"Automation Flakiness\"; match AssertionError as \"Product Regression\". In CI, preserve allure-history across builds to maintain trend graphs.",
    "codeSnippet": "[\n  {\n    \"name\": \"Infrastructure / Gateway Outage\",\n    \"matchedStatuses\": [\"broken\"],\n    \"messageRegex\": \".*(502 Bad Gateway|504 Gateway Timeout|Connection refused).*\"\n  },\n  {\n    \"name\": \"Locator / Sync Flakiness\",\n    \"matchedStatuses\": [\"broken\"],\n    \"traceRegex\": \".*(StaleElementReferenceException|Timeout waiting for locator).*\"\n  }\n]",
    "bestPractice": "Share categorized Allure reports with engineering managers to hold infrastructure teams accountable for flaky staging environments.",
    "pitfallToAvoid": "Grouping all test failures into a generic \"Failed\" bucket without distinguishing between real bugs and infrastructure timeouts."
  },
  {
    "id": "kb-a-esy-01",
    "category": "Manual QA Processes",
    "difficulty": "Easy",
    "experienceLevel": "10+ Years",
    "minYears": 10,
    "maxYears": 25,
    "topic": "Communicating Test Pyramid ROI to Executive Leadership",
    "question": "How do you present the Return on Investment (ROI) of shifting from an inverted Ice Cream Cone test suite (heavy manual & UI tests) to a balanced Test Pyramid to the VP of Engineering?",
    "expectedFocus": "Cost of finding defects late, CI pipeline execution time, compute infrastructure costs, developer feedback loop velocity, DORA metrics.",
    "answerSummary": "Frame quality engineering in business terms: 1) Velocity: Unit and API tests run in seconds on pull requests, giving developers immediate feedback. 2) Cost: Finding a defect in unit testing costs 10x less than in E2E testing, and 100x less than in production. 3) Infrastructure: Running 5,000 UI tests on cloud browser grids burns thousands in compute; shifting 80% to API/contract tests slashes cloud spend by 70%.",
    "bestPractice": "Use concrete business metrics (hours saved, release frequency increased from monthly to daily) rather than technical jargon.",
    "pitfallToAvoid": "Pitching test automation purely as \"we can automate all manual QA jobs\", which creates organizational resistance."
  },
  {
    "id": "kb-a-esy-02",
    "category": "Manual QA Processes",
    "difficulty": "Easy",
    "experienceLevel": "10+ Years",
    "minYears": 10,
    "maxYears": 25,
    "topic": "Quality Engineering Culture & Chapter Governance",
    "question": "How do you establish a Quality Engineering Chapter and governance model across 40 squads where quality is a shared engineering responsibility rather than a QA-only chore?",
    "expectedFocus": "Quality Champions model, embedded SDETs paired with developers, standardizing tool stacks, setting Definition of Done (DoD) quality gates.",
    "answerSummary": "Establish a Quality Enablement Chapter model: 1) Centralized Quality Architecture team builds core frameworks, tooling, and CI pipelines. 2) Embedded SDETs work inside feature squads pairing with devs on test design and automation. 3) Quality Champions: Appoint developer champions in each squad to champion unit/contract tests. 4) Enforce Definition of Done (DoD) requiring automated test coverage before PR merge.",
    "bestPractice": "Measure squad quality health on a public engineering dashboard to foster healthy transparency.",
    "pitfallToAvoid": "Building an isolated QA silo where developers write zero tests and throw raw builds over the wall."
  },
  {
    "id": "kb-a-esy-03",
    "category": "Selenium & Playwright Automation",
    "difficulty": "Easy",
    "experienceLevel": "10+ Years",
    "minYears": 10,
    "maxYears": 25,
    "topic": "Deciding Between Embedded SDETs vs Centralized QA Chapter",
    "question": "What are the architectural trade-offs between embedding SDETs directly inside cross-functional feature squads versus maintaining a centralized QA Automation pool?",
    "expectedFocus": "Embedded: domain expertise, Shift-Left participation, fast feedback, but risks siloed duplicated frameworks. Centralized: unified tooling, shared infrastructure, but risks becoming an out-of-touch bottleneck.",
    "answerSummary": "Hybrid Chapter model is optimal: Embed SDETs inside feature squads for sprint ceremonies, Three Amigos, and domain feature automation. Govern them through a horizontal Quality Chapter led by the Test Architect to maintain unified core libraries, standardized reporting, and shared CI infrastructure.",
    "bestPractice": "Rotate SDETs across squads periodically to share domain knowledge and prevent skill stagnation.",
    "pitfallToAvoid": "Allowing every squad to invent their own disparate test framework with incompatible reporting formats."
  },
  {
    "id": "kb-a-esy-04",
    "category": "CI/CD Pipelines",
    "difficulty": "Easy",
    "experienceLevel": "10+ Years",
    "minYears": 10,
    "maxYears": 25,
    "topic": "Automated Quality Gates in Continuous Deployment",
    "question": "How do you design automated Quality Gates in a Continuous Deployment pipeline that automatically promotes code to production without manual QA sign-offs?",
    "expectedFocus": "Automated test suite pyramid, SonarQube quality gate (zero critical vulnerabilities, 80% coverage), synthetic smoke tests on deployment, automated rollback on APM error spike.",
    "answerSummary": "Stage gates: 1) PR Gate: Unit tests + contract tests + static linting pass 100%. 2) Build Gate: SonarQube code quality gate passes with zero blockers. 3) Staging Gate: Automated integration and smoke tests run against ephemeral container. 4) Canary Gate: Deploy to 5% production traffic, monitor APM error rate for 10 minutes; auto-promote if clean, auto-rollback if error threshold breached.",
    "bestPractice": "Automate Canary analysis with Prometheus/Datadog metrics for zero-touch continuous deployment.",
    "pitfallToAvoid": "Requiring manual spreadsheet sign-offs from 5 different managers for everyday microservice patch releases."
  },
  {
    "id": "kb-a-med-01",
    "category": "Selenium & Playwright Automation",
    "difficulty": "Medium",
    "experienceLevel": "10+ Years",
    "minYears": 10,
    "maxYears": 25,
    "topic": "Technology Evaluation: Playwright vs Selenium 4 vs Cypress",
    "question": "As a Test Architect, provide a rigorous technical evaluation matrix comparing Playwright, Selenium 4, and Cypress for an enterprise monorepo with 50+ squads.",
    "expectedFocus": "Architecture (CDP/WebSocket vs W3C WebDriver vs in-browser iframe), multi-tab/multi-window, shadow DOM, execution speed, mobile web emulation, language support.",
    "answerSummary": "Playwright: Fastest, native auto-waiting, WebSocket connection, pierces shadow DOM, out-of-the-box multi-tab/context, supports TS/Java/Python/C#. Selenium 4: Standardized W3C protocol, broad legacy browser support, large enterprise ecosystem, slower than Playwright. Cypress: Runs inside browser DOM, limited multi-tab support, cannot automate cross-origin without workarounds, JavaScript/TS only. Recommendation: Playwright for modern greenfield web apps; Selenium 4 for legacy distributed grid environments.",
    "bestPractice": "Standardize on a single modern framework across the monorepo to enable code reuse and unified reporting.",
    "pitfallToAvoid": "Choosing Cypress for an enterprise application that heavily relies on multiple browser windows, tabs, and cross-domain authentication flows."
  },
  {
    "id": "kb-a-med-02",
    "category": "API Testing & Automation",
    "difficulty": "Medium",
    "experienceLevel": "10+ Years",
    "minYears": 10,
    "maxYears": 25,
    "topic": "Consumer-Driven Contract Testing (Pact) Architecture",
    "question": "How do you architect Consumer-Driven Contract Testing (Pact) across 50 microservices to eliminate broken API integrations before deployment? Explain the Pact Broker can-i-deploy workflow.",
    "expectedFocus": "Consumer defines expectations in mock tests, generates pact contract JSON, publishes to Pact Broker, Provider runs verification in CI, can-i-deploy verifies compatibility before release.",
    "answerSummary": "1) Consumer microservice writes unit tests against a mock provider using Pact DSL, generating a pact.json contract. 2) Consumer CI publishes the contract to the centralized Pact Broker. 3) Provider microservice CI fetches contracts and executes them against its actual endpoints. 4) Deployment pipeline invokes pact-broker can-i-deploy --pacticipant MyService --version $GIT_COMMIT --to-environment production to verify mutual contract compatibility.",
    "bestPractice": "Integrate can-i-deploy as a non-negotiable blocking step in every deployment pipeline.",
    "pitfallToAvoid": "Relying exclusively on shared staging E2E environments to catch microservice API breaking changes."
  },
  {
    "id": "kb-a-med-03",
    "category": "Mobile Automation (Appium)",
    "difficulty": "Medium",
    "experienceLevel": "10+ Years",
    "minYears": 10,
    "maxYears": 25,
    "topic": "Mobile Test Infrastructure: Cloud Device Farms vs On-Premise",
    "question": "Conduct a Total Cost of Ownership (TCO) and security trade-off analysis between commercial Cloud Device Farms (SauceLabs, BrowserStack) and an On-Premise device rack for 100+ mobile devices.",
    "expectedFocus": "Cloud: zero hardware maintenance, instant access to thousands of device models, tunnel setup required, higher operational cost ($$$/month). On-prem: fixed capital expense, zero network latency, full control of internal staging, but high hardware maintenance (battery swelling, USB disconnects, iOS provisioning).",
    "answerSummary": "Hybrid strategy is best: Maintain an on-premise rack of 10-15 high-frequency devices (latest iPhone, Samsung, Pixel) for rapid pull request smoke runs (0ms latency, zero third-party outage risk). Use cloud device farms (BrowserStack/SauceLabs) for broad monthly regression testing across 100+ low-spec, legacy, and regional tablet models.",
    "bestPractice": "Use fastlane match to automate iOS provisioning profile synchronization across CI agents.",
    "pitfallToAvoid": "Building a 100-device on-premise rack without dedicated hardware maintenance engineers to manage USB drops and swollen batteries."
  },
  {
    "id": "kb-a-med-04",
    "category": "Manual QA Processes",
    "difficulty": "Medium",
    "experienceLevel": "10+ Years",
    "minYears": 10,
    "maxYears": 25,
    "topic": "Testing GenAI & LLM-Powered Application Features",
    "question": "How do you design an automated testing and evaluation framework for non-deterministic GenAI applications (e.g. AI Copilot / LLM chatbot)?",
    "expectedFocus": "Non-deterministic evaluation, LLM-as-a-Judge, Semantic similarity (Cosine similarity of embeddings), Hallucination rate, Prompt Injection security checks (OWASP Top 10 for LLMs).",
    "answerSummary": "Architecture: 1) Deterministic checks: Validate JSON schema, token count limits, response latency, and HTTP status codes. 2) Semantic Evaluation: Generate vector embeddings for expected vs actual outputs and assert cosine similarity > 0.85. 3) LLM-as-a-Judge: Prompt an independent evaluator model (e.g. Gemini 2.5 Flash) with rubric criteria (Accuracy, Tone, Relevance, Groundedness) to score outputs 1-5. 4) Security tests: Automated prompt injection and jailbreak regression suites.",
    "bestPractice": "Maintain a golden evaluation dataset with human-annotated ground truth answers to baseline model updates.",
    "pitfallToAvoid": "Using strict exact string assertions (expect(reply).toBe(\"exact phrase\")) for non-deterministic AI chatbot responses."
  },

  // ==========================================
  // 1. MANUAL QA PROCESSES
  // ==========================================
  {
    id: 'kb-man-01',
    category: 'Manual QA Processes',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 2,
    topic: 'Defect Lifecycle & Severity vs Priority',
    question: 'Explain the defect lifecycle from identification to closure, and distinguish between Defect Severity and Defect Priority with real-world examples.',
    expectedFocus: 'Defect states (New, Assigned, Open, Fixed, Retest, Verified, Closed, Reopened), Severity (technical impact on system), Priority (urgency to the business). Example of High Severity / Low Priority and Low Severity / High Priority.',
    answerSummary: 'Defect lifecycle transitions through New -> Assigned -> Open -> Fixed -> Retested -> Verified/Closed (or Reopened). Severity measures technical impact (Crash/Blocker, Critical, Major, Minor). Priority measures business urgency (P1 Blocker to P4 Low). High Severity/Low Priority: App crashes on an obsolete legacy operating system only 0.01% users use. Low Severity/High Priority: Company logo is misspelled or broken on the public checkout page.',
    bestPractice: 'Log defects with clear reproducible steps, expected vs actual behavior, environment details, timestamps, network payloads, and console logs.',
    pitfallToAvoid: 'Marking all bugs as Critical/P1 without objective technical criteria, creating triage fatigue.'
  },
  {
    id: 'kb-man-02',
    category: 'Manual QA Processes',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 2,
    topic: 'Test Design Techniques (BVA & Equivalence Partitioning)',
    question: 'How do you apply Boundary Value Analysis (BVA) and Equivalence Partitioning (EP) to design test cases for an input field accepting ages 18 to 65?',
    expectedFocus: 'Equivalence partitions (valid: 18-65; invalid: <18, >65, non-numeric). Boundary values (17, 18, 19, 64, 65, 66, and edge cases like 0, negative, floating point).',
    answerSummary: 'Equivalence Partitioning divides inputs into valid [18..65] and invalid [<18] and [>65] partitions, testing one representative value from each (e.g. 10, 30, 80). Boundary Value Analysis tests boundaries: lower boundary (17, 18, 19) and upper boundary (64, 65, 66). Also test null, decimal numbers, special characters, and empty inputs.',
    bestPractice: 'Combine 2-value or 3-value boundary testing with negative character injection to uncover off-by-one errors.',
    pitfallToAvoid: 'Writing redundant test cases inside the same equivalence partition without testing boundary transition points.'
  },
  {
    id: 'kb-man-03',
    category: 'Manual QA Processes',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 5,
    topic: 'Agile QA & Shift-Left Testing',
    question: 'What does "Shift-Left Testing" mean in an Agile Scrum squad, and how do QA engineers actively prevent defects rather than just finding them during sprint testing?',
    expectedFocus: 'Participating in Three Amigos (Product, Dev, QA), refining user stories with acceptance criteria (Given-When-Then), static testing of wireframes/PRDs, pairing with devs on unit/integration tests before PR merge.',
    answerSummary: 'Shift-Left moves testing activities earlier in the SDLC. Instead of testing finished code at the end of a sprint, QA participates in Three Amigos sessions to question edge cases in PRDs, drafts BDD acceptance criteria before coding starts, reviews API OpenAPI contracts, and reviews unit test coverage with developers.',
    bestPractice: 'Use BDD Example Mapping during sprint backlog refinement to uncover ambiguous requirements before story grooming finishes.',
    pitfallToAvoid: 'Acting as a downstream phase gatekeeper waiting for code to be "thrown over the wall" to QA on the last day of the sprint.'
  },
  {
    id: 'kb-man-04',
    category: 'Manual QA Processes',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Root Cause Analysis (RCA) & Production Escapes',
    question: 'A critical payment double-charging bug escaped to production and went undetected for 4 hours. How do you lead the Root Cause Analysis (RCA) and build a preventative Quality Action Plan?',
    expectedFocus: '5 Whys or Fishbone (Ishikawa) diagram, timeline reconstruction, identifying gaps in automated regression, integration testing, synthetic monitoring, and feature flag rollback strategy.',
    answerSummary: 'Reconstruct a detailed incident timeline. Perform a 5-Whys RCA across Requirements, Code Review, Test Coverage, Environment, and Telemetry. Determine why automated tests missed race conditions (e.g. missing idempotent key assertions), add synthetic health checks to APM (Datadog/NewRelic), implement circuit breakers, and introduce automated contract testing.',
    bestPractice: 'Foster a blameless post-mortem culture focused on systemic process and test automation improvements.',
    pitfallToAvoid: 'Blaming an individual tester or simply adding a manual checklist item without addressing automated test harness gaps.'
  },
  {
    id: 'kb-man-05',
    category: 'Manual QA Processes',
    difficulty: 'Hard',
    experienceLevel: '10+ Years',
    minYears: 10,
    maxYears: 25,
    topic: 'Enterprise Quality Strategy & Shift-Right Observability',
    question: 'As a Test Architect, how do you define an enterprise-wide Quality Strategy spanning 30+ microservices, incorporating Shift-Right testing, Synthetic Monitoring, and Chaos Engineering?',
    expectedFocus: 'Testing pyramid balance, contract testing (Pact), ephemeral test environments, canary releases with automated rollback metrics, Datadog synthetic transaction monitors, Chaos Mesh / Toxiproxy fault injection.',
    answerSummary: 'Architect a unified Quality Engineering strategy combining Shift-Left (Pact contract tests, unit/component tests) and Shift-Right (synthetic canary transactions running in production every 60s, OpenTelemetry trace assertion, chaos engineering injecting network latency via Toxiproxy). Define SLA/SLO-based quality gates preventing bad builds from promoting past staging.',
    bestPractice: 'Measure Quality Metrics: DORA metrics (Change Failure Rate, MTTR), Test Execution Duration, Flakiness Index, and Escaped Defect Rate.',
    pitfallToAvoid: 'Relying exclusively on heavy, slow end-to-end UI tests against a shared staging environment.'
  },

  // ==========================================
  // 2. CODING & DSA FOR SDET
  // ==========================================
  {
    id: 'kb-dsa-01',
    category: 'Coding & DSA',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 2,
    topic: 'String Manipulation & Frequency Count',
    question: 'Write a function to check if two strings are Anagrams (e.g. "listen" and "silent"). What is the time and space complexity of your approach?',
    expectedFocus: 'Handling string normalization (case, spaces), using a character frequency array/HashMap (O(N) time, O(1) space) versus sorting (O(N log N)).',
    answerSummary: 'If lengths differ, return false. Use a fixed-size frequency array of size 26 (or HashMap for Unicode). Increment counts for string 1 and decrement for string 2. If any count is non-zero, they are not anagrams. Time complexity: O(N), Space complexity: O(1) for alphabet or O(K) where K is distinct characters.',
    codeSnippet: `// TypeScript O(N) frequency count
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const counts = new Map<string, number>();
  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);
  for (const ch of t) {
    if (!counts.has(ch) || counts.get(ch)! === 0) return false;
    counts.set(ch, counts.get(ch)! - 1);
  }
  return true;
}`,
    bestPractice: 'Clarify case-sensitivity, whitespace handling, and Unicode/ASCII constraints before coding.',
    pitfallToAvoid: 'Sorting both strings with .split("").sort().join(""), which incurs unnecessary O(N log N) runtime and heap allocation.'
  },
  {
    id: 'kb-dsa-02',
    category: 'Coding & DSA',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 5,
    topic: 'Two Pointers & Sliding Window for Log Parsing',
    question: 'Given an array of HTTP response times from an automated performance run, find the maximum average response time across any contiguous window of k requests. What is the optimal Big-O complexity?',
    expectedFocus: 'Sliding Window technique to achieve O(N) time and O(1) auxiliary space instead of O(N * k) brute force recalculation.',
    answerSummary: 'Compute the sum of the first k elements. Then slide the window across the array: add the incoming element array[i] and subtract the outgoing element array[i - k]. Track the maximum sum and return maxSum / k. Time: O(N), Space: O(1).',
    codeSnippet: `// Sliding window max average
function maxAverageSubarray(nums: number[], k: number): number {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += nums[i];
  let maxSum = windowSum;
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k];
    if (windowSum > maxSum) maxSum = windowSum;
  }
  return maxSum / k;
}`,
    bestPractice: 'Use sliding window whenever processing streaming data, log metrics, or fixed-interval benchmark windows.',
    pitfallToAvoid: 'Re-summing the entire sub-slice using a nested loop inside the traversal.'
  },
  {
    id: 'kb-dsa-03',
    category: 'Coding & DSA',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Data Structure Design - Rate Limiter & LRU Cache',
    question: 'Design an in-memory Rate Limiter / LRU Cache for caching test authentication tokens. Explain how HashMap + Doubly Linked List achieves O(1) get and O(1) put operations.',
    expectedFocus: 'HashMap maps key to Node. Doubly Linked List maintains access order (head = most recent, tail = least recent). Node contains prev, next, key, value. Evicting from tail and moving accessed node to head in O(1).',
    answerSummary: 'Combine a Map<string, Node> for O(1) lookups with a Doubly Linked List (pseudo head and tail) for O(1) insertion and removal. On get(key): lookup node in map and move it to head. On put(key, val): if key exists, update value and move to head; if new, create node and insert at head. If capacity exceeded, remove tail.prev from list and delete its key from map.',
    codeSnippet: `class LRUCache<K, V> {
  private capacity: number;
  private map = new Map<K, Node<K, V>>();
  private head = new Node<K, V>(null as any, null as any);
  private tail = new Node<K, V>(null as any, null as any);

  constructor(cap: number) {
    this.capacity = cap;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  // O(1) get & put implementation
}`,
    bestPractice: 'Use sentinel dummy head and tail nodes to avoid null pointer checks when inserting or deleting elements.',
    pitfallToAvoid: 'Using an Array with array.indexOf() or array.splice(), which runs in O(N) time and degrades performance.'
  },

  // ==========================================
  // 3. SELENIUM & PLAYWRIGHT AUTOMATION
  // ==========================================
  {
    id: 'kb-aut-01',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 2,
    topic: 'Locators, Synchronization & Page Object Basics',
    question: 'Why is Thread.sleep considered an anti-pattern in Selenium? How do Explicit Wait (WebDriverWait) and Playwright auto-waiting solve synchronization issues?',
    expectedFocus: 'Thread.sleep halts JVM thread blindly causing slow runs and flaky tests on variable networks. WebDriverWait polls the DOM for ExpectedConditions. Playwright auto-waits for actionability checks (visible, attached, stable, enabled, editable).',
    answerSummary: 'Thread.sleep forces a static delay regardless of element readiness, slowing test suites and failing whenever servers lag. Selenium WebDriverWait with ExpectedConditions (elementToBeClickable, visibilityOfElementLocated) polls the DOM at a defined interval (e.g. 500ms). Playwright natively auto-waits before executing actions (click, fill) by validating visibility, hit-testing, and stability without manual wait statements.',
    codeSnippet: `// Selenium Java Explicit Wait:
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("submit-order")));
submitBtn.click();

// Playwright TypeScript Native Auto-Wait:
await page.getByRole('button', { name: 'Submit Order' }).click();`,
    bestPractice: 'Adopt user-facing accessible locators (getByRole, getByLabel) over brittle XPath hierarchies.',
    pitfallToAvoid: 'Mixing Implicit Waits and Explicit Waits in Selenium, which causes unpredictable timeout multiplication in WebDriver.'
  },
  {
    id: 'kb-aut-02',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 5,
    topic: 'Thread-Safe WebDriver & Playwright BrowserContext Isolation',
    question: 'How do you guarantee thread safety during parallel test execution in Selenium Java vs Playwright TypeScript?',
    expectedFocus: 'Selenium: ThreadLocal<WebDriver> pattern to ensure each worker thread has an isolated driver instance. Playwright: isolated BrowserContexts created per test with separate cookies, cache, and storageState, avoiding browser relaunch overhead.',
    answerSummary: 'In Selenium Java, wrap the driver in ThreadLocal<WebDriver> so each TestNG thread accesses its own isolated session without race conditions. In Playwright, a single Browser instance is shared, and tests automatically run in isolated BrowserContexts (incognito equivalents). Each context runs independently in parallel with zero cookie/session contamination.',
    codeSnippet: `// Selenium ThreadLocal Manager:
public class DriverManager {
  private static final ThreadLocal<WebDriver> driver = new ThreadLocal<>();
  public static WebDriver getDriver() { return driver.get(); }
  public static void setDriver(WebDriver d) { driver.set(d); }
  public static void quitDriver() {
    if (driver.get() != null) { driver.get().quit(); driver.remove(); }
  }
}`,
    bestPractice: 'Always invoke driver.remove() on ThreadLocal in an @AfterMethod teardown to prevent thread pool memory leaks.',
    pitfallToAvoid: 'Declaring public static WebDriver driver as a global static field in base classes.'
  },
  {
    id: 'kb-aut-03',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Dynamic Shadow DOM, iFrames & Network Interception',
    question: 'How do you automate modern micro-frontends with nested open/closed Shadow DOMs, cross-origin iframes, and dynamic mock API responses in Playwright vs Selenium 4?',
    expectedFocus: 'Playwright CSS engine traverses open shadow roots automatically (no switchTo needed); Selenium 4 requires element.getShadowRoot(). Cross-origin iframes require page.frameLocator(). Network interception via page.route() in Playwright vs CDP / BiDi in Selenium 4.',
    answerSummary: 'Playwright pierces open Shadow DOMs natively using standard locators (e.g. page.locator("custom-element button")). In Selenium 4, use searchContext = element.getShadowRoot(). For nested iframes, Playwright uses page.frameLocator("#auth-frame").locator("input[name=otp]"). To stub network calls, Playwright page.route("**/*api/checkout", route => route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })).',
    codeSnippet: `// Playwright Frame Locator & Route Mocking:
await page.route('**/api/v1/payment', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ status: 'APPROVED', txId: 'TX-9988' }),
  });
});
const stripeFrame = page.frameLocator('iframe[name=stripe-checkout]');
await stripeFrame.getByPlaceholder('Card number').fill('4242424242424242');`,
    bestPractice: 'Mock slow third-party payment gateways at the network layer in CI to eliminate 3rd-party outages and flakiness.',
    pitfallToAvoid: 'Using driver.switchTo().defaultContent() after every iframe action in legacy Selenium styles.'
  },
  {
    id: 'kb-aut-04',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Hard',
    experienceLevel: '10+ Years',
    minYears: 10,
    maxYears: 25,
    topic: 'Test Architecture - Zero-Flakiness Enterprise Test Platform',
    question: 'As a Test Architect, design a test automation framework supporting 10,000+ tests that executes in under 10 minutes in CI with < 0.1% flakiness. Detail your sharding, auth caching, and failure isolation architecture.',
    expectedFocus: 'One-time global auth via Playwright storageState, horizontal matrix sharding (--shard=x/y), dynamic ephemeral environments, trace viewer artifact retention, retry-on-failure quarantine, and headless Chromium cluster optimization.',
    answerSummary: 'Key pillars: 1) Auth bypass: Generate storageState JSON once in a globalSetup task; each worker loads auth state in 0ms without repeating UI login flows. 2) CI Matrix Sharding: Split tests across 20 parallel CI runners (--shard=1/20 to 20/20). 3) Network stubbing: Stub volatile external third parties via page.route(). 4) Flakiness quarantine: Trace recording on failure, automatic quarantine tagging for tests failing > 2% runs, and merge blob reports into a single unified Allure/HTML report.',
    bestPractice: 'Treat test automation code with identical standards as production code: static linting, strict types, PR code reviews, and dependency vulnerability scans.',
    pitfallToAvoid: 'Allowing tests to depend on sequential ordering or shared mutable database rows.'
  },

  // ==========================================
  // 4. REPORTING & TEST ANALYTICS
  // ==========================================
  {
    id: 'kb-rep-01',
    category: 'Reporting',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 2,
    topic: 'Test Listeners & Automated Screenshot Capture on Failure',
    question: 'How do you automatically attach screenshots, DOM snapshots, and error stack traces to your test report only when a test fails?',
    expectedFocus: 'TestNG ITestListener (onTestFailure) in Selenium or Playwright config screenshot: "only-on-failure", trace: "retain-on-failure".',
    answerSummary: 'In Selenium TestNG, implement ITestListener and override onTestFailure(ITestResult result). Cast driver to TakesScreenshot, capture the file as base64 or png, and attach it to ExtentReports or Allure. In Playwright, configure use: { screenshot: "only-on-failure", trace: "retain-on-failure", video: "retain-on-failure" } in playwright.config.ts.',
    codeSnippet: `// TestNG Listener onTestFailure:
@Override
public void onTestFailure(ITestResult result) {
  WebDriver driver = DriverManager.getDriver();
  byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
  Allure.addAttachment("Failure Screenshot", new ByteArrayInputStream(screenshot));
}`,
    bestPractice: 'Attach request/response HTTP headers and browser console logs alongside failure screenshots for rapid debugging.',
    pitfallToAvoid: 'Capturing video and screenshots for 100% of passing tests in CI, consuming gigabytes of disk and slowing execution.'
  },
  {
    id: 'kb-rep-02',
    category: 'Reporting',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 5,
    topic: 'Allure Report Customization & Defect Categorization',
    question: 'How do you configure Allure Report to categorize failures into Product Bugs vs Infrastructure/Test Defects, and integrate historical trend graphs?',
    expectedFocus: 'categories.json configuration in Allure (matching error message regex), @Epic, @Feature, @Story, @Severity annotations, and copying allure-history from previous CI runs.',
    answerSummary: 'Allure supports categories.json to automatically group failures into categories like "Environment Issues" (regex matching 502/504 Bad Gateway), "Locator Stale Defects" (StaleElementReferenceException), and "Product Regressions" (AssertionError). To maintain trend graphs in CI, copy history/ directory from the previous build before running allure generate.',
    bestPractice: 'Annotate tests with @Issue("JIRA-1234") and @TmsLink("TC-567") to link test results directly to Jira and test management systems.',
    pitfallToAvoid: 'Discarding historical allure reports between CI builds, which destroys trend analytics.'
  },
  {
    id: 'kb-rep-03',
    category: 'Reporting',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Distributed Sharded Report Aggregation & Analytics Dashboard',
    question: 'When running 30 parallel CI shards, each produces an isolated blob report. How do you merge them into a single centralized report and broadcast pass/fail summaries to Slack?',
    expectedFocus: 'Playwright merge-reports CLI, Allure aggregate step, uploading blob artifacts to CI storage, downloading all blobs into one folder, generating merged HTML, and firing Slack webhook with stats.',
    answerSummary: 'Each matrix shard outputs a blob report: reporter: [["blob", { outputDir: `blob-report-${shard}` }]]. A downstream collector job in GitHub Actions downloads all blob artifacts into one directory and runs: npx playwright merge-reports --reporter=html,allure-playwright ./all-blobs. Parse the summary JSON to send an automated Slack notification with Pass/Fail/Flaky counts.',
    codeSnippet: `# GitHub Actions Shard Merge Step:
- name: Merge Playwright Blob Reports
  run: npx playwright merge-reports --reporter=html ./all-blob-reports
- name: Publish HTML Report to GitHub Pages / S3
  uses: actions/upload-artifact@v4
  with:
    name: final-merged-html-report
    path: playwright-report`,
    bestPractice: 'Include direct links in Slack notifications to failed test traces for 1-click debugging.',
    pitfallToAvoid: 'Generating separate isolated reports per shard, forcing engineers to inspect 30 separate CI artifacts.'
  },

  // ==========================================
  // 5. CI/CD PIPELINES (JENKINS, GHA, AZURE DEVOPS)
  // ==========================================
  {
    id: 'kb-cicd-01',
    category: 'CI/CD Pipelines',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 2,
    topic: 'CI/CD Pipeline Basics & PR Triggers',
    question: 'What is the difference between Continuous Integration (CI) and Continuous Delivery (CD)? How do you trigger automated smoke tests on a Pull Request (PR)?',
    expectedFocus: 'CI automatically merges and tests code changes frequently. CD deploys tested code to staging/production automatically. PR triggers via webhook (on: pull_request in GitHub Actions, PR trigger in Jenkins/Azure Pipelines).',
    answerSummary: 'CI (Continuous Integration) is the automated process of building and running tests against code changes as soon as developers commit or open a PR. CD (Continuous Delivery/Deployment) automatically deploys passing builds to environments. In GitHub Actions, configure on: pull_request: branches: [main] to trigger a fast smoke test suite before merge.',
    codeSnippet: `# GitHub Actions PR Trigger:
name: Smoke Tests
on:
  pull_request:
    branches: [ main, develop ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:smoke`,
    bestPractice: 'Gate PR merges with required status checks so code cannot merge unless smoke tests pass 100%.',
    pitfallToAvoid: 'Running the entire 3-hour regression suite on every single PR commit, creating long developer bottlenecks.'
  },
  {
    id: 'kb-cicd-02',
    category: 'CI/CD Pipelines',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 5,
    topic: 'Matrix Jobs, Parallel Sharding & Secrets Management',
    question: 'How do you configure parallel matrix jobs in GitHub Actions or Jenkins to execute a test suite 5x faster, and how do you securely pass API secrets and tokens?',
    expectedFocus: 'Matrix strategy: matrix.shard: [1, 2, 3, 4, 5], passing ${{ matrix.shard }}/5, caching node_modules / maven repository, injecting secrets via GitHub Secrets / Jenkins Credentials (withCredentials), never logging plain text secrets.',
    answerSummary: 'Define a matrix strategy in the CI workflow with 5 shards. Each container receives a distinct shard index. Cache dependencies (~/.npm or ~/.m2) to save build setup time. Store sensitive tokens in GitHub Secrets or Azure Key Vault and inject them into runner environment variables (env: API_SECRET: ${{ secrets.API_SECRET }}). CI automatically masks secrets in logs.',
    codeSnippet: `# Matrix Parallel Runner:
strategy:
  fail-fast: false
  matrix:
    shardIndex: [1, 2, 3, 4, 5]
    shardTotal: [5]
steps:
  - run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}
    env:
      TEST_ENV: staging
      API_KEY: \${{ secrets.STAGING_API_KEY }}`,
    bestPractice: 'Set fail-fast: false so that one failed test shard does not cancel all other running shards.',
    pitfallToAvoid: 'Hardcoding passwords, API tokens, or test account credentials directly in test repository code.'
  },
  {
    id: 'kb-cicd-03',
    category: 'CI/CD Pipelines',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Jenkins Declarative Pipeline-as-Code & Quality Gates',
    question: 'Write a declarative Jenkinsfile that runs unit tests, spins up Docker containers, runs parallel browser tests with auto-retry, evaluates quality gates, and handles teardown.',
    expectedFocus: 'pipeline { agent any, stages { stage("Parallel Tests") { parallel { ... } } }, post { always { cleanWs(), junit ... } } }, handling container cleanup, SonarQube quality gate verification.',
    answerSummary: 'Use Jenkins declarative syntax: stages for Build, Static Analysis (SonarQube quality gate with waitForQualityGate()), Parallel Browser Execution, and Post actions. Run browsers in containerized agents. Use retry(2) for network resiliency. In post { always { junit "**/target/surefire-reports/*.xml"; cleanWs() } } to guarantee workspace cleanup and test result recording.',
    codeSnippet: `// Jenkinsfile Declarative Pipeline:
pipeline {
  agent { docker { image 'mcr.microsoft.com/playwright:v1.44.0-jammy' } }
  stages {
    stage('Parallel E2E') {
      parallel {
        stage('Chrome Shard') { steps { sh 'npx playwright test --project=chromium' } }
        stage('Firefox Shard') { steps { sh 'npx playwright test --project=firefox' } }
      }
    }
  }
  post {
    always {
      junit '**/test-results/**/*.xml'
      archiveArtifacts 'playwright-report/**'
    }
  }
}`,
    bestPractice: 'Always use declarative pipeline-as-code committed to source control (Jenkinsfile) rather than freestyle web UI jobs.',
    pitfallToAvoid: 'Leaving rogue Docker containers or zombie Chrome processes running on shared self-hosted Jenkins agents.'
  },
  {
    id: 'kb-cicd-04',
    category: 'CI/CD Pipelines',
    difficulty: 'Hard',
    experienceLevel: '10+ Years',
    minYears: 10,
    maxYears: 25,
    topic: 'Enterprise CI/CD Architecture & Ephemeral Preview Environments',
    question: 'How do you design a GitOps CI/CD delivery pipeline that provisions ephemeral test environments on Kubernetes per PR, runs automated acceptance suites, and tears down on PR close?',
    expectedFocus: 'Kubernetes namespaces / Helm charts / ArgoCD preview apps, DNS routing per PR (pr-123.preview.company.com), seeding sanitized test databases, running test suite, destroying namespace on merge/close.',
    answerSummary: 'When a PR is opened, a GitHub Actions workflow deploys the PR branch to an isolated Kubernetes namespace using Helm or ArgoCD ApplicationSets. A lightweight seed job populates the preview database with sanitized test data. The E2E automation runs targeted tests against the ephemeral URL. When the PR is merged or closed, a webhook triggers helm uninstall and kubectl delete namespace.',
    bestPractice: 'Use ephemeral environments to eliminate staging environment contention where multiple teams block each other.',
    pitfallToAvoid: 'Allowing orphaned ephemeral preview environments to remain running indefinitely in cloud clusters, wasting thousands of dollars in cloud spend.'
  },

  // ==========================================
  // 6. API TESTING & AUTOMATION (POSTMAN, REST ASSURED, PLAYWRIGHT)
  // ==========================================
  {
    id: 'kb-api-01',
    category: 'API Testing & Automation',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 2,
    topic: 'HTTP Methods, Status Codes & Postman Assertions',
    question: 'Explain the core HTTP methods (GET, POST, PUT, PATCH, DELETE) and HTTP status code categories (2xx, 3xx, 4xx, 5xx). How do you write response assertions in Postman using pm.test?',
    expectedFocus: 'Idempotency (GET, PUT, DELETE are idempotent; POST is not). Status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error, 503 Service Unavailable. Postman pm.test syntax (pm.response.to.have.status, pm.response.json()).',
    answerSummary: 'GET retrieves data (idempotent); POST creates a new resource (non-idempotent); PUT replaces a full resource (idempotent); PATCH partially updates; DELETE removes a resource (idempotent). Status codes: 2xx success, 3xx redirection, 4xx client errors (401 unauthenticated vs 403 unauthorized), 5xx server errors. In Postman, test scripts execute in JavaScript using pm.test and pm.expect.',
    codeSnippet: `// Postman Tests Script:
pm.test("Status is 201 Created", function () {
  pm.response.to.have.status(201);
});
pm.test("Response contains order ID and status", function () {
  const json = pm.response.json();
  pm.expect(json.status).to.eql("PENDING");
  pm.expect(json.orderId).to.be.a("string");
  pm.environment.set("currentOrderId", json.orderId);
});`,
    bestPractice: 'Chain requests in Postman by capturing tokens or IDs from response payloads and setting them into environment variables.',
    pitfallToAvoid: 'Only asserting on HTTP 200 status code without verifying JSON schema or response body field values.'
  },
  {
    id: 'kb-api-02',
    category: 'API Testing & Automation',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 5,
    topic: 'REST Assured BDD (Given-When-Then) & POJO Serialization',
    question: 'How do you design a maintainable REST Assured Java framework using Given-When-Then BDD style, RequestSpecification/ResponseSpecification, and Jackson/Lombok POJOs?',
    expectedFocus: 'RestAssured.given() with RequestSpecBuilder (baseUri, auth, headers), when().post(), then().spec(responseSpec). POJO mapping for request serialization and response deserialization (.as(UserResponse.class)). JSON schema validation.',
    answerSummary: 'Use RequestSpecBuilder to define reusable base specifications (baseURL, Content-Type, Bearer token, logging filters). Map payloads to typed Java POJOs using Jackson/Lombok (@Data, @Builder) rather than hardcoded string JSONs. Use response.as(OrderResponse.class) to deserialize into strongly-typed objects and assert with AssertJ.',
    codeSnippet: `// REST Assured Java POJO Pattern:
CreateUserRequest payload = CreateUserRequest.builder()
  .name("Alex SDET")
  .email("alex@intelligentqa.io")
  .role("QA_ENGINEER")
  .build();

UserResponse response = given()
  .spec(requestSpec)
  .body(payload)
.when()
  .post("/api/v1/users")
.then()
  .spec(responseSpec201)
  .extract()
  .as(UserResponse.class);

assertThat(response.getId()).isNotNull();
assertThat(response.getEmail()).isEqualTo("alex@intelligentqa.io");`,
    bestPractice: 'Separate API Client service classes from test specifications so endpoint changes only require updates in one place.',
    pitfallToAvoid: 'Constructing dynamic JSON payloads by concatenating raw strings with "+" operators.'
  },
  {
    id: 'kb-api-03',
    category: 'API Testing & Automation',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Playwright API Testing & Unified UI-API Hybrid Automation',
    question: 'How do you leverage Playwright APIRequestContext for hybrid testing (e.g. creating test data via API in 50ms and verifying on the UI)? How does Playwright share auth cookies between API and Browser contexts?',
    expectedFocus: 'request.newContext() or test fixture request, request.post(), bypassing slow UI checkout steps, injecting storageState or cookies directly into browserContext, verifying DB state or UI rendering.',
    answerSummary: 'In Playwright, the built-in request fixture provides an APIRequestContext. Tests can make API calls directly without needing external libraries like Axios. In a hybrid test: 1) Call API via request.post() to create a customer, load a shopping cart, and seed test data in 50ms; 2) Pass the authentication cookie or token to the browser context; 3) Navigate browser directly to /checkout to verify UI rendering, saving 80% of test execution time.',
    codeSnippet: `// Playwright Hybrid API + UI Test:
test('Verify order confirmation on UI after API checkout seed', async ({ request, page }) => {
  // 1. Seed order via API in 100ms
  const apiRes = await request.post('/api/orders', {
    data: { productId: 'PROD-101', quantity: 2 },
    headers: { Authorization: \`Bearer \${process.env.AUTH_TOKEN}\` }
  });
  const { orderId } = await apiRes.json();

  // 2. Open UI directly on the created order
  await page.goto(\`/orders/\${orderId}\`);
  await expect(page.getByRole('heading', { name: \`Order #\${orderId}\` })).toBeVisible();
});`,
    bestPractice: 'Use API setup for prerequisites and teardown; reserve UI automation strictly for user interaction verification.',
    pitfallToAvoid: 'Automating 10 sequential UI screens just to set up preconditions for a test that only verifies the 11th screen.'
  },
  {
    id: 'kb-api-04',
    category: 'API Testing & Automation',
    difficulty: 'Hard',
    experienceLevel: '10+ Years',
    minYears: 10,
    maxYears: 25,
    topic: 'Contract Testing (Pact), OAuth2 PKCE & Resiliency Testing',
    question: 'How do you implement Consumer-Driven Contract Testing (Pact) across 50 microservices to eliminate broken API integrations before deployment? How do you test OAuth2 PKCE and rate limiting?',
    expectedFocus: 'Consumer-driven contracts (Pact), generating pact files during consumer unit tests, publishing to Pact Broker, provider verification in provider CI pipeline, testing 429 Too Many Requests with exponential backoff.',
    answerSummary: 'In microservices, end-to-end tests across all services are brittle and slow. With Pact Consumer-Driven Contract Testing: The consumer defines expectations (endpoints, headers, JSON schema) in mock unit tests, generating a Pact JSON contract file. The contract is published to the Pact Broker. When the Provider service builds in CI, it fetches the contract and verifies its actual responses conform to it (can-i-deploy check). This guarantees API compatibility without running both services simultaneously.',
    bestPractice: 'Integrate the Pact Broker can-i-deploy tool into CI/CD release gates to prevent deploying breaking changes to production.',
    pitfallToAvoid: 'Treating end-to-end integration environments as the only place to catch breaking API schema changes.'
  },

  // ==========================================
  // 7. MOBILE MANUAL TESTING (ANDROID & IOS)
  // ==========================================
  {
    id: 'kb-mob-01',
    category: 'Mobile Manual Testing (Android & iOS)',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 2,
    topic: 'Mobile Lifecycles, OS Differences & Permissions',
    question: 'Explain the mobile application lifecycle states (Foreground, Background, Suspended, Terminated). What are the key differences between testing on Android vs iOS?',
    expectedFocus: 'Lifecycle transitions (incoming call, push notification, home button, battery saver). Android: open ecosystem, OEM fragmentation (Samsung, Pixel, Xiaomi), hardware back button, APK/AAB installs, runtime vs install permissions. iOS: Apple sandboxing, strict background execution, notch/Dynamic Island, IPA installs via TestFlight, permissions prompt behavior.',
    answerSummary: 'Mobile apps transition between Active (Foreground), Inactive (brief interruption like incoming call), Background (running in background e.g. audio/location), and Terminated. Android differences: hardware/gesture back navigation, deep fragmentation across screen resolutions and custom vendor OS skins (OneUI, MIUI), and sideloading via APK. iOS differences: standardized hardware, sandboxed filesystem, strict App Store review guidelines, TestFlight distribution, and no universal back button.',
    bestPractice: 'Always test interruption scenarios: incoming phone call, alarm, 1% low battery warning, loss of Wi-Fi during checkout, and switching to another app and returning.',
    pitfallToAvoid: 'Testing only on high-end flagship devices while ignoring low-spec budget phones with limited RAM.'
  },
  {
    id: 'kb-mob-02',
    category: 'Mobile Manual Testing (Android & iOS)',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 5,
    topic: 'ADB Commands, Xcode Instruments & Crash Log Inspection',
    question: 'How do you collect and analyze crash logs on Android using ADB (Android Debug Bridge) and on iOS using macOS Console / Xcode? Give essential ADB commands used in daily QA.',
    expectedFocus: 'ADB commands: adb devices, adb install -r, adb logcat -v time *:E, adb shell dumpsys, adb shell am start. iOS: Xcode Window -> Devices and Simulators -> View Device Logs, .ips crash logs, inspecting symbolicated stack traces.',
    answerSummary: 'On Android: Use adb logcat *:E to filter system errors and stack traces. Filter by app package: adb logcat | grep -i "com.example.app". Useful commands: adb install -r -d (reinstall keeping data), adb shell pm clear com.example.app (clear cache/data), adb shell screencap (take screenshot). On iOS: Connect iPhone to Mac, open Xcode -> Devices and Simulators -> View Device Logs. Look for .ips crash reports, inspect the crashed thread, and look for EXC_BAD_ACCESS or Out of Memory (OOM) jetsam termination.',
    codeSnippet: `# Essential ADB commands for QA:
adb devices
adb logcat -v time com.app.package:E > crash_log.txt
adb shell dumpsys battery set level 5
adb shell pm grant com.app.package android.permission.ACCESS_FINE_LOCATION
adb shell am start -W -a android.intent.action.VIEW -d "myapp://checkout/success"`,
    bestPractice: 'Symbolicate crash reports with dSYM files (iOS) or ProGuard/R8 mapping files (Android) to translate memory addresses into readable line numbers.',
    pitfallToAvoid: 'Logging a crash bug as "App crashed" without attaching the stack trace, device OS version, and logcat output.'
  },
  {
    id: 'kb-mob-03',
    category: 'Mobile Manual Testing (Android & iOS)',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Network Throttling, Offline Sync & Battery Profiling',
    question: 'How do you test a mobile app for offline synchronization, data conflict resolution, and excessive battery/thermal drainage across varied network topologies (2G/3G, packet loss)?',
    expectedFocus: 'Simulating offline mode with local SQLite/Realm/Room DB, testing optimistic UI updates, queueing network requests, conflict resolution (last-write-wins vs server-wins), Charles Proxy / Proxyman for bandwidth throttling and packet drop simulation, Android Battery Historian and Xcode Energy Gauge.',
    answerSummary: 'Test offline behavior by putting device in Airplane Mode or using network conditioners (Charles Proxy / Proxyman throttling to 2G/3G or 20% packet drop). Verify the app stores pending transactions locally in SQLite/Room, displays offline banners, and gracefully replays actions upon reconnection without duplicating transactions. For battery testing, run Xcode Energy Log or Android Battery Historian to identify excessive wake locks, background GPS polling, and uncompressed payload transfers.',
    bestPractice: 'Verify that reconnection does not trigger storming request bursts that overwhelm backend microservices.',
    pitfallToAvoid: 'Assuming mobile network connections are binary (either full 5G or completely disconnected); flaky 3G with 50% packet loss is where most bugs occur.'
  },

  // ==========================================
  // 8. MOBILE AUTOMATION (APPIUM)
  // ==========================================
  {
    id: 'kb-app-01',
    category: 'Mobile Automation (Appium)',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 2,
    topic: 'Appium 2.x Architecture, Drivers & Locator Strategies',
    question: 'Explain the Appium 2.x architecture. How does it communicate with Android devices via UiAutomator2 and iOS devices via XCUITest? What locator strategies should you prioritize?',
    expectedFocus: 'Appium 2.x decoupled server and driver ecosystem (appium driver install uiautomator2 / xcuitest), W3C WebDriver protocol, bootstrap daemon on mobile devices. Locators: AppiumBy.accessibilityId (content-desc in Android, accessibilityIdentifier in iOS) as top priority; avoid brittle absolute XPaths.',
    answerSummary: 'Appium 2.x decoupled the core server from drivers. The client script sends standard W3C HTTP commands to the Appium server. For Android, the server forwards commands to the UiAutomator2 driver running on the device. For iOS, it translates commands to Apple WebDriverAgent running XCUITest. Locator priority: 1) AppiumBy.accessibilityId (fastest, cross-platform); 2) AppiumBy.id / resource-id; 3) AppiumBy.androidUIAutomator / iOSNsPredicateString; avoid deep XPaths.',
    codeSnippet: `// Appium 2.x Java Setup with UiAutomator2Options:
UiAutomator2Options options = new UiAutomator2Options()
  .setPlatformName("Android")
  .setAutomationName("UiAutomator2")
  .setDeviceName("Pixel_7_API_34")
  .setApp("/path/to/app-release.apk");

AndroidDriver driver = new AndroidDriver(new URL("http://127.0.0.1:4723"), options);
WebElement loginBtn = driver.findElement(AppiumBy.accessibilityId("btn_login"));
loginBtn.click();`,
    bestPractice: 'Work with mobile developers to add dedicated test accessibility identifiers (accessibilityId / content-description) across all interactable elements.',
    pitfallToAvoid: 'Using complex XML XPaths (/hierarchy/android.widget.FrameLayout/...) which take seconds to evaluate and break across OS updates.'
  },
  {
    id: 'kb-app-02',
    category: 'Mobile Automation (Appium)',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 5,
    topic: 'W3C Actions API Gestures & Hybrid App Webview Context Switching',
    question: 'How do you automate complex mobile gestures (Swipe, Scroll, Pinch, Drag-and-Drop) using the W3C Actions API? How do you switch contexts between NATIVE_APP and WEBVIEW in hybrid applications?',
    expectedFocus: 'W3C Actions API (PointerInput, Sequence, PointerDown, PointerMove, PointerUp) replacing deprecated TouchAction. Context switching via driver.getContextHandles(), driver.context("WEBVIEW_com.example.app"), and switching back to NATIVE_APP.',
    answerSummary: 'TouchAction is deprecated in Appium 2.x; use the W3C Actions API with PointerInput of type TOUCH. Create a Sequence, add mouse/touch pointer moves, pointer down, pause for duration, pointer move to coordinate, and pointer up. For hybrid apps (Ionic/Cordova/React Native webviews), retrieve available contexts via driver.getContextHandles(). Switch context to driver.context("WEBVIEW_...") to automate web elements using standard DOM CSS/XPath, then switch back to driver.context("NATIVE_APP").',
    codeSnippet: `// W3C Actions API Swipe in Appium Java:
public void swipeVertical(AppiumDriver driver, int startX, int startY, int endX, int endY) {
  PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
  Sequence swipe = new Sequence(finger, 1);
  swipe.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), startX, startY));
  swipe.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
  swipe.addAction(finger.createPointerMove(Duration.ofMillis(600), PointerInput.Origin.viewport(), endX, endY));
  swipe.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));
  driver.perform(Collections.singletonList(swipe));
}`,
    bestPractice: 'Calculate swipe coordinates as percentages of screen dimensions (e.g. from 80% height to 20% height) to ensure resilience across different screen aspect ratios.',
    pitfallToAvoid: 'Hardcoding absolute pixel coordinates for swipes (e.g. y=1200), which fail on devices with different resolutions.'
  },
  {
    id: 'kb-app-03',
    category: 'Mobile Automation (Appium)',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Deep Linking, Biometrics & Cloud Device Farm Execution',
    question: 'How do you automate biometric authentication (FaceID / Fingerprint) and deep link navigation in Appium? How do you architect parallel execution across real device clouds (SauceLabs, BrowserStack, AWS Device Farm)?',
    expectedFocus: 'Android biometric simulation via driver.fingerPrint(1), iOS via driver.executeScript("mobile: enrollBiometric", ...), deep links via mobile: deepLink. Cloud device farm integration: RemoteWebDriver URL, W3C capabilities, tunnel configurations, video and device log capture.',
    answerSummary: 'To simulate biometrics: Android driver.fingerPrint(1); iOS driver.executeScript("mobile: sendBiometricMatch", Map.of("type", "faceId", "match", true)). For deep links: driver.executeScript("mobile: deepLink", Map.of("url", "myapp://cart/checkout", "package", "com.myapp")). For cloud device farms: Point URL to hub-cloud.browserstack.com/wd/hub, supply credentials via capabilities, configure bstack:options (deviceName, osVersion, enableCameraMock, tunnel for internal staging environments).',
    codeSnippet: `// Cloud Device Farm Capabilities with Biometric Mock:
MutableCapabilities capabilities = new MutableCapabilities();
HashMap<String, Object> bstackOptions = new HashMap<>();
bstackOptions.put("userName", System.getenv("BROWSERSTACK_USER"));
bstackOptions.put("accessKey", System.getenv("BROWSERSTACK_KEY"));
bstackOptions.put("deviceName", "Google Pixel 8");
bstackOptions.put("osVersion", "14.0");
bstackOptions.put("cameraMocking", "true");
capabilities.setCapability("bstack:options", bstackOptions);

AndroidDriver driver = new AndroidDriver(new URL("https://hub.browserstack.com/wd/hub"), capabilities);`,
    bestPractice: 'Use deep links to jump directly to target screens in regression suites rather than stepping through 10 onboarding screens on every test.',
    pitfallToAvoid: 'Testing real device camera or biometrics by manually pointing phone at printed photos instead of using mock APIs.'
  },
  {
    id: 'kb-app-04',
    category: 'Mobile Automation (Appium)',
    difficulty: 'Hard',
    experienceLevel: '10+ Years',
    minYears: 10,
    maxYears: 25,
    topic: 'Enterprise Mobile Test Architecture & Local Real Device Farms',
    question: 'As a Mobile Test Architect, design a high-throughput on-premise or hybrid mobile testing infrastructure for 50+ real iOS and Android devices, handling device recovery, provisioning profiles, USB hub stability, and CI parallelization.',
    expectedFocus: 'OpenSTF / DeviceFarmer, Appium Grid, powered industrial USB hubs (preventing USB drops), automated battery charge limiting, iOS provision profile resigning, automated reboot and device sanitization between runs.',
    answerSummary: 'Design an on-premise mobile device rack: 1) Hardware: Industrial USB hubs with per-port power management (Cambrionix) to cycle power and prevent battery swelling. 2) Device management: Deploy DeviceFarmer / OpenSTF or Selenium Grid 4 with Appium Relay nodes. 3) Teardown hooks: Automatically uninstall test apps, clear app data, reset permissions, and release ADB server locks after every test run. 4) iOS provisioning: Automate signing using fastlane match to synchronize wildcard development provisioning profiles.',
    bestPractice: 'Limit device charging to 80% capacity via hardware timers or smart plugs to prevent lithium battery swelling in 24/7 test racks.',
    pitfallToAvoid: 'Plugging 20 phones into standard consumer unpowered USB hubs, which causes random disconnects and USB bus resets.'
  },
  // ==========================================
  // FREEMOCKINTERVIEW CURATED KNOWLEDGE BASE
  // ==========================================
  {
    id: 'fmi-pw-route-01',
    technology: 'Playwright',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 6,
    topic: 'Network Mocking & Error State Injection via page.route()',
    question: 'How do you intercept third-party payment gateway or analytics APIs in Playwright using page.route(), and how do you simulate 500 Internal Server Errors and slow 3G network latency without relying on external sandbox backends?',
    expectedFocus: 'page.route() interception, route.fulfill() with mock JSON, route.abort(), simulating latency with route.continue() or delayed fulfill, eliminating third-party flakiness.',
    answerSummary: 'Use page.route() to intercept matching network patterns. Call route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Gateway Timeout" }) }) to verify client error handling. To test latency or slow connections, inject a delay before fulfilling or modify network emulation via CDP.',
    codeSnippet: `// Mock failed payment gateway response in Playwright\nawait page.route('**/api/v1/checkout/pay', async route => {\n  await route.fulfill({\n    status: 500,\n    contentType: 'application/json',\n    body: JSON.stringify({ error: 'CardProcessorDeclined' })\n  });\n});\nawait page.getByRole('button', { name: 'Submit Payment' }).click();\nawait expect(page.getByText('Payment failed. Please try again.')).toBeVisible();`,
    bestPractice: 'Mock flaky external 3rd-party services (Stripe, Twilio, Google Analytics) to keep CI deterministic and avoid burning live sandbox quotas.',
    pitfallToAvoid: 'Hitting real production third-party APIs during automated test runs, which introduces flakiness and security token leakage.'
  },
  {
    id: 'fmi-pw-storage-01',
    technology: 'Playwright',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Hard',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 6,
    topic: 'StorageState Global Setup & Multi-Role Session Re-use',
    question: 'In large Playwright test suites, repeated UI logins waste up to 40% of test execution time. How do you implement a global authentication setup using storageState for multiple user personas (Admin, Customer, Guest)?',
    expectedFocus: 'Playwright global-setup.ts, browserContext.storageState({ path }), project dependencies in playwright.config.ts, cookies and localStorage persistence, bypassing UI login on every test.',
    answerSummary: 'Configure a setup project in playwright.config.ts that logs in once per persona (Admin, Customer) via UI or direct API, then saves session storage and cookies to disk using page.context().storageState({ path: "auth/admin.json" }). Feature test projects declare dependencies: ["setup"] and set storageState: "auth/admin.json" to start pre-authenticated.',
    codeSnippet: `// playwright.config.ts multi-role setup\nexport default defineConfig({\n  projects: [\n    { name: 'setup', testMatch: /.*\\.setup\\.ts/ },\n    {\n      name: 'admin-tests',\n      dependencies: ['setup'],\n      use: { storageState: 'playwright/.auth/admin.json' },\n    },\n  ],\n});`,
    bestPractice: 'Log in via backend API requests (request.post) inside setup to generate auth cookies in milliseconds rather than automating slow UI forms.',
    pitfallToAvoid: 'Re-authenticating through the UI login form in a beforeEach hook for every single test specification.'
  },
  {
    id: 'fmi-qa-bva-01',
    technology: 'Test Design',
    category: 'Manual QA Processes',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 2,
    topic: 'Boundary Value Analysis & Equivalence Partitioning',
    question: 'An e-commerce discount code field accepts coupon codes that grant discounts for order values between $20.00 and $500.00 inclusive. Design test cases using 2-value Boundary Value Analysis (BVA) and Equivalence Partitioning (EP).',
    expectedFocus: 'Equivalence Classes: Valid ($20-$500), Invalid (<$20), Invalid (>$500). BVA values: $19.99, $20.00, $20.01, $499.99, $500.00, $500.01, plus negative numbers and non-numeric inputs.',
    answerSummary: '1) Equivalence Partitioning creates 3 partitions: Valid ($20-$500), Below Minimum (<$20), Above Maximum (>$500). 2) 2-value Boundary Value Analysis tests boundaries: $19.99 (invalid), $20.00 (valid min), $500.00 (valid max), $500.01 (invalid). Also test extreme edge cases like $0.00, negative values (-$5.00), and alphanumeric strings.',
    bestPractice: 'Test off-by-one boundary conditions because off-by-one errors (> vs >=) account for the majority of conditional logic bugs.',
    pitfallToAvoid: 'Only testing happy path numbers like $100 and missing boundary points like $19.99 and $500.01.'
  },
  {
    id: 'fmi-qa-triage-01',
    technology: 'Defect Management',
    category: 'Manual QA Processes',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 5,
    topic: 'Bug Severity vs Priority Matrix & Defect Triage Workflow',
    question: 'Explain the difference between Bug Severity and Bug Priority with concrete examples. When would a defect have High Severity but Low Priority, or Low Severity but High Priority?',
    expectedFocus: 'Severity = technical/system impact (crashes, data corruption). Priority = business/urgency impact. High Sev/Low Prio: Crash in deprecated legacy feature used by <0.1% users. Low Sev/High Prio: Typo in company legal name or CEO logo on homepage.',
    answerSummary: 'Severity measures technical impact on application stability (Blocker, Critical, Major, Minor). Priority measures urgency of business fix (P0/Immediate, P1, P2, P3). High Severity/Low Priority: Memory crash occurring only on obsolete OS version with minimal traffic. Low Severity/High Priority: Misspelled brand name or incorrect pricing currency symbol on checkout header.',
    bestPractice: 'Conduct regular cross-functional Bug Triage meetings with Product Managers and Tech Leads to align on priority based on user blast radius.',
    pitfallToAvoid: 'Marking every bug as P0/Blocker without evaluating customer impact, causing alert fatigue and friction with dev teams.'
  },
  {
    id: 'fmi-qa-flaky-01',
    technology: 'Quality Engineering',
    category: 'Manual QA Processes',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Flaky Test Quarantine Strategy & Root Cause Analysis (RCA)',
    question: 'How do you architect a Flaky Test Quarantine and Governance program in an enterprise CI/CD pipeline running 10,000+ daily automated tests, preventing broken builds while avoiding swept-under-the-rug test debt?',
    expectedFocus: 'Quarantine pipeline / test tagging (@flaky), Flakiness Index calculation, automatic Jira creation, SLA for resolution (e.g. 72 hours), root causes (race conditions, shared state, network latency, static sleeps).',
    answerSummary: 'Implement a zero-tolerance flaky test policy: 1) Automated detection: If a test fails and passes on retry in CI, tag it as flaky and calculate Flakiness Index (flaky runs / total runs). 2) Quarantine: Automatically route flaky tests to an asynchronous quarantine suite so they do not block master PR merges. 3) SLA: Generate Jira tickets assigned to the authoring squad with a strict 72-hour SLA to fix or permanently delete.',
    bestPractice: 'Quarantine tests to protect developer velocity, but track quarantined test count on team KPI dashboards to prevent test debt buildup.',
    pitfallToAvoid: 'Setting retry count to 3+ in CI to mask flakiness without investigating root causes like race conditions and shared database state.'
  },
  {
    id: 'fmi-api-idempotency-01',
    technology: 'REST API',
    category: 'API Testing & Automation',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 6,
    topic: 'API Idempotency & Duplicate Request Prevention Testing',
    question: 'What is API idempotency? Which HTTP methods are inherently idempotent, and how do you test idempotency keys in financial and payment processing APIs using automated API frameworks?',
    expectedFocus: 'Idempotency definition (f(f(x)) = f(x)), GET/PUT/DELETE/HEAD are idempotent, POST is not. Idempotency-Key header, asserting identical response body and status code on duplicate requests, verifying database record count equals 1.',
    answerSummary: 'An operation is idempotent if executing it multiple times produces the same system state as executing it once. GET, PUT, and DELETE are idempotent; POST is not. To test payment APIs: send POST /checkout with header "Idempotency-Key: uuid-123", assert HTTP 201. Immediately resend the exact same request with the same header: assert HTTP 200/201, identical transactionId, and verify via DB query that only 1 charge record was created.',
    codeSnippet: `// RestAssured Idempotency Test\nString idempotencyKey = UUID.randomUUID().toString();\nResponse res1 = given().header("Idempotency-Key", idempotencyKey)\n  .body(orderPayload).post("/api/orders");\nString orderId = res1.jsonPath().getString("id");\n\n// Second identical request with same key\nResponse res2 = given().header("Idempotency-Key", idempotencyKey)\n  .body(orderPayload).post("/api/orders");\nassertEquals(res2.jsonPath().getString("id"), orderId);\n// Verify DB charge count is strictly 1`,
    bestPractice: 'Verify both immediate network retries (simulating network dropouts) and delayed retries with the same idempotency key.',
    pitfallToAvoid: 'Assuming PUT is always idempotent in practice without testing if backend triggers non-idempotent side effects (e.g. email notifications).'
  },
  {
    id: 'fmi-api-contract-01',
    technology: 'Pact Contract Testing',
    category: 'API Testing & Automation',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Consumer-Driven Contract Testing with Pact vs End-to-End E2E Testing',
    question: 'How does Consumer-Driven Contract Testing (Pact) solve the scalability bottlenecks of end-to-end integration environments in a microservices ecosystem of 50+ services?',
    expectedFocus: 'Consumer contract generation (pact file), Pact Broker, Provider verification, can-i-deploy CLI, eliminating flaky shared staging environments, fast isolated PR checks.',
    answerSummary: 'Consumer-Driven Contracts allow consumers (Web/Mobile) to define expectations of provider APIs as contract JSON files. Contracts are published to Pact Broker. During provider CI builds, provider runs unit-level tests against consumer contracts without spinning up consumer instances. The pact-broker "can-i-deploy" tool gates deployments, catching breaking API changes in seconds without fragile multi-service staging clusters.',
    bestPractice: 'Integrate pact-broker can-i-deploy into your CI/CD quality gate before triggering canary deployments.',
    pitfallToAvoid: 'Relying exclusively on massive, fragile end-to-end staging environments that break whenever one unrelated service is down.'
  },
  {
    id: 'fmi-api-ratelimit-01',
    technology: 'REST API',
    category: 'API Testing & Automation',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 5,
    topic: 'API Rate Limiting, HTTP 429 & Retry-After Header Testing',
    question: 'How do you design automated tests to validate API rate-limiting policies (e.g. 100 requests per minute per IP), including HTTP 429 Too Many Requests, X-RateLimit headers, and Retry-After backoff headers?',
    expectedFocus: 'Concurrent request burst testing, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, HTTP 429 status code, Retry-After header compliance, exponential backoff.',
    answerSummary: 'Send a burst of concurrent HTTP requests (using CompletableFuture or Promise.all) exceeding the quota threshold. Assert that the first N requests return HTTP 200 with decrementing X-RateLimit-Remaining headers. Assert that request N+1 returns HTTP 429 Too Many Requests with a valid Retry-After header. Then sleep for Retry-After duration and assert that subsequent requests return HTTP 200 again.',
    codeSnippet: `// Validate rate limit with Playwright API request\nconst responses = await Promise.all(\n  Array.from({ length: 105 }).map(() => request.get('/api/v1/search?q=test'))\n);\nconst rateLimited = responses.filter(r => r.status() === 429);\nexpect(rateLimited.length).toBeGreaterThan(0);\nexpect(rateLimited[0].headers()['retry-after']).toBeDefined();`,
    bestPractice: 'Test both IP-based and authenticated user API token rate limits across distinct endpoint tiers.',
    pitfallToAvoid: 'Running unthrottled rate-limit tests in parallel CI pipelines against shared dev servers, which inadvertently blocks teammate test runs.'
  },
  {
    id: 'fmi-mob-webview-01',
    technology: 'Appium',
    category: 'Mobile Automation (Appium)',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 6,
    topic: 'Hybrid App WebView Automation & Context Switching in Appium 2.x',
    question: 'How do you automate a Hybrid Mobile Application in Appium 2.x where a native screen embeds an in-app browser or payment WebView, including context switching and ChromeDriver mapping?',
    expectedFocus: 'driver.getContextHandles(), driver.context("WEBVIEW_com.example"), chromedriverExecutable or appium:chromedriverChromeMappingFile, switching back to NATIVE_APP, mobile web inspector.',
    answerSummary: 'In hybrid apps, elements inside a WebView are inaccessible via NATIVE_APP locators. 1) Call driver.getContextHandles() to retrieve available contexts. 2) Switch context using driver.context("WEBVIEW_com.example"). 3) Interact with elements using standard CSS/XPath web locators. 4) Switch back to native using driver.context("NATIVE_APP") to continue native mobile actions.',
    codeSnippet: `// Appium Java WebView Context Switch\nSet<String> contexts = driver.getContextHandles();\nfor (String context : contexts) {\n  if (context.contains("WEBVIEW")) {\n    driver.context(context);\n    break;\n  }\n}\ndriver.findElement(By.cssSelector("#card-number")).sendKeys("4242424242424242");\ndriver.context("NATIVE_APP"); // Return to native context`,
    bestPractice: 'Configure chromedriverAutodownload=true in Appium 2.x UiAutomator2Options to prevent Chrome version mismatch errors.',
    pitfallToAvoid: 'Trying to inspect WebView internal DOM elements using UiAutomator2 native locators, which results in NoSuchElementException.'
  },
  {
    id: 'fmi-mob-biometrics-01',
    technology: 'Appium',
    category: 'Mobile Automation (Appium)',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Biometric Authentication (FaceID / Fingerprint) Mocking in iOS and Android',
    question: 'How do you automate biometric login (FaceID on iOS and BiometricPrompt on Android) across emulators and simulators in an automated Appium mobile test suite?',
    expectedFocus: 'iOS: driver.executeScript("mobile: enrollBiometric", Map.of("isEnabled", true)) and "mobile: sendBiometricMatch", Android: driver.fingerPrint(fingerprintId), handling permission prompts and biometric failure fallbacks.',
    answerSummary: 'On iOS simulators: use executeScript("mobile: enrollBiometric", Map.of("isEnabled", true)) to simulate enrolled FaceID, then call executeScript("mobile: sendBiometricMatch", Map.of("type", "faceId", "match", true)) to simulate successful match (or match: false for failed attempt). On Android emulators: call driver.fingerPrint(1) to simulate enrolled fingerprint sensor trigger.',
    codeSnippet: `// iOS FaceID Match in Appium\ndriver.executeScript("mobile: enrollBiometric", Map.of("isEnabled", true));\ndriver.findElement(AppiumBy.accessibilityId("BiometricLoginBtn")).click();\ndriver.executeScript("mobile: sendBiometricMatch", Map.of("type", "faceId", "match", true));\n// Android Fingerprint Match\n// ((AndroidDriver) driver).fingerPrint(1);`,
    bestPractice: 'Test both biometric success and fallback passcode paths (e.g. when FaceID fails 3 times, verify passcode pin pad opens).',
    pitfallToAvoid: 'Hardcoding real physical biometric authentication tests in automated regression runs without mocking APIs.'
  },
  {
    id: 'fmi-mob-crash-01',
    technology: 'Mobile QA',
    category: 'Mobile Manual Testing (Android & iOS)',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 2,
    topic: 'Mobile ANR (Application Not Responding) & Logcat Triage',
    question: 'What is an ANR (Application Not Responding) error on Android? How do you extract and diagnose ANR traces using ADB Logcat, and how do you differentiate an ANR from an app crash?',
    expectedFocus: 'Main thread (UI thread) blocked for > 5 seconds, broadcast receiver > 10s. Difference: Crash exits immediately (uncaught exception), ANR shows system dialog "App isn\'t responding". Pulling /data/anr/traces.txt using adb bugreport or adb logcat.',
    answerSummary: 'An ANR occurs when an Android app freezes the main UI thread for longer than 5 seconds (e.g. performing heavy database queries or network calls on main thread). A crash terminates the app immediately with an uncaught exception stack trace. To diagnose: run "adb logcat -v time *:E" or pull traces using "adb pull /data/anr/traces.txt" to identify which method locked the main thread.',
    bestPractice: 'Filter Logcat by package name and error tag to avoid getting lost in thousands of system log lines: adb logcat --pid=$(adb shell pidof -s com.example.app).',
    pitfallToAvoid: 'Submitting a bug ticket stating "app is stuck" without attaching Logcat traces, device OS version, and memory usage details.'
  },
  {
    id: 'fmi-mob-deeplink-01',
    technology: 'Mobile QA',
    category: 'Mobile Manual Testing (Android & iOS)',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 5,
    topic: 'Deep Links & Universal Links End-to-End Validation',
    question: 'How do you test Deep Links (custom URL schemes) and Universal Links / Android App Links across both fresh install, existing installed app, and browser fallback scenarios?',
    expectedFocus: 'Testing 3 states: 1) App installed and closed, 2) App installed in background, 3) App not installed (App Store / Play Store fallback). Testing parameters (UTM tags, auth tokens). ADB command: adb shell am start -W -a android.intent.action.VIEW -d "scheme://path".',
    answerSummary: 'Test across 3 user states: 1) App Installed & Terminated: verify tapping link launches app and navigates directly to the target product screen. 2) App in Background: verify onNewIntent handles URL parameters without resetting state. 3) App Not Installed: verify deferred deep link routes user to App Store, and after installation, restores original deep link context. Use ADB: adb shell am start -W -a android.intent.action.VIEW -d "myapp://products/123".',
    bestPractice: 'Verify that deep links containing user-specific tokens expire gracefully and redirect unauthenticated users to login before navigating to target screen.',
    pitfallToAvoid: 'Testing only inside the simulator browser and forgetting to test links opened from third-party apps like Slack, WhatsApp, or Gmail.'
  },
  {
    id: 'fmi-cicd-matrix-01',
    technology: 'GitHub Actions',
    category: 'CI/CD Pipelines',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 6,
    topic: 'GitHub Actions Dynamic Matrix Sharding & Playwright Blob Reports',
    question: 'How do you configure GitHub Actions matrix strategy to shard a Playwright suite across 4 parallel Linux runners, merge individual shard blob reports, and upload a single unified HTML dashboard to GitHub Pages or S3?',
    expectedFocus: 'strategy.matrix.shard: [1/4, 2/4, 3/4, 4/4], npx playwright test --shard=\${{ matrix.shard }}, reporter: "blob", merge-reports command (npx playwright merge-reports), uploading unified HTML artifact.',
    answerSummary: '1) Run matrix jobs: configure matrix: { shard: [1/4, 2/4, 3/4, 4/4] } with playwright test --shard=\${{ matrix.shard }}. Set reporter: [["blob"]] to write test results to blob files. 2) Upload blob artifacts: actions/upload-artifact with path: blob-report/*. 3) Consolidation job: runs on needs: [test], downloads all blob artifacts into all-blob-reports/, and runs "npx playwright merge-reports --reporter html ./all-blob-reports".',
    codeSnippet: `// GitHub Actions Sharding Job\njobs:\n  test:\n    strategy:\n      matrix:\n        shard: [1/4, 2/4, 3/4, 4/4]\n    steps:\n      - run: npx playwright test --shard=\${{ matrix.shard }}\n        env: { CI: true }\n      - uses: actions/upload-artifact@v4\n        with: { name: blob-report-\${{ strategy.job-index }}, path: blob-report/ }`,
    bestPractice: 'Use fail-fast: false in matrix strategy so one failing test in shard 1 does not cancel the test runs of shards 2, 3, and 4.',
    pitfallToAvoid: 'Attempting to generate standard HTML reports inside individual matrix shards and ending up with 4 disjointed reports.'
  },
  {
    id: 'fmi-cicd-testcontainers-01',
    technology: 'Testcontainers',
    category: 'CI/CD Pipelines',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Ephemeral Test Environments using Testcontainers in CI/CD',
    question: 'How do you use Testcontainers (Java/TypeScript/Python) to spin up ephemeral, production-identical database (PostgreSQL) and message broker (Kafka) instances during automated integration tests in CI pipelines?',
    expectedFocus: 'Docker container lifecycle managed by test runner (@Container / GenericContainer), dynamic port mapping (getMappedPort), schema migrations (Flyway/Liquibase), teardown on completion, eliminating shared database conflicts in CI.',
    answerSummary: 'Testcontainers manages Docker containers directly from code. When test suite launches, Testcontainers pulls official Docker images (PostgreSQL, Kafka), starts containers on random ephemeral host ports, runs schema migrations via Flyway, and injects dynamic connection strings into test configuration. When test process finishes, Testcontainers Ryuk daemon kills all containers, leaving zero lingering state.',
    bestPractice: 'Use reusable containers (.withReuse(true)) in local development for sub-second startup times while keeping CI containers strictly ephemeral.',
    pitfallToAvoid: 'Hardcoding static database ports (e.g. 5432) in CI integration tests, which causes port bind collisions when parallel workers run on the same CI agent.'
  },
  {
    id: 'fmi-rep-allure-01',
    technology: 'Allure Report',
    category: 'Reporting',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 2,
    topic: 'Allure Metadata Annotations & Visual Evidence Attachments',
    question: 'In Allure Reporting, how do you categorize tests by feature and story, attach failure screenshots or network logs, and configure severity levels (Blocker, Critical, Normal)?',
    expectedFocus: '@Feature, @Story, @Severity, @Step annotations, Allure.addAttachment("Screenshot", bytes), allure-results directory, generating interactive HTML report with allure generate.',
    answerSummary: 'Annotate test methods with @Feature("User Authentication"), @Story("Password Reset"), and @Severity(SeverityLevel.CRITICAL). Inside test steps or afterEach failure hooks, attach visual artifacts using Allure.addAttachment("Failure Screenshot", new ByteArrayInputStream(screenshotBytes)). Run "allure generate allure-results --clean -o allure-report" to build the interactive HTML report.',
    codeSnippet: `// Allure Annotations in TestNG / JUnit\n@Test\n@Feature("Payment Gateway")\n@Story("Stripe 3DS Verification")\n@Severity(SeverityLevel.BLOCKER)\npublic void testStripeThreeDS() {\n  Allure.step("Initiate payment with 3DS card", () -> { ... });\n}`,
    bestPractice: 'Attach both failure screenshots and network HAR or console logs to give developers instant context without needing to reproduce locally.',
    pitfallToAvoid: 'Attaching massive video files for every passing test, which balloons CI artifact storage to hundreds of gigabytes.'
  },
  {
    id: 'fmi-rep-slack-01',
    technology: 'Slack / Teams Webhooks',
    category: 'Reporting',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 5,
    topic: 'Automated CI Test Failure Notifications & Slack Bot Triage',
    question: 'How do you design an automated CI test listener that sends structured Slack or Microsoft Teams webhook alerts when master pipeline regression tests fail, including failure diffs, author mentions, and direct links to reports?',
    expectedFocus: 'Incoming Webhooks, Block Kit / Adaptive Cards, parsing test runner failure summary, extracting Git commit author from CI environment variables, linking directly to Allure or Playwright HTML artifacts.',
    answerSummary: 'Implement a test runner listener (e.g. Playwright custom reporter or TestNG ITestListener) that executes on test run completion. If failureCount > 0, format a Slack Block Kit payload containing: 1) Job status badge (red), 2) Pass rate percentage and failure count, 3) Top 3 failing spec names with error messages, 4) Git commit SHA, branch, and author mention, 5) One-click button linking to the hosted HTML report.',
    bestPractice: 'Route notifications intelligently: only notify public engineering channels on main branch failures; route PR branch failures directly to the PR author.',
    pitfallToAvoid: 'Spamming the main developer channel with alert messages on every passing build, which trains developers to mute the channel.'
  },
  {
    id: 'fmi-dsa-sliding-01',
    technology: 'Algorithms',
    category: 'Coding & DSA',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 6,
    topic: 'Sliding Window: Longest Substring Without Repeating Characters',
    question: 'In automation log analysis, you need to find the length of the longest contiguous sub-sequence of unique log event tokens. Solve the Longest Substring Without Repeating Characters problem with optimal time and space complexity.',
    expectedFocus: 'Sliding window technique with two pointers (left, right), Set or Map storing character -> last seen index, O(N) time complexity, O(min(N, M)) space complexity.',
    answerSummary: 'Use a sliding window with two pointers (left and right) and a HashMap mapping character -> last seen index. As right pointer expands across the string, if s[right] exists in the map and its index >= left, jump left to map.get(s[right]) + 1. Update max length as right - left + 1, and update map. Time: O(N) single pass, Space: O(min(N, alphabet size)).',
    codeSnippet: `function lengthOfLongestSubstring(s: string): number {\n  const map = new Map<string, number>();\n  let maxLen = 0, left = 0;\n  for (let right = 0; right < s.length; right++) {\n    const char = s[right];\n    if (map.has(char) && map.get(char)! >= left) {\n      left = map.get(char)! + 1;\n    }\n    map.set(char, right);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}`,
    bestPractice: 'Store the last seen index in a Map to jump the left pointer forward in O(1) rather than sliding one step at a time.',
    pitfallToAvoid: 'Using nested loops to check all substrings, which degrades to O(N^3) time complexity.'
  },
  {
    id: 'fmi-dsa-concurrency-01',
    technology: 'Java Concurrency',
    category: 'Coding & DSA',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 9,
    topic: 'Thread-Safe Singleton with Double-Checked Locking in Automation',
    question: 'Why is standard Singleton implementation dangerous in multi-threaded parallel test execution? How do you implement a thread-safe Singleton using Double-Checked Locking with volatile keyword in Java?',
    expectedFocus: 'Thread collision during lazy instantiation, synchronized performance overhead, Double-Checked Locking (DCL), volatile keyword preventing instruction reordering by JVM/CPU, memory visibility.',
    answerSummary: 'Without synchronization, two parallel test threads checking instance == null simultaneously will create two distinct objects. Synchronizing the entire getInstance() method creates an execution bottleneck. Double-Checked Locking checks instance == null twice: once outside synchronized block (for fast path) and once inside synchronized block. The instance variable MUST be declared "volatile" to prevent CPU instruction reordering.',
    codeSnippet: `public class TestConfigManager {\n  private static volatile TestConfigManager instance;\n  private TestConfigManager() { /* load configs */ }\n  \n  public static TestConfigManager getInstance() {\n    if (instance == null) {\n      synchronized (TestConfigManager.class) {\n        if (instance == null) {\n          instance = new TestConfigManager();\n        }\n      }\n    }\n    return instance;\n  }\n}`,
    bestPractice: 'Declare the singleton field as volatile so other threads see the fully initialized object immediately across CPU cache lines.',
    pitfallToAvoid: 'Omitting the volatile keyword with Double-Checked Locking, which can expose a partially initialized object reference to other threads.'
  },
  // ==========================================
  // CANDIDATE TECH STACK & SKILLS SPECIALIZATION BANK
  // ==========================================
  {
    id: 'sel-stale-elem-01',
    technology: 'Selenium',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 8,
    topic: 'Handling StaleElementReferenceException in Dynamic Single Page Apps',
    question: 'What causes StaleElementReferenceException in Selenium WebDriver, and what architectural strategies eliminate it in dynamic Single Page Applications (SPAs)?',
    expectedFocus: 'DOM re-rendering, detached element node, Page Object re-lookup, FluentWait ignoring StaleElementReferenceException, dynamic By locators vs cached WebElement.',
    answerSummary: 'A StaleElementReferenceException occurs when an element found earlier is no longer attached to the current DOM because JavaScript/React re-rendered or destroyed the node. Solutions: Avoid caching WebElements as class fields; store By locators and resolve dynamically. Use WebDriverWait with ExpectedConditions.refreshed() or FluentWait ignoring StaleElementReferenceException.class.',
    codeSnippet: `// Dynamic retry with FluentWait ignoring StaleElementReferenceException\nWait<WebDriver> wait = new FluentWait<>(driver)\n    .withTimeout(Duration.ofSeconds(10))\n    .pollingEvery(Duration.ofMillis(300))\n    .ignoring(StaleElementReferenceException.class);\n\nWebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("submit-order")));\nsubmitBtn.click();`,
    bestPractice: 'Store locators as By objects or page factory proxies rather than storing long-lived WebElement instances across UI state transitions.',
    pitfallToAvoid: 'Wrapping the entire test step in a blunt try-catch block with Thread.sleep(3000) instead of using fluent explicit retry conditions.'
  },
  {
    id: 'sel-bidi-cdp-01',
    technology: 'Selenium',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 6,
    maxYears: 12,
    topic: 'Selenium 4 BiDi & Chrome DevTools Protocol (CDP) Network Logging',
    question: 'How does Selenium 4 leverage the Chrome DevTools Protocol (CDP) and BiDirectional (BiDi) APIs to inspect network requests, capture console errors, and simulate network throttling?',
    expectedFocus: 'DevTools session, Network.enable, listening for Network.requestWillBeSent and Network.responseReceived, Emulation.setDeviceMetricsOverride, BiDi standard vs CDP.',
    answerSummary: 'Selenium 4 introduces native DevTools integration via driver.getDevTools(). You create a DevTools session, send Network.enable(), and register listeners on Network.requestWillBeSent and Network.responseReceived to capture API calls and status codes. You can also listen to Log.entryAdded to capture console JavaScript errors or simulate offline conditions using Network.emulateNetworkConditions().',
    codeSnippet: `DevTools devTools = ((ChromeDriver) driver).getDevTools();\ndevTools.createSession();\ndevTools.send(Network.enable(Optional.empty(), Optional.empty(), Optional.empty()));\n\ndevTools.addListener(Network.responseReceived(), response -> {\n    Response res = response.getResponse();\n    if (res.getStatus() >= 400) {\n        System.err.println("API Failure: " + res.getUrl() + " Code: " + res.getStatus());\n    }\n});`,
    bestPractice: 'Close or clear DevTools listeners between tests to prevent memory leaks and thread collisions during parallel execution.',
    pitfallToAvoid: 'Relying exclusively on third-party proxies (e.g. BrowserMob) for simple network inspection when native Selenium 4 CDP/BiDi provides zero-proxy capture.'
  },
  {
    id: 'rest-specbuilders-01',
    technology: 'REST Assured',
    category: 'API Testing & Automation',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 7,
    topic: 'Enterprise RequestSpecBuilder & ResponseSpecBuilder Configuration',
    question: 'How do you design a reusable API testing harness using REST Assured RequestSpecBuilder and ResponseSpecBuilder across multi-stage environments (dev, staging, prod)?',
    expectedFocus: 'RequestSpecBuilder, ResponseSpecBuilder, RequestSpecification, ResponseSpecification, baseUri, headers, log filter, response time assertion, contentType.',
    answerSummary: 'Use RequestSpecBuilder to define common base URI, base path, standard headers (Authorization Bearer, Content-Type, Accept), and logging filters once. Use ResponseSpecBuilder to define baseline assertions (e.g., response time under 2000ms, Content-Type JSON). Pass these specifications into RestAssured.given().spec(reqSpec).then().spec(resSpec).',
    codeSnippet: `RequestSpecification reqSpec = new RequestSpecBuilder()\n    .setBaseUri("https://api.staging.company.com")\n    .setBasePath("/api/v2")\n    .addHeader("Authorization", "Bearer " + getAuthToken())\n    .setContentType(ContentType.JSON)\n    .addFilter(new AllureRestAssured())\n    .build();\n\nResponseSpecification resSpec = new ResponseSpecBuilder()\n    .expectContentType(ContentType.JSON)\n    .expectResponseTime(Matchers.lessThan(2500L))\n    .build();\n\nRestAssured.given().spec(reqSpec)\n    .when().get("/users/me")\n    .then().spec(resSpec).statusCode(200);`,
    bestPractice: 'Centralize environment config URLs and global specs in a BaseApiTest class so individual test methods remain clean, declarative, and DRY.',
    pitfallToAvoid: 'Hardcoding base URIs, auth tokens, and repetitive header setups in every single @Test method.'
  },
  {
    id: 'rest-filters-allure-01',
    technology: 'REST Assured',
    category: 'API Testing & Automation',
    difficulty: 'Hard',
    experienceLevel: '6-9 Years',
    minYears: 5,
    maxYears: 10,
    topic: 'REST Assured Custom Filters for Allure Logging & Sensitive Data Masking',
    question: 'How do you implement a custom REST Assured Filter to automatically capture HTTP request/response payloads in reports while masking sensitive fields (passwords, tokens, credit card numbers)?',
    expectedFocus: 'Filter interface, filter(FilterableRequestSpecification, FilterableResponseSpecification, FilterContext), ctx.next(req, res), masking regex, Allure attachment.',
    answerSummary: 'Implement the io.restassured.filter.Filter interface. In the filter method, intercept request parameters, headers, and body. Use regex or Jackson to mask sensitive keys (e.g. "password": "***", "Authorization": "Bearer ***"). Call ctx.next(req, res) to execute the HTTP call, then log the sanitized request and response as an attachment in Allure or your reporting engine.',
    codeSnippet: `public class SecurityMaskingFilter implements Filter {\n  @Override\n  public Response filter(FilterableRequestSpecification req, FilterableResponseSpecification res, FilterContext ctx) {\n    String sanitizedBody = maskSensitiveFields(req.getBody());\n    // Log sanitized body to test report\n    Response response = ctx.next(req, res);\n    // Log response status and headers\n    return response;\n  }\n  private String maskSensitiveFields(Object body) {\n    if (body == null) return "";\n    return body.toString().replaceAll("(?i)(\"password\"\\s*:\\s*\")[^\"]+(\")", "$1********$2");\n  }\n}`,
    bestPractice: 'Apply the masking filter globally using RestAssured.filters(new SecurityMaskingFilter()) so developers cannot inadvertently leak credentials in CI logs.',
    pitfallToAvoid: 'Printing raw un-sanitized API logs containing production-like customer PII or API secrets in publicly accessible CI console logs.'
  },
  {
    id: 'rest-pojo-jackson-01',
    technology: 'REST Assured',
    category: 'API Testing & Automation',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 2,
    maxYears: 6,
    topic: 'POJO Serialization & Deserialization with Jackson and Lombok',
    question: 'How do you structure payload serialization and deserialization in REST Assured using Jackson POJOs, Lombok Builder, and @JsonIgnoreProperties?',
    expectedFocus: 'ObjectMapper, Lombok @Data @Builder @Jacksonized, @JsonIgnoreProperties(ignoreUnknown = true), extract().as(UserResponse.class), type-safe assertions.',
    answerSummary: 'Create strongly typed Java POJOs annotated with Lombok (@Data, @Builder, @Jacksonized) to build test request payloads cleanly. Annotate response POJOs with @JsonIgnoreProperties(ignoreUnknown = true) so non-breaking API schema additions do not break existing test runs. Deserialize HTTP responses directly with .extract().as(UserResponse.class) for type-safe assertions.',
    codeSnippet: `@Data\n@Builder\n@Jacksonized\n@JsonIgnoreProperties(ignoreUnknown = true)\npublic class CreateUserRequest {\n    private String email;\n    private String role;\n    private List<String> permissions;\n}\n\nCreateUserRequest payload = CreateUserRequest.builder()\n    .email("qa-lead@test.com")\n    .role("ADMIN")\n    .permissions(List.of("READ", "WRITE"))\n    .build();\n\nUserResponse created = RestAssured.given()\n    .body(payload)\n    .when().post("/api/users")\n    .then().statusCode(201)\n    .extract().as(UserResponse.class);\n\nassertThat(created.getId()).isNotNull();`,
    bestPractice: 'Use strongly typed POJOs rather than raw JSON strings or HashMaps to enable compile-time checking of API payload schemas.',
    pitfallToAvoid: 'Omitting ignoreUnknown = true on response POJOs, causing UnrecognizedPropertyException whenever the backend team adds an optional field.'
  },
  {
    id: 'cyp-intercept-01',
    technology: 'Cypress',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 7,
    topic: 'cy.intercept() Route Stubbing, Spying, and Dynamic Responses',
    question: 'How do you use cy.intercept() in Cypress to mock API error responses (500 Internal Server Error) and assert on UI error states without depending on live backend APIs?',
    expectedFocus: 'cy.intercept() syntax, method and URL matching, route aliases (as("apiCall")), cy.wait("@apiCall"), statusCode and body mocking, req.reply().',
    answerSummary: 'Use cy.intercept() to intercept outbound XHR/Fetch requests. Define route matching (method and URL glob) and supply a mock response with statusCode 500 and an error payload. Assign an alias using .as("getCartError"). Trigger the UI action, wait for the route using cy.wait("@getCartError"), and assert that the application displays the corresponding user-friendly error banner.',
    codeSnippet: `it('displays error banner when cart API fails', () => {\n  cy.intercept('GET', '/api/v1/cart', {\n    statusCode: 500,\n    body: { error: 'Internal Server Error', code: 'CART_DOWN' },\n    delay: 200,\n  }).as('getCartFail');\n\n  cy.visit('/checkout');\n  cy.wait('@getCartFail');\n  cy.get('[data-testid="error-alert"]')\n    .should('be.visible')\n    .and('contain.text', 'Unable to load cart. Please try again.');\n});`,
    bestPractice: 'Always alias intercepted requests (.as("routeAlias")) and explicitly cy.wait("@routeAlias") before asserting UI states to avoid race conditions.',
    pitfallToAvoid: 'Setting up cy.intercept() after the page action has already been triggered, causing Cypress to miss the outbound network request.'
  },
  {
    id: 'py-pytest-fixtures-01',
    technology: 'Python',
    category: 'Selenium & Playwright Automation',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 7,
    topic: 'Pytest Fixtures with Yield Teardown and Scoping in Test Frameworks',
    question: 'How do Pytest fixtures with yield statements work for browser lifecycle setup and teardown, and what are the practical trade-offs between function, module, and session scopes?',
    expectedFocus: 'pytest.fixture decorator, yield for cleanup, scope="function" vs scope="session", autouse fixtures, conftest.py, browser context isolation.',
    answerSummary: 'In Pytest, code before the yield keyword runs as setup (e.g. launching browser, creating context, navigating), and code after yield runs as teardown (closing context, saving screenshots on failure, stopping video). Function scope ensures fresh state per test (highest isolation). Session scope shares an expensive resource (e.g. browser binary or database container) across all tests, but tests must avoid polluting shared state.',
    codeSnippet: `import pytest\nfrom playwright.sync_api import sync_playwright\n\n@pytest.fixture(scope="session")\ndef browser():\n    with sync_playwright() as p:\n        browser = p.chromium.launch(headless=True)\n        yield browser\n        browser.close()\n\n@pytest.fixture(scope="function")\ndef page(browser):\n    context = browser.new_context()\n    page = context.new_page()\n    yield page\n    page.close()\n    context.close()`,
    bestPractice: 'Share the browser instance at session scope, but isolate browser contexts and pages at function scope to balance performance with test purity.',
    pitfallToAvoid: 'Using session-scoped pages where tests share cookies, local storage, and open tabs, leading to state pollution and order-dependent test failures.'
  },
  {
    id: 'appium-contexts-01',
    technology: 'Appium',
    category: 'Mobile Automation (Appium)',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 3,
    maxYears: 8,
    topic: 'Context Switching Between NATIVE_APP and WEBVIEW in Hybrid Mobile Apps',
    question: 'How do you automate a hybrid mobile app in Appium that transitions from a native screen into an embedded WebView (e.g. payment gateway or terms page)?',
    expectedFocus: 'driver.getContextHandles(), driver.context("WEBVIEW_..."), ChromeDriver executable mapping, switching back to NATIVE_APP, handling async context availability.',
    answerSummary: 'In Appium, query available contexts via driver.getContextHandles(). When transitioning into a hybrid screen, poll until a context starting with "WEBVIEW_" appears. Call driver.context(webViewContext) to switch execution into the embedded Chromium/Safari engine. Use standard web locators (CSS/XPath) inside the WebView, and explicitly switch back via driver.context("NATIVE_APP") upon completion.',
    codeSnippet: `// Switch from Native App to WebView\nWebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));\nwait.until(d -> driver.getContextHandles().size() > 1);\n\nSet<String> contexts = driver.getContextHandles();\nfor (String contextName : contexts) {\n    if (contextName.contains("WEBVIEW")) {\n        driver.context(contextName);\n        break;\n    }\n}\n// Execute web interactions inside the WebView\ndriver.findElement(By.cssSelector("button#pay-now")).click();\n\n// Switch back to Native App context\ndriver.context("NATIVE_APP");`,
    bestPractice: 'Ensure the mobile app has setWebContentsDebuggingEnabled(true) enabled on Android; otherwise WebViews cannot be detected by Appium.',
    pitfallToAvoid: 'Attempting to inspect WebView DOM elements while still in the NATIVE_APP context, resulting in NoSuchElementException.'
  },
  {
    id: 'man-bva-ep-coupon-01',
    technology: 'Manual QA',
    category: 'Manual QA Processes',
    difficulty: 'Easy',
    experienceLevel: '0-2 Years',
    minYears: 0,
    maxYears: 3,
    topic: 'Exhaustive Test Design using Boundary Value Analysis & Equivalence Partitioning',
    question: 'A discount coupon applies 20% off only for cart totals between $50.00 and $250.00 (inclusive). How do you derive the exact Equivalence Classes and Boundary Values for this business rule?',
    expectedFocus: 'Equivalence classes: Valid ($50-$250), Invalid Low (<$50), Invalid High (>$250), Non-numeric/Negative. Boundaries: $49.99, $50.00, $50.01, $249.99, $250.00, $250.01.',
    answerSummary: 'Equivalence Partitioning splits values into: (1) Valid Range: $50.00 to $250.00; (2) Invalid Low: $0.00 to $49.99; (3) Invalid High: $250.01 and above; (4) Edge/Invalid: Negative amounts and non-numeric strings. Boundary Value Analysis tests: Lower boundaries: $49.99 (no discount), $50.00 (discount applies), $50.01 (discount applies). Upper boundaries: $249.99 (discount applies), $250.00 (discount applies), $250.01 (no discount).',
    bestPractice: 'Test values immediately below, on, and immediately above each boundary point to catch off-by-one errors in condition expressions (e.g. > vs >=).',
    pitfallToAvoid: 'Testing only arbitrary numbers in the middle of a range (e.g. $100) while failing to test the critical boundary transition points.'
  },
  {
    id: 'man-defect-triage-01',
    technology: 'Manual QA',
    category: 'Manual QA Processes',
    difficulty: 'Medium',
    experienceLevel: '3-5 Years',
    minYears: 2,
    maxYears: 6,
    topic: 'Defect Severity vs Priority Escalation and Bug Triage Decision Making',
    question: 'Explain the difference between Defect Severity and Defect Priority. Provide concrete examples of: (1) High Severity with Low Priority, and (2) Low Severity with High Priority. How are these triaged before a major release?',
    expectedFocus: 'Severity = technical/system impact; Priority = business urgency. High Sev / Low Pri: Crash in obscure legacy export on rare OS. Low Sev / High Pri: Company logo broken or typo on public landing page during marketing campaign.',
    answerSummary: 'Severity measures the technical impact of the defect on system operation (Blocker, Critical, Major, Minor). Priority measures business urgency and how quickly the defect must be fixed (P1 Urgent, P2 High, P3 Medium, P4 Low). Example 1 (High Sev, Low Pri): System crashes with NullPointerException when exporting 100,000 records on an obsolete Windows 7 browser used by <0.01% of users. Example 2 (Low Sev, High Pri): Misspelled company brand name or broken logo on the homepage checkout button before Super Bowl campaign. In triage, Product, QA, and Engineering align on target fix milestones.',
    bestPractice: 'Use a clear Defect Triage Matrix agreed upon across Engineering, QA, and Product Management to avoid subjective priority arguments.',
    pitfallToAvoid: 'Letting QA mark every bug as P1/Blocker, which triggers triage fatigue and obscures true release-blocking incidents.'
  }
];

/**
 * Helper to match difficulty values flexibly across standard and legacy tiers.
 */
function matchesDifficulty(qDiff: string, target: 'Easy' | 'Medium' | 'Hard'): boolean {
  const normQ = (qDiff || '').toLowerCase();
  if (target === 'Easy') {
    return normQ === 'easy' || normQ === 'junior';
  }
  if (target === 'Hard') {
    return normQ === 'hard' || normQ === 'senior' || normQ === 'architect';
  }
  return normQ === 'medium' || normQ === 'mid';
}

/**
 * Filter questions by difficulty ('Easy' | 'Medium' | 'Hard') and experience tier ('0-2 Years' | '3-5 Years' | '6-9 Years' | '10+ Years') or experience years.
 * Ensures random sampling across diverse categories so an interview touches multiple domains.
 */
/**
 * Helper to compute relevance score of a question against candidate's selected skills.
 */
function computeSkillRelevance(q: InterviewQuestionItem, skills: string[]): number {
  if (!skills || skills.length === 0) return 0;
  let score = 0;
  const qTech = (q.technology || '').toLowerCase();
  const qCat = (q.category || '').toLowerCase();
  const qTopic = (q.topic || '').toLowerCase();
  const qQuestion = (q.question || '').toLowerCase();
  const qFocus = (q.expectedFocus || '').toLowerCase();
  const qSnippet = (q.codeSnippet || '').toLowerCase();
  const combined = `${qTech} ${qCat} ${qTopic} ${qQuestion} ${qFocus} ${qSnippet}`;

  for (const rawSkill of skills) {
    const s = rawSkill.toLowerCase().trim();
    if (!s) continue;

    // Exact or strong tech match
    if (qTech === s) {
      score += 30;
    } else if (qTech.includes(s) || s.includes(qTech)) {
      score += 20;
    }

    // Technology synonyms & aliases
    if (s.includes('selenium') && (combined.includes('selenium') || combined.includes('webdriver'))) score += 25;
    if (s.includes('playwright') && (combined.includes('playwright') || combined.includes('page.route') || combined.includes('getbyrole') || combined.includes('storagestate'))) score += 25;
    if (s.includes('rest assured') || s.includes('restassured')) {
      if (combined.includes('rest assured') || combined.includes('restassured') || combined.includes('requestspec') || combined.includes('given()') || qTech === 'rest api' || qTech === 'api testing') score += 25;
    }
    if (s.includes('cypress') && (combined.includes('cypress') || combined.includes('cy.intercept'))) score += 25;
    if (s.includes('appium') && (combined.includes('appium') || combined.includes('mobile') || combined.includes('uiautomator'))) score += 25;
    if (s.includes('manual') && (combined.includes('manual') || combined.includes('boundary value') || combined.includes('equivalence') || combined.includes('defect') || combined.includes('triage') || combined.includes('test case'))) score += 25;
    if (s.includes('java') && (combined.includes('java') || qTech === 'java' || combined.includes('threadlocal') || combined.includes('virtual thread'))) score += 18;
    if (s.includes('python') && (combined.includes('python') || combined.includes('pytest'))) score += 25;
    if (s.includes('typescript') && (combined.includes('typescript') || combined.includes('ts'))) score += 18;
    if (s.includes('ci/cd') && (combined.includes('ci/cd') || combined.includes('github actions') || combined.includes('pipeline') || combined.includes('sharding'))) score += 20;
    if (s.includes('postman') && (combined.includes('postman') || combined.includes('newman'))) score += 20;
    if (s.includes('performance') && (combined.includes('performance') || combined.includes('k6') || combined.includes('jmeter'))) score += 20;
    if (s.includes('pact') && (combined.includes('pact') || combined.includes('contract'))) score += 25;

    if (combined.includes(s)) {
      score += 10;
    }
  }

  return score;
}

/**
 * Filter questions by difficulty ('Easy' | 'Medium' | 'Hard') and experience tier ('0-2 Years' | '3-5 Years' | '6-9 Years' | '10+ Years') or experience years.
 * Ensures random sampling across diverse categories so an interview touches multiple domains.
 */
export function getQuestionsByLevelAndDifficulty(options: {
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  experienceYears?: number;
  experienceTier?: '0-2 Years' | '3-5 Years' | '6-9 Years' | '10+ Years' | string;
  count?: number;
  track?: string;
  skills?: string[];
}): InterviewQuestionItem[] {
  const {
    difficulty = 'Medium',
    experienceYears,
    experienceTier,
    count = 3,
    track,
    skills = [],
  } = options;

  // Determine target tier
  let targetTier: InterviewExperienceTier = '3-5 Years';
  if (experienceTier && ['0-2 Years', '3-5 Years', '6-9 Years', '10+ Years'].includes(experienceTier)) {
    targetTier = experienceTier as InterviewExperienceTier;
  } else if (typeof experienceYears === 'number' && !isNaN(experienceYears)) {
    targetTier = mapYearsToExperienceTier(experienceYears);
  }

  // Normalize difficulty
  let targetDiff: 'Easy' | 'Medium' | 'Hard' = 'Medium';
  const normDiff = (difficulty || '').toLowerCase();
  if (normDiff.includes('easy') || normDiff.includes('junior')) {
    targetDiff = 'Easy';
  } else if (normDiff.includes('hard') || normDiff.includes('senior') || normDiff.includes('architect')) {
    targetDiff = 'Hard';
  } else {
    targetDiff = 'Medium';
  }

  // 1. Exact match by difficulty AND experience tier
  let matches = INTERVIEW_KNOWLEDGE_BASE.filter(
    q => matchesDifficulty(q.difficulty, targetDiff) && q.experienceLevel === targetTier
  );

  // 2. If insufficient exact matches, include tier matches then difficulty matches
  if (matches.length < count) {
    const tierMatches = INTERVIEW_KNOWLEDGE_BASE.filter(q => q.experienceLevel === targetTier);
    const diffMatches = INTERVIEW_KNOWLEDGE_BASE.filter(q => matchesDifficulty(q.difficulty, targetDiff));
    const combined = [...matches, ...tierMatches, ...diffMatches];
    // Deduplicate by id
    const seen = new Set<string>();
    matches = combined.filter(q => {
      if (seen.has(q.id)) return false;
      seen.add(q.id);
      return true;
    });
  }

  // 3. Fallback to all questions if still empty
  if (matches.length === 0) {
    matches = [...INTERVIEW_KNOWLEDGE_BASE];
  }

  const hasSkills = Array.isArray(skills) && skills.length > 0;
  const normTrack = (track || '').toLowerCase().trim();

  // If candidate selected specific tech stack / skills, prioritize questions directly matching those skills
  if (hasSkills) {
    const scoredMatches = matches.map(q => ({
      q,
      score: computeSkillRelevance(q, skills),
    }));

    // Filter to questions that match at least one selected skill
    const skillRelevant = scoredMatches.filter(item => item.score > 0);

    if (skillRelevant.length >= count) {
      // Sort by score descending with tie-break randomization
      skillRelevant.sort((a, b) => b.score - a.score || Math.random() - 0.5);
      return skillRelevant.slice(0, count).map(item => item.q);
    } else if (skillRelevant.length > 0) {
      // Pick all skill-matching questions first, then fill from general matches
      const picked = skillRelevant.map(item => item.q);
      const remaining = matches.filter(q => !picked.some(p => p.id === q.id));
      remaining.sort(() => Math.random() - 0.5);
      return [...picked, ...remaining.slice(0, count - picked.length)];
    }
  }

  // Shuffle matches randomly, prioritizing track match if specified
  const shuffled = [...matches].sort((a, b) => {
    if (normTrack) {
      const aMatch =
        (a.technology && a.technology.toLowerCase().includes(normTrack)) ||
        (a.category && a.category.toLowerCase().includes(normTrack)) ||
        (a.topic && a.topic.toLowerCase().includes(normTrack)) ||
        (normTrack.includes('automation') && (Boolean(a.category?.includes('Automation')) || a.technology === 'Playwright' || a.technology === 'Selenium'));
      const bMatch =
        (b.technology && b.technology.toLowerCase().includes(normTrack)) ||
        (b.category && b.category.toLowerCase().includes(normTrack)) ||
        (b.topic && b.topic.toLowerCase().includes(normTrack)) ||
        (normTrack.includes('automation') && (Boolean(b.category?.includes('Automation')) || b.technology === 'Playwright' || b.technology === 'Selenium'));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
    }
    return Math.random() - 0.5;
  });

  // Pick questions ensuring diverse categories if possible (unless track is explicitly specified)
  const selected: InterviewQuestionItem[] = [];
  const usedCategories = new Set<string>();

  if (normTrack) {
    for (const q of shuffled) {
      selected.push(q);
      if (selected.length >= count) break;
    }
  } else {
    // Pass 1: Try picking items with unique categories
    for (const q of shuffled) {
      const cat = q.category || 'General';
      if (!usedCategories.has(cat)) {
        selected.push(q);
        usedCategories.add(cat);
        if (selected.length >= count) break;
      }
    }

    // Pass 2: Fill remaining if needed
    if (selected.length < count) {
      for (const q of shuffled) {
        if (!selected.some(s => s.id === q.id)) {
          selected.push(q);
          if (selected.length >= count) break;
        }
      }
    }
  }

  // Guaranteed fallback: If somehow still under count, slice from base knowledge
  if (selected.length < count) {
    for (const q of INTERVIEW_KNOWLEDGE_BASE) {
      if (!selected.some(s => s.id === q.id)) {
        selected.push(q);
        if (selected.length >= count) break;
      }
    }
  }

  return selected.slice(0, count);
}

// Retain legacy questions for backwards compatibility
export const CORE_INTERVIEW_QUESTIONS: InterviewQuestionItem[] = [
  ...INTERVIEW_KNOWLEDGE_BASE,
];

export const CUSTOM_INTERVIEW_QUESTIONS_KEY = 'intelligentqa_custom_interview_questions';
export const DELETED_INTERVIEW_QUESTIONS_KEY = 'intelligentqa_deleted_interview_questions';

export function getStoredCustomInterviewQuestions(): InterviewQuestionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_INTERVIEW_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to parse custom interview questions', e);
    return [];
  }
}

export function getDeletedInterviewQuestionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_INTERVIEW_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveInterviewQuestion(question: InterviewQuestionItem): InterviewQuestionItem {
  const current = getStoredCustomInterviewQuestions();
  const id = question.id || `iq-custom-${Date.now()}`;
  const itemToSave = { ...question, id };

  const existingIdx = current.findIndex(q => q.id === id);
  let updated: InterviewQuestionItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = itemToSave;
  } else {
    updated = [itemToSave, ...current];
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_INTERVIEW_QUESTIONS_KEY, JSON.stringify(updated));
      const deleted = getDeletedInterviewQuestionIds().filter(d => d !== id);
      localStorage.setItem(DELETED_INTERVIEW_QUESTIONS_KEY, JSON.stringify(deleted));
      window.dispatchEvent(new CustomEvent('intelligentqa_interview_questions_changed', { detail: { question: itemToSave } }));
    } catch (e) {
      console.error('Failed to save interview question', e);
    }
  }
  return itemToSave;
}

export function deleteInterviewQuestion(id: string): void {
  const current = getStoredCustomInterviewQuestions();
  const updated = current.filter(q => q.id !== id);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_INTERVIEW_QUESTIONS_KEY, JSON.stringify(updated));
      const deleted = getDeletedInterviewQuestionIds();
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem(DELETED_INTERVIEW_QUESTIONS_KEY, JSON.stringify(deleted));
      }
      window.dispatchEvent(new CustomEvent('intelligentqa_interview_questions_changed', { detail: { id } }));
    } catch (e) {
      console.error('Failed to delete interview question', e);
    }
  }
}

export function getAllInterviewQuestions(): InterviewQuestionItem[] {
  const deletedIds = new Set(getDeletedInterviewQuestionIds());
  const custom = getStoredCustomInterviewQuestions().filter(q => !deletedIds.has(q.id));
  const customIds = new Set(custom.map(q => q.id));
  const base = INTERVIEW_KNOWLEDGE_BASE.filter(q => !deletedIds.has(q.id) && !customIds.has(q.id));
  return [...custom, ...base];
}

export function generateComprehensiveQuestionBank(): InterviewQuestionItem[] {
  return getAllInterviewQuestions();
}

export function resetInterviewQuestions(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CUSTOM_INTERVIEW_QUESTIONS_KEY);
      localStorage.removeItem(DELETED_INTERVIEW_QUESTIONS_KEY);
      window.dispatchEvent(new CustomEvent('intelligentqa_interview_questions_changed', { detail: { reset: true } }));
    } catch (e) {
      console.error('Failed to reset interview questions', e);
    }
  }
}
