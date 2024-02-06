import Promise from 'bluebird';
import { find, isEmpty } from 'lodash-es';

import getTableName from './helpers/table-name.js';
import SEED from '../seeds/23-emails.js';
import * as HELPERS from './helpers/index.js';

const migrate = knex => async (models) => {
  const { field, email } = models;

  const seedFields = SEED.fields;
  const fields = await HELPERS.getRecords(knex, field.alias, { model: email.id });

  return Promise.each(fields, async emailField => {
    const { ...seedField } = find(seedFields, { alias: emailField.alias }) || {};

    if (!isEmpty(seedField)) {
      delete seedField.__lock;

      await HELPERS.updateRecord(knex, field.alias, { model: email.id, alias: emailField.alias }, seedField);

      if (emailField.type === 'string' && seedField.options && seedField.options.length) {
        const emailTableName = getTableName({ id: email.id, type: 'core' });
        const newType = `varchar(${seedField.options.length})`;
        await knex.raw(`ALTER TABLE "${emailTableName}" ALTER COLUMN "${seedField.alias}" TYPE ${newType}`);
      }
    }
  });
};

export const up = (knex) => {
  return HELPERS.onModelsExistence(knex, [ 'email', 'field' ], migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
