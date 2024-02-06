import { isUndefined } from 'lodash-es';

export const spreadHumanizedAttribute = (field, records, callback) => {
  records.forEach((record) => {
    record.__humanAttributes = record.__humanAttributes || {};
    const humanizedValue = callback(record[field.alias], record);

    if (!isUndefined(humanizedValue)) {
      record.__humanAttributes[field.alias] = humanizedValue;
    }
  });
};
