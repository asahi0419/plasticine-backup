import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import Promise from 'bluebird';

import { getList } from '../helpers.js';
import { setMigrated, checkMigrated, checkActive } from './helpers.js';

class Migrators {
  async setup(context) {
    const list = await getList(__dirname);

    await Promise.each(list, async ({ alias, name, migrate }) => {
      if (!(await checkActive(alias))) return;
      if ((await checkMigrated(alias))) return;

      console.log('\x1b[32m%s\x1b[0m', `[Migrator - ${name}] Start migration`);

      await migrate(context);
      await setMigrated(alias);
    });
  }
}

export default new Migrators();
