const { test, describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const createJiti = require('jiti');

const jiti = createJiti(process.cwd());
const { DEFAULT_CODING_PROBLEMS } = jiti('./src/lib/coding-problems.ts');
const {
  detectFunctionName,
  extractArgsFromInput,
  areOutputsEqual,
  buildTestHarness,
  parseTestResults,
} = jiti('./src/lib/coding-test-runner.ts');
const { POST } = jiti('./src/app/api/sandbox/compiler/route.ts');

describe('Coding Library Solutions & Group Anagrams Verification', () => {
  it('1. User Group Anagrams Java solution runs and passes LeetCode testcase evaluation', async () => {
    const userCode = `public class Main {
    // Problem: Group Anagrams
    public static List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String sortedKey = new String(chars);
            map.computeIfAbsent(sortedKey, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }

    public static void main(String[] args) {
        String[] strs = {"eat", "tea", "tan", "ate", "nat", "bat"};
        System.out.println("Grouped Anagrams: " + groupAnagrams(strs));
    }
}`;

    const testCases = [
      {
        id: 1,
        input: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]',
        expected: '[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]',
      },
    ];

    const fnName = detectFunctionName(userCode, 'java');
    assert.strictEqual(fnName, 'groupAnagrams');

    const harness = buildTestHarness(userCode, 'java', fnName, testCases);

    const req = {
      headers: { get: () => null },
      json: async () => ({ language: 'java', code: harness }),
    };

    const res = await POST(req);
    const data = JSON.parse(await res.text());

    assert.strictEqual(
      data.success,
      true,
      'Java code executed successfully without runtime/compile errors'
    );
    const parsed = parseTestResults(data.stdout || '', testCases);
    assert.strictEqual(parsed.allPassed, true, 'Group Anagrams test cases passed Accepted verdict');
    assert.strictEqual(parsed.results[0].passed, true);
  });

  it('2. areOutputsEqual handles 2D unordered group equivalence (Group Anagrams, 3Sum)', () => {
    const actual = '[[eat, tea, ate], [bat], [tan, nat]]';
    const expected = '[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]';

    assert.strictEqual(
      areOutputsEqual(actual, expected),
      true,
      'Lenient Java unquoted 2D collections match expected JSON groups'
    );

    const actualJson = '[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]';
    assert.strictEqual(
      areOutputsEqual(actualJson, expected),
      true,
      'Permuted JSON anagram groups evaluate to true regardless of group or inner item order'
    );
  });

  it('3. areOutputsEqual handles empty strings correctly without falsy rejection', () => {
    assert.strictEqual(areOutputsEqual('', '""'), true);
    assert.strictEqual(areOutputsEqual('""', '""'), true);
    assert.strictEqual(areOutputsEqual('', ''), true);
    assert.strictEqual(areOutputsEqual('fl', '"fl"'), true);
    assert.strictEqual(areOutputsEqual('32', '32.0'), true);
  });

  it('4. Library contains expanded suite of 30 problems across Easy, Medium, and Hard', () => {
    assert.strictEqual(DEFAULT_CODING_PROBLEMS.length, 30, 'Contains 30 total problems');

    const easy = DEFAULT_CODING_PROBLEMS.filter((p) => p.difficulty === 'Easy');
    const medium = DEFAULT_CODING_PROBLEMS.filter((p) => p.difficulty === 'Medium');
    const hard = DEFAULT_CODING_PROBLEMS.filter((p) => p.difficulty === 'Hard');

    assert.ok(easy.length >= 10, 'Rich set of Easy problems');
    assert.ok(medium.length >= 8, 'Rich set of Medium problems');
    assert.ok(hard.length >= 6, 'Rich set of Hard problems');

    // Verify key new additions
    const titles = DEFAULT_CODING_PROBLEMS.map((p) => p.id);
    assert.ok(titles.includes('best-time-to-buy-and-sell-stock'));
    assert.ok(titles.includes('binary-search'));
    assert.ok(titles.includes('maximum-subarray'));
    assert.ok(titles.includes('product-of-array-except-self'));
    assert.ok(titles.includes('longest-substring-without-repeating'));
    assert.ok(titles.includes('three-sum'));
    assert.ok(titles.includes('container-with-most-water'));
    assert.ok(titles.includes('top-k-frequent-elements'));
    assert.ok(titles.includes('merge-k-sorted-lists'));
    assert.ok(titles.includes('median-of-two-sorted-arrays'));
  });

  it('5. Every single problem has valid starter templates for all 5 languages', () => {
    const requiredLangs = ['java', 'python', 'typescript', 'javascript', 'csharp'];
    for (const p of DEFAULT_CODING_PROBLEMS) {
      for (const lang of requiredLangs) {
        const code = p.starterTemplates[lang];
        assert.ok(
          code && code.trim().length > 30,
          `Problem ${p.id} must have complete starter code for ${lang}`
        );
      }
    }
  });

  it('6. All 30 problems pass evaluation in JavaScript', () => {
    for (const p of DEFAULT_CODING_PROBLEMS) {
      const jsCode = p.starterTemplates.javascript;
      const fnName = detectFunctionName(jsCode, 'javascript');
      assert.ok(fnName, `Function name detected for ${p.id}`);

      const fn = new Function(jsCode + `\nreturn ${fnName};`)();
      for (let i = 0; i < p.examples.length; i++) {
        const ex = p.examples[i];
        const args = extractArgsFromInput(ex.input);
        const actual = fn(...args);
        const actualStr = typeof actual === 'object' ? JSON.stringify(actual) : String(actual);
        const ok = areOutputsEqual(actualStr, ex.output);
        assert.ok(
          ok,
          `Problem ${p.id} Example ${i + 1} passed: Actual=${actualStr}, Expected=${ex.output}`
        );
      }
    }
  });
});
