// ...existing code...
import { useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getUserTrades } from '@/lib/supabase/trades';
import { format, parseISO } from 'date-fns';
import { Trade as TradeType } from '@/types/trade';

interface EquityDataPoint {
  date: string;
  balance: number;
  trades: number;
  pnl?: number;
  initialBalance?: number;
}

const getUserId = (user: any) => user?.id ?? user?.uid ?? null;

const processTradesToEquityData = (trades: TradeType[], startingBalance: number = 10000): EquityDataPoint[] => {
  if (!trades || trades.length === 0) return [];

  // Filter and sort trades by close time
  const closedTrades = trades
    .filter((trade): trade is TradeType & { closeTime: string | Date } => 
      trade.status === 'closed' && Boolean(trade.closeTime)
    )
    .sort((a, b) => {
      const aTime = typeof a.closeTime === 'string' ? new Date(a.closeTime).getTime() : a.closeTime.getTime();
      const bTime = typeof b.closeTime === 'string' ? new Date(b.closeTime).getTime() : b.closeTime.getTime();
      return aTime - bTime;
    });

  if (closedTrades.length === 0) return [];

  // Group trades by date and calculate daily P&L
  const dailyPnL: Record<string, number> = {};
  closedTrades.forEach(trade => {
    const closeTime = typeof trade.closeTime === 'string' ? parseISO(trade.closeTime) : trade.closeTime;
    const date = format(closeTime, 'yyyy-MM-dd');
    if (!dailyPnL[date]) {
      dailyPnL[date] = 0;
    }
    dailyPnL[date] += trade.pnl || 0;
  });

  // Convert to array and sort by date
  const equityData = [];
  let runningBalance = startingBalance;
  
  // Add initial balance point
  const firstTradeCloseTime = closedTrades[0].closeTime;
  const firstTradeDate = typeof firstTradeCloseTime === 'string' 
    ? parseISO(firstTradeCloseTime) 
    : firstTradeCloseTime;
  firstTradeDate.setDate(firstTradeDate.getDate() - 1);
  
  equityData.push({
    date: format(firstTradeDate, 'yyyy-MM-dd'),
    balance: startingBalance,
    trades: 0,
    initialBalance: startingBalance
  });

  // Add points for each trading day
  Object.entries(dailyPnL).forEach(([date, pnl], index) => {
    const previousBalance = runningBalance;
    runningBalance += pnl;
    equityData.push({
      date,
      balance: parseFloat(runningBalance.toFixed(2)),
      trades: index + 1,
      pnl,
      initialBalance: startingBalance
    });
  });

  return equityData;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{new Date(label).toLocaleDateString()}</p>
        <p className={`text-sm ${data.balance >= payload[0].payload.initialBalance ? 'text-success' : 'text-destructive'}`}>
          Balance: ${data.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-muted-foreground">
          {data.trades} {data.trades === 1 ? 'Trade' : 'Trades'}
        </p>
        {data.pnl !== undefined && (
          <p className={`text-sm ${data.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
            {data.pnl >= 0 ? '+' : ''}{data.pnl?.toFixed(2)} ({data.pnl !== 0 ? ((data.pnl / (data.balance - data.pnl)) * 100).toFixed(2) : '0.00'}%)
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function EquityCurve() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = getUserId(user);
  const startingBalance = 10000; // Default starting balance

  // Fetch trades data
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades', userId],
    queryFn: async (): Promise<TradeType[]> => {
      if (!userId) return [];
      return await getUserTrades(userId);
    },
    enabled: !!userId,
  });

  // Process trades into equity curve data
  const equityData = useMemo(() => 
    processTradesToEquityData(trades, startingBalance),
    [trades, startingBalance]
  );

  // Calculate metrics
  const { currentBalance, totalReturn, totalTrades } = useMemo(() => {
    if (equityData.length === 0) {
      return {
        currentBalance: startingBalance,
        totalReturn: 0,
        totalTrades: 0
      };
    }
    
    const current = equityData[equityData.length - 1];
    return {
      currentBalance: current.balance,
      totalReturn: ((current.balance - startingBalance) / startingBalance * 100),
      totalTrades: current.trades
    };
  }, [equityData, startingBalance]);

  // Listen for trade changes
  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['trades', userId] });
    };

    window.addEventListener('trades:updated', handler);
    return () => window.removeEventListener('trades:updated', handler);
  }, [queryClient, userId]);

  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Account Equity Curve</CardTitle>
          <CardDescription>Loading trade data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">Loading chart...</div>
        </CardContent>
      </Card>
    );
  }

  if (equityData.length === 0) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Account Equity Curve</CardTitle>
          <CardDescription>No closed trades found to display equity curve</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">Add and close some trades to see your equity curve</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Account Equity Curve
          <span className={`text-sm font-normal ${totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
          </span>
        </CardTitle>
        <CardDescription>
          ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • {totalTrades} {totalTrades === 1 ? 'Trade' : 'Trades'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={equityData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                minTickGap={20}
              />
              <YAxis 
                tickFormatter={(value) => {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                  return `$${value}`;
                }}
                tick={{ fontSize: 12 }}
                width={80}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <ReferenceLine 
                y={startingBalance} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ 
                  r: 6, 
                  stroke: 'hsl(var(--primary))', 
                  strokeWidth: 2, 
                  fill: 'hsl(var(--background))',
                  strokeOpacity: 0.8
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
// ...existing code...