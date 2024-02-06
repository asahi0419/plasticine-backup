import cache from '../shared/cache/index.js';
import logger from '../../business/logger/index.js';
import createServer from './server.js';
import initListeners from './listeners/init.js';
import initExtensions from '../../extensions/init.js';
import * as HELPERS from '../../business/helpers/index.js';
import * as Setup from './setup.js'; 

export default () => {

Setup.env()

const start = async () => {
  const server = await createServer();

  cache.listen({
    i18next: server.i18next,
    sandbox: server.sandbox,
  });

  await initListeners();
  await initExtensions({ sandbox: server.sandbox });

  server.listen(process.env.PORT);
};

cache.init()
  .then(() => HELPERS.measureTimeSimple(start, `[Core] Server started on port ${process.env.PORT}`))

// TODO: implement more clever algorithm of handling errors
process.on('uncaughtException', (error) => {
  logger.error(error);
});

process.on('unhandledRejection', (error) => {
  logger.error(error);
});

}