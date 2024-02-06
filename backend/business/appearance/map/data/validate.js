import { isEqual, reduce, filter, compact, uniqBy } from 'lodash-es';

import logger from '../../../logger/index.js'
import * as Error from '../../../error/index.js'

export default (data = []) => {
  const result = reduce(data, (result, item = {}) => {
    const { metadata = {}, records = [] } = item;
    const { properties = {} } = metadata;
    const { ['p-data-source']: source } = properties;

    if (source && !records.length) {
      logger.error(new Error.DataGroupError(`Data group ${source} not found`));
      return result;
    }

    if (properties.section === 'Associated objects') {
      if (properties.editable !== 'associated') {
        return result;
      }
    }

    if (properties.section === 'Free objects') {
      if (properties.editable !== 'free') {
        return result;
      }
    }

    return result.concat(item);
  }, []);

  const uniq = uniqBy(compact(result), ({ metadata = {} }) => metadata.key);

  return filter(uniq, (feature = {}) => {
    const { geometry = {}, properties = {} } = feature;
    const { type, coordinates = [] } = geometry;

    if (type === 'LineString') {
      if ((coordinates.length === 2) && isEqual(coordinates[0], coordinates[1])) {
        return false;
      }
    }

    return true;
  });
};
