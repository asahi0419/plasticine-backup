import { difference, map, each, filter, isArray, isEmpty, keys } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import { SystemError } from '../../error/index.js';
import logger from '../../logger/index.js';
import validate from './validator.js';
import executeSystemActions from './system-actions/index.js';
import buildAction, { persistentBuild } from './build.js';
import createAction from './create.js';
import updateAction from './update.js';
import destroyAction from './destroy.js';
import { parseOptions } from '../../helpers/index.js';
import loadTemplateFields from './helpers/load-template-fields.js';

export default class {
  constructor(model, sandbox, mode = 'secure') {
    this.model = model;
    this.sandbox = sandbox;
    this.mode = mode;

    this.dynamicFieldsOptions = {};
    this.systemActions = {};
  }

  get tableName() {
    return db.model(this.model).tableName;
  }

  async validate(attributes, withException = false, flags) {
    await this.__beforeAction(attributes);
    return validate(attributes, this, flags, withException);
  }

  async build(attributes = {}, persistent = false) {
    return await this.__operationFlow(attributes, async () => {
      const record = await (persistent ? persistentBuild : buildAction)(this, attributes);
      return { ...record, __inserted: false };
    });
  }

  async create(attributes, flags) {
    return await this.__operationFlow(attributes, async () => {
      const record = await buildAction(this, attributes);
      return createAction(this, record, flags);
    });
  }

  async update(record, attributes, flags) {
    return await this.__operationFlow(attributes, () =>
      updateAction(this, record, attributes, flags)
    );
  }

  async destroy(record, flags) {
    return await this.__operationFlow({}, async () =>
      this.model.alias === 'language'
        ? await this.update(record, { status: 'inactive' }, flags) // deactivate language
        : await destroyAction(this, record, flags)
    );
  }

  setDynamicFieldsOptions(options) {
    if (options) this.dynamicFieldsOptions = options;
    return this;
  }

  setSystemActions(actions) {
    if (actions) this.systemActions = actions;
    return this;
  }

  async __operationFlow(attributes, opCallback) {
    await this.__beforeAction(attributes);
    this.__processAttributes(attributes);
    this.__validateAttributes(attributes);

    const record = await opCallback();

    if (record) {
      record.__type = this.model.alias;
    }

    await this.__afterAction(record);
    return record;
  }

  async __beforeAction(attributes) {
    this.modelFields = await this.getModelFields();

    await this.__setExtraFieldsAttributes();
    this.__setDynamicFieldsOptions();
    // For the future (is not used for now)
    this.__processSystemActions('before', attributes);
  }

  setModelFields(fields) {
    this.modelFields = fields;
    return this;
  }

  async getModelFields() {
    if (!isEmpty(this.modelFields)) {
      return this.modelFields;
    }

    if (this.model.type === 'template') {
      return loadTemplateFields(this.model.template.field, this.model.template.value, this.sandbox);
    }

    if (!isEmpty(db.getFields({ model: this.model.id }))) {
      return db.getFields({ model: this.model.id });
    }

    return db.model('field').where({ model: this.model.id, __inserted: true });
  }

  __processAttributes(attributes) {
    if (this.model.alias === 'field') {
      const options = parseOptions(attributes.options);
      each(keys(options), (key) => delete attributes[key]);
    };
  }

  __validateAttributes(attributes) {
    if (this.model.type === 'template') return;
    if (this.mode !== 'secure') return;

    let keys = Object.keys(attributes);
    keys = difference(keys, map(this.modelFields, 'alias'));
    keys = keys.filter(k => !k.startsWith('__'));

    if (keys.length) {
      logger.error(new SystemError(`Unknown fields (${keys.join(', ')}) - ${this.mode}`));
      each(keys, (key) => delete attributes[key]);
    }
  }

  __setDynamicFieldsOptions() {
    each(this.modelFields, (field) => {
      const options = this.dynamicFieldsOptions[field.alias];
      if (options) field.options = JSON.stringify({ ...parseOptions(field.options), ...options });
    });
  }

  async __setExtraFieldsAttributes() {
    const efaField = db.getField({ alias: 'extra_attributes' });
    if (!efaField) return;

    const rtls = await db.model('rtl').where({ source_field: efaField.id }).whereIn('source_record_id', map(this.modelFields, 'id'));
    const efas = await db.model('extra_fields_attribute').whereIn('id', map(rtls, ({ target_record_id }) => target_record_id));

    each(this.modelFields, (field) => {
      const fieldRtls = filter(rtls, { source_record_id: field.id });
      const fieldEfas = filter(efas, ({ id }) => map(fieldRtls, 'target_record_id').includes(id));
      field.extra_attributes = fieldEfas;
    });
  }

  async __processSystemActions(type, record) {
    const systemActions = this.systemActions[type] || [];

    if (isArray(systemActions) && systemActions.length) {
      await executeSystemActions(systemActions, record, this.sandbox);
    }
  }

  async __afterAction(record) {
    return this.__processSystemActions('after', record);
  }
}
