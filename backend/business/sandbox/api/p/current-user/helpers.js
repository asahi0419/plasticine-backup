import { isNumber, isString } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import { ParamsNotValidError } from '../../../../error/index.js';

export const getFieldValuePermission = (field, model, record, type, userProxy) => {
  const methods = {
    view: 'canViewFieldValue',
    create: 'canCreateFieldValue',
    update: 'canUpdateFieldValue',
    delete: 'canDeleteFieldValue',
  };

  if (!record) record = getContextRecord(userProxy).id;
  if (isNumber(field) && isNumber(model)) return userProxy.permissionChecker('field', type, model, field, record);

  if (!model && isString(field)) model = getContextModel(userProxy).id
  if (!(isNumber(field) || isString(field))) throw new ParamsNotValidError(`p.currentUser.${methods[type]}(...): param "field" must be a string or number`);
  if (!(isNumber(model) || isString(model)) && isString(field)) throw new ParamsNotValidError(`p.currentUser.${methods[type]}(...): param "model" must be a string or number`);

  return getField(model, field).then((field) => userProxy.permissionChecker('field', type, field.model, field.id, record));
};

export const getContextModel = (userProxy) => {
  const sandbox = userProxy.getSandbox();

  const { model = {} } = sandbox;

  return model;
};

export const getContextRecord = (userProxy) => {
  const sandbox = userProxy.getSandbox();

  const { context = {} } = sandbox;
  const { request = {} } = context;
  const { body = {} } = request;
  const { record = {} } = body;

  return record;
};

async function getField(model, field, method) {
  return isString(field)
    ? db.getField({ alias: field, model: db.getModel(model).id })
    : db.getField({ id: field });
}
