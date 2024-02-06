import PubSub from 'pubsub-js';
import fileDownload from 'js-file-download';
import { Buffer } from 'buffer';
import { dataURLToBlob } from 'blob-util';
import moment from 'moment'
import lodash from 'lodash'
import { isArray } from 'lodash/lang';

import store from '../store';
import PlasticineApi from '../api';
import Messenger from '../messenger';
import * as CONSTANTS from '../constants';

export { default as getIcon } from './getIcon';
export { default as compileFilter } from './compileFilter';
export { default as isAsyncFunction } from 'is-async-function'

export const makeUniqueID = () => Math.random().toString(36).substr(2, 5);

export const isJSValue = (value) => typeof(value) === 'string' && /(js:)/.test(value);

export const isTablet = () => window.matchMedia(`only screen and (max-width: 1024px)`).matches;

export const trimString = (string = '', limit = 45) => {
  try {
    return string.length > limit ? string.substring(0, limit) + '...' : string;
  } catch (error) {
    console.log(error);
    return string;
  }
}

export const extractAliases = (string) => {
  const pattern = /\{(\w+)\}/g;
  let match, result = [];
  while ((match = pattern.exec(string))) {
    result.push(match[1]);
  }
  if (lodash.isEmpty(result)) result.push(string);
  return result;
};

export const replaceAliasesToValues = (string, record) => {
  const aliases = extractAliases(string);

  if (!string) return string;

  aliases.forEach((fieldAlias) => {
    const value = (record.humanizedAttributes || {})[fieldAlias] || (record.attributes || {})[fieldAlias];
    string = string.replace(`{${fieldAlias}}`, value || '').trim();
  });

  return string;
};

export const parseOptions = (options) => {
  if (lodash.isNil(options)) return {};
  if (lodash.isString(options) && options === '') return {};
  if (isPlainObject(options)) return options;

  try {
    return JSON.parse(options);
  } catch (err) {
    return {};
  }
};

export const parseDateFormat = (options = {}) => {
  let { format, date_only } = options;

  if (!CONSTANTS.DATE_FORMATS.includes(format)) format = CONSTANTS.GLOBAL_DATE_FORMAT;

  if (format === CONSTANTS.GLOBAL_DATE_FORMAT) {
    const { field_date_time, field_date_notime } = getSetting('format') || {};

    return date_only ? field_date_notime : field_date_time;
  }

  return date_only ? format.split(' HH')[0] : format;
};

export const parseRGBAString = (value) => {
  if (!value) return value;
  const parsedValue = value.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[+-]?(\d+\.\d+|\d+)?\s*/i);
  if (!parsedValue) return value;

  return _.reduce({ 'r': 1, 'g': 2, 'b': 3, 'a': 4 }, function(result, index, key) {
    result[key] = parseFloat(parsedValue[index]);
    return result;
  }, {});
};

export const parseNumber = (value) => {
  if (lodash.isString(value)) return parseFloat((value.match(/-?(\d+(\.\d+)?)/g) || []).join());
  if (lodash.isNumber(value)) return value;
};

// own implemantation of lodash's isPlainObject, because problem with nested objects
export const isPlainObject = (object) => object && object.toString() === '[object Object]';

export const isFloat = (value) => {
  if (lodash.isNaN(parseFloat(value))) return false;
  return parseFloat(value) % 1 !== 0;
}


export const isJSString = (value) => {
  return lodash.isString(value) && /js:.*/.test(value.trim());
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    console.log(error);
    console.log(url);
    return false;
  }
}

export const openFileDialog = (options = {}, topic = 'files_selected') => {
  const fileInput = document.createElement('input');
  options = { multiple: true, context: {}, ...(options || {}) };

  fileInput.setAttribute('type', 'file');
  fileInput.setAttribute('multiple', options.multiple);
  fileInput.onchange = (e) => {
    const files = [];

    for (let i = 0; i < e.target.files.length; i++) {
      files.push({ file: e.target.files.item(i), context: options.context });
    }

    PubSub.publish(topic, files);
  }

  fileInput.click();
};

export const copyToClipboard = (value, options = {}) => {
  const el = document.createElement('textarea');
  el.value = value;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);

  if (options.message) {
    PubSub.publish('messages', options.message)
  }
};

export const uploadFiles = (files, callback) => {
  const filesToStore = [];
  let overallSize = 0;

  const formatsInput = lodash.uniq(lodash.map(files, (file) => getFileFormat(file.file.name)));
  const formatsAllowed = getSetting('attachments_settings.allowed_formats') || [];
  const formatsNotAllowed = lodash.difference(formatsInput, formatsAllowed);

  if (formatsNotAllowed.length) {
    Messenger.error({ content: i18n.t('file_format_is_not_allowed', { defaultValue: 'File format [{{format}}] is not allowed', format: formatsNotAllowed.join(', ') }) });
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    overallSize = overallSize + file.file.size;
  }

  // overal size shoule be less than 100Mb
  if ((overallSize >> 20) > 100) {
    Messenger.error({ content: i18n.t('allowed_only_100_mb_to_download', { defaultValue: 'You can download files less than 100Mb' }) });
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    store.blob.instance.put(file.file.name, file);
    filesToStore.push({ fileName: file.file.name });
  }

  callback && callback(filesToStore);
};

export const toHashCode = (value) => {
  const string = lodash.isString(value) ? value : JSON.stringify(value);

  return string.split('').reduce(function(result, chr) {
    result = ((result << 5) - result) + chr.charCodeAt(0);
    return result & result;
  }, 0);
}

export const bytesToSize = (bytes) => {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

export const getFileFormat = (fileName) => {
  return fileName ? (/[^./\\]*$/.exec(fileName) || [''])[0].toLowerCase() : 'error';
};

export const getFileType = (file) => {
  if (!file || !file.file_content_type) return 'error';

  const type = file.file_content_type.split('/')[0];
  if (type !== 'application') return type;

  const format = getFileFormat(file.file_name);
  switch (format) {
    case 'txt':
    case 'csv':
      return 'text';
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
      return 'word';
    case 'xls':
    case 'xlsx':
      return 'excel';
    case 'ppt':
    case 'pptx':
      return 'powerpoint';
    case 'rar':
    case 'zip':
    case 'zipx':
      return 'archive';
  }
};

export const getFileIcon = (fileType) => {
  const ICONS = {
    image: 'file image outline',
    audio: 'file audio outline',
    video: 'file video outline',
    pdf: 'file pdf outline',
    word: 'file word outline',
    excel: 'file excel outline',
    powerpoint: 'file powerpoint outline',
    archive: 'file archive outline',
    text: 'file alternate outline',
    default: 'file outline',
  }
  return ICONS[fileType] || ICONS['default'];
}

const getMetadataObject = (modelAlias, aliasOrId) => {
  const app = store.redux.state('metadata.app') || {};
  const aliasOrIdKey = lodash.isString(aliasOrId) ? 'alias' : 'id';

  return lodash.find(app[modelAlias], { [aliasOrIdKey]: aliasOrId });
}

export const getSetting = (path) => {
  return store.redux.state(`app.settings.${path}`);
};

export const getModel = (aliasOrId) => {
  return getMetadataObject('model', aliasOrId);
};

export const getView = (modelAlias, aliasOrId) => {
  const app = store.redux.state('metadata.app') || {};
  const model = getModel(modelAlias);
  const aliasOrIdKey = lodash.isString(aliasOrId) ? 'alias' : 'id';

  return lodash.find(app.view, { [aliasOrIdKey]: aliasOrId, model: model.id });
};

export const getPage = (aliasOrId) => getMetadataObject('page', aliasOrId);

export const responseToDataUrl = (response) => {
  const type    = response.headers['content-type'];
  const prefix  = 'data:' + type + ';base64,';
  const base64  = new Buffer(response.data, 'binary').toString('base64');
  const dataURI = prefix + base64;
  return dataURI;
};

export const attachmentToDataURL = async (attachment, options) => {
  const result = await PlasticineApi.getAttachment(attachment, options);
  return responseToDataUrl(result);
};

export const viewToDataURL = async (modelAlias, format, params, config) => {
  const result = await PlasticineApi.exportView(modelAlias, format, params, config);
  return responseToDataUrl(result);
};

export const downloadAttachment = async (attachment, options={}) => {
  const dataURL = await attachmentToDataURL(attachment, options);
  const blob = dataURLToBlob(dataURL);

  return fileDownload(blob, attachment.file_name);
};

export const downloadView = async (modelAlias, format, params = {}, config) => {
  const limits = getSetting('limits');

  const paramsPage = params.page || {};
  const page = { ...paramsPage, size: paramsPage.totalSize };

  if (page.size > limits.export_records_max && !['pdf', 'docx'].includes(format)) {
    if (!confirm(i18n.t('export_more_than_limit', { defaultValue: "You are trying to export more than specified limit records ({{limit}}). Only {{limit}} records will be exported.", limit: limits.export_records_max }))) return;
  }

  if (['pdf', 'docx'].includes(format)) {
    if (params.hasOwnProperty('exportType') && params.exportType !== 'form') {
      if (!confirm(i18n.t('export_more_than_limit_pdf_docx', { defaultValue: "Data was truncated due to the limit for the export ({{limit}}). Only {{limit}} records are exported.", limit: limits.export_records_docx_pdf_max }))) return;
    }
    const result = await PlasticineApi.exportView(modelAlias, format, params, config);
    const dataURL = responseToDataUrl(result);
    const fileName = result.headers['content-disposition'].split('filename=')[1].split(';')[0];
    const blob = dataURLToBlob(dataURL);
    return fileDownload(blob, fileName);
  }
  if (format === 'xlsx') {
    const size = (page.size > limits.export_records_max) ? limits.export_records_max : page.size
    const fields = (params.fields[`_${modelAlias}`] || '').split(',');
    const cells = size * fields.length;

    if (cells > CONSTANTS.EXPORT_XLSX_MAX_CELLS) {
      const model = getModel(modelAlias);
      const message = i18n.t('export_maximum_cells_limit', { defaultValue: "The maximum number of exported values should not exceed {{limit}} (records * fields). For the selected filter of model '{{model}}' the maximum exportable number of fields should not exceed {{limit_trunc}}. Please, add more filter to reduce number of records or use the layout settings to reduce the number of exported fields", model: model.plural, limit: CONSTANTS.EXPORT_XLSX_MAX_CELLS, limit_trunc: Math.trunc(CONSTANTS.EXPORT_XLSX_MAX_CELLS / page.size) });
      return Messenger.error({ content: message });
    }
  }

  const dataURL = await viewToDataURL(modelAlias, format, { ...params, page }, config);
  const blob = dataURLToBlob(dataURL);

  return fileDownload(blob, `${modelAlias}.${format}`);
};

export const RGBAtoHEX = (rgb) => {
  rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

  return (rgb && rgb.length === 4) ? "#" +
    ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
};

export const HEXtoRGB = (hex, params = {}) => {
  const value = hex || params.default;
  if (!value) return null;

  const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
  if (!parsed) return null;

  const result = {
    r: parseInt(parsed[1], 16),
    g: parseInt(parsed[2], 16),
    b: parseInt(parsed[3], 16),
    a: 255 * (params.alpha === undefined ? 1 : params.alpha),
  }

  if (params.toArray) {
    return Object.values(result);
  }

  return result;
}

const globalEventStore = {};

export function dispatchGlobalEvent(eventName, opts, target = window) {
    // Compatibale with IE
    // @see http://stackoverflow.com/questions/26596123/internet-explorer-9-10-11-event-constructor-doesnt-work
    let event;

    if (typeof window.CustomEvent === 'function') {
        event = new window.CustomEvent(eventName, { detail: opts });
    } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(eventName, false, true, opts);
    }

    if (target) {
        target.dispatchEvent(event);
        Object.assign(globalEventStore, opts);
    }
}

export function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');

  for (let i=0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }

  return null;
}

export function removeCookie(name) {
  if (getCookie(name)) {
    document.cookie = name + "=" + ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }
}

export const getIsoFormat = format => {
  const isISO = moment(moment().format(format), moment.ISO_8601, true).isValid();

  return isISO ? format : CONSTANTS.ISO_DATE_FORMAT;
};

export const validateGraph = (value='') => {
  let isValidGraph = true;
  try {
    const parseValue = JSON.parse(value)
    let graphValidation = parseValue.hasOwnProperty('graph')
    let linksValidation = parseValue.hasOwnProperty('links')

    if(!graphValidation || !linksValidation) {
      isValidGraph = false;
    }else if(!isArray(parseValue.graph) || !isArray(parseValue.links)){
      isValidGraph = false;
    }
  } catch (error) {
    console.log({error})
    isValidGraph = false;
  }
  return isValidGraph;
}

export const validateSignature = (value='') => {
  let result = null;
  if (!lodash.isString(value)) {
    return result;
  }

  if (value.startsWith('data:') && value.includes(';base64,')) {
    result = value;
  }

  return result;
};

export const getImageDimensions = async (file) => {
  return new Promise (function (resolved, rejected) {
    const i = new Image();
    i.onload = () => {
      resolved({ width: i.width, height: i.height });
    }
    i.src = file;
  });
}
