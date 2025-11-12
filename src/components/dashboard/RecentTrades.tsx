import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

import { Trade } from '@/types/trade';

interface RecentTradesProps {
  trades?: Trade[];
  maxTrades?: number;
}

export function RecentTrades({ trades = [], maxTrades = 5 }: RecentTradesProps) {
  const navigate = useNavigate();

  // Sort trades by openTime in descending order and limit to maxTrades
  const recentTrades = [...trades]
    .sort((a, b) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime())
    .slice(0, maxTrades);

  const handleViewAllClick = () => {
    navigate('/trades');
  };

  const formatPnL = (pnl: number) => {
    if (pnl === 0) return '$0.00';
    const sign = pnl > 0 ? '+' : '';
    return `${sign}$${Math.abs(pnl).toFixed(2)}`;
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-600 dark:text-green-400';
    if (pnl < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const formatRMultiple = (r: number) => {
    if (r === 0) return '0.0R';
    return `${r > 0 ? '+' : ''}${r.toFixed(1)}R`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary" className="bg-primary/10 text-primary">Open</Badge>;
      case 'closed':
        return <Badge variant="secondary" className="bg-muted">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'long' ? (
      <ArrowUpRight className="h-4 w-4 text-success" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-danger" />
    );
  };

  return (
    <Card className="trading-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>
              {recentTrades.length > 0
                ? 'Your most recent trading activity'
                : 'No recent trades found'}
            </CardDescription>
          </div>
          {recentTrades.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleViewAllClick} className="text-muted-foreground">
              View All
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recentTrades.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Symbol</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">R</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTrades.map((trade) => (
                <TableRow 
                  key={trade.id} 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => navigate(`/trades/${trade.id}`)}
                >
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {trade.direction === 'long' ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      )}
                      <span className="capitalize">{trade.direction}</span>
                    </div>
                  </TableCell>
                  <TableCell>{trade.entry.toFixed(5)}</TableCell>
                  <TableCell>{trade.exit?.toFixed(5) || '-'}</TableCell>
                  <TableCell className={cn('text-right font-medium', getPnLColor(trade.pnl))}>
                    {formatPnL(trade.pnl)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={trade.rMultiple >= 0 ? 'default' : 'destructive'} 
                      className={cn(
                        'px-1.5 py-0.5 text-xs',
                        trade.rMultiple >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''
                      )}
                    >
                      {formatRMultiple(trade.rMultiple)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p className="text-sm">No recent trades to display</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => navigate('/trades/new')}
            >
              Add Your First Trade
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}