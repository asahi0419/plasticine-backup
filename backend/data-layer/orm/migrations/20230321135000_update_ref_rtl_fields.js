import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';
import { parseOptions } from '../../../business/helpers/index.js';

const updateFields = async (fields, knex) => {
    await Promise.each(fields, async (field) => {
        const options = parseOptions(field.options);
        if (options.foreign_model) {
            if(options.view)
                return;
            const refModel = await HELPERS.getModel(knex, { alias: options.foreign_model });
            if(!refModel)
                return;
            const defaultView = await HELPERS.getRecord(knex, 'view', {model:refModel.id, alias:'default'});
            if(!defaultView)
                return;

            const newOptions = JSON.stringify({...options, view:'default'});

            await HELPERS.updateRecord(knex, 'field',
                { id: field.id },
                { options: newOptions});
        }
    });
}
const migrate = (knex) => async (models) => {
    const references = await HELPERS.getRecords(knex, 'field', { type: 'reference' });
    await updateFields(references, knex);

    const rtls = await HELPERS.getRecords(knex, 'field', { type: 'reference_to_list' });
    await updateFields(rtls, knex);
};

export const up = (knex) => {
    const models = ['view', 'field'];
    return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = function (knex, Promise) {
    return Promise.resolve();
};
