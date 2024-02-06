import Promise from 'bluebird';
import lodash from 'lodash';

import logger from '../../../logger/index.js';
import extractField from './field/extractor.js';
import processValue from './value-processors/index.js';
import getQueryOptions from './query-options-extractors/index.js';
import getValueHumanizer from '../../../record/humanizer/index.js';
import { FilterError } from '../../../error/index.js';
import { isJSValue, parseOptions } from '../../../helpers/index.js';

const OPERATOR_MAPPING = {
  is: '=',
};

export default async (node, context) => {
  const error = validateNode(node, context);
  if (error) throw new FilterError(error);

  const field = await extractField(node.left, context);
  const rawValue = simplifyValue(node.right.value);

  let operator = node.operator.toLowerCase();
  operator = lodash.isNull(rawValue) ? operator : (OPERATOR_MAPPING[operator] || operator);

  const jsRawValue = lodash.isArray(rawValue) && (operator !== 'between') ? rawValue[0] : rawValue;

  const newNode = {
    type: 'expression',
    operator,
    field,
    rawValue: isJSValue(jsRawValue) ? jsRawValue : rawValue,
    rawOperator: operator
  };

  const value = await deJSify(field, rawValue, context);
  newNode.value = await processValue(field, operator, value, context);

  // NOTE: temporary kludge solution to change operator if required
  // Process operator
  // switch (field.type) {
  //   case 'datetime':
  //     if (!lodash.isArray(value) && lodash.isArray(newNode.value)) {
  //       newNode.operator = 'between';
  //     }
  //     break;
  // }

  if (context.options.humanize) {
    newNode.humanizedValue = isJSValue(jsRawValue) ? jsRawValue : await humanizeValue(field, newNode.value, context);
  }

  if (context.options.withQueryOptions) {
    newNode.queryOptions = await getQueryOptions(field, newNode.operator, newNode.value, context, { datetime: { useIsoFormat: true } });
  }

  if (context.error) {
    newNode.error = context.error;
  }

  return newNode;
};

function validateNode(node, context) {
  const errors = [];

  if (node.right.value === 'ERROR_FILTER_DEPENDS_ON') {
    errors.push(context.sandbox.translate('static.filter_error_depends_on', { field: node.left.column }));
  }

  if (errors.length) return errors.join();
}

function simplifyValue(value) {
  return lodash.isArray(value) ? value.map(item => {
    return lodash.isUndefined(item.value) ? item.column : item.value;
  }) : value;
}

export async function deJSify(field, value, context) {
  return lodash.isArray(value)
    ? lodash.flatten(await Promise.map(value, (v) => evalValueExpression(field, v, context)))
    : evalValueExpression(field, value, context);
}

async function evalValueExpression(field, value, context) {
  const rules = {};

  try {
    let result = value;

    if (isJSValue(value)) {
      const expression = prepareJSExpression(value, rules);
      result = await context.sandbox.executeScript(expression, 'filter', { modelId: context.model.id });
    }

    if (result) {
      if (rules.startsWith) result = `%${result}`;
      if (rules.endsWith) result = `${result}%`;
    }

    return result;
  } catch (e) {
    const header = context.sandbox.translate('static.filter_error_statement_header', { fieldName: field.name });
    const content = context.sandbox.translate('static.filter_error_statement_content', { errorDescription: e.description });
    const error = `${header}\n${content}`;

    logger.error(error);
    context.error = { header, content };
  }
}

function prepareJSExpression(script, rules = {}) {
  let result = script
    .replace(/(js:)/, '')                 // remove js: label
    .replace(/{[a-zA-Z0-9_]+}/g, 'null'); // replace dynamic filters

  if (result.startsWith('%')) {
    result = result.slice(1)
    rules.startsWith = true;
  }
  if (result.endsWith('%')) {
    result = result.slice(0, result.length - 1)
    rules.endsWith = true;
  }

  return result || 'undefined';
}

async function humanizeValue(field, value, context) {
  const options = parseOptions(field.options);

  if (field.type === 'array_string') {
    if (options.multi_select) return calculateHumanizedValue(field, value, context);
  }

  if (field.type === 'reference_to_list') {
    return calculateHumanizedValue(field, value, context);
  }

  return lodash.isArray(value)
    ? Promise.map(value, (v) => calculateHumanizedValue(field, v, context))
    : (await calculateHumanizedValue(field, value, context));
}

function calculateHumanizedValue(field, value, context) {
  if (isJSValue(value)) return value;
  if (lodash.isString(value) && value.includes('%')) return String(value).replace(/%/g, '');

  if (lodash.isDate(value) || field.type === 'datetime') {
    return getValueHumanizer(field, context.sandbox)(value, { useGlobalFormat: true });
  }

  return getValueHumanizer(field, context.sandbox)(value);
}
