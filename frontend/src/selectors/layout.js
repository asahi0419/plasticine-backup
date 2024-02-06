import { find, sortBy } from 'lodash/collection';
import { compact } from 'lodash/array';

import { parseOptions } from '../helpers';

const SELECTORS = {
  grid: selectorLayoutFieldsGrid,
  card: selectorLayoutFieldsCard
};

export const selectLayoutFields = (fields = [], layout = {}) => {
  const options = parseOptions(layout.options);
  const selector = SELECTORS[layout.type];

  if (selector) {
    const selected = compact(selector(fields, layout, options));
    if (selected.length) return selected;
  }

  return sortBy(fields, 'name');
};

function selectorLayoutFieldsGrid(fields = [], layout = {}, options = {}) {
  const { columns = [], columns_options = {}, wrap_text, no_wrap_text_limit } = options;

  return columns.map((alias) => {
    const field = find(fields, { alias, model: layout.model });
    if (!field) return;

    const fieldOptions = columns_options[field.alias];
    const newField = { ...field, wrap_text, no_wrap_text_limit };
    if (fieldOptions && fieldOptions.name) newField.name = fieldOptions.name;

    return newField;
  })
}

function selectorLayoutFieldsCard(fields = [], layout = {}, options = {}) {
  const { components = {} } = options;
  const { list = [] } = components;

  return list.map((alias) => {
    const field = find(fields, { alias, model: layout.model });
    if (!field) return;

    const fieldOptions = (components.options || {})[field.alias];
    const newField = { ...field };
    if (fieldOptions && fieldOptions.name) newField.name = fieldOptions.name;

    return newField;
  })
}
