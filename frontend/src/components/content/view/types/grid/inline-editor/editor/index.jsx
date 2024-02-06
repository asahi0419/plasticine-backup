import React from 'react';

import BaseEditor from './base';
import BooleanEditor from './boolean';
import DatetimeEditor from './datetime';
import ArrayStringEditor from './array_string';
import ReferenceEditor from './reference';


const TYPES = {
  integer: BaseEditor,
  float: BaseEditor,
  string: BaseEditor,
  boolean: BooleanEditor,
  datetime: DatetimeEditor,
  array_string: ArrayStringEditor,
  reference: ReferenceEditor,
};


export default (type, props) => {
  const Editor = TYPES[type] || BaseEditor;

  return <Editor {...props} />;
};
