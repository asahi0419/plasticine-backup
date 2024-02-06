import { castArray, isEmpty, isUndefined, isBoolean } from 'lodash/lang';
import { flatten, findIndex } from 'lodash/array';
import { keyBy } from 'lodash/collection';
import { get, keys } from 'lodash/object';

import jsep from './jsep';
import { makeUniqueID } from '../../../../../../../helpers';

const OPERATORS = {
  '==': 'is',
  '!=': 'is_not',
  '<': 'less_than',
  '>': 'greater_than',
  '<=': 'less_than_or_is',
  '>=': 'greater_than_or_is',
}
const DATE_OPERATORS = {
  '==': 'on',
  '!=': 'not_on',
  '<': 'before',
  '>': 'after',
  '<=': 'before_on',
  '>=': 'after_on',
}
const INVERSE_OPERATORS = {
  'in': 'not_in',
  'in_strict': 'not_in_strict',
  'in_having': 'not_in_having',
  'contains': 'does_not_contain',
  'starts_with': 'does_not_start_with',
  'ends_with': 'does_not_end_with',
  'belongs_to_group': 'does_not_belongs_to_group',
  'less_than': 'greater_than',
  'greater_than': 'less_than',
  'less_than_or_is': 'greater_than_or_is',
  'greater_than_or_is': 'less_than_or_is',
  'before_on': 'after_on',
  'after_on': 'before_on',
}
const METHOD_OPERATORS = {
  includes: 'contains',
  startsWith: 'starts_with',
  endsWith: 'ends_with',
}
const GET_VALUE_ALIAS = '__getValue';
const CURRENT_USER_ALIAS = '__currentUser';
const NEW_DATE_ALIAS = '__newDate';

export default class ScriptParser {
  constructor(fields = []) {
    this.setFields(fields);
  }

  setFields(fields) {
    this.fieldsMap = keyBy(fields, 'alias');
  }

  process(script) {
    script = (script || '').trim();
    if (!script) return [];
    if (isEmpty(this.fieldsMap)) return null;

    const preparedScript = script
      .replace(/p.record.getValue\(/g, `${GET_VALUE_ALIAS}(`)
      .replace(/p.currentUser\./g, `${CURRENT_USER_ALIAS}.`)
      .replace(/new Date\(/g, `${NEW_DATE_ALIAS}(`)
      .replace(/(\[[^\[]+?\])/g, '($1)')
      .replace(/(\'[^\']+?\')\./g, '($1).').replace(/(\"[^\"]+?\")\./g, '($1).');

    try {
      const tree = jsep(preparedScript);
      return !isEmpty(tree) && this.extractOrGroups(tree).map(groupTree => this.normalizeGroup(groupTree));
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  hasGroups(tree) {
    if (!tree.right || !tree.left) return false;
    return tree.right.group || tree.left.group ||
      get(tree, 'left.left.group') || get(tree, 'left.right.group') ||
      get(tree, 'right.left.group') || get(tree, 'right.right.group');
  }

  extractOrGroups(tree) {
    if (tree.operator === '||' && this.hasGroups(tree)) {
      return flatten([this.extractOrGroups(tree.left), this.extractOrGroups(tree.right)]);
    } else {
      return [tree];
    }
  }

  normalizeGroup(tree) {
    return { items: castArray(this.visit(tree, 'and')) }
  }

  visit(tree, itemOperator) {
    itemOperator = itemOperator === '&&' ? 'and' : (itemOperator === '||' ? 'or': itemOperator);

    switch (tree.type) {
      case 'LogicalExpression':
        return flatten([
          this.visit(tree.left, itemOperator),
          this.visit(tree.right, tree.operator),
        ]);
      case 'BinaryExpression':
        return { ...this._binaryExpression(tree), itemOperator };
      case 'CallExpression':
        return { ...this._callExpression(tree), itemOperator };
      case 'UnaryExpression':
        return { ...this._unaryExpression(tree), itemOperator };
      case 'Literal':
        return { ...this._literal(tree), itemOperator };
      case 'Identifier':
        this.throwError('Unsupported Identifier');
      default:
        this.throwError('Unsupported type: ' + tree.type);
    }
  }

  _binaryExpression(node) {
    const field = this._getField(node.left);
    const value = this._getValue(node.right); // or js-expression
    const invertedField = this._getField(node.right);
    const invertedValue = this._getValue(node.left); // or js-expression
    const invertedOperator = invertedField && INVERSE_OPERATORS[this._getOperator(node.operator, invertedField)];

    if (field && !isUndefined(value)) {
      return {
        id: makeUniqueID(),
        operator: this._getOperator(node.operator, field),
        field,
        value,
      }
    } else if (field && this._nodeIsCurrentUser(node.right) && node.right.arguments[0].value === 'id') {
      return {
        id: makeUniqueID(),
        operator: (node.operator === '==') ? 'is_current_user' : 'is_not_current_user',
        field,
        value: null,
      }
    } else if (invertedField && invertedOperator && !isUndefined(invertedValue)) { // between operator
      return {
        id: makeUniqueID(),
        operator: invertedOperator,
        field: invertedField,
        value: invertedValue,
      }
    } else {
      this.throwError('Unsupported BinaryExpression');
    }
  }

  _callExpression(node) {
    if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'includes') {
      return this._includes(node.arguments[0], node.callee.object);
    } else if (node.callee.type === 'MemberExpression' && keys(METHOD_OPERATORS).includes(node.callee.property.name)) {
      return this._method(node.arguments[0], node.callee.object, node.callee.property.name);
    } else if (node.callee.object && this._nodeIsCurrentUser(node)) {
      return this._currentUserExpression(node.callee.property.name, node.arguments[0]);
    } else if (this._nodeIsField(node)) {
      return this._boolean(node);
    } else {
      this.throwError('Unsupported Callee for CallExpression');
    }
  }

  _unaryExpression(node) {
    if (node.operator !== '!') this.throwError('Unsupported operator for UnaryExpression');

    if (this._nodeIsField(node.argument)) {
      return this._fieldIsEmpty(node.argument);
    } else if (this._nodeIsField(node.argument.argument)) {
      return {
        id: makeUniqueID(),
        field: this._getField(node.argument.argument),
        operator: 'is_not_empty',
      }
    } else if (node.argument.type === 'CallExpression') {
      const item = this.visit(node.argument);
      return { ...item, operator: INVERSE_OPERATORS[item.operator] };
    } else {
      this.throwError('Unsupported UnaryExpression');
    }
  }

  _literal(node) {
    if (isBoolean(node.value)) {
      return {
        id: makeUniqueID(),
        field: this.fieldsMap[node.value],
      }
    } else {
      this.throwError('Unexpected Literal expression');
    }
  }

  _includes(argument, object) {
    if (this._nodeIsField(argument)) {
      // in, contains_one_of (rtl)
      const field = this._getField(argument);
      const operator = field.type === 'reference_to_list' ? 'contains_one_of' : 'in';

      return {
        id: makeUniqueID(),
        field: this._getField(argument),
        operator: operator,
        value: this._getValue(object),
      }
    } else if (this._nodeIsField(object)) {
      // contains
      return this._method(argument, object, 'includes');
    } else {
      this.throwError('Unexpected object for `includes` method');
    }
  }

  _method(argument, object, method) {
    if (this._nodeIsField(object)) {
      return {
        id: makeUniqueID(),
        field: this._getField(object),
        operator: METHOD_OPERATORS[method],
        value: this._getValue(argument),
      }
    }
  }

  _boolean(node) {
    const field = this._getField(node);
    return {
      id: makeUniqueID(),
      field,
      operator: 'is',
      value: true,
    }
  }

  _fieldIsEmpty(node) {
    const field = this._getField(node);
    return (field.type === 'boolean') ?
      {
        id: makeUniqueID(),
        field,
        operator: 'is',
        value: false,
      } : {
        id: makeUniqueID(),
        field,
        operator: 'is_empty',
      };
  }

  _nodeIsField(node) {
    return node && node.type === 'CallExpression' && node.callee.name === GET_VALUE_ALIAS;
  }

  _nodeIsCurrentUser(node) {
    return node.callee.object.name === CURRENT_USER_ALIAS;
  }

  _getField(node) {
    if (!this._nodeIsField(node)) return;
    if (node.arguments[0].type !== 'Literal') this.throwError('Field alias is not Literal');
    const fieldAlias = node.arguments[0].value;
    if (this.fieldsMap[fieldAlias]) return this.fieldsMap[fieldAlias];
    else this.throwError(`Field '${fieldAlias}' not found`);
  }

  _getValue(node) {
    if (node.type === 'ArrayExpression') {
      return node.elements.map((item) => item.value)
    } else if (node.type === 'Literal') {
      return node.value;
    } else if (node.type === 'CallExpression' && node.callee.name === NEW_DATE_ALIAS) {
      return node.arguments[0].value;
    }
  }

  _getOperator(nodeOperator, field) {
    return (field && field.type === 'datetime') ? DATE_OPERATORS[nodeOperator] : OPERATORS[nodeOperator];
  }

  _currentUserExpression(calleeName, argument) {
    const OPERATORS = {
      isBelongsToWorkgroup: 'belongs_to_group',
      isAdmin: 'has_administrator_privilege',
      canAtLeastRead: 'has_read_privilege',
      canAtLeastWrite: 'has_read_write_privilege',
    };

    if (calleeName === 'isBelongsToWorkgroup' && this._nodeIsField(argument)) {
      return {
        id: makeUniqueID(),
        field: this._getField(argument),
        operator: 'contains_current_user',
        value: null,
      }
    } else if (OPERATORS[calleeName]) {
      return {
        id: makeUniqueID(),
        field: this.fieldsMap['__current_user__'],
        operator: OPERATORS[calleeName],
        value: argument ? argument.value : null,
      }
    } else {
      this.throwError(`Unsupported currentUser method '${calleeName}'`);
    }
  }

  throwError(message) {
    var error = new Error(message);
    error.description = message;
    throw error;
  }
}
