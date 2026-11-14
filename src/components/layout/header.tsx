'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import QABrandLogo from '@/components/ui/qa-brand-logo';
import WhatsAppDailyModal from '@/components/whatsapp/whatsapp-daily-modal';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';
import ProfileModal from '@/components/profile/profile-modal';
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

    window.addEventListener('intelligentqa_auth_changed', handleAuthChange);
    window.addEventListener('intelligentqa_key_changed', handleKeyChange);
    window.addEventListener('intelligentqa_ai_pref_changed', handleAiPrefChange);

    return () => {
      window.removeEventListener('intelligentqa_auth_changed', handleAuthChange);
      window.removeEventListener('intelligentqa_key_changed', handleKeyChange);
      window.removeEventListener('intelligentqa_ai_pref_changed', handleAiPrefChange);
    };
  }, [syncAuthAndKey]);

  const handleLogout = () => {
    QADatabase.logout();
    syncAuthAndKey();
  };

  // 1. Sleek Minimal Guest Links (Public Home Page - Zero Clutter)
  const guestNavLinks = [
    { href: '/#what-you-get', label: "What You'll Get" },
    { href: '/#curriculum-preview', label: 'Curriculum' },
    { href: '/#faq', label: 'FAQ' },
  ];

  // 2. Member Workspace Links (Visible ONLY after login)
  const memberNavLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tracks', label: 'Tracks' },
    { href: '/sandbox/web', label: 'Web Lab' },
    { href: '/sandbox/api', label: 'API Lab' },
    { href: '/qa-agents', label: 'QA Agents' },
    { href: '/interview-griller', label: 'Interview Griller' },
    { href: '/interview-questions', label: '500+ Questions' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Sidebar Toggle + Brand Logo */}
        <div className="flex items-center gap-2.5">
          {currentUser && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

        {/* Center Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
          {currentUser ? (
            /* Logged-in top bar is clean & uncluttered: top-level menus are in AscentWealth Side Left Navigation */
            <span className="sr-only">
              {memberNavLinks.map(l => l.label).join(' ')}
            </span>
          ) : (
            /* Clean Minimal Public Guest Navigation */
            guestNavLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors font-semibold text-sm text-slate-600"
              >
                {link.label}
              </Link>
            ))
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {currentUser ? (
            /* LOGGED-IN ACTIONS */
            <>
              <WhatsAppDailyModal />

              {/* Gemini API Key / Core Mode Management Pill */}
              <button
                onClick={() => setShowKeyModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                  geminiKey
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:border-emerald-400'
                    : aiPref === 'opted_out'
                    ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:border-sky-400'
                    : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:border-amber-400'
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

              {/* User Profile Menu with Clubbed Log Out & QA Details */}
              <div id="user-profile-menu-container" className="relative pl-1 border-l border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-all shadow-sm cursor-pointer"
                  aria-expanded={profileMenuOpen}
                  aria-label="User profile menu"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {getInitials(currentUser.displayName)}
                  </div>
                  <span className="max-w-[130px] truncate">{currentUser.displayName?.split(' ')[0] || 'Profile'}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Identity Header */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {currentUser.displayName}
                        </span>
                        {currentUser.profileCompleted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {currentUser.targetRole}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Profile Incomplete
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {currentUser.email}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {currentUser.profileCompleted && typeof currentUser.experienceYears === 'number' && currentUser.experienceYears > 0
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
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Complete / Edit QA Profile</span>
                      </button>

                      <Link
                        href="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2.5 transition-colors"
                      >
                        <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>Learning Dashboard</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setShowKeyModal(true);
                        }}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Key className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Gemini AI Key Settings</span>
                      </button>
                    </div>

                    {/* Log Out clubbed inside profile dropdown */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer text-sm"
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
            /* CLEAN GUEST ACTIONS (Ultra-professional, no clutter) */
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up Free</span>
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
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3">
          {currentUser ? (
            /* Logged in Mobile Menu */
            <>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                {memberNavLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800"
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
                  className="py-2 px-3 rounded-xl text-xs font-semibold border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  {geminiKey
                    ? 'Gemini Key Configured'
                    : aiPref === 'opted_out'
                    ? 'Core Mode (No AI)'
                    : 'Connect Free Gemini Key'}
                </button>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{currentUser.displayName}</span>
                    {currentUser.profileCompleted ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                        {currentUser.targetRole}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-800">
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
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-center text-xs font-bold transition-colors"
                    >
                      Edit QA Profile
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="py-2 px-3 bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
              <div className="flex flex-col gap-1 text-xs font-medium">
                {guestNavLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-center text-xs font-semibold"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 bg-emerald-600 text-white rounded-xl text-center text-xs font-bold"
                >
                  Sign Up Free
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
