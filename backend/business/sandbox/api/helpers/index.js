import * as HELPERS from '../../../helpers/index.js';
import authNamespace from './auth.js';

export default (sandbox) => {
  const { context } = sandbox;

  return {
    ...HELPERS,
    auth: authNamespace(context, sandbox),
  };
};
