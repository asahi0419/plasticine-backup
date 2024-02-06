import lodash from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import Selector from '../../../../business/record/fetcher/selector.js';
import processGridAppearance from '../../../../business/appearance/grid/index.js';
import processTopologyAppearance from '../../../../business/appearance/topology.js';
import processCalendarAppearance from '../../../../business/appearance/calendar.js';
import * as ERROR from '../../../../business/error/index.js';
import * as SECURITY from '../../../../business/security/index.js';
import * as HELPERS from '../../../../business/helpers/index.js';
import { errorHandler } from '../../../../business/error/express.js';

export const executeAction = async (req, res) => {
  const { record = {}, exec_by = {} } = req.body;
  const { id } = record;

  try {
    let action;

    if (id && ['page', 'user_sidebar'].includes(exec_by.type)) {
      const [ record ] = await new Selector(req.model, req.sandbox).fetch(`id = ${id}`);
      if (!record) throw new ERROR.RecordNotFoundError();

      let actionIds;

      if (exec_by.type === 'page') {
        const model = db.getModel('action');
        const fields = await db.model('field')
          .where({ model: req.model.id })
          .whereIn('type', ['reference', 'reference_to_list'])
          .where('options', 'like', `%"foreign_model":"${model.alias}"%`);

        actionIds = await findActionIdsFromRecord(record, fields);
      }

      if (exec_by.type === 'user_sidebar') {
        const { components = {} } = HELPERS.parseOptions(record.options);
        const { options = {} } = components;

        actionIds = lodash.compact(lodash.map(lodash.values(options), 'action'));
      }

      action = await db.model('action').whereIn('id', actionIds).where({ alias: req.params.actionAlias }).getOne();
    } else {
      action = await db.model('action').where({ active: true, alias: req.params.actionAlias, model: req.model.id }).getOne();

      if (!action) {
        action = await db.model('action').where({ active: true, alias: req.params.actionAlias, model: req.model.inherits_model }).getOne();
      }
    }

    if (!action) throw new ERROR.ActionNotFoundError();

    if (action.group) return;

    const path = `action/${action.id}/server_script`;
    const context = { modelId: req.model.id, recordId: id };
    const params = { use_timeout: lodash.isEmpty(exec_by) }
    const result = req.sandbox.executeScript(action.server_script, path, context, params);

    result && typeof (result.then) === 'function' ? await result : result;
  } catch (error) {
    res.error(error);
  }
};

export const executeRecordScript = (req, res) => {
  const script = req.record[req.params.fieldAlias];

  if (script) {
    const scriptPath = `${req.model.alias}/${req.record.id}/${req.params.fieldAlias}`;
    req.sandbox.executeScript(script, scriptPath);
  } else {
    errorHandler(new ERROR.ScriptError(), req, res);
  }
};

export const executeWebService = async (req, res) => {
  const { id, script, access_script } = req.record;

  if (!script) return errorHandler(new ERROR.WebServiceNotFoundError(), req, res);
  if (!access_script) return errorHandler(new ERROR.NoAccessToWebServiceError(), req, res);
  if (!(await SECURITY.checkAccess('web_service', req.record, req.sandbox))) return errorHandler(new ERROR.NoAccessToWebServiceError(), req, res);

  req.sandbox.executeScript(script, `web_service/${id}/script`);
};

export const executeAppearance = async (req, res) => {
  const { model, sandbox, query: { records }, params: { id } } = req;
  const recordIds = records.split(',').map(id => parseInt(id));

  if (id === 'null' || !recordIds.length) return res.json({ data: [] });

  try {
    const appearance = await db.model('appearance').where({ id }).getOne();

    let result;
    switch (appearance.type) {
      case 'grid':
        result = await processGridAppearance(appearance, model, { recordIds }, sandbox);
        break;
      case 'topology':
        result = await processTopologyAppearance(appearance, sandbox, req);
        break;
      case 'calendar':
        result = await processCalendarAppearance(appearance, sandbox);
        break;
    }

    res.json({ data: result });
  } catch (error) {
    res.error(error);
  }
};

const findActionIdsFromRecord = async (record, fields) => {
  if (!fields.length) return [];

  const actionIds = [];
  const fieldsByType = lodash.groupBy(fields, 'type');

  if (fieldsByType.reference) {
    fieldsByType.reference.forEach(field => actionIds.push(record[field.alias]));
  }

  if (fieldsByType.reference_to_list) {
    const rows = await db.model('rtl').where({ source_record_id: record.id }).whereIn('source_field', lodash.map(fieldsByType.reference_to_list, 'id'));
    actionIds.push(...lodash.map(rows, 'target_record_id'));
  }

  return lodash.compact(actionIds);
};
