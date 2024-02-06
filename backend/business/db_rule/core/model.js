import db from '../../../data-layer/orm/index.js';
import cache from '../../../presentation/shared/cache/index.js';
import templates from '../../model/templates.js';
import ModelImporter from '../../import/index.js';
import IntegrityManager from '../../integrity/index.js';
import { parseOptions } from '../../helpers/index.js';
import { createAuditModel } from '../../audit/model.js';
import { RecordNotValidError } from '../../error/index.js';

export const reloadCache = (action) => (record) => {
  const payload = record;

  cache.namespaces.core.messageBus.publish('service:reload_cache', {
    target: 'models',
    params: { action, payload },
  });
}

const validateAlias = (model, sandbox) => {
  if (model.alias && model.alias.startsWith('__')) {
    const message = sandbox.translate('static.alias_cannot_start_with_double_underscore');
    throw new RecordNotValidError(message);
  }
};

const processInheritsModel = async (model) => {
  const major = db.getModel('major_model');
  if (model.alias === major.alias) return model;

  const inherits = db.getModel(model.inherits_model, { silent: true });
  model.inherits_model = inherits.id || major.id;

  return model;
};

const createTable = model => db.schema.table.create(model);
const updateTable = model => {};
const deleteTable = model => db.schema.table.delete(model);

export const applyTemplateToModel = (model, sandbox, mode = 'base') => {
  if (['core', 'audit'].includes(model.type)) return;
  if (parseOptions(model.options).seeded_at) return;
  if (parseOptions(model.options).templated_at) return;

  const template = templates[model.template];
  if (!template) return;

  return new ModelImporter(sandbox, mode).process({ ...model, ...template });
};

const processAliasAfterUpdate = (model, sandbox) => {
  const prev = sandbox.record.getPrevValue('alias');
  const next = sandbox.record.getValue('alias');

  if (prev === next) return;

  return new IntegrityManager(model, sandbox).perform('update', { alias: model.alias });
};

export default {
  before_insert: [validateAlias, processInheritsModel],
  before_update: [validateAlias, processInheritsModel],
  after_insert: [reloadCache('insert'), createTable, applyTemplateToModel, createAuditModel],
  after_update: [reloadCache('update'), updateTable, processAliasAfterUpdate],
  after_delete: [reloadCache('delete'), deleteTable],
};
