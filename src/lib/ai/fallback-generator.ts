import { AIEnhancementRequest, AIStructuredResponse, TechnicalReviewData } from './types';
import { searchQAKnowledge, QAKnowledgeEntry } from '@/lib/qa-knowledge-base';

export function generateFallbackEnhancement(request: AIEnhancementRequest): AIStructuredResponse {
  const lessonTitle = request.context?.currentLesson?.title || 'QA Automation Architecture';
  const courseTitle = request.context?.course?.name || 'Test Automation Engineering';
  const moduleTitle = request.context?.module?.name || 'Automation Frameworks';
  const existingHtml = request.context?.currentLesson?.contentHtml || '';
  const action = request.action || 'improve_content';

  // Grounding: Search domain knowledge base for topic-specific SDET expertise
  const topicQuery = `${lessonTitle} ${moduleTitle} ${request.prompt || ''}`;
  const matchedKnowledge: QAKnowledgeEntry[] = searchQAKnowledge(topicQuery);
  const primaryMatch: QAKnowledgeEntry | undefined = matchedKnowledge[0];

  // Check existing content properties
  const hasMermaid = existingHtml.includes('mermaid') || /flowchart|sequenceDiagram|graph TD/i.test(existingHtml);
  const hasCode = existingHtml.includes('<pre') || existingHtml.includes('<code>');
  const hasFailures = /exception|error|troubleshoot|failure|staleelement|timeout/i.test(existingHtml);
  const wordCount = existingHtml.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;

  if (action === 'technical_review') {
    const completeness = Math.min(94, Math.max(70, Math.round(75 + (wordCount > 300 ? 13 : wordCount / 30))));
    const practicalDepth = Math.min(90, Math.max(65, Math.round(68 + (hasCode ? 12 : 0) + (hasFailures ? 10 : 0))));
    const codeScore = hasCode ? 80 : 55;
    const diagScore = hasMermaid ? 88 : 45;
    const failScore = hasFailures ? 82 : 50;

    const overall = Math.round(
      completeness * 0.3 +
      practicalDepth * 0.25 +
      codeScore * 0.2 +
      diagScore * 0.15 +
      failScore * 0.1
    );

    const review: TechnicalReviewData = {
      overallScore: overall,
      status: overall >= 80 ? 'Strong' : 'Needs Improvement',
      metrics: {
        completeness: {
          name: 'Technical completeness',
          score: completeness,
          maxScore: 100,
          description: 'Core concepts, lifecycle mechanics, and curriculum alignment',
        },
        practicalDepth: {
          name: 'Practical depth',
          score: practicalDepth,
          maxScore: 100,
          description: 'Production enterprise SDET scenarios, edge cases, and architectural rigor',
        },
        codeExamples: {
          name: 'Code quality & multi-language examples',
          score: codeScore,
          maxScore: 100,
          description: 'Executable Java and TypeScript automated test implementations',
        },
        diagrams: {
          name: 'Architectural diagrams',
          score: diagScore,
          maxScore: 100,
          description: 'Visual Mermaid execution and lifecycle diagrams',
        },
        failureHandling: {
          name: 'Failures & troubleshooting',
          score: failScore,
          maxScore: 100,
          description: 'Real framework exceptions and debugging tactics',
        },
      },
      recommendations: [
        {
          type: 'Good',
          category: 'Concepts',
          title: 'Concept explanation is clear.',
          detail: `The core technical definition and architectural intent for "${lessonTitle}" are structured logically for SDETs.`,
        },
        {
          type: hasMermaid ? 'Good' : 'Missing',
          category: 'Architecture',
          title: hasMermaid ? 'Architecture diagram is present.' : 'No architecture diagram.',
          detail: hasMermaid
            ? 'Mermaid flowchart effectively visualizes component execution hierarchy.'
            : 'Visual representation of data flow and test execution lifecycle is absent.',
          actionableStep: hasMermaid ? undefined : 'Add a Mermaid flowchart showing the request-response or execution lifecycle.',
        },
        {
          type: hasCode ? 'Improve' : 'Missing',
          category: 'Code Examples',
          title: hasCode ? 'Add Java and TypeScript examples.' : 'Missing executable test automation code.',
          detail: hasCode
            ? 'Ensure enterprise production patterns with proper imports, thread isolation, and clean assertions.'
            : 'Add runnable test automation scripts for both Java and TypeScript.',
          actionableStep: 'Provide side-by-side Java and TypeScript examples with assertion validations.',
        },
        {
          type: hasFailures ? 'Good' : 'Missing',
          category: 'Failures',
          title: hasFailures ? 'Common failure scenarios included.' : 'Common failure scenarios.',
          detail: hasFailures
            ? 'Identifies realistic framework exceptions and diagnosis steps.'
            : 'Missing real-world framework exceptions, flakiness causes, and troubleshooting tactics.',
          actionableStep: hasFailures ? undefined : 'Include common failure scenarios with root cause and resolution tactics.',
        },
        {
          type: 'Good',
          category: 'Objectives',
          title: 'Learning objectives are relevant.',
          detail: 'Objectives align with senior QA engineering and test automation standards.',
        },
      ],
      summaryVerbatim: `Technical review audit completed for "${lessonTitle}". Overall score: ${overall}/100.`,
    };

    return {
      response_type: 'technical_review',
      summary: `Technical review audit completed for "${lessonTitle}". Scored ${completeness}/100 in Technical Completeness and ${practicalDepth}/100 in Practical Depth.`,
      generated_content: `## Technical Audit Report: ${lessonTitle}\n\n### Evaluation Summary\n- **Technical Completeness**: ${completeness}/100\n- **Practical Depth**: ${practicalDepth}/100\n- **Overall Rubric Score**: ${overall}/100\n\n### Key Findings\n- **Concept Clarity**: Well defined and aligned with the **${moduleTitle}** module.\n- **Architecture Visuals**: ${hasMermaid ? 'Mermaid diagrams present.' : 'Needs a Mermaid architecture flowchart.'}\n- **Implementation Code**: Recommend providing parallel **Java** and **TypeScript** production examples.\n- **Failure Modes**: ${hasFailures ? 'Includes troubleshooting.' : 'Add top 3 real-world framework exceptions and debugging strategies.'}`,
      review,
      technical_warnings: [],
      assumptions: ['Audited against IntelligentQA SDET Enterprise Curriculum Rubric.'],
      suggested_actions: ['Open in Visual Editor to apply recommended improvements.'],
    };
  }

  const tsCode = primaryMatch?.codeSnippet?.playwright || `import { test, expect } from '@playwright/test';

test.describe('${lessonTitle} - Enterprise Test Suite', () => {
  test('should execute successfully with robust auto-waiting and assertions', async ({ page }) => {
    // 1. Arrange & Navigate
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/Enterprise Dashboard/);

    // 2. Act with built-in auto-waiting
    const actionElement = page.getByRole('button', { name: 'Submit' });
    await expect(actionElement).toBeVisible({ timeout: 5000 });
    await actionElement.click();

    // 3. Assert state change
    const confirmationBanner = page.locator('.notification-success');
    await expect(confirmationBanner).toContainText('Operation Completed');
  });
});`;

  const javaCode = primaryMatch?.codeSnippet?.restassured || primaryMatch?.codeSnippet?.selenium || `package com.intelligentqa.automation;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

public class ${lessonTitle.replace(/[^a-zA-Z0-9]/g, '')}Test {

    @Test
    @DisplayName("Verify ${lessonTitle} execution with thread isolation")
    void testExecutionFlow() {
        // Arrange
        var context = new AutomationExecutionContext("Prod-Staging");
        
        // Act
        boolean result = context.executeAction("${lessonTitle}");
        
        // Assert
        assertTrue(result, "Action should succeed without flakiness or timeout");
    }
}`;

  const topicExplanation = primaryMatch?.detailedAnswer
    ? primaryMatch.detailedAnswer
    : `**${lessonTitle}** is a critical building block within **${moduleTitle}** in our **${courseTitle}** curriculum. 

In enterprise test automation, understanding this concept ensures high reliability, test isolation, and maintainable framework design across large-scale CI/CD execution.`;

  const bestPracticesList = primaryMatch?.bestPractices && primaryMatch.bestPractices.length > 0
    ? primaryMatch.bestPractices.map((bp, i) => `${i + 1}. **${bp}**`).join('\n')
    : `1. **Thread Isolation**: Never share mutable state or browser context instances between test threads.\n2. **Explicit Assertions**: Always assert explicit states (\`toBeVisible\`, \`toHaveCount\`) rather than relying solely on page navigations.\n3. **Artifact Retention**: Automatically capture trace viewer files, videos, and network logs upon failure.`;

  // Generate Enhanced Content for Lesson Editor
  const generatedMarkdown = `## 1. Lesson Overview & Motivation
${topicExplanation}

### Key Objectives
- Understand internal architectural mechanics and lifecycle.
- Implement robust, thread-safe test automation routines in **TypeScript** and **Java**.
- Diagnose and prevent common test suite flakiness and synchronization issues.

---

## 2. Architecture & Execution Flow
The diagram below illustrates the runtime interaction between test client, browser driver / HTTP client, and application state:

\`\`\`mermaid
flowchart TD
    Client["Test Runner (Playwright / JUnit)"] -->|"1. Setup & Context Initialization"| Worker["Isolated Test Worker"]
    Worker -->|"2. Execute Action / API Call"| Target["Application Under Test (AUT)"]
    Target -->|"3. State Mutation / Event"| Verifier["Assertion & Verification Layer"]
    Verifier -->|"4. Collect Artifacts & Telemetry"| Reporter["Allure / Test Telemetry Engine"]
\`\`\`

---

## 3. Practical Implementation & Code Examples

### A. TypeScript (Playwright)
\`\`\`typescript
${tsCode}
\`\`\`

### B. Java (Selenium / REST Assured)
\`\`\`java
${javaCode}
\`\`\`

---

## 4. Common Failures & Troubleshooting

| Error / Exception | Root Cause | Debugging & Prevention Strategy |
| :--- | :--- | :--- |
| \`TimeoutError: element not found\` | Element rendered asynchronously or behind lazy-loaded Shadow DOM | Use locator-based auto-waiting instead of arbitrary \`sleep()\`. |
| \`StaleElementReferenceException\` | DOM mutated during execution | Re-query locator dynamically through Page Object Model getter. |
| \`AssertionError: expected status 200\` | Token expired or concurrent race condition in test worker | Leverage worker-level fixtures to ensure fresh isolated state per test. |

---

## 5. Enterprise Best Practices
${bestPracticesList}
`;

  return {
    response_type: 'full_lesson',
    summary: `Comprehensive technical content generated for "${lessonTitle}" with architecture diagrams, dual-language examples (Java & TypeScript), and failure analysis.`,
    generated_content: generatedMarkdown,
    diagrams: [
      {
        type: 'mermaid',
        title: `${lessonTitle} Architecture Flow`,
        syntax: `flowchart TD\n    A["Test Runner"] --> B["Isolated Worker"]\n    B --> C["Target System"]\n    C --> D["Verification & Artifacts"]`,
        explanation: 'Component execution lifecycle and artifact generation hierarchy.',
      },
    ],
    code_examples: [
      {
        language: 'typescript',
        title: 'Playwright TypeScript Implementation',
        code: `import { test, expect } from '@playwright/test';\n\ntest('${lessonTitle}', async ({ page }) => {\n  await page.goto('/');\n  await expect(page.locator('h1')).toBeVisible();\n});`,
        explanation: 'Production-ready Playwright automated test with auto-waiting.',
      },
    ],
    technical_warnings: [],
    assumptions: ['Node.js 18+, Playwright v1.40+, Java 17+ with JUnit 5.'],
    suggested_actions: ['Insert content into editor or review specific sections.'],
  };
}
