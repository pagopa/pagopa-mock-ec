import escapeHtml = require('escape-html');
import { MockResponse } from './nodoNewMod3Responses';

interface IActivateRequest {
  creditorReferenceId?: string;
  CCPost1?: string;
  CCPost2?: string;
  CCBank1?: string;
  CCBank2?: string;
  transferCategory1?: string;
  transferCategory2?: string;
  faultCode?:string;
  faultString?:string;

}

const escape = (v?: string) => escapeHtml(v ?? '');

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
                    <IBAN>${escape(params.CCPost1)}</IBAN>
                    <remittanceInformation>CC EC_TE - CCPost</remittanceInformation>
                    <transferCategory>${escape(params.transferCategory1)}</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>${escape(params.CCPost2)}</IBAN>
                    <remittanceInformation>CC EC_TE - CCPost</remittanceInformation>
                    <transferCategory>${escape(params.transferCategory2)}</transferCategory>
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
                    <IBAN>${escape(params.CCPost1)}</IBAN>
                    <remittanceInformation> Oneri SUAP 1 CC Comune di Milano - CCPost</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>00939820726</fiscalCodePA>
                    <IBAN>${escape(params.CCBank1)}</IBAN>
                    <remittanceInformation> Oneri SUAP 2 CC Comune di Bitetto - CCBank</remittanceInformation>
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
                    <IBAN>${escape(params.CCBank1)}</IBAN>
                    <remittanceInformation>CC EC_TE - CCBank</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>30.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>${escape(params.CCBank2)}</IBAN>
                    <remittanceInformation>CC EC_TE CCBanK</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>3</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>${escape(params.CCPost1)}</IBAN>
                    <remittanceInformation>CC EC_TE - CCPost</remittanceInformation>
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
                    <IBAN>${escape(params.CCPost1)}</IBAN>
                    <remittanceInformation>Oneri SUAP 1 CC Comune di Milano - CCPost</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>01199250158</fiscalCodePA>
                    <IBAN>${escape(params.CCBank1)}</IBAN>
                    <remittanceInformation>Oneri SUAP 2 CC Comune di Milano - CCBank</remittanceInformation>
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
                    <IBAN>${escape(params.CCPost1)}</IBAN>
                    <remittanceInformation>CC EC_TE - CCPost </remittanceInformation>
                    <transferCategory>${escape(params.transferCategory1)}</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>${escape(params.CCBank1)}</IBAN>
                    <remittanceInformation>CC EC_TE - CCBanck</remittanceInformation>
                    <transferCategory>${escape(params.transferCategory2)}</transferCategory>
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
                    <IBAN>${escape(params.CCPost1)}</IBAN>
                    <remittanceInformation>CC EC_TE - CCPost</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>2</idTransfer>
                    <transferAmount>30.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>${escape(params.CCPost2)}</IBAN>
                    <remittanceInformation>CC EC_TE - CCPost</remittanceInformation>
                    <transferCategory>0101101IM</transferCategory>
                </transfer>
                <transfer>
                    <idTransfer>3</idTransfer>
                    <transferAmount>20.00</transferAmount>
                    <fiscalCodePA>77777777777</fiscalCodePA>
                    <IBAN>${escape(params.CCBank1)}</IBAN>
                    <remittanceInformation>CC EC_TE - CCBank</remittanceInformation>
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
                      <IBAN>${escape(params.CCBank1)}</IBAN>
                      <remittanceInformation>CC EC_TE - CCBank</remittanceInformation>
                      <transferCategory>0101101IM</transferCategory>
                  </transfer>
                  <transfer>
                      <idTransfer>2</idTransfer>
                      <transferAmount>30.00</transferAmount>
                      <fiscalCodePA>77777777777</fiscalCodePA>
                      <IBAN>${escape(params.CCBank2)}</IBAN>
                      <remittanceInformation>CC EC_TE - CCBank</remittanceInformation>
                      <transferCategory>0101101IM</transferCategory>
                  </transfer>
                  <transfer>
                      <idTransfer>3</idTransfer>
                      <transferAmount>20.00</transferAmount>
                      <fiscalCodePA>77777777777</fiscalCodePA>
                      <IBAN>${escape(params.CCPost1)}</IBAN>
                      <remittanceInformation>CC EC_TE - CCPost</remittanceInformation>
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
                      <IBAN>${escape(params.CCPost1)}</IBAN>
                      <remittanceInformation>CC Comune di Milano - CCPost</remittanceInformation>
                      <transferCategory>${escape(params.transferCategory1)}</transferCategory>
                  </transfer>
                  <transfer>
                      <idTransfer>2</idTransfer>
                      <transferAmount>20.00</transferAmount>
                      <fiscalCodePA>77777777777</fiscalCodePA>
                      <IBAN>${escape(params.CCBank1)}</IBAN>
                      <remittanceInformation>CC Comune di Milano - CCBank</remittanceInformation>
                      <transferCategory>${escape(params.transferCategory2)}</transferCategory>
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
                      <transferAmount>999999999.99</transferAmount>
                      <fiscalCodePA>77777777777</fiscalCodePA>
                      <IBAN>${escape(params.CCBank1)}</IBAN>
                      <remittanceInformation>CC Comune di Milano - CCBank</remittanceInformation>
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
];

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


export const paEdgeCase = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
    <soapenv:Header />
    <soapenv:Body>
        <paf:paGetPaymentRes>
            <outcome>KO</outcome>
            <fault>
                <faultCode>${escape(params.faultCode)}</faultCode>
                <faultString>${escape(params.faultCode)}</faultString>
                <id>77777777777</id>
            </fault>
        </paf:paGetPaymentRes>
    </soapenv:Body>
    </soapenv:Envelope>`,
];