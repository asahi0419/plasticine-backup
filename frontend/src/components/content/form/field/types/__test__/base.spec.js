import React from 'react';

import BaseField from '../base';

const props = {
  required: {
    field: { alias: 'test' },
    onChange: jest.fn(),
  },
};

const cases = [
  {
    result: {
      methods: {
        shouldComponentUpdate: { input: { field: { alias: 'test2' } }, output: true },
      }
    },
  },
  {
    props: {
      value: 'test'
    },
    result: {
      methods: {
        shouldComponentUpdate: { input: { value: 'test2' }, output: true },
      }
    },
  },
  {
    props: {
      error: false
    },
    result: {
      methods: {
        shouldComponentUpdate: { input: { error: true }, output: true },
      }
    },
  },
  {
    props: {
      required: false
    },
    result: {
      methods: {
        shouldComponentUpdate: { input: { required: true }, output: true },
      }
    },
  },
  {
    props: {
      enabled: false
    },
    result: {
      methods: {
        shouldComponentUpdate: { input: { enabled: true }, output: true },
      }
    },
  },
];

new BasicComponentTester(cases, props).test(<BaseField />);
