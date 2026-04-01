"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  Github,
  X,
  Mail,
  Heart,
  ExternalLink,
  Rss,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";

const Footer: React.FC = () => {
  const t = useTranslations("footer");
  const commonT = useTranslations("common");
  const headerT = useTranslations("header");
  const locale = useLocale();

  const year = new Date().getFullYear();

  const productLinks = [
    { href: `/${locale}`, label: t("explore") },
    { href: `/${locale}/categories`, label: commonT("categories") },
    { href: `/${locale}/create`, label: t("createCollection") },
  ];

  const communityLinks = [
    { href: "#", label: t("about"), external: false },
    { href: "#", label: t("contact"), external: false },
    { href: "#", label: t("terms"), external: false },
    { href: "#", label: t("privacy"), external: false },
  ];

  const socialLinks = [
    {
      href: "https://github.com",
      label: "GitHub",
      icon: Github,
    },
    {
      href: "https://twitter.com",
      label: "Twitter",
      icon: X,
    },
    {
      href: `/${locale}/rss.xml`,
      label: "RSS",
      icon: Rss,
    },
  ];

  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bottom Bar */}
        <Separator className="border-border/30" />
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            {t("copyright", { year })}
          </p>

          {/* Made with love */}
          {/* <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart
              size={14}
              className="text-red-500 fill-red-500 animate-pulse"
            />
            <span>by the community</span>
          </div> */}

          {/* Quick Links */}
          {/* <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              {t("terms")}
            </Link>
            <span className="opacity-30">•</span>
            <Link href="#" className="hover:text-foreground transition-colors">
              {t("privacy")}
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
