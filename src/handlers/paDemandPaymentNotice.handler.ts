import { ritorno } from "./dispatcher";
import { Configuration } from "../config";
import { paDemandPaymentNoticeRisposta } from "../fixtures/nodoNewMod3Responses_oldEc";
import { ISpontaneousService, spontaneousDueDate, spontaneousServices } from "../utils/configuration";
import { PAA_SINTASSI_XSD, POSITIONS_STATUS } from "../utils/helper";
import { log_event_tx, logger } from "../utils/logger";
import * as crypto from 'crypto';
import * as xml2js from 'xml2js';

const faultId = '77777777777';

const randomDigits = (length: number): string =>
  Array.from(crypto.randomBytes(length), b => (b % 10).toString()).join('');

const field = (node: any, name: string): string | undefined => {
  const value = node?.[name]?.[0];
  const text = typeof value === 'string' ? value : value?._;
  return typeof text === 'string' ? text.trim() : undefined;
};

const isText = (value: string | undefined, min: number, max: number): boolean =>
  value !== undefined && value.length >= min && value.length <= max;

// Returns the detailDescription for valid datiSpecificiServizio, undefined otherwise
const validators: Record<string, (dati: any) => string | undefined> = {
  // TassaAutomobilistica_1_1_0.xsd
  '00004': dati => {
    const veicolo = dati?.tassaAuto?.veicoloConTarga?.[0];
    const tipo = field(veicolo, 'tipoVeicoloTarga');
    const targa = field(veicolo, 'veicoloTarga');
    return tipo && ['1', '2', '4'].includes(tipo) && isText(targa, 7, 8) ? `Tassa automobilistica targa ${targa}` : undefined;
  },
  // A001_Passaporto_1_0_0.xsd
  '00003': dati => {
    const pratica = dati?.pagamentoPratica;
    const pagatore = pratica?.pagatore?.[0];
    const intestatario = pratica?.intestatario?.[0];
    const cfIntestatario = field(intestatario, 'codiceFiscaleIntestatario');
    return field(pratica, 'codicePratica') === 'A001' &&
      !!field(pagatore, 'codiceFiscalePagatore') &&
      isText(field(pagatore, 'denominazionePagatore'), 1, 50) &&
      !!cfIntestatario &&
      isText(field(intestatario, 'denominazioneIntestatario'), 1, 50)
      ? `Passaporto intestatario ${cfIntestatario}`
      : undefined;
  },
};

const parseDatiSpecifici = async (base64: string): Promise<any> => {
  try {
    const xml = Buffer.from(base64, 'base64').toString('utf8');
    return await xml2js.parseStringPromise(xml, { tagNameProcessors: [xml2js.processors.stripPrefix] });
  } catch (e) {
    return undefined;
  }
};

const koResponse = (faultCode: string, faultString: string, description: string) =>
  paDemandPaymentNoticeRisposta({ outcome: 'KO', fault: { faultCode, faultString, id: faultId, description } });

export const handlePaDemandPaymentNotice = async (
  config: Configuration,
  paDemandPaymentNoticeQueue = new Array<string>(),
  paDemandPaymentNotice: any,
  req: any,
  res: any,
  dbAmounts: Map<string, number>,
  db:  Map<string, POSITIONS_STATUS>,
  noticenumberRequests: Map<string, JSON>,
  noticenumberResponses: Map<string, JSON>,
): Promise<void> => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
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

    const idPA = field(paDemandPaymentNotice, 'idpa');
    const idServizio = field(paDemandPaymentNotice, 'idservizio');
    const idSoggettoServizio = field(paDemandPaymentNotice, 'idsoggettoservizio');
    const datiSpecifici = field(paDemandPaymentNotice, 'datispecificiserviziorequest');
    const isValidRequest =
        !!idPA && /^\d{11}$/.test(idPA) &&
        !!field(paDemandPaymentNotice, 'idbrokerpa') &&
        !!field(paDemandPaymentNotice, 'idstation') &&
        idServizio?.length === 5 &&
        idSoggettoServizio?.length === 5 &&
        !!datiSpecifici;

    if (!isValidRequest) {
        const response = koResponse(PAA_SINTASSI_XSD.value, 'messaggio xml non corretto',
            'idPA, idBrokerPA, idStation, idServizio, idSoggettoServizio e datiSpecificiServizioRequest sono obbligatori');
        log_event_tx(response);
        return res.status(response[0]).send(response[1]);
    }

    const service: ISpontaneousService | undefined = spontaneousServices[idServizio!];
    if (!service) {
        const response = koResponse('PAA_SEMANTICA', 'servizio non supportato',
            `idServizio ${idServizio} non supportato (ammessi: ${Object.keys(spontaneousServices).join(', ')})`);
        log_event_tx(response);
        return res.status(response[0]).send(response[1]);
    }

    const detailDescription = validators[idServizio!](await parseDatiSpecifici(datiSpecifici!));
    if (!detailDescription) {
        const response = koResponse(PAA_SINTASSI_XSD.value, 'datiSpecificiServizioRequest non corretto',
            `datiSpecificiServizioRequest non conforme all'XSD del servizio ${idServizio}`);
        log_event_tx(response);
        return res.status(response[0]).send(response[1]);
    }

    const noticeNumber = `302${service.noticeCode}${randomDigits(13)}`;

    const okResponse = paDemandPaymentNoticeRisposta({
        outcome: 'OK',
        fiscalCode: idPA,
        noticeNumber,
        amount: service.amount,
        dueDate: spontaneousDueDate(),
        allCCP: false,
        detailDescription,
        paymentDescription: service.description,
        companyName: service.companyName,
    });

    if (config.PA_MOCK.TEST_DEBUG.toUpperCase() === 'Y') {
        noticenumberRequests.set(`${noticeNumber}_paDemandPaymentNotice`, req.body);
        noticenumberResponses.set(`${noticeNumber}_paDemandPaymentNotice`, await xml2js.parseStringPromise(okResponse[1]));
    }

    log_event_tx(okResponse);
    return res.status(okResponse[0]).send(okResponse[1]);
}