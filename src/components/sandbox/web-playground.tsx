'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Clock,
  Layers,
  Table as TableIcon,
  KeyRound,
  UploadCloud,
  BellRing,
  ScrollText,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  MousePointer,
  Frame,
  FileCode,
  Trash2,
  RefreshCw,
  Eye,
  Terminal,
  BookOpen,
  Download,
  ArrowRight,
} from 'lucide-react';

export default function WebPlayground() {
  const [activeTab, setActiveTab] = useState<'all' | 'dynamic' | 'shadow' | 'table' | 'otp' | 'upload' | 'alerts' | 'frames' | 'stale' | 'broken' | 'hover'>('all');
  const [framework, setFramework] = useState<'all' | 'selenium' | 'playwright'>('all');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Live Automation Event Console
  const [eventLogs, setEventLogs] = useState<Array<{ id: string; time: string; message: string; type: 'info' | 'success' | 'warn' }>>([
    { id: '1', time: new Date().toLocaleTimeString(), message: 'IntelligentQA Web Automation Lab initialized. DOM elements mounted and ready for test automation.', type: 'info' },
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setEventLogs(prev => [
      { id: Math.random().toString(), time, message, type },
      ...prev.slice(0, 39),
    ]);
  };

  // Detect ?stack=selenium or ?stack=playwright from query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const stack = params.get('stack');
      if (stack === 'selenium' || stack === 'selenium-java') setFramework('selenium');
      if (stack === 'playwright' || stack === 'playwright-ts') setFramework('playwright');
    }
  }, []);

  // 1. Dynamic Element State
  const [delaySeconds, setDelaySeconds] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicSuccess, setDynamicSuccess] = useState(false);

  // 2. OTP Input State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSubmitted, setOtpSubmitted] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 3. Table State
  const [tableSearch, setTableSearch] = useState('');
  const [tableSort, setTableSort] = useState<'asc' | 'desc'>('asc');
  const [tableData, setTableData] = useState([
    { id: 1, name: 'Google Pixel 9 Pro', category: 'Mobile', price: 999, stock: 18, status: 'In Stock' },
    { id: 2, name: 'MacBook Pro M4', category: 'Laptop', price: 1999, stock: 7, status: 'Low Stock' },
    { id: 3, name: 'Sony WH-1000XM5', category: 'Audio', price: 399, stock: 45, status: 'In Stock' },
    { id: 4, name: 'Dell UltraSharp 32"', category: 'Monitor', price: 850, stock: 0, status: 'Out of Stock' },
    { id: 5, name: 'Keychron Q1 Pro', category: 'Peripherals', price: 199, stock: 32, status: 'In Stock' },
  ]);

  // 4. File Upload State
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // 5. Alert Trigger State
  const [alertResult, setAlertResult] = useState<string>('');

  // 6. Shadow DOM custom element registration
  const shadowHostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (shadowHostRef.current) {
      let shadow = shadowHostRef.current.shadowRoot;
      if (!shadow) {
        shadow = shadowHostRef.current.attachShadow({ mode: 'open' });
      }
      shadow.innerHTML = `
        <style>
          .shadow-container {
            font-family: system-ui, -apple-system, sans-serif;
            background: #1e293b;
            color: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #334155;
          }
          .shadow-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #38bdf8;
          }
          input {
            width: 100%;
            padding: 8px;
            background: #0f172a;
            border: 1px solid #475569;
            color: #ffffff;
            border-radius: 4px;
            box-sizing: border-box;
            margin-bottom: 10px;
          }
          button {
            background: #059669;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          }
          button:hover {
            background: #10b981;
          }
          .status-msg {
            margin-top: 8px;
            font-size: 12px;
            color: #34d399;
            display: none;
          }
        </style>
        <div class="shadow-container">
          <div class="shadow-title">Shadow Root Component (#shadow-root (open))</div>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">Target this with page.locator() in Playwright or getShadowRoot() in Selenium 4:</p>
          <input type="text" id="shadow-username" placeholder="Enter Shadow Username" value="" />
          <button id="shadow-save-btn">Save to Shadow State</button>
          <div id="shadow-status" class="status-msg">✔ Value persisted inside Shadow DOM!</div>
        </div>
      `;

      const btn = shadow.getElementById('shadow-save-btn');
      const input = shadow.getElementById('shadow-username') as HTMLInputElement;
      const status = shadow.getElementById('shadow-status');

      btn?.addEventListener('click', () => {
        if (status) {
          status.style.display = 'block';
          const val = input.value || 'SDET_AutoUser';
          status.textContent = `✔ Value "${val}" saved in Shadow DOM!`;
          addLog(`[SHADOW DOM] Value "${val}" saved inside open shadow root.`, 'success');
        }
      });
    }
  }, []);

  // 7. iFrame & Nested Frame State
  const [iframeInputVal, setIframeInputVal] = useState('');
  const [iframeStatus, setIframeStatus] = useState('');

  // 8. Stale Element State
  const [staleKey, setStaleKey] = useState(1);
  const [isReRendering, setIsReRendering] = useState(false);
  const [staleClickCount, setStaleClickCount] = useState(0);

  // 9. Broken Links / 404 Status State
  const [brokenAuditRun, setBrokenAuditRun] = useState(false);

  // 10. Actions API Hover Menu State
  const [hoverSelection, setHoverSelection] = useState<string>('');

  // OTP handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      otpRefs.current[Math.min(digits.length, 5)]?.focus();
      addLog(`[OTP] Multi-digit clipboard code pasted: "${digits.join('')}"`, 'info');
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const triggerDynamicDelay = () => {
    setIsLoading(true);
    setDynamicSuccess(false);
    addLog(`[AJAX DELAY] Initiated ${delaySeconds}s asynchronous call. #dynamic-content-box unmounted.`, 'info');
    setTimeout(() => {
      setIsLoading(false);
      setDynamicSuccess(true);
      addLog(`[AJAX DELAY] Call resolved after ${delaySeconds}s. Element #dynamic-content-box attached to DOM.`, 'success');
    }, delaySeconds * 1000);
  };

  const handleCopyCode = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-4 md:p-6 font-sans">
      {/* Playground Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live In-Browser Practice Lab
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Web Automation Playground
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl text-sm md:text-base leading-relaxed">
            Practice real automation challenges against live DOM conditions: Dynamic AJAX Delays, Shadow DOM, Nested Frames, Data Tables, File Uploads, Stale Elements, and OTP PIN inputs.
          </p>
        </div>

        {/* Ready to Test Banner */}
        <div className="flex items-center gap-3 bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 text-xs shadow-md">
          <Code2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-semibold text-slate-200">Target URL for Automation:</div>
            <code className="text-emerald-300 font-mono text-[11px] sm:text-xs">http://localhost:3000/sandbox/web</code>
          </div>
        </div>
      </div>

      {/* Framework Stack Switcher & Sequential Roadmap Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500">Framework Stack:</span>
          <div className="inline-flex rounded-xl p-1 bg-slate-200/70 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setFramework('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                framework === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Frameworks
            </button>
            <button
              onClick={() => setFramework('selenium')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                framework === 'selenium'
                  ? 'bg-amber-500 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-200" />
              1. Selenium (Java)
            </button>
            <button
              onClick={() => setFramework('playwright')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                framework === 'playwright'
                  ? 'bg-emerald-500 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-200" />
              2. Playwright (TS)
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="font-medium">Manual QA Learning Path:</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">1. Selenium → 2. Playwright → 3. Rest Assured → 4. AI for QA</span>
        </div>
      </div>

      {/* Concept Guides & Import Quick Action Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-white flex items-center gap-2">
              {framework === 'selenium'
                ? 'Selenium Architecture & Concept Guides'
                : framework === 'playwright'
                ? 'Playwright Architecture & Concept Guides'
                : 'Selenium & Playwright Architecture Guides'}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                Guides &amp; Templates
              </span>
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore deep-dive architecture guides, interview tips, or download standardized JSON/CSV templates to import concepts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Link
            href={`/guides/${framework === 'playwright' ? 'playwright' : 'selenium'}?action=template`}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 font-semibold transition"
            title="Download or preview guide import template"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Import Template</span>
          </Link>
          <Link
            href={`/guides/${framework === 'playwright' ? 'playwright' : 'selenium'}?action=import`}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 font-semibold transition"
            title="Import custom guides via JSON or CSV"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import Guide</span>
          </Link>
          <Link
            href={`/guides/${framework === 'playwright' ? 'playwright' : 'selenium'}`}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <span>Browse Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid of Automation Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Dynamic AJAX Delays & Spinner Blocking */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">1. Dynamic AJAX Delays &amp; Explicit Waits</h3>
                <p className="text-xs text-slate-500">Playwright Auto-Waiting vs Selenium WebDriverWait</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Delay:</span>
              <select
                value={delaySeconds}
                onChange={e => setDelaySeconds(Number(e.target.value))}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200"
                id="select-delay"
              >
                <option value={1}>1s</option>
                <option value={3}>3s</option>
                <option value={5}>5s</option>
                <option value={10}>10s</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 space-y-3 min-h-[140px] flex flex-col justify-center">
            {isLoading ? (
              <div id="dynamic-spinner" className="flex items-center justify-center gap-3 py-4 text-sky-600 dark:text-sky-400">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Fetching remote payload... ({delaySeconds}s latency)</span>
              </div>
            ) : dynamicSuccess ? (
              <div id="dynamic-content-box" data-testid="dynamic-result" className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-sm">
                <div className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Order #SDET-9824 Successfully Processed!
                </div>
                <div className="text-xs mt-1 text-emerald-700 dark:text-emerald-400">
                  Element rendered after {delaySeconds}s latency. Auto-waiting verified.
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center">Click the button below to simulate asynchronous server latency.</p>
            )}

            <button
              id="trigger-delay-btn"
              data-testid="trigger-ajax"
              disabled={isLoading}
              onClick={triggerDynamicDelay}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              {isLoading ? 'Processing Request...' : `Trigger ${delaySeconds}s Dynamic Call`}
            </button>
          </div>

          {/* Copyable Automation Code */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="font-semibold">Automation Test Snippet:</span>
              <button
                onClick={() => handleCopyCode('delay', framework === 'playwright' ? `await page.locator('#trigger-delay-btn').click();\nawait expect(page.locator('#dynamic-content-box')).toBeVisible({ timeout: 15000 });` : `driver.findElement(By.id("trigger-delay-btn")).click();\nnew WebDriverWait(driver, Duration.ofSeconds(15)).until(ExpectedConditions.visibilityOfElementLocated(By.id("dynamic-content-box")));`)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedIndex === 'delay' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedIndex === 'delay' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-2.5 bg-slate-950 text-emerald-300 rounded-lg font-mono text-[11px] overflow-x-auto">
              {framework === 'playwright'
                ? `await page.locator('#trigger-delay-btn').click();\nawait expect(page.locator('#dynamic-content-box')).toBeVisible({ timeout: 15000 });`
                : `driver.findElement(By.id("trigger-delay-btn")).click();\nnew WebDriverWait(driver, Duration.ofSeconds(15)).until(\n    ExpectedConditions.visibilityOfElementLocated(By.id("dynamic-content-box"))\n);`}
            </pre>
          </div>
        </div>

        {/* 2. Native Shadow DOM Component */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">2. Open Shadow DOM Traversal</h3>
              <p className="text-xs text-slate-500">Playwright Auto-Piercing vs Selenium 4 getShadowRoot()</p>
            </div>
          </div>

          {/* Shadow host element */}
          <div ref={shadowHostRef} id="shadow-host" data-testid="shadow-host-container" className="w-full" />

          {/* Copyable Automation Code */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="font-semibold">Automation Test Snippet:</span>
              <button
                onClick={() => handleCopyCode('shadow', framework === 'playwright' ? `// Playwright pierces Shadow DOM automatically!\nawait page.locator('#shadow-username').fill('SDET_Expert');\nawait page.locator('#shadow-save-btn').click();` : `SearchContext shadowRoot = driver.findElement(By.id("shadow-host")).getShadowRoot();\nshadowRoot.findElement(By.cssSelector("#shadow-username")).sendKeys("SDET_Expert");\nshadowRoot.findElement(By.cssSelector("#shadow-save-btn")).click();`)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedIndex === 'shadow' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedIndex === 'shadow' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-2.5 bg-slate-950 text-emerald-300 rounded-lg font-mono text-[11px] overflow-x-auto">
              {framework === 'playwright'
                ? `// Playwright auto-pierces open shadow roots:\nawait page.locator('#shadow-username').fill('SDET_Expert');\nawait page.locator('#shadow-save-btn').click();`
                : `SearchContext shadow = driver.findElement(By.id("shadow-host")).getShadowRoot();\nshadow.findElement(By.cssSelector("#shadow-username")).sendKeys("SDET_Expert");\nshadow.findElement(By.cssSelector("#shadow-save-btn")).click();`}
            </pre>
          </div>
        </div>

        {/* 3. 6-Digit Segmented OTP PIN Input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">3. Segmented 6-Digit OTP Box</h3>
              <p className="text-xs text-slate-500">Auto-focus, Arrow Keys &amp; Clipboard Paste Handling</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <div className="flex justify-center gap-2 sm:gap-3" id="otp-container" data-testid="otp-inputs">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { otpRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  aria-label={`Digit ${idx + 1}`}
                  data-testid={`otp-digit-${idx}`}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(idx, e)}
                  className="w-10 h-12 text-center text-lg font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900 dark:text-white"
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-verify-otp"
                data-testid="verify-otp-btn"
                onClick={() => {
                  setOtpSubmitted(true);
                  const codeStr = otp.join('');
                  addLog(`[OTP VERIFIED] Entered code: "${codeStr}" - ${codeStr === '849201' ? 'VALID' : 'INVALID'}`, codeStr === '849201' ? 'success' : 'warn');
                }}
                className="flex-1 py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Verify Code
              </button>
              <button
                onClick={() => {
                  setOtp(['8', '4', '9', '2', '0', '1']);
                  addLog('[OTP] Auto-filled sample code 849201', 'info');
                }}
                className="py-2 px-3 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer"
              >
                Auto-Fill 849201
              </button>
              <button
                onClick={() => { setOtp(['', '', '', '', '', '']); setOtpSubmitted(false); }}
                className="py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Reset
              </button>
            </div>

            {otpSubmitted && (
              <div
                id="otp-status-message"
                data-testid="otp-status"
                className={`p-2.5 rounded-lg text-xs font-semibold ${
                  otp.join('') === '849201'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200'
                }`}
              >
                {otp.join('') === '849201'
                  ? '✔ Valid 2FA OTP Code (849201) Confirmed!'
                  : `❌ Invalid OTP Code ("${otp.join('') || 'empty'}"). Hint: Use "849201"`}
              </div>
            )}
          </div>
        </div>

        {/* 4. File Upload & Drag & Drop */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">4. File Upload &amp; Drop Zone</h3>
              <p className="text-xs text-slate-500">setInputFiles() in Playwright &amp; sendKeys() in Selenium</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
            <label
              htmlFor="file-upload-input"
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors"
            >
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Click to browse or drop test artifact
              </span>
              <span className="text-[10px] text-slate-400 mt-1">.csv, .json, .png, .pdf up to 5MB</span>
              <input
                id="file-upload-input"
                data-testid="file-input"
                type="file"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadedFile(file.name);
                    addLog(`[FILE UPLOAD] File "${file.name}" (${(file.size / 1024).toFixed(1)} KB) successfully uploaded.`, 'success');
                  }
                }}
              />
            </label>

            {uploadedFile && (
              <div id="upload-success-badge" data-testid="upload-badge" className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                <span>Uploaded: <strong>{uploadedFile}</strong></span>
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
            )}
          </div>
        </div>

        {/* 5. JavaScript Dialogs & Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">5. JS Alerts, Confirms &amp; Prompts</h3>
              <p className="text-xs text-slate-500">page.on(&apos;dialog&apos;) in Playwright &amp; driver.switchTo().alert()</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-js-alert"
                data-testid="js-alert-btn"
                onClick={() => {
                  window.alert('IntelligentQA Alert: Automated test alert triggered!');
                  setAlertResult('Alert was acknowledged.');
                  addLog('[DIALOG] Alert accepted.', 'info');
                }}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Trigger Alert
              </button>
              <button
                id="btn-js-confirm"
                data-testid="js-confirm-btn"
                onClick={() => {
                  const res = window.confirm('Do you want to confirm this transaction?');
                  setAlertResult(res ? 'Confirmed (OK)' : 'Dismissed (Cancel)');
                  addLog(`[DIALOG] Confirm dismissed/accepted: ${res}`, 'info');
                }}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Trigger Confirm
              </button>
              <button
                id="btn-js-prompt"
                data-testid="js-prompt-btn"
                onClick={() => {
                  const val = window.prompt('Enter SDET candidate secret code:');
                  setAlertResult(`Prompt value: "${val || 'null'}"`);
                  addLog(`[DIALOG] Prompt responded with: "${val}"`, 'info');
                }}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Trigger Prompt
              </button>
            </div>

            {alertResult && (
              <div id="alert-action-result" data-testid="alert-result" className="text-xs p-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg font-mono text-slate-800 dark:text-slate-200">
                Dialog Output: {alertResult}
              </div>
            )}
          </div>
        </div>

        {/* 6. Nested iFrames & Child Windows */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <Frame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">6. Nested iFrames &amp; Popup Windows</h3>
              <p className="text-xs text-slate-500">driver.switchTo().frame() &amp; page.frameLocator()</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
            {/* Embedded iframe simulator */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-dashed border-teal-500/50 space-y-2">
              <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                &lt;iframe id=&quot;qa-test-frame&quot; name=&quot;qa-frame&quot;&gt;
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="iframe-input"
                  placeholder="Type inside nested frame..."
                  value={iframeInputVal}
                  onChange={e => setIframeInputVal(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
                <button
                  id="iframe-btn"
                  onClick={() => {
                    setIframeStatus(`Saved from iframe: "${iframeInputVal || 'Hello Frame'}"`);
                    addLog(`[IFRAME] Form submitted inside frame with value: "${iframeInputVal || 'Hello Frame'}"`, 'success');
                  }}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Submit Frame
                </button>
              </div>
              {iframeStatus && (
                <div id="iframe-result-msg" className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                  ✔ {iframeStatus}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                id="btn-open-popup"
                onClick={() => {
                  window.open('/sandbox/web?mode=popup', 'SDET_Popup', 'width=500,height=400');
                  addLog('[POPUP WINDOW] Triggered window.open("SDET_Popup"). Multiple window handles active.', 'info');
                }}
                className="py-2 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Launch Test Popup Window
              </button>
              <span className="text-[11px] text-slate-400">Tests window handles</span>
            </div>
          </div>
        </div>

        {/* 7. Stale Element Reference Simulator */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">7. StaleElementReference Simulator</h3>
              <p className="text-xs text-slate-500">Simulate DOM element destruction and dynamic replacement</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
            <p className="text-xs text-slate-500">
              In single-page apps (React/Angular), elements are frequently deleted and recreated. If an automation script caches an old DOM reference, it throws <code className="text-orange-500 font-mono">StaleElementReferenceException</code>.
            </p>

            <div className="flex items-center gap-3">
              <button
                key={staleKey}
                id="volatile-btn"
                data-instance={staleKey}
                onClick={() => {
                  setStaleClickCount(c => c + 1);
                  addLog(`[STALE SIMULATOR] Clicked #volatile-btn (DOM generation #${staleKey}). Total clicks: ${staleClickCount + 1}`, 'success');
                }}
                className="py-2 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Click Target (DOM Gen #{staleKey})
              </button>

              <button
                id="btn-recreate-dom"
                disabled={isReRendering}
                onClick={() => {
                  setIsReRendering(true);
                  addLog('[STALE SIMULATOR] Element #volatile-btn destroyed. Simulating AJAX DOM re-render...', 'warn');
                  setTimeout(() => {
                    setStaleKey(k => k + 1);
                    setIsReRendering(false);
                    addLog('[STALE SIMULATOR] New DOM element mounted with new memory address. Old references are now STALE.', 'info');
                  }, 800);
                }}
                className="py-2 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
              >
                {isReRendering ? 'Re-rendering DOM...' : 'Destroy & Re-render Element'}
              </button>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Clicks registered: <strong>{staleClickCount}</strong></span>
              <span className="text-[11px] font-mono text-orange-500">ID: volatile-btn</span>
            </div>
          </div>
        </div>

        {/* 8. Broken Links & Images (HTTP 404) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">8. Broken Images &amp; HTTP 404 Audit</h3>
              <p className="text-xs text-slate-500">naturalWidth === 0 in JS &amp; HTTP response code checks</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Link (200 OK)
                </span>
                <div className="text-[11px] text-slate-500 font-mono">/api/sandbox/v1/users</div>
                {brokenAuditRun && <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-bold">HTTP 200</span>}
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Broken Link (404 Not Found)
                </span>
                <div className="text-[11px] text-slate-500 font-mono">/broken-link-endpoint</div>
                {brokenAuditRun && <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 font-bold">HTTP 404</span>}
              </div>
            </div>

            <button
              id="btn-audit-links"
              onClick={() => {
                setBrokenAuditRun(true);
                addLog('[BROKEN LINK AUDIT] Scanned page links: 1 Healthy (200 OK), 1 Broken (404 NOT FOUND).', 'warn');
              }}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Run Automated Link &amp; Image Audit
            </button>
          </div>
        </div>

        {/* 9. Dynamic Filterable Data Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <TableIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">9. Dynamic Data Table with Search &amp; Sort</h3>
                <p className="text-xs text-slate-500">Target Rows with page.locator(&apos;tr&apos;).filter(&#123; hasText: &apos;...&apos; &#125;) or XPath</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                id="table-search-input"
                data-testid="table-search"
                placeholder="Search products..."
                value={tableSearch}
                onChange={e => {
                  setTableSearch(e.target.value);
                  addLog(`[TABLE SEARCH] Filter applied: "${e.target.value}"`, 'info');
                }}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-56"
              />
              <button
                onClick={() => {
                  setTableSort(s => s === 'asc' ? 'desc' : 'asc');
                  addLog(`[TABLE SORT] Toggled price sort: ${tableSort === 'asc' ? 'DESC' : 'ASC'}`, 'info');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800 cursor-pointer"
              >
                Sort Price: {tableSort.toUpperCase()}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table id="products-table" data-testid="products-table" className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Price</th>
                  <th className="py-2.5 px-4">Stock</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {tableData
                  .filter(
                    item =>
                      item.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
                      item.category.toLowerCase().includes(tableSearch.toLowerCase())
                  )
                  .sort((a, b) => tableSort === 'asc' ? a.price - b.price : b.price - a.price)
                  .map(row => (
                    <tr
                      key={row.id}
                      data-testid={`product-row-${row.id}`}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-500">{row.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{row.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.category}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">${row.price}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.stock}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            row.status === 'In Stock'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                              : row.status === 'Low Stock'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => addLog(`[TABLE ACTION] Inspected product #${row.id}: ${row.name}`, 'info')}
                          className="px-2.5 py-1 text-[11px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded hover:bg-purple-100 transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Live Automation Terminal / Event Log */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Live Automation Interaction Stream</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              REAL-TIME
            </span>
          </div>
          <button
            onClick={() => setEventLogs([{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), message: 'Event log cleared.', type: 'info' }])}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear Log
          </button>
        </div>

        <div className="h-36 overflow-y-auto space-y-1.5 pr-2">
          {eventLogs.map(log => (
            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
              <span className="text-slate-500 shrink-0 text-[10px]">{log.time}</span>
              <span
                className={
                  log.type === 'success'
                    ? 'text-emerald-400'
                    : log.type === 'warn'
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
