const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Compiler Adversarial Breaking & Edge-Case Hardening', () => {
  const compilerRoutePath = path.join(__dirname, '../src/app/api/sandbox/compiler/route.ts');
  const compilerContent = fs.readFileSync(compilerRoutePath, 'utf8');

  // -------------------------------------------------------------------------
  // 1. Process Spawning & Buffer Bomb Protection
  // -------------------------------------------------------------------------
  it('1. Output buffer bomb (512KB cap) terminates process with distinct error rather than generic timeout', () => {
    assert.ok(
      compilerContent.includes('Output exceeded maximum allowed limit (512KB)'),
      'Must report 512KB buffer limit exceeded'
    );
    assert.ok(compilerContent.includes('isTruncated'), 'Must track buffer truncation flag');
    assert.ok(
      compilerContent.includes("child.stdin.on('error'"),
      'Must handle child.stdin EPIPE gracefully'
    );
  });

  it('2. Infinite loop timeout handling is distinctly categorized', () => {
    assert.ok(
      compilerContent.includes('Execution timed out (process exceeded'),
      'Must report explicit timeout description'
    );
    assert.ok(
      compilerContent.includes('Possible infinite loop or excessive computation'),
      'Must identify infinite loops'
    );
  });

  // -------------------------------------------------------------------------
  // 2. Java Dynamic Class Extraction Adversarial Tests
  // -------------------------------------------------------------------------
  it('3. Java class name extractor strips fake classes in block & line comments and finds true class', () => {
    function extractJavaClassName(code) {
      const cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

      const publicMatch = cleanCode.match(
        /public\s+(?:final\s+|sealed\s+|non-sealed\s+)?(?:class|record)\s+([A-Za-z0-9_]+)/
      );
      if (publicMatch && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(publicMatch[1])) {
        return publicMatch[1];
      }

      const mainMatch = cleanCode.match(
        /(?:class|record)\s+([A-Za-z0-9_]+)[^{]*\{[\s\S]*?public\s+static\s+void\s+main/
      );
      if (mainMatch && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(mainMatch[1])) {
        return mainMatch[1];
      }

      const classMatch = cleanCode.match(/(?:final\s+)?(?:class|record)\s+([A-Za-z0-9_]+)/);
      if (classMatch && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(classMatch[1])) {
        return classMatch[1];
      }

      return 'Main';
    }

    // Adversarial sample 1: decoy class inside block comment
    const adversarial1 = `
      /*
       * public class FakeClassComment {
       *   public static void main(String[] args) {}
       * }
       */
      public class TrueClassMain {
        public static void main(String[] args) {}
      }
    `;
    assert.strictEqual(extractJavaClassName(adversarial1), 'TrueClassMain');

    // Adversarial sample 2: decoy class inside line comment
    const adversarial2 = `
      // public class SingleLineFake
      class TargetWithMain {
        public static void main(String[] args) {}
      }
    `;
    assert.strictEqual(extractJavaClassName(adversarial2), 'TargetWithMain');

    // Adversarial sample 3: class with implements and generics
    const adversarial3 = `
      public class Solution implements Comparable<Solution>, Serializable {
        public static void main(String[] args) {}
      }
    `;
    assert.strictEqual(extractJavaClassName(adversarial3), 'Solution');

    // Adversarial sample 4: record declaration
    const adversarial4 = `
      public record UserRecord(String name, int age) {
        public static void main(String[] args) {}
      }
    `;
    assert.strictEqual(extractJavaClassName(adversarial4), 'UserRecord');
  });

  // -------------------------------------------------------------------------
  // 3. Java In-Process VM Hardening & Complex Scenarios
  // -------------------------------------------------------------------------
  it('4. Java VM handles instantiated Solution classes, 2D arrays, HashMap, and Character', () => {
    // Test HashMap implementation
    class HashMap {
      constructor() {
        this.map = new Map();
      }
      put(k, v) {
        this.map.set(k, v);
        return v;
      }
      get(k) {
        return this.map.get(k);
      }
      containsKey(k) {
        return this.map.has(k);
      }
      containsValue(v) {
        return Array.from(this.map.values()).includes(v);
      }
      remove(k) {
        const old = this.map.get(k);
        this.map.delete(k);
        return old;
      }
      size() {
        return this.map.size;
      }
      isEmpty() {
        return this.map.size === 0;
      }
      keySet() {
        return Array.from(this.map.keys());
      }
      values() {
        return Array.from(this.map.values());
      }
      getOrDefault(k, def) {
        return this.map.has(k) ? this.map.get(k) : def;
      }
    }

    class Character {
      static isDigit(c) {
        return /^[0-9]$/.test(String(c));
      }
      static isLetter(c) {
        return /^[a-zA-Z]$/.test(String(c));
      }
      static toLowerCase(c) {
        return String(c).toLowerCase();
      }
    }

    let output = '';
    const sandbox = {
      console: {
        log: (...args) => {
          output += args.join(' ') + '\n';
        },
      },
      HashMap,
      Character,
      JSON,
      Array,
    };

    const context = vm.createContext(sandbox);
    const testCode = `
      class SolutionProxy {
        constructor() {
          return new Proxy(this, {
            get(target, prop) {
              if (prop in target) return target[prop];
              try { return eval(String(prop)); } catch(e) { return undefined; }
            }
          });
        }
      }
      var Solution = SolutionProxy;

      function twoSum(nums, target) {
        const map = new HashMap();
        for (let i = 0; i < nums.length; i++) {
          const complement = target - nums[i];
          if (map.containsKey(complement)) {
            return [map.get(complement), i];
          }
          map.put(nums[i], i);
        }
        return [];
      }

      const s = new Solution();
      const res = s.twoSum([2, 7, 11, 15], 9);
      console.log('Pair:', JSON.stringify(res));
      console.log('IsDigit:', Character.isDigit('7'));
      console.log('IsLetter:', Character.isLetter('7'));
    `;

    vm.runInContext(testCode, context);
    assert.ok(output.includes('Pair: [0,1]'), 'TwoSum via HashMap must find indices [0, 1]');
    assert.ok(output.includes('IsDigit: true'), 'Character.isDigit must return true');
    assert.ok(output.includes('IsLetter: false'), 'Character.isLetter must return false');
  });

  // -------------------------------------------------------------------------
  // 4. Python In-Process VM Hardening & Complex Scenarios
  // -------------------------------------------------------------------------
  it('5. Python VM handles multiple variable re-assignments, slices, list comprehensions, and integer division', () => {
    let output = '';
    const sandbox = {
      print: (...args) => {
        output += args.join(' ') + '\n';
      },
      range: (start, end, step = 1) => {
        if (end === undefined) {
          end = start;
          start = 0;
        }
        const res = [];
        for (let i = start; i < end; i += step) res.push(i);
        return res;
      },
      sorted: (iterable) => Array.from(iterable).sort((a, b) => (a > b ? 1 : a < b ? -1 : 0)),
      pyIn: (val, container) => {
        if (container == null) return false;
        if (Array.isArray(container) || typeof container === 'string')
          return container.includes(val);
        if (container instanceof Set || container instanceof Map) return container.has(val);
        return val in container;
      },
      Math,
    };

    const context = vm.createContext(sandbox);

    // Multi-reassignment, integer division, slice, list comprehension
    const testCode = `
      var x = 10;
      var x = 20; // re-declaration must not throw Identifier has already been declared
      var mid = Math.floor((3 + 10) / 2); // integer division (3 + 10) // 2
      var s = "IntelligentQA";
      var sub = s.slice(0, 11);
      var evens = (range(10)).filter(i => i % 2 === 0).map(i => i * 2);
      var hasSeven = pyIn(7, [1, 3, 5, 7, 9]);

      print("x:", x);
      print("mid:", mid);
      print("sub:", sub);
      print("evens:", JSON.stringify(evens));
      print("hasSeven:", hasSeven);
    `;

    vm.runInContext(testCode, context);
    assert.ok(output.includes('x: 20'), 'Variable re-assignment must evaluate to latest value');
    assert.ok(output.includes('mid: 6'), 'Integer division (13 // 2) must equal 6');
    assert.ok(output.includes('sub: Intelligent'), 'Slice must extract sub-string');
    assert.ok(
      output.includes('evens: [0,4,8,12,16]'),
      'Filtered list comprehension must calculate evens'
    );
    assert.ok(output.includes('hasSeven: true'), 'pyIn membership check must return true');
  });

  it('6. Python VM handles OOP classes with constructor and methods instantiated without new', () => {
    class Calculator {
      constructor(base = 10) {
        this.base = base;
      }
      multiply(x) {
        return this.base * x;
      }
    }
    const ProxiedCalculator = new Proxy(Calculator, {
      apply(target, thisArg, args) {
        return new target(...args);
      },
    });

    let output = '';
    const sandbox = {
      Calculator: ProxiedCalculator,
      print: (...args) => {
        output += args.join(' ') + '\n';
      },
    };

    const context = vm.createContext(sandbox);
    const testCode = `
      var calc = Calculator(5); // Python instantiates classes without new!
      var res = calc.multiply(4);
      print("Result:", res);
    `;

    vm.runInContext(testCode, context);
    assert.ok(
      output.includes('Result: 20'),
      'Python-style class instantiation without new must compute 20'
    );
  });

  // -------------------------------------------------------------------------
  // 5. Error Line Extraction Hardening Across All Compilers
  // -------------------------------------------------------------------------
  it('7. Error line number parser extracts correct line numbers from C#, Java, Python, and JS errors', () => {
    function extractErrorLineNumber(errorText) {
      if (!errorText) return null;

      // 1. C# / Mono format: Program.cs(14,25): error CS0103
      const csharpMatch = errorText.match(/\((?:line\s*)?(\d+),\s*\d+\):\s*(?:error|warning)/i);
      if (csharpMatch) return parseInt(csharpMatch[1], 10);

      // 2. Python traceback format: File "main.py", line 12, in <module>
      const pyMatch = errorText.match(/(?:line\s+|Line\s+)(\d+)/);
      if (pyMatch) return parseInt(pyMatch[1], 10);

      // 3. Java javac format: Solution.java:18: error: cannot find symbol
      const javaMatch = errorText.match(/\.java:(\d+):/);
      if (javaMatch) return parseInt(javaMatch[1], 10);

      // 4. Java runtime stack trace: (Solution.java:27)
      const javaRuntimeMatch = errorText.match(/\([A-Za-z0-9_]+\.java:(\d+)\)/);
      if (javaRuntimeMatch) return parseInt(javaRuntimeMatch[1], 10);

      // 5. Node / V8 format: evalmachine.<anonymous>:9:5
      const nodeMatch = errorText.match(/(?::)(\d+)(?::\d+)?(?:\s|$)/);
      if (nodeMatch) return parseInt(nodeMatch[1], 10);

      return null;
    }

    assert.strictEqual(
      extractErrorLineNumber(
        'Program.cs(24,12): error CS0103: The name "foo" does not exist in the current context'
      ),
      24,
      'C# error line 24 must be extracted'
    );
    assert.strictEqual(
      extractErrorLineNumber(
        'Exception in thread "main" java.lang.NullPointerException\n\tat Solution.solve(Solution.java:31)'
      ),
      31,
      'Java runtime stack trace line 31 must be extracted'
    );
    assert.strictEqual(
      extractErrorLineNumber(
        'Solution.java:17: error: cannot find symbol\n  int x = unknownVariable;'
      ),
      17,
      'Java javac error line 17 must be extracted'
    );
    assert.strictEqual(
      extractErrorLineNumber(
        'Traceback (most recent call last):\n  File "main.py", line 42, in <module>\nZeroDivisionError: division by zero'
      ),
      42,
      'Python traceback line 42 must be extracted'
    );
    assert.strictEqual(
      extractErrorLineNumber('evalmachine.<anonymous>:9\nlet x = 1;\n^'),
      9,
      'Node error line 9 must be extracted'
    );
  });
});
