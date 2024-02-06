import { Strategy } from 'passport-accesstoken';

import * as HELPERS from '../helpers.js';

import logger from '../../../../business/logger/index.js';
import { findUserByStaticToken } from '../../../../business/user/index.js';

const getCallback = () => async (token, done) => {
  try {
    const user = await findUserByStaticToken(token);
    return HELPERS.resolveUser(user, 'static_token', done);
  } catch (error) {
    logger.error(error);
  }

  done(null, false);
};

export default () => new Strategy(getCallback());
