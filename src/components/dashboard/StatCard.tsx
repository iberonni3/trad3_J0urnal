import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: ReactNode;
  className?: string;
  description?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
  description
}: StatCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn('mobile-stat-card', className)}>
      <CardContent className="section-padding">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <div className="space-y-1">
              <p className="text-xl sm:text-2xl font-bold break-words">{value}</p>
              {change && (
                <p className={cn('text-xs sm:text-sm font-medium', getChangeColor())}>
                  {change}
                </p>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}