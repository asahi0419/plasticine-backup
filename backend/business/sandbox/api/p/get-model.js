import db from '../../../../data-layer/orm/index.js';
import { ModelNotFoundError } from '../../../error/index.js';
import ModelProxy from '../model/index.js';

export default (sandbox) => (modelAlias, options) => {
  const model = db.getModel(modelAlias);
  if (!model) throw new ModelNotFoundError();

  const modelProxy = new ModelProxy(model, sandbox);
  if (sandbox.context.request) sandbox.context.request.modelProxy = modelProxy;
  if (options) modelProxy.setOptions(options);

  return modelProxy;
};
