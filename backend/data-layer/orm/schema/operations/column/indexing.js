import { parseOptions } from '../../../../../business/helpers/index.js';

export const createIndex = (table, field) => {
  if (field.index === 'none') return;

  const options = parseOptions(field.options);
  const indexColumns = [field.alias].concat(options.composite_index || []);

  switch (field.index) {
    case 'simple':
      table.index(indexColumns);
      break;
    case 'gist':
      table.index(indexColumns, [], 'gist');
      break;
    case 'unique':
      table.unique(indexColumns);
      break;
  }
};

export const updateIndex = (table, oldField, newField) => {
  dropIndex(table, oldField);
  createIndex(table, newField);
};

const dropIndex = (table, field) => {
  const options = parseOptions(field.options);
  const indexColumns = [field.alias].concat(options.composite_index || []);

  switch (field.index) {
    case 'simple':
    case 'gist':
      table.dropIndex(indexColumns);
      break;
    case 'unique':
      table.dropUnique(indexColumns);
      break;
  }
};
