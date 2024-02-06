import db from '../../../../data-layer/orm/index.js';
import { parseOptions } from '../../../helpers/index.js';

export default async (record, field, model, sandbox) => {
  const options = parseOptions(field.options);

  const scope = db.model(model).where({ [field.alias]: record[field.alias] });
  if (record.id) scope.whereNot({ id: record.id });

  if (options.composite_index) {
    options.composite_index.forEach((indexPart) => {
      scope.where({ [indexPart]: record[indexPart] });
    });
  }

  const count = await scope.count('id');

  if (count > 0) return sandbox.translate('static.field_must_be_unique', { field: field.name });
};
