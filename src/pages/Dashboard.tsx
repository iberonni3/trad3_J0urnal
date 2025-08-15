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

// Example dummy data for heatmap
const dummyCalendarData = [
  { date: "2025-08-01", profitLoss: 120 },
  { date: "2025-08-02", profitLoss: -50 },
  { date: "2025-08-03", profitLoss: 300 },
  { date: "2025-08-04", profitLoss: 0 },
  { date: "2025-08-05", profitLoss: 200 },
  // Add more as needed
];

export default function Dashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Trading Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your trading performance.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Trades"
          value="85"
          change="+12 this month"
          changeType="positive"
          icon={<BarChart3 className="h-6 w-6 text-primary" />}
          description="Across all accounts"
        />
        
        <StatCard
          title="Win Rate"
          value="67.1%"
          change="+2.3% vs last month"
          changeType="positive"
          icon={<Target className="h-6 w-6 text-success" />}
          description="57 wins, 28 losses"
        />
        
        <StatCard
          title="Average R"
          value="1.85R"
          change="+0.15R improvement"
          changeType="positive"
          icon={<Calculator className="h-6 w-6 text-primary" />}
          description="Risk-adjusted returns"
        />
        
        <StatCard
          title="Total P&L"
          value="$2,456.78"
          change="+18.9% this month"
          changeType="positive"
          icon={<DollarSign className="h-6 w-6 text-success" />}
          description="Net profit/loss"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Expectancy"
          value="$28.91"
          change="Per trade average"
          changeType="positive"
          icon={<TrendingUp className="h-6 w-6 text-success" />}
          description="Expected value"
        />
        
        <StatCard
          title="Profit Factor"
          value="1.67"
          change="Gross profit/loss ratio"
          changeType="positive"
          icon={<Percent className="h-6 w-6 text-primary" />}
          description="Risk management"
        />
        
        <StatCard
          title="Avg Hold Time"
          value="4h 32m"
          change="-45m vs last month"
          changeType="positive"
          icon={<Clock className="h-6 w-6 text-primary" />}
          description="Position duration"
        />
        
        <StatCard
          title="Max Drawdown"
          value="-8.2%"
          change="Current: -2.1%"
          changeType="neutral"
          icon={<TrendingDown className="h-6 w-6 text-danger" />}
          description="Peak-to-trough decline"
        />
      </div>

      {/* Charts and Calendar Heatmap */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1">
          <EquityCurve />
        </div>
        <div className="lg:col-span-1">
          <TradingCalendarHeatmap data={dummyCalendarData} />
        </div>
      </div>

      {/* Recent Trades Table */}
      <RecentTrades />
    </div>
  );
}
