import React from 'react';
import ActionButton from '../button';

const methods = { handleAction: jest.fn() };

const props = {
  required: {
    model: { id: 1, alias: 'test' },
    action: { name: 'Test', hint: 'Test', options: '{"icon":"blind"}' },
    record: { id: 1, metadata: { associate: {} } },
    handleAction: methods.handleAction,
  },
};

const cases = [
  {
    props: { asDropdownItem: true },
    result: {
      render: ['.item'],
    },
  },
  {
    props: { asDropdownItem: false },
    result: {
      render: ['Button', 'Popup', 'Icon'],
      clicks: { 'button': 'handleAction' },
    },
  },
];

new BasicComponentTester(cases, props, methods).test(<ActionButton />);
