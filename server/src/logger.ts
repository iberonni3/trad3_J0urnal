/* Simple logger with leveled output */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelToConsole: Record<LogLevel, (msg?: any, ...args: any[]) => void> = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

export const logger = {
  debug(message: string, meta?: unknown) {
    levelToConsole.debug(formatMessage('debug', message, meta));
  },
  info(message: string, meta?: unknown) {
    levelToConsole.info(formatMessage('info', message, meta));
  },
  warn(message: string, meta?: unknown) {
    levelToConsole.warn(formatMessage('warn', message, meta));
  },
  error(message: string, meta?: unknown) {
    levelToConsole.error(formatMessage('error', message, meta));
  },
};

function formatMessage(level: LogLevel, message: string, meta?: unknown) {
  try {
    const metaStr = meta === undefined ? '' : ` ${JSON.stringify(meta)}`;
    return `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${metaStr}`;
  } catch {
    return `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  }
}


