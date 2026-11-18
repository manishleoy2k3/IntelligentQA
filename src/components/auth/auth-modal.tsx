'use client';

import React, { useState, useEffect } from 'react';
import AscentAuthCard from '@/components/auth/ascent-auth-card';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialMode?: 'login' | 'signup';
  redirectTo?: string;
}

export default function AuthModal({
  isOpen: propsIsOpen,
  onClose: propsOnClose,
  initialMode = 'signup',
  redirectTo = '/',
}: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(propsIsOpen || false);
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  useEffect(() => {
    if (propsIsOpen !== undefined) {
      setIsOpen(propsIsOpen);
    }
  }, [propsIsOpen]);

  useEffect(() => {
    const handleOpen = (e: any) => {
      setMode(e.detail?.mode || 'signup');
      setIsOpen(true);
    };

    window.addEventListener('intelligentqa_open_auth_modal', handleOpen);
    return () => {
      window.removeEventListener('intelligentqa_open_auth_modal', handleOpen);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (propsOnClose) {
      propsOnClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-[480px]">
        <AscentAuthCard
          initialMode={mode}
          redirectTo={redirectTo}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
