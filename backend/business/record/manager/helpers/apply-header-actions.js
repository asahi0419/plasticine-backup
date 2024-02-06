import lodash from 'lodash-es';
import * as Helpers from '../../../helpers/index.js';

export const applyHeaderActionsList = async (service) => {
  const model = await service.sandbox.vm.p.getModel(service.model.alias);

  const request = service.sandbox.vm.p.getRequest();
  if (!request.getApiDirectives) return model;

  lodash.forEach(request.getApiDirectives(), (directive) => {
    if (Helpers.getMethodsList(model).has(directive?.signature)) {
      model[directive.signature](directive.params);
    }
  });

  return model;
}