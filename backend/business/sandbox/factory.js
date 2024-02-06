import Sandbox from './index.js';
import * as User from '../user/index.js';

export const sandboxFactory = async (email, context = {}, mode = 'base') => {
  const user = await findUser(email) || { id: 1, account: { email } };
  context.user = await User.extendUser(user);
  return Sandbox.create(context, mode);
};

function findUser(input) {
  if (typeof input === 'object') {
    if (typeof input.id === 'number') return User.findUserById(input.id);
    if (typeof input.email === 'string') return User.findUserByEmail(input.email);
  }
  if (typeof input === 'string') return User.findUserByEmail(input);
}
