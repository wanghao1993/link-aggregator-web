"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Eye,
  Bookmark,
  Clock,
  Tag,
  User,
  Link2,
  QrCode,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import ShareButton from "@/components/ShareButton";
import ShareModal from "@/components/ShareModal";
import { CollectionDetailSkeleton } from "@/components/skeletons";
import LinkItemCard from "@/components/LinkItemCard";
import { toast } from "sonner";

interface CollectionLink {
  id: string;
  title: string;
  url: string;
  description: string;
  favicon?: string;
}

interface CollectionData {
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
  author: {
    id: string;
    name: string;
    email: string;
  } | null;
  links: CollectionLink[];
}

export default function CollectionDetailClient() {
  const t = useTranslations("collectionDetail");
  const tc = useTranslations("common");
  const ts = useTranslations("share");
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    async function fetchCollection() {
      try {
        const res = await fetch(`/api/collections/${id}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data: CollectionData = await res.json();
        setCollection(data);
        setLikes(data.likes);
        setViews(data.views);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    // Check if favorited
    async function checkFavorite() {
      try {
        const res = await fetch(`/api/collections/${id}/favorite`);
        if (res.ok) {
          const data = await res.json();
          setIsFavorited(data.isFavorited);
        }
      } catch (error) {
        console.error("Check favorite error:", error);
      }
    }

    // Record view
    async function recordView() {
      try {
        await fetch(`/api/collections/${id}/view`, { method: "POST" });
        // Update local view count
        setViews((prev) => prev + 1);
      } catch (error) {
        console.error("Record view error:", error);
      }
    }

    fetchCollection();
    checkFavorite();
    recordView();
  }, [id]);

  if (loading) {
    return <CollectionDetailSkeleton />;
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {tc("error")}
          </h1>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            {t("back")}
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        const res = await fetch(`/api/collections/${id}/favorite`, {
          method: "DELETE",
        });
        if (res.ok) {
          setIsFavorited(false);
          setLikes((prev) => Math.max(0, prev - 1));
          toast.success(t("removedFromFavorites"));
        } else if (res.status === 401) {
          toast.error(t("loginRequired"));
        }
      } else {
        // Add to favorites
        const res = await fetch(`/api/collections/${id}/favorite`, {
          method: "POST",
        });
        if (res.ok) {
          setIsFavorited(true);
          setLikes((prev) => prev + 1);
          toast.success(t("addedToFavorites"));
        } else if (res.status === 401) {
          toast.error(t("loginRequired"));
        }
      }
    } catch (error) {
      toast.error(t("favoriteError"));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const authorName = collection.author?.name || t("notFound");
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t("back")}
        </Button>

        <div className="mb-8 fade-in">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-brand-gradient rounded-xl flex items-center justify-center text-3xl">
                📁
              </div>
              <div>
                <Badge
                  variant="secondary"
                  className="mb-2 bg-accent/50 text-accent-foreground"
                >
                  {collection.category}
                </Badge>
                <h1 className="text-3xl font-bold text-foreground">
                  {collection.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <ShareButton
                title={collection.title}
                description={collection.description}
                variant="outline"
                size="default"
                className="border-border/50"
              />
              <Button
                onClick={() => setShareModalOpen(true)}
                variant="outline"
                size="icon"
                className="border-border/50"
                title={ts("shareCollection")}
              >
                <QrCode size={18} />
              </Button>
              <Button
                onClick={handleFavorite}
                disabled={favoriteLoading}
                variant={isFavorited ? "default" : "outline"}
                className={
                  isFavorited
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "border-border/50 hover:border-red-500 hover:text-red-500"
                }
              >
                <Bookmark
                  size={18}
                  className="mr-2"
                  fill={isFavorited ? "currentColor" : "none"}
                />
                {t("addToFavorites")}
              </Button>
            </div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {collection.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {collection.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-border/30 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
                onClick={() => {
                  const locale = (params.locale as string) || "en";
                  router.push(`/${locale}/tags/${encodeURIComponent(tag)}`);
                }}
              >
                <Tag size={12} className="mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1.5">
              <Eye size={16} />
              <span>
                {views.toLocaleString()} {t("stats.views")}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Heart size={16} />
              <span>
                {likes} {t("stats.likes")}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Bookmark size={16} />
              <span>
                {collection.links.length} {t("stats.linksCount")}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock size={16} />
              <span>{formatDate(collection.updatedAt)}</span>
            </div>
          </div>
        </div>

        <Separator className="mb-8 border-border/30" />

        {collection.author && (
          <Card className="glass-effect border-border/30 bg-card/60 mb-8 fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <User size={20} />
                <span>{t("author")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-brand-gradient text-white font-bold">
                    {authorInitial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-semibold text-foreground">
                    {authorName}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {collection.author.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8 fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
            <Link2 size={24} />
            <span>
              {t("links")} ({collection.links.length})
            </span>
          </h2>

          <div className="space-y-4">
            {collection.links.map((link) => (
              <LinkItemCard
                key={link.id}
                title={link.title}
                url={link.url}
                description={link.description}
                favicon={link.favicon}
              />
            ))}
          </div>

          {collection.links.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 className="text-muted-foreground" size={24} />
              </div>
              <p className="text-muted-foreground">{t("noLinks")}</p>
            </div>
          )}
        </div>
      </div>

      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title={collection.title}
        description={collection.description}
      />
    </div>
  );
}
