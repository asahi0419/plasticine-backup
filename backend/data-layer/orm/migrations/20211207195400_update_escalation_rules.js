/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const SCRIPT = `p.record.getValue('status') == 'preparation'`;

const migrate = (knex) => async (model, table) => {
    await knex(table).where({ name: 'Rebuild cache' }).update({ condition_script: SCRIPT });
}

export const up = (knex) => {
    return onModelExistence(knex, 'escalation_rule', migrate(knex));
};

export const down = (knex, Promise) => {
    return Promise.resolve();
};
