import { Configuration } from "../config";
import { POSITIONS_STATUS } from "../utils/helper";
import { log_event_tx, logger } from "../utils/logger";
import * as xml2js from 'xml2js';
import escapeHtml = require('escape-html');
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
  avvisoPagamentoDuplicato  
} from '../utils/configuration';

import {
  ActivateEntry,
  paActivate00V2,
  paActivate01V2,
  paActivate02V2,
  paActivate03V2,
  paActivate04V2,
  paActivate05V2,
  paActivate06V2,
  paActivate07V2,
  paActivate08V2,
  paActivate09V2,
  paActivate10V2,
  paActivate11V2,
  paActivate12V2,
  paActivate13V2,
  paActivate14V2,
  paActivate15V2,
  paActivate16V2,
  paActivate17V2,
  paActivate18V2,
  paActivate19V2,
  paActivate20V2,
  paActivate21V2,
  paActivate22V2,
  paActivate23V2,
  paActivate24V2,
  paActivate25V2,
  paActivate26V2,
  paActivate27,
  paActivatePagamentoDuplicatoV2,
} from '../fixtures/fixActivateV2Response';

import { ritorno } from "./dispatcher";
import { IECConfig } from "../fixtures/fixActivateResponse";

export const handlePaGetPaymentV2 = async (
  config: Configuration,
  paGetPaymentV2Queue = new Array<string>(),
  paGetPaymentV2Request: any,
  req: any,
  res: any,
  dbAmounts: Map<string, number>,
  db:  Map<string, POSITIONS_STATUS>,
  noticenumberRequests: Map<string, JSON>,
  noticenumberResponses: Map<string, JSON>,
): Promise<void> => {

    const ec: IECConfig = {
        email : config.PA_MOCK.NM3_DATA.USER_EMAL,
        fullName : config.PA_MOCK.NM3_DATA.USER_FULL_NAME,
        CF : config.PA_MOCK.NM3_DATA.USER_CF,
        CCPostPrimaryEC:   config.PA_MOCK.NM3_DATA.CC_POST_PRIMARY_EC,
        CCBankPrimaryEC:   config.PA_MOCK.NM3_DATA.CC_BANK_PRIMARY_EC,
        CCPostSecondaryEC: config.PA_MOCK.NM3_DATA.CC_POST_SECONDARY_EC,
        CCBankSecondaryEC: config.PA_MOCK.NM3_DATA.CC_BANK_SECONDARY_EC,
        CCBankThirdEC:     config.PA_MOCK.NM3_DATA.CC_BANK_THIRD_EC,
    };
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    if (paGetPaymentV2Queue.length > 0) {
          const customResponse = paGetPaymentV2Queue.shift();
          logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
          if (customResponse !== undefined) {
            const convert = await xml2js.parseStringPromise(customResponse);
            if (convert['soapenv:Envelope']['soapenv:Body']) {
              if (convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paGetPaymentV2Response']) {
                const delay = convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paGetPaymentV2Response'][0].delay;
                const irraggiungibile =
                  convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paGetPaymentV2Response'][0].irraggiungibile;
                if (irraggiungibile) {
                  throw new TypeError('irraggiungibile');
                }
                if (delay) {
                  logger.info('>>> start timeout');
                  delete convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paGetPaymentV2Response'][0].delay;
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
    console.log("paGetPaymentV2Request -> ",paGetPaymentV2Request.qrcode[0]);
       
    const noticenumber: string = paGetPaymentV2Request.qrcode[0].noticenumber;
    console.log("NOTICE NUMBER :", noticenumber);
    const creditorReferenceId = noticenumber[0].substring(1);
    const avvisoMappings: ActivateEntry[] = [
        { pattern: avviso00, label: "00", handler: () => paActivate00V2({ creditorReferenceId, ec }) },
        { pattern: avviso01, label: "01", handler: () => paActivate01V2({ creditorReferenceId, ec }) },
        { pattern: avviso02, label: "02", handler: () => paActivate02V2({ creditorReferenceId, ec }) },
        { pattern: avviso03, label: "03", handler: () => paActivate03V2({ creditorReferenceId, ec }) },
        { pattern: avviso04, label: "04", handler: () => paActivate04V2({ creditorReferenceId, ec }) },
        { pattern: avviso05, label: "05", handler: () => paActivate05V2({ creditorReferenceId, ec }) },
        { pattern: avviso06, label: "06", handler: () => paActivate06V2({ creditorReferenceId, ec }) },
        { pattern: avviso07, label: "07", handler: () => paActivate07V2({ creditorReferenceId, ec }) },
        { pattern: avviso08, label: "08", handler: () => paActivate08V2({ creditorReferenceId, ec }) },
        { pattern: avviso09, label: "09", handler: () => paActivate09V2({ creditorReferenceId, ec }) },
        { pattern: avviso10, label: "10", handler: () => paActivate10V2({ creditorReferenceId, ec }) },
        { pattern: avviso11, label: "11", handler: () => paActivate11V2({ creditorReferenceId, ec }) },
        { pattern: avviso12, label: "12", handler: () => paActivate12V2({ creditorReferenceId, ec }) },
        { pattern: avviso13, label: "13", handler: () => paActivate13V2({ creditorReferenceId, ec }) },
        { pattern: avviso14, label: "14", handler: () => paActivate14V2({ creditorReferenceId, ec }) },
        { pattern: avviso15, label: "15", handler: () => paActivate15V2({ creditorReferenceId, ec }) },
        { pattern: avviso16, label: "16", handler: () => paActivate16V2({ creditorReferenceId, ec }) },
        { pattern: avviso17, label: "17", handler: () => paActivate17V2({ creditorReferenceId, ec }) },
        { pattern: avviso18, label: "18", handler: () => paActivate18V2({ creditorReferenceId, ec }) },
        { pattern: avviso19, label: "19", handler: () => paActivate19V2({ creditorReferenceId, ec }) },
        { pattern: avviso20, label: "20", handler: () => paActivate20V2({ creditorReferenceId, ec }) },
        { pattern: avviso21, label: "21", handler: () => paActivate21V2({ creditorReferenceId, ec }) },
        { pattern: avviso22, label: "22", handler: () => paActivate22V2({ creditorReferenceId, ec }) },
        { pattern: avviso23, label: "23", handler: () => paActivate23V2({ creditorReferenceId, ec }) },
        { pattern: avviso24, label: "24", handler: () => paActivate24V2({ creditorReferenceId, ec }) },
        { pattern: avviso25, label: "25", handler: () => paActivate25V2({ creditorReferenceId, ec }), escape: true },
        { pattern: avviso26, label: "26", handler: () => paActivate26V2({ creditorReferenceId, ec }) },
        { pattern: avviso27, label: "27", handler: () => paActivate27({ creditorReferenceId, ec }), xml: true },
        { pattern: avvisoPagamentoDuplicato, label: "Duplicato", handler: () => paActivatePagamentoDuplicatoV2({ creditorReferenceId, ec }) },
    ];

    const match = avvisoMappings.find(({ pattern }) => pattern.test(noticenumber));
    if (match) {
        console.log(`AVVISO ${match.label}`);
        const result = match.handler();
        if (match.xml) res.type("text/xml");
        const body = match.escape ? escapeHtml(result[1]) : result[1];
        return res.status(result[0]).send(body);
    }

    log_event_tx(paGetPaymentV2Request);
    return res.status(+paGetPaymentV2Request[0]).send(paGetPaymentV2Request[1]);
}