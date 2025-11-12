import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Calculator, Calendar, Filter, Loader2 } from 'lucide-react';
import { Trade } from '@/types/trade';
import { useAccount } from '@/context/AccountContext';
import { useTrades } from '@/hooks/useTrades';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('6m');
  const [activeTab, setActiveTab] = useState('overview');
  const { selectedAccount } = useAccount();
  const { data: trades = [], isLoading: tradesLoading } = useTrades();
  const loading = tradesLoading;

  // Filter trades by time range
  const getFilteredTrades = () => {
    const now = new Date();

    // ✅ Fix: ensure cutoff starts at the beginning of the correct month
    const getCutoffDate = (monthsAgo: number) => {
      const d = new Date();
      d.setMonth(d.getMonth() - monthsAgo);
      return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    };

    let cutoffDate: Date;

    switch (timeRange) {
      case '1m':
        cutoffDate = getCutoffDate(1);
        break;
      case '3m':
        cutoffDate = getCutoffDate(3);
        break;
      case '6m':
        cutoffDate = getCutoffDate(6);
        break;
      case '1y':
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), 1, 0, 0, 0, 0);
        break;
      default:
        cutoffDate = getCutoffDate(6);
    }

    console.log('Current date:', now);
    console.log('Cutoff date (start of range):', cutoffDate);

    const filtered = trades.filter((trade) => {
      if (!trade.closeTime && !trade.openTime) return false;
      const tradeDate = new Date(trade.closeTime || trade.openTime);

      // ✅ Keep trades between cutoff and now (inclusive)
      return tradeDate >= cutoffDate && tradeDate <= now;
    });

    console.log('Filtered trades count:', filtered.length);
    return filtered;
  };

  const filteredTrades = getFilteredTrades();

  // Debug: Log when filtered trades change
  useEffect(() => {
    console.log('Filtered trades updated:', filteredTrades);
    console.log('Filtered trades count:', filteredTrades.length);
    console.log('Time range:', timeRange);
  }, [filteredTrades, timeRange]);

  // Calculate overview data by month and year
  const calculatePnLCurveData = (startingBalance: number) => {
    const closedTrades = filteredTrades
      .filter((trade) => trade.status === 'closed')
      .map((trade) => {
        const rawDate = trade.closeTime ?? trade.openTime;
        const date = rawDate ? new Date(rawDate) : null;
        return {
          date,
          pnl: trade.pnl ?? 0,
        };
      })
      .filter((item) => item.date && !Number.isNaN(item.date.getTime()));

    const dailyMap = new Map<string, number>();

    closedTrades.forEach(({ date, pnl }) => {
      if (!date) return;
      const key = date.toISOString().split('T')[0];
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + pnl);
    });

    const sortedKeys = Array.from(dailyMap.keys()).sort();
    let cumulative = 0;

    return sortedKeys.map((isoDate) => {
      const dailyPnL = dailyMap.get(isoDate) ?? 0;
      cumulative += dailyPnL;

      const displayDate = new Date(isoDate);

      return {
        date: isoDate,
        label: displayDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        dailyPnL,
        cumulativePnL: cumulative,
        equity: cumulative + startingBalance,
      };
    });
  };

  // Calculate symbol performance
  const calculateSymbolData = () => {
    const symbolStats: { [key: string]: { trades: number; profit: number; wins: number; total: number } } = {};
    
    filteredTrades.forEach(trade => {
      if (trade.status === 'closed') {
        if (!symbolStats[trade.symbol]) {
          symbolStats[trade.symbol] = { trades: 0, profit: 0, wins: 0, total: 0 };
        }
        
        symbolStats[trade.symbol].trades += 1;
        symbolStats[trade.symbol].profit += trade.pnl;
        symbolStats[trade.symbol].total += 1;
        if (trade.pnl > 0) {
          symbolStats[trade.symbol].wins += 1;
        }
      }
    });

    return Object.entries(symbolStats)
      .map(([symbol, data]) => ({
        symbol,
        trades: data.trades,
        profit: Math.round(data.profit),
        winRate: data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  };

  // Calculate setup distribution
  const calculateSetupData = () => {
    const setupCounts: { [key: string]: number } = {};
    
    filteredTrades.forEach(trade => {
      const setup = trade.setup || 'Unspecified';
      setupCounts[setup] = (setupCounts[setup] || 0) + 1;
    });

    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--success))',
      'hsl(var(--chart-neutral))',
      'hsl(var(--danger))',
      'hsl(var(--warning))'
    ];

    return Object.entries(setupCounts)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Calculate KPIs
  const calculateKPIs = () => {
    const closedTrades = filteredTrades.filter(t => t.status === 'closed');
    const totalPnL = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
    const wins = closedTrades.filter(t => t.pnl > 0).length;
    const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
    const avgR = closedTrades.length > 0 
      ? closedTrades.reduce((sum, t) => sum + t.rMultiple, 0) / closedTrades.length 
      : 0;
    
    // Calculate current month trades
    const now = new Date();
    const currentMonthTrades = trades.filter(t => {
      const tradeDate = t.openTime;
      return tradeDate.getMonth() === now.getMonth() && 
             tradeDate.getFullYear() === now.getFullYear();
    });

    return {
      totalPnL: Math.round(totalPnL),
      winRate: Math.round(winRate * 10) / 10,
      avgR: Math.round(avgR * 100) / 100,
      currentMonthTrades: currentMonthTrades.length
    };
  };

  // Calculate trade distribution
  const calculateTradeDistribution = () => {
    const closedTrades = filteredTrades.filter(t => t.status === 'closed');
    const winners = closedTrades.filter(t => t.pnl > 0).length;
    const losers = closedTrades.filter(t => t.pnl < 0).length;
    const breakeven = closedTrades.filter(t => t.pnl === 0).length;

    return [
      { name: 'Winners', value: winners, color: 'hsl(var(--success))' },
      { name: 'Losers', value: losers, color: 'hsl(var(--danger))' },
      { name: 'Breakeven', value: breakeven, color: 'hsl(var(--muted-foreground))' }
    ].filter(item => item.value > 0);
  };

  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}$${value.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}:{' '}
              {typeof entry.value === 'number'
                ? entry.dataKey.toLowerCase().includes('rate')
                  ? `${entry.value}%`
                  : entry.dataKey.toLowerCase().includes('pnl') ||
                    entry.dataKey.toLowerCase().includes('profit') ||
                    entry.dataKey.toLowerCase().includes('loss')
                  ? formatCurrency(entry.value)
                  : entry.value
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PnLCurveTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const dataPoint = payload[0]?.payload;
    if (!dataPoint) return null;

    const labelDate = new Date(label);
    const formattedLabel = labelDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{formattedLabel}</p>
        <p className="text-sm text-muted-foreground">
          Daily P&L: {formatCurrency(dataPoint.dailyPnL)}
        </p>
        <p className="text-sm text-muted-foreground">
          Cumulative: {formatCurrency(dataPoint.cumulativePnL)}
        </p>
        <p className="text-sm text-muted-foreground">
          Equity: {formatCurrency(dataPoint.equity)}
        </p>
      </div>
    );
  };

  const formatXAxisLabel = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const initialBalance = selectedAccount?.initialBalance ?? 0;
  const pnlCurveData = calculatePnLCurveData(initialBalance);
  const symbolData = calculateSymbolData();
  const setupData = calculateSetupData();
  const kpis = calculateKPIs();
  const tradeDistribution = calculateTradeDistribution();

  return (
    <div className="min-h-screen bg-background mobile-container section-padding">
      <div className="max-w-7xl mx-auto content-spacing">
        {/* Header */}
        <div className="trading-card section-padding">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {selectedAccount ? `${selectedAccount.name} Analytics` : 'Analytics'}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {selectedAccount?.broker
                  ? `Broker: ${selectedAccount.broker} · Starting Balance ${formatCurrency(initialBalance)}`
                  : 'Deep insights into your trading performance and patterns'}
              </p>
            </div>
            
            <div className="responsive-flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">Last Month</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* No Data Message */}
        {filteredTrades.length === 0 ? (
          <Card className="trading-card">
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No trades found</h3>
              <p className="text-muted-foreground">
                Start logging your trades to see analytics and insights.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Key Performance Indicators */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="trading-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                      <p className={`text-2xl font-bold ${kpis.totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(kpis.totalPnL)}
                      </p>
                      <p className="text-xs text-muted-foreground">{filteredTrades.filter(t => t.status === 'closed').length} closed trades</p>
                    </div>
                    <div className={`h-12 w-12 rounded-lg ${kpis.totalPnL >= 0 ? 'bg-success/10' : 'bg-danger/10'} flex items-center justify-center`}>
                      {kpis.totalPnL >= 0 ? (
                        <TrendingUp className="h-6 w-6 text-success" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-danger" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                      <p className="text-2xl font-bold">{kpis.winRate}%</p>
                      <p className="text-xs text-muted-foreground">Selected period</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg. R Multiple</p>
                      <p className="text-2xl font-bold">{kpis.avgR}R</p>
                      <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Calculator className="h-6 w-6 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Trades This Month</p>
                      <p className="text-2xl font-bold">{kpis.currentMonthTrades}</p>
                      <p className="text-xs text-muted-foreground">All statuses</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-info" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="responsive-tabs-container">
                <TabsList className="responsive-tabs-list">
                  <TabsTrigger value="overview" className="responsive-tab">Overview</TabsTrigger>
                  <TabsTrigger value="symbols" className="responsive-tab">Symbols</TabsTrigger>
                  <TabsTrigger value="setups" className="responsive-tab">Setups</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="trading-card">
                    <CardHeader>
                      <CardTitle>P&amp;L Curve</CardTitle>
                      <CardDescription>Daily net profit and loss with cumulative total</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {pnlCurveData.length > 0 ? (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={pnlCurveData}>
                              <defs>
                                <linearGradient id="pnlCurveGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.35} />
                                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis
                                dataKey="date"
                                tickFormatter={formatXAxisLabel}
                                minTickGap={24}
                              />
                              <YAxis
                                tickFormatter={(value) => formatCurrency(value).replace('+', '')}
                              />
                              <Tooltip content={<PnLCurveTooltip />} />
                              <Area
                                type="monotone"
                                dataKey="equity"
                                stroke="hsl(var(--primary))"
                                fillOpacity={1}
                                fill="url(#pnlCurveGradient)"
                              />
                              <Line
                                type="monotone"
                                dataKey="cumulativePnL"
                                stroke="hsl(var(--success))"
                                strokeWidth={2}
                                dot={false}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-80 flex items-center justify-center text-muted-foreground">
                          No closed trades with P&amp;L available for this range
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="trading-card">
                    <CardHeader>
                      <CardTitle>Trade Distribution</CardTitle>
                      <CardDescription>Trades by outcome type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tradeDistribution.length > 0 ? (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={tradeDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {tradeDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-80 flex items-center justify-center text-muted-foreground">
                          No trade distribution data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="symbols" className="space-y-6">
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle>Performance by Symbol</CardTitle>
                    <CardDescription>Trading results across different instruments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {symbolData.length > 0 ? (
                      <div className="space-y-4">
                        {symbolData.map((symbol) => (
                          <div key={symbol.symbol} className="flex items-center justify-between p-4 rounded-lg border border-border">
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="font-mono">{symbol.symbol}</Badge>
                              <div>
                                <p className="font-medium">{symbol.trades} trades</p>
                                <p className="text-sm text-muted-foreground">Win Rate: {symbol.winRate}%</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${symbol.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                                {formatCurrency(symbol.profit)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        No symbol data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="setups" className="space-y-6">
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle>Setup Distribution</CardTitle>
                    <CardDescription>Most used trading setups and their frequency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {setupData.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={setupData} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={120} />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center text-muted-foreground">
                        No setup data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}