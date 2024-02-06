import localStore from './store/local';
import sessionStore from './store/session';

export const isUserAuthorized = () => {
  return getStore().get('jwt_token') || getStore().get('token');
};

export const getJWTToken = (scheme) => {
  const token = getStore().get('jwt_token');
  if (!token) return;
  return scheme ? `${scheme} ${token}` : token;
};

export const storeJWTToken = (token) => {
  getStore().set('jwt_token', token);
};

export const removeJWTToken = () => {
  getStore().remove('jwt_token');
};

export const removeSessionJWTToken = () => {
  sessionStore.remove('jwt_token');
};

export const getOTPToken = (scheme) => {
  const token = getStore().get('otp_token');
  if (!token) return;
  return scheme ? `${scheme} ${token}` : token;
};

export const storeOTPToken = (token) => {
  getStore().set('otp_token', token);
};

export const removeOTPToken = () => {
  getStore().remove('otp_token');
};

export const getStaticToken = () => {
  return getStore().get('token');
};

export const storeStaticToken = (token) => {
  getStore().set('token', token);
};

export const removeStaticToken = () => {
  getStore().remove('token');
};

export const removeSessionStaticToken = () => {
  sessionStore.remove('token');
};

export const storeUser = (user) => {
  getStore().set('user', user);
};

export const getUser = () => {
  return getStore().get('user');
};

export const removeUser = (user) => {
  getStore().remove('user');
};

export const removeSessionUser = (user) => {
  sessionStore.remove('user');
};

export const getSession = () => {
  return sessionStore.get('session');
};

export const storeSession = (session) => {
  sessionStore.set('session', session);

};
export const removeSession = () => {
  sessionStore.remove('session');
};

export const getStore = () => {
  return getSession() ? sessionStore : localStore;
}

export const getLocation = () => {
  const search = location.search;
  return `${location.pathname}${search}`;
}