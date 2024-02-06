import Templates from '../../../model/templates.js';
import * as Errors from '../../../error/index.js';

export default (sandbox) => async (alias) => {
  if (sandbox.vm.p.currentUser.isBelongsToWorkgroupByAlias('__core')) {
    return Templates[alias]
  }

  throw new Errors.NoPermissionsError();
};
