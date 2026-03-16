import React from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User as UserType } from '@/types/link';
import { useTranslations } from 'next-intl';

interface UserAvatarProps {
  user?: UserType;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showBadge?: boolean;
  avatarUrl?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user = {
    id: '1',
    username: 'demo_user',
    displayName: 'Demo User',
    email: 'demo@example.com',
    isVerified: true,
    joinedAt: new Date('2023-01-01')
  },
  size = 'md',
  showName = true,
  showBadge = true,
  avatarUrl
}) => {
  const t = useTranslations('common');
  console.log('UserAvatar rendered for user:', user.displayName);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  const avatarSrc = avatarUrl || user.avatar;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div data-cmp="UserAvatar" className="flex items-center space-x-3">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={avatarSrc} alt={user.displayName} />
          <AvatarFallback className="bg-brand-gradient text-white">
            {avatarSrc ? getInitials(user.displayName) : <User size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />}
          </AvatarFallback>
        </Avatar>
        
        {showBadge && user.isVerified && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
      
      {showName && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-foreground truncate">
              {user.displayName}
            </p>
            {user.isVerified && (
              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                {t('verified')}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;