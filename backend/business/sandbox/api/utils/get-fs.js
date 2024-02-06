import fs from 'fs';

import { NoPermissionsError } from '../../../error/index.js';

export default (sandbox) => () => {
  if (sandbox.vm.p.currentUser.isBelongsToWorkgroupByAlias('__core')) {
    return fs;
  }

  throw new NoPermissionsError();
};
