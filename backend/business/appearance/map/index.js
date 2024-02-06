import lodash from 'lodash-es';

import logger from '../../logger/index.js';
import * as HELPERS from '../../helpers/index.js';

import getProperties from './properties/index.js';
import getData from './data/index.js';
import getProcessor from './processor/index.js';

export default async (model, appearance, params, sandbox) => {
  appearance = { ...appearance, options: HELPERS.parseOptions(appearance.options) };  
  appearance.options['draw'] = appearance.options['draw'] || {};
  appearance.options['data-enrichment'] = appearance.options['data-enrichment'] || {};

  const drawing = await sandbox.executeScript(appearance.drawing, `appearance/${appearance.id}/drawing`, { modelId: appearance.model });
  if (lodash.isBoolean(drawing)) appearance.options['draw'].enable = drawing;

  if (appearance.options['draw'].enable === true) {
    appearance.options['data-enrichment'].enable = true;
  }

  try {
    const properties = await getProperties(appearance, params, sandbox);
    const data = await getData(model, properties, appearance, params, sandbox);
    const result = await getProcessor(data, properties.result, appearance, params, sandbox);

    return result;
  } catch (error) {
    logger.error(error);

    return {};
  }
};
