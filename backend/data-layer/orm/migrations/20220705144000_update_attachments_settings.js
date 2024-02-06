/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const VALUE = {
  allowed_formats: [ 'flv', 'avi', 'mp4', 'mp3', 'png', 'jpg', 'gif', 'bmp', 'psd', 'doc', 'docx', 'csv', 'pdf', 'xls', 'xlsx', 'txt', 'ppt', 'pptx', 'rar', 'zip', 'zipx', 'kmz', 'pem', 'wav', 'kml' ],
};

const migrate = (knex) => async (model, table) => {
  const [ setting ] = await knex(table).where({ alias: 'attachments_settings' });
  if (!setting) return;

  const value = JSON.parse(setting.value);
  const attributes = { value: JSON.stringify({ ...value, ...VALUE }) };

  await knex(table).where({ alias: 'attachments_settings' }).update(attributes);
};

export const up = (knex) => {
  return onModelExistence(knex, 'setting', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
