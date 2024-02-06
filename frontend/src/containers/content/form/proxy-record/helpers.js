import { isEmpty } from 'lodash/lang';
import { each, find, filter, reduce } from 'lodash/collection';

import humanizer from './humanizer';
import { parseOptions } from '../../../../helpers';

const processFieldsConditions = (parent, tree, fields) => {
  const parentField = find(fields, { id: parent.f });
  const children = filter(tree, { p: parent.f });

  if (parentField.virtual && !isEmpty(children)) {
    each(children, (child) => {
      const childField = find(fields, { id: child.f });

      const { required_when_script: f_req, readonly_when_script: f_rea, hidden_when_script: f_hid } = parentField;
      const { required_when_script: c_req, readonly_when_script: c_rea, hidden_when_script: c_hid, type } = childField;

      childField.required_when_script = c_req ? `(${f_req}) || (${c_req})` : f_req;
      childField.readonly_when_script = c_rea ? `(${f_rea}) || (${c_rea})` : f_rea;
      childField.hidden_when_script   = c_hid ? `(${f_hid}) || (${c_hid})` : f_hid;

      processFieldsConditions(child, tree, fields);
    });
  }
}

export const processTemplateFields = (fields, field, value, sandbox) => {
  if (!value) return [];

  const tree = filter(parseOptions(value).attr, ({ f }) => find(fields, { id: f }));
  const parentFields = filter(tree, ({ p }) => (p === -1));

  each(parentFields, parent => processFieldsConditions(parent, tree, fields));
  each(fields, (f) => field.readonly_when_script && (f.readonly_when_script = field.readonly_when_script));

  return filter(fields, (f) => !sandbox.executeScript(f.hidden_when_script, { modelId: f.model }, `field/${f.id}/hidden_when_script`));
}

export const humanizeAttributes = (attributes, fields) => {
  // processed inside abstract reference component (async value)
  const OMIT_TYPES = ['reference', 'reference_to_list', 'global_reference'];

  return reduce(attributes, (result, value, alias) => {
    const field = find(fields, { alias });
    if (!field) return result;
    if (OMIT_TYPES.includes(field.type)) return result;
    return { ...result, [alias]: humanizer(field)(value) };
  }, {});
};
