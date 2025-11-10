import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Download, ArrowUpRight, ArrowDownRight, Eye, Trash2, ImageIcon, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useTrades, useCreateTrade, useDeleteTrade } from '@/hooks/useTrades';
import { Trade, TradeInput } from '@/types/trade';
import TradeEntryForm from '@/components/trades/TradeEntryForm';

export default function Trades() {
  const navigate = useNavigate();
  const { data: allTrades = [], isLoading: isLoadingTrades } = useTrades();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDirection, setFilterDirection] = useState('all');
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'gallery' | 'table'>('gallery');
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const createTrade = useCreateTrade(() => setIsAddTradeOpen(false));
  const deleteTrade = useDeleteTrade();

  // Debugging: Log trades data
  useEffect(() => {
    console.group('🔍 Trades Debugging');
    console.log('Total trades:', allTrades?.length);
    console.log('Filtered trades:', filteredTrades.length);
    
    filteredTrades.forEach((trade, index) => {
      console.log(`Trade ${index + 1} (${trade.symbol}):`, {
        id: trade.id,
        symbol: trade.symbol,
        hasScreenshotUrl: !!trade.screenshotUrl,
        screenshotUrl: trade.screenshotUrl,
        screenshotUrlLength: trade.screenshotUrl?.length,
      });
    });
    
    console.groupEnd();
  }, [allTrades]);

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
    await createTrade.mutateAsync(tradeInput);
  };

  const handleDeleteTrade = async () => {
    if (tradeToDelete) {
      await deleteTrade.mutateAsync(tradeToDelete.id);
      setTradeToDelete(null);
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

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Trade Filters</CardTitle>
              <CardDescription>
                Filter and search through your trades
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'gallery' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('gallery')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Trades Gallery/Table View */}
      <Card>
        <CardHeader>
          <CardTitle>All Trades ({filteredTrades.length})</CardTitle>
          <CardDescription>
            {viewMode === 'gallery' ? 'Visual gallery of your trades' : 'Complete trading history with performance metrics'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTrades ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-muted-foreground">Loading trades...</span>
              </div>
            </div>
          ) : filteredTrades.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No trades found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || filterStatus !== 'all' || filterDirection !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first trade to get started'}
              </p>
            </div>
          ) : viewMode === 'gallery' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrades.map((trade) => (
                <Card key={trade.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Screenshot Preview with Error Handling */}
                  <div 
                    className="relative h-48 bg-muted cursor-pointer"
                    onClick={() => setSelectedTrade(trade)}
                  >
                    {trade.screenshotUrl ? (
                      <>
                        <img
                          src={trade.screenshotUrl}
                          alt={`${trade.symbol} chart`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('❌ Image load error for trade:', trade.id, trade.screenshotUrl);
                            // Hide the broken image
                            e.currentTarget.style.display = 'none';
                            // Show the placeholder instead
                            const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log('✅ Image loaded successfully for trade:', trade.id);
                          }}
                        />
                        <div className="w-full h-full items-center justify-center hidden flex-col">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                          <p className="text-xs text-muted-foreground mt-2">Image failed to load</p>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                          <p className="text-xs text-muted-foreground mt-2">No screenshot</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(trade.status)}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          {getDirectionIcon(trade.direction)}
                          <span className="font-bold text-lg">{trade.symbol}</span>
                        </div>
                        <span className={cn('font-bold', getPnLColor(trade.pnl))}>
                          {formatPnL(trade.pnl)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trade Details */}
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Entry</p>
                        <p className="font-medium">{trade.entry.toFixed(trade.symbol.includes('JPY') ? 2 : 4)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Exit</p>
                        <p className="font-medium">
                          {trade.exit ? trade.exit.toFixed(trade.symbol.includes('JPY') ? 2 : 4) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">R Multiple</p>
                        <p className={cn('font-medium', getPnLColor(trade.pnl))}>
                          {formatRMultiple(trade.rMultiple)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">{formatDate(trade.openTime)}</p>
                      </div>
                    </div>

                    <div>
                      <Badge variant="outline" className="text-xs">
                        {trade.setup}
                      </Badge>
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      {trade.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {trade.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{trade.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>

                  {/* Actions */}
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedTrade(trade)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setTradeToDelete(trade)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            // Table View
            <div className="responsive-table-container">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Symbol</th>
                    <th className="text-left p-3 font-medium">Direction</th>
                    <th className="text-left p-3 font-medium">Entry</th>
                    <th className="text-left p-3 font-medium">Exit</th>
                    <th className="text-left p-3 font-medium">P&L</th>
                    <th className="text-left p-3 font-medium">R Multiple</th>
                    <th className="text-left p-3 font-medium">Setup</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => (
                    <tr key={trade.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{trade.symbol}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getDirectionIcon(trade.direction)}
                          <span className="capitalize">{trade.direction}</span>
                        </div>
                      </td>
                      <td className="p-3">{trade.entry.toFixed(trade.symbol.includes('JPY') ? 2 : 4)}</td>
                      <td className="p-3">
                        {trade.exit ? trade.exit.toFixed(trade.symbol.includes('JPY') ? 2 : 4) : '-'}
                      </td>
                      <td className={cn('p-3 font-medium', getPnLColor(trade.pnl))}>
                        {formatPnL(trade.pnl)}
                      </td>
                      <td className={cn('p-3 font-medium', getPnLColor(trade.pnl))}>
                        {formatRMultiple(trade.rMultiple)}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {trade.setup}
                        </Badge>
                      </td>
                      <td className="p-3">{getStatusBadge(trade.status)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedTrade(trade)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => setTradeToDelete(trade)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!tradeToDelete} onOpenChange={(open) => !open && setTradeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the trade for {tradeToDelete?.symbol}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTrade}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Trade Detail Dialog */}
      <Dialog open={!!selectedTrade} onOpenChange={(open) => !open && setSelectedTrade(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTrade && (
                <>
                  {getDirectionIcon(selectedTrade.direction)}
                  <span>{selectedTrade.symbol}</span>
                  {getStatusBadge(selectedTrade.status)}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Trade details and chart screenshot
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrade && (
            <div className="space-y-6">
              {/* Screenshot */}
              {selectedTrade.screenshotUrl && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={selectedTrade.screenshotUrl}
                    alt={`${selectedTrade.symbol} chart`}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Trade Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Entry Price</p>
                  <p className="text-lg font-semibold">{selectedTrade.entry.toFixed(5)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Exit Price</p>
                  <p className="text-lg font-semibold">
                    {selectedTrade.exit ? selectedTrade.exit.toFixed(5) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="text-lg font-semibold">{selectedTrade.quantity} lots</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stop Loss</p>
                  <p className="text-lg font-semibold">{selectedTrade.stopLoss.toFixed(5)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Take Profit</p>
                  <p className="text-lg font-semibold">{selectedTrade.takeProfit.toFixed(5)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">P&L</p>
                  <p className={cn('text-lg font-semibold', getPnLColor(selectedTrade.pnl))}>
                    {formatPnL(selectedTrade.pnl)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">R Multiple</p>
                  <p className={cn('text-lg font-semibold', getPnLColor(selectedTrade.pnl))}>
                    {formatRMultiple(selectedTrade.rMultiple)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Setup</p>
                  <p className="text-lg font-semibold">{selectedTrade.setup}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Broker</p>
                  <p className="text-lg font-semibold">{selectedTrade.broker}</p>
                </div>
              </div>

              {/* Tags */}
              {selectedTrade.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTrade.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTrade.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm bg-muted p-4 rounded-lg">{selectedTrade.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}