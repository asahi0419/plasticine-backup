import csv from 'csvtojson';

import logger from '../../../logger/index.js';

export default sandbox => (csvString, params = { output: 'json' }) => {
  const converter = csv(params);

  try {
    return converter.fromString(csvString);
  } catch (error) {
    logger.error(error);
  }
};
