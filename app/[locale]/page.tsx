"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, Users, Link2, Star, Tag } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import LinkCard from "@/components/LinkCard";
import StatsCard from "@/components/StatsCard";
import { Badge } from "@/components/ui/badge";
import { LinkCollection, Category } from "@/types/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { LinkCardSkeleton, StatsCardSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

interface TagItem {
  name: string;
  count: number;
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
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; email: string } | null;
}

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

function toCategory(catId: string, catT: (key: string) => string): Category {
  const meta = CATEGORY_META[catId] || {
    icon: "📁",
    color: "gray",
    slug: catId,
  };
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
  catT: (key: string) => string
): LinkCollection {
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
    isFavorited: false,
    links: [],
    author: {
      id: api.author?.id || "",
      username: api.author?.name || "unknown",
      displayName: api.author?.name || "Unknown",
      email: api.author?.email || "",
      isVerified: false,
      joinedAt: new Date(),
    },
  };
}

export default function Home() {
  const t = useTranslations("home");
  const tt = useTranslations("tags");
  const catT = useTranslations("categories");
  const locale = useLocale();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [popularTags, setPopularTags] = useState<TagItem[]>([]);
  const [collections, setCollections] = useState<LinkCollection[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCollections = useCallback(
    async (category: string, search: string) => {
      try {
        const params = new URLSearchParams();
        if (category && category !== "all") params.set("category", category);
        if (search) params.set("search", search);
        const res = await fetch(`/api/collections?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.collections as ApiCollection[]).map((c) =>
            toCollection(c, catT)
          );
          setCollections(mapped);
          setTotalCount(data.total);
        }
      } catch {
        /* ignore */
      }
    },
    [catT]
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/tags")
        .then((r) => r.json())
        .then((d) => setPopularTags(d.tags?.slice(0, 8) || []))
        .catch(() => {}),
      fetchCollections(selectedCategory, searchQuery),
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchCollections(selectedCategory, searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 fade-in">
          <h1 className="text-5xl font-bold mb-6 gradient-text floating-animation">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>

          <SearchBar
            onSearch={setSearchQuery}
            placeholder={t("search.placeholder")}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <StatsCard
            title={t("stats.totalCollections")}
            value={String(totalCount)}
            icon={Link2}
            color="primary"
            loading={loading}
          />
          <StatsCard
            title={t("stats.activeUsers")}
            value="-"
            icon={Users}
            color="info"
            loading={loading}
          />
          <StatsCard
            title={t("stats.monthlyViews")}
            value="-"
            icon={TrendingUp}
            color="success"
            loading={loading}
          />
          <StatsCard
            title={t("stats.featuredCollections")}
            value="-"
            icon={Star}
            color="warning"
            loading={loading}
          />
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {t("categories.title")}
          </h2>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Popular Tags */}
        {(loading || popularTags.length > 0) && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Tag size={22} className="text-primary" />
                {tt("popular")}
              </h2>
              <button
                onClick={() => router.push(`/${locale}/tags`)}
                className="text-sm text-primary hover:underline"
              >
                {tt("allTags")} →
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-20 rounded-full" />
                  ))
                : popularTags.map((tag) => (
                    <Badge
                      key={tag.name}
                      variant="outline"
                      className="px-4 py-2 text-sm cursor-pointer border-border/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all"
                      onClick={() =>
                        router.push(
                          `/${locale}/tags/${encodeURIComponent(tag.name)}`
                        )
                      }
                    >
                      {tag.name}
                      <span className="ml-1.5 opacity-60 text-xs">
                        {tag.count}
                      </span>
                    </Badge>
                  ))}
            </div>
          </div>
        )}

        {/* Collections Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {selectedCategory === "all"
                ? t("collections.title")
                : t("collections.filteredTitle")}
            </h2>
            <p className="text-muted-foreground">
              {t("collections.foundCount", { count: collections.length })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <LinkCardSkeleton key={i} />
                ))
              : collections.map((collection) => (
                  <LinkCard key={collection.id} collection={collection} />
                ))}
          </div>

          {!loading && collections.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 className="text-muted-foreground" size={24} />
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
      </div>
    </div>
  );
}
