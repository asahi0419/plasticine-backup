import jwt from 'jsonwebtoken';
import { Strategy, ExtractJwt } from 'passport-jwt';

import * as HELPERS from '../helpers.js';
import * as CONSTANTS from '../constants.js';

import logger from '../../../../business/logger/index.js';
import { findSessionById } from '../../../../business/user/session.js';
import { findUserById, findUserByEmail } from '../../../../business/user/index.js';

const getParams = () => {
  return {
    passReqToCallback: true,
    jwtFromRequest: ExtractJwtFromRequest,
    secretOrKey: process.env.APP_SECRET_ALGORITHM
      ? process.env.APP_SECRET_PUBLIC
      : process.env.APP_SECRET,
  };
};

const getCallback = () => async (req = {}, payload = {}, done) => {
  const { id, auth, email, session_id } = payload;
  const { query = {} } = req;
  const { sessionOnly } = query;

  try {
    const session = session_id ? await findSessionById(session_id) : null;
    if (sessionOnly) {
      return done(null, !!session);
    }

    const user = await findUserByEmail(email) || await findUserById(id);
    if (user) {
      user.__session = session;
      return HELPERS.resolveUser(user, `${auth}_token`, done);
    }
  } catch (error) {
    logger.error(error);
  }

  done(null, false);
};

function ExtractJwtFromRequest(req) {
  const authHeader = req.headers[CONSTANTS.AUTH_HEADER];
  if (authHeader) {
    if (!authHeader.startsWith(CONSTANTS.AUTH_SCHEME_JWT + ' ')
     && !authHeader.startsWith(CONSTANTS.AUTH_SCHEME_OTP + ' ')) {
       req.headers[CONSTANTS.AUTH_HEADER] = CONSTANTS.AUTH_SCHEME_JWT + ' ' + authHeader;
     }
  }

  const context = {
    secret: process.env.APP_SECRET,
    options: {}
  };

  if (process.env.APP_SECRET_ALGORITHM) {
    context.secret = process.env.APP_SECRET_PRIVATE;
    context.options.algorithm = process.env.APP_SECRET_ALGORITHM;
  }

  return ExtractJwt.fromAuthHeaderWithScheme(CONSTANTS.AUTH_SCHEME_JWT)(req) ||
         ExtractJwt.fromAuthHeaderWithScheme(CONSTANTS.AUTH_SCHEME_OTP)(req) ||
         ExtractJwt.fromUrlQueryParameter(CONSTANTS.AUTH_URL_PARAMETER)(req) ||
         ExtractJwt.fromUrlQueryParameter(CONSTANTS.AUTH_SOCKET_URL_PARAMETER)(req) ||
         jwt.sign({ email: 'guest@free.man' }, context.secret, context.options);
}

export default () => new Strategy(getParams(), getCallback());
