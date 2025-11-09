import { useMemo } from 'react';
import { Trade, TradeMetrics } from '@/types/trade';
import { calculateTradeMetrics } from '@/lib/calculations';

/**
 * Custom hook to calculate trading metrics from trades data
 * Memoizes the calculations to avoid unnecessary recomputation
 */
export const useTradeMetrics = (trades: Trade[] | undefined): TradeMetrics => {
  return useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        openTrades: 0,
        closedTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        averageWin: 0,
        averageLoss: 0,
        averageRMultiple: 0,
        expectancy: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        currentDrawdown: 0,
        largestWin: 0,
        largestLoss: 0,
        averageHoldTime: 0,
        grossProfit: 0,
        grossLoss: 0,
      };
    }

    return calculateTradeMetrics(trades);
  }, [trades]);
};
