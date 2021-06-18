/**
 * Define a custom Logger using winston
 */

import * as winston from 'winston';
import { format } from 'winston';
import { CONFIG } from '../config';
import { MockResponse } from '../fixtures/nodoNewMod3Responses';
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

export function log_event_tx(resp: MockResponse): void {
  logger.info(`>>> tx RESPONSE [${resp[0]}]: `);
  logger.info(resp[1]);
}
