"use client";

import React, { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FavoriteCollection {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function Favorites() {
  const t = useTranslations("favoritesPage");
  const tc = useTranslations("common");
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    setLoading(true);
    try {
      const res = await fetch("/api/users/me/favorites");
      if (!res.ok) {
        if (res.status === 401) {
          toast.error(t("loginRequired"));
          return;
        }
        throw new Error("Failed to fetch favorites");
      }
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      toast.error(t("loadError"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFavorite(id: string) {
    setRemoving(id);
    try {
      const res = await fetch(`/api/collections/${id}/favorite`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
        toast.success(t("removeSuccess"));
      } else {
        toast.error(t("removeError"));
      }
    } catch (error) {
      toast.error(t("removeError"));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Heart className="text-red-500" size={32} fill="currentColor" />
            <h1 className="text-4xl font-bold gradient-text">{t("title")}</h1>
          </div>
          <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t("empty")}</p>
            <Button onClick={() => router.push("/")}>{tc("home")}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((collection) => (
              <Card
                key={collection.id}
                className="glass-effect border-border/30 bg-card/60 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => router.push(`/collection/${collection.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge
                        variant="secondary"
                        className="mb-2 bg-accent/50 text-accent-foreground"
                      >
                        {collection.category}
                      </Badge>
                      <CardTitle className="text-lg text-foreground line-clamp-1">
                        {collection.title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 text-muted-foreground">
                    {collection.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {collection.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs border-border/30"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {collection.views.toLocaleString()} {tc("view")} ·{" "}
                      {collection.likes} {tc("favorite")}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(collection.id);
                      }}
                      disabled={removing === collection.id}
                    >
                      {removing === collection.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className="h-4 w-4" fill="currentColor" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
