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


export const paaAttivaRPTRisposta: MockResponse = [
   200,
   `<soapenv:Envelope
   xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
   xmlns:ws="http://ws.pagamenti.telematici.gov/"
   xmlns:pag="http://www.digitpa.gov.it/schemas/2011/Pagamenti/">
   <soapenv:Header/>
   <soapenv:Body>
       <ws:paaAttivaRPTRisposta>
           <paaAttivaRPTRisposta>
               <esito>OK</esito>
               <datiPagamentoPA>
                   <importoSingoloVersamento>10.00</importoSingoloVersamento>
                   <ibanAccredito>IT45R0760103200000000001016</ibanAccredito>
                   <bicAccredito>BSCTCH22</bicAccredito>
                   <enteBeneficiario>
                       <pag:identificativoUnivocoBeneficiario>
                           <pag:tipoIdentificativoUnivoco>G</pag:tipoIdentificativoUnivoco>
                           <pag:codiceIdentificativoUnivoco>77777777777_05</pag:codiceIdentificativoUnivoco>
                       </pag:identificativoUnivocoBeneficiario>
                       <pag:denominazioneBeneficiario>15376371009</pag:denominazioneBeneficiario>
                       <pag:codiceUnitOperBeneficiario>15376371009_01</pag:codiceUnitOperBeneficiario>
                       <pag:denomUnitOperBeneficiario>uj</pag:denomUnitOperBeneficiario>
                       <pag:indirizzoBeneficiario>"paaAttivaRPT"</pag:indirizzoBeneficiario>
                       <pag:civicoBeneficiario>j</pag:civicoBeneficiario>
                       <pag:capBeneficiario>gt</pag:capBeneficiario>
                       <pag:localitaBeneficiario>gw</pag:localitaBeneficiario>
                       <pag:provinciaBeneficiario>ds</pag:provinciaBeneficiario>
                       <pag:nazioneBeneficiario>UK</pag:nazioneBeneficiario>
                   </enteBeneficiario>
                   <credenzialiPagatore>i</credenzialiPagatore>
                   <causaleVersamento>prova/RFDB/018701385178400/TXT/causale 0dfe2e934e6648f798c5d64ce2f4ab23</causaleVersamento>
               </datiPagamentoPA>
           </paaAttivaRPTRisposta>
       </ws:paaAttivaRPTRisposta>
   </soapenv:Body>
</soapenv:Envelope>`,
];

export const paaInviaRTRisposta: MockResponse = [
   200,
   `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.pagamenti.telematici.gov/">
   <soapenv:Header/>
   <soapenv:Body>
      <ws:paaInviaRTRisposta>
         <paaInviaRTRisposta>
            <esito>OK</esito>
         </paaInviaRTRisposta>
      </ws:paaInviaRTRisposta>
   </soapenv:Body>
</soapenv:Envelope>`,
];


export const paDemandPaymentNoticeRisposta: MockResponse = [
   200,
   `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
   <soapenv:Header/>
   <soapenv:Body>
		  <paf:paDemandPaymentNoticeResponse>
			 <outcome>OK</outcome>
			 <qrCode>
				<fiscalCode>44444444444</fiscalCode>
				<noticeNumber>311018891531183500</noticeNumber>
			 </qrCode>
			 <paymentList>
				<paymentOptionDescription>
				   <amount>10.00</amount>
				   <options>EQ</options>
				   <!--Optional:-->
				   <dueDate>2022-06-25</dueDate>
				   <!--Optional:-->
				   <detailDescription>descrizione dettagliata lato PA</detailDescription>
				   <!--Optional:-->
					<allCCP>false</allCCP>
				</paymentOptionDescription>
			 </paymentList>
		  </paf:paDemandPaymentNoticeResponse>
	</soapenv:Body>
</soapenv:Envelope>`,
];