export const avviso1 = new RegExp('^3\\d\\d00.*'); // CCPost + CCPost
export const avviso2 = new RegExp('^3\\d\\d01.*'); // CCPost + CCBank
export const avviso3 = new RegExp('^3\\d\\d02.*'); // CCBank + CCPost
export const avviso4 = new RegExp('^3\\d\\d03.*'); // CCBank + CCBank
export const avviso5 = new RegExp('^3\\d\\d04.*'); // CCPost - Monobeneficiario + 777
export const avviso6 = new RegExp('^3\\d\\d05.*'); // CCBank - Monobeneficiario + 777
export const avviso5smart = new RegExp('^3\\d\\d04777.*'); // CCPost - Monobeneficiario + 777
export const avviso7 = new RegExp('^3\\d\\d06.*'); // CCPost + CCPost
export const avviso8 = new RegExp('^3\\d\\d07.*'); // CCPost + CCBank
export const avviso9 = new RegExp('^3\\d\\d08.*'); // CCBank + CCPost
export const avviso10 = new RegExp('^3\\d\\d09.*'); // CCBank + CCBank
export const avviso11 = new RegExp('^3\\d\\d10.*'); // CCPost - Monobeneficiario
export const avviso12 = new RegExp('^3\\d\\d11.*'); // CCBank - Monobeneficiario
export const avviso13 = new RegExp('^3\\d\\d12.*'); // come avviso2 - amount1 4000 - amount2 2000
export const avviso14 = new RegExp('^3\\d\\d13.*'); // come avviso2 - amount1 0.10 - amount2 0.20
export const avviso15 = new RegExp('^3\\d\\d14.*'); // CCPost + CCBank + CBank
export const avviso16 = new RegExp('^3\\d\\d15.*'); // CCPost + CCBank + CBank + CCBank + CCBank
export const avviso17 = new RegExp('^3\\d\\d16.*'); // CCPost + CCBank + CBank + CCBank + CCBank
export const avviso18 = new RegExp('^3\\d\\d17.*'); // fix response
export const avviso19 = new RegExp('^3\\d\\d18.*'); // fix response
export const avviso20 = new RegExp('^3\\d\\d19.*'); // fix response
export const avviso21 = new RegExp('^3\\d\\d20.*'); // fix response
export const avviso22 = new RegExp('^3\\d\\d21.*'); // fix response
export const avviso23 = new RegExp('^3\\d\\d22.*'); // fix response
export const avviso24 = new RegExp('^3\\d\\d23.*'); // fix response
export const avviso25 = new RegExp('^3\\d\\d24.*'); // fix response
export const avviso26 = new RegExp('^3\\d\\d25.*'); // fix response
export const avviso27 = new RegExp('^3\\d\\d26.*'); // fix response
export const avviso28 = new RegExp('^3\\d\\d27.*'); // fix response for paGetPaymentV2
export const avvisoOver5000 = new RegExp('^3\\d\\d77.*'); // random over 5000 euro + random su 2 transfers
export const avvisoUnder1 = new RegExp('^3\\d\\d88.*'); // random under 1 euro + + random su 2 transfers

// Special error cases
export const avvisoPagamentoDuplicato = new RegExp('^3\\d\\d95.*'); // PAA_PAGAMENTO_DUPLICATO
export const avvisoErroreXSD = new RegExp('^3\\d\\d96.*'); // PAA_SINTASSI_XSD
export const avvisoErrore = new RegExp('^3\\d\\d97.*'); // paErrorVerify
export const avvisoTimeout = new RegExp('^3\\d\\d98.*'); // timeout
export const avvisoScaduto = new RegExp('^3\\d\\d99.*'); // PAA_PAGAMENTO_SCADUTO

export const amount1 = 100.0;
export const amount1bis = 70.0;
export const amount2 = 20.0;
export const amount2bis = 30.0;
export const amount1Over = 4000.0;
export const amount2Over = 2000.0;
export const amount1Under = 0.1;
export const amount2Under = 0.2;

export const descriptionAll = 'TARI/TEFA 2021';
export const descriptionMono = 'TARI 2021';

export const onBollettino = ' su bollettino';
