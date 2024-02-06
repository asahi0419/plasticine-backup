/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });
const formsTableName = getTableName({ id: 11, type: 'core' });

async function updateModel(knex, model) {
  await knex(fieldsTableName)
    .where({ model: model.id, alias: 'reenable_end' })
    .update({
      options: JSON.stringify({
        values: {
          no_end_date: 'No end date',
          end_by_count: 'End by count',
          end_by_date: 'End by date',
        },
        default: 'no_end_date',
      }),
    });

  await knex(fieldsTableName)
    .where({ model: model.id, alias: 'reenable_type' })
    .update({
      options: JSON.stringify({
        values: {
          no_reenable: 'No Re-enable',
          seconds: 'Seconds',
          minutes: 'Minutes',
          days: 'Days',
          months: 'Months',
          years: 'Years',
        },
        default: 'no_reenable',
      }),
    });

  await knex(fieldsTableName)
    .where({ model: model.id, alias: 'end_after' })
    .update({ alias: 'end_by_count' });

  await knex(fieldsTableName)
    .where({ model: model.id, alias: 'end_by' })
    .update({ alias: 'end_by_date' });

  await knex(fieldsTableName)
    .where({ model: model.id, alias: 'end_by_count' })
    .update({
      required_when_script: `p.record.getValue('reenable_end') === 'end_by_count'`,
      hidden_when_script: `p.record.getValue('reenable_end') !== 'end_by_count'`,
    });

  await knex(fieldsTableName)
    .where({ model: model.id, alias: 'end_by_date' })
    .update({
      required_when_script: `p.record.getValue('reenable_end') === 'end_by_date'`,
      hidden_when_script: `p.record.getValue('reenable_end') !== 'end_by_date'`,
    });

  await knex(formsTableName)
    .where({ model: model.id, alias: 'default' })
    .update({ page: null, options: JSON.stringify({
      components: {
        list: [
          '__tab__.main',
          '__section__.1',
          '__column__.1_1',
          'name',
          'start_at',
          'reenable_type',
          'end_by_date',
          '__column__.1_2',
          'active',
          'reenable_end',
          'reenable_every',
          'end_by_count',
          '__section__.2',
          'script',
          '__tab__.service',
          '__section__.3',
          'id',
          '__section__.4',
          '__column__.4_1',
          'created_at',
          'updated_at',
          'last_run_at',
          'run_counter',
          '__column__.4_2',
          'created_by',
          'updated_by',
          'last_run_duration',
          '__section__.5',
          'description',
        ],
        options: {
          '__tab__.main': { expanded: true, name: 'Main' },
          '__tab__.service': { name: 'Service' },
        },
        label_position: 'left',
      },
      related_components: { list: [], show_as_tabs: true },
    }) });
};

async function createModel(knex) {
  const [ id ] = await knex(modelsTableName).insert({
    name: 'Scheduled task',
    alias: 'scheduled_task',
    type: 'core',
    template: 'base',
    created_at: new Date(),
    created_by: 1,
  }, 'id');

  await knex.schema.createTable(getTableName({ id, type: 'core' }), (table) => {
    table.increments('id').primary();
    table.string('name');
    table.text('description');
    table.boolean('active');
    table.timestamp('start_at');
    table.string('reenable_type');
    table.integer('reenable_every');
    table.string('reenable_end');
    table.integer('end_by_count');
    table.timestamp('end_by_date');
    table.text('script');
    table.timestamp('last_run_at');
    table.integer('last_run_duration');
    table.integer('run_counter');
    table.timestamp('created_at', true).nullable();
    table.timestamp('updated_at', true).nullable();
    table.integer('created_by');
    table.integer('updated_by');
    table.boolean('__inserted').defaultTo(true);
  });
};

async function deleteModel(knex) {
  const [ model ] = await knex(modelsTableName).where({ alias: 'scheduled_task' });
  if (model) await knex.schema.dropTable(getTableName({ id: model.id, type: 'core' }));
};

export const up = async (knex) => {
  const [ model ] = await knex(modelsTableName).where({ alias: 'scheduled_task' });
  return model ? updateModel(knex, model) : createModel(knex);
};

export const down = async (knex) => {
  await deleteModel(knex);
};
