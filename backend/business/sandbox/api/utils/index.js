import * as HELPERS from '../../../helpers/index.js';
import Storage from '../../../storage/index.js';

import buildDocxByTemplateFunction from './build-docx-by-template/index.js';
import buildFileByTemplateFunction from './build-file-by-template/index.js';
import buildPDFByTemplateFunction from './build-pdf-by-template/index.js';
import chartToAttachmentFuction from './chart-to-attachment/index.js';
import convertAttachmentFunction from './convert-attachment/index.js';
import dbNamespace from './db/index.js';
import execSSFunction from './exec-ss/index.js';
import getNearestScopeFunction from './get-nearest-scope/index.js';
import releaseNamespace from './release/index.js';
import runCMDFunction from './run-cmd/index.js';
import getTCrossFunction from './template/get-t-cross.js';
import getTCrossByRefFunction from './template/get-t-cross-by-ref.js';
import bufferToAttachmentFuction from './buffer-to-attachment.js';
import cleanupFileStorageFunction from './cleanup-file-storage.js';
import cleanupAttachmentsFunction from "./cleanup-attachment.js";
import createModelFunction from './create-model.js';
import CSVtoJSONFuction from './csv-to-json.js';
import getClientType from './get-client-type.js';
import getFileStorageUsedSizeFunction from './get-file-storage-used-size.js';
import getFSFunction from './get-fs.js';
import getSeedFunction from './get-seed.js';
import getStorageFunction from './get-storage.js';
import getTemplateFunction from './get-template.js';
import getLineReaderFunction from './get-line-reader.js';
import getMemoryCacheFunction from './get-memory-cache.js';
import imageToAttachmentFuction from './image-to-attachment.js';
import stringToAttachmentFuction from './string-to-attachment.js';
import gzipFunction from './gzip.js';
import ungzipFunction from './ungzip.js';

export default (sandbox) => ({
  md5: HELPERS.md5,
  sizeof: HELPERS.sizeof,
  JSONParseSafe: HELPERS.parseOptions,
  db: dbNamespace(sandbox),
  release: releaseNamespace,
  createModel: createModelFunction(sandbox),
  createStorage: (params) => new Storage(params),
  buildDocxByTemplate: buildDocxByTemplateFunction(sandbox),
  buildPDFByTemplate: buildPDFByTemplateFunction(sandbox),
  buildFileByTemplate: buildFileByTemplateFunction(sandbox),
  getMemoryCache: getMemoryCacheFunction(sandbox),
  getNearestScope: getNearestScopeFunction(sandbox),
  getFS: getFSFunction(sandbox),
  getSeed: getSeedFunction(sandbox),
  getStorage: getStorageFunction(sandbox),
  getTemplate: getTemplateFunction(sandbox),
  lineReader: getLineReaderFunction(sandbox),
  getTCross: getTCrossFunction(sandbox),
  getTCrossByRef: getTCrossByRefFunction(sandbox),
  getFileStorageUsedSize: getFileStorageUsedSizeFunction(sandbox),
  cleanupFileStorage: cleanupFileStorageFunction(sandbox),
  cleanupAttachments: cleanupAttachmentsFunction(sandbox),
  bufferToAttachment: bufferToAttachmentFuction(sandbox),
  stringToAttachment: stringToAttachmentFuction(sandbox),
  imageToAttachment: imageToAttachmentFuction(sandbox),
  chartToAttachment: chartToAttachmentFuction(sandbox),
  CSVtoJSON: CSVtoJSONFuction(sandbox),
  runCMD: runCMDFunction(sandbox),
  execSS: execSSFunction(sandbox),
  convertAttachment: convertAttachmentFunction(sandbox),

  getEnvName: () => process.env.APP_ENV,
  getHostName: () => process.env.APP_HOST_NAME,
  getHostProtocol: () => process.env.APP_HOST_PROTOCOL,
  getHostURL: () => `${process.env.APP_HOST_PROTOCOL}://${process.env.APP_HOST_NAME}`,
  getClientType: getClientType(sandbox),

  gzip: gzipFunction(sandbox),
  ungzip: ungzipFunction(sandbox),
  isOnlineMode: () => true,
});
