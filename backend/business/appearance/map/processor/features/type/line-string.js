import logger from '../../../../../logger/index.js';
import * as Error from '../../../../../error/index.js';
import * as HELPERS from '../helpers.js';

export default (generatorType, item = {}, context) => {
  const { metadata = {}, feature = {}, records = [] } = item;
  const { properties = {}, geometry = {} } = feature;
  const { key, options = {} } = metadata;
  const { type } = geometry;

  let coordinates;
  if (generatorType !== 'static') {
    if (!records.length || records.length < 2) {
      const message = `Wrong data in group "${feature.properties['p-data-source']}"`;
      logger.error(new Error.DataGroupError(message));
      return null;
    }
    coordinates = records.map(({ p_lat, p_lon }) => [
      parseFloat(p_lon) || 0,
      parseFloat(p_lat) || 0
    ]);
  } else {
    coordinates = geometry.coordinates;
  }

  const result = {
    id: key,
    type: 'Feature',
    geometry: { type, coordinates },
    properties: {
      ...properties,
    },
  };

  Object.assign(result.properties, {
    'stroke': HELPERS.getProperty(feature, context, 'stroke'),
    'stroke-width': HELPERS.getProperty(feature, context, 'stroke-width'),
    'stroke-opacity': HELPERS.getProperty(feature, context, 'stroke-opacity'),
    'marker-symbol': HELPERS.getProperty(feature, context, 'marker-symbol'),
    'p-name': HELPERS.getPName(feature, context, key),
    'p-hint': HELPERS.getProperty(feature, context, 'p-hint'),
    'p-legend': HELPERS.getProperty(feature, context, 'p-legend'),
    'ref': properties['ref'],
  });

  return result;
};
