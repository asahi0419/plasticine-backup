import { map, isObject, isEmpty } from "lodash-es";

import db from '../../../../../../data-layer/orm/index.js';
import { genRawXmlByTemplate } from "../get-view-rawxml/gridview.js";
import { TabXmlTemplate, ImagePlaceholderTemplate } from "./form-templates.js";
import logger from '../../../../../logger/index.js';
import { ModelNotFoundError } from "../../../../../error/index.js";
import { loadView } from "../get-view-rawxml/index.js";

export var imageStyleRelatedViewParams = [];

const buildComponentName = (component = {}) => {
    const { options = {}, model = {}, field = {}, view = {} } = component

    if (options.name) {
      return options.name;
    }

    if (field.type === 'reference_to_list') {
      return `${field.name} [${view.name}] (${model.plural || model.name}) RTL`;
    } else {
      let result = model.plural || model.name;
      if (view.name) result += ` [${view.name}]`;

      return result;
    }
  }

const isRTL = (component) => {
    const { type: fieldType } = component.field;

    return fieldType === 'reference_to_list';
}

const getIds = (props) => {
    const { options: { field }, record } = props;
  
    if (field && field.type === 'reference_to_list') {
      return record[field.alias] || [];
    }
  
    return [];
}

const getHiddenFilter = (props) => {
    const { options: { field, type }, type: viewType, model, record } = props;
    if (type === 'any_model') return;
  
    if (field && field.type === 'reference_to_list') {
      if (viewType === 'rtl') {
        // return `(RTL_VIEW_FILTER ${field.id} ${record.id})`; // https://redmine.nasctech.com/issues/65213
        const ids = getIds(props);
        return `\`id\` IN (${ids.length ? ids.join(',') : -1})`;
      } else {
        return `\`${field.alias}\` IN (${record.id})`
      }
    }
  
    const column = field ? field.alias : 'id';
    const value = field && field.type === 'global_reference' ? `'${model.id}/${record.id}'` : record.id;
  
    return (props.options.model === 'attachment')
      ? `(\`${column}\` = ${value}) AND (target_record = '${[model.id, record.id].join('/')}')`
      : `\`${column}\` = ${value}`;
}

export const getParams = (props) => {
    const { options: { field, view = {} }, type, parent, model, record } = props;
    const embedded_to = { container: 'form', model: model.alias, model_id: model.id, record_id: record.id };
    if (type === 'rtl') embedded_to.field = field.alias;
  
    return {
      filter: view.filter,
      hidden_filter: getHiddenFilter(props),
      exec_by: { type, alias: view.alias, name: view.name, parent },
      embedded_to,
      ids: getIds(props),
    };
}

export async function getOptions(options) {
  const { embedded_to } = options;

  if (isObject(embedded_to)) {
    const model = db.getModel(embedded_to.model, { silent: true });
    const record = (model && embedded_to.record_id) ? await db.model(model.alias).where({ id: embedded_to.record_id }).getOne() : null;
    embedded_to.model = model ? model.id : null;
    embedded_to.record_id = record ? record.id : null;
  }

  options.humanize = ['true', true].includes(options.humanize);

  return options;
}

const swapClientParams = (propsList, optionsList, relatedViews) => {
  let newOptionsList = [], isExist=false;
  for (let i=0; i < optionsList.length; i++) {
    isExist = false;
    for (let [key, relatedView] of Object.entries(relatedViews)) {
      if (propsList[i].modelAlias === relatedView.modelAlias && propsList[i].viewAlias === relatedView.viewAlias) {
        isExist = true;
        newOptionsList.push(relatedView.options);
        break;
      }
    }
    if (!isExist) newOptionsList.push(optionsList[i]);
  }
  return newOptionsList;
}
export const isValidXml = (xml) => {
  return xml.toString().startsWith("<w:tbl>") || xml.toString().startsWith("<w:p>");
}

export const generateRelatedViewXml = (sandbox) => async (related_components = { list: [], options: {} }, data, relatedViews=[]) => {
  let xml = "";
  try {
      const { list = [], options = {} } = related_components;

      if (!list.length) return '';

      const components = map(list, (component = {}, key) => {
          const componentOptions = options[component.id] || {};
          return { ...component, options: componentOptions, key };
      });
      const parent = { type: 'form', alias: data.form.attributes.alias, id: data.form.id };
      const { nhRecord } = data;
      const { model } = data.req;

      let defaultParams = [], propsList = [];
      components.map((component) => {
          const type = isRTL(component) ? 'rtl' : 'related_view';
          const paramsProps = { options: component, type, parent, model, record: nhRecord};
          const props = {
            context: type,
            modelAlias: component.model?.alias,
            viewAlias: component.view?.alias,
            params: getParams(paramsProps),
          };
          props.params = { ...props.params, humanize: true };
          defaultParams.push(getOptions(props.params));
          propsList.push(props);
      })

      let optionsList = await Promise.all(defaultParams);
      optionsList = swapClientParams(propsList, optionsList, relatedViews);

      let rvXml = "", placeholderParams = {}, placeholderID, placeholderName="", placeholderCounter=10001;

      for (let i=0; i < optionsList.length; i++) {
        rvXml = "";
        try {
          const model = await db
          .model("model")
          .where({ alias: propsList[i].modelAlias })
          .getOne();

          if (isEmpty(model)) {
            throw new ModelNotFoundError();
          }
          const view = await loadView(sandbox)(model, propsList[i].viewAlias);

          if (!view) continue;
          switch (true) {
            case (["grid"].includes(view.type)):
              rvXml = await sandbox.vm.p.utils.getViewRawXML(propsList[i].modelAlias, propsList[i].viewAlias, optionsList[i]);
              if (isValidXml(rvXml)) {
                const data = {
                  name: buildComponentName(components[i])
                };
                xml += genRawXmlByTemplate(TabXmlTemplate, data);
              } else {
                rvXml = "";
              }
              break;
            case (["map","topology", "chart"].includes(view.type)):
              placeholderID = `${view.type}Image${placeholderCounter}`;
              placeholderName = `{%${placeholderID}}`;
              placeholderCounter++;
              placeholderParams = {
                  placeholderID,
                  placeholderName,
                  options: {
                      modelAlias: propsList[i].modelAlias,
                      viewAlias: propsList[i].viewAlias,
                      options: optionsList[i]
                  }
              };
              const data = {
                name: buildComponentName(components[i])
              };
              xml += genRawXmlByTemplate(TabXmlTemplate, data);
              rvXml = genRawXmlByTemplate(ImagePlaceholderTemplate, {
                  placeholderName
              });
              imageStyleRelatedViewParams.push(placeholderParams);
              break;
          }
        } catch (error) {
          logger.error(error);
        }
        xml += rvXml;
      }
   } catch (error) {
     logger.error(error);
  }
   return xml;
}