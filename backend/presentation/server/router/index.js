import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import express from 'express';

import Middlewares from '../middlewares/index.js';
import ModelsController from '../api/models/index.js';
import CommandsController from '../api/commands/index.js';

import storageRouter from '../../../microservices/storage/router.js';

export const getExternalRouter = async () => {
  const lookup = (await import('../../../extensions/lookup.js')).default;
  return (await lookup(__dirname)) || (() => null);
};

const useCallback = (callback) => (req, res, next) => {
  if (req.url.startsWith(`${process.env.ROOT_ENDPOINT}/health`)) return next();
  if (req.url.startsWith(`${process.env.ROOT_ENDPOINT}/__command/check_auth`)) return next();

  return callback(req, res, next);
};

export default async (app) => {
  const externalRouter = await getExternalRouter();
  externalRouter(app);

  const modelsRouter = express.Router({ mergeParams: true });
  modelsRouter.get('/', ModelsController.list)
    .get('/count', ModelsController.count)
    .get('/metadata', Middlewares.setExportType('metadata'), ModelsController.metadata)
    .get('/export', Middlewares.setExportType('for_import'), ModelsController.metadata)
    .get('/:id', Middlewares.findRecord, ModelsController.show)
    .post('/', ModelsController.create)
    .put('/fast', ModelsController.fastCreateOrUpdate)
    .put('/:id', Middlewares.findRecord, ModelsController.update)
    .delete('/:id', Middlewares.findRecord, ModelsController.destroy)
    .post('/action/:actionAlias', Middlewares.findParent, ModelsController.executeAction)
    .post('/:id/script/:fieldAlias', Middlewares.findRecord, ModelsController.executeRecordScript)
    .get('/:id/siblings', Middlewares.findRecord, ModelsController.getRecordSiblings)
    .post('/appearance/:id', ModelsController.executeAppearance);

  const loaderRouter = express.Router({ mergeParams: true });
  loaderRouter.get('/models', CommandsController.loadModels)
    .get('/user', CommandsController.loadUser)
    .get('/token', CommandsController.loadToken)
    .get('/pages', CommandsController.loadPages)
    .get('/dashboards', CommandsController.loadDashboards)
    .get('/fa_icons', CommandsController.loadFAIcons)
    .get('/template', CommandsController.loadTemplate)
    .get('/templates', CommandsController.loadTemplates)
    .get('/template_fields', CommandsController.loadTemplateFields)
    .get('/chart_scope/:chartId', CommandsController.loadChartScope)
    .get('/:modelAlias/view/:viewAlias', Middlewares.findModel, Middlewares.findParent, Middlewares.checkAccess, CommandsController.loadView)
    .get('/:modelAlias/views/', Middlewares.findModel, Middlewares.checkAccess, CommandsController.loadViews)
    .get('/:modelAlias/form', Middlewares.findModel, Middlewares.checkAccess, CommandsController.loadForm)
    .get('/:modelAlias/fields', Middlewares.findModel, CommandsController.loadFields)
    .get('/:modelAlias/field_options', Middlewares.findModel, CommandsController.loadFieldOptions)
    .get('/:modelAlias/:id/:fieldAlias/translation', CommandsController.loadTranslation)
    .get('/:modelAlias/referenced_fields', Middlewares.findModel, CommandsController.loadReferencedFields)
    .get('/:modelAlias/:id/worklog', Middlewares.findModel, CommandsController.loadWorklog)
    .get('/:modelAlias/:id/references', Middlewares.findModel, CommandsController.loadReferences)

  const commandRouter = express.Router({ mergeParams: true });
  commandRouter.use('/load', loaderRouter);
  commandRouter.get('/init', CommandsController.init)
    .get('/check_auth', CommandsController.checkAuth)
    .post('/auth_user', CommandsController.authUser)
    .get('/login/:action/:strategy', CommandsController.login)
    .post('/login/:action/:strategy', CommandsController.login)
    .post('/logout', CommandsController.logout)
    .post('/:modelAlias/:id/update_user_settings', Middlewares.findModel, Middlewares.findRecord, CommandsController.updateUserSettings)
    .get('/:modelAlias/process_filter', Middlewares.findModel, CommandsController.processFilter);

  const v1 = express.Router();
  v1.get('/health', (req, res) => res.send());
  v1.use('/storage', storageRouter);
  v1.use('/__command', commandRouter);
  v1.use('/web_service/call/:actionAlias', Middlewares.findWebService, ModelsController.executeWebService);
  v1.use('/model_:modelAlias.:format?', Middlewares.findModel, Middlewares.findParent, Middlewares.checkAccess, Middlewares.setFormat, modelsRouter);
  v1.use('/:modelAlias.:format?', Middlewares.findModel, Middlewares.findParent, Middlewares.checkAccess, Middlewares.setFormat, modelsRouter);

  app.use(useCallback(Middlewares.checkSystemExpire));
  app.use(useCallback(Middlewares.requireAuth));
  app.use(useCallback(Middlewares.extendSelf));
  app.use(useCallback(Middlewares.initSandbox));
  app.use(useCallback(Middlewares.checkSystemExpireLight));
  app.use(useCallback(Middlewares.checkAccountStatus));
  app.use(useCallback(Middlewares.checkSession));
  app.use(useCallback(Middlewares.setVariablesFromHeaders));
  app.use(useCallback(Middlewares.prepareParams));
  app.use(useCallback(Middlewares.onRequestCallback));
  app.use(useCallback(Middlewares.addUserPosition));
  app.use(useCallback(Middlewares.reloadUserOptions));

  app.use(process.env.ROOT_ENDPOINT, v1);
};
