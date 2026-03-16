"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { FolderOpen, ArrowRight } from 'lucide-react';

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

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
      blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
      green: 'from-green-500/20 to-green-500/5 border-green-500/20',
      orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20',
      pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/20',
      cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20',
      red: 'from-red-500/20 to-red-500/5 border-red-500/20',
      yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20',
      slate: 'from-slate-500/20 to-slate-500/5 border-slate-500/20',
      default: 'from-primary/20 to-primary/5 border-primary/20',
    };
    return colors[color] || colors.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-2xl h-40" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/${locale}/category/${category.slug}`}
                className="group"
              >
                <Card className="h-full bg-gradient-to-br border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getColorClasses(category.color)} flex items-center justify-center text-2xl`}>
                        {category.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                          {category.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {t('collectionsCount', { count: category.collection_count })}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardHeader>
                  {category.description && (
                    <CardContent className="pt-0">
                      <CardDescription className="line-clamp-2">
                        {category.description}
                      </CardDescription>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
