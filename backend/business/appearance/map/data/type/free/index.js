import lodash from 'lodash-es';

import db from '../../../../../../data-layer/orm/index.js';

import * as HELPERS from '../../../../../helpers/index.js';
import * as CONSTANTS from './constants.js';

export default async (model, properties, appearance, params) => {
  const { options = {} } = appearance;
  const { draw = {}, 'data-enrichment': de = {}, show_ab_ends } = options;

  const result = [];

  if (draw.enable || de.enable) {
    if (params.embedded_to && params.embedded_to.model && params.embedded_to.record_id) {
      const records = await db.model('free_geo_object')
        .select(db.getFieldsAliases('free_geo_object'))
        .where({
          model_id: params.embedded_to.model,
          record_id: params.embedded_to.record_id,
          appearance_id: appearance.id,
          __inserted: true,
        }).orderBy('id', 'asc');

      lodash.each(records, (r) => {
        const coordinates = r[r.type];
        const type = CONSTANTS.TYPES_MAP[r.type];

        const p = {
          ...properties.result[type].free.properties,
          ...HELPERS.parseOptions(r.properties)
        };

        const item = {
          key: `${r.model_id}:${r.id}`,
          geometry: {
            type,
            coordinates,
          },
          geo: {
            ...p,
            id: r.id,
            model: r.model_id,
            editable: 'free',
          },
        };

        if (type === 'LineString') {
          if (show_ab_ends) {
            r.end_a = r.end_a || coordinates[0];
            r.end_b = r.end_b || lodash.isEqual(coordinates[0], r.end_a) ? coordinates[coordinates.length - 1] : coordinates[0];
    
            result.push({
              key: `${r.model_id}:${r.id}:a`,
              geometry: {
                type: 'Point',
                coordinates: r.end_a,
              },
              geo: {
                ...p,
                'follow-up': item.key,
                'follow-up:editable': 'free',
                'p-text': r.end_mark_a || 'A',
                'p-marker-size': 0,
                'p-legend': 0,
              },
            });
  
            result.push({
              key: `${r.model_id}:${r.id}:b`,
              geometry: {
                type: 'Point',
                coordinates: r.end_b,
              },
              geo: {
                ...p,
                'follow-up': item.key,
                'follow-up:editable': 'free',
                'p-text': r.end_mark_b || 'B',
                'p-marker-size': 0,
                'p-legend': 0,
              },
            });
          }
        }

        if (draw.enable) {
          let group;

          if (r.type === 'geo_point') group = 'Free points';
          if (r.type === 'geo_line_string') group = 'Free lines';
          if (r.type === 'geo_polygon') group = 'Free polygons';

          Object.assign(item.geo, { section: 'Free objects', group });
        }

        result.push(item);
      });
    }
  }

  return result;
};