import moment from 'moment/moment.js';

import redis from '../../../business/sandbox/api/redis.js';
import { SERVICE_WORKER_KEY } from './health-checker.js';

export default async (service) => {
  const timestamp = moment(moment().utc().format()).valueOf();
  await redis.set(`${service}${SERVICE_WORKER_KEY}`, timestamp);
};