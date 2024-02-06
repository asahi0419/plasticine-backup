import Multer from 'multer';
import moment from 'moment';
import { map, merge, pick, isEqual } from 'lodash-es';

import * as HELPERS from './helpers.js';
import * as CONSTANTS from './constants.js';

import db from '../../../data-layer/orm/index.js';
import logger from '../../../business/logger/index.js';
import passport from '../passport/index.js';
import Selector from '../../../business/record/fetcher/selector.js';
import serializer from '../../../business/record/serializer/index.js';
import translator from '../../../business/i18n/translator.js';
import currentUser from '../../../business/sandbox/api/p/current-user/index.js';
import { getSetting } from '../../../business/setting/index.js';
import { errorHandler } from '../../../business/error/express.js';
import { updatePermissionsFromParent } from '../../../business/security/permissions.js';
import { getRecord, getAliasFromURL, getJWTToken, measureTime, parseOptions } from '../../../business/helpers/index.js';
import {
  createSession,
  findSessionById,
  closeSession,
  validateSession,
  touchSession
} from '../../../business/user/session.js';
import {
  AuthenticationError,
  RecordNotFoundError,
  NoAccessToModelError,
  ExpiredPasswordError,
  ExpiredSystemError,
} from '../../../business/error/index.js';
import * as SECURITY from '../../../business/security/index.js';

export const checkSystemExpire = async (req, res, next) => {
  const date = 'SW_EXPIRE_DATE';
  const format = 'YYYY-MM-DD';

  if (moment(date, format).isValid()) {
    if (moment().isAfter(moment(date))) {
      return errorHandler(new ExpiredSystemError(), req, res, next);
    }
  }

  next();
};

export const checkSystemExpireLight = async (req, res, next) => {
  const { p } = req.sandbox.vm;

  if (p.currentUser.isGuest()) return next();
  if (p.currentUser.getAccount().getValue('email') === process.env.APP_ADMIN_USER) return next();

  const date = getSetting('authorization.system_expire_protection_light');
  const format = 'YYYY-MM-DD';

  if (moment(date, format).isValid()) {
    if (moment().isAfter(moment(date))) {
      return errorHandler(new ExpiredSystemError(), req, res, next);
    }
  }

  next();
};

export const requireAuth = async (req, res, next) => {
  await new Promise((resolve) => {
    passport.authenticate(['token', 'jwt'], { session: false }, async (err, user, info) => {
      if (user) {
        req.user = user;
        req.language = req.locale = req.lng = (user.language || {}).alias || 'en';
        req.i18n.changeLanguage(req.language);

        if (req.query.sso_provider) {
          if (getSetting('authorization.sso.strategies')[req.query.sso_provider]) {
            const url = `${process.env.ROOT_ENDPOINT}/__command/login/request/${req.query.sso_provider}`;

            if (req.query.login) {
              if (req.query.login !== req.user.account.email) {
                return res.json({
                  action: 'open_url',
                  options: { url: `${url}?login_hint=${req.query.login}` },
                });
              }
            } else {
              return res.json({
                action: 'open_url',
                options: { url },
              });
            }
          }
        }

        if (req.headers.hasOwnProperty('x-token')) {
          if (user.account.static_token === req.headers['x-token']) {
            if ([req.query.session, req.headers.session].includes('true')) {
              req.sandbox = await HELPERS.getSandbox(req, res);

              const session = user.__session = req.query.session_id
              ? await findSessionById(req.query.session_id)
              : await createSession(user, req, req.sandbox);

              res.setHeader('JWT-Token', getJWTToken(user, session, 'static'));
            }
          } else {
            return errorHandler(new AuthenticationError(), req, res);
          }
        }

        resolve();
      } else if (info) {
        errorHandler(new AuthenticationError(info.message), req, res);
      }
    })(req, res, resolve);
  });

  return next();
};

export const checkSession = async (req, res, next) => {
  const session = req.user.__session;

  if (session) {
    if (req.query.logout === 'true') {
      return closeSession(session, { reason_to_close: 'manual' }, req.user, req.sandbox);
    }
  }

  if (['static_token', 'otp_token'].includes(req.user.__authType)) {
    if (![req.query.session, req.headers.session].includes('true')) return next();
  } else {
    if (isEqual(map(req.user.__userGroups, 'alias'), [ '__public' ])) return next(); // guests
  }

  const error = validateSession(session, req);
  if (error) return errorHandler(error, req, res);

  await touchSession(session);

  return next();
};

export const checkAccountStatus = async (req, res, next) => {
  if (req.query.expired) return next();
  if (!req.user) return next();

  const account = req.sandbox.vm.p.currentUser.getAccount();
  const sessionDetails = parseOptions(req.user.__session?.details);

  if (sessionDetails.logged_with === 'login') {
    const status = await account.checkStatus();

    if (status === 'expired') {
      if (req.headers.client === 'mobile') {
        return res.error(new ExpiredPasswordError(req.sandbox.translate('static.expired_password_error')));
      }

      return res.json({
        action: 'open_url',
        options: {
          url: '/pages/change_password?expired=true',
          options: { message: req.sandbox.translate('static.expired_password_error') }
        },
      });
    }
  }

  return next();
};

export const initSandbox = async (req, res, next) => {
  if (!req.sandbox) req.sandbox = await HELPERS.getSandbox(req, res);
  next();
};

export const prepareParams = (req, res, next) => {
  if (req.query.id) {
    req.params.record = req.params.record || {};
    req.params.record.id = req.query.id;
  }

  if (!req.url.startsWith(`${process.env.ROOT_ENDPOINT}/storage`)) {
    if (req.is('multipart/form-data')) {
      return Multer({ storage: Multer.memoryStorage() }).any()(req, res, next);
    }
  }

  next();
};

export const onRequestCallback = async (req, res, next) => {
  const onClientRequestAction = await db.model('action').select(['id', 'condition_script', 'server_script']).where({
    alias: '__on_client_request',
    active: true,
    __inserted: true
  }).getOne();
  if (!onClientRequestAction) {
    next();
    return;
  }

  try {
    if (req.sandbox.executeScript(onClientRequestAction.condition_script, `action/${onClientRequestAction.id}/condition_script`)) {
      const result = req.sandbox.executeScript(onClientRequestAction.server_script, `action/${onClientRequestAction.id}/server_script`);
      result && typeof (result.then) === 'function' ? await result : result;
    }

    next();
  } catch (error) {
    logger.error(error);
    next();
  }
};

export const reloadUserOptions = async (req, res, next) => {
  const user = currentUser(req, req.sandbox);
  if (user.isGuest()) return next();

  try {
    const { options, position } = req.user;
    const json = res.json.bind(res);

    res.json = (data) => json(merge(data, { user: { options, position } }));
    next();
  } catch (error) {
    logger.error(error);
    next();
  }
};

export const findModel = (req, res, next) => {
  try {
    req.model = db.getModel(req.params.modelAlias);
    next();
  } catch (error) {
    res.error(error);
  }
};

export const findRecord = async (req, res, next) => {
  const { params = {}, query } = req;
  const { id } = params;

  try {
    const inserted = await db.model(req.model).select('__inserted').pluck('__inserted').where({ id }).getOne();
    const options = { includeNotInserted: !!query.full_set, ignorePermissions: !inserted };

    const [ record ] = await new Selector(req.model, req.sandbox, options).fetch(`id = ${id}`);
    if (!record) throw new RecordNotFoundError();

    req.record = await HELPERS.preprocessRecord(req.model, record, req.sandbox);

    next();
  } catch (error) {
    res.error(error);
  }
};

export const findParent = async (req, res, next) => {
  const { body, query, sandbox } = req;
  const embedded_to = body.embedded_to || query.embedded_to || {};

  if (!embedded_to.model || !embedded_to.record_id) return next();

  const model = db.getModel(embedded_to.model);
  if (!model) return next();

  req.parentModel = model;

  let record = await db.model(model).where({ id: embedded_to.record_id });
  if (record.__inserted) {
    const [ r ] = await new Selector(model, sandbox).fetch(`id = ${embedded_to.record_id}`);
    if (!r) return next();

    record = r;
  }

  req.parentRecord = await HELPERS.preprocessRecord(req.model, record, req.sandbox);

  if (req.model.alias === 'attachment') {
    await sandbox.assignRecord(record, req.parentModel, 'record', { preload_data: false });
  }

  await updatePermissionsFromParent(req.user, req.model, req.parentModel);

  next();
};

export const checkAccess = async ({ model, sandbox, body }, res, next) => {
  await SECURITY.checkAccess('model', model, sandbox, body)
    ? next()
    : res.error(new NoAccessToModelError(model.alias));
};

export const setExportType = exportType => (req, _, next) => {
  req.exportType = exportType;
  next();
};

export const setFormat = (req, res, next) => {
  req.format = req.params.format || 'json';
  // TODO: check available formats
  next();
};

export const setVariablesFromHeaders = (req, res, next) => {
  req.timeZoneOffset = +(req.headers.xtimezoneoffset || req.query.time_zone_offset || 0);
  next();
};

export const extendSelf = (req, res, next) => {
  req.translate = translator(req.i18n);

  res.serialize = (data) => {
    const { format, query, model } = req;
    const params = { model };

    res.setHeader('Content-Type', CONSTANTS.CONTENT_TYPE_HEADERS[format || 'json']);

    if (query.disposition === 'attachment') {
      res.setHeader('Content-Disposition', 'attachment');
    }

    if (query.fields) {
      params.fields = (query.fields[`_${model.alias}`] || '').split(',');
    }

    serializer(data, format, params, req).then(result => res.send(result));
  };

  res.error = err => errorHandler(err, req, res, next);

  next();
};

export const findWebService = async (req, res, next) => {
  try {
    const record = await db.model('web_service').where({ alias: req.params.actionAlias, active: true }).getOne();
    if (!record) throw new RecordNotFoundError();

    req.record = record;

    next();
  } catch (error) {
    res.error(error);
  }
};

export const addUserPosition = async ({ user }, res, next) => {
  const [ userPosition ] = await db.model('user_position').where({ user_id: user.id });
  let position;

  if (userPosition) position = pick(userPosition, [ 'p_lat', 'p_lon', 'accuracy', 'reported_at' ]);
  user._position = position;

  next();
};

export default {
  initSandbox: (...args) => measureTime('REST API: Middlewares - initSandbox', initSandbox, args),
  requireAuth: (...args) => measureTime('REST API: Middlewares - requireAuth', requireAuth, args),
  checkSession: (...args) => measureTime('REST API: Middlewares - checkSession', checkSession, args),
  checkAccountStatus: (...args) => measureTime('REST API: Middlewares - checkAccountStatus', checkAccountStatus, args),
  checkAccess: (...args) => measureTime('REST API: Middlewares - checkAccess', checkAccess, args),
  findModel: (...args) => measureTime('REST API: Middlewares - findModel', findModel, args),
  findRecord: (...args) => measureTime('REST API: Middlewares - findRecord', findRecord, args),
  findParent: (...args) => measureTime('REST API: Middlewares - findParent', findParent, args),
  findWebService: (...args) => measureTime('REST API: Middlewares - findWebService', findWebService, args),
  prepareParams: (...args) => measureTime('REST API: Middlewares - prepareParams', prepareParams, args),
  reloadUserOptions: (...args) => measureTime('REST API: Middlewares - reloadUserOptions', reloadUserOptions, args),
  addUserPosition: (...args) => measureTime('REST API: Middlewares - addUserPosition', addUserPosition, args),
  onRequestCallback: (...args) => measureTime('REST API: Middlewares - onRequestCallback', onRequestCallback, args),

  setExportType,
  setFormat,
  setVariablesFromHeaders,
  extendSelf,
  checkSystemExpire,
  checkSystemExpireLight,
};