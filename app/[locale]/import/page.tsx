"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Link2, Loader2, Globe } from "lucide-react";

const CATEGORIES = [
  "ai",
  "web",
  "design",
  "mobile",
  "devops",
  "data",
  "security",
  "productivity",
  "tools",
] as const;

interface Collection {
  id: string;
  title: string;
  category: string;
}

export default function QuickImportPage() {
  const t = useTranslations("quickImport");
  const ct = useTranslations("categories");
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [favicon, setFavicon] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionId, setCollectionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPreview, setFetchingPreview] = useState(false);

  // Fetch collections and URL preview
  useEffect(() => {
    if (!user) return;

    // Fetch user's collections
    fetch("/api/users/me/collections")
      .then((res) => res.json())
      .then((data) => {
        if (data.collections) {
          setCollections(data.collections);
          if (data.collections.length > 0) {
            setCollectionId(data.collections[0].id);
          }
        }
      });

    // Get URL params
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");
    const titleParam = params.get("title");

    if (urlParam) {
      setUrl(decodeURIComponent(urlParam));
    }
    if (titleParam) {
      setTitle(decodeURIComponent(titleParam));
    }
  }, [user]);

  // Fetch link preview when URL changes
  useEffect(() => {
    if (!url || !url.startsWith("http")) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setFetchingPreview(true);
      try {
        const res = await fetch(
          `/api/link-preview?url=${encodeURIComponent(url)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.title && !title) setTitle(data.title);
          if (data.description && !description) setDescription(data.description);
          if (data.favicon) setFavicon(data.favicon);
        }
      } catch {
        // Ignore errors
      } finally {
        setFetchingPreview(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [url, title, description]);

  const handleSubmit = async () => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (!url || !collectionId) {
      toast.error(t("fillRequired"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/collections/${collectionId}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          title: title || undefined,
          description: description || undefined,
          favicon: favicon || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t("saveFailed"));
      }

      toast.success(t("saveSuccess"));
      window.close();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("saveFailed"));
    } finally {
      setLoading(false);
    }
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
          <CardHeader>
            <CardTitle>{t("loginRequired")}</CardTitle>
            <CardDescription>{t("loginRequiredDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/signin">{t("goToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link2 className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold">{t("title")}</h1>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("url")}</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="pl-9"
                />
                {fetchingPreview && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("linkTitle")}</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("linkTitlePlaceholder")}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("description")}</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                rows={3}
              />
            </div>

            {/* Collection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("collection")}</label>
              <Select value={collectionId} onValueChange={setCollectionId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCollection")} />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("save")
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
