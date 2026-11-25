const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

const jiti = require('jiti')(path.resolve(process.cwd(), 'tests/interview-griller.test.cjs'), {
  alias: { '@': path.resolve(process.cwd(), 'src') },
});

const { getQuestionsByLevelAndDifficulty, INTERVIEW_KNOWLEDGE_BASE } = jiti(
  '../src/lib/interview-questions-bank.ts'
);

const { QAInterviewAgent } = jiti('../src/lib/qa-interview-agent.ts');

describe('Candidate Tech Stack & Skills Selection Suite', () => {
  it('should filter and prioritize Selenium and Java questions when candidate selects Selenium & Java', () => {
    const questions = getQuestionsByLevelAndDifficulty({
      difficulty: 'Medium',
      experienceTier: '3-5 Years',
      count: 3,
      skills: ['Selenium', 'Java'],
    });

    assert.strictEqual(questions.length, 3);
    // At least one question must be directly focused on Selenium or Java
    const hasSeleniumOrJava = questions.some((q) => {
      const combined = `${q.technology} ${q.category} ${q.topic} ${q.question}`.toLowerCase();
      return (
        combined.includes('selenium') || combined.includes('java') || combined.includes('webdriver')
      );
    });
    assert.strictEqual(hasSeleniumOrJava, true, 'Expected questions to include Selenium or Java');
  });

  it('should prioritize REST Assured questions when candidate selects REST Assured', () => {
    const questions = getQuestionsByLevelAndDifficulty({
      difficulty: 'Medium',
      experienceTier: '3-5 Years',
      count: 3,
      skills: ['REST Assured'],
    });

    assert.strictEqual(questions.length, 3);
    const hasRestAssured = questions.some((q) => {
      const combined = `${q.technology} ${q.category} ${q.topic} ${q.question}`.toLowerCase();
      return combined.includes('rest') || combined.includes('assured') || combined.includes('api');
    });
    assert.strictEqual(hasRestAssured, true, 'Expected questions to include REST Assured / API');
  });

  it('should prioritize Playwright and TypeScript questions when candidate selects Playwright & TypeScript', () => {
    const questions = getQuestionsByLevelAndDifficulty({
      difficulty: 'Hard',
      experienceTier: '6-9 Years',
      count: 3,
      skills: ['Playwright', 'TypeScript'],
    });

    assert.strictEqual(questions.length, 3);
    const hasPlaywright = questions.some((q) => {
      const combined = `${q.technology} ${q.category} ${q.topic} ${q.question}`.toLowerCase();
      return combined.includes('playwright');
    });
    assert.strictEqual(hasPlaywright, true, 'Expected questions to include Playwright');
  });

  it('should prioritize Manual QA test design and triage when candidate selects Manual QA', () => {
    const questions = getQuestionsByLevelAndDifficulty({
      difficulty: 'Easy',
      experienceTier: '0-2 Years',
      count: 3,
      skills: ['Manual QA'],
    });

    assert.strictEqual(questions.length, 3);
    const hasManual = questions.some((q) => {
      const combined = `${q.technology} ${q.category} ${q.topic} ${q.question}`.toLowerCase();
      return (
        combined.includes('manual') ||
        combined.includes('boundary') ||
        combined.includes('triage') ||
        combined.includes('defect') ||
        combined.includes('test design')
      );
    });
    assert.strictEqual(hasManual, true, 'Expected questions to include Manual QA / Test Design');
  });

  it('should tailor QAInterviewAgent.generateInitialSession questions to candidate skills', async () => {
    const session = await QAInterviewAgent.generateInitialSession({
      difficulty: 'Medium',
      experienceTier: '3-5 Years',
      skills: ['Selenium', 'REST Assured'],
      count: 3,
    });

    assert.strictEqual(session.questionNumber, 1);
    assert.strictEqual(session.totalQuestions, 3);
    assert.strictEqual(session.questionList.length, 3);

    // Verify questions in list pertain to candidate's skills
    const allText = session.questionList
      .map((q) => `${q.category} ${q.topic} ${q.question}`)
      .join(' ')
      .toLowerCase();
    const matchesSkill =
      allText.includes('selenium') || allText.includes('rest') || allText.includes('api');
    assert.strictEqual(
      matchesSkill,
      true,
      'Expected generated session to reflect Selenium or REST Assured'
    );
  });

  it('should verify the UI component implements AVAILABLE_SKILLS, SKILL_PRESETS, and skills selection modal', () => {
    const modalPath = path.resolve(
      process.cwd(),
      'src/components/interview/interview-griller-modal.tsx'
    );
    const modalCode = fs.readFileSync(modalPath, 'utf-8');

    // Verify state & presets exist
    assert(modalCode.includes('AVAILABLE_SKILLS'), 'AVAILABLE_SKILLS must be defined');
    assert(modalCode.includes('SKILL_PRESETS'), 'SKILL_PRESETS must be defined');
    assert(modalCode.includes('selectedSkills'), 'selectedSkills state must be defined');
    assert(modalCode.includes('showSkillsModal'), 'showSkillsModal state must be defined');
    assert(modalCode.includes('toggleSkill'), 'toggleSkill function must be defined');
    assert(modalCode.includes('applyPreset'), 'applyPreset function must be defined');
    assert(
      modalCode.includes('intelligentqa_selected_skills'),
      'Skills must be persisted to localStorage'
    );
    assert(modalCode.includes('Playwright + TypeScript SDET'), 'Playwright preset must exist');
    assert(
      modalCode.includes('Enterprise Selenium + Java SDET'),
      'Selenium + Java preset must exist'
    );
    assert(modalCode.includes('Select Your Tech Stack'), 'Skills modal title must be rendered');
  });

  it('should verify the API route accepts body.skills and propagates to QAInterviewAgent', () => {
    const routePath = path.resolve(process.cwd(), 'src/app/api/ai/interview-grill/route.ts');
    const routeCode = fs.readFileSync(routePath, 'utf-8');

    assert(routeCode.includes('skills = []'), 'API route must destructure skills from body');
    assert(routeCode.includes('candidateSkills'), 'API route must prepare candidateSkills');
    assert(
      routeCode.includes('skills: candidateSkills'),
      'API route must pass skills to generateInitialSession'
    );
  });
});
