"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Heart,
  Grid3X3,
  Clock,
  Home,
  Globe,
  LogIn,
  LogOut,
  Plus,
  Tag,
  Settings,
  LayoutDashboard,
  FolderOpen,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ThemeToggle } from "@/components/ThemeToggle";
import ThemeColorSelector from "@/components/ThemeColorSelector";
import NotificationBell from "@/components/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { locales } from "@/locales";
import { useAuth } from "@/lib/supabase/auth-context";

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const headerT = useTranslations("header");
  const tagsT = useTranslations("tags");
  const ucT = useTranslations("userCard");
  const { user, profile, isLoading: authLoading, signOut } = useAuth();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: "/", label: t("home"), icon: Home },
    { path: "/categories", label: t("categories"), icon: Grid3X3 },
    { path: "/tags", label: tagsT("title"), icon: Tag },
    { path: "/recent", label: t("recent"), icon: Clock },
    { path: "/favorites", label: t("favorites"), icon: Heart },
  ];

  // Use profile data first, fallback to user metadata
  const displayName =
    profile?.displayName ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "";
  const email = user?.email || "";
  const avatarUrl = profile?.avatarUrl || user?.user_metadata?.avatar_url;
  const initial =
    displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <header
      data-cmp="Header"
      className="sticky top-0 z-50 glass-effect border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform bg-brand-gradient">
              <Search className="text-white" size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">
                {headerT("title")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {headerT("subtitle")}
              </p>
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
                  const pathWithoutLocale = pathname.replace(
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

            <ThemeToggle />
            <ThemeColorSelector />

            {!authLoading && user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Button
                  size="sm"
                  className="bg-brand-gradient hover:opacity-90 transition-opacity"
                  asChild
                >
                  <Link href="/create">
                    <Plus className="h-4 w-4 mr-1" />
                    {t("create")}
                  </Link>
                </Button>

                {/* User HoverCard */}
                <HoverCard openDelay={100} closeDelay={200}>
                  <HoverCardTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <Avatar className="h-9 w-9 cursor-pointer hover:scale-105 transition-transform">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="bg-brand-gradient text-white text-sm font-bold">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent
                    align="end"
                    className="w-72 p-0"
                    sideOffset={8}
                  >
                    {/* Profile Header */}
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 shrink-0">
                          <AvatarImage src={avatarUrl} alt={displayName} />
                          <AvatarFallback className="bg-brand-gradient text-white font-bold">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent/50 transition-colors"
                      >
                        <UserCircle size={16} className="text-muted-foreground" />
                        {ucT("viewProfile")}
                      </Link>
                      <Link
                        href="/profile/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent/50 transition-colors"
                      >
                        <Settings size={16} className="text-muted-foreground" />
                        {ucT("editProfile")}
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent/50 transition-colors"
                      >
                        <LayoutDashboard
                          size={16}
                          className="text-muted-foreground"
                        />
                        {ucT("dashboard")}
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent/50 transition-colors"
                      >
                        <FolderOpen
                          size={16}
                          className="text-muted-foreground"
                        />
                        {ucT("myCollections")}
                      </Link>
                    </div>

                    <Separator />

                    <div className="py-1">
                      <button
                        onClick={async () => {
                          await signOut();
                          router.push("/");
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full"
                      >
                        <LogOut size={16} />
                        {ucT("signOut")}
                      </button>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            ) : !authLoading ? (
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
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
