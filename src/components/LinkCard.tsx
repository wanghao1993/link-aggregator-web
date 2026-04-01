import React, { useState } from 'react';
import { ExternalLink, Heart, Eye, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LinkCollection } from '@/types/link';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import { LinkCardSkeleton } from '@/components/skeletons';
import { useAuth } from '@/lib/supabase/auth-context';

interface LinkCardProps {
  collection?: LinkCollection;
  loading?: boolean;
  onFavorite?: () => void;
  onVisit?: () => void;
}

// 分类颜色配置
const CATEGORY_COLORS: Record<string, { bg: string; text: string; iconBg: string }> = {
  ai: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    iconBg: 'from-purple-500 to-violet-500'
  },
  web: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    iconBg: 'from-blue-500 to-cyan-500'
  },
  design: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    text: 'text-pink-600 dark:text-pink-400',
    iconBg: 'from-pink-500 to-rose-500'
  },
  tools: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    iconBg: 'from-green-500 to-emerald-500'
  },
  mobile: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'from-indigo-500 to-violet-500'
  },
  devops: {
    bg: 'bg-slate-100 dark:bg-slate-900/30',
    text: 'text-slate-600 dark:text-slate-400',
    iconBg: 'from-slate-500 to-gray-500'
  },
  data: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-600 dark:text-teal-400',
    iconBg: 'from-teal-500 to-cyan-500'
  },
  security: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    iconBg: 'from-red-500 to-rose-500'
  },
  productivity: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'from-amber-500 to-orange-500'
  },
};

const LinkCard: React.FC<LinkCardProps> = ({
  loading = false,
  collection = {
    id: '1',
    title: 'AI & Machine Learning Resources',
    description: '精心策划的AI和机器学习工具、论文和教程合集',
    author: {
      id: '1',
      username: 'demo_user',
      displayName: 'Demo User',
      email: 'demo@example.com',
      avatar: '',
      isVerified: true,
      joinedAt: new Date('2023-01-01')
    },
    links: [],
    category: {
      id: 'ai',
      name: 'AI/ML',
      description: 'Artificial Intelligence and Machine Learning',
      icon: '🤖',
      color: 'purple',
      slug: 'ai-ml',
      isActive: true
    },
    tags: ['AI', 'Machine Learning', 'Tools'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    isPublic: true,
    views: 1250,
    likes: 89,
    isFavorited: false
  },
  onFavorite,
  onVisit
}) => {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(collection.isFavorited ?? false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  if (loading) {
    return <LinkCardSkeleton />;
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      router.push(`/${locale}/auth/signin?redirect=/${locale}/collection/${collection.id}`);
      return;
    }

    if (onFavorite) {
      onFavorite();
      return;
    }

    setIsFavoriteLoading(true);
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await fetch(`/api/collections/${collection.id}/favorite`, {
        method,
      });

      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.isFavorited ?? !isFavorited);
      } else if (res.status === 401) {
        router.push(`/${locale}/auth/signin?redirect=/${locale}/collection/${collection.id}`);
      }
    } catch {
      // ignore
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleVisit = () => {
    if (onVisit) {
      onVisit();
    }
    router.push(`/${locale}/collection/${collection.id}`);
  };

  // 获取分类颜色配置
  const categoryColor = CATEGORY_COLORS[collection.category.id] || CATEGORY_COLORS.tools;

  return (
    <div
      className="group bg-card border border-border/50 rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={handleVisit}
    >
      {/* 卡片头部 */}
      <div className="flex items-start gap-4 mb-4">
        {/* 分类图标 */}
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${categoryColor.iconBg} flex items-center justify-center text-2xl shrink-0`}>
          {collection.category.icon}
        </div>

        {/* 分类和标题 */}
        <div className="flex-1 min-w-0">
          <Badge
            variant="secondary"
            className={`mb-2 ${categoryColor.bg} ${categoryColor.text} border-0 text-xs font-medium`}
          >
            {collection.category.name}
          </Badge>
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {collection.title}
          </h3>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 shrink-0">
          <ShareButton
            url={typeof window !== 'undefined' ? `${window.location.origin}/${locale}/collection/${collection.id}` : ''}
            title={collection.title}
            description={collection.description}
            className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          />
          <button
            onClick={handleFavorite}
            disabled={isFavoriteLoading}
            className={`w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors ${
              isFavorited ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* 描述 */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
        {collection.description}
      </p>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {collection.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className={`text-xs ${index === 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 底部信息 */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        {/* 作者 */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-[10px] text-white font-medium">
            {collection.author.displayName?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-xs text-muted-foreground">
            {collection.author.displayName}
          </span>
        </div>

        {/* 统计 */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{collection.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={14} />
            <span>{collection.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;
