import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

  console.log('StatsCard rendered:', title, value);

  const getColorClass = (color: string) => {
    const colors = {
      primary: 'bg-brand-gradient',
      accent: 'bg-accent-gradient',
      success: 'bg-gradient-to-r from-green-500 to-emerald-500',
      info: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      warning: 'bg-gradient-to-r from-orange-500 to-amber-500'
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <Card data-cmp="StatsCard" className="glass-effect border-border/30 bg-card/40 hover:bg-card/60 transition-all link-card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {change !== 0 && (
                <span className={`text-sm font-medium ${
                  change > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              )}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${getColorClass(color)}`}>
            <Icon className="text-white" size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;