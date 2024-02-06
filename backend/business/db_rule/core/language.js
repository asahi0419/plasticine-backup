import db from '../../../data-layer/orm/index.js';

async function createColumnInTranslations(language, sandbox) {
  const fieldAttributes = {
    name: language.name,
    alias: language.alias,
    type: 'string',
    options: { length: 10000 },
    __lock: ['delete'],
  };

  const translationModels = await db.model('model').whereIn('alias', ['static_translation', 'dynamic_translation', 'json_translation']);
  if (translationModels.length < 3) return;

  const staticTranslationModel = db.getModel('static_translation');
  await db.model('field', sandbox).createRecord({ model: staticTranslationModel.id, ...fieldAttributes });

  const dynamicTranslationModel = db.getModel('dynamic_translation');
  await db.model('field', sandbox).createRecord({ model: dynamicTranslationModel.id, ...fieldAttributes });

  const jsonTranslationModel = db.getModel('json_translation');
  await db.model('field', sandbox).createRecord({ model: jsonTranslationModel.id, ...fieldAttributes });
}

export default {
  after_insert: [createColumnInTranslations],
};
