import lodash from 'lodash-es';
import Promise from 'bluebird';

import * as Type from './type/index.js';
import compile from './compile.js';
import validate from './validate.js';

export default async (model, properties, appearance, params, sandbox) => {
  const data = await Promise.reduce(Object.keys(Type), async (result, key) => {
    return [...result, ...await Type[key](model, properties, appearance, params, sandbox) ];
  }, []);

  return validate(compile(lodash.compact(data), properties.result));
};
