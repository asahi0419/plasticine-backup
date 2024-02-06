import Promise from 'bluebird';
import { map, union } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';

export default async (exporter) => {
  exporter.result.layouts = [];

  const results = await Promise.all([
    processOwnLayouts(exporter),
    // processInheritedLayouts(exporter),
  ]);

  exporter.result.layouts = union(...results);

  return exporter;
};

function processOwnLayouts(exporter) {
  const queryBuilder = db.model('layout').where({ model: exporter.model.id });

  if (exporter.type == 'for_import') {
    queryBuilder.whereNotIn('name', map(exporter.template.layouts, 'name'));
  }

  return queryBuilder;
}

// async function processInheritedLayouts(layoutModel, exporter) {
//   if (exporter.type == 'for_import') {
//     return [];
//   }

//   const ancestors = await exporter.model.ancestors();
//   const ancestorIds = map(ancestors, 'id');

//   return db.model('layout').whereIn('model', ancestorIds);
// }
