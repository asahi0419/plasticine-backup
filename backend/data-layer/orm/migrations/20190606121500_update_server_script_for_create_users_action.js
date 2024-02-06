/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const server_script = `const params = p.getRequest();

params.record.account = {
  email: params.record.email,
  password: params.record.password,
};

params.getRecord()
  .then((record) => {
    if (record) return record.assignAttributes(params.record) && record.save({ systemActions: params.system_actions });
    return p.getModel(params.modelAlias).then(model => model.insert(params.record, { systemActions: params.system_actions }));
  })
  .then(record => p.actions.goBack())
  .catch(error => p.response.error(error));`;

export const up = async (knex, Promise) => {
  const [actionModel] = await knex(modelsTableName).where({ alias: 'action' }).limit(1);
  const [userModel] = await knex(modelsTableName).where({ alias: 'user' }).limit(1);

  return actionModel && knex(getTableName(actionModel)).where({ model: userModel.id, alias: 'create' }).update({ server_script });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
