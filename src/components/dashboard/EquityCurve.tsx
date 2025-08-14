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

// Sample data for the equity curve
const equityData = [
  { date: '2024-01-01', balance: 10000, trades: 0 },
  { date: '2024-01-05', balance: 10150, trades: 3 },
  { date: '2024-01-10', balance: 9980, trades: 7 },
  { date: '2024-01-15', balance: 10300, trades: 12 },
  { date: '2024-01-20', balance: 10450, trades: 18 },
  { date: '2024-01-25', balance: 10200, trades: 24 },
  { date: '2024-02-01', balance: 10680, trades: 31 },
  { date: '2024-02-05', balance: 10520, trades: 36 },
  { date: '2024-02-10', balance: 10890, trades: 42 },
  { date: '2024-02-15', balance: 11200, trades: 48 },
  { date: '2024-02-20', balance: 11050, trades: 54 },
  { date: '2024-02-25', balance: 11420, trades: 60 },
  { date: '2024-03-01', balance: 11680, trades: 67 },
  { date: '2024-03-05', balance: 11520, trades: 73 },
  { date: '2024-03-10', balance: 11890, trades: 79 },
  { date: '2024-03-15', balance: 12150, trades: 85 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{new Date(label).toLocaleDateString()}</p>
        <p className="text-sm text-success">
          Balance: ${data.balance.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          Total Trades: {data.trades}
        </p>
      </div>
    );
  }
  return null;
};

export function EquityCurve() {
  const startingBalance = equityData[0].balance;
  const currentBalance = equityData[equityData.length - 1].balance;
  const totalReturn = ((currentBalance - startingBalance) / startingBalance * 100).toFixed(2);

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Account Equity Curve
          <span className="text-sm font-normal text-success">
            +{totalReturn}%
          </span>
        </CardTitle>
        <CardDescription>
          Track your account balance progression over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                className="text-xs"
              />
              <YAxis 
                domain={['dataMin - 500', 'dataMax + 500']}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={startingBalance} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5" 
                label={{ value: "Starting Balance", position: "top" }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={false}
                activeDot={{ 
                  r: 6, 
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}