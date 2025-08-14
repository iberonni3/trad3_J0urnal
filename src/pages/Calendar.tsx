import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Sample calendar data
const calendarData = {
  '2024-03-01': { trades: 3, pnl: 450, status: 'profit' },
  '2024-03-04': { trades: 2, pnl: -120, status: 'loss' },
  '2024-03-05': { trades: 4, pnl: 680, status: 'profit' },
  '2024-03-07': { trades: 1, pnl: 0, status: 'breakeven' },
  '2024-03-08': { trades: 5, pnl: 890, status: 'profit' },
  '2024-03-11': { trades: 2, pnl: -340, status: 'loss' },
  '2024-03-12': { trades: 3, pnl: 220, status: 'profit' },
  '2024-03-14': { trades: 1, pnl: 150, status: 'profit' },
  '2024-03-15': { trades: 6, pnl: 1200, status: 'profit' },
  '2024-03-18': { trades: 2, pnl: -80, status: 'loss' },
  '2024-03-19': { trades: 4, pnl: 560, status: 'profit' },
  '2024-03-21': { trades: 1, pnl: -200, status: 'loss' },
  '2024-03-22': { trades: 3, pnl: 380, status: 'profit' },
  '2024-03-25': { trades: 2, pnl: 90, status: 'profit' },
  '2024-03-26': { trades: 1, pnl: 0, status: 'breakeven' },
  '2024-03-28': { trades: 4, pnl: 720, status: 'profit' },
  '2024-03-29': { trades: 2, pnl: -150, status: 'loss' }
};

const dayTrades = {
  '2024-03-15': [
    { id: '1', symbol: 'EURUSD', direction: 'long', pnl: 450, time: '09:30' },
    { id: '2', symbol: 'GBPJPY', direction: 'short', pnl: 220, time: '11:15' },
    { id: '3', symbol: 'XAUUSD', direction: 'long', pnl: 530, time: '14:20' },
    { id: '4', symbol: 'BTCUSD', direction: 'long', pnl: -100, time: '16:45' },
    { id: '5', symbol: 'USDJPY', direction: 'short', pnl: 100, time: '18:10' }
  ]
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 15)); // March 2024
  const [selectedDate, setSelectedDate] = useState('2024-03-15');
  const [viewMode, setViewMode] = useState('month');

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDayData = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarData[dateStr] || null;
  };

  const getDayColor = (data: any) => {
    if (!data) return 'bg-card';
    if (data.status === 'profit') return 'bg-success/20 border-success/30';
    if (data.status === 'loss') return 'bg-danger/20 border-danger/30';
    return 'bg-muted border-muted-foreground/30';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1));
  };

  const formatPnL = (pnl: number) => {
    if (pnl === 0) return '$0';
    const sign = pnl > 0 ? '+' : '';
    return `${sign}$${pnl}`;
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-success';
    if (pnl < 0) return 'text-danger';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Trading Calendar</h1>
          <p className="text-muted-foreground">
            Visualize your trading activity and performance over time
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button className="trading-gradient text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="trading-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Click on any day to view detailed trading activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-24" />
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const data = getDayData(day);
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  
                  return (
                    <div
                      key={day}
                      className={cn(
                        'h-24 p-2 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md',
                        getDayColor(data),
                        isSelected && 'ring-2 ring-primary'
                      )}
                      onClick={() => setSelectedDate(dateStr)}
                    >
                      <div className="flex flex-col h-full">
                        <span className="text-sm font-medium">{day}</span>
                        {data && (
                          <div className="flex-1 flex flex-col justify-center items-center text-xs">
                            <span className="font-medium">{data.trades} trades</span>
                            <span className={cn('font-bold', getPnLColor(data.pnl))}>
                              {formatPnL(data.pnl)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Day Details Panel */}
        <div className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Day Details</CardTitle>
              <CardDescription>
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {calendarData[selectedDate] ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{calendarData[selectedDate].trades}</p>
                      <p className="text-sm text-muted-foreground">Total Trades</p>
                    </div>
                    <div className="text-center">
                      <p className={cn('text-2xl font-bold', getPnLColor(calendarData[selectedDate].pnl))}>
                        {formatPnL(calendarData[selectedDate].pnl)}
                      </p>
                      <p className="text-sm text-muted-foreground">Net P&L</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Trades on this day:</h4>
                    {dayTrades[selectedDate] ? (
                      <div className="space-y-2">
                        {dayTrades[selectedDate].map((trade) => (
                          <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{trade.symbol}</Badge>
                              <span className="text-sm capitalize">{trade.direction}</span>
                              <span className="text-xs text-muted-foreground">{trade.time}</span>
                            </div>
                            <span className={cn('font-medium', getPnLColor(trade.pnl))}>
                              {formatPnL(trade.pnl)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No detailed trade data available</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No trading activity on this day</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Trade
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Trading Days</span>
                  <span className="font-medium">17/31</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Trades</span>
                  <span className="font-medium">48</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Net P&L</span>
                  <span className="font-medium text-success">+$4,890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Best Day</span>
                  <span className="font-medium">+$1,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Worst Day</span>
                  <span className="font-medium text-danger">-$340</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}