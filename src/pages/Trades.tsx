import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Filter, Download, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Extended sample data for trades page
const allTradesData = [
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
    commission: 7.50,
    notes: 'Clean breakout above resistance'
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
    commission: 5.25,
    notes: 'Failed reversal at support level'
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
    commission: 3.50,
    notes: 'Strong bounce from weekly support'
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
    commission: 0,
    notes: 'Following daily trend lower'
  },
];

interface Trade {
  id: string;
  symbol: string;
  direction: 'long' | 'short';
  entry: number;
  exit: number | null;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  pnl: number;
  rMultiple: number;
  timestamp: string;
  closeTime: string | null;
  status: 'open' | 'closed';
  setup: string;
  tags: string[];
  broker: string;
  commission: number;
  notes: string;
}

export default function Trades() {
  const [allTrades, setAllTrades] = useState<Trade[]>(allTradesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDirection, setFilterDirection] = useState('all');
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  
  // Form state for new trade
  const [newTrade, setNewTrade] = useState({
    symbol: '',
    direction: 'long' as 'long' | 'short',
    entry: '',
    exit: '',
    stopLoss: '',
    takeProfit: '',
    quantity: '',
    setup: '',
    tags: '',
    broker: '',
    notes: '',
    status: 'open' as 'open' | 'closed'
  });

  const filteredTrades = allTrades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.setup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || trade.status === filterStatus;
    const matchesDirection = filterDirection === 'all' || trade.direction === filterDirection;
    
    return matchesSearch && matchesStatus && matchesDirection;
  });

  const exportToCSV = () => {
    const headers = [
      'ID', 'Symbol', 'Direction', 'Entry', 'Exit', 'Stop Loss', 'Take Profit',
      'Quantity', 'P&L', 'R Multiple', 'Open Time', 'Close Time', 'Status',
      'Setup', 'Tags', 'Broker', 'Commission', 'Notes'
    ];

    const csvData = filteredTrades.map(trade => [
      trade.id,
      trade.symbol,
      trade.direction,
      trade.entry,
      trade.exit || '',
      trade.stopLoss,
      trade.takeProfit,
      trade.quantity,
      trade.pnl,
      trade.rMultiple,
      trade.timestamp,
      trade.closeTime || '',
      trade.status,
      trade.setup,
      trade.tags.join('; '),
      trade.broker,
      trade.commission,
      trade.notes
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trades_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddTrade = () => {
    const entryPrice = parseFloat(newTrade.entry);
    const exitPrice = newTrade.exit ? parseFloat(newTrade.exit) : null;
    const stopLossPrice = parseFloat(newTrade.stopLoss);
    const takeProfitPrice = parseFloat(newTrade.takeProfit);
    const qty = parseFloat(newTrade.quantity);

    // Calculate P&L and R Multiple
    let pnl = 0;
    let rMultiple = 0;
    
    if (exitPrice && newTrade.status === 'closed') {
      const priceDiff = newTrade.direction === 'long' 
        ? exitPrice - entryPrice 
        : entryPrice - exitPrice;
      pnl = priceDiff * qty * (newTrade.symbol.includes('JPY') ? 1000 : 100000);
      
      const risk = Math.abs(entryPrice - stopLossPrice) * qty * (newTrade.symbol.includes('JPY') ? 1000 : 100000);
      rMultiple = risk > 0 ? pnl / risk : 0;
    }

    const trade: Trade = {
      id: (allTrades.length + 1).toString(),
      symbol: newTrade.symbol.toUpperCase(),
      direction: newTrade.direction,
      entry: entryPrice,
      exit: exitPrice,
      stopLoss: stopLossPrice,
      takeProfit: takeProfitPrice,
      quantity: qty,
      pnl: pnl,
      rMultiple: rMultiple,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      closeTime: newTrade.status === 'closed' ? new Date().toISOString().replace('T', ' ').slice(0, 19) : null,
      status: newTrade.status,
      setup: newTrade.setup,
      tags: newTrade.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      broker: newTrade.broker,
      commission: 0,
      notes: newTrade.notes
    };

    setAllTrades([...allTrades, trade]);
    
    // Reset form
    setNewTrade({
      symbol: '',
      direction: 'long',
      entry: '',
      exit: '',
      stopLoss: '',
      takeProfit: '',
      quantity: '',
      setup: '',
      tags: '',
      broker: '',
      notes: '',
      status: 'open'
    });
    
    setIsAddTradeOpen(false);
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
    <div className="content-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Trades</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage and analyze all your trading positions
          </p>
        </div>
        
        <div className="responsive-flex gap-3">
          <Button variant="outline" onClick={exportToCSV} className="mobile-hidden">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Dialog open={isAddTradeOpen} onOpenChange={setIsAddTradeOpen}>
            <DialogTrigger asChild>
              <Button className="trading-gradient text-white touch-friendly">
                <Plus className="h-4 w-4 mr-2" />
                Add Trade
              </Button>
            </DialogTrigger>
            <DialogContent className="mobile-modal-content max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Trade</DialogTitle>
                <DialogDescription>
                  Enter the details for your new trade position
                </DialogDescription>
              </DialogHeader>
              
              <div className="form-grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="e.g., EURUSD, XAUUSD"
                    value={newTrade.symbol}
                    onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="direction">Direction</Label>
                  <Select value={newTrade.direction} onValueChange={(value: 'long' | 'short') => setNewTrade({...newTrade, direction: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="entry">Entry Price</Label>
                  <Input
                    id="entry"
                    type="number"
                    step="0.0001"
                    placeholder="1.0875"
                    value={newTrade.entry}
                    onChange={(e) => setNewTrade({...newTrade, entry: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    placeholder="1.0"
                    value={newTrade.quantity}
                    onChange={(e) => setNewTrade({...newTrade, quantity: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stopLoss">Stop Loss</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    step="0.0001"
                    placeholder="1.0855"
                    value={newTrade.stopLoss}
                    onChange={(e) => setNewTrade({...newTrade, stopLoss: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="takeProfit">Take Profit</Label>
                  <Input
                    id="takeProfit"
                    type="number"
                    step="0.0001"
                    placeholder="1.0920"
                    value={newTrade.takeProfit}
                    onChange={(e) => setNewTrade({...newTrade, takeProfit: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="setup">Setup</Label>
                  <Input
                    id="setup"
                    placeholder="e.g., Breakout, Reversal"
                    value={newTrade.setup}
                    onChange={(e) => setNewTrade({...newTrade, setup: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="broker">Broker</Label>
                  <Input
                    id="broker"
                    placeholder="e.g., MetaTrader 5"
                    value={newTrade.broker}
                    onChange={(e) => setNewTrade({...newTrade, broker: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newTrade.status} onValueChange={(value: 'open' | 'closed') => setNewTrade({...newTrade, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newTrade.status === 'closed' && (
                  <div className="space-y-2">
                    <Label htmlFor="exit">Exit Price</Label>
                    <Input
                      id="exit"
                      type="number"
                      step="0.0001"
                      placeholder="1.0920"
                      value={newTrade.exit}
                      onChange={(e) => setNewTrade({...newTrade, exit: e.target.value})}
                    />
                  </div>
                )}
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="momentum, trend, breakout"
                    value={newTrade.tags}
                    onChange={(e) => setNewTrade({...newTrade, tags: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Trade analysis and notes..."
                    value={newTrade.notes}
                    onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddTradeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTrade} disabled={!newTrade.symbol || !newTrade.entry || !newTrade.quantity}>
                  Add Trade
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
          <div className="responsive-table-container">
            <Table className="responsive-table">
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