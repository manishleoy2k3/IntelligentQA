'use client';

import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  Check,
  Code2,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { TestCaseItem, TestCaseResult } from '@/lib/coding-test-runner';

interface CodingTestcasePanelProps {
  testCases: TestCaseItem[];
  selectedCaseId: string;
  onSelectCase: (id: string) => void;
  onUpdateCaseInput: (id: string, newInput: string) => void;
  onUpdateCaseExpected: (id: string, newExpected: string) => void;
  onAddTestCase: () => void;
  onRemoveTestCase: (id: string) => void;
  testResults: TestCaseResult[] | null;
  isRunning: boolean;
  terminalOutput: string;
  terminalError: string;
  executionStats: {
    durationMs?: number;
    status?: string;
    exitCode?: number;
  } | null;
  stdinInput: string;
  onChangeStdin: (val: string) => void;
  showStdin: boolean;
  onToggleStdin: () => void;
  activeTab: 'testcase' | 'result';
  setActiveTab: (tab: 'testcase' | 'result') => void;
}

export function CodingTestcasePanel({
  testCases,
  selectedCaseId,
  onSelectCase,
  onUpdateCaseInput,
  onUpdateCaseExpected,
  onAddTestCase,
  onRemoveTestCase,
  testResults,
  isRunning,
  terminalOutput,
  terminalError,
  executionStats,
  stdinInput,
  onChangeStdin,
  showStdin,
  onToggleStdin,
  activeTab,
  setActiveTab,
}: CodingTestcasePanelProps) {
  const [selectedResultCaseId, setSelectedResultCaseId] = useState<string>(
    testCases[0]?.id || 'case-1'
  );
  const [copiedInput, setCopiedInput] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);

  const currentTestCase = testCases.find((tc) => tc.id === selectedCaseId) || testCases[0];
  const allPassed = testResults && testResults.length > 0 && testResults.every((r) => r.passed);
  const passedCount = testResults ? testResults.filter((r) => r.passed).length : 0;
  const currentResult = testResults?.find((r) => r.id === selectedResultCaseId) || testResults?.[0];

  const handleCopy = (text: string, isInput: boolean) => {
    navigator.clipboard.writeText(text);
    if (isInput) {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 1800);
    } else {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 1800);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 text-slate-100 font-sans select-none overflow-hidden">
      {/* Primary Top Bar: LeetCode Section Switcher (Testcase vs Test Result) */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-3 py-1.5 shrink-0">
        <div className="flex items-center gap-1">
          {/* Testcase Tab Button */}
          <button
            type="button"
            onClick={() => setActiveTab('testcase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'testcase'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Testcase</span>
          </button>

          {/* Test Result Tab Button */}
          <button
            type="button"
            onClick={() => setActiveTab('result')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === 'result'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {testResults ? (
              allPassed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )
            ) : (
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>Test Result</span>

            {testResults && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  allPassed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {passedCount}/{testResults.length}
              </span>
            )}
          </button>
        </div>

        {/* Right Status Badge / Stdin Toggle */}
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Running testcases...
            </span>
          )}

          {/* Stdin Toggle */}
          <button
            type="button"
            onClick={onToggleStdin}
            className={`px-2 py-1 rounded text-[11px] font-medium border transition cursor-pointer flex items-center gap-1 ${
              showStdin
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle raw standard input (stdin)"
          >
            <span>Stdin</span>
            <span>{showStdin ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {/* Raw Stdin Drawer (if toggled) */}
      {showStdin && (
        <div className="p-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <span>Standard Input (stdin stream):</span>
            </span>
            <span className="text-[10px] text-slate-500">Passed directly to program stdin</span>
          </div>
          <textarea
            value={stdinInput}
            onChange={(e) => onChangeStdin(e.target.value)}
            rows={2}
            placeholder="Type custom standard input values..."
            className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>
      )}

      {/* MAIN TAB 1: TESTCASE SECTION */}
      {activeTab === 'testcase' && (
        <div className="flex-1 flex flex-col p-3 overflow-y-auto">
          {/* Sub-tabs: Case 1, Case 2, Case 3, + Add */}
          <div className="flex items-center gap-1.5 flex-wrap border-b border-slate-800/80 pb-2 mb-3 shrink-0">
            {testCases.map((tc) => {
              const isSelected = tc.id === currentTestCase?.id;
              return (
                <div key={tc.id} className="flex items-center group">
                  <button
                    type="button"
                    onClick={() => onSelectCase(tc.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 text-white border border-emerald-500/40 shadow-xs'
                        : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-slate-800'
                    }`}
                  >
                    <span>{tc.name}</span>
                    {tc.isCustom && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                        custom
                      </span>
                    )}
                  </button>
                  {tc.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTestCase(tc.id);
                      }}
                      className="ml-0.5 p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      title="Remove this custom test case"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* + Add Testcase Button */}
            <button
              type="button"
              onClick={onAddTestCase}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-emerald-400 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-emerald-500/50 transition flex items-center gap-1 cursor-pointer"
              title="Add a custom test case"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Case</span>
            </button>
          </div>

          {/* Active Testcase Details & Editable Input */}
          {currentTestCase && (
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans font-semibold mb-1">
                  <span>Input Arguments:</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Format:{' '}
                    <code className="text-slate-400">nums = [2, 7, 11, 15], target = 9</code>
                  </span>
                </div>
                <textarea
                  value={currentTestCase.input}
                  onChange={(e) => onUpdateCaseInput(currentTestCase.id, e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 rounded-xl p-3 text-slate-200 font-mono text-xs resize-none focus:outline-none transition leading-relaxed"
                  placeholder="Enter input values for this testcase..."
                />
              </div>

              {/* Expected Output Field */}
              <div>
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans font-semibold mb-1">
                  <span>Expected Output (optional):</span>
                </div>
                <input
                  type="text"
                  value={currentTestCase.expected || ''}
                  onChange={(e) => onUpdateCaseExpected(currentTestCase.id, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none transition"
                  placeholder="Expected return value (e.g. [0, 1])"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* MAIN TAB 2: TEST RESULT SECTION */}
      {activeTab === 'result' && (
        <div className="flex-1 flex flex-col p-3 overflow-y-auto">
          {isRunning && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-emerald-400">
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Running solution across all test cases...</p>
            </div>
          )}

          {!isRunning && !testResults && !terminalError && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-slate-500">
              <Code2 className="w-8 h-8 opacity-40" />
              <p className="text-xs italic">
                Click &quot;Run&quot; above to execute your solution on all test cases.
              </p>
            </div>
          )}

          {/* Compilation / Runtime Error Banner */}
          {!isRunning && terminalError && (
            <div className="p-3 mb-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 font-mono text-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1 font-sans">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Execution Diagnostic / Error:</span>
              </div>
              <pre className="whitespace-pre-wrap">{terminalError}</pre>
            </div>
          )}

          {/* LeetCode Structured Test Results */}
          {!isRunning && testResults && testResults.length > 0 && (
            <>
              {/* Overall Status Banner */}
              <div
                className={`p-3 rounded-xl mb-3 flex items-center justify-between border ${
                  allPassed
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {allPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">
                      {allPassed ? 'Accepted' : 'Wrong Answer'}
                    </h3>
                    <p className="text-[11px] opacity-80">
                      {passedCount} of {testResults.length} test cases passed
                    </p>
                  </div>
                </div>

                {executionStats?.durationMs !== undefined && (
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
                    Runtime: {executionStats.durationMs} ms
                  </span>
                )}
              </div>

              {/* Sub-tabs: Case 1, Case 2, ... */}
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-3 shrink-0">
                {testResults.map((tr) => {
                  const isSelected = tr.id === currentResult?.id;
                  return (
                    <button
                      key={tr.id}
                      type="button"
                      onClick={() => setSelectedResultCaseId(tr.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                          : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-slate-800'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          tr.passed
                            ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                            : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                        }`}
                      />
                      <span>{tr.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Case Inspection: Input, Output, Expected */}
              {currentResult && (
                <div className="space-y-3 font-mono text-xs">
                  {/* Input Card */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans font-semibold mb-1">
                      <span>Input:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentResult.input, true)}
                        className="text-slate-500 hover:text-slate-300 transition flex items-center gap-1 text-[10px] cursor-pointer"
                      >
                        {copiedInput ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedInput ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
                      {currentResult.input}
                    </pre>
                  </div>

                  {/* Output Card */}
                  <div
                    className={`p-3 rounded-xl border ${
                      currentResult.passed
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-sans font-semibold mb-1">
                      <span className={currentResult.passed ? 'text-emerald-400' : 'text-rose-400'}>
                        Output:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentResult.output, false)}
                        className="text-slate-500 hover:text-slate-300 transition flex items-center gap-1 text-[10px] cursor-pointer"
                      >
                        {copiedOutput ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedOutput ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre
                      className={`whitespace-pre-wrap leading-relaxed select-text font-bold ${
                        currentResult.passed ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {currentResult.output || '(no output)'}
                    </pre>
                  </div>

                  {/* Expected Card */}
                  {currentResult.expected && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="text-slate-400 text-[11px] font-sans font-semibold mb-1">
                        Expected:
                      </div>
                      <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed select-text font-bold">
                        {currentResult.expected}
                      </pre>
                    </div>
                  )}

                  {/* Error Diagnostic inside case */}
                  {currentResult.error && (
                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300">
                      <div className="text-[11px] font-sans font-bold text-rose-400 mb-1">
                        Error Message:
                      </div>
                      <pre className="whitespace-pre-wrap text-[11px]">{currentResult.error}</pre>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Raw Output Fallback */}
          {!isRunning && !testResults && terminalOutput && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs">
              <pre className="text-emerald-400 whitespace-pre-wrap select-text leading-relaxed">
                {terminalOutput}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
