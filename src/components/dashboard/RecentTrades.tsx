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

// Sample trades data
const recentTrades = [
  {
    id: '1',
    symbol: 'EURUSD',
    direction: 'long',
    entry: 1.0875,
    exit: 1.0920,
    pnl: 450.00,
    rMultiple: 2.1,
    timestamp: '2024-03-15 14:30:00',
    status: 'closed',
    setup: 'Breakout'
  },
  {
    id: '2',
    symbol: 'GBPJPY',
    direction: 'short',
    entry: 189.45,
    exit: 188.92,
    pnl: -265.00,
    rMultiple: -1.3,
    timestamp: '2024-03-15 09:15:00',
    status: 'closed',
    setup: 'Reversal'
  },
  {
    id: '3',
    symbol: 'XAUUSD',
    direction: 'long',
    entry: 2018.75,
    exit: 2025.30,
    pnl: 655.00,
    rMultiple: 1.8,
    timestamp: '2024-03-14 16:45:00',
    status: 'closed',
    setup: 'Support'
  },
  {
    id: '4',
    symbol: 'USDJPY',
    direction: 'short',
    entry: 149.85,
    exit: null,
    pnl: 0,
    rMultiple: 0,
    timestamp: '2024-03-15 18:20:00',
    status: 'open',
    setup: 'Trend'
  },
  {
    id: '5',
    symbol: 'BTCUSD',
    direction: 'long',
    entry: 42150.00,
    exit: 43200.00,
    pnl: 1050.00,
    rMultiple: 3.2,
    timestamp: '2024-03-13 11:30:00',
    status: 'closed',
    setup: 'Momentum'
  }
];

export function RecentTrades() {
  const navigate = useNavigate();

  const handleViewAllClick = () => {
    navigate('/trades');
  };

  const formatPnL = (pnl: number) => {
    if (pnl === 0) return '$0.00';
    const sign = pnl > 0 ? '+' : '';
    return `${sign}$${pnl.toFixed(2)}`;
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-success';
    if (pnl < 0) return 'text-danger';
    return 'text-muted-foreground';
  };

  const formatRMultiple = (r: number) => {
    if (r === 0) return '0.0R';
    const sign = r > 0 ? '+' : '';
    return `${sign}${r.toFixed(1)}R`;
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>
            Your latest trading activity and performance
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleViewAllClick}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>Exit</TableHead>
              <TableHead>P&L</TableHead>
              <TableHead>R Multiple</TableHead>
              <TableHead>Setup</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTrades.map((trade) => (
              <TableRow key={trade.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {trade.symbol}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getDirectionIcon(trade.direction)}
                    <span className="capitalize">{trade.direction}</span>
                  </div>
                </TableCell>
                <TableCell>{trade.entry.toFixed(trade.symbol.includes('JPY') ? 2 : 4)}</TableCell>
                <TableCell>
                  {trade.exit ? trade.exit.toFixed(trade.symbol.includes('JPY') ? 2 : 4) : '-'}
                </TableCell>
                <TableCell className={cn('font-medium', getPnLColor(trade.pnl))}>
                  {formatPnL(trade.pnl)}
                </TableCell>
                <TableCell className={cn('font-medium', getPnLColor(trade.pnl))}>
                  {formatRMultiple(trade.rMultiple)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {trade.setup}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getStatusBadge(trade.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}