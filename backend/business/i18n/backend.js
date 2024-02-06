import Promise from 'bluebird';
import { merge, set } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import logger from '../logger/index.js';

class Backend {
  constructor(services, options = {}) {
    this.init(services, options);
    this.type = 'backend';
  }

  init(services, backendOptions, i18nextOptions) {}

  read(language, namespace, callback) {
    loadTranslations([language]).then(translations => callback(null, translations[language]));
  }

  readMulti(languages, namespaces, callback) {
    loadTranslations(languages).then(translations => callback(null, wrapToI18nextCollection(translations)));
  }

  create(languages, namespace, key, fallbackValue) {}
}

Backend.type = 'backend';

function loadTranslations(languages) {
  return Promise.all([
    loadStaticTranslations(languages),
    loadDynamicTranslations(languages),
    loadJSONTranslations(languages),
  ])
    .then(translations => merge(...translations));
}

async function loadStaticTranslations(languages) {
  const translations = await db.model('static_translation').select('key', ...languages);
  const result = {};

  translations.forEach((t) => {
    languages.forEach(lng => {
      return set(result, [lng, 'static', t.key], t[lng] || t['en'] );
    })
  });

  return result;
}

async function loadDynamicTranslations(languages) {
  const modelsTable = db.model('model').tableName;
  const fieldsTable = db.model('field').tableName;
  const translationTable = db.model('dynamic_translation').tableName;

  const columnsToSelect = languages.map(language => `${translationTable}.${language}`);
  columnsToSelect.push(`${modelsTable}.alias as model`);
  columnsToSelect.push(`${translationTable}.record_id as record_id`);
  columnsToSelect.push(`${fieldsTable}.alias as field`);

  const translations = await db.model('dynamic_translation')
    .select(columnsToSelect)
    .leftJoin(modelsTable, `${translationTable}.model`, `${modelsTable}.id`)
    .leftJoin(fieldsTable, `${translationTable}.field`, `${fieldsTable}.id`);

  const result = {}

  translations.forEach((t) => {
    languages.forEach(lng =>
      set(result, [lng, 'dynamic', t.model, `record_${t.record_id}`, t.field], t[lng])
    );
  });

  return result;
}

async function loadJSONTranslations(languages) {
  const modelsTable = db.model('model').tableName;
  const fieldsTable = db.model('field').tableName;
  const translationTable = db.model('json_translation').tableName;

  const columnsToSelect = languages.map(language => `${translationTable}.${language}`);
  columnsToSelect.push(`${modelsTable}.alias as model`);
  columnsToSelect.push(`${translationTable}.record_id as record_id`);
  columnsToSelect.push(`${fieldsTable}.alias as field`);
  columnsToSelect.push(`${translationTable}.path as path`);

  const translations = await db.model('json_translation')
    .select(columnsToSelect)
    .leftJoin(modelsTable, `${translationTable}.model`, `${modelsTable}.id`)
    .leftJoin(fieldsTable, `${translationTable}.field`, `${fieldsTable}.id`);

  const result = {}

  translations.forEach((t) => {
    languages.forEach(lng =>
      set(result, [lng, 'json', t.model, `record_${t.record_id}`, t.field, t.path], t[lng])
    );
  });

  return result;
}

function wrapToI18nextCollection(translations) {
  return Object.keys(translations).reduce((result, language) => {
    result[language] = { translations: translations[language] };
    return result;
  }, {});
}

export default Backend;
