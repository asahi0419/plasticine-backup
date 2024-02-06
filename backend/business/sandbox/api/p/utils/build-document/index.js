import { forEach, isEmpty } from "lodash-es";
import moment from "moment";
import PDFMerger from 'pdf-merger-js';

import db from "../../../../../../data-layer/orm/index.js";
import logger from "../../../../../logger/index.js";
import { findRecordAttachments } from "../../../model/record/index.js";
import buildDocumentByTemplParams from "../../get-request/document-template.js";
import { RecordNotFoundError } from "../../../../../error/index.js";
import AttachmentProxy from "../../../model/record/attachment.js";
import Selector from "../../../../../record/fetcher/selector.js";
import * as SETTING from "../../../../../../business/setting/index.js";
import { hasAttachmentTab } from "./helper.js";
import { DEFAULT_DATE_FORMAT } from "../../../../../constants/index.js";
import { imageStyleEmbeddedViewParams } from "../get-form-rawxml/embedded-view.js";
import { imageStyleRelatedViewParams } from "../get-form-rawxml/related-view.js";
import { lockPdf } from "../../../utils/build-pdf-by-template/index.js";

const postProcessEmbeddedViewImages = (sandbox) => async (buffer, imageStyleEmbeddedViewParams={}, options) => {
  try {
    let mappingResult = {};
    const img_json = options.orientation === 'portrait'? {
      dimensions: {
        width: 733,
        height: 412
      }
    }: {
      dimensions: {
        width: 1000,
        height: 560
      }
    };

    let promises = [];
    for (let [_, params] of Object.entries(imageStyleEmbeddedViewParams)) {
      const viewModel = await sandbox.vm.p.getModel("view");
      const viewRecord = await viewModel.findOne({alias: params.options.viewAlias});
      promises.push(viewRecord.getImageBuffer());
    }

    let imageList = [];
    try {
      imageList = await Promise.all(promises);
    } catch (error) {
      return false;
    }  

    let i = 0;
    for (let [_, params] of Object.entries(imageStyleEmbeddedViewParams)) {
      const image = imageList[i];
      const image_base64 = `data:image/png;base64,${image.toString('base64')}`;
      mappingResult = { ...mappingResult, [params.placeholderID]: { image: image_base64, dimensions: img_json.dimensions }};
      i++;
    }

console.log(mappingResult)
    const docx = await sandbox.vm.utils.buildDocxByTemplate(buffer, mappingResult, { imageDimensions: img_json.dimensions.width, mode: 'attachment' });
    return docx;
  } catch (error) {
    return false;
  }
}

const updateBuildDocumentByTemplParams = (
  targetParam = { type: "view", modelAlias: "", viewAlias: "", recordId }
) => {
  buildDocumentByTemplParams.forEach((param) => {
    if (param.type === "view") {
      if (
        param.modelAlias === targetParam.modelAlias &&
        param.viewAlias === targetParam.viewAlias
      ) {
        param.executed = true;
      }
    } else if (param.type === "form") {
      if (
        param.modelAlias === targetParam.modelAlias &&
        param.recordId === targetParam.recordId
      ) {
        param.executed = true;
      }
    }
  });
}

const trimFileExtension = (x = "") => {
  return x.replace(/\.[^/.]+$/, "");
}

const getMediaAttachments = async (sandbox, model, record) => {
  const exportFormPhotosMax =
    SETTING.getSetting("limits.export_form_photos_max") || 100;
  let latestAttachments = await findRecordAttachments(model, record, {
    last_version: true
  });
  latestAttachments = latestAttachments.reverse();
  let counter=0;
  let mediaAttachments = [];
  forEach(latestAttachments, function (attachment) {
    if (counter >= exportFormPhotosMax) return false;
    if (attachment.file_content_type) {
      if (
        [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/tiff",
          "image/gif"
        ].includes(attachment.file_content_type)
      )
        {
          mediaAttachments.push(attachment);
          counter++;
        }
    }
  });
  return mediaAttachments.map((attachment) => {
    return new AttachmentProxy(attachment, model, sandbox);
  });
}

const getOrReplaceData = (data) => {
  const result = isEmpty(data) ? "" : data;
  return result;
}

function calcTimeByTimeZone(utc, offset) {
  return new Date(utc + 3600000 * offset).toISOString();
}

const generateMediaMapping = async (
  attachments = [],
  mediaColumnsCount = 2,
  mediaMappingResult
) => {
  try {
    let mapping = { loop1: [] };
    const { field_date_time } = SETTING.getSetting("format");
    const dtFormat = field_date_time ? field_date_time : DEFAULT_DATE_FORMAT;

    const rowsCount = Math.ceil(attachments.length / mediaColumnsCount);
    let rowData = {};
    for (let i = 0; i < rowsCount; i++) {
      rowData = {};
      let mediaRow = [
        {
          Img1: {
            image: ""
          },
          file_name1: "",
          created_by1: "",
          created_at1: "",
          latitude1: "",
          longitude1: ""
        },
        {
          Img2: {
            image: ""
          },
          file_name2: "",
          created_by2: "",
          created_at2: "",
          latitude2: "",
          longitude2: ""
        },
        {
          Img3: {
            image: ""
          },
          file_name3: "",
          created_by3: "",
          created_at3: "",
          latitude3: "",
          longitude3: ""
        },
        {
          Img4: {
            image: ""
          },
          file_name4: "",
          created_by4: "",
          created_at4: "",
          latitude4: "",
          longitude4: ""
        }
      ];
      for (let j = 0; j < mediaColumnsCount; j++) {
        const cellIndex = i * mediaColumnsCount + j;
        if (cellIndex < attachments.length) {
          const bufferToString = (
            await attachments[cellIndex].getBuffer()
          ).toString("base64");
          mediaRow[j][`Img${j + 1}`][
            "image"
          ] = `data:image/png;base64,${bufferToString}`;
          mediaRow[j][`file_name${j + 1}`] = getOrReplaceData(
            attachments[cellIndex].originalRecord.file_name
          );
          const user = await db
            .model("user")
            .where({ id: attachments[cellIndex].originalRecord.created_by })
            .getOne();
          mediaRow[j][`created_by${j + 1}`] =
            getOrReplaceData(user.name) + " " + getOrReplaceData(user.surname);
          mediaRow[j][`created_at${j + 1}`] = moment(
            calcTimeByTimeZone(
              new Date(
                attachments[cellIndex].originalRecord.created_at
              ).getTime(),
              mediaMappingResult.user_timezone
            )
          ).format(dtFormat);
          mediaRow[j][`latitude${j + 1}`] = attachments[cellIndex]
            .originalRecord.p_lat
            ? attachments[cellIndex].originalRecord.p_lat
            : "No latitude";
          mediaRow[j][`longitude${j + 1}`] = attachments[cellIndex]
            .originalRecord.p_lon
            ? attachments[cellIndex].originalRecord.p_lon
            : "No longitude";
        }
        rowData = { ...rowData, ...mediaRow[j] };
      }
      mapping.loop1.push(rowData);
    }
    return mapping;
  } catch (error) {
    logger.error(error);
  }
};

const generateByTemplateRecord = async (
  sandbox,
  record,
  mappingResult,
  filename,
  options = { mediaColumnsCount: 2, mode: "buffer" }
) => {
  let buffer,
    imageDimensions = { height: 300, width: 300 };
  const targetModel = await sandbox.vm.p.getModel("document_template");
  targetModel.setOptions({ check_permission: { query: false } });
  const targetRecord = await targetModel.findOne({ alias: record.alias });
  const template = await targetRecord.getAttachmentByName(
    record["export_template"]
  );

  switch (true) {
    case options.mediaColumnsCount === 3:
      imageDimensions = { height: 300, width: 300 };
      break;
    case options.mediaColumnsCount === 4:
      imageDimensions = { height: 220, width: 220 };
      break;
    default:
      break;
  }

  if (!options.hasOwnProperty("imageStyleEmbeddedViewParams") && !options.hasOwnProperty("imageStyleRelatedViewParams")) {
    if (record["format"] === "docx") {
      buffer = await sandbox.vm.utils.buildDocxByTemplate(
        template,
        mappingResult,
        {
          fileName: filename,
          imageDimensions: imageDimensions,
          mode: options.mode
        }
      );
    } else {
      buffer = await sandbox.vm.utils.buildPDFByTemplate(
        template,
        [mappingResult],
        {
          fileName: trimFileExtension(filename),
          imageDimensions: imageDimensions,
          mode: options.mode
        }
      );
    }
  } else {
    buffer = await sandbox.vm.utils.buildDocxByTemplate(
      template,
      mappingResult,
      {
        fileName: filename,
        imageDimensions: imageDimensions,
        mode: options.mode
      }
    );
    const result = await postProcessEmbeddedViewImages(sandbox)(buffer, {... options.imageStyleEmbeddedViewParams, ...options.imageStyleRelatedViewParams }, { orientation: options.orientation });
    if (!result) return buffer;
    if (record["format"] === "docx") {
      buffer = await result.getBuffer();
      return buffer;
    }
    const pdf = await sandbox.vm.utils.convertAttachment(result, 'pdf');
    const lockedPdfBuffer = await lockPdf(pdf.buffer);
    const merger = new PDFMerger();
    merger.add(lockedPdfBuffer);
    buffer =  await merger.saveAsBuffer();
  }

  return buffer;
};

export default (sandbox) =>
  async (
    recordAlias,
    options = {
      /*modelAlias: '', viewAlias: '', recordId, mediaColumnsCount: 2, userTimezone: 0, mode: 'buffer'*/
    }
  ) => {
    try {
      // check arguments
      const documentTemplateRecord = await db
        .model("document_template")
        .where({ alias: recordAlias, active: true })
        .getOne();

      // check existence
      if (isEmpty(documentTemplateRecord)) {
        logger.error(
          `Record ${recordAlias} not exist in Document Templates model.`
        );
      }

      const exportTemplateName = documentTemplateRecord["export_template"];
      if (isEmpty(exportTemplateName)) {
        logger.error(
          `Record ${recordAlias} not exist in Document Templates model.`
        );
      }

      if (isEmpty(options)) {
        const attachmentRecord = await db
          .model("attachment")
          .where({ file_name: exportTemplateName })
          .getOne();
        return {
          attributes: {
            id: attachmentRecord.id,
            file_name: attachmentRecord.file_name
          }
        };
      }

      let buffer, name;
      if (options.modelAlias) {
        // get model
        const buildModel = await db
          .model("model")
          .where({ alias: options.modelAlias })
          .getOne();
        if (isEmpty(buildModel)) {
          logger.error(`Model ${options.modelAlias} not exist.`);
        }

        if (isEmpty(documentTemplateRecord["js_mapping_script"])) {
          logger.error(`Record ${recordAlias} don't have js mapping script.`);
        }

        if (options.viewAlias) {
          const view = await db
            .model("view")
            .where({ model: buildModel.id, alias: options.viewAlias })
            .getOne();

          switch (true) {
            case view.type === "grid":
              try {
                buildDocumentByTemplParams.push({
                  type: "view",
                  viewType: "grid",
                  executed: false,
                  timestamp: Math.round(new Date().getTime() / 1000),
                  modelAlias: options.modelAlias,
                  viewAlias: options.viewAlias,
                  record: options.record,
                  userTimezone: options.userTimezone || null
                });
                // execute mapping
                const mappingResult = await sandbox.executeScript(
                  documentTemplateRecord.js_mapping_script,
                  `documentTemplateRecord/${documentTemplateRecord.id}/js_mapping_script`,
                  {},
                  { use_timeout: false }
                );
                // if mapping script return error, return the error as a result
                if (
                  !mappingResult.hasOwnProperty("view") &&
                  !mappingResult.hasOwnProperty("form")
                ) {
                  return mappingResult;
                }
                updateBuildDocumentByTemplParams({
                  type: "view",
                  modelAlias: options.modelAlias,
                  viewAlias: options.viewAlias
                });
                name = `${options.modelAlias}_${trimFileExtension(
                  documentTemplateRecord["export_template"]
                )}_${Math.round(new Date().getTime() / 1000)}.${
                  documentTemplateRecord["format"]
                }`;
                buffer = await generateByTemplateRecord(
                  sandbox,
                  documentTemplateRecord,
                  mappingResult,
                  name,
                  options
                );
              } catch (error) {
                updateBuildDocumentByTemplParams({
                  type: "view",
                  modelAlias: options.modelAlias,
                  viewAlias: options.viewAlias
                });
                return error;
              }
              break;
            case ["map", "topology", "chart"].includes(view.type):
              try {
                buildDocumentByTemplParams.push({
                  type: "view",
                  viewType: "image",
                  executed: false,
                  timestamp: Math.round(new Date().getTime() / 1000),
                  modelAlias: options.modelAlias,
                  viewAlias: options.viewAlias,
                  record: options.record,
                  userTimezone: options.userTimezone || null
                });
                // execute mapping
                const mappingResult = await sandbox.executeScript(
                  documentTemplateRecord.js_mapping_script,
                  `documentTemplateRecord/${documentTemplateRecord.id}/js_mapping_script`,
                  {},
                  { use_timeout: false }
                );
                updateBuildDocumentByTemplParams({
                  type: "view",
                  modelAlias: options.modelAlias,
                  viewAlias: options.viewAlias
                });

                if (!mappingResult.hasOwnProperty("image")) {
                  return mappingResult;
                }
                name = `${options.modelAlias}_${trimFileExtension(
                  documentTemplateRecord["export_template"]
                )}_${Math.round(new Date().getTime() / 1000)}.${
                  documentTemplateRecord["format"]
                }`;
                buffer = await generateByTemplateRecord(
                  sandbox,
                  documentTemplateRecord,
                  mappingResult,
                  name,
                  options
                );
              } catch (error) {
                updateBuildDocumentByTemplParams({
                  type: "view",
                  modelAlias: options.modelAlias,
                  viewAlias: options.viewAlias
                });
                return error;
              }
              break;
          }
        } else if (options.recordId) {
          const [record] = await new Selector(buildModel, sandbox, {
            includeNotInserted: true,
            ignorePermissions: false
          }).fetch(`id = ${options.recordId}`);
          if (!record) throw new RecordNotFoundError();
          buildDocumentByTemplParams.push({
            type: "form",
            executed: false,
            timestamp: Math.round(new Date().getTime() / 1000),
            modelAlias: options.modelAlias,
            recordId: options.recordId,
            fields: options.fields,
            userTimezone: options.userTimezone || null,
            relatedViews: options.relatedViews
          });
          // execute mapping
          let mappingResult = await sandbox.executeScript(
            documentTemplateRecord.js_mapping_script,
            `documentTemplateRecord/${documentTemplateRecord.id}/js_mapping_script`,
            {},
            { use_timeout: false }
          );
          // if mapping script return error, return the error as a result
          if (
            !mappingResult.hasOwnProperty("form") &&
            !mappingResult.hasOwnProperty("view")
          ) {
            return mappingResult;
          }
          updateBuildDocumentByTemplParams({
            type: "form",
            modelAlias: options.modelAlias,
            recordId: options.recordId
          });

          // Load media
          const mediaColumnsCount = options.mediaColumnsCount || 2;
          const canViewAttachment = await sandbox.vm.p.currentUser.canViewAttachment(buildModel.id)
          const attachmentStatus = await hasAttachmentTab(
            sandbox,
            options.modelAlias,
            options.recordId,
            options
          );
          let mediaMappingResult;
          if (canViewAttachment && attachmentStatus) {
            const mediaAttachments = await getMediaAttachments(
              sandbox,
              buildModel,
              record
            );
            mediaMappingResult = await generateMediaMapping(
              mediaAttachments,
              mediaColumnsCount,
              mappingResult
            );
          }
          name = `${options.modelAlias}_${trimFileExtension(
            documentTemplateRecord["export_template"]
          )}_${Math.round(new Date().getTime() / 1000)}.${
            documentTemplateRecord["format"]
          }`;
          buffer = canViewAttachment && attachmentStatus
            ? await generateByTemplateRecord(
                sandbox,
                documentTemplateRecord,
                { ...mappingResult, ...mediaMappingResult },
                name,
                { mediaColumnsCount: mediaColumnsCount, ...options, imageStyleEmbeddedViewParams, imageStyleRelatedViewParams , orientation: options.orientation }
              )
            : await generateByTemplateRecord(
                sandbox,
                documentTemplateRecord,
                mappingResult,
                name,
                { ...options, imageStyleEmbeddedViewParams, imageStyleRelatedViewParams, orientation: options.orientation }
              );
        }
      }
      const result = {
        buffer: buffer,
        fileName: name,
        format: documentTemplateRecord["format"]
      };
      return result;
    } catch (error) {
      logger.error(error);
      return error;
    }
  };
