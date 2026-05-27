import { ritorno } from "./dispatcher";
import { Configuration } from "../config";
import { paaInviaRTRisposta } from "../fixtures/nodoNewMod3Responses_oldEc";
import { POSITIONS_STATUS } from "../utils/helper";
import { log_event_tx, logger } from "../utils/logger";
import * as xml2js from 'xml2js';

export const handlePaInviaRT = async (
  config: Configuration,
  paInviaRTQueue = new Array<string>(),
  pspnotifypayment: any,
  req: any,
  res: any,
  dbAmounts: Map<string, number>,
  db:  Map<string, POSITIONS_STATUS>,
  noticenumberRequests: Map<string, JSON>,
  noticenumberResponses: Map<string, JSON>,
): Promise<void> => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    if (paInviaRTQueue.length > 0) {
        const customResponse = paInviaRTQueue.shift();
        logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
        if (customResponse !== undefined) {
        const convert = await xml2js.parseStringPromise(customResponse);
        if (convert['soapenv:Envelope']['soapenv:Body']) {
            if (convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaInviaRTRisposta']) {
                if (convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaInviaRTRisposta'][0].paaInviaRTRisposta) {
                    const delay =
                    convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaInviaRTRisposta'][0].paaInviaRTRisposta[0]
                        .delay;
                    const irraggiungibile =
                    convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaInviaRTRisposta'][0].paaInviaRTRisposta[0]
                        .irraggiungibile;
                    if (irraggiungibile) {
                    throw new TypeError('irraggiungibile');
                    }
                    if (delay) {
                    logger.info('>>> start timeout');
                    delete convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaInviaRTRisposta'][0]
                        .paaInviaRTRisposta[0].delay;
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
            } else {
                return ritorno(res, customResponse);
            }
        }
    }
    log_event_tx(paaInviaRTRisposta);
    return res.status(+paaInviaRTRisposta[0]).send(paaInviaRTRisposta[1]);
}