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
import { Mail, RefreshCw, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  captchaInput: z.string().min(1, "Captcha is required"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const commonT = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
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

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          captchaToken,
          captchaInput: data.captchaInput,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "captcha_invalid") {
          toast.error(t("forgotPassword.captchaInvalid"));
          fetchCaptcha();
          throw new Error("captcha_invalid");
        }
        throw new Error(result.error || t("forgotPassword.sendError"));
      }

      setSentEmail(data.email);
      setEmailSent(true);
      toast.success(t("forgotPassword.emailSent"));
    } catch (error) {
      if (error instanceof Error && error.message === "captcha_invalid") return;
      console.error("Forgot password failed:", error);
      toast.error(error instanceof Error ? error.message : t("forgotPassword.sendError"));
      fetchCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t("forgotPassword.checkEmail")}
            </CardTitle>
            <CardDescription>
              {t("forgotPassword.emailSentDesc", { email: sentEmail })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t("forgotPassword.noEmail")}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setEmailSent(false);
                setSentEmail("");
                form.reset();
                fetchCaptcha();
              }}
            >
              {t("forgotPassword.tryAnotherEmail")}
            </Button>
            <Button variant="link" asChild className="w-full">
              <Link href="/auth/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("forgotPassword.backToSignIn")}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {t("forgotPassword.title")}
          </CardTitle>
          <CardDescription>
            {t("forgotPassword.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("forgotPassword.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("forgotPassword.emailPlaceholder")}
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
              <Label htmlFor="captchaInput">{t("forgotPassword.captcha")}</Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    id="captchaInput"
                    placeholder={t("forgotPassword.captchaPlaceholder")}
                    className="w-32 text-center text-lg tracking-widest"
                    maxLength={4}
                    {...form.register("captchaInput")}
                    disabled={isLoading}
                  />
                </div>
                <div
                  className="shrink-0 rounded border bg-muted/30 overflow-hidden cursor-pointer select-none"
                  onClick={fetchCaptcha}
                  title={t("forgotPassword.refreshCaptcha")}
                  dangerouslySetInnerHTML={{ __html: captchaSvg }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={fetchCaptcha}
                  disabled={isLoading}
                  title={t("forgotPassword.refreshCaptcha")}
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
              {isLoading ? commonT("sending") : t("forgotPassword.sendResetLink")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="link" asChild className="w-full">
            <Link href="/auth/signin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("forgotPassword.backToSignIn")}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
