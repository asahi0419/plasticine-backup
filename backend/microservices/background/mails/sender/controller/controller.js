import { QUEUE_INTERVAL } from '../queues.js';
import response from '../../../utils/response.js';
import healthChecker from '../../../utils/health-checker.js';


const checkHealth = async (req, res) => {
  const { serviceStatus, timeStampDifference, allowedTimeDifference, statusCode } = await healthChecker(QUEUE_INTERVAL, process.env.SERVICE_NAME);

  return response(res, process.env.SERVICE_NAME, serviceStatus, timeStampDifference, allowedTimeDifference, statusCode);
};

export { checkHealth };