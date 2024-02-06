import moment from 'moment';
import { each, reduce } from 'lodash/collection';

import { makeUniqueID } from '../../../../helpers';
import { DATE_FORMATS, GLOBAL_DATE_FORMAT } from '../../../../constants';

const datetimeFormatValues = () => {
  const formats = reduce(DATE_FORMATS, (r, f) => {
    return { ...r, [f]: `${f} (${moment().format(f)})` };
  }, {});
  formats[GLOBAL_DATE_FORMAT] = 'Use global setting';

  return formats;
};

const options = {
  array_string: [
    {
      alias: 'values',
      name: 'Values',
      type: 'string',
      options: {
        syntax_hl: 'json',
        length: 10000,
        rows: 5,
        default: {
          one: 'One',
          two: 'Two',
        },
      },
      required_when_script: 'p.record.getValue("type") === "array_string"',
    },
    {
      alias: 'default',
      name: 'Default',
      type: 'string',
      options: {
        length: 515,
        rows: 1,
        default: 'one',
      },
    },
    {
      alias: 'multi_select',
      name: 'Multiselect',
      type: 'boolean',
      options: {
        default: false,
      },
      readonly_when_script: 'p.record.isPersisted()',
    },
  ],
  boolean: [
    {
      alias: 'default',
      name: 'Default',
      type: 'array_string',
      options: {
        values: {
          false: 'False',
          true: 'True',
          null: 'Null',
        },
        default: false,
        booleans: true,
      },
    },
  ],
  condition: [
    {
      alias: 'ref_model',
      name: 'Reference model field',
      type: 'string',
      options: {
        length: 200,
        rows: 1,
      },
      readonly_when_script: '!p.record.getValue("model")',
    },
    {
      alias: 'default',
      name: 'Default',
      type: 'string',
      options: {
        length: 10000,
        rows: 1,
      },
    },
  ],
  filter: [
    {
      alias: 'length',
      name: 'Length',
      type: 'integer',
      options: {
        min: 1,
        max: 150000,
        default: 150000,
      },
    },
    {
      alias: 'ref_model',
      name: 'Reference model',
      type: 'reference',
      options: {
        foreign_model: 'model',
        foreign_label: 'name',
        view: 'default',
      },
      readonly_when_script: '!p.record.getValue("model")',
    },
  ],
  data_template: [
    {
      alias: 'length',
      name: 'Length',
      type: 'integer',
      options: {
        min: 10000,
        max: 100000,
        default: 10000,
      },
    },
    {
      alias: 'syntax_hl',
      name: 'Syntax highlighting',
      type: 'array_string',
      options: {
        default: 'json',
        values: {
          js: 'Javascript',
          json: 'JSON',
        },
      },
    },
  ],
  data_visual: [
    {
      alias: 'length',
      name: 'Length',
      type: 'integer',
      options: {
        min: 10000,
        max: 100000,
        default: 10000,
      },
    },
    {
      alias: 'syntax_hl',
      name: 'Syntax highlighting',
      type: 'array_string',
      options: {
        default: 'json',
        values: {
          js: 'Javascript',
          json: 'JSON',
        },
      },
    },
  ],
  datetime: [
    {
      alias: 'default',
      name: 'Default',
      type: 'datetime',
      options: {
        length: 100,
        format: GLOBAL_DATE_FORMAT,
      },
    },
    {
      alias: 'format',
      name: 'Format',
      type: 'array_string',
      options: {
        default: GLOBAL_DATE_FORMAT,
        values: datetimeFormatValues(),
      },
    },
    {
      alias: 'date_only',
      name: 'Without time',
      type: 'boolean',
    },
  ],
  float: [
    {
      alias: 'default',
      name: 'Default',
      type: 'float',
      options: {
        default: null,
      },
    },
    {
      alias: 'min',
      name: 'Min value',
      type: 'float',
      options: {
        default: null,
      },
    },
    {
      alias: 'max',
      name: 'Max value',
      type: 'float',
      options: {
        default: null,
      },
    },
    {
      alias: 'step',
      name: 'Step',
      type: 'float',
      options: {
        default: null,
      },
    },
    {
      alias: 'use_null',
      name: 'Can be null',
      type: 'boolean',
      options: {
        default: false,
      },
    },
  ],
  global_reference: [
    {
      alias: 'references',
      name: 'References',
      type: 'string',
      options: {
        syntax_hl: 'json',
        length: 10000,
        rows: 5,
        default: [
          {
            model: 'model_X',
            view: 'default',
            label: 'name',
          },
        ],
      },
    }
  ],
  integer: [
    {
      alias: 'default',
      name: 'Default',
      type: 'integer',
      options: {
        default: null,
      },
    },
    {
      alias: 'min',
      name: 'Min value',
      type: 'integer',
      options: {
        default: null,
      },
    },
    {
      alias: 'max',
      name: 'Max value',
      type: 'integer',
      options: {
        default: null,
      },
    },
    {
      alias: 'step',
      name: 'Step',
      type: 'integer',
      options: {
        default: null,
      },
    },
    {
      alias: 'use_null',
      name: 'Can be null',
      type: 'boolean',
      options: {
        default: false,
      },
    },
  ],
  reference: [
    {
      alias: 'foreign_model',
      name: 'Reference model',
      type: 'reference',
      options: {
        foreign_model: 'model',
        foreign_label: 'name',
        view: 'default',
      },
      required_when_script: 'p.record.getValue("type") === "reference"',
    },
    {
      alias: 'foreign_label',
      name: 'Show field',
      type: 'string',
      options: {
        length: 250,
        rows: 1,
      },
      required_when_script: 'p.record.getValue("type") === "reference"',
    },
    {
      alias: 'view',
      name: 'Use view',
      type: 'reference',
      options: {
        foreign_model: 'view',
        foreign_label: 'name',
        view: 'default',
        filter: 'model = p.record.getValue("foreign_model")',
      },
      readonly_when_script: '!p.record.getValue("foreign_model")',
      required_when_script: 'true',
    },
    {
      alias: 'view_mc',
      name: 'Use view [MC]',
      type: 'reference',
      options: {
        foreign_model: 'view',
        foreign_label: 'name',
        view: 'default',
        filter: 'model = p.record.getValue("foreign_model")',
      },
      readonly_when_script: '!p.record.getValue("foreign_model")',
    },
    {
      alias: 'filter_deprecated',
      name: 'Filter deprecated',
      type: 'string',
      options: {
        length: 10000,
        rows: 1,
      },
      hidden_when_script: '!p.record.getValue("filter_deprecated")',
      readonly_when_script: 'true',
    },
    {
      alias: 'filter',
      name: 'Filter',
      type: 'filter',
      options: {
        length: 150000,
        ref_model: null,
        default: null
      },
      hidden_when_script: '!p.record.getValue("foreign_model")'
    },
    {
      alias: 'depends_on',
      name: 'Depends on',
      type: 'string',
      options: {
        length: 10000,
        rows: 1,
      },
    },
    {
      alias: 'extra_fields',
      name: 'Access fields',
      type: 'reference_to_list',
      options: {
        foreign_model: 'field',
        foreign_label: 'name',
        view: 'default',
        filter: 'model = p.record.getValue("foreign_model")',
      },
      readonly_when_script: '!p.record.getValue("foreign_model")',
    },
    {
      alias: 'default',
      name: 'Default',
      type: 'integer',
      options: {
        default: null,
      },
    },
  ],
  reference_to_list: [
    {
      alias: 'foreign_model',
      name: 'Reference model',
      type: 'reference',
      options: {
        foreign_model: 'model',
        foreign_label: 'name',
        view: 'default',
      },
      required_when_script: 'p.record.getValue("type") === "reference_to_list"',
    },
    {
      alias: 'foreign_label',
      name: 'Show field',
      type: 'string',
      options: {
        length: 250,
        rows: 1,
      },
      required_when_script: 'p.record.getValue("type") === "reference_to_list"',
    },
    {
      alias: 'view',
      name: 'Use view',
      type: 'reference',
      options: {
        foreign_model: 'view',
        foreign_label: 'name',
        view: 'default',
        filter: 'model = p.record.getValue("foreign_model")',
      },
      readonly_when_script: '!p.record.getValue("foreign_model")',
      required_when_script: 'true',
    },
    {
      alias: 'view_mc',
      name: 'Use view [MC]',
      type: 'reference',
      options: {
        foreign_model: 'view',
        foreign_label: 'name',
        view: 'default',
        filter: 'model = p.record.getValue("foreign_model")',
      },
      readonly_when_script: '!p.record.getValue("foreign_model")',
    },
    {
      alias: 'filter_deprecated',
      name: 'Filter deprecated',
      type: 'string',
      options: {
        length: 10000,
        rows: 1,
      },
      hidden_when_script: '!p.record.getValue("filter")',
      readonly_when_script: 'p.record.getValue("filter")',
    },
    {
      alias: 'filter',
      name: 'Filter',
      type: 'filter',
      options: {
        length: 150000,
        ref_model: null,
        default: null
      },
      hidden_when_script: '!p.record.getValue("foreign_model")'
    },
    {
      alias: 'depends_on',
      name: 'Depends on',
      type: 'string',
      options: {
        length: 10000,
        rows: 1,
      },
    },
    {
      alias: 'extra_fields',
      name: 'Access fields',
      type: 'reference_to_list',
      options: {
        foreign_model: 'field',
        foreign_label: 'name',
        view: 'default',
        filter: 'model = p.record.getValue("foreign_model")',
      },
      readonly_when_script: '!p.record.getValue("foreign_model")',
    },
    {
      alias: 'default',
      name: 'Default',
      type: 'integer',
      options: {
        default: null,
      },
    },
    {
      alias: 'sync_to',
      name: 'Sync to',
      type: 'reference',
      options: {
        foreign_model: 'field',
        foreign_label: 'name',
        view: 'default',
        filter: "`type` = 'reference_to_list' AND model = p.record.getValue(\"foreign_model\") AND `options` LIKE '%\"foreign_model\":\"{model.alias}\"%'",
      },
    },
  ],
  string: [
    {
      alias: 'length',
      name: 'Length',
      type: 'integer',
      hidden_when_script: '["signature"].includes(p.record.getValue("syntax_hl"))',
      options: {
        min: 1,
        max: 1000000,
        default: 255,
      },
    },
    {
      alias: 'rows',
      name: 'Rows',
      type: 'integer',
      hidden_when_script: '["editorjs", "connection", "signature"].includes(p.record.getValue("syntax_hl"))',
      options: {
        min: 1,
        max: 20,
        default: 1,
      },
    },
    {
      alias: 'height',
      name: 'Height (px)',
      type: 'integer',
      hidden_when_script: '["editorjs", "connection", "signature"].includes(p.record.getValue("syntax_hl"))',
      options: {
        min: 200,
        max: 720,
        default: 365,
      },
    },
    {
      alias: 'default',
      name: 'Default',
      type: 'string',
      options: {
        length: 10000,
        rows: 1,
      },
    },
    {
      alias: 'syntax_hl',
      name: 'Syntax highlighting',
      type: 'array_string',
      options: {
        values: {
          js: 'Javascript',
          json: 'JSON',
          editorjs : 'EditorJS',
          python : 'Python',
          jsx: 'JSX',
          css: 'CSS',
          connection: 'Connection',
          signature: 'Signature',
        },
      },
    },
    {
      alias: 'format',
      name: 'Format',
      type: 'string',
    },
  ],
  autonumber: [
    {
      alias: 'prefix',
      name: 'Prefix',
      type: 'string',
      options: {
        length: 20,
        rows: 1,
        default: null,
      },
    },
    {
      alias: 'postfix',
      name: 'Postfix',
      type: 'string',
      options: {
        length: 20,
        rows: 1,
        default: null,
      },
    },
    {
      alias: 'width',
      name: 'Width',
      type: 'integer',
      options: {
        min: 0,
        max: 30,
        default: 10,
      },
    },
    {
      alias: 'preview',
      name: 'Preview',
      type: 'string',
      options: {
        length: 40,
        rows: 1,
        default: '0000000001',
      },
      readonly_when_script: 'true',
    },
  ],
  geo_point: [
    {
      alias: 'length',
      name: 'Length',
      type: 'integer',
      options: {
        min: 1,
        default: 'unlimited',
      },
    },
    {
      alias: 'rows',
      name: 'Rows',
      type: 'integer',
      options: {
        min: 1,
        max: 20,
        default: 1,
      },
    },
    {
      alias: 'syntax_hl',
      name: 'Syntax highlighting',
      type: 'array_string',
      options: {
        values: {
          js: 'Javascript',
          json: 'JSON',
          editorjs: 'EditorJS',
          python: 'Python',
          jsx: 'JSX',
          css: 'CSS',
        },
        default: 'json',
      },
    },
  ],
  geo_line_string: [
    {
      alias: 'length',
      name: 'Length',
      type: 'integer',
      options: {
        min: 1,
        default: 'unlimited',
      },
    },
    {
      alias: 'rows',
      name: 'Rows',
      type: 'integer',
      options: {
        min: 1,
        max: 20,
        default: 2,
      },
    },
    {
      alias: 'syntax_hl',
      name: 'Syntax highlighting',
      type: 'array_string',
      options: {
        values: {
          js: 'Javascript',
          json: 'JSON',
          editorjs: 'EditorJS',
          python: 'Python',
          jsx: 'JSX',
          css: 'CSS',
        },
        default: 'json',
      },
    },
  ],
  geo_polygon: [
    {
      alias: 'length',
      name: 'Length',
      type: 'integer',
      options: {
        min: 1,
        default: 'unlimited',
      },
    },
    {
      alias: 'rows',
      name: 'Rows',
      type: 'integer',
      hidden_when_script: 'p.record.getValue("syntax_hl") === "editorjs"',
      options: {
        min: 1,
        max: 20,
        default: 3,
      },
    },
    {
      alias: 'syntax_hl',
      name: 'Syntax highlighting',
      type: 'array_string',
      options: {
        values: {
          js: 'Javascript',
          json: 'JSON',
          editorjs: 'EditorJS',
          python: 'Python',
          jsx: 'JSX',
          css: 'CSS',
        },
        default: 'json',
      },
    },
  ],
  geo_geometry: [
    {
      alias: 'length',
      name: 'Length',
      type: 'integer',
      options: {
        min: 1,
        default: 'unlimited',
      },
    },
    {
      alias: 'rows',
      name: 'Rows',
      type: 'integer',
      options: {
        min: 1,
        max: 20,
        default: 10
      },
      hidden_when_script: 'p.record.getValue("syntax_hl") === "editorjs"',
    },
    {
      alias: 'syntax_hl',
      name: 'Syntax highlighting',
      type: 'array_string',
      options: {
        values: {
          js: 'Javascript',
          json: 'JSON',
          editorjs: 'EditorJS',
          python: 'Python',
          jsx: 'JSX',
          css: 'CSS',
        },
        default: 'json',
      },
    },
  ],
};

export const optionsMapper = (options) => {
  each(options, (type, key) => {
    each(type, (option) => {
      option.id = makeUniqueID();
      option.options = JSON.stringify({ ...option.options, subtype: 'option' });
      option.hidden_when_script = option.hidden_when_script || `p.record.getValue("type") !== "${key}"`;
      option.is_option = true;
    });
  });

  return options;
};

export default options;
