import redis from '../../../business/sandbox/api/redis.js';
import moment from 'moment';

const TIME_MARGIN_IN_SECONDS =  15;

export const SERVICE_WORKER_KEY = '_worker_last_execution';

const SERVICE_STATUS = {
  ACTIVE: 'active',
  STACKED: 'stacked',
};

const RESPONSE_STATUS_CODE = {
  OK: 200,
  NOK: 500
};

export default async (readInterval, service)=>{
  let serviceStatus = SERVICE_STATUS.ACTIVE;
  let statusCode = RESPONSE_STATUS_CODE.OK;
  const allowedTimeDifference = TIME_MARGIN_IN_SECONDS + readInterval;

  const lastTimestamp = await redis.get(`${service}${SERVICE_WORKER_KEY}`);

  const currentTimestamp = moment(moment().utc().format()).valueOf();
  const timeStampDifference = ((currentTimestamp - lastTimestamp) / 1000);
  if (timeStampDifference > allowedTimeDifference ) {
    serviceStatus = SERVICE_STATUS.STACKED;
    statusCode = RESPONSE_STATUS_CODE.NOK;
  }

  return { serviceStatus, timeStampDifference, allowedTimeDifference, statusCode };
};