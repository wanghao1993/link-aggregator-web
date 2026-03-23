"use client";

import { useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Bookmark, Copy, Check, ExternalLink } from "lucide-react";

const BOOKMARKLET_BASE = "https://link.wanghao1993.com";

export default function BookmarkletPage() {
  const t = useTranslations("bookmarklet");
  const { user, isLoading: authLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  // Build the bookmarklet code
  const bookmarkletCode = `
    (function() {
      var url = encodeURIComponent(window.location.href);
      var title = encodeURIComponent(document.title);
      var base = "${BOOKMARKLET_BASE}";
      var auth = "${user?.id || ''}";
      if (!auth) {
        alert("Please sign in to Link first!");
        window.open(base + "/auth/signin", "_blank");
        return;
      }
      window.open(base + "/import?url=" + url + "&title=" + title, "_blank");
    })();
  `.trim().replace(/\s+/g, " ");

  const bookmarklet = `javascript:${bookmarkletCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookmarklet);
      setCopied(true);
      toast.success(t("copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
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
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>{t("loginRequired")}</CardTitle>
            <CardDescription>{t("loginRequiredDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/auth/signin">{t("goToLogin")}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("howToUse")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>{t("step1")}</li>
              <li>{t("step2")}</li>
              <li>{t("step3")}</li>
              <li>{t("step4")}</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dragToBookmark")}</CardTitle>
            <CardDescription>{t("bookmarkletDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href={bookmarklet}
              className="block w-full p-4 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors"
            >
              <Bookmark className="w-6 h-6 mx-auto mb-2 text-primary" />
              <span className="font-medium">{t("saveToLink")}</span>
            </a>

            <div className="relative">
              <code className="block w-full p-4 bg-muted rounded-lg text-xs overflow-x-auto break-all">
                {bookmarklet}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("extensionTitle")}</CardTitle>
            <CardDescription>{t("extensionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="https://github.com/wanghao1993/link-aggregator-web/releases" target="_blank" rel="noopener noreferrer">
                {t("downloadExtension")} <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
