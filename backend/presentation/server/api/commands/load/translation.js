import { get } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import { RecordNotFoundError, FieldNotFoundError } from '../../../../../business/error/index.js';
import Flags from '../../../../../business/record/flags.js';
import { parseOptions } from '../../../../../business/helpers/index.js';

export default async (req, res) => {
  try {
    const { modelAlias, id, fieldAlias } = req.params;
    const { options = {} } = req.query;

    const resourceModel = db.getModel(modelAlias);
    const resource = await db.model(modelAlias).where({ id }).getOne();
    if (!resource) throw new RecordNotFoundError();

    const field = db.getField({ model: resourceModel.id, alias: fieldAlias });
    if (!field) throw new FieldNotFoundError();

    const translationAttributes = { model: resourceModel.id, record_id: id, field: field.id };

    let translationModelAlias, translationRecord, en;

    if (options.path) {
      translationAttributes.path = options.path;
      translationModelAlias = 'json_translation';
      translationRecord = await db.model(translationModelAlias).where(translationAttributes).getOne();
      en = get(parseOptions(resource[fieldAlias]), options.path.split('/')) || options.default
    } else {
      translationModelAlias = 'dynamic_translation';
      translationRecord = await db.model(translationModelAlias).where(translationAttributes).getOne();
      en = resource[fieldAlias];
    }

    if (!translationRecord) {
      translationRecord = await db.model(translationModelAlias, req.sandbox)
        .createRecord(
          { ...translationAttributes, en },
          new Flags({ check_permission: false }),
        );
    }

    res.json(translationRecord);
  } catch (error) {
    res.error(error);
  }
};
