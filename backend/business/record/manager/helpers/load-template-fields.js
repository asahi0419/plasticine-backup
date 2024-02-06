import { isEmpty, map, each, find, filter } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import { parseOptions } from '../../../helpers/index.js';

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

export default async (field = {}, value, sandbox) => {
  const tree = parseOptions(value).attr;

  const fields = await db.model('field').whereIn('id', map(tree, 'f'));
  const parentFields = filter(tree, ({ p }) => p === -1);

  each(parentFields, parent => processFieldsConditions(parent, tree, fields));
  each(fields, (f) => field.readonly_when_script && (f.readonly_when_script = field.readonly_when_script));

  return filter(fields, (f) => !sandbox.executeScript(
    f.hidden_when_script,
    `condition_script`,
    { modelId: f.model },
  ));
}
