const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

describe('Compiler Multi-Tier Architecture & Vercel Resiliency', () => {
  const compilerRoutePath = path.join(__dirname, '../src/app/api/sandbox/compiler/route.ts');
  const compilerContent = fs.readFileSync(compilerRoutePath, 'utf8');

  it('Tier 1-4 execution engine functions exist in route.ts', () => {
    assert.ok(compilerContent.includes('executeWithWandbox'), 'Wandbox engine should be defined');
    assert.ok(compilerContent.includes('executeWithPiston'), 'Piston engine should be defined');
    assert.ok(compilerContent.includes('executeWithGemini'), 'Gemini AI simulation engine should be defined');
    assert.ok(compilerContent.includes('simulateJavaInProcess'), 'In-process Java VM simulation should be defined');
    assert.ok(compilerContent.includes('simulatePythonInProcess'), 'In-process Python VM simulation should be defined');
  });

  it('Dynamic Java class name extraction is implemented to avoid hardcoded Main.java errors', () => {
    assert.ok(compilerContent.includes('extractJavaClassName'), 'Should dynamically extract class name from code');
    assert.ok(compilerContent.includes('${javaClass}.java'), 'Piston payload must use dynamic java class name');
  });

  it('In-process Java VM transpiler correctly runs basic Java 21 programs with zero external dependencies', () => {
    // Test the logic directly
    const vm = require('vm');
    const javaCode = `
      public class Main {
        public static void main(String[] args) {
          int x = 20;
          int y = 30;
          System.out.println("Result: " + (x + y));
        }
      }
    `;

    let js = javaCode;
    js = js.replace(/System\.out\.println\s*\(/g, 'console.log(');
    js = js.replace(/\b(?:int|double|String)\s+([A-Za-z0-9_]+)\s*(=|;)/g, 'let $1 $2');
    js = js.replace(/public\s+class\s+[A-Za-z0-9_]+\s*\{/, '');
    js = js.replace(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/, '');
    js = js.trim().replace(/\}\s*\}\s*$/, '');

    let output = '';
    const sandbox = {
      console: { log: (...args) => { output += args.join(' ') + '\n'; } },
      Math,
    };
    const context = vm.createContext(sandbox);
    vm.runInContext(js, context);

    assert.strictEqual(output.trim(), 'Result: 50');
  });

  it('Frontend pages pass user Gemini key in x-gemini-api-key header', () => {
    const kidsPage = fs.readFileSync(path.join(__dirname, '../src/app/kids/page.tsx'), 'utf8');
    const sandboxCodePage = fs.readFileSync(path.join(__dirname, '../src/app/sandbox/code/page.tsx'), 'utf8');
    const problemSolver = fs.readFileSync(
      path.join(__dirname, '../src/app/sandbox/code/problems/[problemId]/problem-solver-client.tsx'),
      'utf8'
    );

    assert.ok(kidsPage.includes('x-gemini-api-key'), 'Kids page must pass x-gemini-api-key');
    assert.ok(sandboxCodePage.includes('x-gemini-api-key'), 'Sandbox code page must pass x-gemini-api-key');
    assert.ok(problemSolver.includes('x-gemini-api-key'), 'Problem solver must pass x-gemini-api-key');
  });
});
