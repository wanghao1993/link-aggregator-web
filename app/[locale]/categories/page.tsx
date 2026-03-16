"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types/link';
import { useTranslations } from 'next-intl';

export default function Categories() {
  const t = useTranslations('categoriesPage');
  const catT = useTranslations('categories');
  console.log('Categories page rendered');
  
  const categoryDefs = [
    { id: 'ai', nameKey: 'ai' as const, icon: '🤖', color: 'purple', slug: 'ai-ml' },
    { id: 'web', nameKey: 'web' as const, icon: '💻', color: 'blue', slug: 'web-dev' },
    { id: 'design', nameKey: 'design' as const, icon: '🎨', color: 'pink', slug: 'design' },
    { id: 'mobile', nameKey: 'mobile' as const, icon: '📱', color: 'green', slug: 'mobile' },
    { id: 'devops', nameKey: 'devops' as const, icon: '⚙️', color: 'orange', slug: 'devops' },
    { id: 'data', nameKey: 'data' as const, icon: '📊', color: 'cyan', slug: 'data-science' },
  ];
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">{t('title')}</h1>
          <p className="text-xl text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryDefs.map((cat) => (
            <Card
              key={cat.id}
              className="glass-effect link-card-hover border-border/30 bg-card/40 hover:bg-card/60 cursor-pointer group"
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-gradient rounded-lg flex items-center justify-center text-2xl">
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                      {catT(cat.nameKey)}
                    </CardTitle>
                    <Badge variant="outline" className="mt-1 border-border/30">
                      {t('collectionsCount', { count: Math.floor(Math.random() * 50) + 10 })}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {catT(cat.nameKey)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
