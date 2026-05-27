// utils/noticeValidator.ts
import {
  avviso00, avviso01, avviso02, avviso03, avviso04, avviso05,
  avviso06, avviso07, avviso08, avviso09, avviso10, avviso11,
  avviso12, avviso13, avviso14, avviso15, avviso16, avviso17,
  avviso18, avviso19, avviso20, avviso21, avviso22, avviso23,
  avviso24, avviso25, avviso26, avviso27,
} from './configuration';

const validAvvisi: RegExp[] = [
  avviso00, avviso01, avviso02, avviso03, avviso04, avviso05,
  avviso06, avviso07, avviso08, avviso09, avviso10, avviso11,
  avviso12, avviso13, avviso14, avviso15, avviso16, avviso17,
  avviso18, avviso19, avviso20, avviso21, avviso22, avviso23,
  avviso24, avviso25, avviso26, avviso27,
];

export const isValidNotice = (noticenumber: string): boolean =>
  validAvvisi.some(pattern => pattern.test(noticenumber));