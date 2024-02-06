import { last } from 'lodash/array';
import { map } from 'lodash/collection';
import { max, sum } from 'lodash/math';
import { times } from 'lodash/util';

import * as HELPERS from '../../../../../helpers';

export const createLayout = (components) => {
  const layout = { sections: [] };

  const addSection = (component) => {
    const section = {
      id: component,
      params: components.options[component],
      columns: [],
    };

    layout.sections.push(section);
    return section;
  };

  const addColumn = (component) => {
    let section = last(layout.sections);
    if (!section) section = addSection(`__section__.${HELPERS.makeUniqueID()}`);

    const params = components.options[component] || {};
    params.colspan = parseInt(params.colspan) || 1;

    const column = { id: component, params, components: [] };

    section.columns.push(column);
    return column;
  };

  const addComponent = (component) => {
    let section = last(layout.sections);
    if (!section) section = addSection(`__section__.${HELPERS.makeUniqueID()}`);

    let column = last(section.columns);
    if (!column) column = addColumn(`__column__.${HELPERS.makeUniqueID()}`);
    const params = components.options[component] || {};
    params.rowspan = parseInt(params.rowspan) || 1;

    column.components.push({ id: component, params });
  };

  components.list.forEach((component) => {
    if (component.startsWith('__section__')) {
      addSection(component);
    } else if (component.startsWith('__column__')) {
      addColumn(component);
    } else {
      addComponent(component);
    }
  });

  // align columns
  layout.sections.forEach((section) => {
    const { columns } = section;
    const numberOfRows = max(columns.map(({ components }) => sum(map(components, 'params.rowspan'))));
    const numberOfColumns = sum(map(columns, 'params.colspan'));

    const container = times(numberOfRows, () => Array(numberOfColumns));
    const currentPosition = Array(numberOfColumns).fill(0);

    columns.forEach((column, i) => {
      column.components.forEach((component) => {
        const position = currentPosition[i];
        container[position][i] = component;
        currentPosition[i] = position + component.params.rowspan;
      });
    });

    section.table = container;
  });

  return layout;
};
