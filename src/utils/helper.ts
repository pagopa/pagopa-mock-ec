import * as t from 'io-ts';
export const PAA_PAGAMENTO_SCONOSCIUTO = t.literal('PAA_PAGAMENTO_SCONOSCIUTO');
export type PAA_PAGAMENTO_SCONOSCIUTO = t.TypeOf<typeof PAA_PAGAMENTO_SCONOSCIUTO>;

export const PAA_PAGAMENTO_SCADUTO = t.literal('PAA_PAGAMENTO_SCADUTO');
export type PAA_PAGAMENTO_SCADUTO = t.TypeOf<typeof PAA_PAGAMENTO_SCADUTO>;

export const PAA_PAGAMENTO_IN_CORSO = t.literal('PAA_PAGAMENTO_IN_CORSO');
export type PAA_PAGAMENTO_IN_CORSO = t.TypeOf<typeof PAA_PAGAMENTO_IN_CORSO>;

export const PAA_PAGAMENTO_DUPLICATO = t.literal('PAA_PAGAMENTO_DUPLICATO');
export type PAA_PAGAMENTO_DUPLICATO = t.TypeOf<typeof PAA_PAGAMENTO_DUPLICATO>;

export const PAA_SINTASSI_XSD = t.literal('PAA_SINTASSI_XSD');
export type PAA_SINTASSI_XSD = t.TypeOf<typeof PAA_SINTASSI_XSD>;

export enum POSITIONS_STATUS {
  OPEN = 1,
  IN_PROGRESS,
  CLOSE,
}

export function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
