import { isNull } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';

export default (field, operator, value) => {
  const modelTableName = db.model(field.model).tableName;
  const result = { where: [] };

  if (isNull(value)) {
    result.where.push(db.client.raw(`${modelTableName}.id ${operator} -1`));
  } else {
    result.where.push([value]);
  }

  return result;
};
