// src/components/dashboard/TradingCalendarHeatmap.tsx
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays, format } from "date-fns";

interface TradeDay {
  date: string; // YYYY-MM-DD
  profitLoss: number; // Profit or loss for the day
}

interface TradingCalendarHeatmapProps {
  data: TradeDay[];
}

export function TradingCalendarHeatmap({ data }: TradingCalendarHeatmapProps) {
  const startDate = subDays(new Date(), 90); // last 90 days
  const endDate = new Date();

  // Map data to heatmap format
  const heatmapValues = data.map((d) => ({
    date: d.date,
    count: d.profitLoss, // using count as profit/loss
  }));

  const getClassForValue = (value: any) => {
    if (!value) return "color-empty";
    if (value.count > 1000) return "color-scale-4";
    if (value.count > 500) return "color-scale-3";
    if (value.count > 0) return "color-scale-2";
    if (value.count < 0) return "color-scale-negative";
    return "color-scale-1";
  };

  return (
    <div className="h-80 p-4 rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-2">Trading Calendar</h3>
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={heatmapValues}
        classForValue={getClassForValue}
        tooltipDataAttrs={(value) => ({
          "data-tip": value
            ? `${value.date}: $${value.count.toFixed(2)}`
            : "No trades",
        })}
        showWeekdayLabels
      />
    </div>
  );
}
