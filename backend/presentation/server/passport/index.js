import passport from 'passport';

import { getSetting } from '../../../business/setting/index.js';

import getJWTStrategy from './strategies/jwt.js';
import getSamlStrategy from './strategies/saml.js';
import getAzureStrategy from './strategies/azure.js';
import getGoogleStrategy from './strategies/google.js';
import getCustomStrategy from './strategies/custom/index.js';
import getStaticStrategy from './strategies/static.js';

const useJWTStrategy = () => {
  const jwtStrategy = getJWTStrategy();
  if (jwtStrategy) passport.use(jwtStrategy);
};

const useStaticStrategy = () => {
  const staticStrategy = getStaticStrategy();
  if (staticStrategy) passport.use(staticStrategy);
};

export const useAzureStrategy = (params, context) => {
  const azureStrategy = getAzureStrategy(params, context);
  if (azureStrategy) passport.use(azureStrategy);
};

export const useGoogleStrategy = (params, context) => {
  const googleStrategy = getGoogleStrategy(params, context);
  if (googleStrategy) passport.use(googleStrategy);
};

export const useCustomStrategy = (params, context) => {
  const customStrategy = getCustomStrategy(params, context);
  if (customStrategy) passport.use(customStrategy);
};

const useSamlStrategy = (params, context) => {
  const samlStrategy = getSamlStrategy(params, context);
  if (samlStrategy) passport.use(samlStrategy);
};

passport.prepare = (options) => {
  useJWTStrategy();
  useStaticStrategy();

  const { sso = {} } = options || getSetting('authorization') || {};
  const { strategies = {} } = sso;
  const { azure = {}, google = {}, custom = {}, custom_saml2: saml = {} } = strategies;

  azure.enabled && useAzureStrategy(azure.params, sso);
  google.enabled && useGoogleStrategy(google.params, sso);
  custom.enabled && useCustomStrategy(custom.params, sso);
  saml.enabled && useSamlStrategy(saml.params, sso);
};

passport.reuse = (options) => {
  passport.unuse('jwt');
  passport.unuse('token');
  passport.unuse('azure-openidconnect');
  passport.unuse('google');
  passport.unuse('saml');

  passport.prepare(options);
}

export default passport;
