/* eslint-disable */

import getTableName from './helpers/table-name.js';
import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
    const modelsTableName = getTableName({ id: 1, type: 'core' });
    const [attachmentModel] = await knex(modelsTableName).where({ alias: 'attachment' });
    const [fieldModel] = await knex(modelsTableName).where({ alias: 'field' });
    const [permissionModel] = await knex(modelsTableName).where({ alias: 'permission' });

    const fieldTableName = getTableName({ id: fieldModel.id });

    const [ field ]  =  await knex(fieldTableName).where({
        model: attachmentModel.id,
        alias: 'file_name'
    });

    if (!field) return;

    const permissionTableName = getTableName({ id: permissionModel.id });
    await knex(permissionTableName).update({ script: 'false' }).where({
        model: attachmentModel.id,
        type: 'field',
        action: 'update',
        field: field.id
    });

    const [ permission ]  =  await knex(permissionTableName).where({
        model: attachmentModel.id,
        type: 'field',
        action: 'update',
        field: field.id
    });

    await HELPERS.createRecord(knex, 'core_lock', {
        model: permissionModel.id,
        record_id: permission.id,
        update: false,
        delete: false,
        created_at: new Date(),
        created_by: 1,
    });
};

export const down = (knex, Promise) => {
    return Promise.resolve();
};
