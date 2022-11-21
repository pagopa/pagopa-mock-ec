// import * as http from 'http';
import { reporters } from 'italia-ts-commons';
import * as App from './app';
import { CONFIG, Configuration } from './config';
import { POSITIONS_STATUS } from './utils/helper';
import { logger } from './utils/logger';
const fs = require('fs');
const https = require("https");

const dbNotices: Map<string, POSITIONS_STATUS> = new Map<string, POSITIONS_STATUS>();
const dbAmounts: Map<string, number> = new Map<string, number>();
const noticenumberRequests: Map<string, JSON> = new Map<string, JSON>();
const noticenumberResponses: Map<string, JSON> = new Map<string, JSON>();

// Retrieve server configuration
const config = Configuration.decode(CONFIG).getOrElseL(errors => {
  throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
});

const options = {
  key: fs.readFileSync(`${__dirname}/../cert/privkey.pem`),
  cert: fs.readFileSync(`${__dirname}/../cert/fullchain.pem`),
  ca: [
    fs.readFileSync(`${__dirname}/../cert/api-dev-platform-pagopa-it-chain.pem`),
    fs.readFileSync(`${__dirname}/../cert/api-uat-platform-pagopa-it-chain.pem`),
  ],
  // Requesting the client to provide a certificate, to authenticate.
  requestCert: true,
  // As specified as "true", so no unauthenticated traffic
  // will make it to the specified route specified
  rejectUnauthorized: true,
};

// Create the Express Application
App.newExpressApp(config, dbNotices, dbAmounts, noticenumberRequests, noticenumberResponses)
  .then(app => {
    // Create a HTTP server from the new Express Application
    const server = https.createServer(options, app);
    server.listen(config.PA_MOCK.PORT);

    logger.info(`Server started at on port:${config.PA_MOCK.PORT}`);
  })
  .catch(error => {
    logger.error(`Error occurred starting server: ${error}`);
  });
