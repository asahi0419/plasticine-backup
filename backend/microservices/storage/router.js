import express from 'express';

import * as StorageController from './api/storage/index.js';
import { initSandbox } from '../../presentation/server/middlewares/index.js';

import { checkReadAccess } from './api/storage/show.js';
import { checkCreateAccess, processParams , addGpsCoordinatesToRecord } from './api/storage/create.js';
import { checkUpdateAccess} from './api/storage/update.js';

export default express.Router()
  .get('/:id/:fileName', initSandbox, checkReadAccess, StorageController.show)
  .put('/:id', initSandbox, processParams, checkUpdateAccess, StorageController.update)
  .post('/:modelAlias/:recordId', initSandbox, checkCreateAccess, processParams, addGpsCoordinatesToRecord, StorageController.create);
