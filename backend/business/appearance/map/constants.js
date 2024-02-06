import lodash from 'lodash-es';

const COMMON = {
  'p-legend': 1,
  'selected': true,
  'expand': true,
};

const COMMON_GROUP = {
  'cnt': { 'show': true },
  'content': { 'include': false },
};

export const DEFAULT_SECTION = {
  'id': 'default',
  'name': 'default',
  'color': 'inherit',
  'bg-color': 'transparent',
  ...lodash.cloneDeep(COMMON),
};

export const FREE_OBJECTS_SECTION = {
  'id': 'Free objects',
  'name': 'Free objects',
  'color': 'inherit',
  'icon': 'bullseye',
  'icon-color': 'inherit',
  'bg-color': 'transparent',
  ...lodash.cloneDeep(COMMON),
};

export const ASSOCIATED_OBJECTS_SECTION = {
  'id': 'Associated objects',
  'name': 'Associated objects',
  'color': 'inherit',
  'icon': 'anchor',
  'icon-color': 'inherit',
  'bg-color': 'transparent',
  ...lodash.cloneDeep(COMMON),
};

export const DEFAULT_GROUP = {
  'id': 'default',
  'name': 'default',
  'section': 'default',
  'color': 'inherit',
  'icon': 'circle',
  'icon-color': 'inherit',
  'bg-color': 'transparent',
  ...lodash.cloneDeep(COMMON),
  ...lodash.cloneDeep(COMMON_GROUP),
};

export const FREE_POINTS_GROUP = {
  'id': 'Free points',
  'name': 'Free points',
  'section': 'Free objects',
  'color': 'inherit',
  'icon': 'bullseye',
  'icon-color': '#2184ff',
  'bg-color': 'transparent',
  ...lodash.cloneDeep(COMMON),
  ...lodash.cloneDeep(COMMON_GROUP),
};

export const FREE_LINES_GROUP = {
  'id': 'Free lines',
  'name': 'Free lines',
  'section': 'Free objects',
  'color': 'inherit',
  'icon': 'minus',
  'icon-color': '#2184ff',
  'bg-color': 'transparent',
  ...lodash.cloneDeep(COMMON),
  ...lodash.cloneDeep(COMMON_GROUP),
};

export const FREE_POLYGONS_GROUP = {
  'id': 'Free polygons',
  'name': 'Free polygons',
  'section': 'Free objects',
  'color': 'inherit',
  'icon': 'square',
  'icon-color': '#2184ff',
  'bg-color': 'transparent',
  ...lodash.cloneDeep(COMMON),
  ...lodash.cloneDeep(COMMON_GROUP),
};

export const ASSOCIATED_POINTS_GROUP = {
  'section': 'Associated objects',
  'color': 'inherit',
  'icon': 'bullseye',
  'icon-color': '#faa60a',
  'bg-color': 'transparent',
  ...lodash.cloneDeep(COMMON),
  ...lodash.cloneDeep(COMMON_GROUP),
};

export const ASSOCIATED_LINES_GROUP = {
  'section': 'Associated objects',
  'color': 'inherit',
  'icon': 'minus',
  'icon-color': '#faa60a',
  'bg-color': 'transparent',
  ...lodash.cloneDeep(COMMON),
  ...lodash.cloneDeep(COMMON_GROUP),
};
