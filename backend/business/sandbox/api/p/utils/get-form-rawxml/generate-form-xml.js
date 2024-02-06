import {
  isEmpty,
  last,
  cloneDeep,
  find,
  each,
  filter,
} from "lodash-es";
import XMLWriter from "xml-writer";
import rgbHex from "rgb-hex";

import db from "../../../../../../data-layer/orm/index.js";
import { makeUniqueID } from "../../../../../helpers/index.js";
import {
  TabXmlTemplate,
  SectionXmlTemplate,
  SectionContentXmlTemplate,
  DefaultFormTemplate
} from "./form-templates.js";
import { loadItems, loadUsers } from '../../../../../../presentation/server/api/commands/load/worklog/helpers.js';
import { makeWorklogXml } from "./worklog.js";
import { generateRelatedViewXml } from './related-view.js';
import { generateEmbeddedViewXml } from './embedded-view.js';

const MIN_SECTION_WIDTH = 8660;
const getBgColorByFieldAccess = (isAccessable) => {
  return isAccessable ? "FFFFFF" : "F3F4F5";
};
var sectionData = {
  section_cols: "",
  section_rows: ""
};

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }
  });
}

export function genRawXmlByTemplate(template, data = {}) {
  if (!template.includes("{") && !template.includes("}"))
    template = `{${template}}`;
  const pattern = /{\s*(\w+?)\s*}/g; // {property}
  return template.replace(pattern, (_, token) =>
    !isEmpty(data) && data.hasOwnProperty(token) && data[token]
      ? data[token]
      : ""
  );
}

export const createLayout = (originalComponents, fields) => {
  const components = cloneDeep(originalComponents);
  const layout = [];

  let indexOfTab = 0;

  const addTab = (component) => {
    const params = components.options[component] || { expanded: true };
    const tabIndex = indexOfTab + 1;
    const defaultName = indexOfTab > 0 ? `Tab #${tabIndex}` : "Main";

    const tab = {
      id: component,
      params: { name: defaultName, ...params },
      sections: []
    };

    layout.push(tab);
    indexOfTab = indexOfTab + 1;

    return tab;
  };

  let indexOfWorklog = 0;

  const addWorklog = (component) => {
    const params = components.options[component] || { expanded: true };
    const worklogIndex = indexOfWorklog + 1;
    const defaultName = indexOfWorklog > 0 ? `Worklog #${worklogIndex}` : "Worklog";

    const worklog = {
      id: component,
      params: { name: defaultName, ...params },
      sections: []
    };

    layout.push(worklog);
    indexOfWorklog = indexOfWorklog + 1;

    return worklog;
  };

  const addSection = (component, options = {}) => {
    let tab = last(layout);
    if (!tab) tab = addTab(`__tab__.${makeUniqueID()}`);

    const section = {
      id: component,
      params: components.options[component] || { expanded: true },
      columns: []
    };

    section.params.width = options.width || MIN_SECTION_WIDTH;

    tab.sections.push(section);
    return section;
  };

  const addColumn = (component, params = {}) => {
    let tab = last(layout);
    if (!tab) tab = addSection(`__tab__.${makeUniqueID()}`);

    let section = last(tab.sections);
    if (!section) section = addSection(`__section__.${makeUniqueID()}`);

    const column = {
      id: component,
      params: components.options[component] || params,
      components: []
    };

    section.columns.push(column);
    return column;
  };

  const addComponent = (component) => {
    let tab = last(layout);
    if (!tab) tab = addSection(`__tab__.${makeUniqueID()}`);

    let section = last(tab.sections);
    if (!section) section = addSection(`__section__.${makeUniqueID()}`);

    let column = last(section.columns);
    if (!column)
      column = addColumn(`__column__.${makeUniqueID()}`, { virtual: true });

    column.components.push({
      id: component,
      params: components.options[component] || {}
    });
  };

  const sectionComponents = filter(components.list, (component) => {
    const field = find(
      fields,
      ({ attributes }) => attributes.alias === component
    ) || { attributes: {} };
    return ["data_template"].includes(field.attributes.type);
  });

  const componentsList = filter(
    components.list,
    (component) => !sectionComponents.includes(component)
  );

  each(sectionComponents, (component, i) => {
    const componentIndex =
      components.list.indexOf(component) - sectionComponents.length;
    const nextComponent = find(
      componentsList.slice(componentIndex),
      (c) =>
        c.startsWith("__tab__") ||
        c.startsWith("__section__") ||
        ["__form_items_chooser__", "__related_data_chooser__"].includes(c)
    );
    const nextComponentIndex = nextComponent
      ? componentsList.indexOf(nextComponent)
      : componentsList.length;

    componentsList.splice(
      nextComponentIndex,
      0,
      `__section__.${makeUniqueID()}`
    );
    componentsList.splice(
      nextComponentIndex + 1,
      0,
      `__column__.${makeUniqueID()}`
    );
    componentsList.splice(nextComponentIndex + 2, 0, component);
  });

  each(componentsList, (component) => {
    if (component.startsWith("__tab__")) {
      addTab(component);
    } else if (component.startsWith("__section__")) {
      addSection(component);
    } else if (component.startsWith("__column__")) {
      addColumn(component);
    } else if (component.startsWith("__worklog__")) {
      addWorklog(component);
    } else if (component.startsWith("__attachments__")) {
      /**
       *  https://redmine.nasctech.com/issues/84189
       *  For attchment tabs we don't include it in exported file.
       */
    } else if (component.startsWith("__dashboard__")) {
      addTab(component);
    } else if (
      ["__form_items_chooser__", "__related_data_chooser__"].includes(component)
    ) {
      addSection(`__section__.chooser_${makeUniqueID()}`, { width: "100%" });
      addComponent(component);
    } else {
      addComponent(component);
    }
  });

  return layout;
};

export const makeTabXml = (tab = { id: "__tab__", params: {}, sections: [] }) => {
  return genRawXmlByTemplate(TabXmlTemplate, {
    name: escapeXml(tab.params.name) || ""
  });
};

const makeWorklog = async (req={ model, params: { id: "" }, query: {}, sandbox }, wlogComponent = { id: "__tab__", params: {}, sections: [] }, userTimeZone = 0) => {
  const prepareWorklog = async (req) => {
    const items = await loadItems(req);
    const users = await loadUsers(items, req.sandbox);
    return { items, users };
  }
  req.query = wlogComponent.params;
  const worklog = await prepareWorklog(req);
  let xml = makeTabXml(wlogComponent);
  xml += makeWorklogXml(worklog, userTimeZone);
  return xml;
}

const handleMultilineText = (xw, text = "") => {
  const lines = text.split("\n");
  lines.forEach((line, idx, lines) => {
    xw.startElement("w:t").text(line).endElement();
    if (idx !== lines.length - 1) {
      xw.startElement("w:br").endElement();
    }
  });
  return xw;
};

const makeSectionXml = async (
  section = { id: "__tab__", params: {}, columns: [] },
  record = {},
  hiddenFields = [],
  fields = [],
  fieldHashTable = {},
  options,
  sandbox,
  data,
  relatedViews
) => {
  if (
    !isEmpty(section.params.embedded_view) &&
    section.params.embedded_view.type !== "none"
  ) { 
    const xml = generateEmbeddedViewXml(sandbox)(section, data, relatedViews);
    return xml;
  }  
  const sectionHeaderXml = genRawXmlByTemplate(SectionXmlTemplate, {
    name: section.params.name || "",
    background_color: section.params.background_color
      ? `${rgbHex(
          section.params.background_color.replace("rgba", "")
        ).substring(0, 6)}`
      : `FFFFFF`,
    text_color: section.params.text_color
      ? `${rgbHex(section.params.text_color.replace("rgba", "")).substring(
          0,
          6
        )}`
      : `000000`,
    align: section.params.align ? `${section.params.align}` : `left`
  });
  const columns = section.columns;
  let xw_section_cols = new XMLWriter();
  let xw_section_rows = new XMLWriter();
  const colWidth = Math.round(8640 / columns.length);
  columns.forEach(() => {
    xw_section_cols.startElement("w:gridCol").endElement();
    xw_section_cols.startElement("w:gridCol").endElement();
  });
  sectionData.section_cols = xw_section_cols.output;

  // Check whether all columns have name so that no create header row if no columns has name params
  let areAllColumnNamesEmpty = true;
  for (let i = 0; i < columns.length; i++) {
    if (columns[i].params.name) {
      areAllColumnNamesEmpty = false;
      break;
    }
  }

  if (!areAllColumnNamesEmpty) {
    xw_section_rows
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
      .endElement();

    columns.forEach((column) => {
      xw_section_rows
        .startElement("w:tc")
        .startElement("w:tcPr")
        .startElement("w:tcW")
        .writeAttribute("w:w", colWidth.toString())
        .writeAttribute("w:type", "dxa")
        .endElement()
        .startElement("w:gridSpan")
        .writeAttribute("w:val", "4")
        .endElement()
        .startElement("w:shd")
        .writeAttribute(
          "w:fill",
          !isEmpty(column.params.background_color)
            ? `${rgbHex(
                column.params.background_color.replace("rgba", "")
              ).substring(0, 6)}`
            : `f3f4f5`
        )
        .writeAttribute("w:val", "clear")
        .endElement()
        .endElement()
        .startElement("w:p")
        .startElement("w:pPr")
        .startElement("w:jc")
        .writeAttribute(
          "w:val",
          !isEmpty(column.params.align) ? `${column.params.align}` : `left`
        )
        .endElement()
        .endElement()
        .startElement("w:r")
        .startElement("w:rPr")
        .startElement("w:color")
        .writeAttribute(
          "w:val",
          !isEmpty(column.params.text_color)
            ? `${rgbHex(column.params.text_color.replace("rgba", "")).substring(
                0,
                6
              )}`
            : `000000`
        )
        .endElement()
        .endElement()
        .startElement("w:t")
        .text(column.params.name ? String(column.params.name) : "")
        .endElement()
        .endElement()
        .endElement()
        .endElement();
    });
    xw_section_rows.endElement();
  }

  const columnsToComponentsLengthArr = columns.map((column) => {
    return column.components.length || 0;
  });
  const sectionRowsCount = isEmpty(columnsToComponentsLengthArr)
    ? 1
    : columnsToComponentsLengthArr.reduce((a, b) => Math.max(a, b));
  let rowIndex = 0;
  while (rowIndex < sectionRowsCount) {
    if (columns.length === 1) {
      const component = columns[0].components[rowIndex];
      if (hiddenFields.includes(component.id)) {
        rowIndex++;
        continue;
      }
    }
    areAllColumnNamesEmpty = true;
    for (let i = 0; i < columns.length; i++) {
      const component = columns[i].components[rowIndex];
      if (component && component.id && !hiddenFields.includes(component.id)) {
        areAllColumnNamesEmpty = false;
        break;
      }
    }
    if (areAllColumnNamesEmpty) {
      rowIndex++;
      continue;
    }
    xw_section_rows
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
      .endElement();
    for (const column of columns) {
      if (column.components.length <= rowIndex) {
        xw_section_rows
          .startElement("w:tc")
          .startElement("w:tcPr")
          .startElement("w:tcW")
          .writeAttribute("w:w", Math.round(colWidth / 2).toString())
          .writeAttribute("w:type", "dxa")
          .endElement()
          .startElement("w:vAlign")
          .writeAttribute("w:val", "center")
          .endElement()

          .endElement()
          .startElement("w:p")
          .startElement("w:r")
          .startElement("w:t")
          .text("")
          .endElement()
          .endElement()
          .endElement()
          .endElement()
          .startElement("w:tc")
          .startElement("w:tcPr")
          .startElement("w:tcW")
          .writeAttribute("w:w", Math.round(colWidth / 2).toString())
          .writeAttribute("w:type", "dxa")
          .endElement()
          .endElement()
          .startElement("w:p")
          .startElement("w:r")
          .startElement("w:t")
          .text("")
          .endElement()
          .endElement()
          .endElement()
          .endElement();
      } else {
        const component = column.components[rowIndex];
        if (hiddenFields.includes(component.id)) {
          xw_section_rows
            .startElement("w:tc")
            .startElement("w:tcPr")
            .startElement("w:tcW")
            .writeAttribute("w:w", Math.round(colWidth / 2).toString())
            .writeAttribute("w:type", "dxa")
            .endElement()
            .endElement()
            .startElement("w:p")
            .startElement("w:r")
            .startElement("w:t")
            .text("")
            .endElement()
            .endElement()
            .endElement()
            .endElement()
            .startElement("w:tc")
            .startElement("w:tcPr")
            .startElement("w:tcW")
            .writeAttribute("w:w", Math.round(colWidth / 2).toString())
            .writeAttribute("w:type", "dxa")
            .endElement()
            .endElement()
            .startElement("w:p")
            .startElement("w:r")
            .startElement("w:t")
            .text("")
            .endElement()
            .endElement()
            .endElement()
            .endElement();
          continue;
        }
        if (component.id.startsWith("__label__")) {
          xw_section_rows
            .startElement("w:tc")
            .startElement("w:tcPr")
            .startElement("w:tcW")
            .writeAttribute("w:w", colWidth.toString())
            .writeAttribute("w:type", "dxa")
            .endElement()
            .startElement("w:gridSpan")
            .writeAttribute("w:val", "2")
            .endElement()
            .endElement()
            .startElement("w:p")
            .startElement("w:r")
            .startElement("w:t")
            .text(component.params.name ? String(component.params.name) : "")
            .endElement()
            .endElement()
            .endElement()
            .endElement();
        } else {
          let fieldName = component.id,
            fieldValue = record[component.id],
            isAccessable = true;
          for (const f of fields) {
            if (f.attributes.alias === component.id) {
              fieldName =
                component.params.name || f.attributes.name || component.id;
              // render no access field as No access
              if (!f.attributes.__access) {
                fieldValue = "No access";
                isAccessable = false;
              } else {
                fieldValue = record[component.id];
              }
            }
          }
          xw_section_rows
            .startElement("w:tc")
            .startElement("w:tcPr")
            .startElement("w:tcW")
            .writeAttribute("w:w", Math.round(colWidth / 2).toString())
            .writeAttribute("w:type", "dxa")
            .endElement()
            .endElement()
            .startElement("w:p")
            .startElement("w:r")
            .startElement("w:t")
            .text(fieldName ? String(fieldName) : "")
            .endElement()
            .endElement()
            .endElement()
            .endElement()
            .startElement("w:tc")
            .startElement("w:tcPr")
            .startElement("w:tcW")
            .writeAttribute("w:w", Math.round(colWidth / 2).toString())
            .writeAttribute("w:type", "dxa")
            .endElement()
            .startElement("w:shd")
            .writeAttribute("w:fill", getBgColorByFieldAccess(isAccessable))
            .writeAttribute("w:val", "clear")
            .endElement()
            .endElement()
            .startElement("w:p")
            .startElement("w:r");

          xw_section_rows = handleMultilineText(
            xw_section_rows,
            fieldValue ? String(fieldValue) : ""
          );
          xw_section_rows.endElement().endElement().endElement();
        }
      }
    }
    xw_section_rows.endElement();
    rowIndex++;
  }
  sectionData.section_rows = xw_section_rows.output;
  const sectionContentXml = genRawXmlByTemplate(
    SectionContentXmlTemplate,
    sectionData
  );
  return sectionHeaderXml + sectionContentXml;
};

const makeDefaultFormData = async (
  hiddenFieldAlias = [],
  record = {},
  fields = [],
  fieldHashTable = {},
  options,
) => {
  let data = {
    body_rows: ""
  };
  let xw_body = new XMLWriter();
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith("__")) continue;
    if (hiddenFieldAlias.includes(key)) continue;
    let fieldName = key,
      fieldValue = value;
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      if (f.attributes.alias === key) {
        fieldName = f.attributes.name || key;
        fieldValue = value;
      }
    }
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
      .text(String(fieldName))
      .endElement()
      .endElement()
      .endElement()
      .endElement();

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
      .endElement();
    xw_body = handleMultilineText(
      xw_body,
      fieldValue ? String(fieldValue) : ""
    );
    xw_body.endElement().endElement().endElement();

    // end record row tag
    xw_body.endElement();
    data.body_rows = xw_body.output;
  }

  return genRawXmlByTemplate(DefaultFormTemplate, data);
};

const getHiddenFields = (fieldsOptions = []) => {
  let hiddenFieldAliases = [];
  for (let [alias, options] of Object.entries(fieldsOptions)) {
    if (options.hidden) hiddenFieldAliases.push(alias);
  }
  return hiddenFieldAliases;
};

const processFields = async (fields = []) => {
  let fieldHashTable = {};
  for (let i = 0; i < fields.length; i++) {
    const field = { ...fields[i].attributes, id: fields[i].id };
    switch (field["type"]) {
      case "datetime":
        const options = JSON.parse(field["options"]);
        fieldHashTable[field.id.toString()] = { options };
        break;
      case "file":
        break;
      case "fa_icon":
        break;
      case "reference":
        const foreignModelRef = await db.getModel(
          JSON.parse(field["options"])["foreign_model"]
        );
        fieldHashTable[field.id.toString()] = { foreignModelRef };

        const foreignLabelRef = JSON.parse(field["options"])["foreign_label"];
        fieldHashTable[field.id.toString()]["foreignLabelRef"] =
          foreignLabelRef;
        break;
      case "global_reference":
        const glRefModelsList = JSON.parse(field["options"])["references"];
        fieldHashTable[field.id.toString()] = { glRefModelsList };
        break;
      case "reference_to_list":
        const foreignModelRtl = await db.getModel(
          JSON.parse(field["options"])["foreign_model"]
        );
        fieldHashTable[field.id.toString()] = { foreignModelRtl };
        const foreignLabelRtl = JSON.parse(field["options"])["foreign_label"];
        fieldHashTable[field.id.toString()]["foreignLabelRtl"] =
          foreignLabelRtl;
        break;
      default:
        break;
    }
  }
  return fieldHashTable;
};

export default (sandbox) => async (data, options = { fields: {}, userTimeZone: 0 }) => {
  try {
    let rawXml = "",
      layout;
    const fieldHashTable = await processFields(data.fields);
    if (data && data.record && data.form) {
      if (options.fields && !isEmpty(options.fields)) {
        var hiddenFields = getHiddenFields(options.fields);
      }

      if (!isEmpty(data.form.attributes.options)) {
        const formOptions = JSON.parse(data.form.attributes.options);
        const components = formOptions.components;
        if (components.list && components.list.length === 0) {
          rawXml = await makeDefaultFormData(
            hiddenFields,
            data.record,
            data.fields,
            fieldHashTable,
            options
          );
        } else {
          const relatedComponents = formOptions.related_components;
          const relatedViewXml = await generateRelatedViewXml(sandbox)(relatedComponents, data, options.relatedViews);

          layout = createLayout(components, data.fields);
          for (const tabOrWlog of layout) {
            if (tabOrWlog.id.startsWith('__tab')) {
              rawXml += makeTabXml(tabOrWlog);
            } else if (tabOrWlog.id.startsWith('__worklog')) {
              rawXml += await makeWorklog(data.req, tabOrWlog, options.userTimeZone);
            }

            for (const section of tabOrWlog.sections) {
              rawXml += await makeSectionXml(
                section,
                data.record,
                hiddenFields,
                data.fields,
                fieldHashTable,
                options,
                sandbox,
                data,
                options.relatedViews
              );
            }
          }
          rawXml += relatedViewXml;
        }
      } else {
        rawXml = await makeDefaultFormData(
          hiddenFields,
          data.record,
          data.fields,
          fieldHashTable,
          options
        );
      }
    }
    return rawXml;
  } catch (error) {
    console.log(error);
  }
};
