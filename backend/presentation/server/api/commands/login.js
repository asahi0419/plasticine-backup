import passport from '../../passport/index.js';
import * as HELPERS from '../../middlewares/helpers.js';
import * as SESSION from '../../../../business/user/session.js';
import * as CONSTANTS from '../../passport/constants.js';
import { getJWTToken } from '../../../../business/helpers/index.js';
import { errorHandler } from '../../../../business/error/express.js';
import { AuthenticationError } from '../../../../business/error/index.js';

export default async (req, res, next) => {
  const strategy = {
    azure: 'azuread-openidconnect',
    google: 'google',
    custom: 'custom',
    custom_saml2: 'saml',
  }[req.params.strategy];
  const callback = responseCallback(req, res);
  const scope = (strategy === 'custom') ? ['openid profile'] : ['email'];

  const options = {
    scope,
    response: res,
    prompt: 'consent',
    accessType: 'offline',
    failureRedirect: '/pages/login',
  };

  if (req.query.login_hint) {
    delete options.prompt;
    options.loginHint = req.query.login_hint;
  }

  if (req.params.action === 'request') passport.authenticate(strategy, options)(req, res, next);
  if (req.params.action === 'response') passport.authenticate(strategy, options, callback)(req, res, next);
};

function responseCallback(req, res) {
  return async (error, user, info) => {
    if (user) {
      req.user = user;

      const sandbox = await HELPERS.getSandbox(req, res);
      const session = await SESSION.createSession(user, req, req.sandbox);

      res.cookie('co2_jwt_token', getJWTToken(user, session, req.params.strategy)).redirect('/');
    } else if (info) {
      errorHandler(new AuthenticationError(info.message), req, res);
    } else if (error){
      if (error.name === CONSTANTS.USER_NOT_FOUND) {
        res.redirect(`/pages/sso_no_access?strategy=${req.params.strategy}&email=${error.email}`);
      } else {
        errorHandler(new AuthenticationError(error), req, res);
      }
    }
  }
}
