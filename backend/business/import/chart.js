import Promise from 'bluebird';

import db from '../../data-layer/orm/index.js';

export default function importCharts(records, { model, sandbox, mode }) {
  if (records === undefined) return;

  return Promise.map(records, async (record) => {
    const manager = await db.model('chart', sandbox).getManager(mode !== 'seeding');
    return processChart({ ...record, model: model.id }, manager);
  });
}

async function processChart(attributes, manager) {
  const record = await db.model('chart').where({ data_source: attributes.data_source, name: attributes.name }).getOne();
  if (!record) return manager.create(attributes);
}
