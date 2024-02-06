import { isString, isObject } from 'lodash-es';

import { ParamsNotValidError } from '../../../../../error/index.js';

export const generalRequest = (request, method, url = '', options = {}) => {
  if (!isString(url)) throw new ParamsNotValidError(`Wrong parameter 'url' in p.http`);
  if (!isObject(options)) throw new ParamsNotValidError(`Wrong parameter 'options' in p.http`);

  const { data, ...rest } = options;
  const config = { method, url, ...rest };

  if (data) {
    const dataKey = method === 'get' ? 'params' : 'data';
    config[dataKey] = data;
  }

  return request(config);
};
