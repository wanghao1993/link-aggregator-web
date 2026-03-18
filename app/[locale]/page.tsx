"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, Users, Link2, Star } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import LinkCard from "@/components/LinkCard";
import StatsCard from "@/components/StatsCard";
import { LinkCollection, Category } from "@/types/link";
import { useTranslations } from "next-intl";
import { LinkCardSkeleton } from "@/components/skeletons";

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
    isFavorited: api.isFavorited ?? false,
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

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return String(num);
}

export default function Home() {
  const t = useTranslations("home");
  const catT = useTranslations("categories");

  const [searchQuery, setSearchQuery] = useState("");
  const [collections, setCollections] = useState<LinkCollection[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCollections: 0,
    activeUsers: 0,
    monthlyViews: 0,
    featuredCollections: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCollections = useCallback(
    async (search: string) => {
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        const res = await fetch(`/api/collections?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.collections as ApiCollection[]).map((c) =>
            toCollection(c, catT)
          );
          setCollections(mapped);
        }
      } catch {
        /* ignore */
      }
    },
    [catT]
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchStats(), fetchCollections(searchQuery)]).finally(() =>
      setLoading(false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchCollections(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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

        {/* Collections Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {t("collections.title")}
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
