/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/16-escalation-rules.js';

const migrate = (knex) => async (models) => {
  await HELPERS.updateRecord(knex, 'field',
    { alias: 'target_field', model: models.escalation_rule.id },
    { options: find(SEED.fields, { alias: 'target_field' }).options }
  );
};

export const up = (knex) => {
  const models = ['field', 'escalation_rule'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
