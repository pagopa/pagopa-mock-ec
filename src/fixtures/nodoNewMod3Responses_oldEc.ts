export type MockResponse = readonly [number, string];

export const paaVerificaRPTRisposta: MockResponse = [
  200,
  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.pagamenti.telematici.gov/"   xmlns:pag="http://www.digitpa.gov.it/schemas/2011/Pagamenti/">
  <soapenv:Header/>
  <soapenv:Body>
     <ws:paaVerificaRPTRisposta>
        <paaVerificaRPTRisposta>
        <esito>OK</esito>
           <datiPagamentoPA>
              <importoSingoloVersamento>1.00</importoSingoloVersamento>
              <ibanAccredito>IT45R0760103200000000001016</ibanAccredito>
              <bicAccredito>BSCTCH22</bicAccredito>
              <enteBeneficiario>
                 <pag:identificativoUnivocoBeneficiario>
                    <pag:tipoIdentificativoUnivoco>G</pag:tipoIdentificativoUnivoco>
                    <pag:codiceIdentificativoUnivoco>44444444444_05</pag:codiceIdentificativoUnivoco>
                 </pag:identificativoUnivocoBeneficiario>
                 <pag:denominazioneBeneficiario>f6</pag:denominazioneBeneficiario>
                 <pag:codiceUnitOperBeneficiario>r6</pag:codiceUnitOperBeneficiario>
                 <pag:denomUnitOperBeneficiario>yr</pag:denomUnitOperBeneficiario>
                 <pag:indirizzoBeneficiario>"paaVerificaRPT"</pag:indirizzoBeneficiario>
                 <pag:civicoBeneficiario>ut</pag:civicoBeneficiario>
                 <pag:capBeneficiario>jyr</pag:capBeneficiario>
                 <pag:localitaBeneficiario>yj</pag:localitaBeneficiario>
                 <pag:provinciaBeneficiario>h8</pag:provinciaBeneficiario>
                 <pag:nazioneBeneficiario>IT</pag:nazioneBeneficiario>
              </enteBeneficiario>
              <credenzialiPagatore>of8</credenzialiPagatore>
              <causaleVersamento>prova/RFDB/019551233153100/TXT/</causaleVersamento>
           </datiPagamentoPA>
        </paaVerificaRPTRisposta>
     </ws:paaVerificaRPTRisposta>
  </soapenv:Body>
</soapenv:Envelope>`,
];
