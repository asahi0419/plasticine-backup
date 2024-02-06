import { some } from 'lodash-es';

import cache from '../../presentation/shared/cache/index.js';

export const createCoreLockChecker = (user) => (type, action, model) => {
  const locks = cache.namespaces.core.get('core_locks');

  if (action === 'update') {
    return !some(locks, { model, update: true });
  }

  if (action === 'delete') {
    return !some(locks, { model, delete: true });
  }

  return true;
};
