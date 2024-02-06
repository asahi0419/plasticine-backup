import Promise from 'bluebird';
import moment from 'moment';
import { keys, each, filter, map } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import cache from '../../../presentation/shared/cache/index.js';
import passport from '../../../presentation/server/passport/index.js';
import initExtensions from '../../../extensions/init.js';
import { parseOptions } from '../../helpers/index.js';
import { RecordNotValidError } from '../../error/index.js';
import { closeAllActiveSessions } from '../../user/session.js';

function reloadCache() {
  cache.namespaces.core.messageBus.publish('service:reload_cache', { target: 'settings' });
}

const processExtensionsValue = async (record, sandbox) => {
  await initExtensions({ sandbox });
};

export const processSessionValue = async (record, sandbox) => {
  const { multisession } = parseOptions(record.value);

  if (!multisession) {
    const accountIds = await db.model('account').pluck('id').where({ multisession: 'global' });
    const users = await db.model('user').whereIn('account', accountIds);

    const options = { message: sandbox.translate('static.session_terminated_security_settings_changes'), reason_to_close: 'auto' };
    await Promise.each(users, (user) => closeAllActiveSessions(user, options, sandbox));
  }
};

export const processAuthorizationValue = async (record, sandbox) => {
  const prevOptions = parseOptions(sandbox.record.getPrevValue('value'));
  const nextOptions = parseOptions(sandbox.record.getValue('value'));

  if (nextOptions['two_fa'] === 'app' && (nextOptions['two_fa'] !== prevOptions['two_fa'])) {
    const accountIds = await db.model('account').pluck('id');
    const users = await db.model('user').whereIn('account', accountIds);

    const options = { message: sandbox.translate('static.session_terminated_security_settings_changes'), reason_to_close: 'auto' };
    await Promise.each(users, (user) => closeAllActiveSessions(user, options, sandbox));
  }
};

export const processAuthValue = async (record, sandbox) => {
  const options = parseOptions(sandbox.record.getValue('value'));

  try {
    passport.reuse(options);
  } catch (error) {
    throw new RecordNotValidError(error.message);
  }
};

const validateFormats = (record, sandbox) => {
  const result = [];

  if (sandbox.record.isChanged('value')) {
    const formats = parseOptions(record.value);
    const validateFormat = format => moment(moment().format(format), format).isValid();

    each(keys(formats), key => {
      if ([ 'field_date_time', 'field_date_notime' ].includes(key)) {
        const format = formats[key];
        result.push({
          key,
          error: !validateFormat(format),
          message: sandbox.translate('static.format_not_valid_error', { key, format, result: moment().format(format) })
        });
      }
    });

    const errors = filter(result, ({ error }) => error);
    if (errors.length) {
      const errorMessage = map(errors, ({message})=> message).join('\n');
      throw new RecordNotValidError(errorMessage);
    }
  }
};

const processValueBeforeCreate = (record, sandbox) => {
  if (record.alias === 'format') validateFormats(record, sandbox);
};

const processValueBeforeUpdate = async (record, sandbox) => {
  if (record.alias === 'authorization') await processAuthValue(record, sandbox);
  if(record.alias === 'format') validateFormats(record, sandbox)
}

const processValueAfterUpdate = async (record, sandbox) => {
  if (record.alias === 'authorization') await processAuthorizationValue(record, sandbox);
  if (record.alias === 'extensions') await processExtensionsValue(record, sandbox);
  if (record.alias === 'session') await processSessionValue(record, sandbox);
}

export default {
  before_insert: [processValueBeforeCreate],
  before_update: [processValueBeforeUpdate],
  after_insert: [reloadCache],
  after_update: [reloadCache, processValueAfterUpdate],
  after_delete: [reloadCache],
};
