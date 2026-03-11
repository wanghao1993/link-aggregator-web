"use client";

import React, { useEffect, useState } from "react";
import { User, Settings, BarChart3, Link2, Users } from "lucide-react";
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

interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export default function Profile() {
  const t = useTranslations("profilePage");
  const ft = useTranslations("follow");
  const commonT = useTranslations("common");
  const { user } = useAuth();
  const [followStats, setFollowStats] = useState<FollowStats>({
    followersCount: 0,
    followingCount: 0,
  });

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    fetch(`/api/users/${userId}/follow`)
      .then((res) => res.json())
      .then((data) => {
        setFollowStats({
          followersCount: data.followersCount ?? 0,
          followingCount: data.followingCount ?? 0,
        });
      })
      .catch(console.error);
  }, [userId]);

  const displayName = user?.user_metadata?.name || "Demo User";
  const email = user?.email || "demo@example.com";

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
                      id: userId || "1",
                      username: email.split("@")[0],
                      displayName,
                      email,
                      bio: "",
                      isVerified: true,
                      joinedAt: new Date(),
                    }}
                    size="lg"
                    showName={false}
                  />
                  <div>
                    <CardTitle className="text-2xl text-foreground">
                      {displayName}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      @{email.split("@")[0]}
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
                <Button variant="outline" className="glass-effect">
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
              value="12"
              icon={Link2}
              color="purple"
            />
            <StatsCard
              title={t("stats.totalViews")}
              value="5.2K"
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
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-muted/10 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-foreground">
                        {t("myCollections.collectionName", { index: i + 1 })}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t("myCollections.lastUpdated", { time: "2d" })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {t("myCollections.views", { count: 125 })}
                      </span>
                      <Button variant="ghost" size="sm">
                        {commonT("edit")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
