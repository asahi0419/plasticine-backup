import { keyBy, filter } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import { FilterError } from '../../error/index.js';

const SUPPORTED_TYPES_FOR_AGGREGATION = ['string', 'datetime', 'integer', 'float'];

export default class Sorter {
  constructor(model, fields, sandbox) {
    this.model = model;
    this.fields = fields;
    this.tableName = db.model(model).tableName;
    this.sandbox = sandbox
  }

  apply(ordering) {
    if (!this.fields) this.fields = db.getFields({ model: this.model.id });

    this.ordering = this.processOrdering(ordering, this.fields);
    return this;
  }

  async to(scope) {
    this.scope = scope;

    const fieldsMap = keyBy(this.fields, 'alias');

    this.ordering.forEach(({ column, direction }) => {
      if(!column) return; // todo at tests fieldMap not have core fields, check it

      const field = fieldsMap[column];
      if (field) this.applyColumnOrder(field, direction)
      else this.applyAggregated(column, direction);
    });

    if (fieldsMap.id) this.scope.orderBy(`${this.tableName}.id`, 'asc');

    return { scope };
  }

  applyColumnOrder(field, direction) {
    switch (field.type) {
      case 'array_string':
        db.client.applyOrderByForArrayString(this.scope, field, direction);
        break;
      case 'reference':
        db.client.applyOrderByForReference(this.scope, field, direction);
        break;
      case 'reference_to_list':
        db.client.applyOrderByForRTL(this.scope, field, direction);
        break;
      default:
        const nullPosition = direction === 'desc' ? 'LAST' : 'FIRST';
        this.scope.orderByRaw(`${this.tableName}.${field.alias} ${direction} NULLS ${nullPosition}`);
    }
  }

  applyAggregated(column, direction){
    this.scope.orderByRaw(`${column} ${direction}`)
  }

  processOrdering(ordering, fields) {
    if (ordering === '') return [];
    const GREATER = '>';
    const fieldsMap = keyBy(fields, 'alias');

    return ordering.split(',').map((order) => {
      const result = { direction: '', columns: [], aggregate: { fn: null, columns: [], type: null } };
      const matches = order.matchAll(/(-?)(>?)(<?)(\w+)/g);

      for (const match of matches) {
        const [ _, direction, greater, least, column ] = match;
        const field = fieldsMap[column];

        if (direction) result.direction = direction;
        if (greater || least) result.aggregate.fn = greater || least;

        if (field) {
          if (result.aggregate.fn) {
            if (!result.aggregate.type) result.aggregate.type = field.type;
            if (result.aggregate.type && field.type !== result.aggregate.type)
              throw new FilterError(this.sandbox.translate('static.aggregate_field_type_error', {
                typeOne: result.aggregate.type,
                typeTwo: field.type
              }));

            result.aggregate.columns.push(column);
          } else result.columns.push(column);
        }
      }

      const direction = result.direction === '-' ? 'desc' : 'asc';

      if (result.aggregate.fn) {
        const aggregator = result.aggregate.fn === GREATER ? db.client.greatest : db.client.least;

        const supportedTableColumns = filter(result.aggregate.columns, column => {
          const field = fieldsMap[column];
          return SUPPORTED_TYPES_FOR_AGGREGATION.includes(field.type);
        });

        return { direction, column: aggregator(...supportedTableColumns) };
      } else {
        return { direction, column: result.columns[0] };
      }
    });
  }
}
