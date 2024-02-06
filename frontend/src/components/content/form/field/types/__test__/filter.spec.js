import React from 'react';

import FilterField from '../filter';

const methods = {
  onChange: jest.fn(),
};

const props = {
  required: {
    model: {},
    field: {},
    fields: [],
    templates: [],
    ...methods,
  },
};

const cases = [
  {
    props: { inline: true },
    result: {
      render: ['.inline.filter-field', '.filter', '.filter-label'],
    },
  },
  {
    props: { inline: false },
    result: {
      render: ['.filter-field', '.filter', '.filter-label'],
    },
  },
  {
    props: { enabled: false },
    result: {
      render: ['.disabled.filter-field', '.filter', '.filter-label'],
    },
  },
];

new BasicComponentTester(cases, props, methods).test(<FilterField />);
