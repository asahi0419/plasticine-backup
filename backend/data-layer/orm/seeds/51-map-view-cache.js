export default {
  name: 'Map view cache',
  plural: 'Map view cache',
  alias: 'map_view_cache',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: [ 'delete' ],
  fields: [
    {
      name: 'View',
      alias: 'view_id',
      type: 'reference',
      required_when_script: 'true',
      options: { foreign_model: 'view', foreign_label: 'name' },
      __lock: [ 'delete' ],
    },
    {
      name: 'Parent model',
      alias: 'parent_model',
      type: 'reference',
      options: { foreign_model: 'model', foreign_label: 'name' },
      __lock: [ 'delete' ],
    },
    {
      name: 'Parent record',
      alias: 'parent_id',
      type: 'integer',
      __lock: [ 'delete' ],
    },
    {
      name: 'Status',
      alias: 'status',
      type: 'array_string',
      options: {
        values: {
          'ready': 'Ready',
          'preparation': 'Preparation',
        },
        default: 'preparation',
      },
      __lock: [ 'delete' ],
    },
    {
      name: 'Expiry date',
      alias: 'expiry_date',
      type: 'datetime',
      required_when_script: 'true',
      __lock: [ 'delete' ],
    },
    {
      name: 'Rebuild at',
      alias: 'rebuild_at',
      type: 'datetime',
      __lock: [ 'delete' ],
    },
    {
      name: 'Data',
      alias: 'data',
      type: 'string',
      required_when_script: 'true',
      options: { length: 'unlimited', rows: 10, syntax_hl: 'json' },
      __lock: [ 'delete' ],
    },
  ],
  views: [
    {
      name: 'Default',
      alias: 'default',
      type: 'grid',
      condition_script: 'p.currentUser.canAtLeastWrite()',
      layout: 'Default',
      filter: 'Default',
      __lock: [ 'delete' ],
    },
  ],
  layouts: [
    {
      name: 'Default',
      type: 'grid',
      options: {
        columns: [ 'id', 'view_id', 'status', 'expiry_date', 'parent_model', 'parent_id','created_at', 'updated_at' ],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'view_id', type: 'none' },
          { field: 'status', type: 'none' },
          { field: 'expiry_date', type: 'none' },
          { field: 'parent_model', type: 'none' },
          { field: 'parent_id', type: 'none' },
          { field: 'created_at', type: 'none' },
          { field: 'updated_at', type: 'none' },
        ],
        wrap_text: true,
        no_wrap_text_limit: 50,
      },
      __lock: [ 'delete' ],
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
            'view_id',
            'status',
            'expiry_date',
            '__column__.1_2',
            'parent_model',
            'parent_id',
            '__section__.2',
            'data',
            '__tab__.service',
            '__section__.3',
            'id',
            '__section__.4',
            '__column__.4_1',
            'created_at',
            'updated_at',
            '__column__.4_2',
            'created_by',
            'updated_by',
          ],
          options: {
            '__tab__.main': { expanded: true, name: 'Main' },
            '__tab__.service': { name: 'Service' },
          },
        },
        related_components: { list: [], options: {} },
      },
      __lock: [ 'delete' ],
    },
  ],
  escalation_rules: [
    {
      name: 'Rebuild cache',
      target_field: 'rebuild_at',
      active: true,
      offset: '15s',
      condition: `p.record.getValue('status') == 'preparation'`,
      script: `const record = getRecord(p.record.attributes, { source_model: 'view', type: 'map' });
const params = getParams(record);

try {
  const source_record = await getSourceRecord(record);
  const source_record_data = await source_record.produceData(params);

  const attributes = {
    data: await gzip(source_record_data, { encoding: 'base64' }),
    expiry_date: record.expiry_date,
    status: 'ready',
  };

  const model = await p.getModel(record.model);
  await model.find({ id: record.id }).update(attributes);
} catch (error) {
  p.log.error(error);
}

function getRecord(attributes = {}, params = {}) {
  const model = \`\${params.type}_\${params.source_model}_cache\`;
  const source_record = attributes[\`\${params.source_model}_id\`];

  const expiry_setting_path = \`data_store_periods.cache.\${params.source_model}.\${params.type}\`;
  const expiry_hours = p.getSetting(expiry_setting_path) || 48;
  const expiry_date = moment().add(expiry_hours, 'hours').toDate();

  return { ...attributes, ...params, model, source_record, expiry_date };
}

async function getSourceRecord(record = {}) {
  const source_model = await p.getModel(record.source_model);
  const source_record = await source_model.findOne({ id: record.source_record });

  if (!source_record) {
    const value = \`No \${record.source_model} found for \${record.type} cache id: \${record.id}\`;
    throw new Error(p.translate('static.no_value_for_cache', { defaultValue: value, ...record }));
  }

  return source_record;
}

function getParams(record = {}) {
  if (record.parent_model && record.parent_id) {
    return {
      embedded_to: {
        model: record.parent_model,
        record_id: record.parent_id
      },
    };
  }
}`,
    },
  ],
};
