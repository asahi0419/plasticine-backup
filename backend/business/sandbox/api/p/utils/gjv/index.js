import { valid } from 'geojson-validation';

import logger from '../../../../../logger/index.js';
import { ParamsNotValidError } from '../../../../../error/index.js';

export default (sandbox) => (geoJSON) => {
  if (!valid(geoJSON)) {
    const trace = valid(geoJSON, true);
    logger.error(new ParamsNotValidError(trace));
    return { message: trace };
  }
  return true;
};
