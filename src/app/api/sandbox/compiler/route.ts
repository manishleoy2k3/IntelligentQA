import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import vm from 'vm';

// Helper to run shell command with spawn, timeout, and stdin support
function runSubprocess(
  cmd: string,
  args: string[],
  options: { timeout?: number; cwd?: string; stdin?: string } = {}
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    try {
      const child = spawn(cmd, args, {
        cwd: options.cwd || process.cwd(),
        timeout: options.timeout || 6000,
      });

      let stdout = '';
      let stderr = '';

      if (child.stdin) {
        if (options.stdin) {
          child.stdin.write(options.stdin);
        }
        child.stdin.end();
      }

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('close', (code) => {
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

function extractJavaClassName(code: string): string {
  const match = code.match(/(?:public\s+)?(?:final\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_]+)/);
  return match ? match[1] : 'Main';
}

function safeRequire(modName: string) {
  try {
    const dynamicRequire = eval('require');
    return dynamicRequire(modName);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// TIER 2A: Wandbox API (High reliability on Serverless/AWS without Cloudflare blocking)
// ---------------------------------------------------------------------------
async function executeWithWandbox(
  language: string,
  code: string,
  stdin?: string
): Promise<{ stdout: string; stderr: string; code: number } | null> {
  const wandboxCompilers: Record<string, string> = {
    java: 'openjdk-head',
    python: 'cpython-3.12.0',
    py: 'cpython-3.12.0',
    javascript: 'nodejs-20.17.0',
    js: 'nodejs-20.17.0',
    typescript: 'typescript-5.5.4',
    ts: 'typescript-5.5.4',
    csharp: 'dotnetcore-8.0.300',
    'c#': 'dotnetcore-8.0.300',
    cs: 'dotnetcore-8.0.300',
  };

  const compiler = wandboxCompilers[language.toLowerCase()];
  if (!compiler) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

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

      return {
        stdout,
        stderr,
        code: status !== 0 || data.compiler_error ? (status === 0 ? 1 : status) : 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// TIER 2B: Piston Execution Engine (Multi-endpoint with dynamic filename)
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
      const timeout = setTimeout(() => controller.abort(), 7000);

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
          return {
            stdout: data.compile.stdout || '',
            stderr: data.compile.stderr || data.compile.output || 'Compilation failed.',
            code: data.compile.code || 1,
          };
        }
        if (data.run) {
          return {
            stdout: data.run.stdout || data.run.output || '',
            stderr: data.run.stderr || '',
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
// TIER 3: Gemini AI Headless Simulation Engine
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
// TIER 4: Built-in In-Process Java & Python Virtual Sandbox Fallback
// ---------------------------------------------------------------------------
function simulateJavaInProcess(
  javaCode: string
): { stdout: string; stderr: string; code: number } {
  try {
    let js = javaCode;

    // 1. Strip package and import declarations
    js = js.replace(/^\s*(?:package|import)\s+[^;]+;\s*$/gm, '');

    // 2. Convert System.out
    js = js.replace(/System\.out\.println\s*\(/g, 'console.log(');
    js = js.replace(/System\.out\.print\s*\(/g, 'stdoutWrite(');
    js = js.replace(/System\.out\.printf\s*\(/g, 'console.log(formatPrintf(');

    // 3. Arrays initialization
    js = js.replace(
      /\b(?:int|double|float|long|short|byte|char|boolean|String)\s*\[\s*\]\s*([A-Za-z0-9_]+)\s*=\s*\{([^}]+)\};/g,
      'let $1 = [$2];'
    );
    js = js.replace(
      /\bnew\s+(?:int|double|float|long|short|byte|char|boolean|String)\s*\[\s*\]\s*\{([^}]+)\}/g,
      '[$1]'
    );

    // 4. Primitive/Type declarations
    js = js.replace(
      /\b(?:int|double|float|long|short|byte|char|boolean|String|var|final\s+[A-Za-z0-9_<>]+)\s+([A-Za-z0-9_]+)\s*(=|;)/g,
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

    // 7. Strip class wrapper and main method header
    const classMatch = js.match(/(?:public\s+)?(?:final\s+)?class\s+[A-Za-z0-9_]+\s*\{/);
    if (classMatch) {
      const classIdx = js.indexOf(classMatch[0]);
      js = js.substring(0, classIdx) + js.substring(classIdx + classMatch[0].length);
    }
    const mainMatch = js.match(/(?:public\s+)?static\s+void\s+main\s*\([^)]*\)\s*\{/);
    if (mainMatch) {
      const mainIdx = js.indexOf(mainMatch[0]);
      js = js.substring(0, mainIdx) + js.substring(mainIdx + mainMatch[0].length);
    }

    // 8. Convert static helper methods
    js = js.replace(
      /(?:public\s+)?(?:private\s+)?static\s+[A-Za-z0-9_<>[\]]+\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/g,
      (_m, fnName, args) => {
        const cleanArgs = args
          .split(',')
          .map((a: string) => a.trim().split(/\s+/).pop())
          .filter(Boolean)
          .join(', ');
        return `function ${fnName}(${cleanArgs}) {`;
      }
    );

    // 9. Strip closing class braces
    js = js.trim().replace(/\}\s*\}\s*$/, '').replace(/\}\s*$/, '');

    let output = '';
    const sandbox = {
      console: {
        log: (...args: any[]) => {
          output += args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n';
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
        return String(fmt).replace(/%[sdfb]/g, () => args[i++] ?? '');
      },
      Math,
      JSON,
      String,
      Number,
      Boolean,
      Array,
    };

    const context = vm.createContext(sandbox);
    vm.runInContext(js, context, { timeout: 2500 });
    return { stdout: output, stderr: '', code: 0 };
  } catch (err: any) {
    return { stdout: '', stderr: err.message || 'Simulation error', code: 1 };
  }
}

function simulatePythonInProcess(
  pythonCode: string
): { stdout: string; stderr: string; code: number } {
  try {
    let js = pythonCode;
    // Replace print(...) with console.log(...)
    js = js.replace(/print\s*\(/g, 'console.log(');
    // Replace True/False/None
    js = js.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');

    let output = '';
    const sandbox = {
      console: {
        log: (...args: any[]) => {
          output += args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n';
        },
        error: (...args: any[]) => {
          output += args.join(' ') + '\n';
        },
      },
      Math,
      JSON,
      String,
      Number,
      Boolean,
      Array,
    };

    const context = vm.createContext(sandbox);
    vm.runInContext(js, context, { timeout: 2000 });
    return { stdout: output, stderr: '', code: 0 };
  } catch (err: any) {
    return { stdout: '', stderr: err.message || 'Execution error', code: 1 };
  }
}

// Master Cloud Fallback Orchestrator (Wandbox -> Piston -> Gemini -> In-Process VM)
async function executeWithCloudCompiler(
  language: string,
  code: string,
  stdin?: string,
  apiKey?: string
): Promise<{ stdout: string; stderr: string; code: number; engine: string } | null> {
  // 1. Try Wandbox
  const wandboxRes = await executeWithWandbox(language, code, stdin);
  if (wandboxRes) {
    return { ...wandboxRes, engine: 'wandbox' };
  }

  // 2. Try Piston Mirrors
  const pistonRes = await executeWithPiston(language, code, stdin);
  if (pistonRes) {
    return { ...pistonRes, engine: 'piston' };
  }

  // 3. Try Gemini AI Execution Simulation
  if (apiKey) {
    const geminiRes = await executeWithGemini(language, code, stdin, apiKey);
    if (geminiRes) {
      return { ...geminiRes, engine: 'gemini-ai' };
    }
  }

  // 4. Built-in In-Process VM Simulation
  const normLang = language.toLowerCase();
  if (normLang === 'java') {
    const simRes = simulateJavaInProcess(code);
    if (simRes.code === 0 || simRes.stdout.length > 0) {
      return { ...simRes, engine: 'in-process-vm' };
    }
  } else if (normLang === 'python' || normLang === 'py') {
    const simRes = simulatePythonInProcess(code);
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

    // 1. PYTHON RUNNER (Python 3)
    if (normalizedLang === 'python' || normalizedLang === 'py') {
      const result = await runSubprocess('python3', ['-c', code], {
        timeout: 5000,
        stdin,
      });

      // If python3 missing on host environment (e.g. Vercel Serverless Function), fallback to cloud execution engine
      if (
        result.stderr.includes('ENOENT') ||
        result.stderr.includes('not found') ||
        result.stderr.includes('spawn python3')
      ) {
        const cloudResult = await executeWithCloudCompiler('python', code, stdin, clientApiKey);
        if (cloudResult) {
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
      }

      const durationMs = Date.now() - startTime;

      return NextResponse.json({
        language: 'python',
        success: result.code === 0,
        status: result.code === 0 ? 'success' : 'runtime_error',
        stdout: result.stdout,
        stderr: result.stderr,
        executionTimeMs: durationMs,
        exitCode: result.code,
      });
    }

    // 2. JAVASCRIPT RUNNER
    if (normalizedLang === 'javascript' || normalizedLang === 'js') {
      const result = await runSubprocess('node', ['-e', code], {
        timeout: 5000,
        stdin,
      });
      const durationMs = Date.now() - startTime;

      return NextResponse.json({
        language: 'javascript',
        success: result.code === 0,
        status: result.code === 0 ? 'success' : 'runtime_error',
        stdout: result.stdout,
        stderr: result.stderr,
        executionTimeMs: durationMs,
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
        } catch {
          jsCode = code;
        }

        const result = await runSubprocess('node', ['-e', jsCode], {
          timeout: 5000,
          stdin,
        });
        const durationMs = Date.now() - startTime;

        return NextResponse.json({
          language: 'typescript',
          success: result.code === 0,
          status: result.code === 0 ? 'success' : 'runtime_error',
          stdout: result.stdout,
          stderr: result.stderr,
          executionTimeMs: durationMs,
          exitCode: result.code,
        });
      } catch (transpileErr: any) {
        return NextResponse.json({
          language: 'typescript',
          success: false,
          status: 'compilation_error',
          stdout: '',
          stderr: transpileErr.message || 'TypeScript transpile error.',
          executionTimeMs: Date.now() - startTime,
          exitCode: 1,
        });
      }
    }

    // 4. JAVA RUNNER (Local JDK -> Wandbox -> Piston -> Gemini AI -> In-Process VM)
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

      // Fallback if JDK binary missing (e.g. Vercel Serverless Function without local JDK)
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
      const vmResult = simulateJavaInProcess(code);
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
