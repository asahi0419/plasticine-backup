import * as uuid from 'uuid';

import kml2geojsonFunction from './kml2geojson/index.js';
import zipperFunction from './zipper/index.js';
import unzipperFunction from './unzipper/index.js';
import getConditionResultFunction from './get-condition-result/index.js';
import yamlLoadFunction from './yamlLoad/index.js';
import yamlDumpFunction from './yamlDump/index.js';
import yamlMergeFunction from './yamlMerge/index.js';
import buildDocumentByTemplateFunction from './build-document/index.js';
import getViewRawXMLFunction from './get-view-rawxml/index.js';
import getFormRawXMLFunction from './get-form-rawxml/index.js';
import getMessageBusFunction from './get-message-bus/index.js';
import buildGraphByModelDataFunction from './buildGraphByModelData/index.js';
import generateQRCodeFunction from './generate-qr-code/index.js';
import geojson2kml from './geojson2kml/index.js';
import gjvFunction from './gjv/index.js';

export default (sandbox) => {
  return {
    uuid,

    kml2geojson: kml2geojsonFunction(sandbox),
    zipper: zipperFunction(sandbox),
    unzipper: unzipperFunction(sandbox),
    getConditionResult: getConditionResultFunction(sandbox),
    yamlLoad: yamlLoadFunction(sandbox),
    yamlDump: yamlDumpFunction(sandbox),
    yamlMerge: yamlMergeFunction(sandbox),
    getViewRawXML: getViewRawXMLFunction(sandbox),
    getFormRawXML: getFormRawXMLFunction(sandbox),
    buildDocumentByTemplate: buildDocumentByTemplateFunction(sandbox),
    getMessageBus: getMessageBusFunction(sandbox),
    buildGraphByModelData: buildGraphByModelDataFunction(sandbox),
    generateQRCode: generateQRCodeFunction(sandbox),
    geojson2kml: geojson2kml(),
    gjv: gjvFunction(sandbox),
    who: () => 'portal',
  };
};
