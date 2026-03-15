"use client";

import React, { useState, useEffect } from "react";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const commonT = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Get token from URL - Supabase sends it as 'token' or 'access_token' param
        const token = searchParams.get("token") || searchParams.get("access_token");
        const type = searchParams.get("type");
        
        // Also check hash fragment for access_token
        const hash = window.location.hash;
        let hashToken: string | null = null;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          hashToken = params.get("access_token");
        }

        const accessToken = token || hashToken;

        if (!accessToken) {
          setError(t("resetPassword.invalidToken"));
          setVerifying(false);
          return;
        }

        // For recovery type, we need to exchange the token for a session
        if (type === "recovery" || accessToken) {
          // Use Supabase client to set the session with the token
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: searchParams.get("refresh_token") || "",
          });

          if (sessionError) {
            console.error("Session error:", sessionError);
            // Try verifyOtp as fallback for PKCE flow
            const { error: otpError } = await supabase.auth.verifyOtp({
              token_hash: accessToken,
              type: "recovery",
            });
            
            if (otpError) {
              console.error("OTP error:", otpError);
              setError(t("resetPassword.invalidToken"));
              setVerifying(false);
              return;
            }
          }

          setSessionReady(true);
          toast.success("Token verified. Please enter your new password.");
        } else {
          setError(t("resetPassword.invalidToken"));
        }
      } catch (err) {
        console.error("Token verification error:", err);
        setError(t("resetPassword.invalidToken"));
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams, t]);

  const handleSubmit = async (data: ResetPasswordFormData) => {
    if (!sessionReady) {
      toast.error("Session not ready. Please try the reset link again.");
      return;
    }

    setIsLoading(true);
    try {
      // Update password using Supabase client (uses current session)
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setIsSuccess(true);
      toast.success(t("resetPassword.success"));

      // Sign out and redirect to sign in
      await supabase.auth.signOut();
      
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (error) {
      console.error("Reset password failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying token
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verifying reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/auth/forgot-password")}
            >
              Request a new reset link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t("resetPassword.passwordResetSuccess")}
            </CardTitle>
            <CardDescription>
              {t("resetPassword.redirectingToSignIn")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {t("resetPassword.title")}
          </CardTitle>
          <CardDescription>
            {t("resetPassword.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("resetPassword.newPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("resetPassword.passwordPlaceholder")}
                  className="pl-10 pr-10"
                  {...form.register("password")}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("resetPassword.confirmPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                  className="pl-10 pr-10"
                  {...form.register("confirmPassword")}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isLoading || !sessionReady} className="w-full">
              {isLoading ? commonT("loading") : t("resetPassword.resetPassword")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
