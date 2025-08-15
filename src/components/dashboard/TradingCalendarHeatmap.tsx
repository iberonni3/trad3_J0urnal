import { useState, useMemo } from 'react';
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  addMonths, 
  format, 
  parseISO,
  isWithinInterval,
  eachDayOfInterval,
  isWeekend
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TradingCalendarHeatmapProps {
  data: { date: string; profitLoss: number }[];
  containerHeight: number;
}

export function TradingCalendarHeatmap({ data, containerHeight }: TradingCalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Process data for current month
  const { heatmapValues, monthStart, monthEnd } = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Create all days in month
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Map to heatmap format
    const values = daysInMonth.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const existing = data.find(d => d.date === dateStr);
      return {
        date: dateStr,
        count: existing?.profitLoss ?? null // null will show as empty
      };
    });

    return { heatmapValues: values, monthStart, monthEnd };
  }, [data, currentMonth]);

  // Calculate cell size based on container height
  const { cellSize, weekdayFontSize } = useMemo(() => {
    const approxCells = 35; // 5 weeks * 7 days
    const cellSize = Math.min(14, Math.max(8, Math.floor(containerHeight * 0.8 / 5))); // 5 rows
    return {
      cellSize,
      weekdayFontSize: Math.max(8, Math.min(10, cellSize - 2))
    };
  }, [containerHeight]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-2 px-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="h-6 w-6 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          disabled={currentMonth >= startOfMonth(new Date())}
          className="h-6 w-6 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Heatmap Visualization */}
      <div className="flex-1 w-full overflow-hidden">
        <CalendarHeatmap
          startDate={monthStart}
          endDate={monthEnd}
          values={heatmapValues}
          showWeekdayLabels
          showMonthLabels={false}
          gutterSize={1}
          horizontal={false}
          classForValue={(value) => {
            if (value?.count === null || value?.count === undefined) return 'color-empty';
            if (value.count > 0) return 'color-profit';
            if (value.count < 0) return 'color-loss';
            return 'color-zero';
          }}
          titleForValue={(value) => 
            value?.date ? `${value.date}: ${value.count ? '$'+value.count : 'No trades'}` : ''
          }
        />
      </div>

      {/* Dynamic Styling */}
      <style>{`
        .react-calendar-heatmap {
          width: 100% !important;
          height: 100% !important;
        }
        .react-calendar-heatmap .react-calendar-heatmap-day {
          width: ${cellSize}px;
          height: ${cellSize}px;
          margin: 1px;
          border-radius: 2px;
          stroke: #e5e7eb;
          stroke-width: 0.5px;
        }
        .react-calendar-heatmap .react-calendar-heatmap-weekday {
          font-size: ${weekdayFontSize}px;
          fill: #6b7280;
        }
        .color-empty { fill: #f3f4f6; }
        .color-zero { fill: #d1d5db; }
        .color-profit { fill: #10b981; }
        .color-loss { fill: #ef4444; }
      `}</style>
    </div>
  );
}