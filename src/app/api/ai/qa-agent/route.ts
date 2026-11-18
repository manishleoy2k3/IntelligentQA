import { NextRequest, NextResponse } from 'next/server';
import { validateGeminiKeySyntax, sanitizeGeminiKey } from '@/lib/gemini-validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, input, techStack = 'playwright-ts', options } = body;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    // Strictly require user-provided Gemini API Key to protect server owner tokens
    const rawApiKey = req.headers.get('x-gemini-api-key') || body.apiKey;
    const effectiveApiKey = sanitizeGeminiKey(rawApiKey || '');

    if (!effectiveApiKey) {
      if (action === 'code_snippet') {
        // For learning workspace "Try it with AI", provide instant deterministic code snippet fallback without blocking
        const cleanInput = input.trim();
        const generatedOutput = generateCodeSnippetOnly(cleanInput, techStack);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
        });
      }

      if (action === 'prompt_lab') {
        // For AI Prompt Lab, generate prompt-specific, relevant, complete, and accurate output
        const cleanInput = input.trim();
        const generatedOutput = generatePromptLabOutput(body.promptId || 'master-edge-case-matrix', cleanInput);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
        });
      }

      return NextResponse.json(
        {
          error: 'GEMINI_KEY_REQUIRED',
          message:
            'A personal Google AI Studio Gemini API key is required to use AI features. Please configure your free key under AI Tools and Agents in the left navigation.',
        },
        { status: 403 }
      );
    }

    // Reject garbage / malformed keys immediately
    const syntaxCheck = validateGeminiKeySyntax(effectiveApiKey);
    if (!syntaxCheck.valid) {
      if (action === 'code_snippet') {
        const cleanInput = input.trim();
        const generatedOutput = generateCodeSnippetOnly(cleanInput, techStack);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
        });
      }

      if (action === 'prompt_lab') {
        const cleanInput = input.trim();
        const generatedOutput = generatePromptLabOutput(body.promptId || 'master-edge-case-matrix', cleanInput);
        return NextResponse.json({
          action,
          output: generatedOutput,
          techStack,
          isLiveAI: false,
        });
      }

      return NextResponse.json(
        {
          error: 'INVALID_GEMINI_KEY',
          message: syntaxCheck.error || 'The provided Gemini API key is malformed or invalid.',
          details: syntaxCheck.details,
        },
        { status: 400 }
      );
    }

    // Execute Gemini call with user's personal key
    if (effectiveApiKey) {
      try {
        let systemPrompt = '';
        if (action === 'requirements') {
          systemPrompt = `You are IntelligentQA's Requirement Generator Agent. Ingest the user story/PRD/spec, identify ambiguities, edge cases, negative flows, and generate structured Acceptance Criteria in Gherkin BDD format (Given-When-Then) and clean requirement rows.`;
        } else if (action === 'test_cases') {
          systemPrompt = `You are IntelligentQA's Test Case Generator Agent. Ingest the requirements (from user story, PRD, or imported document) and synthesize a comprehensive test matrix categorized by Positive, Negative, Boundary Value Analysis (BVA), Security, and Concurrency tests. Include preconditions, steps, expected results, and priority (P0-P2).`;
        } else if (action === 'automation_code') {
          systemPrompt = `You are IntelligentQA's Automation Code Generator Agent. Generate production-ready, clean code for tech stack: ${techStack}. For Playwright, use POM and getByRole. For Selenium, use pure POM with WebDriverWait. For REST Assured, use given/when/then with POJOs.`;
        } else if (action === 'code_snippet') {
          systemPrompt = `You are IntelligentQA's Autonomous SDET Code Generator.
Generate a concise, 100% correct, and complete production-grade test automation code snippet for tech stack: ${techStack}.
CRITICAL INSTRUCTIONS:
1. Output ONLY the raw executable code snippet.
2. Do NOT include ANY explanations, intro text, markdown headers, summary, or commentary before or after the code block.
3. Strictly implement ALL requirements and keywords specified in the user prompt with completeness and accuracy (for example: if ThreadLocal, TestNG, parallel execution, PageFactory, explicit waits, or listeners are requested, you MUST implement them fully with proper imports and thread-safe idioms).
4. Output clean code that can be run directly in an automation framework.`;
        } else if (action === 'code_review') {
          systemPrompt = `You are IntelligentQA's Code Reviewer & Quality Auditor Agent. Analyze the automation code for flakiness, hardcoded waits (Thread.sleep/waitForTimeout), brittle locators, and memory leaks. Provide detailed line-by-line review and refactored code.`;
        } else if (action === 'prompt_lab') {
          systemPrompt = body.promptTemplate || `You are an expert Staff SDET and Test Automation Architect. Execute the user's prompt instruction with maximum accuracy, completeness, and structured formatting.`;
        } else {
          systemPrompt = `You are IntelligentQA's Senior SDET Technical Assistant. Provide practical, modern automation guidance.`;
        }

        const candidateModels = [
          'gemini-2.0-flash',
          'gemini-1.5-flash',
          'gemini-2.5-flash',
          'gemini-flash-lite-latest',
          'gemini-2.0-flash-lite',
        ];

        for (const model of candidateModels) {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveApiKey}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8500);

          try {
            const res = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: `${systemPrompt}\n\nUser Input:\n${input}` }],
                  },
                ],
                generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
              }),
            });

            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              let generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (generatedText) {
        if (action === 'code_snippet') {
          // If response contains a markdown code block, extract ONLY the inside of the code block
          const codeBlockMatch = generatedText.match(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/);
          if (codeBlockMatch) {
            generatedText = codeBlockMatch[1].trim();
          } else {
            generatedText = generatedText
              .replace(/^```[a-zA-Z0-9_-]*\n?/, '')
              .replace(/\n?```\s*$/, '')
              .trim();
          }
        }
                return NextResponse.json({
                  action,
                  output: generatedText,
                  techStack,
                  engine: model,
                  isLiveAI: true,
                });
              }
            }
          } catch (fetchErr) {
            clearTimeout(timeoutId);
            continue;
          }
        }
      } catch (e) {
        console.warn('Gemini API call for QA Agent fell back to deterministic generator:', e);
      }
    }

    // Deterministic Generator Fallback
    const cleanInput = input.trim();
    let generatedOutput = '';

    switch (action) {
      case 'requirements':
        generatedOutput = generateRequirementsClarification(cleanInput);
        break;
      case 'test_cases':
        generatedOutput = generateTestCaseMatrix(cleanInput);
        break;
      case 'automation_code':
        generatedOutput = generateAutomationCode(cleanInput, techStack);
        break;
      case 'code_review':
        generatedOutput = reviewAutomationCode(cleanInput, techStack);
        break;
      case 'code_snippet':
        generatedOutput = generateCodeSnippetOnly(cleanInput, techStack);
        break;
      case 'prompt_lab':
        generatedOutput = generatePromptLabOutput(body.promptId || 'master-edge-case-matrix', cleanInput);
        break;
      case 'chat':
      default:
        generatedOutput = `### SDET Advisory Analysis
Based on your input: "${cleanInput.slice(0, 100)}..."

**Architecture Assessment:**
1. **Automation Strategy**: Separate test orchestration from element locators using the Page Object Model.
2. **Synchronization**: Replace hardcoded waits with explicit actionability checks.
3. **Continuous Delivery**: Run regression tests on pull request triggers with sharded CI jobs.`;
        break;
    }

    return NextResponse.json({
      action,
      output: generatedOutput,
      techStack,
      engine: 'deterministic-agent-engine',
    });
  } catch (err) {
    console.error('QA Agent error:', err);
    return NextResponse.json({ error: 'Internal server error processing agent request' }, { status: 500 });
  }
}

// 1. Requirements Clarification / Generator
function generateRequirementsClarification(input: string): string {
  return `# Requirements Specification & Acceptance Criteria

**Generated By:** IntelligentQA Requirement Generator Agent

## 1. Ambiguity & Missing Edge-Cases Identified
- **Concurrent Submissions**: What occurs if the user submits the form twice in rapid succession (network debounce / idempotent handling)?
- **Session Timeout**: How does the application handle token expiration while the user is actively filling the workflow?
- **Boundary Validation**: Are inputs with leading/trailing whitespaces, emojis, or international Unicode characters supported?
- **Error Handling**: What exact user-facing message should render upon 500 Internal Server errors?

## 2. Gherkin Acceptance Criteria (Given-When-Then)

\`\`\`gherkin
Feature: ${input.slice(0, 50) || 'Core Feature Workflow'}

  Background:
    Given the user is on the application landing page
    And the user has a valid active authentication session

  Scenario: Successful Happy Path Execution
    Given the user inputs valid registration details
    When the user submits the form
    Then the system should process the transaction with status code 201
    And a success notification banner should be visible
    And the new record should appear in the data table

  Scenario: Negative Path - Validation Error on Empty Required Fields
    Given the user leaves required fields empty
    When the user attempts to submit
    Then the submission should be blocked
    And inline validation errors should display on each missing field
    And no network request should be dispatched to the backend

  Scenario: Edge Case - Special Characters & Unicode Handling
    Given the user inputs a name containing international accents like "François Müller"
    When the user saves the changes
    Then the name should be preserved and rendered accurately without mojibake
\`\`\`

## 3. Recommended SDET Checklist
- [ ] Add API contract tests for payload schema verification
- [ ] Ensure frontend displays accessible ARIA live-regions for error toasts
- [ ] Verify rate limiting prevents automated abuse (429 Too Many Requests)`;
}

// 2. Test Case Matrix Generator
function generateTestCaseMatrix(input: string): string {
  return `# Comprehensive QA Test Matrix

**Scope:** ${input.slice(0, 60)}...
**Generated By:** IntelligentQA Test Case Generator Agent

| ID | Category | Scenario Description | Preconditions | Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-001** | Positive | Verify successful submission with valid inputs | User is logged in | 1. Navigate to page<br>2. Fill required inputs<br>3. Click Submit | Status 200/201, success toast renders, record persisted | P0 (Critical) |
| **TC-002** | Negative | Submit form with empty required fields | Form displayed | 1. Clear all inputs<br>2. Click Submit | Form blocked, inline red borders & error labels display | P0 (Critical) |
| **TC-003** | Negative | Submit with invalid email format (missing '@') | Form displayed | 1. Enter "user.domain.com"<br>2. Blur input field | "Please enter a valid email" message displayed | P1 (High) |
| **TC-004** | BVA | Boundary test: Maximum allowed character length (255 chars) | Form displayed | 1. Paste exactly 255 chars<br>2. Submit | Accepts input without truncation | P1 (High) |
| **TC-005** | BVA | Boundary test: Exceeding max length (256 chars) | Form displayed | 1. Paste 256 chars<br>2. Submit | Input prevented or error "Max 255 characters allowed" | P2 (Medium) |
| **TC-006** | Security | XSS injection payload in text field | Form displayed | 1. Enter \`<script>alert(1)</script>\`<br>2. Submit | Input is properly sanitized, script does not execute | P0 (Critical) |
| **TC-007** | Concurrency | Double click submit button rapidly | Network on 3G | 1. Fill form<br>2. Double click submit in <200ms | Button disables immediately, only 1 request dispatched | P1 (High) |
| **TC-008** | Edge Case | Clipboard paste into segmented OTP pin inputs | OTP modal open | 1. Copy "849201"<br>2. Focus first box & paste | All 6 digits populate sequentially, autofocus moves to submit | P1 (High) |`;
}

// 3. Automation Code Generator
function generateAutomationCode(input: string, techStack: string): string {
  if (techStack === 'selenium-java') {
    return `// ==========================================
// SELENIUM WEBDRIVER 4 (JAVA) + TESTNG
// Generated by IntelligentQA Automation Code Agent
// ==========================================

package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class FeaturePage {
    private WebDriver driver;
    private WebDriverWait wait;

    // Resilient By Locators (No deprecated PageFactory)
    private By nameField = By.cssSelector("input[name='full_name'], input[aria-label='Full Name']");
    private By submitButton = By.xpath("//button[normalize-space()='Submit' or @type='submit']");
    private By successAlert = By.cssSelector("[role='alert'], .toast-success");

    public FeaturePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void enterName(String name) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(nameField));
        input.clear();
        input.sendKeys(name);
    }

    public void clickSubmit() {
        wait.until(ExpectedConditions.elementToBeClickable(submitButton)).click();
    }

    public boolean isSuccessMessageDisplayed() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(successAlert)).isDisplayed();
    }
}

// ------------------------------------------
// TEST CLASS (TestNG)
// ------------------------------------------
package com.intelligentqa.tests;

import com.intelligentqa.pages.FeaturePage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FeatureTest extends BaseTest {
    @Test(description = "Verify feature happy path workflow")
    public void testFeatureExecution() {
        driver.get("https://intelligentqa.io/sandbox/web");
        FeaturePage page = new FeaturePage(driver);
        page.enterName("Enterprise SDET");
        page.clickSubmit();
        Assert.assertTrue(page.isSuccessMessageDisplayed(), "Expected success confirmation alert.");
    }
}`;
  }

  if (techStack === 'restassured') {
    return `// ==========================================
// REST ASSURED (JAVA) API AUTOMATION
// Generated by IntelligentQA Automation Code Agent
// ==========================================

package com.intelligentqa.api;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class ApiContractTest {

    @BeforeClass
    public void setup() {
        RestAssured.baseURI = "https://intelligentqa.io/api/sandbox/v1";
    }

    @Test(description = "POST /users creates user with status 201")
    public void testCreateUser() {
        String payload = "{\\"name\\": \\"Alex SDET\\", \\"role\\": \\"Staff SDET\\"}";

        given()
            .header("Authorization", "Bearer mock-jwt-token")
            .contentType(ContentType.JSON)
            .body(payload)
        .when()
            .post("/users")
        .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("name", equalTo("Alex SDET"))
            .body("role", equalTo("Staff SDET"));
    }

    @Test(description = "GET /users without token returns 401 Unauthorized")
    public void testUnauthorizedAccess() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/users")
        .then()
            .statusCode(401)
            .body("error", equalTo("Unauthorized"));
    }
}`;
  }

  // Default: Playwright + TypeScript
  return `// ==========================================
// PLAYWRIGHT + TYPESCRIPT (PAGE OBJECT MODEL)
// Generated by IntelligentQA Automation Code Agent
// ==========================================

import { Page, Locator, expect } from '@playwright/test';

export class FeaturePage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // User-facing accessible locators
    this.nameInput = page.getByLabel('Full Name').or(page.getByPlaceholder('Enter your name'));
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.successMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/sandbox/web');
  }

  async submitForm(name: string) {
    await this.nameInput.fill(name);
    await this.submitButton.click();
  }
}

// ------------------------------------------
// TEST SPECIFICATION FILE
// ------------------------------------------
import { test } from '@playwright/test';

test.describe('Feature Validation Suite', () => {
  test('verify successful form submission', async ({ page }) => {
    const featurePage = new FeaturePage(page);
    await featurePage.goto();

    await featurePage.submitForm('Senior SDET');

    // Web-First assertion with built-in retry
    await expect(featurePage.successMessage).toBeVisible({ timeout: 5000 });
    await expect(featurePage.successMessage).toContainText(/success|confirmed/i);
  });
});`;
}

// 4. Code Reviewer & Quality Auditor
function reviewAutomationCode(input: string, techStack: string): string {
  const flags: string[] = [];

  if (input.includes('Thread.sleep') || input.includes('waitForTimeout')) {
    flags.push('🚨 **CRITICAL FLAKINESS RISK: Hardcoded Sleep Detected**\nUsing `Thread.sleep()` or `waitForTimeout()` pauses execution blindly regardless of system state, inflating test duration and causing failures under CI load. Replace with Playwright web-first assertions (`expect(locator).toBeVisible()`) or Selenium `WebDriverWait`.');
  }

  if (input.includes('/html/body/') || input.includes('//*[@id=')) {
    flags.push('⚠️ **FRAGILE LOCATOR DETECTED: Absolute or Index-heavy XPath**\nXPaths tied to raw DOM layout break on minor frontend markup changes. Replace with semantic locators (`getByRole`, `getByLabel`, `data-testid`).');
  }

  if (techStack === 'playwright-ts' && input.includes('isVisible()') && input.includes('toBe(true)')) {
    flags.push('⚠️ **ANTI-PATTERN: Non-retrying assertion**\n`expect(await locator.isVisible()).toBe(true)` checks once and fails immediately. Replace with `await expect(locator).toBeVisible()` which automatically polls.');
  }

  if (flags.length === 0) {
    flags.push('✅ **Linter Clean**: No severe anti-patterns detected in the snippet.');
  }

  return `# Automation Code Quality Audit Report

## 1. Static & Semantic Analysis Findings
${flags.join('\n\n')}

## 2. Refactored Enterprise Code Recommendation

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('optimized robust execution', async ({ page }) => {
  await page.goto('/sandbox/web');

  // Refactored to resilient accessible locator
  const submitButton = page.getByRole('button', { name: 'Submit' });

  // Auto-waiting click eliminates all sleep delays
  await submitButton.click();

  // Web-First assertion retries automatically
  await expect(page.getByRole('alert')).toBeVisible();
});
\`\`\`

## 3. Scorecard
- **Maintainability**: 92 / 100
- **CI Reliability**: 95 / 100
- **Best Practice Adherence**: High`;
}

// 5. Code Snippet Only Generator (Direct, Short, Clean - No Markdown Description)
function generateCodeSnippetOnly(input: string, techStack: string): string {
  const lowerInput = input.toLowerCase();

  // SELENIUM (PYTHON)
  if (techStack === 'selenium-python' || (techStack === 'python' && (lowerInput.includes('selenium') || lowerInput.includes('webdriver') || lowerInput.includes('basetest')))) {
    if (lowerInput.includes('threadlocal') || lowerInput.includes('thread-local') || lowerInput.includes('parallel') || lowerInput.includes('xdist')) {
      return `# Selenium WebDriver (Python) Thread-Safe Fixture for Parallel Execution (pytest-xdist)
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

@pytest.fixture(scope="function")
def driver():
    """Function-scoped thread-safe WebDriver fixture for parallel execution."""
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    driver_instance = webdriver.Chrome(options=options)
    driver_instance.maximize_window()
    yield driver_instance
    driver_instance.quit()`;
    }
    if (lowerInput.includes('listener') || lowerInput.includes('screenshot') || lowerInput.includes('hook') || lowerInput.includes('report') || lowerInput.includes('extent')) {
      return `# pytest Failure Screenshot Hook (conftest.py)
import pytest
import os
from datetime import datetime

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    if rep.when == "call" and rep.failed:
        driver = item.funcargs.get("driver", None)
        if driver:
            os.makedirs("screenshots", exist_ok=True)
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            driver.save_screenshot(f"screenshots/{item.name}_{ts}.png")
            print(f"Captured failure screenshot: screenshots/{item.name}_{ts}.png")`;
    }
    if (lowerInput.includes('basetest') || lowerInput.includes('setup') || lowerInput.includes('fixture')) {
      return `# Selenium WebDriver (Python) BaseTest Fixture
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
    if (lowerInput.includes('page object') || lowerInput.includes('pom') || lowerInput.includes('login')) {
      return `# Selenium WebDriver (Python) Page Object
from selenium.webdriver.common.by import By

class LoginPage:
    def __init__(self, driver):
        self.driver = driver
        self._username = (By.ID, "username")
        self._password = (By.ID, "password")
        self._login_btn = (By.CSS_SELECTOR, "button[type='submit']")

    def login_as(self, username, password):
        self.driver.find_element(*self._username).send_keys(username)
        self.driver.find_element(*self._password).send_keys(password)
        self.driver.find_element(*self._login_btn).click()`;
    }
    if (lowerInput.includes('wait') || lowerInput.includes('sync')) {
      return `# Selenium WebDriver (Python) Explicit Wait
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, 10)
btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
btn.click()
alert = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='alert'], .toast")))
assert alert.is_displayed(), "Alert banner must be visible"`;
    }
    return `# Selenium WebDriver (Python) Snippet
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, 10)
btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
btn.click()
alert = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='alert'], .toast")))
assert alert.is_displayed(), "Verification alert should be visible"`;
  }

  // SELENIUM (JAVA)
  if (techStack === 'selenium-java' || techStack === 'java') {
    // 1. Check for TestNG ITestListener / ExtentReports / Screenshot
    if (lowerInput.includes('listener') || lowerInput.includes('itestlistener') || lowerInput.includes('extent') || (lowerInput.includes('screenshot') && (lowerInput.includes('fail') || lowerInput.includes('attach')))) {
      return `// TestNG ITestListener with ExtentReports & Failure Screenshot Capture
package com.intelligentqa.listeners;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import com.aventstack.extentreports.MediaEntityBuilder;
import com.intelligentqa.base.BaseTest;

public class ScreenshotListener implements ITestListener {
    @Override
    public void onTestStart(ITestResult result) {
        System.out.println("Starting test: " + result.getMethod().getMethodName());
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        System.out.println("Test Passed: " + result.getMethod().getMethodName());
    }

    @Override
    public void onTestFailure(ITestResult result) {
        try {
            String base64Img = ((TakesScreenshot) BaseTest.getDriver()).getScreenshotAs(OutputType.BASE64);
            ExtentTestManager.getTest().fail(
                "Test Failed: " + result.getThrowable().getMessage(),
                MediaEntityBuilder.createScreenCaptureFromBase64String(base64Img).build()
            );
        } catch (Exception e) {
            System.err.println("Failed to capture screenshot: " + e.getMessage());
        }
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        System.out.println("Test Skipped: " + result.getMethod().getMethodName());
    }
}`;
    }

    // 2. Check for TestNG RetryAnalyzer
    if (lowerInput.includes('retry') || lowerInput.includes('iretryanalyzer')) {
      return `// TestNG IRetryAnalyzer for Flaky Test Mitigation
package com.intelligentqa.listeners;

import org.testng.IRetryAnalyzer;
import org.testng.ITestResult;

public class RetryAnalyzer implements IRetryAnalyzer {
    private int retryCount = 0;
    private static final int MAX_RETRY_COUNT = 2;

    @Override
    public boolean retry(ITestResult result) {
        if (retryCount < MAX_RETRY_COUNT) {
            retryCount++;
            System.out.printf("Retrying flaky test [%s], attempt %d of %d%n",
                result.getMethod().getMethodName(), retryCount, MAX_RETRY_COUNT);
            return true;
        }
        return false;
    }
}`;
    }

    // 3. Check for ThreadLocal or Parallel execution request
    if (lowerInput.includes('threadlocal') || lowerInput.includes('thread-local') || lowerInput.includes('parallel') || (lowerInput.includes('basetest') && lowerInput.includes('thread'))) {
      return `// Selenium WebDriver (Java) BaseTest with ThreadLocal for Parallel TestNG Execution
package com.intelligentqa.base;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.AfterMethod;

public abstract class BaseTest {
    // ThreadLocal ensures isolated WebDriver instances per thread during parallel execution
    private static final ThreadLocal<WebDriver> driverThread = new ThreadLocal<>();

    public static WebDriver getDriver() {
        return driverThread.get();
    }

    @BeforeMethod
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--disable-gpu", "--no-sandbox");
        WebDriver driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        driverThread.set(driver);
    }

    @AfterMethod
    public void tearDown() {
        if (getDriver() != null) {
            getDriver().quit();
            driverThread.remove(); // Prevent memory leaks in parallel thread pools
        }
    }
}`;
    }

    // 4. BaseTest Setup
    if (lowerInput.includes('basetest') || lowerInput.includes('setup') || (lowerInput.includes('testng') && lowerInput.includes('base'))) {
      return `// Selenium WebDriver (Java) BaseTest with TestNG
package com.intelligentqa.base;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.AfterMethod;

public abstract class BaseTest {
    // Thread-safe WebDriver reference for robust parallel execution
    private static final ThreadLocal<WebDriver> driverThread = new ThreadLocal<>();

    public static WebDriver getDriver() {
        return driverThread.get();
    }

    @BeforeMethod
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--disable-gpu", "--no-sandbox");
        WebDriver driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        driverThread.set(driver);
    }

    @AfterMethod
    public void tearDown() {
        if (getDriver() != null) {
            getDriver().quit();
            driverThread.remove();
        }
    }
}`;
    }
    if (lowerInput.includes('pagefactory') || lowerInput.includes('page factory')) {
      return `// Selenium WebDriver (Java) PageFactory Pattern
package com.intelligentqa.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LoginPage {
    private final WebDriver driver;

    @FindBy(id = "username")
    private WebElement usernameInput;

    @FindBy(id = "password")
    private WebElement passwordInput;

    @FindBy(css = "button[type='submit']")
    private WebElement loginBtn;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public void loginAs(String user, String pass) {
        usernameInput.sendKeys(user);
        passwordInput.sendKeys(pass);
        loginBtn.click();
    }
}`;
    }
    if (lowerInput.includes('page object') || lowerInput.includes('pom') || lowerInput.includes('login')) {
      return `// Selenium WebDriver (Java) Page Object
package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage {
    private final WebDriver driver;
    private final By usernameField = By.id("username");
    private final By passwordField = By.id("password");
    private final By submitBtn = By.cssSelector("button[type='submit']");

    public LoginPage(WebDriver driver) { this.driver = driver; }

    public void loginAs(String username, String password) {
        driver.findElement(usernameField).sendKeys(username);
        driver.findElement(passwordField).sendKeys(password);
        driver.findElement(submitBtn).click();
    }
}`;
    }
    if (lowerInput.includes('dataprovider') || lowerInput.includes('data-driven')) {
      return `// TestNG Parallel DataProvider
package com.intelligentqa.tests;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class DataDrivenTests {
    @DataProvider(name = "userCredentials", parallel = true)
    public Object[][] getUserCredentials() {
        return new Object[][] {
            {"standard_user", "secret_sauce", "Dashboard"},
            {"locked_out_user", "secret_sauce", "User is locked out"},
            {"problem_user", "secret_sauce", "Dashboard"}
        };
    }

    @Test(dataProvider = "userCredentials")
    public void testLoginScenarios(String username, String password, String expectedOutcome) {
        System.out.printf("Running login test for %s on thread: %s%n", username, Thread.currentThread().getName());
    }
}`;
    }
    return `// Selenium WebDriver (Java) Snippet
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[type='submit']")));
submitBtn.click();
WebElement alert = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[role='alert'], .toast")));
Assert.assertTrue(alert.isDisplayed(), "Verification alert should be visible");`;
  }

  // PLAYWRIGHT (PYTHON)
  if (techStack === 'playwright-python' || techStack === 'python') {
    return `# Playwright (Python) Snippet
page.get_by_role("button", name="Submit").click()
expect(page.get_by_role("alert")).to_be_visible(timeout=5000)
expect(page.get_by_role("heading", level=1)).to_have_text("Success")`;
  }

  // PLAYWRIGHT (TYPESCRIPT)
  return `// Playwright (TypeScript) Snippet
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Success');`;
}

function generatePromptLabOutput(promptId: string, input: string): string {
  const clean = input.trim();
  const summaryLine = clean.split('\n')[0] || clean;

  switch (promptId) {
    case 'master-edge-case-matrix':
      return `### Master Test Scenario & Edge Case Matrix
**Feature Scope:** ${summaryLine}

| Test ID | Scenario Title | Test Type | Preconditions | Test Steps | Expected Result | Priority |
|:---|:---|:---|:---|:---|:---|:---:|
| TC-001 | Successful End-to-End Happy Path Execution | Happy Path | User is authenticated with active session | 1. Navigate to target workflow<br>2. Provide valid inputs as specified<br>3. Submit the action | Workflow completes with 200 OK, UI state updates to confirmation banner, and database record is persisted | P0 |
| TC-002 | Missing Mandatory Field Validation | Negative | User is on target screen | 1. Leave required fields empty<br>2. Attempt submission | Client prevents submission, highlights mandatory fields with accessible aria-invalid alerts, zero network mutations | P0 |
| TC-003 | Boundary Value Min/Max Threshold Check | Boundary | Input constraints active | 1. Enter exact minimum and maximum boundary values<br>2. Submit | System processes boundary inputs cleanly without off-by-one errors or truncation | P1 |
| TC-004 | Rapid Double-Click & Debounce Verification | Edge Case | User ready to submit | 1. Double click submit action within 150ms | Button enters disabled loading state immediately, single network payload dispatched, exactly 1 database transaction committed | P0 |
| TC-005 | Network Timeout & Mid-Transaction Drop | Edge Case | Simulation network throttler enabled | 1. Trigger action<br>2. Inject 30s latency or network failure | Graceful error state shown with retry button, idempotent transaction guarantees no duplicate side-effects | P1 |
| TC-006 | SQL Injection & Payload Tampering Vector | Security | Input form active | 1. Enter \`' OR '1'='1' --\` and \`<script>alert(1)</script>\` into inputs<br>2. Submit | Input is properly parameterized and sanitized, rejected with 400 Bad Request, zero script execution | P0 |
| TC-007 | Concurrent Multi-Tab State Invalidation | Edge Case | User authenticated in 2 browser tabs | 1. Complete action in Tab A<br>2. Return to Tab B and re-submit stale state | Tab B detects state token mismatch, prompts user to refresh without crashing or corrupting database | P1 |`;

    case 'bva-equivalence-partitioning':
      return `### Boundary Value Analysis (BVA) & Equivalence Partitioning (EP)
**Target Field / Rule:** ${summaryLine}

#### 1. Equivalence Partitions (EP)
- **Valid Partition (P_VALID):** Inputs strictly conforming to the business rule.
  - *Representative Input:* Valid mid-range value conforming to all rules.
- **Invalid Partition 1 (P_BELOW):** Values below the minimum acceptable constraint.
  - *Representative Input:* Below minimum value, negative integers, or underflow strings.
- **Invalid Partition 2 (P_ABOVE):** Values exceeding the maximum acceptable threshold.
  - *Representative Input:* Exceeding upper limit, buffer overflow strings (> 255 chars).
- **Invalid Partition 3 (P_TYPE):** Null, undefined, empty string \`""\`, whitespace only \`"   "\`, and mismatched data types (alphanumeric where numeric required).

#### 2. Exact Boundary Values (2-Value & 3-Value Analysis)
| Point | Boundary Value | Expected Result | Assertion Type |
|:---|:---|:---|:---|
| **Min - 1** | Sub-Boundary (Below Min) | ❌ Rejected: Validation error displayed | \`expect(errorLocator).toBeVisible()\` |
| **Min** | Exact Minimum Threshold | ✔ Accepted: Valid input accepted | \`expect(submitBtn).toBeEnabled()\` |
| **Min + 1** | Nominal Low Boundary | ✔ Accepted: Valid input accepted | \`expect(errorLocator).toBeHidden()\` |
| **Nominal** | Typical Median Value | ✔ Accepted: Standard execution | \`expect(status).toHaveText("OK")\` |
| **Max - 1** | Nominal High Boundary | ✔ Accepted: Valid input accepted | \`expect(errorLocator).toBeHidden()\` |
| **Max** | Exact Maximum Threshold | ✔ Accepted: Valid input accepted | \`expect(submitBtn).toBeEnabled()\` |
| **Max + 1** | Super-Boundary (Above Max) | ❌ Rejected: Out of bounds error | \`expect(errorLocator).toContainText("exceeded")\` |

#### 3. Off-by-One Risk & Automated Assertion
Developers commonly use \`<\` instead of \`<=\` or \`>\` instead of \`>=\` in backend validation filters. Test **Min** and **Max** explicitly in your automated assertions to prevent regressions.`;

    case 'bdd-gherkin-spec-generator':
      return `### BDD Gherkin Feature Specification
\`\`\`gherkin
@regression @core-workflow
Feature: ${summaryLine.slice(0, 80)}
  As a verified user
  I want to execute the target business workflow
  So that the system processes my request reliably without data corruption

  Background:
    Given the application is accessible and test data is initialized
    And the user is authenticated with an active session token

  @smoke @critical
  Scenario: Successful completion of primary workflow
    Given the user navigates to the feature workflow
    When the user submits valid details:
      | field        | value        |
      | requirement | validated    |
    Then the action should succeed with status "Confirmed"
    And a confirmation notification should be displayed
    And the system audit log records the transaction

  @negative @validation
  Scenario Outline: Reject invalid or boundary inputs gracefully
    Given the user is on the workflow submission form
    When the user enters "<input_data>" into the field
    And clicks the submit button
    Then the system should display "<error_message>"
    And the submit button should remain disabled
    And no backend mutations should occur

    Examples:
      | input_data             | error_message                         |
      |                        | Field cannot be empty                 |
      | -1                     | Value must be positive and non-zero    |
      | <script>alert(1)</script> | Special characters are not permitted |
      | OVERFLOW_999999999     | Exceeds maximum allowed length        |

  @edge @concurrency
  Scenario: Prevent duplicate submissions on rapid user clicks
    Given the user has completed the input requirements
    When the user clicks the submit action 2 times within 200 milliseconds
    Then the system should process only the first request
    And the second request should be debounced
    And exactly 1 confirmation ID should be generated
\`\`\``;

    case 'playwright-ts-pom-scaffolder':
      return `### Production Playwright TypeScript Page Object Model (POM)
\`\`\`typescript
import { Page, Locator, expect } from '@playwright/test';

/**
 * Enterprise Page Object Model for: ${summaryLine.slice(0, 60)}
 * Adheres strictly to user-facing locators, auto-waiting, and separation of concerns.
 */
export class FeaturePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly mainInput: Locator;
  readonly submitButton: Locator;
  readonly successBanner: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    // User-facing accessible locators (Zero brittle CSS/XPath)
    this.heading = page.getByRole('heading', { level: 1 });
    this.mainInput = page.getByRole('textbox').first();
    this.submitButton = page.getByRole('button', { name: /submit|confirm|continue/i });
    this.successBanner = page.getByRole('alert');
    this.errorMessage = page.getByTestId('error-notification');
    this.loadingSpinner = page.getByTestId('loading-indicator');
  }

  /**
   * Navigates to the workflow page and verifies initial DOM readiness.
   */
  async navigate(path: string = '/dashboard') {
    await this.page.goto(path);
    await expect(this.submitButton).toBeVisible({ timeout: 10000 });
  }

  /**
   * Executes the primary user action with built-in auto-waiting.
   */
  async submitWorkflow(inputValue: string) {
    await this.mainInput.fill(inputValue);
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }

  /**
   * Asserts the successful completion of the workflow.
   */
  async verifySuccess(expectedText: string) {
    await expect(this.loadingSpinner).toBeHidden();
    await expect(this.successBanner).toBeVisible({ timeout: 8000 });
    await expect(this.successBanner).toContainText(expectedText);
  }

  /**
   * Asserts expected validation failure.
   */
  async verifyError(expectedError: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedError);
  }
}
\`\`\`

#### Companion Test Specification (\`.spec.ts\`)
\`\`\`typescript
import { test, expect } from '@playwright/test';
import { FeaturePage } from './FeaturePage';

test.describe('Feature Workflow Suite', () => {
  let featurePage: FeaturePage;

  test.beforeEach(async ({ page }) => {
    featurePage = new FeaturePage(page);
    await featurePage.navigate();
  });

  test('P0: should complete workflow successfully with valid input', async () => {
    await featurePage.submitWorkflow('Valid Verified Input');
    await featurePage.verifySuccess('Confirmed');
  });

  test('P1: should prevent submission and show alert on invalid input', async () => {
    await featurePage.submitWorkflow('');
    await featurePage.verifyError('Field cannot be empty');
  });
});
\`\`\``;

    case 'selenium-java-pom-factory':
      return `### Enterprise Selenium 4 (Java 21) Page Object Architecture
\`\`\`java
package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

/**
 * Enterprise Page Object for: ${summaryLine.slice(0, 60)}
 * Strict encapsulation, zero Thread.sleep(), explicit synchronization.
 */
public class FeaturePage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    // Encapsulated locators
    private final By headingLocator = By.cssSelector("h1, [role='heading']");
    private final By inputField = By.cssSelector("input[type='text'], textarea");
    private final By submitButton = By.cssSelector("button[type='submit'], [data-testid='submit-btn']");
    private final By toastBanner = By.cssSelector("[role='alert'], .toast-success");
    private final By errorAlert = By.cssSelector(".error-message, [aria-invalid='true']");

    public FeaturePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void navigateTo(String url) {
        driver.get(url);
        wait.until(ExpectedConditions.visibilityOfElementLocated(headingLocator));
    }

    public void enterDetails(String value) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(inputField));
        input.clear();
        input.sendKeys(value);
    }

    public void clickSubmit() {
        WebElement button = wait.until(ExpectedConditions.elementToBeClickable(submitButton));
        button.click();
    }

    public boolean isSuccessToastVisible(String expectedMessage) {
        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(toastBanner));
        return toast.getText().contains(expectedMessage);
    }

    public String getErrorMessage() {
        WebElement error = wait.until(ExpectedConditions.visibilityOfElementLocated(errorAlert));
        return error.getText();
    }
}
\`\`\`

#### Companion TestNG Test Class
\`\`\`java
package com.intelligentqa.tests;

import com.intelligentqa.pages.FeaturePage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FeatureTests extends BaseTest {
    @Test(priority = 1, description = "Verify successful submission")
    public void testSuccessfulWorkflow() {
        FeaturePage page = new FeaturePage(driver);
        page.navigateTo("https://intelligentqa.io/sandbox/practice");
        page.enterDetails("Production Data Input");
        page.clickSubmit();
        Assert.assertTrue(page.isSuccessToastVisible("Confirmed"), "Confirmation banner should be displayed");
    }
}
\`\`\``;

    case 'flakiness-race-condition-auditor':
      return `### Flaky Test & Race Condition Audit Report
**Target Snippet:** ${summaryLine.slice(0, 70)}

#### 1. Root Cause Diagnosis
- **Microtask Timing Mismatch:** The test script fires click events before the browser has attached event listeners or finished hydration.
- **Missing Web-First Assertion:** Asserting immediately on dynamic elements without auto-waiting causes intermittent \`TimeoutError\` or \`StaleElementReferenceException\`.
- **Arbitrary Sleep Anti-Pattern:** Using fixed waits (\`Thread.sleep()\` or \`waitForTimeout()\`) introduces CI pipeline slowness and fails whenever worker CPU is throttled.

#### 2. Detected Anti-Patterns
1. ❌ *Unsynchronized DOM state transition*: Reading text before CSS transition/DOM re-render settles.
2. ❌ *Brittle CSS Selectors*: Using volatile class selectors that change between builds.
3. ❌ *Absence of retry-capable assertions*: Relying on static comparisons instead of polling locators.

#### 3. Refactored Resilient Code (Zero Sleeps · 100% Deterministic)
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('resilient flakiness-free execution', async ({ page }) => {
  // 1. Web-first navigation with network idle check
  await page.goto('/workflow', { waitUntil: 'domcontentloaded' });

  // 2. Target resilient user-facing role locator
  const submitBtn = page.getByRole('button', { name: 'Submit Order' });
  await expect(submitBtn).toBeVisible({ timeout: 5000 });
  await expect(submitBtn).toBeEnabled();

  // 3. User interaction with auto-waiting
  await submitBtn.click();

  // 4. Web-first polling assertion (auto-retries up to 10 seconds)
  const alertBanner = page.getByRole('alert');
  await expect(alertBanner).toBeVisible({ timeout: 10000 });
  await expect(alertBanner).toContainText('Success', { ignoreCase: true });
});
\`\`\`

#### 4. Architectural Rules for CI Reliability
1. **Never use fixed sleeps**: Replace every \`Thread.sleep\` with explicit condition polling.
2. **Prefer web-first assertions**: Use \`expect(locator).toHaveText()\` rather than extracting \`textContent()\` manually.
3. **Isolate test state**: Ensure every test generates unique database entities to prevent parallel collision.`;

    case 'api-security-tampering-matrix':
      return `### OWASP API Security & Payload Tampering Matrix
**Endpoint Scope:** ${summaryLine.slice(0, 80)}

| Security Vector | Test Scenario | Tampered Payload / Header | Expected Status | Security Assertion |
|:---|:---|:---|:---:|:---|
| **BOLA / IDOR** | Replace path param \`userId\` with another tenant ID | \`Authorization: Bearer <Tenant_A_Token>\`<br>\`PUT /api/v1/users/<Tenant_B_ID>\` | **403 Forbidden** | Verifies RBAC bounds, returns zero Tenant B data |
| **JWT Tampering** | Strip signature / use 'none' algorithm | \`alg: "none"\` in JWT header | **401 Unauthorized** | Backend strictly verifies signature with secret |
| **Mass Assignment** | Inject privileged administrative attributes | Body contains: \`{"isAdmin": true, "role": "superadmin"}\` | **400 / 200 (Ignored)** | Privileged fields are stripped, database role unchanged |
| **SQL Injection** | Inject SQL Boolean bypass into text fields | \`{"name": "admin' OR 1=1 --"}\` | **400 Bad Request** | Prepared statements parameterize input safely |
| **NoSQL Operator** | Inject Mongo query operators | \`{"password": {"$gt": ""}}\` | **422 Unprocessable** | Type validation enforces strict string schema |
| **XSS Payload** | Script tag in string inputs | \`{"bio": "<script>alert(document.cookie)</script>"}\` | **200 / 400 Sanitized** | HTML entities encoded before persistence or output |
| **Rate Limit / DoS** | Burst 50 requests in 2 seconds | Continuous loop from same IP | **429 Too Many Requests** | Returns \`Retry-After\` header, throttles caller |`;

    case 'bug-report-to-rca-generator':
    default:
      return `### Formal Defect Ticket & Automated Regression Plan
**Defect Summary:** ${summaryLine.slice(0, 80)}

#### 1. Jira Ticket Details
- **Issue Key:** DEFECT-${Math.floor(1000 + Math.random() * 9000)}
- **Issue Type:** Bug
- **Severity:** Blocker (Data Duplication / Transaction Integrity)
- **Priority:** P0 - Immediate Escalation

#### Preconditions:
1. User account is authenticated with valid credentials.
2. Network connection is operating under standard latency.

#### Exact Deterministic Steps to Reproduce:
1. Navigate to the target feature screen.
2. Populate required inputs with valid test data.
3. Rapidly click the primary action button twice within 200ms (or perform double tap on mobile viewport).
4. Inspect the network console and database records.

#### Expected Result:
The submit button should debounce on first click and transition to a disabled loading state. Exactly 1 API request is dispatched, and exactly 1 record is created.

#### Actual Result:
Both click events are registered. The backend processes 2 concurrent requests, producing duplicate database transactions and multiple user charges.

#### 2. Developer Root Cause Hypothesis:
- **Frontend:** Missing client-side click debouncing and lack of optimistic button disabling.
- **Backend:** Missing idempotency key header (\`Idempotency-Key: uuid\`) on the creation endpoint, allowing concurrent transactions to bypass unique constraint checks.

#### 3. Automated Regression Test (TDD Verification)
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('DEFECT-REGRESSION: double-click submission must not produce duplicate transactions', async ({ page }) => {
  await page.goto('/checkout');
  const submitBtn = page.getByRole('button', { name: 'Submit Order' });

  // Rapid double-click reproduction
  await Promise.all([
    submitBtn.click(),
    submitBtn.click({ delay: 50 }),
  ]);

  // Assert single confirmation and button disabled state
  await expect(submitBtn).toBeDisabled();
  const confirmationBadges = page.getByTestId('order-confirmation-badge');
  await expect(confirmationBadges).toHaveCount(1);
});
\`\`\``;
  }
}
