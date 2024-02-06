import moment from 'moment';
import Promise from 'bluebird';
import {
  compact,
  some,
  find,
  filter,
  map,
  reduce,
  omit,
  omitBy,
  pickBy,
  keys,
  get,
  set,
  isEmpty,
  isString,
  isArray,
  isObject,
  isUndefined,
  cloneDeep
} from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../logger/index.js';
import Flags from '../../../../record/flags.js';
import FieldProxy from './field.js';
import sendMailFunction from '../../p/send-mail/index.js';
import ModelProxy, { wrapRecord } from '../index.js';
import { isEqual } from '../../../../record/helpers.js';
import { getSetting } from '../../../../../business/setting/index.js';
import { createManager } from '../../../../record/manager/factory.js';
import { worklogDBModel } from '../../../../worklog/model.js';
import { validateValues } from '../../../../field/value/validate.js';
import {
  isPlainObject,
  cleanupAttributes,
  parseOptions,
  validateSignature
} from '../../../../helpers/index.js';
import { ParamsNotValidError, RecordSaveError } from '../../../../error/index.js';

import loadRTLs from '../../../../record/fetcher/loaders/rtl.js';
import loadJournals from '../../../../record/fetcher/loaders/journal.js';
import loadTemplates from '../../../../record/fetcher/loaders/template.js';
import getValueHumanizer from '../../../../record/humanizer/index.js';

const joinedAttributesSelector = (_, key) => key.startsWith('__j_');

export default class RecordProxy {
  static async create(record, model, sandbox, options) {
    const modelObject = db.getModel(model);
    const types = {
      view: (await import('./view.js')).default,
      attachment: (await import('./attachment.js')).default,
    };

    const ProxyClass = types[modelObject.alias] || RecordProxy;
    return new ProxyClass(record, modelObject, sandbox, options);
  }

  constructor(record, model, sandbox, options = {}) {
    // attributes
    // ------------------------------------------------------------------------

    const attributes = omitBy(record, joinedAttributesSelector);

    this.previousAttributes = attributes.__previousAttributes || {};
    this.previousHumanizedAttributes = attributes.__previousHumanizedAttributes || {};
    this.joinedAttributes = pickBy(record, joinedAttributesSelector);
    this.humanizedAttributes = attributes.__humanizedAttributes || {};
    this.templateAttributes = {};
    this.extraAttributes = {};

    // record
    // ------------------------------------------------------------------------

    this.originalRecord = omit(attributes, ['__previousAttributes', '__previousHumanizedAttributes']);
    this.record = { ...this.originalRecord, __type: model.alias };

    // context
    // ------------------------------------------------------------------------

    this.templates = {};
    this.options = cloneDeep(options);

    this.__changedAttributes = {};
    this.__dynamicFieldsOptions = {};

    this.__getModel = () => model;
    this.__getSandbox = () => sandbox;
  }

  get id() {
    return this.attributes.id;
  }

  get model() {
    return this.__getModel();
  }

  get sandbox() {
    return this.__getSandbox();
  }

  get proxyModel() {
    return new ModelProxy(this.model, this.sandbox);
  }

  get attributes() {
    return cleanupAttributes(this.record);
  }

  get changedAttributes() {
    return cleanupAttributes(this.__changedAttributes);
  }

  get flags() {
    return this.__flags || this.proxyModel.flags;
  }

  get fields() {
    return this.__fields || [];
  }

  // pass fresh dynamic field options and attributes on access of getManager
  async getManager() {
    const manager = await createManager(this.model, this.sandbox);
    return manager.setDynamicFieldsOptions(this.__dynamicFieldsOptions);
  }

  getModel() {
    return this.proxyModel;
  }

  getParentModel() {
    const { sandbox } = this;
    return (sandbox.context.request || {}).parentModel;
  }

  getParentRecord() {
    const { sandbox } = this;
    return (sandbox.context.request || {}).parentRecord;
  }

  getField(fieldAlias) {
    const field = find(this.fields, { alias: fieldAlias });
    if (field) return new FieldProxy({ ...field }, this);
  }

  assignAttributes(attributes) {
    if (!isPlainObject(attributes)) throw new ParamsNotValidError('record.assignAttributes');
    const newAttributes = omit(attributes, ['__humanizedAttributes', '__templateAttributes']);

    this.__changedAttributes = { ...this.__changedAttributes, ...newAttributes };
    this.humanizedAttributes = { ...this.humanizedAttributes, ...attributes.__humanizedAttributes };
    this.templateAttributes = { ...this.templateAttributes, ...attributes.__templateAttributes };
    this.extraAttributes = { ...this.extraAttributes, ...attributes.__extraAttributes };
    this.record = { ...this.record, ...newAttributes };

    if (this.flags && !this.flags.flags.ex_save.updateDateTimeFields) {
      this.record['updated_at'] = this.previousAttributes['updated_at'];
    }

    return this;
  }

  async validateAttributes(attributes = {}) {
    const fields = db.getFields({ model: this.model.id });
    validateValues(attributes, fields, this.sandbox, RecordSaveError)
  }

  resetChangedAttributes() {
    this.__changedAttributes = {};
  }

  async validate() {
    const manager = await this.getManager();
    return manager.validate(this.record, true);
  }

  async isValid() {
    const manager = await this.getManager();
    return manager.validate(this.record, false);
  }

  async save(options = {}) {
    const flags = this.flags || this.proxyModel.flags;

    const attributes = { ...omitBy(this.record, (v, k) => (k === 'id') || isUndefined(v)), __humanizedAttributes: this.humanizedAttributes };
    if (flags.flags.validateAttributes) await this.validateAttributes(omitBy(attributes , (v, k) => k.startsWith('__')));

    const manager = await this.getManager();
    if (options.systemActions) manager.setSystemActions(options.systemActions);

    let record;
    if (this.record.id) {
      const originalRecord = await db.model(this.model.alias).where({ id: this.record.id }).getOne();
      const originalRecordPreloaded = await wrapRecord(this.proxyModel, { select_raw: true })(originalRecord);
      record = await manager.update(originalRecordPreloaded, attributes, flags)
    } else {
      record = await manager.create(attributes, flags);
    }

    this.resetChangedAttributes();
    await this.saveTemplates();

    return wrapRecord(this.proxyModel)(record);
  }

  async saveTemplate(alias) {
    const template = this.getTValue(alias);
    const attributes = this.templateAttributes[alias];

    return template.update(attributes);
  }

  async saveTemplates() {
    await Promise.each(keys(this.templateAttributes), (alias) => this.saveTemplate(alias));
  }

  update(attributes, options = {}) {
    if (!isPlainObject(attributes)) throw new ParamsNotValidError('record.update');
    return this.assignAttributes(attributes).save(options);
  }

  async delete() {
    const flags = this.flags || this.proxyModel.flags;
    const manager = await this.getManager();
    const result = await manager.destroy(this.record, flags);

    return wrapRecord(this.proxyModel)(result);
  }

  sendMail(params, attachments) {
    return sendMailFunction(this.sandbox)({ ...params, target_record: this.record }, attachments);
  }

  getValue(fieldAlias, model = null) {
    if (model && !isPlainObject(model)) {
      throw new ParamsNotValidError('record.getValue: model must be an object');
    }

    const field = this.getField(fieldAlias);
    if (!field) return;

    const value = this.record[fieldAlias];
    if ((field.type === 'journal') && !isString(value)) return;

    if (!model || model.id === this.model.id) {
      if (fieldAlias === 'target_record' && this.record.__type === 'attachment') {
        if (isObject(value)) {
          return {
            model: value.model || db.getModel(value.__type, { silent: true })?.id,
            id: value.id
          };
        }
      }

      return value;
    }
    return this.joinedAttributes[`__j_${model.id}_${fieldAlias}`];
  }

  getVisibleValue(fieldAlias) {
    const field = this.getField(fieldAlias);
    if (!field) return;

    if (field.type === 'journal') return this.getValue(fieldAlias);
    let result = this.humanizedAttributes[fieldAlias] || this.attributes[fieldAlias] || '';

    if (field.type === 'global_reference') {
      if (isPlainObject(result)) return result.text;
    }

    if (field.type === 'reference_to_list') {
      if (isArray(result)) return result.join(', ');
    }

    if (field.type === 'array_string') {
      const { multi_select: multi } = field.getOptions();
      if (multi && isArray(result)) return result.join(', ');
    }

    if(field.type === 'float') return parseFloat(result);

    return result;
  }

  getPrevValue(fieldAlias) {
    const field = this.getField(fieldAlias);
    if (!field) return;

    if (field.type === 'journal') return;

    return this.originalRecord.hasOwnProperty(fieldAlias)
      ? this.originalRecord[fieldAlias]
      : this.record[fieldAlias];
  }

  getPrevVisibleValue(fieldAlias) {
    const field = this.getField(fieldAlias);
    if (!field) return;

    if (field.type === 'journal') return;

    return this.previousHumanizedAttributes[fieldAlias] || this.getVisibleValue(fieldAlias);
  }

  getTValue(fieldAlias) {
    return this.templates[fieldAlias];
  }

  setValue(fieldAlias, value) {
    const field = this.getField(fieldAlias);
    if (!field) return false;

    if(this.constructor.name === 'AttachmentProxy' && fieldAlias === 'file_name'){
      throw new ParamsNotValidError('Use rename function for change file name');
    }

    if (isPlainObject(value)) {
      if (!['journal', 'global_reference'].includes(field.type)) {
        value = JSON.stringify(value);
      }
    }
    if (field.type === 'string') {
      const options = parseOptions(field.field.options);
      if (options.syntax_hl && options.syntax_hl === 'signature') {
        value = validateSignature(value);
      }
    }

    this.__changedAttributes[fieldAlias] = value;
    this.record[fieldAlias] = value;

    return true;
  }

  setFlags(flags) {
    this.__flags = flags;
  }

  setFields(fields) {
    this.__fields = fields;
  }

  setOptions(options) {
    if (!isPlainObject(options)) throw new ParamsNotValidError('record.setOptions - param "options" must be an object');
    this.__flags = new Flags(options);
    return this;
  }


  setFieldOptions(fieldAlias, options) {
    this.__dynamicFieldsOptions[fieldAlias] = options;
  }

  setFieldOptions(fieldAlias, options) {
    const field = this.getField(fieldAlias);
    if (field && options) this.__dynamicFieldsOptions[fieldAlias] = options;
    return this;
  }

  isPersisted() {
    return this.record.__inserted;
  }

  isChanged(input) {
    let aliases = compact([].concat(input));

    if (!aliases.length) {
      aliases = keys(omit(this.attributes, ['__type']));
    }

    return some(aliases, (alias) => !isEqual(this.record[alias], this.originalRecord[alias]));
  }

  getComments(fieldAlias) {
    const field = this.fields.find(({ alias }) => alias === fieldAlias);
    const comments = get(this.extraAttributes, `${fieldAlias}.__comments`);

    if (!comments) {
      const message = this.sandbox.translate('static.no_associated_comments_with_field', { fieldAlias });
      logger.error(new ParamsNotValidError(message));
    };

    return comments || [];
  }

  async setComments(fieldAlias, comments) {
    await Promise.each(comments, async comment => {
      if (!comment.data) return;

      const existedComments = get(this.extraAttributes, `${fieldAlias}.__comments`) || [];
      const field = find(this.fields, { alias: fieldAlias });
      const [id] = await worklogDBModel(this.model, this.sandbox).insert({
        created_at: comment.created_at || moment().format(),
        created_by: comment.created_by || this.sandbox.user.id,
        related_field: field.id,
        related_record: this.id,
        data: comment.data.replace(/(<([^>]+)>)/ig, ''),
      }, ['id']);

      id && set(this.extraAttributes, `${fieldAlias}.__comments`, [...existedComments, id]);
    });
  }

  async preloadData() {
    await this.preloadHumanizedAttributes();
    return this;
  }

  async preloadTemplates() {
    const fields = filter(this.fields, ({ alias, type }) => (type === 'data_visual') && this.attributes[alias] && isString(this.attributes[alias]));
    if (!this.record.id || isEmpty(fields)) return this;

    const templates = await loadTemplates([this.record], this.model, this.sandbox, { fieldset: map(fields, 'alias') });
    if (!templates.preloadedTCrossRecords || !templates.preloadedTemplateRecords) return this;

    this.templates = reduce((fields), (result, field) => {
      const { data_model_id, data_record_id } = find(templates.preloadedTCrossRecords, { dvf_field_id: field.id }) || {};
      const record = find(templates.preloadedTemplateRecords, { id: data_record_id });
      const attributes = omitBy(record, (_, key) => key.startsWith('__'));
      const model = { ...db.getModel(data_model_id), template: { field, value: this.attributes[field.alias] } };

      const recordProxy = new RecordProxy(attributes, model, this.sandbox);
      recordProxy.setFields(db.getFields({ model: model.id }));
      result[field.alias] = recordProxy;

      return result;
    }, {});

    return this;
  }

  async preloadVirtualAttributes() {
    // Special case for initial seeding, when RTL fields contains objects to create
    if (!this.record.id) return this;

    await loadRTLs([this.record], this.model, { sandbox: this.sandbox });
    await loadJournals([this.record], this.model, { sandbox: this.sandbox });

    return this;
  }

  async preloadHumanizedAttributes() {
    await Promise.each(this.fields, async (field) => {
      this.humanizedAttributes[field.alias] =
        await this.loadHumanizedAttribute(field, this.record[field.alias]);
      this.previousHumanizedAttributes[field.alias] =
        await this.loadHumanizedAttribute(field, this.getPrevValue(field.alias));
    });

    return this;
  }

  async loadHumanizedAttribute(field, value) {
    let humanizedValue = await getValueHumanizer(field, this.sandbox, { currentDepthReferenceObjSearch: getSetting('limits.lookup_max_ref_obj_search')})(value);
    if (['reference'].includes(field.type)) humanizedValue = humanizedValue.join();
    return humanizedValue;
  }

  reloadTemplates() {
    return this.preloadTemplates();
  }

  reloadVirtualAttributes() {
    return this.preloadVirtualAttributes();
  }

  reloadHumanizedAttributes() {
    return this.preloadHumanizedAttributes();
  }

  async getJournalValue(fieldAlias) {
    const field = this.getField(fieldAlias);
    if (!field || field.type !== 'journal') return;

    return worklogDBModel(this.model).where({
      related_field: field.id,
      related_record: this.record.id,
    }).orderBy('id', 'desc');
  }

  async setJournalValue(fieldAlias, items = []) {
    if (!items.length) return;
    const field = this.getField(fieldAlias);
    if (!field || field.type !== 'journal') return;

    const itemAttributes = {
      related_field: field.id,
      related_record: this.record.id,
    };

    const promises = items.map(item => item.data
      ? worklogDBModel(this.model, this.sandbox).createRecord({ ...itemAttributes, ...item }, false)
      : Promise.resolve());

    return Promise.all(promises);
  }

  async getAttachmentByName(name, version) {
    const model = db.getModel('attachment');
    const params = { file_name: name };

    if (version) {
      params.version = version;
    } else {
      params.last_version = true;
    }

    const attachments = await findRecordAttachments(this.model, this.record, params);
    const [ attachment ] = attachments || [];

    const AttachmentProxy = (await import('./attachment.js')).default;
    return attachment
      ? new AttachmentProxy(attachment, model, this.sandbox)
      : null;
  }

  async getAttachments(version) {
    const model = db.getModel('attachment');
    const params = {};

    if (version) {
      params.version = version;
    }

    const attachments = await findRecordAttachments(this.model, this.record, params);

    const AttachmentProxy = (await import('./attachment.js')).default;
    return attachments.map((attachment) => {
      return new AttachmentProxy(attachment, model, this.sandbox);
    });
  }

  async run(params = {}) {
    const metalines = `//#script_timeout: ${params.timeout || 60000}`;
    const script = this.record.script;
    const path = `scheduled_task/${this.record.id}/script`;
    const context = { modelId: this.model.id };

    await this.sandbox.executeScript(`${metalines}\n${script}`, path, context);
  }
}

export const findRecordAttachments = async (model, record, params) => {
  const attachmentTableName = db.model('attachment').tableName;
  const attachmentTargetRecordField = db.getField({ model: db.getModel('attachment').id, alias: 'target_record' });
  const grcTableName = db.model('global_references_cross').tableName;

  const whereClause = {};
  whereClause[`${attachmentTableName}.__inserted`] = true;
  whereClause[`${grcTableName}.source_field`] = attachmentTargetRecordField.id;
  whereClause[`${grcTableName}.target_model`] = model.id;
  whereClause[`${grcTableName}.target_record_id`] = record.id;

  return db.model('attachment')
    .select([`${attachmentTableName}.*`])
    .leftJoin(grcTableName, `${attachmentTableName}.target_record`, `${grcTableName}.id`)
    .where({ ...whereClause, ...params });
};
