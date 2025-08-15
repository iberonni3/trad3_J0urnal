import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Settings, BookOpen, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced sample data with multiple months
const allCalendarData = {
  '2024-06': {
    '2024-06-05': { trades: 1, pnl: 1050, rMultiple: 3.5, winRate: 100, status: 'profit', ticks: 150 },
    '2024-06-10': { trades: 1, pnl: 600, rMultiple: 2.0, winRate: 100, status: 'profit', ticks: 120 },
    '2024-06-11': { trades: 2, pnl: 1090, rMultiple: 0.9, winRate: 50, status: 'profit', ticks: 180 },
    '2024-06-12': { trades: 1, pnl: -638, rMultiple: -0.3, winRate: 0, status: 'loss', ticks: -85 },
    '2024-06-13': { trades: 2, pnl: -638, rMultiple: -0.3, winRate: 0, status: 'loss', ticks: -95 },
    '2024-06-14': { trades: 3, pnl: 550, rMultiple: 0.6, winRate: 33.3, status: 'profit', ticks: 165 },
    '2024-06-17': { trades: 3, pnl: -788, rMultiple: -0.31, winRate: 0, status: 'loss', ticks: -110 },
    '2024-06-18': { trades: 2, pnl: 875, rMultiple: 0.6, winRate: 100, status: 'profit', ticks: 140 },
    '2024-06-19': { trades: 1, pnl: 608, rMultiple: 0.6, winRate: 100, status: 'profit', ticks: 95 },
    '2024-06-20': { trades: 5, pnl: 1180, rMultiple: 0.6, winRate: 40, status: 'profit', ticks: 200 },
    '2024-06-21': { trades: 5, pnl: 113, rMultiple: 0.6, winRate: 80, status: 'profit', ticks: 45 },
    '2024-06-24': { trades: 3, pnl: 300, rMultiple: 1.14, winRate: 33.3, status: 'profit', ticks: 75 },
    '2024-06-25': { trades: 3, pnl: 300, rMultiple: 1.14, winRate: 33.3, status: 'profit', ticks: 80 },
    '2024-06-26': { trades: 5, pnl: 1630, rMultiple: -0.83, winRate: 60, status: 'profit', ticks: 220 }
  },
  '2024-07': {
    '2024-07-02': { trades: 2, pnl: 780, rMultiple: 1.2, winRate: 50, status: 'profit', ticks: 125 },
    '2024-07-05': { trades: 1, pnl: -450, rMultiple: -0.8, winRate: 0, status: 'loss', ticks: -75 },
    '2024-07-08': { trades: 3, pnl: 920, rMultiple: 2.1, winRate: 66.7, status: 'profit', ticks: 185 },
    '2024-07-12': { trades: 4, pnl: 1240, rMultiple: 1.8, winRate: 75, status: 'profit', ticks: 210 },
    '2024-07-15': { trades: 2, pnl: -320, rMultiple: -0.4, winRate: 0, status: 'loss', ticks: -55 },
    '2024-07-18': { trades: 1, pnl: 650, rMultiple: 1.5, winRate: 100, status: 'profit', ticks: 110 },
    '2024-07-22': { trades: 3, pnl: 480, rMultiple: 0.9, winRate: 66.7, status: 'profit', ticks: 90 },
    '2024-07-25': { trades: 2, pnl: 330, rMultiple: 0.7, winRate: 50, status: 'profit', ticks: 65 },
    '2024-07-29': { trades: 4, pnl: 1100, rMultiple: 1.6, winRate: 75, status: 'profit', ticks: 195 }
  }
};

// Display modes for calendar cells
const displayModes = [
  { value: 'rMultiple', label: 'R Multiple' },
  { value: 'pnl', label: 'Daily P/L' },
  { value: 'ticks', label: 'Ticks' },
  { value: 'trades', label: 'Number of trades' },
  { value: 'winRate', label: 'Day Winrate' }
];

export default function TradingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 5, 1)); // June 2024
  const [selectedDate, setSelectedDate] = useState('2024-06-17');
  const [displayMode, setDisplayMode] = useState('pnl');
  const [showDisplayOptions, setShowDisplayOptions] = useState(false);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [newTrade, setNewTrade] = useState({
    symbol: '',
    direction: 'long',
    pnl: '',
    trades: '1'
  });

    const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDisplayOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthData = allCalendarData[monthKey] || {};

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDayData = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return currentMonthData[dateStr] || null;
  };

  const getDayColor = (data) => {
    if (!data) return 'bg-muted/80 border-border';
    if (data.status === 'profit') return 'bg-success/20 border-success/30 text-success-foreground';
    if (data.status === 'loss') return 'bg-destructive/20 border-destructive/30 text-destructive-foreground';
    return 'bg-muted border-border text-muted-foreground';
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1));
    // Reset selected date when changing months
    const newMonth = currentDate.getMonth() + (direction === 'next' ? 1 : -1);
    const newYear = newMonth > 11 ? currentDate.getFullYear() + 1 : newMonth < 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
    const finalMonth = newMonth > 11 ? 0 : newMonth < 0 ? 11 : newMonth;
    setSelectedDate(`${newYear}-${String(finalMonth + 1).padStart(2, '0')}-01`);
  };

  const formatPnL = (pnl) => {
    if (pnl === 0) return '$0';
    const absValue = Math.abs(pnl);
    if (absValue >= 1000) {
      return `${pnl > 0 ? '' : '-'}$${(absValue / 1000).toFixed(1)}K`;
    }
    return `${pnl > 0 ? '' : '-'}$${absValue}`;
  };

  const formatDisplayValue = (data, mode) => {
    switch (mode) {
      case 'rMultiple':
        return `${data.rMultiple}R`;
      case 'pnl':
        return formatPnL(data.pnl);
      case 'ticks':
        return `${data.ticks}`;
      case 'trades':
        return `${data.trades} trade${data.trades !== 1 ? 's' : ''}`;
      case 'winRate':
        return `${data.winRate}%`;
      default:
        return formatPnL(data.pnl);
    }
  };

  // Calculate monthly stats for current month
  type DayData = {
    trades: number;
    pnl: number;
    rMultiple: number | string;
    winRate: number;
    status: string;
    ticks: number;
  };
  const monthlyData: DayData[] = Object.values(currentMonthData);
  const totalTrades = monthlyData.reduce((sum, data) => sum + data.trades, 0);
  const totalPnL = monthlyData.reduce((sum, data) => sum + data.pnl, 0);
  const tradingDays = monthlyData.length;

  // Calculate weekly stats for current month
  const getWeeklyStats = () => {
    const weeks = [
      { pnl: 0, days: 0, weekNumber: 1 },
      { pnl: 0, days: 0, weekNumber: 2 },
      { pnl: 0, days: 0, weekNumber: 3 },
      { pnl: 0, days: 0, weekNumber: 4 },
      { pnl: 0, days: 0, weekNumber: 5 }
    ];
  
    Object.entries(currentMonthData).forEach(([date, data]) => {
      const day = parseInt(date.split('-')[2]);
      const weekIndex = Math.floor((day + firstDayOfMonth - 1) / 7);
      if (weekIndex < weeks.length) {
        const dayData = data as DayData;
        weeks[weekIndex].pnl += dayData.pnl;
        weeks[weekIndex].days += 1;
      }
    });
  
    return weeks.filter(week => week.days > 0);
  };

  const weeklyStats = getWeeklyStats();

  const handleAddTrade = () => {
    if (newTrade.symbol && newTrade.pnl) {
      const pnl = parseFloat(newTrade.pnl);
      const trades = parseInt(newTrade.trades);
      
      // Add to current month data (in a real app, this would be saved to a database)
      const existingData = currentMonthData[selectedDate];
      if (existingData) {
        existingData.trades += trades;
        existingData.pnl += pnl;
        existingData.status = existingData.pnl > 0 ? 'profit' : existingData.pnl < 0 ? 'loss' : 'breakeven';
      } else {
        currentMonthData[selectedDate] = {
          trades: trades,
          pnl: pnl,
          rMultiple: (pnl / 100).toFixed(1), // Simple R calculation
          winRate: pnl > 0 ? 100 : 0,
          status: pnl > 0 ? 'profit' : pnl < 0 ? 'loss' : 'breakeven',
          ticks: Math.round(pnl * 0.2) // Mock ticks calculation
        };
      }
      
      setNewTrade({ symbol: '', direction: 'long', pnl: '', trades: '1' });
      setShowAddTrade(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground text-sm">
              TODAY
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-medium ml-4">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
          </div>

          {/* Monthly Stats and Controls */}
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">Monthly stats:</span>
            <div className="bg-success/20 border border-success/30 rounded-full px-3 py-1">
              <span className="text-success-foreground font-medium text-sm">
                ${totalPnL.toLocaleString()}
              </span>
            </div>
            <div className="bg-primary/20 border border-primary/30 rounded-full px-3 py-1">
              <span className="text-primary-foreground font-medium text-sm">
                {tradingDays} days
              </span>
            </div>
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDisplayOptions(!showDisplayOptions)}
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              {showDisplayOptions && (
                <div className="absolute right-0 top-full mt-2 bg-card border rounded-lg p-3 z-20 min-w-56 shadow-lg">

                  <div className="text-sm font-medium mb-3">Display stats</div>
                  {displayModes.map((mode) => (
                    <div 
                      key={mode.value}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => {
                        setDisplayMode(mode.value);
                        setShowDisplayOptions(false);
                      }}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center",
                        displayMode === mode.value 
                          ? 'bg-primary border-primary' 
                          : 'border-muted-foreground'
                      )}>
                        {displayMode === mode.value && (
                          <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                        )}
                      </div>
                      <span className="text-sm">{mode.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Calendar */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-3">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-20" />
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
                    'h-20 p-2 border cursor-pointer transition-all duration-200 relative flex flex-col justify-between',
                    getDayColor(data),
                    isSelected && 'ring-2 ring-primary',
                    !data && 'hover:bg-muted/50'
                  )}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">{day}</span>
                    {data && (
                      <BookOpen className="h-3 w-3 opacity-60" />
                    )}
                  </div>
                  
                  {data && (
                    <div className="text-center">
                      <div className="font-bold text-sm mb-0.5">
                        {formatDisplayValue(data, displayMode)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.trades} trade{data.trades !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-muted-foreground/60">
                        {displayMode !== 'rMultiple' && `${data.rMultiple}R, `}{data.winRate.toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Summary Sidebar */}
        <div className="w-80 p-6 space-y-4">
          {weeklyStats.map((stats, index) => (
            <div key={index} className="bg-card border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">Week {stats.weekNumber}</div>
              <div className={cn(
                "text-xl font-bold mb-1",
                stats.pnl > 0 ? "text-success" : 
                stats.pnl < 0 ? "text-destructive" : 
                "text-muted-foreground"
              )}>
                ${stats.pnl.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">{stats.days} days</div>
            </div>
          ))}

          {/* Selected Day Detail */}
          <div className="bg-card border rounded-lg p-4 mt-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </h3>
            
            {currentMonthData[selectedDate] ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold">
                      {currentMonthData[selectedDate].trades}
                    </div>
                    <div className="text-xs text-muted-foreground">trades</div>
                  </div>
                  <div>
                    <div className={cn(
                      "text-lg font-bold",
                      currentMonthData[selectedDate].pnl > 0 ? "text-success" : 
                      currentMonthData[selectedDate].pnl < 0 ? "text-destructive" : 
                      "text-muted-foreground"
                    )}>
                      {formatPnL(currentMonthData[selectedDate].pnl)}
                    </div>
                    <div className="text-xs text-muted-foreground">P&L</div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowAddTrade(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trade
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm mb-3">No trading activity</p>
                <Button 
                  size="sm"
                  onClick={() => setShowAddTrade(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trade
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Trade Modal */}
      {showAddTrade && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border rounded-lg p-6 w-96 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Trade</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowAddTrade(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Symbol</label>
                <input 
                  type="text" 
                  className="w-full bg-input border rounded px-3 py-2"
                  value={newTrade.symbol}
                  onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value})}
                  placeholder="e.g., EURUSD"
                />
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Direction</label>
                <select 
                  className="w-full bg-input border rounded px-3 py-2"
                  value={newTrade.direction}
                  onChange={(e) => setNewTrade({...newTrade, direction: e.target.value})}
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-1">P&L ($)</label>
                <input 
                  type="number" 
                  className="w-full bg-input border rounded px-3 py-2"
                  value={newTrade.pnl}
                  onChange={(e) => setNewTrade({...newTrade, pnl: e.target.value})}
                  placeholder="e.g., 450"
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAddTrade(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleAddTrade}
                >
                  Add Trade
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}