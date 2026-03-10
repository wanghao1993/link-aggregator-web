"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  Eye,
  Bookmark,
  Clock,
  Tag,
  User,
  Link2,
  CheckCircle,
  QrCode,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LinkCollection, LinkItem } from "@/types/link";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import ShareButton from "@/components/ShareButton";
import ShareModal from "@/components/ShareModal";

const mockLinks: LinkItem[] = [
  {
    id: "l1",
    title: "TensorFlow",
    description: "An end-to-end open source machine learning platform",
    url: "https://www.tensorflow.org",
    category: {
      id: "ai",
      name: "AI/ML",
      description: "AI & ML",
      icon: "🤖",
      color: "purple",
      slug: "ai-ml",
      isActive: true,
    },
    author: {
      id: "1",
      username: "ai_expert",
      displayName: "AI Expert",
      email: "ai@example.com",
      isVerified: true,
      joinedAt: new Date("2023-01-01"),
    },
    tags: ["ML", "Google", "Python"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    isActive: true,
    linkCount: 0,
    views: 450,
    likes: 32,
    isFavorited: false,
  },
  {
    id: "l2",
    title: "PyTorch",
    description: "An open source machine learning framework",
    url: "https://pytorch.org",
    category: {
      id: "ai",
      name: "AI/ML",
      description: "AI & ML",
      icon: "🤖",
      color: "purple",
      slug: "ai-ml",
      isActive: true,
    },
    author: {
      id: "1",
      username: "ai_expert",
      displayName: "AI Expert",
      email: "ai@example.com",
      isVerified: true,
      joinedAt: new Date("2023-01-01"),
    },
    tags: ["ML", "Meta", "Python"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    isActive: true,
    linkCount: 0,
    views: 380,
    likes: 28,
    isFavorited: false,
  },
  {
    id: "l3",
    title: "Hugging Face",
    description:
      "The AI community building the future with open source models and datasets",
    url: "https://huggingface.co",
    category: {
      id: "ai",
      name: "AI/ML",
      description: "AI & ML",
      icon: "🤖",
      color: "purple",
      slug: "ai-ml",
      isActive: true,
    },
    author: {
      id: "1",
      username: "ai_expert",
      displayName: "AI Expert",
      email: "ai@example.com",
      isVerified: true,
      joinedAt: new Date("2023-01-01"),
    },
    tags: ["NLP", "Models", "Datasets"],
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-18"),
    isActive: true,
    linkCount: 0,
    views: 520,
    likes: 41,
    isFavorited: true,
  },
];

const mockCollections: Record<string, LinkCollection> = {
  "1": {
    id: "1",
    title: "AI & Machine Learning Resources",
    description:
      "精心策划的AI和机器学习工具、论文和教程合集,涵盖从基础理论到实际应用的各个方面",
    author: {
      id: "1",
      username: "ai_expert",
      displayName: "AI Expert",
      email: "ai@example.com",
      isVerified: true,
      joinedAt: new Date("2023-01-01"),
    },
    links: mockLinks,
    category: {
      id: "ai",
      name: "AI/ML",
      description: "AI & Machine Learning",
      icon: "🤖",
      color: "purple",
      slug: "ai-ml",
      isActive: true,
    },
    tags: ["AI", "Machine Learning", "Tools", "Papers"],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    isPublic: true,
    views: 1250,
    likes: 89,
    isFavorited: false,
  },
  "2": {
    id: "2",
    title: "Web Development Tools",
    description:
      "现代Web开发必备工具和库的完整集合,包括框架、构建工具、UI组件等",
    author: {
      id: "2",
      username: "webdev_pro",
      displayName: "WebDev Pro",
      email: "web@example.com",
      isVerified: true,
      joinedAt: new Date("2023-02-01"),
    },
    links: mockLinks.slice(0, 2),
    category: {
      id: "web",
      name: "Web开发",
      description: "Web Development",
      icon: "💻",
      color: "blue",
      slug: "web-dev",
      isActive: true,
    },
    tags: ["React", "Vue", "Angular", "Tools"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    isPublic: true,
    views: 890,
    likes: 67,
    isFavorited: true,
  },
  "3": {
    id: "3",
    title: "Design Inspiration",
    description: "美丽的设计案例和资源库,为设计师提供源源不断的创意灵感",
    author: {
      id: "3",
      username: "design_guru",
      displayName: "Design Guru",
      email: "design@example.com",
      isVerified: false,
      joinedAt: new Date("2023-03-01"),
    },
    links: mockLinks.slice(0, 1),
    category: {
      id: "design",
      name: "设计",
      description: "Design Resources",
      icon: "🎨",
      color: "pink",
      slug: "design",
      isActive: true,
    },
    tags: ["UI/UX", "Inspiration", "Colors", "Typography"],
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-15"),
    isPublic: true,
    views: 567,
    likes: 45,
    isFavorited: false,
  },
};

export default function CollectionDetailPage() {
  const t = useTranslations("collectionDetail");
  const tc = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const collection = mockCollections[id];
  const [isFavorited, setIsFavorited] = useState(
    collection?.isFavorited ?? false
  );
  const [likes, setLikes] = useState(collection?.likes ?? 0);
  const ts = useTranslations("share");
  const [shareModalOpen, setShareModalOpen] = useState(false);

  if (!collection) {
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    setLikes((prev) => (isFavorited ? prev - 1 : prev + 1));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t("back")}
        </Button>

        {/* Header Section */}
        <div className="mb-8 fade-in">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-3xl">
                {collection.category.icon}
              </div>
              <div>
                <Badge
                  variant="secondary"
                  className="mb-2 bg-accent/50 text-accent-foreground"
                >
                  {collection.category.name}
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

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {collection.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-border/30 hover:bg-accent/30 transition-colors"
              >
                <Tag size={12} className="mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1.5">
              <Eye size={16} />
              <span>
                {collection.views.toLocaleString()} {t("stats.views")}
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

        {/* Author Section */}
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
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold">
                  {collection.author.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-foreground">
                    {collection.author.displayName}
                  </span>
                  {collection.author.isVerified && (
                    <CheckCircle size={16} className="text-blue-500" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  @{collection.author.username}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links List */}
        <div className="mb-8 fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
            <Link2 size={24} />
            <span>
              {t("links")} ({collection.links.length})
            </span>
          </h2>

          <div className="space-y-4">
            {collection.links.map((link) => (
              <Card
                key={link.id}
                className="glass-effect border-border/30 bg-card/60 link-card-hover group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-lg shrink-0">
                        {link.category.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {link.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {link.tags.map((tag, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs border-border/20"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary shrink-0 ml-4"
                      onClick={() => window.open(link.url, "_blank")}
                    >
                      <ExternalLink size={18} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
