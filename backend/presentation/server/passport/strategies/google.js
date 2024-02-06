import { Strategy } from 'passport-google-oauth20';

import * as USER from '../../../../business/user/index.js';
import * as HELPERS from '../helpers.js';
import * as CONSTANTS from '../constants.js';

import logger from '../../../../business/logger/index.js';

const getParams = (params = {}) => {
  return {
    callbackURL: HELPERS.getCallbackURL('google'),
    ...params,
  };
};

const getCallback = (context = {}) => async (accessToken, refreshToken, params, profile, done) => {
  const { email } = profile._json;

  try {
    const user = context.create_user_if_no_exist
      ? await HELPERS.findOrCreateUserByEmail(email, context)
      : await USER.findUserByEmail(email);

    if (!user || (user.account.status !== 'active')) {
      return done({ name: CONSTANTS.USER_NOT_FOUND, email }, false);
    }

    return HELPERS.resolveUser(user, 'google_token', done);
  } catch (error) {
    logger.error(error);
  }

  done(null, false);
};

export default (params, context) => new Strategy(getParams(params), getCallback(context));
