import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

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

// Fallback Cloud Code Execution Engine (Used when host lacks local compiler, e.g. Vercel Serverless)
async function executeWithCloudCompiler(
  language: string,
  code: string,
  stdin?: string
): Promise<{ stdout: string; stderr: string; code: number } | null> {
  const pistonLangMap: Record<string, { lang: string; file: string }> = {
    java: { lang: 'java', file: 'Main.java' },
    python: { lang: 'python', file: 'main.py' },
    typescript: { lang: 'typescript', file: 'index.ts' },
    javascript: { lang: 'javascript', file: 'index.js' },
    js: { lang: 'javascript', file: 'index.js' },
    csharp: { lang: 'csharp', file: 'Program.cs' },
    'c#': { lang: 'csharp', file: 'Program.cs' },
    cs: { lang: 'csharp', file: 'Program.cs' },
  };

  const target = pistonLangMap[language.toLowerCase()];
  if (!target) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('https://emkc.org/api/v2/piston/execute', {
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
    return null;
  } catch {
    return null;
  }
}

function safeRequire(modName: string) {
  try {
    const dynamicRequire = eval('require');
    return dynamicRequire(modName);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code, stdin } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const startTime = Date.now();
    const normalizedLang = (language || 'java').toLowerCase();

    // 1. PYTHON RUNNER (Python 3)
    if (normalizedLang === 'python' || normalizedLang === 'py') {
      const result = await runSubprocess('python3', ['-c', code], {
        timeout: 5000,
        stdin,
      });

      // If python3 is missing on host environment (e.g. Vercel Serverless Function), fallback to cloud execution engine
      if (
        result.stderr.includes('ENOENT') ||
        result.stderr.includes('not found') ||
        result.stderr.includes('spawn python3')
      ) {
        const cloudResult = await executeWithCloudCompiler('python', code, stdin);
        if (cloudResult) {
          return NextResponse.json({
            language: 'python',
            success: cloudResult.code === 0,
            status: cloudResult.code === 0 ? 'success' : 'runtime_error',
            stdout: cloudResult.stdout,
            stderr: cloudResult.stderr,
            executionTimeMs: Date.now() - startTime,
            exitCode: cloudResult.code,
            engine: 'cloud-runner',
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
          stderr: transpileErr.message || 'TypeScript compilation error',
          executionTimeMs: Date.now() - startTime,
          exitCode: 1,
        });
      }
    }

    // 3. JAVA COMPILER & RUNNER (Real OpenJDK javac & java)
    if (normalizedLang === 'java') {
      const javaBins = getJavaBinaries();

      // Extract class name
      const classMatch = code.match(/(?:public\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_]+)/);
      const className = classMatch ? classMatch[1] : 'Main';

      if (javaBins.available) {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'intelligentqa-java-'));
        const javaFilePath = path.join(tmpDir, `${className}.java`);

        try {
          // Strip package declaration for single-file compilation if present
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
            // Clean up absolute path from error messages to display clean relative filename
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
      const cloudResult = await executeWithCloudCompiler('java', code, stdin);
      if (cloudResult) {
        return NextResponse.json({
          language: 'java',
          success: cloudResult.code === 0,
          status: cloudResult.code === 0 ? 'success' : 'compilation_error',
          stdout: cloudResult.stdout,
          stderr: cloudResult.stderr,
          executionTimeMs: Date.now() - startTime,
          exitCode: cloudResult.code,
          engine: 'cloud-compiler',
        });
      }

      return NextResponse.json({
        language: 'java',
        success: false,
        status: 'compilation_error',
        stdout: '',
        stderr: 'JDK compiler (javac) not located in system environment, and cloud compilation was unreachable.',
        executionTimeMs: Date.now() - startTime,
        exitCode: 1,
      });
    }

    // 5. C# (CSharp / .NET) RUNNER
    if (normalizedLang === 'csharp' || normalizedLang === 'c#' || normalizedLang === 'cs') {
      const cloudResult = await executeWithCloudCompiler('csharp', code, stdin);
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
