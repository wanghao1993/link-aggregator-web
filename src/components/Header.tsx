"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Heart,
  Grid3X3,
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
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: "/", label: t("home"), icon: Home },
    { path: "/categories", label: t("categories"), icon: Grid3X3 },
    { path: "/tags", label: tagsT("title"), icon: Tag },
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

  const handleLocaleChange = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(/^\/(en|zh)/, "");
    router.push(`/${newLocale}${pathWithoutLocale || "/"}`);
  };

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    router.push("/");
  };

  // Navigation link component for reuse
  const NavLink = ({
    path,
    label,
    icon: Icon,
    onClick,
  }: {
    path: string;
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
  }) => (
    <Link
      key={path}
      href={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        isActive(path)
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );

  // User menu items
  const UserMenuItems = ({ onClick }: { onClick?: () => void }) => (
    <>
      <Link
        href="/profile"
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/50 transition-colors rounded-lg"
      >
        <UserCircle size={18} className="text-muted-foreground" />
        {ucT("viewProfile")}
      </Link>
      <Link
        href="/profile/settings"
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/50 transition-colors rounded-lg"
      >
        <Settings size={18} className="text-muted-foreground" />
        {ucT("editProfile")}
      </Link>
      <Link
        href="/dashboard"
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/50 transition-colors rounded-lg"
      >
        <LayoutDashboard size={18} className="text-muted-foreground" />
        {ucT("dashboard")}
      </Link>
      <Link
        href="/profile"
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/50 transition-colors rounded-lg"
      >
        <FolderOpen size={18} className="text-muted-foreground" />
        {ucT("myCollections")}
      </Link>
    </>
  );

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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
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
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="flex items-center space-x-1">
              <Globe className="text-muted-foreground" size={16} />
              <select
                className="bg-transparent text-sm text-foreground border-none focus:outline-none cursor-pointer"
                onChange={(e) => handleLocaleChange(e.target.value)}
                value={pathname.split("/")[1] || "zh"}
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
                      <UserMenuItems />
                    </div>

                    <Separator />

                    <div className="py-1">
                      <button
                        onClick={handleSignOut}
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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Compact language switcher for mobile */}
            <select
              className="bg-transparent text-sm text-foreground border-none focus:outline-none cursor-pointer pr-2"
              onChange={(e) => handleLocaleChange(e.target.value)}
              value={pathname.split("/")[1] || "zh"}
            >
              {locales.map((locale) => (
                <option key={locale} value={locale}>
                  {locale.toUpperCase()}
                </option>
              ))}
            </select>

            <ThemeToggle />

            {/* Mobile Menu Sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-gradient">
                      <Search className="text-white" size={16} />
                    </div>
                    {headerT("title")}
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-full overflow-y-auto">
                  {/* User Info Section */}
                  {!authLoading && user ? (
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 shrink-0">
                          <AvatarImage src={avatarUrl} alt={displayName} />
                          <AvatarFallback className="bg-brand-gradient text-white font-bold">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {email}
                          </p>
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Link href="/create">
                          <Button
                            size="sm"
                            className="w-full mt-3 bg-brand-gradient hover:opacity-90"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {t("create")}
                          </Button>
                        </Link>
                      </SheetClose>
                    </div>
                  ) : !authLoading ? (
                    <div className="p-4 border-b">
                      <SheetClose asChild>
                        <Link href="/auth/signin">
                          <Button variant="outline" className="w-full">
                            <LogIn className="h-4 w-4 mr-2" />
                            {t("login")}
                          </Button>
                        </Link>
                      </SheetClose>
                    </div>
                  ) : null}

                  {/* Navigation Links */}
                  <nav className="p-2">
                    {navItems.map((item) => (
                      <SheetClose key={item.path} asChild>
                        <NavLink {...item} />
                      </SheetClose>
                    ))}
                  </nav>

                  {/* User Menu (logged in) */}
                  {!authLoading && user && (
                    <>
                      <Separator />
                      <div className="p-2">
                        <UserMenuItems
                          onClick={() => setMobileMenuOpen(false)}
                        />
                      </div>
                      <Separator />
                      <div className="p-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full rounded-lg"
                        >
                          <LogOut size={18} />
                          {ucT("signOut")}
                        </button>
                      </div>
                    </>
                  )}

                  {/* Theme & Settings */}
                  <div className="mt-auto border-t p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Theme
                      </span>
                      <div className="flex items-center gap-2">
                        <ThemeColorSelector />
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
