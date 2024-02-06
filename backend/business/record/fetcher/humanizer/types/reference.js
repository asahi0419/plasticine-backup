import { map, reduce, every, compact, uniq, flatten, isArray, isNumber, sortBy } from 'lodash-es';

import { loadData } from '../../../humanizer/types/reference.js';
import { parseOptions } from '../../../../helpers/index.js';
import { spreadHumanizedAttribute } from '../helpers.js';

const parseValue = (value) => {
  const result = parseOptions(value);
  return isArray(result) ? result : value;
}

export default (field, sandbox, params) => async (records) => {
  const relatedIds = uniq(compact(flatten(map(records, (record) => parseValue(record[field.alias])))));
  const { records: relatedRecords, valueExtractor } = await loadData(field, relatedIds, sandbox, params);

  const relatedRecordsMap = reduce(relatedRecords, (result, relatedRecord) => {
    let value = valueExtractor.extract(relatedRecord) || '';
    if (isArray(value)) value = value.join(', ');
    result[relatedRecord.id] = value;
    return result;
  }, {});

  spreadHumanizedAttribute(field, records, (value, record = {}) => {
    if (!value) return;

    switch (field.type) {
      case 'reference':
        return relatedRecordsMap[value];
      case 'reference_to_list':
        const valuesMap = map(parseValue(value), (v) => ({ v, hv: relatedRecordsMap[v] }));
        const valuesMapSorted = every(valuesMap, ({ hv }) => isNumber(hv))
          ? valuesMap.sort((a, b) => (a.hv - b.hv))
          : sortBy(valuesMap, 'hv');

        record[field.alias] = map(valuesMapSorted, 'v');
        return map(valuesMapSorted, 'hv');
    }
  });
};
