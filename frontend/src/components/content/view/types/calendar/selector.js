import moment from 'moment';

import PlasticineApi from '../../../../../api';
import normalize from '../../../../../api/normalizer';
import { processError } from '../../../../../actions/helpers';
import ProxyRecord from '../../../../../containers/content/form/proxy-record';
import Sandbox from '../../../../../sandbox';
import * as CONSTANTS from '../../../../../constants';

const DEFAULT_VIEWS = {
  month: 'month',
  week: 'isoWeek',
  day: 'day',
}

export const selectData = async (appearance, state, params) => {
  const newState = {...state, ...params};
  
  const { selectedResources, viewType, viewTypeOffset, resourcePage } = newState;
  const searchIds = selectedResources.join(',');

  // dateStart, dateEnd - default take from appearance options (current week, month or day)
  // or from UI - user click Week, Month, Day
  const { dateStart, dateEnd, dateStartUtc, dateEndUtc } = getDates(appearance.options, viewType, viewTypeOffset);
  await processResources(appearance.resources, searchIds, resourcePage);

  await processData(appearance, {
    currentModel: appearance.currentModel,
    dateStartUtc,
    dateEndUtc,
    currentViewFilter: appearance.currentViewFilter,
    resourcesIds: appearance.resources.recordsIds
  });

  return { ...appearance, dateStart, dateEnd };
}

const getDates = (options, paramsViewType, viewTypeOffset = 0) => {
  const viewType = DEFAULT_VIEWS[paramsViewType] || DEFAULT_VIEWS[options['default-view']] || 'isoWeek';

  const dStart = moment().startOf(viewType).add(viewTypeOffset, viewType);
  const dEnd = moment(dStart).endOf(viewType);

  const dateStart = dStart.format(CONSTANTS.ISO_DATE_FORMAT);
  const dateEnd = dEnd.format(CONSTANTS.ISO_DATE_FORMAT);
  const dateStartUtc = dStart.utc().format(CONSTANTS.ISO_DATE_FORMAT);
  const dateEndUtc = dEnd.utc().format(CONSTANTS.ISO_DATE_FORMAT);

  return { dateStart, dateEnd, dateStartUtc, dateEndUtc };
}

const processResources = async (resources, searchIds, resourcePage = 1) => {
  let filter = [];
  const titleElements = resources.title.match(/{(.*?)}/g);
  const resourceOptions = await processResourceOptions(resources, titleElements);

  let options = { humanize: true, sort: titleElements.join(',') };

  if (searchIds) {
    filter.push(`\`${resourceOptions.filterBy}\` IN (${searchIds})`);
  } else {
    const limit = resources.limit || 100;
    options.page = { size: limit, number: resourcePage };
  }
  if (resources.filter) filter.push(`(${resources.filter})`);
  options.filter = filter.join(' AND ');

  const { data } = await PlasticineApi.fetchRecords(resources.model, options);
  const { result, entities: db } = normalize(data);
  resources.recordsIds = lodash.compact(result[resources.model] || []);
  resources.records = data.data;
  resources.searchBarModel = resourceOptions.searchBarModel;
  resources.searchBarLabel = resourceOptions.searchBarLabel;
}

const processResourceOptions = async (resources, titleElements) => {
  // if 'title' has one field, and it is RTL - need filter by this RTL
  let resourceOptions = {
    filterBy: 'id',
    searchBarModel: resources.model,
    searchBarLabel: resources.title,
  };

  if (titleElements.length == 1) {
    let fields = await getFields(resources.model);
    const fieldAlias = titleElements[0].replace(/{|}/g, '');
    const foundField = fields.filter((f) => f.alias === fieldAlias)[0];
    if (foundField && foundField.type === 'reference_to_list') {
      const options = JSON.parse(foundField.options);
      resourceOptions.filterBy = fieldAlias;
      resourceOptions.searchBarModel = options.foreign_model;
      resourceOptions.searchBarLabel = options.foreign_label;
    }
  }

  return resourceOptions;
}

const getFields = async (modelAlias) => {
  const { data: { data: fields } } = await PlasticineApi.loadFields(modelAlias);
  return fields;
}

const processData = async (appearObj, params) => {
  const TYLE_TYPES = ['side', 'background', 'border'];

  for (let i in appearObj.data) {
    appearObj.data[i].records = await processDataRecords(appearObj.data[i], params);
    for (const record of appearObj.data[i].records) {
      for (const tyleType of TYLE_TYPES) {
        if (lodash.isEmpty(appearObj.data[i].tile.props[tyleType])) next;
        await processRules(appearObj.data[i].tile.props[tyleType].options, record);
      }
    }
  }
}

const processDataRecords = async (dataObj, params) => {
  const { type = 'local' } = dataObj;
  const modelAlias = type == 'local' ? params.currentModel.alias : dataObj.model;
  const options = getOptions(dataObj, type, params);
  dataObj.modelAlias = modelAlias;

  return await getRecords(modelAlias, options);
}

const getOptions = (el, type, params) => {
  let filter = `((\`${el.start}\` >= '${params.dateStartUtc}' AND \`${el.start}\` <= '${params.dateEndUtc}') OR
    (\`${el.end}\` >= '${params.dateStartUtc}' AND \`${el.end}\` <= '${params.dateEndUtc}') OR
    (\`${el.start}\` <= '${params.dateStartUtc}' AND \`${el.end}\` >= '${params.dateEndUtc}'))`;
  if (el.resource && !lodash.isEmpty(params.resourcesIds)) {
    filter = `${filter} AND \`${el.resource}\` IN (${params.resourcesIds})`;
  }

  if (type == 'local' && !lodash.isEmpty(params.currentViewFilter)) {
    filter = `${filter} AND ${params.currentViewFilter}`;
  }

  return { filter: el.filter ? `${el.filter} AND ${filter}` : filter, humanize: true };
}

const getRecords = async (modelAlias, options) => {
  try {
    const { data } = await PlasticineApi.fetchRecords(modelAlias, options);
    let fields = await getFields(modelAlias);
     // just ignore access rule
    lodash.map(fields, field => {
      field.__access = true;
      field.__update = true;
    });
    return lodash.map(data.data, rec => {
      const proxyRecord =  new ProxyRecord(rec.attributes, { fields, human_attributes: rec.human_attributes });
      const sandbox = new Sandbox({ record: proxyRecord, user: null });
      proxyRecord.__assignSandbox(sandbox);
      return proxyRecord;
    });
  } catch (error) {
    processError(error);
    return [];
  }
}

const processRules = async (options, record) => {
  lodash.map(options, async option => {
    option.recordIds = option.recordIds || [];
    const sandbox = new Sandbox({ record });
    const resScript = await sandbox.executeScript(option.rule, {}, 'condition');
    if (resScript) option.recordIds.push(record.id);
  });
}
