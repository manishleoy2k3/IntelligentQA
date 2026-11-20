import { SupportedLang } from '@/app/sandbox/code/problems/[problemId]/problem-solver-client';
import { CodingProblem } from '@/lib/coding-problems';

export interface TestCaseItem {
  id: string;
  name: string;
  input: string;
  expected?: string;
  isCustom?: boolean;
}

export interface TestCaseResult {
  id: string;
  name: string;
  input: string;
  expected: string;
  output: string;
  stdout?: string;
  error?: string;
  passed: boolean;
}

// Compare actual output with expected output using smart formatting (whitespace & JSON normalization)
export function areOutputsEqual(actual?: string, expected?: string): boolean {
  if (actual === undefined || actual === null || expected === undefined || expected === null) {
    return actual === expected;
  }

  const aClean = actual.trim();
  const eClean = expected.trim();
  if (aClean === eClean) return true;

  // Case-insensitive boolean comparison: "True" == "true"
  if (aClean.toLowerCase() === eClean.toLowerCase()) return true;

  // Quote-insensitive string comparison: "fl" == "\"fl\""
  if (aClean.replace(/^["']|["']$/g, '') === eClean.replace(/^["']|["']$/g, '')) return true;

  // Float & Number tolerance comparison: 32.0 == 32
  const aNum = Number(aClean);
  const eNum = Number(eClean);
  if (!isNaN(aNum) && !isNaN(eNum) && Math.abs(aNum - eNum) < 1e-6) {
    return true;
  }

  // Whitespace-insensitive comparison: "[0, 1]" == "[0,1]"
  const aNoSpace = aClean.replace(/\s+/g, '');
  const eNoSpace = eClean.replace(/\s+/g, '');
  if (aNoSpace === eNoSpace) return true;

  // Deep JSON object/array comparison
  try {
    const aJson = JSON.parse(aClean);
    const eJson = JSON.parse(eClean);
    if (JSON.stringify(aJson) === JSON.stringify(eJson)) return true;

    // Check if 2D array (e.g. Group Anagrams or 3Sum where group order & inner order can be arbitrary)
    if (
      Array.isArray(aJson) &&
      Array.isArray(eJson) &&
      aJson.length === eJson.length &&
      aJson.every((sub) => Array.isArray(sub)) &&
      eJson.every((sub) => Array.isArray(sub))
    ) {
      const sort2D = (arr: any[][]) =>
        arr
          .map((sub) => [...sub].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)))
          .sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
      if (JSON.stringify(sort2D(aJson)) === JSON.stringify(sort2D(eJson))) {
        return true;
      }
    }

    // Numeric/String 1D array sorting for unordered collections (e.g. Two Sum indices or duplicates)
    if (Array.isArray(aJson) && Array.isArray(eJson) && aJson.length === eJson.length) {
      const aSorted = [...aJson].sort();
      const eSorted = [...eJson].sort();
      if (JSON.stringify(aSorted) === JSON.stringify(eSorted)) return true;
    }
  } catch {
    // Lenient 2D unquoted parsing for Java collections: e.g. "[[eat, tea, ate], [bat], [tan, nat]]"
    try {
      const parseLenient2D = (str: string): string[][] | null => {
        if (!str.startsWith('[[') || !str.endsWith(']]')) return null;
        const inner = str.slice(1, -1).trim();
        const groupMatches = inner.match(/\[[^\]]*\]/g);
        if (!groupMatches) return null;
        return groupMatches.map((g) =>
          g
            .slice(1, -1)
            .split(',')
            .map((item) => item.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean)
        );
      };

      const a2D = parseLenient2D(aClean);
      const e2D = eClean.startsWith('[[')
        ? (Array.isArray(JSON.parse(eClean)) ? JSON.parse(eClean) : parseLenient2D(eClean))
        : null;

      if (a2D && e2D && a2D.length === e2D.length) {
        const sort2D = (arr: string[][]) =>
          arr
            .map((sub) => [...sub].sort())
            .sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
        if (JSON.stringify(sort2D(a2D)) === JSON.stringify(sort2D(e2D))) {
          return true;
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  return false;
}

// Extract arguments from input string (e.g. "nums = [2, 7, 11, 15], target = 9" -> [[2, 7, 11, 15], 9])
export function extractArgsFromInput(inputStr: string): any[] {
  if (!inputStr || !inputStr.trim()) return [];

  // Split on variable assignments if present: e.g. "nums = [...], target = 9"
  const varMatches = inputStr.split(/,\s*(?=[a-zA-Z_][a-zA-Z0-9_]*\s*=)/);
  const args: any[] = [];

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

// Auto-detect the solution function name from problem template or user code
export function detectFunctionName(code: string, lang: SupportedLang): string | null {
  if (lang === 'python') {
    const m = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
    if (m && m[1] !== 'main' && !m[1].startsWith('__')) return m[1];
  } else if (lang === 'java') {
    const m = code.match(/public\s+static\s+[a-zA-Z0-9_<>[\]]+\s+([a-zA-Z0-9_]+)\s*\(/);
    if (m && m[1] !== 'main') return m[1];
    const m2 = code.match(/(?:public\s+)?[a-zA-Z0-9_<>[\]]+\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/);
    if (m2 && m2[1] !== 'main' && !['if', 'for', 'while', 'switch'].includes(m2[1])) return m2[1];
  } else if (lang === 'javascript' || lang === 'typescript') {
    const m = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
    if (m && m[1] !== 'main') return m[1];
    const m2 = code.match(/(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/);
    if (m2) return m2[1];
  } else if (lang === 'csharp') {
    const m = code.match(/public\s+static\s+[a-zA-Z0-9_<>[\]]+\s+([a-zA-Z0-9_]+)\s*\(/);
    if (m && m[1] !== 'Main') return m[1];
  }
  return null;
}

function serializeJavaArg(arg: any): string {
  if (Array.isArray(arg)) {
    if (arg.length === 0) return 'new int[]{}';
    if (typeof arg[0] === 'number') return 'new int[]{' + arg.join(', ') + '}';
    if (typeof arg[0] === 'string') return 'new String[]{' + arg.map((s) => JSON.stringify(s)).join(', ') + '}';
    if (Array.isArray(arg[0])) return 'new int[][]{' + arg.map((sub) => 'new int[]{' + sub.join(', ') + '}').join(', ') + '}';
    return 'new Object[]{' + arg.map(serializeJavaArg).join(', ') + '}';
  }
  if (typeof arg === 'string') return JSON.stringify(arg);
  if (typeof arg === 'boolean') return String(arg);
  if (typeof arg === 'number') return String(arg);
  return String(arg);
}

function serializeCSharpArg(arg: any): string {
  if (Array.isArray(arg)) {
    if (arg.length === 0) return 'new int[]{}';
    if (typeof arg[0] === 'number') return 'new int[]{' + arg.join(', ') + '}';
    if (typeof arg[0] === 'string') return 'new string[]{' + arg.map((s) => JSON.stringify(s)).join(', ') + '}';
    return 'new object[]{' + arg.map(serializeCSharpArg).join(', ') + '}';
  }
  if (typeof arg === 'string') return JSON.stringify(arg);
  if (typeof arg === 'boolean') return String(arg);
  if (typeof arg === 'number') return String(arg);
  return String(arg);
}

// Build LeetCode test harness code for any language
export function buildTestHarness(
  userCode: string,
  lang: SupportedLang,
  fnName: string | null,
  testCases: TestCaseItem[]
): string {
  if (!fnName || testCases.length === 0) {
    return userCode;
  }

  // 1. PYTHON
  if (lang === 'python') {
    let cleanCode = userCode.replace(/if\s+__name__\s*==\s*['"]__main__['"]\s*:[\s\S]*$/, '');
    const casesData = testCases.map((tc, idx) => ({
      id: idx,
      args: extractArgsFromInput(tc.input),
    }));

    const harness = `
# --- IntelligentQA LeetCode Test Harness ---
if __name__ == '__main__':
    import json
    _fn = globals().get('${fnName}')
    if not _fn:
        print("__TESTCASE_NO_FN__${fnName}")
    else:
        _cases = ${JSON.stringify(casesData)}
        for _c in _cases:
            print(f"__TESTCASE_BEGIN_{_c['id']}__")
            try:
                _res = _fn(*_c['args'])
                print(f"__TESTCASE_OUTPUT_{_c['id']}__" + json.dumps(_res))
            except Exception as _err:
                print(f"__TESTCASE_ERROR_{_c['id']}__" + str(_err))
            print(f"__TESTCASE_END_{_c['id']}__")
`;
    return cleanCode + '\n' + harness;
  }

  // 2. JAVASCRIPT & TYPESCRIPT
  if (lang === 'javascript' || lang === 'typescript') {
    let cleanCode = userCode.replace(/console\.log\([^)]*\);?\s*(\/\/[^\n]*)?$/gm, '// [stripped template log]');
    const casesData = testCases.map((tc, idx) => ({
      id: idx,
      args: extractArgsFromInput(tc.input),
    }));

    const harness = `
// --- IntelligentQA LeetCode Test Harness ---
(function() {
  const _fn = typeof ${fnName} === 'function' ? ${fnName} : null;
  if (!_fn) {
    console.log("__TESTCASE_NO_FN__${fnName}");
    return;
  }
  const _cases = ${JSON.stringify(casesData)};
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
    return cleanCode + '\n' + harness;
  }

  // 3. JAVA
  if (lang === 'java') {
    let cleanCode = userCode;
    if (!cleanCode.includes('import java.util')) {
      cleanCode = 'import java.util.*;\nimport java.io.*;\nimport java.math.*;\n' + cleanCode;
    }
    let invocations = '';
    testCases.forEach((tc, idx) => {
      const args = extractArgsFromInput(tc.input);
      const serializedArgs = args.map(serializeJavaArg).join(', ');
      invocations += `
        System.out.println("__TESTCASE_BEGIN_${idx}__");
        try {
            Object _res = ${fnName}(${serializedArgs});
            if (_res instanceof int[]) {
                System.out.println("__TESTCASE_OUTPUT_${idx}__" + java.util.Arrays.toString((int[]) _res));
            } else if (_res instanceof Object[]) {
                System.out.println("__TESTCASE_OUTPUT_${idx}__" + java.util.Arrays.deepToString((Object[]) _res));
            } else {
                System.out.println("__TESTCASE_OUTPUT_${idx}__" + String.valueOf(_res));
            }
        } catch (Exception _err) {
            System.out.println("__TESTCASE_ERROR_${idx}__" + _err.getMessage());
        }
        System.out.println("__TESTCASE_END_${idx}__");
      `;
    });

    const customMain = `
    public static void main(String[] args) {
${invocations}
    }
`;
    // Strip existing main method
    let strippedCode = cleanCode.replace(
      /(?:public\s+)?static\s+void\s+main\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}\s*(?=\n\s*\}\s*$|\s*$)/,
      ''
    );
    const lastBraceIdx = strippedCode.lastIndexOf('}');
    if (lastBraceIdx !== -1) {
      return strippedCode.slice(0, lastBraceIdx) + customMain + strippedCode.slice(lastBraceIdx);
    }
    return strippedCode + customMain;
  }

  // 4. CSHARP (.NET)
  if (lang === 'csharp') {
    let invocations = '';
    testCases.forEach((tc, idx) => {
      const args = extractArgsFromInput(tc.input);
      const serializedArgs = args.map(serializeCSharpArg).join(', ');
      invocations += `
        Console.WriteLine("__TESTCASE_BEGIN_${idx}__");
        try {
            var _res = ${fnName}(${serializedArgs});
            if (_res is int[] _arr) {
                Console.WriteLine("__TESTCASE_OUTPUT_${idx}__[" + string.Join(", ", _arr) + "]");
            } else {
                Console.WriteLine("__TESTCASE_OUTPUT_${idx}__" + _res);
            }
        } catch (Exception _err) {
            Console.WriteLine("__TESTCASE_ERROR_${idx}__" + _err.Message);
        }
        Console.WriteLine("__TESTCASE_END_${idx}__");
      `;
    });

    const customMain = `
    public static void Main() {
${invocations}
    }
`;
    let strippedCode = userCode.replace(
      /(?:public\s+)?static\s+void\s+Main\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}\s*(?=\n\s*\}\s*$|\s*$)/,
      ''
    );
    const lastBraceIdx = strippedCode.lastIndexOf('}');
    if (lastBraceIdx !== -1) {
      return strippedCode.slice(0, lastBraceIdx) + customMain + strippedCode.slice(lastBraceIdx);
    }
    return strippedCode + customMain;
  }

  return userCode;
}

// Parse structured testcase results from runner stdout
export function parseTestResults(
  stdout: string,
  testCases: TestCaseItem[]
): { results: TestCaseResult[]; allPassed: boolean; rawStdout: string } {
  const results: TestCaseResult[] = [];
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

      // Strip markers from rawStdout for clean user debug logs
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
