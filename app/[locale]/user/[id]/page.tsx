"use client";

import React, { useEffect, useState, use } from "react";
import { BarChart3, Link2, Users, User, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import StatsCard from "@/components/StatsCard";
import FollowButton from "@/components/FollowButton";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  created_at?: string;
}

interface Collection {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
}

interface FollowStats {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id: userId, locale } = use(params);
  const t = useTranslations("profilePage");
  const ft = useTranslations("follow");
  const commonT = useTranslations("common");
  const { data: session } = useSession();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [followStats, setFollowStats] = useState<FollowStats>({
    isFollowing: false,
    followersCount: 0,
    followingCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const currentUserId = (session?.user as { id?: string })?.id;
  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [followRes, collectionsRes] = await Promise.all([
          fetch(`/api/users/${userId}/follow`),
          fetch(`/api/collections?userId=${userId}`),
        ]);

        if (followRes.ok) {
          const followData = await followRes.json();
          setFollowStats(followData);
        }

        if (collectionsRes.ok) {
          const collectionsData = await collectionsRes.json();
          setCollections(
            Array.isArray(collectionsData)
              ? collectionsData
              : collectionsData.collections || []
          );
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleFollowChange = (isFollowing: boolean) => {
    setFollowStats((prev) => ({
      ...prev,
      isFollowing,
      followersCount: isFollowing
        ? prev.followersCount + 1
        : prev.followersCount - 1,
    }));
  };

  const displayName = userProfile?.name || `User`;
  const email = userProfile?.email || "";
  const username = email ? email.split("@")[0] : userId.slice(0, 8);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Back Button */}
          <Link href={`/${locale}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} className="mr-2" />
              {commonT("back")}
            </Button>
          </Link>

          {/* User Profile Header */}
          <Card className="glass-effect border-border/30 bg-card/60">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <UserAvatar
                    user={{
                      id: userId,
                      username,
                      displayName,
                      email,
                      isVerified: true,
                      joinedAt: userProfile?.created_at
                        ? new Date(userProfile.created_at)
                        : new Date(),
                    }}
                    size="lg"
                    showName={false}
                  />
                  <div>
                    <CardTitle className="text-2xl text-foreground">
                      {displayName}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      @{username}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {followStats.followingCount}
                        </span>{" "}
                        {ft("following")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {followStats.followersCount}
                        </span>{" "}
                        {ft("followers")}
                      </span>
                    </div>
                  </div>
                </div>
                {!isOwnProfile && (
                  <FollowButton
                    targetUserId={userId}
                    initialIsFollowing={followStats.isFollowing}
                    onFollowChange={handleFollowChange}
                  />
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatsCard
              title={t("stats.collections")}
              value={collections.length}
              icon={Link2}
              color="purple"
              loading={loading}
            />
            <StatsCard
              title={t("stats.totalViews")}
              value={collections.reduce((sum, c) => sum + (c.views || 0), 0)}
              icon={BarChart3}
              color="blue"
              loading={loading}
            />
            <StatsCard
              title={ft("followers")}
              value={followStats.followersCount}
              icon={Users}
              color="green"
              loading={loading}
            />
            <StatsCard
              title={ft("following")}
              value={followStats.followingCount}
              icon={User}
              color="orange"
              loading={loading}
            />
          </div>

          {/* User's Collections */}
          <Card className="glass-effect border-border/30 bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">
                {t("myCollections.title")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {ft("userCollections")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center justify-between p-4 bg-muted/10 rounded-lg"
                    >
                      <div className="space-y-2">
                        <div className="h-4 w-48 bg-muted/30 rounded" />
                        <div className="h-3 w-32 bg-muted/20 rounded" />
                      </div>
                      <div className="h-3 w-20 bg-muted/20 rounded" />
                    </div>
                  ))
                ) : collections.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {ft("noCollections")}
                  </p>
                ) : (
                  collections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/${locale}/collection/${collection.id}`}
                    >
                      <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer">
                        <div>
                          <h4 className="font-medium text-foreground">
                            {collection.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {collection.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 shrink-0">
                          <span className="text-sm text-muted-foreground">
                            {t("myCollections.views", {
                              count: collection.views || 0,
                            })}
                          </span>
                          <Button variant="ghost" size="sm">
                            {commonT("viewCollection")}
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
