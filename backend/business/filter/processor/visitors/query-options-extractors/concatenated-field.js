import { columnNameFromConcatenatedFields } from '../../../../helpers/index.js';
import db from '../../../../../data-layer/orm/index.js';

export default async (field, operator, value, context) => {
  const modelTableName = db.model(field.model).tableName;
  const columnName = columnNameFromConcatenatedFields(field.column, modelTableName);
  const precessedOperator = operator === 'like' ? db.client.caseInsensitiveLikeClause() : operator;

  return {
    where: [[db.client.raw(`${columnName} ${precessedOperator} ?`, value)]],
  };
};
