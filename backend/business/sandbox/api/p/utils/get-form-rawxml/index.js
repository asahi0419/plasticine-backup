import { isEmpty, isObject, isInteger, each } from 'lodash-es'
import db from '../../../../../../data-layer/orm/index.js';
import { ParamsNotValidError, RecordNotFoundError, FormNotFoundError } from '../../../../../error/index.js';
import logger from '../../../../../logger/index.js';
import { loadFields, serializer } from '../../../../../../presentation/server/api/commands/load/helpers.js';
import { applyAttachmentsFallbackView, FORM_PERMISSIONS_TO_CHECK, extendForm, validateFormFields } from '../../../../../../presentation/server/api/commands/load/form.js';
import generateFormRawXml from './generate-form-xml.js'
import Fetcher from '../../../../../record/fetcher/index.js';

async function findAvailableFormByAlias(model, sandbox, formAlias) {
  let selectedForm, form;
  if (formAlias) {
    form = await db.model('form').where({ model: model.id, active: true, __inserted: true, alias: formAlias })
                                 .orderBy('order', 'asc', { nulls: 'first' }).getOne();
  }
  if (!form) throw new FormNotFoundError();

  if (form.active) {
    selectedForm = form;
  } else {
    throw new FormNotFoundError();
  }

  return selectedForm;
}

async function findFirstAvailableForm(model, sandbox) {
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

export const prepareFormData = async (sandbox, modelAlias, id, options) => {
  if (isEmpty(modelAlias) && isEmpty(id)) {
    throw new ParamsNotValidError('required model and id are not filled');
  } else if (isEmpty(modelAlias) || isInteger(modelAlias)) {
    throw new ParamsNotValidError('required model alias not filled');
  } else if (!isInteger(id)) {
    throw new ParamsNotValidError('Record id is not valid');
  } else if (!isObject(options)) {
    throw new ParamsNotValidError('Wrong params');
  }

  let model = await db.model('model').where({ alias: modelAlias }).getOne()    
  if (isEmpty(model)) {
    throw new ParamsNotValidError('Wrong model alias');
  }
  model = { ...model, access_script: 'true'}

  let result = { model: serializer([model], 'model', { translate: ['name', 'plural'], sandbox }) };

  const params = {
    filter: `id = ${id}`,
    id_required: true,
    humanize: true,
  };
  const fetched = await new Fetcher(model, sandbox, params).fetch()
  if (fetched.records.length === 0)  throw new ParamsNotValidError('Wrong record id');
  let record = fetched.records[0];
  const nonHumanizeFetched = await new Fetcher(model, sandbox, { ...params, humanize: false }).fetch()
  if (nonHumanizeFetched.records.length === 0)  throw new ParamsNotValidError('Wrong record id');
  const nhRecord = nonHumanizeFetched.records[0];

  sandbox.addVariable('action', record.__inserted ? 'update' : 'create');
  await sandbox.assignRecord(record, model, 'record', { preload_data: false });

  const formAlias = options.alias? options.alias: ''
  let form = formAlias? await findAvailableFormByAlias(model, sandbox, formAlias) : await findFirstAvailableForm(model, sandbox)
  if (!form) throw new FormNotFoundError()
  if (!form.active) throw new ParamsNotValidError(`Form ${form.id} has no ability to produce data because its inactive`);
  form = await applyAttachmentsFallbackView(form)
  form.__permissions = {}

  each(FORM_PERMISSIONS_TO_CHECK, (script, name) => {
    try {
      form.__permissions[name] = sandbox.executeScript(
        script,
        `form/${form.id}/permission_to_${name}`,
        { modelId: model.id },
      );
    } catch (error) {
      form.__permissions[name] = false;
      logger.error(error);
      throw new ParamsNotValidError(`Form ${form.id} has no ability to produce data because of lack of permission of ${name}`);
    }
  })

  const errors = [];
  const fields = await loadFields(model, sandbox, { accessible: true });

  const extend = await extendForm(form, sandbox);
  form = extend.form
  validateFormFields(form, fields, sandbox, errors);

  record = { ...record, ...record.__humanAttributes };
  delete record.__humanAttributes;

  const fakeReq = { model, params: { id }, query: {}, sandbox };

  result = {
    ...result,
    fields: serializer(fields, 'field', { translate: ['name', 'options', 'hint'], sandbox }),
    form: serializer(form, 'form', { translate: ['options'], sandbox }),
    record: record,
    nhRecord,
    req: fakeReq
  };


  let json = { data: result };
  if (errors.length) {
    json.errors = map(errors, (description) => ({ description }));
  }

  return json;
}

export default (sandbox) => async (modelAlias, id, options = { fields: {}, alias: 'default', userTimeZone: 0, relatedViews: [] }) => {
  
  try {
    const result = await prepareFormData(sandbox, modelAlias, id, options);
    const formXml = await generateFormRawXml(sandbox)(result.data, options);
    return formXml;
  } catch (error) {
    logger.error(error);
    return error;
  }
};
