import axios from 'axios';
import { get } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../logger/index.js';
import { ParamsNotValidError } from '../../../../error/index.js';
import { parseOptions } from '../../../../helpers/index.js';
import { getSetting } from '../../../../setting/index.js';

export default class CMDRunner {
  constructor(sandbox = {}, options = '{}', request = axios.request) {
    this.sandbox = sandbox;
    this.options = parseOptions(options);
    this.request = request;
  };

  async run(command) {
    if (!command) throw new ParamsNotValidError("Missing parameter 'command' in runCMD(...)");

    const options = this.getOptions();
    const token = await this.getToken(options);

    try {
      const response = await this.getResponse(command, options, token);
      const result = this.processResponse(response);

      return result;
    } catch (error) {
      logger.error(error);
    }
  }

  processResponse(response = {}) {
    return {
      result: get(response, 'data.stderr') ? 'NOK' : 'OK',
      output: get(response, 'data.stderr') || get(response, 'data.stdout'),
    }
  }

  getRequestObject(command, options, token) {
    return {
      method: 'post',
      url: `${options.host}:${options.port}${process.env.ROOT_ENDPOINT}/__command/exec`,
      headers: { 'x-token': token },
      data: { command, options },
    };
  }

  async getResponse(command, options, token) {
    const requestObject = this.getRequestObject(command, options, token);

    return this.request(requestObject);
  }

  async getToken(options = {}) {
    let token = get(this.sandbox, 'user.account.static_token');

    if (options.user_id) {
      const user = await db.model('user').where({ id: options.user_id }).getOne();
      if (!user) throw new ParamsNotValidError("Cannot found user with specified 'options.user_id' in runCMD(...)");

      const account = await db.model('account').where({ id: user.account }).getOne();
      if (!account) throw new ParamsNotValidError("Cannot found account associated with user matching 'options.user_id' in runCMD(...)");

      token = account.static_token;
    }

    if (!token) throw new ParamsNotValidError("Missing x-token header in runCMD(...)");

    return token;
  };

  getOptions() {
    const settings = getSetting('bash_web_api');
    const options = { mode: 'sync', ...settings, ...this.options };

    if (!options.host) throw new ParamsNotValidError("Missing parameter 'options.host' in runCMD(...)");
    if (!options.port) throw new ParamsNotValidError("Missing parameter 'options.port' in runCMD(...)");
    if (!options.callback && (options.mode === 'async')) throw new ParamsNotValidError("Callback is required for async mode of utils.runCMD(...)");

    return options;
  };
};
