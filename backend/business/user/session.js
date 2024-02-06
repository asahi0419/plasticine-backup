import Promise from 'bluebird';
import { omit, pick } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import Flags from '../record/flags.js';
import WSProxy from '../sandbox/api/p/ws/index.js';
import { getSetting } from '../setting/index.js';
import { parseOptions } from '../helpers/index.js';
import { sandboxFactory } from '../sandbox/factory.js';
import { AuthenticationError, StolenSessionError, ExpiredSessionError } from '../error/index.js';

const FLAGS = new Flags({ check_permission: false, ex_save: {protectSystemFields : false} });

export const findSessionById = (id) => findSessions({ id }).then(([session]) => session);
export const findSessionByUserId = (id, params = {}) => findSessions({ created_by: id, ...params }).then(([session]) => session);

export const checkMultisession = (account = {}) => {
  const type = account.multisession || 'global';
  const types = { no: false, yes: true, global: getSetting('session.multisession') };

  return types[type]
}

export const createSession = async (user = {}, request, sandbox, options = {}) => {
  const multisession = checkMultisession(user.account);
  if (!multisession) await closeAllActiveSessions(user, { reason_to_close: 'stolen' }, sandbox);

  const headers = request.__headers || request.headers;
  const ip = headers['x-real-ip'] || request.ip || request.__meta.ip;

  const manager = await createManager(user, sandbox);
  const sessionAttributes = {
    details: {
      auth_type: user.__authType || 'jwt_token',
      logged_with: options.logged_with,
      user_agent: headers['user-agent'],
    },
    ip_address: ip,
    last_activity_at: new Date(),
    created_by: user.id,
    created_at: new Date(),
  };

  return manager.create(sessionAttributes, FLAGS);
};

export const closeAllActiveSessions = async (user, options, sandbox) => {
  const sessions = await findSessions({ created_by: user.id, logout_at: null });
  return Promise.all(sessions.map(session => closeSession(session, options, user, sandbox)));
};

export const closeSession = async (session, options = {}, user, sandbox) => {
  const additionalAttributes = omit(options, ['message']);

  const sessionAttributes = {
    ...session,
    ...additionalAttributes,
    logout_at: new Date(),
  };

  if (options.message) {
    const details = parseOptions(session.details);
    details.message = options.message;
    sessionAttributes.details = details;
  }

  const manager = await createManager(user, sandbox);
  await manager.update(session, sessionAttributes, FLAGS);

  const command = {
    action: 'logout',
    session: pick(session, ['id', 'created_by']),
    options: { ...options, redirect: '/pages/login' },
  };

  if (options.reason_to_close === 'stolen') {
    command.options.message = session.ip_address
      ? sandbox.translate('static.session_terminated_with_ip', { ip: session.ip_address })
      : sandbox.translate('static.session_terminated');
  }

  return WSProxy({ user }).sendCommand(command);
};

export const validateSession = (session, req) => {
  if (!session) return new AuthenticationError();

  if (session.logout_at && session.reason_to_close) {
    switch (session.reason_to_close) {
      case 'manual':
        return new AuthenticationError();
      case 'auto':
        return new ExpiredSessionError(req.t('static.session_terminated_due_to_inactivity'));
      case 'stolen':
        const message = session.ip_address
          ? req.t('static.session_terminated_with_ip', { ip: session.ip_address })
          : req.t('static.session_terminated');
        return new StolenSessionError(message);
    }
  }
};

export const touchSession = (session) => {
  return db.model('session').where({ id: session.id }).update({ last_activity_at: new Date() });
};

async function createManager(user, sandbox) {
  if (!sandbox) sandbox = await sandboxFactory(user);
  return db.model('session', sandbox).getManager(false);
}

function findSessions(params = {}) {
  return db.model('session').where({ ...params, __inserted: true });
}
