import { Configuration } from "../config";
import { pspNotifyPaymentRes } from "../fixtures/nodoNewMod3Responses";
import { POSITIONS_STATUS } from "../utils/helper";
import { log_event_tx, logger } from "../utils/logger";
import * as xml2js from 'xml2js';

export const handlePspNotifyPayment = async (
  config: Configuration,
  pspNotifyPaymentQueue = new Array<string>(),
  pspnotifypayment: any,
  req: any,
  res: any,
  dbAmounts: Map<string, number>,
  db:  Map<string, POSITIONS_STATUS>,
  noticenumberRequests: Map<string, JSON>,
  noticenumberResponses: Map<string, JSON>,
): Promise<void> => {
    const testDebug = config.PA_MOCK.TEST_DEBUG;
    if (pspNotifyPaymentQueue.length > 0) {
        const customResponse = pspNotifyPaymentQueue.shift();
        logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
        return res
        .status(customResponse && customResponse.includes('PAA_ERRORE_MOCK') ? 500 : 200)
        .send(customResponse);
    }
    
    const auxdigit = config.PA_MOCK.AUX_DIGIT;
    const noticenumber: string = `${auxdigit}${pspnotifypayment.creditorreferenceid}`;

    if (testDebug.toUpperCase() === 'Y') {
         noticenumberRequests.set(`${noticenumber}_pspNotifyPayment`, req.body);
    }

    if (testDebug.toUpperCase() === 'Y') {
        xml2js.parseString(pspNotifyPaymentRes[1], (err, result) => {
        if (err) {
            throw err;
        }
        noticenumberResponses.set(`${noticenumber}_pspNotifyPayment`, result);
        });
    }
    log_event_tx(pspNotifyPaymentRes);
    return res.status(+pspNotifyPaymentRes[0]).send(pspNotifyPaymentRes[1]);
}