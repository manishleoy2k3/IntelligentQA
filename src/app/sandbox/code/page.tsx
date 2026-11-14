'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCode,
  BookOpen,
  Code2,
  Laptop,
} from 'lucide-react';

type LangType = 'java' | 'python' | 'typescript';

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  code: string;
}

const STARTER_TEMPLATES: Record<LangType, TemplateOption[]> = {
  java: [
    {
      id: 'threadlocal-basetest',
      name: 'ThreadLocal BaseTest (TestNG)',
      description: 'Thread-safe parallel WebDriver setup with TestNG annotations and clean teardown.',
      code: `package com.intelligentqa.base;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.Test;

public class BaseTest {
    // ThreadLocal ensures isolated WebDriver instances per parallel thread
    private static final ThreadLocal<WebDriver> driverThread = new ThreadLocal<>();

    public static WebDriver getDriver() {
        return driverThread.get();
    }

    @BeforeMethod
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--disable-gpu", "--no-sandbox");
        WebDriver driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        driverThread.set(driver);
        System.out.println("WebDriver initialized on thread: " + Thread.currentThread().getName());
    }

    @Test
    public void verifyUserDashboardAccess() {
        System.out.println("Navigating to https://intelligentqa.dev/sandbox/web");
        System.out.println("Validating user login banner and authentication token.");
    }

    @AfterMethod
    public void tearDown() {
        if (getDriver() != null) {
            getDriver().quit();
            driverThread.remove(); // Prevent memory leaks across thread pools
            System.out.println("ThreadLocal WebDriver terminated safely.");
        }
    }
}`,
    },
    {
      id: 'pom-login',
      name: 'Page Object Model (POM)',
      description: 'Clean encapsulation of UI locators and user action methods.',
      code: `package com.intelligentqa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage {
    private final WebDriver driver;

    // Resilient By Locators
    private final By usernameField = By.id("username");
    private final By passwordField = By.id("password");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By alertBanner = By.cssSelector("[role='alert'], .toast");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }

    public void login(String username, String password) {
        driver.findElement(usernameField).sendKeys(username);
        driver.findElement(passwordField).sendKeys(password);
        driver.findElement(submitButton).click();
    }

    public boolean isAlertVisible() {
        return driver.findElement(alertBanner).isDisplayed();
    }
}`,
    },
    {
      id: 'dsa-algorithm',
      name: 'SDET Coding Challenge (Two Sum)',
      description: 'Classic SDET technical interview algorithm with standard main execution.',
      code: `package com.intelligentqa.algorithms;

import java.util.HashMap;
import java.util.Map;

public class TwoSumSDET {
    public static int[] findIndices(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[] testCases = { 2, 7, 11, 15 };
        int target = 9;
        int[] result = findIndices(testCases, target);
        System.out.println("Target: " + target);
        System.out.println("Indices found: [" + result[0] + ", " + result[1] + "]");
        System.out.println("Values: " + testCases[result[0]] + " + " + testCases[result[1]] + " = " + target);
        System.out.println("✔ SDET Algorithm Verification Passed!");
    }
}`,
    },
  ],
  python: [
    {
      id: 'pytest-parallel-fixture',
      name: 'Thread-Safe Pytest Fixture (xdist)',
      description: 'Isolated function-scoped WebDriver fixture ready for concurrent test runs.',
      code: `# Python Selenium Thread-Safe Fixture
import pytest
import time

class TestAuthentication:
    def test_login_success(self):
        print("Starting isolated test worker on active thread...")
        user_payload = {"user": "qa_engineer", "role": "SDET"}
        print(f"Loaded credentials for: {user_payload['user']}")
        time.sleep(0.05)
        assert user_payload["role"] == "SDET", "User role must match SDET"
        print("✔ Assertion verified: User authenticated with correct privileges.")

if __name__ == "__main__":
    t = TestAuthentication()
    t.test_login_success()
`,
    },
    {
      id: 'api-validator',
      name: 'API Contract & Schema Validator',
      description: 'Python verification of JSON contracts, headers, and status codes.',
      code: `# Python API Schema & Status Verification
import json

def validate_user_contract():
    mock_response = {
        "status": 200,
        "body": {
            "users": [
                {"id": 101, "name": "Jane Doe", "role": "Senior SDET"},
                {"id": 102, "name": "John Smith", "role": "QA Architect"}
            ],
            "total": 2
        }
    }

    print(f"HTTP Status: {mock_response['status']}")
    assert mock_response['status'] == 200, "Expected HTTP 200"

    data = mock_response["body"]
    assert "users" in data, "Missing 'users' key in contract payload"
    assert len(data["users"]) == 2, "Expected 2 user records"

    for user in data["users"]:
        print(f"  - Verified User #{user['id']}: {user['name']} ({user['role']})")

    print("✔ API Contract & Data Schema Validated Successfully!")

if __name__ == "__main__":
    validate_user_contract()
`,
    },
    {
      id: 'dsa-strings',
      name: 'SDET Coding Challenge (Anagram Check)',
      description: 'String frequency verification commonly asked in SDET technical interviews.',
      code: `# SDET Coding Challenge: Valid Anagram Check
from collections import Counter

def is_valid_anagram(s1: str, s2: str) -> bool:
    s1_clean = s1.replace(" ", "").lower()
    s2_clean = s2.replace(" ", "").lower()
    return Counter(s1_clean) == Counter(s2_clean)

pairs = [
    ("listen", "silent"),
    ("Intelligent QA", "A Intelligent Q"),
    ("selenium", "playwright")
]

for w1, w2 in pairs:
    result = is_valid_anagram(w1, w2)
    status = "✔ MATCH" if result else "✖ MISMATCH"
    print(f"{status}: '{w1}' <--> '{w2}' (Anagram: {result})")
`,
    },
  ],
  typescript: [
    {
      id: 'ts-playwright-fixture',
      name: 'Playwright Page Fixture & Assertions',
      description: 'Modern async/await TypeScript locator chains and web-first assertions.',
      code: `// TypeScript Playwright Test Automation
interface TestConfig {
  baseUrl: string;
  timeoutMs: number;
  headless: boolean;
}

const config: TestConfig = {
  baseUrl: 'https://intelligentqa.dev/sandbox/web',
  timeoutMs: 5000,
  headless: true
};

async function executeUiWorkflow() {
  console.log(\`Initializing Playwright Test with Base URL: \${config.baseUrl}\`);
  console.log('Action: page.goto("/dashboard")');
  console.log('Action: page.getByRole("button", { name: "Run Tests" }).click()');
  
  // Simulated Web-First Auto-Retrying Assertion
  const isLoaded = true;
  if (isLoaded) {
    console.log('✔ expect(page.getByRole("alert")).toBeVisible() passed [142ms]');
    console.log('✔ expect(page).toHaveTitle(/IntelligentQA/) passed [18ms]');
  }
}

executeUiWorkflow();
`,
    },
    {
      id: 'ts-data-structures',
      name: 'SDET Challenge: Duplicate Locator Finder',
      description: 'Data structure logic to detect duplicate elements and compute frequency.',
      code: `// SDET Coding Challenge: Find Duplicate DOM Selectors
function findDuplicateSelectors(selectors: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of selectors) {
    counts[s] = (counts[s] || 0) + 1;
  }
  return counts;
}

const pageLocators = [
  'button#submit',
  'input#username',
  'button#submit',
  '.nav-link',
  'input#password',
  '.nav-link',
  'button#submit'
];

console.log('Analyzing DOM selector collection...');
const report = findDuplicateSelectors(pageLocators);

for (const [selector, count] of Object.entries(report)) {
  const warning = count > 1 ? \`⚠ Duplicate (\${count}x)\` : '✔ Unique';
  console.log(\`  \${warning}: \${selector}\`);
}
`,
    },
  ],
};

export default function HandsOnCodingLabPage() {
  const [language, setLanguage] = useState<LangType>('java');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    STARTER_TEMPLATES.java[0].id
  );
  const [code, setCode] = useState<string>(STARTER_TEMPLATES.java[0].code);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [terminalError, setTerminalError] = useState<string>('');
  const [executionStats, setExecutionStats] = useState<{
    durationMs?: number;
    status?: string;
    exitCode?: number;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'console' | 'stats'>('console');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Switch language handler
  const handleLanguageChange = (newLang: LangType) => {
    setLanguage(newLang);
    const defaultTemplate = STARTER_TEMPLATES[newLang][0];
    setSelectedTemplateId(defaultTemplate.id);
    setCode(defaultTemplate.code);
    setTerminalOutput('');
    setTerminalError('');
    setExecutionStats(null);
  };

  // Switch template handler
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = STARTER_TEMPLATES[language].find((t) => t.id === templateId);
    if (tmpl) {
      setCode(tmpl.code);
    }
  };

  // Handle Tab key in editor to indent with 4 spaces
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    ';

      setCode(code.substring(0, start) + spaces + code.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }

    // Ctrl+Enter or Cmd+Enter to Run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    }
  };

  // Run Code API Invocation
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalOutput('Compiling and executing...');
    setTerminalError('');

    try {
      const res = await fetch('/api/sandbox/compiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setTerminalOutput(data.stdout || (data.success ? 'Program executed successfully with no output.' : ''));
        setTerminalError(data.stderr || '');
        setExecutionStats({
          durationMs: data.executionTimeMs,
          status: data.status,
          exitCode: data.exitCode,
        });
      } else {
        setTerminalOutput('');
        setTerminalError(data.error || 'Failed to compile and execute code.');
        setExecutionStats({
          status: 'error',
          exitCode: 1,
        });
      }
    } catch (err: any) {
      setTerminalOutput('');
      setTerminalError(err.message || 'Execution failed. Please check network connection.');
      setExecutionStats({
        status: 'network_error',
        exitCode: 1,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    const tmpl = STARTER_TEMPLATES[language].find((t) => t.id === selectedTemplateId);
    if (tmpl) {
      setCode(tmpl.code);
    }
    setTerminalOutput('');
    setTerminalError('');
    setExecutionStats(null);
  };

  // Line numbers calculation
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-60px)] bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Laptop className="w-5 h-5" />
              </div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Hands-On SDET Coding Lab
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Live Compiler &amp; Runner
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Practice test automation, Page Objects, ThreadLocal concurrency, and SDET coding interview problems with real-time compilation.
            </p>
          </div>

          {/* Quick Breadcrumbs / Lab Navigation */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/sandbox/web"
              className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
            >
              1. Selenium Lab
            </Link>
            <Link
              href="/sandbox/web?mode=playwright"
              className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
            >
              2. Playwright Lab
            </Link>
            <Link
              href="/sandbox/api"
              className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
            >
              3. API Lab
            </Link>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl w-full mx-auto p-3 md:p-4 gap-4">
        {/* Left Side: Controls & Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Language Selector & Toolbar Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {/* Language Switcher Pills */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleLanguageChange('java')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'java'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Java
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('python')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'python'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Python
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('typescript')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'typescript'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TypeScript
              </button>
            </div>

            {/* Template Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Template:</span>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {STARTER_TEMPLATES[language].map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Editor Action Buttons */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition"
                title="Copy code to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition"
                title="Reset code to original template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              <button
                type="button"
                onClick={handleRunCode}
                disabled={isRunning}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition cursor-pointer ${
                  isRunning
                    ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25'
                }`}
                title="Run / Compile Code (Ctrl + Enter)"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Code Editor with Line Numbers */}
          <div className="flex-1 flex overflow-hidden bg-slate-950 font-mono text-xs relative min-h-[350px]">
            {/* Line Numbers Column */}
            <div className="py-4 px-3 bg-slate-900/50 text-slate-600 text-right select-none border-r border-slate-800 shrink-0">
              {lineNumbers.map((num) => (
                <div key={num} className="leading-6">
                  {num}
                </div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="flex-1 w-full p-4 bg-transparent text-slate-200 font-mono text-xs leading-6 resize-none focus:outline-none focus:ring-0 whitespace-pre overflow-auto"
              placeholder="Write your automation code or algorithms here..."
            />
          </div>

          {/* Editor Status Footer */}
          <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Environment Ready: <strong className="text-slate-300 capitalize">{language}</strong>
            </span>
            <span>Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Enter</kbd> to Run</span>
          </div>
        </div>

        {/* Right Side: Compiler Terminal & Output Console */}
        <div className="lg:w-[460px] flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Terminal Tabs Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-wide">Terminal Output</span>
            </div>

            <div className="flex items-center gap-2">
              {executionStats && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    executionStats.status === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {executionStats.status === 'success' ? '✔ PASSED' : '✖ FAILED'}
                  {executionStats.durationMs !== undefined && ` (${executionStats.durationMs}ms)`}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setTerminalOutput('');
                  setTerminalError('');
                  setExecutionStats(null);
                }}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Console Output Window */}
          <div className="flex-1 bg-black/95 p-4 font-mono text-xs overflow-auto min-h-[300px] leading-relaxed">
            {isRunning && (
              <div className="flex items-center gap-2 text-blue-400 py-2">
                <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span>Compiling source code and executing test harness...</span>
              </div>
            )}

            {!isRunning && !terminalOutput && !terminalError && (
              <div className="text-slate-500 italic py-8 text-center flex flex-col items-center gap-2">
                <Terminal className="w-8 h-8 opacity-40" />
                <p>Click &quot;Run Code&quot; to compile and execute in the live sandbox environment.</p>
                <p className="text-[11px] text-slate-600">
                  Supports TestNG ThreadLocal tests, Page Objects, pytest, and algorithms.
                </p>
              </div>
            )}

            {/* Standard Output */}
            {terminalOutput && (
              <pre className="text-emerald-400 whitespace-pre-wrap font-mono select-text">
                {terminalOutput}
              </pre>
            )}

            {/* Standard Error / Compilation Errors */}
            {terminalError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 whitespace-pre-wrap font-mono">
                <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Execution / Compilation Output:</span>
                </div>
                {terminalError}
              </div>
            )}
          </div>

          {/* Execution Environment Specs Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Execution Engine:</span>
              <span className="text-slate-300 font-mono">
                {language === 'java' && 'OpenJDK 17 / TestNG 7.8 / Selenium 4'}
                {language === 'python' && 'Python 3.13 / pytest / requests'}
                {language === 'typescript' && 'Node.js v20 / Playwright Test'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Thread Safety:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ThreadLocal &amp; Isolated Process
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
