import lodash from 'lodash-es';
import Promise from 'bluebird';

import db from '../../../../data-layer/orm/index.js';
import * as HELPERS from '../../../helpers/index.js';
import * as CONSTANTS from './constants.js';

const GEOMETRY_BY_TYPE = {
  'geo_point': 'Point',
  'geo_line_string': 'LineString',
};

export default async (appearance = {}, params = {}, sandbox) => {
  const { options = {} } = appearance;
  const { draw = {}, 'data-enrichment': de = {} } = options;

  let records = [];

  if (draw.enable || de.enable) {
    records = await db.model('geo_object_property')
      .where('__inserted', true)
      .whereNotNull('properties')
      .andWhere(function () {
        this.orWhere(function () {
          this.whereNull('appearance_id');
          this.whereNull('model_id');
          this.whereNull('record_id');
        });
        this.orWhere(function () {
          this.where('appearance_id', appearance.id);
          this.whereNull('model_id');
          this.whereNull('record_id');
        });
  
        if (params.embedded_to) {
          if (params.embedded_to.model) {
            this.orWhere(function () {
              this.whereNull('appearance_id');
              this.andWhere('model_id', params.embedded_to.model);
              this.whereNull('record_id');
            });
            this.orWhere(function () {
              this.where('appearance_id', appearance.id);
              this.andWhere('model_id', params.embedded_to.model);
              this.whereNull('record_id');
            });
          }
          
          if (params.embedded_to.model && params.embedded_to.record_id) {
            this.orWhere(function () {
              this.whereNull('appearance_id');
              this.andWhere('model_id', params.embedded_to.model);
              this.andWhere('record_id', params.embedded_to.record_id);
            });
            this.orWhere(function () {
              this.where('appearance_id', appearance.id);
              this.andWhere('model_id', params.embedded_to.model);
              this.andWhere('record_id', params.embedded_to.record_id);
            });
          }
        }
      });
  }

  const result = {
    Point: {
      other: mergeGeoProperties('geo_point', 'other_data', records, appearance, params, CONSTANTS.DEFAULT_PROPERTIES.Point),
      free: mergeGeoProperties('geo_point', 'free_geo_data', records, appearance, params, CONSTANTS.FREE_PROPERTIES.Point),
      assoc: { properties: lodash.cloneDeep(CONSTANTS.ASSOCIATED_PROPERTIES.Point) },
    },
    LineString: {
      other: mergeGeoProperties('geo_line_string', 'other_data', records, appearance, params, CONSTANTS.DEFAULT_PROPERTIES.LineString),
      free: mergeGeoProperties('geo_line_string', 'free_geo_data', records, appearance, params, CONSTANTS.FREE_PROPERTIES.LineString),
      assoc: { properties: lodash.cloneDeep(CONSTANTS.ASSOCIATED_PROPERTIES.LineString) },
    },
    Polygon: {
      other: mergeGeoProperties('geo_polygon', 'other_data', records, appearance, params, CONSTANTS.DEFAULT_PROPERTIES.Polygon),
      free: mergeGeoProperties('geo_polygon', 'free_geo_data', records, appearance, params, CONSTANTS.FREE_PROPERTIES.Polygon),
      assoc: { properties: lodash.cloneDeep(CONSTANTS.ASSOCIATED_PROPERTIES.Polygon) },
    },
  };

  const associatedRecords = lodash.filter(records, { category: 'associated_geo_data' });
  const associatedRecordsByType = lodash.groupBy(associatedRecords, 'type');

  lodash.each(associatedRecordsByType, (rt, type) => {
    lodash.each(lodash.groupBy(rt, 'associated_model'), (rm, model) => {
      lodash.each(lodash.groupBy(rm, 'condition_associated'), (r) => {
        const keyt = GEOMETRY_BY_TYPE[type];
        const keya = `assoc_${model}`;

        const properties = mergeGeoProperties(type, 'associated_geo_data', r, appearance, params, CONSTANTS.ASSOCIATED_PROPERTIES[keyt]);

        result[keyt][keya] = result[keyt][keya] || [];
        result[keyt][keya].push(properties);
      });
    });
  });

  return {
    result,
    findAssociatedByCondition: async (type, record, model) => {
      const newSandbox = await sandbox.cloneWithoutDynamicContext();
      await newSandbox.assignRecord(record, model, 'record', { preload_data: false });

      return Promise.reduce(result[type][`assoc_${model.id}`] || [], async (r, p) => {
        const pass = await newSandbox.executeScript(p.condition, `geo_object_property/${p.property_id}/condition_associated`);

        if (pass) {
          r = { ...r, ...p.properties, property_id: p.property_id };
        }

        return r;
      }, {});
    }
  };
};

function mergeGeoProperties(type, category, records = [], appearance = {}, params = {}, defaultProperties = {}) {
  const { embedded_to = {} } = params;

  if (type === 'Point') type = 'geo_point';
  if (type === 'LineString') type = 'geo_line_string';

  const finder = (clause = {}) => {
    const record = lodash.find(records, { ...clause, category, type });

    if (record) {
      return {
        properties: HELPERS.parseOptions(record.properties),
        property_id: record.id,
        condition: record.condition_associated,
        name: record.name || `Geo object property #${record.id}`,
      };
    }

    return {
      properties: {},
    };
  };

  const c = finder({ appearance_id: null, model_id: null, record_id: null });
  const m = finder({ appearance_id: null, model_id: embedded_to.model, record_id: null });
  const a = finder({ appearance_id: appearance.id, model_id: null, record_id: null });
  const am = finder({ appearance_id: appearance.id, model_id: embedded_to.model, record_id: null });
  const mr = finder({ appearance_id: null, model_id: embedded_to.model, record_id: embedded_to.record_id });
  const amr = finder({ appearance_id: appearance.id, model_id: embedded_to.model, record_id: embedded_to.record_id });

  return {
    properties: {
      ...defaultProperties,
      ...c.properties,
      ...m.properties,
      ...a.properties,
      ...am.properties,
      ...mr.properties,
      ...amr.properties,
    },
    ...lodash.pick(c, ['property_id', 'condition', 'name']),
    ...lodash.pick(m, ['property_id', 'condition', 'name']),
    ...lodash.pick(a, ['property_id', 'condition', 'name']),
    ...lodash.pick(am, ['property_id', 'condition', 'name']),
    ...lodash.pick(mr, ['property_id', 'condition', 'name']),
    ...lodash.pick(amr, ['property_id', 'condition', 'name']),
  };
}
