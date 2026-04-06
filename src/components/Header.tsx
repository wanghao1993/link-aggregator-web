"use client";

import React, { useState, useEffect } from "react";
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
  Settings,
  LayoutDashboard,
  FolderOpen,
  UserCircle,
  Menu,
  BookmarkIcon,
  Bookmark,
  ChevronDown,
  Palette,
  Sun,
  Moon,
  Monitor,
  Type,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
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
import { useTheme } from "next-themes";
import { themes, applyTheme, getCurrentTheme, type ThemeConfig } from "@/styles/themes";

// Available fonts - CSS variables set by next/font in layout.tsx
const fonts = [
  { name: "default", label: "Default", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" },
  { name: "inter", label: "Inter", fontFamily: "var(--font-inter)" },
  { name: "roboto", label: "Roboto", fontFamily: "var(--font-roboto)" },
  { name: "lato", label: "Lato", fontFamily: "var(--font-lato)" },
  { name: "poppins", label: "Poppins", fontFamily: "var(--font-poppins)" },
  { name: "noto-sans", label: "Noto Sans SC", fontFamily: "var(--font-noto-sans-sc)" },
];

function applyFont(fontName: string) {
  const font = fonts.find(f => f.name === fontName);
  if (!font) return;
  const root = document.documentElement;
  root.style.setProperty("--font-sans", font.fontFamily);
  root.style.setProperty("--fontSans", font.fontFamily);
  localStorage.setItem("font-preference", fontName);
}

function getCurrentFont(): string {
  return localStorage.getItem("font-preference") || "default";
}

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const headerT = useTranslations("header");
  const ucT = useTranslations("userCard");
  const prefT = useTranslations("preferences");
  const themeT = useTranslations("theme");
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const { setTheme, theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentColorTheme, setCurrentColorTheme] = useState("default");
  const [currentFont, setCurrentFont] = useState("default");

  // Initialize theme color and font on mount
  useEffect(() => {
    setCurrentColorTheme(getCurrentTheme());
    setCurrentFont(getCurrentFont());
  }, []);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: "/", label: t("home"), icon: Home },
    { path: "/categories", label: t("categories"), icon: Grid3X3 },
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

  const handleSelectColorTheme = (themeName: string) => {
    applyTheme(themeName);
    setCurrentColorTheme(themeName);
  };

  const handleSelectFont = (fontName: string) => {
    applyFont(fontName);
    setCurrentFont(fontName);
  };

  const getThemePreviewColor = (themeConfig: ThemeConfig): string => {
    const [r, g, b] = themeConfig.colors.primary.split(" ").map(Number);
    return `rgb(${r}, ${g}, ${b})`;
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

                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <Avatar className="h-9 w-9 cursor-pointer hover:scale-105 transition-transform">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="bg-brand-gradient text-white text-sm font-bold">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
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

                    <DropdownMenuSeparator />

                    {/* Menu Items */}
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-3">
                        <UserCircle size={18} className="text-muted-foreground" />
                        {ucT("viewProfile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/settings" className="flex items-center gap-3">
                        <Settings size={18} className="text-muted-foreground" />
                        {ucT("editProfile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-3">
                        <LayoutDashboard size={18} className="text-muted-foreground" />
                        {ucT("dashboard")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-3">
                        <FolderOpen size={18} className="text-muted-foreground" />
                        {ucT("myCollections")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/import" className="flex items-center gap-3">
                        <BookmarkIcon size={18} className="text-muted-foreground" />
                        {ucT("importBookmarks")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookmarklet" className="flex items-center gap-3">
                        <Bookmark size={18} className="text-muted-foreground" />
                        {ucT("bookmarklet")}
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Preferences Section */}
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {prefT("title")}
                    </DropdownMenuLabel>

                    {/* Theme Mode */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center">
                        {theme === "light" ? (
                          <Sun className="mr-2 h-4 w-4" />
                        ) : theme === "dark" ? (
                          <Moon className="mr-2 h-4 w-4" />
                        ) : (
                          <Monitor className="mr-2 h-4 w-4" />
                        )}
                        <span>{prefT("appearance")}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {themeT(theme === "light" ? "light" : theme === "dark" ? "dark" : "system")}
                        </span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="mr-2 h-4 w-4" />
                            {themeT("light")}
                            {theme === "light" && <Check className="ml-auto h-4 w-4" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="mr-2 h-4 w-4" />
                            {themeT("dark")}
                            {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("system")}>
                            <Monitor className="mr-2 h-4 w-4" />
                            {themeT("system")}
                            {theme === "system" && <Check className="ml-auto h-4 w-4" />}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

                    {/* Theme Color */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: getThemePreviewColor(themes.find(t => t.name === currentColorTheme) || themes[0]) }}
                        />
                        <span>{prefT("themeColor")}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-48">
                          <div className="grid grid-cols-4 gap-1 p-1">
                            {themes.map((themeConfig) => (
                              <button
                                key={themeConfig.name}
                                onClick={() => handleSelectColorTheme(themeConfig.name)}
                                className={`
                                  relative w-8 h-8 rounded-md transition-transform hover:scale-110
                                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                                  ${currentColorTheme === themeConfig.name ? "ring-2 ring-primary ring-offset-1" : ""}
                                `}
                                style={{ backgroundColor: getThemePreviewColor(themeConfig) }}
                                title={themeConfig.label}
                              >
                                {currentColorTheme === themeConfig.name && (
                                  <Check className="absolute inset-0 m-auto h-3 w-3 text-white" />
                                )}
                              </button>
                            ))}
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

                    {/* Font */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center">
                        <Type className="mr-2 h-4 w-4" />
                        <span>{prefT("font")}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {fonts.find(f => f.name === currentFont)?.label || "Default"}
                        </span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {fonts.map((font) => (
                            <DropdownMenuItem
                              key={font.name}
                              onClick={() => handleSelectFont(font.name)}
                              style={{ fontFamily: font.fontFamily }}
                            >
                              {font.label}
                              {currentFont === font.name && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-500 focus:text-red-500"
                    >
                      <LogOut size={18} className="mr-2" />
                      {ucT("signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                        <SheetClose asChild>
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/50 transition-colors rounded-lg"
                          >
                            <UserCircle size={18} className="text-muted-foreground" />
                            {ucT("viewProfile")}
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/profile/settings"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/50 transition-colors rounded-lg"
                          >
                            <Settings size={18} className="text-muted-foreground" />
                            {ucT("editProfile")}
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/50 transition-colors rounded-lg"
                          >
                            <LayoutDashboard size={18} className="text-muted-foreground" />
                            {ucT("dashboard")}
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/import"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/50 transition-colors rounded-lg"
                          >
                            <BookmarkIcon size={18} className="text-muted-foreground" />
                            {ucT("importBookmarks")}
                          </Link>
                        </SheetClose>
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
                        {prefT("themeColor")}
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
