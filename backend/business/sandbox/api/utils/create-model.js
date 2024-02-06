import { isString, isObject, cloneDeep, isUndefined } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import ModelImporter from '../../../import/index.js';
import * as HELPERS from '../../../helpers/index.js';

export default (sandbox) => async (input = {}, params = {}) => {
  if (isString(input)) input = { alias: input, name: input, plural: input };

  if (input.id && await db.model('model').where({ id: input.id }).getOne()) return sandbox.vm.p.getModel(input);
  if (input.alias && await db.model('model').where({ alias: input.alias }).getOne()) return sandbox.vm.p.getModel(input);

  const date = +new Date();

  if (isUndefined(input.type)) input.type = `custom`;
  if (isUndefined(input.name)) input.name = `${getTypeName(input.type)} Model (${date})`;
  if (isUndefined(input.alias)) input.alias = `${input.type}_model_${date}`;
  if (isUndefined(input.plural)) input.plural = `${getTypeName(input.type)} ${input.name || 'Model'}s (${date})`;
  if (isUndefined(input.template)) input.template = 'base';
  if (isUndefined(input.access_script)) input.access_script = 'true';
  if (isUndefined(input.options)) input.options = {};

  if (params.hasOwnProperty('audit')) input.options.audit = params.audit;
  if (params.hasOwnProperty('sync')) input.options.sync = params.sync;
  if (params.hasOwnProperty('sandbox')) input.options.sandbox = params.sandbox;

  const model = await new ModelImporter(sandbox, 'base').process(cloneDeep(input), params.metadata);
  const proxy = await sandbox.vm.p.getModel(model.alias);

  if (isObject(params.options)) proxy.setOptions(params.options);

  return proxy;
};

function getTypeName(type) {
  const field = db.getField({ model: db.getModel('model').id, alias: 'type' });
  const options = HELPERS.parseOptions(field.options) || {};

  return (options.values || {})[type];
}
