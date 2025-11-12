export type TradeDirection = 'long' | 'short';
export type TradeStatus = 'open' | 'closed';

export interface Trade {
  id: string;
  userId: string;
  accountId?: string | null;
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
  accountId?: string | null;
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

