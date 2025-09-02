
interface IpaDemandPaymentNoticeRequest {
  fiscalCode?: string;
  noticeNumber?: string;
}
// This file contains a SOAP response for the paDemandPaymentNoticeRes operation.
// https://developer.pagopa.it/pago-pa/guides/sanp/appendici/primitive      
export const paDemandPaymentNoticeRes = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
    <soapenv:Header />
    <soapenv:Body>
        <paf:paDemandPaymentNoticeRes>
            <outcome>OK</outcome>
            <qrCode>
                <fiscalCode>77777777778</fiscalCode>
                <noticeNumber>311111111112222222</noticeNumber>
            </qrCode>
            <paymentList>
                <paymentOptionDescription>
                    <amount>30.00</amount>
                    <options>EQ</options>
                    <paymentNote>test</paymentNote>
                </paymentOptionDescription>
            </paymentList>
            <paymentDescription>payment</paymentDescription>
            <fiscalCodePA>77777777777</fiscalCodePA>
            <companyName>company EC</companyName>
            <officeName>office EC</officeName>
        </paf:paDemandPaymentNoticeRes>
    </soapenv:Body>
</soapenv:Envelope>`;

// <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://pagopa-api.pagopa.gov.it/xsd/common-types/v1.0.0/" xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
//     <soapenv:Header/>
//     <soapenv:Body>
//         <paf:paDemandPaymentNoticeResponse>
//             <outcome>OK</outcome>
//             <fault>
//                 <faultCode>string</faultCode>
//                 <faultString>string</faultString>
//                 <id>string</id>
//                 <description>string</description>
//                 <serial>1042</serial>
//                 <originalFaultCode>string</originalFaultCode>
//                 <originalFaultString>string</originalFaultString>
//                 <originalDescription>string</originalDescription>
//             </fault>
//             <paf:qrCode>
//                 <paf:fiscalCode>string</paf:fiscalCode>
//                 <paf:noticeNumber>string</paf:noticeNumber>
//             </paf:qrCode>
//             <paf:paymentList>
//                 <paf:paymentOptionDescription>
//                     <paf:amount>decimal</paf:amount>
//                     <paf:options>EQ</paf:options>
//                     <paf:dueDate>date</paf:dueDate>
//                     <paf:detailDescription>string</paf:detailDescription>
//                     <paf:allCCP>true</paf:allCCP>
//                 </paf:paymentOptionDescription>
//             </paf:paymentList>
//             <paf:paymentDescription>string</paf:paymentDescription>
//             <paf:fiscalCodePA>string</paf:fiscalCodePA>
//             <paf:companyName>string</paf:companyName>
//             <paf:officeName>string</paf:officeName>
//         </paf:paDemandPaymentNoticeResponse>
//     </soapenv:Body>
// </soapenv:Envelope>