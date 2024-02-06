import React from 'react';

import Tree from '../tree';
import { TEMPLATES } from '../constants';

const props = {
  required: {
    items: [],
    selected: {},
    templates: TEMPLATES,
  },
};

const cases = [
  {
    result: {
      render: [
        '.tree',
        '.rc-tree',
      ],
    },
  },
];

new BasicComponentTester(cases, props).test(<Tree />);
