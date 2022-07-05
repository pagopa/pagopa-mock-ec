import { MockResponse } from './nodoNewMod3Responses';

interface IActivateRequest {
  creditorReferenceId?: string;
}

export const paActivate17 = (params: IActivateRequest): MockResponse => [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
<soapenv:Header />
<soapenv:Body>
    <paf:paGetPaymentRes>
        <outcome>OK</outcome>
        <data>
            <creditorReferenceId>${params.creditorReferenceId}</creditorReferenceId>
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
            <creditorReferenceId>${params.creditorReferenceId}</creditorReferenceId>
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
            <creditorReferenceId>${params.creditorReferenceId}</creditorReferenceId>
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
            <creditorReferenceId>${params.creditorReferenceId}</creditorReferenceId>
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
            <creditorReferenceId>${params.creditorReferenceId}</creditorReferenceId>
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
            <creditorReferenceId>${params.creditorReferenceId}</creditorReferenceId>
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
