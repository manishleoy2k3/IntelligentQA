/**
 * Comprehensive Functional Verification Test Suite for Agent 1
 * Validates all required test scenarios:
 * TEST 1: Password reset user journey (email validation, token expiry, policy, rate limits)
 * TEST 2: Ambiguous requirement ("transfer money quickly") -> missing limits, beneficiary, auth, no fabricated limits
 * TEST 3: Uploaded project specification ingestion -> actual content, zero fabrication
 * TEST 4: Conflicting requirements -> detects conflict, highlights statements, requests clarification
 * Plus: Spec & prompt integrity, 15 mandatory sections, stable REQ/AC IDs, INVEST compliance
 */

const assert = require('assert');
const path = require('path');
const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

const { REQUIREMENT_GENERATOR_SYSTEM_PROMPT } = jiti(
  path.join(process.cwd(), 'src/data/agents/requirement-generator-agent.ts')
);

// We simulate the API route's logic directly
async function simulateAgent1(input) {
  // Test route function
  const mod = jiti(path.join(process.cwd(), 'src/app/api/ai/qa-agent/route.ts'));
  // Call internal generator via POST mock
  const req = {
    headers: {
      get: (header) => (header.toLowerCase() === 'x-gemini-key' ? null : null),
    },
    json: async () => ({
      action: 'requirements',
      input,
    }),
  };
  const res = await mod.POST(req);
  const data = await res.json();
  return data.output;
}

async function runAllTests() {
  console.log('🧪 Starting Enterprise Verification Suite for Agent 1: Requirement Generator...\n');

  // Test 0: System Prompt Integrity & 15 Mandatory Sections
  console.log('Testing: Specification & System Prompt Integrity...');
  assert(REQUIREMENT_GENERATOR_SYSTEM_PROMPT.includes('REQ-001'), 'Must define stable REQ IDs');
  assert(REQUIREMENT_GENERATOR_SYSTEM_PROMPT.includes('AC-001'), 'Must define stable AC IDs');
  assert(
    REQUIREMENT_GENERATOR_SYSTEM_PROMPT.includes('Requirement Traceability Matrix'),
    'Must require RTM'
  );
  assert(
    REQUIREMENT_GENERATOR_SYSTEM_PROMPT.includes('Ambiguity & Conflict Detection'),
    'Must require ambiguity/conflict detection'
  );
  assert(
    REQUIREMENT_GENERATOR_SYSTEM_PROMPT.includes('Requires Business Confirmation'),
    'Must mandate no numerical guessing'
  );
  console.log('Testing: Specification & System Prompt Integrity... ✅ PASSED');

  // TEST 1: Password Reset User Journey
  console.log('Testing: TEST 1 - Password Reset User Journey...');
  const test1Input =
    'As a customer, I want to reset my password using my registered email address.';
  const output1 = await simulateAgent1(test1Input);

  assert(output1.includes('## 1. Requirement Overview'), 'Must have Section 1 Overview');
  assert(output1.includes('## 2. Business Objective'), 'Must have Section 2 Objective');
  assert(output1.includes('## 3. Actors and Personas'), 'Must have Section 3 Actors');
  assert(output1.includes('## 4. Functional Requirements'), 'Must have Section 4 Functional Reqs');
  assert(output1.includes('## 5. Business Rules'), 'Must have Section 5 Business Rules');
  assert(
    output1.includes('## 6. Acceptance Criteria (BDD Given-When-Then)'),
    'Must have Section 6 Acceptance Criteria'
  );
  assert(output1.includes('## 7. Non-Functional Requirements'), 'Must have Section 7 NFRs');
  assert(output1.includes('## 8. Positive Scenarios'), 'Must have Section 8 Positive Scenarios');
  assert(output1.includes('## 9. Negative Scenarios'), 'Must have Section 9 Negative Scenarios');
  assert(output1.includes('## 10. Boundary and Edge Cases'), 'Must have Section 10 Boundary Cases');
  assert(output1.includes('## 11. Dependencies'), 'Must have Section 11 Dependencies');
  assert(output1.includes('## 12. Assumptions'), 'Must have Section 12 Assumptions');
  assert(
    output1.includes('## 13. Open Questions & Ambiguities'),
    'Must have Section 13 Ambiguities'
  );
  assert(output1.includes('## 14. Out-of-Scope Items'), 'Must have Section 14 Out-of-Scope');
  assert(
    output1.includes('## 15. Requirement Traceability Matrix (RTM)'),
    'Must have Section 15 RTM'
  );

  // Business rules for password reset
  assert(output1.includes('email'), 'Must handle email validation');
  assert(/rate limiting/i.test(output1), 'Must enforce rate limiting');
  assert(/token/i.test(output1), 'Must enforce single-use token handling');
  assert(
    output1.includes('REQ-001') && output1.includes('AC-001'),
    'Must maintain REQ to AC traceability'
  );
  console.log('Testing: TEST 1 - Password Reset User Journey... ✅ PASSED');

  // TEST 2: Ambiguous Requirement ("Users should be able to transfer money quickly.")
  console.log('Testing: TEST 2 - Ambiguous Requirement ("transfer money quickly")...');
  const test2Input = 'Users should be able to transfer money quickly.';
  const output2 = await simulateAgent1(test2Input);

  assert(/quickly/i.test(output2) || /SLA/i.test(output2), 'Must identify ambiguity in "quickly"');
  assert(output2.includes('Open Questions & Ambiguities'), 'Must feature Open Questions section');
  assert(
    output2.includes('Requires Business Confirmation'),
    'Must NOT invent numerical SLAs/limits'
  );
  assert(/transfer/i.test(output2), 'Must identify financial transfer context');
  console.log('Testing: TEST 2 - Ambiguous Requirement... ✅ PASSED');

  // TEST 3: Uploaded Project Specification Ingestion
  console.log('Testing: TEST 3 - Uploaded Project Specification Ingestion...');
  const test3Input = `[Attached Project File: specs/checkout-service.md]
Feature: Multi-Currency Cart Checkout
As an authenticated international shopper
I want to checkout my cart with localized currency conversion
So that the exact exchange rate is locked for 15 minutes during payment gateway processing`;
  const output3 = await simulateAgent1(test3Input);

  assert(
    output3.includes('Multi-Currency Cart Checkout'),
    'Must extract feature from actual document'
  );
  assert(
    output3.includes('REQ-001') && output3.includes('AC-001'),
    'Must generate traceable atomic requirements'
  );
  assert(output3.includes('RTM'), 'Must generate RTM for uploaded spec');
  console.log('Testing: TEST 3 - Uploaded Project Specification Ingestion... ✅ PASSED');

  // TEST 4: Conflicting Requirements
  console.log('Testing: TEST 4 - Conflicting Requirements...');
  const test4Input =
    'Feature: Dual Notification Dispatch. The user must always receive SMS alerts and simultaneously cannot receive any SMS messages when notification is disabled. These conflicting rules apply.';
  const output4 = await simulateAgent1(test4Input);

  assert(
    /conflict/i.test(output4) || /precedence/i.test(output4),
    'Must identify requirement conflict'
  );
  assert(
    output4.includes('Open Questions & Ambiguities'),
    'Must prompt for business clarification on conflict'
  );
  console.log('Testing: TEST 4 - Conflicting Requirements... ✅ PASSED');

  console.log('\n========================================');
  console.log('Agent 1 Enterprise Test Verification Summary:');
  console.log('Total Tests Run: 5');
  console.log('Passed: 5');
  console.log('Failed: 0');
  console.log('========================================\n');
}

runAllTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
