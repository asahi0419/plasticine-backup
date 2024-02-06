import React from 'react';
import * as FIELDS from '../../../index';

const ConditionField = FIELDS['condition'];

const props = {
  required: {
    model: { alias: 'field' },
    field: { alias: 'options' },
    fields: [],
  },
};

const cases = [
  {
    props: { value: 'true' },
    result: {
      render: ['.condition-string'],
      state: { humanized: true },
    },
  },
];

new BasicComponentTester(cases, props).test(<ConditionField />);
