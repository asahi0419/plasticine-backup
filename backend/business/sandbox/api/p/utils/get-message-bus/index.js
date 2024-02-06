import cache from '../../../../../../presentation/shared/cache/index.js';
import { NoPermissionsError } from '../../../../../error/index.js';

export default (sandbox) => async (type = 'core') => {
  if (sandbox.vm.p.currentUser.isBelongsToWorkgroupByAlias('__core')) {
    const { messageBus } = cache.namespaces[type] || {};

    return messageBus;
  }

  throw new NoPermissionsError();
}