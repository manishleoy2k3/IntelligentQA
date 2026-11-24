/**
 * Comprehensive Functional Verification Test Suite for Agent 3: Automation Code Generator
 * Validates all required test scenarios:
 * TEST 1: Playwright TypeScript code from login test cases (POM, fixtures, web-first assertions, resilient locators, no arbitrary waits)
 * TEST 2: Selenium Java code for frame handling (switch to frame, explicit waits, defaultContent in finally, exception handling)
 * TEST 3: REST Assured Java API tests (RequestSpecification, auth config, response assertions, negative API tests)
 * TEST 4: Appium Java login automation (UiAutomator2, accessibility locators, driver setup, test isolation)
 * TEST 5: Uploaded framework project context (follows package structure, reuses BaseTest, adheres to existing naming conventions)
 * Plus: Spec & prompt integrity, 10 mandatory sections, zero Thread.sleep, strict POM architecture
 */

const assert = require('assert');
const path = require('path');
const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

const { AUTOMATION_CODE_GENERATOR_SYSTEM_PROMPT } = jiti(
  path.join(process.cwd(), 'src/data/agents/automation-code-generator-agent.ts')
);

async function simulateAgent3(input, techStack = 'playwright-ts') {
  const mod = jiti(path.join(process.cwd(), 'src/app/api/ai/qa-agent/route.ts'));
  const req = {
    headers: {
      get: (header) => (header.toLowerCase() === 'x-gemini-key' ? null : null),
    },
    json: async () => ({
      action: 'automation_code',
      input,
      techStack,
    }),
  };
  const res = await mod.POST(req);
  const data = await res.json();
  return data.output;
}

async function runAllTests() {
  console.log('🧪 Starting Enterprise Verification Suite for Agent 3: Automation Code Generator...\n');

  // Test 0: System Prompt Integrity & 10 Mandatory Sections
  console.log('Testing: Specification & System Prompt Integrity...');
  assert(AUTOMATION_CODE_GENERATOR_SYSTEM_PROMPT.includes('Playwright'), 'Must define Playwright');
  assert(AUTOMATION_CODE_GENERATOR_SYSTEM_PROMPT.includes('Selenium WebDriver 4'), 'Must define Selenium');
  assert(AUTOMATION_CODE_GENERATOR_SYSTEM_PROMPT.includes('REST Assured'), 'Must define REST Assured');
  assert(AUTOMATION_CODE_GENERATOR_SYSTEM_PROMPT.includes('Appium 2.x'), 'Must define Appium');
  assert(AUTOMATION_CODE_GENERATOR_SYSTEM_PROMPT.includes('Proposed File Structure'), 'Must require File Structure');
  assert(AUTOMATION_CODE_GENERATOR_SYSTEM_PROMPT.includes('Common Failures & Debugging Guide'), 'Must require Debugging Guide');
  assert(AUTOMATION_CODE_GENERATOR_SYSTEM_PROMPT.includes('Zero Thread.sleep()'), 'Must forbid arbitrary sleeps');
  console.log('Testing: Specification & System Prompt Integrity... ✅ PASSED');

  // TEST 1: Playwright TypeScript Code from Login Test Cases
  console.log('Testing: TEST 1 - Playwright TypeScript Login Automation...');
  const test1Input = `Generate Playwright TypeScript automated tests from the following test cases:
- TC-001: Login with valid credentials (email & password) -> expect dashboard URL and user avatar visible
- TC-002: Login with empty credentials -> expect inline validation error
- TC-003: Login with invalid password -> expect alert banner 'Invalid credentials'`;
  const output1 = await simulateAgent3(test1Input, 'playwright-ts');

  // Validate 10 Mandatory Sections
  assert(output1.includes('## 1. Framework and Language Assumptions'), 'Must contain Section 1');
  assert(output1.includes('## 2. Proposed File Structure'), 'Must contain Section 2');
  assert(output1.includes('## 3. Required Dependencies'), 'Must contain Section 3');
  assert(output1.includes('## 4. Configuration & Playwright Setup') || output1.includes('## 4. Configuration'), 'Must contain Section 4');
  assert(output1.includes('## 5. Complete Source Code'), 'Must contain Section 5');
  assert(output1.includes('## 6. Test Data Strategy & Fixtures'), 'Must contain Section 6');
  assert(output1.includes('## 7. Execution Instructions'), 'Must contain Section 7');
  assert(output1.includes('## 8. Expected Output & Reporting'), 'Must contain Section 8');
  assert(output1.includes('## 9. Common Failures & Debugging Guide'), 'Must contain Section 9');
  assert(output1.includes('## 10. Troubleshooting & Maintenance Guide'), 'Must contain Section 10');

  // Validate Specific Code Quality Rules
  assert(output1.includes('export class LoginPage'), 'Must implement Page Object Model');
  assert(output1.includes('getByRole') || output1.includes('getByLabel'), 'Must use resilient user-facing locators');
  assert(output1.includes('await expect('), 'Must use web-first auto-retrying assertions');
  assert(!output1.includes('waitForTimeout('), 'Must not use arbitrary sleep');
  console.log('Testing: TEST 1 - Playwright TypeScript Login Automation... ✅ PASSED');

  // TEST 2: Selenium Java Code for Frame Handling
  console.log('Testing: TEST 2 - Selenium Java Frame / Iframe Handling...');
  const test2Input = `Generate Selenium Java TestNG code to automate a rich text editor inside an iframe:
- Page has an iframe 'iframe#mce_0_ifr'
- Inside frame: body#tinymce where we must clear and enter text
- After entering text, return to default content and click bold toolbar button
- Must follow Page Object Model and handle frame switching cleanly with explicit waits`;
  const output2 = await simulateAgent3(test2Input, 'selenium-java');

  assert(output2.includes('driver.switchTo().frame('), 'Must switch to frame');
  assert(output2.includes('driver.switchTo().defaultContent()'), 'Must return to defaultContent');
  assert(output2.includes('finally'), 'Must use finally block to guarantee returning to default content');
  assert(output2.includes('WebDriverWait'), 'Must use explicit WebDriverWait');
  // Confirm Java source code section does not invoke Thread.sleep
  const javaCodeMatches = output2.match(/```java([\s\S]*?)```/g) || [];
  const javaCode = javaCodeMatches.join('\n');
  assert(!javaCode.includes('Thread.sleep'), 'Must not call Thread.sleep in executable code');
  console.log('Testing: TEST 2 - Selenium Java Frame Handling... ✅ PASSED');

  // TEST 3: REST Assured Java API Tests
  console.log('Testing: TEST 3 - REST Assured Java API Automation...');
  const test3Input = `Generate REST Assured Java tests for Payment Transfer API:
Endpoint: POST /payments/transfers
Request: JSON body with recipientAccountId, amount, currency, memo
Headers: Authorization (Bearer token), Idempotency-Key
Scenarios:
- Positive: Valid payload returns HTTP 201 with transactionId
- Negative: Missing token returns HTTP 401
- Negative: Missing amount returns HTTP 400`;
  const output3 = await simulateAgent3(test3Input, 'restassured');

  assert(output3.includes('RequestSpecification') || output3.includes('RequestSpecBuilder'), 'Must use RequestSpecification');
  assert(output3.includes('statusCode(201)'), 'Must assert HTTP 201');
  assert(output3.includes('statusCode(401)'), 'Must assert HTTP 401');
  assert(output3.includes('statusCode(400)'), 'Must assert HTTP 400');
  assert(output3.includes('Idempotency-Key'), 'Must handle idempotency headers');
  console.log('Testing: TEST 3 - REST Assured Java API Automation... ✅ PASSED');

  // TEST 4: Appium Java Login Automation
  console.log('Testing: TEST 4 - Appium Java Mobile Automation...');
  const test4Input = `Generate Appium Java automation for native Android login flow:
- Platform: Android with UiAutomator2
- Screen: Login screen with username, password, login button
- Verify valid login navigates to dashboard
- Verify invalid login displays error banner`;
  const output4 = await simulateAgent3(test4Input, 'selenium-java');

  assert(output4.includes('AndroidDriver'), 'Must configure AndroidDriver');
  assert(output4.includes('UiAutomator2Options'), 'Must use modern UiAutomator2Options');
  assert(output4.includes('AppiumBy.accessibilityId') || output4.includes('AppiumBy.id'), 'Must use AppiumBy locators');
  assert(output4.includes('MobileLoginPage'), 'Must implement Mobile Page Object Model');
  assert(output4.includes('@AfterMethod') && output4.includes('driver.remove()'), 'Must enforce test isolation and thread cleanup');
  console.log('Testing: TEST 4 - Appium Java Mobile Automation... ✅ PASSED');

  // TEST 5: Uploaded Framework Project Context Ingestion
  console.log('Testing: TEST 5 - Project Context & Base Class Ingestion...');
  const test5Input = `[Attached Project File: src/test/java/com/fintech/core/base/CustomFintechBaseTest.java]
package com.fintech.core.base;
import org.openqa.selenium.WebDriver;
public class CustomFintechBaseTest {
    protected WebDriver driver;
}

Implement test automation for User Profile Update in this existing framework.`;
  const output5 = await simulateAgent3(test5Input, 'selenium-java');

  assert(output5.includes('com.fintech.core'), 'Must reuse existing package name com.fintech.core');
  assert(output5.includes('extends CustomFintechBaseTest'), 'Must extend existing CustomFintechBaseTest');
  assert(output5.includes('UserProfilePage'), 'Must create appropriate Page Object');
  console.log('Testing: TEST 5 - Project Context Ingestion... ✅ PASSED');

  console.log('\n========================================');
  console.log('Agent 3 Enterprise Test Verification Summary:');
  console.log('Total Tests Run: 6');
  console.log('Passed: 6');
  console.log('Failed: 0');
  console.log('========================================\n');
}

runAllTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
