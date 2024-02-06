import NodeEnvironment from 'jest-environment-node';

import db from '../data-layer/orm/index.js';
import cache from '../presentation/shared/cache/index.js';
import { sandboxFactory } from '../business/sandbox/factory.js';
import initListeners from '../presentation/server/listeners/init.js';

import helpers, {
  checkSeleniumConnection,
  checkBackgroundConnection,
  checkPluginsConnection
} from './helpers/index.js';

class TestEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    await cache.start();
    await initListeners();

    const user = await db.model('user').where({ id: 1 }).getOne();
    const sandbox = await sandboxFactory(user);

    this.global.db = db;
    this.global.user = user;
    this.global.sandbox = sandbox;
    this.global.selenium = {
      connected: await checkSeleniumConnection(),
      url: 'http://selenium:4444',
    };
    this.global.background_mails = {
      connected: await checkBackgroundConnection('mails'),
      url: 'http://background-mails-test',
    };
    this.global.background_tasks = {
      connected: await checkBackgroundConnection('tasks'),
      url: 'http://background-tasks-test',
    };
    this.global.plugins = await checkPluginsConnection(db);

    this.global.t = {};
    this.global.h = helpers(sandbox, db);
  }
}

export default TestEnvironment;
