'use client';

import React, { useState } from 'react';
import { QABrandLogo } from '@/components/ui/qa-brand-logo';
import { ShieldCheck, Check, Mail, Ban, Clock, Building2, X, ExternalLink } from 'lucide-react';

export type SocialProvider = 'github' | 'apple' | 'facebook';

interface SocialOAuthModalProps {
  provider: SocialProvider | null;
  onClose: () => void;
  onAuthorize: (provider: SocialProvider, userIdentifier: string) => void;
}

export default function SocialOAuthModal({
  provider,
  onClose,
  onAuthorize,
}: SocialOAuthModalProps) {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [accountHandle, setAccountHandle] = useState(() => {
    if (provider === 'github') return 'sdet_engineer';
    if (provider === 'apple') return 'user@icloud.com';
    return 'qa.engineer';
  });

  if (!provider) return null;

  const handleAuthorize = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      onAuthorize(provider, accountHandle);
    }, 600);
  };

  const providerDetails = {
    github: {
      name: 'GitHub',
      displayName: 'GitHub account',
      accountLabel: 'sdet_engineer',
      btnColor: 'bg-[#238636] hover:bg-[#2ea043] text-white',
      logo: (
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      ),
    },
    apple: {
      name: 'Apple',
      displayName: 'Apple ID',
      accountLabel: 'user@icloud.com',
      btnColor: 'bg-white hover:bg-zinc-200 text-black',
      logo: (
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.93.04-2.07.62-2.73 1.4-.58.67-1.09 1.76-.95 2.83 1.04.08 2.1-.53 2.72-1.27z" />
        </svg>
      ),
    },
    facebook: {
      name: 'Facebook',
      displayName: 'Facebook account',
      accountLabel: 'qa.engineer',
      btnColor: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      logo: (
        <svg className="w-8 h-8 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  }[provider];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-md bg-[#0D1117] border border-[#30363D] rounded-3xl p-6 sm:p-8 space-y-6 text-white shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-[#21262D] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Connected Logos Row: [App Logo] --- [Shield] --- [Provider Logo] */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[#161B22] border border-[#30363D] flex items-center justify-center shadow-md">
            <QABrandLogo size={32} showText={false} />
          </div>

          <div className="flex items-center gap-1 text-zinc-600">
            <div className="w-6 border-t border-dashed border-[#30363D]" />
            <div className="w-6 h-6 rounded-full bg-[#161B22] border border-[#30363D] flex items-center justify-center text-emerald-400 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="w-6 border-t border-dashed border-[#30363D]" />
          </div>

          <div className="w-14 h-14 rounded-2xl bg-[#161B22] border border-[#30363D] flex items-center justify-center shadow-md">
            {providerDetails.logo}
          </div>
        </div>

        {/* Title & Prompt */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white">
            <span className="text-[#58A6FF]">IntelligentQA</span> by IntelligentQA
          </h2>
          <p className="text-sm text-zinc-300 font-medium">
            wants access to your {providerDetails.displayName}
          </p>
        </div>

        {/* OAuth Permissions Box */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 text-left space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-zinc-200 mb-2">Authorizing allows this app to:</h4>
            <div className="space-y-2 text-zinc-300">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Verify your {providerDetails.name} identity (<strong>{accountHandle}</strong>)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Know which learning resources you can access</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Sync your SDET progress{' '}
                  <span className="text-[#58A6FF] underline cursor-pointer">
                    What does this mean?
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#21262D] pt-3 space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Resources on your account
            </span>
            <div className="flex items-center gap-2.5 text-zinc-300 bg-[#0D1117] p-2.5 rounded-xl border border-[#21262D]">
              <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
              <div>
                <span className="font-bold block text-white">Email addresses (read)</span>
                <span className="text-[11px] text-zinc-400">
                  View your verified email addresses
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#21262D] pt-3 space-y-1.5 text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <Ban className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>IntelligentQA is not owned or operated by {providerDetails.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Created 2 years ago · Verified Educational Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>More than 5K Active SDET Engineers</span>
            </div>
          </div>
        </div>

        {/* Actions: Authorize & Cancel */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleAuthorize}
            disabled={isAuthorizing}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 ${providerDetails.btnColor}`}
          >
            {isAuthorizing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authorizing {providerDetails.name}...</span>
              </span>
            ) : (
              <span>Authorize IntelligentQA</span>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isAuthorizing}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-zinc-300 hover:text-white bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Redirect Notice */}
        <p className="text-[11px] text-zinc-500">
          Authorizing will redirect to{' '}
          <span className="text-zinc-400 font-mono">https://auth.intelligentqa.io</span>
        </p>
      </div>
    </div>
  );
}
