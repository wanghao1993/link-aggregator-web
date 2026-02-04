"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, User, Grid3X3, Clock, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const pathname = usePathname();
  
  console.log('Header component rendered, current route:', pathname);
  
  const isActive = (path: string) => pathname === path;
  
  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/categories', label: '分类', icon: Grid3X3 },
    { path: '/recent', label: '最新', icon: Clock },
    { path: '/favorites', label: '收藏', icon: Heart },
    { path: '/profile', label: '个人中心', icon: User },
  ];
  
  return (
    <header data-cmp="Header" className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Search className="text-white" size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">链接聚合</h1>
              <p className="text-xs text-muted-foreground">发现精选链接合集</p>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                href={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(path)
                    ? 'bg-primary/20 text-primary shadow-lg backdrop-blur-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Icon size={16} />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="glass-effect">
              登录
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              注册
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;