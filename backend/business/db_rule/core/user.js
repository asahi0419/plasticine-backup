import db from '../../../data-layer/orm/index.js';
import { getSetting } from '../../setting/index.js';
import { RecordNotValidError } from '../../error/index.js';
import cache from '../../../presentation/shared/cache/index.js';

export const reloadCache = (action) => (record) => {
  const payload = record;

  cache.namespaces.core.messageBus.publish('service:reload_cache', {
    target: 'user',
    params: { action, payload },
  });
}

async function setDefaultLanguage(record) {
  if (record.language) return record;

  const defaultLanguage = await db.model('language').where({ default: true, __inserted: true }).getOne();

  if (defaultLanguage) {
    record.language = defaultLanguage.id;
  }

  return record;
}

async function validatePassword(record, sandbox) {
  const { password = {} } = getSetting('authorization');
  const { min_length, max_length } = password;

  const value = sandbox.record.getValue('password') || '';

  if (min_length && (value.length < min_length)) {
    throw new RecordNotValidError(sandbox.translate('static.min_password_length', { value: min_length }));
  }

  if (max_length && (value.length > max_length)) {
    throw new RecordNotValidError(sandbox.translate('static.max_password_length', { value: max_length }));
  }
}

async function validateEmail(record = {}, sandbox) {
  const { email } = record;
  if (!email) return;

  const account = await db.model('account').where({ email }).getOne();
  if (!account) return;

  const message = sandbox.translate('static.field_must_be_unique', { field: 'Email' });
  throw new RecordNotValidError(message);
}

async function removeAccount(record, sandbox) {
  if (!record.account) return;

  await db.model('account', sandbox).destroyRecord({ id: record.account });
}

export default {
  before_insert: [validateEmail, validatePassword, setDefaultLanguage],
  before_update: [setDefaultLanguage],
  after_insert:[reloadCache('insert')],
  after_update:[reloadCache('update')],
  after_delete: [reloadCache('delete'),removeAccount],
};
