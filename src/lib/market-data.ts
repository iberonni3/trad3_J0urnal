// Market Data Service for real-time financial data
import { UTCTimestamp } from 'lightweight-charts';

export interface CandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MarketDataProvider {
  name: string;
  connect(): Promise<boolean>;
  disconnect(): void;
  subscribe(symbol: string, timeframe: string, callback: (data: CandleData) => void): void;
  unsubscribe(symbol: string): void;
  fetchHistoricalData(symbol: string, timeframe: string, limit?: number): Promise<CandleData[]>;
}

// Finnhub Provider (Free tier available)
export class FinnhubProvider implements MarketDataProvider {
  name = 'Finnhub';
  private apiKey: string | null = null;
  private baseUrl = 'https://finnhub.io/api/v1';
  private websocket: WebSocket | null = null;
  private subscriptions = new Map<string, (data: CandleData) => void>();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_FINNHUB_API_KEY || null;
  }

  async connect(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('Finnhub API key not provided. Using demo data.');
      return false;
    }

    try {
      // Test the API connection
      const response = await fetch(`${this.baseUrl}/quote?symbol=AAPL&token=${this.apiKey}`);
      const data = await response.json();

      if (data.error) {
        console.error('Finnhub API error:', data.error);
        return false;
      }

      // Initialize WebSocket connection for real-time data
      this.websocket = new WebSocket(`wss://ws.finnhub.io?token=${this.apiKey}`);

      this.websocket.onopen = () => {
        console.log('Finnhub WebSocket connected');
      };

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };

      this.websocket.onerror = (error) => {
        console.error('Finnhub WebSocket error:', error);
      };

      this.websocket.onclose = () => {
        console.log('Finnhub WebSocket disconnected');
      };

      return true;
    } catch (error) {
      console.error('Failed to connect to Finnhub:', error);
      return false;
    }
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.subscriptions.clear();
  }

  subscribe(symbol: string, timeframe: string, callback: (data: CandleData) => void): void {
    if (!this.websocket) {
      console.warn('WebSocket not connected. Cannot subscribe to', symbol);
      return;
    }

    const subscriptionKey = `${symbol}-${timeframe}`;
    this.subscriptions.set(subscriptionKey, callback);

    // Subscribe to real-time trades
    this.websocket.send(JSON.stringify({
      type: 'subscribe',
      symbol: symbol
    }));
  }

  unsubscribe(symbol: string): void {
    if (!this.websocket) return;

    // Remove all subscriptions for this symbol
    for (const [key, _] of this.subscriptions) {
      if (key.startsWith(symbol)) {
        this.subscriptions.delete(key);
      }
    }

    // Unsubscribe from WebSocket
    this.websocket.send(JSON.stringify({
      type: 'unsubscribe',
      symbol: symbol
    }));
  }

  async fetchHistoricalData(symbol: string, timeframe: string, limit = 1000): Promise<CandleData[]> {
    if (!this.apiKey) {
      // Return demo data if no API key
      return generateDemoMarketData(symbol, timeframe, limit);
    }

    try {
      // Convert timeframe to Finnhub resolution
      const resolution = this.convertTimeframeToResolution(timeframe);

      // Calculate time range
      const to = Math.floor(Date.now() / 1000);
      const from = to - (limit * this.getTimeframeInSeconds(timeframe));

      const url = `${this.baseUrl}/forex/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.s === 'ok') {
        return data.t.map((time: number, index: number): CandleData => ({
          time: time as UTCTimestamp,
          open: data.o[index],
          high: data.h[index],
          low: data.l[index],
          close: data.c[index],
          volume: data.v ? data.v[index] : undefined
        }));
      } else {
        throw new Error(`API returned status: ${data.s}`);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      // Fallback to demo data
      return generateDemoMarketData(symbol, timeframe, limit);
    }
  }

  private convertTimeframeToResolution(timeframe: string): string {
    const mapping: Record<string, string> = {
      '1': '1',
      '5': '5',
      '15': '15',
      '30': '30',
      '60': '60',
      '240': '240',
      'D': 'D',
      'W': 'W',
      'M': 'M'
    };
    return mapping[timeframe] || '15';
  }

  private getTimeframeInSeconds(timeframe: string): number {
    const mapping: Record<string, number> = {
      '1': 60,
      '5': 300,
      '15': 900,
      '30': 1800,
      '60': 3600,
      '240': 14400,
      'D': 86400,
      'W': 604800,
      'M': 2629746
    };
    return mapping[timeframe] || 900;
  }

  private handleWebSocketMessage(data: any): void {
    if (data.type === 'trade') {
      // Convert trade data to candle data
      // This is a simplified implementation - in reality, you'd aggregate trades into candles
      for (const trade of data.data) {
        const candleData: CandleData = {
          time: Math.floor(trade.t / 1000) as UTCTimestamp,
          open: trade.p,
          high: trade.p,
          low: trade.p,
          close: trade.p,
          volume: trade.v
        };

        // Find matching subscription and call callback
        for (const [key, callback] of this.subscriptions) {
          if (key.startsWith(trade.s)) {
            callback(candleData);
          }
        }
      }
    }
  }
}

// Demo data provider for development
export class DemoDataProvider implements MarketDataProvider {
  name = 'Demo';
  private subscriptions = new Map<string, { callback: (data: CandleData) => void, interval: NodeJS.Timeout }>();

  async connect(): Promise<boolean> {
    return true;
  }

  disconnect(): void {
    for (const [_, subscription] of this.subscriptions) {
      clearInterval(subscription.interval);
    }
    this.subscriptions.clear();
  }

  subscribe(symbol: string, timeframe: string, callback: (data: CandleData) => void): void {
    const key = `${symbol}-${timeframe}`;

    // Clear existing subscription
    if (this.subscriptions.has(key)) {
      clearInterval(this.subscriptions.get(key)!.interval);
    }

    // Create new subscription with simulated real-time updates
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000) as UTCTimestamp;
      const basePrice = this.getBasePrice(symbol);
      const change = (Math.random() - 0.5) * 0.002 * basePrice;

      const candleData: CandleData = {
        time: now,
        open: basePrice,
        high: basePrice + Math.abs(change) * 0.5,
        low: basePrice - Math.abs(change) * 0.5,
        close: basePrice + change,
        volume: Math.floor(50000 + Math.random() * 100000)
      };

      callback(candleData);
    }, 1000); // Update every second

    this.subscriptions.set(key, { callback, interval });
  }

  unsubscribe(symbol: string): void {
    for (const [key, subscription] of this.subscriptions) {
      if (key.startsWith(symbol)) {
        clearInterval(subscription.interval);
        this.subscriptions.delete(key);
      }
    }
  }

  async fetchHistoricalData(symbol: string, timeframe: string, limit = 1000): Promise<CandleData[]> {
    return generateDemoMarketData(symbol, timeframe, limit);
  }

  private getBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      'EURUSD': 1.08472,
      'GBPUSD': 1.25632,
      'USDJPY': 150.85,
      'BTCUSD': 62150.45,
      'AAPL': 175.25,
    };
    return prices[symbol] || 100.0;
  }
}

// Generate realistic demo market data
function generateDemoMarketData(symbol: string, timeframe: string, limit: number): CandleData[] {
  const data: CandleData[] = [];

  // Base price varies by symbol
  let basePrice = 0;
  let tickSize = 0.00001;

  switch (symbol) {
    case 'EURUSD': basePrice = 1.08472; break;
    case 'GBPUSD': basePrice = 1.25632; break;
    case 'USDJPY': basePrice = 150.85; tickSize = 0.01; break;
    case 'BTCUSD': basePrice = 62150.45; tickSize = 0.01; break;
    case 'AAPL': basePrice = 175.25; tickSize = 0.01; break;
    default: basePrice = 100.00; tickSize = 0.01;
  }

  // Time interval in milliseconds based on timeframe
  let interval = 60 * 1000; // Default 1m
  switch (timeframe) {
    case '1': interval = 60 * 1000; break;
    case '5': interval = 5 * 60 * 1000; break;
    case '15': interval = 15 * 60 * 1000; break;
    case '30': interval = 30 * 60 * 1000; break;
    case '60': interval = 60 * 60 * 1000; break;
    case '240': interval = 4 * 60 * 60 * 1000; break;
    case 'D': interval = 24 * 60 * 60 * 1000; break;
    case 'W': interval = 7 * 24 * 60 * 60 * 1000; break;
  }

  // End time is now, start time is calculated based on limit and interval
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - limit * interval);

  // Initialize price with slight random offset from base price
  let currentPrice = basePrice * (0.995 + Math.random() * 0.01);

  // Market session patterns for realistic behavior
  const getSessionMultiplier = (hour: number) => {
    // Simulate different market sessions with varying volatility
    if (hour >= 0 && hour < 8) return 0.4; // Asian quiet
    if (hour >= 8 && hour < 12) return 0.9; // European morning
    if (hour >= 12 && hour < 17) return 1.3; // Overlap high volatility
    if (hour >= 17 && hour < 22) return 1.0; // US afternoon
    return 0.5; // Overnight
  };

  // Key price levels for this symbol (support/resistance)
  const keyLevels = [
    basePrice * 0.985,
    basePrice * 0.992,
    basePrice * 0.998,
    basePrice * 1.003,
    basePrice * 1.008,
    basePrice * 1.015
  ];

  // Function to check if price is near key level
  const isNearKeyLevel = (price: number, threshold: number = 0.001) => {
    return keyLevels.some(level => Math.abs(price - level) / level < threshold);
  };

  let trendDirection = Math.random() > 0.5 ? 1 : -1;
  let trendStrength = 0.3 + Math.random() * 0.4;
  let consolidationCounter = 0;

  for (let i = 0; i < limit; i++) {
    const time = new Date(startTime.getTime() + i * interval);
    const hour = time.getUTCHours();
    const sessionMultiplier = getSessionMultiplier(hour);

    // Change trend randomly to simulate market cycles
    if (Math.random() < 0.008) { // 0.8% chance per candle
      trendDirection *= -1;
      trendStrength = 0.2 + Math.random() * 0.6;
      consolidationCounter = 0;
    }

    // Key level reactions - price tends to bounce or consolidate near important levels
    let keyLevelReaction = 0;
    if (isNearKeyLevel(currentPrice)) {
      // 60% chance of bouncing off key levels
      if (Math.random() < 0.6) {
        const nearestLevel = keyLevels.reduce((prev, curr) =>
          Math.abs(curr - currentPrice) < Math.abs(prev - currentPrice) ? curr : prev
        );
        keyLevelReaction = (nearestLevel - currentPrice) * 0.3;
      }
    }

    // Consolidation periods
    if (consolidationCounter > 20 && Math.random() < 0.15) {
      trendStrength *= 0.3; // Reduce trend strength for consolidation
    }
    consolidationCounter++;

    const open = currentPrice;

    // Base volatility adjusted for symbol and timeframe
    const baseVolatility = tickSize * 10;
    const volatility = baseVolatility * sessionMultiplier;

    // Trend component with momentum and mean reversion
    const trendComponent = trendDirection * trendStrength * volatility * (0.5 + Math.random() * 0.8);

    // Add realistic noise patterns
    const microNoise = (Math.random() - 0.5) * volatility * 0.6;
    const momentumNoise = (Math.random() - 0.5) * volatility * 1.2;

    // Occasional spikes (news events, etc.)
    const spikeChance = Math.random();
    let spikeComponent = 0;
    if (spikeChance < 0.003) { // 0.3% chance of spike
      spikeComponent = (Math.random() - 0.5) * volatility * (3 + Math.random() * 4);
    }

    const totalChange = trendComponent + microNoise + momentumNoise + spikeComponent + keyLevelReaction;

    // Create realistic OHLC with proper market microstructure
    const spreadFactor = 0.4 + Math.random() * 0.8;
    let high, low, close;

    if (totalChange > 0) {
      // Bullish candle
      high = open + Math.abs(totalChange) * (1.1 + Math.random() * 0.4) + volatility * spreadFactor;
      low = open - volatility * spreadFactor * (0.2 + Math.random() * 0.6);
      close = open + totalChange * (0.7 + Math.random() * 0.6);
    } else {
      // Bearish candle
      high = open + volatility * spreadFactor * (0.2 + Math.random() * 0.6);
      low = open - Math.abs(totalChange) * (1.1 + Math.random() * 0.4) - volatility * spreadFactor;
      close = open + totalChange * (0.7 + Math.random() * 0.6);
    }

    // Ensure OHLC integrity
    high = Math.max(high, open, close);
    low = Math.min(low, open, close);

    // Round to realistic tick sizes
    const roundToTick = (price: number) => Math.round(price / tickSize) * tickSize;

    // Realistic volume patterns
    const baseVolume = 45000 + Math.random() * 180000;
    const priceChangeVolume = 1 + Math.abs(totalChange) / volatility * 0.8;
    const sessionVolume = sessionMultiplier * 0.8 + 0.4;
    const spikeVolume = Math.abs(spikeComponent) > 0 ? 2 + Math.random() * 3 : 1;
    const keyLevelVolume = Math.abs(keyLevelReaction) > 0 ? 1.5 + Math.random() * 0.8 : 1;
    const volume = Math.floor(baseVolume * priceChangeVolume * sessionVolume * spikeVolume * keyLevelVolume);

    data.push({
      time: Math.floor(time.getTime() / 1000) as UTCTimestamp,
      open: roundToTick(open),
      high: roundToTick(high),
      low: roundToTick(low),
      close: roundToTick(close),
      volume: volume
    });

    currentPrice = close;

    // Add some price gaps occasionally (weekend gaps, news gaps)
    if (Math.random() < 0.001) { // 0.1% chance of gap
      const gapSize = (Math.random() - 0.5) * volatility * (2 + Math.random() * 3);
      currentPrice += gapSize;
    }
  }

  return data;
}

// Market data service factory
export function createMarketDataProvider(providerName: 'finnhub' | 'demo' = 'demo', apiKey?: string): MarketDataProvider {
  switch (providerName) {
    case 'finnhub':
      return new FinnhubProvider(apiKey);
    case 'demo':
    default:
      return new DemoDataProvider();
  }
}

// Default market data service instance
export const marketDataService = createMarketDataProvider('demo');
