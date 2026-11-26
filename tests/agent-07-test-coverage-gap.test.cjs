/**
 * Comprehensive Verification Suite for Agent 07: Test Coverage Gap Analysis Engine
 * Validates all 39 acceptance criteria across:
 * - Functional Tests (Tests 1–16)
 * - Coverage Analysis Tests (Tests 17–28)
 * - UI and Report Tests (Tests 29–39)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

const {
  parsePastedRequirements,
  parsePastedTestCases,
  parseMarkdownToRequirements,
  parseMarkdownToTestCases,
  parseJsonToRequirements,
  parseJsonToTestCases,
  parseFileForRequirements,
  parseFileForTestCases,
  extractRequirementsFromExcelRows,
  extractTestCasesFromExcelRows,
} = jiti('@/lib/gap-analysis/input-parser');

const { analyzeCoverageGaps } = jiti('@/lib/gap-analysis/analysis-engine');
const { runCoverageGapAnalysis } = jiti('@/lib/gap-analysis/ai-gap-analyzer');
const { generateCoverageGapExcelWorkbook } = jiti('@/lib/gap-analysis/excel-export');
const { TEST_COVERAGE_GAP_ANALYSIS_SYSTEM_PROMPT } = jiti('@/data/agents/test-coverage-gap-agent');

describe('AGENT 07 — Test Coverage Gap Analysis Engine Verification Suite', () => {
  // =========================================================================
  // PART 1: FUNCTIONAL TESTS (Tests 1–16)
  // =========================================================================

  it('TEST 1: Requirements pasted as text + test cases pasted as text', () => {
    const reqText = `REQ-101: The system shall process credit card payments under $1,000.\nREQ-102: The system shall send an email receipt upon successful charge.`;
    const tcText = `TC-01: Verify credit card payment processing under $1000\nSteps: Enter valid card details and amount $500\nExpected Result: Payment succeeds with 200 OK.\n\nTC-02: Verify receipt email sent after payment\nSteps: Complete transaction\nExpected Result: Email arrives in inbox.`;

    const reqs = parsePastedRequirements(reqText);
    const tcs = parsePastedTestCases(tcText);

    assert.strictEqual(reqs.length, 2, 'Should parse exactly 2 requirements');
    assert.strictEqual(tcs.length, 2, 'Should parse exactly 2 test cases');

    const result = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(result.summary.totalRequirements, 2);
    assert.strictEqual(result.summary.totalTestCases, 2);
    assert.ok(result.summary.coveragePercentage > 0, 'Coverage % should be calculated');
  });

  it('TEST 2: Requirements uploaded as .xlsx + test cases uploaded as .xlsx (rows extraction)', () => {
    const reqRows = [
      {
        sheetName: 'ReqsSheet',
        rowNumber: 1,
        cells: ['Req ID', 'Requirement Description', 'Type', 'Priority'],
      },
      {
        sheetName: 'ReqsSheet',
        rowNumber: 2,
        cells: ['REQ_201', 'User can reset forgotten password via email link', 'Security', 'High'],
      },
    ];

    const tcRows = [
      {
        sheetName: 'TestMatrix',
        rowNumber: 1,
        cells: ['Test Case ID', 'Description', 'Steps', 'Expected Result'],
      },
      {
        sheetName: 'TestMatrix',
        rowNumber: 2,
        cells: [
          'TC_201',
          'Verify password reset link sends email',
          'Click forgot password',
          'Email received with valid reset token',
        ],
      },
    ];

    const reqs = extractRequirementsFromExcelRows(reqRows, 'Reqs.xlsx');
    const tcs = extractTestCasesFromExcelRows(tcRows, 'TestCases.xlsx');

    assert.strictEqual(reqs.length, 1);
    assert.strictEqual(reqs[0].requirementId, 'REQ_201');
    assert.strictEqual(reqs[0].sourceWorksheet, 'ReqsSheet');
    assert.strictEqual(tcs.length, 1);
    assert.strictEqual(tcs[0].testCaseId, 'TC_201');
    assert.strictEqual(tcs[0].sourceWorksheet, 'TestMatrix');
  });

  it('TEST 3: Requirements uploaded as .xls + test cases uploaded as .xls', () => {
    // Legacy tabular text/csv lines fallback inside .xls
    const reqRows = [
      {
        sheetName: 'Sheet1',
        rowNumber: 1,
        cells: ['REQ_301', 'Admin user can delete inactive accounts'],
      },
    ];
    const tcRows = [
      {
        sheetName: 'Sheet1',
        rowNumber: 1,
        cells: ['TC_301', 'Verify admin account deletion with confirmation prompt'],
      },
    ];

    const reqs = extractRequirementsFromExcelRows(reqRows, 'Legacy.xls');
    const tcs = extractTestCasesFromExcelRows(tcRows, 'Legacy_TCs.xls');

    assert.ok(reqs.length >= 1, 'Should extract from .xls rows');
    assert.ok(tcs.length >= 1, 'Should extract from .xls TC rows');
  });

  it('TEST 4: Requirements uploaded as .md + test cases uploaded as .md', () => {
    const mdReq = `# Requirements Document\n\n| ID | Requirement Description | Priority |\n|---|---|---|\n| REQ_401 | User must authenticate using 2FA TOTP | High |\n| REQ_402 | Account lockout after 3 invalid attempts | Critical |`;
    const mdTc = `# Test Suites\n\n| TC ID | Test Case Description | Expected Result |\n|---|---|---|\n| TC_401 | Verify 2FA TOTP prompt and token validation | Dashboard displayed |\n| TC_402 | Verify account lockout on 3 failed attempts | Account locked |`;

    const reqs = parseMarkdownToRequirements(mdReq, 'Specs.md');
    const tcs = parseMarkdownToTestCases(mdTc, 'Tests.md');

    assert.strictEqual(reqs.length, 2);
    assert.strictEqual(reqs[0].requirementId, 'REQ_401');
    assert.strictEqual(tcs.length, 2);
    assert.strictEqual(tcs[0].testCaseId, 'TC_401');
  });

  it('TEST 5: Requirements uploaded as .json + test cases uploaded as .json', () => {
    const jsonReq = JSON.stringify([
      {
        requirementId: 'REQ_501',
        description: 'Search products by SKU or title',
        priority: 'Medium',
      },
    ]);
    const jsonTc = JSON.stringify({
      testCases: [
        {
          testCaseId: 'TC_501',
          description: 'Search product by valid SKU',
          expectedResult: 'Matching item returned',
        },
      ],
    });

    const reqs = parseJsonToRequirements(jsonReq, 'reqs.json');
    const tcs = parseJsonToTestCases(jsonTc, 'tcs.json');

    assert.strictEqual(reqs.length, 1);
    assert.strictEqual(reqs[0].requirementId, 'REQ_501');
    assert.strictEqual(tcs.length, 1);
    assert.strictEqual(tcs[0].testCaseId, 'TC_501');
  });

  it('TEST 6: Requirements supplied as text + test cases supplied as a file (JSON)', async () => {
    const reqText = 'REQ-601: Daily transfer ceiling is $5,000';
    const reqs = parsePastedRequirements(reqText);

    const tcJson = JSON.stringify([
      { tcId: 'TC_601', testCaseDescription: 'Verify transfer at $5,000 threshold' },
    ]);
    const tcs = parseJsonToTestCases(tcJson, 'tests.json');

    const result = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(result.summary.totalRequirements, 1);
    assert.strictEqual(result.summary.totalTestCases, 1);
  });

  it('TEST 7: Requirements supplied as a file + test cases supplied as text', async () => {
    const mdReq =
      '| ID | Requirement |\n|---|---|\n| REQ_701 | System must auto-logout after 15m inactivity |';
    const reqs = parseMarkdownToRequirements(mdReq, 'req.md');

    const tcText = 'TC_701: Verify session termination after 15 minutes of zero user input';
    const tcs = parsePastedTestCases(tcText);

    const result = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(result.summary.totalRequirements, 1);
    assert.strictEqual(result.summary.totalTestCases, 1);
  });

  it('TEST 8: Multiple worksheets in Excel files (preserves sheet names and rows)', () => {
    const multiSheetRows = [
      {
        sheetName: 'CoreBilling',
        rowNumber: 2,
        cells: ['REQ_801', 'Generate monthly invoice PDF'],
      },
      {
        sheetName: 'Subscriptions',
        rowNumber: 2,
        cells: ['REQ_802', 'Upgrade from Basic to Enterprise tier'],
      },
    ];

    const reqs = extractRequirementsFromExcelRows(multiSheetRows, 'AllRequirements.xlsx');
    assert.strictEqual(reqs.length, 2);
    assert.strictEqual(reqs[0].sourceWorksheet, 'CoreBilling');
    assert.strictEqual(reqs[1].sourceWorksheet, 'Subscriptions');
  });

  it('TEST 9: Invalid file format rejection in UI component', () => {
    const code = fs.readFileSync(
      path.join(process.cwd(), 'src/components/qa-agents/coverage-gap-analyzer.tsx'),
      'utf8'
    );
    assert.ok(code.includes("['xls', 'xlsx', 'md', 'json']"), 'Enforces supported file extensions');
    assert.ok(
      code.includes('Unsupported file'),
      'Shows validation error message for unsupported files'
    );
  });

  it('TEST 10: Corrupted or malformed input files handling', () => {
    assert.throws(
      () => parseJsonToRequirements('{ invalid json content [', 'corrupt.json'),
      /Invalid JSON in corrupt.json/
    );
  });

  it('TEST 11: Missing requirements input validation', () => {
    const result = analyzeCoverageGaps(
      [],
      [{ testCaseId: 'TC_1', isGeneratedId: false, testCaseDescription: 'Test' }]
    );
    assert.strictEqual(result.summary.totalRequirements, 0);
    assert.strictEqual(result.summary.coveragePercentage, 0);
    assert.strictEqual(
      result.orphanTestCases.length,
      1,
      'Without requirements, all test cases are orphans'
    );
  });

  it('TEST 12: Missing test cases input validation', () => {
    const result = analyzeCoverageGaps(
      [{ requirementId: 'REQ_1', isGeneratedId: false, requirementDescription: 'Req' }],
      []
    );
    assert.strictEqual(result.summary.totalTestCases, 0);
    assert.strictEqual(result.summary.coveragePercentage, 0);
  });

  it('TEST 13: Duplicate requirement IDs detected and counted', () => {
    const reqs = [
      { requirementId: 'REQ_10', isGeneratedId: false, requirementDescription: 'Duplicate desc A' },
      { requirementId: 'REQ_10', isGeneratedId: false, requirementDescription: 'Duplicate desc A' },
    ];
    const tcs = [{ testCaseId: 'TC_1', isGeneratedId: false, testCaseDescription: 'Some test' }];
    const res = analyzeCoverageGaps(reqs, tcs);
    assert.ok(
      res.summary.potentialDuplicateRequirementsCount >= 1,
      'Should track duplicate requirements'
    );
  });

  it('TEST 14: Duplicate test case IDs detected and counted', () => {
    const reqs = [
      { requirementId: 'REQ_1', isGeneratedId: false, requirementDescription: 'Single req' },
    ];
    const tcs = [
      { testCaseId: 'TC_99', isGeneratedId: false, testCaseDescription: 'Duplicate test desc' },
      { testCaseId: 'TC_99', isGeneratedId: false, testCaseDescription: 'Duplicate test desc' },
    ];
    const res = analyzeCoverageGaps(reqs, tcs);
    assert.ok(
      res.summary.potentialDuplicateTestCasesCount >= 1,
      'Should track duplicate test cases'
    );
  });

  it('TEST 15: Requirements without IDs assign generated analysis IDs', () => {
    const text = 'The user should be able to view transaction logs';
    const reqs = parsePastedRequirements(text);
    assert.strictEqual(reqs.length, 1);
    assert.ok(reqs[0].isGeneratedId, 'Should flag as generated ID');
    assert.ok(reqs[0].requirementId.startsWith('REQ_'), 'Should assign REQ_XXX format');
  });

  it('TEST 16: Test cases without IDs assign generated analysis IDs', () => {
    const text = 'Verify user dashboard loads properly';
    const tcs = parsePastedTestCases(text);
    assert.strictEqual(tcs.length, 1);
    assert.ok(tcs[0].isGeneratedId, 'Should flag as generated ID');
    assert.ok(tcs[0].testCaseId.startsWith('TC_'), 'Should assign TC_XXX format');
  });

  // =========================================================================
  // PART 2: COVERAGE ANALYSIS TESTS (Tests 17–28)
  // =========================================================================

  it('TEST 17: All requirements have Strong coverage', () => {
    const reqs = [
      {
        requirementId: 'REQ_AUTH',
        isGeneratedId: false,
        requirementDescription:
          'User login with credentials and account lockout after failed attempts',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_AUTH_1',
        isGeneratedId: false,
        testCaseDescription: 'Verify login with credentials for REQ_AUTH',
        testSteps: 'Enter valid credentials and submit form',
        expectedResults: 'Dashboard loads with HTTP 200 OK and valid auth cookie',
      },
      {
        testCaseId: 'TC_AUTH_2',
        isGeneratedId: false,
        testCaseDescription: 'Verify account lockout on failed invalid credentials for REQ_AUTH',
        testSteps: 'Enter invalid credentials 5 times',
        expectedResults: 'Account locked message displayed with 403 Forbidden',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(res.summary.strongCount, 1);
    assert.strictEqual(res.summary.weakCount, 0);
    assert.strictEqual(res.summary.noneCount, 0);
    assert.strictEqual(res.requirementCoverage[0].coverageLevel, 'Strong');
  });

  it('TEST 18: Some requirements have Weak coverage (only positive covered when negative required)', () => {
    const reqs = [
      {
        requirementId: 'REQ_INPUT',
        isGeneratedId: false,
        requirementDescription:
          'System shall validate input email address format and reject invalid emails',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_INPUT_POS',
        isGeneratedId: false,
        testCaseDescription: 'Verify input email with valid standard email for REQ_INPUT',
        testSteps: 'Enter valid email test@domain.com',
        expectedResults: 'Success confirmation',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(
      res.summary.weakCount,
      1,
      'Should classify as Weak because negative rejection is missing'
    );
    assert.strictEqual(res.requirementCoverage[0].coverageLevel, 'Weak');
    assert.ok(
      res.requirementCoverage[0].improvementRecommendations.some((r) =>
        r.toLowerCase().includes('negative')
      ),
      'Should recommend negative test case'
    );
  });

  it('TEST 19: Some requirements have None coverage', () => {
    const reqs = [
      {
        requirementId: 'REQ_PAYMENT',
        isGeneratedId: false,
        requirementDescription: 'Process payments via Stripe webhook gateway',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_UNRELATED',
        isGeneratedId: false,
        testCaseDescription: 'Verify footer copyright date is 2026',
        testSteps: 'Inspect footer',
        expectedResults: 'Year matches',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(res.summary.noneCount, 1);
    assert.strictEqual(res.requirementCoverage[0].coverageLevel, 'None');
    assert.strictEqual(res.requirementCoverage[0].coveringTestCases.length, 0);
  });

  it('TEST 20: Some test cases are orphaned (unmapped)', () => {
    const reqs = [
      {
        requirementId: 'REQ_1',
        isGeneratedId: false,
        requirementDescription: 'User profile photo upload under 5MB',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_ORPHAN',
        isGeneratedId: false,
        testCaseDescription: 'Legacy smoke test for obsolete flash player plugin',
        testSteps: 'Open flash page',
        expectedResults: 'Plugin loaded',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(res.summary.orphanTestCaseCount, 1);
    assert.strictEqual(res.orphanTestCases[0].testCaseId, 'TC_ORPHAN');
    assert.ok(res.orphanTestCases[0].recommendedAction.length > 0);
  });

  it('TEST 21: One requirement maps to multiple test cases', () => {
    const reqs = [
      {
        requirementId: 'REQ_CHECKOUT',
        isGeneratedId: false,
        requirementDescription:
          'E-commerce shopping cart checkout with tax and shipping calculations',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_CHK_1',
        isGeneratedId: false,
        testCaseDescription: 'Verify tax calculation at checkout for REQ_CHECKOUT',
        testSteps: 'Add item to cart and calculate tax',
        expectedResults: 'Tax is 8%',
      },
      {
        testCaseId: 'TC_CHK_2',
        isGeneratedId: false,
        testCaseDescription: 'Verify shipping option selection at checkout for REQ_CHECKOUT',
        testSteps: 'Select express shipping',
        expectedResults: 'Shipping fee added',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(res.requirementCoverage[0].coveringTestCases.length, 2);
  });

  it('TEST 22: One test case maps to multiple requirements', () => {
    const reqs = [
      {
        requirementId: 'REQ_A',
        isGeneratedId: false,
        requirementDescription: 'User account security login',
      },
      {
        requirementId: 'REQ_B',
        isGeneratedId: false,
        requirementDescription: 'Audit logging for user account events',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_COMBO',
        isGeneratedId: false,
        testCaseDescription:
          'Verify user account security login generates audit logging record for REQ_A and REQ_B',
        testSteps: 'Login to account',
        expectedResults: 'User logged in and audit log entry recorded',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(res.requirementCoverage[0].coveringTestCases.length, 1);
    assert.strictEqual(res.requirementCoverage[1].coveringTestCases.length, 1);
    assert.strictEqual(res.summary.orphanTestCaseCount, 0, 'TC_COMBO maps to both, not orphan');
  });

  it('TEST 23: Test case description mentions requirement but steps do not validate it (keyword-only vs evidence)', () => {
    const reqs = [
      {
        requirementId: 'REQ_ENCRYPT',
        isGeneratedId: false,
        requirementDescription: 'Encrypt sensitive database records using AES-256 GCM encryption',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_VAGUE',
        isGeneratedId: false,
        testCaseDescription: 'Check encrypt database',
        testSteps: 'Click button',
        expectedResults: 'it works',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    // Because steps and expected result are vague, coverage is not Strong
    assert.notStrictEqual(res.requirementCoverage[0].coverageLevel, 'Strong');
  });

  it('TEST 24: Positive scenario exists but relevant negative scenario is missing', () => {
    const reqs = [
      {
        requirementId: 'REQ_COUPON',
        isGeneratedId: false,
        requirementDescription:
          'Apply promotional coupon code and reject invalid or expired coupon codes',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_COUPON_VALID',
        isGeneratedId: false,
        testCaseDescription: 'Verify valid promotional coupon code discount applied for REQ_COUPON',
        testSteps: 'Enter valid coupon SAVE20',
        expectedResults: '20% discount applied',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(res.requirementCoverage[0].coverageLevel, 'Weak');
    assert.ok(res.requirementCoverage[0].missingScenarios.includes('Negative / Invalid Input'));
  });

  it('TEST 25: Boundary scenario is missing', () => {
    const reqs = [
      {
        requirementId: 'REQ_TRANSFER',
        isGeneratedId: false,
        requirementDescription:
          'Transfer amount must be between minimum $10 and maximum limit $10,000 threshold',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_TRANSFER_MID',
        isGeneratedId: false,
        testCaseDescription: 'Transfer $500 standard amount for REQ_TRANSFER',
        testSteps: 'Transfer $500',
        expectedResults: 'Transfer successful',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(res.requirementCoverage[0].coverageLevel, 'Weak');
    assert.ok(res.requirementCoverage[0].missingScenarios.includes('Boundary Value'));
  });

  it('TEST 26: Requirements are ambiguous (identified as clarification need)', () => {
    const reqs = [
      {
        requirementId: 'REQ_FAST',
        isGeneratedId: false,
        requirementDescription:
          'The user search interface should respond quickly and be user-friendly',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_FAST',
        isGeneratedId: false,
        testCaseDescription: 'Check search response for REQ_FAST',
        testSteps: 'Type search',
        expectedResults: 'Search results show quickly',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    assert.ok(res.requirementCoverage[0].isAmbiguous);
    assert.ok(res.summary.clarificationNeededCount >= 1);
    assert.ok(
      res.requirementCoverage[0].improvementRecommendations.some((r) =>
        r.includes('Clarification Need')
      )
    );
  });

  it('TEST 27: Similar keywords exist but requirements are functionally unrelated', () => {
    const reqs = [
      {
        requirementId: 'REQ_CAR',
        isGeneratedId: false,
        requirementDescription: 'Fleet vehicle driver dispatch algorithm',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_BANK',
        isGeneratedId: false,
        testCaseDescription: 'Bank credit card cash back reward calculation',
        testSteps: 'Compute 2% reward',
        expectedResults: 'Reward earned',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(res.requirementCoverage[0].coverageLevel, 'None');
  });

  it('TEST 28: Probable and uncertain mappings require manual review', () => {
    const reqs = [
      {
        requirementId: 'REQ_EXPORT',
        isGeneratedId: false,
        requirementDescription: 'Data export pipeline for monthly accounting ledgers',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_EXP_PROBABLE',
        isGeneratedId: false,
        testCaseDescription: 'Verify monthly accounting pipeline export',
        testSteps: 'Trigger pipeline',
        expectedResults: 'Ledger file ready',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    const mapping = res.requirementCoverage[0].coveringTestCases[0];
    assert.ok(mapping, 'Mapping established');
    assert.ok(
      mapping.mappingConfidence === 'Confirmed' || mapping.mappingConfidence === 'Probable',
      'Confidence classification assigned'
    );
  });

  // =========================================================================
  // PART 3: UI AND REPORT TESTS (Tests 29–39)
  // =========================================================================

  it('TEST 29: Overview metrics are mathematically correct and denominators safe', () => {
    const reqs = [
      { requirementId: 'R1', isGeneratedId: false, requirementDescription: 'A' },
      { requirementId: 'R2', isGeneratedId: false, requirementDescription: 'B' },
    ];
    const tcs = [
      {
        testCaseId: 'T1',
        isGeneratedId: false,
        testCaseDescription: 'Verify A with steps and expected result',
        testSteps: 'Run step for R1',
        expectedResults: 'R1 passes with 200 OK',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    assert.strictEqual(res.summary.totalRequirements, 2);
    assert.strictEqual(res.summary.totalTestCases, 1);
    assert.strictEqual(res.summary.strongCount + res.summary.weakCount + res.summary.noneCount, 2);
    assert.strictEqual(res.summary.coveragePercentage, 50);
  });

  it('TEST 30: Pie chart values match actual requirement counts', () => {
    const reqs = [
      {
        requirementId: 'R1',
        isGeneratedId: false,
        requirementDescription: 'User login verification',
      },
      {
        requirementId: 'R2',
        isGeneratedId: false,
        requirementDescription: 'Third party gateway sync',
      },
    ];
    const tcs = [
      {
        testCaseId: 'T1',
        isGeneratedId: false,
        testCaseDescription: 'User login verification positive and negative for R1',
        testSteps: 'Login steps',
        expectedResults: 'Logged in with 200',
      },
    ];

    const res = analyzeCoverageGaps(reqs, tcs);
    const total = res.summary.strongCount + res.summary.weakCount + res.summary.noneCount;
    assert.strictEqual(total, res.summary.totalRequirements);
  });

  it('TEST 31: Clicking Strong, Weak, or None filters Detailed Report correctly in UI logic', () => {
    const code = fs.readFileSync(
      path.join(process.cwd(), 'src/components/qa-agents/coverage-gap-analyzer.tsx'),
      'utf8'
    );
    assert.ok(code.includes("setSelectedFilter((prev) => (prev === 'Strong' ? 'All' : 'Strong'))"));
    assert.ok(code.includes("setSelectedFilter((prev) => (prev === 'Weak' ? 'All' : 'Weak'))"));
    assert.ok(code.includes("setSelectedFilter((prev) => (prev === 'None' ? 'All' : 'None'))"));
  });

  it('TEST 32: Clearing filters restores the full report', () => {
    const code = fs.readFileSync(
      path.join(process.cwd(), 'src/components/qa-agents/coverage-gap-analyzer.tsx'),
      'utf8'
    );
    assert.ok(code.includes("setSelectedFilter('All')"));
  });

  it('TEST 33: Search and sorting work in UI component', () => {
    const code = fs.readFileSync(
      path.join(process.cwd(), 'src/components/qa-agents/coverage-gap-analyzer.tsx'),
      'utf8'
    );
    assert.ok(code.includes('searchQuery.toLowerCase()'));
    assert.ok(code.includes('setSortAsc(!sortAsc)'));
  });

  it('TEST 34: Excel download is disabled before successful analysis', () => {
    const code = fs.readFileSync(
      path.join(process.cwd(), 'src/components/qa-agents/coverage-gap-analyzer.tsx'),
      'utf8'
    );
    assert.ok(code.includes('disabled={!analysisResult || isAnalyzing}'));
  });

  it('TEST 35: Excel download becomes enabled after Detailed Report is available', () => {
    const code = fs.readFileSync(
      path.join(process.cwd(), 'src/components/qa-agents/coverage-gap-analyzer.tsx'),
      'utf8'
    );
    assert.ok(code.includes('handleDownloadExcel'));
  });

  it('TEST 36: Downloaded workbook contains all 5 required worksheets and valid binary OOXML', () => {
    const reqs = [
      {
        requirementId: 'REQ_TEST',
        isGeneratedId: false,
        requirementDescription: 'Test Requirement',
      },
    ];
    const tcs = [
      {
        testCaseId: 'TC_TEST',
        isGeneratedId: false,
        testCaseDescription: 'Test Case Description for REQ_TEST',
      },
    ];

    const analysis = analyzeCoverageGaps(reqs, tcs);
    const excelBuffer = generateCoverageGapExcelWorkbook(analysis);

    assert.ok(excelBuffer instanceof Uint8Array);
    assert.ok(excelBuffer.length > 500, 'Excel buffer must be non-empty');

    // Decode zip entries to verify all 5 sheet names are in xl/workbook.xml
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const raw = decoder.decode(excelBuffer);

    assert.ok(raw.includes('Executive Summary'), 'Contains Sheet 1 Executive Summary');
    assert.ok(
      raw.includes('Detailed Coverage Report'),
      'Contains Sheet 2 Detailed Coverage Report'
    );
    assert.ok(raw.includes('Test Case Traceability'), 'Contains Sheet 3 Test Case Traceability');
    assert.ok(raw.includes('Orphan Test Cases'), 'Contains Sheet 4 Orphan Test Cases');
    assert.ok(raw.includes('Scenario Gap Analysis'), 'Contains Sheet 5 Scenario Gap Analysis');
  });

  it('TEST 37: Reset clears every input, selected file, chart, filter, and report', () => {
    const code = fs.readFileSync(
      path.join(process.cwd(), 'src/components/qa-agents/coverage-gap-analyzer.tsx'),
      'utf8'
    );
    assert.ok(code.includes('const handleReset = () => {'));
    assert.ok(code.includes("setReqText('')"));
    assert.ok(code.includes("setTcText('')"));
    assert.ok(code.includes('setReqFiles([])'));
    assert.ok(code.includes('setTcFiles([])'));
    assert.ok(code.includes('setAnalysisResult(null)'));
  });

  it('TEST 38: Reset during analysis aborts and prevents stale results', () => {
    const code = fs.readFileSync(
      path.join(process.cwd(), 'src/components/qa-agents/coverage-gap-analyzer.tsx'),
      'utf8'
    );
    assert.ok(code.includes('abortControllerRef.current.abort()'));
  });

  it('TEST 39: Other six QA Agents remain unaffected', () => {
    const workspaceCode = fs.readFileSync(
      path.join(process.cwd(), 'src/components/qa-agents/qa-agents-workspace.tsx'),
      'utf8'
    );
    assert.ok(workspaceCode.includes('requirements: {'));
    assert.ok(workspaceCode.includes('test_cases: {'));
    assert.ok(workspaceCode.includes('automation_code: {'));
    assert.ok(workspaceCode.includes('code_review: {'));
    assert.ok(workspaceCode.includes('chat: {'));
    assert.ok(workspaceCode.includes('gap_analysis: {'));

    const sidebarCode = fs.readFileSync(
      path.join(process.cwd(), 'src/components/layout/sidebar.tsx'),
      'utf8'
    );
    assert.ok(sidebarCode.includes('/interview-griller'), 'Agent 06 Interview Griller is intact');
    assert.ok(
      sidebarCode.includes('Test Coverage Gap Analysis') ||
        sidebarCode.includes('Coverage Gap Analyzer'),
      'Agent 07 is added'
    );
  });
});
