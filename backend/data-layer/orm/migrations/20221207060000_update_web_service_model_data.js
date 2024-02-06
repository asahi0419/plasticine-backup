/* eslint-disable */

import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';

const migrateCoreLocks = async (knex, models) => {
    const fields = await HELPERS.getRecords(knex, 'field', { model: models.web_service.id });
    const records = [await HELPERS.getRecord(knex, 'web_service', { name: 'Get MC Application' })];
    
    await Promise.each(records, async (record) => {
        if (!record) return;
        
        await Promise.each(fields, async (field) => {
            if (field.alias === 'active') return;
            await HELPERS.createRecord(knex, 'core_lock', {
                model: models.web_service.id,
                record_id: record.id,
                field_update: field.id,
                update: false,
                delete: true,
                created_at: new Date(),
                created_by: 1,
            });
        });
    });
};

const migrate = (knex) => async (models) => {
    await migrateCoreLocks(knex, models);
};

export const up = (knex) => {
    const models = ['model', 'field', 'core_lock', 'web_service'];
    return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
    return Promise.resolve();
};
