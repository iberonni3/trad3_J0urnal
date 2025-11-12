export interface TradingAccount {
  id: string;
  userId: string;
  name: string;
  broker: string;
  initialBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountInput {
  name: string;
  broker: string;
  initialBalance: number;
}

