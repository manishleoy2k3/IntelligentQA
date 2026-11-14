'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

export default function WebPlayground() {
  const [activeTab, setActiveTab] = useState<'all' | 'dynamic' | 'shadow' | 'table' | 'otp' | 'upload' | 'alerts'>('all');

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
  const [tableData, setTableData] = useState([
    { id: 1, name: 'Google Pixel 9 Pro', category: 'Mobile', price: '$999', stock: 18, status: 'In Stock' },
    { id: 2, name: 'MacBook Pro M4', category: 'Laptop', price: '$1,999', stock: 7, status: 'Low Stock' },
    { id: 3, name: 'Sony WH-1000XM5', category: 'Audio', price: '$399', stock: 45, status: 'In Stock' },
    { id: 4, name: 'Dell UltraSharp 32"', category: 'Monitor', price: '$850', stock: 0, status: 'Out of Stock' },
    { id: 5, name: 'Keychron Q1 Pro', category: 'Peripherals', price: '$199', stock: 32, status: 'In Stock' },
  ]);

  // 4. File Upload State
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // 5. Alert Trigger State
  const [alertResult, setAlertResult] = useState<string>('');

  // 6. Shadow DOM custom element registration
  const shadowHostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (shadowHostRef.current && !shadowHostRef.current.shadowRoot) {
      const shadow = shadowHostRef.current.attachShadow({ mode: 'open' });
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
          status.textContent = `✔ Value "${input.value || 'SDET'}" saved in Shadow DOM!`;
        }
      });
    }
  }, []);

  // OTP handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste multi-digit code
      const digits = value.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      otpRefs.current[Math.min(digits.length, 5)]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance
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
    setTimeout(() => {
      setIsLoading(false);
      setDynamicSuccess(true);
    }, delaySeconds * 1000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-4 md:p-6">
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
          <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl text-sm md:text-base">
            Test challenging automation scenarios against realistic DOM conditions: Dynamic Delays, Shadow DOM, Nested Frames, Data Tables, and OTP PIN inputs.
          </p>
        </div>

        {/* Ready to Test Banner */}
        <div className="flex items-center gap-3 bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-xs">
          <Code2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-semibold">Target URL for Automation:</div>
            <code className="text-emerald-300 font-mono">http://localhost:3000/sandbox/web</code>
          </div>
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
                <h3 className="font-bold text-slate-900 dark:text-white">1. Dynamic AJAX Delays</h3>
                <p className="text-xs text-slate-500">Tests Playwright Auto-Waiting & Selenium WebDriverWait</p>
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
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 space-y-3 min-h-[140px] flex flex-col justify-center">
            {isLoading ? (
              <div id="dynamic-spinner" className="flex items-center justify-center gap-3 py-4 text-sky-600 dark:text-sky-400">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Fetching remote payload... ({delaySeconds}s delay)</span>
              </div>
            ) : dynamicSuccess ? (
              <div id="dynamic-content-box" data-testid="dynamic-result" className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-sm">
                <div className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Order #SDET-9824 Successfully Processed!
                </div>
                <div className="text-xs mt-1 text-emerald-700 dark:text-emerald-400">
                  Element rendered after {delaySeconds}s AJAX delay. Auto-waiting verified.
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
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isLoading ? 'Processing Request...' : `Trigger ${delaySeconds}s Dynamic Call`}
            </button>
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
              <p className="text-xs text-slate-500">Directly Pierced by Playwright, getShadowRoot() in Selenium</p>
            </div>
          </div>

          {/* Shadow host element */}
          <div ref={shadowHostRef} id="shadow-host" data-testid="shadow-host-container" className="w-full" />
        </div>

        {/* 3. 6-Digit Segmented OTP PIN Input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">3. Segmented 6-Digit OTP Box</h3>
              <p className="text-xs text-slate-500">Auto-focus, Arrow Keys & Clipboard Paste Handling</p>
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

            <div className="flex items-center gap-3">
              <button
                id="btn-verify-otp"
                data-testid="verify-otp-btn"
                onClick={() => setOtpSubmitted(true)}
                className="flex-1 py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Verify Code
              </button>
              <button
                onClick={() => { setOtp(['', '', '', '', '', '']); setOtpSubmitted(false); }}
                className="py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
              <h3 className="font-bold text-slate-900 dark:text-white">4. File Upload & Drop Zone</h3>
              <p className="text-xs text-slate-500">setInputFiles() in Playwright & sendKeys() in Selenium</p>
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
                  if (file) setUploadedFile(file.name);
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
              <h3 className="font-bold text-slate-900 dark:text-white">5. JS Alerts, Confirms & Prompts</h3>
              <p className="text-xs text-slate-500">page.on(&apos;dialog&apos;) in Playwright & driver.switchTo().alert()</p>
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
                }}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
              >
                Trigger Alert
              </button>
              <button
                id="btn-js-confirm"
                data-testid="js-confirm-btn"
                onClick={() => {
                  const res = window.confirm('Do you want to confirm this transaction?');
                  setAlertResult(res ? 'Confirmed (OK)' : 'Dismissed (Cancel)');
                }}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
              >
                Trigger Confirm
              </button>
              <button
                id="btn-js-prompt"
                data-testid="js-prompt-btn"
                onClick={() => {
                  const val = window.prompt('Enter SDET candidate secret code:');
                  setAlertResult(`Prompt value: "${val || 'null'}"`);
                }}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
              >
                Trigger Prompt
              </button>
            </div>

            {alertResult && (
              <div id="alert-action-result" data-testid="alert-result" className="text-xs p-2 bg-slate-200 dark:bg-slate-800 rounded font-mono text-slate-800 dark:text-slate-200">
                Dialog Output: {alertResult}
              </div>
            )}
          </div>
        </div>

        {/* 6. Dynamic Filterable Data Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <TableIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">6. Dynamic Data Table with Search</h3>
                <p className="text-xs text-slate-500">Target Rows with page.locator(&apos;tr&apos;).filter(&#123; hasText: &apos;...&apos; &#125;)</p>
              </div>
            </div>

            <input
              type="text"
              id="table-search-input"
              data-testid="table-search"
              placeholder="Search products by title or category..."
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
            />
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
                  .map(row => (
                    <tr
                      key={row.id}
                      data-testid={`product-row-${row.id}`}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-500">{row.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{row.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.category}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{row.price}</td>
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
                          onClick={() => alert(`Selected: ${row.name}`)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded hover:bg-purple-100 transition-colors"
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
    </div>
  );
}
