import fs from 'fs';
import path from 'path';
import lodash from 'lodash';
import Promise from 'bluebird';

import { NoPermissionsError } from '../../../error/index.js';

export default (sandbox) => async (query) => {
  if (sandbox.vm.p.currentUser.isBelongsToWorkgroupByAlias('__core')) {
    const seeds = await new Promise((resolve) => {
      const dir = path.resolve(process.cwd(), 'data-layer/orm/seeds');

      fs.readdir(dir, async (_, data) => {
        const files = data.filter((path) => path.endsWith('.js'));
        const result = await Promise.map(files, async (file) => {
          const content = (await import(path.join(dir, file))).default;
          return lodash.cloneDeep(content)
        });

        resolve(result);
      });
    });

    return lodash.find(seeds, query);
  }

  throw new NoPermissionsError();
};
