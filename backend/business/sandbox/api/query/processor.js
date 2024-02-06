import Promise from 'bluebird';
import {
  assign,
  keys,
  each,
  uniq,
  isArray,
  isPlainObject,
  isNull,
  map,
  reduce,
  find,
  keyBy,
  groupBy,
  filter,
  some,
  has,
  omit,
  isUndefined
} from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import getQueryOptions from '../../../filter/processor/visitors/query-options-extractors/index.js';
import { parseOptions, makeUniqueID } from '../../../helpers/index.js';
import { QueryBuilderError } from '../../../error/index.js';
import { validateValues } from '../../../field/value/validate.js';

import pickAttributes from '../../../record/manager/helpers/attributes-picker.js';
import prepareAttributes from '../../../record/manager/pre-processors/prepare-attributes.js';

const OPERANDS_MAP = {
  '=': value => ({ operand: isNull(value) ? 'is' : '=', value }),
  '!=': value => ({ operand: isNull(value) ? 'is not' : '!=', value }),
  '<': value => ({ operand: '<', value }),
  '>': value => ({ operand: '>', value }),
  '<=': value => ({ operand: '<=', value }),
  '>=': value => ({ operand: '>=', value }),
  IN: value => ({ operand: 'in', value }),
  NOTIN: value => ({ operand: 'not in', value }),
  STARTSWITH: value => ({ operand: 'like', value: `${value}%` }),
  DOESNOTSTARTWITH: value => ({ operand: 'not like', value: `${value}%` }),
  ENDSWITH: value => ({ operand: 'like', value: `%${value}` }),
  DOESNOTENDWITH: value => ({ operand: 'not like', value: `${value}%` }),
  LIKE: value => ({ operand: 'like', value: `%${value}%` }),
  NOTLIKE: value => ({ operand: 'not like', value: `%${value}%` }),
};

export default class Processor {
  constructor(builder) {
    this.builder = builder;
    this.context = {};
  }

  async perform() {
    this.result = {
      chain: false,
      limiter: this.builder.limiter,
      offset: this.builder.offset,
      serviceJoins: [],
    };

    await this.prepare();
    await this.validate();

    await this.processFinders();
    this.processJoins();
    this.processOrderings();
    this.processGroupings();
    this.processColumns();
    await this.processUpdaters();

    this.finalize();

    return this.result;
  }

  async prepare() {
    const models = reduce(getModelAliases(this.builder), (result, model) => [ ...result, db.getModel(model) ], []);
    const fields = reduce(models, (result, model) => [ ...result, ...db.getFields({ virtual: false, model: model.id }) ], []);

    this.builder.modelProxy.setFields(fields);

    this.context.modelsMap = keyBy(models, 'alias');
    this.context.fieldsGroupedByModel = groupBy(preloadReferenceFields(fields), 'model');
    this.context.rtlModel = db.getModel('rtl');
  }

  async validate() {
    const errors = { finders: [], updaters: [] };

    each(keys(errors), (section) => {
      each(this.builder[section], ({ params, modelAlias }) => {
        const model = db.getModel(modelAlias);
        const fields = this.context.fieldsGroupedByModel[model.id];
        const valueExtractor = (f, v) => this.extractOperandAndValue(v);
        const valueOmitter = (f, v, c) => (isArray(v) && (['in', 'not in'].includes(c.operand)));

        validateValues(params, fields, this.builder.sandbox, QueryBuilderError, section, valueExtractor, valueOmitter);
      });
    });
  }

  finalize() {
    if (this.builder.deletion || this.builder.updaters.length) {
      this.result.chain = some(this.builder.finders, ({ params, modelAlias }) => {
        const model = db.getModel(modelAlias);
        const modelFields = this.context.fieldsGroupedByModel[model.id];
        const modelFieldsByAlias = keyBy(modelFields, 'alias');

        return some(params, (value, alias) => {
          const field = modelFieldsByAlias[alias] || {};
          return field.type === 'reference_to_list';
        });
      });
    }
  }

  columnName(modelAlias, fieldAlias) {
    const model = this.context.modelsMap[modelAlias];
    return `${db.model(model).tableName}.${fieldAlias}`;
  }

  async processUpdaters() {
    const { sandbox, flags, updaters } = this.builder;
    const { ex_save = {} } = flags.getFlags();
    const { user = {} } = sandbox;

    this.result.updaters = await Promise.map(updaters, async ({ params, modelAlias }) => {
      const model = db.getModel(modelAlias);
      const fields = this.context.fieldsGroupedByModel[model.id];

      const attributesPicked = pickAttributes(params, fields, 'schema');
      const attributes = await prepareAttributes({ modelFields:fields, sandbox }, attributesPicked);

      const crossFieldValues = pickAttributes(params, fields, 'cross');
      const crossFieldRecords = fields.filter(item => Object.keys(crossFieldValues).includes(item.alias));

      const protectSystemFields = ex_save?.protectSystemFields === true;

      const result = protectSystemFields
          ? { ...attributes, crossFieldRecords, crossFieldValues, updated_by: user.id, updated_at: new Date() }
          : { ...attributes, crossFieldRecords, crossFieldValues,
            updated_by: isUndefined(attributes['updated_by']) ? user.id : attributes['updated_by'],
            updated_at: isUndefined(attributes['updated_at']) ? new Date() : attributes['updated_at'],
          };

      if (!ex_save.updateDateTimeFields) {
        delete result['updated_at'];
      }

      return result;
    });
  }

  async processFinders() {
    this.result.finders = await Promise.map(this.builder.finders, async (finder) => {
      const { type, params, modelAlias } = finder;
      const clauses = await this.processClause(modelAlias, params);
      return { type, clauses };
    });
  }

  async processStringClause(field, operand, value, finderModel) {
    const context = { sandbox: this.builder.sandbox };
    const options = await getQueryOptions(field, operand, value, context);
    const column = this.columnName(finderModel.alias, field.alias);

    return { column, operand, ...options };
  }

  processArrayStringClause(field, value, finderModel) {
    const { multi_select: multi } = parseOptions(field.options);
    const result = { column: this.columnName(finderModel.alias, field.alias) };

    if (multi) {
      if (isPlainObject(value)) {
        result.operand = Object.keys(value)[0];
        result.value = Object.values(value)[0];

        if (isArray(result.value)) {
          if (['=', '!='].includes(result.operand)) {
            result.value = result.value.map((v) => `'${v.replace(/\'(.*)\'/,'$1')}'`).sort().join(',');
          }
          if (['@~'].includes(result.operand)) {
            result.whereOperator = 'or';
            result.operand = 'like';
            result.value = map(result.value, (v) => `%'${v}'%`);
          }

          if (['@>', '!@>', '<@', '!<@'].includes(result.operand)) {
            const alias = `${field.alias}_${makeUniqueID()}`
            const value = `array[${result.value.map((v) => `'''${v.replace(/\'(.*)\'/,'$1')}'''`).join(',')}]`;
            const operator = result.operand.replace('!', '');
            const exception = result.operand.includes('!') ? 'not' : '';

            const clauses = [`${exception} ${alias} ${operator} ${value}`];
            if (exception) clauses.push(`${alias} IS NULL`);

            result.where = db.client.raw(clauses.map((c) => `(${c})`).join(' OR '));

            this.result.froms = this.result.froms || [];
            this.result.froms.push((scope) => db.client.arrayStringToArrayFromClause(scope, field, alias));
          }
        } else {
          assign(result, this.extractOperandAndValue(result.value));
        }
      } else {
        if (isArray(value)) {
          result.whereOperator = 'or';
          result.operand = 'like';
          result.value = map(value, (v) => `%'${v}'%`);
        } else {
          assign(result, this.extractOperandAndValue(value));
        }
      }
    } else {
      assign(result, this.extractOperandAndValue(value));
    }

    return result;
  }

  processReferenceClause(field, value, finderModel) {
    if (isPlainObject(value) && !Object.keys(OPERANDS_MAP).includes(Object.keys(value)[0])) {
      const foreignTable = db.model(field.foreign_model).tableName;
      const [referenceFieldAlias, referenceValue] = [Object.keys(value)[0], Object.values(value)[0]];

      this.result.serviceJoins.push({
        tableName: foreignTable,
        onItems: [
          { left: `${foreignTable}.id`, right: `${db.model(finderModel).tableName}.${field.alias}` },
        ],
      });

      return {
        column: `${foreignTable}.${referenceFieldAlias}`,
        ...this.extractOperandAndValue(referenceValue),
      };
    }

    return {
      column: this.columnName(finderModel.alias, field.alias),
      ...this.extractOperandAndValue(value),
    };
  }

  processReferenceToListClause(field, value, finderModel) {
    const modelTableName = db.model(field.model).tableName;
    const rtlTableName = db.model('rtl').tableName;

    if (isPlainObject(value) || (value === 'ISNULL')) {
      const asRTLTableName = rtlTableName + '_' + Math.random().toString().slice(2,8);
      const result = { operand: Object.keys(value)[0], value: Object.values(value)[0] };
      const from = db.client.rtlFromClause(field, modelTableName, rtlTableName, asRTLTableName);

      if (value === 'ISNULL') {
        from.where = [ db.client.raw(`${asRTLTableName}.source_record_id is null`) ];
      }

      if (result.operand !== '@~') {
        from.columns = [ db.client.raw(`array_agg(${asRTLTableName}.target_record_id order by ${asRTLTableName}.target_record_id asc) as source_field_${asRTLTableName}`) ];
      }

      if (['=', '!='].includes(result.operand)) result.where = db.client.raw(`source_field_${asRTLTableName} ${result.operand} array[${result.value.sort((a, b) => a - b)}]`);

      if (result.operand === '@~')  from.where = [ db.client.raw(`${asRTLTableName}.target_record_id in (${result.value})`) ];
      if (result.operand === '<@')  result.where = db.client.raw(`source_field_${asRTLTableName} <@ array[${result.value}]`);
      if (result.operand === '!<@') result.where = db.client.raw(`not source_field_${asRTLTableName} <@ array[${result.value}]`);
      if (result.operand === '@>')  result.where = db.client.raw(`source_field_${asRTLTableName} @> array[${result.value}]`);
      if (result.operand === '!@>') result.where = db.client.raw(`not source_field_${asRTLTableName} @> array[${result.value}]`);

      this.result.froms = this.result.froms || [];
      this.result.froms.push(from);

      return result;
    } else {
      const foreignTable = db.model(field.foreign_model).tableName;

      this.result.serviceJoins.push({
        tableName: rtlTableName,
        onItems: [
          { left: `${rtlTableName}.source_field`, right: field.id },
          { left: `${rtlTableName}.source_record_id`, right: `${db.model(finderModel).tableName}.id` },
        ],
      });

      this.result.serviceJoins.push({
        tableName: foreignTable,
        onItems: [{ left: `${rtlTableName}.target_record_id`, right: `${foreignTable}.id` }],
      });

      let [referenceFieldAlias, referenceValue] = isPlainObject(value) && !Object.keys(OPERANDS_MAP).includes(Object.keys(value)[0])
        ? [Object.keys(value)[0], Object.values(value)[0]]
        : ['id', value];

      return {
        distinct: `${modelTableName}.id`,
        column: `${foreignTable}.${referenceFieldAlias}`,
        ...this.extractOperandAndValue(referenceValue),
      }
    }
  }

   processGlobalReferenceClause(field, value, finderModel) {
    const modelTableName = db.model(field.model).tableName;
    const grcTableName = db.model("global_references_cross").tableName;

    if (isPlainObject(value)) {
      let result = {}, modelId;

      if (has(value, "model")) {
        result.operand = "=";
        modelId = value.model;
        value = omit(value, "model").id;
      } else if (Object.keys(value)[0] === "!=") {
        result.operand = "!=";
        modelId = Object.values(value)[0].model;
        value = Object.values(value)[0].id;
      }

      const asGRCTableName = grcTableName + "_" + Math.random().toString().slice(2, 8);
      const from = {
        tableName: modelTableName,
        joins: [
          {
            tableName: grcTableName + " AS " + asGRCTableName,
            onItems: [
              {
                left: `${asGRCTableName}.source_field`,
                right: field.id,
              },
              {
                left: `${asGRCTableName}.source_record_id`,
                right: `${modelTableName}.${
                  field.__parentField ? field.__parentField.alias : "id"
                }`,
              },
            ],
          },
        ],
        groupBy: [`${modelTableName}.id`],
      };

      if (result.operand === '=') {
        from.where = [
          db.client.raw(
            `${asGRCTableName}.target_record_id = ${value} AND ${asGRCTableName}.target_model = ${modelId}`
          ),
        ];
      } else if (result.operand === '!=') {
        from.where = [
          db.client.raw(
            `${asGRCTableName}.target_record_id != ${value} AND ${asGRCTableName}.target_model = ${modelId} OR ${asGRCTableName}.target_model != ${modelId}`
          ),
        ];
      }

      this.result.froms = this.result.froms || [];
      this.result.froms.push(from);

      return result;
    } else {
      if (value === 'ISNULL') {
        return {
          column: `${modelTableName}.${field.alias}`,
          operand: 'is',
          value: null,
        }
      }

      if (value === 'ISNOTNULL') {
        return {
          column: `${modelTableName}.${field.alias}`,
          operand: 'is not',
          value: null,
        }
      }
    }
  }


  async processDatetimeClause(field, operand, value, finderModel) {
    const context = { sandbox: this.builder.sandbox, options: { dateTruncPrecision: this.builder.dateTrunc } };
    const options = await getQueryOptions(field, operand, value, context);
    const column = this.columnName(finderModel.alias, field.alias);

    if (options.froms.length) {
      this.result.froms = [ ...(this.result.froms || []), ...options.froms ];
    }

    return { column, operand, ...options };
  }

  extractOperandAndValue(value) {
    if (isPlainObject(value)) {
      const [operand] = Object.keys(value);
      const [v] = Object.values(value);
      const mapper = OPERANDS_MAP[operand];
      return mapper ? mapper(v) : { operand, value: v };
    } else if (isNull(value) || (value === 'ISNULL')) {
      return { operand: 'is', value: null };
    } else if (value === 'ISNOTNULL') {
      return { operand: 'is not', value: null };
    } else if (isArray(value)) {
      return { operand: 'in', value };
    } else {
      return { operand: '=', value };
    }
  }

  async processClause(modelAlias, params) {
    const model = this.context.modelsMap[modelAlias];

    return Promise.reduce(keys(params), async (result, alias) => {
      const value = params[alias];

      const field = find(this.context.fieldsGroupedByModel[model.id], { alias });
      const column = this.columnName(model.alias, field.alias);
      const options = this.extractOperandAndValue(value);

      if (field.type === 'string') {
        result.push(await this.processStringClause(field, options.operand, options.value, model));
      } else if (field.type === 'array_string') {
        result.push(this.processArrayStringClause(field, value, model));
      } else if (field.type === 'reference') {
        result.push(this.processReferenceClause(field, value, model));
      } else if (field.type === 'reference_to_list') {
        result.push(this.processReferenceToListClause(field, value, model));
      } else if (field.type === "global_reference") {
        result.push(this.processGlobalReferenceClause(field, value, model));
      } else if (field.type === 'datetime') {
        const processor = (o, v) => this.processDatetimeClause(field, o, v, model);

        if (isNull(options.value)) {
          result.push({ column, ...options });
        } else if (isArray(options.value)) {
          result.push(await processor(options.operand, options.value));
        } else if (isPlainObject(value)) {
          await Promise.each(keys(value), async (o) => result.push(await processor(o, value[o])));
        } else {
          result.push(await processor(options.operand, options.value));
        }
      } else {
        if (isNull(options.value)) {
          result.push({ column, ...options });
        } else if (isPlainObject(value) && (keys(value).length > 1)) {
          each(value, (v, o) => result.push({ column, operand: o, value: v }));
        } else {
          result.push({ column, ...options });
        }
      }

      return result;
    }, []);
  }

  processJoins() {
    this.result.joins = this.builder.joins.map(({ left, right }) => {
      const joinModel = this.context.modelsMap[left.modelAlias];
      const joinTable = db.model(joinModel).tableName;
      const leftColumn = this.columnName(left.modelAlias, left.fieldAlias);
      const rightColumn = this.columnName(right.modelAlias, right.fieldAlias);

      const columns = find(this.builder.columns, { modelAlias: left.modelAlias }) || {};
      const selectors = this.context.fieldsGroupedByModel[joinModel.id]
        .filter(({ alias }) => columns.fieldAliases ? columns.fieldAliases.includes(alias) : true)
        .filter(({ type }) => !db.schema.VIRTUAL_FIELDS.includes(type))
        .map(({ alias }) => `${joinTable}.${alias} as __j_${joinModel.id}_${alias}`);

      return { joinTable, leftColumn, rightColumn, selectors };
    });
  }

  processOrderings() {
    this.result.orderings = this.builder.orderings.map(({ modelAlias, fieldAlias, direction }) => ({
      column: this.columnName(modelAlias, fieldAlias),
      direction,
    }));
  }

  processGroupings() {
    this.result.groupings = this.builder.groupings
      .map(({ modelAlias, fieldAlias }) => this.columnName(modelAlias, fieldAlias));
    this.result.agregates = this.builder.agregates
      .map(({ fieldAs, agrFunc, fieldAlias, modelAlias}) => {
        if (['LAST', 'FIRST'].includes(agrFunc)) {
          const order = this.result.orderings.map(({ column, direction }) => {
            let needDesc = (agrFunc === 'FIRST' && direction === 'desc') || (agrFunc === 'LAST' && direction === 'asc');
            return column + (needDesc ? ' desc' : '');
          }).join(', ');
          return db.client.processAgregates(fieldAs, agrFunc, this.columnName(modelAlias, fieldAlias), order);
        }
        return `${agrFunc}(${this.columnName(modelAlias, fieldAlias)}) AS ${fieldAs}`
      });
  }

  processColumns() {
    this.result.columns = reduce(this.builder.columns, (result, { fieldAliases, modelAlias }) => {
      const model = db.getModel(modelAlias);
      const fields = filter(this.context.fieldsGroupedByModel[model.id], ({ alias }) => fieldAliases.includes(alias));

      const joinTable = db.model(modelAlias).tableName;
      const joined = find(this.result.joins, { joinTable });

      if (joined && joined.selectors.length) return result;

      const columns = uniq(reduce(fields, (r, { alias, type }) => {
        if (type === 'reference_to_list') return r;
        return [ ...r, this.columnName(modelAlias, alias) ];
      }, []));

      const isIDColumnRequired = some(fields, ({ type }) => ['reference_to_list', 'global_reference'].includes(type));
      const isIDColumnMissed = !find(fields, { alias: 'id' });

      if (isIDColumnRequired && isIDColumnMissed) {
        columns.push(this.columnName(modelAlias, 'id'));
      }

      return [ ...result, ...columns ];
    }, []);
  }
}

function getModelAliases(builder) {
  const modelAliases = [];
  const { finders, joins, orderings, groupings } = builder;

  finders.forEach(({ modelAlias }) => modelAliases.push(modelAlias));
  joins.forEach(({ left, right }) => {
    modelAliases.push(left.modelAlias);
    modelAliases.push(right.modelAlias);
  });
  orderings.forEach(({ modelAlias }) => modelAliases.push(modelAlias));
  groupings.forEach(({ modelAlias }) => modelAliases.push(modelAlias));

  return uniq(modelAliases);
}

function preloadReferenceFields(fields) {
  const referenceFields = fields.filter(({ type }) => ['reference', 'reference_to_list'].includes(type));

  referenceFields.forEach((field) => {
    field.options = parseOptions(field.options);
    field.foreign_model = db.getModel(field.options.foreign_model);
  });

  return fields;
}
