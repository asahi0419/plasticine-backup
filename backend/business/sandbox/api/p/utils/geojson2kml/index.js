import toKML from '@maphubs/tokml';
import { valid } from 'geojson-validation';

import logger from '../../../../../logger/index.js';
import { ParamsNotValidError } from '../../../../../error/index.js';

export default () => (featureCollectionObject) => {
  
  if(!valid(featureCollectionObject)){
    
    const trace = valid(featureCollectionObject, true);
    
    logger.error(new ParamsNotValidError(trace));
    return { message: trace };
  }
  
  return toKML(featureCollectionObject);
};