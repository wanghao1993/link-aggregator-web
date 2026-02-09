"use client";

import React from 'react';
import { Clock } from 'lucide-react';
import LinkCard from '@/components/LinkCard';

export default function Recent() {
  console.log('Recent page rendered');
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Clock className="text-primary" size={32} />
            <h1 className="text-4xl font-bold gradient-text">最新更新</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            查看最近添加和更新的链接合集
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <LinkCard
              key={i}
              onFavorite={() => console.log(`Favorite toggled for item ${i}`)}
              onVisit={() => console.log(`Visit item ${i}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
