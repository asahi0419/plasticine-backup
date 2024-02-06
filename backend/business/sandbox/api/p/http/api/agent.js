import http from 'http';
import https from 'https';
import { isObject } from 'lodash-es';

export default (options = {}, s) => {
  if (!isObject(options)) throw new ParamsNotValidError(`Wrong parameter 'options' in p.http.Agent`);

  const Agent = s ? https.Agent : http.Agent;
  return new Agent(options);
};
