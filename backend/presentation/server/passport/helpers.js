import db from '../../../data-layer/orm/index.js';
import { makeUniqueHEX } from '../../../business/helpers/index.js';
import { extendUser, findUserByEmail, createUser } from '../../../business/user/index.js';

export function resolveUser(user, authType, done) {
  if (!user) return done(null, false);
  user.__authType = authType;
  return extendUser(user).then(() => done(null, user));
};

export async function findOrCreateUserByEmail(email = '', context = {}) {
  let user = await findUserByEmail(email);

  if (!user) {
    const name = email.split('@')[0];
    const password = makeUniqueHEX(8);
    const groupsAliases = context.create_user_if_no_exist_with_group || [];
    const groupsIds = await db.model('user_group').pluck('id').whereIn('alias', groupsAliases);
    const account = { email, password, status: 'active' };
    user = await createUser({ email, name, password, account, user_groups: groupsIds });
  }

  return user;
};

export function getCallbackURL(strategy) {
  const { APP_HOST_PROTOCOL, APP_HOST_NAME, ROOT_ENDPOINT } = process.env;
  return `${APP_HOST_PROTOCOL}://${APP_HOST_NAME}${ROOT_ENDPOINT}/__command/login/response/${strategy}`;
};
