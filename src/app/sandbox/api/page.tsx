'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Server,
  Play,
  Copy,
  Check,
  RefreshCw,
  Key,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Code2,
  Lock,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';

export default function ApiSandboxPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('login');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('POST');
  const [url, setUrl] = useState<string>('/api/sandbox/v1/auth/login');
  const [token, setToken] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify({ email: 'sdet@intelligentqa.io', password: 'ValidPassword123!' }, null, 2)
  );
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string>('');
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showSignupGate, setShowSignupGate] = useState<boolean>(false);

  const syncAuth = useCallback(() => {
    if (typeof window !== 'undefined') {
      setCurrentUser(QADatabase.getCurrentUser());
    }
  }, []);

  useEffect(() => {
    syncAuth();
    const handleAuth = () => syncAuth();
    window.addEventListener('intelligentqa_auth_changed', handleAuth);
    return () => {
      window.removeEventListener('intelligentqa_auth_changed', handleAuth);
    };
  }, [syncAuth]);

  const selectPreset = (type: string) => {
    // Check if locked for guests
    const requiresSignup = ['create-user', 'delay', 'status-500'].includes(type);
    if (!currentUser && requiresSignup) {
      setShowSignupGate(true);
      return;
    }

    setShowSignupGate(false);
    setSelectedEndpoint(type);

    if (type === 'login') {
      setMethod('POST');
      setUrl('/api/sandbox/v1/auth/login');
      setRequestBody(JSON.stringify({ email: 'sdet@intelligentqa.io', password: 'ValidPassword123!' }, null, 2));
    } else if (type === 'get-users') {
      setMethod('GET');
      setUrl('/api/sandbox/v1/users?page=1&limit=5');
      setRequestBody('');
    } else if (type === 'create-user') {
      setMethod('POST');
      setUrl('/api/sandbox/v1/users');
      setRequestBody(JSON.stringify({ name: 'Alex SDET', role: 'Staff Automation Architect' }, null, 2));
    } else if (type === 'delay') {
      setMethod('GET');
      setUrl('/api/sandbox/v1/delay/3');
      setRequestBody('');
    } else if (type === 'status-500') {
      setMethod('GET');
      setUrl('/api/sandbox/v1/status/500');
      setRequestBody('');
    }
  };

  const handleSendRequest = async () => {
    const requiresSignup = ['create-user', 'delay', 'status-500'].includes(selectedEndpoint);
    if (!currentUser && requiresSignup) {
      setShowSignupGate(true);
      return;
    }

    setLoading(true);
    setResponseStatus(null);
    setResponseBody('');
    setResponseHeaders({});

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      setResponseStatus(res.status);

      const headerObj: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        headerObj[k] = v;
      });
      setResponseHeaders(headerObj);

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setResponseBody(JSON.stringify(json, null, 2));
        // If login response, capture token for convenience
        if (json.token) {
          setToken(json.token);
        }
      } catch {
        setResponseBody(text || '(No content returned)');
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseBody(`Network or Execution Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 mb-2">
            <Server className="w-3.5 h-3.5" />
            API Testing Lab
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            API Testing Lab
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
            A functional mock backend for API automation practice. Test JWT authentication, CRUD operations, pagination headers, delay injection, and status code verification.
          </p>
        </div>

        {/* Current Auth Token Indicator */}
        <div className="flex items-center gap-2 bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-xs">
          <Key className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="max-w-[200px] truncate">
            <span className="text-slate-400 block text-[10px]">Active JWT Token:</span>
            <code className="text-purple-300 font-mono text-[11px] truncate block">
              {token ? token.slice(0, 20) + '...' : '(Unauthenticated)'}
            </code>
          </div>
          {token && (
            <button
              onClick={copyToken}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              title="Copy Token"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Free Preview Banner */}
      {!currentUser && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Free Preview:</strong> Try JWT Login and GET /users without signing in. Create a 100% free account to unlock custom payloads, latency injection, and chaos testing!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/signup"
              className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              href="/login"
              className="py-1 px-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              Log In
            </Link>
          </div>
        </div>
      )}

      {/* Preset Endpoints Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => selectPreset('login')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0 ${
            selectedEndpoint === 'login'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          POST /auth/login (Free Preview)
        </button>
        <button
          onClick={() => selectPreset('get-users')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0 ${
            selectedEndpoint === 'get-users'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          GET /users (Free Preview)
        </button>
        <button
          onClick={() => selectPreset('create-user')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0 flex items-center gap-1 ${
            selectedEndpoint === 'create-user'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          {!currentUser && <Lock className="w-3 h-3 text-amber-500" />}
          POST /users (201 Created)
        </button>
        <button
          onClick={() => selectPreset('delay')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0 flex items-center gap-1 ${
            selectedEndpoint === 'delay'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          {!currentUser && <Lock className="w-3 h-3 text-amber-500" />}
          GET /delay/3 (Timeout Testing)
        </button>
        <button
          onClick={() => selectPreset('status-500')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0 flex items-center gap-1 ${
            selectedEndpoint === 'status-500'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          {!currentUser && <Lock className="w-3 h-3 text-amber-500" />}
          GET /status/500 (Negative Path)
        </button>
      </div>

      {/* Guest Signup Gate Alert */}
      {showSignupGate && (
        <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 text-center space-y-3 max-w-xl mx-auto shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Unlock Advanced Mock Endpoints</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            POST payload testing, latency injection (/delay), and HTTP 500 error chaos testing unlock with a free IntelligentQA account.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up Free
            </Link>
            <Link
              href="/login"
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700"
            >
              Log In
            </Link>
          </div>
        </div>
      )}

      {/* Request Builder & Response Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Configuration */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <select
              value={method}
              onChange={e => setMethod(e.target.value as any)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>

            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
            />

            <button
              onClick={handleSendRequest}
              disabled={loading}
              className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              Send
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Authorization Token (Bearer):
            </label>
            <input
              type="text"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Paste Bearer JWT token or authenticate via /auth/login..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
            />
          </div>

          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                JSON Request Payload:
              </label>
              <textarea
                value={requestBody}
                onChange={e => setRequestBody(e.target.value)}
                rows={8}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-emerald-600 dark:text-emerald-400 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Right: Response Inspection */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Response Inspector
            </span>

            {responseStatus !== null && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  responseStatus >= 200 && responseStatus < 300
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                    : responseStatus === 401
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                }`}
              >
                HTTP {responseStatus}
              </span>
            )}
          </div>

          <div className="flex-1 bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 overflow-y-auto whitespace-pre-wrap">
            {responseBody || (
              <div className="h-full flex items-center justify-center text-slate-500">
                Click &quot;Send&quot; to execute mock API request and inspect response payload.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
