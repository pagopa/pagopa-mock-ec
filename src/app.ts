/* eslint-disable sonarjs/cognitive-complexity */
import * as express from 'express';
import * as bodyParserXml from 'express-xml-bodyparser';
import * as morgan from 'morgan';
import * as xml2js from 'xml2js';

import bodyParser = require('body-parser');

import escapeHtml = require('escape-html');
import { Configuration } from './config';

import {
  avviso1,
  avviso2,
  avviso3,
  avviso4,
  avviso5,
  avviso6,
  avviso5smart,
  avviso7,
  avviso8,
  avviso9,
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
  avviso28,
  avvisoOver5000,
  avvisoUnder1,
  avvisoPagamentoDuplicato,
  avvisoErroreXSD,
  avvisoErrore,
  avvisoTimeout,
  avvisoScaduto,
  amount1,
  amount1bis,
  amount2,
  amount2bis,
  amount1Over,
  amount2Over,
  amount1Under,
  amount2Under,
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
  getRandomArbitrary,
  getTypeIban,
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
  paVerifyOK,
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
  paActivate25,
  //paActivate26,
  paEdgeCase,
} from './fixtures/fixActivateResponse';

import {
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
  const TIMEOUT_SEC = config.PA_MOCK.NM3_DATA.TIMETOUT_SEC

  const email = config.PA_MOCK.NM3_DATA.USER_EMAL;
  const fullName = config.PA_MOCK.NM3_DATA.USER_FULL_NAME;
  const CF = config.PA_MOCK.NM3_DATA.USER_CF;

  const CCPostPrimaryEC : string = config.PA_MOCK.NM3_DATA.CC_POST_PRIMARY_EC;
  const CCBankPrimaryEC = config.PA_MOCK.NM3_DATA.CC_BANK_PRIMARY_EC;
  const CCPostSecondaryEC = config.PA_MOCK.NM3_DATA.CC_POST_SECONDARY_EC;
  const CCBankSecondaryEC = config.PA_MOCK.NM3_DATA.CC_BANK_SECONDARY_EC;
  const CCBankThirdEC = config.PA_MOCK.NM3_DATA.CC_BANK_THIRD_EC;
  const testDebug = config.PA_MOCK.TEST_DEBUG;
  const transferCategory1 = "0101101IM";
  const transferCategory2 = "0201102IM";

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

        /* paVerifyOK is  with default value {
                                                outcome = "OK",
                                                amount = "120.00",
                                                options = "EQ",
                                                dueDate = "2030-07-31",
                                                detailDescription ="pagamentoTest",
                                                companyName = "companyName",
                                                allCCP = true,
                                                paymentDescription = "Pagamento di Test",
                                                fiscalCodePA ="77777777777",
                                                officeName ="officeName"
                                              } 
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
          xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
          <soapenv:Header />
          <soapenv:Body>
              <paf:paVerifyPaymentNoticeRes>
                  <outcome>OK</outcome>
                  <paymentList>
                      <paymentOptionDescription>
                          <amount>${amount}</amount>
                          <options>EQ</options>
                          <dueDate>${dueDate}</dueDate>
                          <detailDescription>pagamentoTest</detailDescription>
                          <allCCP>${allCCP}</allCCP>
                      </paymentOptionDescription>
                  </paymentList>
                  <paymentDescription>Pagamento di Test</paymentDescription>
                  <fiscalCodePA>77777777777</fiscalCodePA>
                  <companyName>${companyName}</companyName>
                  <officeName>officeName</officeName>
              </paf:paVerifyPaymentNoticeRes>
          </soapenv:Body>
        </soapenv:Envelope>`;
        */
        const paVerify17 = paVerifyOK({ allCCP: true });
        const paVerify18 = paVerifyOK({ allCCP: false });
        const paVerify19 = paVerifyOK({ allCCP: false });
        const paVerify20 = paVerifyOK({ allCCP: false });
        const paVerify21 = paVerifyOK({ allCCP: false });
        const paVerify22 = paVerifyOK({ allCCP: true });
        const paVerify23 = paVerifyOK({ allCCP: true, companyName: "Veeery long company PA name which fills all available 140 characters, (are you still reading? You should not stare at a screen for too long)" });
        const paVerify24 = paVerifyOK({ allCCP: true, dueDate: "2030-07-31+02:00" });
        const paVerify25 = paVerifyOK({ amount: "999999999.99", dueDate: "2030-07-31+02:00" });
        const paVerify26 = paVerifyOK({ amount: "3000.00", dueDate: "2030-07-31+02:00" });

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
        } else if (avviso26.test(noticenumber)) {
          return res.status(200).send(paVerify25);
        } else if (avviso27.test(noticenumber)) {
          return res.status(200).send(paVerify26);
        } else if (avviso28.test(noticenumber)) {
          // same verify resp as avviso24
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
        const noticeRegexList = [avviso1, avviso2, avviso3, avviso4, avviso5,avviso6, avviso7, avviso8, avviso9, avviso10,
                                 avviso11, avviso12, avviso13,   avviso14, avviso15,avviso16, avviso17, avviso24, avviso25, 
                                 avviso26,avviso27, avviso28, avvisoOver5000, avvisoUnder1 ];  


       /* const isValidNotice =
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
          avviso26.test(noticenumber) ||
          avviso27.test(noticenumber) ||
          avviso28.test(noticenumber) ||
          avvisoOver5000.test(noticenumber) ||
          avvisoUnder1.test(noticenumber);
          */

        const isValidNotice = noticeRegexList.some(regex => regex.test(noticenumber));  

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

        console.log("dbAmounts",dbAmounts);

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
          const paErrorVerifyResponse = paErrorVerify({ typeR: 'paVerifyPaymentNoticeRes', faultCode: "EC Station not reacheable", description:"EC Station not reacheable" });
          log_event_tx(paErrorVerifyResponse);
          return res.status(paErrorVerifyResponse[0]).send(paErrorVerifyResponse[1]);
        }

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
        if (avviso18.test(noticenumber)) {
          const paActivate17res = paActivate17({
            creditorReferenceId: creditorReferenceId,
            CCPost1: CCPostPrimaryEC,
            CCPost2: CCPostSecondaryEC,
            transferCategory1: transferCategory1,
            transferCategory2: transferCategory2
          });
          return res.status(paActivate17res[0]).send(paActivate17res[1]);
        } else if (avviso19.test(noticenumber)) {
          const paActivate18res = paActivate18({
            creditorReferenceId,
            CCPost1:CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
          });
          return res.status(paActivate18res[0]).send(paActivate18res[1]);
        } else if (avviso20.test(noticenumber)) {
          const paActivate19res = paActivate19({
            creditorReferenceId,
            CCPost1:CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
            CCBank2:CCBankSecondaryEC,
          });
          return res.status(paActivate19res[0]).send(paActivate19res[1]);
        } else if (avviso21.test(noticenumber)) {
          const paActivate20res = paActivate20({
            creditorReferenceId,
            CCPost1:CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
          });
          return res.status(paActivate20res[0]).send(paActivate20res[1]);
        } else if (avviso22.test(noticenumber)) {
          const paActivate21res = paActivate21({
            creditorReferenceId,
            CCPost1: CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
            transferCategory1: transferCategory1,
            transferCategory2: transferCategory2
          });
          return res.status(paActivate21res[0]).send(paActivate21res[1]);
        } else if (avviso23.test(noticenumber)) {
          const paActivate22res = paActivate22({
            creditorReferenceId,
            CCPost1:CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
            CCBank2:CCBankSecondaryEC,
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
            CCPost1:CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
            transferCategory1: transferCategory1,
            transferCategory2: transferCategory2
          });
          return res.status(paActivate24res[0]).send(paActivate24res[1]);
        } else if (avviso26.test(noticenumber)) {
          const paActivate25res = paActivate25({
            creditorReferenceId,
            CCBank1: CCBankPrimaryEC,
          });
          return res.status(paActivate25res[0]).send(paActivate25res[1]);
        } else if (avviso28.test(noticenumber)) {
          const paActivate27res = paActivate27({
            creditorReferenceId,
            CCPost1:CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
            transferCategory1: transferCategory1,
            transferCategory2: transferCategory2
          });
          return res.status(paActivate27res[0]).send(paActivate27res[1]);
        } else if (avvisoPagamentoDuplicato.test(noticenumber)) {
          const paActivateDuplicatoRes = paEdgeCase({
            faultCode:"PAA_PAGAMENTO_DUPLICATO",
            faultString:"Errore mockato - caso PAA_PAGAMENTO_DUPLICATO"
          });
          return res.status(paActivateDuplicatoRes[0]).send(paActivateDuplicatoRes[1]);
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

        console.log("isValidNotice ",isValidNotice);
        console.log("isExpiredNotice ", isExpiredNotice);
        console.log("isTimeout ",isTimeout);

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
          }, (+TIMEOUT_SEC)*1000);
        } else {
          const auxDigit = db.get(noticenumber[0]); // get status
           console.log("auxDigit ",auxDigit);
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
 console.log("idIbanAvviso ",idIbanAvviso,);
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
             // eslint-disable-next-line functional/no-let
            let remittanceInformation3Bollettino = '';
            // eslint-disable-next-line functional/no-let
            let remittanceInformation4Bollettino = '';
             // eslint-disable-next-line functional/no-let
            let remittanceInformation5Bollettino = '';

            let typeIban1 = getTypeIban(noticenumber,1);

            let typeIban2 = getTypeIban(noticenumber,2);

            let typeIban3 = getTypeIban(noticenumber,3);

            let typeIban4 = getTypeIban(noticenumber,4);

            let typeIban5 = getTypeIban(noticenumber,5);

            switch (idIbanAvviso) {
              case 0: // CCPost + CCPost
              case 6: // CCPost + CCPost
                iban1 = CCPostPrimaryEC;
                iban2 = CCPostSecondaryEC;
                remittanceInformation1Bollettino = onBollettino + typeIban1;
                remittanceInformation2Bollettino = onBollettino + typeIban2;
                break;
              case 1: // CCPost + CCBank
              case 7: //  CCPost + CCBank
                iban1 = CCPostPrimaryEC;
                iban2 = CCBankSecondaryEC;
                remittanceInformation1Bollettino = onBollettino + typeIban1;
                remittanceInformation2Bollettino = onBollettino + typeIban2;
                break;
              case 14: // CCPost + CCBank + CCBank
                iban1 = CCPostPrimaryEC;
                iban2 = CCBankSecondaryEC;
                iban3 = CCBankThirdEC;
                remittanceInformation1Bollettino = onBollettino + typeIban1;
                remittanceInformation2Bollettino = onBollettino + typeIban2;
                remittanceInformation3Bollettino = onBollettino + typeIban3;
                break;
              case 15: // CCPost + CCBank + CCBank + CCBank
                iban1 = CCPostPrimaryEC;
                iban2 = CCBankSecondaryEC;
                iban3 = CCBankThirdEC;
                iban4 = CCBankSecondaryEC;
                remittanceInformation1Bollettino = onBollettino + typeIban1;
                remittanceInformation2Bollettino = onBollettino + typeIban2;
                remittanceInformation3Bollettino = onBollettino + typeIban3;
                remittanceInformation4Bollettino = onBollettino + typeIban4;
                break;
              case 16: // CCPost + CCBank + CCBank + CCBank + CCBank
                iban1 = CCPostPrimaryEC;
                iban2 = CCBankSecondaryEC;
                iban3 = CCBankThirdEC;
                iban4 = CCBankSecondaryEC;
                iban5 = CCBankSecondaryEC;
                remittanceInformation1Bollettino = onBollettino + typeIban1;
                remittanceInformation2Bollettino = onBollettino + typeIban2;
                remittanceInformation3Bollettino = onBollettino + typeIban3;
                remittanceInformation4Bollettino = onBollettino + typeIban4;
                remittanceInformation5Bollettino = onBollettino + typeIban5;
                break;
              case 2: // CCBank + CCPost
              case 8: // CCBank + CCPost
                iban1 = CCBankPrimaryEC;
                iban2 = CCPostSecondaryEC;
                remittanceInformation1Bollettino = onBollettino + typeIban1;
                remittanceInformation2Bollettino = onBollettino + typeIban2;
                break;
              case 3: // CCBank + CCBank
              case 9: // CCBank + CCBank
                iban1 = CCBankPrimaryEC;
                iban2 = CCBankSecondaryEC;
                remittanceInformation1Bollettino = onBollettino + typeIban1;
                remittanceInformation2Bollettino = onBollettino + typeIban2;
                break;
              case 4: // CCPost - Monobeneficiario
              case 10: // CCPost - Monobeneficiario
                iban1 = CCPostPrimaryEC;
                remittanceInformation1Bollettino = onBollettino + typeIban1;
                break;
              case 5: // CCBank - Monobeneficiario
              case 11: // CCBank - Monobeneficiario
                iban1 = CCBankPrimaryEC ;
                remittanceInformation1Bollettino = onBollettino + typeIban1;
                break;
              default:
                // The SOAP Request not implemented
                res.status(404).send('Not found iban');
            }

            const isOver5000 = avvisoOver5000.test(noticenumber);
            const isUnder1 = avvisoUnder1.test(noticenumber);

            // eslint-disable-next-line functional/no-let
            const amountRes = getAmount(noticenumber, dbAmounts);

            const amountSession = dbAmounts.has(noticenumber[0]) ? dbAmounts.get(noticenumber[0]) : 0;
            const amountSession1 = amountSession ? amountSession / 2 : 0;
            const amountSession2 = amountSession ? amountSession - amountSession1 : 0;

            const amountPrimaryRes = getAmountPrimaryRes(noticenumber, amountSession1);
            const amountSecondaryRes = getAmountSecondaryRes(noticenumber, amountSession2);

            const paGetPaymentResponse = paGetPaymentRes({
             amount: amountRes,
             amountPrimary: iban2 === null && (isOver5000 || isUnder1) ? amountSession1 : amountPrimaryRes,
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
             remittanceInformation3Bollettino,
             remittanceInformation4Bollettino,
             remittanceInformation5Bollettino,
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
        if (avviso18.test(noticenumber)) {
          const paActivate17res = paActivate17V2({
            creditorReferenceId,
            CCPost1: CCPostPrimaryEC,
            CCPost2: CCPostSecondaryEC,
            transferCategory1: transferCategory1,
            transferCategory2: transferCategory2
          });
          return res.status(paActivate17res[0]).send(paActivate17res[1]);
        } else if (avviso19.test(noticenumber)) {
          const paActivate18res = paActivate18V2({
            creditorReferenceId,
            CCPost1:CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
          });
          return res.status(paActivate18res[0]).send(paActivate18res[1]);
        } else if (avviso20.test(noticenumber)) {
          const paActivate19res = paActivate19V2({
            creditorReferenceId,
            CCPost1:CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
            CCBank2:CCBankSecondaryEC,
          });
          return res.status(paActivate19res[0]).send(paActivate19res[1]);
        } else if (avviso21.test(noticenumber)) {
          const paActivate20res = paActivate20V2({
            creditorReferenceId,
            CCPost1:CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
          });
          return res.status(paActivate20res[0]).send(paActivate20res[1]);
        } else if (avviso22.test(noticenumber)) {
          const paActivate21res = paActivate21V2({
            creditorReferenceId,
            CCPost1: CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
            transferCategory1: transferCategory1,
            transferCategory2: transferCategory2
          });
          return res.status(paActivate21res[0]).send(paActivate21res[1]);
        } else if (avviso23.test(noticenumber)) {
          const paActivate22res = paActivate22V2({
            creditorReferenceId,
            CCPost1:CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
            CCBank2:CCBankSecondaryEC,
          });
          return res.status(paActivate22res[0]).send(paActivate22res[1]);
        } else if (avviso24.test(noticenumber)) {
          const paActivate23res = paActivate23V2({
            creditorReferenceId,
          });
          return res.status(paActivate23res[0]).send(paActivate23res[1]);
        } else if (avviso25.test(noticenumber)) {
          const paActivate24res = paActivate24V2({
            creditorReferenceId,
            CCPost1:CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
            transferCategory1: transferCategory1,
            transferCategory2: transferCategory2
          });
          return res.status(paActivate24res[0]).send(paActivate24res[1]);
        } else if (avviso26.test(noticenumber)) {
          const paActivate25res = paActivate25V2({
            creditorReferenceId,
            CCBank1: CCBankPrimaryEC,
          });
          return res.status(paActivate25res[0]).send(escapeHtml(paActivate25res[1]));
        } else if (avviso27.test(noticenumber)) {
          const paActivate27res = paActivate26V2({
            creditorReferenceId,
          });
          return res.status(paActivate27res[0]).send(paActivate27res[1]);
        } else if (avviso28.test(noticenumber)) {
          const activateResponse = paActivate27({ 
            creditorReferenceId,
            CCPost1:CCPostPrimaryEC,
            CCBank1: CCBankPrimaryEC,
            transferCategory1: transferCategory1,
            transferCategory2: transferCategory2
          });
          res.type('text/xml');
          return res.status(activateResponse[0]).send(activateResponse[1]);
        } else if (avvisoPagamentoDuplicato.test(noticenumber)) {
          const paActivateDuplicatoRes = paActivatePagamentoDuplicatoV2();
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
