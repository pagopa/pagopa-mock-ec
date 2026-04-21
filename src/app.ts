import { paVerify00, paVerify01, paVerify02, paVerify03, paVerify04, paVerify05, paVerify06, paVerify07, paVerify08, paVerify09, paVerify10, paVerify11, paVerify12, paVerify13, paVerify14, paVerify15, paVerify16 } from './fixtures/fixVerifyResponse';

/* eslint-disable sonarjs/cognitive-complexity */
import * as express from 'express';
import * as bodyParserXml from 'express-xml-bodyparser';
import * as morgan from 'morgan';
import * as xml2js from 'xml2js';

import bodyParser = require('body-parser');

import escapeHtml = require('escape-html');
import { Configuration } from './config';

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
  //avvisoOver5000,
  //avvisoUnder1,
  avvisoPagamentoDuplicato,
  avvisoErroreXSD,
  avvisoErrore,
  avvisoTimeout,
  avvisoScaduto,
  amount1,  
  amount2,
  descriptionAll,
  descriptionMono,
  onBollettino,
  
} from './utils/configuration';
import {
  paErrorVerify,
  paGetPaymentRes,
  paVerifyPaymentNoticeRes,
  pspNotifyPaymentRes,
  paGetPaymentV2Response,
  paSendRTV2Response,
  MockResponse,
} from './fixtures/nodoNewMod3Responses';

import {
  paaVerificaRPTRisposta,
  paaAttivaRPTRisposta,
  paaInviaRTRisposta,
  paDemandPaymentNoticeRisposta,
  paaChiediNumeroAvvisoRisposta,
} from './fixtures/nodoNewMod3Responses_oldEc';

// @ts-ignore
import { StTransferType_type_pafnEnum } from './generated/paForNode_Service/stTransferType_type_pafn';
import { paSendRTHandler } from './handlers/handlers';
import { requireClientCertificateFingerprint } from './middlewares/requireClientCertificateFingerprint';
import {
  getAmount,
  getAmountPrimaryRes,
  getAmountSecondaryRes,
  getIbanAvviso,
  PAA_PAGAMENTO_DUPLICATO,
  PAA_PAGAMENTO_IN_CORSO,
  PAA_PAGAMENTO_SCADUTO,
  PAA_PAGAMENTO_SCONOSCIUTO,
  PAA_SINTASSI_XSD,
  POSITIONS_STATUS,
  validNotice,
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
  paVerify25,
  paVerify26,
  paVerifyPagamentoDuplicato,
} from './fixtures/fixVerifyResponse';
import {
  getPaActivate,
  IActivateRequest,
  IECConfig,
} from './fixtures/fixActivateResponse';

import {
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
} from './fixtures/fixActivateV2Response';

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

const faultId = '77777777777';

const verifySoapRequest = 'pafn:paverifypaymentnoticereq';
const activateSoapRequest = 'pafn:pagetpaymentreq';
const sentReceipt = 'pafn:pasendrtreq';
const pspnotifypaymentreq = 'pspfn:pspnotifypaymentreq';
const paaVerificaRPTreq = 'ppt:paaverificarpt';
const paaAttivaRPTreq = 'ppt:paaattivarpt';
const paaInviaRTreq = 'ppt:paainviart';
const paDemandPaymentNoticereq = 'pafn:pademandpaymentnoticerequest';
const paaChiediNumeroAvvisoreq = 'ppt:paachiedinumeroavviso';
const paGetPaymentV2req = 'pafn:pagetpaymentv2request';
const paSendRTV2req = 'pafn:pasendrtv2request';

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

  function ritorno(res: any, customResponse: string | undefined) {
    return res
      .status(customResponse && customResponse.trim() === '<response>error</response>' ? 500 : 200)
      .send(customResponse);
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
  app.post(config.PA_MOCK.ROUTES.PPT_NODO, async (req, res) => {
    logger.info(`>>> rx REQUEST :`);
    logger.info(JSON.stringify(req.body));
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    try {
      const soapRequest = req.body['soapenv:envelope']['soapenv:body'][0];
      // 1. paVerifyPaymentNotice
      if (soapRequest[verifySoapRequest]) {
        if (paVerifyPaymentNoticeQueue.length > 0) {
          const customResponse = paVerifyPaymentNoticeQueue.shift();
          logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
          // return res
          //   .status(customResponse && customResponse.trim() === '<response>error</response>' ? 500 : 200)
          //   .send(customResponse);
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

        const paVerifyPaymentNotice = soapRequest[verifySoapRequest][0];
        const fiscalcode = paVerifyPaymentNotice.qrcode[0].fiscalcode;
        const noticenumber = paVerifyPaymentNotice.qrcode[0].noticenumber;


        const validAvvisi = [
            avviso00, avviso01, avviso02, avviso03, avviso04, avviso05,
            avviso06, avviso07, avviso08, avviso09, avviso10, avviso11,
            avviso12, avviso13, avviso14, avviso15, avviso16, avviso17,
            avviso18, avviso19, avviso20, avviso21, avviso22, avviso23,
            avviso24, avviso25, avviso26, avviso27
        ];

        const isValidNotice = validAvvisi.some(pattern => pattern.test(noticenumber));

        if(!isValidNotice)
        {
           const paVerifyPaymentNoticeResponse = paVerifyPaymentNoticeRes({
            fault: {
              description:
                'numero avviso deve iniziare con 3\\d\\d[00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|99|98|97]',
              faultCode: PAA_PAGAMENTO_SCONOSCIUTO.value,
              faultString: 'Pagamento in attesa risulta sconosciuto all’Ente Creditore',
              id: faultId,
            },
            outcome: 'KO',
          });

          log_event_tx(paVerifyPaymentNoticeResponse);
          return res.status(paVerifyPaymentNoticeResponse[0]).send(paVerifyPaymentNoticeResponse[1]);
        }

        // EC is returning a response with a syntax error
        const isErrorXsd = avvisoErroreXSD.test(noticenumber);
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

        const isFixedError = avvisoErrore.test(noticenumber);
        if (isFixedError) {
          const paErrorVerifyResponse = paErrorVerify({ typeR: 'paVerifyPaymentNoticeRes' });
          log_event_tx(paErrorVerifyResponse);
          return res.status(paErrorVerifyResponse[0]).send(paErrorVerifyResponse[1]);
        }

        const isTimeout = avvisoTimeout.test(noticenumber);
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
          return res.status(200).send(match[1].xml);
           const amountRes = match![1].options.amount     
           dbAmounts.set(noticenumber, +amountRes);
        }      

        if (testDebug.toUpperCase() === 'Y') {
          noticenumberRequests.set(`${noticenumber}_paVerifyPaymentNotice`, req.body);
        }
       

        const isExpiredNotice = avvisoScaduto.test(noticenumber);
        /*const isOver5000 = avvisoOver5000.test(noticenumber);
        const isUnder1 = avvisoUnder1.test(noticenumber);
        const isFixOver = avviso13.test(noticenumber);
        const isFixUnder = avviso14.test(noticenumber);*/
        
       

        
        

        if (!isValidNotice && !isExpiredNotice && !isTimeout) {
          // error case PAA_PAGAMENTO_SCONOSCIUTO
          const paVerifyPaymentNoticeResponse = paVerifyPaymentNoticeRes({
            fault: {
              description:
                'numero avviso deve iniziare con 3\\d\\d[00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|99|98|97]',
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
        }  else {
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
              //transferType: transferTypeRes,
              //amount: amountRes,
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
          if (customResponse !== undefined) {
            const convert = await xml2js.parseStringPromise(customResponse);
            if (convert['soapenv:Envelope']['soapenv:Body']) {
              if (convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paGetPaymentRes']) {
                const delay = convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paGetPaymentRes'][0].delay;
                const irraggiungibile =
                  convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paGetPaymentRes'][0].irraggiungibile;
                if (irraggiungibile) {
                  throw new TypeError('irraggiungibile');
                }
                if (delay) {
                  logger.info('>>> start timeout');
                  delete convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paGetPaymentRes'][0].delay;
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
        const paGetPayment = soapRequest[activateSoapRequest][0];
        const fiscalcode = paGetPayment.qrcode[0].fiscalcode;
        const noticenumber: string = paGetPayment.qrcode[0].noticenumber[0];
        const creditorReferenceId = noticenumber.substring(1);




        const avvisoMappings:  Array<[RegExp, (p: IActivateRequest) => MockResponse]> = [
          [avviso00, getPaActivate("00", ec)],
          [avviso01, getPaActivate("01", ec)],
          [avviso02, getPaActivate("02", ec)],
          [avviso03, getPaActivate("03", ec)],
          [avviso04, getPaActivate("04", ec)],
          [avviso05, getPaActivate("05", ec)],
          [avviso06, getPaActivate("06", ec)],
          [avviso07, getPaActivate("07", ec)],
          [avviso08, getPaActivate("08", ec)],
          [avviso09, getPaActivate("09", ec)],
          [avviso10, getPaActivate("10", ec)],
          [avviso11, getPaActivate("11", ec)],
          [avviso12, getPaActivate("12", ec)],
          [avviso13, getPaActivate("13", ec)],
          [avviso14, getPaActivate("14", ec)],
          [avviso15, getPaActivate("15", ec)],
          [avviso16, getPaActivate("16", ec)],
          [avviso17, getPaActivate("17", ec)],
          [avviso18, getPaActivate("18", ec)],
          [avviso19, getPaActivate("19", ec)],
          [avviso20, getPaActivate("20", ec)],
          [avviso21, getPaActivate("21", ec)],
          [avviso22, getPaActivate("22", ec)],
          [avviso23, getPaActivate("23", ec)],
          [avviso24, getPaActivate("24", ec)],
          [avviso25, getPaActivate("25", ec)],
          [avviso26, getPaActivate("26", ec)],
          [avviso27, getPaActivate("27", ec)], 
          [avvisoPagamentoDuplicato, getPaActivate("Duplicato", ec)],
        ];


        const match = avvisoMappings.find(([pattern]) => pattern.test(noticenumber));
        if (match) {
          const [, factory] = match;
          return res.status(200).send(factory(req.body)[1]);
        }
        if (testDebug.toUpperCase() === 'Y') {
          noticenumberRequests.set(`${noticenumber}_paGetPayment`, req.body);
        }

        const isFixedError = avvisoErrore.test(noticenumber);
        if (isFixedError) {
          const paErrorGetResponse = paErrorVerify({ typeR: 'paGetPaymentRes' });
          log_event_tx(paErrorGetResponse);
          return res.status(paErrorGetResponse[0]).send(paErrorGetResponse[1]);
        }

        const isValidNotice = validNotice(noticenumber);
        const isExpiredNotice = avvisoScaduto.test(noticenumber);
        const isTimeout = avvisoTimeout.test(noticenumber);

        /* eslint-enable */

        if (!isValidNotice && !isExpiredNotice && !isTimeout) {
          // error case
          const paGetPaymentResponse = paGetPaymentRes({
            fault: {
              description:
                'numero avviso deve iniziare con 3\\d\\d[00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|99|98|97]',
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
              iban_1: ec.CCPostPrimaryEC,
              iban_2: ec.CCPostSecondaryEC,
              outcome: 'OK',
              remittanceInformation1Bollettino: '',
              remittanceInformation2Bollettino: '',
              fullName: ec.fullName,
              email: ec.email,
              CF: ec.CF,
            });

            log_event_tx(paGetPaymentResponse);
            return res.status(paGetPaymentResponse[0]).send(paGetPaymentResponse[1]);
          }, +TIMEOUT_SEC);
        } else {
          const auxDigit = db.get(noticenumber[0]); // get status
          if (auxDigit) {
            // già esiste
            // error case PAA_PAGAMENTO_IN_CORSO
            const paGetPaymentResponse = paGetPaymentRes({
              outcome: 'KO',
              fault: {
                faultCode:
                  auxDigit === POSITIONS_STATUS.IN_PROGRESS
                    ? PAA_PAGAMENTO_IN_CORSO.value
                    : auxDigit === POSITIONS_STATUS.CLOSE
                    ? PAA_PAGAMENTO_DUPLICATO.value
                    : '_UNDEFINED_',
                faultString: `Errore ${noticenumber}`,
                id: faultId,
              },
            });

            log_event_tx(paGetPaymentResponse);
            return res.status(paGetPaymentResponse[0]).send(paGetPaymentResponse[1]);
          } else {
            // happy case

            // retrieve 0,1,2,3 from noticenumber
            const idIbanAvviso: number = getIbanAvviso(noticenumber);

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
                iban1 = ec.CCPostPrimaryEC;
                iban2 = ec.CCPostSecondaryEC;
                remittanceInformation1Bollettino = onBollettino;
                remittanceInformation2Bollettino = onBollettino;
                break;
              case 1: // CCPost + CCBank
              case 7: //  CCPost + CCBank
                iban1 = ec.CCPostPrimaryEC;
                iban2 = ec.CCBankSecondaryEC;
                remittanceInformation1Bollettino = onBollettino;
                break;
              case 14: // CCPost + CCBank + CCBank
                iban1 = ec.CCPostPrimaryEC;
                iban2 = ec.CCBankSecondaryEC;
                iban3 = ec.CCBankThirdEC;
                break;
              case 15: // CCPost + CCBank + CCBank + CCBank
                iban1 = ec.CCPostPrimaryEC;
                iban2 = ec.CCBankSecondaryEC;
                iban3 = ec.CCBankThirdEC;
                iban4 = ec.CCBankSecondaryEC;
                break;
              case 16: // CCPost + CCBank + CCBank + CCBank + CCBank
                iban1 = ec.CCPostPrimaryEC;
                iban2 = ec.CCBankSecondaryEC;
                iban3 = ec.CCBankThirdEC;
                iban4 = ec.CCBankSecondaryEC;
                iban5 = ec.CCBankSecondaryEC;
                break;
              case 2: // CCBank + CCPost
              case 8: // CCBank + CCPost
                iban1 = ec.CCBankPrimaryEC;
                iban2 = ec.CCPostSecondaryEC;
                remittanceInformation2Bollettino = onBollettino;
                break;
              case 3: // CCBank + CCBank
              case 9: // CCBank + CCBank
                iban1 = ec.CCBankPrimaryEC;
                iban2 = ec.CCBankSecondaryEC;
                break;
              case 4: // CCPost - Monobeneficiario
              case 10: // CCPost - Monobeneficiario
                iban1 = ec.CCPostPrimaryEC;
                remittanceInformation1Bollettino = onBollettino;
                break;
              case 5: // CCBank - Monobeneficiario
              case 11: // CCBank - Monobeneficiario
                iban1 = ec.CCBankPrimaryEC;
                break;
              default:
                // The SOAP Request not implemented
                res.status(404).send('Not found iban');
            }

           // const isOver5000 = avvisoOver5000.test(noticenumber);
           // const isUnder1 = avvisoUnder1.test(noticenumber);

            // eslint-disable-next-line functional/no-let
            const amountRes = getAmount(noticenumber, dbAmounts);

            const amountSession = dbAmounts.has(noticenumber[0]) ? dbAmounts.get(noticenumber[0]) : 0;
            const amountSession1 = amountSession ? amountSession / 2 : 0;
            const amountSession2 = amountSession ? amountSession - amountSession1 : 0;

            const amountPrimaryRes = getAmountPrimaryRes(noticenumber, amountSession1);
            const amountSecondaryRes = getAmountSecondaryRes(noticenumber, amountSession2);

            const paGetPaymentResponse = paGetPaymentRes({
             amount: amountRes,
             amountPrimary: /*iban2 === null && (isOver5000 || isUnder1) ? amountSession1 :*/ amountPrimaryRes,
             amountSecondary: amountSecondaryRes,
             amount3: (iban5 ? 10 : iban4 ? 10 : 20).toFixed(2),
             amount4: (iban5 ? 5 : 10).toFixed(2),
             amount5: '5.00',
             creditorReferenceId,
             description:
               avviso05.test(noticenumber) ||
               avviso06.test(noticenumber) ||
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
             fullName:ec.fullName,
             email: ec.email,
             CF: ec.CF,
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
          // return res
          //   .status(customResponse && customResponse.includes('PAA_ERRORE_MOCK') ? 500 : 200)
          //   .send(customResponse);
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
          // return res
          //   .status(customResponse && customResponse.includes('PAA_ERRORE_MOCK') ? 500 : 200)
          //   .send(customResponse);
          if (customResponse !== undefined) {
            const convert = await xml2js.parseStringPromise(customResponse);
            if (convert['soapenv:Envelope']['soapenv:Body']) {
              if (convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaVerificaRPTRisposta']) {
                if (
                  convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaVerificaRPTRisposta'][0].paaVerificaRPTRisposta
                ) {
                  const delay =
                    convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaVerificaRPTRisposta'][0]
                      .paaVerificaRPTRisposta[0].delay;
                  const irraggiungibile =
                    convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaVerificaRPTRisposta'][0]
                      .paaVerificaRPTRisposta[0].irraggiungibile;
                  if (irraggiungibile) {
                    throw new TypeError('irraggiungibile');
                  }
                  if (delay) {
                    logger.info('>>> start timeout');
                    delete convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaVerificaRPTRisposta'][0]
                      .paaVerificaRPTRisposta[0].delay;
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

        log_event_tx(paaVerificaRPTRisposta);
        return res.status(+paaVerificaRPTRisposta[0]).send(paaVerificaRPTRisposta[1]);
      }

      // 6. paaAttivaRPT
      if (soapRequest[paaAttivaRPTreq]) {
        if (paaAttivaRPTQueue.length > 0) {
          const customResponse = paaAttivaRPTQueue.shift();
          logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
          // return res
          //   .status(customResponse && customResponse.includes('PAA_ERRORE_MOCK') ? 500 : 200)
          //   .send(customResponse);
          if (customResponse !== undefined) {
            const convert = await xml2js.parseStringPromise(customResponse);
            if (convert['soapenv:Envelope']['soapenv:Body']) {
              if (convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaAttivaRPTRisposta']) {
                if (convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaAttivaRPTRisposta'][0].paaAttivaRPTRisposta) {
                  const delay =
                    convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaAttivaRPTRisposta'][0].paaAttivaRPTRisposta[0]
                      .delay;
                  const irraggiungibile =
                    convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaAttivaRPTRisposta'][0].paaAttivaRPTRisposta[0]
                      .irraggiungibile;
                  if (irraggiungibile) {
                    throw new TypeError('irraggiungibile');
                  }
                  if (delay) {
                    logger.info('>>> start timeout');
                    delete convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaAttivaRPTRisposta'][0]
                      .paaAttivaRPTRisposta[0].delay;
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

        log_event_tx(paaAttivaRPTRisposta);
        return res.status(+paaAttivaRPTRisposta[0]).send(paaAttivaRPTRisposta[1]);
      }

      // 6. paaInviaRT
      if (soapRequest[paaInviaRTreq]) {
        if (paaInviaRTQueue.length > 0) {
          const customResponse = paaInviaRTQueue.shift();
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

      // 7. paDemandPaymentNotice
      if (soapRequest[paDemandPaymentNoticereq]) {
        if (paDemandPaymentNoticeQueue.length > 0) {
          const customResponse = paDemandPaymentNoticeQueue.shift();
          logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
          if (customResponse !== undefined) {
            const convert = await xml2js.parseStringPromise(customResponse);
            if (convert['soapenv:Envelope']['soapenv:Body']) {
              if (convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paDemandPaymentNoticeResponse']) {
                const delay =
                  convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paDemandPaymentNoticeResponse'][0].delay;
                const irraggiungibile =
                  convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paDemandPaymentNoticeResponse'][0]
                    .irraggiungibile;
                if (irraggiungibile) {
                  throw new TypeError('irraggiungibile');
                }
                if (delay) {
                  logger.info('>>> start timeout');
                  delete convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paDemandPaymentNoticeResponse'][0].delay;
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
        log_event_tx(paDemandPaymentNoticeRisposta);
        return res.status(+paDemandPaymentNoticeRisposta[0]).send(paDemandPaymentNoticeRisposta[1]);
      }

      // 8. paaChiediNumeroAvviso
      if (soapRequest[paaChiediNumeroAvvisoreq]) {
        if (paaChiediNumeroAvvisoQueue.length > 0) {
          const customResponse = paaChiediNumeroAvvisoQueue.shift();
          logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
          if (customResponse !== undefined) {
            const convert = await xml2js.parseStringPromise(customResponse);
            if (convert['soapenv:Envelope']['soapenv:Body']) {
              if (convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaChiediNumeroAvvisoRisposta']) {
                if (
                  convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaChiediNumeroAvvisoRisposta'][0]
                    .paaChiediNumeroAvvisoRisposta
                ) {
                  const delay =
                    convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaChiediNumeroAvvisoRisposta'][0]
                      .paaChiediNumeroAvvisoRisposta[0].delay;
                  const irraggiungibile =
                    convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaChiediNumeroAvvisoRisposta'][0]
                      .paaChiediNumeroAvvisoRisposta[0].irraggiungibile;
                  if (irraggiungibile) {
                    throw new TypeError('irraggiungibile');
                  }
                  if (delay) {
                    logger.info('>>> start timeout');
                    delete convert['soapenv:Envelope']['soapenv:Body'][0]['ws:paaChiediNumeroAvvisoRisposta'][0]
                      .paaChiediNumeroAvvisoRisposta[0].delay;
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
        log_event_tx(paaChiediNumeroAvvisoRisposta);
        return res.status(+paaChiediNumeroAvvisoRisposta[0]).send(paaChiediNumeroAvvisoRisposta[1]);
      }

      // 9. paGetPaymentV2
      if (soapRequest[paGetPaymentV2req]) {
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
        const paGetPaymentV2Request = soapRequest[paGetPaymentV2req][0];
        const noticenumber: string = paGetPaymentV2Request.qrcode[0].noticenumber;
        const creditorReferenceId = noticenumber[0].substring(1);
        if (avviso00.test(noticenumber)) {
          console.log("AVVISO 00");
          const paActivate00res = paActivate00V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate00res[0]).send(paActivate00res[1]);
        } else if (avviso01.test(noticenumber)) {
          console.log("AVVISO 01");
          const paActivate01res = paActivate01V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate01res[0]).send(paActivate01res[1]);
        } else if (avviso02.test(noticenumber)) {
          console.log("AVVISO 02");
          const paActivate02res = paActivate02V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate02res[0]).send(paActivate02res[1]);
        } else if (avviso03.test(noticenumber)) {
          console.log("AVVISO 03");
          const paActivate03res = paActivate03V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate03res[0]).send(paActivate03res[1]);
        } else  if (avviso04.test(noticenumber)) {
          console.log("AVVISO 04");
          const paActivate04res = paActivate04V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate04res[0]).send(paActivate04res[1]);
        } else if (avviso05.test(noticenumber)) {
          console.log("AVVISO 05");
          const paActivate05res = paActivate05V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate05res[0]).send(paActivate05res[1]);
        } else if (avviso06.test(noticenumber)) {
          console.log("AVVISO 06");
          const paActivate06res = paActivate06V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate06res[0]).send(paActivate06res[1]);
        } else if (avviso07.test(noticenumber)) {
          console.log("AVVISO 07");
          const paActivate07res = paActivate07V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate07res[0]).send(paActivate07res[1]);
        } else if (avviso08.test(noticenumber)) {
          console.log("AVVISO 08");
          const paActivate08res = paActivate08V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate08res[0]).send(paActivate08res[1]);
        } else if (avviso09.test(noticenumber)) {
          console.log("AVVISO 09");
          const paActivat09res = paActivate09V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivat09res[0]).send(paActivat09res[1]);
        } else if (avviso10.test(noticenumber)) {
          console.log("AVVISO 10");
          const paActivate100res = paActivate10V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate100res[0]).send(paActivate100res[1]);
        } else if (avviso11.test(noticenumber)) {
          console.log("AVVISO 11");
          const paActivate11res = paActivate11V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate11res[0]).send(paActivate11res[1]);
        } else if (avviso12.test(noticenumber)) {
          console.log("AVVISO 12");
          const paActivate12res = paActivate12V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate12res[0]).send(paActivate12res[1]);
        } else if (avviso13.test(noticenumber)) {
          console.log("AVVISO 13");
          const paActivate13res = paActivate13V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate13res[0]).send(paActivate13res[1]);
        } else if (avviso14.test(noticenumber)) {
          console.log("AVVISO 14");
          const paActivate14res = paActivate14V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate14res[0]).send(paActivate14res[1]);
        } else if (avviso15.test(noticenumber)) {
          console.log("AVVISO 15");
          const paActivate15res = paActivate15V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate15res[0]).send(paActivate15res[1]);
        } else if (avviso16.test(noticenumber)) {
          console.log("AVVISO 16");
          const paActivate16res = paActivate16V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate16res[0]).send(paActivate16res[1]);
        } else  if (avviso17.test(noticenumber)) {
          console.log("AVVISO 17");
          const paActivate17res = paActivate17V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate17res[0]).send(paActivate17res[1]);
        } else if (avviso18.test(noticenumber)) {
           console.log("AVVISO 18");
          const paActivate18res = paActivate18V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate18res[0]).send(paActivate18res[1]);
        } else if (avviso19.test(noticenumber)) {
           console.log("AVVISO 19");
          const paActivate19res = paActivate19V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate19res[0]).send(paActivate19res[1]);
        } else if (avviso20.test(noticenumber)) {
           console.log("AVVISO 20");
          const paActivate20res = paActivate20V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate20res[0]).send(paActivate20res[1]);
        } else if (avviso21.test(noticenumber)) {
           console.log("AVVISO 21");
          const paActivate21res = paActivate21V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate21res[0]).send(paActivate21res[1]);
        } else if (avviso22.test(noticenumber)) {
           console.log("AVVISO 22");
          const paActivate22res = paActivate22V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate22res[0]).send(paActivate22res[1]);
        } else if (avviso23.test(noticenumber)) {
           console.log("AVVISO 23");
          const paActivate23res = paActivate23V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate23res[0]).send(paActivate23res[1]);
        } else if (avviso24.test(noticenumber)) {
           console.log("AVVISO 24");
          const paActivate24res = paActivate24V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate24res[0]).send(paActivate24res[1]);
        } else if (avviso25.test(noticenumber)) {
           console.log("AVVISO 25");
          const paActivate25res = paActivate25V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate25res[0]).send(escapeHtml(paActivate25res[1]));
        } else if (avviso26.test(noticenumber)) {
           console.log("AVVISO 26");
          const paActivate26res = paActivate26V2({
            creditorReferenceId,
            ec
          });
          return res.status(paActivate26res[0]).send(paActivate26res[1]);
        } else if (avviso27.test(noticenumber)) {
           console.log("AVVISO 27");
          const activateResponse = paActivate27({ creditorReferenceId , ec});
          res.type('text/xml');
          return res.status(activateResponse[0]).send(activateResponse[1]);
        } else if (avvisoPagamentoDuplicato.test(noticenumber)) {
          const paActivateDuplicatoRes = paActivatePagamentoDuplicatoV2({ creditorReferenceId , ec});
          return res.status(paActivateDuplicatoRes[0]).send(paActivateDuplicatoRes[1]);
        }

        log_event_tx(paGetPaymentV2Response);
        return res.status(+paGetPaymentV2Response[0]).send(paGetPaymentV2Response[1]);
      }

      // 10. paSendRTV2
      if (soapRequest[paSendRTV2req]) {
        if (paSendRTV2Queue.length > 0) {
          const customResponse = paSendRTV2Queue.shift();
          logger.info(`>>> tx customResponse RESPONSE [${customResponse}]: `);
          if (customResponse !== undefined) {
            const convert = await xml2js.parseStringPromise(customResponse);
            if (convert['soapenv:Envelope']['soapenv:Body']) {
              if (convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paSendRTV2Response']) {
                const delay = convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paSendRTV2Response'][0].delay;
                const irraggiungibile =
                  convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paSendRTV2Response'][0].irraggiungibile;
                if (irraggiungibile) {
                  throw new TypeError('irraggiungibile');
                }
                if (delay) {
                  logger.info('>>> start timeout');
                  delete convert['soapenv:Envelope']['soapenv:Body'][0]['paf:paSendRTV2Response'][0].delay;
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
        log_event_tx(paSendRTV2Response);
        return res.status(+paSendRTV2Response[0]).send(paSendRTV2Response[1]);
      }

      if (
        !(
          soapRequest[sentReceipt] ||
          soapRequest[activateSoapRequest] ||
          soapRequest[verifySoapRequest] ||
          soapRequest[paaVerificaRPTreq] ||
          soapRequest[paaAttivaRPTreq] ||
          soapRequest[paaInviaRTreq] ||
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
