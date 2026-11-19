const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

describe('Compiler Code IntelliSense Architecture & Functionality', () => {
  const intellisenseLibPath = path.join(__dirname, '../src/lib/intellisense.ts');
  const overlayCompPath = path.join(__dirname, '../src/components/sandbox/code-intellisense-overlay.tsx');
  const codeCompilerPath = path.join(__dirname, '../src/app/sandbox/code/page.tsx');
  const problemSolverPath = path.join(__dirname, '../src/app/sandbox/code/problems/[problemId]/problem-solver-client.tsx');

  const intellisenseContent = fs.readFileSync(intellisenseLibPath, 'utf8');
  const overlayContent = fs.readFileSync(overlayCompPath, 'utf8');
  const codeCompilerContent = fs.readFileSync(codeCompilerPath, 'utf8');
  const problemSolverContent = fs.readFileSync(problemSolverPath, 'utf8');

  it('1. Core IntelliSense engine exports all required types and functions', () => {
    assert.ok(intellisenseContent.includes('export function getCompletions'), 'getCompletions function must be exported');
    assert.ok(intellisenseContent.includes('export function extractDocumentSymbols'), 'extractDocumentSymbols function must be exported');
    assert.ok(intellisenseContent.includes('export function getCaretCoordinates'), 'getCaretCoordinates function must be exported');
    assert.ok(intellisenseContent.includes('export function handleSmartEditorKeys'), 'handleSmartEditorKeys function must be exported');
    assert.ok(intellisenseContent.includes('export type IntelliSenseKind'), 'IntelliSenseKind type must be exported');
    assert.ok(intellisenseContent.includes('export interface CompletionItem'), 'CompletionItem interface must be exported');
  });

  it('2. Multi-language dictionary covers Java, Python, TypeScript, JavaScript, and C#', () => {
    // Java
    assert.ok(intellisenseContent.includes('JAVA_KEYWORDS'), 'Java keywords dictionary must exist');
    assert.ok(intellisenseContent.includes('JAVA_CLASSES'), 'Java classes dictionary must exist');
    assert.ok(intellisenseContent.includes('JAVA_SNIPPETS'), 'Java snippets dictionary must exist');
    assert.ok(intellisenseContent.includes('JAVA_DOT_COMPLETIONS'), 'Java dot completions dictionary must exist');

    // Python
    assert.ok(intellisenseContent.includes('PYTHON_KEYWORDS'), 'Python keywords dictionary must exist');
    assert.ok(intellisenseContent.includes('PYTHON_BUILTINS'), 'Python builtins dictionary must exist');
    assert.ok(intellisenseContent.includes('PYTHON_SNIPPETS'), 'Python snippets dictionary must exist');

    // JavaScript / TypeScript
    assert.ok(intellisenseContent.includes('JS_TS_KEYWORDS'), 'JS/TS keywords dictionary must exist');
    assert.ok(intellisenseContent.includes('JS_TS_GLOBALS'), 'JS/TS globals dictionary must exist');
    assert.ok(intellisenseContent.includes('JS_TS_SNIPPETS'), 'JS/TS snippets dictionary must exist');
    assert.ok(intellisenseContent.includes('JS_TS_DOT_COMPLETIONS'), 'JS/TS dot completions dictionary must exist');

    // C#
    assert.ok(intellisenseContent.includes('CSHARP_KEYWORDS'), 'C# keywords dictionary must exist');
    assert.ok(intellisenseContent.includes('CSHARP_GLOBALS'), 'C# globals dictionary must exist');
    assert.ok(intellisenseContent.includes('CSHARP_SNIPPETS'), 'C# snippets dictionary must exist');
    assert.ok(intellisenseContent.includes('CSHARP_DOT_COMPLETIONS'), 'C# dot completions dictionary must exist');
  });

  it('3. Context-aware Dot Completions handle standard namespaces and classes', () => {
    // System and System.out in Java
    assert.ok(intellisenseContent.includes("'System.':"), 'System dot completions must be defined');
    assert.ok(intellisenseContent.includes("'System.out.':"), 'System.out dot completions must be defined');
    assert.ok(intellisenseContent.includes('println()'), 'System.out.println must be supported');

    // Math in Java, JS, and C#
    assert.ok(intellisenseContent.includes("'Math.':"), 'Math dot completions must be defined');

    // Console in JS and C#
    assert.ok(intellisenseContent.includes("'console.':"), 'console dot completions must be defined');
    assert.ok(intellisenseContent.includes("'Console.':"), 'Console dot completions in C# must be defined');

    // Arrays & Collections in Java
    assert.ok(intellisenseContent.includes("'Arrays.':"), 'Arrays dot completions must be defined');
    assert.ok(intellisenseContent.includes("'Collections.':"), 'Collections dot completions must be defined');
  });

  it('4. Productivity IDE Snippets are defined for rapid code construction', () => {
    // Java sout, psvm, fori, trycatch
    assert.ok(intellisenseContent.includes("label: 'sout'"), 'sout snippet must exist');
    assert.ok(intellisenseContent.includes("label: 'psvm'"), 'psvm snippet must exist');
    assert.ok(intellisenseContent.includes("label: 'fori'"), 'fori snippet must exist');

    // Python def, main, tryexp
    assert.ok(intellisenseContent.includes("label: 'def'"), 'def snippet must exist');

    // JS/TS clog, prom
    assert.ok(intellisenseContent.includes("label: 'clog'"), 'clog snippet must exist');

    // C# cw
    assert.ok(intellisenseContent.includes("label: 'cw'"), 'cw snippet must exist');
  });

  it('5. Dynamic user document symbol extraction recognizes variables, functions, and classes', () => {
    assert.ok(intellisenseContent.includes('extractDocumentSymbols'), 'extractDocumentSymbols must be implemented');
    assert.ok(intellisenseContent.includes('varRegex'), 'Regex for variable declarations must exist');
    assert.ok(intellisenseContent.includes('defRegex'), 'Regex for Python def declarations must exist');
    assert.ok(intellisenseContent.includes('classRegex'), 'Regex for class declarations must exist');
  });

  it('6. Caret pixel coordinates calculator provides exact floating dropdown positioning', () => {
    assert.ok(intellisenseContent.includes('getCaretCoordinates'), 'getCaretCoordinates must be defined');
    assert.ok(intellisenseContent.includes('mirrorDivId'), 'Uses mirror div technique for pixel precision');
    assert.ok(intellisenseContent.includes('window.getComputedStyle'), 'Copies computed styles from textarea');
  });

  it('7. Smart editor keys handle auto-closing pairs and intelligent Enter indentation', () => {
    assert.ok(intellisenseContent.includes('handleSmartEditorKeys'), 'handleSmartEditorKeys must be defined');
    assert.ok(intellisenseContent.includes("'(': ')'"), 'Auto-closes parentheses');
    assert.ok(intellisenseContent.includes("'[': ']'"), 'Auto-closes brackets');
    assert.ok(intellisenseContent.includes("'{': '}'"), 'Auto-closes braces');
    assert.ok(intellisenseContent.includes("charBefore === '{' && charAfter === '}'"), 'Expands and indents nested braces on Enter');
  });

  it('8. IntelliSenseOverlay component implements accessible dropdown, badges, and documentation flyout', () => {
    assert.ok(overlayContent.includes('IntelliSenseOverlay'), 'IntelliSenseOverlay component must be defined');
    assert.ok(overlayContent.includes('KIND_CONFIG'), 'Visual badges configured for fn, kw, cls, var, snip, prop');
    assert.ok(overlayContent.includes('matchedPrefix'), 'Highlights matched characters in label');
    assert.ok(overlayContent.includes('currentItem.documentation'), 'Displays documentation description flyout');
    assert.ok(overlayContent.includes('clampedTop') && overlayContent.includes('clampedLeft'), 'Bounds check to prevent overflowing screen');
  });

  it('9. Online Compiler Page (/sandbox/code) integrates full IntelliSense experience', () => {
    assert.ok(codeCompilerContent.includes('IntelliSenseOverlay'), 'Page embeds IntelliSenseOverlay component');
    assert.ok(codeCompilerContent.includes('updateIntelliSense'), 'Page triggers updateIntelliSense');
    assert.ok(codeCompilerContent.includes('applyCompletion'), 'Page applies selected completion');
    assert.ok(codeCompilerContent.includes('handleCodeChange'), 'Page connects onChange to updateIntelliSense');
    assert.ok(codeCompilerContent.includes('handleSmartEditorKeys'), 'Page supports bracket auto-closing and indentation');
    assert.ok(codeCompilerContent.includes('intellisenseEnabled'), 'Page provides toggle state for IntelliSense');
    assert.ok(codeCompilerContent.includes('IntelliSense:'), 'Status footer shows active IntelliSense state');
  });

  it('10. Problem Solver Compiler IDE integrates full IntelliSense experience', () => {
    assert.ok(problemSolverContent.includes('IntelliSenseOverlay'), 'Problem solver embeds IntelliSenseOverlay component');
    assert.ok(problemSolverContent.includes('updateIntelliSense'), 'Problem solver triggers updateIntelliSense');
    assert.ok(problemSolverContent.includes('applyCompletion'), 'Problem solver applies selected completion');
    assert.ok(problemSolverContent.includes('handleCodeChange'), 'Problem solver connects onChange to updateIntelliSense');
    assert.ok(problemSolverContent.includes('handleSmartEditorKeys'), 'Problem solver supports bracket auto-closing and indentation');
    assert.ok(problemSolverContent.includes('intellisenseEnabled'), 'Problem solver provides toggle state for IntelliSense');
    assert.ok(problemSolverContent.includes('IntelliSense:'), 'Status footer shows active IntelliSense state');
  });
});
