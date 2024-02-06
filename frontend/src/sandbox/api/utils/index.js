import { isEmpty } from 'lodash/lang';

import parameterizeString from './parameterize-string';
import { parseOptions, getModel, getView, getSetting } from '../../../helpers';
import gzipFunction from './gzip.js';
import ungzipFunction from './ungzip.js';

export default () => ({
  isEmpty,
  parameterizeString,
  parseOptions,
  JSONParseSafe: parseOptions,
  getModel,
  getView,
 
  getEnvName: () => getSetting('env.name'),
  getHostName: () => getSetting('host.name'),
  getHostProtocol: () => getSetting('host.protocol'),
  getHostURL: () => getSetting('host.url'),
  getClientType: () => 'portal',
  isOnlineMode: () => true,
  gzip: gzipFunction(),
  ungzip: ungzipFunction(),
});
