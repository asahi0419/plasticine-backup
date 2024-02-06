import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import Promise from 'bluebird';
import { isPlainObject, isFunction, isArray, reduce, each } from 'lodash-es';

import * as HELPERS from './helpers.js';

export default async (path) => {
  return Promise.reduce(['adaptors', 'migrators', 'plugins'], async (result, section) => {
    const list = await HELPERS.getList(`${__dirname}/${section}`);

    await Promise.each(list, async ({ alias }) => {
      const slicePoint = 4;

      const pathTrimmed = path.split('/').slice(slicePoint).join('/');
      const pathInstance = `${__dirname}/${section}/list/${alias}`;
      const pathResult = `${pathInstance}/${pathTrimmed}/index.js`;
      const pathFlag = `${__dirname}/${section}/list/${alias}/.active`;

      await HELPERS.onPathExists(pathFlag, async () => {
        const target = (await import(pathResult)).default;

        if (isPlainObject(target)) {
          result = { ...(result || {}), ...target };
        }

        if (isArray(target)) {
          result = [ ...(result || []), ...target ];
        }

        if (isFunction(target)) {
          result = target;
        }
      });
    });

    return result;
  }, null);
};
