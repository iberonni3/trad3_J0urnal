import axios from 'axios';
import { config } from '../config';
import type { LoginPayload, MarketOrderPayload } from '../validators';

const client = axios.create({ baseURL: config.mt5ServiceUrl, timeout: 10_000 });

export const mt5Client = {
  async health() {
    const { data } = await client.get('/health');
    return data as { status: string; service: string };
  },

  async login(payload: LoginPayload) {
    const { data } = await client.post('/session/login', payload);
    return data as Record<string, unknown>;
  },

  async logout() {
    const { data } = await client.post('/session/logout');
    return data as Record<string, unknown>;
  },

  async getTick(symbol: string) {
    const { data } = await client.get('/market/tick', { params: { symbol } });
    return data as Record<string, unknown>;
  },

  async marketOrder(payload: MarketOrderPayload) {
    const { data } = await client.post('/orders/market', payload);
    return data as Record<string, unknown>;
  },
};


