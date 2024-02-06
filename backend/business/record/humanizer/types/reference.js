import Promise from 'bluebird';
import lodash from 'lodash';
import moment from 'moment'

import db from '../../../../data-layer/orm/index.js';
import ValueExtractor from './value-extractor.js';
import { parseOptions, isPlainObject } from '../../../helpers/index.js';
import { humanize } from '../../fetcher/humanizer/index.js';
import { getSetting } from '../../../setting/index.js';

export const extractIds = (values) => {
  return lodash.compact(values.map((value) => {
    if (isPlainObject(value)) return value.id;
    if (Number(value)) return value;
  }));
}
export const loadData = async (field, recordIds, sandbox, params) => {
  const { foreign_model, foreign_label } = parseOptions(field.options);
  const model = db.getModel(foreign_model);
  const valueExtractor = new ValueExtractor(foreign_label);

  const records = await Promise.reduce(lodash.chunk(recordIds, 10000), async (result, ids) => {
    return [...result, ...await db.model(foreign_model).select(db.getFieldsAliases(foreign_model)).where({ __inserted: true }).whereIn('id', ids) ];
  }, []).map(record => sandbox.translate(record, model.alias, valueExtractor.fields));

  await humanize(model.id, valueExtractor.fields, records, sandbox, undefined, params);

  return { records, valueExtractor };
};

export default (field, sandbox, params) => async (value) => {
  if (lodash.isDate(value)) {
    const globalFormat = getSetting('format');
    const format = globalFormat.field_date_time

    return moment(value).format(format);
  }

  const ids = lodash.compact(extractIds(lodash.castArray(value)));
  if (!ids.length) return [];

  const { records, valueExtractor } = await loadData(field, ids, sandbox, params);
  return records.map(record => valueExtractor.extract(record));
};
