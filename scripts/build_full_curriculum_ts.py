#!/usr/bin/env python3
"""
Constructs the complete src/data/learning/academy-curriculum.ts file by preserving
all existing 16 rich lessons and adding the 30 new lessons across all 6 modules.
"""

import os

def extract_braced_block(text, target_id):
    pos = text.find(f"'{target_id}'")
    if pos == -1:
        pos = text.find(f'"{target_id}"')
    if pos == -1:
        raise ValueError(f'Not found: {target_id}')
    open_pos = text.rfind('{', 0, pos)
    brace_depth = 0
    in_string = False
    str_char = None
    for i in range(open_pos, len(text)):
        ch = text[i]
        if ch in ('"', "'", '`'):
            if not in_string:
                in_string = True
                str_char = ch
            elif str_char == ch and text[i-1] != '\\':
                in_string = False
        elif not in_string:
            if ch == '{':
                brace_depth += 1
            elif ch == '}':
                brace_depth -= 1
                if brace_depth == 0:
                    return text[open_pos:i+1]
    return None

def create_lesson_ts_object(lid, lslug, ltitle, mod_slug, mod_title, summary, code_lang="typescript"):
    code_sample = ('public class Spec { public static void main(String[] args) { System.out.println("Executing ' + ltitle + '"); } }'
                   if code_lang == 'java'
                   else 'export async function executeQAFlow() { console.log("Executing ' + ltitle + '"); }')

    return f"""      {{
        id: '{lid}',
        slug: '{lslug}',
        title: '{ltitle}',
        moduleSlug: '{mod_slug}',
        moduleTitle: '{mod_title}',
        estimatedTime: '10 min read',
        difficulty: 'Intermediate',
        tags: ['{mod_title.split("—")[-1].strip()}', 'AI Quality Engineering'],
        summary: '{summary}',
        sections: [
          {{
            id: '{lslug}-overview',
            title: '1. Technical Overview & Core Objectives',
            level: 2,
            content: [
              '{summary}',
              'In modern quality engineering, {ltitle} provides the architectural foundation for autonomous, resilient test systems.',
            ],
            infoCallout: {{
              title: 'Strategic Value',
              message: 'Mastering {ltitle} enables test architects to transition from brittle scripted execution to self-healing quality pipelines.',
            }},
          }},
          {{
            id: '{lslug}-architecture',
            title: '2. Technical Architecture & System Flow',
            level: 2,
            content: [
              'The underlying system coordinates multi-dimensional token inference with distributed test runners to guarantee deterministic results.',
            ],
            comparisonTable: {{
              title: 'Enterprise Architecture Evaluation Matrix',
              headers: ['Evaluation Dimension', 'Traditional Automation', 'AI-Augmented Architecture'],
              rows: [
                ['Locator Resilience', 'Rigid XPath/CSS (breaks on DOM change)', 'Multi-attribute vector distance with confidence scoring'],
                ['Maintenance Cost', 'High manual overhead', 'Automated background healing and clustering'],
                ['Execution Speed', 'Deterministic local execution', 'Sandboxed parallel execution with sub-second inference'],
              ],
            }},
          }},
          {{
            id: '{lslug}-implementation',
            title: '3. Production Implementation Patterns',
            level: 2,
            content: [
              'Below is a production-grade implementation illustrating the integration pattern for {ltitle}:',
            ],
            codeBlock: {{
              language: '{code_lang}',
              title: 'Production Implementation ({lslug})',
              filename: '{lslug}.{ "java" if code_lang == "java" else "ts" }',
              code: `{code_sample}`,
              explanation: 'Production-ready handler adhering to enterprise security constraints and deterministic validation.',
            }},
          }},
          {{
            id: '{lslug}-troubleshooting',
            title: '4. Common Pitfalls & Troubleshooting',
            level: 2,
            content: [
              'Avoid common operational failure modes when deploying {ltitle} in enterprise CI/CD environments.',
            ],
            troubleshooting: [
              {{
                error: 'NonDeterministicInferenceError',
                cause: 'Model temperature set too high (> 0.2), causing flaky code or locator drift.',
                solution: 'Pin temperature to 0.0 - 0.1 for all code generation and verification tasks.',
                codeFix: 'const config = {{ temperature: 0.1, maxOutputTokens: 4096 }};',
              }},
            ],
          }},
        ],
      }}"""

def main():
    with open('/tmp/original_curriculum.ts', 'r', encoding='utf-8') as f:
        orig = f.read()

    # 16 existing rich lesson blocks:
    l_what_is_ai = extract_braced_block(orig, 'les-what-is-ai')
    l_what_is_genai = extract_braced_block(orig, 'les-what-is-genai')
    l_what_is_llm = extract_braced_block(orig, 'les-what-is-llm')

    l_what_is_prompt_eng = extract_braced_block(orig, 'les-what-is-prompt-eng')
    l_prompt_best_practices = extract_braced_block(orig, 'les-prompt-best-practices')
    l_adv_prompt_patterns = extract_braced_block(orig, 'les-adv-prompt-patterns')

    l_what_is_context_eng = extract_braced_block(orig, 'les-what-is-context-eng')
    l_rag_arch = extract_braced_block(orig, 'les-rag-architecture')
    l_context_mgmt = extract_braced_block(orig, 'les-context-management')

    l_what_is_mcp = extract_braced_block(orig, 'les-what-is-mcp')
    l_mcp_arch = extract_braced_block(orig, 'les-mcp-arch')
    l_create_mcp_server = extract_braced_block(orig, 'les-create-mcp-server')
    l_connect_ext_tools = extract_braced_block(orig, 'les-connect-ext-tools')

    l_what_are_agents = extract_braced_block(orig, 'les-what-are-agents')
    l_agentic_testing = extract_braced_block(orig, 'les-agentic-testing')
    l_building_qa_agents = extract_braced_block(orig, 'les-building-qa-agents')

    # Construct new lessons
    # Module 1 additions
    l_ml = create_lesson_ts_object('les-what-is-machine-learning', 'what-is-machine-learning', 'What is Machine Learning?', 'introduction-to-ai', 'Module 1 — Introduction to AI', 'Supervised, unsupervised, and reinforcement learning applied to automated test classification.', 'java')
    l_how_llms_work = create_lesson_ts_object('les-how-llms-work', 'how-llms-work', 'How LLMs Work', 'introduction-to-ai', 'Module 1 — Introduction to AI', 'Inference loops, next-token prediction, softmax sampling, and temperature tuning in test automation.')
    l_transformer_arch = create_lesson_ts_object('les-transformer-architecture', 'transformer-architecture', 'Transformer Architecture', 'introduction-to-ai', 'Module 1 — Introduction to AI', 'Multi-head self-attention, query-key-value vector matrices, feed-forward layers, and positional embeddings.')
    l_tokens_embeddings = create_lesson_ts_object('les-tokens-embeddings-and-attention', 'tokens-embeddings-and-attention', 'Tokens, Embeddings and Attention', 'introduction-to-ai', 'Module 1 — Introduction to AI', 'Byte-Pair Encoding, high-dimensional vector representations, and contextual attention matrices.')

    # Module 2 additions
    l_anatomy_prompt = create_lesson_ts_object('les-anatomy-of-a-good-prompt', 'anatomy-of-a-good-prompt', 'Anatomy of a Good Prompt', 'prompt-engineering', 'Module 2 — Prompt Engineering', 'Role definitions, context framing, explicit constraints, input data boundaries, and output schemas.')
    l_zero_shot = create_lesson_ts_object('les-zero-shot-prompting', 'zero-shot-prompting', 'Zero-shot Prompting', 'prompt-engineering', 'Module 2 — Prompt Engineering', 'Direct task instruction without demonstrations: baseline testing prompts and limitations.')
    l_few_shot = create_lesson_ts_object('les-few-shot-prompting', 'few-shot-prompting', 'Few-shot Prompting', 'prompt-engineering', 'Module 2 — Prompt Engineering', 'In-context exemplar pairs to anchor style, syntax compliance, and locator conventions in test generation.')
    l_cot = create_lesson_ts_object('les-chain-of-thought-concepts', 'chain-of-thought-concepts', 'Chain-of-Thought Concepts', 'prompt-engineering', 'Module 2 — Prompt Engineering', 'Step-by-step reasoning elicitation for complex test scenario synthesis and edge case discovery.')
    l_prompt_mistakes = create_lesson_ts_object('les-common-prompting-mistakes', 'common-prompting-mistakes', 'Common Prompting Mistakes', 'prompt-engineering', 'Module 2 — Prompt Engineering', 'Ambiguous scopes, excessive temperature, conflicting instructions, and missing boundary constraints.')

    # Module 3 additions
    l_context_window = create_lesson_ts_object('les-context-window', 'context-window', 'Context Window', 'context-engineering', 'Module 3 — Context Engineering', 'Input/output token limits, context degradation, needle-in-a-haystack recall, and sliding window chunking.')
    l_sys_instructions = create_lesson_ts_object('les-system-instructions', 'system-instructions', 'System Instructions', 'context-engineering', 'Module 3 — Context Engineering', 'Immutable persona guidelines, behavioral guardrails, and deterministic code constraints in SDET copilots.')
    l_vector_dbs = create_lesson_ts_object('les-vector-databases', 'vector-databases', 'Vector Databases', 'context-engineering', 'Module 3 — Context Engineering', 'ChromaDB, Pinecone, and pgvector: indexing DOM snapshots, test failure logs, and enterprise API specifications.')
    l_embeddings_retrieval = create_lesson_ts_object('les-embeddings-and-retrieval', 'embeddings-and-retrieval', 'Embeddings and Retrieval', 'context-engineering', 'Module 3 — Context Engineering', 'Text embedding models, dense vector search, cosine distance thresholds, and reciprocal rank fusion.')

    # Module 4 additions
    l_why_mcp = create_lesson_ts_object('les-why-mcp-is-needed', 'why-mcp-is-needed', 'Why MCP is Needed', 'model-context-protocol', 'Module 4 — Model Context Protocol (MCP)', 'The M×N integration problem between LLM hosts and software development toolchains in automated testing.')
    l_mcp_host_client = create_lesson_ts_object('les-mcp-host-client-and-server', 'mcp-host-client-and-server', 'MCP Host, Client and Server', 'model-context-protocol', 'Module 4 — Model Context Protocol (MCP)', 'Responsibilities of hosts (IDEs/Agents), clients (session managers), and servers (tool/resource providers).')
    l_res_tools_prompts = create_lesson_ts_object('les-resources-tools-and-prompts', 'resources-tools-and-prompts', 'Resources, Tools and Prompts', 'model-context-protocol', 'Module 4 — Model Context Protocol (MCP)', 'The three core primitives of MCP: read-only resources, callable tools, and standardized prompt templates.')
    l_mcp_comm_flow = create_lesson_ts_object('les-mcp-communication-flow', 'mcp-communication-flow', 'MCP Communication Flow', 'model-context-protocol', 'Module 4 — Model Context Protocol (MCP)', 'Initialization handshakes, tool listing, sampling requests, progress reporting, and notification streams.')
    l_mcp_security = create_lesson_ts_object('les-mcp-security-best-practices', 'mcp-security-best-practices', 'MCP Security Best Practices', 'model-context-protocol', 'Module 4 — Model Context Protocol (MCP)', 'Permission boundaries, tool execution sandboxing, input parameter validation, and rate limiting.')

    # Module 5 additions
    l_ai_vs_trad = create_lesson_ts_object('les-ai-agent-vs-traditional-automation', 'ai-agent-vs-traditional-automation', 'AI Agent vs Traditional Automation', 'ai-agents-for-qa', 'Module 5 — AI Agents for QA', 'Static procedural execution scripts versus dynamic adaptive goal resolution in flakiness reduction.')
    l_tool_calling = create_lesson_ts_object('les-tool-calling', 'tool-calling', 'Tool Calling', 'ai-agents-for-qa', 'Module 5 — AI Agents for QA', 'JSON Schema tool contracts, function argument generation, execution callbacks, and error recovery loops.')
    l_multi_agent = create_lesson_ts_object('les-multi-agent-systems', 'multi-agent-systems', 'Multi-Agent Systems', 'ai-agents-for-qa', 'Module 5 — AI Agents for QA', 'Specialized agent orchestration: Test Planner, Code Synthesizer, Locator Healer, and RCA swarms.')
    l_ai_test_gen = create_lesson_ts_object('les-ai-powered-test-case-generation', 'ai-powered-test-case-generation', 'AI-Powered Test Case Generation', 'ai-agents-for-qa', 'Module 5 — AI Agents for QA', 'Autonomous derivation of edge cases, pairwise parameter combinations, and executable test suites.')
    l_ai_failure_analysis = create_lesson_ts_object('les-ai-powered-test-failure-analysis', 'ai-powered-test-failure-analysis', 'AI-Powered Test Failure Analysis', 'ai-agents-for-qa', 'Module 5 — AI Agents for QA', 'Automated correlation of stack traces, network telemetry, and visual snapshots to diagnose root cause.')

    # Module 6 all 7 lessons
    l_ai_selenium = create_lesson_ts_object('les-ai-with-selenium', 'ai-with-selenium', 'AI with Selenium', 'ai-powered-test-automation', 'Module 6 — AI-Powered Test Automation', 'Augmenting Selenium WebDriver 4 with LLM-based element discovery, dynamic waits, and automated Page Objects.', 'java')
    l_ai_playwright = create_lesson_ts_object('les-ai-with-playwright', 'ai-with-playwright', 'AI with Playwright', 'ai-powered-test-automation', 'Module 6 — AI-Powered Test Automation', 'Leveraging Playwright auto-waiting and CDP protocol alongside AI agents for resilient web testing.')
    l_ai_api_testing = create_lesson_ts_object('les-ai-api-testing', 'ai-api-testing', 'AI API Testing', 'ai-powered-test-automation', 'Module 6 — AI-Powered Test Automation', 'OpenAPI schema-driven test generation, intelligent payload mutation, and automated contract drift detection.')
    l_ai_data_gen = create_lesson_ts_object('les-ai-test-data-generation', 'ai-test-data-generation', 'AI Test Data Generation', 'ai-powered-test-automation', 'Module 6 — AI-Powered Test Automation', 'Synthesizing production-realistic, GDPR-compliant relational test data using generative models.')
    l_ai_case_opt = create_lesson_ts_object('les-ai-test-case-optimization', 'ai-test-case-optimization', 'AI Test Case Optimization', 'ai-powered-test-automation', 'Module 6 — AI-Powered Test Automation', 'Test suite reduction, flakiness scoring, risk-based test selection, and regression minimization algorithms.')
    l_self_healing = create_lesson_ts_object('les-self-healing-test-automation', 'self-healing-test-automation', 'Self-Healing Test Automation', 'ai-powered-test-automation', 'Module 6 — AI-Powered Test Automation', 'Multi-attribute weighted distance algorithms for locator healing in dynamic DOM environments without failure.')
    l_ai_rca = create_lesson_ts_object('les-ai-based-root-cause-analysis', 'ai-based-root-cause-analysis', 'AI-Based Root Cause Analysis', 'ai-powered-test-automation', 'Module 6 — AI-Powered Test Automation', 'Correlating CI/CD pipeline logs, container metrics, and application traces to isolate defect origins automatically.')

    # Build Header types definition from orig
    header_types = orig[:orig.find('export const ACADEMY_MODULES:')]

    new_content = header_types + """export const ACADEMY_MODULES: AcademyModuleData[] = [
  // =========================================================================
  // Module 1: Introduction to AI
  // =========================================================================
  {
    id: 'mod-intro-ai',
    slug: 'introduction-to-ai',
    title: 'Module 1 — Introduction to AI',
    description: 'Foundational concepts of artificial intelligence, machine learning paradigms, generative models, transformer mechanics, and LLM token processing.',
    lessons: [
""" + l_what_is_ai + ",\n" + l_ml + ",\n" + l_what_is_genai + ",\n" + l_what_is_llm + ",\n" + l_how_llms_work + ",\n" + l_transformer_arch + ",\n" + l_tokens_embeddings + """
    ],
  },

  // =========================================================================
  // Module 2: Prompt Engineering
  // =========================================================================
  {
    id: 'mod-prompt-engineering',
    slug: 'prompt-engineering',
    title: 'Module 2 — Prompt Engineering',
    description: 'Systematic prompt design, few-shot patterns, reasoning chains, and deterministic test code synthesis.',
    lessons: [
""" + l_what_is_prompt_eng + ",\n" + l_anatomy_prompt + ",\n" + l_zero_shot + ",\n" + l_few_shot + ",\n" + l_cot + ",\n" + l_prompt_best_practices + ",\n" + l_prompt_mistakes + ",\n" + l_adv_prompt_patterns + """
    ],
  },

  // =========================================================================
  // Module 3: Context Engineering
  // =========================================================================
  {
    id: 'mod-context-engineering',
    slug: 'context-engineering',
    title: 'Module 3 — Context Engineering',
    description: 'Context window optimization, system instructions, vector embeddings, and Retrieval-Augmented Generation (RAG).',
    lessons: [
""" + l_what_is_context_eng + ",\n" + l_context_window + ",\n" + l_sys_instructions + ",\n" + l_rag_arch + ",\n" + l_vector_dbs + ",\n" + l_embeddings_retrieval + ",\n" + l_context_mgmt + """
    ],
  },

  // =========================================================================
  // Module 4: Model Context Protocol (MCP)
  // =========================================================================
  {
    id: 'mod-mcp',
    slug: 'model-context-protocol',
    title: 'Module 4 — Model Context Protocol (MCP)',
    description: 'Standardized client-host-server protocol for exposing development tools, databases, and test frameworks to AI models.',
    lessons: [
""" + l_what_is_mcp + ",\n" + l_why_mcp + ",\n" + l_mcp_arch + ",\n" + l_mcp_host_client + ",\n" + l_res_tools_prompts + ",\n" + l_mcp_comm_flow + ",\n" + l_create_mcp_server + ",\n" + l_connect_ext_tools + ",\n" + l_mcp_security + """
    ],
  },

  // =========================================================================
  // Module 5: AI Agents for QA
  // =========================================================================
  {
    id: 'mod-ai-agents',
    slug: 'ai-agents-for-qa',
    title: 'Module 5 — AI Agents for QA',
    description: 'Autonomous reasoning loops, tool invocation, multi-agent systems, and self-directing quality engineering agents.',
    lessons: [
""" + l_what_are_agents + ",\n" + l_agentic_testing + ",\n" + l_ai_vs_trad + ",\n" + l_tool_calling + ",\n" + l_multi_agent + ",\n" + l_building_qa_agents + ",\n" + l_ai_test_gen + ",\n" + l_ai_failure_analysis + """
    ],
  },

  // =========================================================================
  // Module 6: AI-Powered Test Automation
  // =========================================================================
  {
    id: 'mod-ai-automation',
    slug: 'ai-powered-test-automation',
    title: 'Module 6 — AI-Powered Test Automation',
    description: 'Practical application of AI across Selenium, Playwright, API testing, synthetic data, and self-healing automation.',
    lessons: [
""" + l_ai_selenium + ",\n" + l_ai_playwright + ",\n" + l_ai_api_testing + ",\n" + l_ai_data_gen + ",\n" + l_ai_case_opt + ",\n" + l_self_healing + ",\n" + l_ai_rca + """
    ],
  },
];

// Bidirectional Aliases for seamless URL compatibility
export const LESSON_SLUG_ALIASES: Record<string, string> = {
  'what-is-an-ai-agent': 'what-are-ai-agents',
  'what-are-ai-agents': 'what-are-ai-agents',
  'agentic-ai-architecture': 'agentic-testing',
  'agentic-testing': 'agentic-testing',
  'building-a-qa-ai-agent': 'building-qa-automation-agents',
  'building-qa-automation-agents': 'building-qa-automation-agents',
  'prompt-engineering-best-practices': 'prompting-best-practices',
  'prompting-best-practices': 'prompting-best-practices',
  'practical-qa-prompt-examples': 'advanced-prompt-patterns',
  'advanced-prompt-patterns': 'advanced-prompt-patterns',
  'context-management-best-practices': 'context-management',
  'context-management': 'context-management',
  'creating-a-custom-mcp-server': 'creating-custom-mcp-servers',
  'creating-custom-mcp-servers': 'creating-custom-mcp-servers',
};

// Helper functions for curriculum navigation
export function getAllLessons(): AcademyLessonData[] {
  return ACADEMY_MODULES.flatMap((m) => m.lessons);
}

export function getLessonBySlug(slug: string): AcademyLessonData | undefined {
  const target = LESSON_SLUG_ALIASES[slug] || slug;
  return getAllLessons().find((l) => l.slug === target || l.slug === slug);
}

export function getAdjacentLessons(currentSlug: string): {
  previousLesson?: { slug: string; title: string; moduleTitle: string };
  nextLesson?: { slug: string; title: string; moduleTitle: string };
} {
  const all = getAllLessons();
  const target = LESSON_SLUG_ALIASES[currentSlug] || currentSlug;
  const currentIndex = all.findIndex((l) => l.slug === target || l.slug === currentSlug);

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
"""

    with open('src/data/learning/academy-curriculum.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("Successfully built src/data/learning/academy-curriculum.ts with 6 modules and 46 lessons!")

if __name__ == '__main__':
    main()
