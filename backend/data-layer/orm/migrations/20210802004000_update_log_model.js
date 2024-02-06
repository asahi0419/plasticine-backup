/* eslint-disable */

import getTableName from './helpers/table-name.js';

const OPTIONS = {
  components: {
    list: [
      '__tab__.main',
      '__section__.1',
      '__column__.1_1',
      'level',
      '__column__.1_2',
      'domain',
      '__section__.2',
      'message',
      'meta',
      '__section__.3',
      '__column__.3_1',
      'trigger_id',
      'trigger_type',
      'duration',
      '__column__.3_2',
      'target_model',
      'target_record',
      'uuid',
      'tag',
      '__tab__.service',
      '__section__.4',
      'id',
      '__section__.5',
      '__column__.5_1',
      'created_at',
      'updated_at',
      '__column__.5_2',
      'created_by',
      'updated_by',
    ],
    options: {
      '__tab__.main': { expanded: true, name: 'Main' },
      '__tab__.service': { name: 'Service' },
    },
    label_position: 'left',
  },
  related_components: { list: [], show_as_tabs: true, options: {} },
};

export const up = async (knex) => {
  const modelsTableName = getTableName({ id: 1, type: 'core' });
  const [logModel] = await knex(modelsTableName).where({ alias: 'log' });
  const [fieldModel] = await knex(modelsTableName).where({ alias: 'field' });
  const [formModel] = await knex(modelsTableName).where({ alias: 'form' });
  const [filterModel] = await knex(modelsTableName).where({ alias: 'filter' });
  const [viewModel] = await knex(modelsTableName).where({ alias: 'view' });
  const [permissionModel] = await knex(modelsTableName).where({ alias: 'permission' });

  const fieldTableName = getTableName({ id: fieldModel.id });
  await knex(fieldTableName).where({
    model: logModel.id,
    alias: 'timestamp'
  }).update({ required_when_script: 'false' });

  const formTableName = getTableName({ id: formModel.id, type: 'core' });
  await knex(formTableName).where({
    model: logModel.id,
    alias: 'default'
  }).update({ options: JSON.stringify(OPTIONS) });

  const filterTableName = getTableName({ id: filterModel.id });
  const [filterId] = await knex(filterTableName).insert({
    name: 'Mc proxy',
    query: '`domain` = \'mc_proxy\''
  }).returning('id');

  const viewTableName = getTableName({ id: viewModel.id });
  await knex(viewTableName).update({ filter: filterId }).where({ alias: 'mc_proxy' });

  const permissionTableName = getTableName({ id: permissionModel.id });
  await knex(permissionTableName).update({ script: 'p.currentUser.canAtLeastWrite()' }).where({
    model: logModel.id,
    type: 'model',
    action: 'create'
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
