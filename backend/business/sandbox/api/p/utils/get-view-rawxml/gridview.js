import XMLWriter from "xml-writer";
import { isNil, isEmpty, pick } from "lodash-es";

import { GridBaseTemplate, GridNoRecords } from "./grid-view-template.js";
import logger from "../../../../../logger/index.js";

const DEFAULT_NO_WRAP_TEXT_LIMIT = 50;

export function genRawXmlByTemplate(template, data = {}) {
  if (!template.includes("{") && !template.includes("}"))
    template = `{${template}}`;
  const pattern = /{\s*(\w+?)\s*}/g; // {property}
  return template.replace(pattern, (_, token) => {
    return !isEmpty(data) && data.hasOwnProperty(token) && data[token]
      ? data[token]
      : "";
  });
}

var data = {
  grid_cols: "",
  header_row: "",
  body_rows: ""
};

data.grid_cols = ``;
data.header_row = ``;
data.body_rows = ``;

const formatValue = (value, options) => {
  try {
    if (!value) return value;
    if (!options.wrap_text) {
      const textLimit = options.no_wrap_text_limit || DEFAULT_NO_WRAP_TEXT_LIMIT;
      return value.length > textLimit ? `${value.substring(0, textLimit)}...` : value;
    }
  
    return value;
  } catch (error) {
    logger.error(error);
    return value;
  }
}

const mapFieldAliasToName = (fields = [], fieldsOptions) => {
  let table;
  fields.map((f) => {
    table = { ...table, [f.attributes.alias]: { name: f.attributes.name } };
  });
  table = { ...table, ...fieldsOptions };
  return table;
};

const generateGridViewData = (
  columns = [],
  records = [],
  fields = [],
  options = { columns_options: {}, wrap_text: false, no_wrap_text_limit: DEFAULT_NO_WRAP_TEXT_LIMIT }
) => {
  let fieldMapTable = mapFieldAliasToName(fields, options.columns_options);
  try {
    let xw_gridCols = new XMLWriter();
    let xw_header = new XMLWriter();
    let xw_body = new XMLWriter();
    const col_width = Math.round(8600 / columns.length).toString();
    columns.forEach(() => {
      xw_gridCols.startElement("w:gridCol").endElement();
    });
    data.grid_cols = xw_gridCols.output;

    // add header row
    xw_header
      .startElement("w:tr")
      .startElement("w:tblPrEx")
      .startElement("w:tblBorders")
      .startElement("w:top")
      .writeAttribute("w:val", "single")
      .writeAttribute("w:color", "b4c7dc")
      .writeAttribute("w:sz", "4")
      .writeAttribute("w:space", "0")
      .endElement()
      .startElement("w:left")
      .writeAttribute("w:val", "single")
      .writeAttribute("w:color", "b4c7dc")
      .writeAttribute("w:sz", "4")
      .writeAttribute("w:space", "0")
      .endElement()
      .startElement("w:bottom")
      .writeAttribute("w:val", "single")
      .writeAttribute("w:color", "b4c7dc")
      .writeAttribute("w:sz", "4")
      .writeAttribute("w:space", "0")
      .endElement()
      .startElement("w:right")
      .writeAttribute("w:val", "single")
      .writeAttribute("w:color", "b4c7dc")
      .writeAttribute("w:sz", "4")
      .writeAttribute("w:space", "0")
      .endElement()
      .startElement("w:insideH")
      .writeAttribute("w:val", "single")
      .writeAttribute("w:color", "b4c7dc")
      .writeAttribute("w:sz", "4")
      .writeAttribute("w:space", "0")
      .endElement()
      .startElement("w:insideV")
      .writeAttribute("w:val", "single")
      .writeAttribute("w:color", "b4c7dc")
      .writeAttribute("w:sz", "4")
      .writeAttribute("w:space", "0")
      .endElement()
      .endElement()
      .startElement("w:tblCellMar")
      .startElement("w:top")
      .writeAttribute("w:w", "15")
      .writeAttribute("w:type", "dxa")
      .endElement()
      .startElement("w:left")
      .writeAttribute("w:w", "15")
      .writeAttribute("w:type", "dxa")
      .endElement()
      .startElement("w:bottom")
      .writeAttribute("w:w", "15")
      .writeAttribute("w:type", "dxa")
      .endElement()
      .startElement("w:right")
      .writeAttribute("w:w", "15")
      .writeAttribute("w:type", "dxa")
      .endElement()
      .endElement()
      .endElement()
      .startElement("w:trPr")
      .startElement("w:trHeight")
      .writeAttribute("w:val", "0")
      .writeAttribute("w:hRule", "atLeast")
      .endElement()
      .startElement("w:tblHeader")
      .endElement()
      .endElement();

    columns.forEach((col) => {


      xw_header
        .startElement("w:tc")
        .startElement("w:tcPr")
        .startElement("w:tcW")
        .writeAttribute("w:w", "0")
        .writeAttribute("w:type", "auto")
        .endElement()
        .startElement("w:tcBorders")
        .startElement("w:top")
        .writeAttribute("w:val", "single")
        .writeAttribute("w:color", "B4C7DC")
        .writeAttribute("w:sz", "4")
        .writeAttribute("w:space", "0")
        .endElement()
        .startElement("w:bottom")
        .writeAttribute("w:val", "single")
        .writeAttribute("w:color", "B4C7DC")
        .writeAttribute("w:sz", "4")
        .writeAttribute("w:space", "0")
        .endElement()
        .endElement()
        .startElement("w:shd")
        .writeAttribute("w:val", "clear")
        .writeAttribute("w:color", "auto")
        .writeAttribute("w:fill", "F3F4F5")
        .endElement()
        .startElement("w:tcMar")
        .startElement("w:top")
        .writeAttribute("w:w", "55")
        .writeAttribute("w:type", "dxa")
        .endElement()
        .startElement("w:left")
        .writeAttribute("w:w", "55")
        .writeAttribute("w:type", "dxa")
        .endElement()
        .startElement("w:bottom")
        .writeAttribute("w:w", "55")
        .writeAttribute("w:type", "dxa")
        .endElement()
        .startElement("w:right")
        .writeAttribute("w:w", "55")
        .writeAttribute("w:type", "dxa")
        .endElement()
        .endElement()
        .startElement("w:vAlign")
        .writeAttribute("w:val", "center")
        .endElement()
        .endElement()
        .startElement("w:p")
        .startElement("w:pPr")
        .startElement("w:keepNext")
        .writeAttribute("w:val", "0")
        .endElement()
        .startElement("w:keepLines")
        .writeAttribute("w:val", "0")
        .endElement()
        .startElement("w:widowControl")
        .endElement()
        .startElement("w:suppressLineNumbers")
        .writeAttribute("w:val", "0")
        .endElement()
        .startElement("w:bidi")
        .writeAttribute("w:val", "0")
        .endElement()
        .startElement("w:spacing")
        .writeAttribute("w:before", "0")
        .writeAttribute("w:beforeAutospacing", "0")
        .writeAttribute("w:after", "0")
        .writeAttribute("w:afterAutospacing", "0")
        .writeAttribute("w:line", "9")
        .writeAttribute("w:lineRule", "atLeast")
        .endElement()
        .startElement("w:jc")
        .writeAttribute("w:val", "center")
        .endElement()
        .endElement()
        .startElement("w:r")
        .startElement("w:rPr")
        .startElement("w:rFonts")
        .writeAttribute("w:ascii", "Microsoft Sans Serif")
        .writeAttribute("w:hAnsi", "Microsoft Sans Serif")
        .writeAttribute("w:cs", "Microsoft Sans Serif")
        .endElement()
        .startElement("w:b")
        .endElement()
        .startElement("w:bCs")
        .endElement()
        .startElement("w:i")
        .writeAttribute("w:val", "0")
        .endElement()
        .startElement("w:iCs")
        .writeAttribute("w:val", "0")
        .endElement()
        .startElement("w:color")
        .writeAttribute("w:val", "000000")
        .endElement()
        .startElement("w:sz")
        .writeAttribute("w:val", "20")
        .endElement()
        .startElement("w:szCs")
        .writeAttribute("w:val", "20")
        .endElement()
        .startElement("w:u")
        .writeAttribute("w:val", "none")
        .endElement()
        .startElement("w:bdr")
        .writeAttribute("w:val", "none")
        .writeAttribute("w:color", "auto")
        .writeAttribute("w:sz", "0")
        .writeAttribute("w:space", "0")
        .endElement()
        .startElement("w:vertAlign")
        .writeAttribute("w:val", "baseline")
        .endElement()
        .endElement()
        .startElement("w:t")
        .text(
          fieldMapTable.hasOwnProperty(col) ? fieldMapTable[col]["name"] : col
        )
        .endElement()
        .endElement()
        .endElement()
        .endElement();
    });

    // end header row tag
    xw_header.endElement();
    data.header_row = xw_header.output;

    // add body data
    records.forEach((record) => {
      xw_body
        .startElement("w:tr")
        .startElement("w:tblPrEx")
        .startElement("w:tblBorders")
        .startElement("w:top")
        .writeAttribute("w:val", "single")
        .writeAttribute("w:color", "b4c7dc")
        .writeAttribute("w:sz", "4")
        .writeAttribute("w:space", "0")
        .endElement()
        .startElement("w:left")
        .writeAttribute("w:val", "single")
        .writeAttribute("w:color", "b4c7dc")
        .writeAttribute("w:sz", "4")
        .writeAttribute("w:space", "0")
        .endElement()
        .startElement("w:bottom")
        .writeAttribute("w:val", "single")
        .writeAttribute("w:color", "b4c7dc")
        .writeAttribute("w:sz", "4")
        .writeAttribute("w:space", "0")
        .endElement()
        .startElement("w:right")
        .writeAttribute("w:val", "single")
        .writeAttribute("w:color", "b4c7dc")
        .writeAttribute("w:sz", "4")
        .writeAttribute("w:space", "0")
        .endElement()
        .startElement("w:insideH")
        .writeAttribute("w:val", "single")
        .writeAttribute("w:color", "b4c7dc")
        .writeAttribute("w:sz", "4")
        .writeAttribute("w:space", "0")
        .endElement()
        .startElement("w:insideV")
        .writeAttribute("w:val", "single")
        .writeAttribute("w:color", "b4c7dc")
        .writeAttribute("w:sz", "4")
        .writeAttribute("w:space", "0")
        .endElement()
        .endElement()
        .startElement("w:shd")
        .writeAttribute("w:val", "clear")
        .endElement()
        .startElement("w:tblCellMar")
        .startElement("w:top")
        .writeAttribute("w:w", "15")
        .writeAttribute("w:type", "dxa")
        .endElement()
        .startElement("w:left")
        .writeAttribute("w:w", "15")
        .writeAttribute("w:type", "dxa")
        .endElement()
        .startElement("w:bottom")
        .writeAttribute("w:w", "15")
        .writeAttribute("w:type", "dxa")
        .endElement()
        .startElement("w:right")
        .writeAttribute("w:w", "15")
        .writeAttribute("w:type", "dxa")
        .endElement()
        .endElement()
        .endElement()
        .startElement("w:trPr")
        .startElement("w:trHeight")
        .writeAttribute("w:val", "0")
        .writeAttribute("w:hRule", "atLeast")
        .endElement()
        .endElement();

      columns.forEach((col) => {

        xw_body
          .startElement("w:tc")
          .startElement("w:tcPr")
          .startElement("w:tcW")
          .writeAttribute("w:w", "0")
          .writeAttribute("w:type", "auto")
          .endElement()
          .startElement("w:tcBorders")
          .startElement("w:top")
          .writeAttribute("w:val", "single")
          .writeAttribute("w:color", "B4C7DC")
          .writeAttribute("w:sz", "4")
          .writeAttribute("w:space", "0")
          .endElement()
          .startElement("w:bottom")
          .writeAttribute("w:val", "single")
          .writeAttribute("w:color", "B4C7DC")
          .writeAttribute("w:sz", "4")
          .writeAttribute("w:space", "0")
          .endElement()
          .endElement()
          .startElement("w:shd")
          .writeAttribute("w:val", "clear")
          .endElement()
          .startElement("w:tcMar")
          .startElement("w:top")
          .writeAttribute("w:w", "55")
          .writeAttribute("w:type", "dxa")
          .endElement()
          .startElement("w:left")
          .writeAttribute("w:w", "55")
          .writeAttribute("w:type", "dxa")
          .endElement()
          .startElement("w:bottom")
          .writeAttribute("w:w", "55")
          .writeAttribute("w:type", "dxa")
          .endElement()
          .startElement("w:right")
          .writeAttribute("w:w", "55")
          .writeAttribute("w:type", "dxa")
          .endElement()
          .endElement()
          .startElement("w:vAlign")
          .writeAttribute("w:val", "center")
          .endElement()
          .endElement()
          .startElement("w:p")
          .startElement("w:pPr")
          .startElement("w:keepNext")
          .writeAttribute("w:val", "0")
          .endElement()
          .startElement("w:keepLines")
          .writeAttribute("w:val", "0")
          .endElement()
          .startElement("w:widowControl")
          .endElement()
          .startElement("w:suppressLineNumbers")
          .writeAttribute("w:val", "0")
          .endElement()
          .startElement("w:bidi")
          .writeAttribute("w:val", "0")
          .endElement()
          .startElement("w:spacing")
          .writeAttribute("w:before", "0")
          .writeAttribute("w:beforeAutospacing", "0")
          .writeAttribute("w:after", "0")
          .writeAttribute("w:afterAutospacing", "0")
          .writeAttribute("w:line", "9")
          .writeAttribute("w:lineRule", "atLeast")
          .endElement()
          .endElement()
          .startElement("w:r")
          .startElement("w:rPr")
          .startElement("w:rFonts")
          .writeAttribute("w:hint", "default")
          .writeAttribute("w:ascii", "Microsoft Sans Serif")
          .writeAttribute("w:hAnsi", "Microsoft Sans Serif")
          .writeAttribute("w:cs", "Microsoft Sans Serif")
          .endElement()
          .startElement("w:i")
          .writeAttribute("w:val", "0")
          .endElement()
          .startElement("w:iCs")
          .writeAttribute("w:val", "0")
          .endElement()
          .startElement("w:color")
          .writeAttribute("w:val", "000000")
          .endElement()
          .startElement("w:sz")
          .writeAttribute("w:val", "20")
          .endElement()
          .startElement("w:szCs")
          .writeAttribute("w:val", "20")
          .endElement()
          .startElement("w:u")
          .writeAttribute("w:val", "none")
          .endElement()
          .startElement("w:bdr")
          .writeAttribute("w:val", "none")
          .writeAttribute("w:color", "auto")
          .writeAttribute("w:sz", "0")
          .writeAttribute("w:space", "0")
          .endElement()
          .startElement("w:vertAlign")
          .writeAttribute("w:val", "baseline")
          .endElement()
          .endElement()
          .startElement("w:t")
          .text(isNil(record[col])? '': formatValue(String(record[col]), options))
          .endElement()
          .endElement()
          .endElement()
          .endElement();
      });
      // end record row tag
      xw_body.endElement();
    });
    data.body_rows = xw_body.output;

    return data;
  } catch (err) {
    logger.error(err);
  }
};

const processColumns = (columns) => {
  return columns.filter((c) => !c.startsWith('__split__'));
}

export default async (
  layout = {
    options: `{"columns": [], "columns_options": {}, "sort_order": []}, "wrap_text": false, ,"no_wrap_text_limit": ${DEFAULT_NO_WRAP_TEXT_LIMIT}`
  },
  fields = [],
  filter = {},
  records = [],
  options
) => {
  let rawXml;
  if (records.length > 0) {
    const layoutOptions = JSON.parse(layout.options);
    let columns = layoutOptions.columns;
    columns = processColumns(columns);
    let options = pick(layoutOptions, ['columns_options', 'wrap_text', 'no_wrap_text_limit']);
    const gridViewData = generateGridViewData(
      columns,
      records,
      fields,
      options,
    );
    rawXml = genRawXmlByTemplate(GridBaseTemplate, gridViewData);
  } else {
    rawXml = GridNoRecords;
  }

  return rawXml;
};
