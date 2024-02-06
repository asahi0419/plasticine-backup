import { deepmergeYaml } from 'deepmerge-yaml';

import logger from '../../../../../logger/index.js';
import { ParamsNotValidError } from '../../../../../error/index.js';

export default (sandbox) => (arrayOfYamlStrings) => {
  try {
    const yamlString = deepmergeYaml(arrayOfYamlStrings);
    return yamlString;
  } catch (error) {
    logger.error(new ParamsNotValidError(`Can not merge, ${error}`));
  }
};
