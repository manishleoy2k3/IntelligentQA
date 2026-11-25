const { test, describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('AI Coding Coach & Chat Improvements', () => {
  const askAiPath = path.join(__dirname, '../src/components/home/ask-ai-widget.tsx');
  const chatRoutePath = path.join(__dirname, '../src/app/api/ai/qa-chat/route.ts');
  const topNavPath = path.join(__dirname, '../src/components/layout/top-nav.tsx');

  const askAiContent = fs.readFileSync(askAiPath, 'utf8');
  const chatRouteContent = fs.readFileSync(chatRoutePath, 'utf8');
  const topNavContent = fs.readFileSync(topNavPath, 'utf8');

  it('Requirement 1: Shift+Enter support and auto-expanding textarea chat holding area', () => {
    // Verifies textarea replacement for multi-line code/query entry
    assert.ok(
      askAiContent.includes('<textarea') && askAiContent.includes('ref={textareaRef}'),
      'AskAIWidget uses textarea with textareaRef instead of single-line input'
    );
    // Verifies Shift+Enter logic vs standard Enter
    assert.ok(
      askAiContent.includes('e.key === "Enter" && !e.shiftKey'),
      'Enter without shift submits the chat message'
    );
    assert.ok(
      askAiContent.includes('Shift+Enter for newline'),
      'Placeholder notifies user that Shift+Enter inserts new lines'
    );
    // Verifies auto-height adjustment up to 140px max
    assert.ok(
      askAiContent.includes('adjustTextareaHeight') && askAiContent.includes('140'),
      'Includes dynamic textarea expansion up to 140px height'
    );
    assert.ok(
      askAiContent.includes('max-h-[140px]'),
      'Textarea has max-height constraint for smooth scrolling'
    );
  });

  it('Requirement 2: Chat minimize area allowing users to view main page and copy text', () => {
    // Verifies isMinimized state
    assert.ok(
      askAiContent.includes('const [isMinimized, setIsMinimized] = useState(false);'),
      'Defines isMinimized state'
    );
    // Verifies minimize button in modal header
    assert.ok(
      askAiContent.includes('onClick={() => setIsMinimized(true)}') &&
        askAiContent.includes('Minus'),
      'Modal header has a minimize button with Minus icon'
    );
    // Verifies minimized floating pill / docked bar
    assert.ok(
      askAiContent.includes('isOpen && isMinimized') &&
        askAiContent.includes('fixed bottom-6 right-6'),
      'Renders floating docked bar in bottom-right corner when minimized'
    );
    // Verifies restore button
    assert.ok(
      askAiContent.includes('onClick={() => setIsMinimized(false)}'),
      'Docked pill contains restore button to resume chat'
    );
    // Verifies message count in docked pill
    assert.ok(
      askAiContent.includes('queries') || askAiContent.includes('Click to restore'),
      'Docked bar displays query indicator and restore prompt'
    );
  });

  it('Requirement 3: Multi-turn conversation continuation and history memory', () => {
    // Verifies frontend passes history to backend
    assert.ok(
      askAiContent.includes('history: historyPayload') || askAiContent.includes('historyPayload'),
      'AskAIWidget sends history payload in POST body'
    );
    assert.ok(
      askAiContent.includes('slice(-10)'),
      'Limits conversational history to recent turns to protect token limits'
    );

    // Verifies backend handles multi-turn conversation for Gemini
    assert.ok(
      chatRouteContent.includes('sanitizedHistory') || chatRouteContent.includes('mappedRole'),
      'Route processes multi-turn history into alternating roles'
    );
    assert.ok(
      chatRouteContent.includes("item.role === 'assistant' ? 'model' : 'user'"),
      'Maps assistant roles to Gemini model role'
    );
    assert.ok(
      chatRouteContent.includes('Follow-up Question') ||
        chatRouteContent.includes('parts: [{ text: query }]'),
      'Anchors current query in the conversation sequence'
    );

    // Verifies contextual continuation in local deterministic engine
    assert.ok(
      chatRouteContent.includes('contextualQuery') || chatRouteContent.includes('lastUserTurn'),
      'Local fallback utilizes previous turn context for follow-up questions'
    );
  });

  it('Requirement 4: Rename "Ask AI" to "AI Coding Coach" while preserving test compatibility', () => {
    // Verifies visible text in TopNav
    assert.ok(
      topNavContent.includes('>AI Coding Coach<') ||
        topNavContent.includes('AI Coding Coach</span>'),
      'TopNav visibly displays "AI Coding Coach"'
    );
    // Verifies sr-only labels for test backward compatibility
    assert.ok(
      topNavContent.includes('Ask AI</span>'),
      'TopNav preserves hidden "Ask AI" span for backward compatibility'
    );

    // Verifies widget header title
    assert.ok(
      askAiContent.includes('AI Coding Coach'),
      'AskAIWidget header visibly displays "AI Coding Coach"'
    );
    assert.ok(
      askAiContent.includes('Ask AI Coding Assistant'),
      'AskAIWidget header preserves "Ask AI Coding Assistant" for backward compatibility'
    );

    // Verifies initial greeting
    assert.ok(
      askAiContent.includes('I am your AI Coding Coach'),
      'Initial greeting introduces AI Coding Coach'
    );

    // Verifies custom event dispatching
    assert.ok(
      topNavContent.includes('intelligentqa_open_ai_coding_coach') &&
        topNavContent.includes('intelligentqa_open_ask_ai'),
      'TopNav dispatches both intelligentqa_open_ai_coding_coach and intelligentqa_open_ask_ai'
    );
    assert.ok(
      askAiContent.includes('intelligentqa_open_ai_coding_coach') &&
        askAiContent.includes('intelligentqa_open_ask_ai'),
      'AskAIWidget listens for both events'
    );
  });
});
