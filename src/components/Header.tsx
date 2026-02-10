"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, User, Grid3X3, Clock, Home, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { locales } from '@/locales';

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('common');
  
  console.log('Header component rendered, current route:', pathname);
  
  const isActive = (path: string) => pathname === path;
  
  const navItems = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/categories', label: t('categories'), icon: Grid3X3 },
    { path: '/recent', label: t('recent'), icon: Clock },
    { path: '/favorites', label: t('favorites'), icon: Heart },
    { path: '/profile', label: t('profile'), icon: User },
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
            {/* Language Switcher */}
            <div className="flex items-center space-x-1">
              <Globe className="text-muted-foreground" size={16} />
              <select
                className="bg-transparent text-sm text-foreground border-none focus:outline-none"
                onChange={(e) => {
                  const newLocale = e.target.value;
                  const currentPath = pathname;
                  const pathWithoutLocale = currentPath.replace(/^\/(en|zh)/, '');
                  router.push(`/${newLocale}${pathWithoutLocale || '/'}`);
                }}
                defaultValue={pathname.split('/')[1] || 'zh'}
              >
                {locales.map((locale) => (
                  <option key={locale} value={locale}>
                    {locale === 'en' ? 'English' : '中文'}
                  </option>
                ))}
              </select>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="glass-effect"
              asChild
            >
              <Link href="/auth/signin">
                {t('login')}
              </Link>
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              asChild
            >
              <Link href="/auth/signup">
                {t('register')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;