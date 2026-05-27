import escapeHtml = require('escape-html');
import { MockResponse } from './nodoNewMod3Responses';
import {
  getPaActivate,
  IECConfig,
  paActivatePagamentoDuplicato,
} from './fixActivateResponse';

interface IActivateRequestV2 {
  creditorReferenceId?: string;
  ec: IECConfig
}

export type ActivateEntry = {
  pattern: RegExp;
  label: string;
  handler: () => MockResponse;
  xml?: boolean;
  escape?: boolean;
};

const createActivateV2Response = (
  paActivateV1Fn: (params: { creditorReferenceId: string; ec: IECConfig }) => MockResponse
) => {
  return (params: IActivateRequestV2): MockResponse => {
    const creditorReferenceId = escapeHtml(params.creditorReferenceId ?? '');
    const paActivateV1res = paActivateV1Fn({
      creditorReferenceId,
      ec: params.ec
    });

    return [
      paActivateV1res[0],
      paActivateV1res[1].replace('paGetPaymentRes', 'paGetPaymentV2Response')
    ];
  };
};
const createActivateNoInputV2Response = (
  paActivateV1Fn: (ec: IECConfig) => MockResponse
) => {
  return (params: IActivateRequestV2): MockResponse => {
    const paActivateV1res = paActivateV1Fn(params.ec);

    return [
      paActivateV1res[0],
      paActivateV1res[1].replace('paGetPaymentRes', 'paGetPaymentV2Response')
    ];
  };
};

export const paActivate00V2 = createActivateV2Response((params) =>
  getPaActivate("00", params.ec)(params)
);
export const paActivate01V2 = createActivateV2Response((params) =>
  getPaActivate("01", params.ec)(params)
);
export const paActivate02V2 = createActivateV2Response((params) =>
  getPaActivate("02", params.ec)(params)
);
export const paActivate03V2 = createActivateV2Response((params) =>
  getPaActivate("03", params.ec)(params)
);
export const paActivate04V2 = createActivateV2Response((params) =>
  getPaActivate("04", params.ec)(params)
);
export const paActivate05V2 = createActivateV2Response((params) =>
  getPaActivate("05", params.ec)(params)
);
export const paActivate06V2 = createActivateV2Response((params) =>
  getPaActivate("06", params.ec)(params)
);
export const paActivate07V2 = createActivateV2Response((params) =>
  getPaActivate("07", params.ec)(params)
);
export const paActivate08V2 = createActivateV2Response((params) =>
  getPaActivate("08", params.ec)(params)
);
export const paActivate09V2 = createActivateV2Response((params) =>
  getPaActivate("09", params.ec)(params)
);
export const paActivate10V2 = createActivateV2Response((params) =>
  getPaActivate("10", params.ec)(params)
);
export const paActivate11V2 = createActivateV2Response((params) =>
  getPaActivate("11", params.ec)(params)
);
export const paActivate12V2 = createActivateV2Response((params) =>
  getPaActivate("12", params.ec)(params)
);
export const paActivate13V2 = createActivateV2Response((params) =>
  getPaActivate("13", params.ec)(params)
);
export const paActivate14V2 = createActivateV2Response((params) =>
  getPaActivate("14", params.ec)(params)
);
export const paActivate15V2 = createActivateV2Response((params) =>
  getPaActivate("15", params.ec)(params)
);
export const paActivate16V2 = createActivateV2Response((params) =>
  getPaActivate("16", params.ec)(params)
);
export const paActivate17V2 = createActivateV2Response((params) =>
  getPaActivate("17", params.ec)(params)
);
export const paActivate18V2 = createActivateV2Response((params) =>
  getPaActivate("18", params.ec)(params)
);
export const paActivate19V2 = createActivateV2Response((params) =>
  getPaActivate("19", params.ec)(params)
);
export const paActivate20V2 = createActivateV2Response((params) =>
  getPaActivate("20", params.ec)(params)
);
export const paActivate21V2 = createActivateV2Response((params) =>
  getPaActivate("21", params.ec)(params)
);
export const paActivate22V2 =createActivateV2Response((params) =>
  getPaActivate("22", params.ec)(params)
);
export const paActivate23V2 = createActivateV2Response((params) =>
  getPaActivate("23", params.ec)(params)
);
export const paActivate24V2 = createActivateV2Response((params) =>
  getPaActivate("24", params.ec)(params)
);
export const paActivate25V2 = createActivateV2Response((params) =>
  getPaActivate("25", params.ec)(params)
);
export const paActivate26V2 =createActivateV2Response((params) =>
  getPaActivate("26", params.ec)(params)
);
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