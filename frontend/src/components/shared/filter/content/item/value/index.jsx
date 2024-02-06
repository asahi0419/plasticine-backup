import React from 'react';
import * as Types from './types';

import { noValueOperators } from '../../../operators';

const INPUTS_MAP = {
  array_string: Types.ArrayString,
  autoincrement: Types.AutoIncrement,
  autonumber: Types.Autonumber,
  boolean: Types.Boolean,
  datetime: Types.DateTime,
  integer: Types.Integer,
  primary_key: Types.PrimaryKey,
  reference: Types.Reference,
  global_reference: Types.GlobalReference,
  reference_to_list: Types.ReferenceToList,
  string: Types.String,
  true_stub: Types.TrueStub,
  float: Types.Float,
  current_user: Types.Reference,
};

const USER_GROUP_OPERATORS = ['belongs_to_group', 'does_not_belongs_to_group'];

export default ({ model, field, operator, value, compact, onChange }) => {
  let Input = INPUTS_MAP[field.type] || Types.String;
  let fieldForInput = field;
  if (!Input) return null;

  if (noValueOperators.includes(operator)) return null;
  if (['reference'].includes(field.type) && ['in', 'not_in'].includes(operator)) Input = Types.ReferenceToList;

  if (USER_GROUP_OPERATORS.includes(operator)) {
    fieldForInput = { ...field, options: '{"foreign_model":"user_group","foreign_label":"{name}","view":"default"}' };
  }

  return (
    <Input
      model={model}
      field={fieldForInput}
      operator={operator}
      value={value}
      compact={compact}
      onChange={onChange}
    />
  );
}
