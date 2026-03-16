"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Eye, Heart, FolderOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";

interface Collection {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  created_at: string;
  users?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Category {
  id: string;
  name: string;
  name_key: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
}

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/categories/${slug}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        setCategory(data.category);
        setCollections(data.collections || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchCategory();
  }, [slug]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-12 w-64 bg-muted rounded" />
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">分类未找到</h1>
          <Button onClick={() => router.push(`/${locale}/categories`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回分类列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/${locale}/categories`)}
          className="mb-6 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回分类
        </Button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl">
            {category.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground mt-1">{category.description}</p>
            )}
          </div>
        </div>

        {/* Collections */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            合集 ({collections.length})
          </h2>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">该分类下暂无合集</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/${locale}/collection/${collection.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-all hover:border-primary/30">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 truncate">
                          {collection.title}
                        </h3>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {collection.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {collection.users && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {collection.users.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {collection.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {collection.likes}
                          </span>
                          <span>{formatDate(collection.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
