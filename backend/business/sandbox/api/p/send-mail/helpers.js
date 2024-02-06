import { each, find, isArray, isEmpty } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import ModelProxy, { wrapRecord } from '../../model/index.js';
import { ParamsNotValidError } from '../../../../error/index.js';
import { parseOptions } from '../../../../helpers/index.js';

export const validateParams = (params, fields, keys) => {
  if (isEmpty(params))  throw new ParamsNotValidError(`Missing parameters in sendMail(...)`);

  each(keys, (key) => {
    const field = find(fields, { alias: key });

    if (field) {
      if (!params[key]) throw new ParamsNotValidError(`Missing parameter '${key}' in sendMail(...)`);
    }
  });
}

export const prepareParams = (params, fields) => {
  each(params, (param, key) => {
    const field = find(fields, { alias: key });

    if (field) {
      if (!params[key]) return;

      const { length = 255 } = parseOptions(field.options);
      params[key] = params[key].slice(0, length);
    }
  });
}

export const linkAttachments = async (record, attachments, sandbox) => {
  if (!isArray(attachments) || !attachments.length) return false;

  const model = db.getModel('email');
  const modelProxy = new ModelProxy(model, sandbox);
  const recordProxy = await wrapRecord(modelProxy)(record);

  each(attachments, (attachment) => attachment.linkTo(recordProxy));

  return true;
};
