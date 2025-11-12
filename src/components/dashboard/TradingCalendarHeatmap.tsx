import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TradingCalendarHeatmapProps {
  data: { date: string; profitLoss: number }[];
  equityRef?: React.RefObject<HTMLDivElement>;
}

// Helper functions
const getStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const getEndOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

const formatDate = (date: Date, formatStr: string) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (formatStr === 'yyyy-MM-dd') {
    return `${year}-${month}-${day}`;
  }
  if (formatStr === 'MMM yyyy') {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${year}`;
  }
  return date.toISOString();
};

const subMonths = (date: Date, months: number) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - months);
  return newDate;
};

const addMonths = (date: Date, months: number) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

const getCalendarGrid = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  
  // Go back to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const weeks = [];
  const currentDate = new Date(startDate);
  
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    for (let day = 0; day < 7; day++) {
      weekDays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(weekDays);
  }
  
  return weeks;
};

export function TradingCalendarHeatmap({ data = [], equityRef }: TradingCalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [containerHeight, setContainerHeight] = useState(220);

  const heatmapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (equityRef?.current) {
      const eqHeight = equityRef.current.getBoundingClientRect().height;
      setContainerHeight(eqHeight);
    }
  }, [equityRef]);

  const { calendarGrid, monthStart, monthEnd } = useMemo(() => {
    try {
      const monthStart = getStartOfMonth(currentMonth);
      const monthEnd = getEndOfMonth(currentMonth);
      
      const weeks = getCalendarGrid(currentMonth.getFullYear(), currentMonth.getMonth());
      
      const calendarData = weeks.map(week => 
        week.map(date => {
          const dateStr = formatDate(date, 'yyyy-MM-dd');
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const dayData = data.find(d => d.date === dateStr);
          
          return {
            date,
            dateStr,
            profitLoss: dayData?.profitLoss ?? null,
            isWeekend: isWeekend(date),
            isCurrentMonth,
            dayOfWeek: date.getDay()
          };
        })
      );
      
      return { calendarGrid: calendarData, monthStart, monthEnd };
    } catch (error) {
      console.error('Error generating calendar data:', error);
      return { calendarGrid: [], monthStart: new Date(), monthEnd: new Date() };
    }
  }, [currentMonth, data]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  return (
    <Card className="trading-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Trading Activity</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[90px] text-center">
              {formatDate(currentMonth, 'MMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8"
              disabled={new Date() < new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex flex-col">
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted-foreground mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr gap-1.5 flex-1">
            {calendarGrid.flat().map((day, index) => {
              const isCurrentMonth = day.isCurrentMonth;
              const isActive = isCurrentMonth && day.profitLoss !== null;
              const isProfit = day.profitLoss && day.profitLoss > 0;
              const isLoss = day.profitLoss && day.profitLoss < 0;
              const isToday = new Date().toDateString() === day.date.toDateString();

              return (
                <div
                  key={index}
                  className={cn(
                    'rounded-md flex items-center justify-center relative text-xs transition-colors min-h-0',
                    !isCurrentMonth && 'opacity-30 text-muted-foreground',
                    isCurrentMonth && !isActive && 'hover:bg-muted/50',
                    isActive && 'font-semibold',
                    isProfit && 'bg-green-500/20 text-green-700 dark:bg-green-500/20 dark:text-green-400',
                    isLoss && 'bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-400',
                    isToday && 'ring-2 ring-primary'
                  )}
                  title={day.profitLoss !== null ? `P&L: ${day.profitLoss.toFixed(2)}` : 'No trades'}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span>{day.date.getDate()}</span>
                    {isActive && (
                      <span className="text-[10px] opacity-70 leading-none mt-0.5">
                        {isProfit ? '▲' : isLoss ? '▼' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}