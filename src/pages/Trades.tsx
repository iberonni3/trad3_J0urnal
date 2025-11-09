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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Filter, Download, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useTrades, useCreateTrade } from '@/hooks/useTrades';
import { Trade, TradeInput } from '@/types/trade';
import TradeEntryForm from '@/components/trades/TradeEntryForm';

export default function Trades() {
  const navigate = useNavigate();
  const { data: allTrades = [], isLoading: isLoadingTrades } = useTrades();
  const createTrade = useCreateTrade();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDirection, setFilterDirection] = useState('all');
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);

  const filteredTrades = (allTrades || []).filter(trade => {
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
      typeof trade.openTime === 'string' ? trade.openTime : new Date(trade.openTime).toISOString(),
      trade.closeTime ? (typeof trade.closeTime === 'string' ? trade.closeTime : new Date(trade.closeTime).toISOString()) : '',
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

  const handleAddTrade = async (tradeInput: TradeInput) => {
    try {
      console.log('handleAddTrade called with:', tradeInput);
      await createTrade.mutateAsync(tradeInput);
      setIsAddTradeOpen(false);
    } catch (error) {
      console.error('Error in handleAddTrade:', error);
      // Error is handled by the mutation's onError callback
      // Don't close the dialog if there's an error
    }
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

  const handleViewTrade = (trade: Trade) => {
    navigate('/charts', { state: { trade } });
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
            <DialogContent className="mobile-modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Trade</DialogTitle>
                <DialogDescription>
                  Enter the details for your new trade position
                </DialogDescription>
              </DialogHeader>
              
              <TradeEntryForm
                onSubmit={handleAddTrade}
                onCancel={() => setIsAddTradeOpen(false)}
                isLoading={createTrade.isPending}
              />
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
                {isLoadingTrades ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-muted-foreground">Loading trades...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <p className="text-muted-foreground">No trades found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchTerm || filterStatus !== 'all' || filterDirection !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Add your first trade to get started'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredTrades.map((trade) => (
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewTrade(trade)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Chart
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