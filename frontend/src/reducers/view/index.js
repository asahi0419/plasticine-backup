import { combineReducers } from 'redux';

import content from './content';
import field from './field';
import sidebar from './sidebar';
import action from './action';

export default combineReducers({
  content,
  field,
  sidebar,
  action,
});
