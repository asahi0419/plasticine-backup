import {
  cloneDeep,
  isEqual,
  isArray,
  flatten,
  uniqWith,
  uniq,
  reject,
  reduce,
  each,
  sum,
  map,
  keyBy,
} from 'lodash-es';

import db from '../../index.js';

export default class TableBuilder {
  constructor(tableName, client) {
    this.tableName = tableName;
    this.client = client;

    this.selectedColumns = [];
    this.clauses = [];
    this.froms = [];

    this.limitValue = null;
    this.offsetValue = null;
  }

  clone() {
    const builder = new TableBuilder(this.tableName, this.client);

    return this.__cloneBuilder(builder);
  }

  distinct(...args) {
    this.clauses.push({ type: 'distinct', args });
    return this;
  }

  clearSelect() {
    this.selectedColumns = [];
    return this;
  }

  clearClause(type) {
    this.clauses = reject(this.clauses, { type });
    return this;
  }

  select(...args) {
    this.selectedColumns = flatten(args);
    return this;
  }

  from(...args) {
    this.clauses.push({ type: 'from', args });
    return this;
  }

  where(...args) {
    this.clauses.push({ type: 'where', args });
    return this;
  }

  whereNull(...args) {
    this.clauses.push({ type: 'whereNull', args });
    return this;
  }

  whereNotNull(...args) {
    this.clauses.push({ type: 'whereNotNull', args });
    return this;
  }

  whereNot(...args) {
    this.clauses.push({ type: 'whereNot', args });
    return this;
  }

  whereIn(...args) {
    this.clauses.push({ type: 'whereIn', args });
    return this;
  }

  orWhereIn(...args) {
    this.clauses.push({ type: 'orWhereIn', args });
    return this;
  }

  whereNotIn(...args) {
    this.clauses.push({ type: 'whereNotIn', args });
    return this;
  }

  orWhere(...args) {
    this.clauses.push({ type: 'orWhere', args });
    return this;
  }

  orWhereNull(...args) {
    this.clauses.push({ type: 'orWhereNull', args });
    return this;
  }

  andWhere(...args) {
    this.clauses.push({ type: 'andWhere', args });
    return this;
  }

  whereRaw(...args) {
    this.clauses.push({ type: 'whereRaw', args });
    return this;
  }

  limit(value) {
    this.limitValue = value;
    return this;
  }

  offset(value) {
    this.offsetValue = value;
    return this;
  }

  orderBy(column, direction, options = {}) {
    if (options.nulls) {
      this.orderByRaw(this.client.orderByClauseWithNulls(column, direction, options.nulls));
    } else {
      this.clauses.push({ type: 'orderBy', args: [column, direction] });
    }

    return this;
  }

  orderByRaw(...args) {
    this.clauses.push({ type: 'orderByRaw', args });
    return this;
  }

  leftJoin(...args) {
    this.clauses.push({ type: 'leftJoin', args });
    return this;
  }

  rightJoin(...args) {
    this.clauses.push({ type: 'rightJoin', args });
    return this;
  }

  joinRaw(...args) {
    this.clauses.push({ type: 'joinRaw', args });
    return this;
  }

  groupBy(...args) {
    this.clauses.push({ type: 'groupBy', args });
    return this;
  }

  groupByRaw(...args) {
    this.clauses.push({ type: 'groupByRaw', args });
    return this;
  }

  havingRaw(...args) {
    this.clauses.push({ type: 'havingRaw', args });
    return this;
  }

  as(...args) {
    this.clauses.push({ type: 'as', args });
    return this;
  }

  pluck(...args) {
    this.clauses.push({ type: 'pluck', args });
    return this;
  }

  first(...args) {
    this.clauses.push({ type: 'first', args });
    return this;
  }

  sum(...args) {
    this.clauses.push({ type: 'sum', args });
    return this;
  }

  transacting(...args) {
    this.clauses.push({ type: 'transacting', args });
    return this;
  }

  toString() {
    return this.__buildKnexQuery().toString();
  }

  async count() {
    // const result = await this.client.raw(`select count(*) from (${this.__buildKnexQuery({ ignore: ['select'] }).toString()}) as query`);
    const result = await this.__buildKnexQuery({ ignore: ['select', 'distinct'] }).countDistinct(`${this.tableName}.id`);

    const countKey = this.client.provider === 'postgres' ? 'count' : 'count(`id`)';
    return sum(result.map(item => parseInt(item[countKey])));
  }

  async getOne() {
    return (await this.limit(1))[0];
  }

  insert(params) {
    const data = isArray(params)
      ? map(params, (record) => this.typeCastObject(record))
      : this.typeCastObject(params)

    return this.__buildKnexQuery().insert(data, 'id');
  }

  insertAndGetResult(params, result) {
    return this.__buildKnexQuery().insert(this.typeCastObject(params), result);
  }

  update(params) {
    return this.__buildKnexQuery().update(this.typeCastObject(params));
  }

  updateAndGetResult(params, result) {
    return this.__buildKnexQuery().update(this.typeCastObject(params), result);
  }

  typeCastObject(object) {
    if (this.fields) {
      const fields = keyBy(this.fields, 'alias')

      for (var key in object) {
        object[key] = this.client.typeCastValue(object[key], fields[key]);
      }
    }

    return object;
  }

  delete(...args) {
    return this.__buildKnexQuery().del(...args);
  }

  then(/* onFulfilled, onRejected */) {
    return this.__buildKnexQuery().then(...arguments);
  }

  map(callback) {
    return this.__buildKnexQuery().map(callback);
  }

  max(args) {
    return this.__buildKnexQuery().max(args);
  }

  __buildKnexQuery(options = {}) {
    options = { ignore: [], ...options };

    let baseQuery = this.client(this.tableName);

    if (!options.ignore.includes('select')) {
      const columns = [ ...this.selectedColumns ];
      const context = {
        preprocess: { fields: [] },
        postprocess: { fields: [] },
      };

      if (this.fields) {
        const aliases = columns.map((c = '') => {
          try {
            if (typeof c === 'object') {
              return c.sql;
            }

            const [ table, column ] = c.split('.')
            return column || table
          } catch (error) {
            return c
          }
        })
        const fields = this.fields.filter((f = {}) => aliases.includes(f.alias))

        for (let f of fields) {
          if (f.options.multi_select) {
            context.postprocess.fields.push(f);
          }
        }

        for (let f of this.fields) {
          if (db.schema.GEO_FIELDS.includes(f.type)) {
            context.preprocess.fields.push(f);
            context.postprocess.fields.push(f);
          }
        }
      }

      if (context.preprocess.fields.length) {
        if (!columns.length) columns.push(`${this.tableName}.*`);

        for (let f of context.preprocess.fields) {
          if (db.schema.GEO_FIELDS.includes(f.type)) {
            const geometry = this.client.getGeometry();
            columns.push(geometry.asGeoJSON(f.alias));
          }
        }
      }

      if (columns.length) {
        if (context.postprocess.fields.length) {
          baseQuery.queryContext(context);
        }

        baseQuery.select(columns);
      }
    }

    if (this.froms.length) {
      this.__applyFroms(this.froms);
    }

    uniqWith(this.clauses, isEqual).forEach(({ type, args }) => {
      if (!options.ignore.includes(type)) {
        baseQuery = baseQuery[type](...args);
      }
    });

    if (this.limitValue) baseQuery.limit(this.limitValue);
    if (this.offsetValue) baseQuery.offset(this.offsetValue);

    return baseQuery;
  }

  __cloneBuilder(builder) {
    builder.selectedColumns = cloneDeep(this.selectedColumns);
    builder.clauses = cloneDeep(this.clauses);
    builder.froms = cloneDeep(this.froms);

    builder.limitValue = cloneDeep(this.limitValue);
    builder.offsetValue = cloneDeep(this.offsetValue);

    return builder;
  }

  __applyFroms(froms) {
    const fromsByTable = reduce(froms, (result, nextFrom = {}) => {
      const prevFrom = result[nextFrom.tableName] || {};

      return {
        ...result,
        [nextFrom.tableName]: {
          columns: uniq([
            ...prevFrom.columns || [],
            ...nextFrom.columns || [],
          ]),
          joins: uniq([
            ...prevFrom.joins || [],
            ...nextFrom.joins || [],
          ]),
          where: uniq([
            ...prevFrom.where || [],
            ...nextFrom.where || [],
          ]),
          groupBy: uniq([
            ...prevFrom.groupBy || [],
            ...nextFrom.groupBy || [],
          ]),
        }
      };
    }, {});

    this.from(function () {
      each(fromsByTable, ({ columns, joins, where, groupBy }, tableName) => {
        if (this.client.config.client === 'pg') this.distinct();
        if (groupBy.length) this.groupBy(groupBy);

        this.select([ `${tableName}.*`, ...columns ]).from(tableName).as(tableName);

        each(joins, ({ type = 'left', tableName, onItems }) => {
          this[`${type}Join`](tableName, (builder) => {
            each(onItems, (item) => builder.on(item.left, '=', item.right));
          });
        });
        each(where, (clause, index) => (index === 0) ? this.where(clause) : this.orWhere(clause));
      });
    });
  }
}
