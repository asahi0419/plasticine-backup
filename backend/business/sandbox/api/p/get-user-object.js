import { ParamsNotValidError } from '../../../error/index.js';
import { findUserById, extendUser } from '../../../user/index.js';
import getCurrentUser from './current-user/index.js';

export default (sandbox) => async (record) => {
  if (!validInput(record)) throw new ParamsNotValidError();

  const user = await findUserById(record.id);
  const extendedUser = await extendUser(user);

  return getCurrentUser({ user: extendedUser }, sandbox);
};

function validInput(record) {
  if (!record) return;

  const isProxyRecord = record.constructor.name === 'RecordProxy';

  return (record.__type === 'user') ||
         (isProxyRecord && record.getModel().getValue('alias') === 'user') ||
         (!isProxyRecord && record.id && record.account);
}
