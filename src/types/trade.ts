export type TradeDirection = 'long' | 'short';
export type TradeStatus = 'open' | 'closed';

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  direction: 'long' | 'short';
  entry: number;
  exit: number | null;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  pnl: number;
  rMultiple: number;
  openTime: Date | string;
  closeTime: Date | string | null;
  status: 'open' | 'closed';
  setup: string;
  tags: string[];
  broker: string;
  commission: number;
  notes: string;
  screenshotUrl?: string; // Screenshot URL field
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TradeInput {
  symbol: string;
  direction: 'long' | 'short';
  entry: number;
  exit: number | null;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  pnl?: number;
  openTime: Date;
  closeTime: Date | null;
  status: 'open' | 'closed';
  setup: string;
  tags: string[];
  broker: string;
  commission: number;
  notes: string;
  screenshot?: File;
  screenshotUrl?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  tradeId?: string;
  date: Date | string;
  content: string;
  mood?: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
  lessons?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface JournalInput {
  tradeId?: string;
  date: Date | string;
  content: string;
  mood?: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
  lessons?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date | string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  currency?: string;
  timezone?: string;
  defaultBroker?: string;
  riskPercentage?: number;
  theme?: 'light' | 'dark' | 'system';
}

export interface TradeMetrics {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  averageWin: number;
  averageLoss: number;
  averageRMultiple: number;
  expectancy: number;
  profitFactor: number;
  maxDrawdown: number;
  currentDrawdown: number;
  largestWin: number;
  largestLoss: number;
  averageHoldTime: number; // in hours
  grossProfit: number;
  grossLoss: number;
}
