import * as t from 'io-ts';
import {
  amount1,
  amount1bis,
  amount1Over,
  amount1Under,
  amount2,
  amount2bis,
  amount2Over,
  amount2Under,
  avviso1,
  avviso10,
  avviso11,
  avviso12,
  avviso13,
  avviso14,
  avviso15,
  avviso16,
  avviso17,
  avviso19,
  avviso2,
  avviso20,
  avviso21,
  avviso23,
  avviso24,
  avviso25,
  avviso26,
  avviso27,
  avviso28,
  avviso3,
  avviso4,
  avviso5,
  avviso5smart,
  avviso6,
  avviso7,
  avviso8,
  avviso9,
  avvisoOver5000,
  avvisoUnder1,
} from './configuration';

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

export function noticeWith120(noticenumber: string): boolean {
  return (
    avviso1.test(noticenumber) ||
    avviso2.test(noticenumber) ||
    avviso3.test(noticenumber) ||
    avviso4.test(noticenumber) ||
    avviso5.test(noticenumber) ||
    avviso6.test(noticenumber)
  );
}

// eslint-disable-next-line complexity
export function validNotice(noticenumber: string): boolean {
  return (
    avviso1.test(noticenumber) ||
    avviso2.test(noticenumber) ||
    avviso3.test(noticenumber) ||
    avviso4.test(noticenumber) ||
    avviso5.test(noticenumber) ||
    avviso6.test(noticenumber) ||
    avviso7.test(noticenumber) ||
    avviso8.test(noticenumber) ||
    avviso9.test(noticenumber) ||
    avviso10.test(noticenumber) ||
    avviso11.test(noticenumber) ||
    avviso12.test(noticenumber) ||
    avviso13.test(noticenumber) ||
    avviso14.test(noticenumber) ||
    avviso15.test(noticenumber) ||
    avviso16.test(noticenumber) ||
    avviso17.test(noticenumber) ||
    avviso24.test(noticenumber) ||
    avviso25.test(noticenumber) ||
    avviso26.test(noticenumber) ||
    avviso27.test(noticenumber) ||
    avviso28.test(noticenumber) ||
    avvisoOver5000.test(noticenumber) ||
    avvisoUnder1.test(noticenumber)
  );
}

export function amountComplete1(noticenumber: string): boolean {
  return (
    avviso1.test(noticenumber) ||
    avviso2.test(noticenumber) ||
    avviso3.test(noticenumber) ||
    avviso4.test(noticenumber) ||
    avviso15.test(noticenumber) ||
    avviso16.test(noticenumber) ||
    avviso17.test(noticenumber)
  );
}

// eslint-disable-next-line sonarjs/no-identical-functions
export function amountComplete1bis(noticenumber: string): boolean {
  return (
    avviso1.test(noticenumber) ||
    avviso2.test(noticenumber) ||
    avviso3.test(noticenumber) ||
    avviso4.test(noticenumber) ||
    avviso15.test(noticenumber) ||
    avviso16.test(noticenumber) ||
    avviso17.test(noticenumber)
  );
}

// eslint-disable-next-line sonarjs/no-identical-functions
export function getAmount1(noticenumber: string): boolean {
  return avviso5.test(noticenumber) || avviso6.test(noticenumber);
}

// eslint-disable-next-line sonarjs/no-identical-functions
export function getAmount1bis(noticenumber: string): boolean {
  return avviso11.test(noticenumber) || avviso12.test(noticenumber);
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function getAmount(noticenumber: string, dbAmounts: Map<string, number>) {
  const isAmount1 = getAmount1(noticenumber);
  const isAmount1bis = getAmount1bis(noticenumber);
  const isAmountComplete1 = amountComplete1(noticenumber);
  const isAmountComplete1bis = amountComplete1bis(noticenumber);
  const isFixOver = avviso13.test(noticenumber);
  const isUnder1 = avvisoUnder1.test(noticenumber);
  const isOver5000 = avvisoOver5000.test(noticenumber);
  const isFixUnder = avviso14.test(noticenumber);
  const isSmartAmount = avviso5smart.test(noticenumber);
  const customAmount = noticenumber.substring(14, 18); // xx.xx

  
  const amountRes = isAmount1
    ? amount1.toFixed(2)
    : isAmount1bis
    ? amount1bis.toFixed(2)
    : isAmountComplete1
    ? (amount1 + amount2).toFixed(2)
    : isAmountComplete1bis
    ? (amount1bis + amount2bis).toFixed(2)
    : isFixOver
    ? (amount1Over + amount2Over).toFixed(2)
    : isFixUnder
    ? (amount1Under + amount2Under).toFixed(2)
    : isOver5000 || isUnder1
    ? dbAmounts.has(noticenumber)
      ? dbAmounts.get(noticenumber)
      : 0
    : dbAmounts.has(noticenumber)
    ?dbAmounts.get(noticenumber)
    : 0;
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  console.log("amountRes .", amountRes);
  return isSmartAmount ? +customAmount.substring(0, 2) + '.' + customAmount.substring(2, 4) : amountRes;
}

export function getAmountPrimaryRes(noticenumber: string, amountSession1: number) {
  const isFixOver = avviso13.test(noticenumber);
  const isFixUnder = avviso14.test(noticenumber);
  const isOver5000 = avvisoOver5000.test(noticenumber);
  const isUnder1 = avvisoUnder1.test(noticenumber);
  const isNoticeWith120 = noticeWith120(noticenumber);
  const isSmartAmount = avviso5smart.test(noticenumber);
  const customAmount = noticenumber[0].substring(14, 18); // xx.xx

  // eslint-disable-next-line functional/no-let
  const amountPrimaryRes = isFixOver
    ? amount1Over.toFixed(2)
    : isFixUnder
    ? amount1Under.toFixed(2)
    : isOver5000 || isUnder1
    ? amountSession1.toFixed(2)
    : isNoticeWith120
    ? amount1.toFixed(2)
    : amount1bis.toFixed(2);
  return isSmartAmount
    ? // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      +customAmount.substring(0, 2) + '.' + customAmount.substring(2, 4)
    : amountPrimaryRes;
}

export function getAmountSecondaryRes(noticenumber: string, amountSession2: number) {
  const isFixOver = avviso13.test(noticenumber);
  const isFixUnder = avviso14.test(noticenumber);
  const isOver5000 = avvisoOver5000.test(noticenumber);
  const isUnder1 = avvisoUnder1.test(noticenumber);
  const isNoticeWith120 = noticeWith120(noticenumber);

  return isFixOver
    ? amount2Over.toFixed(2)
    : isFixUnder
    ? amount2Under.toFixed(2)
    : isOver5000 || isUnder1
    ? amountSession2.toFixed(2)
    : isNoticeWith120
    ? amount2.toFixed(2)
    : amount2bis.toFixed(2);
}

export function getIbanAvviso(noticenumber: string): number {
  const isOver5000 = avvisoOver5000.test(noticenumber);
  const isUnder1 = avvisoUnder1.test(noticenumber);
  const isFixOver = avviso13.test(noticenumber);
  const isFixUnder = avviso14.test(noticenumber);
  return isOver5000 || isUnder1
    ? 1 // Math.round(getRandomArbitrary(0, 11))
    : isFixOver || isFixUnder
    ? 1 // Fix Over and Under come avviso2
    : +noticenumber.substring(3, 5);
}


export function getTypeIban(noticenumber: string, iban : number): string {
  const noticeRegexListCCpostUno = [avviso1 , avviso2 , avviso5 , avviso7 , avviso8 ,  
                                    avviso11, avviso13,avviso14, avviso15, avviso16, avviso17];  

  const noticeRegexListCCpostDue = [avviso1, avviso3, avviso7, avviso9];

  const noticeRegexListCCpostTre = [avviso20, avviso24];

  

  const noticeRegexListCCbankUno = [avviso3 , avviso4 , avviso6 , avviso9 ,  
                                    avviso10, avviso12, avviso20, avviso24];  

  const noticeRegexListCCbankDue = [avviso2 , avviso4 , avviso8 , avviso10, 
                                     avviso13, avviso14, avviso15, avviso16, 
                                     avviso17, avviso20, avviso24, avviso19, 
                                     avviso21, avviso25, avviso26, avviso28]; 

  const noticeRegexListCCbanKTre = [avviso15 , avviso16 , avviso17 , avviso23 ];  

  const noticeRegexListCCbankQuattro = [avviso16, avviso17];

  const noticeRegexListCCbankCinque = [avviso17];
  if(iban == 1)
  {
      if(noticeRegexListCCpostUno.some(regex => regex.test(noticenumber)))
      {
        return " CCPost";
      } 
      else   if(noticeRegexListCCbankUno.some(regex => regex.test(noticenumber)))
      {
        return " CCBank";
      }; 
      return "";
  }
  else if(iban == 2)
  {
    if(noticeRegexListCCpostDue.some(regex => regex.test(noticenumber)))
    {
      return " CCPost";
    }
    else if(noticeRegexListCCbankDue.some(regex => regex.test(noticenumber)))
    {
      return " CCBank";
    };
    return "";; 
  }
  else if(iban == 3)
  {
    if(noticeRegexListCCpostTre.some(regex => regex.test(noticenumber)))
    {
      return " CCPost";
    }
    else if(noticeRegexListCCbanKTre.some(regex => regex.test(noticenumber)))
    {
      return " CCBank";
    };
    return "";; 
  }
  else if(iban == 4)
  {
    if(noticeRegexListCCbankQuattro.some(regex => regex.test(noticenumber)))
    {
      return " CCBank";
    };
    return "";; 
  }
  else if(iban == 5)
  {
    
    if(noticeRegexListCCbankCinque.some(regex => regex.test(noticenumber)))
    {
      return " CCBank";
    };
    return "";; 
  }
  return "";
}