import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const LinkItemSkeleton: React.FC = () => (
  <Card className="glass-effect border-border/30 bg-card/60">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-10 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-md shrink-0 ml-4" />
      </div>
    </CardContent>
  </Card>
);

const CollectionDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-9 w-24 rounded-md mb-6" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-16 h-16 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-8 w-64" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-18" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <Separator className="mb-8 border-border/30" />

        {/* Author */}
        <Card className="glass-effect border-border/30 bg-card/60 mb-8">
          <CardHeader>
            <Skeleton className="h-6 w-20" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="mb-8">
          <Skeleton className="h-7 w-36 mb-6" />
          <div className="space-y-4">
            <LinkItemSkeleton />
            <LinkItemSkeleton />
            <LinkItemSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionDetailSkeleton;
