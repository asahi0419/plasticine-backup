import React from 'react';
import { get } from 'lodash/object';
import { find } from 'lodash/collection';

import Details from '../details';

const methods = {
  onDelete: jest.fn(),
  onUpdate: jest.fn(),
};

const props = {
  required: {
    fields: [
      { alias: 'name', type: 'string' },
      { alias: 'required_when_script', type: 'string' },
      { alias: 'options', type: 'string' },
      { alias: 'extra_attributes', type: 'reference_to_list' },
    ],
    enabled: true,
    ...methods,
  },
};

const cases = [
  {
    props: {
      record: {
        attributes: { alias: 'text_1', subtype: 'text', name: 'Text 1', required_when_script: 'true', options: '{}', extra_attributes: [] },
        metadata: { options: {} },
      },
    },
    result: {
      render: [
        '.details',
        '.control-buttons',
        '.button.update',
        '.button.delete',
      ],
      clicks: {
        '.button.delete': 'onDelete',
      },
    },
  },
  {
    props: {
      record: {
        attributes: { alias: 'folder_1', subtype: 'folder' },
        metadata: { options: {} },
      },
      hasChildren: true,
    },
    result: {
      render: [
        '.button.delete.disabled',
      ],
    },
  },
];

new BasicComponentTester(cases, props, methods).test(<Details />);
