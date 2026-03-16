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
  const tagsT = useTranslations("tags");
  const headerT = useTranslations("header");
  const locale = useLocale();

  const year = new Date().getFullYear();

  const productLinks = [
    { href: `/${locale}`, label: t("explore") },
    { href: `/${locale}/categories`, label: commonT("categories") },
    { href: `/${locale}/tags`, label: tagsT("title") },
    { href: `/${locale}/create`, label: t("createCollection") },
    { href: `/${locale}/recent`, label: commonT("recent") },
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
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand & Newsletter */}
            <div className="lg:col-span-5 space-y-6">
              {/* Logo */}
              <Link
                href={`/${locale}`}
                className="inline-flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-gradient group-hover:scale-105 transition-transform">
                  <Search className="text-white" size={20} />
                </div>
                <div>
                  <span className="text-xl font-bold gradient-text">
                    {headerT("title")}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {headerT("subtitle")}
                  </p>
                </div>
              </Link>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                {t("description")}
              </p>

              {/* Newsletter */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Subscribe to our newsletter
                </p>
                <form className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 bg-background/50"
                  />
                  <Button
                    type="submit"
                    size="default"
                    className="bg-brand-gradient hover:opacity-90 shrink-0"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Subscribe
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground">
                  Get the latest collections and updates delivered to your inbox.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4 pt-2">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-105"
                    aria-label={label}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Product Links */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t("product")}
                </h3>
                <ul className="space-y-3">
                  {productLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 hover:translate-x-0.5 transform duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Community Links */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {t("community")}
                </h3>
                <ul className="space-y-3">
                  {communityLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 hover:translate-x-0.5 transform duration-200"
                      >
                        {link.label}
                        {link.external && (
                          <ExternalLink size={12} className="opacity-50" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Resources
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href={`/${locale}/rss.xml`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 hover:translate-x-0.5 transform duration-200"
                    >
                      <Rss size={12} className="opacity-50" />
                      RSS Feed
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 hover:translate-x-0.5 transform duration-200"
                    >
                      <Github size={12} className="opacity-50" />
                      Open Source
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 hover:translate-x-0.5 transform duration-200"
                    >
                      API Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 hover:translate-x-0.5 transform duration-200"
                    >
                      Status
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <Separator className="border-border/30" />
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            {t("copyright", { year })}
          </p>

          {/* Made with love */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart
              size={14}
              className="text-red-500 fill-red-500 animate-pulse"
            />
            <span>by the community</span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link
              href="#"
              className="hover:text-foreground transition-colors"
            >
              {t("terms")}
            </Link>
            <span className="opacity-30">•</span>
            <Link
              href="#"
              className="hover:text-foreground transition-colors"
            >
              {t("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
