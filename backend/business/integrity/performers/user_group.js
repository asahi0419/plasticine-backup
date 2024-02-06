import db from '../../../data-layer/orm/index.js';
import BasePerformer from './base.js';

export default class UserGroupPerformer extends BasePerformer {
  async getDependency() {
    const field = await db.model('field').where({ alias: 'user_groups' }).getOne();
    const rtlRecords = await db.model('rtl').where({ source_field: field.id, target_record_id: this.record.id });

    return {
      user: rtlRecords.map(({ source_record_id }) => ({ id: source_record_id })),
    };
  }

  getComponentsToCleanup() {
    return [
      { model: 'privilege', field: 'owner_id', owner_type: 'user_group' },
    ];
  }
}
