import * as http from 'http';
import { reporters } from 'italia-ts-commons';
import * as App from './app';
import { CONFIG, Configuration } from './config';
import { POSITIONS_STATUS } from './utils/helper';
import { logger } from './utils/logger';

const dbNotices: Map<string, POSITIONS_STATUS> = new Map<string, POSITIONS_STATUS>();

// Retrieve server configuration
const config = Configuration.decode(CONFIG).getOrElseL(errors => {
  throw Error(`Invalid configuration: ${reporters.readableReport(errors)}`);
});

// Create the Express Application
App.newExpressApp(config, dbNotices)
  .then(app => {
    // Create a HTTP server from the new Express Application
    const server = http.createServer(app);
    server.listen(config.PA_MOCK.PORT, config.PA_MOCK.HOST);

    logger.info(`Server started at ${config.PA_MOCK.HOST}:${config.PA_MOCK.PORT}`);
  })
  .catch(error => {
    logger.error(`Error occurred starting server: ${error}`);
  });
