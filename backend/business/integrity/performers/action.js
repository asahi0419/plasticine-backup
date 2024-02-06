import db from '../../../data-layer/orm/index.js';
import BasePerformer from './base.js';

export default class ActionPerformer extends BasePerformer {
  async getDependency() {
    const field = await db.model('field').where({ alias: 'actions' }).getOne();
    const rtlRecords = await db.model('rtl').where({ source_field: field.id, target_record_id: this.record.id });

    return {
      page: rtlRecords.map(({ source_record_id }) => ({ id: source_record_id })),
    };
  }
}
