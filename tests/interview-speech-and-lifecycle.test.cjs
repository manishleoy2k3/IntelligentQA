const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

const jiti = require('jiti')(path.resolve(process.cwd(), 'tests/interview-griller.test.cjs'), {
  alias: { '@': path.resolve(process.cwd(), 'src') }
});

const { POST } = jiti('../src/app/api/ai/interview-grill/route.ts');

describe('Interview Griller - Speech-to-Text & Input Lifecycle Resilience', () => {
  it('should verify UI code implements interim de-duplication and clean speech aborting', () => {
    const modalPath = path.resolve(process.cwd(), 'src/components/interview/interview-griller-modal.tsx');
    const modalCode = fs.readFileSync(modalPath, 'utf8');

    // 1. Must have baseSpeechTextRef
    assert(modalCode.includes('baseSpeechTextRef'), 'Must track baseSpeechTextRef to prevent duplication');

    // 2. Must separate isFinal and interim speech results instead of blind prev append
    assert(modalCode.includes('resultItem.isFinal'), 'Must differentiate final vs interim speech segments');
    assert(modalCode.includes('finalTranscript += resultItem[0].transcript'), 'Must accumulate final transcript cleanly');
    assert(!modalCode.includes('setUserAnswer(prev => {\n            const trimmed = prev.trim();\n            return trimmed ? `${trimmed} ${transcript.trim()}` : transcript.trim();'),
      'Must NOT blindly append interim transcripts to prev state causing repeated text loops'
    );

    // 3. Must implement stopListening with abort and callback disconnection
    assert(modalCode.includes('const stopListening = useCallback('), 'Must define stopListening callback');
    assert(modalCode.includes('recognitionRef.current.onresult = null;'), 'Must neutralize onresult callback on stop');
    assert(modalCode.includes('recognitionRef.current.abort()'), 'Must call abort() to halt pending speech worker buffers');

    // 4. Must call stopListening() and reset baseSpeechTextRef before clearing in submitAnswer
    assert(modalCode.includes('stopListening();\n    stopSpeaking();'), 'Must stop listening immediately upon submission');
    assert(modalCode.includes('baseSpeechTextRef.current = \'\';'), 'Must reset speech baseline on submission');

    // 5. Must also reset speech state on next question and restart
    assert(modalCode.includes('handleProceedToNextQuestion'), 'Must have handleProceedToNextQuestion');
  });

  it('should validate live coach accurately when question is passed via either question or currentQuestion', async () => {
    // Test with currentQuestion property (the one used by triggerLiveCoach)
    const coachReq = {
      json: async () => ({
        action: 'coach',
        currentQuestion: 'How do you design a Page Object Model in Playwright?',
        currentAnswer: 'The core difference is that POM encapsulates selectors and action methods inside dedicated classes. For example, export class LoginPage { constructor(page) { this.page = page; } }. This prevents flakiness across the CI pipeline.',
        expectedFocus: 'Encapsulation, locators, action methods, maintenance',
        turns: [],
        questionList: [],
      }),
      headers: { get: () => null },
    };

    const res = await POST(coachReq);
    const data = await res.json();

    assert.strictEqual(data.framework, 'PREP');
    assert.strictEqual(data.hasPoint, true);
    assert.strictEqual(data.hasReason, true);
    assert.strictEqual(data.hasExample, true);
    assert.strictEqual(data.hasImpact, true);
    assert(Array.isArray(data.suggestions) && data.suggestions.length === 4);
  });

  it('should validate behavioral question via STAR framework when question indicates a situational scenario', async () => {
    const coachReq = {
      json: async () => ({
        action: 'coach',
        currentQuestion: 'Tell me about a time you resolved a major production defect with developers.',
        currentAnswer: 'In our payment service during the Black Friday release, our task was to eliminate checkout latency timeouts. I analyzed network traces and refactored the database connection pool. This resulted in zero dropped orders and a 45% reduction in API response times.',
        expectedFocus: 'Situation, Task, Action, Result',
        turns: [],
        questionList: [],
      }),
      headers: { get: () => null },
    };

    const res = await POST(coachReq);
    const data = await res.json();

    assert.strictEqual(data.framework, 'STAR');
    assert.strictEqual(data.prepStage, 'Polished');
    assert.strictEqual(data.hasPoint, true); // Situation
    assert.strictEqual(data.hasReason, true); // Task
    assert.strictEqual(data.hasExample, true); // Action
    assert.strictEqual(data.hasImpact, true); // Result
  });
});
