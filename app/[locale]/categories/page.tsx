"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FolderOpen } from 'lucide-react';

interface CategoryData {
  id: string;
  name: string;
  name_key: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  collection_count: number;
}

// 分类颜色配置
const CATEGORY_STYLES: Record<string, {
  iconBg: string;
  tagBg: string;
  tagText: string;
}> = {
  purple: {
    iconBg: 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30',
    tagBg: 'bg-purple-100 dark:bg-purple-900/30',
    tagText: 'text-purple-600 dark:text-purple-400'
  },
  blue: {
    iconBg: 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30',
    tagBg: 'bg-blue-100 dark:bg-blue-900/30',
    tagText: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    iconBg: 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30',
    tagBg: 'bg-green-100 dark:bg-green-900/30',
    tagText: 'text-green-600 dark:text-green-400'
  },
  orange: {
    iconBg: 'from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30',
    tagBg: 'bg-amber-100 dark:bg-amber-900/30',
    tagText: 'text-amber-600 dark:text-amber-400'
  },
  pink: {
    iconBg: 'from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30',
    tagBg: 'bg-pink-100 dark:bg-pink-900/30',
    tagText: 'text-pink-600 dark:text-pink-400'
  },
  cyan: {
    iconBg: 'from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30',
    tagBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    tagText: 'text-cyan-600 dark:text-cyan-400'
  },
  red: {
    iconBg: 'from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30',
    tagBg: 'bg-red-100 dark:bg-red-900/30',
    tagText: 'text-red-600 dark:text-red-400'
  },
  yellow: {
    iconBg: 'from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30',
    tagBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    tagText: 'text-yellow-600 dark:text-yellow-400'
  },
  slate: {
    iconBg: 'from-slate-100 to-slate-200 dark:from-slate-900/30 dark:to-slate-800/30',
    tagBg: 'bg-slate-100 dark:bg-slate-900/30',
    tagText: 'text-slate-600 dark:text-slate-400'
  },
};

export default function CategoriesPage() {
  const t = useTranslations('categoriesPage');
  const params = useParams();
  const locale = params.locale as string;

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-2xl h-48" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">暂无分类</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {categories.map((category) => {
                const style = CATEGORY_STYLES[category.color] || CATEGORY_STYLES.slate;

                return (
                  <Link
                    key={category.id}
                    href={`/${locale}/category/${category.slug}`}
                    className="group"
                  >
                    <div className="h-full bg-card border border-border/50 rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/20">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${style.iconBg} flex items-center justify-center text-3xl mb-4`}>
                        {category.icon}
                      </div>

                      {/* Title & Count */}
                      <div className="mb-2">
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('collectionsCount', { count: category.collection_count })}
                        </p>
                      </div>

                      {/* Description */}
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                          {category.description}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {category.id === 'ai' && (
                          <>
                            <span className={`px-2.5 py-1 text-xs rounded-full ${style.tagBg} ${style.tagText}`}>
                              GPT
                            </span>
                            <span className={`px-2.5 py-1 text-xs rounded-full ${style.tagBg} ${style.tagText}`}>
                              Stable Diffusion
                            </span>
                          </>
                        )}
                        {category.id === 'web' && (
                          <>
                            <span className={`px-2.5 py-1 text-xs rounded-full ${style.tagBg} ${style.tagText}`}>
                              React
                            </span>
                            <span className={`px-2.5 py-1 text-xs rounded-full ${style.tagBg} ${style.tagText}`}>
                              Vue
                            </span>
                          </>
                        )}
                        {category.id === 'design' && (
                          <>
                            <span className={`px-2.5 py-1 text-xs rounded-full ${style.tagBg} ${style.tagText}`}>
                              Figma
                            </span>
                            <span className={`px-2.5 py-1 text-xs rounded-full ${style.tagBg} ${style.tagText}`}>
                              图标库
                            </span>
                          </>
                        )}
                        {category.id === 'productivity' && (
                          <>
                            <span className={`px-2.5 py-1 text-xs rounded-full ${style.tagBg} ${style.tagText}`}>
                              Notion
                            </span>
                            <span className={`px-2.5 py-1 text-xs rounded-full ${style.tagBg} ${style.tagText}`}>
                              自动化
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
