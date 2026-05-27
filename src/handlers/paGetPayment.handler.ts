import { ritorno } from "./dispatcher";
import { Configuration } from "../config";
import { log_event_tx, logger } from "../utils/logger";
import * as xml2js from 'xml2js';
import {
  amount2,
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
  avvisoErrore,
  avvisoPagamentoDuplicato,
  avvisoScaduto,
  avvisoTimeout,
  descriptionAll,
  descriptionMono,
  onBollettino,
  
} from '../utils/configuration';

import {
  getPaActivate,
  IECConfig,
} from '../fixtures/fixActivateResponse';
import { getAmount, getAmountPrimaryRes, getAmountSecondaryRes, getIbanAvviso, PAA_PAGAMENTO_DUPLICATO, PAA_PAGAMENTO_IN_CORSO, PAA_PAGAMENTO_SCADUTO, PAA_PAGAMENTO_SCONOSCIUTO, POSITIONS_STATUS, validNotice } from "../utils/helper";
import { paErrorVerify, paGetPaymentRes } from "../fixtures/nodoNewMod3Responses";

export const handlePaGetPayment = async (
  config: Configuration,
  paGetPaymentQueue = new Array<string>(),
  paGetPayment: any,
  req: any,
  res: any,
  dbAmounts: Map<string, number>,
  db:  Map<string, POSITIONS_STATUS>,
  noticenumberRequests: Map<string, JSON>,
  noticenumberResponses: Map<string, JSON>,
): Promise<void> => {

    const faultId = '77777777777';

    const TIMEOUT_SEC = config.PA_MOCK.NM3_DATA.TIMETOUT_SEC;
    const amount1 = 100.0;
    
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

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    
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
       
    const fiscalcode = paGetPayment.qrcode[0].fiscalcode;
    const noticenumber: string = paGetPayment.qrcode[0].noticenumber[0];
    const creditorReferenceId = noticenumber.substring(1);

    const avvisoMappings: Array<[RegExp, string]> = [
        [avviso00, "00"],
        [avviso01, "01"],
        [avviso02, "02"],
        [avviso03, "03"],
        [avviso04, "04"],
        [avviso05, "05"],
        [avviso06, "06"],
        [avviso07, "07"],
        [avviso08, "08"],
        [avviso09, "09"],
        [avviso10, "10"],
        [avviso11, "11"],
        [avviso12, "12"],
        [avviso13, "13"],
        [avviso14, "14"],
        [avviso15, "15"],
        [avviso16, "16"],
        [avviso17, "17"],
        [avviso18, "18"],
        [avviso19, "19"],
        [avviso20, "20"],
        [avviso21, "21"],
        [avviso22, "22"],
        [avviso23, "23"],
        [avviso24, "24"],
        [avviso25, "25"],
        [avviso26, "26"],
        [avviso27, "27"],
        [avvisoPagamentoDuplicato, "Duplicato"],
    ];

    const match = avvisoMappings.find(([pattern]) => pattern.test(noticenumber));
    if (match) {
        const [, code] = match;
        return res.status(200).send(getPaActivate(code, ec)(req.body)[1]);
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
        let auxDigit;
        if(db){
         auxDigit = db.get(noticenumber[0]); // get status
        }
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