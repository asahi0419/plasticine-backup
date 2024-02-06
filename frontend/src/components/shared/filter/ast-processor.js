import lodash from 'lodash'

import Messenger from '../../../messenger';
import { getExtractor } from './operators';
import { makeUniqueID, parseOptions } from '../../../helpers';

export default class AstTreeProcessor {
  constructor(fields, params = {}) {
    this.fields = lodash.cloneDeep(fields);
    this.content = [];
    this.params = { silent: true, ...params }
  }

  process(tree) {
    !lodash.isEmpty(tree) && this.extractOrGroups(tree).map(groupTree => this.normalizeGroup(groupTree));

    return this;
  }

  extractOrGroups(tree) {
    if (tree.operator === 'or' && tree.right.group && (tree.left.group || tree.left.group === undefined)) {
      return lodash.flatten([this.extractOrGroups(tree.left), this.extractOrGroups(tree.right)]);
    } else {
      return [tree];
    }
  }

  normalizeGroup(tree) {
    this.content.push({ items: lodash.castArray(this.visit(tree, 'and')) });
  }

  visit(tree, itemOperator) {
    return this[tree.type](tree, itemOperator);
  }

  operation(tree, itemOperator) {
    return lodash.flatten([
      this.visit(tree.left, itemOperator),
      this.visit(tree.right, tree.operator),
    ]);
  }

  expression(node, itemOperator) {
    if (node.error && !this.params.silent) Messenger.error({ header: node.error.header, content: node.error.content });

    const field = this.extractField(node);
    const fieldOptions = parseOptions(field.options);
    const mode = node.field.__mode;

    let rawValue = node.rawValue;
    let value = field && field.type === 'reference_to_list' ? node.value : node.rawValue;
    value = field && field.type === 'datetime' ? node.value : value;
    let humanizedValue = node.humanizedValue;
    if (lodash.isArray(node.value) && value.length === 2 && field.type === 'reference' && node.field.__alias.startsWith('__qs__')) {
      humanizedValue = node.rawValue
    }

    let operator = 'is';
    if (field) {
      let extractor = getExtractor(field.type);

      if (field.type === 'array_string') {
        if (fieldOptions.multi_select) {
          extractor = getExtractor('reference_to_list');
        }
      }

      if (extractor) operator = extractor(node.operator, value, mode);
    }

    if ([
      'starts_with',
      'does_not_start_with',
      'ends_with',
      'does_not_end_with',
      'contains',
      'does_not_contain',
      'like',
      'not_like',
    ].includes(operator)) {
      value = value.replace(/%/g, '');
      rawValue = value.replace(/%/g, '');
      humanizedValue = String(humanizedValue).replace(/%/g, '');
    }

    return { id: makeUniqueID(), field, operator, rawValue, value, humanizedValue, itemOperator };
  }

  extractField(node) {
    const fieldsMap = lodash.keyBy(this.fields, 'alias');

    const field = {
      ...fieldsMap[node.field.alias.replace(/(\.__qs__.*$)|(^__qs__)/, '')],
      __alias: node.field.__alias,
      __mode: node.field.__mode,
    };

    if (node.field.__parentField || node.field.__templatedField) {
      node.field.__parentField && lodash.assign(field, {
        ...node.field,
        name: `${node.field.__parentField.name}.${node.field.name}`,
        alias: `${node.field.__parentField.alias}.${node.field.alias}`,
        referenced: true,
      });
      node.field.__templatedField && lodash.assign(field, {
        ...node.field,
        name: `T.${node.field.__templatedField.name}`,
        alias: `${node.field.__templatedField.alias}.${node.field.alias}`,
        templated: true,
      });

      const childFieldIndex = lodash.findIndex(this.fields, { name: node.field.name });
      this.fields.splice(childFieldIndex, 0, lodash.omit(field, ['__alias']));
    }

    return field;
  }
}
