export default {
  name: 'Field',
  plural: 'Fields',
  alias: 'field',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: ['delete'],
  fields: [
    {
      name: 'Model',
      alias: 'model',
      type: 'reference',
      options: {
        foreign_model: 'model',
        foreign_label: 'name',
        extra_fields: ['type', 'alias'],
      },
      required_when_script: 'true',
      readonly_when_script: 'p.record.isPersisted()',
      __lock: ['delete'],
    },
    {
      name: 'Name',
      alias: 'name',
      type: 'string',
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Alias',
      alias: 'alias',
      type: 'string',
      index: 'unique',
      options: {
        composite_index: ['model'],
        format: '^[a-z_][a-z0-9_]{1,}$',
        length: 60,
      },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Type',
      alias: 'type',
      type: 'array_string',
      options: {
        values: {
          array_string: 'Array (string)',
          boolean: 'Boolean',
          datetime: 'Date/Time',
          integer: 'Integer',
          autonumber: 'Autonumber',
          float: 'Float',
          primary_key: 'Primary Key',
          reference: 'Reference',
          global_reference: 'Global reference',
          reference_to_list: 'Reference to list',
          string: 'String',
          journal: 'Journal',
          fa_icon: 'FA Icon',
          file: 'File',
          data_template: 'Data template',
          data_visual: 'Data visual',
          condition: 'Condition',
          filter: 'Filter',
          color: 'Color',
          geo_point: '[GEO] Point',
          geo_line_string: '[GEO] LineString',
          geo_polygon: '[GEO] Polygon',
          geo_geometry: '[GEO] Geometry',
        },
      },
      required_when_script: 'true',
      readonly_when_script: 'p.record.isPersisted()',
      __lock: ['delete'],
    },
    {
      name: 'Audit',
      alias: 'audit',
      type: 'array_string',
      options: {
        values: {
          none: 'None',
          audit: 'Audit',
          audit_and_worklog: 'Audit and Worklog',
        },
        default: 'none',
      },
      readonly_when_script: 'p.record.getValue("type") === "journal"',
      __lock: ['delete'],
    },
    {
      name: 'Index',
      alias: 'index',
      type: 'array_string',
      options: {
        values: {
          none: 'None',
          simple: 'Simple',
          unique: 'Unique',
          gist: 'Gist',
        },
        default: 'none',
      },
      readonly_when_script: `return [
  'autonumber',
  'geo_point',
  'geo_line_string',
  'geo_polygon',
  'geo_geometry',
].includes(p.record.getValue('type'))`,
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Options',
      alias: 'options',
      type: 'string',
      options: {
        length: 10000,
        syntax_hl: 'json',
      },
      __lock: ['delete'],
    },
    {
      name: 'Required',
      alias: 'required_when_script',
      type: 'condition',
      options: {
        ref_model: 'model',
        length: 150000,
        syntax_hl: 'js',
      },
      hidden_when_script: `['autonumber'].includes(p.record.getValue('type'))`,
      __lock: ['delete'],
    },
    {
      name: 'Hidden',
      alias: 'hidden_when_script',
      type: 'condition',
      options: {
        ref_model: 'model',
        length: 150000,
        syntax_hl: 'js',
      },
      __lock: ['delete'],
    },
    {
      name: 'Readonly',
      alias: 'readonly_when_script',
      type: 'condition',
      options: {
        ref_model: 'model',
        length: 150000,
        syntax_hl: 'js',
      },
      hidden_when_script: `['autonumber'].includes(p.record.getValue('type'))`,
      __lock: ['delete'],
    },
    {
      name: 'Virtual',
      alias: 'virtual',
      type: 'boolean',
      options: {
        default: false,
      },
      required_when_script: 'true',
      readonly_when_script: 'p.record.isPersisted()',
      __lock: ['delete'],
    },
    {
      name: 'Hint',
      alias: 'hint',
      type: 'string',
      options: {
        length: 512,
      },
      __lock: ['delete'],
    },
    {
      name: 'Marked as deleted',
      alias: 'marked_as_deleted',
      type: 'datetime',
      __lock: ['delete'],
    },
    {
      name: 'Extra attributes',
      alias: 'extra_attributes',
      type: 'reference_to_list',
      options: {
        foreign_model: 'extra_fields_attribute',
        foreign_label: 'name',
      },
      __lock: ['delete'],
    },
    {
      name: 'Tutorial',
      alias: 'tutorial',
      type: 'string',
      options: {
        length: 10000,
        rows: 1,
      },
      required_when_script: 'false',
      __lock: ['delete'],
    },
  ],
  ui_rules: [
    {
      name: 'On New Record',
      order: '0',
      active: true,
      type: 'on_load',
      script: `if (!p.record.isPersisted()){
  p.record.getField('type').removeArrayValues(['primary_key']);
}`,
      __lock: ['delete'],
    },
    {
      name: 'Autogeneration of alias',
      order: '0',
      active: true,
      type: 'on_change',
      script: `if (p.record.isPersisted()) return;
let aliases = [];
if (p.record.getModel && p.record.getModel().fetchRecords) {
  const params = {
    filter: \`\\\`model\\\` = $\{p.record.getValue('model')\} AND \\\`id\\\` != $\{p.record.getValue('id')\}\`,
    fields: { [\`_$\{p.record.getModel().getValue('alias')\}\`]: 'alias' },
    page: { size: 999 },
  };
  p.record.getModel().fetchRecords(params).then((result) => {
    aliases = result.data.data.map(({ attributes }) => attributes.alias);
  });
}
p.record.getField('name').onChange((oldValue, newValue) => {
  const aliasValue = utils.parameterizeString(newValue, { length: 55, blackList: aliases });
  p.record.setValue('alias', aliasValue);
});`,
      __lock: ['delete'],
    },
    {
      name: 'On Change Type',
      order: 0,
      active: true,
      type: 'on_change',
      script: `p.record.getField('type').onChange((oldValue, newValue) => {
  setIndex(newValue)
  setReadOnly(newValue)
});

function setIndex(type) {
  let value = 'none';
  let options = {
    values: {
      "none": "None",
      "simple": "Simple",
      "unique": "Unique",
    },
    default: "none",
  }

  switch (type) {
    case 'autonumber':
      value = 'unique'
      break;
    case 'geo_point':
    case 'geo_line_string':
    case 'geo_polygon':
    case 'geo_geometry':
      value = 'gist'
      options = {
        values: {
          "none": "None",
          "simple": "Simple",
          "unique": "Unique",
          "gist": "Gist",
        },
        default: "gist",
      }
      break;
  }

  p.record.getField('index').setOptions(options)
  p.record.setValue('index', value);
}

function setReadOnly(type) {
  let value = '';

  switch (type) {
    case 'autonumber':
      value = 'true'
      break;
  }

  p.record.setValue('readonly_when_script', value);
}`,
    },
    {
      name: 'Autogeneration preview of Autonumber',
      order: 0,
      active: true,
      type: 'on_change',
      script: `const { parseOptions } = utils;

const zeroPad = (num, places) => String(num).padStart(places, '0')
const humanizedValue = (value) => p.record.getValue(value) ? p.record.getValue(value) : '';

const getMinWidth = () => {
  const {record} = p.record; 
  const {fieldsMap} = record; 
  const {width} = fieldsMap; 
  const {options} = width; 
  const parsedOptions = parseOptions(options); 
  const {min} = parsedOptions; 
  return min || 0;
} 

const getMaxWidth = () => {
  const {record} = p.record; 
  const {fieldsMap} = record; 
  const {width} = fieldsMap; 
  const {options} = width; 
  const parsedOptions = parseOptions(options); 
  const {max} = parsedOptions; 
  return max || 30;
} 

const getDefaultWidth = () => {
  const {record} = p.record; 
  const {fieldsMap} = record; 
  const {width} = fieldsMap; 
  const {options} = width; 
  const parsedOptions = parseOptions(options); 
  const {dafault} = parsedOptions; 
  return max || 10;
} 

const getMaxLengthPrefix = () => {
  const {record} = p.record; 
  const {fieldsMap} = record; 
  const {prefix} = fieldsMap; 
  const {options} = prefix; 
  const parsedOptions = parseOptions(options); 
  const {length} = parsedOptions; 
  return length || 20;
}

const getMaxLengthPostfix = () => {
  const {record} = p.record; 
  const {fieldsMap} = record; 
  const {postfix} = fieldsMap; 
  const {options} = postfix; 
  const parsedOptions = parseOptions(options); 
  const {length} = parsedOptions; 
  return length || 20;
}

const validateOptions = (width, prefix, postfix) => {
  const min = getMinWidth();
  const max = getMaxWidth();
  if(!width){
    width = min;
  }
  else if (width > max){
    width = max;
  }
  
  return {width, 
    prefix:prefix.substring(0, getMaxLengthPrefix()), 
    postfix:postfix.substring(0, getMaxLengthPostfix())
  }; 
}

p.record.getField('width').onChange((oldValue, newValue) => {
  const { width, prefix, postfix } = validateOptions(newValue, humanizedValue('prefix'), humanizedValue('postfix'));
  const id = zeroPad(p.record.getValue('id'), width);
  p.record.setValue('preview', prefix + id + postfix);
});

p.record.getField('prefix').onChange((oldValue, newValue) => {
  const { width, prefix, postfix } = validateOptions(humanizedValue('width'), newValue, humanizedValue('postfix'));
  const id = zeroPad(p.record.getValue('id'), width);
  p.record.setValue('preview', prefix + id + postfix);
});

p.record.getField('postfix').onChange((oldValue, newValue) => {
  const { width, prefix, postfix } = validateOptions(humanizedValue('width'), humanizedValue('prefix'), newValue);
  const id = zeroPad(p.record.getValue('id'), width);
  p.record.setValue('preview', prefix + id + postfix);
});`,
      __lock: ['delete'],
    },
    {
      name: 'Set date formats',
      order: '0',
      active: true,
      type: 'on_load',
      script: `function setFormat(active) {
  const prev = p.record.getValue('format');
  const next = prev || (active ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
  p.record.setValue('format', next);
}

function resetFormat(active) {
  const GLOBAL_DATE_FORMAT = 'global_date_format';

  const prev = p.record.getValue('format');
  if(prev  === GLOBAL_DATE_FORMAT ) return prev;

  const next = active ? prev.split(' HH')[0] : (prev + ' HH:mm:ss');
  p.record.setValue('format', next);
}

const f = p.record.getField('date_only');
const v = p.record.getValue('date_only');

f.onChange((p, n) => resetFormat(n));
p.record.getValue('type') === 'datetime' && setFormat(v);
`,
      __lock: ['delete'],
    },
    {
      name: 'Options: Initialize',
      order: '0',
      active: true,
      type: 'on_load',
      script: `const { each, reduce, keys, find, filter, pick, map, isNull } = lodash;
const { parseOptions, getModel, getView } = utils;

function initOptions() {
  const type = {
    prev: p.record.getPrevValue('type'),
    curr: p.record.getValue('type'),
  };

  const optionsParsed = parseOptions(this.attributes.options);
  const options = this.options[this.attributes.type] || [];

  const optionsAttributes = reduce(options, (result, option) => {
    let value = optionsParsed[option.alias];
    if (!p.record.isPersisted()) {
      if ((type.curr === 'boolean') && isNull(value)) {
        value = null;
      } else {
        value = parseOptions(option.options).default;
      }
    }

    if (value) {
      if (option.alias === 'foreign_model') {
        const model = getModel(value);
        if (model) value = model.id;
      }

      if (option.alias === 'view') {
        const view = getView(result['foreign_model'], value);
        if (view) value = view.id;
      }

      if (option.alias === 'filter') {
        const model = getModel(optionsParsed.foreign_model)
        if (model) {
          option.options = JSON.stringify({
            ...parseOptions(option.options),
            ref_model: model.id,
          })
        }
      }
    }

    return { ...result, [option.alias]: value };
  }, { subtype: this.attributes.subtype });

  const actualFields = filter(this.metadata.fields, (field) => parseOptions(field.options).subtype !== 'option');
  const actualAttributes = pick(this.originalAttributes, map(actualFields, 'alias'));

  this.attributes = { ...actualAttributes, ...optionsAttributes };
  this.attributes.options = JSON.stringify(optionsAttributes);

  this.metadata.options = options;
  this.metadata.fields = [ ...(this.metadata.fields || []), ...options ];
}

p.record.declare('initOptions', initOptions);
p.record.record.init();`,
      __lock: ['delete'],
    },
    {
      name: 'Options: Update',
      order: '0',
      active: true,
      type: 'on_load',
      script: `const { find } = lodash;
const { parseOptions } = utils;

function updateOptions(alias) {
  if (alias === 'type') return this.init();

  const option = find(this.metadata.options, { alias });
  if (!option) return;

  const options = { ...parseOptions(this.get('options')), [alias]: this.get(alias) };

  if (alias === 'foreign_model') {
    delete this.attributes.foreign_label;
    delete this.attributes.view;
    delete this.attributes.extra_fields;
    delete this.attributes.default;

    const fieldView = p.record.getField('view');
    const fieldExtraFields = p.record.getField('extra_fields');
    const fieldFilter = p.record.getField('filter');

    const fieldOptionsView = fieldView.getOptions();
    const fieldOptionsExtraFields = fieldExtraFields.getOptions();
    const fieldOptionsFilter = fieldFilter.getOptions();

    fieldView.setOptions({ ...fieldOptionsView, filter: \`\\\`model\\\` = \${this.attributes.foreign_model}\` });
    fieldExtraFields.setOptions({ ...fieldOptionsExtraFields, filter: \`\\\`model\\\` = \${this.attributes.foreign_model}\` });

    if (this.attributes.foreign_model) {
      const refModel = utils.getModel(this.attributes.foreign_model)
      this.attributes.filter = ''
      
      fieldFilter.setOptions({ 
        ...fieldOptionsFilter, 
        ref_model: refModel.id
      })
    } else {
      delete this.attributes.filter
    }
  }

  this.update({ options: JSON.stringify(options) });
}

p.record.declare('updateOptions', updateOptions);`,
      __lock: ['delete'],
    },
  ],
  db_rules: [
    {
      name: "On change RTL sync_to",
      order: '-100',
      active: true,
      when_perform: 'after',
      on_insert: true,
      on_update: true,
      on_delete: false,
      condition_script: "p.record.getValue('type') === 'reference_to_list' && p.record.isChanged('options')",
      script: `const options = utils.JSONParseSafe(p.record.getValue('options'));
const syncTo = options.sync_to;
const prevSyncTo = utils.JSONParseSafe(p.record.previousAttributes.options).sync_to;

if (syncTo === prevSyncTo) return;

const fieldModel = await p.getModel('field');

if (prevSyncTo) {
\tconst prevSyncedField = await fieldModel.findOne({ id: prevSyncTo });
\t
\tif (prevSyncedField) {
\t\tconst prevSyncedFieldOptions = utils.JSONParseSafe(prevSyncedField.getValue('options'));
\t\t
\t\tif (prevSyncedFieldOptions.sync_to) {
\t\t\tawait db.model('field').where({ id: prevSyncedField.id }).update({ options: JSON.stringify({ ...prevSyncedFieldOptions, sync_to: null }) });
\t\t}
\t}
}

if (syncTo) {
\tconst syncedField = await fieldModel.findOne({ id: syncTo });
\tconst syncedFieldOptions = utils.JSONParseSafe(syncedField.getValue('options'));
\tif (syncedFieldOptions.sync_to !== p.record.getValue('id')) {
\t\tawait syncedField.update({ options: JSON.stringify({ ...syncedFieldOptions, sync_to: p.record.getValue('id') }) });
\t}
}`,
      __lock: ['delete'],
    },
  ],

  actions: [
    {
      name: 'Synchronize',
      alias: 'synchronize',
      type: 'form_button',
      position: '1000',
      on_update: true,
      client_script: 'return confirm("The system will synchronize the referenced data. Continue?");',
      server_script: `
const params = p.getRequest();
const record = await params.getRecord();
const { sync_to } = utils.JSONParseSafe(record.getValue('options'));
const rtlModel = await p.getModel('rtl');
const syncToField = await db.model('field').where({ id: sync_to }).getOne();
const rtlRecords = await db.model('rtl').where('source_field', record.id);

await db.model('rtl').where('source_field', syncToField.id).delete();
await Promise.map(rtlRecords, (rtlRecord) => {
\trtlModel.insert({
\t\tsource_field: syncToField.id,
    source_record_id: rtlRecord.target_record_id,
    target_record_id: rtlRecord.source_record_id,
\t});
});

p.actions.showMessage("The data synchronization successfully completed");
`,
      condition_script: 'utils.JSONParseSafe(p.record.getValue("options")).sync_to && p.currentUser.isAdmin()',
      active: true,
      __lock: ['delete'],
    },
  ],

  views: [
    {
      name: 'Default',
      alias: 'default',
      type: 'grid',
      condition_script: 'p.currentUser.isAdmin()',
      layout: 'Default',
      filter: 'Default',
      __lock: ['delete'],
    },
  ],
  layouts: [
    {
      name: 'Default',
      type: 'grid',
      options: {
        columns: ['id', 'model', 'name', 'alias', 'type', 'created_at', 'updated_at', 'created_by', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'model', type: 'none' },
          { field: 'name', type: 'none' },
          { field: 'alias', type: 'none' },
          { field: 'type', type: 'none' },
          { field: 'created_at', type: 'none' },
          { field: 'updated_at', type: 'none' },
          { field: 'created_by', type: 'none' },
          { field: 'updated_by', type: 'none' },
        ],
        wrap_text: true,
        no_wrap_text_limit: 50,
      },
      __lock: ['delete'],
    },
  ],
  forms: [
    {
      name: 'Default',
      alias: 'default',
      order: 0,
      active: true,
      condition_script: 'true',
      options: {
        components: {
          list: [
            '__tab__.main',
            '__section__.1',
            '__column__.1_1',
            'name',
            'alias',
            '__column__.1_2',
            'type',
            'index',
            '__section__.2',
            'options',
            'required_when_script',
            'readonly_when_script',
            'hidden_when_script',
            '__section__.3',
            'extra_attributes',
            'model',
            '__tab__.service',
            '__section__.4',
            'id',
            '__section__.5',
            '__column__.5_1',
            'created_at',
            'updated_at',
            'audit',
            'virtual',
            '__column__.5_2',
            'created_by',
            'updated_by',
            'marked_as_deleted',
            '__section__.6',
            'hint',
            'tutorial',
          ],
          options: {
            '__tab__.main': { expanded: true, name: 'Main' },
            '__tab__.service': { name: 'Service' },
          },
        },
        related_components: { list: [], options: {} },
      },
      __lock: ['delete'],
    },
  ],
  permissions: [
    { type: 'model', action: 'create', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
  ],
};
