import axios from 'axios';
import { reduce } from 'lodash-es';

import * as CONSTANTS from './constants.js';
import * as HELPERS from './helpers.js';

export default (request = axios.request) =>
  reduce(CONSTANTS.METHODS, (result, method) => ({
    ...result,
    [method]: (...args) => HELPERS.generalRequest(request, method, ...args),
  }), {});
