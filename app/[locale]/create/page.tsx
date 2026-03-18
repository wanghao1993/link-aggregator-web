"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { ArrowLeft, LogIn, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CollectionForm, {
  type CollectionFormValues,
} from "@/components/CollectionForm";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function CreateCollectionPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations("collectionForm");
  const commonT = useTranslations("common");

  const handleSubmit = async (data: CollectionFormValues) => {
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || t("createError"));
    }

    const result = await res.json();
    router.push(`/collection/${result.id}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <LogIn size={28} className="text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{t("loginRequired")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("loginRequiredDesc")}
              </p>
            </div>
            <Button className="w-full" asChild>
              <Link href="/auth/signin">{t("goToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 -ml-2"
        >
          <ArrowLeft size={16} className="mr-2" />
          {commonT("back")}
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{t("createTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("createSubtitle")}
            </p>
          </div>
        </div>

        <CollectionForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
