'use client';

import React, { useState, useEffect } from 'react';
import { User, Briefcase, Clock, Compass, Save, X, Sparkles, Check } from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';
import { TrackId, UserProfile } from '@/types/qa';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updated: UserProfile) => void;
  title?: string;
  subtitle?: string;
}

export default function ProfileModal({
  isOpen,
  onClose,
  onSaved,
  title = 'Complete Your QA Profile',
  subtitle = 'Help us tailor your roadmap and interview questions to your background.',
}: ProfileModalProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [targetRole, setTargetRole] = useState<'Manual QA' | 'Automation Tester' | 'SDET' | 'QA Lead' | 'Test Architect'>('Manual QA');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [primaryTrack, setPrimaryTrack] = useState<TrackId>('playwright-ts');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const user = QADatabase.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setDisplayName(user.displayName || '');
        setTargetRole((user.targetRole as any) || 'Manual QA');
        setExperienceYears(typeof user.experienceYears === 'number' ? user.experienceYears : 0);
        setPrimaryTrack((user.primaryTrack as TrackId) || 'playwright-ts');
      }
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);

    try {
      const updated = await QADatabase.updateProfile(currentUser.id, {
        displayName: displayName.trim() || currentUser.displayName,
        targetRole,
        experienceYears: Number(experienceYears),
        primaryTrack,
        profileCompleted: true,
      });

      if (updated) {
        onSaved?.(updated);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Profile Customization</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-4 text-sm">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              Your Full Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Manish Kumar"
              className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
            />
          </div>

          {/* Current QA Role */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Current Role
            </label>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value as any)}
              className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base cursor-pointer"
            >
              <option value="Manual QA">Manual QA Engineer (Testing manually, starting automation)</option>
              <option value="Automation Tester">Automation Tester (Junior / Mid automation)</option>
              <option value="SDET">SDET (Full SDET / Framework author)</option>
              <option value="QA Lead">QA Lead / Test Manager</option>
              <option value="Test Architect">Test Architect / Principal Engineer</option>
            </select>
          </div>

          {/* Years of Experience */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              Years of QA / Testing Experience
            </label>
            <select
              value={experienceYears}
              onChange={e => setExperienceYears(Number(e.target.value))}
              className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base cursor-pointer"
            >
              <option value={0}>Fresher / Transitioning to QA (&lt; 1 Year)</option>
              <option value={1}>1 Year of QA Experience</option>
              <option value={2}>2 Years of QA Experience</option>
              <option value={3}>3 Years of QA Experience</option>
              <option value={4}>4 Years of QA Experience</option>
              <option value={5}>5 - 7 Years of QA Experience</option>
              <option value={8}>8+ Years of Senior QA Experience</option>
            </select>
          </div>

          {/* Primary Learning Track */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-slate-400" />
              Primary Target Automation Framework
            </label>
            <select
              value={primaryTrack}
              onChange={e => setPrimaryTrack(e.target.value as TrackId)}
              className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base cursor-pointer"
            >
              <option value="playwright-ts">Playwright with TypeScript (Recommended for fastest SDET transition)</option>
              <option value="selenium-java">Selenium WebDriver with Java (Enterprise standard)</option>
              <option value="api-testing">API Automation (Postman + RestAssured + Playwright API)</option>
              <option value="ai-qa">AI for QA &amp; Autonomous Testing Agents</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm flex items-center gap-2 text-sm cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
