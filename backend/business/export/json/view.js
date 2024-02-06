import Promise from 'bluebird';
import { map, union } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';

export default async (exporter) => {
  exporter.result.views = [];

  const results = await Promise.all([
    processOwnViews(exporter),
    // processInheritedViews(exporter),
  ]);

  union(...results).forEach(view => exporter.result.views.push(processView(view, exporter)))

  return exporter;
}

function processOwnViews(exporter) {
  const queryBuilder = db.model('view').where({ model: exporter.model.id });

  if (exporter.type === 'for_import') {
    queryBuilder.whereNotIn('alias', map(exporter.template.views, 'alias'));
  }

  return queryBuilder;
}

// async function processInheritedViews(viewModel, exporter) {
//   if (exporter.type === 'for_import') {
//     return [];
//   }

//   const ancestors = await exporter.model.ancestors();
//   const ancestorIds = map(ancestors, 'id');

//   return db.model('view').whereIn('model', ancestorIds);
// }


function processView(attributes, _) {
  // TODO: process layout
  return attributes;
}
