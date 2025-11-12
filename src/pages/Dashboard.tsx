import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  BarChart3, 
  Clock,
  Calculator,
  Percent
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { EquityCurve } from '@/components/dashboard/EquityCurve';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { TradingCalendarHeatmap } from '@/components/dashboard/TradingCalendarHeatmap';
import { format, subMonths } from 'date-fns';
import { useTrades } from '@/hooks/useTrades';
import { useTradeMetrics } from '@/hooks/useTradeMetrics';
import { formatCurrency, formatPercentage } from '@/lib/calculations';

export default function Dashboard() {
  const { data: trades, isLoading } = useTrades();
  const metrics = useTradeMetrics(trades);

  // Generate calendar data from actual trades
  const calendarData = trades
    ?.filter(t => t.status === 'closed' && t.closeTime)
    .map(t => ({
      date: format(new Date(t.closeTime!), 'yyyy-MM-dd'),
      profitLoss: t.pnl
    })) || [];

  if (isLoading) {
    return (
      <div className="content-spacing">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="content-spacing">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Trading Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Welcome back! Here's an overview of your trading performance.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="responsive-grid">
        <StatCard
          title="Total Trades"
          value={metrics.totalTrades.toString()}
          change={`${metrics.openTrades} open, ${metrics.closedTrades} closed`}
          changeType="neutral"
          icon={<BarChart3 className="h-6 w-6 text-primary" />}
          description="All trades"
        />
        <StatCard
          title="Win Rate"
          value={formatPercentage(metrics.winRate)}
          change={`${metrics.winningTrades} wins, ${metrics.losingTrades} losses`}
          changeType={metrics.winRate >= 50 ? "positive" : "negative"}
          icon={<Target className="h-6 w-6 text-success" />}
          description="Win percentage"
        />
        <StatCard
          title="Average R"
          value={`${metrics.averageRMultiple.toFixed(2)}R`}
          change="Risk-adjusted returns"
          changeType={metrics.averageRMultiple > 0 ? "positive" : "negative"}
          icon={<Calculator className="h-6 w-6 text-primary" />}
          description="Avg R-multiple"
        />
        <StatCard
          title="Total P&L"
          value={formatCurrency(metrics.totalPnL)}
          change={metrics.totalPnL >= 0 ? "Profit" : "Loss"}
          changeType={metrics.totalPnL >= 0 ? "positive" : "negative"}
          icon={<DollarSign className="h-6 w-6 text-success" />}
          description="Net profit/loss"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="responsive-grid">
        <StatCard
          title="Expectancy"
          value={formatCurrency(metrics.expectancy)}
          change="Per trade average"
          changeType={metrics.expectancy > 0 ? "positive" : "negative"}
          icon={<TrendingUp className="h-6 w-6 text-success" />}
          description="Expected value"
        />
        <StatCard
          title="Profit Factor"
          value={metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2)}
          change="Gross profit/loss ratio"
          changeType={metrics.profitFactor > 1 ? "positive" : "negative"}
          icon={<Percent className="h-6 w-6 text-primary" />}
          description="Risk management"
        />
        <StatCard
          title="Avg Hold Time"
          value={`${Math.floor(metrics.averageHoldTime)}h ${Math.round((metrics.averageHoldTime % 1) * 60)}m`}
          change="Position duration"
          changeType="neutral"
          icon={<Clock className="h-6 w-6 text-primary" />}
          description="Average time"
        />
        <StatCard
          title="Max Drawdown"
          value={`-${metrics.maxDrawdown.toFixed(1)}%`}
          change={`Current: -${metrics.currentDrawdown.toFixed(1)}%`}
          changeType="neutral"
          icon={<TrendingDown className="h-6 w-6 text-danger" />}
          description="Peak-to-trough"
        />
      </div>

      {/* Charts and Calendar Heatmap */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1">
          <EquityCurve />
        </div>
        <div className="lg:col-span-1">
          <div className="trading-card section-padding flex flex-col">
            <div className="flex-1 min-h-[160px] sm:min-h-[180px]">
              <TradingCalendarHeatmap data={calendarData} />
            </div>
            <div className="flex justify-center flex-wrap gap-2 sm:gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 mr-1 rounded-sm"></span>
                Profitable
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-red-500 mr-1 rounded-sm"></span>
                Losing
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-gray-200 mr-1 rounded-sm"></span>
                No trades
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades Table */}
      <RecentTrades trades={trades || []} />
    </div>
  );
}
