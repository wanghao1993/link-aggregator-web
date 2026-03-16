"use client";

import React, { useState, useEffect } from "react";
import { Tag, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

interface TagItem {
  name: string;
  count: number;
}

const sizeClasses = [
  "text-2xl font-bold",
  "text-xl font-semibold",
  "text-lg font-medium",
  "text-base",
  "text-sm",
];

function getTagSize(count: number, maxCount: number): string {
  const ratio = count / maxCount;
  if (ratio >= 0.8) return sizeClasses[0];
  if (ratio >= 0.6) return sizeClasses[1];
  if (ratio >= 0.4) return sizeClasses[2];
  if (ratio >= 0.2) return sizeClasses[3];
  return sizeClasses[4];
}

const gradientColors = [
  "from-purple-500 to-blue-500",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-indigo-500 to-violet-500",
  "from-red-500 to-pink-500",
  "from-teal-500 to-green-500",
];

export default function TagsPage() {
  const t = useTranslations("tags");
  const locale = useLocale();
  const router = useRouter();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => {
        setTags(data.tags);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxCount = tags.length > 0 ? tags[0].count : 1;
  const popularTags = tags.slice(0, 6);

  const handleTagClick = (tagName: string) => {
    router.push(`/${locale}/tags/${encodeURIComponent(tagName)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 fade-in">
          <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Tag className="text-white" size={28} />
          </div>
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <Card className="glass-effect border-border/30 bg-card/60 mb-10 fade-in">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp size={22} className="text-primary" />
                {t("popular")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {popularTags.map((tag, index) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagClick(tag.name)}
                    className="group relative overflow-hidden rounded-xl p-4 text-left transition-all hover:scale-105 hover:shadow-lg"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} opacity-10 group-hover:opacity-20 transition-opacity`}
                    />
                    <div className="relative">
                      <p className="font-semibold text-foreground mb-1 truncate">
                        {tag.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("collectionsCount", { count: tag.count })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tag Cloud */}
        <Card className="glass-effect border-border/30 bg-card/60 fade-in">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Tag size={22} className="text-primary" />
              {t("allTags")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center py-4">
              {tags.map((tag) => (
                <Badge
                  key={tag.name}
                  variant="outline"
                  onClick={() => handleTagClick(tag.name)}
                  className={`cursor-pointer border-border/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all px-4 py-2 ${getTagSize(tag.count, maxCount)}`}
                >
                  {tag.name}
                  <span className="ml-2 opacity-60 text-xs font-normal">
                    {tag.count}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
