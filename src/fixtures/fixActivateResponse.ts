import escapeHtml = require('escape-html');
import { MockResponse } from './nodoNewMod3Responses';

export interface IECConfig {
  email : string;
  fullName : string;
  CF: string;
  CCPostPrimaryEC: string;
  CCBankPrimaryEC: string;
  CCPostSecondaryEC: string;
  CCBankSecondaryEC: string;
  CCBankThirdEC: string;
}

type MarcaDaBollo = {
  hashDocumento: string;
  tipoBollo: string;
  provinciaResidenza: string;
};

interface ITransfer {
  idTransfer: number;
  transferAmount: string;
  fiscalCodePA?: string;
  iban?: string;
  remittanceInformation?: string;
  transferCategory?: string;
  richiestaMarcaDaBollo?: MarcaDaBollo;
}


export interface IActivateRequest {
  creditorReferenceId?: string;
  amount?: string;
  dueDate?: string;
  description?: string
  companyName?: string;
  officeName?: string;
  entityUniqueIdentifierType?: string;
  entityUniqueIdentifierValue?: string;
  fullName?: string;
  streetName?: string;
  civicNumber?: string;
  postalCode?: string;
  city?: string;
  stateProvinceRegion?: string;
  country?: string;
  email?: string;
  transfers?: ITransfer[];
}


const escape = (v?: string) => escapeHtml(v ?? '');

const buildTransfer = (t: ITransfer): string => {
  const xml = [`<transfer>`,
    `  <idTransfer>${t.idTransfer}</idTransfer>`,
    `  <transferAmount>${escape(t.transferAmount)}</transferAmount>`,
    `  <fiscalCodePA>${escape(t.fiscalCodePA ?? '77777777777')}</fiscalCodePA>`,
    t.iban ? `  <IBAN>${escape(t.iban)}</IBAN>` : null,
    t.richiestaMarcaDaBollo 
    ? `<richiestaMarcaDaBollo>
        <hashDocumento>${escape(t.richiestaMarcaDaBollo.hashDocumento)}</hashDocumento>
        <tipoBollo>${escape(t.richiestaMarcaDaBollo.tipoBollo)}</tipoBollo>
        <provinciaResidenza>${escape(t.richiestaMarcaDaBollo.provinciaResidenza)}</provinciaResidenza>
       </richiestaMarcaDaBollo>` : null,
    `  <remittanceInformation>${escape(t.remittanceInformation ?? 'remittance information')}</remittanceInformation>`,
    `  <transferCategory>${escape(t.transferCategory ?? '0101101IM')}</transferCategory>`,
    `</transfer>`
  ];

  return xml.filter(Boolean).join('\n');
};

const DEFAULT_TRANSFERS: ITransfer[] = [
  { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "", iban: '...' },
  { idTransfer: 2, transferAmount: '20.00', fiscalCodePA: "", iban: '...' },
];


export const paActivate = (params: IActivateRequest): MockResponse => {
  const v2Creditor = (params as any).creditorReferenceId;

  if (v2Creditor) {
    return buildPaGetPaymentResponse(params, v2Creditor,"paGetPaymentV2Response");
  }
  
  const envelope =
    (params as any)['soapenv:envelope'] ||
    (params as any)['soapenv:Envelope'];

  const bodyRaw =
    envelope?.['soapenv:body'] ||
    envelope?.['soapenv:Body'];

  const body = Array.isArray(bodyRaw) ? bodyRaw[0] : bodyRaw;

  const req =
  body?.['pafn:paGetPaymentRequest']?.[0] ||
  body?.['pafn:paGetPaymentV2Request']?.[0] ||
  body?.['pafn:pagetpaymentreq']?.[0] ||   
  body?.['pafn:pagetpaymentv2request']?.[0];

  if (!req) {
    throw new Error("Missing SOAP request (paGetPayment / V2)");
  }

  const qrCode = req?.qrcode?.[0] ?? req?.qrCode?.[0] ?? {};

  const noticenumber =
    qrCode?.noticenumber?.[0] ??
    qrCode?.noticeNumber?.[0];

  if (!noticenumber) {
    throw new Error("Missing noticeNumber (SOAP)");
  }  

  const creditorReferenceId = noticenumber.substring(1);

  return buildPaGetPaymentResponse(params, creditorReferenceId,"paGetPaymentRes");
};

const buildPaGetPaymentResponse = (
  params: IActivateRequest,
  creditorReferenceId: string,
  res:string
): MockResponse => {
  return [
    200,
    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:${res}>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(creditorReferenceId ?? "0200000000001")}</creditorReferenceId>
            <paymentAmount>${params.amount ?? "120.00"}</paymentAmount>
            <dueDate>${escape(params.dueDate ?? "2021-07-31")}</dueDate>
            <description>${escape(params.description ?? "TARI/TEFA 2021")}</description>
            <companyName>${escape(params.companyName ?? "company PA")}</companyName>
            <officeName>${escape(params.officeName ?? "office PA")}</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>${escape(params.entityUniqueIdentifierType ?? "F")}</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>${escape(params.entityUniqueIdentifierValue ?? "JHNDOE00A01F205N")}</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>${escape(params.fullName ?? "John Doe")}</fullName>
                <streetName>${escape(params.streetName ?? "street")}</streetName>
                <civicNumber>${escape(params.civicNumber ?? "12")}</civicNumber>
                <postalCode>${escape(params.postalCode ?? "89020")}</postalCode>
                <city>${escape(params.city ?? "city")}</city>
                <stateProvinceRegion>${escape(params.stateProvinceRegion ?? "MI")}</stateProvinceRegion>
                <country>${escape(params.country ?? "IT")}</country>
                <e-mail>${escape(params.email ?? "john.doe@test.it")}</e-mail>
            </debtor>
            <transferList>${(params.transfers ?? DEFAULT_TRANSFERS).map(buildTransfer).join('')}</transferList>
        </data>
    </paf:${res}>
</soapenv:Body>
</soapenv:Envelope>`
  ];
};

interface AvvisoConfig {  
  creditorReferenceId  ?:string;
  amount?: string;
  dueDate?: string;
  description?:string;
  companyName?: string;
  officeName?: string;
  entityUniqueIdentifierType?: string;
  entityUniqueIdentifierValue?: string;
  fullName?: string;
  streetName?: string;
  civicNumber?: string;
  postalCode?: string;
  city?: string;
  stateProvinceRegion?: string;
  country?: string;
  email?: string;
  allCCP?: boolean;
  transfers?: ITransfer[];

}
export const buildAvvisoConfigs = (ec: IECConfig): Record<string, AvvisoConfig> => {

  

  return {
    '00': {  
        amount:"120.00",
        transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: "01199250158", iban:ec.CCPostSecondaryEC , remittanceInformation:"TEFA Comune Milano su bollettino CCPost", transferCategory:"0201102IM"},
      ], },
    '01': {  
        amount:"120.00",
        transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: "01199250158", iban:ec.CCBankSecondaryEC , remittanceInformation:"TEFA Comune Milano su bollettino CCBank", transferCategory:"0201102IM"},
      ], },
    '02': {  
        amount:"120.00",
        transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "77777777777", iban: ec.CCBankPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCBank", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: "01199250158", iban:ec.CCPostSecondaryEC , remittanceInformation:"TEFA Comune Milano su bollettino CCPost", transferCategory:"0201102IM"},
      ], },
    '03': {  
        amount:"120.00",
        transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "77777777777", iban: ec.CCBankPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCBank", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: "01199250158", iban:ec.CCBankSecondaryEC , remittanceInformation:"TEFA Comune Milano su bollettino CCBank", transferCategory:"0201102IM"},
      ], },
    '04': {  
        amount:"100.00",
        transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
      ], },
    '05': {  
        amount:"100.00",
        transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "77777777777", iban: ec.CCBankPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCBank", transferCategory:"0101101IM"},
      ], },
    '06': {  
        amount:"100.00",
        transfers: [
        { idTransfer: 1, transferAmount: '70.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '30.00',  fiscalCodePA: "01199250158", iban:ec.CCPostSecondaryEC , remittanceInformation:"TEFA Comune Milano su bollettino CCPost", transferCategory:"0201102IM"},
      ], },
    '07': {  
        amount:"100.00",
        transfers: [
        { idTransfer: 1, transferAmount: '70.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '30.00',  fiscalCodePA: "01199250158", iban:ec.CCBankSecondaryEC , remittanceInformation:"TEFA Comune Milano su bollettino CCBank", transferCategory:"0201102IM"},
      ], },
    '08': {  
        amount:"100.00",
        transfers: [
        { idTransfer: 1, transferAmount: '70.00', fiscalCodePA: "77777777777", iban: ec.CCBankPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCBank", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '30.00',  fiscalCodePA: "01199250158", iban:ec.CCPostSecondaryEC , remittanceInformation:"TEFA Comune Milano su bollettino CCPost", transferCategory:"0201102IM"},
      ], },
    '09': {  
        amount:"100.00",
        transfers: [
        { idTransfer: 1, transferAmount: '70.00', fiscalCodePA: "77777777777", iban: ec.CCBankPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCBank", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '30.00',  fiscalCodePA: "01199250158", iban:ec.CCBankSecondaryEC , remittanceInformation:"TEFA Comune Milano su bollettino CCBank", transferCategory:"0201102IM"},
      ], },
    '10': {  
        amount:"70.00",
        transfers: [
        { idTransfer: 1, transferAmount: '70.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
      ], },
    '11': {  
        amount:"70.00",
        transfers: [
        { idTransfer: 1, transferAmount: '70.00', fiscalCodePA: "77777777777", iban: ec.CCBankPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCBank", transferCategory:"0101101IM"},
      ], },
    '12': {  
        amount:"6000.00",
        transfers: [
        { idTransfer: 1, transferAmount: '4000.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '2000.00',  fiscalCodePA: "01199250158", iban:ec.CCBankPrimaryEC , remittanceInformation:"TEFA Comune Milano su bollettino CCBank", transferCategory:"0201102IM"},
      ], },
    '13': {  
        amount:"0.30",
        transfers: [
        { idTransfer: 1, transferAmount: '0.10', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"TARI EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '0.20',  fiscalCodePA: "01199250158", iban:ec.CCBankSecondaryEC , remittanceInformation:"TEFA Comune Milano su bollettino CCBank", transferCategory:"0201102IM"},
      ], },
    '14': {  
        amount:"120.00",
        transfers: [
        { idTransfer: 1, transferAmount: '70.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '30.00', fiscalCodePA: "01199250158", iban:ec.CCBankSecondaryEC , remittanceInformation:"Comune Milano su bollettino CCBank", transferCategory:"0201102IM"},
        { idTransfer: 3, transferAmount: '10.00', fiscalCodePA: "00939820726", iban:ec.CCBankThirdEC , remittanceInformation:"Comune Bitetto su bollettino CCBank", transferCategory:"0201102IM"},
      ], },
    '15': {  
        amount:"120.00",
        transfers: [
        { idTransfer: 1, transferAmount: '70.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '30.00', fiscalCodePA: "01199250158", iban:ec.CCBankSecondaryEC , remittanceInformation:"Comune Milano su bollettino CCBank", transferCategory:"0201102IM"},
        { idTransfer: 3, transferAmount: '10.00', fiscalCodePA: "00939820726", iban: ec.CCBankThirdEC, remittanceInformation:"Comune Bitetto su bollettino CCBank", transferCategory:"0101101IM"},
        { idTransfer: 4, transferAmount: '10.00', fiscalCodePA: "01199250158", iban:ec.CCBankSecondaryEC , remittanceInformation:"Comune Milano su bollettino CCBank", transferCategory:"0201102IM"},
      ], },
    '16': {  
        amount:"120.00",
        transfers: [
        { idTransfer: 1, transferAmount: '70.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '30.00', fiscalCodePA: "01199250158", iban:ec.CCBankSecondaryEC , remittanceInformation:"Comune Milano su bollettino CCBank", transferCategory:"0201102IM"},
        { idTransfer: 3, transferAmount: '10.00', fiscalCodePA: "00939820726", iban: ec.CCBankThirdEC, remittanceInformation:"Comune Bitetto su bollettino CCBank", transferCategory:"0101101IM"},
        { idTransfer: 4, transferAmount: '5.00',  fiscalCodePA: "01199250158", iban:ec.CCBankSecondaryEC , remittanceInformation:"Comune Milano su bollettino CCBank", transferCategory:"0201102IM"},
        { idTransfer: 5, transferAmount: '5.00',  fiscalCodePA: "01199250158", iban:ec.CCBankSecondaryEC , remittanceInformation:"Comune Milano su bollettino CCBank", transferCategory:"0201102IM"},
      ], },
    '17': {  
        amount:"120.00",
        transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: "77777777777", iban:ec.CCPostPrimaryEC , remittanceInformation:"EC_TE su bollettino CCPost", transferCategory:"0201102IM"},
      ], },
    '21': {  
        amount:"120.00",
        transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"EC_TE su bollettino CCPost", transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: "77777777777", iban:ec.CCBankPrimaryEC , remittanceInformation:"EC_TE su bollettino CCBank", transferCategory:"0201102IM"},
     ], },
    '19': {
      amount: "120.00",
      transfers: [
        { idTransfer: 1, transferAmount: '70.00', fiscalCodePA: "77777777777", iban: ec.CCBankPrimaryEC, remittanceInformation:"EC_TE su bollettino CCBank",},
        { idTransfer: 2, transferAmount: '30.00', fiscalCodePA: "77777777777", iban:ec.CCBankPrimaryEC, remittanceInformation:"EC_TE su bollettino CCBank",},
        { idTransfer: 3, transferAmount: '20.00', fiscalCodePA: "77777777777", iban:ec.CCPostPrimaryEC,remittanceInformation:"EC_TE su bollettino CCPost", },
      ],
    },
    '22': {
      amount: "120.00",
      transfers: [
        { idTransfer: 1, transferAmount: '70.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"EC_TE su bollettino CCPost",},
        { idTransfer: 2, transferAmount: '30.00', fiscalCodePA: "77777777777", iban:ec.CCPostPrimaryEC, remittanceInformation:"EC_TE su bollettino CCPost",},
        { idTransfer: 3, transferAmount: '20.00', fiscalCodePA: "77777777777", iban:ec.CCBankPrimaryEC,remittanceInformation:"EC_TE su bollettino CCBank", },
     ],
    },
    '23': {
      amount: "120.00",
      transfers: [
        { idTransfer: 1, transferAmount: '70.00', fiscalCodePA: "77777777777", iban: ec.CCBankPrimaryEC, remittanceInformation:"EC_TE su bollettino CCBank",},
        { idTransfer: 2, transferAmount: '30.00', fiscalCodePA: "77777777777", iban:ec.CCBankPrimaryEC, remittanceInformation:"EC_TE su bollettino CCBank",},
        { idTransfer: 3, transferAmount: '20.00', fiscalCodePA: "77777777777", iban:ec.CCPostPrimaryEC,remittanceInformation:"EC_TE su bollettino CCPost", },
      ],
    },
    '18': {
      amount: "120.00",
      transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "01199250158", iban: ec.CCPostSecondaryEC, remittanceInformation:"Oneri SUAP 1,Comune Milano su bollettino CCPost",},
        { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: "00939820726", iban:ec.CCBankThirdEC, remittanceInformation:"Oneri SUAP 2,Comune Bitetto su bollettino CCBank",},    
      ],
    },
    '20': {
      amount: "120.00",
      transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "01199250158", iban: ec.CCPostSecondaryEC, remittanceInformation:"Oneri SUAP 1,Comune Milano su bollettino CCPost",},
        { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: "01199250158", iban:ec.CCBankSecondaryEC, remittanceInformation:"Oneri SUAP 2,Comune Milano su bollettino CCBank",},    
      ],
    },
   
    '24': {
      amount: "120.00",
      dueDate: '2021-07-31+02:00',
      transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "77777777777", iban: ec.CCPostPrimaryEC, remittanceInformation:"EC_TE su bollettino CCPost",transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: "77777777777", iban:ec.CCBankPrimaryEC, remittanceInformation:"EC_TE su bollettino CCBank", transferCategory:"0201102IM"},    
      ],
    },
    // avviso25: importo massimo
    '25': {
      amount: "999999999.99",
      transfers: [
        { idTransfer: 1, transferAmount: '999999999.99', fiscalCodePA: "77777777777", iban: ec.CCBankPrimaryEC,remittanceInformation:"EC_TE su bollettino CCBank",  },
      ],
    },
    // avviso26: importo 3010
    '26': {
      amount: "3010.00",
      transfers: [
        { idTransfer: 1, transferAmount: '3010.00', fiscalCodePA: "77777777777", iban: ec.CCBankPrimaryEC,remittanceInformation:"EC_TE su bollettino CCBank",  },
      ],
    },
    '27': {
      amount: "120.00",
      transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "01199250158", iban: ec.CCPostSecondaryEC, remittanceInformation:"Comune Milano su bollettino  CCPost",transferCategory:"0101101IM"},
        { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: "01199250158",iban: ec.CCBankSecondaryEC,richiestaMarcaDaBollo: {hashDocumento: 'QUJDRA==', tipoBollo: '01', provinciaResidenza: 'RM'} , remittanceInformation:"Comune Milano su bollettino  CCBank", transferCategory:"0201102IM"},    
   
      ],
    },
    // ...altri casi
  };
};

export const getPaActivate = (suffix: string,ec: IECConfig) =>
  (params: IActivateRequest): MockResponse => {
    const configs = buildAvvisoConfigs(ec);
    const config = configs[suffix] ?? {};
    return paActivate({ ...config, ...params });
  };

export const paActivatePagamentoDuplicato = (): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
    <soapenv:Header />
    <soapenv:Body>
        <paf:paGetPaymentRes>
            <outcome>KO</outcome>
            <fault>
                <faultCode>PAA_PAGAMENTO_DUPLICATO</faultCode>
                <faultString>Errore mockato - caso PAA_PAGAMENTO_DUPLICATO</faultString>
                <id>77777777777</id>
            </fault>
        </paf:paGetPaymentRes>
    </soapenv:Body>
    </soapenv:Envelope>`,
];
