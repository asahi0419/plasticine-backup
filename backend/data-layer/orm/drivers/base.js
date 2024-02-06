// bigint tuning https://github.com/tgriesser/knex/issues/387
// ==========================================================
import pg from 'pg';
pg.types.setTypeParser(20, 'text', parseInt);
// ==========================================================

import knex from 'knex';
import { map } from 'lodash-es';

import db from '../index.js';
import getTableResolver from '../table-resolver/index.js';
import { SystemError } from '../../../business/error/index.js';
import { parseOptions, isPatternMode, extractConcatenatedFields, makeUniqueID } from '../../../business/helpers/index.js';

export default class BaseDriver {
  constructor() {
    this.tableResolver = getTableResolver();
  }

  connectionConfig() {
    throw 'connectionConfig() not defined';
  }

  poolConfig() {
    throw 'poolConfig() not defined';
  }

  transacting(transaction) {
    this.transaction = transaction;
  }

  getClient() {
    return this.createClient(this.transaction || knex(this.knexConfig()));
  }

  createClient(client) {
    client.provider = this.provider;
    client.tableResolver = this.tableResolver;
    client.createDatabase = this.createDatabase.bind(this);
    client.typeCastValue = this.typeCastValue.bind(this);
    client.orderByClauseWithNulls = this.orderByClauseWithNulls.bind(this);
    client.caseInsensitiveLikeClause = this.caseInsensitiveLikeClause;
    client.regexpClause = this.regexpClause;
    client.notLikeCondition = this.notLikeCondition;
    client.rtlFromClause = this.rtlFromClause.bind(this);
    client.arrayStringToArrayFromClause = this.arrayStringToArrayFromClause.bind(this);
    client.applyOrderByForArrayString = this.applyOrderByForArrayString;
    client.applyOrderByForReference = this.applyOrderByForReference.bind(this);
    client.applyOrderByForRTL = this.applyOrderByForRTL.bind(this);
    client.rawSelect = this.rawSelect.bind(this);
    client.getRowSiblings = this.getRowSiblings.bind(this);
    client.setBooleanDefault = this.setBooleanDefault.bind(this);
    client.processAgregates = this.processAgregates;
    client.getTableNames = this.getTableNames.bind(this);
    client.getCount = this.getCount.bind(this);
    client.greatest  =this.greatest.bind(this);
    client.least = this.least.bind(this)
    client.getGeometry = this.getGeometry.bind(this);

    client.on('query-error', (err) => {
      throw new SystemError(err.message, err.stack);
    });

    // if (process.env.DEBUG || process.env.NODE_ENV !== 'production') {
    //   const times = {};

    //   client
    //     .on('query', (query) => {
    //       times[query.__knexQueryUid] = new Date();
    //     })
    //     .on('query-response', (_, query, builder) => {
    //       const uid = query.__knexQueryUid;
    //       const elapsedTime = (new Date() - times[uid]).toFixed(3);
    //       console.log(`[${elapsedTime} ms] ${builder.toString()}`);
    //       delete times[uid];
    //     });
    // }

    return client;
  }

  knexConfig() {
    return {
      client: this.client,
      connection: this.connectionConfig(),
      migrations: { directory: 'data-layer/orm/migrations' },
      pool: this.poolConfig(),
      acquireConnectionTimeout: 600000,
      postProcessResponse: this.postProcessResponse,
    }
  }

  createDatabase(name) {
    throw 'createDatabase(name) not defined';
  }

  typeCastValue(value) {
    return value;
  }

  columnFormatter(column) {
    throw 'columnFormatter(column) not defined';
  }

  formatColumn(column) {
    return column.split('.').map(part => this.columnFormatter(part)).join('.');
  }

  orderByClauseWithNulls(column) {
    throw 'orderByClauseWithNulls(column) not defined';
  }

  caseInsensitiveLikeClause() {
    throw 'caseInsensitiveLikeClause() not defined';
  }

  notLikeCondition() {
    throw 'notLikeCondition() not defined';
  }

  rtlFromClause(field, modelTableName, rtlTableName, asRTLTableName) {
    throw 'rtlFromClause(field, modelTableName, rtlTableName, asRTLTableName) not defined';
  }

  arrayStringToArrayFromClause(scope, field, asFieldAlias, humanize) {
    throw 'arrayStringToArrayFromClause(scope, field, asFieldAlias, humanize) not defined';
  }

  applyOrderByForArrayString(scope, field, direction) {
    throw 'applyOrderByForArrayString(scope, field, direction) not defined';
  }

  applyOrderByForReference(scope, field, direction) {
    throw 'applyOrderByForReference(scope, field, direction) not defined';
  }

  applyOrderByForRTL(scope, field, direction) {
    throw 'applyOrderByForRTL(scope, field, direction) not defined';
  }

  applyOrderByForReferenceWithDecorator(scope, field, direction, replaceColumnDecorator) {
    const { foreign_model, foreign_label: foreignFieldAlias } = parseOptions(field.options);
    const foreignTable = db.model(foreign_model).tableName;
    const foreignTableAlias = [foreignTable, makeUniqueID()].join('_');

    scope.leftJoin(
      `${foreignTable} as ${foreignTableAlias}`,
      `${scope.tableName}.${field.alias}`,
      `${foreignTableAlias}.id`,
    );

    if (!isPatternMode(foreignFieldAlias)) {
      return scope.orderBy(`${foreignTableAlias}.${foreignFieldAlias}`, direction)
                  .orderBy(`${scope.tableName}.id`, 'asc');
    }

    const fields = extractConcatenatedFields(foreignFieldAlias);
    const startField = fields.shift();
    let orderClause = `replace('${foreignFieldAlias}', '{${startField}}', ${replaceColumnDecorator(`${foreignTableAlias}.${startField}`)})`;

    // TODO: implement correct sorting for references in pattern
    fields.forEach((field) => {
      orderClause = `replace(${orderClause}, '{${field}}', COALESCE(${replaceColumnDecorator(`${foreignTableAlias}.${field}`)}, ''))`;
    });

    scope.orderByRaw(`${orderClause} ${direction}`)
         .orderBy(`${scope.tableName}.id`, 'asc');
  }

  applyOrderByForRTLBase(scope, field, direction, aggFunc) {
    const { foreign_model, foreign_label } = parseOptions(field.options);
    const tables = {
      self: db.model(field.model).tableName,
      foreign: db.model(foreign_model).tableName,
      rtl: db.model('rtl').tableName,
    };
    const label = isPatternMode(foreign_label)
      ?  map(extractConcatenatedFields(foreign_label), (l) => `joining.${l}`).join(" || ' ' || ")
      : `joining.${foreign_label}`;

    scope.froms.push({
      tableName: tables.self,
      columns: [ field.alias ],
      joins: [{
        tableName: function() {
          this.select([`id`, `selection.${field.alias}`]).from(function() {
            this.select([`${tables.self}.id`, db.client.raw(aggFunc)]).from(function() {
              this.select([`${tables.self}.*`, db.client.raw(`${label} as __label_${field.alias}`)])
                  .from(tables.self).as(tables.self)
                  .leftJoin(tables.rtl, `${tables.self}.id`, `${tables.rtl}.source_record_id`)
                  .leftJoin(function() {
                    this.select([`${tables.foreign}.*`]).from(tables.foreign).as('joining')
                  }, `joining.id`, `${tables.rtl}.target_record_id`)
                  .where(`${tables.rtl}.source_field`, field.id)
            }).as('selection').groupBy(`${tables.self}.id`)
          }).as('joined')
        },
        onItems: [{ left: `${tables.self}.id`, right: `joined.id` }],
      }],
      groupBy: [ `${tables.self}.id`, field.alias ],
    });

    scope.orderByRaw(`${field.alias} ${direction}`)
  }

  async rawSelect(sqlQuery) {
    return this.processSelectResponse(await db.client.raw(sqlQuery));
  }

  processSelectResponse(response) {
    throw 'processSelectResponse(response) not defined';
  }

  processAgregates(fieldAs, agrFunc, columnName, order) {
    throw 'processAgregates(fieldAs, agrFunc, columnName, order) not defined';
  }

  async getCount(scope) {
    throw 'getCount(scope) not defined';
  }

  getGeometry(client) {
    throw 'getGeometry(client) not defined';
  }
}
