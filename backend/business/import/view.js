import Promise from 'bluebird';

import db from '../../data-layer/orm/index.js';

export default (records = [], context = {}) => {
  return Promise.map(records, async (r = {}) => {
    const record = await db.model('view').where({
      model: context.model.id,
      alias: r.alias,
    }).getOne();

    if (!record) {
      return db.model('view', context.sandbox).createRecord({
        ...r,
        model: context.model.id,
        layout: await getMetaRecordId('layout', r.layout, context),
        appearance: await getMetaRecordId('appearance', r.appearance, context),
        filter: await getMetaRecordId('filter', r.filter, context),
        chart: await getMetaRecordId('chart', r.chart, context),
      }, context.mode !== 'seeding');
    }
  });
}

async function getMetaRecordId(section, input, context = {}) {
  if (input) {
    let record;

    switch (typeof input) {
      case 'string':
        record = await db.model(section).where({ model: context.model.id, name: input }).getOne();
        break;
      case 'object':
        record = await db.model(section, context.sandbox).createRecord({
          ...input,
          model: context.model.id
        }, context.mode !== 'seeding');
        break;
    }

    if (record) return record.id;
  }
}
