import actionsNamespace from './actions/index.js';
import cacheNamespace from './cache/index.js';
import currentUserWrapper from './current-user/index.js';
import geoNamespace from './geo/index.js';
import getRequestFunction from './get-request/index.js';
import httpNamespace from './http/index.js';
import { iterateEach, iterateMap, iterateFeed } from './iterators/index.js';
import loggerNamespace from './logger/index.js';
import responseNamespace from './response/index.js';
import sendMailFunction from './send-mail/index.js';
import serviceNamespace from './service/index.js';
import wsNamespace from './ws/index.js';
import authUserFunction from './auth-user.js';
import checkModelAccessFunction from './check-model-access.js'
import encryptorNamespace from './encryptor.js';
import generateAuthTokenFunction from './generate-auth-token.js';
import getModelFunction from './get-model.js';
import getScopeFunction from './get-scope.js';
import getSettingFunction from './get-setting.js';
import getUserObjectFunction from './get-user-object.js';
import globalStoreNamespace from './global-store.js';
import translateFunction from './translate.js';
import timeoutFunction from './timeout.js';
import utilsNamespace from './utils/index.js'


export default (sandbox) => {
  const { context, internalVariables } = sandbox;

  return {
    client: 'web',
    globalStore: globalStoreNamespace(),
    geo: geoNamespace(sandbox),
    encryptor: encryptorNamespace(),
    currentUser: currentUserWrapper(context, sandbox),
    response: responseNamespace(context),
    actions: actionsNamespace(context, sandbox),
    utils: utilsNamespace(sandbox),
    cache: cacheNamespace(),
    log: loggerNamespace(context),
    ws: wsNamespace(context),
    http: httpNamespace(),
    service: serviceNamespace(sandbox),
    internalVariables,
    checkAccess : checkModelAccessFunction(sandbox),

    getSetting: getSettingFunction,
    getRequest: getRequestFunction(context),
    getScope: getScopeFunction(context, sandbox),
    getUserObject: getUserObjectFunction(sandbox),
    authUser: authUserFunction(context, sandbox),
    generateAuthToken: generateAuthTokenFunction,
    getModel: getModelFunction(sandbox),
    sendMail: sendMailFunction(sandbox),
    iterEach: iterateEach,
    iterMap: iterateMap,
    iterFeed: iterateFeed,
    translate: translateFunction(sandbox),
    timeout: timeoutFunction,
  };
};
