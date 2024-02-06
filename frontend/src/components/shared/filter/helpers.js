import Promise from 'bluebird';
import { filter, map, each, sortBy } from 'lodash/collection';
import { keys } from 'lodash/object';

import PlasticineApi from '../../../api';
import * as Field from '../../content/form/field';

const BOOLEAN_ITEMS = [{
    id: 0, name: '--- TRUE', alias: 'true', type: 'boolean_stub'
  }, {
    id: 0, name: '--- FALSE', alias: 'false', type: 'boolean_stub'
  }];

const CURRENT_USER_ITEMS = [{
  id: 0, name: '--- Current user', alias: '__current_user__', type: 'current_user', options: '{"foreign_model":"user_group","foreign_label":"{name}","view":"default"}'
}];

export const loadUpReferencedFields = async (model) => {
  const { data: { data: fields = [] } } = await PlasticineApi.loadReferencedFields(model.alias);

  return fields;
};

export const loadUpTemplatesFields = async (template) => {
  const { dtf, dvf, models } = template;
  const { data: { data: fields = [] } } = await PlasticineApi.loadTemplateFields(map(models, 'id'));
  const result = [];

  each(fields, (field) => {
    result.push({
      ...field,
      name: `T.${field.name}`,
      alias: `__dvf__${dvf.alias}/${dtf.alias}/${field.model}/${field.alias}`,
      dvf: dvf.id,
      dtf: dtf.id,
    });
  });

  return result;
};

export const completeFields = (fields, options = {}) => {
  const availableTypes = keys(Field.getTypes());
  const availableFields = filter(fields, (field) => {
    return !field.virtual && availableTypes.includes(field.type);
  });

  return [
    ...(options.emptyItem ? [{ name: ' ', alias: '' }] : []),
    ...(options.booleanItems ? BOOLEAN_ITEMS : []),
    ...sortBy(availableFields, ['name']),
    { id: 0, name: '--- ASSERT', alias: 'true_stub', type: 'true_stub' },
    ...(options.currentUserItem ? CURRENT_USER_ITEMS : []),
  ];
};
