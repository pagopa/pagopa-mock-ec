# pagopa-mock-ecasdasdasdasdasdasdasd

A mock implementation of PA pagoPA service

- [pagopa-mock-ec](#pagopa-mock-ec)
  - [Glossary](#glossary)
  - [Usage](#usage)
  - [Prerequisites](#prerequisites)
  - [Functionalities](#functionalities)
  - [Tribute description](#tribute-description)

## Glossary

| Acronym | Description          |
| ------- | -------------------- |
| EC      | Creditor institution |
| CCPost  | Postal account       |
| CCBank  | Bank account         |

<br>

## Usage

## Prerequisites

To be able to use as PSP the following `pagopa-mock-ec` remebers to configure in your requests :

- PSP [Identification and Authentication](https://pagopa.github.io/pagopa-api/#section/Introduction/Identification-and-Authentication)
- as EC the `77777777777` fiscalCode
- as `noticeNumber` one of those described in to below section [Tribute description](#tribute-description)

## Functionalities

The following functionalites are available (EC Side)

> (_see [here](https://pagopa.github.io/pagopa-api/indexPA.html) to details_)

- _paVerifyPaymentNotice_
- _paGetPayment_
- _paSendRT_

These mock functionalities allows the PSP to invoke all the payment steps

> (_see [here](https://pagopa.github.io/pagopa-api/) to details_)

- _verifyPaymentNotice_ or _verificaBollettino_
- _activatePaymentNotice_
- _sendPaymentOutcome_

## Tribute description

Both EC have at their disposal a bank IBAN and a postal IBAN.
Based on notice number the mock will reply with a certain configuration of the tribute.

### Tribute 1

The tribute is 120 EUR divided in 2 transfers:

- Transfer 1 : TARI, 100€ due to **EC_TE**
- Transfer 2 : TEFA, 20€ due to **Comune di Milano**

| Notice number        | CC EC_TE | CC Comune di Milano | Notes                          |
| -------------------- | -------- | ------------------- | ------------------------------ |
| 302**00**xxxxxxxxxxx | CCPost   | CCPost              | multibeneficiary (TARI + TEFA) |
| 302**01**xxxxxxxxxxx | CCPost   | CCBank              | multibeneficiary (TARI + TEFA) |
| 302**02**xxxxxxxxxxx | CCBank   | CCPost              | multibeneficiary (TARI + TEFA) |
| 302**03**xxxxxxxxxxx | CCBank   | CCBank              | multibeneficiary (TARI + TEFA) |

### Tribute 2

The tribute is 100 EUR in a single transfers:

- Transfer 1 : TARI, 100€ due to **EC_TE**

| Notice number        | CC EC_TE | Notes                  |
| -------------------- | -------- | ---------------------- |
| 302**04**xxxxxxxxxxx | CCPost   | monobeneficiary (TARI) |
| 302**05**xxxxxxxxxxx | CCBank   | monobeneficiary (TARI) |

### Tribute 3

The tribute is 100 EUR divided in 2 transfers:

- Transfer 1 : TARI, 70€ due to **EC_TE**
- Transfer 2 : TEFA, 30€ due to **Comune di Milano**

| Notice number        | CC EC_TE | CC Comune di Milano | Notes                          |
| -------------------- | -------- | ------------------- | ------------------------------ |
| 302**06**xxxxxxxxxxx | CCPost   | CCPost              | multibeneficiary (TARI + TEFA) |
| 302**07**xxxxxxxxxxx | CCPost   | CCBank              | multibeneficiary (TARI + TEFA) |
| 302**08**xxxxxxxxxxx | CCBank   | CCPost              | multibeneficiary (TARI + TEFA) |
| 302**09**xxxxxxxxxxx | CCBank   | CCBank              | multibeneficiary (TARI + TEFA) |

### Tribute 4

The tribute is 70 EUR in a single transfer:

- Transfer 1 : TARI, 70€ due to **EC_TE**

| Notice number        | CC EC_TE | Notes                  |
| -------------------- | -------- | ---------------------- |
| 302**10**xxxxxxxxxxx | CCPost   | monobeneficiary (TARI) |
| 302**11**xxxxxxxxxxx | CCBank   | monobeneficiary (TARI) |

### Tribute 5

The tribute is 6000 EUR divided in 2 transfers:

- Transfer 1 : TARI, 4000€ due to **EC_TE**
- Transfer 2 : TEFA, 2000€ due to **Comune di Milano**

| Notice number        | CC EC_TE | CC Comune di Milano | Notes                          |
| -------------------- | -------- | ------------------- | ------------------------------ |
| 302**12**xxxxxxxxxxx | CCPost   | CCBank              | multibeneficiary (TARI + TEFA) |

### Tribute 6

The tribute is 0.30 EUR divided in 2 transfers:

- Transfer 1 : TARI, 0.10€ due to **EC_TE**
- Transfer 2 : TEFA, 0.20€ due to **Comune di Milano**

| Notice number        | CC EC_TE | CC Comune di Milano | Notes                          |
| -------------------- | -------- | ------------------- | ------------------------------ |
| 302**13**xxxxxxxxxxx | CCPost   | CCBank              | multibeneficiary (TARI + TEFA) |

#### Tribute 7

The amount of the tribute is 120€ and divided in 3 transfers:

- Transfer 1 : 70€ due to **EC_TE**
- Transfer 2 : 30€ due to **Comune di Milano**
- Transfer 3 : 20€ due to **Comune di Bitetto**

| Notice number        | CC EC_TE | CC Comune di Milano | Comune di Bitetto |
| -------------------- | -------- | ------------------- | ----------------- |
| 302**14**xxxxxxxxxxx | CCPost   | CCBank              | CCBank            |

#### Tribute 8

The amount of the tribute is 120€ and divided in 4 transfers:

- Transfer 1 : 70€ due to **EC_TE**
- Transfer 2 : 30€ due to **Comune di Milano**
- Transfer 3 : 10€ due to **Comune di Bitetto**
- Transfer 4 : 10€ due to **Comune di Milano**

| Notice number        | CC EC_TE | CC Comune di Milano (1) | Comune di Bitetto | CC Comune di Milano (2) |
| -------------------- | -------- | ----------------------- | ----------------- | ----------------------- |
| 302**15**xxxxxxxxxxx | CCPost   | CCBank                  | CCBank            | CCBank                  |

#### Tribute 9

The amount of the tribute is is 120€ and divided in 5 transfers: 

- Transfer 1 : 70€ due to **EC_TE**
- Transfer 2 : 30€ due to **Comune di Milano**
- Transfer 3 : 10€ due to **Comune di Bitetto**
- Transfer 4 : 5€ due to **Comune di Milano**
- Transfer 5 : 5€ due to **Comune di Milano**

| Notice number        | CC EC_TE | CC Comune di Milano (1) | Comune di Bitetto | CC Comune di Milano (2) | CC Comune di Milano (3) |
| -------------------- | -------- | ----------------------- | ----------------- | ----------------------- | ----------------------- |
| 302**16**xxxxxxxxxxx | CCPost   | CCBank                  | CCBank            | CCBank                  | CCBank                  |

### Edge cases

The following edge cases are available (stateless, based on notice number)

| Notice number        | Description            |
| -------------------- | ---------------------- |
| 302**97**xxxxxxxxxxx | Station not reacheable |
| 302**98**xxxxxxxxxxx | Station timeout        |
| 302**99**xxxxxxxxxxx | Payment expired        |
| 302**YY**xxxxxxxxxxx | Payment unknown        |

**_NOTE:_** YY: every code not mentioned before -> from 17 to 96

<br>
<!-- 
## Certificate creation :

### generate private key and CSR

```sh
openssl req -new -config cert_config.cfg -newkey rsa:2048 -nodes -keyout mockecservice.key -out mockecservice.csr
```

### verify the information contained in the CSR

```sh
openssl req -noout -text -in mockecservice.csr

```

### create pfx file for azure

```sh
openssl pkcs12 -export -out mockecservice.pfx -inkey mockecservice.key -in mockecservice.crt
```

Then [Import a certificate using Azure CLI](https://docs.microsoft.com/en-us/azure/key-vault/certificates/tutorial-import-certificate#import-a-certificate-using-azure-cli)

## Developer section 💻

This _optional_ section is usefull if you want run `pagopa-mock-ec` locally 🚀

<details>
  <summary>Click to expand!</summary>

> **NOTE** : you can customize partial mock information using `.env.example`. To do that typing `cp .env.example .env` and changes the info you deem appropriate

### Prerequisites

- [yarn](https://yarnpkg.com/) installed

```sh
yarn install
yarn build && yarn start
```

### Environment

| name              | description                 | default            |
| ----------------- | --------------------------- | ------------------ |
| WINSTON_LOG_LEVEL | desired log level           | `debug`            |
| PAGOPA_NODO_HOST  | host this server listens to | `http://localhost` |
| PORT              | host this server listens to | 8080               |
| BASE_PATH         | `host:port\<BASE_PATH>`     | `mockEcService`    |

### Check mockEcService 🧪

From `resources` folder run script `./run_all_mock_scenarios.sh` to execute all scenario.

Otherwise if you just want to see if everything is up run typing the following command on a terminal

> always from `resources` folder

```sh
curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:paVerifyPaymentNoticeReq"  -d @paVerifyPaymentNoticeReq_avv1.xml -X POST http://localhost:8089/mockEcService
```

if all rights you'd see something like that 👍

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:paf="http://pagopa-api.pagopa.gov.it/pa/paForNode.xsd">
  <soapenv:Header />
  <soapenv:Body>
    <paf:paVerifyPaymentNoticeRes>
      <outcome>OK</outcome>
      <paymentList>
        <paymentOptionDescription>
          <amount>120.00</amount>
          <options>EQ</options>
          <dueDate>2021-07-31</dueDate>
          <detailDescription>pagamentoTest</detailDescription>
          <allCCP>true</allCCP>
        </paymentOptionDescription>
      </paymentList>
      <paymentDescription>Pagamento di Test</paymentDescription>
      <fiscalCodePA>77777777777</fiscalCodePA>
      <companyName>companyName</companyName>
      <officeName>officeName</officeName>
    </paf:paVerifyPaymentNoticeRes>
  </soapenv:Body>
</soapenv:Envelope>
```

</details> -->
