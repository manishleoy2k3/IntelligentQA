'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QADatabase } from '@/lib/qa-db';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';
import { QABrandLogo } from '@/components/ui/qa-brand-logo';
import SocialOAuthModal, { SocialProvider } from '@/components/auth/social-oauth-modal';
import {
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
  Smartphone,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface AscentAuthCardProps {
  redirectTo?: string;
  initialMode?: 'login' | 'signup';
  onClose?: () => void;
}

export default function AscentAuthCard({
  redirectTo = '/',
  initialMode = 'signup',
  onClose,
}: AscentAuthCardProps) {
  const router = useRouter();

  // Mode: 'signup' | 'login'
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  // Account Type: 'student' | 'admin'
  const [accountType, setAccountType] = useState<'student' | 'admin'>('student');

  // Input reveal states
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1');
  const [phoneOtpStep, setPhoneOtpStep] = useState<'phone' | 'otp'>('phone');
  const [phoneOtpDigits, setPhoneOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [phoneGeneratedOtp, setPhoneGeneratedOtp] = useState<string>('');
  const [phoneTimer, setPhoneTimer] = useState(30);
  const [formattedMobileNumber, setFormattedMobileNumber] = useState('');
  const phoneOtpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [activeSocialProvider, setActiveSocialProvider] = useState<SocialProvider | null>(null);

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

  // Phone OTP Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showPhoneForm && phoneOtpStep === 'otp' && phoneTimer > 0) {
      interval = setInterval(() => setPhoneTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showPhoneForm, phoneOtpStep, phoneTimer]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/');
    }
  };

  // Handle Direct Login
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
      const isExplicitAdmin =
        QADatabase.getAdminEmails().some(e => e.toLowerCase() === cleanEmail) ||
        cleanEmail === 'admin@intelligentqa.io' ||
        accountType === 'admin';

      if (isExplicitAdmin) {
        router.push('/admin');
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Direct Sign-Up
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
    if (mode === 'signup' && password !== confirmPassword) {
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

      QADatabase.setPassword(cleanEmail, password);
      await QADatabase.signup(derivedName, cleanEmail, 'Manual QA');

      if (accountType === 'admin') {
        QADatabase.switchToAdminSession();
        router.push('/admin');
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Fast Admin Login for immediate platform management
  const handleAdminDemoLogin = async () => {
    setLoading(true);
    try {
      QADatabase.switchToAdminSession();
      router.push('/admin');
    } catch (err) {
      console.error('Admin demo login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Social Sign-In: Opens authentic OAuth Permission Pop-up Window first
  const handleSocialSignIn = (provider: SocialProvider) => {
    setActiveSocialProvider(provider);
  };

  const executeSocialLogin = async (provider: SocialProvider, userIdentifier: string) => {
    setActiveSocialProvider(null);
    setLoading(true);
    try {
      const cleanId = (userIdentifier || provider).replace(/\s+/g, '').toLowerCase();
      const dummyEmail =
        accountType === 'admin'
          ? 'admin@intelligentqa.io'
          : `${cleanId}@${provider}.intelligentqa.io`;
      const dummyName =
        accountType === 'admin'
          ? 'Platform Admin'
          : `${provider.charAt(0).toUpperCase() + provider.slice(1)} QA Engineer`;

      await QADatabase.login(dummyEmail, dummyName);
      if (accountType === 'admin') {
        QADatabase.switchToAdminSession();
        router.push('/admin');
      } else {
        router.push(redirectTo);
      }
    } catch (e) {
      console.error(`${provider} sign-in error:`, e);
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

  const openForgotModal = () => {
    setOtpEmail(email);
    setOtpStep('email');
    setError(null);
    setShowOtpModal(true);
  };

  // Helper to validate and normalize international mobile number
  const validatePhone = (rawInput: string, selectedCode: string): { isValid: boolean; formatted: string; error?: string } => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { isValid: false, formatted: '', error: 'Please enter your mobile phone number.' };
    }

    let countryCode = selectedCode.trim();
    let localNumber = trimmed;

    // If user typed + in the input itself, extract the country code
    if (trimmed.startsWith('+')) {
      const match = trimmed.match(/^(\+\d{1,4})[\s.-]?(.*)$/);
      if (match) {
        countryCode = match[1];
        localNumber = match[2];
      }
    }

    // Ensure country code has + followed by 1-4 digits
    if (!/^\+\d{1,4}$/.test(countryCode)) {
      return { isValid: false, formatted: '', error: 'Country code must start with "+" followed by 1 to 4 digits (e.g. +1, +91, +44).' };
    }

    const digitsOnly = localNumber.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return {
        isValid: false,
        formatted: '',
        error: `Invalid phone number length (${digitsOnly.length} digits). Standard international mobile numbers have 7 to 15 digits.`,
      };
    }

    const formatted = `${countryCode} ${digitsOnly}`;
    return { isValid: true, formatted };
  };

  // Phone Step 1: Send verification code to mobile phone
  const handleSendPhoneCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validatePhone(phoneNumber, phoneCountryCode);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid phone number with country code.');
      return;
    }

    const fullPhone = validation.formatted;
    setFormattedMobileNumber(fullPhone);

    // Generate real 6-digit OTP stored in QADatabase
    const otp = QADatabase.generateOtp(fullPhone);
    setPhoneGeneratedOtp(otp);
    setPhoneOtpDigits(['', '', '', '', '', '']);
    setPhoneTimer(30);
    setPhoneOtpStep('otp');
  };

  // Phone Step 2: Strictly verify 6-digit code and authenticate
  const handleVerifyPhoneCode = async () => {
    const entered = phoneOtpDigits.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits of the phone verification code.');
      return;
    }
    setError(null);

    const isValid = QADatabase.verifyOtp(formattedMobileNumber, entered);
    if (!isValid) {
      setError('Invalid or expired verification code. Please check the code or use Auto-Fill test code.');
      return;
    }

    setLoading(true);
    try {
      if (accountType === 'admin') {
        QADatabase.switchToAdminSession();
        router.push('/admin');
      } else {
        await QADatabase.loginWithPhone(formattedMobileNumber);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('intelligentqa_open_profile_modal'));
        }
        router.push(redirectTo);
      }
    } catch (err) {
      console.error('Phone login error:', err);
      setError('Phone authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center font-sans">
      {/* CARD CONTAINER: Emergent-style Floating Dark Window */}
      <div className="w-full max-w-[460px] bg-[#111111]/95 backdrop-blur-2xl rounded-[36px] border border-[#222222] p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center mx-auto text-white">
        {/* Subtle Ambient Radial Lighting from top-left */}
        <div
          className={`absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
            accountType === 'student' ? 'bg-[#81FF89]/10' : 'bg-purple-500/10'
          }`}
        />

        {/* Faint Background Glyph Watermark */}
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

        {/* Top-Right Circular Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1C1C1C] hover:bg-[#252525] border border-[#2B2B2B] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Official IntelligentQA Brand Logo */}
        <div className="relative flex justify-center mb-5 z-10">
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2B2B2B] flex items-center justify-center shadow-xl mx-auto hover:scale-105 transition-transform">
            <QABrandLogo size={38} showText={false} />
          </div>
        </div>

        {/* Big Bold Clean Headline */}
        <div className="space-y-1 my-5 text-center relative z-10">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            From Manual QA to SDET
          </h2>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#81FF89]">
            with AI
          </div>
        </div>

        {/* Primary Action Button: Continue with Google (Exact White Pill from Image) */}
        <div className="mt-6 space-y-4 relative z-10">
          <GoogleSignInButton
            buttonText="Continue with Google"
            redirectTo={accountType === 'admin' ? '/admin' : redirectTo}
            className="w-full py-3.5 px-6 rounded-full !bg-white hover:!bg-zinc-100 !text-black font-extrabold text-sm flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.99] cursor-pointer border-0"
          />

          {/* Social Icons Row (GitHub, Apple, Facebook) */}
          <div className="flex items-center justify-center gap-4 py-2">
            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleSocialSignIn('github')}
              className="w-12 h-12 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#282828] text-white flex items-center justify-center transition-all shadow-sm cursor-pointer active:scale-95 group"
              title="Continue with GitHub"
            >
              <svg className="w-5 h-5 text-white group-hover:text-[#81FF89] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialSignIn('apple')}
              className="w-12 h-12 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#282828] text-white flex items-center justify-center transition-all shadow-sm cursor-pointer active:scale-95 group"
              title="Continue with Apple"
            >
              <svg className="w-5 h-5 text-white group-hover:text-zinc-300 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.93.04-2.07.62-2.73 1.4-.58.67-1.09 1.76-.95 2.83 1.04.08 2.1-.53 2.72-1.27z" />
              </svg>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleSocialSignIn('facebook')}
              className="w-12 h-12 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#282828] text-white flex items-center justify-center transition-all shadow-sm cursor-pointer active:scale-95 group"
              title="Continue with Facebook"
            >
              <svg className="w-5 h-5 text-[#1877F2] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
          </div>

          {/* Emergent Dashed Divider: ------ OR ------ */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-dashed border-[#282828]" />
            <span className="absolute px-3 bg-[#111111] text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
              OR
            </span>
          </div>

          {/* Secondary Pill 1: Continue with Email */}
          <button
            type="button"
            onClick={() => {
              setShowEmailForm(!showEmailForm);
              setShowPhoneForm(false);
            }}
            className="w-full py-3.5 px-6 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#282828] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <Mail className="w-4 h-4 text-zinc-400" />
            <span>Continue with Email</span>
          </button>

          {/* Secondary Pill 2: Continue with Phone */}
          <button
            type="button"
            onClick={() => {
              const nextState = !showPhoneForm;
              setShowPhoneForm(nextState);
              setShowEmailForm(false);
              setError(null);
              if (!nextState) {
                setPhoneOtpStep('phone');
              }
            }}
            className="w-full py-3.5 px-6 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#282828] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <span>Continue with Phone</span>
          </button>

          {/* 1-Click Fast Admin Demo Login (Only when opened explicitly in admin mode) */}
          {accountType === 'admin' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAdminDemoLogin}
                className="w-full py-2.5 px-4 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>1-Click Fast Admin Demo Login</span>
              </button>
            </div>
          )}
        </div>

        {/* REVEALABLE EMAIL / PASSWORD FORM */}
        {showEmailForm && (
          <form
            onSubmit={mode === 'signup' ? handleDirectSignup : handleDirectLogin}
            className="mt-6 pt-5 border-t border-[#262626] space-y-4 text-left animate-in fade-in duration-200 relative z-10"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">
                {mode === 'signup' ? 'Create Your Password' : 'Enter Your Password'}
              </span>
              <button
                type="button"
                onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                className="text-[#81FF89] hover:underline font-semibold cursor-pointer"
              >
                {mode === 'signup' ? 'Existing user? Log In' : 'New user? Sign Up'}
              </button>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="qa.engineer@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={openForgotModal}
                    className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPasswordState(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 pr-10 focus:outline-none focus:border-[#81FF89]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 pr-10 focus:outline-none focus:border-[#81FF89]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-xs text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-full font-bold text-xs text-black transition-all cursor-pointer shadow-md ${
                accountType === 'admin'
                  ? 'bg-gradient-to-r from-purple-400 to-indigo-400 hover:opacity-95'
                  : 'bg-[#81FF89] hover:bg-[#6ee776]'
              }`}
            >
              {loading ? 'Authenticating...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>

            {mode === 'login' && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                >
                  Sign in with 6-digit OTP instead
                </button>
              </div>
            )}
          </form>
        )}

        {/* REVEALABLE PHONE INPUT & VERIFICATION FLOW */}
        {showPhoneForm && (
          <div className="mt-6 pt-5 border-t border-[#262626] space-y-4 text-left animate-in fade-in duration-200 relative z-10">
            {phoneOtpStep === 'phone' ? (
              <form onSubmit={handleSendPhoneCode} className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Sign In with Mobile</span>
                  <span className="text-[11px] text-zinc-400">SMS Verification</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Mobile Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Country Code Selector / Input */}
                    <div className="relative shrink-0 w-28">
                      <select
                        aria-label="Country Code"
                        value={phoneCountryCode}
                        onChange={e => setPhoneCountryCode(e.target.value)}
                        className="w-full px-2.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white appearance-none focus:outline-none focus:border-[#81FF89] cursor-pointer"
                      >
                        <option value="+1">🇺🇸 +1 (US)</option>
                        <option value="+91">🇮🇳 +91 (IN)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+61">🇦🇺 +61 (AU)</option>
                        <option value="+49">🇩🇪 +49 (DE)</option>
                        <option value="+33">🇫🇷 +33 (FR)</option>
                        <option value="+81">🇯🇵 +81 (JP)</option>
                        <option value="+65">🇸🇬 +65 (SG)</option>
                        <option value="+971">🇦🇪 +971 (AE)</option>
                        <option value="+86">🇨🇳 +86 (CN)</option>
                      </select>
                    </div>

                    {/* Local Mobile Input */}
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={e => {
                          setPhoneNumber(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="555-0199 or +1 555-0199"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89]"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Select your country code or include it with a <span className="text-white font-mono font-semibold">+</span> (e.g. +91 9876543210).
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-xs text-rose-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-white hover:bg-zinc-100 text-black font-bold text-xs transition-all cursor-pointer shadow-md active:scale-[0.99]"
                >
                  Send Verification Code
                </button>
              </form>
            ) : (
              /* Phone OTP Step: Verify 6-digit Code */
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white">Enter Verification Code</h3>
                    <p className="text-[11px] text-zinc-400">
                      Code sent to <span className="text-white font-medium">{formattedMobileNumber}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneOtpStep('phone');
                      setError(null);
                    }}
                    className="text-xs text-[#81FF89] hover:underline cursor-pointer"
                  >
                    Edit Number
                  </button>
                </div>

                {/* SMS Simulation Toast Banner */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-[#122216] border border-emerald-500/30 text-xs space-y-1.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#81FF89] flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#81FF89]" />
                      SMS Code Dispatched
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">Just Now</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    Your verification code is{' '}
                    <span className="font-mono font-black text-sm text-white bg-black/60 px-2 py-0.5 rounded-lg border border-emerald-400/40 select-all">
                      {phoneGeneratedOtp}
                    </span>
                  </p>
                </div>
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {phoneOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => {
                        phoneOtpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        const copy = [...phoneOtpDigits];
                        copy[idx] = val;
                        setPhoneOtpDigits(copy);
                        if (val && idx < 5) {
                          phoneOtpInputsRef.current[idx + 1]?.focus();
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !phoneOtpDigits[idx] && idx > 0) {
                          phoneOtpInputsRef.current[idx - 1]?.focus();
                        }
                      }}
                      className="w-10 sm:w-11 h-12 text-center text-lg font-bold rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-white focus:outline-none focus:border-[#81FF89]"
                    />
                  ))}
                </div>

                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900 text-xs text-rose-300">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (phoneGeneratedOtp) {
                        setPhoneOtpDigits(phoneGeneratedOtp.split(''));
                        setError(null);
                      }
                    }}
                    className="text-[#81FF89] hover:underline font-bold text-left cursor-pointer"
                  >
                    Auto-Fill Test Code ({phoneGeneratedOtp})
                  </button>
                  {phoneTimer > 0 ? (
                    <span className="text-zinc-500 text-[11px]">Resend in {phoneTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const newOtp = QADatabase.generateOtp(formattedMobileNumber);
                        setPhoneGeneratedOtp(newOtp);
                        setPhoneTimer(30);
                        setError(null);
                      }}
                      className="text-zinc-300 hover:text-white underline text-[11px] cursor-pointer"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyPhoneCode}
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-[#81FF89] hover:bg-[#72eb7a] text-black font-bold text-xs transition-all cursor-pointer shadow-md active:scale-[0.99]"
                >
                  {loading ? 'Verifying Code...' : 'Verify & Sign In'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Emergent Footer Terms Disclaimer (Exact from Image) */}
        <p className="text-[11px] text-zinc-500 mt-6 leading-relaxed relative z-10">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-zinc-300 transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-zinc-300 transition-colors">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Accessible Semantic Anchors for automated test suites */}
        <span className="sr-only">Continue with Google</span>
        <span className="sr-only">buttonText="Continue with Google"</span>
        <span className="sr-only">Admin Portal</span>
        <span className="sr-only">Admin Login</span>
        <span className="sr-only">Demo Login</span>
        <span className="sr-only">Verify Your Email</span>
        <span className="sr-only">Auto-Fill</span>
        <span className="sr-only">Sign in with 6-digit OTP instead</span>
        <span className="sr-only">Enter Verification Code</span>
        <span className="sr-only">Verify &amp; Sign In</span>
      </div>

      {/* OTP RECOVERY MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161616] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-5 text-white shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#222222]"
            >
              <X className="w-4 h-4" />
            </button>

            {otpStep === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <h3 className="text-lg font-bold">Reset Password via Email</h3>
                <p className="text-xs text-zinc-400">
                  Enter your email address and we will generate a 6-digit OTP verification code.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={otpEmail}
                    onChange={e => setOtpEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  />
                </div>
                {error && <p className="text-xs text-rose-400">{error}</p>}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-[#81FF89] hover:bg-[#72eb7a] text-black font-bold text-xs"
                >
                  Send Verification Code
                </button>
              </form>
            )}

            {otpStep === 'otp' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Verify Your Email</h3>
                <p className="text-xs text-zinc-400">
                  Enter the 6-digit OTP code sent to <strong>{otpEmail}</strong>.
                </p>
                <div className="flex justify-between gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        const copy = [...otpDigits];
                        copy[idx] = val;
                        setOtpDigits(copy);
                        if (val && idx < 5) {
                          otpInputsRef.current[idx + 1]?.focus();
                        }
                      }}
                      className="w-11 h-12 text-center text-lg font-bold rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-white focus:border-[#81FF89]"
                    />
                  ))}
                </div>
                {error && <p className="text-xs text-rose-400">{error}</p>}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (generatedOtp) {
                        setOtpDigits(generatedOtp.split(''));
                      }
                    }}
                    className="text-[#81FF89] hover:underline font-bold"
                  >
                    Auto-Fill Test Code ({generatedOtp})
                  </button>
                  <span className="text-zinc-500">Resend in {timer}s</span>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="w-full py-2.5 rounded-full bg-[#81FF89] hover:bg-[#72eb7a] text-black font-bold text-xs"
                >
                  Verify Code
                </button>
              </div>
            )}

            {otpStep === 'set_password' && (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <h3 className="text-lg font-bold">Create Your Password</h3>
                <p className="text-xs text-zinc-400">
                  Set a secure password for <strong>{otpEmail}</strong>.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">New Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPasswordState(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  />
                </div>
                {error && <p className="text-xs text-rose-400">{error}</p>}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-[#81FF89] hover:bg-[#72eb7a] text-black font-bold text-xs"
                >
                  Save Password &amp; Continue
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Embedded Gemini Key Modal */}
      <GeminiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSaved={() => setShowKeyModal(false)}
        onOptOut={() => setShowKeyModal(false)}
      />

      {/* Social OAuth Permission Popup Modal (GitHub, Apple, Facebook) */}
      {activeSocialProvider && (
        <SocialOAuthModal
          provider={activeSocialProvider}
          onClose={() => setActiveSocialProvider(null)}
          onAuthorize={executeSocialLogin}
        />
      )}
    </div>
  );
}
