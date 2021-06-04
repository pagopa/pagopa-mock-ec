#!/bin/bash

set -e


# avv-1 30200xxxxxxxxxxx CCPost CCPost  Multibeneficiario (TARI + TEFA)
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paVerifyPaymentNoticeReq"  -d @paVerifyPaymentNoticeReq_avv1.xml -X POST http://localhost:8089/mockEcService
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paGetPaymentReq"  -d @paGetPaymentReq_avv1.xml -X POST http://localhost:8089/mockEcService
# avv-2 30201xxxxxxxxxxx CCPost CCBank  Multibeneficiario (TARI + TEFA)
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paVerifyPaymentNoticeReq"  -d @paVerifyPaymentNoticeReq_avv2.xml -X POST http://localhost:8089/mockEcService
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paGetPaymentReq"  -d @paGetPaymentReq_avv2.xml -X POST http://localhost:8089/mockEcService
# avv-3 30202xxxxxxxxxxx CCBank CCPost  Multibeneficiario (TARI + TEFA)
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paVerifyPaymentNoticeReq"  -d @paVerifyPaymentNoticeReq_avv3.xml -X POST http://localhost:8089/mockEcService
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paGetPaymentReq"  -d @paGetPaymentReq_avv3.xml -X POST http://localhost:8089/mockEcService
# avv-4 30203xxxxxxxxxxx CCBank CCBank  Multibeneficiario (TARI + TEFA)
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paVerifyPaymentNoticeReq"  -d @paVerifyPaymentNoticeReq_avv4.xml -X POST http://localhost:8089/mockEcService
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paGetPaymentReq"  -d @paGetPaymentReq_avv4.xml -X POST http://localhost:8089/mockEcService
# avv-5 30204xxxxxxxxxxx CCPost n.a.  Multibeneficiario (TARI)
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paVerifyPaymentNoticeReq"  -d @paVerifyPaymentNoticeReq_avv5.xml -X POST http://localhost:8089/mockEcService
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paGetPaymentReq"  -d @paGetPaymentReq_avv5.xml -X POST http://localhost:8089/mockEcService
# avv-5 30205xxxxxxxxxxx CCBank n.a.  Multibeneficiario (TARI)
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paVerifyPaymentNoticeReq"  -d @paVerifyPaymentNoticeReq_avv6.xml -X POST http://localhost:8089/mockEcService
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paGetPaymentReq"  -d @paGetPaymentReq_avv6.xml -X POST http://localhost:8089/mockEcService


# PAA_PAGAMENTO_SCONOSCIUTO Attualmente gestito con numero avviso diverso da 302[00|01|02|03|04|05|99]
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paVerifyPaymentNoticeReq"  -d @paVerifyPaymentNoticeReq_avv7.xml -X POST http://localhost:8089/mockEcService
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paGetPaymentReq"  -d @paGetPaymentReq_avv7.xml -X POST http://localhost:8089/mockEcService

# PAA_PAGAMENTO_SCADUTO Attualmente gestito con un codice particolare. Esempio: 99 →  30299xxxxxxxxxxxxx
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paVerifyPaymentNoticeReq"  -d @paVerifyPaymentNoticeReq_avv99.xml -X POST http://localhost:8089/mockEcService
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paGetPaymentReq"  -d @paGetPaymentReq_avv99.xml -X POST http://localhost:8089/mockEcService

# PAA_PAGAMENTO_DUPLICATO -> CLOSED (si va in questo stato solo alla ricezione della receipt)
# prma però devo mandare sentRT
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paSendRTReq"  -d @paSendRTReq_avv4.xml -X POST http://localhost:8089/mockEcService
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paGetPaymentReq"  -d @paGetPaymentReq_avv4.xml -X POST http://localhost:8089/mockEcService


