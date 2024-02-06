import Promise from 'bluebird';
import { difference, keyBy, map, filter, reduce, isObject, each, find, compact } from 'lodash-es';

import db from '../../index.js';
import PlannedManager from '../../../../business/background/planned/index.js';
import * as DB_RULES_CORE_FIELD from '../../../../business/db_rule/core/field/index.js';
import { COMPONENTS_TO_CLEANUP } from '../../../../business/integrity/performers/model.js';
import { applyTemplateToModel } from '../../../../business/db_rule/core/model.js';
import { createAuditModel } from '../../../../business/audit/model.js';
import { parseOptions, mergeActions } from '../../../../business/helpers/index.js';

const METADATA_SECTIONS = [
  'field',
  'action',
  'form',
  'db_rule',
  'ui_rule',
  'view',
  'layout',
  'appearance',
  'chart',
  'filter',
  'permission',
];

export default async (sandbox) => {
  await cleanup(sandbox);
  await usePagesForForm(sandbox);
  await applyTemplateToModels(sandbox);
  await createAuditModels(sandbox);
  await setInheritsModel(sandbox);
  await setDefaultLanguages(sandbox);
  await setDefaultForms(sandbox);
  await createCoreLocks(sandbox);
  await createPermissions(sandbox);
  await createPlannedTasks(sandbox);
};

async function cleanup(sandbox) {
  console.log('\x1b[32m%s\x1b[0m', `[DB - Finalize] Cleanup ...`);

  try {
    await cleanupModels(sandbox);
    await cleanupFields(sandbox);
  } catch (error) {
    if (+process.env.DEBUG) {
      console.error(error);
    }
  }
}

async function cleanupModels(sandbox) {
  const records = await db.model('model').pluck('id');

  const modelsTables = map(records, (model) => db.model(model).tableName);
  const actualTables = map((await db.client.raw(`SELECT tablename FROM pg_catalog.pg_tables WHERE tablename ~ '^object_[0-9]+$'`)).rows, 'tablename');
  const tables = difference(actualTables, modelsTables);
  const models = map(difference(modelsTables, actualTables), (m) => +m.split('_')[1]);

  if (tables.length) {
    await Promise.each(tables, (table) => db.schema.table.connection.schema.dropTable(table));
    console.log(`[Tables] Delete count: ${tables.length}\n  ${tables.join('\n  ')}`);
  }

  if (models.length) {
    await db.model('model').whereIn('id', models).delete();

    await Promise.each(models, async (id) => {
      await Promise.each(COMPONENTS_TO_CLEANUP, async ({ model, field }) => {
        await db.model(model).where({ [field]: id }).delete();
      });
    });
    console.log(`[Models] Delete count: ${models.length}\n  ${models.join('\n  ')}`);
  }
}

async function cleanupFields(sandbox) {
  const models = await db.model('model').pluck('id');
  const records = await db.model('field').select(['id', 'model', 'alias', 'type', 'virtual', '__inserted']);
  const columns = await Promise.reduce(models, async (r, m) => {
    const c = await db.client.raw(`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${db.model(m).tableName}'`);
    return { ...r, [m]: map(c.rows, 'column_name') };
  }, {});

  const result = reduce(records, (r, f) => {
    if (!f.__inserted) {
      r.no_inserted.push(f.id);
      return r;
    }

    if (!models.includes(f.model)) {
      r.no_model.push(f.id);
      return r;
    }

    if (!f.alias) {
      r.no_alias.push(f.id);
      return r;
    }

    if (!f.type) {
      r.no_type.push(f.id);
      return r;
    }

    if (db.schema.VIRTUAL_FIELDS.includes(f.type) || f.virtual) return r;

    if (!columns[f.model].includes(f.alias)) {
      r.no_column.push(f.id);
      return r;
    }

    return r;
  }, {
    no_inserted: [],
    no_model: [],
    no_alias: [],
    no_type: [],
    no_column: [],
  });
  const fields = reduce(result, (r, v) => [ ...r, ...v ], []);

  if (fields.length) {
    await db.model('field').whereIn('id', fields).delete();

    console.log(`[Fields] Delete count: ${fields.length}`);

    if (result.no_inserted.length) console.log(`No inserted count: ${result.no_inserted.length}\n  ${result.no_inserted.join('\n  ')}`);
    if (result.no_model.length) console.log(`No model count: ${result.no_model.length}\n  ${result.no_model.join('\n  ')}`);
    if (result.no_alias.length) console.log(`No alias count: ${result.no_alias.length}\n  ${result.no_alias.join('\n  ')}`);
    if (result.no_type.length) console.log(`No type count: ${result.no_type.length}\n  ${result.no_type.join('\n  ')}`);
    if (result.no_column.length) console.log(`No column count: ${result.no_column.length}\n  ${result.no_column.join('\n  ')}`);
  }
}

async function usePagesForForm(sandbox) {
  console.log('\x1b[32m%s\x1b[0m', `[DB - Finalize] Use pages for form ...`);

  await usePageForForm('layout', 'default', (await import('../pages/layout-manager.js')).default, sandbox);
  await usePageForForm('filter', 'default', (await import('../pages/filter-manager.js')).default, sandbox);
  await usePageForForm('appearance', 'default', (await import('../pages/appearance-manager.js')).default, sandbox);
  await usePageForForm('permission', 'default', (await import('../pages/permission-manager.js')).default, sandbox);
  await usePageForForm('user_sidebar', 'default', (await import('../pages/user-sidebar-manager.js')).default, sandbox);
}

async function usePageForForm(modelAlias, formAlias, pageAttributes, sandbox) {
  const model = db.getModel(modelAlias);

  const form = await db.model('form').where({ model: model.id, alias: formAlias }).getOne();
  let actions = await db.model('action')
    .whereIn('model', compact([ model.id, model.inherits_model ]))
    .whereIn('alias', ['create', 'update', 'delete']);
  actions = mergeActions(actions, model);

  pageAttributes.actions = (pageAttributes.actions || []).concat(map(actions, 'id'));

  const manager = await db.model('page', sandbox).getManager(false);
  let page = await db.model('page').where({ alias: pageAttributes.alias }).getOne();
  page = await (page ? manager.update(page, pageAttributes) : manager.create(pageAttributes));

  if (form !== page.id) {
    await db.model('form', sandbox).updateRecord(form, { page: page.id }, false);
  }
}

async function applyTemplateToModels(sandbox) {
  console.log('\x1b[32m%s\x1b[0m', `[DB - Finalize] Apply template to models ...`);

  const models = await db.model('model').whereIn('type', ['system', 'custom']).where({ __inserted: true });
  let promise = Promise.resolve();

  models.forEach((model) => {
    promise = promise.then(() => applyTemplateToModel(model, sandbox, 'seeding'));
  });

  return promise;
}

async function createAuditModels(sandbox) {
  console.log('\x1b[32m%s\x1b[0m', `[DB - Finalize] Create audit models ...`);

  const modelsToProcess = await db.model('model').whereIn('type', ['core', 'system', 'custom']).where({ __inserted: true });
  const auditModels = await db.model('model').where({ type: 'audit' }).where({ __inserted: true });
  const auditModelsMap = keyBy(auditModels, 'master_model');

  let promise = Promise.resolve();

  modelsToProcess.forEach((model) => {
    if (!auditModelsMap[model.id]) {
      promise = promise.then(() => createAuditModel(model, sandbox));
    }
  });

  return promise;
}

async function setInheritsModel(sandbox) {
  console.log('\x1b[32m%s\x1b[0m', `[DB - Finalize] Set inherits model ...`);

  const major = db.getModel('major_model');

  await db.model('model').where('alias', major.alias).update({ inherits_model: null })
  await db.model('model').whereNot('alias', major.alias).update({ inherits_model: major.id })
}

async function setDefaultLanguages(sandbox) {
  console.log('\x1b[32m%s\x1b[0m', '[DB - Finalize] Set default languages ...');

  const defaultLanguage = await db.model('language').where({ status: 'active', default: true, __inserted: true }).getOne();
  if (!defaultLanguage) return;
  return db.model('user').where({ language: null }).update({ language: defaultLanguage.id });
}

async function setDefaultForms(sandbox) {
  console.log('\x1b[32m%s\x1b[0m', '[DB - Finalize] Set default forms ...');

  await setDefaultFormModel(sandbox);
  await setDefaultFormSession(sandbox);
  await setDefaultFormUser(sandbox);
  await setDefaultFormTutorial(sandbox);
  await setDefaultFormAppearance(sandbox);
  await setDefaultFormGeoMetadata(sandbox);
}

async function setDefaultFormAppearance() {
  const model = db.getModel('appearance');
  const selector = db.model('form').where({ model: model.id, alias: 'default' });
  const form = await selector.getOne();
  const options = parseOptions(form.options);

  const related = [
    {
      model: 'geo_object_property',
      field: 'appearance_id',
      view: 'default',
    },
    {
      model: 'geo_metadata',
      field: { model: 'appearance', alias: 'geo_metadata' },
      view: 'default',
    },
    {
      model: 'free_geo_object',
      field: 'appearance_id',
      view: 'default',
    },
    {
      model: 'associated_geo_object',
      field: 'appearance_id',
      view: 'default',
    },
  ];

  options.related_components.options = options.related_components.options || {};
  options.related_components.list = await Promise.map(related, async (list = {}) => {
    const model = db.getModel(list.model);
    const view = await db.model('view').where({ model: model.id, alias: list.view }).getOne();
    const field = isObject(list.field)
      ? db.getField({ model: db.getModel(list.field.model).id, alias: list.field.alias })
      : db.getField({ model: model.id, alias: list.field });

    const id = `${field.id}_${model.id}_${view.id}`;

    let name = model.plural;
    if (isObject(list.field)) name = field.name;

    options.related_components.options[id] = {
      ...(options.related_components.options[id] || {}),
      name,
      condition_script: "p.record.getValue('type') == 'map'",
    };

    return {
      id,
      model: model.id,
      field: field.id,
      view: view.id,
    };
  });

  return selector.update({ options });
}

async function setDefaultFormGeoMetadata() {
  const model = db.getModel('geo_metadata');
  const selector = db.model('form').where({ model: model.id, alias: 'default' });
  const form = await selector.getOne();
  const options = parseOptions(form.options);

  const related = [
    {
      model: 'appearance',
      field: 'geo_metadata',
      view: 'default',
    },
    {
      model: 'associated_geo_object',
      field: 'metadata',
      view: 'default',
    },
    {
      model: 'geo_metadata',
      field: 'point_a_ref',
      view: 'default',
      name: 'Geo metadata (Point A)',
    },
    {
      model: 'geo_metadata',
      field: 'point_b_ref',
      view: 'default',
      name: 'Geo metadata (Point B)',
    },
  ];

  options.related_components.options = options.related_components.options || {};
  options.related_components.list = await Promise.map(related, async (list = {}) => {
    const model = db.getModel(list.model);
    const field = db.getField({ model: model.id, alias: list.field });
    const view = await db.model('view').where({ model: model.id, alias: list.view }).getOne();

    const id = `${field.id}_${model.id}_${view.id}`;

    options.related_components.options[id] = {
      ...(options.related_components.options[id] || {}),
      name: list.name || model.plural,
      condition_script: 'true',
    };

    return {
      id,
      model: model.id,
      field: field.id,
      view: view.id,
    };
  });

  return selector.update({ options });
}

async function setDefaultFormModel() {
  const selector = db.model('form').where({ model: 1, alias: 'default' });
  const form = await selector.getOne();
  const options = parseOptions(form.options);

  options.related_components.options = options.related_components.options || {};
  options.related_components.list = await Promise.map(METADATA_SECTIONS, async (alias) => {
    const model = db.getModel(alias);
    const modelAlias = (model.alias === 'chart') ? 'data_source' : 'model';
    const field = await db.model('field').where({ alias: modelAlias, model: model.id }).getOne();
    const view = await db.model('view').where({ alias: 'default', model: model.id }).getOne();
    const id = `${(field || {}).id}_${(model || {}).id}_${(view || {}).id}`;
    const componentOptions = options.related_components.options[id] || {};

    options.related_components.options[id] = {
      ...componentOptions,
      name: model.plural,
      condition_script: componentOptions.condition_script || 'true',
    };

    return { id, model: (model || {}).id, field: (field || {}).id, view: (view || {}).id };
  });

  return selector.update({ options });
}

async function createRelatedListItem(options, rtlModelName, refFieldAlias) {
  const model = db.getModel(rtlModelName);
  const field = await db.model('field').where({alias: refFieldAlias, model: model.id, type: 'reference'}).getOne();
  const view = await db.model('view').where({alias: 'default', model: model.id}).getOne();
  const id = `${(field || {}).id}_${(model || {}).id}_${(view || {}).id}`;
  const componentOptions = options.related_components.options[id] || {};
  options.related_components.options[id] = {...componentOptions, name: model.plural};
  return {id, model: (model || {}).id, field: (field || {}).id, view: (view || {}).id};
}

async function setDefaultFormTutorial(sandbox) {
  const relatedListModel = db.getModel('tutorial');
  const selector = db.model('form').where({ model: relatedListModel.id, alias: 'default' });
  const form = await selector.getOne();
  const options = parseOptions(form.options);

  options.related_components.options = options.related_components.options || {};
  let relatedListItem = await createRelatedListItem(options, 'tutorial_article', 'tutorial');

  let isSeed = options.related_components.list.find(item => item.id === relatedListItem.id);
  if(!isSeed){
    options.related_components.list.push(relatedListItem);
    return selector.update({ options });

  }
}
async function setDefaultFormSession() {
  const sessionModel = db.getModel('session');
  const selector = db.model('form').where({ model: sessionModel.id, alias: 'default' });
  const form = await selector.getOne();
  const options = parseOptions(form.options);

  options.related_components.options = options.related_components.options || {};
  let sessionItem = await createRelatedListItem(options, 'user_activity_log', 'session');

  let isSeed = options.related_components.list.find(item => item.id === sessionItem.id);
  if(!isSeed){
    options.related_components.list.push(sessionItem);
    return selector.update({ options });
  }
}

async function setDefaultFormUser() {
  const sessionModel = db.getModel('user');
  const selector = db.model('form').where({ model: sessionModel.id, alias: 'default' });

  const form = await selector.getOne();
  const options = parseOptions(form.options);

  options.related_components.options = options.related_components.options || {};

  let userItem = await createRelatedListItem(options, 'user_activity_log', 'created_by');

  let isSeed = options.related_components.list.find(item => item.id === userItem.id);
  if(!isSeed){
    options.related_components.list.push(userItem);
    selector.update({ options });
  }

  let sessionItem = await createRelatedListItem(options, 'session', 'created_by');

  isSeed = options.related_components.list.find(item => item.id === sessionItem.id);

  if(!isSeed){
    options.related_components.list.push(sessionItem);
    return selector.update({ options });
  }
}

async function createCoreLocks(sandbox) {
  console.log('\x1b[32m%s\x1b[0m', `[DB - Finalize] Create core locks ...`);

  await protectCoreAccountsUserGroups(sandbox);
  await protectCoreAccountsEmails(sandbox);
}

async function protectCoreAccountsUserGroups(sandbox) {
  const userGroupsFieldId = await db.model('field').pluck('id').where({ model: db.getModel('user').id, alias: 'user_groups' }).getOne();
  const userGroupIds = await db.model('user_group').pluck('id').whereIn('alias', ['__core', '__public']);
  const accountIds = await db.model('account').pluck('id').whereIn('email', [process.env.APP_ADMIN_USER, 'guest@free.man']);
  const userIds = [
    ...await db.model('user').pluck('id').whereIn('account', accountIds),
    ...await db.model('user').pluck('id').where({ name: 'System', surname: 'Planned tasks' }),
  ];
  const rtlIds = await Promise.reduce(userIds, async (result, userId) => {
    const ids = await db.model('rtl').pluck('id').where({ source_record_id: userId, source_field: userGroupsFieldId }).whereIn('target_record_id', userGroupIds);
    return [ ...result, ...ids ];
  }, []);

  await Promise.each(rtlIds, async (rtlId) => {
    const attributes = { model: db.getModel('rtl').id, record_id: rtlId, delete: true, __inserted: true };
    const record = await db.model('core_lock').pluck('id').where(attributes).getOne();
    if (!record) await db.model('core_lock').insert({ ...attributes, created_by: sandbox.user.id, created_at: new Date() });
  });
}

async function protectCoreAccountsEmails(sandbox) {
  const accountIds = await db.model('account').pluck('id').whereIn('email', [process.env.APP_ADMIN_USER, 'guest@free.man']);
  const accountEmailFieldId = await db.model('field').pluck('id').where({ model: db.getModel('account').id, alias: 'email' }).getOne();

  await Promise.each(accountIds, async (accountId) => {
    const attributes = { model: db.getModel('account').id, record_id: accountId, field_update: accountEmailFieldId, __inserted: true };
    const record = await db.model('core_lock').pluck('id').where(attributes).getOne();
    if (!record) await db.model('core_lock').insert({ ...attributes, created_by: sandbox.user.id, created_at: new Date() });
  });
}

async function createPermissions(sandbox) {
  console.log('\x1b[32m%s\x1b[0m', `[DB - Finalize] Create permissions ...`);

  await createFieldPermissions(sandbox);
}

async function createFieldPermissions(sandbox) {
  const fields = await db.model('field').select(['id', 'model', 'type']).where({ __inserted: true }).whereNotNull('model');
  const fieldsPermissions = await db.model('permission').pluck('field').where({ type: 'field', __inserted: true });
  const fieldsWithoutPermission = filter(fields, ({ id }) => !fieldsPermissions.includes(id));

  await Promise.each(fieldsWithoutPermission, (field) => {
    return DB_RULES_CORE_FIELD.createPermissions(field, sandbox, 'secure');
  });
}

async function createPlannedTasks(sandbox) {
  console.log('\x1b[32m%s\x1b[0m', `[DB - Finalize] Create planned tasks ...`);

  await createScheduledPlannedTasks(sandbox);
}

async function createScheduledPlannedTasks(sandbox) {
  const taskNames = ['Ip Ban cleaner (Core)', 'Session cleaner (Core)', 'Global Cleaner (Core)'];
  const coreScheduledTasks = await db.model('scheduled_task').whereIn('name', taskNames);
  const coreScheduledPlannedTasks = await db.model('planned_task').pluck('scheduled_task').whereIn('id', map(coreScheduledTasks, 'id'));

  const inactiveScheduledTasks = filter(coreScheduledTasks, ({ id }) => !coreScheduledPlannedTasks.includes(id));

  await Promise.each(inactiveScheduledTasks, (task) => {
    return new PlannedManager({ ...task, __type: 'scheduled_task' }, sandbox).perform('create');
  });
}
