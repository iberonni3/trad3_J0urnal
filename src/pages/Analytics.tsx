import { useState } from 'react';
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
import { TrendingUp, TrendingDown, Target, Calculator, Calendar, Filter } from 'lucide-react';

// Sample analytics data
const overviewData = [
  { month: 'Jan', profit: 2400, loss: -800, trades: 45 },
  { month: 'Feb', profit: 1800, loss: -1200, trades: 52 },
  { month: 'Mar', profit: 3200, loss: -600, trades: 38 },
  { month: 'Apr', profit: 2800, loss: -900, trades: 41 },
  { month: 'May', profit: 3600, loss: -400, trades: 47 },
  { month: 'Jun', profit: 2900, loss: -1100, trades: 44 }
];

const symbolData = [
  { symbol: 'EURUSD', trades: 25, profit: 1250, winRate: 68 },
  { symbol: 'GBPJPY', trades: 18, profit: -340, winRate: 44 },
  { symbol: 'XAUUSD', trades: 22, profit: 2100, winRate: 73 },
  { symbol: 'BTCUSD', trades: 15, profit: 890, winRate: 60 },
  { symbol: 'USDJPY', trades: 20, profit: 560, winRate: 55 }
];

const setupData = [
  { name: 'Breakout', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Support/Resistance', value: 28, color: 'hsl(var(--success))' },
  { name: 'Trend Following', value: 22, color: 'hsl(var(--chart-neutral))' },
  { name: 'Reversal', value: 15, color: 'hsl(var(--danger))' }
];

const timeframeData = [
  { timeframe: '1m', trades: 45, avgR: 0.8, winRate: 42 },
  { timeframe: '5m', trades: 68, avgR: 1.2, winRate: 58 },
  { timeframe: '15m', trades: 52, avgR: 1.8, winRate: 65 },
  { timeframe: '1h', trades: 34, avgR: 2.1, winRate: 71 },
  { timeframe: '4h', trades: 28, avgR: 2.4, winRate: 75 },
  { timeframe: '1d', trades: 15, avgR: 3.2, winRate: 80 }
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('6m');
  const [activeTab, setActiveTab] = useState('overview');

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
              {entry.dataKey}: {entry.dataKey.includes('Rate') ? `${entry.value}%` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background mobile-container section-padding">
      <div className="max-w-7xl mx-auto content-spacing">
        {/* Header */}
        <div className="trading-card section-padding">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Deep insights into your trading performance and patterns
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
              <Button variant="outline" className="touch-friendly">
                <Filter className="h-4 w-4 mr-2" />
                <span className="mobile-hidden">Advanced Filters</span>
                <span className="mobile-only">Filters</span>
              </Button>
            </div>
          </div>
        </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="trading-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                <p className="text-2xl font-bold text-success">+$4,890</p>
                <p className="text-xs text-muted-foreground">+18.9% growth</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="trading-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sharpe Ratio</p>
                <p className="text-2xl font-bold">1.67</p>
                <p className="text-xs text-muted-foreground">Risk-adjusted returns</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="trading-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Drawdown</p>
                <p className="text-2xl font-bold text-danger">-8.2%</p>
                <p className="text-xs text-muted-foreground">Peak to trough</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-danger/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="trading-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit Factor</p>
                <p className="text-2xl font-bold">2.34</p>
                <p className="text-xs text-muted-foreground">Gross profit/loss</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
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
              <TabsTrigger value="timeframe" className="responsive-tab">Time</TabsTrigger>
              <TabsTrigger value="patterns" className="responsive-tab">Patterns</TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle>Monthly P&L Trend</CardTitle>
                <CardDescription>Profit and loss breakdown by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={overviewData}>
                      <defs>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${value}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="hsl(var(--success))"
                        fillOpacity={1}
                        fill="url(#profitGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="trading-card">
              <CardHeader>
                <CardTitle>Trade Distribution</CardTitle>
                <CardDescription>Trades by outcome type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Winners', value: 67, color: 'hsl(var(--success))' },
                          { name: 'Losers', value: 28, color: 'hsl(var(--danger))' },
                          { name: 'Breakeven', value: 5, color: 'hsl(var(--muted-foreground))' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { color: 'hsl(var(--success))' },
                          { color: 'hsl(var(--danger))' },
                          { color: 'hsl(var(--muted-foreground))' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
              <div className="space-y-4">
                {symbolData.map((symbol) => (
                  <div key={symbol.symbol} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border gap-3">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-mono text-xs sm:text-sm">{symbol.symbol}</Badge>
                      <div>
                        <p className="font-medium text-sm sm:text-base">{symbol.trades} trades</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Win Rate: {symbol.winRate}%</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className={`font-bold text-sm sm:text-base ${symbol.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(symbol.profit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setups" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Setup Distribution</CardTitle>
              <CardDescription>Most used trading setups and their performance</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeframe" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Timeframe Analysis</CardTitle>
              <CardDescription>Performance across different trading timeframes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeframeData.map((tf) => (
                  <div key={tf.timeframe} className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg border border-border">
                    <div className="text-center sm:text-left">
                      <p className="font-medium text-sm sm:text-base">{tf.timeframe}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Timeframe</p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="font-medium text-sm sm:text-base">{tf.trades}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Trades</p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="font-medium text-sm sm:text-base">{tf.avgR}R</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Avg R-Multiple</p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="font-medium text-success text-sm sm:text-base">{tf.winRate}%</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Win Rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Trading Patterns</CardTitle>
              <CardDescription>Insights and patterns in your trading behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <h4 className="font-medium text-success mb-2">Best Performance Days</h4>
                  <p className="text-sm text-muted-foreground">You perform best on Tuesdays and Wednesdays, with 73% win rate</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h4 className="font-medium text-primary mb-2">Optimal Trade Size</h4>
                  <p className="text-sm text-muted-foreground">Your best R-multiples come from position sizes between 0.5-1.0 lots</p>
                </div>
                <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
                  <h4 className="font-medium text-danger mb-2">Risk Pattern</h4>
                  <p className="text-sm text-muted-foreground">Avoid trading during high volatility news events - 34% lower win rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}