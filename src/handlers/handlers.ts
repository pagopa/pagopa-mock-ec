import { MockResponse, paSendRtRes } from '../fixtures/nodoNewMod3Responses';
import { POSITIONS_STATUS } from '../utils/helper';
import { log_event_tx } from '../utils/logger';

const sentReceipt = 'pafn:pasendrtreq';

export function paSendRTHandler(soapRequest: any, db: Map<string, POSITIONS_STATUS>): MockResponse {
  const paSendRT = soapRequest[sentReceipt][0];
  const iuv = paSendRT.receipt[0].creditorreferenceid[0];

  // // libero la posizione - cancello
  // db.delete(iuv);
  // esiste - la CHIUDO
  db.set(iuv, POSITIONS_STATUS.CLOSE);

  const paSendRTResponse = paSendRtRes({
    outcome: 'OK',
  });

  log_event_tx(paSendRTResponse);
  return paSendRTResponse;
}
