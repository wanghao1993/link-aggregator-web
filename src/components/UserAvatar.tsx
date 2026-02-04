import React from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User as UserType } from '@/types/link';

interface UserAvatarProps {
  user?: UserType;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showBadge?: boolean;
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
  showBadge = true
}) => {
  console.log('UserAvatar rendered for user:', user.displayName);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
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
          <AvatarImage src={user.avatar} alt={user.displayName} />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            {user.avatar ? getInitials(user.displayName) : <User size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />}
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
                已验证
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