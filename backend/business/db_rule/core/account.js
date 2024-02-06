import crypto from 'crypto';

import db from '../../../data-layer/orm/index.js';
import encryptPassword from '../../user/helpers/encrypt-password/index.js';
import { getSetting } from '../../setting/index.js';
import { generateToken } from '../../user/index.js';
import { RecordNotValidError } from '../../error/index.js';
import { closeAllActiveSessions } from '../../user/session.js';

const validateUserPresence = async (record, sandbox, mode) => {
  if (mode !== 'secure') return;

  const user = await db.model('user').where({ account: record.id }).getOne();
  if (!user) throw new RecordNotValidError(sandbox.translate('static.cannot_create_an_account'));
}

const validateEmail = async (record, sandbox) => {
  if (sandbox.record.isPersisted() &&
     !sandbox.record.isChanged('email')) return;

  const account = await db.model('account').where({ email: record.email }).getOne();

  if (account) {
    throw new RecordNotValidError(sandbox.translate('static.field_must_be_unique', { field: 'Email' }));
  }
}

const validatePassword = async (record, sandbox) => {
  if (sandbox.record.isPersisted() &&
     !sandbox.record.isChanged('password')) return;

  const { password = {} } = getSetting('authorization');
  const { min_length, max_length } = password;

  const value = sandbox.record.getValue('password') || '';

  if (min_length && (value.length < min_length)) {
    throw new RecordNotValidError(sandbox.translate('static.min_password_length', { value: min_length }));
  }

  if (max_length && (value.length > max_length)) {
    throw new RecordNotValidError(sandbox.translate('static.max_password_length', { value: max_length }));
  }
};

const generatePassword = async (record, sandbox) => {
  if (sandbox.record.isPersisted() &&
     !sandbox.record.isChanged('password')) return;

  const salt = crypto.randomBytes(10).toString('hex');
  const encryptedPassword = await encryptPassword(record.password, salt);

  record.password = encryptedPassword;
  record.salt = salt;

  return record;
};

const generateStaticToken = (record) => {
  record.static_token = generateToken();
  return record;
};

const validateAccountType = async (record, sandbox) => {
  const isTrue = sandbox.record.isChanged('multisession') || sandbox.record.isChanged('two_fa') || sandbox.record.isChanged('type');
  if (sandbox.record.getValue('type') === 'service' && isTrue) {
    record.multisession = 'yes';
    record.two_fa = 'off';
    record.last_password_change = new Date();
  }

  return record;
};

export const validateSession = async (record, sandbox) => {
  const user = await db.model('user').where({ account: record.id }).getOne();

  if (sandbox.record.isChanged('password')) {
    const options = {
      message: sandbox.translate('static.password_successfully_changed'),
      reason_to_close: 'auto'
    };
    return closeAllActiveSessions(user, options, sandbox);
  }

  if (sandbox.record.isChanged('multisession')) {
    const glob = getSetting('session.multisession');
    const prev = sandbox.record.getPrevValue('multisession');
    const next = sandbox.record.getValue('multisession');

    if ((glob && (next === 'no')) || (!glob && (prev === 'yes'))) {
      const options = {
        message: sandbox.translate('static.session_terminated_security_settings_changes'),
        reason_to_close: 'auto'
      };
      return closeAllActiveSessions(user, options, sandbox);
    }
  }

  if (sandbox.record.isChanged('static_token')) {
    const glob = getSetting('session.multisession');
    const multisession = sandbox.record.getValue('multisession');

    if (glob && multisession === 'global' || multisession === 'yes') {
      const options = {
        message: sandbox.translate('static.session_terminated_security_settings_changes'),
        reason_to_close: 'auto'
      };
      return closeAllActiveSessions(user, options, sandbox);
    }       
  }

  if (sandbox.record.isChanged('two_fa')) {
    const glob = getSetting('authorization.2fa');
    const prev = sandbox.record.getPrevValue('two_fa');
    const next = sandbox.record.getValue('two_fa');

    if (((glob === 'app') && (next !== 'off')) || ((glob === 'off') && (prev !== 'app'))) {
      const options = {
        message: sandbox.translate('static.session_terminated_security_settings_changes'),
        reason_to_close: 'auto'
      };
      return closeAllActiveSessions(user, options, sandbox);
    }
  }
};

export default {
  before_insert: [ validateUserPresence, validateEmail, validatePassword, generatePassword, generateStaticToken, validateAccountType ],
  before_update: [ validateEmail, validatePassword, generatePassword ],
  after_update: [ validateSession ],
};
