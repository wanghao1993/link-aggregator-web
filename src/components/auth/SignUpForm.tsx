"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Github, Mail, Lock, Key, User, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  verificationCode: z.string().length(6, 'Verification code must be 6 digits'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function SignUpForm({ onSuccess, onSwitchToLogin }: SignUpFormProps) {
  const t = useTranslations('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'verification'>('email');
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      verificationCode: '',
    },
  });

  const email = watch('email');

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(60); // 60 seconds
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendVerificationCode = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to send verification code
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmailSent(true);
        setStep('verification');
        startCountdown();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Failed to send verification code:', error);
      alert(error instanceof Error ? error.message : 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess?.();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'github' | 'google') => {
    // Use dev OAuth in development, real OAuth in production
    const isDev = !process.env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID.includes('dev');
    
    if (isDev) {
      // Development mode - use mock OAuth
      window.location.href = `/api/auth/dev-oauth/callback?provider=${provider}&state=dev_${Date.now()}`;
    } else {
      // Production mode - use real OAuth
      window.location.href = `/api/auth/signin/${provider}`;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{t('signUp.title')}</CardTitle>
        <CardDescription>{t('signUp.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
            className="w-full"
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            className="w-full"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t('common.orContinueWith')}
            </span>
          </div>
        </div>

        {/* Email Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 'email' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{t('signUp.name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder={t('signUp.namePlaceholder')}
                    className="pl-10"
                    {...register('name')}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('signUp.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('signUp.emailPlaceholder')}
                    className="pl-10"
                    {...register('email')}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('signUp.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('signUp.passwordPlaceholder')}
                    className="pl-10"
                    {...register('password')}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleSendVerificationCode}
                disabled={isLoading || !email || !!errors.email}
                className="w-full"
              >
                {isLoading ? t('common.sending') : t('signUp.sendVerificationCode')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === 'verification' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="verificationCode">{t('signUp.verificationCode')}</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="verificationCode"
                    placeholder="123456"
                    className="pl-10 text-center text-lg tracking-widest"
                    maxLength={6}
                    {...register('verificationCode')}
                    disabled={isLoading}
                  />
                </div>
                {errors.verificationCode && (
                  <p className="text-sm text-red-500">{errors.verificationCode.message}</p>
                )}
              </div>

              {emailSent && (
                <p className="text-sm text-green-600">
                  {t('signUp.verificationSent', { email })}
                </p>
              )}

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('email')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {t('common.back')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || countdown > 0}
                  className="flex-1"
                >
                  {isLoading ? t('common.verifying') : t('signUp.verifyAndRegister')}
                  {countdown > 0 && ` (${countdown}s)`}
                </Button>
              </div>

              {countdown === 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSendVerificationCode}
                  disabled={isLoading}
                  className="w-full text-sm"
                >
                  {t('signUp.resendCode')}
                </Button>
              )}
            </>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm w-full">
          <span className="text-muted-foreground">{t('signUp.haveAccount')}</span>{' '}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={onSwitchToLogin}
            disabled={isLoading}
          >
            {t('signUp.signInInstead')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}