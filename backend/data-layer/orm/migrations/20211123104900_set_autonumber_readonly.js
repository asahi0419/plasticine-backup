/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = async (knex) => {
    await knex(getTableName({ id: 2, type: 'core' }))
        .where({ type : 'autonumber' })
        .update({
            readonly_when_script: 'true',
        });
};

export const down = (knex, Promise) => {
    return Promise.resolve();
};
