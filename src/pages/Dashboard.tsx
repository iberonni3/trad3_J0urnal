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
import { addDays, format, subMonths } from 'date-fns';

// Generate realistic dummy data for heatmap
const generateDummyCalendarData = () => {
  const data = [];
  const today = new Date();
  const startDate = subMonths(today, 6); // 6 months of data
  
  let currentDate = new Date(startDate);
  while (currentDate <= today) {
    const dayOfWeek = currentDate.getDay();
    
    // Only generate data for weekdays (Mon-Fri)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const baseAmount = Math.random() * 300;
      const isWin = Math.random() > 0.3; // 70% win rate
      const profitLoss = isWin ? baseAmount : -baseAmount * 0.7;
      
      data.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        profitLoss: Math.round(profitLoss)
      });
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return data;
};

export default function Dashboard() {
  const dummyCalendarData = generateDummyCalendarData();

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
          <div className="bg-card rounded-lg border p-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Trading Activity</h3>
            <div className="flex-1 min-h-[180px]">
              <TradingCalendarHeatmap data={dummyCalendarData} containerHeight={0} />
            </div>
            <div className="flex justify-center mt-3 space-x-4 text-xs text-muted-foreground">
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
      <RecentTrades />
    </div>
  );
}