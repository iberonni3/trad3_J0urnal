import type { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = getStatusCode(err);
  const body = normalizeError(err);
  logger.error('Request failed', { status, error: body });
  res.status(status).json(body);
}

function getStatusCode(err: unknown): number {
  if (typeof err === 'object' && err !== null && 'status' in err && typeof (err as any).status === 'number') {
    return (err as any).status as number;
  }
  if (typeof err === 'object' && err !== null && 'statusCode' in err && typeof (err as any).statusCode === 'number') {
    return (err as any).statusCode as number;
  }
  return 500;
}

function normalizeError(err: unknown): { error: string } | Record<string, unknown> {
  if (err instanceof Error) {
    return { error: err.message };
  }
  if (typeof err === 'string') {
    return { error: err };
  }
  return { error: 'Unknown error' };
}


