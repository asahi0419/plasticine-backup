import { isString } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import parseFilter from '../../../../filter/parser.js';
import { deJSify } from '../../../../filter/processor/visitors/expression.js';
import { parseOptions } from '../../../../helpers/index.js';

export const filterToPlainObject = async (filterString, context) => {
  const object = {};

  if (!filterString) return object;

  await iterateFilterTree(parseFilter(filterString, context.sandbox), async (node) => {
    const model = db.getModel(context.model.alias);
    const field = db.getField({ model: model.id, alias: node.column });

    if (node.operator === '=') object[node.column] = await deJSify(field, node.value, context);

    if (isString(object[node.column])) {
      if (['integer', 'primary_key', 'reference'].includes(field.type)) {
        object[node.column] = parseInt(object[node.column]);
      }

      if (field.type === 'float') {
        object[node.column] = parseFloat(object[node.column]);
      }

      if (field.type === 'array_string') {
        const { multi_select: multi } = parseOptions(field.options);
        if (multi) object[node.column] = object[node.column].split(',');
      }

      if (field.type === 'reference_to_list') {
        object[node.column] = object[node.column].split(',');
      }

      if (field.type === 'global_reference') {
        const [ modelId, recordId ] = object[node.column].split('/');

        if (modelId && recordId) {
          object[node.column] = { id: recordId, model: modelId };
        } else {
          object[node.column] = parseInt(object[node.column]);
        }
      }

      if (field.type === 'boolean') {
        object[node.column] = { 'true': true, 'false': false, 'null': null }[object[node.column]];
      }
    }
  });

  return object;
};

const iterateFilterTree = async (node, nodeVisitorFn) => {
  if (node.operator.toLowerCase() === 'or') return;

  if (node.left.type === 'column_ref') {
    const value = node.right.type === 'expr_list' ? node.right.value.map(expr => expr.value) : node.right.value;
    await nodeVisitorFn({ column: node.left.column, operator: node.operator, value });
  } else {
    await iterateFilterTree(node.left, nodeVisitorFn);
    await iterateFilterTree(node.right, nodeVisitorFn);
  }
};
