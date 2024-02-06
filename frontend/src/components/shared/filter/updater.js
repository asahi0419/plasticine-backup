import { cloneDeep } from 'lodash/lang';

import { makeUniqueID } from '../../../helpers';
import { getOperators } from './operators';

const updaters = {
  ADD_GROUP: addGroup,
  ADD_ITEM: addItem,
  CHANGE_ITEM: changeItem,
  DESTROY_ITEM: destroyItem,
};

export default (groups, fields) => {
  return (cmd, options = {}) => updaters[cmd](cloneDeep(groups), fields, options);
};

function getItem(fields, attributes) {
  const field = fields[0];
  const operator = Object.keys(getOperators(field.type))[0];

  return { id: makeUniqueID(), field, operator, ...attributes };
}

function addGroup(groups, fields) {
  const item = getItem(fields, { itemOperator: 'and' });

  groups.push({ items: [item] });
  return groups;
}

function addItem(groups, fields, options) {
  const result = findItem(groups, options.id);
  if (!result) return groups;
  const { indices } = result;

  const group = groups[indices.group];
  const item = getItem(fields, { itemOperator: options.type });

  const insertAtIndex = findNextSubgroupIndex(group, indices.item);
  group.items.splice(insertAtIndex, 0, item);

  return groups;
}

function changeItem(groups, fields, options) {
  const result = findItem(groups, options.id);
  if (!result) return groups;
  const { item, indices } = result;

  const group = groups[indices.group];
  group.items[indices.item] = { ...options.item, id: item.id, itemOperator: item.itemOperator };

  return groups;
}

function destroyItem(groups, fields, options) {
  const result = findItem(groups, options.id);
  if (!result) return groups;
  const { indices } = result;

  const group = groups[indices.group];
  const item = group.items[indices.item];

  if (item.itemOperator === 'and') {
    group.items.splice(indices.item, 1);

    if (group.items.length) {
      group.items[0].itemOperator = 'and';
    }
  } else {
    group.items.splice(indices.item, 1);
  }

  if (!group.items.length) groups.splice(indices.group, 1);

  return groups;
}

function findItem(groups, id) {
  let result;

  groups.forEach((group, groupIndex) => {
    group.items.forEach((item, itemIndex) => {
      if (item.id === id) {
        result = { item, indices: { group: groupIndex, item: itemIndex }};
      }
    });
  });

  return result;
}

function findNextSubgroupIndex(group, fromIndex) {
  let index = fromIndex + 1;

  while (index <= group.items.length - 1) {
    const nextItem = group.items[index];
    if (nextItem.itemOperator === 'and') break;
    index++;
  }

  return index;
}
