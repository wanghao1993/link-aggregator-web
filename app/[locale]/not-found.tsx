"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");
  const commonT = useTranslations("common");
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("message")}</p>
        <Link 
          href="/" 
          className="text-primary underline hover:text-primary/80 transition-colors"
        >
          {commonT("backToHome")}
        </Link>
      </div>
    </div>
  );
}
