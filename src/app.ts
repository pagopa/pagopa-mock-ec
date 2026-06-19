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

import { clearQueue, dispatchSoapRequest, pushToQueue } from './handlers/dispatcher';
import { logger } from './utils/logger';

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

  // Svuota una coda specifica o tutte
  app.delete(`${config.PA_MOCK.ROUTES.PPT_NODO}/response/:primitive?`, async (req, res) => {
    const result = clearQueue(req.params.primitive);
    res.status(200).send(result);
  });

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

  
  app.post(`${config.PA_MOCK.ROUTES.PPT_NODO}/response/:primitive`, async (req, res) => {
    
    const primitive = String(req.params.primitive);
    const allowedPrimitives = new Set([
      'paVerifyPaymentNotice',
      'paGetPayment',
      'paSendRT',
      'pspNotifyPayment',
      'paaVerificaRPT',
      'paaAttivaRPT',
      'paaInviaRT',
      'paDemandPaymentNotice',
      'paaChiediNumeroAvviso',
      'paGetPaymentV2',
      'paSendRTV2',
    ]);

    if (!allowedPrimitives.has(primitive)) {
      res.status(400).send('unknown primitive');
      return;
    }
    
    const override = String(req.query.override).toLowerCase() === 'true';
    const result = pushToQueue(primitive, req.rawBody, override);

    if (result.startsWith('unknown')) {
      res.status(400).send(result);
    } else {
      res.status(200).send(result);
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
