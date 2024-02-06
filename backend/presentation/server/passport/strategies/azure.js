import { OIDCStrategy as Strategy } from 'passport-azure-ad';

import * as USER from '../../../../business/user/index.js';
import * as HELPERS from '../helpers.js';
import * as CONSTANTS from '../constants.js';

import logger from '../../../../business/logger/index.js';

const getParams = (params = {}) => {
  return {
    redirectUrl: HELPERS.getCallbackURL('azure'),
    responseType: 'code id_token',
    responseMode: 'form_post',
    allowHttpForRedirectUrl: true,
    validateIssuer: false,
    scope: ['email', 'offline_access'],
    useCookieInsteadOfSession: true,
    loggingLevel: 'error',
    cookieEncryptionKeys: [
      { 'key': '12345678901234567890123456789012', 'iv': '123456789012' },
      { 'key': 'abcdefghijklmnopqrstuvwxyzabcdef', 'iv': 'abcdefghijkl' }
    ],
    ...params,
  };
};

const getCallback = (context = {}) => async (iss, sub, profile, accessToken, refreshToken, params, done) => {
  const { email } = profile._json;

  try {
    const user = context.create_user_if_no_exist
      ? await HELPERS.findOrCreateUserByEmail(email, context)
      : await USER.findUserByEmail(email);

    if (!user || (user.account.status !== 'active')) {
      return done({ name: CONSTANTS.USER_NOT_FOUND, email }, false);
    }

    return HELPERS.resolveUser(user, 'azure_token', done);
  } catch (error) {
    logger.error(error);
  }

  done(null, false);
};

export default (params, context) => new Strategy(getParams(params), getCallback(context));
