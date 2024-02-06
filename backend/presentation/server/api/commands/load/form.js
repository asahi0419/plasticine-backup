import {
  isString,
  get,
  set,
  pick,
  concat,
  compact,
  map,
  each,
  keyBy,
  find,
  filter
} from 'lodash-es';
import Promise from 'bluebird'

import db from '../../../../../data-layer/orm/index.js';

import { parseOptions } from '../../../../../business/helpers/index.js';
import { serializer, loadFields, loadActions, loadRecord, loadExtraFieldsAttributes } from './helpers.js';
import { serializePage } from './pages.js';
import { FormNotFoundError, RecordNotFoundError } from '../../../../../business/error/index.js';
import logger from '../../../../../business/logger/index.js';
import { logUserActivity } from '../../../../../business/logger/user-activity-logger.js';
import { USER_ACTIVITIES } from './constants.js';

export const FORM_PERMISSIONS_TO_CHECK = {
  view_attachment: 'p.currentUser.canViewAttachment()',
  update_attachment: `p.currentUser.canUpdateAttachment()`,
};

export const ACTION_TYPES = [
  'form_button',
  'form_menu_item',
  'context_menu',
  'form_field',
];

export default async (req, res) => {
  const model = { ...req.model, access_script: 'true' };
  let result = serializer([model], 'model', { translate: ['name', 'plural'], req });

  try {
    const record = await loadRecord(req.model, req.query.id, req.sandbox);
    if (!record || (record && !record.__inserted && !req.query.new && !req.query.popup)) {
      throw new RecordNotFoundError();
    }

    req.sandbox.addVariable('action', record.__inserted ? 'update' : 'create');
    await req.sandbox.assignRecord(record, req.model, 'record', { preload_data: false });

    let form = await findFirstAvailableForm(req.model, req.sandbox);
    if (!form) throw new FormNotFoundError();

    form = await applyAttachmentsFallbackView(form);
    form.__permissions = {};

    each(FORM_PERMISSIONS_TO_CHECK, (script, name) => {
      try {
        form.__permissions[name] = req.sandbox.executeScript(
          script,
          `form/${form.id}/permission_to_${name}`,
          { modelId: req.model.id },
        );
      } catch (error) {
        form.__permissions[name] = false;
        logger.error(error);
      }
    });

    const errors = [];
    const fields = await loadFields(req.model, req.sandbox, { accessible: true });
    const models = await loadModels(req.model, req.sandbox, { fields });
    const views = await loadViews(req.model, req.sandbox);
    const actions = await loadActions(req.model, req.sandbox, ACTION_TYPES);
    const uiRules = await loadUIRules(req.model);
    const extraFieldsAttributes = await loadExtraFieldsAttributes(fields);

    const extend = await extendForm(form, req.sandbox);
    form = extend.form;

    const appearanceModel = await req.sandbox.vm.p.getModel('appearance');
    const appearances = await appearanceModel.find({ id: map(extend.views, 'appearance') }).raw()

    validateFormFields(form, fields, req.sandbox, errors);

    const formFieldActions = actions.filter(({ type }) => type === 'form_field');
    if (formFieldActions.length) {
      validateFormFieldActions(formFieldActions, fields, req.sandbox, errors);
    }

    result = concat(
      result,
      serializer(models, 'model', { translate: ['name'], req }),
      serializer(fields, 'field', { translate: ['name', 'options', 'hint'], req }),
      serializer(views, 'view', { translate: ['name'], req }),
      serializer(appearances, 'appearance', { translate: ['name'], req }),
      serializer(actions, 'action', { translate: ['name'], req }),
      serializer(form, 'form', { translate: ['options'], req }),
      serializer(uiRules, 'ui_rule'),
      serializer(extraFieldsAttributes, 'extra_fields_attribute'),
    );

    if (form.page) {
      const [page, pageActions] = await loadPage(form.page);

      if (page) {
        result = concat(result, [serializePage(page)]);
      }

      if (pageActions) {
        result = concat(result, serializer(pageActions, 'action', { translate: ['name'], req }));
      }
    }

    const json = { data: result };

    if (errors.length) {
      json.errors = map(errors, (description) => ({ description }));
    }

    res.json(json);

    logActivity(req);

  } catch (error) {
    res.error(error);
  }
};

export async function findFirstAvailableForm(model, sandbox) {
  const forms = await db.model('form').where({ model: model.id, active: true, __inserted: true })
                                      .orderBy('order', 'asc', { nulls: 'first' });
  let selectedForm;

  for (let i = 0; i < forms.length; i++) {
    const form = forms[i];

    let isAvailable = false;
    try {
      isAvailable = sandbox.executeScript(
        form.condition_script,
        `form/${form.id}/condition_script`,
        { modelId: model.id }
      );
    } catch (error) {
      logger.error(error);
    }

    if (isAvailable) {
      selectedForm = form;
      break;
    }
  }

  return selectedForm;
}

export async function extendForm(form, sandbox) {
  const options = parseOptions(form.options);
  const { components, related_components } = options;
  
  if (related_components.options) {
    await Promise.each(Object.keys(related_components.options), async (key) => {
      const options = related_components.options[key] || {}
      const access = await sandbox.executeScript(
        options.condition_script || '',
        `form/${form.id}/permission_to_related_view_${key}`,
        { modelId: form.model },
      );
  
      if (!access) {
        related_components.list = filter(related_components.list, item => {
          return item.id !== key
        })
      }
    })
  }

  const modelsToLoad = map(related_components.list, 'model');
  const fieldsToLoad = map(related_components.list, 'field');
  const viewsToLoad = map(related_components.list, 'view');

  await Promise.each(Object.keys(components.options), async (key) => {
    const component = components.options[key];

    let model = get(component, 'embedded_view.model');
    if (model) {
      if (isString(model)) {
        model = db.getModel(model).id;
        set(component, 'embedded_view.model', model);
      }
      modelsToLoad.push(model);
    }

    const field = get(component, 'embedded_view.field');
    if (field) fieldsToLoad.push(field);

    await Promise.each(['embedded_view.view', 'last_versions_view', 'previous_versions_view'], async (viewPath) => {
      let view = get(component, viewPath);
      if (view) {
        if (isString(view)) {
          view = await db.model('view').where({ model, alias: view }).pluck('id').getOne();
          set(component, viewPath, view);
        }
        viewsToLoad.push(view);
      }
    });
  });

  const models = modelsToLoad.length
    ? await db.model('model').where({ __inserted: true }).whereIn('id', modelsToLoad).select(['id', 'alias', 'name'])
    : [];
  const modelsMap = keyBy(models, 'id');

  const fields = fieldsToLoad.length
    ? map(filter(db.getFields(), (f) => fieldsToLoad.includes(f.id)), (f) => pick(f, ['id', 'alias', 'name', 'type']))
    : [];
  const fieldsMap = keyBy(fields, 'id');

  const viewsTable = db.model('view').tableName;
  const filtersTable = db.model('filter').tableName;
  const views = viewsToLoad.length
    ? await db.model('view').whereIn(`${viewsTable}.id`, compact(viewsToLoad))
      .where(`${viewsTable}.__inserted`, true)
      .leftJoin(filtersTable, `${viewsTable}.filter`, `${filtersTable}.id`)
      .select([
        `${viewsTable}.id`,
        `${viewsTable}.alias`,
        `${viewsTable}.name`,
        `${viewsTable}.appearance`,
        `${viewsTable}.layout`,
        `${viewsTable}.type`,
        `${viewsTable}.filter as filterId`,
        `${filtersTable}.query as filter`,
      ])
    : [];
  const viewsMap = keyBy(views, 'id');

  if (related_components.list.length) {
    const newReleatedComponents = related_components.list.map(({ id, model, field, view }) =>
      ({ id, model: modelsMap[model], field: fieldsMap[field], view: viewsMap[view] })
    );

    options.related_components.list = newReleatedComponents;
  }

  each(components.options, (component, alias) => {
    const model = get(component, 'embedded_view.model');
    if (model) set(component, 'embedded_view.model', modelsMap[model]);

    const field = get(component, 'embedded_view.field');
    if (field) set(component, 'embedded_view.field', fieldsMap[field]);

    ['embedded_view.view', 'last_versions_view', 'previous_versions_view'].forEach((viewPath) => {
      const view = get(component, viewPath);
      if (view) set(component, viewPath, viewsMap[view]);
    });
  });

  form.options = JSON.stringify(options);
  return { form, views };
}

export const applyAttachmentsFallbackView = (form) => {
  const options = parseOptions(form.options);
  const attachmentsOptions = options.components.options['__attachments__'];

  if (attachmentsOptions && !attachmentsOptions.last_versions_view) {
    return findLastVersionsView()
      .then((view) => {
        options.components.options['__attachments__'].last_versions_view = view.id;
        form.options = JSON.stringify(options);
        return form;
      });
  }

  return form;
};

export async function findLastVersionsView() {
  const attachmentModel = db.getModel('attachment');
  return db.model('view').where({ model: attachmentModel.id, alias: 'last_versions', __inserted: true }).getOne();
}

export async function loadPage(id) {
  const pageModel = db.getModel('page');
  const page = await db.model('page').where({ id }).getOne();
  if (!page) return [];

  const field = db.getField({ model: pageModel.id, alias: 'actions' });
  const rows = await db.model('rtl').where({ source_field: field.id, source_record_id: page.id, __inserted: true }).select('target_record_id');
  const actions = await db.model('action').whereIn('id', map(rows, 'target_record_id')).where({ active: true, __inserted: true });

  page.actions = map(actions, 'id');
  return [page, actions];
}

export async function loadUIRules(model) {
  return db.model('ui_rule').where({ model: model.id, active: true, __inserted: true }).select('id', 'type', 'script', 'order');
}

export function validateFormFieldActions(actions, fields, sandbox, errors) {
  actions.forEach(({ name, options }) => {
    const { field_related } = parseOptions(options);

    if (field_related) {
      const field = fields.find(({ alias }) => alias === field_related);

      if (!field) {
        const error = sandbox.translate('static.wrong_field_related_option_for_action', { field: field_related, action: name });

        logger.error(error);
        errors.push(error);
      }
    }
  });
}

export async function loadModels(model, sandbox, context = {}) {
  const result = [];

  if (model.alias === 'field') {
    const options = parseOptions(sandbox.record.getValue('options'));

    if (isString(options.foreign_model)) {
      const model = db.getModel(options.foreign_model);
      if (model) result.push(model);
    }
  }

  each(context.fields, (field) => {
    if (field.type === 'global_reference') {
      const value = sandbox.record.getValue(field.alias);

      const model = db.getModel(value?.model, { silent: true });
      if (model) result.push(model);
    }
  });

  return result;
}

export async function loadViews(model, sandbox) {
  const result = [];

  if (model.alias === 'field') {
    const options = parseOptions(sandbox.record.getValue('options'));

    if (isString(options.foreign_model) && isString(options.view)) {
      const model = db.getModel(options.foreign_model);
      const view = await db.model('view').where({ model: model.id, alias: options.view, __inserted: true }).getOne();
      if (view) result.push(view);
    }
  }

  return result;
}

export function validateFormFields(form, fields, sandbox, errors) {
  if (form.page) return;

  const options = parseOptions(form.options);
  const { components = {} } = options;
  const { list = [] } = components;

  options.components.list = filter(list, (alias) => {
    if (alias.startsWith('__')) return true;
    if (['__form_items_chooser__', '__related_data_chooser__'].includes(alias)) return true;
    if (find(fields, { alias })) return true;

    const error = sandbox.translate('static.form_contains_wrong_options', { field: alias });

    logger.error(error);
    errors.push(error);

    return false;
  });

  form.options = JSON.stringify(options);
}

async function logActivity(request) {
  if (request.query['parent'] === undefined) {
    await logUserActivity({
      user: request.user,
      headers: request.headers,
      url: request.originalUrl,
      activity: USER_ACTIVITIES.Form
    });
  }
}
