/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = async (knex) => {
  return knex(getTableName({ id: 6, type: 'core' })).where({ alias: 'start' }).update({
    template: `<div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
  You have no access to the system yet.
  <div style={{ marginTop: '20px' }}>
    <Link to="/pages/logout">{p.translate('logout', { defaultValue: 'Logout' })}</Link>
  </div>
</div>`
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
