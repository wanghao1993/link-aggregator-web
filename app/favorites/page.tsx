"use client";

import React from 'react';
import { Heart } from 'lucide-react';
import LinkCard from '@/components/LinkCard';

export default function Favorites() {
  console.log('Favorites page rendered');
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Heart className="text-red-500" size={32} fill="currentColor" />
            <h1 className="text-4xl font-bold gradient-text">我的收藏</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            管理你收藏的链接合集
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <LinkCard
              key={i}
              collection={{
                id: `fav-${i}`,
                title: `收藏的合集 ${i + 1}`,
                description: '这是你收藏的一个精选链接合集',
                author: {
                  id: '1',
                  username: 'user',
                  displayName: 'User',
                  email: 'user@example.com',
                  isVerified: true,
                  joinedAt: new Date('2023-01-01')
                },
                links: [],
                category: {
                  id: 'web',
                  name: 'Web开发',
                  description: 'Web Development',
                  icon: '💻',
                  color: 'blue',
                  slug: 'web-dev',
                  isActive: true
                },
                tags: ['收藏', '精选'],
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-20'),
                isPublic: true,
                views: 100,
                likes: 10,
                isFavorited: true
              }}
              onFavorite={() => console.log(`Remove from favorites ${i}`)}
              onVisit={() => console.log(`Visit favorite ${i}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
