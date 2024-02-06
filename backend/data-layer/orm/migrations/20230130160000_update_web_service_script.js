/* eslint-disable */

import Promise from 'bluebird';
import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/20-web-services.js';

export const up = async (knex) => {
    const aliases = ['update_topology_data'];

    await Promise.each(aliases, async (alias) => {
        const { script } = find(SEED.records, { alias }) || {};
        await HELPERS.updateRecord(knex, 'web_service', { alias }, { script });
    });
};

export const down = function(knex, Promise) {
    return Promise.resolve();
};
