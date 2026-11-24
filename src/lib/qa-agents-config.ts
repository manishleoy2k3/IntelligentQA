import {
  FileText,
  ListChecks,
  Code2,
  ShieldCheck,
  MessageSquare,
  Bot,
  Sparkles,
  Zap,
} from 'lucide-react';

export type AgentTab = 'requirements' | 'test_cases' | 'automation_code' | 'code_review' | 'chat' | string;

export interface AgentConfigItem {
  id: string;
  tabKey: string;
  num: string;
  tabName: string;
  title: string;
  badgeText: string;
  description: string;
  defaultPrompt: string;
  systemPrompt: string;
  color: string;
  isCustom?: boolean;
}

export const DEFAULT_AGENT_CONFIGS: AgentConfigItem[] = [
  {
    id: 'agent-1-req',
    tabKey: 'requirements',
    num: '1',
    tabName: '1. Requirement Generator',
    title: 'Requirement Generator',
    badgeText: 'Autonomous SDET Suite • Agent 1',
    description: 'Generate production-ready user stories, Gherkin acceptance criteria (Given-When-Then), and comprehensive edge-case specifications from raw concepts.',
    defaultPrompt: 'As a customer, I want to transfer money between my accounts with 2FA verification so that my funds are secure.',
    systemPrompt: 'You are a Principal QA Business Analyst & Lead SDET Architect. Deconstruct user stories against INVEST criteria, identify high-risk ambiguities, and generate structured BDD Gherkin specifications (Happy Path, Boundary Outlines, Idempotency, Timeouts) and non-functional requirements.',
    color: 'text-cyan-500',
    isCustom: false,
  },
  {
    id: 'agent-2-tc',
    tabKey: 'test_cases',
    num: '2',
    tabName: '2. Test Case Generator',
    title: 'Test Case Generator',
    badgeText: 'Autonomous SDET Suite • Agent 2',
    description: 'Transform user stories, BDD specifications, API schemas, or PRDs into structured, risk-prioritized, and executable test cases with formal RTM and automation suitability analysis.',
    defaultPrompt: 'User Account Transfer Workflow with 2FA Verification, Daily Limits ($10,000 max), and Idempotent Transaction Submissions.',
    systemPrompt: 'You are a Principal QA Architect and Senior Test Design Specialist synthesizing comprehensive, industrial-grade test plans and test case suites with 10 mandatory sections, complete RTM, and automation suitability ratings.',
    color: 'text-emerald-500',
    isCustom: false,
  },
  {
    id: 'agent-3-code',
    tabKey: 'automation_code',
    num: '3',
    tabName: '3. Automation Generator',
    title: 'Automation Code Generator',
    badgeText: 'Autonomous SDET Suite • Agent 3',
    description: 'Scaffold production-grade, maintainable Page Object Model (POM) automation code across Playwright, Selenium, REST Assured, and Appium with 10 mandatory sections and zero Thread.sleep().',
    defaultPrompt: 'Feature: Transfer Money between Savings and Checking accounts. Implement Page Object Model with web-first assertions.',
    systemPrompt: 'You are a Principal Test Automation Architect and Senior SDET generating rock-solid, production Page Object Model (POM) code with resilient locators, strict type safety, and zero thread sleeps.',
    color: 'text-indigo-500',
    isCustom: false,
  },
  {
    id: 'agent-4-review',
    tabKey: 'code_review',
    num: '4',
    tabName: '4. Code Auditor & Flakiness Review',
    title: 'Code Reviewer & Quality Auditor',
    badgeText: 'Autonomous SDET Suite • Agent 4',
    description: 'Principal SDET Code Reviewer & Architect. Audits Selenium, Playwright, REST Assured, and Appium code for defects, flakiness, security vulnerabilities, and architectural integrity in Review Only or Review & Fix mode.',
    defaultPrompt: 'test("checkout", async ({ page }) => {\n  await page.click("#checkout");\n  await page.waitForTimeout(5000);\n  await page.click("#confirm");\n});',
    systemPrompt: 'You are a Principal Software Engineer, Test Automation Architect, and Senior Code Reviewer. Conduct structured enterprise code reviews across Selenium, Playwright, REST Assured, and Appium. Classify findings (CRITICAL, HIGH, MEDIUM, LOW) across 7 dimensions (Functional, Reliability, Architecture, Quality, Performance, Security, Framework Rules) with root cause, impact, and corrected code.',
    color: 'text-amber-500',
    isCustom: false,
  },
  {
    id: 'agent-5-mentor',
    tabKey: 'chat',
    num: '5',
    tabName: '5. Senior SDET Mentor Chat',
    title: 'Senior SDET Mentor Chat',
    badgeText: 'Autonomous SDET Suite • Agent 5',
    description: 'Principal SDET & Automation Architect Mentor. Provides battle-tested engineering guidance across Playwright, Selenium, REST Assured, Appium, CI/CD, Flakiness Triage, AI/MCP, and Enterprise QA Governance.',
    defaultPrompt: 'Design a unified Playwright test automation framework for 50 squads and 20 applications.',
    systemPrompt: 'You are a Principal SDET, Test Automation Architect, and Quality Engineering Leader with 15+ years of practical enterprise mentoring experience. Provide pragmatic, battle-tested engineering guidance across testing fundamentals, automation engineering, programming, API/microservices, performance, CI/CD, AI in QA, and enterprise test governance. Adapt answers to the engineer\'s level (Junior, Mid, Senior SDET, Test Architect, QA Manager), dissect root causes, analyze architectural trade-offs, and provide production-ready solutions.',
    color: 'text-purple-500',
    isCustom: false,
  },
];

const AGENT_CONFIGS_KEY = 'intelligentqa_admin_agent_configs';

export function getStoredAgentConfigs(): AgentConfigItem[] {
  if (typeof window === 'undefined') return DEFAULT_AGENT_CONFIGS;
  try {
    const raw = localStorage.getItem(AGENT_CONFIGS_KEY);
    if (!raw) return DEFAULT_AGENT_CONFIGS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse agent configs from localStorage', e);
  }
  return DEFAULT_AGENT_CONFIGS;
}

export function saveAgentConfig(config: AgentConfigItem): AgentConfigItem[] {
  const current = getStoredAgentConfigs();
  const existingIdx = current.findIndex(a => a.id === config.id || a.tabKey === config.tabKey);
  let updated: AgentConfigItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...current[existingIdx], ...config };
  } else {
    updated = [...current, { ...config, isCustom: true }];
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(AGENT_CONFIGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('intelligentqa_agent_configs_changed', { detail: { configs: updated } }));
    } catch (e) {
      console.error('Failed to save agent config to localStorage', e);
    }
  }
  return updated;
}

export function deleteAgentConfig(id: string): AgentConfigItem[] {
  const current = getStoredAgentConfigs();
  // If it's a default agent, revert it to default; if custom, remove it
  const isDefault = DEFAULT_AGENT_CONFIGS.some(d => d.id === id);
  let updated: AgentConfigItem[];
  if (isDefault) {
    const defaultItem = DEFAULT_AGENT_CONFIGS.find(d => d.id === id);
    updated = current.map(item => (item.id === id && defaultItem ? { ...defaultItem } : item));
  } else {
    updated = current.filter(a => a.id !== id);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(AGENT_CONFIGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('intelligentqa_agent_configs_changed', { detail: { configs: updated } }));
    } catch (e) {
      console.error('Failed to delete agent config from localStorage', e);
    }
  }
  return updated;
}

export function resetAgentConfigs(): AgentConfigItem[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(AGENT_CONFIGS_KEY, JSON.stringify(DEFAULT_AGENT_CONFIGS));
      window.dispatchEvent(new CustomEvent('intelligentqa_agent_configs_changed', { detail: { configs: DEFAULT_AGENT_CONFIGS } }));
    } catch (e) {
      console.error('Failed to reset agent configs', e);
    }
  }
  return DEFAULT_AGENT_CONFIGS;
}
