import xlsx from 'node-xlsx';
import { isNull, isArray, pick, values, intersection, map, keyBy, each, reduce } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';

export default async (input, { model, fields = [] }, context = {}) => {
  const columns = await db.model('field').where({ model: model.id, __inserted: true })
  context.translate(columns, 'field', ['name'])
  const columnsByAlias = keyBy(columns, 'alias');

  let aliases = map(columns, 'alias');
  if (fields.length) aliases = intersection(fields, aliases)

  const header = [ map(aliases, (alias) => columnsByAlias[alias].name) ];
  const body = input.records.map((record) => {
    const r = reduce(aliases, function (o, e) {
      o[e] = e in record ? record[e] : null
      return o
    }, {});
    const h = pick(record.__humanAttributes, aliases);

    return map(values({...r, ...h}), (v) => formatData(v));
  });
  const data = [ ...header, ...body ];
  const options = { '!cols': getColumns(aliases, data) };

  return xlsx.build([{ name: model.alias, data, options }]);
};

function formatData(v) {
  let retValue = `${v}`;
  if (isArray(v)) retValue = v.join(', ');
  if (isNull(v)) retValue = '';
  return retValue;
}

function getColumns(aliases, data) {
  const minCharacters = 10;
  const maxCharacters = 50;

  const result = map(aliases, () => ({ wch: minCharacters }));

  each(data, (r) => {
    each(r, (c, i) => {
      const cell = c.v || c;
      if (cell && (cell.length > result[i].wch) && (cell.length <= maxCharacters)) {
        result[i].wch = cell.length;
      }
    });
  });

  return result;
}
