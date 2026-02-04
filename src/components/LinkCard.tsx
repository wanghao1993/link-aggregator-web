import React from 'react';
import { ExternalLink, Heart, Eye, Clock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LinkCollection } from '@/types/link';

interface LinkCardProps {
  collection?: LinkCollection;
  onFavorite?: () => void;
  onVisit?: () => void;
}

const LinkCard: React.FC<LinkCardProps> = ({
  collection = {
    id: '1',
    title: 'AI & Machine Learning Resources',
    description: '精心策划的AI和机器学习工具、论文和教程合集',
    author: {
      id: '1',
      username: 'demo_user',
      displayName: 'Demo User',
      email: 'demo@example.com',
      avatar: '',
      isVerified: true,
      joinedAt: new Date('2023-01-01')
    },
    links: [],
    category: {
      id: 'ai',
      name: 'AI/ML',
      description: 'Artificial Intelligence and Machine Learning',
      icon: '🤖',
      color: 'purple',
      slug: 'ai-ml',
      isActive: true
    },
    tags: ['AI', 'Machine Learning', 'Tools'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    isPublic: true,
    views: 1250,
    likes: 89,
    isFavorited: false
  },
  onFavorite = () => console.log('Favorite toggled'),
  onVisit = () => console.log('Collection visited')
}) => {
  console.log('LinkCard rendered for collection:', collection.title);
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1天前';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`;
    return `${Math.ceil(diffDays / 30)}月前`;
  };
  
  return (
    <Card data-cmp="LinkCard" className="glass-effect link-card-hover border-border/30 bg-card/60 fade-in">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-xl">
              {collection.category.icon}
            </div>
            <div>
              <Badge variant="secondary" className="mb-2 bg-accent/50 text-accent-foreground">
                {collection.category.name}
              </Badge>
              <CardTitle className="text-lg text-foreground hover:text-primary transition-colors cursor-pointer">
                {collection.title}
              </CardTitle>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onFavorite}
            className={`${collection.isFavorited ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
          >
            <Heart size={18} fill={collection.isFavorited ? 'currentColor' : 'none'} />
          </Button>
        </div>
        
        <CardDescription className="text-muted-foreground leading-relaxed">
          {collection.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {collection.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs border-border/30 hover:bg-accent/30 transition-colors cursor-pointer"
            >
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User size={14} />
              <span>{collection.author.displayName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye size={14} />
              <span>{collection.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart size={14} />
              <span>{collection.likes}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{formatDate(collection.updatedAt)}</span>
          </div>
        </div>
        
        {/* Action Button */}
        <Button
          onClick={onVisit}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 group"
        >
          <span>查看合集</span>
          <ExternalLink size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LinkCard;