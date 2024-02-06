import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import { reduce } from 'lodash-es';

import lookup from '../../../../extensions/lookup.js';

export const getExternalContext = async () => (await lookup(__dirname)) || (
  (process.env.NODE_ENV === 'test')
    ? { externalFunction: () => ({ external: true }) }
    : {}
);

export default async (sandbox, externalContext) => {
  externalContext = externalContext || (await getExternalContext());
  return reduce(externalContext, (result, fn, key) => ({ ...result, ...fn(sandbox) }), {});
};
