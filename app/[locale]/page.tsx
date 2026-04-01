"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TrendingUp, Users, Link2, Star, Sparkles, Search } from "lucide-react";
import LinkCard from "@/components/LinkCard";
import StatsCard from "@/components/StatsCard";
import { LinkCardSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { LinkCollection, Category } from "@/types/link";

// ============================================
// Types (hoisted to module level)
// ============================================

interface Stats {
  totalCollections: number;
  activeUsers: number;
  monthlyViews: number;
  featuredCollections: number;
}

interface ApiCollection {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  views: number;
  likes: number;
  isFavorited: boolean;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; email: string } | null;
}

// ============================================
// Constants (hoisted to module level)
// ============================================

const CATEGORY_META: Record<string, { icon: string; color: string; slug: string }> = {
  ai: { icon: "🤖", color: "purple", slug: "ai-ml" },
  web: { icon: "💻", color: "blue", slug: "web-dev" },
  design: { icon: "🎨", color: "pink", slug: "design" },
  tools: { icon: "🛠️", color: "green", slug: "tools" },
  mobile: { icon: "📱", color: "indigo", slug: "mobile" },
  devops: { icon: "⚙️", color: "gray", slug: "devops" },
  data: { icon: "📊", color: "green", slug: "data" },
  security: { icon: "🔒", color: "red", slug: "security" },
  productivity: { icon: "⚡", color: "orange", slug: "productivity" },
};

const DEFAULT_CATEGORY_META = { icon: "📁", color: "gray", slug: "" };

const HOT_TAGS = [
  { id: "ai", label: "AI工具" },
  { id: "web", label: "前端开发" },
  { id: "design", label: "设计资源" },
  { id: "tools", label: "开发工具" },
] as const;

const FILTER_OPTIONS = [
  { id: "all", label: "全部" },
  { id: "latest", label: "最新" },
  { id: "popular", label: "最热" },
] as const;

// ============================================
// Utility Functions (hoisted to module level)
// ============================================

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return String(num);
}

function toCategory(catId: string, catT: (key: string) => string): Category {
  const meta = CATEGORY_META[catId] ?? DEFAULT_CATEGORY_META;
  return {
    id: catId,
    name: catT(catId) ?? catId,
    description: "",
    icon: meta.icon,
    color: meta.color,
    slug: meta.slug,
    isActive: true,
  };
}

function toCollection(api: ApiCollection, catT: (key: string) => string): LinkCollection {
  const author = api.author;
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    category: toCategory(api.category, catT),
    tags: api.tags,
    createdAt: new Date(api.createdAt),
    updatedAt: new Date(api.updatedAt),
    isPublic: api.isPublic,
    views: api.views,
    likes: api.likes,
    isFavorited: api.isFavorited ?? false,
    links: [],
    author: {
      id: author?.id ?? "",
      username: author?.name ?? "unknown",
      displayName: author?.name ?? "Unknown",
      email: author?.email ?? "",
      isVerified: false,
      joinedAt: new Date(),
    },
  };
}

// ============================================
// Component
// ============================================

export default function Home() {
  const t = useTranslations("home");
  const catT = useTranslations("categories");
  const commonT = useTranslations("common");

  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [collections, setCollections] = useState<LinkCollection[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCollections: 0,
    activeUsers: 0,
    monthlyViews: 0,
    featuredCollections: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  // Memoize toCollection function to avoid recreation
  const mapCollection = useCallback(
    (api: ApiCollection) => toCollection(api, catT),
    [catT]
  );

  // Fetch collections
  const fetchCollections = useCallback(
    async (search: string) => {
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        const res = await fetch(`/api/collections?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCollections((data.collections as ApiCollection[]).map(mapCollection));
        }
      } catch {
        /* ignore */
      }
    },
    [mapCollection]
  );

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        setStats(await res.json());
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Search handlers
  const handleSearch = useCallback(() => {
    setSearchQuery(inputValue);
  }, [inputValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const handleTagClick = useCallback((label: string) => {
    setInputValue(label);
    setSearchQuery(label);
  }, []);

  // Initial load - parallel fetching
  useEffect(() => {
    Promise.all([fetchStats(), fetchCollections("")]).finally(() => setLoading(false));
  }, [fetchStats, fetchCollections]);

  // Search effect
  useEffect(() => {
    if (!loading) fetchCollections(searchQuery);
  }, [searchQuery, loading, fetchCollections]);

  // Memoize skeleton array to avoid recreation
  const skeletonCards = useMemo(
    () => Array.from({ length: 3 }, (_, i) => <LinkCardSkeleton key={i} />),
    []
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles size={14} />
            <span>发现优质资源</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            {t("hero.title")}
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex items-center gap-2 p-1.5 bg-card border border-border rounded-2xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="w-5 h-5 text-muted-foreground ml-4" />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 py-3 px-2 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <Button onClick={handleSearch} className="bg-brand-gradient hover:opacity-90 px-6 rounded-xl">
                {commonT("search")}
              </Button>
            </div>
          </div>

          {/* Hot Tags */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">热门:</span>
            {HOT_TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.label)}
                className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatsCard title={t("stats.totalCollections")} value={formatNumber(stats.totalCollections)} icon={Link2} color="primary" loading={loading} />
            <StatsCard title={t("stats.activeUsers")} value={formatNumber(stats.activeUsers)} icon={Users} color="info" loading={loading} />
            <StatsCard title={t("stats.monthlyViews")} value={formatNumber(stats.monthlyViews)} icon={TrendingUp} color="success" loading={loading} />
            <StatsCard title={t("stats.featuredCollections")} value={formatNumber(stats.featuredCollections)} icon={Star} color="warning" loading={loading} />
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{t("collections.title")}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t("collections.foundCount", { count: collections.length })}</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setActiveFilter(option.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeFilter === option.id
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? skeletonCards : collections.map((collection) => <LinkCard key={collection.id} collection={collection} />)}
          </div>

          {/* Empty State */}
          {!loading && collections.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Link2 className="text-muted-foreground" size={28} />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">{t("collections.noResults.title")}</h3>
              <p className="text-muted-foreground">{t("collections.noResults.description")}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
