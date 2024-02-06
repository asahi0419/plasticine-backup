import PSM from 'passport-saml-metadata';
import { Strategy } from 'passport-saml';

import * as USER from '../../../../business/user/index.js';
import * as HELPERS from '../helpers.js';
import * as CONSTANTS from '../constants.js';

import logger from '../../../../business/logger/index.js';

const getConfig = (params = {}) => {
  const result = {
    issuer: HELPERS.getCallbackURL('custom_saml2'),
    audience: HELPERS.getCallbackURL('custom_saml2'),
    callbackUrl: HELPERS.getCallbackURL('custom_saml2'),
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    providerName: 'co2-saml',
    authnRequestBinding: 'HTTP-POST',
  };

  if (params.metadataXml) {
    const reader = new PSM.MetadataReader(params.metadataXml);
    const ipConfig = PSM.toPassportConfig(reader);

    delete params.metadataXml;

    return { ...ipConfig, ...result, ...params };
  }

  return { ...result, ...params };
};

const getCallback = (params = {}, context = {}) => async (profile = {}, done) => {
  logger.info({ profile });

  const email = params.email_attribute
    ? profile[params.email_attribute]
    : (profile.email || profile.nameID);

  try {
    const user = context.create_user_if_no_exist
      ? await HELPERS.findOrCreateUserByEmail(email, context)
      : await USER.findUserByEmail(email);

    if (!user || (user.account.status !== 'active')) {
      return done({ name: CONSTANTS.USER_NOT_FOUND, email }, false);
    }

    return HELPERS.resolveUser(user, 'custom_saml2_token', done);
  } catch (error) {
    logger.error(error);
  }

  done(null, false);
};

export default (params, context) => {
  const config = getConfig(params);
  const callback = getCallback(params, context);

  if (params.debug) {
    console.log({ config });
  }

  try {
    return new Strategy(config, callback);
  } catch (error) {
    console.log(error);
  }
};
