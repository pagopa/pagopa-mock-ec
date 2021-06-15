#!/bin/bash

# generate private key and CSR
openssl req -new -config cert_config.cfg -newkey rsa:2048 -nodes -keyout mockecservice.key -out mockecservice.csr

# verify the information contained in the CSR
openssl req -noout -text -in mockecservice.csr

# create the pfx file for azure:
openssl pkcs12 -export -out mockecservice.pfx -inkey mockecservice.key -in mockecservice.crt
