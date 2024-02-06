import crypto from 'crypto';
import { isObject, isString, isNumber, isUndefined, isEmpty, omit, omitBy } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import Flags from '../record/flags.js';
import Sandbox from '../sandbox/index.js';
import { getSetting } from '../setting/index.js';
import { measureTime } from '../helpers/index.js';
import { sandboxFactory } from '../sandbox/factory.js';
import { loadAndAssignPermissions } from '../security/permissions.js';
import { loadAndAssignPrivileges } from '../security/privileges.js';
import { loadAndAssignUserGroups } from './group.js';

const FLAGS = new Flags({ check_permission: false });

export const loadAccount = (input = {}) => {
  const attributes = omitBy(input, (v) => {
    if (isObject(v) || isString(v)) return isEmpty(v);
    return isUndefined(v);
  });
  if (isEmpty(attributes)) return;

  const scope = db.model('account').where(omit(attributes, ['email']));
  if (!isEmpty(attributes.email)) scope.whereRaw(`email ${db.client.caseInsensitiveLikeClause()} ?`, attributes.email);
  return scope.getOne();
};

const loadUser = async (params) => {
  const sandbox = await Sandbox.create({ user: {} }, 'seeding')

  return sandbox
    .addVariable('clause', params)
    .executeScript(`return (await p.getModel('user'))
  .setOptions({ check_permission: { all: false } })
  .findOne(p.clause).raw()`, `load_user`)
}

export const createUser = async (user) => {
  const manager = await createManager(user);
  return manager.create(user, FLAGS);
};

export const extendUser = async (user) => {
  await measureTime('Business Logics: User extension', async () => {
    await loadAndAssignUserGroups(user);
    await loadAndAssignPermissions(user);
    await loadAndAssignPrivileges(user);
    await loadAndAssignLanguage(user);
  })

  return user;
};

export const findUserById = async (id) => {
  const user = await loadUser({ id });
  if (!user) return;

  const account = await loadAccount({ id: user.account });
  if (!account) return;

  user.account = account;

  return user;
};

export const findUserByEmail = (email) => findUserFromAccount({ email });
export const findUserByStaticToken = (token) => findUserFromAccount({ static_token: token });

export const generateToken = () => crypto.randomBytes(16).toString('hex');
export const generateSecurityCode = () => Math.random().toString().slice(2, 2 + getSetting('authorization').codegen_length);

async function loadAndAssignLanguage(user) {
  if (!isNumber(user.language)) return;
  user.language = await db.model('language').where({ id: user.language, __inserted: true }).getOne();
}

async function findUserFromAccount(params) {
  const account = await loadAccount(params);
  if (!account) return;

  const user = await loadUser({ account: account.id });
  if (!user) return;

  user.account = account;

  return user;
}

async function createManager(user) {
  const sandbox = await sandboxFactory(user);
  return db.model('user', sandbox).getManager(false);
}
