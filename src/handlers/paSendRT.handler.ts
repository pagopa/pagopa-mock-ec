import { ritorno } from ".";
import { Configuration } from "../config";
import { POSITIONS_STATUS } from "../utils/helper";
import { logger } from "../utils/logger";
import { paSendRTHandler } from "./handlers";
import * as xml2js from 'xml2js';

export const handlePaSendRT = async (
  config: Configuration,
  paSendRTQueue = new Array<string>(),
  sentReceiptReq: any,
  req: any,
  res: any,
  dbAmounts: Map<string, number>,
  db:  Map<string, POSITIONS_STATUS>,
  noticenumberRequests: Map<string, JSON>,
  noticenumberResponses: Map<string, JSON>,
): Promise<void> => {

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    const testDebug = config.PA_MOCK.TEST_DEBUG;

    if (paSendRTQueue.length > 0) {
        const customResponse = paSendRTQueue.shift();
        logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
        if (customResponse !== undefined) {
            const convert = await xml2js.parseStringPromise(customResponse);
            if (convert['soapenv:Envelope']['soapenv:Body']) {
                if (convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paSendRTRes']) {
                const delay = convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paSendRTRes'][0].delay;
                const irraggiungibile =
                    convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paSendRTRes'][0].irraggiungibile;
                if (irraggiungibile) {
                    throw new TypeError('irraggiungibile');
                }
                if (delay) {
                    logger.info('>>> start timeout');
                    delete convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paSendRTRes'][0].delay;
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
           
    const auxdigit = config.PA_MOCK.AUX_DIGIT;

    const noticenumber: string = `${auxdigit}${sentReceiptReq.receipt[0].creditorreferenceid}`;

    if (testDebug.toUpperCase() === 'Y') {
        noticenumberRequests.set(`${noticenumber}_paSendRT`, req.body);
    }
    console.log("sentReceiptReq >>>>>>>>>", sentReceiptReq);
    const paSendRTResponse = paSendRTHandler(sentReceiptReq, db);

    if (testDebug.toUpperCase() === 'Y') {
        xml2js.parseString(paSendRTResponse[1], (err, result) => {
        if (err) {
            throw err;
        }
        noticenumberResponses.set(`${noticenumber}_paSendRT`, result);
        });
    }
    return res.status(paSendRTResponse[0]).send(paSendRTResponse[1]);
}