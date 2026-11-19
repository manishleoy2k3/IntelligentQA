import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import vm from 'vm';

// Helper to run shell command with spawn, timeout, stdin support, and output capping
function runSubprocess(
  cmd: string,
  args: string[],
  options: { timeout?: number; cwd?: string; stdin?: string; maxBuffer?: number } = {}
): Promise<{ stdout: string; stderr: string; code: number }> {
  const timeoutMs = options.timeout || 6000;
  const maxBytes = options.maxBuffer || 512 * 1024; // 512 KB output cap

  return new Promise((resolve) => {
    try {
      const child = spawn(cmd, args, {
        cwd: options.cwd || process.cwd(),
        timeout: timeoutMs,
      });

      let stdout = '';
      let stderr = '';
      let isTruncated = false;

      if (child.stdin) {
        child.stdin.on('error', () => {
          // Ignore EPIPE if child process exits early
        });
        if (options.stdin) {
          const input = options.stdin.endsWith('\n') ? options.stdin : options.stdin + '\n';
          try {
            child.stdin.write(input);
          } catch {
            // ignore early write error
          }
        }
        try {
          child.stdin.end();
        } catch {
          // ignore
        }
      }

      child.stdout.on('data', (chunk) => {
        if (stdout.length + chunk.length > maxBytes) {
          if (!isTruncated) {
            stdout += chunk.toString().substring(0, Math.max(0, maxBytes - stdout.length));
            stdout += '\n[Output truncated: exceeded 512KB limit]';
            isTruncated = true;
          }
          child.kill();
        } else {
          stdout += chunk.toString();
        }
      });

      child.stderr.on('data', (chunk) => {
        if (stderr.length < maxBytes) {
          stderr += chunk.toString();
        }
      });

      child.on('close', (code, signal) => {
        if (isTruncated) {
          stderr = (stderr ? stderr + '\n' : '') + 'Execution terminated: Output exceeded maximum allowed limit (512KB).';
        } else if (child.killed || signal === 'SIGTERM' || signal === 'SIGKILL') {
          stderr = (stderr ? stderr + '\n' : '') + `Execution timed out (process exceeded ${timeoutMs}ms limit). Possible infinite loop or excessive computation.`;
        }
        resolve({ stdout, stderr, code: code === null ? 1 : code });
      });

      child.on('error', (err) => {
        resolve({ stdout, stderr: err.message, code: 1 });
      });
    } catch (err: any) {
      resolve({ stdout: '', stderr: err.message || 'Execution error', code: 1 });
    }
  });
}

// Check local Java binaries
function getJavaBinaries(): { javac: string; java: string; available: boolean } {
  const candidateDirs = [
    '/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home/bin',
    '/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home/bin',
    '/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home/bin',
    '/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home/bin',
    process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin') : '',
    '/usr/local/bin',
    '/usr/bin',
  ].filter(Boolean);

  for (const dir of candidateDirs) {
    const javacPath = path.join(dir, 'javac');
    const javaPath = path.join(dir, 'java');
    if (fs.existsSync(javacPath) && fs.existsSync(javaPath)) {
      return { javac: javacPath, java: javaPath, available: true };
    }
  }

  return { javac: 'javac', java: 'java', available: false };
}

// Check local Python binary
function getPythonBinary(): { python: string; available: boolean } {
  const candidateDirs = [
    '/usr/bin',
    '/usr/local/bin',
    '/opt/homebrew/bin',
    '/usr/local/python3/bin',
  ];

  for (const dir of candidateDirs) {
    const pyPath = path.join(dir, 'python3');
    if (fs.existsSync(pyPath)) {
      return { python: pyPath, available: true };
    }
  }

  return { python: 'python3', available: false };
}

function extractJavaClassName(code: string): string {
  // Strip block comments and single-line comments so comments do not falsely match
  const cleanCode = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');

  // 1. If there is a public class, JLS mandates the file name must match the public class
  const publicMatch = cleanCode.match(/public\s+(?:final\s+|sealed\s+|non-sealed\s+)?(?:class|record)\s+([A-Za-z0-9_]+)/);
  if (publicMatch && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(publicMatch[1])) {
    return publicMatch[1];
  }

  // 2. Otherwise find the class that declares main method
  const mainMatch = cleanCode.match(/(?:class|record)\s+([A-Za-z0-9_]+)[^{]*\{[\s\S]*?public\s+static\s+void\s+main/);
  if (mainMatch && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(mainMatch[1])) {
    return mainMatch[1];
  }

  // 3. Match any non-abstract class
  const classMatch = cleanCode.match(/(?:final\s+)?(?:class|record)\s+([A-Za-z0-9_]+)/);
  if (classMatch && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(classMatch[1])) {
    return classMatch[1];
  }

  return 'Main';
}

function safeRequire(modName: string) {
  try {
    const dynamicRequire = eval('require');
    return dynamicRequire(modName);
  } catch {
    return null;
  }
}

// Detect container/daemon infrastructure failures from external runners (e.g. catatonit, docker daemon, OCI runtime)
function isInfrastructureError(output?: string): boolean {
  if (!output) return false;
  return (
    output.includes('catatonit') ||
    output.includes('failed to exec pid1') ||
    output.includes('container_linux') ||
    output.includes('runc did not terminate') ||
    output.includes('OCI runtime') ||
    output.includes('docker:') ||
    output.includes('podman:') ||
    output.includes('daemon error') ||
    output.includes('container init failed') ||
    output.includes('fork/exec') ||
    (output.includes('No such file or directory') && output.includes('pid1'))
  );
}

// ---------------------------------------------------------------------------
// CLOUD TIER 1: Wandbox API (Active on Serverless/AWS without Cloudflare blocking)
// ---------------------------------------------------------------------------
async function executeWithWandbox(
  language: string,
  code: string,
  stdin?: string
): Promise<{ stdout: string; stderr: string; code: number } | null> {
  const wandboxCompilers: Record<string, string[]> = {
    java: ['openjdk-head'],
    python: ['cpython-head', 'cpython-3.11.5', 'cpython-3.10.12'],
    py: ['cpython-head', 'cpython-3.11.5', 'cpython-3.10.12'],
    javascript: ['nodejs-head', 'nodejs-20.17.0'],
    js: ['nodejs-head', 'nodejs-20.17.0'],
    typescript: ['typescript-head', 'typescript-5.5.4'],
    ts: ['typescript-head', 'typescript-5.5.4'],
    csharp: ['dotnetcore-head', 'mono-head'],
    'c#': ['dotnetcore-head', 'mono-head'],
    cs: ['dotnetcore-head', 'mono-head'],
  };

  const compilers = wandboxCompilers[language.toLowerCase()];
  if (!compilers || compilers.length === 0) return null;

  for (const compiler of compilers) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          compiler,
          code,
          stdin: stdin || '',
        }),
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const status = parseInt(data.status ?? '0', 10);
        const stdout = data.program_output || '';
        const stderr = data.compiler_error || data.program_error || '';

        if (isInfrastructureError(stderr) || isInfrastructureError(stdout)) {
          continue;
        }

        return {
          stdout,
          stderr,
          code: status !== 0 || data.compiler_error ? (status === 0 ? 1 : status) : 0,
        };
      }
    } catch {
      // try next compiler option
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// CLOUD TIER 2: Judge0 CE Public API (Used globally for CP and code execution)
// ---------------------------------------------------------------------------
async function executeWithJudge0(
  language: string,
  code: string,
  stdin?: string
): Promise<{ stdout: string; stderr: string; code: number } | null> {
  const judge0LangMap: Record<string, number> = {
    python: 71, // Python 3.8.1
    py: 71,
    java: 62, // OpenJDK 13
    javascript: 63, // Node.js 12.14.0
    js: 63,
    typescript: 74, // TypeScript 3.7.4
    ts: 74,
    csharp: 51, // C# Mono 6.6.0
    'c#': 51,
    cs: 51,
  };

  const langId = judge0LangMap[language.toLowerCase()];
  if (!langId) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        source_code: code,
        language_id: langId,
        stdin: stdin || '',
      }),
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const stdout = data.stdout || '';
      const stderr = data.compile_output || data.stderr || '';

      if (isInfrastructureError(stderr) || isInfrastructureError(stdout)) {
        return null;
      }

      const isAccepted = data.status && (data.status.id === 3 || data.status.description === 'Accepted');

      return {
        stdout,
        stderr,
        code: isAccepted ? 0 : 1,
      };
    }
  } catch {
    // fallback
  }

  return null;
}

// ---------------------------------------------------------------------------
// CLOUD TIER 3: Glot.io API (Free open-source execution API)
// ---------------------------------------------------------------------------
async function executeWithGlot(
  language: string,
  code: string,
  stdin?: string
): Promise<{ stdout: string; stderr: string; code: number } | null> {
  const javaClass = extractJavaClassName(code);
  const glotLangMap: Record<string, { lang: string; file: string }> = {
    python: { lang: 'python', file: 'main.py' },
    py: { lang: 'python', file: 'main.py' },
    java: { lang: 'java', file: `${javaClass}.java` },
    javascript: { lang: 'javascript', file: 'main.js' },
    js: { lang: 'javascript', file: 'main.js' },
    typescript: { lang: 'typescript', file: 'main.ts' },
    ts: { lang: 'typescript', file: 'main.ts' },
    csharp: { lang: 'csharp', file: 'main.cs' },
    'c#': { lang: 'csharp', file: 'main.cs' },
    cs: { lang: 'csharp', file: 'main.cs' },
  };

  const target = glotLangMap[language.toLowerCase()];
  if (!target) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(`https://glot.io/api/run/${target.lang}/latest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        files: [{ name: target.file, content: code }],
        stdin: stdin || '',
      }),
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const stdout = data.stdout || '';
      const stderr = data.stderr || data.error || '';

      if (isInfrastructureError(stderr) || isInfrastructureError(stdout)) {
        return null;
      }

      return {
        stdout,
        stderr,
        code: stderr && !stdout ? 1 : 0,
      };
    }
  } catch {
    // fallback
  }

  return null;
}

// ---------------------------------------------------------------------------
// CLOUD TIER 4: Piston Multi-Mirror Engine
// ---------------------------------------------------------------------------
async function executeWithPiston(
  language: string,
  code: string,
  stdin?: string
): Promise<{ stdout: string; stderr: string; code: number } | null> {
  const javaClass = extractJavaClassName(code);
  const pistonLangMap: Record<string, { lang: string; file: string }> = {
    java: { lang: 'java', file: `${javaClass}.java` },
    python: { lang: 'python', file: 'main.py' },
    py: { lang: 'python', file: 'main.py' },
    typescript: { lang: 'typescript', file: 'index.ts' },
    ts: { lang: 'typescript', file: 'index.ts' },
    javascript: { lang: 'javascript', file: 'index.js' },
    js: { lang: 'javascript', file: 'index.js' },
    csharp: { lang: 'csharp', file: 'Program.cs' },
    'c#': { lang: 'csharp', file: 'Program.cs' },
    cs: { lang: 'csharp', file: 'Program.cs' },
  };

  const target = pistonLangMap[language.toLowerCase()];
  if (!target) return null;

  const endpoints = [
    'https://emkc.org/api/v2/piston/execute',
    'https://piston.engineering/api/v2/piston/execute',
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          language: target.lang,
          version: '*',
          files: [{ name: target.file, content: code }],
          stdin: stdin || '',
        }),
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data.compile && data.compile.code !== 0) {
          const compileErr = data.compile.stderr || data.compile.output || 'Compilation failed.';
          if (isInfrastructureError(compileErr)) continue;
          return {
            stdout: data.compile.stdout || '',
            stderr: compileErr,
            code: data.compile.code || 1,
          };
        }
        if (data.run) {
          const runErr = data.run.stderr || '';
          if (isInfrastructureError(runErr)) continue;
          return {
            stdout: data.run.stdout || data.run.output || '',
            stderr: runErr,
            code: data.run.code || 0,
          };
        }
      }
    } catch {
      // try next endpoint
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// CLOUD TIER 5: Gemini AI Execution Simulation
// ---------------------------------------------------------------------------
async function executeWithGemini(
  language: string,
  code: string,
  stdin?: string,
  apiKey?: string
): Promise<{ stdout: string; stderr: string; code: number } | null> {
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const prompt = `You are a deterministic, headless ${language} runtime execution engine and terminal output generator.
Execute the following code deterministically and return ONLY the raw console output that would be printed to stdout/stderr.
Rules:
1. Output ONLY the raw execution output.
2. Do NOT include markdown code blocks (\`\`\`), conversational commentary, or explanations.
3. If the code produces a compilation error or runtime exception, output the exact compiler/runtime error message.
4. If there is no standard output, return empty output.

STDIN:
${stdin || '(none)'}

CODE:
${code}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.0,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const isError =
        rawText.includes('Exception in thread') ||
        rawText.includes('Compilation Error') ||
        rawText.includes('SyntaxError:') ||
        rawText.includes('Traceback (most recent call last)');

      return {
        stdout: isError ? '' : rawText,
        stderr: isError ? rawText : '',
        code: isError ? 1 : 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// IN-PROCESS VM SIMULATORS (Zero network dependency, works 100% on Vercel)
// ---------------------------------------------------------------------------
function simulateJavaInProcess(
  javaCode: string,
  stdin?: string
): { stdout: string; stderr: string; code: number } {
  try {
    const declaredClassName = extractJavaClassName(javaCode);
    let js = javaCode;

    // 1. Strip package and import declarations (including with trailing comments)
    js = js.replace(/^\s*(?:package|import)\s+[^;]+;.*$/gm, '');

    // 2. Convert System.out
    js = js.replace(/System\.out\.println\s*\(/g, 'console.log(');
    js = js.replace(/System\.out\.print\s*\(/g, 'stdoutWrite(');
    js = js.replace(/System\.out\.printf\s*\(/g, 'console.log(formatPrintf(');

    // 3. Arrays initialization
    // 2D nested arrays: {{1, 2}, {3, 4}} -> [[1, 2], [3, 4]]
    js = js.replace(
      /\b(?:int|double|float|long|short|byte|char|boolean|String)\s*\[\s*\]\s*\[\s*\]\s*([A-Za-z0-9_]+)\s*=\s*\{/g,
      'let $1 = ['
    );
    js = js.replace(
      /\b(?:int|double|float|long|short|byte|char|boolean|String)\s*\[\s*\]\s*([A-Za-z0-9_]+)\s*=\s*\{([^}]+)\};/g,
      'let $1 = [$2];'
    );
    js = js.replace(
      /\b(?:int|double|float|long|short|byte)\s*\[\s*\]\s*([A-Za-z0-9_]+)\s*=\s*new\s+[a-zA-Z0-9_]+\s*\[([^\]]+)\];/g,
      'let $1 = new Array($2).fill(0);'
    );
    js = js.replace(
      /\bboolean\s*\[\s*\]\s*([A-Za-z0-9_]+)\s*=\s*new\s+boolean\s*\[([^\]]+)\];/g,
      'let $1 = new Array($2).fill(false);'
    );
    js = js.replace(
      /\bString\s*\[\s*\]\s*([A-Za-z0-9_]+)\s*=\s*new\s+String\s*\[([^\]]+)\];/g,
      'let $1 = new Array($2).fill(null);'
    );
    js = js.replace(
      /\bnew\s+(?:int|double|float|long|short|byte|char|boolean|String)\s*\[\s*\]\s*\{([^}]+)\}/g,
      '[$1]'
    );
    js = js.replace(/new\s+([A-Za-z0-9_]+)\s*<[^>]*>\s*\(/g, 'new $1(');

    // 4. Primitive/Type declarations
    js = js.replace(
      /\b(?:[A-Z][a-zA-Z0-9_<>]*|int|double|float|long|short|byte|char|boolean|var|final\s+[A-Za-z0-9_<>]+)\s+([A-Za-z0-9_]+)\s*(=|;)/g,
      'let $1 $2'
    );

    // 5. String & Collections methods
    js = js.replace(/\.length\(\)/g, '.length');
    js = js.replace(/\.equals\s*\(([^)]+)\)/g, ' === $1');
    js = js.replace(
      /\.equalsIgnoreCase\s*\(([^)]+)\)/g,
      '.toLowerCase() === String($1).toLowerCase()'
    );
    js = js.replace(/\.charAt\s*\(([^)]+)\)/g, '[$1]');
    js = js.replace(/Arrays\.toString\s*\(([^)]+)\)/g, 'JSON.stringify($1)');

    // 6. Enhanced for loop
    js = js.replace(
      /for\s*\(\s*(?:int|double|String|var)\s+([A-Za-z0-9_]+)\s*:\s*([^)]+)\)/g,
      'for (let $1 of $2)'
    );

    // 7. Strip class wrapper opening and trailing closing brace while preserving function braces
    js = js.replace(/(?:public\s+|final\s+|sealed\s+)*class\s+[A-Za-z0-9_]+[^{]*\{/, '// [class wrapper]');
    js = js.replace(/\}\s*$/, '// [class end]');

    // 8. Convert main method: public static void main(...) throws ... { -> function main(args) {
    js = js.replace(/(?:public\s+)?static\s+void\s+main\s*\([^)]*\)(?:\s*throws\s+[A-Za-z0-9_,\s]+)?[^{]*\{/, 'function main(args) {');

    // 9. Convert helper methods: public static int add(int a, int b) -> function add(a, b) {
    js = js.replace(/(?:public\s+|private\s+|protected\s+)?(?:static\s+)?[A-Za-z0-9_<>[\]]+\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)(?:\s*throws\s+[A-Za-z0-9_,\s]+)?[^{]*\{/g, (_m, name, args) => {
      if (['if', 'for', 'while', 'switch', 'catch'].includes(name)) return _m;
      const cleanArgs = args.split(',').map((a: string) => a.trim().split(/\s+/).pop()).filter(Boolean).join(', ');
      return `function ${name}(${cleanArgs}) {`;
    });

    js += '\nif (typeof main === "function") { main([]); }\n';

    let output = '';
    const stdinTokens = (stdin || '').trim().split(/\s+/).filter(Boolean);
    let tokenIdx = 0;

    class Scanner {
      next() {
        return tokenIdx < stdinTokens.length ? stdinTokens[tokenIdx++] : '';
      }
      nextInt() {
        return parseInt(this.next(), 10) || 0;
      }
      nextDouble() {
        return parseFloat(this.next()) || 0;
      }
      nextLine() {
        return stdin || '';
      }
      hasNext() {
        return tokenIdx < stdinTokens.length;
      }
      hasNextInt() {
        return this.hasNext() && !isNaN(parseInt(stdinTokens[tokenIdx], 10));
      }
      hasNextLine() {
        return tokenIdx < stdinTokens.length || (tokenIdx === 0 && Boolean(stdin));
      }
      hasNextDouble() {
        return this.hasNext() && !isNaN(parseFloat(stdinTokens[tokenIdx]));
      }
    }

    class ArrayList extends Array {
      add(x: any) {
        this.push(x);
        return true;
      }
      get(i: number) {
        return this[i];
      }
      set(i: number, x: any) {
        const old = this[i];
        this[i] = x;
        return old;
      }
      remove(i: number) {
        return typeof i === 'number' ? this.splice(i, 1)[0] : false;
      }
      size() {
        return this.length;
      }
      isEmpty() {
        return this.length === 0;
      }
      contains(x: any) {
        return this.includes(x);
      }
      clear() {
        this.length = 0;
      }
    }

    class HashMap {
      private map = new Map<any, any>();
      put(k: any, v: any) {
        this.map.set(k, v);
        return v;
      }
      get(k: any) {
        return this.map.get(k);
      }
      containsKey(k: any) {
        return this.map.has(k);
      }
      containsValue(v: any) {
        return Array.from(this.map.values()).includes(v);
      }
      remove(k: any) {
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
      getOrDefault(k: any, def: any) {
        return this.map.has(k) ? this.map.get(k) : def;
      }
    }

    class HashSet {
      private set = new Set<any>();
      add(x: any) {
        this.set.add(x);
        return true;
      }
      contains(x: any) {
        return this.set.has(x);
      }
      remove(x: any) {
        return this.set.delete(x);
      }
      size() {
        return this.set.size;
      }
      isEmpty() {
        return this.set.size === 0;
      }
    }

    class LinkedList extends ArrayList {
      addFirst(x: any) {
        this.unshift(x);
      }
      addLast(x: any) {
        this.push(x);
      }
      removeFirst() {
        return this.shift();
      }
      removeLast() {
        return this.pop();
      }
      peek() {
        return this[0];
      }
      poll() {
        return this.shift();
      }
    }

    class Stack extends ArrayList {
      push(x: any) {
        super.add(x);
        return x;
      }
      pop() {
        return Array.prototype.pop.call(this);
      }
      peek() {
        return this[this.length - 1];
      }
      empty() {
        return this.length === 0;
      }
    }

    class StringBuilder {
      private str = '';
      constructor(init = '') {
        this.str = String(init);
      }
      append(val: any) {
        this.str += String(val);
        return this;
      }
      insert(offset: number, val: any) {
        this.str = this.str.slice(0, offset) + String(val) + this.str.slice(offset);
        return this;
      }
      delete(start: number, end: number) {
        this.str = this.str.slice(0, start) + this.str.slice(end);
        return this;
      }
      reverse() {
        this.str = this.str.split('').reverse().join('');
        return this;
      }
      length() {
        return this.str.length;
      }
      charAt(i: number) {
        return this.str[i];
      }
      toString() {
        return this.str;
      }
    }

    class ListNode {
      val: any;
      next: any;
      constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
      }
    }

    class TreeNode {
      val: any;
      left: any;
      right: any;
      constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
      }
    }

    const sandbox: Record<string, any> = {
      console: {
        log: (...args: any[]) => {
          output += args.map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a))).join(' ') + '\n';
        },
        error: (...args: any[]) => {
          output += args.join(' ') + '\n';
        },
      },
      stdoutWrite: (val: any) => {
        output += String(val);
      },
      formatPrintf: (fmt: any, ...args: any[]) => {
        let i = 0;
        let formatted = String(fmt).replace(/%n/g, '\n');
        formatted = formatted.replace(/%(?:\.([0-9]+))?([sdfb])/g, (_m, prec, type) => {
          const val = args[i++];
          if (prec && type === 'f') {
            return Number(val).toFixed(parseInt(prec, 10));
          }
          return val !== undefined ? String(val) : '';
        });
        return formatted;
      },
      Integer: {
        parseInt: (s: any, r = 10) => parseInt(s, r),
        valueOf: (s: any) => parseInt(s, 10),
        max: Math.max,
        min: Math.min,
        MAX_VALUE: 2147483647,
        MIN_VALUE: -2147483648,
      },
      Double: {
        parseDouble: (s: any) => parseFloat(s),
        valueOf: (s: any) => parseFloat(s),
        max: Math.max,
        min: Math.min,
        MAX_VALUE: Number.MAX_VALUE,
        MIN_VALUE: Number.MIN_VALUE,
      },
      Boolean: {
        parseBoolean: (s: any) => String(s).toLowerCase() === 'true',
        valueOf: (s: any) => String(s).toLowerCase() === 'true',
        TRUE: true,
        FALSE: false,
      },
      Character: {
        isDigit: (c: any) => /^[0-9]$/.test(String(c)),
        isLetter: (c: any) => /^[a-zA-Z]$/.test(String(c)),
        isLetterOrDigit: (c: any) => /^[a-zA-Z0-9]$/.test(String(c)),
        isWhitespace: (c: any) => /^\s$/.test(String(c)),
        toLowerCase: (c: any) => String(c).toLowerCase(),
        toUpperCase: (c: any) => String(c).toUpperCase(),
        isLowerCase: (c: any) => /^[a-z]$/.test(String(c)),
        isUpperCase: (c: any) => /^[A-Z]$/.test(String(c)),
      },
      Arrays: {
        sort: (arr: any[]) => {
          if (Array.isArray(arr)) arr.sort((a, b) => a - b);
        },
        toString: (arr: any) => JSON.stringify(arr),
        fill: (arr: any[], val: any) => {
          if (Array.isArray(arr)) arr.fill(val);
        },
        equals: (a: any[], b: any[]) => JSON.stringify(a) === JSON.stringify(b),
        asList: (...items: any[]) => items,
      },
      Collections: {
        sort: (list: any[]) => {
          if (Array.isArray(list)) list.sort((a, b) => a - b);
        },
        reverse: (list: any[]) => {
          if (Array.isArray(list)) list.reverse();
        },
        max: (coll: any[]) => Math.max(...coll),
        min: (coll: any[]) => Math.min(...coll),
        swap: (list: any[], i: number, j: number) => {
          const tmp = list[i];
          list[i] = list[j];
          list[j] = tmp;
        },
      },
      Scanner,
      ArrayList,
      HashMap,
      Map: HashMap,
      HashSet,
      Set: HashSet,
      LinkedList,
      Stack,
      Queue: LinkedList,
      StringBuilder,
      StringBuffer: StringBuilder,
      ListNode,
      TreeNode,
      System: { in: {} },
      Math,
      JSON,
      String,
      Number,
      Array,
    };

    const javaPrelude = `
      class SolutionProxy {
        constructor() {
          return new Proxy(this, {
            get(target, prop) {
              if (prop in target) return target[prop];
              try {
                return eval(String(prop));
              } catch (e) {
                return undefined;
              }
            },
            set(target, prop, val) {
              target[prop] = val;
              return true;
            }
          });
        }
      }
      var Solution = SolutionProxy;
      var Main = SolutionProxy;
      var ${declaredClassName} = SolutionProxy;
    `;

    const context = vm.createContext(sandbox);
    vm.runInContext(javaPrelude + '\n' + js, context, { timeout: 2500 });
    return { stdout: output, stderr: '', code: 0 };
  } catch (err: any) {
    return { stdout: '', stderr: err.message || 'Simulation error', code: 1 };
  }
}

// In-process Python Transpiler & Virtual Sandbox
function simulatePythonInProcess(
  pythonCode: string,
  stdin?: string
): { stdout: string; stderr: string; code: number } {
  try {
    const lines = pythonCode.split(/\r?\n/);
    const jsLines: string[] = [];
    const indentStack = [0];
    let currentClass: string | null = null;
    let classIndent = 0;

    for (let rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        jsLines.push(trimmed.startsWith('#') ? `// ${trimmed.slice(1)}` : '');
        continue;
      }

      if (trimmed === 'pass') {
        jsLines.push('// pass');
        continue;
      }

      // Handle standard python module imports by converting to comment
      if (trimmed.match(/^(?:import\s+[a-zA-Z0-9_, ]+|from\s+[a-zA-Z0-9_.]+\s+import\s+.*)$/)) {
        jsLines.push(`// ${trimmed}`);
        continue;
      }

      const indent = (rawLine.match(/^(\s*)/)?.[1] || '').length;

      while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
        const popped = indentStack.pop();
        jsLines.push('}'.padStart(indentStack[indentStack.length - 1] + 1, ' '));
        if (currentClass && popped === classIndent + 4) {
          jsLines.push(`${currentClass} = new Proxy(${currentClass}, { apply(t, th, args) { return new t(...args); } });`);
          currentClass = null;
        }
      }

      let line = trimmed;

      // Handle class definitions
      if (line.match(/^class\s+([A-Za-z0-9_]+)(?:\(([^)]*)\))?\s*:/)) {
        const classMatch = line.match(/^class\s+([A-Za-z0-9_]+)(?:\(([^)]*)\))?\s*:/);
        currentClass = classMatch?.[1] || null;
        const baseClass = classMatch?.[2]?.trim();
        classIndent = indent;
        indentStack.push(indent + 4);
        jsLines.push(' '.repeat(indent) + (baseClass ? `class ${currentClass} extends ${baseClass} {` : `class ${currentClass} {`));
        continue;
      }

      // Convert f-strings: f"Average score: {average:.1f}"
      line = line.replace(/f"([^"]*)"/g, (_m, content) => {
        const converted = content.replace(/\{([^}:]+)(?::\.([0-9]+)f)?\}/g, (_fm: string, expr: string, precision?: string) => {
          if (precision) {
            return `\${Number(${expr.trim()}).toFixed(${precision})}`;
          }
          return `\${${expr.trim()}}`;
        });
        return `\`${converted}\``;
      });

      line = line.replace(/f'([^']*)'/g, (_m, content) => {
        const converted = content.replace(/\{([^}:]+)(?::\.([0-9]+)f)?\}/g, (_fm: string, expr: string, precision?: string) => {
          if (precision) {
            return `\${Number(${expr.trim()}).toFixed(${precision})}`;
          }
          return `\${${expr.trim()}}`;
        });
        return `\`${converted}\``;
      });

      // Python slices: s[:2] -> s.slice(0, 2), s[1:] -> s.slice(1), s[1:3] -> s.slice(1, 3)
      line = line.replace(/([a-zA-Z0-9_]+)\[\s*:\s*([^\]]+)\]/g, '$1.slice(0, $2)');
      line = line.replace(/([a-zA-Z0-9_]+)\[\s*([0-9a-zA-Z_]+)\s*:\s*\]/g, '$1.slice($2)');
      line = line.replace(/([a-zA-Z0-9_]+)\[\s*([0-9a-zA-Z_]+)\s*:\s*([^\]]+)\]/g, '$1.slice($2, $3)');

      // List comprehensions
      line = line.replace(
        /\[\s*([\s\S]+?)\s+for\s+([a-zA-Z0-9_]+)\s+in\s+([\s\S]+?)\s+if\s+([\s\S]+?)\]/g,
        '($3).filter($2 => $4).map($2 => $1)'
      );
      line = line.replace(
        /\[\s*([\s\S]+?)\s+for\s+([a-zA-Z0-9_]+)\s+in\s+([\s\S]+?)\]/g,
        '($3).map($2 => $1)'
      );

      // Python integer division: (a + b) // 2 -> Math.floor((a + b) / 2)
      line = line.replace(/(\([^)]+\)|[a-zA-Z0-9_.]+)\s*\/\/\s*([a-zA-Z0-9_.]+|\([^)]+\))/g, 'Math.floor($1 / $2)');

      // Replace boolean and None
      line = line.replace(/\bTrue\b/g, 'true');
      line = line.replace(/\bFalse\b/g, 'false');
      line = line.replace(/\bNone\b/g, 'null');

      // Replace and/or/not
      line = line.replace(/\band\b/g, '&&');
      line = line.replace(/\bor\b/g, '||');
      line = line.replace(/\bnot\b/g, '!');

      // Convert def
      const defMatch = line.match(/^def\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*:/);
      if (defMatch) {
        const name = defMatch[1];
        let params = defMatch[2].split(',').map((p) => p.trim()).filter(Boolean);
        indentStack.push(indent + 4);
        if (currentClass) {
          if (params[0] === 'self') params.shift();
          if (name === '__init__') {
            jsLines.push(' '.repeat(indent) + `constructor(${params.join(', ')}) { const self = this;`);
          } else {
            jsLines.push(' '.repeat(indent) + `${name}(${params.join(', ')}) { const self = this;`);
          }
        } else {
          jsLines.push(' '.repeat(indent) + `function ${name}(${params.join(', ')}) {`);
        }
        continue;
      }

      // Convert for in range / collection
      if (line.match(/^for\s+([A-Za-z0-9_]+)\s+in\s+([\s\S]+):\s*(?:#.*)?$/)) {
        line = line.replace(/^for\s+([A-Za-z0-9_]+)\s+in\s+([\s\S]+):\s*(?:#.*)?$/, 'for (var $1 of $2) {');
        indentStack.push(indent + 4);
        jsLines.push(' '.repeat(indent) + line);
        continue;
      }

      // Convert while
      if (line.match(/^while\s+([\s\S]+):\s*(?:#.*)?$/)) {
        line = line.replace(/^while\s+([\s\S]+):\s*(?:#.*)?$/, 'while ($1) {');
        indentStack.push(indent + 4);
        jsLines.push(' '.repeat(indent) + line);
        continue;
      }

      // Convert if / elif / else
      if (line.match(/^if\s+([\s\S]+):\s*(?:#.*)?$/)) {
        line = line.replace(/^if\s+([\s\S]+):\s*(?:#.*)?$/, 'if ($1) {');
        indentStack.push(indent + 4);
        jsLines.push(' '.repeat(indent) + line);
        continue;
      }
      if (line.match(/^elif\s+([\s\S]+):\s*(?:#.*)?$/)) {
        line = line.replace(/^elif\s+([\s\S]+):\s*(?:#.*)?$/, '} else if ($1) {');
        jsLines.push(' '.repeat(indent) + line);
        continue;
      }
      if (line.match(/^else\s*:/)) {
        line = line.replace(/^else\s*:/, '} else {');
        jsLines.push(' '.repeat(indent) + line);
        continue;
      }

      // Convert print with end="" to sys.stdout.write
      line = line.replace(/print\s*\((.*),\s*end\s*=\s*(?:""|'')\s*\)/g, 'sys.stdout.write($1)');

      // Convert membership checks: val in coll -> pyIn(val, coll), val not in coll -> !pyIn(val, coll)
      line = line.replace(/([a-zA-Z0-9_."']+(?:\([^)]*\))?)\s+not\s+in\s+([a-zA-Z0-9_."']+(?:\([^)]*\))?)/g, '!pyIn($1, $2)');
      line = line.replace(/([a-zA-Z0-9_."']+(?:\([^)]*\))?)\s+in\s+([a-zA-Z0-9_."']+(?:\([^)]*\))?)/g, 'pyIn($1, $2)');

      // Convert variable declarations using var to allow multi-reassignments in the same scope
      if (line.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*=[^=]/)) {
        line = `var ${line}`;
      }

      jsLines.push(' '.repeat(indent) + line + ';');
    }

    while (indentStack.length > 1) {
      const popped = indentStack.pop();
      jsLines.push('}');
      if (currentClass && popped === classIndent + 4) {
        jsLines.push(`${currentClass} = new Proxy(${currentClass}, { apply(t, th, args) { return new t(...args); } });`);
        currentClass = null;
      }
    }

    const transpiledJs = jsLines.join('\n');
    let output = '';
    const stdinLines = (stdin || '').split(/\r?\n/);
    let stdinIdx = 0;

    class ListNode {
      val: any;
      next: any;
      constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
      }
    }

    class TreeNode {
      val: any;
      left: any;
      right: any;
      constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
      }
    }

    const sandbox: Record<string, any> = {
      print: (...args: any[]) => {
        output += args.map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a))).join(' ') + '\n';
      },
      input: (prompt?: string) => {
        if (prompt) output += String(prompt);
        return stdinIdx < stdinLines.length ? stdinLines[stdinIdx++] : '';
      },
      sum: (arr: any[]) => (Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0),
      len: (obj: any) =>
        obj && obj.length !== undefined
          ? obj.length
          : obj && typeof obj === 'object'
          ? Object.keys(obj).length
          : 0,
      range: (start: number, end?: number, step = 1) => {
        if (end === undefined) {
          end = start;
          start = 0;
        }
        const res: number[] = [];
        for (let i = start; i < end; i += step) res.push(i);
        return res;
      },
      list: (iterable?: any) => (iterable ? Array.from(iterable) : []),
      dict: (iterable?: any) => {
        if (!iterable) return {};
        if (Array.isArray(iterable)) return Object.fromEntries(iterable);
        return { ...iterable };
      },
      set: (iterable?: any) => {
        const s = new Set(iterable || []);
        (s as any).add = function (x: any) {
          Set.prototype.add.call(this, x);
          return this;
        };
        return s;
      },
      tuple: (iterable?: any) => (iterable ? Array.from(iterable) : []),
      sorted: (iterable: any, keyFn?: any, reverse = false) => {
        const arr = Array.from(iterable || []);
        if (typeof keyFn === 'function') {
          arr.sort((a, b) => (keyFn(a) > keyFn(b) ? 1 : -1));
        } else {
          arr.sort((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));
        }
        if (reverse) arr.reverse();
        return arr;
      },
      reversed: (iterable: any) => Array.from(iterable || []).reverse(),
      enumerate: (iterable: any, start = 0) => {
        const arr = Array.from(iterable || []);
        return arr.map((item, idx) => [idx + start, item]);
      },
      zip: (...iterables: any[]) => {
        const minLen = Math.min(...iterables.map((it) => (it ? (it.length ?? 0) : 0)));
        const res = [];
        for (let i = 0; i < minLen; i++) {
          res.push(iterables.map((it) => it[i]));
        }
        return res;
      },
      any: (iterable: any) => Array.from(iterable || []).some(Boolean),
      all: (iterable: any) => Array.from(iterable || []).every(Boolean),
      map: (fn: any, iterable: any) => Array.from(iterable || []).map(fn),
      filter: (fn: any, iterable: any) => Array.from(iterable || []).filter(fn),
      ord: (c: any) => String(c).charCodeAt(0),
      chr: (n: any) => String.fromCharCode(Number(n)),
      isinstance: (obj: any, type: any) => {
        if (type === Number || type === 'int' || type === 'float') return typeof obj === 'number';
        if (type === String || type === 'str') return typeof obj === 'string';
        if (type === Boolean || type === 'bool') return typeof obj === 'boolean';
        if (type === Array || type === 'list') return Array.isArray(obj);
        if (typeof type === 'function') return obj instanceof type;
        return false;
      },
      pyIn: (val: any, container: any) => {
        if (container == null) return false;
        if (Array.isArray(container) || typeof container === 'string') return container.includes(val);
        if (container instanceof Set || container instanceof Map) return container.has(val);
        return val in container;
      },
      max: (...args: any[]) => (Array.isArray(args[0]) ? Math.max(...args[0]) : Math.max(...args)),
      min: (...args: any[]) => (Array.isArray(args[0]) ? Math.min(...args[0]) : Math.min(...args)),
      abs: Math.abs,
      round: (val: any, n = 0) => Number(Number(val).toFixed(n)),
      str: String,
      int: (x: any) => parseInt(x, 10),
      float: (x: any) => parseFloat(x),
      bool: Boolean,
      Counter: (iterable?: any) => {
        const counts: Record<string, number> = {};
        for (const item of iterable || []) {
          counts[item] = (counts[item] || 0) + 1;
        }
        return counts;
      },
      defaultdict: (factory: any) => {
        return new Proxy(
          {},
          {
            get(target: any, prop: string | symbol) {
              if (typeof prop === 'string' && !(prop in target)) {
                target[prop] = typeof factory === 'function' ? factory() : 0;
              }
              return target[prop];
            },
          }
        );
      },
      math: {
        sqrt: Math.sqrt,
        floor: Math.floor,
        ceil: Math.ceil,
        pow: Math.pow,
        pi: Math.PI,
        inf: Infinity,
        gcd: (a: number, b: number) => {
          while (b) {
            [a, b] = [b, a % b];
          }
          return Math.abs(a);
        },
        factorial: (n: number) => {
          let res = 1;
          for (let i = 2; i <= n; i++) res *= i;
          return res;
        },
      },
      random: {
        randint: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
        choice: (arr: any[]) => (Array.isArray(arr) && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : undefined),
        random: () => Math.random(),
        shuffle: (arr: any[]) => {
          if (Array.isArray(arr)) {
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
          }
          return arr;
        },
      },
      sys: {
        version: '3.12.0 (IntelligentQA VM)',
        stdout: {
          write: (msg: any) => {
            output += String(msg);
          },
        },
      },
      ListNode,
      TreeNode,
      __name__: '__main__',
      Math,
      JSON,
      Array,
      Object,
      Number,
      String,
    };

    const context = vm.createContext(sandbox);

    // Provide standard Python prototype methods for lists and strings
    const prototypePrelude = `
      Array.prototype.append = function(x) { this.push(x); };
      Array.prototype.extend = function(it) { if (Array.isArray(it)) this.push(...it); };
      Array.prototype.insert = function(i, x) { this.splice(i, 0, x); };
      Array.prototype.count = function(x) { return this.filter(v => v === x).length; };
      Array.prototype.remove = function(x) {
        const idx = this.indexOf(x);
        if (idx !== -1) this.splice(idx, 1);
        else throw new Error("ValueError: list.remove(x): x not in list");
      };
      Array.prototype.clear = function() { this.length = 0; };
      String.prototype.strip = function() { return this.trim(); };
      String.prototype.lstrip = function() { return this.trimStart(); };
      String.prototype.rstrip = function() { return this.trimEnd(); };
      String.prototype.lower = function() { return this.toLowerCase(); };
      String.prototype.upper = function() { return this.toUpperCase(); };
      String.prototype.startswith = function(p) { return this.startsWith(p); };
      String.prototype.endswith = function(s) { return this.endsWith(s); };
      Object.prototype.get = function(k, d = null) { return this[k] !== undefined ? this[k] : d; };
    `;

    vm.runInContext(prototypePrelude + '\n' + transpiledJs, context, { timeout: 2500 });
    return { stdout: output, stderr: '', code: 0 };
  } catch (err: any) {
    return { stdout: '', stderr: err.message || 'Execution error', code: 1 };
  }
}

// Master Multi-Cloud Orchestrator
async function executeWithCloudCompiler(
  language: string,
  code: string,
  stdin?: string,
  apiKey?: string
): Promise<{ stdout: string; stderr: string; code: number; engine: string } | null> {
  // 1. Piston Multi-Mirror (High reliability, primary across IDEs)
  const pistonRes = await executeWithPiston(language, code, stdin);
  if (pistonRes && !isInfrastructureError(pistonRes.stderr)) {
    return { ...pistonRes, engine: 'piston' };
  }

  // 2. Wandbox (High speed, open-source multi-compiler)
  const wandboxRes = await executeWithWandbox(language, code, stdin);
  if (wandboxRes && !isInfrastructureError(wandboxRes.stderr)) {
    return { ...wandboxRes, engine: 'wandbox' };
  }

  // 3. Gemini AI Execution Simulation (If user key provided)
  if (apiKey) {
    const geminiRes = await executeWithGemini(language, code, stdin, apiKey);
    if (geminiRes && !isInfrastructureError(geminiRes.stderr)) {
      return { ...geminiRes, engine: 'gemini-ai' };
    }
  }

  // 4. Judge0 CE Public API (With strict infra error rejection)
  const judge0Res = await executeWithJudge0(language, code, stdin);
  if (judge0Res && !isInfrastructureError(judge0Res.stderr)) {
    return { ...judge0Res, engine: 'judge0' };
  }

  // 5. Glot.io API (With strict infra error rejection)
  const glotRes = await executeWithGlot(language, code, stdin);
  if (glotRes && !isInfrastructureError(glotRes.stderr)) {
    return { ...glotRes, engine: 'glot' };
  }

  // 6. In-Process VM Simulation
  const normLang = language.toLowerCase();
  if (normLang === 'java') {
    const simRes = simulateJavaInProcess(code, stdin);
    if (simRes.code === 0 || simRes.stdout.length > 0) {
      return { ...simRes, engine: 'in-process-vm' };
    }
  } else if (normLang === 'python' || normLang === 'py') {
    const simRes = simulatePythonInProcess(code, stdin);
    if (simRes.code === 0 || simRes.stdout.length > 0) {
      return { ...simRes, engine: 'in-process-vm' };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// POST API Handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code, stdin } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const clientApiKey =
      req.headers.get('x-gemini-api-key') ||
      body.apiKey ||
      process.env.GEMINI_API_KEY ||
      '';

    const startTime = Date.now();
    const normalizedLang = (language || 'java').toLowerCase();

    // 1. PYTHON RUNNER (Local binary check -> Multi-Cloud -> In-Process VM)
    if (normalizedLang === 'python' || normalizedLang === 'py') {
      const pyBin = getPythonBinary();

      if (pyBin.available) {
        const result = await runSubprocess(pyBin.python, ['-c', code], {
          timeout: 5000,
          stdin,
        });

        if (
          !result.stderr.includes('ENOENT') &&
          !result.stderr.includes('not found') &&
          !result.stderr.includes('spawn')
        ) {
          return NextResponse.json({
            language: 'python',
            success: result.code === 0,
            status: result.code === 0 ? 'success' : 'runtime_error',
            stdout: result.stdout,
            stderr: result.stderr,
            executionTimeMs: Date.now() - startTime,
            exitCode: result.code,
            engine: 'local-python',
          });
        }
      }

      // Cloud & In-Process VM fallback on serverless (Vercel)
      const cloudResult = await executeWithCloudCompiler('python', code, stdin, clientApiKey);
      if (cloudResult && !isInfrastructureError(cloudResult.stderr)) {
        return NextResponse.json({
          language: 'python',
          success: cloudResult.code === 0,
          status: cloudResult.code === 0 ? 'success' : 'runtime_error',
          stdout: cloudResult.stdout,
          stderr: cloudResult.stderr,
          executionTimeMs: Date.now() - startTime,
          exitCode: cloudResult.code,
          engine: cloudResult.engine,
        });
      }

      // Final VM fallback for Python
      const vmResult = simulatePythonInProcess(code, stdin);
      return NextResponse.json({
        language: 'python',
        success: vmResult.code === 0,
        status: vmResult.code === 0 ? 'success' : 'runtime_error',
        stdout: vmResult.stdout,
        stderr: vmResult.stderr,
        executionTimeMs: Date.now() - startTime,
        exitCode: vmResult.code,
        engine: 'in-process-vm',
      });
    }

    // 2. JAVASCRIPT RUNNER
    if (normalizedLang === 'javascript' || normalizedLang === 'js') {
      const result = await runSubprocess('node', ['-e', code], {
        timeout: 5000,
        stdin,
      });

      if (!result.stderr.includes('ENOENT') && !result.stderr.includes('spawn')) {
        return NextResponse.json({
          language: 'javascript',
          success: result.code === 0,
          status: result.code === 0 ? 'success' : 'runtime_error',
          stdout: result.stdout,
          stderr: result.stderr,
          executionTimeMs: Date.now() - startTime,
          exitCode: result.code,
          engine: 'node-local',
        });
      }

      const cloudResult = await executeWithCloudCompiler('javascript', code, stdin, clientApiKey);
      if (cloudResult) {
        return NextResponse.json({
          language: 'javascript',
          success: cloudResult.code === 0,
          status: cloudResult.code === 0 ? 'success' : 'runtime_error',
          stdout: cloudResult.stdout,
          stderr: cloudResult.stderr,
          executionTimeMs: Date.now() - startTime,
          exitCode: cloudResult.code,
          engine: cloudResult.engine,
        });
      }

      return NextResponse.json({
        language: 'javascript',
        success: result.code === 0,
        status: result.code === 0 ? 'success' : 'runtime_error',
        stdout: result.stdout,
        stderr: result.stderr,
        executionTimeMs: Date.now() - startTime,
        exitCode: result.code,
      });
    }

    // 3. TYPESCRIPT RUNNER
    if (normalizedLang === 'typescript' || normalizedLang === 'ts') {
      try {
        let jsCode = code;
        try {
          const swc = safeRequire('next/dist/build/swc');
          if (swc && typeof swc.transformSync === 'function') {
            const transformed = swc.transformSync(code, {
              jsc: { parser: { syntax: 'typescript' } },
            });
            if (transformed?.code) {
              jsCode = transformed.code;
            }
          }
        } catch (swcErr: any) {
          if (swcErr && swcErr.message && !swcErr.message.includes('Cannot find module')) {
            return NextResponse.json({
              language: 'typescript',
              success: false,
              status: 'compilation_error',
              stdout: '',
              stderr: swcErr.message,
              executionTimeMs: Date.now() - startTime,
              exitCode: 1,
              engine: 'swc-checker',
            });
          }
          jsCode = code;
        }

        const result = await runSubprocess('node', ['-e', jsCode], {
          timeout: 5000,
          stdin,
        });

        if (!result.stderr.includes('ENOENT') && !result.stderr.includes('spawn')) {
          return NextResponse.json({
            language: 'typescript',
            success: result.code === 0,
            status: result.code === 0 ? 'success' : 'runtime_error',
            stdout: result.stdout,
            stderr: result.stderr,
            executionTimeMs: Date.now() - startTime,
            exitCode: result.code,
            engine: 'node-swc',
          });
        }
      } catch {
        // fallback to cloud compiler
      }

      const cloudResult = await executeWithCloudCompiler('typescript', code, stdin, clientApiKey);
      if (cloudResult) {
        return NextResponse.json({
          language: 'typescript',
          success: cloudResult.code === 0,
          status: cloudResult.code === 0 ? 'success' : 'compilation_error',
          stdout: cloudResult.stdout,
          stderr: cloudResult.stderr,
          executionTimeMs: Date.now() - startTime,
          exitCode: cloudResult.code,
          engine: cloudResult.engine,
        });
      }

      return NextResponse.json({
        language: 'typescript',
        success: false,
        status: 'compilation_error',
        stdout: '',
        stderr: 'TypeScript compilation could not be executed in the current environment.',
        executionTimeMs: Date.now() - startTime,
        exitCode: 1,
      });
    }

    // 4. JAVA RUNNER (Local JDK -> Wandbox -> Judge0 -> Glot -> Piston -> Gemini AI -> In-Process VM)
    if (normalizedLang === 'java') {
      const javaBins = getJavaBinaries();
      const className = extractJavaClassName(code);

      if (javaBins.available) {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'intelligentqa-java-'));
        const javaFilePath = path.join(tmpDir, `${className}.java`);

        try {
          const sanitizedCode = code.replace(
            /^\s*package\s+[^;]+;\s*/m,
            '// package declaration removed for standalone compilation\n'
          );
          fs.writeFileSync(javaFilePath, sanitizedCode, 'utf8');

          // 1. Compile with javac
          const compileRes = await runSubprocess(javaBins.javac, [javaFilePath], {
            cwd: tmpDir,
            timeout: 6000,
          });

          if (compileRes.code !== 0) {
            const cleanedStderr = compileRes.stderr
              .replace(
                new RegExp(javaFilePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                `${className}.java`
              )
              .trim();

            return NextResponse.json({
              language: 'java',
              success: false,
              status: 'compilation_error',
              stdout: '',
              stderr: cleanedStderr || 'Compilation failed.',
              executionTimeMs: Date.now() - startTime,
              exitCode: compileRes.code,
            });
          }

          // 2. Execute compiled class with java
          const runRes = await runSubprocess(javaBins.java, ['-cp', tmpDir, className], {
            cwd: tmpDir,
            timeout: 6000,
            stdin,
          });

          return NextResponse.json({
            language: 'java',
            success: runRes.code === 0,
            status: runRes.code === 0 ? 'success' : 'runtime_error',
            stdout: runRes.stdout,
            stderr: runRes.stderr,
            executionTimeMs: Date.now() - startTime,
            exitCode: runRes.code,
            engine: 'local-jdk',
          });
        } catch (execErr: any) {
          return NextResponse.json({
            language: 'java',
            success: false,
            status: 'runtime_error',
            stdout: '',
            stderr: execErr.message || 'Execution failed.',
            executionTimeMs: Date.now() - startTime,
            exitCode: 1,
          });
        } finally {
          try {
            fs.rmSync(tmpDir, { recursive: true, force: true });
          } catch {
            // ignore cleanup errors
          }
        }
      }

      // Cloud & In-Process VM fallback on serverless (Vercel)
      const cloudResult = await executeWithCloudCompiler('java', code, stdin, clientApiKey);
      if (cloudResult) {
        return NextResponse.json({
          language: 'java',
          success: cloudResult.code === 0,
          status: cloudResult.code === 0 ? 'success' : 'compilation_error',
          stdout: cloudResult.stdout,
          stderr: cloudResult.stderr,
          executionTimeMs: Date.now() - startTime,
          exitCode: cloudResult.code,
          engine: cloudResult.engine,
        });
      }

      // Final In-Process VM fallback execution
      const vmResult = simulateJavaInProcess(code, stdin);
      return NextResponse.json({
        language: 'java',
        success: vmResult.code === 0,
        status: vmResult.code === 0 ? 'success' : 'compilation_error',
        stdout: vmResult.stdout,
        stderr: vmResult.stderr,
        executionTimeMs: Date.now() - startTime,
        exitCode: vmResult.code,
        engine: 'in-process-vm',
      });
    }

    // 5. C# (CSharp / .NET) RUNNER
    if (normalizedLang === 'csharp' || normalizedLang === 'c#' || normalizedLang === 'cs') {
      const cloudResult = await executeWithCloudCompiler('csharp', code, stdin, clientApiKey);
      const durationMs = Date.now() - startTime;

      if (cloudResult) {
        return NextResponse.json({
          language: 'csharp',
          success: cloudResult.code === 0,
          status: cloudResult.code === 0 ? 'success' : 'runtime_error',
          stdout: cloudResult.stdout,
          stderr: cloudResult.stderr,
          executionTimeMs: durationMs,
          exitCode: cloudResult.code,
          engine: cloudResult.engine,
        });
      }

      // If cloud unreachable, attempt local dotnet runner if installed
      const result = await runSubprocess('dotnet', ['run'], { timeout: 6000, stdin });
      return NextResponse.json({
        language: 'csharp',
        success: result.code === 0,
        status: result.code === 0 ? 'success' : 'runtime_error',
        stdout: result.stdout,
        stderr: result.stderr,
        executionTimeMs: durationMs,
        exitCode: result.code,
      });
    }

    return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal compiler error' },
      { status: 500 }
    );
  }
}
