#!/bin/bash

set -e

count=$1
for i in $(seq $count); do
    curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:verifyPaymentNotice"  -d @verifyPaymentNoticeReq.xml -X POST http://nodopa.te.sia.eu:9600/webservices/pof
    sleep 0.1
done