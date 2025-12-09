
import { config } from '../config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function shouldLog(level: LogLevel): boolean {
  return levelOrder[level] >= levelOrder[config.logLevel];
}

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (meta === undefined) return base;
  try {
    return base + ' ' + JSON.stringify(meta);
  } catch {
    return base + ' (meta: [unserializable])';
  }
}

export const logger = {
  debug(message: string, meta?: unknown) {
    if (!shouldLog('debug')) return;
    console.debug(formatMessage('debug', message, meta));
  },
  info(message: string, meta?: unknown) {
    if (!shouldLog('info')) return;
    console.info(formatMessage('info', message, meta));
  },
  warn(message: string, meta?: unknown) {
    if (!shouldLog('warn')) return;
    console.warn(formatMessage('warn', message, meta));
  },
  error(message: string, meta?: unknown) {
    if (!shouldLog('error')) return;
    console.error(formatMessage('error', message, meta));
  }
};
