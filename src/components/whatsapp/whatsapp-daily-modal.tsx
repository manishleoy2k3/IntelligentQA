'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Check, X, Bell, Shield, Sparkles } from 'lucide-react';

export default function WhatsAppDailyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setIsSubscribed(true);
      setLoading(false);
    }, 600);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state on close if completed
    if (isSubscribed) {
      setIsSubscribed(false);
      setPhone('');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp Daily SDET Quiz
      </button>

      {isOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                <MessageCircle className="w-5 h-5" />
                WhatsApp 2-Way Interview Coach
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    1 Real SDET Scenario Every Morning
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    Receive 1 top technical interview question at 9:00 AM on WhatsApp. Reply with
                    your answer or type <strong>&quot;Explain&quot;</strong> to get the full
                    architecture breakdown at zero cost.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    WhatsApp Phone Number (with country code):
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 555 123 4567 or +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                    <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                    Zero-Cost Guarantee &amp; Privacy Shield
                  </div>
                  <p>
                    Operates under Meta Cloud API free tier (1,000 free conversations/month). Zero
                    spam. Cancel anytime by replying STOP.
                  </p>
                </div>

                {/* Primary Action + Cancel Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {loading ? 'Activating...' : 'Activate Daily Coach'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                  Daily WhatsApp Coach Activated!
                </h4>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                  You are all set to receive your first interview question tomorrow morning at 9:00
                  AM on <strong>{phone}</strong>.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
