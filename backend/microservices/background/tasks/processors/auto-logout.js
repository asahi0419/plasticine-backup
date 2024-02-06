import Promise from 'bluebird';
import { keyBy, map } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import logger from '../../../../business/logger/index.js';
import { getSetting } from '../../../../business/setting/index.js';
import { closeSession } from '../../../../business/user/session.js';

export default async (job) => {
  const mins = getSetting('session.autologout_after_idle_min');
  const activity = new Date(new Date() - (+mins) * 60 * 1000);

  try {
    const sessions = await db.model('session').whereNull('logout_at').andWhere('last_activity_at', '<=', activity);
    const users = await db.model('user').where({ autologout: true }).whereIn('id', map(sessions, 'created_by'));
    const usersMap = keyBy(users, 'id');

    const count = await Promise.reduce(sessions, async (result, session) => {
      const user = usersMap[session.created_by];

      if (user) {
        await closeSession(session, { reason_to_close: 'auto' }, user);
        result.push(session);
      }

      return result;
    }, []);

    logger.info(`Autologout (${count.length} sessions)`);
  } catch (error) {
    logger.error(error)
  }
};
