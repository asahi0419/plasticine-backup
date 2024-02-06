/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = async (knex) => {
  return knex(getTableName({ id: 6, type: 'core' })).where({ alias: 'header' }).update({
    template: `<div style={{ width: '210px', height: '50px' }}>
  <Header as="h2" style={{ padding: '8px 0 0 10px' }}>
    <Icon name="block layout" style={{ color: '#fff' }} />
    <Header.Content style={{ color: '#fff' }}>{window.APP_NAME}</Header.Content>
  </Header>
</div>`
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
