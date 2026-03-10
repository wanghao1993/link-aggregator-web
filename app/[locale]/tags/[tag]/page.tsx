"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Tag, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LinkCard from "@/components/LinkCard";
import { LinkCollection } from "@/types/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { LinkCardSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function TagDetailPage() {
  const t = useTranslations("tags");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const tag = decodeURIComponent(params.tag as string);

  const [collections, setCollections] = useState<LinkCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tags/${encodeURIComponent(tag)}`)
      .then((res) => res.json())
      .then((data) => {
        setCollections(
          data.collections.map((c: LinkCollection) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
            author: {
              ...c.author,
              joinedAt: new Date(c.author.joinedAt),
            },
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tag]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/${locale}/tags`)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t("backToTags")}
        </Button>

        {/* Header */}
        <div className="mb-10 fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Hash className="text-white" size={28} />
            </div>
            <div>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-5 w-28" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-foreground">
                    {t("tagDetail", { tag })}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {t("collectionsCount", { count: collections.length })}
                  </p>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <Skeleton className="h-8 w-24 rounded-full" />
          ) : (
            <Badge
              variant="secondary"
              className="text-sm px-4 py-1.5 bg-primary/10 text-primary"
            >
              <Tag size={14} className="mr-1.5" />
              {tag}
            </Badge>
          )}
        </div>

        {/* Collections Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <LinkCardSkeleton key={i} />
            ))}
          </div>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <LinkCard key={collection.id} collection={collection} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="text-muted-foreground" size={24} />
            </div>
            <p className="text-muted-foreground text-lg">{t("noCollections")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
