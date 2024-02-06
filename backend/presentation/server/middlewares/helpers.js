import Sandbox from '../../../business/sandbox/index.js';
import ModelProxy, { wrapRecord } from '../../../business/sandbox/api/model/index.js';

export const getSandbox = (req, res) => {
  const { app = {}, user } = req;
  const { sandbox = {} } = app;
  const { vm } = sandbox;

  return Sandbox.create({ request: req, response: res, user }, 'base', vm);
};

export const preprocessRecord = (model, record, sandbox) => {
  return wrapRecord(new ModelProxy(model, sandbox), { select_raw: true })(record);
};
