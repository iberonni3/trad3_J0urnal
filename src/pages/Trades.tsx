import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Extended sample data for trades page
const allTrades = [
  {
    id: '1',
    symbol: 'EURUSD',
    direction: 'long',
    entry: 1.0875,
    exit: 1.0920,
    stopLoss: 1.0855,
    takeProfit: 1.0920,
    quantity: 1.0,
    pnl: 450.00,
    rMultiple: 2.1,
    timestamp: '2024-03-15 14:30:00',
    closeTime: '2024-03-15 16:15:00',
    status: 'closed',
    setup: 'Breakout',
    tags: ['momentum', 'trend'],
    broker: 'MetaTrader 5',
    commission: 7.50
  },
  {
    id: '2',
    symbol: 'GBPJPY',
    direction: 'short',
    entry: 189.45,
    exit: 188.92,
    stopLoss: 189.95,
    takeProfit: 188.45,
    quantity: 0.5,
    pnl: -265.00,
    rMultiple: -1.3,
    timestamp: '2024-03-15 09:15:00',
    closeTime: '2024-03-15 11:30:00',
    status: 'closed',
    setup: 'Reversal',
    tags: ['reversal', 'support'],
    broker: 'MetaTrader 5',
    commission: 5.25
  },
  {
    id: '3',
    symbol: 'XAUUSD',
    direction: 'long',
    entry: 2018.75,
    exit: 2025.30,
    stopLoss: 2010.00,
    takeProfit: 2035.00,
    quantity: 0.1,
    pnl: 655.00,
    rMultiple: 1.8,
    timestamp: '2024-03-14 16:45:00',
    closeTime: '2024-03-14 18:20:00',
    status: 'closed',
    setup: 'Support',
    tags: ['gold', 'support'],
    broker: 'MetaTrader 5',
    commission: 3.50
  },
  {
    id: '4',
    symbol: 'USDJPY',
    direction: 'short',
    entry: 149.85,
    exit: null,
    stopLoss: 150.35,
    takeProfit: 148.85,
    quantity: 0.8,
    pnl: 0,
    rMultiple: 0,
    timestamp: '2024-03-15 18:20:00',
    closeTime: null,
    status: 'open',
    setup: 'Trend',
    tags: ['trend', 'daily'],
    broker: 'MetaTrader 5',
    commission: 0
  },
  // Add more sample trades...
];

export default function Trades() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDirection, setFilterDirection] = useState('all');

  const filteredTrades = allTrades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.setup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || trade.status === filterStatus;
    const matchesDirection = filterDirection === 'all' || trade.direction === filterDirection;
    
    return matchesSearch && matchesStatus && matchesDirection;
  });

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
        return <Badge className="bg-primary/10 text-primary border-primary/20">Open</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Trades</h1>
          <p className="text-muted-foreground">
            Manage and analyze all your trading positions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button className="trading-gradient text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trade Filters</CardTitle>
          <CardDescription>
            Filter and search through your trades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by symbol, setup, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDirection} onValueChange={setFilterDirection}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Trades ({filteredTrades.length})</CardTitle>
          <CardDescription>
            Complete trading history with performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>R Multiple</TableHead>
                  <TableHead>Setup</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => (
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
                    <TableCell>{trade.quantity}</TableCell>
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
                      <div className="flex gap-1 flex-wrap">
                        {trade.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {trade.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{trade.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(trade.status)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}