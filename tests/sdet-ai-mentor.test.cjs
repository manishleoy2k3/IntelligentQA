const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const jiti = require('jiti')(process.cwd() + '/index.js');
const kb = jiti('./src/lib/qa-knowledge-base.ts');

describe('SDET AI Mentor: Comprehensive Unit & Adversarial Test Suite', () => {
  const qaChatRoutePath = path.join(__dirname, '../src/app/api/ai/qa-chat/route.ts');
  const qaChatContent = fs.readFileSync(qaChatRoutePath, 'utf8');

  // Helper function to query the mentor logic end-to-end
  function queryMentor(query) {
    const errorDiag = kb.diagnoseCodeError(query);
    if (errorDiag) {
      return { reply: errorDiag, source: 'diagnoseCodeError' };
    }
    const matches = kb.searchQAKnowledge(query);
    if (matches.length > 0) {
      return {
        reply: kb.formatCrispChatAnswer(matches[0]),
        source: 'searchQAKnowledge',
        topic: matches[0].topic,
        category: matches[0].category
      };
    }
    return {
      reply: kb.synthesizeDynamicAnswer(query),
      source: 'synthesizeDynamicAnswer'
    };
  }

  // Helper to assert four pillars: Correctness, Completeness, Relevance, Next Step
  function assertFourPillars(result, { forbiddenInCode = ['Thread.sleep'], relevantTerms = [] } = {}) {
    assert.ok(result.reply && result.reply.length > 50, 'Response must be non-empty and substantial');

    // 1. Correctness: Code snippets must NOT use forbidden anti-patterns
    if (result.reply.includes('```')) {
      const codeBlocks = result.reply.match(/```[\s\S]*?```/g) || [];
      for (const block of codeBlocks) {
        for (const forbidden of forbiddenInCode) {
          assert.strictEqual(
            block.includes(forbidden),
            false,
            `Correctness violation: Code snippet should not use anti-pattern "${forbidden}"`
          );
        }
      }
    }

    // 2. Completeness: Code blocks must be properly closed and balanced
    if (result.reply.includes('```')) {
      const fenceCount = (result.reply.match(/```/g) || []).length;
      assert.strictEqual(fenceCount % 2, 0, 'Completeness violation: Code fences must be properly opened and closed');
    }

    // 3. Relevance: Should contain expected domain keywords
    for (const term of relevantTerms) {
      const lowerReply = result.reply.toLowerCase();
      assert.ok(
        lowerReply.includes(term.toLowerCase()),
        `Relevance violation: Response for topic should mention "${term}"`
      );
    }

    // 4. Actionable Next Step Suggestion
    const hasNextStep = /next step for qa|👉 \*?next step/i.test(result.reply);
    assert.ok(hasNextStep, 'Completeness violation: Response MUST provide an actionable Next Step suggestion for QA');
  }

  describe('Category 1: Exception Triage & Execution Debugging', () => {
    it('accurately diagnoses and fixes StaleElementReferenceException with next steps', () => {
      const res = queryMentor('How to resolve StaleElementReferenceException in Selenium?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assertFourPillars(res, {
        relevantTerms: ['stale', 'dom', 'fluentwait'],
        forbiddenInCode: ['Thread.sleep']
      });
    });

    it('diagnoses ElementClickInterceptedException with overlay synchronization', () => {
      const res = queryMentor('org.openqa.selenium.ElementClickInterceptedException: element click intercepted by spinner overlay');
      assert.strictEqual(res.source, 'diagnoseCodeError');
      assertFourPillars(res, {
        relevantTerms: ['ElementClickInterceptedException', 'spinner', 'invisibilityOfElementLocated'],
        forbiddenInCode: ['Thread.sleep']
      });
    });

    it('diagnoses Playwright Timeout 30000ms waiting for locator', () => {
      const res = queryMentor('Error: page.click: Test timeout of 30000ms exceeded waiting for locator');
      assert.strictEqual(res.source, 'diagnoseCodeError');
      assertFourPillars(res, {
        relevantTerms: ['Playwright', 'locator', 'timeout', 'Trace'],
        forbiddenInCode: ['Thread.sleep']
      });
    });

    it('diagnoses Selenium NoSuchElementException and distinguishes dynamic IDs & iFrames', () => {
      const res = queryMentor('org.openqa.selenium.NoSuchElementException: Unable to locate element with id "submit-order"');
      assert.strictEqual(res.source, 'diagnoseCodeError');
      assertFourPillars(res, {
        relevantTerms: ['NoSuchElementException', 'WebDriverWait', 'iframe'],
        forbiddenInCode: ['Thread.sleep']
      });
    });

    it('diagnoses Selenium NoSuchSessionException and highlights ThreadLocal isolation', () => {
      const res = queryMentor('org.openqa.selenium.NoSuchSessionException: Session ID is null. Using WebDriver after calling quit()?');
      assert.strictEqual(res.source, 'diagnoseCodeError');
      assertFourPillars(res, {
        relevantTerms: ['NoSuchSessionException', 'ThreadLocal', 'quit()'],
        forbiddenInCode: []
      });
    });

    it('diagnoses Playwright TargetClosedError caused by missing await or crash', () => {
      const res = queryMentor('Playwright TargetClosedError: Target page, context or browser has been closed');
      assert.strictEqual(res.source, 'diagnoseCodeError');
      assertFourPillars(res, {
        relevantTerms: ['TargetClosedError', 'await', 'Trace Viewer'],
        forbiddenInCode: []
      });
    });

    it('diagnoses UnhandledPromiseRejection and undefined property access in async test suites', () => {
      const res = queryMentor('TypeError: Cannot read properties of undefined (reading "email") in UnhandledPromiseRejection');
      assert.strictEqual(res.source, 'diagnoseCodeError');
      assertFourPillars(res, {
        relevantTerms: ['UnhandledPromiseRejection', 'Undefined', 'Optional chaining'],
        forbiddenInCode: []
      });
    });

    it('diagnoses REST Assured SSLHandshakeException and suggests relaxedHTTPSValidation', () => {
      const res = queryMentor('javax.net.ssl.SSLHandshakeException: PKIX path building failed in REST Assured');
      assert.strictEqual(res.source, 'diagnoseCodeError');
      assertFourPillars(res, {
        relevantTerms: ['SSLHandshake', 'relaxedHTTPSValidation', 'REST Assured'],
        forbiddenInCode: []
      });
    });

    it('diagnoses REST Assured UnrecognizedPropertyException and suggests @JsonIgnoreProperties', () => {
      const res = queryMentor('com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException: Unrecognized field "role"');
      assert.strictEqual(res.source, 'diagnoseCodeError');
      assertFourPillars(res, {
        relevantTerms: ['JsonIgnoreProperties', 'POJO', 'Jackson'],
        forbiddenInCode: []
      });
    });

    it('diagnoses container infrastructure crashes (catatonit / pid1 / enoent) as environment notice', () => {
      const res = queryMentor('catatonit: failed to exec pid1: No such file or directory');
      assert.strictEqual(res.source, 'diagnoseCodeError');
      assertFourPillars(res, {
        relevantTerms: ['environment/sandbox infrastructure notice', 'NOT an issue with your code', 'Run Code'],
        forbiddenInCode: []
      });
    });
  });

  describe('Category 2: UI Automation Frameworks (Playwright & Selenium)', () => {
    it('answers Playwright iFrames with page.frameLocator and does NOT falsely match portfolio FAQ', () => {
      const res = queryMentor('How to handle iframe in Playwright?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'Playwright iFrames & Nested Frames Handling');
      assertFourPillars(res, {
        relevantTerms: ['frameLocator', 'iframe', 'Playwright'],
        forbiddenInCode: ['Thread.sleep']
      });
    });

    it('answers ThreadLocal WebDriver parallel execution without driver collisions', () => {
      const res = queryMentor('How to configure ThreadLocal WebDriver for parallel execution?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'ThreadLocal WebDriver for Parallel TestNG Execution');
      assertFourPillars(res, {
        relevantTerms: ['ThreadLocal', 'parallel', 'remove()', 'DriverFactory'],
        forbiddenInCode: ['Thread.sleep']
      });
    });

    it('explains driver.close() vs driver.quit() and zombie process prevention', () => {
      const res = queryMentor('What is the difference between driver.close and driver.quit?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'driver.close() vs driver.quit() & Session Management');
      assertFourPillars(res, {
        relevantTerms: ['driver.close()', 'driver.quit()', 'session', 'chromedriver'],
        forbiddenInCode: ['Thread.sleep']
      });
    });

    it('answers dynamic web tables with XPath axes (following-sibling) and row-scoped locators', () => {
      const res = queryMentor('How to handle dynamic web tables with XPath?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'Dynamic Web Tables & Advanced XPath Axes');
      assertFourPillars(res, {
        relevantTerms: ['following-sibling', 'table', 'XPath', 'getByRole'],
        forbiddenInCode: ['Thread.sleep']
      });
    });

    it('explains file upload without native OS dialog dependency via setInputFiles and sendKeys', () => {
      const res = queryMentor('How to upload file in Playwright and Selenium?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'File Upload Automation (Playwright & Selenium)');
      assertFourPillars(res, {
        relevantTerms: ['setInputFiles', 'input[type="file"]', 'sendKeys'],
        forbiddenInCode: ['Thread.sleep']
      });
    });

    it('explains handling multiple browser tabs and popups with context.waitForEvent("page")', () => {
      const res = queryMentor('How to handle multiple tabs and windows in Playwright?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'Handling Multiple Windows, Tabs, and Popups');
      assertFourPillars(res, {
        relevantTerms: ['waitForEvent', 'page', 'tabs'],
        forbiddenInCode: ['Thread.sleep']
      });
    });

    it('explains dynamic dropdowns and auto-suggest selection', () => {
      const res = queryMentor('How to automate dynamic dropdown and auto suggest?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'Dynamic Dropdowns and Auto-Suggest Inputs');
      assertFourPillars(res, {
        relevantTerms: ['selectOption', 'combobox', 'option'],
        forbiddenInCode: ['Thread.sleep']
      });
    });

    it('explains Playwright Auto-Waiting Actionability Matrix', () => {
      const res = queryMentor('How does auto-waiting work in Playwright?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'Playwright Auto-Waiting Architecture');
      assertFourPillars(res, {
        relevantTerms: ['Actionability', 'Visible', 'Stable', 'Receives Events'],
        forbiddenInCode: ['Thread.sleep']
      });
    });
  });

  describe('Category 3: API Test Automation & REST Assured', () => {
    it('demonstrates REST Assured Bearer Token & OAuth2 with RequestSpecBuilder', () => {
      const res = queryMentor('How to pass Bearer token in REST Assured RequestSpecification?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'REST Assured Bearer Token & OAuth2 Authentication');
      assertFourPillars(res, {
        relevantTerms: ['RequestSpecBuilder', 'Bearer', 'Authorization'],
        forbiddenInCode: []
      });
    });

    it('demonstrates REST Assured POJO serialization and JSON Schema validation', () => {
      const res = queryMentor('How to validate JSON schema in REST Assured?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'REST Assured POJO & JSON Schema');
      assertFourPillars(res, {
        relevantTerms: ['JsonSchema', 'Jackson', 'POJO', 'Serialization'],
        forbiddenInCode: []
      });
    });
  });

  describe('Category 4: AI in QA, MCP, and Self-Healing', () => {
    it('explains Model Context Protocol (MCP) in QA automation and autonomous agents', () => {
      const res = queryMentor('What is Model Context Protocol MCP in test automation?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'Model Context Protocol (MCP) in QA Automation');
      assertFourPillars(res, {
        relevantTerms: ['MCP', 'Model Context Protocol', 'Agent', 'DOM'],
        forbiddenInCode: []
      });
    });

    it('explains self-healing locator algorithms with multi-attribute fingerprints and confidence scoring', () => {
      const res = queryMentor('How do self-healing locators work in AI test automation?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'Self-Healing Locator Algorithms');
      assertFourPillars(res, {
        relevantTerms: ['fingerprint', 'confidence', 'heuristic', 'self-healing'],
        forbiddenInCode: []
      });
    });
  });

  describe('Category 5: QA Methodology, Career & Transition Guidance', () => {
    it('advises manual testers with 0 coding background with empathy and practical steps', () => {
      const res = queryMentor('Can I become an SDET with zero coding knowledge?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'Can I become an SDET with zero coding knowledge?');
      assertFourPillars(res, {
        relevantTerms: ['senior SDET', 'ground zero', 'superpower'],
        forbiddenInCode: []
      });
    });

    it('provides a realistic 12 to 16 week study plan for manual QA to SDET transition', () => {
      const res = queryMentor('How long does it take to switch from Manual QA to an SDET?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'How long does it take to switch from Manual QA to an SDET?');
      assertFourPillars(res, {
        relevantTerms: ['12 to 16 weeks', 'Weeks 1–4', 'Playwright'],
        forbiddenInCode: []
      });
    });

    it('explains Test Pyramid and Shift-Left testing principles to eliminate flakiness', () => {
      const res = queryMentor('What is the Test Pyramid and Shift-Left testing strategy?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'Test Pyramid, Shift-Left Testing & Agile QA Strategy');
      assertFourPillars(res, {
        relevantTerms: ['Test Pyramid', 'Shift-Left', 'Unit', 'API'],
        forbiddenInCode: []
      });
    });

    it('answers event-driven and Apache Kafka message stream testing with dedicated topic', () => {
      const res = queryMentor('How should an SDET test Apache Kafka message streaming queues?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'Event-Driven & Apache Kafka Stream Testing');
      assertFourPillars(res, {
        relevantTerms: ['Kafka', 'Producer', 'Consumer', 'schema', 'Awaitility'],
        forbiddenInCode: []
      });
    });

    it('answers performance and load testing with dedicated k6 / JMeter topic', () => {
      const res = queryMentor('How to write load tests with k6 for API SLAs?');
      assert.strictEqual(res.source, 'searchQAKnowledge');
      assert.strictEqual(res.topic, 'Performance & Load Testing with k6 & JMeter');
      assertFourPillars(res, {
        relevantTerms: ['Performance', 'k6', 'threshold', 'p(95)'],
        forbiddenInCode: []
      });
    });

    it('synthesizes dynamic guidance for novel, unindexed testing topics (e.g. GraphQL Federation)', () => {
      const res = queryMentor('What advice do you have for an SDET evaluating GraphQL federation subgraphs?');
      assert.strictEqual(res.source, 'synthesizeDynamicAnswer');
      assertFourPillars(res, {
        relevantTerms: ['GraphQL', 'SDET', 'Next Step'],
        forbiddenInCode: []
      });
    });
  });

  describe('Category 6: System Prompt & Route Contract Verification', () => {
    it('verifies /api/ai/qa-chat systemPrompt strictly mandates Actionable Next Step Suggestion for QA', () => {
      assert.ok(
        qaChatContent.includes('ACTIONABLE NEXT STEP'),
        'System prompt must mandate ACTIONABLE NEXT STEP'
      );
      assert.ok(
        qaChatContent.includes('👉 **Next Step for QA:**'),
        'System prompt must instruct model to output "👉 **Next Step for QA:**"'
      );
    });

    it('verifies /api/ai/qa-chat mandates production-grade complete code without mid-syntax truncation', () => {
      assert.ok(
        qaChatContent.includes('never truncate mid-syntax'),
        'System prompt must mandate complete code snippets'
      );
      assert.ok(
        qaChatContent.includes('Zero hallucinations'),
        'System prompt must enforce zero hallucinations'
      );
    });
  });
});
