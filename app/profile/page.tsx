"use client";

import React from 'react';
import { User, Settings, BarChart3, Link2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/UserAvatar';
import StatsCard from '@/components/StatsCard';

export default function Profile() {
  console.log('Profile page rendered');
  
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card className="glass-effect border-border/30 bg-card/60">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <UserAvatar
                    user={{
                      id: '1',
                      username: 'demo_user',
                      displayName: 'Demo User',
                      email: 'demo@example.com',
                      bio: '专注于收集和分享优质技术资源',
                      website: 'https://example.com',
                      isVerified: true,
                      joinedAt: new Date('2023-01-01')
                    }}
                    size="lg"
                    showName={false}
                  />
                  <div>
                    <CardTitle className="text-2xl text-foreground">Demo User</CardTitle>
                    <CardDescription className="text-muted-foreground">@demo_user</CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">专注于收集和分享优质技术资源</p>
                    <p className="text-sm text-primary mt-1">https://example.com</p>
                  </div>
                </div>
                <Button variant="outline" className="glass-effect">
                  <Settings size={16} className="mr-2" />
                  编辑资料
                </Button>
              </div>
            </CardHeader>
          </Card>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatsCard
              title="创建的合集"
              value="12"
              icon={Link2}
              color="purple"
            />
            <StatsCard
              title="总浏览量"
              value="5.2K"
              icon={BarChart3}
              color="blue"
            />
            <StatsCard
              title="获得点赞"
              value="284"
              icon={User}
              color="green"
            />
            <StatsCard
              title="收藏数量"
              value="38"
              icon={User}
              color="orange"
            />
          </div>
          
          {/* My Collections */}
          <Card className="glass-effect border-border/30 bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">我的合集</CardTitle>
              <CardDescription className="text-muted-foreground">
                管理你创建的链接合集
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                    <div>
                      <h4 className="font-medium text-foreground">我的合集 {i + 1}</h4>
                      <p className="text-sm text-muted-foreground">最后更新: 2天前</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">125 浏览</span>
                      <Button variant="ghost" size="sm">编辑</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
