"use client";

import React, { useEffect, useState } from "react";
import { User, Settings, BarChart3, Link2, Users, Globe, MapPin, FileText } from "lucide-react";
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
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/supabase/auth-context";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  displayName: string;
  username: string;
  bio: string;
  website: string;
  location: string;
  avatarUrl: string;
}

interface FollowStats {
  followersCount: number;
  followingCount: number;
}

interface Collection {
  id: string;
  title: string;
  description: string;
  views: number;
  updated_at: string;
}

export default function Profile() {
  const t = useTranslations("profilePage");
  const ft = useTranslations("follow");
  const commonT = useTranslations("common");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats>({
    followersCount: 0,
    followingCount: 0,
  });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const profileRes = await fetch("/api/users/me");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        // Fetch follow stats
        const followRes = await fetch(`/api/users/${user.id}/follow`);
        if (followRes.ok) {
          const followData = await followRes.json();
          setFollowStats({
            followersCount: followData.followersCount ?? 0,
            followingCount: followData.followingCount ?? 0,
          });
        }

        // Fetch user's collections
        const collectionsRes = await fetch(`/api/collections?userId=${user.id}`);
        if (collectionsRes.ok) {
          const collectionsData = await collectionsRes.json();
          setCollections(
            Array.isArray(collectionsData)
              ? collectionsData
              : collectionsData.collections || []
          );
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-muted/30 rounded-lg" />
            <div className="grid grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted/30 rounded-lg" />
              ))}
            </div>
            <div className="h-64 bg-muted/30 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  const displayName = profile.displayName || profile.name || "User";
  const username = profile.username || profile.email.split("@")[0];
  const totalViews = collections.reduce((sum, c) => sum + (c.views || 0), 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card className="glass-effect border-border/30 bg-card/60">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <UserAvatar
                    user={{
                      id: profile.id,
                      username,
                      displayName,
                      email: profile.email,
                      bio: profile.bio,
                      isVerified: true,
                      joinedAt: new Date(),
                    }}
                    size="lg"
                    showName={false}
                    avatarUrl={profile.avatarUrl}
                  />
                  <div>
                    <CardTitle className="text-2xl text-foreground">
                      {displayName}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      @{username}
                    </CardDescription>
                    
                    {/* Bio */}
                    {profile.bio && (
                      <p className="mt-2 text-sm text-foreground/80 max-w-md">
                        <FileText className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {profile.bio}
                      </p>
                    )}
                    
                    {/* Location & Website */}
                    <div className="flex items-center gap-4 mt-2">
                      {profile.location && (
                        <span className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {profile.location}
                        </span>
                      )}
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center"
                        >
                          <Globe className="h-3.5 w-3.5 mr-1" />
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>

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
                <Button
                  variant="outline"
                  className="glass-effect"
                  onClick={() => router.push("/profile/settings")}
                >
                  <Settings size={16} className="mr-2" />
                  {t("editProfile")}
                </Button>
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
            />
            <StatsCard
              title={t("stats.totalViews")}
              value={totalViews}
              icon={BarChart3}
              color="blue"
            />
            <StatsCard
              title={ft("followers")}
              value={followStats.followersCount}
              icon={Users}
              color="green"
            />
            <StatsCard
              title={ft("following")}
              value={followStats.followingCount}
              icon={User}
              color="orange"
            />
          </div>

          {/* My Collections */}
          <Card className="glass-effect border-border/30 bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">
                {t("myCollections.title")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {t("myCollections.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collections.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {ft("noCollections")}
                  </p>
                ) : (
                  collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center justify-between p-4 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => router.push(`/collection/${collection.id}`)}
                    >
                      <div>
                        <h4 className="font-medium text-foreground">
                          {collection.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {collection.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {t("myCollections.views", { count: collection.views || 0 })}
                        </span>
                        <Button variant="ghost" size="sm">
                          {commonT("edit")}
                        </Button>
                      </div>
                    </div>
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
