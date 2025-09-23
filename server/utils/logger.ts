import util from 'util';
import { appConfig } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel = appConfig.logging.level;
const configuredPriority = levelPriority[configuredLevel];

function log(level: LogLevel, message: unknown, ...optionalParams: unknown[]) {
  if (levelPriority[level] < configuredPriority) {
    return;
  }

  const timestamp = new Date().toISOString();
  const formattedMessage =
    typeof message === 'string' ? message : util.inspect(message, { depth: null, colors: false });

  const output = `[${timestamp}] [${level.toUpperCase()}] ${formattedMessage}`;

  switch (level) {
    case 'debug':
      console.debug(output, ...optionalParams);
      break;
    case 'info':
      console.info(output, ...optionalParams);
      break;
    case 'warn':
      console.warn(output, ...optionalParams);
      break;
    case 'error':
      console.error(output, ...optionalParams);
      break;
  }
}

export const logger = {
  debug: (message: unknown, ...optionalParams: unknown[]) =>
    log('debug', message, ...optionalParams),
  info: (message: unknown, ...optionalParams: unknown[]) => log('info', message, ...optionalParams),
  warn: (message: unknown, ...optionalParams: unknown[]) => log('warn', message, ...optionalParams),
  error: (message: unknown, ...optionalParams: unknown[]) =>
    log('error', message, ...optionalParams),
};
