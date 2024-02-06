/* eslint-disable */
import Promise from 'bluebird';
import { omit } from 'lodash-es';

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const viewTableName = getTableName({ id: 8, type: 'core' });

const convertOptions = (knex, model, records) => Promise.each(records, async (record) => {
  const options = JSON.parse(record.options);
  const layout = await Promise.map(options.layout, async (widget) => {
    const widgetOptions = { ...omit(widget, ['view', 'displayOption']), name: 'View widget' };
    const [view] = await knex(viewTableName).where({ id: widget.view }).limit(1);
    const tab = { id: 0, options: { name: 'View tab', active: true, view: view.id, model: view.model } };
    return { ...widgetOptions, tabs: [tab] }
  });

  return knex(getTableName(model)).where({ id: record.id }).update({ options: JSON.stringify({ layout }) });
});

export const up = async (knex, Promise) => {
  const [dashboardModel] = await knex(modelsTableName).where({ alias: 'dashboard' }).limit(1);
  const [usModel] = await knex(modelsTableName).where({ alias: 'user_setting' }).limit(1);

  if (!dashboardModel || !usModel) return;

  const dashboards = knex(getTableName(dashboardModel));
  const userSettings = knex(getTableName(usModel)).where({ model: dashboardModel.id });

  await convertOptions(knex, dashboardModel, dashboards);
  await convertOptions(knex, usModel, userSettings);
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
