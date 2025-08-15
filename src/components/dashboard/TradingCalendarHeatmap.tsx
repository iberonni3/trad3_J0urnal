import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TradingCalendarHeatmapProps {
  data: { date: string; profitLoss: number }[];
  equityRef?: React.RefObject<HTMLDivElement>;
}

// Helper functions to replace date-fns
const getStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const getEndOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1);
const subMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() - months, 1);
const formatDate = (date: Date, format: string) => {
  if (format === 'yyyy-MM-dd') {
    return date.toISOString().split('T')[0];
  }
  if (format === 'MMM yyyy') {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  if (format === 'd') {
    return date.getDate().toString();
  }
  if (format === 'MMM d, yyyy') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleDateString();
};
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
const isAfter = (date1: Date, date2: Date) => date1 > date2;

const getDaysInMonth = (year: number, month: number) => {
  const days = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= lastDay; day++) {
    days.push(new Date(year, month, day));
  }
  return days;
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
          const isCurrentMonth = date >= monthStart && date <= monthEnd;
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

      return {
        calendarGrid: calendarData,
        monthStart,
        monthEnd
      };
    } catch (error) {
      console.error('Error generating calendar data:', error);
      return { calendarGrid: [], monthStart: new Date(), monthEnd: new Date() };
    }
  }, [data, currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const isNextDisabled = isAfter(currentMonth, subMonths(getStartOfMonth(new Date()), 1));

  const { cellSize, fontSize } = useMemo(() => {
    const headerHeight = 20;
    const padding = 8;
    const availableHeight = containerHeight - headerHeight - padding;
    const cellSize = Math.floor(availableHeight / 6) - 2; // 6 weeks, minus gap
    const fontSize = Math.max(8, Math.floor(cellSize * 0.3));
    
    return { cellSize: Math.max(20, cellSize), fontSize };
  }, [containerHeight]);

  const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getCellColor = (day) => {
    if (!day.isCurrentMonth) return '#f1f5f9'; // Very light gray for other months
    if (day.profitLoss === null) {
      return day.isWeekend ? '#e2e8f0' : '#f8fafc'; // Slightly different for weekends
    }
    return day.profitLoss > 0 ? '#22c55e' : '#ef4444'; // Green for profit, red for loss
  };

  const getCellTitle = (day) => {
    if (!day.isCurrentMonth) return '';
    const dateStr = formatDate(day.date, 'MMM d, yyyy');
    if (day.profitLoss === null) return `${dateStr}: No trades`;
    return `${dateStr}: $${day.profitLoss}`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-0 px-4 pt-3">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-lg">Trading Activity</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium w-24 text-center">{formatDate(currentMonth, 'MMM yyyy')}</div>
            <Button variant="outline" size="sm" onClick={handleNextMonth} disabled={isNextDisabled} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="w-full" ref={heatmapContainerRef}>
          {calendarGrid.length > 0 ? (
            <div className="flex flex-col gap-2">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekdayLabels.map((label, index) => (
                  <div
                    key={index}
                    className="text-center text-xs text-muted-foreground font-medium flex items-center justify-center"
                    style={{ 
                      width: `${cellSize}px`,
                      height: '20px',
                      fontSize: `${fontSize}px`
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              {calendarGrid.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      title={getCellTitle(day)}
                      className="relative rounded cursor-pointer transition-opacity hover:opacity-80"
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        backgroundColor: getCellColor(day),
                        opacity: day.isCurrentMonth ? 1 : 0.3
                      }}
                    >
                      <div 
                        className="absolute inset-0 flex items-center justify-center text-xs font-medium"
                        style={{ 
                          fontSize: `${fontSize}px`,
                          color: day.profitLoss !== null ? '#fff' : '#64748b'
                        }}
                      >
                        {formatDate(day.date, 'd')}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available for this period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}