import { measureTime } from '../../../../business/helpers/index.js';

import list from './list.js';
import count from './count.js';
import metadata from './metadata.js';
import show from './show.js';
import create from './create.js';
import update from './update.js';
import destroy from './destroy.js';
import getRecordSiblings from './get-record-siblings.js';
import createOrUpdate from './createOrUpdate.js';

import {
  executeAction,
  executeRecordScript,
  executeWebService,
  executeAppearance,
} from './execute.js';

export default {
  list: (req, res) => measureTime('REST API: Models - list', list, [req, res]),
  count: (req, res) => measureTime('REST API: Models - count', count, [req, res]),
  metadata: (req, res) => measureTime('REST API: Models - metadata', metadata, [req, res]),
  show: (req, res) => measureTime('REST API: Models - show', show, [req, res]),
  create: (req, res) => measureTime('REST API: Models - create', create, [req, res]),
  update: (req, res) => measureTime('REST API: Models - update', update, [req, res]),
  destroy: (req, res) => measureTime('REST API: Models - destroy', destroy, [req, res]),
  getRecordSiblings: (req, res) => measureTime('REST API: Models - getRecordSiblings', getRecordSiblings, [req, res]),
  fastCreateOrUpdate: (req, res) => measureTime('REST API: Model - raw create or update', createOrUpdate, [req, res]),

  executeAction: (req, res) => measureTime('REST API: Models - executeAction', executeAction, [req, res]),
  executeRecordScript: (req, res) => measureTime('REST API: Models - executeRecordScript', executeRecordScript, [req, res]),
  executeWebService: (req, res) => measureTime('REST API: Models - executeWebService', executeWebService, [req, res]),
  executeAppearance: (req, res) => measureTime('REST API: Models - executeAppearance', executeAppearance, [req, res]),
};
