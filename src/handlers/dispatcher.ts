import { Configuration } from '../config';
import { POSITIONS_STATUS } from '../utils/helper';
import { handleVerificaRPT } from './paVerificaRPT.handler';
import { handlePaGetPayment } from './paGetPayment.handler';
import { handlePaGetPaymentV2 } from './paGetPaymentV2.handler';
import { handlePaSendRT } from './paSendRT.handler';
import { handlePaVerifyPaymentNotice } from './paVerifyPaymentNotice.handler';
import { handlePspNotifyPayment } from './pspNotifyPayment.handler';
import { handlePaAttivaRPT } from './paAttivaRPT.handler';
import { handlePaInviaRT } from './paInviaRT.handler';
import { handlePaDemandPaymentNotice } from './paDemandPaymentNotice.handler';
import { handlePaChiediNumeroAvviso } from './paChiediNumeroAvviso.handler';
import { handlePaSendRTV2 } from './paSendRTV2.handler';
import { logger } from '../utils/logger';

const verifySoapRequest = 'pafn:paverifypaymentnoticereq';
const activateSoapRequest = 'pafn:pagetpaymentreq';
const sentReceipt = 'pafn:pasendrtreq';
const pspnotifypaymentreq = 'pspfn:pspnotifypaymentreq';
const paVerificaRPTreq = 'ppt:paaverificarpt';
const paAttivaRPTreq = 'ppt:paaattivarpt';
const paInviaRTreq = 'ppt:paainviart';
const paDemandPaymentNoticereq = 'pafn:pademandpaymentnoticerequest';
const paaChiediNumeroAvvisoreq = 'ppt:paachiedinumeroavviso';
const paGetPaymentV2req = 'pafn:pagetpaymentv2request';
const paSendRTV2req = 'pafn:pasendrtv2request';

const paVerifyPaymentNoticeQueue = new Array<string>();
const paGetPaymentQueue = new Array<string>();
const paSendRTQueue = new Array<string>();
const pspNotifyPaymentQueue = new Array<string>();
const paaVerificaRPTQueue = new Array<string>();
const paAttivaRPTQueue = new Array<string>();
const paInviaRTQueue = new Array<string>();
const paDemandPaymentNoticeQueue = new Array<string>();
const paChiediNumeroAvvisoQueue = new Array<string>();
const paGetPaymentV2Queue = new Array<string>();
const paSendRTV2Queue = new Array<string>();

const queueMap: Record<string, Array<string>> = {
  paVerifyPaymentNotice: paVerifyPaymentNoticeQueue,
  paGetPayment:          paGetPaymentQueue,
  paSendRT:              paSendRTQueue,
  pspNotifyPayment:      pspNotifyPaymentQueue,
  paaVerificaRPT:        paaVerificaRPTQueue,
  paaAttivaRPT:          paAttivaRPTQueue,
  paaInviaRT:            paInviaRTQueue,
  paDemandPaymentNotice: paDemandPaymentNoticeQueue,
  paaChiediNumeroAvviso: paChiediNumeroAvvisoQueue,
  paGetPaymentV2:        paGetPaymentV2Queue,
  paSendRTV2:            paSendRTV2Queue,
};

export function pushToQueue(primitive: string, body: string, override: boolean): string {
  const queue = queueMap[primitive];
  if (!queue) return `unknown ${primitive}`;

  if (override) {
    queue.pop();
    queue.push(body);
    return `${primitive} updated`;
  } else {
    queue.push(body);
    return `${primitive} saved. ${queue.length} pushed`;
  }
}


export const dispatchSoapRequest = async (
  config: Configuration,
  soapRequest: any,
  req: any,
  res: any,
  dbAmounts: Map<string, number>,
  db:  Map<string, POSITIONS_STATUS>,
  noticenumberRequests: Map<string, JSON>,
  noticenumberResponses: Map<string, JSON>,
): Promise<void> => {  
    console.log("CALL  dispatchSoapRequest");  
    if (
        !(
          soapRequest[sentReceipt] ||
          soapRequest[activateSoapRequest] ||
          soapRequest[verifySoapRequest] ||
          soapRequest[paVerificaRPTreq] ||
          soapRequest[paAttivaRPTreq] ||
          soapRequest[paInviaRTreq] ||
          soapRequest[paDemandPaymentNoticereq] ||
          soapRequest[paaChiediNumeroAvvisoreq] ||
          soapRequest[paGetPaymentV2req] ||
          soapRequest[paSendRTV2req]
        )
      ) {
        // The SOAP Request not implemented
        logger.info(`The SOAP Request ${JSON.stringify(soapRequest)} not implemented`);
        res.status(404).send('Not found');
    }


    // 1. paVerifyPaymentNotice    
    if (soapRequest[verifySoapRequest]) {
        const paVerifyPaymentNotice = soapRequest[verifySoapRequest][0];
        return handlePaVerifyPaymentNotice(config, paVerifyPaymentNoticeQueue, paVerifyPaymentNotice, req, res,dbAmounts, db, noticenumberRequests, noticenumberResponses);
    }
    // 2. paGetPayment
    if (soapRequest[activateSoapRequest]) {
        const paGetPayment = soapRequest[activateSoapRequest][0];
        return handlePaGetPayment(config, paGetPaymentQueue, paGetPayment, req, res,dbAmounts, db,noticenumberRequests, noticenumberResponses);
    }
    // 3. paSendRT   
    if (soapRequest[sentReceipt]) {
        const sentReceiptReq = soapRequest[sentReceipt][0];
        return handlePaSendRT(config, paSendRTQueue, sentReceiptReq, req, res,dbAmounts, db,noticenumberRequests, noticenumberResponses);
    }
    // 4. pspNotifyPayment
    if (soapRequest[pspnotifypaymentreq]) {
        const pspnotifypayment = soapRequest[pspnotifypaymentreq][0];
        return handlePspNotifyPayment(config, pspNotifyPaymentQueue, pspnotifypayment, req, res,dbAmounts, db,noticenumberRequests, noticenumberResponses);
    }
    // 5. paVerificaRPT
    if (soapRequest[paVerificaRPTreq]) {
        return handleVerificaRPT(config, paaVerificaRPTQueue, null, req, res,dbAmounts, db,noticenumberRequests, noticenumberResponses);
    }
    // 6. paAttivaRPT
    if (soapRequest[paAttivaRPTreq]) {
         return handlePaAttivaRPT(config, paAttivaRPTQueue, null, req, res,dbAmounts, db,noticenumberRequests, noticenumberResponses);
    }
    // 7. paInviaRT
    if (soapRequest[paInviaRTreq]) {
         return handlePaInviaRT(config, paInviaRTQueue, null, req, res,dbAmounts, db, noticenumberRequests, noticenumberResponses);
    }
    // 8. paDemandPaymentNotice
    if (soapRequest[paDemandPaymentNoticereq]) {
        return handlePaDemandPaymentNotice(config, paDemandPaymentNoticeQueue, null, req, res,dbAmounts, db, noticenumberRequests, noticenumberResponses);
    }
    // 9. paaChiediNumeroAvviso
    if (soapRequest[paaChiediNumeroAvvisoreq]) {
        return handlePaChiediNumeroAvviso(config, paChiediNumeroAvvisoQueue, null, req, res,dbAmounts, db, noticenumberRequests, noticenumberResponses);
    }
    // 10. paGetPaymentV2
    if (soapRequest[paGetPaymentV2req]) {
        console.log("dispatchSoapRequest - paGetPaymentV2req");
        const paGetPayment = soapRequest[paGetPaymentV2req][0];
        return handlePaGetPaymentV2(config, paGetPaymentV2Queue, paGetPayment, req, res,dbAmounts, db, noticenumberRequests, noticenumberResponses);
    }  
    // 11. paSendRTV2
    if (soapRequest[paSendRTV2req]) {
        return handlePaSendRTV2(config, paSendRTV2Queue, null, req, res,dbAmounts, db, noticenumberRequests, noticenumberResponses);
    }
    res.status(400).send('Unknown SOAP request');
};

export function ritorno(res: any, customResponse: string | undefined) {
    return res
      .status(customResponse && customResponse.trim() === '<response>error</response>' ? 500 : 200)
      .send(customResponse);
  }

  export function clearQueue(primitive?: string): string {
  if (primitive) {
    const queue = queueMap[primitive];
    if (!queue) return `unknown ${primitive}`;
    queue.length = 0;
    return `${primitive} queue cleared`;
  } else {
    // svuota tutte
    Object.values(queueMap).forEach(q => q.length = 0);
    return 'all queues cleared';
  }
}