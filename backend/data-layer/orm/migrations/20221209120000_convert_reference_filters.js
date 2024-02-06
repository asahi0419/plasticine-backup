import Promise from 'bluebird';
import lodash from 'lodash';

import * as HELPERS from './helpers/index.js';
import { parseOptions } from '../../../business/helpers/index.js';

function convert(string) {
  const parts = (string.match(/\{\w+\}/g) || []).map((part) => part.slice(1, -1));

  lodash.each(parts, (part) => {
    const replace = `'js:p.record.getValue("${part}")'`;

    string = string.replace(`'{${part}}'`, replace);
    string = string.replace(`"{${part}}"`, replace);
    string = string.replace(`{${part}}`, replace);
  });

  return string;
}

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'field', async (model) => {
    const references = await HELPERS.getRecords(knex, 'field', { type: 'reference' });
    const rtls = await HELPERS.getRecords(knex, 'field', { type: 'reference_to_list' });

    await Promise.each([...references, ...rtls], async (f = {}) => {
      const options = parseOptions(f.options);

      if (options.filter) {
        options.filter_deprecated = options.filter;
        options.filter = convert(options.filter);

        await HELPERS.updateRecord(knex, 'field', { id: f.id }, {
          options: JSON.stringify(options)
        });
      }
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};