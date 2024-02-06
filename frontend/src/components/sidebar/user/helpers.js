import { last } from 'lodash/array';

import { makeUniqueID } from '../../../helpers';

export const createLayout = (components) => {
  const layout = { groups: [] };

  const addGroup = (component) => {
    const group = {
      id: component,
      params: components.options[component],
      components: [],
    };

    layout.groups.push(group);
    return group;
  };

  const addComponent = (component) => {
    let group = last(layout.groups);
    if (!group) group = addGroup(`__group__.${makeUniqueID()}`);

    const params = components.options[component] || {};

    group.components.push({ id: component, params });
  };

  components.list.forEach((component) => {
    if (component.startsWith('__group__')) {
      addGroup(component);
    } else {
      addComponent(component);
    }
  });

  return layout;
};
