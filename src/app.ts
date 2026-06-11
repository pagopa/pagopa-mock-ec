/* eslint-disable sonarjs/cognitive-complexity */
import * as express from 'express';
import * as bodyParserXml from 'express-xml-bodyparser';
import * as morgan from 'morgan';

import bodyParser = require('body-parser');


import { Configuration } from './config';

// @ts-ignore
import { StTransferType_type_pafnEnum } from './generated/paForNode_Service/stTransferType_type_pafn';
import { requireClientCertificateFingerprint } from './middlewares/requireClientCertificateFingerprint';
import {
  POSITIONS_STATUS,
} from './utils/helper';

import { dispatchSoapRequest } from './handlers/dispatcher';
import { logger } from './utils/logger';

const paVerifyPaymentNoticeQueue = new Array<string>();
const paGetPaymentQueue = new Array<string>();
const paSendRTQueue = new Array<string>();
const pspNotifyPaymentQueue = new Array<string>();
const paaVerificaRPTQueue = new Array<string>();
const paaAttivaRPTQueue = new Array<string>();
const paaInviaRTQueue = new Array<string>();
const paDemandPaymentNoticeQueue = new Array<string>();
const paaChiediNumeroAvvisoQueue = new Array<string>();
const paGetPaymentV2Queue = new Array<string>();
const paSendRTV2Queue = new Array<string>();

// tslint:disable-next-line: no-big-function
export async function newExpressApp(
  config: Configuration,
  db: Map<string, POSITIONS_STATUS>,
  dbAmounts: Map<string, number>,
  noticenumberRequests: Map<string, JSON>,
  noticenumberResponses: Map<string, JSON>,
): Promise<Express.Application> {
  // config params...
 
  


  const testDebug = config.PA_MOCK.TEST_DEBUG;

  // app
  const app = express();
  app.set('port', config.PA_MOCK.PORT);
  const loggerFormat = ':date[iso] [info]: :method :url :status - :response-time ms';
  app.use(morgan(loggerFormat));

  const clientCertificateFingerprint = config.PA_MOCK.CLIENT_CERTIFICATE_FINGERPRINT;
  // Verify client certificate fingerprint if required
  if (clientCertificateFingerprint !== undefined) {
    app.use(requireClientCertificateFingerprint(clientCertificateFingerprint));
  }



  /* tslint:disable:immutable-data */
  app.use(bodyParser.json({ verify: (req, res, buf) => (req.rawBody = buf) }));

  app.use(express.json());
  app.use(express.urlencoded());
  app.use(bodyParserXml({}));

  logger.info(`Path ${config.PA_MOCK.ROUTES.PPT_NODO} ...`);

  // health check
  app.get(`${config.PA_MOCK.ROUTES.PPT_NODO}/info`, async (_, res) => res.status(200).send({ status: 'iamalive' }));

  // return history of requests and responses
  app.get(`${config.PA_MOCK.ROUTES.PPT_NODO}/history/:noticenumber/:primitive`, async (req, res) => {
    const savedReq = noticenumberRequests.get(`${req.params.noticenumber}_${req.params.primitive}`);
    const savedRes = noticenumberResponses.get(`${req.params.noticenumber}_${req.params.primitive}`);

    if (testDebug.toUpperCase() === 'Y' && savedReq !== undefined && savedRes !== undefined) {
      res.status(200).send({
        request: savedReq,
        response: savedRes,
      });
    } else {
      res.status(500).send({ details: 'History not enabled' });
    }
  });

  // save custom response
  // eslint-disable-next-line complexity
  app.post(`${config.PA_MOCK.ROUTES.PPT_NODO}/response/:primitive`, async (req, res) => {
    if (req.params.primitive === 'paVerifyPaymentNotice') {
      if (String(req.query.override).toLowerCase() === 'true') {
        paVerifyPaymentNoticeQueue.pop();
        paVerifyPaymentNoticeQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} updated`);
      } else {
        paVerifyPaymentNoticeQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} saved. ${paVerifyPaymentNoticeQueue.length} pushed`);
      }
    } else if (req.params.primitive === 'paGetPayment') {
      if (String(req.query.override).toLowerCase() === 'true') {
        paGetPaymentQueue.pop();
        paGetPaymentQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} updated`);
      } else {
        paGetPaymentQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} saved. ${paGetPaymentQueue.length} pushed`);
      }
    } else if (req.params.primitive === 'paSendRT') {
      if (String(req.query.override).toLowerCase() === 'true') {
        paSendRTQueue.pop();
        paSendRTQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} updated`);
      } else {
        paSendRTQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} saved. ${paSendRTQueue.length} pushed`);
      }
    } else if (req.params.primitive === 'paaVerificaRPT') {
      if (String(req.query.override).toLowerCase() === 'true') {
        paaVerificaRPTQueue.pop();
        paaVerificaRPTQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} updated`);
      } else {
        paaVerificaRPTQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} saved. ${paaVerificaRPTQueue.length} pushed`);
      }
    } else if (req.params.primitive === 'pspNotifyPayment') {
      if (String(req.query.override).toLowerCase() === 'true') {
        pspNotifyPaymentQueue.pop();
        pspNotifyPaymentQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} updated`);
      } else {
        pspNotifyPaymentQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} saved. ${pspNotifyPaymentQueue.length} pushed`);
      }
    } else if (req.params.primitive === 'paaAttivaRPT') {
      if (String(req.query.override).toLowerCase() === 'true') {
        paaAttivaRPTQueue.pop();
        paaAttivaRPTQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} updated`);
      } else {
        paaAttivaRPTQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} saved. ${paaAttivaRPTQueue.length} pushed`);
      }
    } else if (req.params.primitive === 'paaInviaRT') {
      if (String(req.query.override).toLowerCase() === 'true') {
        paaInviaRTQueue.pop();
        paaInviaRTQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} updated`);
      } else {
        paaInviaRTQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} saved. ${paaInviaRTQueue.length} pushed`);
      }
    } else if (req.params.primitive === 'paDemandPaymentNotice') {
      if (String(req.query.override).toLowerCase() === 'true') {
        paDemandPaymentNoticeQueue.pop();
        paDemandPaymentNoticeQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} updated`);
      } else {
        paDemandPaymentNoticeQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} saved. ${paDemandPaymentNoticeQueue.length} pushed`);
      }
    } else if (req.params.primitive === 'paaChiediNumeroAvviso') {
      if (String(req.query.override).toLowerCase() === 'true') {
        paaChiediNumeroAvvisoQueue.pop();
        paaChiediNumeroAvvisoQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} updated`);
      } else {
        paaChiediNumeroAvvisoQueue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} saved. ${paaChiediNumeroAvvisoQueue.length} pushed`);
      }
    } else if (req.params.primitive === 'paGetPaymentV2') {
      if (String(req.query.override).toLowerCase() === 'true') {
        paGetPaymentV2Queue.pop();
        paGetPaymentV2Queue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} updated`);
      } else {
        paGetPaymentV2Queue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} saved. ${paGetPaymentV2Queue.length} pushed`);
      }
    } else if (req.params.primitive === 'paSendRTV2') {
      if (String(req.query.override).toLowerCase() === 'true') {
        paSendRTV2Queue.pop();
        paSendRTV2Queue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} updated`);
      } else {
        paSendRTV2Queue.push(req.rawBody);
        res.status(200).send(`${req.params.primitive} saved. ${paSendRTV2Queue.length} pushed`);
      }
    } else {
      res.status(400).send(`unknown ${req.params.primitive} error on saved.`);
    }
  });

 

  // SOAP Server mock entrypoint
  // eslint-disable-next-line complexity
  // eslint-disable-next-line sonarjs/cognitive-complexity, complexity
  app.post(config.PA_MOCK.ROUTES.PPT_NODO, async (req : any, res : any) => {
    logger.info(`>>> rx REQUEST :`);
    logger.info(JSON.stringify(req.body));
    try {

      const envelope = req.body['soapenv:Envelope'] ||  req.body['soapenv:envelope'];

      const body = envelope?.['soapenv:Body'] ||  envelope?.['soapenv:body'];

      const soapRequest = Array.isArray(body) ? body[0] : body;

      logger.info("soapRequest  =",soapRequest);
     
      //  1. paVerifyPaymentNotice     
      //  2. paGetPayment
      //  3. paSendRT
      //  4. pspNotifyPayment
      //  5. paaVerificaRPT
      //  6. paaAttivaRPT
      //  7. paaInviaRT
      //  8. paDemandPaymentNotice
      //  9. paaChiediNumeroAvviso
      // 10. paGetPaymentV2
      // 11. paSendRTV2
      await dispatchSoapRequest(config, soapRequest, req, res, dbAmounts, db, noticenumberRequests, noticenumberResponses);

      // tslint:disable-next-line: prettier
    } catch (error) {
      // The SOAP Request isnt' correct
      logger.error(`The SOAP Request isnt' correct`, error);
      res.status(500).send('Internal Server Error :( ');
    }
    // tslint:disable-next-line: no-empty
  });
  return app;
}
