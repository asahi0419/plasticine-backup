import db from '../../../../../data-layer/orm/index.js';

import Flags from '../../../../record/flags.js';
import QueryBuilder from '../../query/builder.js';
import { getDistanceScope } from './helpers.js';

export default (sandbox) => (modelAlias, lat, lon, radius) => {
  const modelBuilder = db.model(modelAlias);
  const scope = getDistanceScope(modelBuilder, lat, lon, radius);

  return new QueryBuilder({
    model: modelBuilder.model,
    sandbox,
    flags: Flags.default()
  }, { scope });
};
