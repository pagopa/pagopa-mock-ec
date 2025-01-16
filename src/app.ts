/* eslint-disable sonarjs/cognitive-complexity */
import * as express from 'express';
import * as bodyParserXml from 'express-xml-bodyparser';
import * as morgan from 'morgan';
import * as xml2js from 'xml2js';

import bodyParser = require('body-parser');

import { Configuration } from './config';
import {
  paErrorVerify,
  paGetPaymentRes,
  paVerifyPaymentNoticeRes,
  pspNotifyPaymentRes,
} from './fixtures/nodoNewMod3Responses';

import { paaVerificaRPTRisposta, paaAttivaRPTRisposta } from './fixtures/nodoNewMod3Responses_oldEc';

import { StTransferType_type_pafnEnum } from './generated/paForNode_Service/stTransferType_type_pafn';
import { paSendRTHandler } from './handlers/handlers';
import { requireClientCertificateFingerprint } from './middlewares/requireClientCertificateFingerprint';
import {
  getRandomArbitrary,
  PAA_PAGAMENTO_DUPLICATO,
  PAA_PAGAMENTO_IN_CORSO,
  PAA_PAGAMENTO_SCADUTO,
  PAA_PAGAMENTO_SCONOSCIUTO,
  PAA_SINTASSI_XSD,
  POSITIONS_STATUS,
} from './utils/helper';
import { logger, log_event_tx } from './utils/logger';
import {
  paVerify17,
  paVerify18,
  paVerify19,
  paVerify20,
  paVerify21,
  paVerify22,
  paVerify23,
  paVerify24,
  paVerifyPagamentoDuplicato,
} from './fixtures/fixVerifyResponse';
import {
  paActivate17,
  paActivate18,
  paActivate19,
  paActivate20,
  paActivate21,
  paActivate22,
  paActivate23,
  paActivate24,
  paActivatePagamentoDuplicato,
} from './fixtures/fixActivateResponse';

const paVerifyPaymentNoticeQueue = new Array<string>();
const paGetPaymentQueue = new Array<string>();
const paSendRTQueue = new Array<string>();
const pspNotifyPaymentQueue = new Array<string>();
const paaVerificaRPTQueue = new Array<string>();
const paaAttivaRPTQueue = new Array<string>();

const faultId = '77777777777';

const verifySoapRequest = 'pafn:paverifypaymentnoticereq';
const activateSoapRequest = 'pafn:pagetpaymentreq';
const sentReceipt = 'pafn:pasendrtreq';
const pspnotifypaymentreq = 'pspfn:pspnotifypaymentreq';
const paaVerificaRPTreq = 'ppt:paaverificarpt';
const paaAttivaRPTreq = 'ppt:paaattivarpt';

const avviso1 = new RegExp('^30200.*'); // CCPost + CCPost
const avviso2 = new RegExp('^30201.*'); // CCPost + CCBank
const avviso3 = new RegExp('^30202.*'); // CCBank + CCPost
const avviso4 = new RegExp('^30203.*'); // CCBank + CCBank
const avviso5 = new RegExp('^30204.*'); // CCPost - Monobeneficiario + 777
const avviso6 = new RegExp('^30205.*'); // CCBank - Monobeneficiario + 777
const avviso5smart = new RegExp('^30204777.*'); // CCPost - Monobeneficiario + 777
const avviso7 = new RegExp('^30206.*'); // CCPost + CCPost
const avviso8 = new RegExp('^30207.*'); // CCPost + CCBank
const avviso9 = new RegExp('^30208.*'); // CCBank + CCPost
const avviso10 = new RegExp('^30209.*'); // CCBank + CCBank
const avviso11 = new RegExp('^30210.*'); // CCPost - Monobeneficiario
const avviso12 = new RegExp('^30211.*'); // CCBank - Monobeneficiario
const avviso13 = new RegExp('^30212.*'); // come avviso2 - amount1 4000 - amount2 2000
const avviso14 = new RegExp('^30213.*'); // come avviso2 - amount1 0.10 - amount2 0.20
const avviso15 = new RegExp('^30214.*'); // CCPost + CCBank + CBank
const avviso16 = new RegExp('^30215.*'); // CCPost + CCBank + CBank + CCBank + CCBank
const avviso17 = new RegExp('^30216.*'); // CCPost + CCBank + CBank + CCBank + CCBank
const avviso18 = new RegExp('^30217.*'); // fix response
const avviso19 = new RegExp('^30218.*'); // fix response
const avviso20 = new RegExp('^30219.*'); // fix response
const avviso21 = new RegExp('^30220.*'); // fix response
const avviso22 = new RegExp('^30221.*'); // fix response
const avviso23 = new RegExp('^30222.*'); // fix response
const avviso24 = new RegExp('^30223.*'); // fix response
const avviso25 = new RegExp('^30224.*'); // fix response
const avvisoOver5000 = new RegExp('^30277.*'); // random over 5000 euro + random su 2 transfers
const avvisoUnder1 = new RegExp('^30288.*'); // random under 1 euro + + random su 2 transfers

// Special error cases
const avvisoPagamentoDuplicato = new RegExp('^30295.*'); // PAA_PAGAMENTO_DUPLICATO
const avvisoErroreXSD = new RegExp('^30296.*'); // PAA_SINTASSI_XSD
const avvisoErrore = new RegExp('^30297.*'); // paErrorVerify
const avvisoTimeout = new RegExp('^30298.*'); // timeout
const avvisoScaduto = new RegExp('^30299.*'); // PAA_PAGAMENTO_SCADUTO

const amount1 = 100.0;
const amount1bis = 70.0;
const amount2 = 20.0;
const amount2bis = 30.0;
const amount1Over = 4000.0;
const amount2Over = 2000.0;
const amount1Under = 0.1;
const amount2Under = 0.2;

const descriptionAll = 'TARI/TEFA 2021';
const descriptionMono = 'TARI 2021';

const onBollettino = ' su bollettino';

// tslint:disable-next-line: no-big-function
export async function newExpressApp(
  config: Configuration,
  db: Map<string, POSITIONS_STATUS>,
  dbAmounts: Map<string, number>,
  noticenumberRequests: Map<string, JSON>,
  noticenumberResponses: Map<string, JSON>,
): Promise<Express.Application> {
  // config params...
  const TIMEOUT_SEC = config.PA_MOCK.NM3_DATA.TIMETOUT_SEC;

  const email = config.PA_MOCK.NM3_DATA.USER_EMAL;
  const fullName = config.PA_MOCK.NM3_DATA.USER_FULL_NAME;
  const CF = config.PA_MOCK.NM3_DATA.USER_CF;

  const CCPostPrimaryEC = config.PA_MOCK.NM3_DATA.CC_POST_PRIMARY_EC;
  const CCBankPrimaryEC = config.PA_MOCK.NM3_DATA.CC_BANK_PRIMARY_EC;
  const CCPostSecondaryEC = config.PA_MOCK.NM3_DATA.CC_POST_SECONDARY_EC;
  const CCBankSecondaryEC = config.PA_MOCK.NM3_DATA.CC_BANK_SECONDARY_EC;
  const CCBankThirdEC = config.PA_MOCK.NM3_DATA.CC_BANK_THIRD_EC;
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
    } else {
      res.status(400).send(`unknown ${req.params.primitive} error on saved.`);
    }
  });

  // SOAP Server mock entrypoint
  // eslint-disable-next-line complexity
  // eslint-disable-next-line sonarjs/cognitive-complexity, complexity
  app.post(config.PA_MOCK.ROUTES.PPT_NODO, async (req, res) => {
    logger.info(`>>> rx REQUEST :`);
    logger.info(JSON.stringify(req.body));
    try {
      const soapRequest = req.body['soapenv:envelope']['soapenv:body'][0];
      // 1. paVerifyPaymentNotice
      if (soapRequest[verifySoapRequest]) {
        if (paVerifyPaymentNoticeQueue.length > 0) {
          const customResponse = paVerifyPaymentNoticeQueue.shift();
          logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
          return res
            .status(customResponse && customResponse.trim() === '<response>error</response>' ? 500 : 200)
            .send(customResponse);
        }

        const paVerifyPaymentNotice = soapRequest[verifySoapRequest][0];
        const fiscalcode = paVerifyPaymentNotice.qrcode[0].fiscalcode;
        const noticenumber = paVerifyPaymentNotice.qrcode[0].noticenumber;

        if (avviso18.test(noticenumber)) {
          return res.status(200).send(paVerify17);
        } else if (avviso19.test(noticenumber)) {
          return res.status(200).send(paVerify18);
        } else if (avviso20.test(noticenumber)) {
          return res.status(200).send(paVerify19);
        } else if (avviso21.test(noticenumber)) {
          return res.status(200).send(paVerify20);
        } else if (avviso22.test(noticenumber)) {
          return res.status(200).send(paVerify21);
        } else if (avviso23.test(noticenumber)) {
          return res.status(200).send(paVerify22);
        } else if (avviso24.test(noticenumber)) {
          return res.status(200).send(paVerify23);
        } else if (avviso25.test(noticenumber)) {
          return res.status(200).send(paVerify24);
        } else if (avvisoPagamentoDuplicato.test(noticenumber)) {
          return res.status(200).send(paVerifyPagamentoDuplicato);
        }

        if (testDebug.toUpperCase() === 'Y') {
          noticenumberRequests.set(`${noticenumber}_paVerifyPaymentNotice`, req.body);
        }

        const isFixedError = avvisoErrore.test(noticenumber);
        const isTimeout = avvisoTimeout.test(noticenumber);
        const isErrorXsd = avvisoErroreXSD.test(noticenumber);

        const isValidNotice =
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
          avvisoOver5000.test(noticenumber) ||
          avvisoUnder1.test(noticenumber);

        const isExpiredNotice = avvisoScaduto.test(noticenumber);
        const isOver5000 = avvisoOver5000.test(noticenumber);
        const isUnder1 = avvisoUnder1.test(noticenumber);
        const isFixOver = avviso13.test(noticenumber);
        const isFixUnder = avviso14.test(noticenumber);
        const isSmartAmount = avviso5smart.test(noticenumber);

        const isAmount1 = avviso5.test(noticenumber) || avviso6.test(noticenumber);
        const isAmount1bis = avviso11.test(noticenumber) || avviso12.test(noticenumber);
        const isAmountComplete1 =
          avviso1.test(noticenumber) ||
          avviso2.test(noticenumber) ||
          avviso3.test(noticenumber) ||
          avviso4.test(noticenumber) ||
          avviso15.test(noticenumber) ||
          avviso16.test(noticenumber) ||
          avviso17.test(noticenumber) ||
          avviso24.test(noticenumber) ||
          avviso25.test(noticenumber);

        const isAmountComplete1bis =
          avviso7.test(noticenumber) ||
          avviso8.test(noticenumber) ||
          avviso9.test(noticenumber) ||
          avviso10.test(noticenumber);

        const transferTypeRes =
          avviso1.test(noticenumber) ||
          avviso5.test(noticenumber) ||
          avviso7.test(noticenumber) ||
          avviso11.test(noticenumber)
            ? StTransferType_type_pafnEnum.POSTAL
            : undefined;

        // eslint-disable-next-line functional/no-let
        let amountRes = isAmount1
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
          : isOver5000
          ? getRandomArbitrary(5000, 10000).toFixed(2)
          : isUnder1
          ? getRandomArbitrary(0, 1).toFixed(2)
          : 0;

        const customAmount = noticenumber[0].substring(14, 18); // xx.xx
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        amountRes = isSmartAmount ? +customAmount.substring(0, 2) + '.' + customAmount.substring(2, 4) : amountRes;

        dbAmounts.set(noticenumber[0], +amountRes);

        if (isErrorXsd) {
          // error case PAA_SINTASSI_XSD
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

        if (!isValidNotice && !isExpiredNotice && !isTimeout) {
          // error case PAA_PAGAMENTO_SCONOSCIUTO
          const paVerifyPaymentNoticeResponse = paVerifyPaymentNoticeRes({
            fault: {
              description:
                'numero avviso deve iniziare con 302[00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|99|98|97]',
              faultCode: PAA_PAGAMENTO_SCONOSCIUTO.value,
              faultString: 'Pagamento in attesa risulta sconosciuto all’Ente Creditore',
              id: faultId,
            },
            outcome: 'KO',
          });

          log_event_tx(paVerifyPaymentNoticeResponse);
          return res.status(paVerifyPaymentNoticeResponse[0]).send(paVerifyPaymentNoticeResponse[1]);
        } else if (isExpiredNotice && !isTimeout) {
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
        } else if (isTimeout) {
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
        } else {
          const b = db.get(noticenumber[0]); // get option status
          if (b) {
            // già esiste
            // error case PAA_PAGAMENTO_IN_CORSO
            const paVerifyPaymentNoticeResponse = paVerifyPaymentNoticeRes({
              fault: {
                faultCode:
                  b === POSITIONS_STATUS.IN_PROGRESS
                    ? PAA_PAGAMENTO_IN_CORSO.value
                    : b === POSITIONS_STATUS.CLOSE
                    ? PAA_PAGAMENTO_DUPLICATO.value
                    : '_UNDEFINE_',
                faultString: `Errore ${noticenumber}`,
                id: faultId,
              },
              outcome: 'KO',
            });

            log_event_tx(paVerifyPaymentNoticeResponse);
            return res.status(paVerifyPaymentNoticeResponse[0]).send(paVerifyPaymentNoticeResponse[1]);
          } else {
            // happy case
            const paVerifyPaymentNoticeResponse = paVerifyPaymentNoticeRes({
              outcome: 'OK',
              fiscalCodePA: fiscalcode,
              transferType: transferTypeRes,
              amount: amountRes,
            });

            log_event_tx(paVerifyPaymentNoticeResponse);
            if (testDebug.toUpperCase() === 'Y') {
              xml2js.parseString(paVerifyPaymentNoticeResponse[1], (err, result) => {
                if (err) {
                  throw err;
                }

                // const json = JSON.stringify(result);
                noticenumberResponses.set(`${noticenumber}_paVerifyPaymentNotice`, result);
              });
            }
            return res.status(paVerifyPaymentNoticeResponse[0]).send(paVerifyPaymentNoticeResponse[1]);
          }
        }
      }

      // 2. paGetPayment
      if (soapRequest[activateSoapRequest]) {
        if (paGetPaymentQueue.length > 0) {
          const customResponse = paGetPaymentQueue.shift();
          logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
          return res
            .status(customResponse && customResponse.trim() === '<response>error</response>' ? 500 : 200)
            .send(customResponse);
        }
        const paGetPayment = soapRequest[activateSoapRequest][0];
        const fiscalcode = paGetPayment.qrcode[0].fiscalcode;
        const noticenumber: string = paGetPayment.qrcode[0].noticenumber;
        const creditorReferenceId = noticenumber[0].substring(1);

        if (avviso18.test(noticenumber)) {
          const paActivate17res = paActivate17({
            creditorReferenceId,
          });
          return res.status(paActivate17res[0]).send(paActivate17res[1]);
        } else if (avviso19.test(noticenumber)) {
          const paActivate18res = paActivate18({
            creditorReferenceId,
          });
          return res.status(paActivate18res[0]).send(paActivate18res[1]);
        } else if (avviso20.test(noticenumber)) {
          const paActivate19res = paActivate19({
            creditorReferenceId,
          });
          return res.status(paActivate19res[0]).send(paActivate19res[1]);
        } else if (avviso21.test(noticenumber)) {
          const paActivate20res = paActivate20({
            creditorReferenceId,
          });
          return res.status(paActivate20res[0]).send(paActivate20res[1]);
        } else if (avviso22.test(noticenumber)) {
          const paActivate21res = paActivate21({
            creditorReferenceId,
          });
          return res.status(paActivate21res[0]).send(paActivate21res[1]);
        } else if (avviso23.test(noticenumber)) {
          const paActivate22res = paActivate22({
            creditorReferenceId,
          });
          return res.status(paActivate22res[0]).send(paActivate22res[1]);
        } else if (avviso24.test(noticenumber)) {
          const paActivate23res = paActivate23({
            creditorReferenceId,
          });
          return res.status(paActivate23res[0]).send(paActivate23res[1]);
        } else if (avviso25.test(noticenumber)) {
          const paActivate24res = paActivate24({
            creditorReferenceId,
          });
          return res.status(paActivate24res[0]).send(paActivate24res[1]);
        } else if (avvisoPagamentoDuplicato.test(noticenumber)) {
          const paActivateDuplicatoRes = paActivatePagamentoDuplicato();
          return res.status(paActivateDuplicatoRes[0]).send(paActivateDuplicatoRes[1]);
        }

        const isFixedError = avvisoErrore.test(noticenumber);
        const isTimeout = avvisoTimeout.test(noticenumber);

        if (testDebug.toUpperCase() === 'Y') {
          noticenumberRequests.set(`${noticenumber}_paGetPayment`, req.body);
        }

        const isNoticeWith120 =
          avviso1.test(noticenumber) ||
          avviso2.test(noticenumber) ||
          avviso3.test(noticenumber) ||
          avviso4.test(noticenumber) ||
          avviso5.test(noticenumber) ||
          avviso6.test(noticenumber);

        const isValidNotice =
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
          avvisoOver5000.test(noticenumber) ||
          avvisoUnder1.test(noticenumber);

        const isExpiredNotice = avvisoScaduto.test(noticenumber);
        const isOver5000 = avvisoOver5000.test(noticenumber);
        const isUnder1 = avvisoUnder1.test(noticenumber);
        const isFixOver = avviso13.test(noticenumber);
        const isFixUnder = avviso14.test(noticenumber);

        const isAmount1 = avviso5.test(noticenumber) || avviso6.test(noticenumber);
        const isAmount1bis = avviso11.test(noticenumber) || avviso12.test(noticenumber);

        const isSmartAmount = avviso5smart.test(noticenumber);

        const isAmountComplete1 =
          avviso1.test(noticenumber) ||
          avviso2.test(noticenumber) ||
          avviso3.test(noticenumber) ||
          avviso4.test(noticenumber) ||
          avviso15.test(noticenumber) ||
          avviso16.test(noticenumber) ||
          avviso17.test(noticenumber);

        const isAmountComplete1bis =
          avviso7.test(noticenumber) ||
          avviso8.test(noticenumber) ||
          avviso9.test(noticenumber) ||
          avviso10.test(noticenumber);

        // eslint-disable-next-line functional/no-let
        let amountRes = isAmount1
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
          ? dbAmounts.has(noticenumber[0])
            ? dbAmounts.get(noticenumber[0])
            : 0
          : 0;

        const amountSession = dbAmounts.has(noticenumber[0]) ? dbAmounts.get(noticenumber[0]) : 0;
        const amountSession1 = amountSession ? amountSession / 2 : 0;
        const amountSession2 = amountSession ? amountSession - amountSession1 : 0;

        // eslint-disable-next-line functional/no-let
        let amountPrimaryRes = isFixOver
          ? amount1Over.toFixed(2)
          : isFixUnder
          ? amount1Under.toFixed(2)
          : isOver5000 || isUnder1
          ? amountSession1.toFixed(2)
          : isNoticeWith120
          ? amount1.toFixed(2)
          : amount1bis.toFixed(2);

        const amountSecondaryRes = isFixOver
          ? amount2Over.toFixed(2)
          : isFixUnder
          ? amount2Under.toFixed(2)
          : isOver5000 || isUnder1
          ? amountSession2.toFixed(2)
          : isNoticeWith120
          ? amount2.toFixed(2)
          : amount2bis.toFixed(2);

        const customAmount = noticenumber[0].substring(14, 18); // xx.xx
        /* eslint-disable */
        amountPrimaryRes = isSmartAmount
          ? +customAmount.substring(0, 2) + '.' + customAmount.substring(2, 4)
          : amountPrimaryRes;
        amountRes = isSmartAmount ? +customAmount.substring(0, 2) + '.' + customAmount.substring(2, 4) : amountRes;
        /* eslint-enable */

        if (isFixedError) {
          const paErrorGetResponse = paErrorVerify({ typeR: 'paGetPaymentRes' });
          log_event_tx(paErrorGetResponse);
          return res.status(paErrorGetResponse[0]).send(paErrorGetResponse[1]);
        }

        if (!isValidNotice && !isExpiredNotice && !isTimeout) {
          // error case
          const paGetPaymentResponse = paGetPaymentRes({
            fault: {
              description:
                'numero avviso deve iniziare con 302[00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|99|98|97]',
              faultCode: PAA_PAGAMENTO_SCONOSCIUTO.value,
              faultString: 'Pagamento in attesa risulta sconosciuto all’Ente Creditore',
              id: faultId,
            },
            outcome: 'KO',
          });

          log_event_tx(paGetPaymentResponse);
          return res.status(paGetPaymentResponse[0]).send(paGetPaymentResponse[1]);
        } else if (isExpiredNotice && !isTimeout) {
          // error case PAA_PAGAMENTO_SCADUTO
          const paGetPaymentResponse = paGetPaymentRes({
            fault: {
              description: `il numero avviso ${noticenumber} e' scaduto`,
              faultCode: PAA_PAGAMENTO_SCADUTO.value,
              faultString: 'Pagamento in attesa risulta scaduto all’Ente Creditore',
              id: faultId,
            },
            outcome: 'KO',
          });

          log_event_tx(paGetPaymentResponse);
          return res.status(paGetPaymentResponse[0]).send(paGetPaymentResponse[1]);
        } else if (isTimeout) {
          setTimeout(function() {
            // happy case DELAY - paGetPaymentRes
            const paGetPaymentResponse = paGetPaymentRes({
              amount: (amount1 + amount2).toFixed(2),
              amountPrimary: amount1.toFixed(2),
              amountSecondary: amount2.toFixed(2),
              creditorReferenceId,
              description: descriptionAll,
              fiscalCodePA: fiscalcode,
              iban_1: CCPostPrimaryEC,
              iban_2: CCPostSecondaryEC,
              outcome: 'OK',
              remittanceInformation1Bollettino: '',
              remittanceInformation2Bollettino: '',
              fullName,
              email,
              CF,
            });

            log_event_tx(paGetPaymentResponse);
            return res.status(paGetPaymentResponse[0]).send(paGetPaymentResponse[1]);
          }, +TIMEOUT_SEC);
        } else {
          const b = db.get(noticenumber[0]); // get status
          if (b) {
            // già esiste
            // error case PAA_PAGAMENTO_IN_CORSO
            const paGetPaymentResponse = paGetPaymentRes({
              outcome: 'KO',
              fault: {
                faultCode:
                  b === POSITIONS_STATUS.IN_PROGRESS
                    ? PAA_PAGAMENTO_IN_CORSO.value
                    : b === POSITIONS_STATUS.CLOSE
                    ? PAA_PAGAMENTO_DUPLICATO.value
                    : '_UNDEFINE_',
                faultString: `Errore ${noticenumber}`,
                id: faultId,
              },
            });

            log_event_tx(paGetPaymentResponse);
            return res.status(paGetPaymentResponse[0]).send(paGetPaymentResponse[1]);
          } else {
            // happy case

            // retrive 0,1,2,3 from noticenumber
            const idIbanAvviso: number =
              isOver5000 || isUnder1
                ? 1 // Math.round(getRandomArbitrary(0, 11))
                : isFixOver || isFixUnder
                ? 1 // Fix Over and Under come avviso2
                : +noticenumber[0].substring(3, 5);
            // eslint-disable-next-line functional/no-let
            let iban1;
            // eslint-disable-next-line functional/no-let
            let iban2;
            // eslint-disable-next-line functional/no-let
            let iban3;
            // eslint-disable-next-line functional/no-let
            let iban4;
            // eslint-disable-next-line functional/no-let
            let iban5;
            // eslint-disable-next-line functional/no-let
            let remittanceInformation1Bollettino = '';
            // eslint-disable-next-line functional/no-let
            let remittanceInformation2Bollettino = '';

            switch (idIbanAvviso) {
              case 0: // CCPost + CCPost
              case 6: // CCPost + CCPost
                iban1 = CCPostPrimaryEC;
                iban2 = CCPostSecondaryEC;
                remittanceInformation1Bollettino = onBollettino;
                remittanceInformation2Bollettino = onBollettino;
                break;
              case 1: // CCPost + CCBank
              case 7: //  CCPost + CCBank
                iban1 = CCPostPrimaryEC;
                iban2 = CCBankSecondaryEC;
                remittanceInformation1Bollettino = onBollettino;
                break;
              case 14: // CCPost + CCBank + CCBank
                iban1 = CCPostPrimaryEC;
                iban2 = CCBankSecondaryEC;
                iban3 = CCBankThirdEC;
                break;
              case 15: // CCPost + CCBank + CCBank + CCBank
                iban1 = CCPostPrimaryEC;
                iban2 = CCBankSecondaryEC;
                iban3 = CCBankThirdEC;
                iban4 = CCBankSecondaryEC;
                break;
              case 16: // CCPost + CCBank + CCBank + CCBank + CCBank
                iban1 = CCPostPrimaryEC;
                iban2 = CCBankSecondaryEC;
                iban3 = CCBankThirdEC;
                iban4 = CCBankSecondaryEC;
                iban5 = CCBankSecondaryEC;
                break;
              case 2: // CCBank + CCPost
              case 8: // CCBank + CCPost
                iban1 = CCBankPrimaryEC;
                iban2 = CCPostSecondaryEC;
                remittanceInformation2Bollettino = onBollettino;
                break;
              case 3: // CCBank + CCBank
              case 9: // CCBank + CCBank
                iban1 = CCBankPrimaryEC;
                iban2 = CCBankSecondaryEC;
                break;
              case 4: // CCPost - Monobeneficiario
              case 10: // CCPost - Monobeneficiario
                iban1 = CCPostPrimaryEC;
                remittanceInformation1Bollettino = onBollettino;
                break;
              case 5: // CCBank - Monobeneficiario
              case 11: // CCBank - Monobeneficiario
                iban1 = CCBankPrimaryEC;
                break;
              default:
                // The SOAP Request not implemented
                res.status(404).send('Not found iban');
            }

            const paGetPaymentResponse = paGetPaymentRes({
              amount: amountRes,
              amountPrimary:
                iban2 !== null ? amountPrimaryRes : isOver5000 || isUnder1 ? amountSession1 : amountPrimaryRes,
              amountSecondary: amountSecondaryRes,
              amount3: (iban5 ? 10 : iban4 ? 10 : 20).toFixed(2),
              amount4: (iban5 ? 5 : 10).toFixed(2),
              amount5: '5.00',
              creditorReferenceId,
              description:
                avviso5.test(noticenumber) ||
                avviso6.test(noticenumber) ||
                avviso11.test(noticenumber) ||
                avviso12.test(noticenumber)
                  ? descriptionMono
                  : descriptionAll,
              fiscalCodePA: fiscalcode,
              iban_1: iban1,
              iban_2: iban2,
              iban_3: iban3,
              iban_4: iban4,
              iban_5: iban5,
              outcome: 'OK',
              remittanceInformation1Bollettino,
              remittanceInformation2Bollettino,
              fullName,
              email,
              CF,
            });

            log_event_tx(paGetPaymentResponse);
            if (testDebug.toUpperCase() === 'Y') {
              xml2js.parseString(paGetPaymentResponse[1], (err, result) => {
                if (err) {
                  throw err;
                }

                // const json = JSON.stringify(result);
                noticenumberResponses.set(`${noticenumber}_paGetPayment`, result);
              });
            }
            return res.status(paGetPaymentResponse[0]).send(paGetPaymentResponse[1]);
          }
        }
      }

      // 3. paSendRT
      if (soapRequest[sentReceipt]) {
        if (paSendRTQueue.length > 0) {
          const customResponse = paSendRTQueue.shift();
          logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
          return res
            .status(customResponse && customResponse.includes('PAA_ERRORE_MOCK') ? 500 : 200)
            .send(customResponse);
        }
        const sentReceiptReq = soapRequest[sentReceipt][0];
        const auxdigit = config.PA_MOCK.AUX_DIGIT;

        const noticenumber: string = `${auxdigit}${sentReceiptReq.receipt[0].creditorreferenceid}`;

        if (testDebug.toUpperCase() === 'Y') {
          noticenumberRequests.set(`${noticenumber}_paSendRT`, req.body);
        }

        const paSendRTResponse = paSendRTHandler(soapRequest, db);

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

      // 4. pspNotifyPayment
      if (soapRequest[pspnotifypaymentreq]) {
        if (pspNotifyPaymentQueue.length > 0) {
          const customResponse = pspNotifyPaymentQueue.shift();
          logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
          return res
            .status(customResponse && customResponse.includes('PAA_ERRORE_MOCK') ? 500 : 200)
            .send(customResponse);
        }
        const pspnotifypayment = soapRequest[pspnotifypaymentreq][0];
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

      // 5. paaVerificaRPT
      if (soapRequest[paaVerificaRPTreq]) {
        if (paaVerificaRPTQueue.length > 0) {
          const customResponse = paaVerificaRPTQueue.shift();
          logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
          return res
            .status(customResponse && customResponse.includes('PAA_ERRORE_MOCK') ? 500 : 200)
            .send(customResponse);
        }

        log_event_tx(paaVerificaRPTRisposta);
        return res.status(+paaVerificaRPTRisposta[0]).send(paaVerificaRPTRisposta[1]);
      }

      // 6. paaAttivaRPT
      if (soapRequest[paaAttivaRPTreq]) {
        if (paaAttivaRPTQueue.length > 0) {
          const customResponse = paaAttivaRPTQueue.shift();
          logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
          return res
            .status(customResponse && customResponse.includes('PAA_ERRORE_MOCK') ? 500 : 200)
            .send(customResponse);
        }

        log_event_tx(paaAttivaRPTRisposta);
        return res.status(+paaAttivaRPTRisposta[0]).send(paaAttivaRPTRisposta[1]);
      }

      if (
        !(
          soapRequest[sentReceipt] ||
          soapRequest[activateSoapRequest] ||
          soapRequest[verifySoapRequest] ||
          soapRequest[paaVerificaRPTreq] ||
          soapRequest[paaAttivaRPTreq]
        )
      ) {
        // The SOAP Request not implemented
        logger.info(`The SOAP Request ${JSON.stringify(soapRequest)} not implemented`);
        res.status(404).send('Not found');
      }
      // tslint:disable-next-line: prettier
    } catch (error) {
      // The SOAP Request isnt' correct
      logger.info(`The SOAP Request isnt' correct`);
      res.status(500).send('Internal Server Error :( ');
    }
    // tslint:disable-next-line: no-empty
  });
  return app;
}