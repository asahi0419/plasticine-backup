import knex from 'knex';
import knexPostgis from 'knex-postgis';
import { map, reduce, each, some, isBoolean, isNull, isArray, isPlainObject } from 'lodash-es';

import db from '../index.js';
import BaseDriver from './base.js';
import { parseOptions } from '../../../business/helpers/index.js';

export default class PostgresDriver extends BaseDriver {
  constructor() {
    super();
    this.client = 'pg';
    this.provider = 'postgres';
  }

  connectionConfig() {
    const config = {
      host: process.env.DB_HOST || 'postgres',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'plasticine',
      password: process.env.DB_PASS || 'plasticine_password',
      database: process.env.DB_NAME || 'plasticine',
      timezone: process.env.DB_TZ || 'UTC',
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
        conn.query('CREATE EXTENSION IF NOT EXISTS postgis;');

        done()
      }
    }
  }

  async createDatabase(name) {
    const config = this.knexConfig();
    const client = this.createClient(knex({ ...config, connection: { ...config.connection, database: 'postgres' }}));

    const { rows } = await client.raw(`SELECT * FROM pg_database WHERE datname = '${name}'`);

    if (rows.length) {
      return true;
    } else {
      await client.raw(`CREATE DATABASE ${name};`);

      return false;
    }
  }

  postProcessResponse(result, queryContext = {}) {
    const { fields = [] } = queryContext.postprocess || {};
    if (!fields.length) return result

    if (isPlainObject(result) || (isArray(result) && some(result, isPlainObject))) {
      const records = isPlainObject(result) ? [ result ] : result;

      for (let r of records) {
        for (let f of fields) {
          switch (f.type) {
            case 'array_string':
              if (r[f.alias]) {
                r[f.alias] = JSON.parse(`[${r[f.alias].replace(/[{}]/g, '').replace(/'/g, '"')}]`);
              } else {
                r[f.alias] = [];
              }
              break;
            case 'geo_point':
            case 'geo_line_string':
            case 'geo_polygon':
              if (r[f.alias]) {
                const value = parseOptions(r[f.alias], { silent: true });
                if (value.coordinates) r[f.alias] = value.coordinates;
              }
              break;
            case 'geo_geometry':
              if (r[f.alias]) {
                r[f.alias] = parseOptions(r[f.alias], { silent: true });
              }
              break;
          }
        }
      }
    }

    return result
  }

  typeCastValue(value, field = {}) {
    if (db.schema.GEO_FIELDS.includes(field.type)) {
      if (!value) return null;

      const g = db.client.getGeometry();
      const v = isPlainObject(value) ? value : parseOptions(value);

      switch (field.type) {
        case 'geo_point':
          return g.geomFromGeoJSON({ type: 'Point', coordinates: v });
        case 'geo_line_string':
          return g.geomFromGeoJSON({ type: 'LineString', coordinates: v });
        case 'geo_polygon':
          return g.geomFromGeoJSON({ type: 'Polygon', coordinates: v });
        case 'geo_geometry':
          return g.geomFromGeoJSON(JSON.stringify(v));
      }
    }

    if (field.type === 'array_string') {
      if (field.options.multi_select) {
        if (isArray(value)) {
          return value.length
            ? value.map(v => `'${v.trim().replace(/\'(.*)\'/,'$1')}'`).sort().join(',')
            : null;
        }
      }
    }

    return value;
  }

  columnFormatter(column) {
    return `"${column}"`;
  }

  orderByClauseWithNulls(column, direction, nullsOrder) {
    const nullsOrderClause = nullsOrder === 'first' ? 'first' : 'last';
    return `${this.formatColumn(column)} ${direction} nulls ${nullsOrderClause}`;
  }

  caseInsensitiveLikeClause() {
    return 'ilike';
  }

  regexpClause() {
    return '~';
  }

  notLikeCondition(column, value) {
    return db.client.raw(`COALESCE(${column}, '') NOT ${db.client.caseInsensitiveLikeClause()} '%${value}%'`);
  }

  rtlFromClause(field, modelTableName, rtlTableName, asRTLTableName) {
    return {
      tableName: modelTableName,
      joins: [{
        tableName: rtlTableName + ' AS ' + asRTLTableName,
        onItems: [
          {
            left: `${asRTLTableName}.source_field`,
            right: field.id,
          },
          {
            left: `${asRTLTableName}.source_record_id`,
            right: `${modelTableName}.${field.__parentField ? field.__parentField.alias : 'id'}`,
          },
        ],
      }],
      groupBy: [ `${modelTableName}.id` ],
    };
  }

  arrayStringToArrayFromClause(scope = {}, field = {}, asFieldAlias, humanize) {
    const replaceArrayValues = (string, values) => {
      return humanize ? reduce(values, (result, value, key) => {
        return `array_replace(${result}, '${key}', '${value}')`;
      }, string) : string;
    };

    const { values = {} } = parseOptions(field.options);
    const { tableName, joins } = scope;

    const model = db.model(field.model);
    const column = `${model.tableName}.${field.alias}`;
    const arrayString = `string_to_array(${column}, ',')`;
    const columnFunction = `${replaceArrayValues(arrayString, values)} as ${asFieldAlias}`;

    return {
      tableName,
      joins,
      columns: [ db.client.raw(columnFunction) ],
      groupBy: [
        `${tableName}.id`,
        `${tableName}.__inserted`,
        column,
      ],
    };
  }

  applyOrderByForArrayString(scope, field, direction) {
    const asFieldAlias = `__label_${field.alias}`;

    scope.froms.push(this.arrayStringToArrayFromClause(scope, field, asFieldAlias, true));
    scope.orderBy(`${scope.tableName}.${field.alias}`, direction);
  }

  applyOrderByForReference(scope, field, direction) {
    this.applyOrderByForReferenceWithDecorator(scope, field, direction, (replaceColumn) => `${replaceColumn}::text`);
  }

  applyOrderByForRTL(scope, field, direction) {
    const aggFunc = `string_agg(__label_${field.alias}::text, ', ' order by __label_${field.alias}) AS ${field.alias}`;
    this.applyOrderByForRTLBase(scope, field, direction, aggFunc);
  }

  processSelectResponse(response) {
    return response.rows;
  }

  async getCount(scope) {
    return scope.count();
  }

  getGeometry() {
    return knexPostgis(db.client);
  }

  async getRowSiblings(scope, rowId) {
    const [result] = await this.rawSelect(`
      SELECT prev_row_id, next_row_id
      FROM (
        SELECT
          DISTINCT id AS curr_row_id,
          LEAD(id) OVER (ORDER BY counter DESC) AS prev_row_id,
          LAG(id) OVER (ORDER BY counter DESC) AS next_row_id
        FROM (
          SELECT row_number() over() AS counter, id
          FROM (${scope.toString()}) AS query
        ) AS counted
      ) AS selection
      WHERE curr_row_id = ${rowId}
    `);

    return result;
  }

  async getTableNames() {
    const { rows } = await db.client.raw(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_type='BASE TABLE'
      AND table_schema='public';
    `);

    return map(rows, 'table_name');
  }

  async setBooleanDefault(tableName, columnName, defaultValue) {
    if (!(isBoolean(defaultValue) || isNull(defaultValue))) defaultValue = 'FALSE';

    return db.client.schema.raw(`ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET DEFAULT ${defaultValue}`);
  }

  processAgregates(fieldAs, agrFunc, columnName, order) {
    return `(array_agg(${columnName} order by ${order}))[1] as ${fieldAs}`;
  }

  greatest(...columns){
    return `GREATEST(${columns.join(',')})`
  }

  least(...columns){
    return `LEAST(${columns.join(',')})`
  }
}
