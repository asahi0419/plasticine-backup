import db from '../../../data-layer/orm/index.js';
import BasePerformer from './base.js';
import { isPlainObject } from '../../helpers/index.js';
import { has } from 'lodash-es';

export default class AttachmentPerformer extends BasePerformer {
  async getDependencyToUpdate(type, recordAlias) {
    const record = { ...this.record, alias: recordAlias || this.record.alias };

    const dependency = {};

    if (type === 'delete') {
      if (isPlainObject(record.target_record) && record.field) {
        const model = db.getModel(record.target_record.model);
        const field = db.getField(record.field);
        const targetRecord = await db.model(record.target_record.model).where({ id: record.target_record.id }).getOne();
        let fieldToUpdate = {};
        const hasField = has(targetRecord, field.alias);
        if (hasField) {
          fieldToUpdate = { [field.alias]: null };
        }

        dependency[model.alias] = [{ id: record.target_record.id, ...fieldToUpdate }];
      }
    }

    return dependency;
  }
}
