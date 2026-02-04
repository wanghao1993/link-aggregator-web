import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title?: string;
  value?: string | number;
  icon?: LucideIcon;
  change?: number;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title = '统计项目',
  value = '0',
  icon: Icon = () => <div className="w-6 h-6 bg-muted rounded" />,
  change = 0,
  color = 'purple'
}) => {
  console.log('StatsCard rendered:', title, value);
  
  const getColorGradient = (color: string) => {
    const gradients = {
      purple: 'from-purple-500 to-blue-500',
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-emerald-500',
      orange: 'from-orange-500 to-red-500',
      pink: 'from-pink-500 to-purple-500'
    };
    return gradients[color as keyof typeof gradients] || gradients.purple;
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
          
          <div className={`p-3 rounded-lg bg-gradient-to-r ${getColorGradient(color)}`}>
            <Icon className="text-white" size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;