import { READ_INTERVAL_MS } from '../index.js';
import response from '../../../utils/response.js';
import healthChecker from '../../../utils/health-checker.js';

const checkHealth = async (req, res) => {
  const readTimeInSeconds = ( READ_INTERVAL_MS / 1000);

  const { serviceStatus, timeStampDifference, allowedTimeDifference, statusCode } = await healthChecker(readTimeInSeconds, process.env.SERVICE_NAME);

  return response(res, process.env.SERVICE_NAME, serviceStatus, timeStampDifference, allowedTimeDifference, statusCode);
};

export { checkHealth };