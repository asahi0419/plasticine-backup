import knex from 'knex';
import moment from 'moment';
import { sortBy, map, isBoolean, toPairs } from 'lodash-es';

import { DEFAULT_DATE_FORMAT } from '../../../business/constants/index.js';
import { parseOptions, objectMatrix } from '../../../business/helpers/index.js';

import db from '../index.js';
import BaseDriver from './base.js';

export default class MysqlDriver extends BaseDriver {
  constructor() {
    super();
    this.client = 'mysql';
    this.provider = 'mysql';
  }

  connectionConfig() {
    const config = {
      host: process.env.DB_HOST || 'mysql',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'plasticine',
      password: process.env.DB_PASS || 'plasticine_password',
      database: process.env.DB_NAME || 'plasticine',
      timezone: process.env.DB_TZ || 'UTC',
      typeCast: (field, next) => {
        if (field.type === 'TINY' && field.length === 1) {
          return field.string() === '1';
        }

        return next();
      },
    };

    if (process.env.DB_SSL === 'true') config.ssl = true;

    return config;
  }

  poolConfig() {
    return {
      min: 0,
      max: 100,
      afterCreate: function (conn, done) {
        conn.query('SET timezone="UTC";');

        done()
      }
    }
  }

  typeCastValue(value) {
    if (!value) return value;

    if (value.constructor.name === 'Date') {
      return moment(value).format(DEFAULT_DATE_FORMAT);
    }

    if (value.toString() === '[object Object]') {
      return JSON.stringify(value);
    }

    return value;
  }

  async createDatabase(name) {
    const config = this.knexConfig();
    const client = this.createClient(knex({ ...config, connection: { ...config.connection, database: 'INFORMATION_SCHEMA' }}));

    await client.raw(`CREATE DATABASE IF NOT EXISTS ${name} CHARACTER SET utf8 COLLATE utf8_general_ci`);

    return true;
  }

  // TODO: replace with knex.ref when knex will release it
  columnFormatter(column) {
    return `\`${column}\``;
  }

  orderByClauseWithNulls(column, direction, nullsOrder) {
    const columnClause = this.formatColumn(column);
    const directionClause = direction.toUpperCase();

    if (nullsOrder === 'first') {
      return `${columnClause} IS NULL ${directionClause}, ${columnClause} ${directionClause}`;
    } else {
      return `-${columnClause} ${directionClause}`;
    }
  }

  caseInsensitiveLikeClause() {
    return 'LIKE';
  }

  regexpClause() {
    return 'REGEXP';
  }

  notLikeCondition(column, value) {
    return db.client.raw(`${column} NOT ${db.client.caseInsensitiveLikeClause()} '%${value}%'`);
  }

  groupConcatClauseForRTLSearches(rtlTableName) {
    return `GROUP_CONCAT(IFNULL(${rtlTableName}.target_record_id, '') ORDER BY ${rtlTableName}.target_record_id ASC)`;
  }

  applyOrderByForArrayString(scope, field, direction) {
    // TODO: implement more efficient solution - https://redmine.nasctech.com/issues/60596

    const options = parseOptions(field.options);
    const values = options.multi_select ? objectMatrix(options.values) : options.values;
    const keys = sortBy(toPairs(values), ([_, value]) => value).map(([key]) => `'${key}'`);

    scope.orderByRaw(`FIELD (\`${scope.tableName}\`.\`${field.alias}\`, ${keys.join(',')}) ${direction}`);
  }

  applyOrderByForReference(scope, field, direction) {
    this.applyOrderByForReferenceWithDecorator(scope, field, direction, (replaceColumn) => replaceColumn);
  }

  applyOrderByForRTL(scope, field, direction) {
    const aggFunc = `group_concat(__label_${field.alias}, ', ') AS ${field.alias}`;
    this.applyOrderByForRTLBase(scope, field, direction, aggFunc);
  }

  processSelectResponse(response) {
    return response[0];
  }

  async getCount(scope) {
    const query = `
      SELECT COUNT(*) 'count'
      FROM (${scope.toString()}) as count
    `;

    const [{ count }] = await this.rawSelect(query)

    return count;
  }

  async getRowSiblings(scope, rowId) {
    const countingSubQuery = `
      SELECT @rownum1 := @rownum1 + 1 AS row_number, id
      FROM (${scope.toString()}) AS query, (SELECT @rownum1 := 0) r
    `;

    const countSelectionSubQuery = `
      SELECT id, row_number
      FROM (${countingSubQuery}) AS count_selection
    `;

    const rowSelectionSubQuery = `
      SELECT row_selection_scope.row_number
      FROM (${countingSubQuery}) AS row_selection_scope
      WHERE row_selection_scope.id = ${rowId}
    `;

    const getRowQuery = position => `
      SELECT counting_scope.id AS id
      FROM (${countSelectionSubQuery}) AS counting_scope
      WHERE counting_scope.row_number ${position === 'prev' ? '<' : '>'} (${rowSelectionSubQuery})
      ${position === 'prev' ? 'ORDER BY counting_scope.row_number DESC' : ''}
      LIMIT 1
    `;

    const [prevRow] = await this.rawSelect(getRowQuery('prev'));
    const [nextRow] = await this.rawSelect(getRowQuery('next'));

    return {
      prev_row_id: prevRow ? prevRow.id : null,
      next_row_id: nextRow ? nextRow.id : null,
    };
  }

  async getTableNames() {
    const [ rows ] = await db.client.raw(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_type='BASE TABLE'
      AND table_schema = '${process.env.DB_NAME}';
    `);

    return map(rows, 'table_name');
  }

  async setBooleanDefault(tableName, columnName, defaultValue) {
    defaultValue = isBoolean(defaultValue) ? { false: 0, true: 1 }[defaultValue] : 0;

    return db.client.schema.raw(`ALTER TABLE \`${tableName}\` CHANGE \`${columnName}\` \`${columnName}\` TINYINT DEFAULT ${defaultValue} NOT NULL`);
  }

  processAgregates(fieldAs, agrFunc, columnName, order) {
    return `substring_index(group_concat(${columnName} order by ${order}), ',', 1 ) as ${fieldAs}`;
  }

  greatest(...columns){
    return `GREATEST(${columns.join(',')})`
  }

  least(...columns){
    return `LEAST(${columns.join(',')})`
  }
}
