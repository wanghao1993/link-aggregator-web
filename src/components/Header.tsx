"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Heart,
  User,
  Grid3X3,
  Clock,
  Home,
  Globe,
  LogIn,
  LogOut,
  Plus,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { useTranslations } from "next-intl";
import { locales } from "@/locales";
import { useAuth } from "@/lib/supabase/auth-context";

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const headerT = useTranslations("header");
  const { user, isLoading: authLoading, signOut } = useAuth();

  const isActive = (path: string) => pathname === path;

  const tagsT = useTranslations("tags");

  const navItems = [
    { path: "/", label: t("home"), icon: Home },
    { path: "/categories", label: t("categories"), icon: Grid3X3 },
    { path: "/tags", label: tagsT("title"), icon: Tag },
    { path: "/recent", label: t("recent"), icon: Clock },
    { path: "/favorites", label: t("favorites"), icon: Heart },
  ];

  return (
    <header
      data-cmp="Header"
      className="sticky top-0 z-50 glass-effect border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Search className="text-white" size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">{headerT('title')}</h1>
              <p className="text-xs text-muted-foreground">{headerT('subtitle')}</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                href={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(path)
                    ? "bg-primary/20 text-primary shadow-lg backdrop-blur-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon size={16} />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="flex items-center space-x-1">
              <Globe className="text-muted-foreground" size={16} />
              <select
                className="bg-transparent text-sm text-foreground border-none focus:outline-none"
                onChange={(e) => {
                  const newLocale = e.target.value;
                  const currentPath = pathname;
                  const pathWithoutLocale = currentPath.replace(
                    /^\/(en|zh)/,
                    ""
                  );
                  router.push(`/${newLocale}${pathWithoutLocale || "/"}`);
                }}
                defaultValue={pathname.split("/")[1] || "zh"}
              >
                {locales.map((locale) => (
                  <option key={locale} value={locale}>
                    {locale === "en" ? "English" : "中文"}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {!authLoading && user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  asChild
                >
                  <Link href="/create">
                    <Plus className="h-4 w-4 mr-1" />
                    {t("create")}
                  </Link>
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {user.user_metadata?.name?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">
                      {user.user_metadata?.name || user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-effect"
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {t("logout")}
                </Button>
              </div>
            ) : !authLoading ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-effect"
                  asChild
                >
                  <Link href="/auth/signin">
                    <LogIn className="h-4 w-4 mr-1" />
                    {t("login")}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  asChild
                >
                  <Link href="/auth/signup">{t("register")}</Link>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
