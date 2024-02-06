import { isString } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import logger from '../logger/index.js';

export const logUserActivity = async (options) => {
  let activityRecord = new Object();
  activityRecord.session = options.user.__session?.id;
  activityRecord.object_alias = getAliasFromURL(options.url);
  activityRecord.path = decodeURI(options.headers.referer);
  activityRecord.url = decodeURI(options.url);
  activityRecord.activity = options.activity;
  activityRecord.created_at = new Date();
  activityRecord.created_by = options?.user?.id;
  activityRecord.__inserted = true;

  try {
    await db.model('user_activity_log').insert(activityRecord);
  } catch (error) {
    logger.error(error);
  }
}

function getAliasFromURL (url = '')  {
  if (!isString(url)) return;

  const path = url.replace('?','/').split('/').slice(4);
  if (path.length < 1) return;
  return path[1];

};
