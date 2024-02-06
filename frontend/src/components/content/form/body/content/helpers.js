import qs from 'qs';
import { last } from 'lodash/array';
import { cloneDeep } from 'lodash/lang';
import { find, each, filter } from 'lodash/collection';

import { makeUniqueID } from '../../../../../helpers';

const MIN_SECTION_WIDTH = 644;

export const createLayout = (originalComponents, fields) => {
  const query = qs.parse(window.location.search.replace(/^\?/, '')) || {};
  const components = cloneDeep(originalComponents);
  const layout = [];

  let indexOfTab = 0;

  const addTab = (component) => {
    if (indexOfTab && query.export) return;

    const params = components.options[component] || { expanded: true };
    const tabIndex = indexOfTab + 1;
    const defaultName = indexOfTab > 0
      ? i18n.t('tab_name_default', { index: tabIndex, defaultValue: `Tab #${tabIndex}` })
      : i18n.t('tab_name_main', { defaultValue: 'Main' });

    const tab = {
      id: component,
      params: { name: defaultName, ...params },
      sections: [],
    };

    layout.push(tab);
    indexOfTab = indexOfTab + 1;

    return tab;
  };

  const addSection = (component, options = {}) => {
    let tab = last(layout);
    if (!tab) tab = addTab(`__tab__.${makeUniqueID()}`);

    const section = {
      id: component,
      params: components.options[component] || { expanded: true },
      columns: [],
    };

    section.params.width = options.width || MIN_SECTION_WIDTH;

    tab.sections.push(section);
    return section;
  };

  const addColumn = (component, params = {}) => {
    let tab = last(layout);
    if (!tab) tab = addSection(`__tab__.${makeUniqueID()}`);

    let section = last(tab.sections);
    if (!section) section = addSection(`__section__.${makeUniqueID()}`);

    const column = {
      id: component,
      params: components.options[component] || params,
      components: [],
    };

    section.columns.push(column);
    return column;
  };

  const addComponent = (component) => {
    let tab = last(layout);
    if (!tab) tab = addSection(`__tab__.${makeUniqueID()}`);

    let section = last(tab.sections);
    if (!section) section = addSection(`__section__.${makeUniqueID()}`);

    let column = last(section.columns);
    if (!column) column = addColumn(`__column__.${makeUniqueID()}`, { virtual: true });

    column.components.push({ id: component, params: components.options[component] || {} });
  };

  const sectionComponents = filter(components.list, (component) => {
    const field = find(fields, ({ alias, type }) => (alias === component)) || {};
    return ['data_template'].includes(field.type);
  });

  const componentsList = filter(components.list, component => !sectionComponents.includes(component));

  each(sectionComponents, (component, i) => {
    const componentIndex = components.list.indexOf(component) - sectionComponents.length;
    const nextComponent = find(componentsList.slice(componentIndex), c => c.startsWith('__tab__') || c.startsWith('__section__') || ['__form_items_chooser__', '__related_data_chooser__'].includes(c))
    const nextComponentIndex = nextComponent ? componentsList.indexOf(nextComponent) : componentsList.length;

    componentsList.splice(nextComponentIndex, 0, `__section__.${makeUniqueID()}`);
    componentsList.splice(nextComponentIndex + 1, 0, `__column__.${makeUniqueID()}`);
    componentsList.splice(nextComponentIndex + 2, 0, component);
  });

  each(componentsList, (component) => {
    if (component.startsWith('__tab__')) {
      addTab(component);
    } else if (component.startsWith('__section__')) {
      addSection(component);
    } else if (component.startsWith('__column__')) {
      addColumn(component);
    } else if (component.startsWith('__attachments__')) {
      const options = components.options[component] || {};
      if (!options.name) options.name = i18n.t('attachments_tab_name', { defaultValue: 'Attachments' });
      addTab(component);
    } else if (component.startsWith('__dashboard__')) {
      addTab(component);
    } else if (['__form_items_chooser__', '__related_data_chooser__'].includes(component)) {
      addSection(`__section__.chooser_${makeUniqueID()}`, { width: '100%' })
      addComponent(component)
    } else {
      addComponent(component);
    }
  });

  return layout;
};
