import BasePerformer from './base.js';

export default class UserPerformer extends BasePerformer {
  getComponentsToCleanup() {
    return [
      { model: 'user_setting', field: 'user' },
      { model: 'privilege', field: 'owner_id', owner_type: 'user' },
    ];
  }
}
