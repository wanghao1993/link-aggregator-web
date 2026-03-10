"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignInForm from '@/components/auth/SignInForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function SignInPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const t = useTranslations('auth.signIn');
  const commonT = useTranslations('common');

  const handleSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  const handleSwitchToSignUp = () => {
    router.push('/auth/signup');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('success')}</h1>
          <p className="text-muted-foreground">{t('redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {commonT('backToHome')}
          </Link>
        </Button>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">{t('pageSubtitle')}</p>
        </div>
        
        <SignInForm 
          onSuccess={handleSuccess}
          onSwitchToSignUp={handleSwitchToSignUp}
        />
      </div>
    </div>
  );
}