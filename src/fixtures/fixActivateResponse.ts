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

interface ITransfer {
  idTransfer: number;
  transferAmount: string;
  fiscalCodePA?: string;
  iban: string;
  remittanceInformation?: string;
  transferCategory?: string;
}


export interface IActivateRequest {
  creditorReferenceId?: string;
  amount?: number;
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

const buildTransfer = (t: ITransfer): string => `
                <transfer>
                    <idTransfer>${t.idTransfer}</idTransfer>
                    <transferAmount>${escape(t.transferAmount)}</transferAmount>
                    <fiscalCodePA>${escape(t.fiscalCodePA ?? '77777777777')}</fiscalCodePA>
                    <IBAN>${escape(t.iban)}</IBAN>
                    <remittanceInformation>${escape(t.remittanceInformation ?? 'remittance information')}</remittanceInformation>
                    <transferCategory>${escape(t.transferCategory ?? '0101101IM')}</transferCategory>
                </transfer>`;

                const DEFAULT_TRANSFERS: ITransfer[] = [
    { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: "",   iban: 'IT57N0760114800000011050036' },
    { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: "",   iban: 'IT86H0760101000000000001015' },
  ];


export const paActivate = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>${params.amount}</paymentAmount>
            <dueDate>${escape(params.dueDate)}</dueDate>
            <description>${escape(params.description)}</description>
            <companyName>${escape(params.companyName)}</companyName>
            <officeName>${escape(params.officeName)}</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>${escape(params.entityUniqueIdentifierType)}</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>${escape(params.entityUniqueIdentifierValue)}</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>${escape(params.fullName)}</fullName>
                <streetName>${escape(params.streetName)}</streetName>
                <civicNumber>${escape(params.civicNumber)}</civicNumber>
                <postalCode>${escape(params.postalCode)}</postalCode>
                <city>${escape(params.city)}</city>
                <stateProvinceRegion>${escape(params.stateProvinceRegion)}</stateProvinceRegion>
                <country>${escape(params.country)}</country>
                <e-mail>${escape(params.email)}</e-mail>
            </debtor>
            <transferList>
               <transferList>${(params.transfers ?? DEFAULT_TRANSFERS).map(buildTransfer).join('')}
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

interface AvvisoConfig {
  transfers?: ITransfer[];
  amount?: number;
  companyName?: string;
  dueDate?: string;
  allCCP?: boolean;

}
export const buildAvvisoConfigs = (ec: IECConfig): Record<string, AvvisoConfig> => {
  const defaultTransfers: ITransfer[] = [
    { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: ec.CCPostPrimaryEC,   iban: 'IT57N0760114800000011050036' },
    { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: ec.CCBankPrimaryEC,   iban: 'IT86H0760101000000000001015' },
  ];

  return {
    '00': { 
        amount: 120.00,
        companyName: 
        transfers: defaultTransfers },
    '01': { transfers: defaultTransfers, amount: 120.00 },
    // avviso18: transfer con fiscalCodePA diversi
    '18': {
      amount: 120.00,
      transfers: [
        { idTransfer: 1, transferAmount: '100.00', fiscalCodePA: ec.CCPostSecondaryEC, iban: 'IT21Q0760101600000000546200' },
        { idTransfer: 2, transferAmount: '20.00',  fiscalCodePA: ec.CCBankSecondaryEC, iban: 'IT80E0306904013100000046039' },
      ],
    },
    // avviso23: long company name
    '23': {
      amount: 120.00,
      companyName: 'Veeery long company PA name which fills all available 140 characters, (are you still reading? You should not stare at a screen for too long)',
      transfers: defaultTransfers,
    },
    // avviso24: dueDate con timezone
    '24': { transfers: defaultTransfers, amount: 120.00, dueDate: '2021-07-31+02:00' },
    // avviso25: importo massimo
    '25': {
      amount: 999000000.99,
      dueDate: '2021-07-31+02:00',
      transfers: [
        { idTransfer: 1, transferAmount: '999000000.99', fiscalCodePA: ec.CCPostPrimaryEC, iban: 'IT57N0760114800000011050036' },
      ],
    },
    // avviso26: importo 3010
    '26': {
      amount: 3010.00,
      dueDate: '2021-07-31+02:00',
      transfers: [
        { idTransfer: 1, transferAmount: '3010.00', fiscalCodePA: ec.CCPostPrimaryEC, iban: 'IT57N0760114800000011050036' },
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
/*export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate18 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>01199250158</fiscalCodePA>
                    <IBAN>IT21Q0760101600000000546200</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>00939820726</fiscalCodePA>
                    <IBAN>IT80E0306904013100000046039</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate19 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                    <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                    <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>70.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT30N0103076271000001823603</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>30.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT30N0103076271000001823603</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>3</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
    </paf:paGetPaymentRes>
</soapenv:Body>
</soapenv:Envelope>`,
];

export const paActivate20 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
  <soapenv:Header />
  <soapenv:Body>
      <paf:paGetPaymentRes>
          <outcome>OK</outcome>
          <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>01199250158</fiscalCodePA>
                    <IBAN>IT21Q0760101600000000546200</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>01199250158</fiscalCodePA>
                    <IBAN>IT15V0306901783100000300001</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
      </paf:paGetPaymentRes>
  </soapenv:Body>
  </soapenv:Envelope>`,
];

export const paActivate21 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
  <soapenv:Header />
  <soapenv:Body>
      <paf:paGetPaymentRes>
          <outcome>OK</outcome>
          <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>100.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT30N0103076271000001823603</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
      </paf:paGetPaymentRes>
  </soapenv:Body>
  </soapenv:Envelope>`,
];

export const paActivate22 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
  <soapenv:Header />
  <soapenv:Body>
      <paf:paGetPaymentRes>
          <outcome>OK</outcome>
          <data>
            <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
            <paymentAmount>120.00</paymentAmount>
            <dueDate>2021-07-31</dueDate>
            <description>pagamentoTest</description>
            <companyName>company PA</companyName>
            <officeName>office PA</officeName>
            <debtor>
                <uniqueIdentifier>
                <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                </uniqueIdentifier>
                <fullName>Riccitelli Gesualdo</fullName>
                <streetName>stradina Via</streetName>
                <civicNumber>2</civicNumber>
                <postalCode>54321</postalCode>
                <city>borgo</city>
                <stateProvinceRegion>provincia regione</stateProvinceRegion>
                <country>IT</country>
                <e-mail>mail@mail.it</e-mail>
            </debtor>
            <transferList>
                <transfer>
                    <idTransfer>1</idTransfer>
                    <transferAmount>70.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT57N0760114800000011050036</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>30.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT86H0760101000000000001015</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>3</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>IT30N0103076271000001823603</IBAN>
                    <remittanceInformation>remittance information</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
            </transferList>
        </data>
      </paf:paGetPaymentRes>
  </soapenv:Body>
  </soapenv:Envelope>`,
];

export const paActivate23 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
    <soapenv:Header />
    <soapenv:Body>
        <paf:paGetPaymentRes>
            <outcome>OK</outcome>
            <data>
              <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
              <paymentAmount>120.00</paymentAmount>
              <dueDate>2021-07-31</dueDate>
              <description>pagamentoTest</description>
              <companyName>Veeery long company PA name which fills all available 140 characters, (are you still reading? You should not stare at a screen for too long)</companyName>
              <officeName>office PA</officeName>
              <debtor>
                  <uniqueIdentifier>
                  <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                  <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                  </uniqueIdentifier>
                  <fullName>Riccitelli Gesualdo</fullName>
                  <streetName>stradina Via</streetName>
                  <civicNumber>2</civicNumber>
                  <postalCode>54321</postalCode>
                  <city>borgo</city>
                  <stateProvinceRegion>provincia regione</stateProvinceRegion>
                  <country>IT</country>
                  <e-mail>mail@mail.it</e-mail>
              </debtor>
              <transferList>
                  <transfer>
                      <idTransfer>1</idTransfer>
                      <transferAmount>70.00</transferAmount>
                      <fiscalCodePA>77777777777</fiscalCodePA>
                      <IBAN>IT57N0760114800000011050036</IBAN>
                      <remittanceInformation>remittance information</remittanceInformation>
                      <transferCategory>0101101IM</transferCategory>
                  </transfer>
                  <transfer>
                      <idTransfer>2</idTransfer>
                      <transferAmount>30.00</transferAmount>
                      <fiscalCodePA>77777777777</fiscalCodePA>
                      <IBAN>IT86H0760101000000000001015</IBAN>
                      <remittanceInformation>remittance information</remittanceInformation>
                      <transferCategory>0101101IM</transferCategory>
                  </transfer>
                  <transfer>
                      <idTransfer>3</idTransfer>
                      <transferAmount>20.00</transferAmount>
                      <fiscalCodePA>77777777777</fiscalCodePA>
                      <IBAN>IT30N0103076271000001823603</IBAN>
                      <remittanceInformation>remittance information</remittanceInformation>
                      <transferCategory>0101101IM</transferCategory>
                  </transfer>
              </transferList>
          </data>
        </paf:paGetPaymentRes>
    </soapenv:Body>
    </soapenv:Envelope>`,
];

export const paActivate24 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
  <soapenv:Header />
  <soapenv:Body>
      <paf:paGetPaymentRes>
          <outcome>OK</outcome>
          <data>
              <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
              <paymentAmount>120.00</paymentAmount>
              <dueDate>2021-07-31+02:00</dueDate>
              <description>pagamentoTest</description>
              <companyName>company PA</companyName>
              <officeName>office PA</officeName>
              <debtor>
                  <uniqueIdentifier>
                      <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                      <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                  </uniqueIdentifier>
                  <fullName>Riccitelli Gesualdo</fullName>
                  <streetName>stradina Via</streetName>
                  <civicNumber>2</civicNumber>
                  <postalCode>54321</postalCode>
                  <city>borgo</city>
                  <stateProvinceRegion>provincia regione</stateProvinceRegion>
                  <country>IT</country>
                  <e-mail>mail@mail.it</e-mail>
              </debtor>
              <transferList>
                  <transfer>
                      <idTransfer>1</idTransfer>
                      <transferAmount>100.00</transferAmount>
                      <fiscalCodePA>77777777777</fiscalCodePA>
                      <IBAN>IT57N0760114800000011050036</IBAN>
                      <remittanceInformation>remittance information</remittanceInformation>
                      <transferCategory>0101101IM</transferCategory>
                  </transfer>
                  <transfer>
                      <idTransfer>2</idTransfer>
                      <transferAmount>20.00</transferAmount>
                      <fiscalCodePA>77777777777</fiscalCodePA>
                      <IBAN>IT86H0760101000000000001015</IBAN>
                      <remittanceInformation>remittance information</remittanceInformation>
                      <transferCategory>0101101IM</transferCategory>
                  </transfer>
              </transferList>
          </data>
      </paf:paGetPaymentRes>
  </soapenv:Body>
  </soapenv:Envelope>`,
];

export const paActivate25 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
  <soapenv:Header />
  <soapenv:Body>
      <paf:paGetPaymentRes>
          <outcome>OK</outcome>
          <data>
              <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
              <paymentAmount>999000000.99</paymentAmount>
              <dueDate>2021-07-31+02:00</dueDate>
              <description>pagamentoTest</description>
              <companyName>company PA</companyName>
              <officeName>office PA</officeName>
              <debtor>
                  <uniqueIdentifier>
                      <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                      <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                  </uniqueIdentifier>
                  <fullName>Riccitelli Gesualdo</fullName>
                  <streetName>stradina Via</streetName>
                  <civicNumber>2</civicNumber>
                  <postalCode>54321</postalCode>
                  <city>borgo</city>
                  <stateProvinceRegion>provincia regione</stateProvinceRegion>
                  <country>IT</country>
                  <e-mail>mail@mail.it</e-mail>
              </debtor>
              <transferList>
                  <transfer>
                      <idTransfer>1</idTransfer>
                      <transferAmount>999000000.99</transferAmount>
                      <fiscalCodePA>77777777777</fiscalCodePA>
                      <IBAN>IT57N0760114800000011050036</IBAN>
                      <remittanceInformation>remittance information</remittanceInformation>
                      <transferCategory>0101101IM</transferCategory>
                  </transfer>
              </transferList>
          </data>
      </paf:paGetPaymentRes>
  </soapenv:Body>
  </soapenv:Envelope>`,
];

export const paActivate26 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
  <soapenv:Header />
  <soapenv:Body>
      <paf:paGetPaymentRes>
          <outcome>OK</outcome>
          <data>
              <creditorReferenceId>${escape(params.creditorReferenceId)}</creditorReferenceId>
              <paymentAmount>3010.00</paymentAmount>
              <dueDate>2021-07-31+02:00</dueDate>
              <description>pagamentoTest</description>
              <companyName>company PA</companyName>
              <officeName>office PA</officeName>
              <debtor>
                  <uniqueIdentifier>
                      <entityUniqueIdentifierType>F</entityUniqueIdentifierType>
                      <entityUniqueIdentifierValue>RCCGLD63D14H501F</entityUniqueIdentifierValue>
                  </uniqueIdentifier>
                  <fullName>Riccitelli Gesualdo</fullName>
                  <streetName>stradina Via</streetName>
                  <civicNumber>2</civicNumber>
                  <postalCode>54321</postalCode>
                  <city>borgo</city>
                  <stateProvinceRegion>provincia regione</stateProvinceRegion>
                  <country>IT</country>
                  <e-mail>mail@mail.it</e-mail>
              </debtor>
              <transferList>
                  <transfer>
                      <idTransfer>1</idTransfer>
                      <transferAmount>3010.00</transferAmount>
                      <fiscalCodePA>77777777777</fiscalCodePA>
                      <IBAN>IT57N0760114800000011050036</IBAN>
                      <remittanceInformation>remittance information</remittanceInformation>
                      <transferCategory>0101101IM</transferCategory>
                  </transfer>
              </transferList>
          </data>
      </paf:paGetPaymentRes>
  </soapenv:Body>
  </soapenv:Envelope>`,
];*/

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
