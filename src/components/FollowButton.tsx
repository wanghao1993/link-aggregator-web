"use client";

import React, { useState, useCallback } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: "sm" | "default";
}

const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  initialIsFollowing = false,
  onFollowChange,
  size = "default",
}) => {
  const { data: session } = useSession();
  const t = useTranslations("follow");
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleToggleFollow = useCallback(async () => {
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to toggle follow");
      }

      const data = await res.json();
      setIsFollowing(data.isFollowing);
      onFollowChange?.(data.isFollowing);
    } catch (error) {
      console.error("Follow toggle error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session, targetUserId, router, onFollowChange]);

  const getButtonText = () => {
    if (isLoading) return t("follow");
    if (isFollowing && isHovering) return t("unfollow");
    if (isFollowing) return t("following");
    return t("follow");
  };

  const getButtonVariant = () => {
    if (isFollowing && isHovering) return "destructive" as const;
    if (isFollowing) return "outline" as const;
    return "default" as const;
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      onClick={handleToggleFollow}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isLoading}
      className="min-w-[100px] transition-all"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : isFollowing ? (
        isHovering ? (
          <UserPlus size={16} />
        ) : (
          <UserCheck size={16} />
        )
      ) : (
        <UserPlus size={16} />
      )}
      {getButtonText()}
    </Button>
  );
};

export default FollowButton;
