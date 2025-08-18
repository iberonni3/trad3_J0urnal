import { Router } from 'express';
import { mt5Client } from '../services/mt5Client';
import { requireAuthIfEnabled } from '../middleware/auth';
import { loginSchema, marketOrderSchema } from '../validators';

export const mt5Router = Router();

mt5Router.use(requireAuthIfEnabled);

mt5Router.get('/health', async (_req, res, next) => {
  try {
    const health = await mt5Client.health();
    res.json(health);
  } catch (error) {
    next(error);
  }
});

mt5Router.post('/session/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await mt5Client.login(payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

mt5Router.post('/session/logout', async (_req, res, next) => {
  try {
    const result = await mt5Client.logout();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

mt5Router.get('/market/tick', async (req, res, next) => {
  try {
    const symbol = String(req.query.symbol ?? '');
    if (!symbol) {
      res.status(400).json({ error: 'symbol is required' });
      return;
    }
    const tick = await mt5Client.getTick(symbol);
    res.json(tick);
  } catch (error) {
    next(error);
  }
});

mt5Router.post('/orders/market', async (req, res, next) => {
  try {
    const payload = marketOrderSchema.parse(req.body);
    const result = await mt5Client.marketOrder(payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
});


