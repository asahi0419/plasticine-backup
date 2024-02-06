/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex, Promise) => {
    const clause = {key: 'the_entered_password_recovery_link_is_not_valid_anymore'};

    const record = await HELPERS.getRecord(knex, 'static_translation', clause);
    if (record) return;


    await HELPERS.createRecord(knex, 'static_translation',  {
        key:'the_entered_password_recovery_link_is_not_valid_anymore',
        en:'The entered password recovery link is not valid anymore',
        uk:'Вказане посилання щодо скидання паролю не є вірним',
        created_by:1,
    });
};

export const down = function (knex, Promise) {
    return Promise.resolve();
};
