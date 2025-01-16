/**
 * Common configurations for Proxy PagoPA and external resources
 */

import * as dotenv from 'dotenv';
import * as t from 'io-ts';
import { NonEmptyString } from 'italia-ts-commons/lib/strings';

dotenv.config();

const localhost = 'localhost';

export const CONFIG = {
  // The log level used for Winston logger (error, info, debug)
  WINSTON_LOG_LEVEL: process.env.WINSTON_LOG_LEVEL || 'debug',

  // RESTful Webservice configuration
  // These information are documented here:
  // https://docs.google.com/document/d/1Qqe6mSfon-blHzc-ldeEHmzIkVaElKY5LtDnKiLbk80/edit
  // Used to expose services
  PA_MOCK: {
    HOST: process.env.PAGOPA_NODO_HOST || localhost,
    PORT: process.env.PORT || 8080,
    TEST_DEBUG: process.env.TEST_DEBUG || 'N',
    AUX_DIGIT: process.env.AUX_DIGIT || '0',
    // SHA256 client certificate fingerprint (without `:` separators)
    CLIENT_CERTIFICATE_FINGERPRINT: process.env.CLIENT_CERTIFICATE_FINGERPRINT,

    ROUTES: {
      PPT_NODO: process.env.PPT_NODO || '/mockEcService',
    },
    NM3_DATA: {
      // dati nuovo modello 3 - multibeneficiario
      CC_POST_PRIMARY_EC: process.env.CC_POST_PRIMARY_EC || 'IT1234567890123456789000000',
      CC_BANK_PRIMARY_EC: process.env.CC_BANK_PRIMARY_EC || 'IT1234567890123456789000001',
      CC_POST_SECONDARY_EC: process.env.CC_POST_SECONDARY_EC || 'IT1234567890123456789000003',
      CC_BANK_SECONDARY_EC: process.env.CC_BANK_SECONDARY_EC || 'IT1234567890123456789000004',
      CC_BANK_THIRD_EC: process.env.CC_BANK_THIRD_EC || 'IT1234567890123456789000005',
      USER_FULL_NAME: process.env.USER_FULL_NAME || 'John Doe',
      USER_EMAL: process.env.USER_EMAL || 'john.doe@test.it',
      USER_CF: process.env.USER_CF || 'JHNDOE00A01F205N',
      TIMETOUT_SEC: process.env.TIMEOUT_DELAY || 130,
    },
  },
};

// Configuration validator - Define configuration types and interfaces
const ServerConfiguration = t.interface({
  HOST: NonEmptyString,
  // We allow t.string to use socket pipe address in Azure App Services
  PORT: t.any,
  TEST_DEBUG: NonEmptyString,
  AUX_DIGIT: NonEmptyString,
});
export type ServerConfiguration = t.TypeOf<typeof ServerConfiguration>;

const NodoMockConfig = t.intersection([
  ServerConfiguration,
  t.interface({
    ROUTES: t.interface({
      PPT_NODO: NonEmptyString,
    }),
    NM3_DATA: t.interface({
      CC_POST_PRIMARY_EC: NonEmptyString,
      CC_BANK_PRIMARY_EC: NonEmptyString,
      CC_POST_SECONDARY_EC: NonEmptyString,
      CC_BANK_SECONDARY_EC: NonEmptyString,
      CC_BANK_THIRD_EC: NonEmptyString,
      USER_FULL_NAME: NonEmptyString,
      USER_EMAL: NonEmptyString,
      USER_CF: NonEmptyString,
      TIMETOUT_SEC: NonEmptyString,
    }),
  }),
  t.partial({
    CLIENT_CERTIFICATE_FINGERPRINT: NonEmptyString,
  }),
]);
export type NodoMockConfig = t.TypeOf<typeof NodoMockConfig>;

export const WinstonLogLevel = t.keyof({
  debug: 4,
  error: 0,
  info: 2,
});
export type WinstonLogLevel = t.TypeOf<typeof WinstonLogLevel>;

export const Configuration = t.interface({
  PA_MOCK: NodoMockConfig,
  WINSTON_LOG_LEVEL: WinstonLogLevel,
});
export type Configuration = t.TypeOf<typeof Configuration>;