import { reduce, isFunction, omit, keys, values } from 'lodash-es';

import { isPlainObject } from '../../../helpers/index.js';

const globalNamespace = (prevContext = {}, nextContext = {}) => {
  return reduce(omit(prevContext, keys(nextContext)), (result, attribute, key) => {
    if (key === 'sandbox') return result; // TODO: cleanup contructor assignments: this.sandbox = sandbox

    const context = { ...prevContext, ...nextContext };
    result[key] = attribute;

    try {
      if (isFunction(attribute)) {
        const k = keys(context).concat(`return ${attribute}`);
        const v = values(context);

        result[key] = new Function(...k)(...v);
      }

      if (isPlainObject(attribute)) {
        result[key] = globalNamespace(attribute, context);
      }
    } catch (error) {
      console.log(error);
    }

    return result;
  }, {});
};

export default globalNamespace;
