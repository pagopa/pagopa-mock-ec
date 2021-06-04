/**
 * Define a custom Logger using winston
 */

import * as winston from 'winston';
import { format } from 'winston';
import { CONFIG } from '../config';
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`);

export const logger = winston.createLogger({
  level: CONFIG.WINSTON_LOG_LEVEL,
  format: combine(timestamp(), myFormat),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'pagopa-mock.log' })],
});

export function disableConsoleLog(): void {
  logger.remove(winston.transports.Console);
}
