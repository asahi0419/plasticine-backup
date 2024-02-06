import IpBan from '../../../user/ip-ban/index.js';
import getCurrentUser from './current-user/index.js';
import encryptPassword from '../../../user/helpers/encrypt-password/index.js';
import getRequestFunction from './get-request/index.js';
import { sandboxFactory } from '../../../sandbox/factory.js';
import { findUserByEmail } from '../../../user/index.js';
import {
  WrongUserCredentialsError,
  AccountBannedError,
  AccountDisabledError,
  AccountInactiveError,
  WaitingConfirmationError,
} from '../../../error/index.js';

const ACOOUNT_STATUS_ERRORS = {
  banned: AccountBannedError,
  disabled: AccountDisabledError,
  inactive: AccountInactiveError,
  waiting_confirmation: WaitingConfirmationError,
};

export default ({ request }, sandbox) => async (email = '', password) => {
  email = email.trim();

  if (!email || !password) throw new WrongUserCredentialsError(sandbox.translate('static.fill_all_fields'));

  const getRequest = getRequestFunction({ request });
  const ipBan = new IpBan(getRequest(), await sandboxFactory(process.env.APP_ADMIN_USER, { request }));
  const user = await findUserByEmail(email);
  const pass = await validPassword(user, password);

  if (!user) await ipBan.process('create', 'login', 'email_is_not_registered');
  if (!pass) await ipBan.process('create', 'login', 'password', user.account);

  await ipBan.process('validate', 'login','password', user.account)

  await ipBan.clear(user.account);

  if (![ 'active', 'expired' ].includes(user.account.status) && user.account.type !== 'service') {
    throw new ACOOUNT_STATUS_ERRORS[user.account.status](' ');
  }

  return getCurrentUser({ user }, sandbox);
};

async function validPassword(user, password) {
  if (!user || !password) return false;
  return encryptPassword(password, user.account.salt) === user.account.password;
}
