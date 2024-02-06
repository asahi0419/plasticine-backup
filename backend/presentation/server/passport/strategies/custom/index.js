import jwt from 'jsonwebtoken';
import Strategy from './strategy.js';

import * as USER from '../../../../../business/user/index.js';
import * as HELPERS from '../../helpers.js';
import * as CONSTANTS from '../../constants.js';

import { getSetting } from '../../../../../business/setting/index.js';
import logger from '../../../../../business/logger/index.js';

const getParams = (params = {}) => {
  return {
    callbackURL: HELPERS.getCallbackURL('custom'),
    authorizationURL: params.getCodeUrl,
    tokenURL: params.getTokenUrl,
    ...params,
  };
};

const getCallback = (context = {}) => async (accessToken, refreshToken, params, profile, done) => {
  const { id_token = {} } = params || {};
  const customComfig = getSetting('authorization.sso.strategies.custom.params');
  const decoded = jwt.verify(id_token, customComfig.clientSecret);
  const { email } = decoded;

  try {
    const user = context.create_user_if_no_exist
      ? await HELPERS.findOrCreateUserByEmail(email, context)
      : await USER.findUserByEmail(email);

    if (!user || (user.account.status !== 'active')) {
      return done({ name: CONSTANTS.USER_NOT_FOUND, email }, false);
    }

    return HELPERS.resolveUser(user, 'custom_token', done);
  } catch (error) {
    logger.error(error);
  }

  done(null, false);
};

export default (params, context) => {
  return new Strategy(getParams(params), getCallback(context));
};
