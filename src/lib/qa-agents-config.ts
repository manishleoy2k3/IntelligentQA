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
    systemPrompt: 'You are an elite QA Product Analyst and SDET specialized in BDD Given-When-Then and edge case generation.',
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
    description: 'Synthesize positive, negative, security, and edge-case test matrices with priority and preconditions from requirements or imported Word, Excel, and PDF documents.',
    defaultPrompt: 'User Account Transfer Workflow with 2FA Verification, Daily Limits ($10,000 max), and Idempotent Transaction Submissions.',
    systemPrompt: 'You are a Senior QA Test Architect synthesizing comprehensive, industrial-grade test matrices with preconditions, test steps, expected results, and risk ratings.',
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
    description: 'Scaffold modular, production-ready Page Object Model code with resilient locators, assertions, and test scripts in Playwright, Selenium Java, or REST Assured.',
    defaultPrompt: 'Feature: Transfer Money between Savings and Checking accounts. Implement Page Object Model with web-first assertions.',
    systemPrompt: 'You are a Principal Automation Architect generating rock-solid, production Page Object Model (POM) code with resilient locators and zero thread sleeps.',
    color: 'text-indigo-500',
    isCustom: false,
  },
  {
    id: 'agent-4-review',
    tabKey: 'code_review',
    num: '4',
    tabName: '4. Code Auditor & Flakiness Review',
    title: 'Code Auditor & Flakiness Review',
    badgeText: 'Autonomous SDET Suite • Agent 4',
    description: 'Deeply analyze test automation code, detect brittle XPath locators, identify hardcoded waits and race conditions, and recommend SDET optimizations.',
    defaultPrompt: 'test("checkout", async ({ page }) => {\\n  await page.click("#checkout");\\n  await page.waitForTimeout(5000);\\n  await page.click("#confirm");\\n});',
    systemPrompt: 'You are a Principal Test Automation Auditor diagnosing test flakiness, race conditions, brittle selectors, and performance bottlenecks.',
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
    description: 'Interactive technical coaching with an expert SDET mentor on framework architecture, CI/CD pipelines, flakiness triage, and interview mastery.',
    defaultPrompt: 'How do you design an enterprise Playwright automation framework with parallel execution and storageState auth sharing?',
    systemPrompt: 'You are a Senior SDET Mentor and Staff QA Engineer guiding automated testing best practices, distributed execution, and career advancement.',
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
