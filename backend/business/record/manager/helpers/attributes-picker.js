import { map, filter, pick, omit, isNumber, isNull } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';

export default (record, fields, type) => {
  // hack for initial seeding - model and field have no fields
  if (!fields.length) {
    return type == 'schema' ? omit(record, ['__type']) : {};
  }

  const { VIRTUAL_FIELDS: VF, CROSS_FIELDS: CF } = db.schema;

  const attributes = map(filter(fields, (f) => {
    const value = record[f.alias];

    switch (type) {
      case 'virtual':
        return VF.includes(f.type) || f.virtual;
      case 'cross':
        return CF.includes(f.type);
      case 'schema':
        if (VF.includes(f.type) || f.virtual) return false;
        if (CF.includes(f.type) && !isNumber(value) && !isNull(value)) return false;
        return true;
      default:
        return {};
    }
  }), 'alias');

  return pick(record, attributes);
};
