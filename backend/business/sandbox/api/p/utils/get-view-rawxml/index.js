import { isEmpty, isObject, pick } from "lodash-es";
import db from "../../../../../../data-layer/orm/index.js";
import Fetcher from "../../../../../record/fetcher/index.js";
import generateGridViewRawXml from "./gridview.js";
import {
  ParamsNotValidError,
  NoPermissionsError
} from "../../../../../error/index.js";
import * as SETTING from "../../../../../../business/setting/index.js";
import Selector from "../../../../../record/fetcher/selector.js";
import { loadFields, serializer } from '../../../../../../presentation/server/api/commands/load/helpers.js';
import logger from "../../../../../logger/index.js";

export const loadView = (sandbox) => async (model, viewAlias) => {
  try {
    let view = await db
    .model("view")
    .where({ model: model.id, alias: viewAlias })
    .getOne();
  
    if (isEmpty(view)) {
      throw new ParamsNotValidError("Wrong view alias");
    }
  
    // check existence
    if (isEmpty(view)) {
      // Query the 1st available according to the order
      view = await db
        .model("view")
        .where({ model: model.id })
        .orderBy("id", "desc")
        .getOne();
    }
    const result = await sandbox.executeScript(
      view["condition_script"],
      `view/${view.id}/condition_script`,
      { modelId: model.id },
    );
  
    if (!result) {
      throw new NoPermissionsError(
        `View ${view.id} has no ability to produce data because of view condition_script ${view["condition_script"]}.`
      );
    }
  
    return view;
  } catch (error) {
    logger.error(error);
    return null;
  }

}
const getLayout = (p) => async (record_id, exec_by) => {
  const layoutModel = await p.getModel('layout');
  layoutModel.setOptions({ includeNotInsertedRecords: true });
  const layout = await layoutModel.findOne({ id: record_id });
  const userSettingModel = await p.getModel('user_setting');
  const customizedLayout = await userSettingModel
    .findOne({
      user: p.currentUser.getValue('id'),
      model: layoutModel.getValue('id'),
      type: exec_by.type,
      record_id,
    });
  if (customizedLayout) {
    let mergedOptions = JSON.parse(customizedLayout.getValue('options')), pickedOptions = {}, layoutOptions = {};
    try {
      layoutOptions = JSON.parse(layout.getValue('options'));
      pickedOptions = pick(layoutOptions, ['wrap_text', 'no_wrap_text_limit']);
      mergedOptions = { ...mergedOptions, ...pickedOptions };
    } catch (error) {
      logger.error(error);
    }
    layout.setValue('options', JSON.stringify(mergedOptions));
  }

  return layout;
}

export default (sandbox) =>
  async (modelAlias, viewAlias, options = {exec_by: {}, filter: "", sort: "id"}) => {
    try {
      if (isEmpty(modelAlias) && isEmpty(viewAlias)) {
        throw new ParamsNotValidError(
          "required model and view alias are not filled"
        );
      } else if (isEmpty(modelAlias)) {
        throw new ParamsNotValidError("required model alias not filled");
      } else if (isEmpty(viewAlias)) {
        throw new ParamsNotValidError("required view alias not filled");
      } else if (!isObject(options)) {
        throw new ParamsNotValidError("Wrong params");
      }
      // check arguments
      const model = await db
        .model("model")
        .where({ alias: modelAlias })
        .getOne();
      if (isEmpty(model)) {
        throw new ParamsNotValidError("Wrong model alias");
      }

      let view = await loadView(sandbox)(model, viewAlias);


      switch (view.type) {
        case "grid":
          const layout = await getLayout(sandbox.vm.p)(view.layout, options.exec_by)
          const filter = await db
            .model("filter")
            .where({ id: view.filter })
            .getOne();

          if (
            !isEmpty(filter) &&
            isEmpty(options["filter"]) &&
            !isEmpty(filter["query"])
          ) {
            options.filter = filter["query"];
          }

          let fields = await loadFields(model, sandbox, { accessible: true });
          fields = serializer(fields, 'field', { translate: ['name', 'options', 'hint'], sandbox });

          const exportRecordsDocxPdfMax = SETTING.getSetting(
            "limits.export_records_docx_pdf_max"
          );
          const { hidden_filter, date_trunc } = options;
          const { tableName } = db.model(model);
          const selectorOptions = {
            select: `${tableName}.id`,
            dateTruncPrecision: date_trunc
          };
          const scope = await new Selector(
            model,
            sandbox,
            selectorOptions
          ).getScope(options.filter, hidden_filter);
          const count = await scope.scope.count();

          let trucCount =
            count > exportRecordsDocxPdfMax ? exportRecordsDocxPdfMax : count;
          trucCount = trucCount !== 0 ? trucCount : 100; 
          let { records } = await new Fetcher(model, sandbox, {
            page: { size: trucCount },
            humanize: true,
            ...options
          }).fetch();
          let humanizedRecords = []
          records.map((r) => {
            let hRecord = { ...r, ...r.__humanAttributes };
            delete hRecord.__humanAttributes;
            humanizedRecords.push(hRecord)
          })

          const data = await generateGridViewRawXml(
            layout.attributes,
            fields,
            filter,
            humanizedRecords,
            options
          );

          return data;

        case "map":
          throw new Error("This type of view (map view) is not supported");

        case "chart":
          throw new Error("This type of view (chart view) is not supported");
      }
    } catch (error) {
      return error;
    }
  };
