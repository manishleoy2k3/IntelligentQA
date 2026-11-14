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

    // 2. TYPESCRIPT / JAVASCRIPT RUNNER
    if (
      normalizedLang === 'typescript' ||
      normalizedLang === 'ts' ||
      normalizedLang === 'javascript' ||
      normalizedLang === 'js'
    ) {
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

      // Fallback if JDK binary missing
      return NextResponse.json({
        language: 'java',
        success: false,
        status: 'compilation_error',
        stdout: '',
        stderr: 'JDK compiler (javac) not located in system environment.',
        executionTimeMs: Date.now() - startTime,
        exitCode: 1,
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
