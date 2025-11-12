import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Settings, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTrades } from '@/hooks/useTrades';
import type { Trade } from '@/types/trade';
import { Link } from 'react-router-dom';

type DisplayMode = 'pnl' | 'rMultiple' | 'trades' | 'winRate';

type AggregatedDayData = {
  trades: number;
  pnl: number;
  rMultiple: number;
  winRate: number;
  status: 'profit' | 'loss' | 'breakeven';
};

type CalendarData = Record<string, Record<string, AggregatedDayData>>;
type TradesByDate = Record<string, Trade[]>;

const displayModes: Array<{ value: DisplayMode; label: string }> = [
  { value: 'pnl', label: 'Daily P/L' },
  { value: 'rMultiple', label: 'Average R Multiple' },
  { value: 'trades', label: 'Number of Trades' },
  { value: 'winRate', label: 'Day Win Rate' },
];

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
});

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMonthKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const formatPnL = (pnl: number, compact = false) => {
  if (!Number.isFinite(pnl)) return '$0.00';
  const sign = pnl > 0 ? '+' : pnl < 0 ? '-' : '';
  const absValue = Math.abs(pnl);

  if (compact && absValue >= 1000) {
    return `${sign}$${(absValue / 1000).toFixed(1)}K`;
  }

  if (absValue >= 1) {
    return `${sign}$${absValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `${sign}$${absValue.toFixed(2)}`;
};

const aggregateTrades = (trades: Trade[]) => {
  const mutableCalendar: Record<
    string,
    Record<
      string,
      {
        trades: number;
        pnl: number;
        rMultipleSum: number;
        winCount: number;
      }
    >
  > = {};

  const tradesByDate: TradesByDate = {};

  trades.forEach((trade) => {
    const dateValue = trade.closeTime ?? trade.openTime;
    if (!dateValue) return;
    const tradeDate = new Date(dateValue);
    if (Number.isNaN(tradeDate.getTime())) return;

    const dateKey = formatDateKey(tradeDate);
    const monthKey = formatMonthKey(tradeDate);

    if (!mutableCalendar[monthKey]) {
      mutableCalendar[monthKey] = {};
    }

    if (!mutableCalendar[monthKey][dateKey]) {
      mutableCalendar[monthKey][dateKey] = {
        trades: 0,
        pnl: 0,
        rMultipleSum: 0,
        winCount: 0,
      };
    }

    const dayBucket = mutableCalendar[monthKey][dateKey];
    const pnl = Number(trade.pnl ?? 0);
    const rMultiple = Number(trade.rMultiple ?? 0);

    dayBucket.trades += 1;
    dayBucket.pnl += pnl;
    dayBucket.rMultipleSum += rMultiple;
    if (pnl > 0) {
      dayBucket.winCount += 1;
    }

    if (!tradesByDate[dateKey]) {
      tradesByDate[dateKey] = [];
    }
    tradesByDate[dateKey].push(trade);
  });

  const calendarData: CalendarData = {};

  Object.entries(mutableCalendar).forEach(([monthKey, days]) => {
    calendarData[monthKey] = {};
    Object.entries(days).forEach(([dateKey, dayData]) => {
      const { trades, pnl, rMultipleSum, winCount } = dayData;
      const averageRMultiple = trades > 0 ? rMultipleSum / trades : 0;
      const winRate = trades > 0 ? (winCount / trades) * 100 : 0;

      calendarData[monthKey][dateKey] = {
        trades,
        pnl,
        rMultiple: averageRMultiple,
        winRate,
        status: pnl > 0 ? 'profit' : pnl < 0 ? 'loss' : 'breakeven',
      };
    });
  });

  Object.values(tradesByDate).forEach((tradeList) => {
    tradeList.sort((a, b) => {
      const aDate = new Date(a.closeTime ?? a.openTime ?? 0).getTime();
      const bDate = new Date(b.closeTime ?? b.openTime ?? 0).getTime();
      return bDate - aDate;
    });
  });

  return { calendarData, tradesByDate };
};

export default function TradingCalendar() {
  const { data: trades = [], isLoading, isError, error } = useTrades();

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);

  const [currentDate, setCurrentDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => todayKey);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('pnl');
  const [showDisplayOptions, setShowDisplayOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDisplayOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { calendarData, tradesByDate } = useMemo(() => aggregateTrades(trades), [trades]);

  const monthKey = formatMonthKey(currentDate);
  const currentMonthData = calendarData[monthKey] ?? {};

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthlyData = useMemo(() => Object.values(currentMonthData), [currentMonthData]);
  const totalTrades = monthlyData.reduce((sum, day) => sum + day.trades, 0);
  const totalPnL = monthlyData.reduce((sum, day) => sum + day.pnl, 0);
  const tradingDays = monthlyData.length;
  const averageWinRate = tradingDays > 0 ? monthlyData.reduce((sum, day) => sum + day.winRate, 0) / tradingDays : 0;
  const averageRMultiple = tradingDays > 0 ? monthlyData.reduce((sum, day) => sum + day.rMultiple, 0) / tradingDays : 0;

  const weeklyStats = useMemo(() => {
    const weeks = Array.from({ length: 6 }, (_, index) => ({
      weekNumber: index + 1,
      pnl: 0,
      days: 0,
      trades: 0,
    }));

    Object.entries(currentMonthData).forEach(([dateKey, dayData]) => {
      const day = Number(dateKey.split('-')[2]);
      const weekIndex = Math.floor((day + firstDayOfMonth - 1) / 7);
      const week = weeks[weekIndex];
      if (!week) return;

      week.pnl += dayData.pnl;
      week.days += 1;
      week.trades += dayData.trades;
    });

    return weeks.filter((week) => week.days > 0);
  }, [currentMonthData, firstDayOfMonth]);

  const selectedDayData = currentMonthData[selectedDate] ?? null;
  const selectedTrades = tradesByDate[selectedDate] ?? [];

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayKey);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const updated = new Date(prev.getFullYear(), prev.getMonth() + (direction === 'next' ? 1 : -1), 1);
      setSelectedDate(formatDateKey(updated));
      return updated;
    });
  };

  const getDayColor = (data: AggregatedDayData | null) => {
    if (!data) return 'bg-muted/60 border-border text-muted-foreground';
    if (data.status === 'profit') return 'bg-success/15 border-success/30 text-success-foreground';
    if (data.status === 'loss') return 'bg-destructive/15 border-destructive/30 text-destructive-foreground';
    return 'bg-muted border-border text-muted-foreground';
  };

  const formatDisplayValue = (data: AggregatedDayData, mode: DisplayMode) => {
    switch (mode) {
      case 'rMultiple': {
        const formatted = data.rMultiple.toFixed(2);
        return `${data.rMultiple > 0 ? '+' : ''}${formatted}R`;
      }
      case 'pnl':
        return formatPnL(data.pnl, true);
      case 'trades':
        return `${data.trades}`;
      case 'winRate':
        return `${Math.round(data.winRate)}%`;
      default:
        return formatPnL(data.pnl, true);
    }
  };

  return (
    <div className="min-h-screen bg-background mobile-container">
      <div className="max-w-7xl mx-auto content-spacing">
        <div className="trading-card section-padding">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')} className="touch-friendly">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={goToToday} className="text-muted-foreground text-sm mobile-hidden touch-friendly">
                  TODAY
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')} className="touch-friendly">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <h1 className="text-base sm:text-lg font-medium">
                  {monthFormatter.format(currentDate)}
                </h1>
              </div>

              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDisplayOptions((prev) => !prev)}
                  aria-label="Display options"
                  className="touch-friendly"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {showDisplayOptions && (
                  <div className="absolute right-0 top-full mt-2 bg-card border rounded-lg p-3 z-20 min-w-56 shadow-lg">
                    <div className="text-sm font-medium mb-3">Display stats</div>
                    {displayModes.map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded text-left touch-friendly"
                        onClick={() => {
                          setDisplayMode(mode.value);
                          setShowDisplayOptions(false);
                        }}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center',
                            displayMode === mode.value ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                          )}
                        >
                          {displayMode === mode.value && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                        </div>
                        <span className="text-sm">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="responsive-flex sm:items-center">
              <span className="text-muted-foreground text-sm mobile-hidden">Monthly stats:</span>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="bg-success/15 border border-success/30 rounded-full px-3 py-1">
                  <span className="text-success font-medium text-sm">
                    {formatPnL(totalPnL)}
                  </span>
                </div>
                <div className="bg-primary/15 border border-primary/30 rounded-full px-3 py-1">
                  <span className="text-primary font-medium text-sm">
                    {totalTrades} trades
                  </span>
                </div>
                <div className="bg-muted border border-border rounded-full px-3 py-1">
                  <span className="text-muted-foreground font-medium text-sm">
                    {tradingDays} trading day{tradingDays === 1 ? '' : 's'}
                  </span>
                </div>
                {tradingDays > 0 && (
                  <div className="bg-muted border border-border rounded-full px-3 py-1">
                    <span className="text-muted-foreground font-medium text-sm">
                      {averageWinRate.toFixed(0)}% win rate · {averageRMultiple >= 0 ? '+' : ''}{averageRMultiple.toFixed(2)}R avg
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3 trading-card section-padding">
            {isError && (
              <div className="mb-4 rounded border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                Unable to load calendar data. {error instanceof Error ? error.message : 'Please try again.'}
              </div>
            )}
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2 sm:py-3">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}

              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="h-16 sm:h-20" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dateStr = formatDateKey(date);
                const data = currentMonthData[dateStr] ?? null;
                const isSelected = selectedDate === dateStr;
                const isToday = todayKey === dateStr;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    className={cn(
                      'h-16 sm:h-20 p-1 sm:p-2 border rounded transition-all duration-200 relative flex flex-col justify-between text-left',
                      getDayColor(data),
                      isSelected && 'ring-2 ring-offset-1 ring-primary border-primary/60',
                      !data && 'hover:bg-muted/40',
                      isToday && !isSelected && 'border-primary/40'
                    )}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs sm:text-sm font-medium">{day}</span>
                      {data && <BookOpen className="h-3 w-3 opacity-60" />}
                    </div>

                    {isLoading && !data ? (
                      <div className="flex items-center justify-center text-[10px] text-muted-foreground/70">
                        loading…
                      </div>
                    ) : (
                      data && (
                        <div className="text-center">
                          <div className="font-semibold text-xs sm:text-sm">
                            {formatDisplayValue(data, displayMode)}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            {data.trades} trade{data.trades === 1 ? '' : 's'}
                          </div>
                          <div className="hidden sm:block text-[10px] text-muted-foreground/70">
                            {displayMode !== 'rMultiple' && `${data.rMultiple > 0 ? '+' : ''}${data.rMultiple.toFixed(2)}R · `}
                            {Math.round(data.winRate)}%
                          </div>
                        </div>
                      )
                    )}
                  </button>
                );
              })}

              {Object.keys(currentMonthData).length === 0 && !isLoading && (
                <div className="col-span-7 text-center text-sm text-muted-foreground py-8">
                  No trades recorded for this month yet.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 trading-card section-padding lg:border-none space-y-4">
            {weeklyStats.length > 0 ? (
              weeklyStats.map((stats) => (
                <div key={stats.weekNumber} className="bg-card border rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                    <span>Week {stats.weekNumber}</span>
                    <span>{stats.trades} trade{stats.trades === 1 ? '' : 's'}</span>
                  </div>
                  <div
                    className={cn(
                      'text-xl font-semibold',
                      stats.pnl > 0 ? 'text-success' : stats.pnl < 0 ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {formatPnL(stats.pnl)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.days} active day{stats.days === 1 ? '' : 's'}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card border rounded-lg p-4 text-sm text-muted-foreground">
                Weekly stats will appear once trades are logged this month.
              </div>
            )}

            <div className="bg-card border rounded-lg p-4 mt-6 shadow-sm space-y-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {dayFormatter.format(new Date(selectedDate))}
                </h3>
                {selectedDayData ? (
                  <div className="mt-2 grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-lg font-semibold">{selectedDayData.trades}</div>
                      <div className="text-xs text-muted-foreground">trade{selectedDayData.trades === 1 ? '' : 's'}</div>
                    </div>
                    <div>
                      <div
                        className={cn(
                          'text-lg font-semibold',
                          selectedDayData.pnl > 0 ? 'text-success' : selectedDayData.pnl < 0 ? 'text-destructive' : 'text-muted-foreground'
                        )}
                      >
                        {formatPnL(selectedDayData.pnl)}
                      </div>
                      <div className="text-xs text-muted-foreground">P&L</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {selectedDayData.rMultiple > 0 ? '+' : ''}
                        {selectedDayData.rMultiple.toFixed(2)}R
                      </div>
                      <div className="text-xs text-muted-foreground">avg R multiple</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{Math.round(selectedDayData.winRate)}%</div>
                      <div className="text-xs text-muted-foreground">win rate</div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No trading activity recorded.</p>
                )}
              </div>

              {selectedTrades.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Trades</div>
                  <div className="space-y-2">
                    {selectedTrades.map((trade) => {
                      const timeValue = trade.closeTime ?? trade.openTime;
                      const tradeTime = timeValue ? timeFormatter.format(new Date(timeValue)) : '—';
                      const tradePnL = Number(trade.pnl ?? 0);
                      const tradeRMultiple = Number(trade.rMultiple ?? 0);
                      return (
                        <div key={trade.id} className="border border-border/60 rounded-lg p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{trade.symbol}</span>
                            <span
                              className={cn(
                                'font-semibold',
                                tradePnL > 0 ? 'text-success' : tradePnL < 0 ? 'text-destructive' : 'text-muted-foreground'
                              )}
                            >
                              {formatPnL(tradePnL)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="capitalize">{trade.direction}</span>
                            <span>{tradeTime}</span>
                            <span>
                              {tradeRMultiple > 0 ? '+' : ''}
                              {tradeRMultiple.toFixed(2)}R
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full justify-center" asChild>
                  <Link to="/trades">Manage trades</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}