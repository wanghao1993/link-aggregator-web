"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Eye,
  Bookmark,
  Heart,
  Link2,
  Share2,
  ExternalLink,
  Sparkles,
  Clock,
  Tag,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import ShareModal from "@/components/ShareModal";
import { CollectionDetailSkeleton } from "@/components/skeletons";
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
    async function initCollection() {
      try {
        // Parallel fetch: collection data, favorite status, and view recording
        const [collectionRes, favoriteRes] = await Promise.all([
          fetch(`/api/collections/${id}`),
          fetch(`/api/collections/${id}/favorite`),
          fetch(`/api/collections/${id}/view`, { method: "POST" }),
        ]);

        // Handle collection response
        if (!collectionRes.ok) {
          setError(true);
          return;
        }
        const data: CollectionData = await collectionRes.json();
        setCollection(data);
        setLikes(data.likes);
        setViews(data.views + 1); // Increment for the view we just recorded

        // Handle favorite response
        if (favoriteRes.ok) {
          const favoriteData = await favoriteRes.json();
          setIsFavorited(favoriteData.isFavorited);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    initCollection();
  }, [id]);

  if (loading) {
    return <CollectionDetailSkeleton />;
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
            <Link2 className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{tc("error")}</h1>
          <p className="text-muted-foreground mb-8">{t("notFound")}</p>
          <Button onClick={() => router.back()} variant="outline" size="lg">
            <ArrowLeft size={18} className="mr-2" />
            {t("back")}
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
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
    } catch {
      toast.error(t("favoriteError"));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const authorName = collection.author?.name || "Unknown";

  return (
    <div className="min-h-screen pb-16">
      {/* Header Bar */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft size={18} className="sm:mr-1" />
            <span className="hidden sm:inline">{t("back")}</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShareModalOpen(true)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <Share2 size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">{ts("title")}</span>
            </Button>
            <Button
              onClick={handleFavorite}
              disabled={favoriteLoading}
              size="sm"
              variant={isFavorited ? "default" : "outline"}
              className={isFavorited ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Bookmark
                size={16}
                className="sm:mr-1"
                fill={isFavorited ? "currentColor" : "none"}
              />
              <span className="hidden sm:inline">{isFavorited ? "Saved" : "Save"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 text-sm text-muted-foreground">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0 font-medium">
              {collection.category}
            </Badge>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatDate(collection.updatedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {views.toLocaleString()}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
            {collection.title}
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 max-w-3xl">
            {collection.description}
          </p>

          {/* Author & Tags Row */}
          <div className="flex flex-wrap items-center gap-4">
            {collection.author && (
              <button
                onClick={() => {
                  const locale = (params.locale as string) || "en";
                  router.push(`/${locale}/profile/${collection.author!.id}`);
                }}
                className="flex items-center gap-2 group"
              >
                <Avatar className="w-8 h-8 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all">
                  <AvatarFallback className="bg-brand-gradient text-white text-xs font-bold">
                    {authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {authorName}
                </span>
              </button>
            )}

            {collection.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {collection.tags.slice(0, 4).map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const locale = (params.locale as string) || "en";
                      router.push(`/${locale}/tags/${encodeURIComponent(tag)}`);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Tag size={10} />
                    {tag}
                  </button>
                ))}
                {collection.tags.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{collection.tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-border/50 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:flex items-center gap-3 sm:gap-6 py-3 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
              <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                <Eye size={12} className="text-blue-500" />
              </div>
              <span className="font-medium text-foreground">{views.toLocaleString()}</span>
              <span>{t("stats.views")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
              <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center">
                <Heart size={12} className="text-red-500" />
              </div>
              <span className="font-medium text-foreground">{likes}</span>
              <span>{t("stats.likes")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
              <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center">
                <Link2 size={12} className="text-green-500" />
              </div>
              <span className="font-medium text-foreground">{collection.links.length}</span>
              <span>{t("stats.linksCount")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            {t("links")}
          </h2>
        </div>

        {collection.links.length > 0 ? (
          <div className="grid gap-3">
            {collection.links.map((link, index) => (
              <LinkCard key={link.id} link={link} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/50">
            <Link2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{t("noLinks")}</p>
          </div>
        )}
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

// Link Card Component
function LinkCard({ link, index }: { link: CollectionLink; index: number }) {
  const [showFallback, setShowFallback] = React.useState(false);

  const getDomain = (urlString: string) => {
    try {
      return new URL(urlString).hostname.replace(/^www\./, "");
    } catch {
      return urlString;
    }
  };

  // Get favicon URL - prefer stored favicon, fallback to Google's favicon service
  const getFaviconUrl = (urlString: string, storedFavicon?: string) => {
    if (storedFavicon) return storedFavicon;
    try {
      const domain = new URL(urlString).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(link.url, link.favicon);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 bg-card hover:bg-muted/50 border border-border/50 hover:border-primary/20 rounded-2xl transition-all duration-200"
    >
      {/* Index */}
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
        {index + 1}
      </div>

      {/* Favicon */}
      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-muted to-muted/50 flex items-center justify-center shrink-0 overflow-hidden border border-border/30 relative">
        {faviconUrl && !showFallback ? (
          <Image
            src={faviconUrl}
            alt=""
            width={24}
            height={24}
            unoptimized
            className="w-6 h-6 object-contain"
            onError={() => setShowFallback(true)}
          />
        ) : null}
        {(!faviconUrl || showFallback) && (
          <Globe className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 sm:line-clamp-1">
          {link.title}
        </h4>
        <p className="text-sm text-muted-foreground/70 truncate mb-1">
          {getDomain(link.url)}
        </p>
        {link.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {link.description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <div className="hidden sm:flex w-8 h-8 rounded-full bg-muted/50 items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-primary/10 shrink-0 self-center">
        <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary" />
      </div>
    </a>
  );
}
