import Promise from 'bluebird';
import {
  cloneDeep,
  each,
  filter,
  find,
  get,
  has,
  isArray,
  isPlainObject,
  isString,
  isUndefined,
  keyBy,
  map,
  omit,
  pick,
  uniq,
} from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import Flags from '../../../record/flags.js';
import typecast from '../../../field/value/typecast/index.js';
import Selector from '../../../record/fetcher/selector.js';
import RecordProxy from './record/index.js';
import QueryBuilder from '../query/builder.js';

import loadRTLs from '../../../record/fetcher/loaders/rtl.js';
import loadGRCs from '../../../record/fetcher/loaders/grc.js';
import loadJournals from '../../../record/fetcher/loaders/journal.js';
import normalizeRecord from '../../../record/manager/helpers/normalize-record.js';
import { getDefaultAutonumber } from '../../../record/manager/helpers/extract-default-value.js';

import logger from '../../../logger/index.js';
import { makeUniqueHEX, parseOptions } from '../../../helpers/index.js';
import { validateValues } from '../../../field/value/validate.js';
import * as Errors from '../../../error/index.js';

const DEFAULT_WRAP_RECORD_PARAMS = {
  preload_virtual_attrubutes: true,
  preload_cross_attrubutes: true,
  preload_templates: true,
  preload_data: false,
  select_raw: false,
};

export const wrapRecord =
  (modelProxy, params = {}) =>
  async (record) => {
    const options = { ...DEFAULT_WRAP_RECORD_PARAMS, ...params };

    const preloadVirtualAttributes = get(options, 'preload_virtual_attrubutes');
    const preloadCrossAttributes = get(options, 'preload_cross_attrubutes');
    const preloadTemplates = get(options, 'preload_templates');
    const preloadData =
      get(options, 'preload_data') ||
      get(modelProxy.flags || {}, 'flags.preload_data');
    const selectRaw = get(options, 'select_raw');

    if (!modelProxy.modelFields) await modelProxy.loadFields();

    const { model, modelFields, sandbox, flags } = modelProxy;

    const preloadedRecord = normalizeRecord({ ...record }, modelProxy);

    if (preloadVirtualAttributes) {
      await loadRTLs([preloadedRecord], modelProxy.model, {
        sandbox,
        fieldset: params.fieldset,
      });
      await loadJournals([preloadedRecord], modelProxy.model, {
        sandbox,
        fieldset: params.fieldset,
      });
    }

    if (preloadCrossAttributes) {
      await loadGRCs([preloadedRecord], modelProxy.model, {
        sandbox,
        fieldset: params.fieldset,
      });
    }

    record = { ...record, ...preloadedRecord };

    if (selectRaw) return record;

    const recordProxy = await RecordProxy.create(
      record,
      model,
      sandbox,
      options
    );

    if (flags) recordProxy.setFlags(flags);
    if (modelFields) recordProxy.setFields(modelFields);

    // TODO: load before record proxy constructor initialization
    if (preloadTemplates) await recordProxy.preloadTemplates();
    if (preloadData) await recordProxy.preloadData();

    return recordProxy;
  };

export const wrapRecords =
  (modelProxy, params = {}) =>
  async (records = []) => {
    const options = { ...DEFAULT_WRAP_RECORD_PARAMS, ...params };

    const preloadVirtualAttributes = get(options, 'preload_virtual_attrubutes');
    const preloadCrossAttributes = get(options, 'preload_cross_attrubutes');
    const selectRaw = get(options, 'select_raw');

    if (!selectRaw && !modelProxy.modelFields) await modelProxy.loadFields();

    const { model, modelFields, sandbox } = modelProxy;

    if (preloadVirtualAttributes) {
      await loadRTLs(records, model, { sandbox, fieldset: params.fieldset });
      await loadJournals(records, model, {
        sandbox,
        fieldset: params.fieldset,
      });
    }

    if (preloadCrossAttributes) {
      await loadGRCs(records, model, { sandbox, fieldset: params.fieldset });
    }

    return Promise.map(
      records,
      wrapRecord(modelProxy, {
        preload_virtual_attrubutes: false,
        preload_cross_attrubutes: false,
        ...params,
      })
    );
  };

export default class ModelProxy {
  constructor(model, sandbox, flags = Flags.default()) {
    this.id = model.id;
    this.alias = model.alias;
    this.flags = flags;

    this.__getModel = () => model;
    this.__getSandbox = () => sandbox;

    this.setOptions(parseOptions(model.options));
  }

  get model() {
    return this.__getModel();
  }

  get sandbox() {
    return this.__getSandbox();
  }

  get attributes() {
    return this.model.attributes;
  }

  getSQL() {
    return this.lastQuerySQL;
  }

  getValue(fieldAlias) {
    if (!isString(fieldAlias))
      throw new Errors.ParamsNotValidError(
        'model.getValue - param "fieldAlias" must be a string'
      );

    return this.model[fieldAlias];
  }

  canAttach() {
    return this.sandbox.executeScript(
      `p.currentUser.canAttach(${this.model.id})`,
      `model/${this.model.id}/permission_to_create_attachment`
    );
  }

  setFields(fields) {
    this.modelFields = fields;
    return this;
  }

  async loadFields(params = {}) {
    const select = params.select || [
      'id',
      'model',
      'name',
      'alias',
      'type',
      'options',
    ];

    this.modelFields = map(db.getFields({ model: this.model.id }), (f) =>
      pick(f, select)
    );

    return this;
  }

  async build(attributes = {}) {
    if (!isPlainObject(attributes))
      throw new Errors.ParamsNotValidError(
        'model.build - param "attributes" must be an object'
      );
    await this.__validateAttributes(attributes, 'build');

    const manager = await db.model(this.model, this.sandbox).getManager();
    return manager.build(attributes, true).then(wrapRecord(this));
  }

  async insert(attributes, options = {}) {
    if (!isPlainObject(attributes))
      throw new Errors.ParamsNotValidError(
        'model.insert - param "attributes" must be an object'
      );
    if (!isPlainObject(options))
      throw new Errors.ParamsNotValidError(
        'model.insert - param "options" must be an object'
      );
    await this.__validateAttributes(omit(attributes, ['id']), 'insert');

    const manager = await db.model(this.model, this.sandbox).getManager();
    if (options.systemActions) manager.setSystemActions(options.systemActions);

    return manager.create(attributes, this.flags).then(wrapRecord(this));
  }

  async destroy() {
    const manager = await db.model('model', this.sandbox).getManager();
    return manager.destroy(this.model);
  }

  massInsert(records) {
    this.__checkActionPermissions('massInsert');
    const userId = (this.sandbox.user || {}).id;
    const protectSystemFields = this.getOption('ex_save.protectSystemFields');

    const execute = async () => {
      if (!isArray(records)) {
        const message = this.sandbox.translate(
          'static.illegal_mass_insert_arguments'
        );
        throw new Errors.ParamsNotValidError(message);
      }

      if (!this.modelFields) await this.loadFields();
      const fieldsMap = keyBy(this.modelFields, 'alias');

      const preparedRecords = map(
        filter(records, isPlainObject),
        ({ id, ...record }) => {
          each(record, (value, alias) => {
            const field = fieldsMap[alias];

            let v = typecast(field, value, { raw: true });
            if (
              [
                'string',
                'color',
                'condition',
                'fa_icon',
                'file',
                'filter',
              ].includes(field.type)
            ) {
              if (isString(v && !v.trim().length)) {
                v = parseOptions(field.options).default;
              }
            }

            record[alias] = v;
          });
          record.__hash = makeUniqueHEX(20);
          record.created_at = protectSystemFields
            ? new Date()
            : isUndefined(record.created_at)
            ? new Date()
            : record.created_at;
          record.created_by = protectSystemFields
            ? userId
            : isUndefined(record.created_by)
            ? userId
            : record.created_by;
          record.updated_at = protectSystemFields ? null : record?.updated_at;
          record.updated_by = protectSystemFields ? null : record?.updated_by;
          record.__inserted = true;
          return record;
        }
      );

      const rtlFields = filter(this.modelFields, { type: 'reference_to_list' });
      const grcFields = filter(this.modelFields, { type: 'global_reference' });
      const autonumberFields = filter(this.modelFields, { type: 'autonumber' });

      if (!rtlFields.length && !grcFields.length && !autonumberFields.length) {
        return db.model(this.model, this.sandbox).insert(preparedRecords);
      }

      const rtlAliases = map(rtlFields, 'alias');
      const grcAliases = map(grcFields, 'alias');
      const autonumberAliases = map(autonumberFields, 'alias');

      const recordsPlain = filter(
        preparedRecords,
        (r) =>
          !find(rtlAliases, (a) => has(r, a)) &&
          !find(grcAliases, (a) => has(r, a))
      );
      const recordsRTL = filter(
        preparedRecords,
        (r) =>
          find(rtlAliases, (a) => has(r, a)) &&
          !find(grcAliases, (a) => has(r, a))
      );
      const recordsGRC = filter(
        preparedRecords,
        (r) =>
          !find(rtlAliases, (a) => has(r, a)) &&
          find(grcAliases, (a) => has(r, a))
      );
      const recordsRTLGRC = filter(
        preparedRecords,
        (r) =>
          find(rtlAliases, (a) => has(r, a)) &&
          find(grcAliases, (a) => has(r, a))
      );

      const insertedRecords = [
        ...(await this.massInsertPlain(recordsPlain)),
        ...(await this.massInsertRTL(recordsRTL, rtlAliases)),
        ...(await this.massInsertGRC(recordsGRC, grcAliases)),
        ...(await this.massInsertRTLGRC(recordsRTLGRC, grcAliases, rtlAliases)),
      ];

      if (autonumberAliases.length < 1) {
        return insertedRecords;
      }

      await this.massProcessAutonumber(
        autonumberFields,
        autonumberAliases,
        insertedRecords
      );
      return insertedRecords;
    };

    return {
      transacting: (trx) => {
        this.sandbox.trx = trx;
        return execute();
      },
      then: (...args) => {
        return execute().then(...args);
      },
    };
  }

  async massInsertPlain(records = []) {
    if (!records.length) return [];

    return db.model(this.model, this.sandbox).insert(records);
  }

  async massInsertRTL(records = [], aliases = []) {
    if (!records.length || !aliases.length) return [];

    const recordsWithDeletedFields = cloneDeep(records);
    each(recordsWithDeletedFields, (r) => {
      const fields = filter(aliases, (a) => has(r, a));
      each(fields, (f) => {
        delete r[f];
      });
    });

    const arrIdHash = await db
      .model(this.model, this.sandbox)
      .insertAndGetResult(recordsWithDeletedFields, ['id', '__hash']);
    const result = [];

    each(records, (record = {}) => {
      each(
        filter(aliases, (alias) => has(record, alias)),
        (alias) => {
          each(record[alias] || [], (id) => {
            const field = find(this.modelFields, { alias }) || {};
            result.push({
              target_record_id: id,
              source_field: field.id,
              source_record_id: (
                find(arrIdHash, { __hash: record.__hash }) || {}
              ).id,
              created_at: record.created_at || new Date(),
              created_by: record.created_by || (this.sandbox.user || {}).id,
              __inserted: true,
            });
          });
        }
      );
    });

    await db.model('rtl', this.sandbox).insert(result);
    return Object.keys(arrIdHash).includes('0') ? map(arrIdHash, 'id') : [];
  }

  async massInsertGRC(records = [], aliases = []) {
    if (!records.length || !aliases.length) return [];

    const recordsWithDeletedFields = cloneDeep(records);
    each(recordsWithDeletedFields, (r) => {
      const fields = filter(aliases, (a) => has(r, a));
      each(fields, (f) => {
        delete r[f];
      });
    });

    const arrIdHash = await db
      .model(this.model, this.sandbox)
      .insertAndGetResult(recordsWithDeletedFields, ['id', '__hash']);
    const result = [];

    each(records, (record = {}) => {
      each(
        filter(aliases, (alias) => has(record, alias)),
        (alias) => {
          const field = find(this.modelFields, { alias }) || {};
          result.push({
            target_record_id: (record[alias] || {}).id,
            target_model: (record[alias] || {}).model,
            source_field: field.id,
            source_record_id: (find(arrIdHash, { __hash: record.__hash }) || {})
              .id,
            created_at: record.created_at || new Date(),
            created_by: record.created_by || (this.sandbox.user || {}).id,
            __inserted: true,
          });
        }
      );
    });

    const grcRecords = await db
      .model('global_references_cross', this.sandbox)
      .insertAndGetResult(result, ['id', 'source_record_id', 'source_field']);
    const grcFields = filter(this.modelFields, { type: 'global_reference' });

    await Promise.each(
      uniq(map(grcRecords, 'source_record_id')),
      async (id) => {
        const attributes = { id, updated_at: new Date() };
        each(filter(grcRecords, { source_record_id: id }), (item) => {
          const field = find(grcFields, { id: item.source_field }) || {};
          attributes[field.alias] = item.id;
        });
        await db
          .model(this.model.alias, this.sandbox)
          .where({ id })
          .update(attributes);
      }
    );

    return Object.keys(arrIdHash).includes('0') ? map(arrIdHash, 'id') : [];
  }

  async massInsertRTLGRC(records = [], grcAliases = [], rtlAliases = []) {
    if (!records.length || !grcAliases.length || !rtlAliases.length) return [];

    throw new Error(
      'mass insert method for records with RTL and GRC havent been implemented yet'
    );
  }

  async massProcessAutonumber(
    autonumberFields,
    autonumberAliases,
    insertedRecords
  ) {
    let recordsForUpdate = [];

    each(insertedRecords, (id) => {
      let recordWithUpdatedField = { id: id };

      each(autonumberAliases, (fieldAlias) => {
        const autonumberField = find(autonumberFields, { alias: fieldAlias });
        const options = parseOptions(autonumberField.options);
        recordWithUpdatedField[fieldAlias] = getDefaultAutonumber(options, id);
      });

      recordsForUpdate.push(recordWithUpdatedField);
    });

    await Promise.each(recordsForUpdate, async (record) => {
      const { id } = record;
      const attributes = { ...omit(record, ['id']) };
      await db
        .model(this.model.alias, this.sandbox)
        .where({ id: id })
        .update(attributes);
    });
  }

  fields(/* params = {}, model = null */) {
    return this.__buildQuery('fields', arguments);
  }

  update(/* params = {}, model = null */) {
    this.__checkActionPermissions('update');

    return this.__buildQuery('update', arguments);
  }

  find(/* params = {}, model = null */) {
    return this.__buildQuery('find', arguments);
  }

  findOne(params = {}) {
    return this.find(params).findOne();
  }

  orFind(/* params = {}, model = null */) {
    return this.__buildQuery('orFind', arguments);
  }

  join(/* leftModel, leftFieldAlias, rightModel, rightFieldAlias */) {
    return this.__buildQuery('join', arguments);
  }

  order(/* options, model = null */) {
    return this.__buildQuery('order', arguments);
  }

  limit(/* value, offset = null */) {
    return this.__buildQuery('limit', arguments);
  }

  count() {
    return this.__buildQuery('count', arguments);
  }

  setOptions(options) {
    if (!isPlainObject(options))
      throw new Errors.ParamsNotValidError(
        'model.setOptions - param "options" must be an object'
      );
    this.flags = new Flags(options);
    return this;
  }

  getOption(input) {
    return get(this.flags.flags, input);
  }

  getSelector(options = {}) {
    return new Selector(this.model, this.sandbox, options);
  }

  __buildQuery(action, args) {
    const { model, sandbox, flags } = this;
    const options = { includeNotInserted: flags.includeNotInsertedRecords() };

    let selectorScope = db.model(model);
    if (flags.checkPermission('query')) {
      selectorScope = new Selector(model, sandbox, options).defaultScope();
    } else {
      if (!options.includeNotInserted)
        selectorScope.whereRaw(`${selectorScope.tableName}.__inserted = true`);
      selectorScope = Promise.resolve({ scope: selectorScope });
    }

    const query = new QueryBuilder(this, selectorScope);
    return query[action](...args);
  }

  async __validateAttributes(attributes = {}, section) {
    if (!this.modelFields) await this.loadFields();

    validateValues(
      attributes,
      this.modelFields,
      this.sandbox,
      Errors.ParamsNotValidError,
      `Model (${this.model.alias}) - ${section}`
    );
  }

  records() {
    logger.info(
      'model.records() will be deprecated soon. Please use p.iterEach or p.iterMap.'
    );
    return db.model(this.model).then(wrapRecords(this));
  }

  //__checkActionPermissions: checks current user permissions compared to the parent model action permissions
  __checkActionPermissions(action) {
    if (this.getOption('check_permission.all') === false) {
      return;
    }

    const insertAllowed = this.getOption('check_permission.insert') === false;
    if (insertAllowed && action === 'massInsert') {
      return;
    }

    const updateAllowed = this.getOption('check_permission.update') === false;
    if (updateAllowed && action === 'update') {
      return;
    }

    const deleteAllowed = this.getOption('check_permission.delete') === false;
    if (deleteAllowed && action === 'delete') {
      return;
    }

    const permitted = this.sandbox.executeScript(
      `p.currentUser.canAtLeastWrite(${this.model.id})`,
      `model/${this.model.id}/action_permissions`
    );

    if (permitted) return;

    throw new Errors.NoPermissionsError(
      this.sandbox.translate('static.no_permissions_to_action_on_the_model', {
        action,
        model: this.model.name,
      })
    );
  }
}
