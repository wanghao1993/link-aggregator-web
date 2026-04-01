import React from 'react';
import { LucideIcon } from 'lucide-react';
import { StatsCardSkeleton } from '@/components/skeletons';

interface StatsCardProps {
  title?: string;
  value?: string | number;
  icon?: LucideIcon;
  change?: number;
  color?: string;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title = '',
  value = '0',
  icon: Icon = () => <div className="w-6 h-6 bg-muted rounded" />,
  change = 0,
  color = 'primary',
  loading = false,
}) => {
  if (loading) {
    return <StatsCardSkeleton />;
  }

  // 背景色映射
  const getIconBgColor = (color: string) => {
    const colors: Record<string, string> = {
      primary: 'bg-teal-100 dark:bg-teal-900/30',
      success: 'bg-green-100 dark:bg-green-900/30',
      info: 'bg-blue-100 dark:bg-blue-900/30',
      warning: 'bg-amber-100 dark:bg-amber-900/30',
      accent: 'bg-amber-100 dark:bg-amber-900/30',
    };
    return colors[color] || colors.primary;
  };

  // 图标颜色映射
  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      primary: 'text-teal-600 dark:text-teal-400',
      success: 'text-green-600 dark:text-green-400',
      info: 'text-blue-600 dark:text-blue-400',
      warning: 'text-amber-600 dark:text-amber-400',
      accent: 'text-amber-600 dark:text-amber-400',
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* 图标 */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${getIconBgColor(color)}`}>
        <Icon className={getIconColor(color)} size={22} />
      </div>

      {/* 数值 */}
      <div className="text-3xl font-semibold tracking-tight text-foreground mb-1">
        {value}
      </div>

      {/* 标签 */}
      <div className="text-sm text-muted-foreground">
        {title}
      </div>

      {/* 变化指示器 */}
      {change !== 0 && (
        <div className={`text-xs font-medium mt-2 ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
};

export default StatsCard;
