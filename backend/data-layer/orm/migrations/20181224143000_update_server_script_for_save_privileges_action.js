/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const server_script = `const { model, privileges } = p.getRequest();

try {
  const modelModel = await p.getModel('model');
  const privilegeModel = await p.getModel('privilege');

  const record = await modelModel.findOne({ id: model });
  const existedPrivileges = await privilegeModel.find({ model });

  const existedIds = existedPrivileges.map(p => p.getValue('id'));
  const newIds = privileges.map(p => p.id);

  const jobs = [];

  privileges.filter(p => !existedIds.includes(p.id)).forEach(p => jobs.push(privilegeModel.insert({ ...p, model })));
  existedPrivileges.filter(p => !newIds.includes(p.getValue('id'))).forEach(p => jobs.push(p.delete()));

  await Promise.all(jobs);

  p.actions.openForm('model', record.attributes)
} catch (error) {
  p.response.error(error)
}`;

export const up = async (knex, Promise) => {
  const [actionModel] = await knex(modelsTableName).where({ alias: 'action' }).limit(1);
  return actionModel && knex(getTableName(actionModel)).where({ alias: 'save_privileges' }).update({ server_script });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
