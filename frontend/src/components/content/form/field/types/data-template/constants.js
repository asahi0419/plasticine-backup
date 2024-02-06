export const PLACEHOLDER = {
  key: 'placeholder',
  title: 'Drop here ...',
  className: 'placeholder',
  subtype: 'folder',
};

export const PRIMARY_ALIASES = [
  'model',
  'type',
  'virtual',
];

export const DETAILS_ALIASES = [
  'name',
  'alias',
  'options',
  'required_when_script',
  'readonly_when_script',
  'hidden_when_script',
  'extra_attributes',
];

export const DETAILS_VIRTUAL_ALIASES = [
  'name',
  'required_when_script',
  'readonly_when_script',
  'hidden_when_script',
];

export const DETAILS_FIELDS_OPTIONS = {
  alias: { readonly_when_script: 'p.currentUser.isAdmin()' },
};

export const TEMPLATES = [
  {
    key: 'folder',
    icon: 'folder outline',
    type: 'string',
    subtype: 'folder',
  },
  {
    key: 'check',
    icon: 'dot circle outline',
    type: 'boolean',
    subtype: 'check',
  },
  {
    key: 'text',
    icon: 'font',
    type: 'string',
    subtype: 'text',
  },
  {
    key: 'float',
    icon: 'arrows alternate horizontal',
    type: 'float',
    subtype: 'float',
  },
  {
    key: 'int',
    icon: 'arrows alternate horizontal',
    type: 'integer',
    subtype: 'int',
  },
  {
    key: 'datetime',
    icon: 'calendar alternate outline',
    type: 'datetime',
    subtype: 'datetime',
  },
  {
    key: 'options',
    icon: 'unordered list',
    type: 'array_string',
    subtype: 'options',
  },
  {
    key: 'media',
    icon: 'attach',
    type: 'file',
    subtype: 'media',
  }
];
