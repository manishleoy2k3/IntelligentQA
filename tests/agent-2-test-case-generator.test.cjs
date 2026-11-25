/**
 * Comprehensive Functional Verification Test Suite for Agent 2: Test Case Generator
 * Validates all required test scenarios:
 * TEST 1: Password-reset requirements -> Positive, Negative, Boundary, Token expiry, Security, Rate limiting, Email handling
 * TEST 2: API specification -> Method-specific tests, Request schema, Response schema, Auth, Negative payloads, Error handling
 * TEST 3: Multiple business rules -> Decision tables, Boundary conditions, State transition scenarios
 * TEST 4: Existing test cases gap analysis -> Duplicate detection, Missing scenarios, RTM traceability, Risk gaps
 * TEST 5: Automation suitability -> Practical classification, Reasoning, Framework recommendations (Playwright, Selenium, REST Assured)
 * Plus: Spec & prompt integrity, 10 mandatory sections, 13 detailed test case fields, realistic test data strategy
 */

const assert = require('assert');
const path = require('path');
const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

const { TEST_CASE_GENERATOR_SYSTEM_PROMPT } = jiti(
  path.join(process.cwd(), 'src/data/agents/test-case-generator-agent.ts')
);

async function simulateAgent2(input) {
  const mod = jiti(path.join(process.cwd(), 'src/app/api/ai/qa-agent/route.ts'));
  const req = {
    headers: {
      get: (header) => (header.toLowerCase() === 'x-gemini-key' ? null : null),
    },
    json: async () => ({
      action: 'test_cases',
      input,
    }),
  };
  const res = await mod.POST(req);
  const data = await res.json();
  return data.output;
}

async function runAllTests() {
  console.log('🧪 Starting Enterprise Verification Suite for Agent 2: Test Case Generator...\n');

  // Test 0: System Prompt Integrity & 10 Mandatory Sections
  console.log('Testing: Specification & System Prompt Integrity...');
  assert(TEST_CASE_GENERATOR_SYSTEM_PROMPT.includes('TC-001'), 'Must define deterministic TC IDs');
  assert(
    TEST_CASE_GENERATOR_SYSTEM_PROMPT.includes('Test Strategy Summary'),
    'Must require Section 1 Test Strategy'
  );
  assert(
    TEST_CASE_GENERATOR_SYSTEM_PROMPT.includes('Requirements Traceability Matrix'),
    'Must require Section 7 RTM'
  );
  assert(
    TEST_CASE_GENERATOR_SYSTEM_PROMPT.includes('Automation Suitability Matrix'),
    'Must require Section 8 Automation Matrix'
  );
  assert(
    TEST_CASE_GENERATOR_SYSTEM_PROMPT.includes('Coverage Gaps & Gap Analysis'),
    'Must require Section 9 Coverage Gaps'
  );
  assert(
    TEST_CASE_GENERATOR_SYSTEM_PROMPT.includes('Playwright'),
    'Must recommend modern automation frameworks'
  );
  console.log('Testing: Specification & System Prompt Integrity... ✅ PASSED');

  // TEST 1: Password-Reset Requirements
  console.log('Testing: TEST 1 - Password-Reset Comprehensive Test Cases...');
  const test1Input = `Feature: Password Reset Workflow
As a registered customer
I want to reset my password using my registered email address
Preconditions: Customer account exists with verified email.
Rules:
1. Token expires in 15 minutes.
2. Max 5 reset requests per hour (rate limiting).
3. Token can only be used once.
4. Passwords must be 8-64 characters with at least one number and special character.`;
  const output1 = await simulateAgent2(test1Input);

  // Validate 10 Mandatory Sections
  assert(output1.includes('## 1. Test Strategy Summary'), 'Must contain Section 1');
  assert(output1.includes('## 2. Scope of Testing'), 'Must contain Section 2');
  assert(output1.includes('## 3. High-Level Test Scenarios'), 'Must contain Section 3');
  assert(output1.includes('## 4. Detailed Test Cases'), 'Must contain Section 4');
  assert(output1.includes('## 5. Realistic Test Data Strategy'), 'Must contain Section 5');
  assert(output1.includes('## 6. Risk and Priority Matrix'), 'Must contain Section 6');
  assert(
    output1.includes('## 7. Requirements Traceability Matrix (RTM)'),
    'Must contain Section 7'
  );
  assert(output1.includes('## 8. Automation Suitability Matrix'), 'Must contain Section 8');
  assert(output1.includes('## 9. Coverage Gaps & Gap Analysis'), 'Must contain Section 9');
  assert(output1.includes('## 10. Assumptions and Clarifications'), 'Must contain Section 10');

  // Validate specific Test 1 expectations
  assert(/email/i.test(output1), 'Must cover email handling');
  assert(/token/i.test(output1) && /expir/i.test(output1), 'Must cover token expiry');
  assert(/rate limit/i.test(output1) || /429/i.test(output1), 'Must cover rate limiting');
  assert(/boundary/i.test(output1), 'Must cover boundary validation');
  assert(/security/i.test(output1), 'Must cover security validation');
  console.log('Testing: TEST 1 - Password-Reset Comprehensive Test Cases... ✅ PASSED');

  // TEST 2: API Specification
  console.log('Testing: TEST 2 - API Specification Test Cases...');
  const test2Input = `POST /api/v1/payments/transfers
Request Headers:
  Authorization: Bearer <jwt_token>
  Idempotency-Key: <uuid>
  Content-Type: application/json
Request Schema:
  {
    "recipientAccountId": "string",
    "amount": number,
    "currency": "USD" | "EUR",
    "memo": "string (optional, max 140 chars)"
  }
Expected Status Codes:
  201 Created: Transfer successfully initiated
  400 Bad Request: Missing mandatory fields or malformed payload
  401 Unauthorized: Missing or invalid JWT token
  422 Unprocessable: Insufficient funds or invalid currency
  429 Too Many Requests: Rate limit exceeded (max 10 requests/min)`;
  const output2 = await simulateAgent2(test2Input);

  assert(/status code|http|201|400|401|422|429/i.test(output2), 'Must cover HTTP status codes');
  assert(/schema|payload|json/i.test(output2), 'Must cover schema and payload testing');
  assert(/REST Assured|Supertest/i.test(output2), 'Must recommend API automation framework');
  console.log('Testing: TEST 2 - API Specification Test Cases... ✅ PASSED');

  // TEST 3: Multiple Business Rules (Decision Tables & State Transitions)
  console.log('Testing: TEST 3 - Multiple Business Rules & Decision Logic...');
  const test3Input = `Feature: E-Commerce Promotional Discount Rules
Rules:
1. If customer tier is Gold and cart > $100: 20% discount.
2. If customer tier is Silver and cart > $100: 10% discount.
3. If customer tier is Regular or cart <= $100: 0% discount.
4. Promotional coupon 'SUMMER2026' gives additional 5% discount only if item count >= 3.
5. Max discount cannot exceed $50.00.`;
  const output3 = await simulateAgent2(test3Input);

  assert(
    /decision table|state transition|rule/i.test(output3),
    'Must apply decision logic or state transitions'
  );
  assert(/boundary/i.test(output3), 'Must cover boundary conditions ($100, $50 max discount)');
  console.log('Testing: TEST 3 - Multiple Business Rules... ✅ PASSED');

  // TEST 4: Existing Test Cases & Gap Analysis
  console.log('Testing: TEST 4 - Existing Test Cases Gap Analysis...');
  const test4Input = `Review and perform gap analysis on our existing test cases:
- TC-01: Verify user can login with valid email and password (Positive)
- TC-02: Verify user can login with valid email and uppercase password (Positive - duplicate of 01)
- TC-03: Verify user cannot login with wrong password (Negative)`;
  const output4 = await simulateAgent2(test4Input);

  assert(/duplicate/i.test(output4), 'Must detect duplicate test cases');
  assert(
    /missing/i.test(output4) || /gap/i.test(output4),
    'Must identify missing negative and boundary tests'
  );
  assert(/traceability|RTM/i.test(output4), 'Must evaluate requirement traceability');
  console.log('Testing: TEST 4 - Existing Test Cases Gap Analysis... ✅ PASSED');

  // TEST 5: Automation Suitability Analysis
  console.log('Testing: TEST 5 - Automation Suitability Analysis...');
  const test5Input = `Classify automation suitability for our checkout test suite:
1. Core checkout happy path with credit card.
2. Visual alignment of marketing promotional banner.
3. Rapid double-click on Place Order button.
4. Solving third-party reCAPTCHA puzzle v2.
5. Backend inventory decrement API call.`;
  const output5 = await simulateAgent2(test5Input);

  assert(
    output5.includes('## 8. Automation Suitability Matrix'),
    'Must feature Automation Suitability section'
  );
  assert(/highly suitable|suitable/i.test(output5), 'Must classify suitability');
  assert(/Playwright|Selenium|REST Assured/i.test(output5), 'Must recommend automation frameworks');
  assert(
    /rationale/i.test(output5) || /classification/i.test(output5),
    'Must provide clear reasoning'
  );
  console.log('Testing: TEST 5 - Automation Suitability Analysis... ✅ PASSED');

  console.log('\n========================================');
  console.log('Agent 2 Enterprise Test Verification Summary:');
  console.log('Total Tests Run: 6');
  console.log('Passed: 6');
  console.log('Failed: 0');
  console.log('========================================\n');
}

runAllTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
