import { checkAccess } from '../../../security/index.js';

export default (sandbox) => (model, record) => checkAccess(model, record, sandbox);
