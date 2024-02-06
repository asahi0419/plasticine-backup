import {
  pick,
  compact,
  uniq,
  uniqBy,
  isString,
  isArray,
  map,
  keyBy,
  some,
  each,
  filter,
  find,
  sortBy,
} from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../../business/logger/index.js';
import { recordSerializer } from '../../../../../business/record/serializer/json.js';
import { getPermittedFields } from '../../../../../business/security/permissions.js';
import { parseOptions, parseNumber, mergeActions } from '../../../../../business/helpers/index.js';


export const serializer = (input, type, options = {}) => {
  if (isArray(input)) {
    return tryTranslate(input, type, options).map((item) => {
      return recordSerializer(transformAttributes(item, type), false);
    });
  }

  return recordSerializer(tryTranslate(transformAttributes(input, type), type, options), false);
};

function tryTranslate(input, type, options) {
  const { translate: translatedFields, req, sandbox } = options || {};

  if (isArray(translatedFields) && translatedFields.length && req) {
    return req.translate(input, type, translatedFields);
  } else if (isArray(translatedFields) && translatedFields.length && sandbox) {
    return sandbox.translate(input, type, translatedFields);
  }

  return input;
}

function transformAttributes(item, type) {
  if (['action', 'page'].includes(type)) {
    if (item.server_script) item.server_script = 'true';
  }

  return { ...item, __type: type };
}

export const createFilterByScript = (resourceType, fieldAlias, sandbox) => (resources, context) => {
  return resources.filter((resource) => {
    try {
      return sandbox.executeScript(
        resource[fieldAlias] || 'false',
        `${resourceType}/${resource.id}/${fieldAlias}`,
        typeof context === 'function' ? context(resource) : context,
      );
    } catch(error) {
      logger.error(error);
      return false;
    }
  });
};

export const loadFields = async (model, sandbox, params) => {
  const fields = await getPermittedFields(model, sandbox, params);
  return extendFields(fields, sandbox);
};

export const extendFields = async (fields, sandbox) => {
  const result = map(fields, (f) => ({ ...f, options: parseOptions(f.options) }));

  await loadLocksForFields(result, sandbox);
  await extendReferenceFields(result);

  result.forEach((f) => {
    if (f.type === 'datetime') {
      f.options.date_only = f.options.date_only || false;
    }
    if (['integer', 'float'].includes(f.type)) {
      if (isString(f.options.min)) f.options.min = parseNumber(f.options.min);
      if (isString(f.options.max)) f.options.max = parseNumber(f.options.max);
      if (isString(f.options.step)) f.options.step = parseNumber(f.options.step);
    }
  });

  return map(result, (f) => ({ ...f, options: JSON.stringify(f.options) }));
};

export const loadExtraFieldsAttributes = async (fields) => {
  const efaField = db.getField({ alias: 'extra_attributes' });
  const rtls = await db.model('rtl').where({ source_field: efaField.id }).whereIn('source_record_id', map(fields, 'id'));
  const efas = await db.model('extra_fields_attribute').whereIn('id', map(rtls, ({ target_record_id }) => target_record_id));

  each(fields, field => {
    const fieldRtls = filter(rtls, { source_record_id: field.id });
    const fieldEfas = filter(efas, ({ id }) => map(fieldRtls, 'target_record_id').includes(id));

    field.extra_attributes = map(fieldEfas, 'id');
  });

  return efas;
}

export const loadActions = async (model, sandbox, types) => {
  const attributes = { __inserted: true };

  if (sandbox.vm.p.action === 'create') attributes.on_insert = true;
  if (sandbox.vm.p.action === 'update') attributes.on_update = true;

  const actions = await db.model('action')
    .where(function () {
      this.where(attributes).orWhere('group', true);
    })
    .whereIn('model', compact([model.id, model.inherits_model]))
    .whereIn('type', types);

  return mergeActions(actions, model);
};

export async function loadRecord(model, id) {
  try {
    return db.model(model.alias).where({ id }).getOne();
  } catch (error) {
    logger.error(error);
  }
}

export const loadTemplates = async (model) => {
  const modelTableName = db.model(model.alias).tableName;
  const fieldTableName = db.model('field').tableName;
  const dvfFields = db.getFields({ model: model.id, type: 'data_visual' });
  if (!dvfFields.length) return [];

  const tCrosses = await db.model('t_cross').whereRaw(`dvf_field_id IN (${map(dvfFields, 'id')}) AND dvf_record_id IN (SELECT DISTINCT ${modelTableName}.id FROM ${modelTableName} WHERE (${map(dvfFields, ({ id }) => `((SELECT ${fieldTableName}.alias FROM ${fieldTableName} WHERE ${fieldTableName}.id = ${id}) IS NOT NULL)`).join(' OR ')}))`);
  const dtfFields = await db.model('field').whereIn('id', map(tCrosses, 'dtf_field_id'));

  const mapping = map(tCrosses, (tCross) => ({
    t_cross: tCross,
    dvf: find(dvfFields, { id: tCross.dvf_field_id }),
    dtfs: filter(dtfFields, { id: tCross.dtf_field_id }),
  }));

  return sortBy(map(uniqBy(mapping, 'dvf'), ({ dtfs, dvf }) => {
    const tCrossesFiltered = filter(tCrosses, r => (map(dtfs, 'id').includes(r.dtf_field_id) && (r.dvf_field_id === dvf.id)));
    const models = map(tCrossesFiltered, r => pick(db.getModel(r.data_model_id), ['id', 'alias']));

    return {
      models: uniqBy(models, 'id'),
      dtfs: sortBy(map(dtfs, ({ id, alias, name }) => ({ id, alias, name })), ['name']),
      dvf: pick(dvf, ['id', 'alias', 'name']),
    };
  }), [({ dvf }) => dvf.alias]);
}

function getModelId(alias) {
  return db.getModel(alias).id;
}

async function extendReferenceFields(fields) {
  const references = fields.filter(f => ['reference', 'reference_to_list'].includes(f.type));
  if (references.length) {
    const toModelIds = uniq(compact(map(references, 'options.foreign_model'))).map(getModelId);
    await assignDefaultView(references);
    await assignDefaultForm(references, toModelIds);
  }

  await calculateDependsOnFilter(fields);
}

async function assignDefaultView(referenceFields) {
  referenceFields.forEach((f) => {
    if(!f.options.view)
      f.options.view = '__first';
  });
}

async function assignDefaultForm(referenceFields, toModelIds) {
  const defaultForms = await db.model('form').whereIn('model', toModelIds).where({ alias: 'default', __inserted: true });
  const defaultFormsMap = keyBy(defaultForms, 'model');

  referenceFields.forEach((f) => {
    const form = defaultFormsMap[getModelId(f.options.foreign_model)];
    if (!f.options.form && form) f.options.form = form.alias;
  });
}

async function calculateDependsOnFilter(fields) {
  const fieldsMap = keyBy(fields, 'alias');
  const referenceFields = fields.filter(({ type }) => ['reference', 'reference_to_list'].includes(type));
  const globalReferenceFields = fields.filter(({ type }) => type === 'global_reference');

  const referencesWithDependsOn = referenceFields.filter(f => isArray(f.options.depends_on) && f.options.depends_on.length);
  const globalRefsWithDependsOn = globalReferenceFields.filter(f => isArray(f.options.references) && some(f.options.references, 'depends_on'));

  referencesWithDependsOn.forEach((f) => {
    const filter = generateFilterFromDependsOn(f.options.depends_on, fieldsMap);
    if (filter) f.options.depends_on_filter = filter;
  });


  globalRefsWithDependsOn.forEach((f) => {
    f.options.references.forEach((ref) => {
      if (isArray(ref.depends_on) && ref.depends_on.length) {
        const filter = generateFilterFromDependsOn(ref.depends_on, fieldsMap);
        if (filter) ref.depends_on_filter = filter;
      }
    });
  });
}

export function generateFilterFromDependsOn(dependsOn, fieldsMap) {
  const parts = [];

  each(compact(dependsOn), (alias) => {
    const field = fieldsMap[alias];

    if (field) {
      if (field.type === 'reference') {
        parts.push(`\`${alias}\` = 'js:p.record.getValue("${alias}")'`);
      } else if (field.type === 'reference_to_list') {
        parts.push(`\`__having__${alias}\` IN ('js:p.record.getValue("${alias}")')`);
      } else if (field.type === 'array_string') {
        if ((field.options || {}).multi_select) {
          parts.push(`\`__having__${alias}\` IN ('js:p.record.getValue("${alias}")')`);
        } else {
          parts.push(`\`${alias}\` = 'js:p.record.getValue("${alias}")'`);
        }
      }
    } else {
      parts.push(`\`${alias}\` = 'ERROR_FILTER_DEPENDS_ON'`);
    }
  });

  return parts.join(' AND ');
}

function applyPermissionToField(field, permission, sandbox) {
  const permissionResult = sandbox.executeScript(
    permission.script,
    `permission/${permission.id}/script`,
    { modelId: field.model },
  );

  // add inverted permission to readonly_when_script
  field.readonly_when_script = permissionResult ? field.readonly_when_script : 'true';
}

async function loadLocksForFields(fields, sandbox) {
  if (!sandbox.model) return;
  if (!sandbox.record || !sandbox.record.id) return;

  const locks = db.getCoreLocks({ model: sandbox.model.id, record_id: sandbox.record.id });

  each(locks, (lock = {}) => {
    each(fields, (field) => {
      if (lock.field_update !== field.id) return;

      field.readonly_when_script = 'true';
      field.hint = sandbox.translate('static.protected_by_core_lock');
    });
  });
}

export async function loadPageUserSettings(user, pageAlias) {
  const pageConditions = await getPageConditionForUserSettings(pageAlias);
  const userSetting = await db.model('user_setting').where({ user: user.id, ...pageConditions }).getOne();
  return userSetting ? parseOptions(userSetting.options) : {};
}

async function getPageConditionForUserSettings(pageAlias) {
  const pageModel = db.getModel('page');
  const page = await db.model('page').where({ alias: pageAlias }).getOne();
  return { record_id: page.id, model: pageModel.id };
}
