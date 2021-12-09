import * as http from 'http';
import { reporters } from 'italia-ts-commons';
import * as App from './app';
import { CONFIG, Configuration } from './config';
import { POSITIONS_STATUS } from './utils/helper';
import { logger } from './utils/logger';

const dbNotices: Map<string, POSITIONS_STATUS> = new Map<string, POSITIONS_STATUS>();
const dbAmounts: Map<string, number> = new Map<string, number>();
const noticenumberRequests: Map<string, JSON> = new Map<string, JSON>();
const noticenumberResponses: Map<string, JSON> = new Map<string, JSON>();

// Retrieve server configuration
const config = Configuration.decode(CONFIG).getOrElseL(errors => {
  throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
});

// Create the Express Application
App.newExpressApp(config, dbNotices, dbAmounts, noticenumberRequests, noticenumberResponses)
  .then(app => {
    // Create a HTTP server from the new Express Application
    const server = http.createServer(app);
    server.listen(config.PA_MOCK.PORT);

    logger.info(`Server started at on port:${config.PA_MOCK.PORT}`);
  })
  .catch(error => {
    logger.error(`Error occurred starting server: ${error}`);
  });
