import { Trade, TradeMetrics } from '@/types/trade';

/**
 * Calculate comprehensive trading metrics from an array of trades
 */
export const calculateTradeMetrics = (trades: Trade[]): TradeMetrics => {
  const closedTrades = trades.filter(t => t.status === 'closed');
  const openTrades = trades.filter(t => t.status === 'open');
  
  const winningTrades = closedTrades.filter(t => t.pnl > 0);
  const losingTrades = closedTrades.filter(t => t.pnl < 0);
  
  const totalPnL = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
  const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  
  const winRate = closedTrades.length > 0 
    ? (winningTrades.length / closedTrades.length) * 100 
    : 0;
  
  const averageWin = winningTrades.length > 0
    ? grossProfit / winningTrades.length
    : 0;
  
  const averageLoss = losingTrades.length > 0
    ? grossLoss / losingTrades.length
    : 0;
  
  const averageRMultiple = closedTrades.length > 0
    ? closedTrades.reduce((sum, t) => sum + t.rMultiple, 0) / closedTrades.length
    : 0;
  
  // Expectancy = (Win Rate × Average Win) - (Loss Rate × Average Loss)
  const lossRate = closedTrades.length > 0
    ? (losingTrades.length / closedTrades.length)
    : 0;
  const expectancy = (winRate / 100 * averageWin) - (lossRate * averageLoss);
  
  // Profit Factor = Gross Profit / Gross Loss
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  
  // Max Drawdown calculation
  const { maxDrawdown, currentDrawdown } = calculateDrawdown(closedTrades);
  
  const largestWin = winningTrades.length > 0
    ? Math.max(...winningTrades.map(t => t.pnl))
    : 0;
  
  const largestLoss = losingTrades.length > 0
    ? Math.min(...losingTrades.map(t => t.pnl))
    : 0;
  
  const averageHoldTime = calculateAverageHoldTime(closedTrades);
  
  return {
    totalTrades: trades.length,
    openTrades: openTrades.length,
    closedTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    totalPnL,
    averageWin,
    averageLoss,
    averageRMultiple,
    expectancy,
    profitFactor,
    maxDrawdown,
    currentDrawdown,
    largestWin,
    largestLoss,
    averageHoldTime,
    grossProfit,
    grossLoss,
  };
};

/**
 * Calculate win rate percentage
 */
export const calculateWinRate = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed');
  if (closedTrades.length === 0) return 0;
  
  const wins = closedTrades.filter(t => t.pnl > 0).length;
  return (wins / closedTrades.length) * 100;
};

/**
 * Calculate total P&L
 */
export const calculateTotalPnL = (trades: Trade[]): number => {
  return trades
    .filter(t => t.status === 'closed')
    .reduce((sum, t) => sum + t.pnl, 0);
};

/**
 * Calculate average R-multiple
 */
export const calculateAverageRMultiple = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed');
  if (closedTrades.length === 0) return 0;
  
  const totalR = closedTrades.reduce((sum, t) => sum + t.rMultiple, 0);
  return totalR / closedTrades.length;
};

/**
 * Calculate R-multiple for a single trade
 * R-multiple = (Exit - Entry) / (Entry - StopLoss) for long
 * R-multiple = (Entry - Exit) / (StopLoss - Entry) for short
 */
export const calculateRMultiple = (trade: Trade): number => {
  if (trade.exit === null) return 0;
  
  try {
    const risk = trade.direction === 'long'
      ? trade.entry - trade.stopLoss
      : trade.stopLoss - trade.entry;
    
    if (risk <= 0 || !isFinite(risk)) return 0;
    
    const reward = trade.direction === 'long'
      ? trade.exit - trade.entry
      : trade.entry - trade.exit;
    
    const rMultiple = reward / risk;
    return isFinite(rMultiple) ? rMultiple : 0;
  } catch (error) {
    console.error('Error calculating R-multiple:', error);
    return 0;
  }
};

/**
 * Calculate P&L for a single trade
 */
export const calculatePnL = (trade: Trade): number => {
  if (trade.exit === null) return 0;
  
  try {
    const priceChange = trade.direction === 'long'
      ? (trade.exit - trade.entry)
      : (trade.entry - trade.exit);
    
    const commission = trade.commission || 0;
    const pnl = (priceChange * trade.quantity) - commission;
    
    return isFinite(pnl) ? pnl : 0;
  } catch (error) {
    console.error('Error calculating P&L:', error);
    return 0;
  }
};

/**
 * Calculate drawdown from equity curve
 */
export const calculateDrawdown = (trades: Trade[]): { maxDrawdown: number; currentDrawdown: number } => {
  if (trades.length === 0) {
    return { maxDrawdown: 0, currentDrawdown: 0 };
  }
  
  // Sort trades by close time
  const sortedTrades = [...trades].sort((a, b) => {
    const timeA = new Date(a.closeTime || a.openTime).getTime();
    const timeB = new Date(b.closeTime || b.openTime).getTime();
    return timeA - timeB;
  });
  
  let equity = 0;
  let peak = 0;
  let maxDrawdown = 0;
  
  for (const trade of sortedTrades) {
    equity += trade.pnl;
    
    if (equity > peak) {
      peak = equity;
    }
    
    const drawdown = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
    
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  const currentDrawdown = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
  
  return { maxDrawdown, currentDrawdown };
};

/**
 * Calculate average hold time in hours
 */
export const calculateAverageHoldTime = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.closeTime);
  if (closedTrades.length === 0) return 0;
  
  const totalHours = closedTrades.reduce((sum, trade) => {
    const openTime = new Date(trade.openTime).getTime();
    const closeTime = new Date(trade.closeTime!).getTime();
    const hours = (closeTime - openTime) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);
  
  return totalHours / closedTrades.length;
};

/**
 * Calculate expectancy
 * Expectancy = (Win Rate × Average Win) - (Loss Rate × Average Loss)
 */
export const calculateExpectancy = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed');
  if (closedTrades.length === 0) return 0;
  
  const winningTrades = closedTrades.filter(t => t.pnl > 0);
  const losingTrades = closedTrades.filter(t => t.pnl < 0);
  
  const winRate = winningTrades.length / closedTrades.length;
  const lossRate = losingTrades.length / closedTrades.length;
  
  const averageWin = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
    : 0;
  
  const averageLoss = losingTrades.length > 0
    ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
    : 0;
  
  return (winRate * averageWin) - (lossRate * averageLoss);
};

/**
 * Calculate profit factor
 * Profit Factor = Gross Profit / Gross Loss
 */
export const calculateProfitFactor = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.status === 'closed');
  
  const grossProfit = closedTrades
    .filter(t => t.pnl > 0)
    .reduce((sum, t) => sum + t.pnl, 0);
  
  const grossLoss = Math.abs(
    closedTrades
      .filter(t => t.pnl < 0)
      .reduce((sum, t) => sum + t.pnl, 0)
  );
  
  if (grossLoss === 0) {
    return grossProfit > 0 ? Infinity : 0;
  }
  
  return grossProfit / grossLoss;
};

/**
 * Generate equity curve data points
 */
export const generateEquityCurve = (trades: Trade[]): { date: string; equity: number }[] => {
  const closedTrades = trades
    .filter(t => t.status === 'closed' && t.closeTime)
    .sort((a, b) => {
      const timeA = new Date(a.closeTime!).getTime();
      const timeB = new Date(b.closeTime!).getTime();
      return timeA - timeB;
    });
  
  let equity = 0;
  const equityCurve: { date: string; equity: number }[] = [];
  
  for (const trade of closedTrades) {
    equity += trade.pnl;
    equityCurve.push({
      date: typeof trade.closeTime === 'string' ? trade.closeTime : trade.closeTime!.toISOString(),
      equity,
    });
  }
  
  return equityCurve;
};

/**
 * Format currency value
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format percentage value
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};
