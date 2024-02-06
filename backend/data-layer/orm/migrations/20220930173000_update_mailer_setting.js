/* eslint-disable */

import * as HELPERS from './helpers/index.js';
import {parseOptions} from '../../../business/helpers/index.js';

export const up = async (knex, Promise) => {
    const clause = {alias: 'mailer'};

    const record = await HELPERS.getRecord(knex, 'setting', clause);
    if (!record) return;


    const value = parseOptions(record.value);
    if (value.outgoing) return;
    const newValue = {
        outgoing: value
    }
    await HELPERS.updateRecord(knex, 'setting', clause, {value: JSON.stringify(newValue)});
};

export const down = function (knex, Promise) {
    return Promise.resolve();
};
