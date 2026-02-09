"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types/link';

export default function Categories() {
  console.log('Categories page rendered');
  
  const categories: Category[] = [
    {
      id: 'ai',
      name: 'AI & Machine Learning',
      description: '人工智能和机器学习相关工具、论文、教程',
      icon: '🤖',
      color: 'purple',
      slug: 'ai-ml',
      isActive: true
    },
    {
      id: 'web',
      name: 'Web开发',
      description: '前端框架、后端工具、全栈开发资源',
      icon: '💻',
      color: 'blue',
      slug: 'web-dev',
      isActive: true
    },
    {
      id: 'design',
      name: '设计资源',
      description: 'UI/UX设计、图标、字体、配色工具',
      icon: '🎨',
      color: 'pink',
      slug: 'design',
      isActive: true
    },
    {
      id: 'mobile',
      name: '移动开发',
      description: 'iOS、Android、跨平台开发工具',
      icon: '📱',
      color: 'green',
      slug: 'mobile',
      isActive: true
    },
    {
      id: 'devops',
      name: 'DevOps',
      description: '部署、监控、CI/CD、云服务',
      icon: '⚙️',
      color: 'orange',
      slug: 'devops',
      isActive: true
    },
    {
      id: 'data',
      name: '数据科学',
      description: '数据分析、可视化、大数据工具',
      icon: '📊',
      color: 'cyan',
      slug: 'data-science',
      isActive: true
    }
  ];
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">浏览分类</h1>
          <p className="text-xl text-muted-foreground">
            按技术领域探索精选链接合集
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="glass-effect link-card-hover border-border/30 bg-card/40 hover:bg-card/60 cursor-pointer group"
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                    <Badge variant="outline" className="mt-1 border-border/30">
                      {Math.floor(Math.random() * 50) + 10} 个合集
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {category.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
