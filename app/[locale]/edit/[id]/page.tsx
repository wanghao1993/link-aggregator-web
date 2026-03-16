"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { ArrowLeft, LogIn, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CollectionForm, {
  type CollectionFormValues,
} from "@/components/CollectionForm";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations("collectionForm");
  const commonT = useTranslations("common");

  const [defaultValues, setDefaultValues] =
    useState<CollectionFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollection() {
      try {
        const res = await fetch(`/api/collections/${id}`);
        if (!res.ok) throw new Error("Failed to fetch collection");
        const data = await res.json();
        setDefaultValues({
          title: data.title,
          description: data.description,
          category: data.category?.id || data.category || "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
          links: (data.links || []).map(
            (link: { title: string; url: string; description?: string }) => ({
              title: link.title,
              url: link.url,
              description: link.description || "",
            })
          ),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchCollection();
  }, [id]);

  const handleSubmit = async (data: CollectionFormValues) => {
    const tags = data.tags
      ? data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const res = await fetch(`/api/collections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, tags }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update collection");
    }

    router.push(`/collection/${id}`);
  };

  if (authLoading || loading) {
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
              className="bg-brand-gradient hover:opacity-90 transition-opacity"
              asChild
            >
              <Link href="/auth/signin">{t("goToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            {commonT("error")}
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft size={16} className="mr-2" />
            {commonT("back")}
          </Button>
        </div>
      </div>
    );
  }

  if (!defaultValues) return null;

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
            <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center">
              <Pencil className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                {t("editTitle")}
              </h1>
              <p className="text-muted-foreground">{t("editSubtitle")}</p>
            </div>
          </div>
        </div>

        <CollectionForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isEdit
        />
      </div>
    </div>
  );
}
