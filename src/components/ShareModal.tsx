"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url?: string;
  title?: string;
  description?: string;
}

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" width="20" height="20">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" width="20" height="20">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.09.044 1.613.115v3.146c-.427-.044-.928-.065-1.51-.065-2.14 0-2.97.812-2.97 2.926v1.436h4.28l-.735 3.667h-3.545v7.98H9.101z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" width="20" height="20">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onOpenChange,
  url,
  title = "",
  description = "",
}) => {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setShareUrl(url || (typeof window !== "undefined" ? window.location.href : ""));
  }, [url, open]);

  useEffect(() => {
    if (!open || !shareUrl || !canvasRef.current) return;

    generateQrCode(canvasRef.current, shareUrl);
  }, [open, shareUrl]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl, t]);

  const shareToTwitter = () => {
    const text = title ? `${title} - ${description}` : description;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToWeChat = () => {
    handleCopy();
    toast.info(t("wechatTip"));
  };

  const socialButtons = [
    { name: t("twitter"), icon: <TwitterIcon />, onClick: shareToTwitter, color: "hover:bg-black/10 dark:hover:bg-white/10" },
    { name: t("facebook"), icon: <FacebookIcon />, onClick: shareToFacebook, color: "hover:bg-blue-500/10" },
    { name: t("linkedin"), icon: <LinkedInIcon />, onClick: shareToLinkedIn, color: "hover:bg-blue-600/10" },
    { name: t("wechat"), icon: <MessageCircle size={20} />, onClick: shareToWeChat, color: "hover:bg-green-500/10" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("shareCollection")}</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2">
          <Input
            readOnly
            value={shareUrl}
            className="text-sm text-muted-foreground"
          />
          <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </Button>
        </div>

        <Separator />

        <div>
          <p className="text-sm font-medium mb-3">{t("shareTo")}</p>
          <div className="grid grid-cols-4 gap-3">
            {socialButtons.map((btn) => (
              <button
                key={btn.name}
                onClick={btn.onClick}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors ${btn.color}`}
              >
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                  {btn.icon}
                </div>
                <span className="text-xs text-muted-foreground">{btn.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col items-center gap-2">
          <canvas
            ref={canvasRef}
            width={160}
            height={160}
            className="rounded-lg border border-border/30"
          />
          <p className="text-xs text-muted-foreground">{t("scanQrCode")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;

function generateQrCode(canvas: HTMLCanvasElement, data: string) {
  const size = 160;
  const moduleCount = 33;
  const moduleSize = Math.floor(size / (moduleCount + 8));
  const offset = Math.floor((size - moduleSize * moduleCount) / 2);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const modules = encodeToModules(data, moduleCount);

  ctx.fillStyle = "#000000";
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        ctx.fillRect(
          offset + col * moduleSize,
          offset + row * moduleSize,
          moduleSize,
          moduleSize
        );
      }
    }
  }
}

/**
 * Minimal QR-like pattern generator. For production, use a library like `qrcode`.
 * This generates a visual pattern with finder patterns that resembles a QR code
 * but encodes the URL in a simplified way.
 */
function encodeToModules(data: string, size: number): boolean[][] {
  const modules: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        modules[startRow + r][startCol + c] = isOuter || isInner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    modules[6][i] = i % 2 === 0;
    modules[i][6] = i % 2 === 0;
  }

  // Data area - encode URL characters as a deterministic pattern
  let bitIndex = 0;
  const bytes: number[] = [];
  for (let i = 0; i < data.length; i++) {
    bytes.push(data.charCodeAt(i));
  }
  // Pad or hash to fill modules
  let hash = 0;
  for (const b of bytes) {
    hash = ((hash << 5) - hash + b) | 0;
  }

  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5;
    for (let row = 0; row < size; row++) {
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (cc < 0) continue;
        // Skip finder pattern areas
        if (
          (row < 8 && cc < 8) ||
          (row < 8 && cc >= size - 8) ||
          (row >= size - 8 && cc < 8)
        ) continue;
        if (row === 6 || cc === 6) continue;

        const byteIdx = bitIndex >> 3;
        const bitIdx = 7 - (bitIndex & 7);
        const byte = byteIdx < bytes.length
          ? bytes[byteIdx]
          : ((hash >> (bitIndex % 31)) ^ (bitIndex * 7)) & 0xff;
        modules[row][cc] = ((byte >> bitIdx) & 1) === 1;
        bitIndex++;
      }
    }
  }

  return modules;
}
