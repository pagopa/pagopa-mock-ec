import { paErrorVerify, paVerifyPaymentNoticeRes } from "../fixtures/nodoNewMod3Responses";
import { avvisoErrore, avvisoErroreXSD, avvisoScaduto, avvisoTimeout } from "../utils/configuration";
import { PAA_PAGAMENTO_SCADUTO,  PAA_SINTASSI_XSD, POSITIONS_STATUS } from "../utils/helper";

import {
  avviso00,
  avviso01,
  avviso02,
  avviso03,
  avviso04,
  avviso05,
  avviso06,
  avviso07,
  avviso08,
  avviso09,
  avviso10,
  avviso11,
  avviso12,
  avviso13,
  avviso14,
  avviso15,
  avviso16,
  avviso17,
  avviso18,
  avviso19,
  avviso20,
  avviso21,
  avviso22,
  avviso23,
  avviso24,
  avviso25,
  avviso26,
  avviso27,
  avvisoPagamentoDuplicato,
  
} from '../utils/configuration';

import { 
    paVerify00, 
    paVerify01, 
    paVerify02, 
    paVerify03, 
    paVerify04, 
    paVerify05, 
    paVerify06, 
    paVerify07, 
    paVerify08, 
    paVerify09, 
    paVerify10, 
    paVerify11, 
    paVerify12, 
    paVerify13, 
    paVerify14, 
    paVerify15, 
    paVerify16,
    paVerify17,
    paVerify18,
    paVerify19,
    paVerify20,
    paVerify21,
    paVerify22,
    paVerify23,
    paVerify24,
    paVerify25,
    paVerify26,
    paVerifyPagamentoDuplicato, } from '../fixtures/fixVerifyResponse';
import { logger, log_event_tx } from '../utils/logger';
import * as xml2js from 'xml2js';
import { StTransferType_type_pafnEnum } from "../generated/paForNode_Service/stTransferType_type_pafn";
import { Configuration } from "../config";
import { ritorno } from ".";

const faultId = '77777777777';



const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
export const handlePaVerifyPaymentNotice = async (
  config: Configuration,
  paVerifyPaymentNoticeQueue = new Array<string>(),
  paVerifyPaymentNotice: any,
  req: any,
  res: any,
  dbAmounts: Map<string, number>,
  db:  Map<string, POSITIONS_STATUS>,
  noticenumberRequests: Map<string, JSON>,
  noticenumberResponses: Map<string, JSON>,
): Promise<void> => {
  
  const TIMEOUT_SEC = config.PA_MOCK.NM3_DATA.TIMETOUT_SEC;
  const amount1 = 100.0;
  const fiscalcode = paVerifyPaymentNotice.qrcode[0].fiscalcode;

  if (paVerifyPaymentNoticeQueue.length > 0) {
    const customResponse = paVerifyPaymentNoticeQueue.shift();
    logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
    
    if (customResponse !== undefined) {
      const convert = await xml2js.parseStringPromise(customResponse);
      if (convert['soapenv:Envelope']['soapenv:Body']) {
        if (convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paVerifyPaymentNoticeRes']) {
          const delay = convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paVerifyPaymentNoticeRes'][0].delay;
          const irraggiungibile =
            convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paVerifyPaymentNoticeRes'][0].irraggiungibile;
          if (irraggiungibile) {
            throw new TypeError('irraggiungibile');
          }
          if (delay) {
            logger.info('>>> start timeout');
            delete convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paVerifyPaymentNoticeRes'][0].delay;
            const builder = new xml2js.Builder();
            const xml = builder.buildObject(convert);
            const delay_numb: number = +delay[0];
            logger.info(delay_numb);
            await sleep(delay_numb);
            return ritorno(res, xml);
          } else {
            return ritorno(res, customResponse);
          }
        } else {
          return ritorno(res, customResponse);
        }
      } else {
        return ritorno(res, customResponse);
      }
    }
  }

 
  const noticenumber = paVerifyPaymentNotice.qrcode[0].noticenumber;

  console.log("NOTICE NUMBER : ", noticenumber);

  const avvisoMappings: Array<[RegExp, any]> = [
           [avviso00, paVerify00],
           [avviso01, paVerify01],
           [avviso02, paVerify02],
           [avviso03, paVerify03],
           [avviso04, paVerify04],
           [avviso05, paVerify05],
           [avviso06, paVerify06],
           [avviso07, paVerify07],
           [avviso08, paVerify08],
           [avviso09, paVerify09],
           [avviso10, paVerify10],
           [avviso11, paVerify11],
           [avviso12, paVerify12],
           [avviso13, paVerify13],
           [avviso14, paVerify14],
           [avviso15, paVerify15],
           [avviso16, paVerify16],
           [avviso17, paVerify17],
           [avviso18, paVerify18],
           [avviso19, paVerify19],
           [avviso20, paVerify20],
           [avviso21, paVerify21],
           [avviso22, paVerify22],
           [avviso23, paVerify23],
           [avviso24, paVerify24],
           [avviso25, paVerify25],
           [avviso26, paVerify26],
           [avviso27, paVerify24], // same as avviso23
           [avvisoPagamentoDuplicato, paVerifyPagamentoDuplicato],
         ];

  const match = avvisoMappings.find(([pattern]) => pattern.test(noticenumber));

  if (match) {
    const amountRes = match![1].options.amount     
    dbAmounts.set(noticenumber, +amountRes);
    return res.status(200).send(match[1].xml);           
  }  

  //ERRROS
  const isExpiredNotice = avvisoScaduto.test(noticenumber);
  const isFixedError = avvisoErrore.test(noticenumber);
  const isTimeout = avvisoTimeout.test(noticenumber);
  const isErrorXsd = avvisoErroreXSD.test(noticenumber);

  if (isErrorXsd) {
    const paVerifyPaymentNoticeResponse = paVerifyPaymentNoticeRes({
                fault: {
                  description: 'sintassi XSD errata',
                  faultCode: PAA_SINTASSI_XSD.value,
                  faultString: 'messaggio xml non corretto',
                  id: faultId,
                },
                outcome: 'KO',
              });
    
              log_event_tx(paVerifyPaymentNoticeResponse);
              return res.status(paVerifyPaymentNoticeResponse[0]).send(paVerifyPaymentNoticeResponse[1]);
  }

  if (isFixedError) {
    const paErrorVerifyResponse = paErrorVerify({ typeR: 'paVerifyPaymentNoticeRes' });
    log_event_tx(paErrorVerifyResponse);
    return res.status(paErrorVerifyResponse[0]).send(paErrorVerifyResponse[1]);
  }

  if (isExpiredNotice) {
    // error case PAA_PAGAMENTO_SCADUTO
    const paVerifyPaymentNoticeResponse = paVerifyPaymentNoticeRes({
      outcome: 'KO',
      fault: {
        description: `il numero avviso ${noticenumber} e' scaduto`,
        faultCode: PAA_PAGAMENTO_SCADUTO.value,
        faultString: 'Pagamento in attesa risulta scaduto all’Ente Creditore',
        id: faultId,
      },
    });

    log_event_tx(paVerifyPaymentNoticeResponse);
    return res.status(paVerifyPaymentNoticeResponse[0]).send(paVerifyPaymentNoticeResponse[1]);
  } 

  if (isTimeout) {   
    setTimeout(function() {
      // happy case DELAY - paVerifyPaymentNoticeRes
      const paVerifyPaymentNoticeResponse = paVerifyPaymentNoticeRes({
        outcome: 'OK',
        fiscalCodePA: fiscalcode,
        transferType: StTransferType_type_pafnEnum.POSTAL,
        amount: amount1.toFixed(2),
      });

      log_event_tx(paVerifyPaymentNoticeResponse);
      return res.status(paVerifyPaymentNoticeResponse[0]).send(paVerifyPaymentNoticeResponse[1]);
    }, +TIMEOUT_SEC);
  }  
};