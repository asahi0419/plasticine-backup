import Promise from 'bluebird';
import { map, omit } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';

export default function exportFields(exporter) {
  exporter.result.fields = [];
  return Promise.all([
    processOwnFields(exporter),
    // processInheritedFields(exporter),
  ]).then(() => exporter);
}

async function processOwnFields(exporter) {
  const fieldScope = db.model('field').where({ model: exporter.model.id });

  if (exporter.type == 'for_import') {
    fieldScope.whereNotIn('alias', map(exporter.template.fields, 'alias'));
  }

  const fields = await fieldScope;

  return fields.each(field => exporter.result.fields.push(processField(field, exporter)));
}

// async function processInheritedFields(exporter) {
//   if (exporter.type == 'for_import') return exporter;

//   const ancestors = await exporter.model.ancestors();
//   const ancestorIds = map(ancestors, 'id');

//   const fields = await db.model('field').whereIn('model', ancestorIds);

//   return fields.each(field => exporter.result.fields.push(processField(field, exporter)));
// }

function processField(field, exporter) {
  let attributes = field.attributes;

  if (exporter.type == 'for_import') {
    const redundantFields = map(exporter.template.fields, 'alias');
    redundantFields.push('model');
    attributes = omit(attributes, redundantFields);

    // TODO: process foreign_model_id for reference fields
  }

  return attributes;
}
