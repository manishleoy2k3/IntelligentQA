const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const jiti = require('jiti')(process.cwd() + '/index.js');
const kb = jiti('./src/lib/qa-knowledge-base.ts');

describe('Agent 05: Principal SDET & Architecture Mentor - 5 Benchmark Tests', () => {

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

  // TEST 1: Unified Playwright framework for 50 squads and 20 applications
  it('TEST 1: Successfully architects a unified Playwright framework for 50 squads and 20 applications', () => {
    const res = queryMentor('Design a unified Playwright framework for 50 squads and 20 applications.');
    assert.strictEqual(res.source, 'searchQAKnowledge');
    const lower = res.reply.toLowerCase();

    // Must address monorepo architecture, shared libraries, ownership, CI/CD, parallel execution, reporting, governance
    assert.ok(lower.includes('monorepo'), 'Must address monorepo architecture');
    assert.ok(lower.includes('shared') || lower.includes('packages'), 'Must address shared libraries');
    assert.ok(lower.includes('ownership') || lower.includes('squad'), 'Must address test ownership');
    assert.ok(lower.includes('ci/cd') || lower.includes('pipeline'), 'Must address CI/CD');
    assert.ok(lower.includes('shard') || lower.includes('parallel'), 'Must address parallel execution / sharding');
    assert.ok(lower.includes('report') || lower.includes('blob'), 'Must address reporting');
    assert.ok(lower.includes('trade-off') || lower.includes('governance'), 'Must address trade-offs and governance');
    assert.ok(!res.reply.includes('Thread.sleep'), 'No anti-patterns');
  });

  // TEST 2: 4,000 flaky tests reduction over 90 days
  it('TEST 2: Delivers a diagnostic, root-cause, prioritized 90-day roadmap for 4,000 flaky tests', () => {
    const res = queryMentor('We have 4,000 flaky tests. How do we reduce flakiness over 90 days?');
    assert.strictEqual(res.source, 'searchQAKnowledge');
    const lower = res.reply.toLowerCase();

    // Must address diagnostic strategy, classification, ownership, RCA, prioritization, metrics, phased roadmap
    assert.ok(lower.includes('quarantine'), 'Must recommend quarantine to unblock CI');
    assert.ok(lower.includes('phase 1') && lower.includes('phase 2') && lower.includes('phase 3'), 'Must provide phased 90-day roadmap');
    assert.ok(lower.includes('root-cause') || lower.includes('root cause'), 'Must classify root causes');
    assert.ok(lower.includes('flakiness index') || lower.includes('metric') || lower.includes('flakiness rate'), 'Must define metrics');
    assert.ok(lower.includes('ownership') || lower.includes('squad'), 'Must establish test ownership');
    assert.ok(!res.reply.includes('Thread.sleep'), 'Must not recommend arbitrary sleeps');
  });

  // TEST 3: Introducing AI agents into an existing QA CoE
  it('TEST 3: Formulates enterprise strategy for introducing AI agents into QA CoE (RAG, MCP, HITL, ROI)', () => {
    const res = queryMentor('How should we introduce AI agents into an existing QA CoE?');
    assert.strictEqual(res.source, 'searchQAKnowledge');
    const lower = res.reply.toLowerCase();

    // Must address use cases, architecture, RAG, MCP, human approval, security, evaluation, ROI
    assert.ok(lower.includes('use case') || lower.includes('triage'), 'Must identify high-yield use cases');
    assert.ok(lower.includes('rag'), 'Must explain RAG architecture');
    assert.ok(lower.includes('mcp') || lower.includes('model context protocol'), 'Must leverage Model Context Protocol');
    assert.ok(lower.includes('human') || lower.includes('hitl'), 'Must mandate Human-in-the-Loop approval');
    assert.ok(lower.includes('security') || lower.includes('privacy') || lower.includes('pii'), 'Must cover enterprise data security');
    assert.ok(lower.includes('roi') || lower.includes('metric') || lower.includes('ddp'), 'Must define ROI measurement');
  });

  // TEST 4: Selenium vs Playwright for a new automation framework
  it('TEST 4: Provides context-aware trade-off evaluation between Selenium and Playwright without dogmatic bias', () => {
    const res = queryMentor('Should we use Selenium or Playwright for a new automation framework?');
    assert.strictEqual(res.source, 'searchQAKnowledge');
    const lower = res.reply.toLowerCase();

    // Must address context-aware comparison, trade-offs, migration considerations, no universal unsupported recommendation
    assert.ok(lower.includes('websocket') || lower.includes('protocol') || lower.includes('http'), 'Must contrast underlying communication protocols');
    assert.ok(lower.includes('playwright') && lower.includes('selenium'), 'Must evaluate both tools');
    assert.ok(lower.includes('when to choose playwright'), 'Must specify when Playwright is optimal');
    assert.ok(lower.includes('when to choose selenium'), 'Must specify when Selenium remains appropriate');
    assert.ok(lower.includes('trade-off') || lower.includes('matrix'), 'Must present architectural trade-offs');
  });

  // TEST 5: Enterprise test governance
  it('TEST 5: Designs enterprise test governance across ownership, quality gates, metrics, and release governance', () => {
    const res = queryMentor('Explain how to design enterprise test governance.');
    assert.strictEqual(res.source, 'searchQAKnowledge');
    const lower = res.reply.toLowerCase();

    // Must address ownership, standards, metrics, quality gates, reporting, release governance
    assert.ok(lower.includes('ownership') || lower.includes('federated') || lower.includes('hub-and-spoke'), 'Must define ownership model');
    assert.ok(lower.includes('quality gate') || lower.includes('pipeline'), 'Must define tiered quality gates');
    assert.ok(lower.includes('ddp') || lower.includes('defect detection percentage') || lower.includes('escape rate'), 'Must specify mathematical quality metrics');
    assert.ok(lower.includes('release') || lower.includes('dashboard'), 'Must define release governance and readiness');
  });

});
