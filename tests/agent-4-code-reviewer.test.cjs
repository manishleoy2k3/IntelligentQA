/**
 * Comprehensive Verification Test Suite for Agent 4: Code Reviewer & Quality Auditor
 * Tests all mandated benchmark tests:
 * TEST 1: Playwright code containing fixed timeout where locator assertion is appropriate
 * TEST 2: Selenium Java code with missing driver cleanup
 * TEST 3: REST Assured code with missing response assertions
 * TEST 4: File containing hardcoded API token (secret masking & security configuration)
 * TEST 5: Uploaded multi-file framework project (cross-file architectural analysis & uninspected files)
 * Plus: REVIEW ONLY vs REVIEW AND FIX modes, line number rule (no invented lines), finding schema integrity.
 */

const assert = require('assert');
const path = require('path');
const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

const { CODE_REVIEWER_DEBUGGER_SYSTEM_PROMPT, CODE_REVIEWER_DEBUGGER_AGENT_MD } = jiti(
  path.join(process.cwd(), 'src/data/agents/code-reviewer-debugger-agent.ts')
);

async function simulateAgent4(input, techStack = 'playwright-ts', options = {}) {
  const mod = jiti(path.join(process.cwd(), 'src/app/api/ai/qa-agent/route.ts'));
  const req = {
    headers: {
      get: (header) => (header.toLowerCase() === 'x-gemini-api-key' ? null : null),
    },
    json: async () => ({
      action: 'code_review',
      input,
      techStack,
      options,
    }),
  };
  const res = await mod.POST(req);
  const data = await res.json();
  return data.output;
}

async function runAllTests() {
  console.log(
    '🧪 Starting Enterprise Verification Suite for Agent 4: Code Reviewer & Quality Auditor...\n'
  );

  // Test 0: System Prompt & Specification Integrity
  console.log('Testing: Specification & System Prompt Integrity...');
  assert(
    CODE_REVIEWER_DEBUGGER_AGENT_MD.includes('Principal Software Engineer'),
    'Must define role'
  );
  assert(CODE_REVIEWER_DEBUGGER_AGENT_MD.includes('Selenium'), 'Must cover Selenium');
  assert(CODE_REVIEWER_DEBUGGER_AGENT_MD.includes('Playwright'), 'Must cover Playwright');
  assert(CODE_REVIEWER_DEBUGGER_AGENT_MD.includes('REST Assured'), 'Must cover REST Assured');
  assert(CODE_REVIEWER_DEBUGGER_AGENT_MD.includes('Appium'), 'Must cover Appium');
  assert(CODE_REVIEWER_DEBUGGER_AGENT_MD.includes('CRITICAL'), 'Must include CRITICAL severity');
  assert(CODE_REVIEWER_DEBUGGER_AGENT_MD.includes('HIGH'), 'Must include HIGH severity');
  assert(CODE_REVIEWER_DEBUGGER_AGENT_MD.includes('REVIEW ONLY'), 'Must define REVIEW ONLY mode');
  assert(
    CODE_REVIEWER_DEBUGGER_AGENT_MD.includes('REVIEW AND FIX'),
    'Must define REVIEW AND FIX mode'
  );
  assert(
    CODE_REVIEWER_DEBUGGER_AGENT_MD.includes('Do not invent line numbers'),
    'Must mandate no invented line numbers'
  );
  assert(
    CODE_REVIEWER_DEBUGGER_SYSTEM_PROMPT.includes('CRITICAL'),
    'System prompt must mandate severity'
  );
  assert(
    CODE_REVIEWER_DEBUGGER_SYSTEM_PROMPT.includes('NEVER repeat raw secrets'),
    'System prompt must mandate secret protection'
  );
  console.log('Testing: Specification & System Prompt Integrity... ✅ PASSED\n');

  // TEST 1: Playwright Code with Fixed Timeout
  console.log('Testing: TEST 1 - Playwright Fixed Timeout vs Locator Assertion...');
  const test1Input = `test("checkout order workflow", async ({ page }) => {
  await page.goto("/checkout");
  await page.click("#checkout");
  await page.waitForTimeout(5000); // Fixed timeout sleep
  await page.click("#confirm");
});`;
  const test1Output = await simulateAgent4(test1Input, 'playwright-ts', { mode: 'review_and_fix' });

  assert(test1Output.includes('[FINDING-PW-001]'), 'Must issue finding for fixed wait');
  assert(
    test1Output.includes('Automation Reliability') || test1Output.includes('Reliability'),
    'Must identify reliability dimension'
  );
  assert(test1Output.includes('waitForTimeout'), 'Must target waitForTimeout');
  assert(
    test1Output.includes('web-first') || test1Output.includes('expect('),
    'Must recommend web-first locator assertion'
  );
  assert(test1Output.includes('Technical Explanation'), 'Must explain technical root cause');
  assert(test1Output.includes('Impact'), 'Must explain impact on CI and test flakiness');
  assert(test1Output.includes('Corrected Code'), 'Must provide corrected code');
  assert(
    test1Output.includes('toBeVisible'),
    'Corrected code must suggest auto-retrying assertion'
  );
  console.log('Testing: TEST 1 - Playwright Fixed Timeout... ✅ PASSED\n');

  // TEST 2: Selenium Java Missing Driver Cleanup
  console.log('Testing: TEST 2 - Selenium Java Missing Driver Cleanup...');
  const test2Input = `package com.enterprise.qa;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.Test;

public class UserLoginTest {
    @Test
    public void testUserAuthentication() {
        WebDriver driver = new ChromeDriver();
        driver.get("https://app.enterprise.io/login");
        // Missing teardown
    }
}`;
  const test2Output = await simulateAgent4(test2Input, 'selenium-java', { mode: 'review_and_fix' });

  assert(
    test2Output.includes('[FINDING-SEL-001]'),
    'Must issue finding for missing driver cleanup'
  );
  assert(test2Output.includes('driver.quit()'), 'Must highlight driver.quit() requirement');
  assert(
    test2Output.includes('Lifecycle') || test2Output.includes('Architecture'),
    'Must identify lifecycle/architectural issue'
  );
  assert(
    test2Output.includes('zombie') ||
      test2Output.includes('leak') ||
      test2Output.includes('resource exhaustion'),
    'Must explain OS resource leak / zombie process impact'
  );
  assert(
    test2Output.includes('@AfterMethod') || test2Output.includes('@AfterEach'),
    'Must recommend teardown hook'
  );
  assert(test2Output.includes('Corrected Code'), 'Must provide corrected code');
  console.log('Testing: TEST 2 - Selenium Java Driver Cleanup... ✅ PASSED\n');

  // TEST 3: REST Assured Missing Response Assertions
  console.log('Testing: TEST 3 - REST Assured Missing Response Assertions...');
  const test3Input = `package com.enterprise.qa.api;

import io.restassured.RestAssured;
import static io.restassured.RestAssured.given;
import org.testng.annotations.Test;

public class AuthApiTest {
    @Test
    public void testLoginApi() {
        given()
            .contentType("application/json")
            .body("{\\"email\\":\\"user@enterprise.io\\", \\"password\\":\\"Secret123\\"}")
        .when()
            .post("/api/v1/auth/login");
        // No assertions!
    }
}`;
  const test3Output = await simulateAgent4(test3Input, 'restassured', { mode: 'review_and_fix' });

  assert(
    test3Output.includes('[FINDING-RA-001]'),
    'Must issue finding for missing response assertions'
  );
  assert(
    test3Output.includes('Functional Correctness'),
    'Must classify under functional correctness'
  );
  assert(test3Output.includes('statusCode'), 'Must recommend statusCode assertion');
  assert(
    test3Output.includes('false positive') || test3Output.includes('silently pass'),
    'Must explain false positive risk'
  );
  assert(test3Output.includes('Corrected Code'), 'Must provide corrected code');
  console.log('Testing: TEST 3 - REST Assured Missing Assertions... ✅ PASSED\n');

  // TEST 4: File Containing Hardcoded API Token (Secret Protection)
  console.log('Testing: TEST 4 - Hardcoded Secret Token & Security Masking...');
  const rawSecret = 'sk_live_9a8b7c6d5e4f3a2b1c0d_prod_secret_token';
  const test4Input = `describe("Payments Gateway API Tests", () => {
  const API_KEY = "Bearer ${rawSecret}";

  it("should retrieve billing invoice", async () => {
    const res = await axios.get("https://api.gateway.io/v1/invoices", {
      headers: { Authorization: API_KEY },
    });
    expect(res.status).toBe(200);
  });
});`;
  const test4Output = await simulateAgent4(test4Input, 'playwright-ts', { mode: 'review_and_fix' });

  assert(test4Output.includes('[FINDING-SEC-001]'), 'Must issue security finding');
  assert(test4Output.includes('CRITICAL'), 'Must classify secret as CRITICAL severity');
  assert(test4Output.includes('Security'), 'Must classify under Security dimension');
  assert(
    test4Output.includes('[REDACTED_API_TOKEN_***]') ||
      test4Output.includes('[REDACTED_API_KEY_***]'),
    'Must mask the secret token'
  );
  assert(
    !test4Output.includes(rawSecret),
    'CRITICAL: Raw secret token must NOT be leaked or repeated in response!'
  );
  assert(
    test4Output.includes('process.env') ||
      test4Output.includes('System.getenv') ||
      test4Output.includes('environment variable'),
    'Must recommend environment variable or secure config'
  );
  console.log('Testing: TEST 4 - Hardcoded Secret Token... ✅ PASSED\n');

  // TEST 5: Multi-File Framework Project Review
  console.log('Testing: TEST 5 - Multi-File Framework Architecture & Traceability...');
  const test5Input = `--- File: src/test/java/com/enterprise/qa/base/BaseTest.java ---
package com.enterprise.qa.base;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.BeforeMethod;
public class BaseTest {
    public static WebDriver driver; // Static driver causes parallel collision
    @BeforeMethod
    public void setup() {
        driver = new ChromeDriver();
    }
}

--- File: src/main/java/com/enterprise/qa/pages/LoginPage.java ---
package com.enterprise.qa.pages;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.testng.Assert;
public class LoginPage {
    private WebDriver driver;
    public LoginPage(WebDriver driver) { this.driver = driver; }
    public void login(String user, String pass) {
        driver.findElement(By.id("user")).sendKeys(user);
        driver.findElement(By.id("pass")).sendKeys(pass);
        driver.findElement(By.id("loginBtn")).click();
        Assert.assertTrue(driver.findElement(By.id("dashboard")).isDisplayed()); // Assertion in POM
    }
}

--- File: src/test/java/com/enterprise/qa/tests/LoginTest.java ---
package com.enterprise.qa.tests;
import com.enterprise.qa.base.BaseTest;
import com.enterprise.qa.pages.LoginPage;
import org.testng.annotations.Test;
public class LoginTest extends BaseTest {
    @Test
    public void testLogin() {
        driver.get("https://app.enterprise.io/login");
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("admin", "admin123");
    }
}`;
  const test5Output = await simulateAgent4(test5Input, 'selenium-java', { mode: 'review_and_fix' });

  assert(test5Output.includes('[FINDING-ARCH-001]'), 'Must detect static driver cross-file issue');
  assert(test5Output.includes('[FINDING-ARCH-002]'), 'Must detect assertions in Page Object Model');
  assert(
    test5Output.includes('[FINDING-ARCH-003]'),
    'Must detect missing lifecycle teardown in BaseTest'
  );
  assert(
    test5Output.includes('ThreadLocal<WebDriver>'),
    'Must recommend ThreadLocal for parallel thread safety'
  );
  assert(test5Output.includes('Inspected Files'), 'Must list inspected files');
  assert(
    test5Output.includes('Explicitly Uninspected Files') || test5Output.includes('not inspected'),
    'Must clearly identify files NOT inspected'
  );
  assert(
    test5Output.includes('pom.xml') || test5Output.includes('testng.xml'),
    'Must identify unuploaded configs'
  );
  assert(
    test5Output.includes('Refactored Production Code Suite'),
    'Must provide refactored code across files'
  );
  console.log('Testing: TEST 5 - Multi-File Framework Architecture... ✅ PASSED\n');

  // Test 6: REVIEW ONLY Mode Verification
  console.log('Testing: Mode Distinction - REVIEW ONLY Mode...');
  const reviewOnlyOutput = await simulateAgent4(test1Input, 'playwright-ts', {
    mode: 'review_only',
  });
  assert(reviewOnlyOutput.includes('REVIEW ONLY'), 'Header must state REVIEW ONLY');
  assert(
    !reviewOnlyOutput.includes('## 4. Refactored Production Code Suite'),
    'REVIEW ONLY mode must not emit full refactored code block'
  );
  console.log('Testing: Mode Distinction - REVIEW ONLY Mode... ✅ PASSED\n');

  // Test 7: Line Number Rule - No Invented Line Numbers
  console.log('Testing: Line Number Rule - No Invented Line Numbers...');
  const noLineNumInput = `test("checkout", async ({ page }) => {
  await page.click("#checkout");
  await page.waitForTimeout(5000);
});`;
  const noLineNumOutput = await simulateAgent4(noLineNumInput, 'playwright-ts', {
    mode: 'review_only',
  });
  assert(
    noLineNumOutput.includes('Line number not provided in input snippet'),
    'Must state line number not provided rather than inventing one'
  );
  console.log('Testing: Line Number Rule... ✅ PASSED\n');

  console.log('======================================================================');
  console.log('🎉 ALL 8 AUDIT & VERIFICATION TESTS PASSED SUCCESSFULLY! (100% COVERAGE)');
  console.log('======================================================================\n');
}

runAllTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
