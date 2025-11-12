import { supabase } from '@/integrations/supabase/client';
import { Trade, TradeMetrics } from '@/types/trade';

export const fetchTradeAnalytics = async (userId: string) => {
  // Fetch all trades for the user
  const { data: trades, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('open_time', { ascending: false });

  if (error) {
    console.error('Error fetching trades:', error);
    throw error;
  }

  return processTradeAnalytics(trades || []);
}

const processTradeAnalytics = (trades: any[]): TradeMetrics => {
  if (trades.length === 0) {
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

  const closedTrades = trades.filter(trade => trade.status === 'closed');
  const winningTrades = closedTrades.filter(trade => trade.pnl > 0);
  const losingTrades = closedTrades.filter(trade => trade.pnl < 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  
  const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const grossProfit = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
  
  const averageWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winningTrades.length 
    : 0;
    
  const averageLoss = losingTrades.length > 0 
    ? losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losingTrades.length 
    : 0;
    
  const averageRMultiple = closedTrades.length > 0 
    ? closedTrades.reduce((sum, trade) => sum + (trade.r_multiple || 0), 0) / closedTrades.length 
    : 0;
    
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  
  // Calculate drawdown
  let runningBalance = 0;
  let peak = 0;
  let maxDrawdown = 0;
  let currentDrawdown = 0;
  
  const balanceHistory = [];
  
  // Sort trades by close time for drawdown calculation
  const sortedTrades = [...closedTrades].sort((a, b) => 
    new Date(a.close_time).getTime() - new Date(b.close_time).getTime()
  );
  
  for (const trade of sortedTrades) {
    runningBalance += trade.pnl || 0;
    balanceHistory.push(runningBalance);
    
    if (runningBalance > peak) {
      peak = runningBalance;
    }
    
    const drawdown = peak - runningBalance;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
    
    currentDrawdown = drawdown;
  }
  
  // Calculate average hold time in hours
  let totalHoldTime = 0;
  for (const trade of closedTrades) {
    if (trade.open_time && trade.close_time) {
      const openTime = new Date(trade.open_time);
      const closeTime = new Date(trade.close_time);
      totalHoldTime += (closeTime.getTime() - openTime.getTime()) / (1000 * 60 * 60); // Convert to hours
    }
  }
  
  const averageHoldTime = closedTrades.length > 0 ? totalHoldTime / closedTrades.length : 0;
  
  return {
    totalTrades: trades.length,
    openTrades: trades.filter(t => t.status === 'open').length,
    closedTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    totalPnL,
    averageWin,
    averageLoss,
    averageRMultiple,
    expectancy: (winRate / 100) * averageWin - ((100 - winRate) / 100) * Math.abs(averageLoss),
    profitFactor,
    maxDrawdown,
    currentDrawdown,
    largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl || 0)) : 0,
    largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl || 0)) : 0,
    averageHoldTime,
    grossProfit,
    grossLoss: -grossLoss, // Return as negative number
  };
};

export const fetchMonthlyPerformance = async (userId: string, months: number = 6) => {
  const { data, error } = await supabase.rpc('get_monthly_performance', {
    user_id: userId,
    month_count: months
  });

  if (error) {
    console.error('Error fetching monthly performance:', error);
    throw error;
  }

  return data || [];
};

export const fetchSymbolPerformance = async (userId: string) => {
  const { data, error } = await supabase
    .from('trades')
    .select('symbol, pnl, r_multiple, status')
    .eq('user_id', userId)
    .eq('status', 'closed');

  if (error) {
    console.error('Error fetching symbol performance:', error);
    throw error;
  }

  // Group by symbol and calculate metrics
  const symbolMap = new Map();
  
  data?.forEach(trade => {
    if (!symbolMap.has(trade.symbol)) {
      symbolMap.set(trade.symbol, {
        symbol: trade.symbol,
        pnl: 0,
        rMultiple: 0,
        count: 0,
        wins: 0
      });
    }
    
    const symbolData = symbolMap.get(trade.symbol);
    symbolData.pnl += trade.pnl || 0;
    symbolData.rMultiple += trade.r_multiple || 0;
    symbolData.count += 1;
    
    if ((trade.pnl || 0) > 0) {
      symbolData.wins += 1;
    }
  });
  
  // Calculate averages and win rates
  return Array.from(symbolMap.values()).map(item => ({
    symbol: item.symbol,
    pnl: item.pnl,
    avgRMultiple: item.count > 0 ? item.rMultiple / item.count : 0,
    winRate: item.count > 0 ? (item.wins / item.count) * 100 : 0,
    tradeCount: item.count
  }));
};
