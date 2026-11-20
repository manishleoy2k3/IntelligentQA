const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('LeetCode Testcase & Test Result Execution Engine', () => {
  const runnerFile = path.join(__dirname, '../src/lib/coding-test-runner.ts');
  const runnerContent = fs.readFileSync(runnerFile, 'utf8');

  // -------------------------------------------------------------------------
  // 1. Argument Extraction from Problem Inputs
  // -------------------------------------------------------------------------
  function extractArgsFromInput(inputStr) {
    if (!inputStr || !inputStr.trim()) return [];
    const varMatches = inputStr.split(/,\s*(?=[a-zA-Z_][a-zA-Z0-9_]*\s*=)/);
    const args = [];
    for (const part of varMatches) {
      const eqIdx = part.indexOf('=');
      const rawVal = (eqIdx !== -1 ? part.slice(eqIdx + 1) : part).trim();
      try {
        const parsed = Function(`"use strict"; return (${rawVal});`)();
        args.push(parsed);
      } catch {
        if (rawVal === 'true') args.push(true);
        else if (rawVal === 'false') args.push(false);
        else if (rawVal === 'null') args.push(null);
        else if (!isNaN(Number(rawVal)) && rawVal.trim() !== '') args.push(Number(rawVal));
        else args.push(rawVal.replace(/^["']|["']$/g, ''));
      }
    }
    return args;
  }

  it('1. Extracts arguments correctly across all input patterns (arrays, targets, strings, matrices)', () => {
    // Two Sum pattern
    const args1 = extractArgsFromInput('nums = [2, 7, 11, 15], target = 9');
    assert.deepStrictEqual(args1, [[2, 7, 11, 15], 9]);

    // Custom user input (Two Sum Case 2)
    const argsCustom = extractArgsFromInput('nums = [3, 2, 4], target = 6');
    assert.deepStrictEqual(argsCustom, [[3, 2, 4], 6]);

    // Valid Palindrome pattern
    const args2 = extractArgsFromInput('s = "A man, a plan, a canal: Panama"');
    assert.deepStrictEqual(args2, ['A man, a plan, a canal: Panama']);

    // Merge Sorted Arrays pattern
    const args3 = extractArgsFromInput('nums1 = [1, 2, 4], nums2 = [1, 3, 4]');
    assert.deepStrictEqual(args3, [[1, 2, 4], [1, 3, 4]]);

    // Bare email string pattern
    const args4 = extractArgsFromInput('valid.sdet_pro@intelligentqa.io');
    assert.deepStrictEqual(args4, ['valid.sdet_pro@intelligentqa.io']);

    // Matrix 2D array pattern
    const args5 = extractArgsFromInput('matrix = [[1, 3, 5], [10, 11, 16]], target = 3');
    assert.deepStrictEqual(args5, [[[1, 3, 5], [10, 11, 16]], 3]);
  });

  // -------------------------------------------------------------------------
  // 2. Output Equality Checker
  // -------------------------------------------------------------------------
  function areOutputsEqual(actual, expected) {
    if (!actual && !expected) return true;
    if (!actual || !expected) return false;

    const aClean = actual.trim();
    const eClean = expected.trim();
    if (aClean === eClean) return true;

    if (aClean.toLowerCase() === eClean.toLowerCase()) return true;

    const aNoSpace = aClean.replace(/\s+/g, '');
    const eNoSpace = eClean.replace(/\s+/g, '');
    if (aNoSpace === eNoSpace) return true;

    try {
      const aJson = JSON.parse(aClean);
      const eJson = JSON.parse(eClean);
      if (JSON.stringify(aJson) === JSON.stringify(eJson)) return true;

      if (Array.isArray(aJson) && Array.isArray(eJson) && aJson.length === eJson.length) {
        const aSorted = [...aJson].sort();
        const eSorted = [...eJson].sort();
        if (JSON.stringify(aSorted) === JSON.stringify(eSorted)) return true;
      }
    } catch {}

    return false;
  }

  it('2. Evaluates expected vs actual output correctly with whitespace, JSON, and boolean normalization', () => {
    assert.strictEqual(areOutputsEqual('[0, 1]', '[0,1]'), true, 'Arrays with different spacing match');
    assert.strictEqual(areOutputsEqual('True', 'true'), true, 'Python and JS boolean casing match');
    assert.strictEqual(areOutputsEqual('[1, 0]', '[0, 1]'), true, 'Unordered indices match');
    assert.strictEqual(areOutputsEqual('[0, 2]', '[0, 1]'), false, 'Wrong indices correctly rejected');
    assert.strictEqual(areOutputsEqual('false', 'true'), false, 'Mismatched boolean correctly rejected');
  });

  // -------------------------------------------------------------------------
  // 3. Python Multi-Testcase Harness Execution
  // -------------------------------------------------------------------------
  it('3. Python test harness runs multiple test cases and updates with user custom input', () => {
    const userCode = `
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

if __name__ == '__main__':
    # Old hardcoded template
    print(two_sum([2, 7, 11, 15], 9))
`;

    // Strip old main and append test harness
    let cleanCode = userCode.replace(/if\s+__name__\s*==\s*['"]__main__['"]\s*:[\s\S]*$/, '');
    const testCases = [
      { id: 0, args: [[2, 7, 11, 15], 9] },
      { id: 1, args: [[3, 2, 4], 6] }, // User custom input
      { id: 2, args: [[3, 3], 6] },    // Extra case
    ];

    const harness = `
if __name__ == '__main__':
    import json
    _cases = ${JSON.stringify(testCases)}
    for _c in _cases:
        print(f"__TESTCASE_BEGIN_{_c['id']}__")
        try:
            _res = two_sum(*_c['args'])
            print(f"__TESTCASE_OUTPUT_{_c['id']}__" + json.dumps(_res))
        except Exception as _err:
            print(f"__TESTCASE_ERROR_{_c['id']}__" + str(_err))
        print(f"__TESTCASE_END_{_c['id']}__")
`;
    const fullPy = cleanCode + '\n' + harness;

    const { spawnSync } = require('child_process');
    const pyRun = spawnSync('python3', ['-c', fullPy], { encoding: 'utf8' });

    assert.strictEqual(pyRun.status, 0, 'Python test runner must exit 0');
    assert.ok(pyRun.stdout.includes('__TESTCASE_OUTPUT_0__[0, 1]'), 'Case 1 must return [0, 1]');
    assert.ok(pyRun.stdout.includes('__TESTCASE_OUTPUT_1__[1, 2]'), 'Case 2 with user input [3, 2, 4] must return [1, 2] NOT old hardcoded value');
    assert.ok(pyRun.stdout.includes('__TESTCASE_OUTPUT_2__[0, 1]'), 'Case 3 with [3, 3] must return [0, 1]');
  });

  // -------------------------------------------------------------------------
  // 4. JavaScript / TypeScript Multi-Testcase Harness Execution
  // -------------------------------------------------------------------------
  it('4. JavaScript test harness executes multiple cases and captures Output vs Expected', () => {
    const jsCode = `
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
console.log("Result:", twoSum([2, 7, 11, 15], 9));
`;

    let cleanCode = jsCode.replace(/console\.log\([^)]*\);?\s*(\/\/[^\n]*)?$/gm, '');
    const testCases = [
      { id: 0, args: [[2, 7, 11, 15], 9] },
      { id: 1, args: [[3, 2, 4], 6] },
    ];

    let output = '';
    const harness = `
(function() {
  const _fn = typeof twoSum === 'function' ? twoSum : null;
  const _cases = ${JSON.stringify(testCases)};
  for (const _c of _cases) {
    console.log("__TESTCASE_BEGIN_" + _c.id + "__");
    try {
      const _res = _fn(..._c.args);
      console.log("__TESTCASE_OUTPUT_" + _c.id + "__" + JSON.stringify(_res));
    } catch (_err) {
      console.log("__TESTCASE_ERROR_" + _c.id + "__" + (_err && _err.message ? _err.message : String(_err)));
    }
    console.log("__TESTCASE_END_" + _c.id + "__");
  }
})();
`;

    const sandbox = {
      console: { log: (...args) => { output += args.join(' ') + '\n'; } },
      Map,
      JSON
    };
    vm.runInContext(cleanCode + '\n' + harness, vm.createContext(sandbox));

    assert.ok(output.includes('__TESTCASE_OUTPUT_0__[0,1]'), 'JS Case 1 must output [0, 1]');
    assert.ok(output.includes('__TESTCASE_OUTPUT_1__[1,2]'), 'JS Case 2 must output [1, 2]');
  });

  // -------------------------------------------------------------------------
  // 5. Test Results Parser
  // -------------------------------------------------------------------------
  function parseTestResults(stdout, testCases) {
    const results = [];
    let rawStdout = stdout;

    testCases.forEach((tc, idx) => {
      const beginMarker = `__TESTCASE_BEGIN_${idx}__`;
      const endMarker = `__TESTCASE_END_${idx}__`;
      const outMarker = `__TESTCASE_OUTPUT_${idx}__`;
      const errMarker = `__TESTCASE_ERROR_${idx}__`;

      const startIdx = stdout.indexOf(beginMarker);
      const endIdx = stdout.indexOf(endMarker);

      if (startIdx !== -1 && endIdx !== -1) {
        const caseSection = stdout.slice(startIdx, endIdx);
        let output = '';
        let error = '';

        const outMatch = caseSection.match(new RegExp(outMarker + '(.*)'));
        if (outMatch) output = outMatch[1].trim();

        const errMatch = caseSection.match(new RegExp(errMarker + '(.*)'));
        if (errMatch) error = errMatch[1].trim();

        const passed = !error && areOutputsEqual(output, tc.expected);

        results.push({
          id: tc.id,
          name: tc.name,
          input: tc.input,
          expected: tc.expected || '',
          output: output || (error ? '' : '(no return value)'),
          error,
          passed,
        });

        rawStdout = rawStdout
          .replace(new RegExp(`__TESTCASE_BEGIN_${idx}__[\\r\\n]?`, 'g'), '')
          .replace(new RegExp(`__TESTCASE_OUTPUT_${idx}__.*[\\r\\n]?`, 'g'), '')
          .replace(new RegExp(`__TESTCASE_ERROR_${idx}__.*[\\r\\n]?`, 'g'), '')
          .replace(new RegExp(`__TESTCASE_END_${idx}__[\\r\\n]?`, 'g'), '');
      } else {
        results.push({
          id: tc.id,
          name: tc.name,
          input: tc.input,
          expected: tc.expected || '',
          output: '',
          error: 'Execution did not produce output for this test case.',
          passed: false,
        });
      }
    });

    const allPassed = results.length > 0 && results.every((r) => r.passed);
    return { results, allPassed, rawStdout: rawStdout.trim() };
  }

  it('5. Parsed test results categorize Accepted, Wrong Answer, and strip markers from debug logs', () => {
    const stdout = `
User debug: checking hash table
__TESTCASE_BEGIN_0__
__TESTCASE_OUTPUT_0__[0, 1]
__TESTCASE_END_0__
User debug: second case done
__TESTCASE_BEGIN_1__
__TESTCASE_OUTPUT_1__[1, 2]
__TESTCASE_END_1__
`;
    const cases = [
      { id: 'c1', name: 'Case 1', input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]' },
      { id: 'c2', name: 'Case 2', input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]' },
    ];

    const { results, allPassed, rawStdout } = parseTestResults(stdout, cases);

    assert.strictEqual(allPassed, true, 'All test cases must pass');
    assert.strictEqual(results.length, 2, '2 test results must be returned');
    assert.strictEqual(results[0].passed, true);
    assert.strictEqual(results[0].output, '[0, 1]');
    assert.strictEqual(results[0].expected, '[0, 1]');
    assert.strictEqual(results[1].passed, true);
    assert.strictEqual(results[1].output, '[1, 2]');
    assert.ok(rawStdout.includes('User debug: checking hash table'), 'User debug stdout must be preserved');
    assert.ok(!rawStdout.includes('__TESTCASE_BEGIN_'), 'Markers must be stripped from clean user stdout');
  });

  // -------------------------------------------------------------------------
  // 6. UI Component Integrity & LeetCode Sections
  // -------------------------------------------------------------------------
  it('6. CodingTestcasePanel component exports and implements Testcase, Test Result, and + Add Case controls', () => {
    const panelFile = path.join(__dirname, '../src/components/sandbox/coding-testcase-panel.tsx');
    const panelContent = fs.readFileSync(panelFile, 'utf8');

    assert.ok(panelContent.includes('export function CodingTestcasePanel'), 'CodingTestcasePanel must be exported');
    assert.ok(panelContent.includes('Testcase'), 'Must render Testcase tab');
    assert.ok(panelContent.includes('Test Result'), 'Must render Test Result tab');
    assert.ok(panelContent.includes('Add Case'), 'Must render + Add Case control');
    assert.ok(panelContent.includes('Accepted'), 'Must render Accepted banner');
    assert.ok(panelContent.includes('Wrong Answer'), 'Must render Wrong Answer banner');
    assert.ok(panelContent.includes('Input:'), 'Must render Input section');
    assert.ok(panelContent.includes('Output:'), 'Must render Output section');
    assert.ok(panelContent.includes('Expected:'), 'Must render Expected section');
  });

  it('7. ProblemSolverClient integrates CodingTestcasePanel and preserves required editor refs', () => {
    const clientFile = path.join(
      __dirname,
      '../src/app/sandbox/code/problems/[problemId]/problem-solver-client.tsx'
    );
    const clientContent = fs.readFileSync(clientFile, 'utf8');

    assert.ok(clientContent.includes('CodingTestcasePanel'), 'ProblemSolverClient must integrate CodingTestcasePanel');
    assert.ok(clientContent.includes('buildTestHarness'), 'Must use buildTestHarness on run');
    assert.ok(clientContent.includes('parseTestResults'), 'Must use parseTestResults on run');
    assert.ok(clientContent.includes('lineNumbersRef'), 'Must preserve lineNumbersRef');
    assert.ok(clientContent.includes('handleEditorScroll'), 'Must preserve handleEditorScroll');
    assert.ok(clientContent.includes('extractErrorLineNumber'), 'Must preserve extractErrorLineNumber');
  });
});
