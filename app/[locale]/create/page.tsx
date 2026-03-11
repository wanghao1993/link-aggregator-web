"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { ArrowLeft, LogIn, LinkIcon } from "lucide-react";
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
    const tags = data.tags
      ? data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, tags }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create collection");
    }

    const result = await res.json();
    router.push(`/collection/${result.id}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{commonT("loading")}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-effect border-border/30 bg-card/60 max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <LogIn size={28} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t("loginRequired")}
              </h2>
              <p className="text-muted-foreground">
                {t("loginRequiredDesc")}
              </p>
            </div>
            <Button
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              asChild
            >
              <Link href="/auth/signin">{t("goToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} className="mr-2" />
          {commonT("back")}
        </Button>

        <div className="mb-8 fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <LinkIcon className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                {t("createTitle")}
              </h1>
              <p className="text-muted-foreground">{t("createSubtitle")}</p>
            </div>
          </div>
        </div>

        <CollectionForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
