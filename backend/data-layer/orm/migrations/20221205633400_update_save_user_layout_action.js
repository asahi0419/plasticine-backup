/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const SCRIPT = `const request = p.getRequest();

try {
  const layoutModel = await p.getModel('layout');
  const usModel = await p.getModel('user_setting', { check_permission: false });

  const record = await usModel.findOne({
    user: p.currentUser.getValue('id'),
    model: layoutModel.getValue('id'),
    record_id: request.record_id,
    type: request.context,
  }) || await usModel.build({});

  await record.update({
    user: p.currentUser.getValue('id'),
    model: layoutModel.getValue('id'),
    record_id: request.record_id,
    type: request.context,
    options: JSON.stringify(request.options),
  });

  p.response.json({ status: true });
} catch (error) {
  p.response.error(error);
}`

export const up = async (knex) => {
  await HELPERS.updateRecord(knex, 'action',
    { alias: 'save_user_layout' },
    { server_script: SCRIPT }
  );
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
