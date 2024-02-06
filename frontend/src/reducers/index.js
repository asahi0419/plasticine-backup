import { combineReducers } from 'redux';

import app from './app';
import db from './db';
import metadata from './metadata';
import view from './view';
import options from './options';

const appReducer = combineReducers({ app, db, metadata, view, options });

export default (state, action) => {
  return appReducer(state, action);
};
