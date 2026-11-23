export interface ArchitectureNode {
  id: string;
  label: string;
  subtitle?: string;
  badge?: string;
  highlight?: boolean;
}

export interface ArchitectureConnection {
  from: string;
  to: string;
  label?: string;
}

export interface DiagramData {
  type: 'pipeline' | 'layers' | 'client-server' | 'agent-loop';
  title: string;
  caption?: string;
  nodes: ArchitectureNode[];
  connections?: ArchitectureConnection[];
}

export interface CodeBlockData {
  language: string;
  title?: string;
  code: string;
  filename?: string;
  explanation?: string;
}

export interface CalloutData {
  title: string;
  message: string;
  tip?: string;
}

export interface TroubleshootingItem {
  error: string;
  cause: string;
  solution: string;
  codeFix?: string;
}

export interface ComparisonTableData {
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface LessonSectionData {
  id: string;
  title: string;
  level?: 2 | 3;
  content: string[];
  diagram?: DiagramData;
  codeBlock?: CodeBlockData;
  infoCallout?: CalloutData;
  warningCallout?: CalloutData;
  comparisonTable?: ComparisonTableData;
  troubleshooting?: TroubleshootingItem[];
}

export interface AcademyLessonData {
  id: string;
  slug: string;
  title: string;
  moduleSlug: string;
  moduleTitle: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  summary: string;
  sections: LessonSectionData[];
}

export interface AcademyModuleData {
  id: string;
  slug: string;
  title: string;
  description: string;
  lessons: AcademyLessonData[];
}

export const ACADEMY_MODULES: AcademyModuleData[] = [
  // =========================================================================
  // Module 1: Introduction to AI
  // =========================================================================
  {
    id: 'mod-intro-ai',
    slug: 'introduction-to-ai',
    title: 'Introduction to AI',
    description: 'Foundational concepts of artificial intelligence, generative models, and neural architecture.',
    lessons: [
      {
        id: 'les-what-is-ai',
        slug: 'what-is-artificial-intelligence',
        title: 'What is Artificial Intelligence?',
        moduleSlug: 'introduction-to-ai',
        moduleTitle: 'Introduction to AI',
        estimatedTime: '8 min read',
        difficulty: 'Beginner',
        tags: ['AI Fundamentals', 'Machine Learning', 'Overview'],
        summary: 'Explore the fundamental definition of AI, its historical progression from rule-based heuristic systems to deep learning, and its modern applications in software quality assurance.',
        sections: [
          {
            id: 'ai-definition',
            title: 'Defining Artificial Intelligence',
            level: 2,
            content: [
              'Artificial Intelligence (AI) refers to the simulation of human intelligence in machines programmed to think, reason, learn, and generalize from experience.',
              'In software engineering and QA, AI has evolved from static heuristic scripts into predictive systems capable of synthesizing test cases, detecting visual defects, and diagnosing execution failures.',
            ],
            infoCallout: {
              title: 'Key Industry Takeaway',
              message: 'AI in QA is not about replacing human testers, but rather eliminating repetitive locator maintenance and accelerating regression test cycles.',
            },
          },
          {
            id: 'ai-categories',
            title: 'Core Categories of AI',
            level: 2,
            content: [
              'Modern AI can be grouped into three distinct capability tiers: Narrow AI (specialized in one task, such as computer vision or automated speech recognition), General AI (AGI, capable of performing any intellectual task a human can), and Super AI.',
              'All production systems deployed today operate within the Narrow AI category, optimized for specific operational tasks such as test script generation, dynamic locator healing, and log triage.',
            ],
            comparisonTable: {
              title: 'Comparison: Traditional Automation vs AI-Enhanced QA',
              headers: ['Aspect', 'Traditional Test Automation', 'AI-Enhanced QA Platform'],
              rows: [
                ['Element Locators', 'Rigid XPath or CSS selectors that break when DOM changes', 'Self-healing multi-attribute fingerprints with confidence scoring'],
                ['Test Generation', 'Manual authoring of step-by-step scripts in Java/TypeScript', 'Autonomous synthesis of executable tests from requirements and user stories'],
                ['Visual Validation', 'Brittle pixel-by-pixel comparisons causing false positives', 'Semantic computer vision recognizing layout anomalies across screen resolutions'],
                ['Failure Triage', 'Engineers manually parsing 500-line stack traces in CI logs', 'Automated root-cause analysis with actionable remediation code snippets'],
              ],
            },
          },
          {
            id: 'ai-architecture-pipeline',
            title: 'AI in Quality Assurance Architecture',
            level: 2,
            content: [
              'Modern AI architectures for test automation integrate multi-layered inference engines that analyze DOM changes, predict locator breakages, and synthesize resilient test strategies in real time.',
            ],
            diagram: {
              type: 'pipeline',
              title: 'Autonomous AI Testing Architecture',
              caption: 'Flow of requirement ingestion, test synthesis, self-healing execution, and triage.',
              nodes: [
                { id: 'specs', label: 'Feature Specs', subtitle: 'Jira / PRD / OpenAPI', badge: 'Input' },
                { id: 'ai-engine', label: 'AI Reasoning Core', subtitle: 'LLM + Context Engine', badge: 'Inference', highlight: true },
                { id: 'test-gen', label: 'Test Synthesis', subtitle: 'Playwright & Selenium Suites', badge: 'Code Gen' },
                { id: 'self-heal', label: 'Self-Healing Exec', subtitle: 'Dynamic Locator Repair', badge: 'Runtime' },
                { id: 'triage', label: 'Root Cause Triage', subtitle: 'Failure Diagnosis & Fixes', badge: 'Report' },
              ],
              connections: [
                { from: 'specs', to: 'ai-engine', label: 'Ingest' },
                { from: 'ai-engine', to: 'test-gen', label: 'Generate' },
                { from: 'test-gen', to: 'self-heal', label: 'Execute' },
                { from: 'self-heal', to: 'triage', label: 'Analyze' },
              ],
            },
            codeBlock: {
              language: 'typescript',
              title: 'Self-Healing Locator Strategy using Multi-Attribute AI Fingerprints',
              filename: 'ai-locator-resolver.ts',
              code: `import { Page, Locator } from '@playwright/test';

interface ElementFingerprint {
  tag: string;
  testId?: string;
  ariaLabel?: string;
  textSnippet?: string;
  relativeXPath?: string;
}

export async function resolveResilientElement(page: Page, fp: ElementFingerprint): Promise<Locator> {
  // 1. Primary Strategy: Explicit Test ID
  if (fp.testId) {
    const primary = page.getByTestId(fp.testId);
    if (await primary.count() > 0) return primary.first();
  }

  // 2. Secondary Strategy: Semantic ARIA accessibility label
  if (fp.ariaLabel) {
    const semantic = page.getByLabel(fp.ariaLabel);
    if (await semantic.count() > 0) return semantic.first();
  }

  // 3. AI Fallback: Exact Text matching with automatic fuzzy tolerance
  if (fp.textSnippet) {
    return page.getByText(fp.textSnippet, { exact: false }).first();
  }

  throw new Error(\`[AI-Locator] Failed to resolve resilient element for fingerprint: \${JSON.stringify(fp)}\`);
}`,
              explanation: 'Self-healing locators fall back through prioritized selector strategies to prevent flakiness when front-end developers refactor markup or class names.',
            },
            troubleshooting: [
              {
                error: 'LocatorFlakinessWarning: Selector timed out waiting for DOM element',
                cause: 'Hardcoded CSS class or fragile XPath broke during a UI library upgrade or Tailwind rebuild.',
                solution: 'Switch to semantic accessibility attributes (aria-label, role) or data-testid selectors with multi-attribute fallback.',
                codeFix: `// Avoid: page.locator('div.btn-primary-2xl > span')
// Preferred: page.getByRole('button', { name: 'Submit Application' })`,
              },
            ],
          },
        ],
      },
      {
        id: 'les-what-is-genai',
        slug: 'what-is-generative-ai',
        title: 'What is Generative AI?',
        moduleSlug: 'introduction-to-ai',
        moduleTitle: 'Introduction to AI',
        estimatedTime: '10 min read',
        difficulty: 'Beginner',
        tags: ['Generative AI', 'Transformers', 'Content Generation'],
        summary: 'Understand generative models, how they differ from discriminative models, and how transformer architectures generate novel text, test suites, and synthetic test data.',
        sections: [
          {
            id: 'genai-concept',
            title: 'Generative vs. Discriminative Models',
            level: 2,
            content: [
              'While discriminative models classify existing data (e.g., determining whether a test passed or failed), generative models produce completely novel data distributions (e.g., synthesizing valid test payloads, edge-case scenarios, and Page Object Model classes).',
              'The breakthrough powering modern Generative AI is the Transformer architecture introduced by Vaswani et al. in 2017, utilizing self-attention mechanisms to understand contextual relationships across sequences.',
            ],
            codeBlock: {
              language: 'typescript',
              title: 'Example: Synthetic Test Payload Generator using Generative AI',
              code: `import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function generateBoundaryPayloads(schemaDefinition: string) {
  const prompt = \`Given this JSON Schema:
\${schemaDefinition}
Generate 5 boundary test payloads including edge cases (null bytes, max integers, Unicode surrogates) formatted as JSON.\`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return JSON.parse(response.text || '[]');
}`,
              explanation: 'Generative models take structured prompt instructions and output production-ready test data that accounts for boundary conditions.',
            },
          },
        ],
      },
      // DEMO LESSON 1: What is an LLM? (Complete Rich Content)
      {
        id: 'les-what-is-llm',
        slug: 'what-is-an-llm',
        title: 'What is an LLM?',
        moduleSlug: 'introduction-to-ai',
        moduleTitle: 'Introduction to AI',
        estimatedTime: '14 min read',
        difficulty: 'Beginner',
        tags: ['LLM Architecture', 'Transformers', 'Self-Attention', 'Tokenization'],
        summary: 'A deep architectural guide to Large Language Models: from tokenization and embeddings to transformer self-attention and inference token generation.',
        sections: [
          {
            id: 'llm-fundamentals',
            title: '1. Fundamentals of Large Language Models',
            level: 2,
            content: [
              'A Large Language Model (LLM) is a deep neural network trained on vast corpora of text data using self-supervised learning objectives. At their core, LLMs are probabilistic sequence predictors: given a sequence of tokens, they calculate a probability distribution over the vocabulary to predict the most likely subsequent token.',
              'Modern frontier models (such as GPT-4, Gemini 2.5, and Claude 3.7) contain hundreds of billions of parameters, enabling emergent reasoning, complex code generation, and multi-turn conversational memory.',
            ],
            infoCallout: {
              title: 'Core Concept: Next-Token Prediction',
              message: 'An LLM does not "think" in human concepts. It computes matrix multiplications across billions of weights to iteratively sample the next token according to a softmax temperature probability curve.',
            },
          },
          {
            id: 'llm-architecture-pipeline',
            title: '2. The LLM Processing Pipeline',
            level: 2,
            content: [
              'When you send a prompt to an LLM, the raw text travels through a multi-stage transformer pipeline before returning generated text. Understanding this pipeline is critical for engineers debugging hallucination and latency issues.',
            ],
            diagram: {
              type: 'pipeline',
              title: 'Figure 1: End-to-End LLM Transformer Inference Pipeline',
              caption: 'How raw user prompt text transforms into numerical embeddings, traverses attention layers, and generates output tokens.',
              nodes: [
                { id: 'n1', label: 'Raw User Prompt', subtitle: 'e.g. "Write Playwright POM"', badge: 'Input' },
                { id: 'n2', label: 'Byte-Pair Tokenizer', subtitle: 'Converts text into token IDs', badge: 'Tokenization' },
                { id: 'n3', label: 'Embedding & Positional Encoding', subtitle: 'Maps tokens to dense vectors', badge: 'Vector Space' },
                { id: 'n4', label: 'Multi-Head Self-Attention', subtitle: 'Computes query-key-value matrices', badge: 'Transformer Core', highlight: true },
                { id: 'n5', label: 'Feed-Forward & Softmax', subtitle: 'Calculates vocabulary probability', badge: 'Probabilities' },
                { id: 'n6', label: 'Decoded Output Stream', subtitle: 'Generated response tokens', badge: 'Output Stream' },
              ],
              connections: [
                { from: 'n1', to: 'n2', label: 'Text string' },
                { from: 'n2', to: 'n3', label: 'Int array [1542, 891]' },
                { from: 'n3', to: 'n4', label: 'High-dim tensor' },
                { from: 'n4', to: 'n5', label: 'Contextual representation' },
                { from: 'n5', to: 'n6', label: 'Sampling (Temp / Top-P)' },
              ],
            },
          },
          {
            id: 'llm-code-example',
            title: '3. Tokenization & Inference in Practice',
            level: 2,
            content: [
              'Below is an enterprise TypeScript implementation demonstrating how token counts directly impact context window usage and generation parameters when driving test automation synthesis.',
            ],
            codeBlock: {
              language: 'typescript',
              title: 'llm-inference-engine.ts',
              filename: 'src/lib/ai/llm-inference.ts',
              code: `import { GoogleGenAI } from '@google/genai';

interface GenerationConfig {
  temperature: number; // 0.0 = deterministic; 1.0 = creative
  maxOutputTokens: number;
  topP: number;
}

export class QAInferenceEngine {
  private client: GoogleGenAI;
  private modelName: string;

  constructor(apiKey: string, modelName = 'gemini-2.5-flash') {
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
  }

  /**
   * Generates production-ready Playwright Page Object Model
   */
  async generatePageObjectModel(htmlSnippet: string, config?: Partial<GenerationConfig>): Promise<string> {
    const systemPrompt = \`You are a Principal SDET Architect.
Your task is to inspect the provided HTML and generate a type-safe Playwright Page Object Model class.
Rules:
1. Always prioritize semantic locators: getByRole(), getByText(), getByLabel().
2. Use private readonly locators with descriptive names.
3. Expose high-level action methods that return void or other Page classes.
4. Never include hardcoded timeouts or sleep calls.\`;

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }, { text: htmlSnippet }] }
      ],
      config: {
        temperature: config?.temperature ?? 0.1, // Low temperature for deterministic code
        maxOutputTokens: config?.maxOutputTokens ?? 4096,
      }
    });

    return response.text ?? '// No code generated';
  }
}`,
              explanation: 'Notice temperature is pinned to 0.1 for deterministic, syntax-compliant code generation without hallucinated APIs.',
            },
          },
          {
            id: 'llm-important-notes',
            title: '4. Critical Notes on LLM Parameters',
            level: 2,
            content: [
              'Understanding model hyper-parameters is essential to avoiding unpredictable behavior in automated testing pipelines:',
            ],
            warningCallout: {
              title: 'Caution: Hallucinated Selectors in High-Temperature Runs',
              message: 'Setting temperature > 0.4 for code generation tasks frequently results in hallucinated CSS selectors and non-existent framework methods. For test synthesis, always maintain temperature between 0.0 and 0.2.',
            },
            comparisonTable: {
              title: 'LLM Hyperparameter Guide for QA Engineers',
              headers: ['Parameter', 'Range', 'Recommended for QA', 'Impact on Generation'],
              rows: [
                ['Temperature', '0.0 - 2.0', '0.0 - 0.2', 'Lower values guarantee deterministic, reproducible test code'],
                ['Top-P (Nucleus)', '0.0 - 1.0', '0.95', 'Restricts token sampling to cumulative probability mass'],
                ['Max Output Tokens', '1 - 8192', '4096', 'Prevents mid-syntax truncation in large class files'],
                ['Presence Penalty', '-2.0 - 2.0', '0.0', 'Encourages repetition of necessary standard boilerplate'],
              ],
            },
          },
          {
            id: 'llm-troubleshooting',
            title: '5. Common Errors & Troubleshooting',
            level: 2,
            content: [
              'Here are the most frequent issues encountered when integrating LLMs into automated QA workflows and their proven architectural fixes:',
            ],
            troubleshooting: [
              {
                error: 'ContextWindowExceededError (Max Tokens 128k exceeded)',
                cause: 'Passing raw uncompressed DOM dumps or 20MB application log files directly into the prompt.',
                solution: 'Strip script tags, style sheets, and SVG paths before sending HTML. Use Chunking or Semantic RAG to feed only relevant elements.',
                codeFix: `const cleanHtml = rawHtml.replace(/<script[\\s\\S]*?<\\/script>/gi, '').replace(/<style[\\s\\S]*?<\\/style>/gi, '');`,
              },
              {
                error: 'Non-Deterministic Assertion Failures in CI',
                cause: 'Running evaluations with default temperature (0.7+), causing slightly different assertion text across CI runs.',
                solution: 'Enforce temperature: 0.0 and configure a deterministic seed parameter in your model options.',
                codeFix: `config: { temperature: 0.0, seed: 42 }`,
              },
              {
                error: 'Truncated Output / Incomplete Closing Brackets',
                cause: 'maxOutputTokens ceiling reached before the LLM finished generating all test methods.',
                solution: 'Increase maxOutputTokens to at least 4096 and instruct the model to partition large test suites across multiple modular files.',
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // Module 2: Prompt Engineering
  // =========================================================================
  {
    id: 'mod-prompt-eng',
    slug: 'prompt-engineering',
    title: 'Prompt Engineering',
    description: 'Master the art and science of formulating high-precision instructions, few-shot examples, and chain-of-thought structures.',
    lessons: [
      // DEMO LESSON 2: What is Prompt Engineering? (Complete Rich Content)
      {
        id: 'les-what-is-prompt-eng',
        slug: 'what-is-prompt-engineering',
        title: 'What is Prompt Engineering?',
        moduleSlug: 'prompt-engineering',
        moduleTitle: 'Prompt Engineering',
        estimatedTime: '12 min read',
        difficulty: 'Beginner',
        tags: ['Prompt Engineering', 'Few-Shot Learning', 'Chain-of-Thought', 'System Prompts'],
        summary: 'Learn the principles of prompt engineering for QA: structuring system prompts, persona framing, few-shot demonstration pairs, and guardrails for test generation.',
        sections: [
          {
            id: 'prompt-eng-definition',
            title: '1. What is Prompt Engineering?',
            level: 2,
            content: [
              'Prompt Engineering is the practice of designing, refining, and optimizing inputs to generative AI models to reliably achieve accurate, deterministic, and structured outputs without fine-tuning model weights.',
              'In technical testing environments, a poorly structured prompt leads to vague answers, invalid syntax, and flaky locators. An engineered prompt acts as an executable specification with strict type contracts.',
            ],
            infoCallout: {
              title: 'The Golden Rule of Prompting',
              message: 'Garbage in, garbage out. If a human engineer cannot unequivocally understand the criteria from the prompt alone, an LLM will invent assumptions to fill in the gaps.',
            },
          },
          {
            id: 'prompt-anatomy',
            title: '2. The Anatomy of an Enterprise SDET Prompt',
            level: 2,
            content: [
              'A production-grade prompt consists of five distinct structural components working together:',
            ],
            diagram: {
              type: 'layers',
              title: 'Figure 2: 5-Tier Architecture of a Production QA Prompt',
              caption: 'Structured anatomy of a high-fidelity prompt ensuring consistent test automation output.',
              nodes: [
                { id: 'p1', label: '1. Role & Persona Definition', subtitle: '"You are a Staff Quality Engineer..."', badge: 'Context' },
                { id: 'p2', label: '2. Task & Primary Objective', subtitle: '"Generate a TestNG data-driven suite..."', badge: 'Core Task' },
                { id: 'p3', label: '3. Technical Constraints & Guardrails', subtitle: '"Use PageFactory; Do not use Thread.sleep"', badge: 'Rules', highlight: true },
                { id: 'p4', label: '4. Few-Shot Exemplars', subtitle: 'Input-output reference pairs', badge: 'Demonstration' },
                { id: 'p5', label: '5. Output Format Contract', subtitle: '"Return pure JSON conforming to Schema X"', badge: 'Envelope' },
              ],
            },
          },
          {
            id: 'prompt-code-example',
            title: '3. Production Prompt Template for Test Automation',
            level: 2,
            content: [
              'Here is an example of an engineered prompt template used to synthesize API test cases with zero hallucinations:',
            ],
            codeBlock: {
              language: 'typescript',
              title: 'prompt-template-builder.ts',
              filename: 'src/lib/prompts/api-test-generator.ts',
              code: `export function buildApiTestPrompt(endpointUrl: string, swaggerSpec: string): string {
  return \`### ROLE
You are a Principal API Automation Architect specializing in REST Assured and Java 21.

### TASK
Analyze the OpenAPI 3.0 specification below and generate a complete, non-truncated REST Assured test class for the endpoint: \${endpointUrl}.

### CONSTRAINTS
1. Use RequestSpecBuilder for common base URI, headers, and authentication.
2. Assert both HTTP status code AND JSON schema validation via matchesJsonSchemaInClasspath.
3. Include at least:
   - 1 Positive happy path test (Status 200/201).
   - 2 Negative boundary tests (400 Bad Request, 401 Unauthorized).
   - 1 Edge case test (Invalid data types).
4. Strictly do NOT wrap code in commentary. Return ONLY executable Java code.

### SPECIFICATION
\${swaggerSpec}

### OUTPUT FORMAT
Provide the complete .java file with package declarations and imports.\`;
}`,
              explanation: 'Explicit constraints and negative rules prevent the model from omitting imports or generating truncated placeholder code.',
            },
          },
          {
            id: 'prompt-best-practices-section',
            title: '4. Advanced Techniques: Few-Shot vs Chain-of-Thought',
            level: 2,
            content: [
              'Two prompting methodologies deliver transformative improvements in complex QA tasks:',
              '• <strong>Few-Shot Learning:</strong> Providing 2-3 concrete examples of input DOM and output Page Object Model classes dramatically increases alignment with your organization\'s internal framework conventions.',
              '• <strong>Chain-of-Thought (CoT):</strong> Instructing the model to "think step by step" before generating code forces it to analyze DOM hierarchy, identify stable parent containers, and evaluate aria attributes before outputting selectors.',
            ],
            comparisonTable: {
              title: 'Zero-Shot vs Few-Shot vs Chain-of-Thought for QA',
              headers: ['Technique', 'When to Use', 'Token Cost', 'Accuracy on Edge Cases'],
              rows: [
                ['Zero-Shot', 'Simple queries, explanations, and boilerplate generation', 'Lowest', '65 - 75%'],
                ['Few-Shot', 'Enforcing strict internal coding patterns or custom assertions', 'Moderate (+500-1500 tokens)', '88 - 94%'],
                ['Chain-of-Thought', 'Complex flaky test triage, multi-step debugging, root cause analysis', 'Higher (+200-800 tokens generated)', '95 - 99%'],
              ],
            },
          },
          {
            id: 'prompt-troubleshooting',
            title: '5. Troubleshooting Prompt Engineering Failures',
            level: 2,
            content: [
              'Diagnose and correct the most common prompt engineering anti-patterns:',
            ],
            troubleshooting: [
              {
                error: 'Model Returns Conversational Preamble ("Sure, here is your code...")',
                cause: 'Absence of negative constraints and structured format markers.',
                solution: 'Add: "Return ONLY executable code inside markdown fence. Do not include introductory or concluding conversational prose."',
                codeFix: `systemInstruction: "You are a code compiler. Output pure code only."`,
              },
              {
                error: 'Flaky JSON Parsing ("SyntaxError: Unexpected token in JSON")',
                cause: 'Model returns markdown code blocks (\`\`\`json ... \`\`\`) around JSON response or includes trailing commas.',
                solution: 'Use Gemini or OpenAI Structured Outputs mode with responseSchema, or strip markdown fences before JSON.parse().',
                codeFix: `const cleanJson = response.text.replace(/^\\s*\`\`\`json/i, '').replace(/\`\`\`\\s*$/i, '').trim();`,
              },
            ],
          },
        ],
      },
      {
        id: 'les-prompt-best-practices',
        slug: 'prompting-best-practices',
        title: 'Prompting Best Practices',
        moduleSlug: 'prompt-engineering',
        moduleTitle: 'Prompt Engineering',
        estimatedTime: '10 min read',
        difficulty: 'Intermediate',
        tags: ['Best Practices', 'System Prompts', 'Constraints'],
        summary: 'Explore proven enterprise best practices for engineering robust, production-grade prompts for automated testing pipelines.',
        sections: [
          {
            id: 'bp-overview',
            title: 'Core Principles of Robust Prompting',
            level: 2,
            content: [
              '1. <strong>Be Explicit About Negative Constraints:</strong> Negative constraints ("Do NOT use Thread.sleep") are just as critical as positive objectives.',
              '2. <strong>Delimit Inputs Cleanly:</strong> Always wrap variable user inputs inside XML or markdown delimiters like <html_snippet>...</html_snippet> to guard against prompt injection.',
              '3. <strong>Specify the Exact Library Versions:</strong> Models have trained on 15 years of code. If you do not specify "Selenium 4.25+" or "Playwright 1.48+", you may receive outdated Selenium 2 DesiredCapabilities code.',
            ],
          },
        ],
      },
      {
        id: 'les-adv-prompt-patterns',
        slug: 'advanced-prompt-patterns',
        title: 'Advanced Prompt Patterns',
        moduleSlug: 'prompt-engineering',
        moduleTitle: 'Prompt Engineering',
        estimatedTime: '15 min read',
        difficulty: 'Advanced',
        tags: ['Self-Consistency', 'ReAct', 'Meta-Prompting'],
        summary: 'Deep dive into advanced prompting frameworks: ReAct (Reason + Act), Reflection loops, and Self-Consistency voting for mission-critical automation.',
        sections: [
          {
            id: 'adv-patterns',
            title: 'The ReAct (Reasoning + Acting) Paradigm',
            level: 2,
            content: [
              'ReAct combines reasoning traces with execution actions in an iterative loop: Thought -> Action -> Observation -> Final Answer.',
              'This pattern is the foundational building block for autonomous QA agents that navigate websites, inspect devtools console logs, and retry failed interactions.',
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // Module 3: Context Engineering
  // =========================================================================
  {
    id: 'mod-context-eng',
    slug: 'context-engineering',
    title: 'Context Engineering',
    description: 'Techniques for managing finite model context windows, Retrieval-Augmented Generation (RAG), and vector embeddings.',
    lessons: [
      {
        id: 'les-what-is-context-eng',
        slug: 'what-is-context-engineering',
        title: 'What is Context Engineering?',
        moduleSlug: 'context-engineering',
        moduleTitle: 'Context Engineering',
        estimatedTime: '11 min read',
        difficulty: 'Intermediate',
        tags: ['Context Windows', 'RAG', 'Vector Search'],
        summary: 'Understand how context engineering enables models to accurately understand entire enterprise test repositories and Jira histories.',
        sections: [
          {
            id: 'context-definition',
            title: 'The Role of Context in Testing',
            level: 2,
            content: [
              'Context Engineering is the practice of dynamically selecting, compressing, and structuring external domain knowledge into the prompt context window at runtime.',
              'Without context engineering, an LLM only knows public open-source patterns. With context engineering, it knows your company\'s custom BaseTest utilities, authentication cookies, and proprietary CI/CD configurations.',
            ],
          },
        ],
      },
      {
        id: 'les-rag-architecture',
        slug: 'rag-architecture',
        title: 'RAG Architecture',
        moduleSlug: 'context-engineering',
        moduleTitle: 'Context Engineering',
        estimatedTime: '14 min read',
        difficulty: 'Intermediate',
        tags: ['RAG', 'Embeddings', 'Vector Databases'],
        summary: 'Learn how Retrieval-Augmented Generation indexes test suites, documentation, and defect databases using vector embeddings.',
        sections: [
          {
            id: 'rag-flow',
            title: 'How RAG Works in Quality Engineering',
            level: 2,
            content: [
              'RAG indexes internal QA documentation into a vector database. When a user asks "How do we mock the Stripe payment gateway in our checkout tests?", the system performs cosine similarity search, retrieves relevant sample tests, and includes them in the model context.',
            ],
            diagram: {
              type: 'pipeline',
              title: 'Figure 3: Retrieval-Augmented Generation (RAG) Architecture for QA',
              caption: 'Indexing internal test repositories and augmenting prompts with real-time vector search matches.',
              nodes: [
                { id: 'r1', label: 'Company Test Repo', subtitle: 'POM classes, configs, docs', badge: 'Knowledge Source' },
                { id: 'r2', label: 'Chunking & Embedding', subtitle: 'text-embedding-004 vectors', badge: 'Embeddings' },
                { id: 'r3', label: 'Vector Index', subtitle: 'Stores vectors with metadata', badge: 'Vector DB' },
                { id: 'r4', label: 'Query Similarity Search', subtitle: 'Finds top-3 matching tests', badge: 'Retrieval', highlight: true },
                { id: 'r5', label: 'Augmented Context Prompt', subtitle: 'Knowledge + User Question', badge: 'Augmented Prompt' },
                { id: 'r6', label: 'Precision Generated Answer', subtitle: 'Company-specific test code', badge: 'Accurate Output' },
              ],
            },
          },
        ],
      },
      {
        id: 'les-context-management',
        slug: 'context-management',
        title: 'Context Management',
        moduleSlug: 'context-engineering',
        moduleTitle: 'Context Engineering',
        estimatedTime: '10 min read',
        difficulty: 'Advanced',
        tags: ['Pruning', 'Summarization', 'Sliding Windows'],
        summary: 'Techniques for managing context budgets: sliding window memory, token distillation, and prompt caching.',
        sections: [
          {
            id: 'context-budgeting',
            title: 'Strategies for Context Budgeting',
            level: 2,
            content: [
              'Even with 1M+ token context windows, processing massive contexts increases latency, costs, and the "needle in a haystack" recall degradation.',
              'Effective context management applies selective DOM pruning, AST tree shaking, and sliding window summaries to maintain sub-second response times.',
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // Module 4: Model Context Protocol (MCP)
  // =========================================================================
  {
    id: 'mod-mcp',
    slug: 'model-context-protocol',
    title: 'Model Context Protocol (MCP)',
    description: 'The open standard by Anthropic for connecting AI models to local development tools, test execution environments, and databases.',
    lessons: [
      // DEMO LESSON 3: What is MCP? (Complete Rich Content)
      {
        id: 'les-what-is-mcp',
        slug: 'what-is-mcp',
        title: 'What is MCP?',
        moduleSlug: 'model-context-protocol',
        moduleTitle: 'Model Context Protocol (MCP)',
        estimatedTime: '15 min read',
        difficulty: 'Intermediate',
        tags: ['MCP', 'Model Context Protocol', 'Tool Use', 'Open Standard', 'Anthropic'],
        summary: 'An architectural deep dive into the Model Context Protocol (MCP): how it solves the N×M integration problem and transforms LLMs from passive text generators into active test automation orchestrators.',
        sections: [
          {
            id: 'mcp-overview',
            title: '1. What is the Model Context Protocol?',
            level: 2,
            content: [
              'The <strong>Model Context Protocol (MCP)</strong> is an open-source, standardized protocol initiated by Anthropic that enables AI models to securely connect to external tools, databases, and local file systems via a unified client-server architecture.',
              'Prior to MCP, every AI agent, IDE extension, and chat interface had to build bespoke, custom integrations for every tool (GitHub, PostgreSQL, Playwright, Jira, Docker). If you had N models and M tools, the industry was building N × M fragile adapters. MCP standardizes this into an N + M architecture.',
            ],
            infoCallout: {
              title: 'The USB-C of Artificial Intelligence',
              message: 'Just as USB-C created a universal physical interface for charging and peripheral connections, MCP creates a universal protocol for AI applications to discover and execute tools securely.',
            },
          },
          {
            id: 'mcp-architecture-diagram',
            title: '2. The MCP Architectural Model',
            level: 2,
            content: [
              'MCP operates as a JSON-RPC 2.0 client-server protocol over standard I/O (stdio) or Server-Sent Events (SSE). The architecture consists of three fundamental components: MCP Host, MCP Client, and MCP Servers.',
            ],
            diagram: {
              type: 'client-server',
              title: 'Figure 4: Model Context Protocol (MCP) Multi-Server Topology',
              caption: 'An MCP Host connects through MCP Clients to specialized local and remote tool servers over JSON-RPC.',
              nodes: [
                { id: 'm1', label: 'MCP Host Application', subtitle: 'e.g. Antigravity IDE, Claude Desktop', badge: 'Host Environment' },
                { id: 'm2', label: 'MCP Client Core', subtitle: 'Protocol negotiation & connection pool', badge: 'Client Protocol Layer', highlight: true },
                { id: 's1', label: 'Playwright MCP Server', subtitle: 'run_test, inspect_dom, capture_trace', badge: 'Local Server (stdio)' },
                { id: 's2', label: 'PostgreSQL MCP Server', subtitle: 'query_db, check_schema, seed_data', badge: 'Local Server (stdio)' },
                { id: 's3', label: 'Jira / GitHub MCP Server', subtitle: 'create_issue, update_test_status', badge: 'Remote Server (SSE)' },
              ],
              connections: [
                { from: 'm1', to: 'm2', label: 'User request' },
                { from: 'm2', to: 's1', label: 'JSON-RPC via stdio' },
                { from: 'm2', to: 's2', label: 'JSON-RPC via stdio' },
                { from: 'm2', to: 's3', label: 'JSON-RPC via HTTP SSE' },
              ],
            },
          },
          {
            id: 'mcp-code-example',
            title: '3. Building a Custom QA Automation MCP Server',
            level: 2,
            content: [
              'Below is a complete, executable TypeScript implementation of an MCP server providing Playwright test execution and screenshot capabilities to any MCP-compliant AI assistant:',
            ],
            codeBlock: {
              language: 'typescript',
              title: 'qa-test-mcp-server.ts',
              filename: 'src/servers/qa-playwright-mcp.ts',
              code: `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// Initialize MCP Server with capabilities
const server = new Server(
  { name: 'intelligentqa-playwright-runner', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// 1. Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'execute_playwright_test',
        description: 'Runs a specific Playwright test spec file and returns execution logs and pass/fail status.',
        inputSchema: {
          type: 'object',
          properties: {
            specFile: { type: 'string', description: 'Relative path to test spec, e.g. tests/checkout.spec.ts' },
            headed: { type: 'boolean', description: 'Run tests with visible browser window' },
          },
          required: ['specFile'],
        },
      },
    ],
  };
});

// 2. Handle tool invocation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'execute_playwright_test') {
    const { specFile, headed } = request.params.arguments as { specFile: string; headed?: boolean };
    try {
      const headedFlag = headed ? '--headed' : '';
      const { stdout, stderr } = await execAsync(\`npx playwright test \${specFile} \${headedFlag}\`);
      return {
        content: [{ type: 'text', text: \`Execution Output:\\n\${stdout}\\n\${stderr}\` }],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: 'text', text: \`Test Failed with Error:\\n\${error.stdout || error.message}\` }],
      };
    }
  }
  throw new Error(\`Unknown tool: \${request.params.name}\`);
});

// 3. Connect to Stdio Transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Playwright QA MCP Server running over Stdio');`,
              explanation: 'The MCP Server registers tools with standard JSON Schema input contracts and handles execution over standard I/O.',
            },
          },
          {
            id: 'mcp-primitives',
            title: '4. The Three Core MCP Primitives',
            level: 2,
            content: [
              'MCP defines three fundamental primitive types that an MCP server can expose to an LLM:',
            ],
            comparisonTable: {
              title: 'MCP Core Primitives Explained',
              headers: ['Primitive', 'Direction', 'Description', 'QA Automation Use Case'],
              rows: [
                ['Tools', 'Model -> Server', 'Callable functions with side effects and input validation schemas', 'Triggering a test run, restarting Docker grid container, taking screenshot'],
                ['Resources', 'Server -> Model', 'Passive contextual data (files, schemas, logs) readable like URIs', 'Reading playwright.config.ts, accessing database schemas, reading test reports'],
                ['Prompts', 'Server -> User/Model', 'Pre-parameterized prompt templates published by the server', 'Standardized "triage-flaky-test" or "generate-e2e-suite" templates'],
              ],
            },
          },
          {
            id: 'mcp-troubleshooting',
            title: '5. Troubleshooting MCP Connections',
            level: 2,
            content: [
              'Common pitfalls when developing and deploying MCP servers in automated testing environments:',
            ],
            troubleshooting: [
              {
                error: 'Server Process Exits Immediately with Code 1 on Startup',
                cause: 'Console.log() statements writing non-JSON text to stdout, corrupting the JSON-RPC stdio stream.',
                solution: 'Always direct internal debugging and startup logs to stderr using console.error(). Only the MCP SDK may write to stdout.',
                codeFix: `// BAD: console.log("Server started");\n// GOOD: console.error("Server started on stdio");`,
              },
              {
                error: 'Tool Call Timed Out (Timeout 60000ms exceeded)',
                cause: 'Long-running test suites exceeding the host default RPC timeout.',
                solution: 'Configure asynchronous job polling tools: return a jobId immediately and provide a separate check_job_status tool.',
              },
              {
                error: 'EACCES: Permission Denied executing npx playwright',
                cause: 'MCP server process running without execution privileges or missing environment variables (PATH, NODE_PATH).',
                solution: 'Pass explicit env variables in the MCP host configuration file (mcpServers.env).',
              },
            ],
          },
        ],
      },
      {
        id: 'les-mcp-arch',
        slug: 'mcp-architecture',
        title: 'MCP Architecture',
        moduleSlug: 'model-context-protocol',
        moduleTitle: 'Model Context Protocol (MCP)',
        estimatedTime: '13 min read',
        difficulty: 'Intermediate',
        tags: ['JSON-RPC', 'Transport Layer', 'Stdio', 'SSE'],
        summary: 'Explore the protocol internals: JSON-RPC 2.0 message frames, initialization handshakes, and security boundaries.',
        sections: [
          {
            id: 'mcp-internals',
            title: 'Protocol Negotiation & Handshake Flow',
            level: 2,
            content: [
              'When an MCP Client connects to an MCP Server, it conducts a version negotiation handshake (initialize -> initialized), exchanging protocol versions and capabilities before any tool calls are executed.',
            ],
          },
        ],
      },
      {
        id: 'les-create-mcp-server',
        slug: 'creating-custom-mcp-servers',
        title: 'Creating Custom MCP Servers',
        moduleSlug: 'model-context-protocol',
        moduleTitle: 'Model Context Protocol (MCP)',
        estimatedTime: '16 min read',
        difficulty: 'Advanced',
        tags: ['TypeScript SDK', 'Python SDK', 'Server Development'],
        summary: 'Step-by-step guide to building production MCP servers using the official TypeScript and Python SDKs.',
        sections: [
          {
            id: 'mcp-server-dev',
            title: 'Scaffolding an MCP Server Project',
            level: 2,
            content: [
              'Build a standalone MCP server that integrates with your internal bug tracking system and test case management software.',
            ],
          },
        ],
      },
      {
        id: 'les-connect-ext-tools',
        slug: 'connecting-external-tools',
        title: 'Connecting External Tools',
        moduleSlug: 'model-context-protocol',
        moduleTitle: 'Model Context Protocol (MCP)',
        estimatedTime: '11 min read',
        difficulty: 'Intermediate',
        tags: ['Integrations', 'Docker', 'Database Connectors'],
        summary: 'How to configure Claude Desktop, Antigravity IDE, and Cursor to connect to your custom QA MCP tools.',
        sections: [
          {
            id: 'mcp-config-guide',
            title: 'Host Configuration Schema',
            level: 2,
            content: [
              'Learn how to add MCP server configurations to client host JSON files, set environment variables, and manage authentication keys securely.',
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // Module 5: AI Agents for QA
  // =========================================================================
  {
    id: 'mod-ai-agents',
    slug: 'ai-agents-for-qa',
    title: 'AI Agents for QA',
    description: 'Autonomous multi-step agents that plan, write, execute, inspect, and self-heal test frameworks.',
    lessons: [
      {
        id: 'les-what-are-agents',
        slug: 'what-are-ai-agents',
        title: 'What are AI Agents?',
        moduleSlug: 'ai-agents-for-qa',
        moduleTitle: 'AI Agents for QA',
        estimatedTime: '12 min read',
        difficulty: 'Intermediate',
        tags: ['AI Agents', 'Autonomous Loops', 'ReAct', 'Planning'],
        summary: 'Understand the difference between linear LLM chat and autonomous agents equipped with perception, memory, tool access, and goal-directed planning.',
        sections: [
          {
            id: 'agent-definition',
            title: 'What Makes an AI Agent?',
            level: 2,
            content: [
              'An AI Agent is an autonomous system that uses an LLM as its central reasoning engine to perceive its environment through tools, plan multi-step strategies, execute actions, evaluate feedback, and iterate until a predefined goal is achieved.',
              'While a chat assistant only responds with text, a QA Agent executes code, inspects browser failures, rewrites broken locators, and commits green pull requests.',
            ],
            diagram: {
              type: 'agent-loop',
              title: 'Figure 5: Autonomous QA Agent Closed Feedback Loop',
              caption: 'The continuous perceive-plan-act-reflect cycle of an automated SDET agent.',
              nodes: [
                { id: 'a1', label: '1. Goal & Requirements', subtitle: 'e.g. "Automate Cart Checkout"', badge: 'Input Goal' },
                { id: 'a2', label: '2. Planning & Strategy', subtitle: 'Decompose into step actions', badge: 'Reasoning Engine', highlight: true },
                { id: 'a3', label: '3. Tool Execution', subtitle: 'Playwright, DOM inspect, Shell', badge: 'Action Execution' },
                { id: 'a4', label: '4. Environment Observation', subtitle: 'Test output, errors, screenshots', badge: 'Perception' },
                { id: 'a5', label: '5. Reflection & Self-Correction', subtitle: 'Fix locator, adjust wait, retry', badge: 'Self-Healing' },
              ],
              connections: [
                { from: 'a1', to: 'a2', label: 'Goal input' },
                { from: 'a2', to: 'a3', label: 'Command' },
                { from: 'a3', to: 'a4', label: 'Telemetry' },
                { from: 'a4', to: 'a5', label: 'Eval pass/fail' },
                { from: 'a5', to: 'a2', label: 'Retry loop if failure' },
              ],
            },
          },
        ],
      },
      {
        id: 'les-agentic-testing',
        slug: 'agentic-testing',
        title: 'Agentic Testing',
        moduleSlug: 'ai-agents-for-qa',
        moduleTitle: 'AI Agents for QA',
        estimatedTime: '15 min read',
        difficulty: 'Advanced',
        tags: ['Agentic Testing', 'Exploratory Automation', 'Visual QA'],
        summary: 'Explore exploratory agentic testing: unleashing autonomous agents to discover unexpected user paths, accessibility violations, and edge-case crashes.',
        sections: [
          {
            id: 'agentic-testing-overview',
            title: 'The Shift to Agentic Quality Engineering',
            level: 2,
            content: [
              'Agentic testing breaks the paradigm of static scripted test automation. Instead of scripted steps, the agent is given a mission: "Log in as a customer with an expired credit card, attempt checkout, and verify that all error messages comply with design guidelines."',
            ],
          },
        ],
      },
      {
        id: 'les-building-qa-agents',
        slug: 'building-qa-automation-agents',
        title: 'Building QA Automation Agents',
        moduleSlug: 'ai-agents-for-qa',
        moduleTitle: 'AI Agents for QA',
        estimatedTime: '18 min read',
        difficulty: 'Advanced',
        tags: ['Agent Implementation', 'LangChain', 'LlamaIndex', 'MCP'],
        summary: 'Architect and build a complete self-healing test automation agent capable of executing test runs and patching broken locators automatically.',
        sections: [
          {
            id: 'building-agent-walkthrough',
            title: 'Complete Agent Architecture Walkthrough',
            level: 2,
            content: [
              'Learn how to orchestrate memory, tool access, and dynamic code execution to build an SDET assistant that triages flaky test runs in your CI pipeline.',
            ],
          },
        ],
      },
    ],
  },
];

// Helper functions for curriculum navigation
export function getAllLessons(): AcademyLessonData[] {
  return ACADEMY_MODULES.flatMap((m) => m.lessons);
}

export function getLessonBySlug(slug: string): AcademyLessonData | undefined {
  return getAllLessons().find((l) => l.slug === slug);
}

export function getAdjacentLessons(currentSlug: string): {
  previousLesson?: { slug: string; title: string; moduleTitle: string };
  nextLesson?: { slug: string; title: string; moduleTitle: string };
} {
  const all = getAllLessons();
  const currentIndex = all.findIndex((l) => l.slug === currentSlug);

  if (currentIndex === -1) return {};

  const previousLesson =
    currentIndex > 0
      ? {
          slug: all[currentIndex - 1].slug,
          title: all[currentIndex - 1].title,
          moduleTitle: all[currentIndex - 1].moduleTitle,
        }
      : undefined;

  const nextLesson =
    currentIndex < all.length - 1
      ? {
          slug: all[currentIndex + 1].slug,
          title: all[currentIndex + 1].title,
          moduleTitle: all[currentIndex + 1].moduleTitle,
        }
      : undefined;

  return { previousLesson, nextLesson };
}
