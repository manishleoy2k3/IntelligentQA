'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import QABrandLogo from '@/components/ui/qa-brand-logo';
import WhatsAppDailyModal from '@/components/whatsapp/whatsapp-daily-modal';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';
import ProfileModal from '@/components/profile/profile-modal';
import ThemeToggle from '@/components/layout/theme-toggle';
import { QADatabase, getInitials } from '@/lib/qa-db';
import {
  Menu,
  X,
  Sparkles,
  Bot,
  PlayCircle,
  Server,
  Layers,
  Award,
  BookOpen,
  User,
  Key,
  LogOut,
  UserPlus,
  LogIn,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  Clock,
} from 'lucide-react';

export default function Header({
  onToggleMobileSidebar,
}: {
  onToggleMobileSidebar?: () => void;
} = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [aiPref, setAiPref] = useState<'enabled' | 'opted_out' | 'unset'>('unset');
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#user-profile-menu-container')) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [profileMenuOpen]);

  const syncAuthAndKey = useCallback(() => {
    if (typeof window !== 'undefined') {
      const user = QADatabase.getCurrentUser();
      setCurrentUser(user);
      const key = QADatabase.getUserGeminiKey(user?.id);
      setGeminiKey(key);
      const pref = QADatabase.getAiPreference(user?.id);
      setAiPref(pref);
    }
  }, []);

  useEffect(() => {
    syncAuthAndKey();

    const handleAuthChange = () => syncAuthAndKey();
    const handleKeyChange = () => syncAuthAndKey();
    const handleAiPrefChange = () => syncAuthAndKey();
    const handleOpenProfileModal = () => setShowProfileModal(true);

    window.addEventListener('intelligentqa_auth_changed', handleAuthChange);
    window.addEventListener('intelligentqa_key_changed', handleKeyChange);
    window.addEventListener('intelligentqa_ai_pref_changed', handleAiPrefChange);
    window.addEventListener('intelligentqa_open_profile_modal', handleOpenProfileModal);

    return () => {
      window.removeEventListener('intelligentqa_auth_changed', handleAuthChange);
      window.removeEventListener('intelligentqa_key_changed', handleKeyChange);
      window.removeEventListener('intelligentqa_ai_pref_changed', handleAiPrefChange);
      window.removeEventListener('intelligentqa_open_profile_modal', handleOpenProfileModal);
    };
  }, [syncAuthAndKey]);

  const handleLogout = () => {
    QADatabase.logout();
    syncAuthAndKey();
  };

  // 1. Sleek Minimal Guest Links (Public Home Page - Zero Clutter)
  const guestNavLinks = [
    { href: '/learning', label: 'Academy' },
    { href: '/#what-you-get', label: "What You'll Get" },
    { href: '/#curriculum-preview', label: 'Curriculum' },
    { href: '/#faq', label: 'FAQs' },
  ];

  // 2. Member Workspace Links (Visible ONLY after login)
  const memberNavLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/learning', label: 'Academy' },
    { href: '/tracks', label: 'Tracks' },
    { href: '/sandbox/api', label: 'API Testing Lab' },
    { href: '/prompt-lab', label: 'Prompt Lab' },
    { href: '/qa-agents', label: 'AI QA Agents' },
    { href: '/interview-questions', label: 'Interview Questions' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#262626] text-slate-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Sidebar Toggle + Brand Logo */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2.5 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#1E1E1E] transition-colors cursor-pointer"
              aria-label="Toggle Side Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo (routes to dashboard if logged in, home if guest) */}
          <Link href={currentUser ? '/dashboard' : '/'} className="shrink-0 flex items-center">
            <QABrandLogo size="md" showText={true} />
          </Link>
        </div>

        {/* Center Navigation Bar (Clean Testsigma Style) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {currentUser ? (
            /* Logged-in top bar is clean & uncluttered: top-level menus are in Side Left Navigation */
            <span className="sr-only">{memberNavLinks.map((l) => l.label).join(' ')}</span>
          ) : (
            /* Clean Minimal Public Guest Navigation */
            guestNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800/60 transition-colors"
              >
                {link.label}
              </Link>
            ))
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {currentUser ? (
            /* LOGGED-IN ACTIONS */
            <>
              <WhatsAppDailyModal />

              {/* Gemini API Key / Core Mode Management Pill */}
              <button
                onClick={() => setShowKeyModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                  geminiKey
                    ? 'bg-[#161616] border-[#262626] text-[#81FF89] hover:border-[#81FF89]/50 shadow-[0_0_15px_rgba(129,255,137,0.15)]'
                    : aiPref === 'opted_out'
                      ? 'bg-[#161616] border-[#262626] text-[#80FFF9] hover:border-[#80FFF9]/50'
                      : 'bg-[#161616] border-amber-500/40 text-amber-300 hover:border-amber-400'
                }`}
                title="Manage your Google AI Studio key or toggle Core Automation mode"
              >
                <Key className="w-4 h-4" />
                <span>
                  {geminiKey
                    ? 'Gemini Key Active'
                    : aiPref === 'opted_out'
                      ? 'Core Mode (No AI)'
                      : 'Add Gemini Key'}
                </span>
              </button>

              {/* Visual Theme Toggle */}
              <ThemeToggle showLabel={false} />

              {/* User Profile Menu with Clubbed Log Out & QA Details */}
              <div
                id="user-profile-menu-container"
                className="relative pl-1 border-l border-slate-200 dark:border-[#262626]"
              >
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#161616] dark:hover:bg-[#1E1E1E] border border-slate-200 dark:border-[#262626] text-slate-900 dark:text-white transition-all shadow-sm cursor-pointer"
                  aria-expanded={profileMenuOpen}
                  aria-label="User profile menu"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 text-black font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {getInitials(currentUser.displayName)}
                  </div>
                  <span className="max-w-[130px] truncate">
                    {currentUser.displayName?.split(' ')[0] || 'Profile'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 dark:text-[#A1A1AA] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-76 bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#262626] rounded-[24px] shadow-2xl p-4 space-y-3 z-50 text-slate-900 dark:text-white animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Identity Header */}
                    <div className="p-3.5 bg-slate-50 dark:bg-[#1F1F1F] rounded-[18px] space-y-1.5 border border-slate-200 dark:border-[#262626]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {currentUser.displayName}
                        </span>
                        {currentUser.profileCompleted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#81FF89]/15 text-emerald-800 dark:text-[#81FF89] border border-emerald-500/30">
                            {currentUser.targetRole}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            Profile Incomplete
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-[#A1A1AA] truncate">
                        {currentUser.email}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-[#D4D4D8] flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-[#81FF89] shrink-0" />
                        <span>
                          {currentUser.profileCompleted &&
                          typeof currentUser.experienceYears === 'number' &&
                          currentUser.experienceYears > 0
                            ? `${currentUser.experienceYears} Years QA Experience`
                            : currentUser.profileCompleted && currentUser.experienceYears === 0
                              ? 'Fresher / Beginner QA'
                              : 'Experience Not Set'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1 text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setShowProfileModal(true);
                        }}
                        className="w-full px-3.5 py-2.5 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-[#222222] text-slate-700 dark:text-[#D4D4D8] hover:text-slate-950 dark:hover:text-white font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-600 dark:text-[#81FF89] shrink-0" />
                        <span>Complete / Edit QA Profile</span>
                      </button>

                      <Link
                        href="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="w-full px-3.5 py-2.5 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-[#222222] text-slate-700 dark:text-[#D4D4D8] hover:text-slate-950 dark:hover:text-white font-medium flex items-center gap-2.5 transition-colors"
                      >
                        <Layers className="w-4 h-4 text-sky-600 dark:text-[#80FFF9] shrink-0" />
                        <span>Learning Dashboard</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setShowKeyModal(true);
                        }}
                        className="w-full px-3.5 py-2.5 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-[#222222] text-slate-700 dark:text-[#D4D4D8] hover:text-slate-950 dark:hover:text-white font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Key className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Gemini AI Key Settings</span>
                      </button>
                    </div>

                    {/* Log Out clubbed inside profile dropdown */}
                    <div className="pt-2 border-t border-[#262626]">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-3.5 py-2.5 text-left rounded-xl hover:bg-rose-950/40 text-rose-400 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer text-sm"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* CLEAN GUEST ACTIONS (Testsigma Style) */
            <div className="flex items-center gap-2.5 sm:gap-3">
              <ThemeToggle showLabel={false} />
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white border border-slate-300 dark:border-neutral-700 hover:border-slate-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800/80 shadow-2xs transition-all"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => {
            if (currentUser && onToggleMobileSidebar) {
              onToggleMobileSidebar();
            } else {
              setMobileMenuOpen(!mobileMenuOpen);
            }
          }}
          className="md:hidden p-2 text-[#A1A1AA] hover:text-white hover:bg-[#1E1E1E] rounded-full transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#262626] bg-[#111111] p-4 space-y-3">
          {currentUser ? (
            /* Logged in Mobile Menu */
            <>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                {memberNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-[#161616] text-[#D4D4D8] hover:text-white border border-[#262626]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <WhatsAppDailyModal />

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowKeyModal(true);
                  }}
                  className="py-2.5 px-4 rounded-full text-xs font-semibold border border-[#262626] bg-[#161616] text-[#81FF89] flex items-center justify-center gap-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  {geminiKey
                    ? 'Gemini Key Configured'
                    : aiPref === 'opted_out'
                      ? 'Core Mode (No AI)'
                      : 'Connect Free Gemini Key'}
                </button>

                <div className="p-4 bg-[#161616] rounded-[20px] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate">{currentUser.displayName}</span>
                    {currentUser.profileCompleted ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#81FF89]/15 text-[#81FF89] font-semibold border border-[#81FF89]/30">
                        {currentUser.targetRole}
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
                        Profile Incomplete
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowProfileModal(true);
                      }}
                      className="flex-1 py-2 px-3 bg-white hover:bg-neutral-200 text-black rounded-full text-center text-xs font-bold transition-colors cursor-pointer"
                    >
                      Edit QA Profile
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="py-2 px-3 bg-rose-950/40 text-rose-300 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Minimal Guest Mobile Menu */
            <div className="space-y-3">
              <div className="flex flex-col gap-1 text-sm font-medium">
                {guestNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262626]">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-4 bg-[#1E1E1E] text-white rounded-full text-center text-sm font-semibold"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-4 bg-white text-black font-bold rounded-full text-center text-sm"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gemini Key Modal */}
      <GeminiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSaved={() => {
          syncAuthAndKey();
          setShowKeyModal(false);
        }}
        onOptOut={() => {
          syncAuthAndKey();
          setShowKeyModal(false);
        }}
        reason="Connect your personal free Google AI Studio key (15 RPM / 1,500 requests/day at zero cost) to use AI features, or opt out to focus purely on core traditional automation."
      />
      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSaved={() => syncAuthAndKey()}
      />
    </header>
  );
}
