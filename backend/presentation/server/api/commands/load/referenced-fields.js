import { uniq, compact, filter } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import { parseOptions } from '../../../../../business/helpers/index.js';

const reduceFields = (sourceFields, targetFields) => {
  return sourceFields.reduce((result, sourceField) => {
    const options = parseOptions(sourceField.options);
    const model = db.getModel(options.foreign_model).id;

    filter(targetFields, { model }).forEach(field => result.push({
      ...field,
      name: `${sourceField.name}.${field.name}`,
      alias: `${sourceField.alias}.${field.alias}`,
      referenced: true,
    }));

    return result;
  }, []);
};

export default async (req, res) => {
  const sourceFields = db.getFields({ model: req.model.id, type: 'reference' });
  const foreignModels = uniq(compact(sourceFields.map(({ options }) => db.getModel(parseOptions(options).foreign_model).id)));
  const targetFields = req.translate(filter(db.getFields(), (f) => foreignModels.includes(f.model)), 'field', ['name']);

  res.json({ data: reduceFields(sourceFields, targetFields) });
};
