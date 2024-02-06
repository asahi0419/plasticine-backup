import moment from 'moment';
import Promise from 'bluebird';
import { omit, isEqual, isEmpty, isUndefined, isObject, isDate } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import * as HELPERS from '../helpers/index.js';
import { DEFAULT_DATE_FORMAT } from '../constants/index.js';

const isEmptyValue = (v) => isUndefined(v) || ((isObject(v) && !isDate(v)) && isEmpty(v));

export default class Performer {
  constructor(model, fields, sandbox) {
    this.model = model;
    this.fields = fields;
    this.sandbox = sandbox;
  }

  perform(action) {
    const options = HELPERS.parseOptions(this.model.options);

    if (process.env.NODE_ENV === 'test') return;
    if (['audit', 'worklog'].includes(this.model.type)) return;
    if (options.hasOwnProperty('audit') && !options.audit) return;

    return this[action]();
  }

  async create() {
    if (['create', 'create_delete'].includes(this.model.audit)) {
      await this.createAuditRecord({
        action: 'created',
        related_record: this.sandbox.record.getValue('id'),
        to: JSON.stringify(omit(this.sandbox.record.attributes, ['__type'])),
      });

      await this.update();
    }
  }

  update() {
    const { record, user } = this.sandbox;
    const auditableFields = this.fields.filter(({ audit, type }) => (audit && (audit !== 'none') && (type !== 'journal')));

    return Promise.map(auditableFields, (field) => {
      let from = record.getPrevValue(field.alias);
      let to = record.getValue(field.alias);

      if (!record.originalRecord.__inserted) from = null;
      if (isEmptyValue(from)) from = null;
      if (isEmptyValue(to)) to = null;

      if (isEqual(from, to)) return;

      return this.createAuditRecord({
        action: 'updated',
        related_record: record.getValue('id'),
        related_field: field.id,
        from : this.getStringValue(from),
        to: this.getStringValue(to),
        created_by: user?.id,
        created_at: new Date()
      });
    });
  }

  delete() {
    if (['delete', 'create_delete'].includes(this.model.audit)) {
      return this.createAuditRecord({
        action: 'deleted',
        related_record: this.sandbox.record.getValue('id'),
        to: JSON.stringify(omit(this.sandbox.record.attributes, ['__type'])),
      });
    }
  }

  async createAuditRecord(attributes) {
    try {
      const manager = await db.model(`audit_${this.model.id}`, this.sandbox).getManager(false);
      await manager.create(attributes);
    } catch (error) {
      error.name !== 'ModelNotFoundError' && console.error(error);
    }
  }

  getStringValue(fieldValue){
    if(fieldValue === null || fieldValue === undefined)
      return fieldValue;
    if(Array.isArray(fieldValue))
      return JSON.stringify(fieldValue);
    if(isDate(fieldValue)){
      const formattedDate = new Date(fieldValue).toString() === 'Invalid Date' ? fieldValue : moment(fieldValue).format(DEFAULT_DATE_FORMAT);
      return formattedDate;
    }
    return fieldValue
  }
}
