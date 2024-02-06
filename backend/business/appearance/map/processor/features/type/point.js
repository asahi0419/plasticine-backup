import logger from '../../../../../logger/index.js';
import * as Error from '../../../../../error/index.js';
import * as HELPERS from '../helpers.js';

export default (generatorType, item = {}, context) => {
  const { metadata = {}, feature = {}, records = [] } = item;
  const { properties = {}, geometry = {} } = feature;
  const { key, options = {} } = metadata;
  const { type } = geometry;

  let record = {};
  let coordinates;
  if (generatorType !== 'static') {
    if (!records.length || records.length > 1) {
      const message = `Wrong data in group "${feature.properties['p-data-source']}"`;
      logger.error(new Error.DataGroupError(message));
      return null;
    }

    record = records[0];
    coordinates = [
      parseFloat(record.p_lon) || 0,
      parseFloat(record.p_lat) || 0
    ];
  } else {
    coordinates = geometry.coordinates;
  }

  const result = {
    id: key,
    type: 'Feature',
    geometry: { type, coordinates },
    properties: {
      'id': record.id,
      'p-model': properties['p-model'] || record.model,
      ...properties,
    },
  };

  Object.assign(result.properties, {
    'marker-color': HELPERS.getProperty(feature, context, 'marker-color'),
    'marker-size': HELPERS.getProperty(feature, context, 'marker-size'),
    'marker-symbol': HELPERS.getProperty(feature, context, 'marker-symbol'),
    'marker-opacity': HELPERS.getProperty(feature, context, 'marker-opacity'),
    'p-marker-size': HELPERS.getProperty(feature, context, 'p-marker-size'),
    'p-name': HELPERS.getPName(feature, context, key),
    'p-size-units': HELPERS.getProperty(feature, context, 'p-size-units'),
    'p-hint': HELPERS.getProperty(feature, context, 'p-hint'),
    'p-text': HELPERS.getProperty(feature, context, 'p-text'),
    'p-text-size': HELPERS.getProperty(feature, context, 'p-text-size'),
    'p-text-anchor': HELPERS.getProperty(feature, context, 'p-text-anchor'),
    'p-text-offset': HELPERS.getProperty(feature, context, 'p-text-offset'),
    'p-text-color': HELPERS.getProperty(feature, context, 'p-text-color'),
    'p-text-halo-color': HELPERS.getProperty(feature, context, 'p-text-halo-color'),
    'p-text-halo-width': HELPERS.getProperty(feature, context, 'p-text-halo-width'),
    'p-legend': HELPERS.getProperty(feature, context, 'p-legend'),
    'p-marker-border-width': HELPERS.getProperty(feature, context, 'p-marker-border-width'),
    'p-marker-border-color': HELPERS.getProperty(feature, context, 'p-marker-border-color'),
    'p-marker-border-opacity': HELPERS.getProperty(feature, context, 'p-marker-border-opacity'),
    'ref': record['ref'] || properties['ref'],
  });

  return result;
};
