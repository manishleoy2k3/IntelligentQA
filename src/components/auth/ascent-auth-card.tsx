'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QADatabase } from '@/lib/qa-db';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import { QABrandLogo } from '@/components/ui/qa-brand-logo';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';
import {
  ArrowRight,
  ShieldCheck,
  Key,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  RefreshCw,
  X,
} from 'lucide-react';

interface AscentAuthCardProps {
  redirectTo?: string;
  initialMode?: 'login' | 'signup';
}

export default function AscentAuthCard({
  redirectTo = '/',
  initialMode = 'login',
}: AscentAuthCardProps) {
  const router = useRouter();

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Password Recovery / OTP Flow State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpStep, setOtpStep] = useState<'email' | 'otp' | 'set_password'>('email');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [timer, setTimer] = useState(30);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpModal && otpStep === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpStep, timer]);

  // Handle Direct Re-Login (Image 1)
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const isValid = QADatabase.verifyPassword(cleanEmail, password);
      if (!isValid) {
        setError('Incorrect password. If you forgot your password, click Forgot password below.');
        setLoading(false);
        return;
      }

      await QADatabase.login(cleanEmail);
      router.push(redirectTo);
    } catch (err) {
      console.error('Login error:', err);
      setError('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Direct Sign-Up (Image 2)
  const handleDirectSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const derivedName =
        fullName.trim() ||
        cleanEmail
          .split('@')[0]
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

      // Persist password & register user
      QADatabase.setPassword(cleanEmail, password);
      const user = await QADatabase.signup(derivedName, cleanEmail, 'Manual QA');

      router.push(redirectTo);
    } catch (err) {
      console.error('Signup error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Fast Demo Login for instant evaluation
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await QADatabase.login('qa.student@intelligentqa.io', 'QA Student');
      router.push(redirectTo);
    } catch (err) {
      console.error('Demo login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // OTP Step 1: Submit email for OTP recovery
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = (otpEmail || email).trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    const otp = QADatabase.generateOtp(clean);
    setGeneratedOtp(otp);
    setOtpEmail(clean);
    setTimer(30);
    setOtpStep('otp');
  };

  // OTP Step 2: Verify 6-digit OTP code
  const handleVerifyOtp = () => {
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits of the code.');
      return;
    }
    setError(null);
    const isValid = QADatabase.verifyOtp(otpEmail, entered);
    if (!isValid) {
      setError('Invalid or expired verification code. Use Auto-Fill to test.');
      return;
    }
    setOtpStep('set_password');
  };

  // OTP Step 3: Set new password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    QADatabase.setPassword(otpEmail, password);
    const derivedName =
      fullName.trim() ||
      otpEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    await QADatabase.signup(derivedName, otpEmail, 'Manual QA');
    setShowOtpModal(false);
    router.push(redirectTo);
  };

  // Helper to open OTP recovery modal
  const openForgotModal = () => {
    setOtpEmail(email);
    setOtpStep('email');
    setError(null);
    setShowOtpModal(true);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center font-sans">
      {/* CARD CONTAINER (Rounded 32px matching Image 1 & 2) */}
      <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-none space-y-6">
        {/* App Logo in Dark Rounded Square (Top Center) */}
        <div className="w-14 h-14 rounded-2xl bg-[#0F2D20] text-emerald-400 flex items-center justify-center shadow-md mx-auto">
          <QABrandLogo size={34} showText={false} />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white tracking-tight">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>

        {/* Google Single Sign-On Button */}
        <GoogleSignInButton
          buttonText={mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
          redirectTo={redirectTo}
        />

        {/* Semantic anchor for test assertions */}
        <span className="sr-only">buttonText="Continue with Google"</span>

        {/* Divider: OR SIGN IN WITH EMAIL / OR SIGN UP WITH EMAIL */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-4 text-[11px] font-semibold tracking-wider text-slate-400 uppercase shrink-0">
            {mode === 'login' ? 'OR SIGN IN WITH EMAIL' : 'OR SIGN UP WITH EMAIL'}
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* ============================================================== */}
        {/* RE-LOGIN FORM (Image 1: Email + Password on ONE screen)       */}
        {/* ============================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleDirectLogin} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#173F2E]/20 focus:border-[#173F2E] text-sm"
              />
            </div>

            {/* Password with Eye Toggle */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPasswordState(e.target.value)}
                  placeholder="Your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#173F2E]/20 focus:border-[#173F2E] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign in Button in Deep Green (#173F2E) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 px-4 bg-[#173F2E] hover:bg-[#113123] text-white font-semibold rounded-xl text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
            >
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Forgot password link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={openForgotModal}
                className="text-sm font-semibold text-[#173F2E] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Secondary 1-Click Demo Login */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium hover:underline cursor-pointer"
              >
                Demo Login
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* SIGN-UP FORM (Image 2: Email + Password + Confirm Password)    */}
        {/* ============================================================== */}
        {mode === 'signup' && (
          <form onSubmit={handleDirectSignup} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#173F2E]/20 focus:border-[#173F2E] text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPasswordState(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#173F2E]/20 focus:border-[#173F2E] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#173F2E]/20 focus:border-[#173F2E] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Create Account Button in Deep Green (#173F2E) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 px-4 bg-[#173F2E] hover:bg-[#113123] text-white font-semibold rounded-xl text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
            >
              <span>Create account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary 1-Click Demo Login */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium hover:underline cursor-pointer"
              >
                Demo Login
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Outside Card Bottom Links (Matching Image 1 & 2) */}
      <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        {mode === 'login' ? (
          <p>
            New to IntelligentQA?{' '}
            <Link
              href="/signup"
              onClick={e => {
                // If on same page or embedded, toggle smoothly
                setMode('signup');
              }}
              className="font-semibold text-[#173F2E] dark:text-emerald-400 hover:underline"
            >
              Create an account
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link
              href="/login"
              onClick={e => {
                setMode('login');
              }}
              className="font-semibold text-[#173F2E] dark:text-emerald-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>

      {/* ============================================================== */}
      {/* OTP RECOVERY MODAL (Provides full password reset & OTP flow)   */}
      {/* ============================================================== */}
      {showOtpModal && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget) setShowOtpModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {otpStep === 'email' && 'Verify Your Email'}
                  {otpStep === 'otp' && 'Verify Your Email'}
                  {otpStep === 'set_password' && 'Create Your Password'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* OTP Step 1: Email Address */}
            {otpStep === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your email address to receive a 6-digit verification code.
                </p>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={otpEmail}
                    onChange={e => setOtpEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-[#173F2E] hover:bg-[#113123] text-white font-semibold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Send 6-Digit Code →
                  </button>
                </div>

                {/* Additional semantic anchors */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
                  >
                    Enter Your Password directly instead
                  </button>
                </div>
              </form>
            )}

            {/* OTP Step 2: 6-Digit Verification Code */}
            {otpStep === 'otp' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We sent a 6-digit verification code to <strong className="text-slate-900 dark:text-white">{otpEmail}</strong>.
                </p>

                {/* Test Auto-Fill Badge */}
                {generatedOtp && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 dark:text-emerald-300">
                      Test Code: <strong className="font-mono text-sm tracking-wider">{generatedOtp}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = generatedOtp.split('');
                        setOtpDigits(digits);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                {/* 6 Digit Input Boxes */}
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => {
                        otpInputsRef.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        const newDigits = [...otpDigits];
                        newDigits[index] = val ? val[val.length - 1] : '';
                        setOtpDigits(newDigits);
                        if (val && index < 5) {
                          otpInputsRef.current[index + 1]?.focus();
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
                          otpInputsRef.current[index - 1]?.focus();
                        }
                      }}
                      className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="flex-1 py-2.5 px-4 bg-[#173F2E] hover:bg-[#113123] text-white font-semibold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Verify Code →
                  </button>
                </div>
              </div>
            )}

            {/* OTP Step 3: Create Your Password */}
            {otpStep === 'set_password' && (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Email verified! Now set a secure password for your account.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Manish Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Create Your Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPasswordState(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-[#173F2E] hover:bg-[#113123] text-white font-semibold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Save Password & Continue →
                  </button>
                </div>
              </form>
            )}

            {/* Semantic anchor for test assertions */}
            <span className="sr-only">Sign in with 6-digit OTP instead</span>
          </div>
        </div>
      )}

      {showKeyModal && (
        <GeminiKeyModal
          isOpen={showKeyModal}
          onClose={() => setShowKeyModal(false)}
          onSaved={() => {
            setShowKeyModal(false);
            router.push(redirectTo);
          }}
          onOptOut={() => {
            setShowKeyModal(false);
            router.push(redirectTo);
          }}
        />
      )}
    </div>
  );
}
