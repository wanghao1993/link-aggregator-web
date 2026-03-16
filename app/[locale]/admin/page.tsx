"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Tag,
  FolderOpen,
  Users,
  Eye,
  Heart,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  categories: number;
  tags: number;
  collections: number;
  users: number;
  totalViews: number;
  totalLikes: number;
}

interface RecentCollection {
  id: string;
  title: string;
  views: number;
  likes: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCollections, setRecentCollections] = useState<RecentCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch categories count
        const categoriesRes = await fetch("/api/admin/categories");
        const categoriesData = await categoriesRes.json();

        // Fetch tags count
        const tagsRes = await fetch("/api/admin/tags?limit=1");
        const tagsData = await tagsRes.json();

        // Fetch collections stats
        const collectionsRes = await fetch("/api/admin/collections/stats");
        let collectionsData = { count: 0, totalViews: 0, totalLikes: 0 };
        if (collectionsRes.ok) {
          collectionsData = await collectionsRes.json();
        }

        // Fetch recent collections
        const recentRes = await fetch("/api/admin/collections?limit=5&sortBy=created_at");
        let recentData: RecentCollection[] = [];
        if (recentRes.ok) {
          const data = await recentRes.json();
          recentData = data.collections || [];
        }

        setStats({
          categories: Array.isArray(categoriesData) ? categoriesData.length : 0,
          tags: tagsData.total || 0,
          collections: collectionsData.count || 0,
          users: 0, // TODO: implement users count
          totalViews: collectionsData.totalViews || 0,
          totalLikes: collectionsData.totalLikes || 0,
        });
        setRecentCollections(recentData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Categories",
      value: stats?.categories || 0,
      icon: Layers,
      color: "bg-purple-500/10 text-purple-500",
      href: "/admin/categories",
    },
    {
      title: "Tags",
      value: stats?.tags || 0,
      icon: Tag,
      color: "bg-blue-500/10 text-blue-500",
      href: "/admin/tags",
    },
    {
      title: "Collections",
      value: stats?.collections || 0,
      icon: FolderOpen,
      color: "bg-green-500/10 text-green-500",
      href: "/admin/collections",
    },
    {
      title: "Total Views",
      value: (stats?.totalViews || 0).toLocaleString(),
      icon: Eye,
      color: "bg-orange-500/10 text-orange-500",
      href: null,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
                {stat.href && (
                  <div className="mt-4 flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <span>View all</span>
                    <ArrowRight size={14} className="ml-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          );

          return stat.href ? (
            <Link key={stat.title} href={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.title}>{content}</div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/categories">
              <Button variant="outline">
                <Layers size={16} className="mr-2" />
                Manage Categories
              </Button>
            </Link>
            <Link href="/admin/tags">
              <Button variant="outline">
                <Tag size={16} className="mr-2" />
                Manage Tags
              </Button>
            </Link>
            <Link href="/create">
              <Button variant="outline">
                <FolderOpen size={16} className="mr-2" />
                Create Collection
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Collections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Collections</CardTitle>
          <Link href="/admin/collections" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {recentCollections.length > 0 ? (
            <div className="space-y-4">
              {recentCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{collection.title}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {collection.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {collection.likes}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={14} />
                    <span className="text-sm">
                      {new Date(collection.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="mx-auto mb-2 opacity-50" size={32} />
              <p>No collections yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
