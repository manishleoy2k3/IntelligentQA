/**
 * Comprehensive Functional Verification Test Suite for Agent 01:
 * Requirement Analysis & Ambiguity Detection Engine
 *
 * Validates all 12 Mandatory Functional Test Scenarios:
 * TEST 1 — DIRECT CHAT INPUT (Payment processing time, notification channel, timing, failure behaviour)
 * TEST 2 — FUNCTIONAL AMBIGUITY (Profile management operations and permissions)
 * TEST 3 — BEHAVIOURAL AMBIGUITY (Failed login attempts, lockout, retry limits)
 * TEST 4 — CONDITIONAL AMBIGUITY (Customer eligibility and discount rules)
 * TEST 5 — TEMPORAL AMBIGUITY (Expired accounts and automated deactivation timing)
 * TEST 6 — SEMANTIC AMBIGUITY (Fast and user-friendly search)
 * TEST 7 — PROCESS AMBIGUITY (Refund approvals and workflow ownership)
 * TEST 8 — QUANTITATIVE AMBIGUITY (High number of concurrent transactions)
 * TEST 9 — WORD DOCUMENT IMPORT (Preserves paragraph/heading references)
 * TEST 10 — EXCEL IMPORT (Preserves worksheet names and row numbers)
 * TEST 11 — CONFLICTING REQUIREMENTS (Detects contradictory rules and cites both sources)
 * TEST 12 — CLEAR REQUIREMENT (Does not report false positive ambiguity on clear specs)
 * Plus:
 * - Table format and exact 7 column headers
 * - 7 Core Ambiguity Categories check
 * - Summary section metrics & Quality Assessment
 * - Questions Requiring Business/Product Owner Clarification
 */

const assert = require('assert');
const path = require('path');
const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

const { REQUIREMENT_ANALYZER_SYSTEM_PROMPT, REQUIREMENT_GENERATOR_SYSTEM_PROMPT } = jiti(
  path.join(process.cwd(), 'src/data/agents/requirement-generator-agent.ts')
);

// We simulate the API route's logic directly
async function simulateAgent1(input) {
  const mod = jiti(path.join(process.cwd(), 'src/app/api/ai/qa-agent/route.ts'));
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
  console.log(
    '🧪 Starting Verification Suite for Agent 01: Requirement Analysis & Ambiguity Detection Engine...\n'
  );

  // TEST 0: System Prompt & Specification Integrity
  console.log('Testing: TEST 0 - System Prompt & Specification Integrity...');
  assert(
    REQUIREMENT_ANALYZER_SYSTEM_PROMPT.includes(
      'Senior Business Analyst, Principal QA Architect and Requirement Analysis Specialist'
    ),
    'Must define role'
  );
  assert(
    REQUIREMENT_ANALYZER_SYSTEM_PROMPT.includes('NOT a Requirement Generator'),
    'Must explicitly state it is NOT a Requirement Generator'
  );
  assert(
    REQUIREMENT_ANALYZER_SYSTEM_PROMPT.includes(
      'Serial Number | Ambiguity Title | Ambiguity | Ambiguity Type | Priority | Line Number | Recommendation'
    ),
    'Must specify exact 7 column headers'
  );
  const categories = [
    'FUNCTIONAL AMBIGUITY',
    'BEHAVIOURAL AMBIGUITY',
    'CONDITIONAL AMBIGUITY',
    'TEMPORAL AMBIGUITY',
    'SEMANTIC AMBIGUITY',
    'PROCESS AMBIGUITY',
    'QUANTITATIVE AMBIGUITY',
  ];
  for (const cat of categories) {
    assert(REQUIREMENT_ANALYZER_SYSTEM_PROMPT.includes(cat), `Must document category: ${cat}`);
  }
  console.log('Testing: TEST 0 - System Prompt & Specification Integrity... ✅ PASSED');

  // TEST 1 — DIRECT CHAT INPUT
  console.log('Testing: TEST 1 — Direct Chat Input (Payment notifications)...');
  const test1Input =
    'The system should process payments quickly and notify users when transactions are completed.';
  const output1 = await simulateAgent1(test1Input);

  assert(
    output1.includes(
      'Serial Number | Ambiguity Title | Ambiguity | Ambiguity Type | Priority | Line Number | Recommendation'
    ),
    'Must have required table header'
  );
  assert(
    /processing time/i.test(output1) || /latency/i.test(output1),
    'Must identify undefined payment processing time'
  );
  assert(/notification channel/i.test(output1), 'Must identify unclear notification channel');
  assert(/notification timing/i.test(output1), 'Must identify unclear notification timing');
  assert(/failure/i.test(output1), 'Must identify missing transaction failure behaviour');
  assert(output1.includes('## Analysis Summary'), 'Must contain Analysis Summary section');
  assert(
    output1.includes('Questions Requiring Business/Product Owner Clarification'),
    'Must contain Clarification Questions section'
  );
  console.log('Testing: TEST 1 — Direct Chat Input... ✅ PASSED');

  // TEST 2 — FUNCTIONAL AMBIGUITY
  console.log('Testing: TEST 2 — Functional Ambiguity (Profile management)...');
  const test2Input = 'Users should be able to manage their profiles.';
  const output2 = await simulateAgent1(test2Input);

  assert(
    /profile/i.test(output2) && /manage/i.test(output2),
    'Must identify profile management ambiguity'
  );
  assert(output2.includes('Functional'), 'Must classify as Functional Ambiguity');
  assert(
    /permissions|operations|crud/i.test(output2),
    'Must identify unclear operations and permissions'
  );
  console.log('Testing: TEST 2 — Functional Ambiguity... ✅ PASSED');

  // TEST 3 — BEHAVIOURAL AMBIGUITY
  console.log('Testing: TEST 3 — Behavioural Ambiguity (Failed login attempts)...');
  const test3Input = 'The application should handle failed login attempts appropriately.';
  const output3 = await simulateAgent1(test3Input);

  assert(output3.includes('Behavioural'), 'Must classify as Behavioural Ambiguity');
  assert(
    /retry|lockout|attempts/i.test(output3),
    'Must identify undefined retry limits and lockout behaviour'
  );
  console.log('Testing: TEST 3 — Behavioural Ambiguity... ✅ PASSED');

  // TEST 4 — CONDITIONAL AMBIGUITY
  console.log('Testing: TEST 4 — Conditional Ambiguity (Customer discounts)...');
  const test4Input = 'Eligible customers can receive discounts.';
  const output4 = await simulateAgent1(test4Input);

  assert(output4.includes('Conditional'), 'Must classify as Conditional Ambiguity');
  assert(
    /eligib/i.test(output4) && /discount/i.test(output4),
    'Must identify missing eligibility criteria and discount rules'
  );
  console.log('Testing: TEST 4 — Conditional Ambiguity... ✅ PASSED');

  // TEST 5 — TEMPORAL AMBIGUITY
  console.log('Testing: TEST 5 — Temporal Ambiguity (Expired accounts)...');
  const test5Input = 'Expired accounts should be deactivated automatically.';
  const output5 = await simulateAgent1(test5Input);

  assert(output5.includes('Temporal'), 'Must classify as Temporal Ambiguity');
  assert(/expiry|inactivity/i.test(output5), 'Must identify missing expiry criteria');
  assert(/schedule|timing|cadence/i.test(output5), 'Must identify execution timing');
  console.log('Testing: TEST 5 — Temporal Ambiguity... ✅ PASSED');

  // TEST 6 — SEMANTIC AMBIGUITY
  console.log('Testing: TEST 6 — Semantic Ambiguity (Fast and user-friendly search)...');
  const test6Input = 'The application should provide fast and user-friendly search.';
  const output6 = await simulateAgent1(test6Input);

  assert(output6.includes('Semantic'), 'Must classify as Semantic Ambiguity');
  assert(/subjective|user-friendly|fast/i.test(output6), 'Must identify subjective terminology');
  assert(/measurable|metric|sla/i.test(output6), 'Must identify missing measurable expectations');
  console.log('Testing: TEST 6 — Semantic Ambiguity... ✅ PASSED');

  // TEST 7 — PROCESS AMBIGUITY
  console.log('Testing: TEST 7 — Process Ambiguity (Refund approvals)...');
  const test7Input = 'Refunds must be approved before they are processed.';
  const output7 = await simulateAgent1(test7Input);

  assert(output7.includes('Process'), 'Must classify as Process Ambiguity');
  assert(
    /approv/i.test(output7) && /role|ownership|workflow|rejection/i.test(output7),
    'Must identify missing approval ownership and workflow'
  );
  console.log('Testing: TEST 7 — Process Ambiguity... ✅ PASSED');

  // TEST 8 — QUANTITATIVE AMBIGUITY
  console.log(
    'Testing: TEST 8 — Quantitative Ambiguity (High number of concurrent transactions)...'
  );
  const test8Input = 'The application should support a high number of concurrent transactions.';
  const output8 = await simulateAgent1(test8Input);

  assert(output8.includes('Quantitative'), 'Must classify as Quantitative Ambiguity');
  assert(
    /tps|throughput|capacity|measurable|concurrent/i.test(output8),
    'Must identify missing measurable capacity and thresholds'
  );
  console.log('Testing: TEST 8 — Quantitative Ambiguity... ✅ PASSED');

  // TEST 9 — WORD DOCUMENT IMPORT
  console.log('Testing: TEST 9 — Word Document Import...');
  const test9Input = `[Heading: 1. User Administration]
[Paragraph 1] Users should be able to manage their profiles.
[Paragraph 2] Expired accounts should be deactivated automatically.`;
  const output9 = await simulateAgent1(test9Input);

  assert(
    output9.includes('Paragraph 1') || output9.includes('Paragraph 2'),
    'Must preserve paragraph references in Line Number column'
  );
  assert(
    output9.includes('Functional') || output9.includes('Temporal'),
    'Must identify ambiguities in document content'
  );
  console.log('Testing: TEST 9 — Word Document Import... ✅ PASSED');

  // TEST 10 — EXCEL IMPORT
  console.log('Testing: TEST 10 — Excel Import...');
  const test10Input = `[Sheet: Requirements, Row: 2] Eligible customers can receive discounts.
[Sheet: Requirements, Row: 3] Refunds must be approved before they are processed.`;
  const output10 = await simulateAgent1(test10Input);

  assert(
    output10.includes('Requirements, Row 2') || output10.includes('Requirements, Row 3'),
    'Must preserve worksheet name and row number'
  );
  assert(
    output10.includes('Conditional') || output10.includes('Process'),
    'Must detect ambiguities with sheet traceability'
  );
  console.log('Testing: TEST 10 — Excel Import... ✅ PASSED');

  // TEST 11 — CONFLICTING REQUIREMENTS
  console.log('Testing: TEST 11 — Conflicting Requirements...');
  const test11Input =
    'Feature: Dual Notification Dispatch. The user must always receive SMS alerts and simultaneously cannot receive any SMS messages when notification is disabled. These conflicting rules apply.';
  const output11 = await simulateAgent1(test11Input);

  assert(/contradict|conflict/i.test(output11), 'Must identify requirement contradiction');
  assert(output11.includes('High'), 'Contradiction must have High priority');
  assert(/precedence|clarif/i.test(output11), 'Must recommend Product Owner clarification');
  console.log('Testing: TEST 11 — Conflicting Requirements... ✅ PASSED');

  // TEST 12 — CLEAR REQUIREMENT
  console.log('Testing: TEST 12 — Clear Requirement (Password criteria)...');
  const test12Input =
    'The user must enter a password containing at least 12 characters, including one uppercase letter, one lowercase letter, one digit and one special character.';
  const output12 = await simulateAgent1(test12Input);

  assert(!output12.includes('| 1 |'), 'Must NOT report ambiguity for already-clear requirement');
  assert(output12.includes('Total Ambiguities Identified**: 0'), 'Total ambiguities must be 0');
  assert(output12.includes('Good'), 'Overall quality assessment must be Good');
  console.log('Testing: TEST 12 — Clear Requirement... ✅ PASSED');

  console.log('\n========================================');
  console.log('Agent 01 Requirement Analysis Engine Verification Summary:');
  console.log('Total Scenarios Tested: 13 (Prompt Integrity + Tests 1 to 12)');
  console.log('Passed: 13');
  console.log('Failed: 0');
  console.log('========================================\n');
}

runAllTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
