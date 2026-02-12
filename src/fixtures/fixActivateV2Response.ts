import escapeHtml = require('escape-html');
import { MockResponse } from './nodoNewMod3Responses';
import { paActivate17, paActivate18, paActivatePagamentoDuplicato } from './fixActivateResponse';

interface IActivateRequestV2 {
  creditorReferenceId?: string;
}

const createActivateV2Response = (paActivateV1Fn: (params: { creditorReferenceId: string }) => MockResponse) => {
  return (params: IActivateRequestV2): MockResponse => {
    const creditorReferenceId = escapeHtml(params.creditorReferenceId ?? '');
    const paActivateV1res = paActivateV1Fn({ creditorReferenceId });
    return [paActivateV1res[0], paActivateV1res[1].replace('paGetPaymentRes', 'paGetPaymentV2Response')];
  };
};

const createActivateNoInputV2Response = (paActivateV1Fn: () => MockResponse) => (): MockResponse => {
    const paActivateV1res = paActivateV1Fn();
    return [paActivateV1res[0], paActivateV1res[1].replace('paGetPaymentRes', 'paGetPaymentV2Response')];
  };

export const paActivate17V2 = createActivateV2Response(paActivate17);
export const paActivate18V2 = createActivateV2Response(paActivate18);
export const paActivate19V2 = createActivateV2Response(paActivate18);
export const paActivate20V2 = createActivateV2Response(paActivate18);
export const paActivate21V2 = createActivateV2Response(paActivate18);
export const paActivate22V2 = createActivateV2Response(paActivate18);
export const paActivate23V2 = createActivateV2Response(paActivate18);
export const paActivate24V2 = createActivateV2Response(paActivate18);
export const paActivate25V2 = createActivateV2Response(paActivate18);
export const paActivate26V2 = createActivateV2Response(paActivate18);
export const paActivatePagamentoDuplicatoV2 = createActivateNoInputV2Response(paActivatePagamentoDuplicato);

export const paActivate27 = (params: IActivateRequestV2): MockResponse => {
  const creditorReferenceId = escapeHtml(params.creditorReferenceId ?? '');

  return [
    200,
    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
  <soapenv:Header />
  <soapenv:Body>
      <paf:paGetPaymentV2Response>
          <outcome>OK</outcome>
          <data>
              <creditorReferenceId>${creditorReferenceId}</creditorReferenceId>
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
                      <richiestaMarcaDaBollo>
                        <hashDocumento>QUJDRA==</hashDocumento>
                        <tipoBollo>01</tipoBollo>
                        <provinciaResidenza>RM</provinciaResidenza>
                      </richiestaMarcaDaBollo>
                      <remittanceInformation>remittance information</remittanceInformation>
                      <transferCategory>0101101IM</transferCategory>
                  </transfer>
              </transferList>
          </data>
      </paf:paGetPaymentV2Response>
  </soapenv:Body>
  </soapenv:Envelope>`,
  ];
};
