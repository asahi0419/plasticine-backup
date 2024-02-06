import { compact } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import { parseOptions, isPatternMode } from '../../../../helpers/index.js';
import { FilterError } from '../../../../error/index.js';
import ConcatenatedField from './concatenated.js';

const DISABLED_FIELD_TYPES = ['journal', 'fa_icon'];

export default async (columnNode, context) => {
  if (columnNode.type === 'bool' && columnNode.value === true) {
    return {
      id: 0,
      type: 'true_stub',
      alias: 'true_stub',
      name: '--- ASSERT',
      model: context.model.id,
      __alias: 'true_stub',
    };
  }

  if (columnNode.type !== 'column_ref') {
    throw new FilterError(context.sandbox.translate('static.syntax_error'));
  }

  const field = columnNode.table
    ? await extractNested(columnNode, context)
    : extractSimple(columnNode, context);

  if (!field) {
    const columnName = compact([columnNode.table, columnNode.column]).join('.');
    throw new FilterError(context.sandbox.translate('static.unknown_filter_field', { field: columnName }));
  }

  if (DISABLED_FIELD_TYPES.includes(field.type)) {
    throw new FilterError(context.sandbox.translate('static.field_type_is_disabled_in_filters', { type: field.type }));
  }

  const mode = extractMode(columnNode.column);
  if (mode) {
    field.__mode = mode;
  }

  return field;
}

function extractMode(column) {
  const isMode = (prefix) => column.startsWith(prefix);
  if (isMode('__strict__')) return 'strict';
  if (isMode('__having__')) return 'having';
  return;
}

function extractSimple({ column }, context) {
  if (isPatternMode(column)) return new ConcatenatedField(column, context.model);
  if (column.startsWith('__dvf__')) return extractTemplated({ column }, context);

  const fieldAlias = column.replace(/^__qs__|__having__|__strict__/, '').toLowerCase();
  const field = context.fieldsMap[fieldAlias];
  if (!field) return;

  return { ...field, __alias: column };
}

async function extractNested({ table, column }, context) {
  const childFieldTable = table.replace(/^__qs__/, '');
  const parentField = context.fieldsMap[childFieldTable];
  if (!parentField) return;
  if (parentField.type !== 'reference') return;

  const { foreign_model } = parseOptions(parentField.options);

  const childFieldAlias = column.replace(/^__qs__|__having__|__strict__/, '').toLowerCase();
  const childField = db.getField({ model: db.getModel(foreign_model).id, alias: childFieldAlias });
  if (!childField) return;

  return { ...childField, __parentField: parentField, __alias: `${table}.${column}` };
}

async function extractTemplated({ table, column }, context) {
  const [dvfAlias, dtfAlias, dataModelId, dataFieldAlias] = column.replace('__dvf__', '').split('/');
  const field = context.fieldsMap[dvfAlias];
  if (!field) return;

  const dataField = db.getField({ model: dataModelId, alias: dataFieldAlias });

  return { ...field, __templatedField: dataField, __alias: column };
}
