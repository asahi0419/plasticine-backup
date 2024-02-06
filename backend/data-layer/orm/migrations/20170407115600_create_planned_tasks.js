/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });

async function updateEModel(knex, model) {
  await knex(modelsTableName)
    .where({ id: model.id })
    .update({
      name: 'Planned task',
      plural: 'Planned tasks',
      alias: 'planned_task',
    });

  await updateTModel(knex, model);
};

async function updateTModel(knex, model) {
  const [ viewsModel ] = await knex(modelsTableName).where({ alias: 'view' });
  const [ formsModel ] = await knex(modelsTableName).where({ alias: 'form' });
  const [ layoutsModel ] = await knex(modelsTableName).where({ alias: 'layout' });
  const [ filtersModel ] = await knex(modelsTableName).where({ alias: 'filter' });
  const [ plannedTasksModel ] = await knex(modelsTableName).where({ alias: 'planned_task' });

  const viewsTableName = getTableName({ id: viewsModel.id, type: 'core' });
  const formsTableName = getTableName({ id: formsModel.id, type: 'core' });
  const layoutsTableName = getTableName({ id: layoutsModel.id, type: 'core' });
  const filtersTableName = getTableName({ id: filtersModel.id, type: 'core' });
  const plannedTaskTableName = getTableName({ id: plannedTasksModel.id, type: 'core' });

  const column = await knex.schema.hasColumn(plannedTaskTableName, 'scheduled_task');
  if (!column) await knex.schema.table(plannedTaskTableName, (table) => table.integer('scheduled_task'))

  await knex(fieldsTableName).where({ model: model.id, alias: 'model' })
    .update({
      required_when_script: '',
      hidden_when_script: `!p.record.getValue('model');`,
    });
  await knex(fieldsTableName).where({ model: model.id, alias: 'record' })
    .update({
      required_when_script: '',
      hidden_when_script: `!p.record.getValue('record');`,
    });
  await knex(fieldsTableName).where({ model: model.id, alias: 'escalation_rule' })
    .update({
      required_when_script: '',
      hidden_when_script: `!p.record.getValue('escalation_rule');`,
      options: JSON.stringify({
        foreign_label: 'name',
        depends_on :['model'],
        foreign_model: 'escalation_rule',
        default: null,
      })
    });

  await knex(viewsTableName).where({ model: model.id, alias: 'default' })
    .update({ condition_script: 'false' });

  await knex(formsTableName).where({ model: model.id, alias: 'default' })
    .update({
      options: JSON.stringify({
        components: {
          list: [
            '__tab__.main',
            '__section__.1',
            '__column__.1_1',
            'scheduled_on',
            'escalation_rule',
            'scheduled_task',
            '__column__.1_2',
            'status',
            'record',
            '__section__.2',
            'model',
            'timeout_counter',
            '__tab__.service',
            '__section__.3',
            'id',
            '__section__.4',
            '__column__.4_1',
            'created_at',
            'updated_at',
            '__column__.4_2',
            'created_by',
            'updated_by',
          ],
          options: {
            '__tab__.main': { expanded: true, name: 'Main' },
            '__tab__.service': { name: 'Service' },
          },
          label_position: 'left',
        },
        related_components: { list: [], show_as_tabs: true },
      })
    });
};

async function createTModel(knex) {
  const [ id ] = await knex(modelsTableName).insert({
    name: 'Planned task',
    alias: 'planned_task',
    type: 'core',
    template: 'base',
    created_at: new Date(),
    created_by: 1,
  }, 'id');

  await knex.schema.createTable(getTableName({ id, type: 'core' }), (table) => {
    table.increments('id').primary();
    table.integer('model');
    table.integer('record');
    table.integer('escalation_rule');
    table.integer('scheduled_task');
    table.timestamp('scheduled_on', true);
    table.string('status');
    table.integer('timeout_counter');
    table.timestamp('created_at', true).nullable();
    table.timestamp('updated_at', true).nullable();
    table.integer('created_by');
    table.integer('updated_by');
    table.boolean('__inserted').defaultTo(true);
  });
};

async function deleteTModel(knex) {
  const [ model ] = await knex(modelsTableName).where({ alias: 'planned_task' });
  if (model) await knex.schema.dropTable(getTableName({ id: model.id, type: 'core' }));
};

export const up = async (knex) => {
  const [ eModel ] = await knex(modelsTableName).where({ alias: 'planned_escalation' });
  const [ tModel ] = await knex(modelsTableName).where({ alias: 'planned_task' });

  if (eModel) return updateEModel(knex, eModel);
  if (tModel) return updateTModel(knex, tModel);

  return createTModel(knex);
};

export const down = async (knex) => {
  await deleteTModel(knex);
};
