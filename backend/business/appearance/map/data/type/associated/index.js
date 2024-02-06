import lodash from 'lodash-es';
import Promise from 'bluebird';

import db from '../../../../../../data-layer/orm/index.js';
import logger from '../../../../../logger/index.js';

import * as HELPERS from '../../../../../helpers/index.js';
import * as CONSTANTS from '../../../properties/constants.js';

export default async (model, properties, appearance = {}, params = {}) => {
  const { options = {} } = appearance;
  const { draw = {}, 'data-enrichment': de = {} } = options;
  const { embedded_to = {} } = params

  if (!(draw.enable || de.enable)) return []
  if (!(embedded_to.model && embedded_to.record_id)) return []

  const objects = await getAssociatedObjects(appearance, properties, params)

  return lodash.reduce(objects, (result, o) => {
    const key = `${o.associated_record.model}:${o.associated_record.id}:${o.id}`
    const item = {
      key,
      geometry: {
        type: o.metadata.type,
        coordinates: [],
      },
      geo: {
        ...o.properties,
        id: o.associated_record.id,
        model: o.associated_record.model,
        assoc_id: o.id,
        assoc_model: o.model_id,
        gmd_id: o.metadata.id,
        editable: 'associated',
      },
    };

    if (o.metadata.type === 'Point') {
      const aField = db.getField({ id: o.metadata.point_a }) || {}
      const aValue = o.associated_record[aField.alias]

      if (lodash.isArray(aValue)) {
        item.geometry.coordinates = aValue
      }
    }

    if (o.metadata.type === 'LineString') {
      const pField = db.getField({ id: o.metadata.path }) || {}
      const pValue = o.associated_record[pField.alias] || item.geo.path;

      if (lodash.isArray(pValue)) {
        item.geometry.coordinates = pValue;
      }

      if (o.metadata.line_by === 'point_ab') {
        const aField = db.getField({ id: o.metadata.point_a }) || {};
        const bField = db.getField({ id: o.metadata.point_b }) || {};

        const aValue = o.associated_record[aField.alias];
        const bValue = o.associated_record[bField.alias];

        if (lodash.isArray(aValue) && lodash.isArray(bValue)) {
          if (item.geometry.coordinates.length) {
            const f = lodash.first(item.geometry.coordinates);
            const l = lodash.last(item.geometry.coordinates);

            const af = lodash.isEqual(aValue, f);
            const bl = lodash.isEqual(bValue, l);

            if (af && bl) {
              item.geo.end_a = f;
              return result.concat(item);
            }

            const al = lodash.isEqual(aValue, l);
            const bf = lodash.isEqual(bValue, f);

            if (al && bf) {
              item.geo.end_a = l;
              return result.concat(item);
            }

            logger.error(`Associated ${o.metadata.type} '${key}' is invalid: some point does not match path`);
            return result;
          }

          item.geometry.coordinates.push(aValue);
          item.geometry.coordinates.push(bValue);
        }
      }
    }

    return result.concat(item)
  }, []);
}

async function getAssociatedObjects(appearance = {}, properties, params = {}) {
  const objects = await db.model('associated_geo_object').where({
    model_id: params.embedded_to.model,
    record_id: params.embedded_to.record_id,
    appearance_id: appearance.id,
    __inserted: true,
  }).orderBy('id', 'asc')

  const metadata = await db.model('geo_metadata')
    .whereIn('id', lodash.map(objects, 'metadata'))
    .andWhere(function () { this.whereIn('id', appearance.geo_metadata) })
    .andWhere('__inserted', true)
  const metadataMap = lodash.keyBy(metadata, 'id')

  const grc = await db.model('global_references_cross')
    .whereIn('id', lodash.map(objects, 'associated_record'))
    .andWhere('__inserted', true)
  const grcMap = lodash.keyBy(grc, 'id')

  return Promise.reduce(objects, async (result, o) => {
    const grc = grcMap[o.associated_record];
    if (!grc) return result

    const model = db.getModel(grc.target_model)
    if (!model) return result

    const metadata = metadataMap[o.metadata]
    if (!metadata || (metadata.model !== model.id)) return result

    const record = await db.model(model.alias)
      .select(db.getFieldsAliases(model.alias))
      .where({ id: grc.target_record_id }).getOne()
    if (!record) return result

    o.properties = {
      ...CONSTANTS.ASSOCIATED_PROPERTIES[metadata.type],
      ...await properties.findAssociatedByCondition(metadata.type, record, model),
      ...HELPERS.parseOptions(o.properties),
    }

    const aField = db.getField({ id: metadata[`point_a`] })
    await setCoordinates(metadata, record, aField, record, aField, 'a')

    const bField = db.getField({ id: metadata[`point_b`] })
    await setCoordinates(metadata, record, bField, record, bField, 'b')

    o.metadata = metadata
    o.associated_record = record
    o.associated_record.model = model.id

    return result.concat(o)
  }, [])
}

async function setCoordinates(sourceMetadata = {}, sourceRecord = {}, sourceField = {}, targetRecord = {}, targetField = {}, type) {
  if (sourceRecord[sourceField.alias]) {
    if (db.schema.GEO_FIELDS.includes(sourceField.type)) {
      targetRecord[targetField.alias] = sourceRecord[sourceField.alias]
    }

    if (sourceField.type === 'reference') {
      if (sourceMetadata[`point_${type}_ref`]) {
        const nextMetadata = await db.model('geo_metadata')
          .where({ id: sourceMetadata[`point_${type}_ref`], __inserted: true })
          .getOne()
        if (!nextMetadata) return;

        const nextRecord = await db.model(nextMetadata.model)
          .select(db.getFieldsAliases(nextMetadata.model))
          .where({ id: sourceRecord[sourceField.alias], __inserted: true })
          .getOne()
        if (!nextRecord) return;

        const nextField = db.getField({ id: nextMetadata[`point_${type}`] })
        if (!nextField) return;

        await setCoordinates(
          nextMetadata,
          nextRecord,
          nextField,
          targetRecord,
          targetField,
          type,
        )
      }
    }
  } else {
    targetRecord[targetField.alias] = []
  }
}