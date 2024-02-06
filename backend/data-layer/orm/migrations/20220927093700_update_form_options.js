import lodash from 'lodash';
import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';
import { parseOptions } from '../../../business/helpers/index.js';

export const up = async (knex) => {
  const records = await HELPERS.getRecords(knex, 'form')

  await Promise.each(records, async (record = {}) => {
    const options = parseOptions(record.options)
    const { components = {}, related_components = {} } = options
    const { label_position = 'left' } = components
    const { show_as_tabs = true } = related_components

    if (!options.components) options.components = {}
    if (!options.related_components) options.related_components = {}

    delete options.components['label_position']
    delete options.related_components['show_as_tabs']

    options.related_components.options = related_components.options || {}

    lodash.each(related_components.list, (item) => {
      options.related_components.options[item.id] = related_components.options[item.id] || {}
      options.related_components.options[item.id].condition_script = 'true'
    })

    await HELPERS.updateRecord(knex, 'form',
      { id: record.id },
      {
        label_position,
        show_rel_lists_as_tabs: show_as_tabs,
        options: JSON.stringify(options)
      }
    )
  })
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};