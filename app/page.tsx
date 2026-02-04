"use client";

import React, { useState } from 'react';
import { TrendingUp, Users, Link2, Star } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import LinkCard from '@/components/LinkCard';
import StatsCard from '@/components/StatsCard';
import { LinkCollection } from '@/types/link';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  console.log('Home page rendered');
  
  const mockCollections: LinkCollection[] = [
    {
      id: '1',
      title: 'AI & Machine Learning Resources',
      description: '精心策划的AI和机器学习工具、论文和教程合集,涵盖从基础理论到实际应用的各个方面',
      author: {
        id: '1',
        username: 'ai_expert',
        displayName: 'AI Expert',
        email: 'ai@example.com',
        isVerified: true,
        joinedAt: new Date('2023-01-01')
      },
      links: [],
      category: {
        id: 'ai',
        name: 'AI/ML',
        description: 'AI & Machine Learning',
        icon: '🤖',
        color: 'purple',
        slug: 'ai-ml',
        isActive: true
      },
      tags: ['AI', 'Machine Learning', 'Tools', 'Papers'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      isPublic: true,
      views: 1250,
      likes: 89,
      isFavorited: false
    },
    {
      id: '2',
      title: 'Web Development Tools',
      description: '现代Web开发必备工具和库的完整集合,包括框架、构建工具、UI组件等',
      author: {
        id: '2',
        username: 'webdev_pro',
        displayName: 'WebDev Pro',
        email: 'web@example.com',
        isVerified: true,
        joinedAt: new Date('2023-02-01')
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
      tags: ['React', 'Vue', 'Angular', 'Tools'],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      isPublic: true,
      views: 890,
      likes: 67,
      isFavorited: true
    },
    {
      id: '3',
      title: 'Design Inspiration',
      description: '美丽的设计案例和资源库,为设计师提供源源不断的创意灵感',
      author: {
        id: '3',
        username: 'design_guru',
        displayName: 'Design Guru',
        email: 'design@example.com',
        isVerified: false,
        joinedAt: new Date('2023-03-01')
      },
      links: [],
      category: {
        id: 'design',
        name: '设计',
        description: 'Design Resources',
        icon: '🎨',
        color: 'pink',
        slug: 'design',
        isActive: true
      },
      tags: ['UI/UX', 'Inspiration', 'Colors', 'Typography'],
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-15'),
      isPublic: true,
      views: 567,
      likes: 45,
      isFavorited: false
    }
  ];
  
  const filteredCollections = mockCollections.filter(collection => {
    const matchesCategory = selectedCategory === 'all' || collection.category.id === selectedCategory;
    const matchesSearch = collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collection.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 fade-in">
          <h1 className="text-5xl font-bold mb-6 gradient-text floating-animation">
            发现精选链接合集
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            探索社区精心策划的高质量资源合集,找到你需要的一切工具和知识
          </p>
          
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="搜索链接合集、标签或作者..."
          />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <StatsCard
            title="总合集数"
            value="1,234"
            icon={Link2}
            change={12}
            color="purple"
          />
          <StatsCard
            title="活跃用户"
            value="5,678"
            icon={Users}
            change={8}
            color="blue"
          />
          <StatsCard
            title="本月浏览"
            value="98.5K"
            icon={TrendingUp}
            change={15}
            color="green"
          />
          <StatsCard
            title="精选合集"
            value="256"
            icon={Star}
            change={5}
            color="orange"
          />
        </div>
        
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">浏览分类</h2>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
        
        {/* Collections Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {selectedCategory === 'all' ? '精选合集' : '筛选结果'}
            </h2>
            <p className="text-muted-foreground">
              共找到 {filteredCollections.length} 个合集
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => (
              <LinkCard
                key={collection.id}
                collection={collection}
                onFavorite={() => console.log('Toggled favorite for:', collection.title)}
                onVisit={() => console.log('Visiting collection:', collection.title)}
              />
            ))}
          </div>
          
          {filteredCollections.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 className="text-muted-foreground" size={24} />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">没有找到匹配的合集</h3>
              <p className="text-muted-foreground">尝试调整搜索条件或浏览其他分类</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
