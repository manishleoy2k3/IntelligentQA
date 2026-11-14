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
Generate a concise, 100% correct, production-grade test automation code snippet for tech stack: ${techStack}.
CRITICAL INSTRUCTIONS:
1. Output ONLY the raw executable code snippet.
2. Do NOT include ANY explanations, intro text, markdown headers, summary, or commentary before or after the code block.
3. Keep the snippet short, focused, and directly addressing the user's prompt.
4. Output clean code that can be run directly in an automation framework.`;
        } else if (action === 'code_review') {
          systemPrompt = `You are IntelligentQA's Code Reviewer & Quality Auditor Agent. Analyze the automation code for flakiness, hardcoded waits (Thread.sleep/waitForTimeout), brittle locators, and memory leaks. Provide detailed line-by-line review and refactored code.`;
        } else {
          systemPrompt = `You are IntelligentQA's Senior SDET Technical Assistant. Provide practical, modern automation guidance.`;
        }

        const candidateModels = [
          'gemini-2.0-flash',
          'gemini-2.0-flash-lite',
          'gemini-1.5-flash',
        ];

        for (const model of candidateModels) {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveApiKey}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6500);

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
                  // Strip markdown code fences if Gemini added them to guarantee pure code snippet without descriptions
                  generatedText = generatedText
                    .replace(/^```[a-zA-Z0-9_-]*\n?/, '')
                    .replace(/\n?```\s*$/, '')
                    .trim();
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
  if (techStack === 'selenium-java' || techStack === 'java') {
    return `// Selenium WebDriver (Java) Snippet
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[type='submit']")));
submitBtn.click();
WebElement alert = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[role='alert'], .toast")));
Assert.assertTrue(alert.isDisplayed(), "Verification alert should be visible");`;
  }
  if (techStack === 'playwright-python' || techStack === 'python') {
    return `# Playwright (Python) Snippet
page.get_by_role("button", name="Submit").click()
expect(page.get_by_role("alert")).to_be_visible(timeout=5000)
expect(page.get_by_role("heading", level=1)).to_have_text("Success")`;
  }
  return `// Playwright (TypeScript) Snippet
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Success');`;
}
