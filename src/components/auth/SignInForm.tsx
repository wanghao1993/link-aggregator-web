"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Github, Mail, Lock, RefreshCw, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  captchaInput: z.string().min(1, "Captcha is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export default function SignInForm({
  onSuccess,
  onSwitchToSignUp,
}: SignInFormProps) {
  const t = useTranslations("auth");
  const commonT = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      captchaInput: "",
    },
  });

  const fetchCaptcha = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/captcha");
      if (res.ok) {
        const data = await res.json();
        setCaptchaSvg(data.svg);
        setCaptchaToken(data.token);
        form.setValue("captchaInput", "");
      }
    } catch (err) {
      console.error("Failed to load captcha:", err);
    }
  }, [form]);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const handleSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          captchaToken,
          captchaInput: data.captchaInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "captcha_invalid") {
          toast.error(t("signIn.captchaInvalid"));
          fetchCaptcha();
          throw new Error("captcha_invalid");
        }
        throw new Error(errorData.error || "Invalid email or password");
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      toast.success(t("signIn.success"));
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error && error.message === "captcha_invalid") return;
      console.error("Sign in failed:", error);
      toast.error(error instanceof Error ? error.message : "Sign in failed");
      fetchCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {t("signIn.title")}
        </CardTitle>
        <CardDescription>{t("signIn.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn("github")}
            disabled={isLoading}
            className="w-full"
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn("google")}
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
              {commonT("orContinueWith")}
            </span>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("signIn.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t("signIn.emailPlaceholder")}
                className="pl-10"
                {...form.register("email")}
                disabled={isLoading}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("signIn.password")}</Label>
              <Button variant="link" className="p-0 h-auto text-sm" asChild>
                <Link href="/auth/forgot-password">
                  {t("signIn.forgotPassword")}
                </Link>
              </Button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder={t("signIn.passwordPlaceholder")}
                className="pl-10"
                {...form.register("password")}
                disabled={isLoading}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="captchaInput">{t("signIn.captcha")}</Label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  id="captchaInput"
                  placeholder={t("signIn.captchaPlaceholder")}
                  className="w-32 text-center text-lg tracking-widest"
                  maxLength={4}
                  {...form.register("captchaInput")}
                  disabled={isLoading}
                />
              </div>
              <div
                className="shrink-0 rounded border bg-muted/30 overflow-hidden cursor-pointer select-none"
                onClick={fetchCaptcha}
                title={t("signIn.refreshCaptcha")}
                dangerouslySetInnerHTML={{ __html: captchaSvg }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={fetchCaptcha}
                disabled={isLoading}
                title={t("signIn.refreshCaptcha")}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {form.formState.errors.captchaInput && (
              <p className="text-sm text-red-500">
                {form.formState.errors.captchaInput.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? commonT("signingIn") : t("signIn.signIn")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm w-full">
          <span className="text-muted-foreground">
            {t("signIn.noAccount")}
          </span>{" "}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={onSwitchToSignUp}
            disabled={isLoading}
          >
            {t("signIn.signUpInstead")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
