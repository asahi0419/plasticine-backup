import { loadAll } from 'js-yaml';

import logger from '../../../../../logger/index.js';
import { ParamsNotValidError } from '../../../../../error/index.js';

export default (sandbox) => (yamlString) => {
  try {
    const arrayOfDocuments = loadAll(yamlString);
    return arrayOfDocuments;
  } catch (error) {
    logger.error(new ParamsNotValidError(`Can not load, ${error}`));
  }
};