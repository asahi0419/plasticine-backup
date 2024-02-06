/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = async (knex) => {
    await knex(getTableName({ id: 2, type: 'core' }))
        .where({ model: 2, alias: 'index' })
        .update({
            readonly_when_script: `['autonumber'].includes(p.record.getValue('type'))`,
        });

    await knex(getTableName({ id: 2, type: 'core' }))
        .where({ model: 2, alias: 'required_when_script' })
        .update({
            hidden_when_script: `['autonumber'].includes(p.record.getValue('type'))`,
        });

    await knex(getTableName({ id: 2, type: 'core' }))
        .where({ model: 2, alias: 'readonly_when_script' })
        .update({
            hidden_when_script: `['autonumber'].includes(p.record.getValue('type'))`,
        });
};

export const down = (knex, Promise) => {
    return Promise.resolve();
};
