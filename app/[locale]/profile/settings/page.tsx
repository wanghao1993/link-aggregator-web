"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Globe, MapPin, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { toast } from "sonner";

interface ProfileData {
  displayName: string;
  bio: string;
  website: string;
  location: string;
}

export default function ProfileSettings() {
  const t = useTranslations("profileSettings");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileData>({
    displayName: "",
    bio: "",
    website: "",
    location: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          displayName: data.displayName || "",
          bio: data.bio || "",
          website: data.website || "",
          location: data.location || "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("error"));
      }
      toast.success(t("success"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error"));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted/30 rounded w-48" />
          <div className="h-64 bg-muted/30 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={18} className="mr-2" />
        {t("title")}
      </Button>

      <Card className="glass-effect border-border/30 bg-card/60">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t("displayName")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  placeholder={t("displayNamePlaceholder")}
                  className="pl-10"
                  maxLength={50}
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t("bio")}</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="bio"
                  placeholder={t("bioPlaceholder")}
                  className="pl-10 min-h-[100px] resize-none"
                  maxLength={200}
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                />
                <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                  {form.bio.length}/200
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">{t("website")}</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  placeholder={t("websitePlaceholder")}
                  className="pl-10"
                  value={form.website}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, website: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t("location")}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder={t("locationPlaceholder")}
                  className="pl-10"
                  maxLength={100}
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {saving ? t("saving") : t("save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
