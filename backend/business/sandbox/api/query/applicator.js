import Promise from 'bluebird';
import {
  keys,
  uniq,
  each,
  map,
  filter,
  find,
  isArray,
  isFunction,
  isObject,
  cloneDeep
} from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import Flags from '../../../record/flags.js';
import Processor from './processor.js';
import * as CONSTANTS from './constants.js';
import cache from '../../../../presentation/shared/cache/index.js';

export default class Applicator {
  constructor(builder) {
    this.builder = builder;
    this.tableName = db.model(builder.model).tableName;
    this.joinedTableNames = [];
    this.selectedColumns = [`${this.tableName}.*`];

    this.setFlags(builder.flags);
  }

  setFlags(flags = Flags.default()) {
    this.flags = flags;
    return this;
  }

  applyFlags(scope, flags) {
    if (!flags.includeNotInsertedRecords()) {
      each(this.joinedTableNames, (tableName) => {
        scope.where(`${tableName}.__inserted`, true);
      });
    }
    return this;
  }

  setLastQuerySQL(sqlQuery) {
    const { modelProxy } = this.builder;
    modelProxy.lastQuerySQL = this.flags.enabledSQLDebug() ? sqlQuery : undefined;
    return this;
  }

  async count() {
    await this.__applyToScope(CONSTANTS.COUNT_APPLICATORS);
    return this.scope.count();
  }

  async distinct(fieldAliases) {
    await this.__applyToScope(CONSTANTS.DISTINCT_APPLICATORS);
    return this.scope.distinct(...fieldAliases);
  }

  async update() {
    await this.__applyToScope(this.applicators);
    this.sendCacheNotifyUpdate();
    return this.updateCount;
  }

  sendCacheNotifyUpdate() {
    const {model} = this.builder;
    const updateCount = this.updateCount || 0;
    if((updateCount < 1) || (model.type !== 'custom')) {
      return;
    }
    const payload = { updated_at:new Date(), __model: model.id };

    cache.namespaces.core.messageBus.publish('service:reload_record_cache', {
      target: 'records',
      params: { action:'update', payload: payload }
    });
  }

  async delete() {
    await this.__applyToScope(CONSTANTS.DELETE_APPLICATORS);
    return this.scope.delete();
  }

  get applicators() {
    return keys(CONSTANTS.APPLICATORS);
  }

  async fetch() {
    // the builder does not have such mode
    // const sections = (this.builder.options.mode !== 'iterate') ? Object.keys(CONSTANTS.APPLICATORS) : [];
    await this.__applyToScope(this.applicators);

    const scope = this.scope.select(this.selectedColumns);
    if (this.builder.selectFirst) scope.first();

    this.applyFlags(scope, this.flags);
    this.setLastQuerySQL(scope.toString());

    return scope;
  }

  async __applyToScope(sections) {
    const { scope } = await this.builder.selectorScope;

    this.scope = scope.clone();
    if (this.builder.trx) this.scope.transacting(this.builder.trx);

    const result = await new Processor(this.builder).perform();
    await Promise.each(sections, (section) => this[CONSTANTS.APPLICATORS[section]](result[section], result));

    return this;
  }

  async __applyUpdaters(updaters = []) {
    this.updateCount = await Promise.reduce(updaters, async (result, attributes) => {
      const protectSystemFields = this.flags.flags?.ex_save?.protectSystemFields === true;

      const crossFieldRecords = cloneDeep(attributes.crossFieldRecords);
      const crossFieldValues = cloneDeep(attributes.crossFieldValues);

      if(protectSystemFields) {
        const protectedFields = ['created_at', 'created_by'];
        protectedFields.forEach(field => delete attributes[field]);
      }

      delete attributes.crossFieldRecords;
      delete attributes.crossFieldValues;
      const ids = await this.scope.updateAndGetResult(attributes, 'id');

      const crossFieldRecordsRTL = filter(crossFieldRecords, { type: 'reference_to_list' });
      const crossFieldRecordsGRC = filter(crossFieldRecords, { type: 'global_reference' });

      if (crossFieldRecordsRTL.length) {
        await db.model('rtl').whereIn('source_record_id', ids).whereIn('source_field', map(crossFieldRecordsRTL, 'id')).delete();

        let rtls = [];

        for (let modelRecordId of ids) {
          for (let crossFieldRecord of crossFieldRecordsRTL) {
            let rtlValues = crossFieldValues[crossFieldRecord.alias] || [];
            let rtlRecords = map(rtlValues, targetId => ({
              target_record_id : targetId,
              source_field : crossFieldRecord.id,
              source_record_id : modelRecordId,
              created_at : new Date(),
              created_by : attributes.updated_by,
              __inserted : true
            }));
            rtlRecords.forEach(item => rtls.push(item));
          }
        }
        const result = await db.model('rtl').insert(rtls);
      }

      if(crossFieldRecordsGRC.length){
        const idsGlobalReferenceField = uniq(map(crossFieldRecordsGRC, 'id'));
        await db.model('global_references_cross').whereIn('source_record_id', ids).whereIn('source_field', idsGlobalReferenceField).delete();
        let grc = [];

        for (let modelRecordId of ids) {
          for (let crossFieldRecord of crossFieldRecordsGRC) {
            let globalReferenceCrossValue = crossFieldValues[crossFieldRecord.alias] || {};
            grc.push({
                target_record_id : globalReferenceCrossValue.id,
                target_model: globalReferenceCrossValue.model,
                source_field : crossFieldRecord.id,
                source_record_id : modelRecordId,
                created_at : new Date(),
                created_by : attributes.updated_by,
                __inserted : true
            });
          }
        }
        const globalReferenceRecords = await db.model('global_references_cross').insertAndGetResult(grc, ['id', 'source_record_id', 'source_field']);
        for(let sourceRecordId of uniq(map(globalReferenceRecords, 'source_record_id'))){
          let attributes = {id: sourceRecordId, updated_at : new Date()};
          filter(globalReferenceRecords, item => item.source_record_id === sourceRecordId).forEach( item => {
            let fieldGRC = find(crossFieldRecordsGRC, x => x.id === item.source_field);
            attributes[fieldGRC.alias] = item.id;
          });
          await db.model(this.scope.model.alias).where({ id: sourceRecordId }).update(attributes);
        }
      }


      return result + (ids ? ids.length || 0 : 0);
    }, 0);
  }

  async __applyChain(chain) {
    if (chain) {
      const { scope } = await this.builder.selectorScope;
      const ids = await this.scope.select(`${this.tableName}.id`).pluck(`${this.tableName}.id`);

      this.scope = scope.whereIn('id', ids);
    }
  }

  __applyFroms(froms = []) {
    if (froms.length) {
      this.scope.__applyFroms(map(froms, (from) => {
        if (isFunction(from)) return from(this.scope);
        if (isObject(from)) return from;
      }));
    }
  }

  __applyFinders(finders = []) {
    if (finders.length) {
      const scope = this.scope;
      scope.andWhere(function(){
        finders.forEach(({ type, clauses }) => {
          this[`${type}Where`](function () {
            clauses.forEach(({ column, distinct, operand, value, where, whereOperator }) => {
              if (distinct) scope.distinct(distinct);

              if (where) {
                if (isArray(where)) {
                  this.andWhere(function() {
                    each(where, (clause) => this[`${whereOperator || 'and'}Where`](clause));
                  })
                } else {
                  this.whereRaw(where);
                }
              } else if (isArray(value) && whereOperator) {
                this.andWhere(function() {
                  each(value, (v) => this[`${whereOperator}Where`](column, operand, v));
                })
              } else if (operand === '!=' && value) {
                this.where(function() {
                  this.where(column, operand, value).orWhere(column, 'is', null);
                });
              } else {
                if (column) {
                  this.where(column, operand, value);
                }
              }
            });
          });
        });
      });
    }
  }

  __applyJoins(joins = [], res = {}) {
    if (!isArray(joins)) return;

    joins.forEach(({ joinTable, leftColumn, rightColumn, selectors }) => {
      if (!(res.groupings || []).length) this.selectedColumns = [...this.selectedColumns, ...selectors];
      this.joinedTableNames = uniq([ ...this.joinedTableNames, joinTable ]);
      this.scope.leftJoin(joinTable, leftColumn, rightColumn);
    });
  }

  __applyServiceJoins(joins = []) {
    if (!isArray(joins)) return;

    joins.forEach(({ tableName, onItems }) => {
      this.joinedTableNames = uniq([ ...this.joinedTableNames, tableName ]);
      this.scope.leftJoin(tableName, function () {
        onItems.forEach(item => this.on(item.left, '=', item.right));
      });
    });
  }

  __applyOrderings(orderings = [], res = {}) {
    if ((res.groupings || []).length) return;

    if (orderings.length) {
      orderings.forEach(({ column, direction }) => this.scope.orderBy(column, direction));
    } else {
      this.scope.orderBy(`${this.tableName}.id`, 'asc');
    }
  }

  __applyGroupings(groupings = []) {
    if (groupings.length) {
      this.scope.groupBy(groupings);
      this.selectedColumns = [...this.selectedColumns, ...groupings];
    }
  }

  __applyAgregates(agregates = []) {
    if (agregates.length) {
      this.selectedColumns = agregates.map((a) => this.scope.client.raw(a));
    }
  }
  __applyLimiter(limiter) {
    if (limiter) this.scope.limit(limiter);
  }

  __applyOffset(offset) {
    if (offset) this.scope.offset(offset);
  }

  __applyColumns(columns = []) {
    if (columns.length) {
      this.selectedColumns = columns;
    }
  }
}
