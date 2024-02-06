import createStorage from '../../../storage/factory.js';
import { NoPermissionsError } from '../../../error/index.js';

export default (sandbox) => () => {
  if (sandbox.vm.p.currentUser.isBelongsToWorkgroupByAlias('__core')) {
    return createStorage();
  }

  throw new NoPermissionsError();
};
