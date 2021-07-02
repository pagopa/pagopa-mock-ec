/* eslint-disable sonarjs/cognitive-complexity */
import * as express from 'express';
import * as bodyParserXml from 'express-xml-bodyparser';
import * as morgan from 'morgan';
import { Configuration } from './config';
import { paErrorVerify, paGetPaymentRes, paVerifyPaymentNoticeRes } from './fixtures/nodoNewMod3Responses';
import { StTransferType_type_pafnEnum } from './generated/paForNode_Service/stTransferType_type_pafn';
import { paSendRTHandler } from './handlers/handlers';
import { requireClientCertificateFingerprint } from './middlewares/requireClientCertificateFingerprint';
import {
  getRandomArbitrary,
  PAA_PAGAMENTO_DUPLICATO,
  PAA_PAGAMENTO_IN_CORSO,
  PAA_PAGAMENTO_SCADUTO,
  PAA_PAGAMENTO_SCONOSCIUTO,
  POSITIONS_STATUS,
} from './utils/helper';
import { logger, log_event_tx } from './utils/logger';

const faultId = '77777777777';

const verifySoapRequest = 'pafn:paverifypaymentnoticereq';
const activateSoapRequest = 'pafn:pagetpaymentreq';
const sentReceipt = 'pafn:pasendrtreq';

const avviso1 = new RegExp('^30200.*'); // CCPost + CCPost
const avviso2 = new RegExp('^30201.*'); // CCPost + CCBank
const avviso3 = new RegExp('^30202.*'); // CCBank + CCPost
const avviso4 = new RegExp('^30203.*'); // CCBank + CCBank
const avviso5 = new RegExp('^30204.*'); // CCPost - Monobeneficiario
const avviso6 = new RegExp('^30205.*'); // CCBank - Monobeneficiario
const avviso7 = new RegExp('^30206.*'); // CCPost + CCPost
const avviso8 = new RegExp('^30207.*'); // CCPost + CCBank
const avviso9 = new RegExp('^30208.*'); // CCBank + CCPost
const avviso10 = new RegExp('^30209.*'); // CCBank + CCBank
const avviso11 = new RegExp('^30210.*'); // CCPost - Monobeneficiario
const avviso12 = new RegExp('^30211.*'); // CCBank - Monobeneficiario
const avviso13 = new RegExp('^30212.*'); // come avviso2 - amount1 4000 - amount2 2000
const avviso14 = new RegExp('^30213.*'); // come avviso2 - amount1 0.10 - amount2 0.20
const avvisoOver5000 = new RegExp('^30214.*'); // random over 5000 euro + random su 2 transfers
const avvisoUnder1 = new RegExp('^30215.*'); // random under 1 euro + + random su 2 transfers

const avvisoScaduto = new RegExp('^30299.*'); // PAA_PAGAMENTO_SCADUTO
const avvisoErrore = new RegExp('^30298.*'); // paErrorVerify

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
): Promise<Express.Application> {
  // config params...
  const email = config.PA_MOCK.NM3_DATA.USER_EMAL;
  const fullName = config.PA_MOCK.NM3_DATA.USER_FULL_NAME;
  const CF = config.PA_MOCK.NM3_DATA.USER_CF;

  const CCPostPrimaryEC = config.PA_MOCK.NM3_DATA.CC_POST_PRIMARY_EC;
  const CCBankPrimaryEC = config.PA_MOCK.NM3_DATA.CC_BANK_PRIMARY_EC;
  const CCPostSecondaryEC = config.PA_MOCK.NM3_DATA.CC_POST_SECONDARY_EC;
  const CCBankSecondaryEC = config.PA_MOCK.NM3_DATA.CC_BANK_SECONDARY_EC;

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

  app.use(express.json());
  app.use(express.urlencoded());
  app.use(bodyParserXml({}));

  logger.info(`Path ${config.PA_MOCK.ROUTES.PPT_NODO} ...`);

  // health check
  app.get(`${config.PA_MOCK.ROUTES.PPT_NODO}/api/v1/info`, async (_, res) =>
    res.status(200).send({ status: 'iamalive' }),
  );

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
        const paVerifyPaymentNotice = soapRequest[verifySoapRequest][0];
        const fiscalcode = paVerifyPaymentNotice.qrcode[0].fiscalcode;
        const noticenumber = paVerifyPaymentNotice.qrcode[0].noticenumber;

        const isFixedError = avvisoErrore.test(noticenumber);
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
          avvisoOver5000.test(noticenumber) ||
          avvisoUnder1.test(noticenumber);

        const isExpiredNotice = avvisoScaduto.test(noticenumber);
        const isOver5000 = avvisoOver5000.test(noticenumber);
        const isUnder1 = avvisoUnder1.test(noticenumber);
        const isFixOver = avviso13.test(noticenumber);
        const isFixUnder = avviso14.test(noticenumber);

        const isAmount1 = avviso5.test(noticenumber) || avviso6.test(noticenumber);
        const isAmount1bis = avviso11.test(noticenumber) || avviso12.test(noticenumber);
        const isAmountComplete1 =
          avviso1.test(noticenumber) ||
          avviso2.test(noticenumber) ||
          avviso3.test(noticenumber) ||
          avviso4.test(noticenumber);

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

        const amountRes = isAmount1
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

        dbAmounts.set(noticenumber[0], +amountRes);

        if (isFixedError) { 

          const paErrorVerify_ = paErrorVerify();

          log_event_tx(paErrorVerify_);
          return res.status(paErrorVerify_[0]).send(paErrorVerify_[1]);
        }

        if (!isValidNotice && !isExpiredNotice) {
          // error case PAA_PAGAMENTO_SCONOSCIUTO
          const paVerifyPaymentNoticeResponse = paVerifyPaymentNoticeRes({
            fault: {
              description: 'numero avviso deve iniziare con 302[00|01|02|03|04|05|06|07|08|09|10|11|99]',
              faultCode: PAA_PAGAMENTO_SCONOSCIUTO.value,
              faultString: 'Pagamento in attesa risulta sconosciuto all’Ente Creditore',
              id: faultId,
            },
            outcome: 'KO',
          });

          log_event_tx(paVerifyPaymentNoticeResponse);
          return res.status(paVerifyPaymentNoticeResponse[0]).send(paVerifyPaymentNoticeResponse[1]);
        } else if (isExpiredNotice) {
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
            return res.status(paVerifyPaymentNoticeResponse[0]).send(paVerifyPaymentNoticeResponse[1]);
          }
        }
      }

      // 2. paGetPayment
      if (soapRequest[activateSoapRequest]) {
        const paGetPayment = soapRequest[activateSoapRequest][0];
        const fiscalcode = paGetPayment.qrcode[0].fiscalcode;
        const noticenumber: string = paGetPayment.qrcode[0].noticenumber;
        const creditorReferenceId = noticenumber[0].substring(1);
        // const amount = paGetPayment.amount;
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
          avvisoOver5000.test(noticenumber) ||
          avvisoUnder1.test(noticenumber);

        const isExpiredNotice = avvisoScaduto.test(noticenumber);
        const isOver5000 = avvisoOver5000.test(noticenumber);
        const isUnder1 = avvisoUnder1.test(noticenumber);
        const isFixOver = avviso13.test(noticenumber);
        const isFixUnder = avviso14.test(noticenumber);

        const isAmount1 = avviso5.test(noticenumber) || avviso6.test(noticenumber);
        const isAmount1bis = avviso11.test(noticenumber) || avviso12.test(noticenumber);
        const isAmountComplete1 =
          avviso1.test(noticenumber) ||
          avviso2.test(noticenumber) ||
          avviso3.test(noticenumber) ||
          avviso4.test(noticenumber);

        const isAmountComplete1bis =
          avviso7.test(noticenumber) ||
          avviso8.test(noticenumber) ||
          avviso9.test(noticenumber) ||
          avviso10.test(noticenumber);

        const amountRes = isAmount1
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
          ? dbAmounts.get(noticenumber[0])?.toFixed(2)
          : 0;

        const amountSession = dbAmounts.has(noticenumber[0]) ? dbAmounts.get(noticenumber[0]) : 0;
        const amountSession1 = amountSession ? amountSession / 2 : 0;
        const amountSession2 = amountSession ? amountSession - amountSession1 : 0;
        const amountPrimaryRes = isFixOver
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

        if (!isValidNotice && !isExpiredNotice) {
          // error case
          const paGetPaymentResponse = paGetPaymentRes({
            fault: {
              description: 'numero avviso deve iniziare con 302[00|01|02|03|04|05|06|07|08|09|10|11|99]',
              faultCode: PAA_PAGAMENTO_SCONOSCIUTO.value,
              faultString: 'Pagamento in attesa risulta sconosciuto all’Ente Creditore',
              id: faultId,
            },
            outcome: 'KO',
          });

          log_event_tx(paGetPaymentResponse);
          return res.status(paGetPaymentResponse[0]).send(paGetPaymentResponse[1]);
        } else if (isExpiredNotice) {
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
                ? Math.round(getRandomArbitrary(0, 11))
                : isFixOver || isFixUnder
                ? 1 // Fix Over and Under come avviso2
                : +noticenumber[0].substring(3, 5);
            // eslint-disable-next-line functional/no-let
            let iban1;
            // eslint-disable-next-line functional/no-let
            let iban2;
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
              case 7: // CCPost + CCBank
                iban1 = CCPostPrimaryEC;
                iban2 = CCBankSecondaryEC;
                remittanceInformation1Bollettino = onBollettino;
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
              amountPrimary: iban2 == null ? amountPrimaryRes : (+amountPrimaryRes * 2).toFixed(2),
              amountSecondary: amountSecondaryRes,
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
              outcome: 'OK',
              remittanceInformation1Bollettino,
              remittanceInformation2Bollettino,
              fullName,
              email,
              CF,
            });

            log_event_tx(paGetPaymentResponse);
            return res.status(paGetPaymentResponse[0]).send(paGetPaymentResponse[1]);
          }
        }
      }

      // 3. paSendRT
      if (soapRequest[sentReceipt]) {
        const paSendRTResponse = paSendRTHandler(soapRequest, db);
        return res.status(paSendRTResponse[0]).send(paSendRTResponse[1]);
      }

      // The SOAP Request not implemented
      logger.info(`The SOAP Request ${JSON.stringify(soapRequest)} not implemented`);
      res.status(404).send('Not found');
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
