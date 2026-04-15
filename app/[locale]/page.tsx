"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  TrendingUp,
  Users,
  Link2,
  Star,
  Sparkles,
  Search,
  Loader2,
} from "lucide-react";
import LinkCard from "@/components/LinkCard";
import StatsCard from "@/components/StatsCard";
import { LinkCardSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { LinkCollection, Category } from "@/types/link";

import Aegis from "aegis-web-sdk";

// ============================================
// Types (hoisted to module level)
// ============================================

interface Stats {
  totalCollections: number;
  activeUsers: number;
  monthlyViews: number;
  featuredCollections: number;
}

interface HotTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
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

const PAGE_SIZE = 12;

const CATEGORY_META: Record<
  string,
  { icon: string; color: string; slug: string }
> = {
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

const FILTER_OPTIONS = [
  { id: "popular", labelKey: "filterPopular" },
  { id: "latest", labelKey: "filterLatest" },
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

function toCollection(
  api: ApiCollection,
  catT: (key: string) => string,
): LinkCollection {
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
  const collectionT = useTranslations("home.collections");

  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [collections, setCollections] = useState<LinkCollection[]>([]);
  const [hotTags, setHotTags] = useState<HotTag[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCollections: 0,
    activeUsers: 0,
    monthlyViews: 0,
    featuredCollections: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("popular");

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Ref for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Memoize toCollection function to avoid recreation
  const mapCollection = useCallback(
    (api: ApiCollection) => toCollection(api, catT),
    [catT],
  );

  // Fetch collections with pagination
  const fetchCollections = useCallback(
    async (
      search: string,
      filter: string,
      pageNum: number,
      isSearchUpdate: boolean = false,
      append: boolean = false,
    ) => {
      if (isSearchUpdate) setSearchLoading(true);
      if (append) setLoadingMore(true);

      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (filter && filter !== "all") params.set("sort", filter);
        params.set("limit", String(PAGE_SIZE));
        params.set("offset", String(pageNum * PAGE_SIZE));

        const res = await fetch(`/api/collections?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const newCollections = (data.collections as ApiCollection[]).map(
            mapCollection,
          );

          if (append) {
            setCollections((prev) => [...prev, ...newCollections]);
          } else {
            setCollections(newCollections);
          }

          setTotalCount(data.total || 0);
          setHasMore((pageNum + 1) * PAGE_SIZE < (data.total || 0));
        }
      } catch {
        /* ignore */
      } finally {
        if (isSearchUpdate) setSearchLoading(false);
        if (append) setLoadingMore(false);
      }
    },
    [mapCollection],
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

  // Fetch hot tags
  const fetchHotTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags?limit=8");
      if (res.ok) {
        const data = await res.json();
        setHotTags(data.tags || []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Load more function
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCollections(searchQuery, activeFilter, nextPage, false, true);
    }
  }, [page, loadingMore, hasMore, searchQuery, activeFilter, fetchCollections]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (loading) return;

    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loadingMore) {
        loadMore();
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadingMore, loadMore]);

  // Search handlers
  const handleSearch = useCallback(() => {
    setSearchQuery(inputValue);
    setPage(0);
    setHasMore(true);
  }, [inputValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch],
  );

  const handleTagClick = useCallback((tagName: string) => {
    setInputValue(tagName);
    setSearchQuery(tagName);
    setPage(0);
    setHasMore(true);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    setPage(0);
    setHasMore(true);
  }, []);

  // Initial load - parallel fetching
  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchCollections("", activeFilter, 0),
      fetchHotTags(),
    ]).finally(() => setLoading(false));
  }, [fetchStats, fetchCollections, fetchHotTags]);

  // Search and filter effect - reset pagination
  useEffect(() => {
    if (!loading) {
      setCollections([]);
      fetchCollections(searchQuery, activeFilter, 0, true, false);
    }
  }, [searchQuery, activeFilter, loading]);

  // Memoize skeleton array to avoid recreation
  const skeletonCards = useMemo(
    () => Array.from({ length: 3 }, (_, i) => <LinkCardSkeleton key={i} />),
    [],
  );

  const loadingMoreSkeletons = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => (
        <LinkCardSkeleton key={`loading-${i}`} />
      )),
    [],
  );

  useEffect(() => {
    new Aegis({
      id: "dWX91Sv3Dmn3aPKa1v", // 上报 id
      uin: "xxx", // 用户唯一 ID（可选）
      reportApiSpeed: true, // 接口测速
      reportAssetSpeed: true, // 静态资源测速
      spa: true, // spa 应用页面跳转的时候开启 pv 计算
      hostUrl: "https://rumt-sg.com",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles size={14} />
            <span>{t("hero.badge")}</span>
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
              <Button
                onClick={handleSearch}
                disabled={searchLoading}
                className="bg-brand-gradient hover:opacity-90 px-6 rounded-xl"
              >
                {searchLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  commonT("search")
                )}
              </Button>
            </div>
          </div>

          {/* Hot Tags */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {t("search.hotTags")}:
            </span>
            {hotTags.length > 0 ? (
              hotTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.name)}
                  className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors"
                >
                  {tag.name}
                </button>
              ))
            ) : (
              // Fallback to default tags if no tags from database
              <>
                <button
                  onClick={() => handleTagClick("AI工具")}
                  className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors"
                >
                  AI工具
                </button>
                <button
                  onClick={() => handleTagClick("前端开发")}
                  className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors"
                >
                  前端开发
                </button>
                <button
                  onClick={() => handleTagClick("设计资源")}
                  className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors"
                >
                  设计资源
                </button>
                <button
                  onClick={() => handleTagClick("开发工具")}
                  className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors"
                >
                  开发工具
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatsCard
              title={t("stats.totalCollections")}
              value={formatNumber(stats.totalCollections)}
              icon={Link2}
              color="primary"
              loading={loading}
            />
            <StatsCard
              title={t("stats.activeUsers")}
              value={formatNumber(stats.activeUsers)}
              icon={Users}
              color="info"
              loading={loading}
            />
            <StatsCard
              title={t("stats.monthlyViews")}
              value={formatNumber(stats.monthlyViews)}
              icon={TrendingUp}
              color="success"
              loading={loading}
            />
            <StatsCard
              title={t("stats.featuredCollections")}
              value={formatNumber(stats.featuredCollections)}
              icon={Star}
              color="warning"
              loading={loading}
            />
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                {t("collections.title")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("collections.foundCount", { count: totalCount })}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleFilterChange(option.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeFilter === option.id
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {collectionT(option.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? skeletonCards
              : collections.map((collection) => (
                  <LinkCard key={collection.id} collection={collection} />
                ))}
            {loadingMore && loadingMoreSkeletons}
          </div>

          {/* Load More Trigger */}
          {!loading && hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {loadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>加载中...</span>
                </div>
              )}
            </div>
          )}

          {/* No More Data */}
          {!loading && !hasMore && collections.length > 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              已加载全部 {totalCount} 个合集
            </div>
          )}

          {/* Empty State */}
          {!loading && !searchLoading && collections.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Link2 className="text-muted-foreground" size={28} />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t("collections.noResults.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("collections.noResults.description")}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
