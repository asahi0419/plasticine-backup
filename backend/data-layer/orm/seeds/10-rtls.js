export default {
  name: 'RTL',
  plural: 'RTLs',
  alias: 'rtl',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: ['delete'],
  fields: [
    {
      name: 'Source field',
      alias: 'source_field',
      type: 'reference',
      options: { foreign_model: 'field', foreign_label: 'name' },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Source instance ID',
      alias: 'source_record_id',
      type: 'integer',
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Target instance ID',
      alias: 'target_record_id',
      type: 'integer',
      required_when_script: 'true',
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
            'source_field',
            'source_record_id',
            '__column__.1_2',
            'target_record_id',
            '__tab__.service',
            '__section__.2',
            'id',
            '__section__.3',
            '__column__.3_1',
            'created_at',
            'updated_at',
            '__column__.3_2',
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
      __lock: ['delete'],
    },
  ],
  permissions: [
    { type: 'model', action: 'create', script: 'true', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'true', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'true', __lock: ['delete'] },
  ],
};
