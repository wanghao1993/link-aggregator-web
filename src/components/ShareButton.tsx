"use client";

import React, { useCallback } from "react";
import { Share2, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface ShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "icon" | "default" | "sm" | "lg";
  className?: string;
}

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" width="16" height="16">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" width="16" height="16">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.09.044 1.613.115v3.146c-.427-.044-.928-.065-1.51-.065-2.14 0-2.97.812-2.97 2.926v1.436h4.28l-.735 3.667h-3.545v7.98H9.101z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" width="16" height="16">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title = "",
  description = "",
  variant = "ghost",
  size = "icon",
  className,
}) => {
  const t = useTranslations("share");

  const getShareUrl = useCallback(() => {
    return url || (typeof window !== "undefined" ? window.location.href : "");
  }, [url]);

  const handleCopyLink = useCallback(async () => {
    const shareUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("copied"));
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success(t("copied"));
    }
  }, [getShareUrl, t]);

  const handleNativeShare = useCallback(async () => {
    const shareUrl = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: shareUrl });
      } catch {
        // user cancelled
      }
    }
  }, [getShareUrl, title, description]);

  const shareToTwitter = useCallback(() => {
    const shareUrl = getShareUrl();
    const text = title ? `${title} - ${description}` : description;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  }, [getShareUrl, title, description]);

  const shareToFacebook = useCallback(() => {
    const shareUrl = getShareUrl();
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  }, [getShareUrl]);

  const shareToLinkedIn = useCallback(() => {
    const shareUrl = getShareUrl();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  }, [getShareUrl]);

  const shareToWeChat = useCallback(() => {
    handleCopyLink();
    toast.info(t("wechatTip"));
  }, [handleCopyLink, t]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 size={18} />
          {size !== "icon" && <span className="ml-2">{t("title")}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>{t("shareTo")}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy size={16} />
          <span>{t("copyLink")}</span>
        </DropdownMenuItem>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 size={16} />
              <span>{t("title")}</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={shareToTwitter}>
          <TwitterIcon className="shrink-0" />
          <span>{t("twitter")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareToFacebook}>
          <FacebookIcon className="shrink-0" />
          <span>{t("facebook")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareToLinkedIn}>
          <LinkedInIcon className="shrink-0" />
          <span>{t("linkedin")}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={shareToWeChat}>
          <MessageCircle size={16} />
          <span>{t("wechat")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
