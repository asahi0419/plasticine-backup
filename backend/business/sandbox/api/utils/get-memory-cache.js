import { cloneDeep } from 'lodash-es';

import cache from '../../../../presentation/shared/cache/index.js';

export default (sandbox) => (type) => {
  return cloneDeep(cache.namespaces.core.get(type));
};
