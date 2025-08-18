import { z } from 'zod';

export const loginSchema = z.object({
  login: z.number(),
  password: z.string().min(1),
  server: z.string().min(1),
  path: z.string().optional(),
});

export const marketOrderSchema = z.object({
  symbol: z.string().min(1),
  volume: z.number().positive(),
  side: z.enum(['buy', 'sell']),
});

export type LoginPayload = z.infer<typeof loginSchema>;
export type MarketOrderPayload = z.infer<typeof marketOrderSchema>;


