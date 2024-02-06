import Promise from 'bluebird'
import lodash from 'lodash-es'

import db from '../../../../data-layer/orm/index.js';
import cache from '../../../../presentation/shared/cache/index.js';
import * as HELPERS from './helpers.js';
import { parseOptions } from '../../../helpers/index.js';

const reloadCache = (action) => (record) => {
  const payload = record;

  cache.namespaces.core.messageBus.publish('service:reload_cache', {
    target: 'forms',
    params: { action, payload },
  });
}

const processOptions = async (record) => {
  const options = parseOptions(record.options);

  await HELPERS.processComponentsAttachmentsOptions(options);
  await HELPERS.processComponentsWorklogOptions(options);

  HELPERS.cleanupComponentsOptions(options);

  record.options = JSON.stringify(options);
  return record;
};

const updateJsonTranslations = async (record, sandbox) => {
  const model = db.getModel('form');
  const options = parseOptions(record.options);
  const jsonTranslations = await db.model('json_translation').where({ model: model.id, record_id: record.id })

  await Promise.each(jsonTranslations, async (translation) => {
    const value = lodash.get(options, translation.path.split('/'))
    const tValue = translation[sandbox.user.language.alias]

    if (value) {
      if (tValue) {
        if (value !== tValue) {
          await db.model('json_translation', sandbox)
            .updateRecord(translation, { [sandbox.user.language.alias]: value })
        }
      }
    } else {
      if (tValue) {
        await db.model('json_translation', sandbox)
          .destroyRecord(translation)
      }
    }
  })
}

const deleteJsonTranslations = async (record, sandbox) => {
  const model = db.getModel('form');
  const jsonTranslations = await db.model('json_translation').where({ model: model.id, record_id: record.id })

  await Promise.each(jsonTranslations, async (translation) => {
    await db.model('json_translation', sandbox).destroyRecord(translation)
  })
}

export default {
  before_insert: [processOptions],
  before_update: [processOptions],
  after_insert:[reloadCache('insert')],
  after_update: [reloadCache('update'), updateJsonTranslations],
  after_delete: [reloadCache('delete'), deleteJsonTranslations],
};
