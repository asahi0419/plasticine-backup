import Promise from 'bluebird';

import loadHABTM from './habtm.js';
import loadHasMany from './has-many.js';
import loadHasOne from './has-one.js';
import loadStatic from './static.js';
import spread from './spread.js';
import { processIncludes } from '../../params.js';

export default (fetcher) => {
  const include = fetcher.params.include || '';
  const associations = processIncludes(include, fetcher.rtlFields);
  const { records } = fetcher.result;

  return Promise.all([
    loadHABTM(associations.habtm, fetcher),
    loadHasMany(associations.has_many, fetcher, records),
    loadHasOne(associations.has_one, fetcher, records),
    loadStatic(associations.static, fetcher, records),
  ]).then(result => spread(fetcher, result));
};
