/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';
import { onModelExistence } from './helpers/index.js';
import { parseOptions } from '../../../business/helpers/index.js';

const fieldsTableName = getTableName({ id: 2, type: 'core' });
const pageTableName = getTableName({ id: 6, type: 'core' });
const layoutTableName = getTableName({ id: 9, type: 'core' });
const formTableName = getTableName({ id: 11, type: 'core' });

const DEFAULT_LAYOUT_OPTIONS = {
  columns: [
    'id',
    'name',
    'alias',
    'data_source',
    'created_at',
    'updated_at',
    'created_by',
    'updated_by',
  ],
  columns_options: {},
  sort_order: [
    { field: 'id', type: 'descending' },
    { field: 'name', type: 'none' },
    { field: 'alias', type: 'none' },
    { field: 'data_source', type: 'none' },
    { field: 'created_at', type: 'none' },
    { field: 'updated_at', type: 'none' },
    { field: 'created_by', type: 'none' },
    { field: 'updated_by', type: 'none' },
  ],
  wrap_text: true,
  no_wrap_text_limit: 50,
};

const getClientScript = (options) => {
  const comment = options ? `/*\n\n${JSON.stringify(parseOptions(options), null, 2)}\n\n*/\n\n` : '';
  const wrapper = 'function(chartdiv, scope) {\n  const chart = am4core.create(chartdiv, am4charts.XYChart);\n\n  chart.data = scope.main;\n\n  return chart;\n}';

  return `${comment}${wrapper}`;
}

const updateLayout = async (knex, model, table) => {
  const clause = { model: model.id, name: 'Default' };
  const attributes = { options: JSON.stringify(DEFAULT_LAYOUT_OPTIONS) };

  await knex(layoutTableName).where(clause).update(attributes);
};

const deletePage = async (knex, model, table) => {
  await knex(pageTableName).where({ alias: 'chart_manager' }).delete();
  await knex(formTableName).where({ model: model.id, alias: 'default' }).delete();
};

const addColumnFilter = async (knex, model, table) => {
  const column = await knex.schema.hasColumn(table, 'filter');
  if (!column) await knex.schema.table(table, (t) => t.text('filter', 150000));
}

const addColumnClientScript = async (knex, model, table) => {
  const column = await knex.schema.hasColumn(table, 'options');
  if (column) await knex.schema.table(table, (t) => t.renameColumn('options', 'client_script'));

  const clause = { model: model.id, alias: 'options' };
  const scope = knex(fieldsTableName).where(clause);
  const options = { length: 150000, syntax_hl: 'js', default: 'function(chartdiv, scope) {\n\n}' };
  const attributes = { name: 'Client script', alias: 'client_script', options: JSON.stringify(options) };

  await scope.update(attributes);
}

const setFilter = async (knex, table, record) => {
  const clause = { id: record.id };
  const options = parseOptions(record.client_script);
  const attributes = { filter: options.filter_query || '' };

  await knex(table).where(clause).update(attributes);
}

const setScript = async (knex, table, record) => {
  const clause = { id: record.id };
  const attributes = { client_script: getClientScript(record.client_script) };

  await knex(table).where(clause).update(attributes);
}

const udpateRecords = async (knex, model, table) => {
  const records = await knex(table).where({});

  await Promise.each(records, async (record) => {
    await setFilter(knex, table, record);
    await setScript(knex, table, record);
  });
}

const migrate = (knex) => async (model, table) => {
  await updateLayout(knex, model, table);
  await deletePage(knex, model, table);

  await addColumnFilter(knex, model, table);
  await addColumnClientScript(knex, model, table);

  await udpateRecords(knex, model, table);
}

export const up = (knex) => {
  return onModelExistence(knex, 'chart', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
