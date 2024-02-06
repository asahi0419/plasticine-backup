import stringify from 'csv-stringify';
import { pick, isArray, intersection, map, reduce, keyBy } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';

const FORMATTERS = {
  object: (value) => isArray(value) ? value.join(', ') : value,
};

export default async (input, { model, fields = [] }, context = {}) => {
  const columns = await db.model('field').where({ model: model.id, __inserted: true });
  context.translate(columns, 'field', ['name'])
  const columnsByAlias = keyBy(columns, 'alias');

  let aliases = map(columns, 'alias');
  if (fields.length) aliases = intersection(fields, aliases);

  const data = map(input.records, (r) => {
    const humanizedColumns = pick(r.__humanAttributes, aliases);
    const record = { ...pick(r, aliases), ...humanizedColumns };
    return reduce(record, (result, value, alias) => {
      const { name } = columnsByAlias[alias];
      return { ...result, [ name ]: value };
    }, {});
  });

  return new Promise((resolve, reject) => {
    const options = {
      columns: map(aliases, (alias) => columnsByAlias[alias].name),
      header: true,
      cast: FORMATTERS,
      formatters: FORMATTERS,
    };

    stringify(data, options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};
