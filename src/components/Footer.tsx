"use client";

import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslations, useLocale } from "next-intl";

const Footer: React.FC = () => {
  const t = useTranslations("footer");
  const commonT = useTranslations("common");
  const tagsT = useTranslations("tags");
  const headerT = useTranslations("header");
  const locale = useLocale();

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href={`/${locale}`} className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Search className="text-white" size={16} />
              </div>
              <span className="text-lg font-bold gradient-text">
                {headerT("title")}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {t("product")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("explore")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/categories`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {commonT("categories")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/tags`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tagsT("title")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/create`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("createCollection")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {t("community")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/recent`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {commonT("recent")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/favorites`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {commonT("favorites")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {t("about")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("contact")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 border-border/30" />

        <p className="text-center text-sm text-muted-foreground">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
