import { isEmpty } from 'lodash/lang';
import { assign, pick } from 'lodash/object';

import PlasticineApi from '../../../api';
import store from '../../../store';
import RecordProxy from './record/index';
import UserProxy from './current-user';
import actionsNamespace from './actions';
import uiUtilsNamespace from './ui-utils';
import logNamespace from './log';
import getUIObject from './ui-object';
import getRecord from './get-record';

const CHART_CONTEXT_KEYS = [
  'chartdiv',
  'scope',
  'am4core',
  'am4charts',
  'am4maps',
  'am4themes_animated',
  'am4geodata_worldLow',
  'am4plugins_forceDirected',
  'am4plugins_sunburst',
  'am5',
  'am5flow',
  'am5map',
  'am5hierarchy',
  'am5xy',
  'am5radar',
  'am5percent',
  'am5stock',
  'am5themes_Animated',
  'am5geodata_worldLow',
  'am5plugins_exporting',
];

export default (context = {}, sandbox) => {
  const { user, record, appSettings, uiObject } = context;
  const chartContext = { ...pick(context, CHART_CONTEXT_KEYS) };

  const p = {
    getRecord,
    client: 'web',
    actions: actionsNamespace(),
    uiCoreWebApi: PlasticineApi,
    uiUtils: uiUtilsNamespace(sandbox),
    log: logNamespace(),
    store: store.redux.instance,
    getSetting: (name) => appSettings[name],
    getSettings: () => appSettings,
    getResponse: () => context.response,
    translate: (key, options) => i18n.t(key.replace(/^static./, ''), options),
    setUIObject: (object) => p.this = getUIObject(object),
  };

  if (record) {
    if (record.getValue) {
      p.record = record
      p.action = record.metadata.inserted ? 'update' : 'create';
    } else {
      p.record = new RecordProxy(record);
    }
  }

  if (user) {
    p.currentUser = new UserProxy(user, sandbox);
  }

  if (uiObject) {
    if (p.record) {
      uiObject.options.record = p.record;
    }

    p.this = getUIObject(uiObject);
  }

  if (!isEmpty(chartContext)) {
    assign(p, chartContext);
  }

  return p;
};
