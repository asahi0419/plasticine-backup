import { dump } from 'js-yaml';

import logger from '../../../../../logger/index.js';
import { ParamsNotValidError } from '../../../../../error/index.js';

export default (sandbox) => (object) => {
  try {
    const yamlString = dump(object);
    return yamlString;
  } catch (error) {
    logger.error(new ParamsNotValidError(`Can not dump, ${error}`));
  }
};