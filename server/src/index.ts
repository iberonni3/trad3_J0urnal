import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config';
import { logger } from './logger';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { mt5Router } from './routes/mt5';

dotenv.config();

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(requestLogger);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'node-api' });
});

app.use('/api/mt5', mt5Router);

app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`[server] listening on http://localhost:${config.port}`);
});


