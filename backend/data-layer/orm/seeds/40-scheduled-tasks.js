export default {
  name: 'Scheduled task',
  plural: 'Scheduled tasks',
  alias: 'scheduled_task',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  audit: 'none',
  __lock: ['delete'],
  fields: [
    {
      name: 'Name',
      alias: 'name',
      type: 'string',
      index: 'unique',
      __lock: ['delete'],
    },
    {
      name: 'Description',
      alias: 'description',
      type: 'string',
      options: { length: 1000 },
      __lock: ['delete'],
    },
    { name: 'Active',
      alias: 'active',
      type: 'boolean',
      options: { default: true },
      __lock: ['delete'],
    },
    {
      name: 'Start at',
      alias: 'start_at',
      type: 'datetime',
      required_when_script: 'true',
      __lock: ['delete'],
    },
    { name: 'Re-enable type',
      alias: 'reenable_type',
      type: 'array_string',
      options: {
        values: {
          no_reenable: 'No Re-enable',
          seconds: 'Seconds',
          minutes: 'Minutes',
          days: 'Days',
          months: 'Months',
          years: 'Years',
        },
        default: 'no_reenable',
        length: 2048,
      },
      __lock: ['delete'],
    },
    {
      name: 'Re-enable every',
      alias: 'reenable_every',
      type: 'integer',
      hidden_when_script: `p.record.getValue('reenable_type') === 'no_reenable'`,
      required_when_script: `p.record.getValue('reenable_type') !== 'no_reenable'`,
      __lock: ['delete'],
    },
    { name: 'Re-enable end',
      alias: 'reenable_end',
      type: 'array_string',
      options: {
        values: {
          no_end_date: 'No end date',
          end_by_count: 'End by count',
          end_by_date: 'End by date',
        },
        default: 'no_end_date',
        length: 2048,
      },
      hidden_when_script: `p.record.getValue('reenable_type') === 'no_reenable'`,
      __lock: ['delete'],
    },
    {
      name: 'End by count',
      alias: 'end_by_count',
      type: 'integer',
      required_when_script: `p.record.getValue('reenable_type') !== 'no_reenable' && p.record.getValue('reenable_end') === 'end_by_count'`,
      hidden_when_script: `p.record.getValue('reenable_end') !== 'end_by_count'`,
      __lock: ['delete'],
    },
    {
      name: 'End by date',
      alias: 'end_by_date',
      type: 'datetime',
      required_when_script: `p.record.getValue('reenable_type') !== 'no_reenable' && p.record.getValue('reenable_end') === 'end_by_date'`,
      hidden_when_script: `p.record.getValue('reenable_end') !== 'end_by_date'`,
      __lock: ['delete'],
    },
    {
      name: 'Script',
      alias: 'script',
      type: 'string',
      options: { length: 150000, syntax_hl: 'js' },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Last run at',
      alias: 'last_run_at',
      type: 'datetime',
      __lock: ['delete'],
    },
    {
      name: 'Last run duration',
      alias: 'last_run_duration',
      type: 'integer',
      __lock: ['delete'],
    },
    {
      name: 'Run counter',
      alias: 'run_counter',
      type: 'integer',
      options: { default: 0 },
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
        columns: ['id', 'name', 'active', 'start_at', 'last_run_at', 'reenable_type',
          'reenable_every', 'reenable_end', 'created_at', 'updated_at'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'active', type: 'none' },
          { field: 'start_at', type: 'none' },
          { field: 'last_run_at', type: 'none' },
          { field: 'reenable_type', type: 'none' },
          { field: 'reenable_every', type: 'none' },
          { field: 'reenable_end', type: 'none' },
          { field: 'created_at', type: 'none' },
          { field: 'updated_at', type: 'none' },
        ],
        wrap_text: false,
        cell_editing: false,
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
            'start_at',
            'reenable_type',
            '__column__.1_2',
            'active',
            'reenable_end',
            'reenable_every',
            'end_by_count',
            'end_by_date',
            '__section__.2',
            'script',
            '__tab__.service',
            '__section__.3',
            'id',
            '__section__.4',
            '__column__.4_1',
            'created_at',
            'updated_at',
            'last_run_at',
            'run_counter',
            '__column__.4_2',
            'created_by',
            'updated_by',
            'last_run_duration',
            '__section__.5',
            'description',
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
  actions: [
    {
      name: 'Run now',
      alias: 'run_now',
      type: 'form_button',
      position: '100',
      on_insert: false,
      on_update: true,
      server_script: `const params = p.getRequest();
const now = new Date();

try {
  const record = await params.getRecord();
  if (!record) throw new Error('Record not found');

  await record.update({ ...params.record, active: true });

  const recordId = record.getValue('id');
  const ptModel = await p.getModel('planned_task');
  const ptRecord = await ptModel.order({ id: 'desc' }).findOne({ scheduled_task: recordId });

  if (ptRecord) {
    if (['enqueued', 'in_progress'].includes(ptRecord.getValue('status'))) return p.actions.showMessage(p.translate('static.run_process_is_in_progress'));
    if (['new'].includes(ptRecord.getValue('status'))) await ptRecord.update({ scheduled_on: now });
  }

  if (!ptRecord || (ptRecord.getValue('status') !== 'new')) {
    await ptModel.insert({ status: 'new', scheduled_task: recordId, scheduled_on: now });
  }

  return p.actions.showMessage(p.translate('static.new_run_process_initiated'));
} catch(error) {
  p.response.error(error);
}`,
      condition_script: 'p.currentUser.canAtLeastWrite() && p.record.getValue("active")',
      active: true,
      __lock: ['delete'],
    },
  ],
  records: [
    {
      name: 'Ip Ban cleaner (Core)',
      active: true,
      start_at: new Date().setHours(0, 0, 0, 0),
      reenable_end: 'no_end_date',
      reenable_type: 'days',
      reenable_every: 1,
      script: `const minutes = 360;
const now = new Date();
const limit = new Date(now - minutes * 60 * 1000);

try {
  const model = await p.getModel('ip_ban');
  const count = await model.find({ updated_at: { '<': limit }, ban_till: { '<': now } })
                         .orFind({ created_at: { '<': limit }, ban_till: { '<': now } })
                         .orFind({ updated_at: { '<': limit }, ban_till: null })
                         .orFind({ created_at: { '<': limit }, ban_till: null })
                         .delete();

  p.log.info(\`Cleanup old ip bans (\${count} ip bans)\`);
} catch (error) {
  p.log.error(error);
}`,
      __lock: ['delete'],
      __lock_fields: "alias != 'active'",
    },
    {
      name: 'Session cleaner (Core)',
      active: true,
      start_at: new Date().setHours(0, 0, 0, 0),
      reenable_end: 'no_end_date',
      reenable_type: 'days',
      reenable_every: 1,
      script: `const days = p.getSetting('data_store_periods.sessions_days') || 3;
const now = new Date();
const limit = new Date(now - days * 24 * 60 * 60 * 1000);

try {
  const model = await p.getModel('session');
  const count = await model.find({ last_activity_at: { '<': limit } }).delete();

  p.log.info(\`Cleanup old sessions (\${count} sessions)\`);
} catch (error) {
  p.log.error(error);
}`,
      __lock: ['delete'],
      __lock_fields: "alias != 'active'",
    },
    {
      name: 'Global Cleaner (Core)',
      active: true,
      start_at: new Date().setHours(0, 0, 0, 0),
      reenable_end: 'no_end_date',
      reenable_type: 'days',
      reenable_every: 1,
      script: `//# script_timeout: 1000000
// Global Cleaner (Core)


const log = {}, params = getParams(), m = await getModels();

await cleanNotInserted();
await cleanLogs();
await cleanPlannedTasks();
await cleanEmails();
await cleanAttachments();
await cleanMapCache();
await cleanMCSync();
await cleanCoreModelsWithoutParent();
await cleanGlRef();
await cleanRTL();
await cleanAudit();

p.log.info(log, "Cleaner");
return log;

/// === FUNCTIONS ====

function getParams(){
  const options = {
    recs_not_inserted_keep_days: +p.getSetting('data_store_periods.del_recs_not_inserted_after_days') || 3,
    log_web_keep_days: +p.getSetting('data_store_periods.del_log_web_after_days') || 5,
    log_background_keep_days: +p.getSetting('data_store_periods.del_log_background_after_days') || 3,
    log_mc_keep_days: +p.getSetting('data_store_periods.del_log_mc_days') || 5,
    activity_log_keep_days: +p.getSetting('data_store_periods.activity_log_keep_days') || 90,
    planned_task_keep_days: +p.getSetting('data_store_periods.del_planned_task_after_days') || 5,  // base on status
    mails_unrelated_keep_days: +p.getSetting('data_store_periods.del_mails_unrelated_after_days') || 5,   // +base on status - ошибки, без связей
    attachments_unrelated_keep_days: +p.getSetting('data_store_periods.del_attachments_unrelated_after_days') || 3,  // все бесхозные, есть такие после недосоздания рекорда
    mc_sync_keep_days: +p.getSetting('data_store_periods.del_recs_mc_sync_after_days') || 3,
  };
  const params = {};
  for (let i in options) params[i] = moment().subtract(options[i], 'days').toDate();
  return params;
};

async function getModels(){
  return (
    {
      model: await p.getModel('model'),
      log:  await p.getModel('log'),
      planned_task:  await p.getModel('planned_task'),
      email:  await p.getModel('email'),
      glRef:  await p.getModel('global_references_cross'),
      attachment:  await p.getModel('attachment'),
      field:  await p.getModel('field'),
      rtl:  await p.getModel('rtl'),
      user_activity_log:  await p.getModel('user_activity_log'),
      map_view_cache: await p.getModel('map_view_cache'),
      mc_custom_sync: await p.getModel('mc_custom_sync'),
      action: await p.getModel('action'),
      form: await p.getModel('form'),
      db_rule: await p.getModel('db_rule'),
      ui_rule: await p.getModel('ui_rule'),
      view: await p.getModel('view'),
      layout: await p.getModel('layout'),
      appearance: await p.getModel('appearance'),
      chart: await p.getModel('chart'),
      filter: await p.getModel('filter'),
      escalation_rule: await p.getModel('escalation_rule'),
      permission: await p.getModel('permission'),
      privilege: await p.getModel('privilege'),
    }
  )
}

async function cleanNotInserted(){
  // recs_not_inserted
  log.recs_not_inserted = [];
  await p.iterEach( m.model.find().raw(), async rec => {
    try{
      const count = await db.model(rec.alias).where({ __inserted: false }).andWhere(function () {
        this.where('created_at', '<=', params.recs_not_inserted_keep_days).orWhereNull('created_at');
      }).delete();
      const obj = {}; obj[rec.alias] = count;
      log.recs_not_inserted.push(obj);
    }catch(e){}
  })
  p.log.info(\`cleanNotInserted on \${params.recs_not_inserted_keep_days} Done\`, "Cleaner");
}

async function cleanLogs(){
  log.log_web = await m.log.find( { domain: 'web', created_at: {'<=': params.log_web_keep_days} } ).delete();
  log.log_background = await m.log.find( { domain: ['background_mails','background_tasks'], created_at: {'<=': params.log_background_keep_days} } ).delete();
  log.log_mc = await m.log.find( { domain: 'mc_proxy', created_at: {'<=': params.log_mc_keep_days} } ).delete();
  // activity log
  log.user_activity_log = await m.user_activity_log.find( { created_at: {'<=': params.activity_log_keep_days} } ).delete();
  p.log.info(\`cleanLogs web on \${params.log_web_keep_days} Done\`, "Cleaner");
  p.log.info(\`cleanLogs bg on \${params.log_background_keep_days} Done\`, "Cleaner");
  p.log.info(\`cleanLogs mc on \${params.log_mc_keep_days} Done\`, "Cleaner");
  p.log.info(\`cleanLogs user activity log on \${params.activity_log_keep_days} Done\`, "Cleaner");
}

async function cleanPlannedTasks(){
  // planned_task
  log.planned_task = await m.planned_task.find( { status: {'!=': "new"}, updated_at: {'<=': params.planned_task_keep_days} } ).delete();
  p.log.info(\`cleanPlannedTasks on \${params.planned_task_keep_days} Done\`, "Cleaner");
}

async function cleanEmails(){
  // mails_unrelated
  log.mails_unrelated = await m.email.find( { status: {'!=': "new"}, target_record: 'ISNULL', created_at: {'<=': params.mails_unrelated_keep_days} } ).delete();

  m.email.setOptions({ includeNotInsertedRecords: true }); // life hack.. Should be for m.glRef.setOptions(..)

  await p.iterFeed(
    m.email
    .join(m.glRef, "id", m.email, "target_record")
    .find({id: 'ISNULL'}, m.glRef)
    .find({created_at: {'<=': params.mails_unrelated_keep_days}}, m.email)
    .find({status: {'!=': "new"}}, m.email)
    .raw(), 200, async (recs) => {
      const ids = recs.map(i => i.email.id);
      if (ids.length) log[\`mails_unrelated_no_glref_\${ids[0]}\`] = await m.email.find( { id: ids } ).delete();
    } );
    p.log.info(\`cleanEmails on \${params.mails_unrelated_keep_days} Done\`, "Cleaner");
}

async function cleanAttachments(){
  // attachment
  m.attachment.setOptions({ includeNotInsertedRecords: true }); // life hack.. Should be for m.glRef.setOptions(..)

  await p.iterFeed(
    m.attachment
    .join(m.glRef, "id", m.attachment, "target_record")
    .find({id: 'ISNULL'}, m.glRef)
    .find({created_at: {'<=': params.attachments_unrelated_keep_days}}, m.attachment)
    .raw(), 1000, async (recs) => {
      const ids = recs.map(i => i.attachment.id);
      if (ids.length) log[\`attachments_unrelated_\${ids[0]}\`] = await m.attachment.find( { id: ids } ).delete();
    } );
  p.log.info(\`cleanAttachments on \${params.attachments_unrelated_keep_days} Done\`, "Cleaner");
}

async function cleanMapCache(){
  const map_cache_keep_hours = p.getSetting('data_store_periods.cache.view.map') || 72;
  const keep_date = moment().subtract(map_cache_keep_hours, 'hours').toDate();
  log.map_view_cache = await m.map_view_cache.find( { expiry_date: {'<=': keep_date} } ).delete();
  p.log.info(\`cleanMapCache on \${keep_date} Done\`, "Cleaner");
}

async function cleanMCSync() {
  log.planned_task = await m.mc_custom_sync.find({ created_at: { '<=': params.mc_sync_keep_days } }).delete();
  p.log.info(\`cleanMCSync on \${params.mc_sync_keep_days} Done\`, "Cleaner");
}

async function cleanCoreModelsWithoutParent() {
  const linkToModel = [
    'field',

    // TODO: adjust as it drops page actions
    // 'action',

    'form',
    'db_rule',
    'ui_rule',
    'view',
    'layout',
    'appearance',
    'filter',
    'escalation_rule',
    'permission',
    'privilege',
  ];

  for (let j in linkToModel) {
    let alias = linkToModel[j];
    m[alias].setOptions({ includeNotInsertedRecords: true });
    await p.iterFeed(
      m[alias]
      .join(m.model, "id", m[alias], "model")
      .find({id: 'ISNULL'}, m.model)
      .raw(), 1000, async (recs) => {
        const ids = recs.map(i => i[alias].id);
        if (ids.length) log[\`\${alias}_unrelated_\${ids[0]}\`] = await m[alias].find( { id: ids } ).delete();
      } );
    p.log.info(\`clean \${alias}: Done\`, "Cleaner");
  }

  m.chart.setOptions({ includeNotInsertedRecords: true });
  await p.iterFeed(
    m.chart
    .join(m.model, "id", m.chart, "data_source")
    .find({id: 'ISNULL'}, m.model)
    .raw(), 1000, async (recs) => {
      const ids = recs.map(i => i.chart.id);
      if (ids.length) log[\`\$chart_unrelated_\${ids[0]}\`] = await m.chart.find( { id: ids } ).delete();
    } );
  p.log.info(\`clean chart: Done\`, "Cleaner");

  m.escalation_rule.setOptions({ includeNotInsertedRecords: true });
  await p.iterFeed(
    m.escalation_rule
    .join(m.field, "id", m.escalation_rule, "target_field")
    .find({id: 'ISNULL'}, m.field)
    .raw(), 1000, async (recs) => {
      const ids = recs.map(i => i.escalation_rule.id);
      if (ids.length) log[\`\$escalation_rule_unrelated_to_target_field_\${ids[0]}\`] = await m.escalation_rule.find( { id: ids } ).delete();
    } );
  p.log.info(\`clean Escalation rules unrelated to Target Field: Done\`, "Cleaner");

  m.permission.setOptions({ includeNotInsertedRecords: true });
  await p.iterFeed(
    m.permission
    .join(m.field, "id", m.permission, "field")
    .find({type: 'field'}, m.permission)
    .find({id: 'ISNULL'}, m.field)
    .raw(), 1000, async (recs) => {
      const ids = recs.map(i => i.permission.id);
      if (ids.length) log[\`\$permission_unrelated_to_field_\${ids[0]}\`] = await m.permission.find( { id: ids } ).delete();
    } );
  p.log.info(\`clean Permissions unrelated to Field: Done\`, "Cleaner");
}

async function cleanGlRef(){
  // global_ref

  // global_ref by Source field

  m.glRef.setOptions({ includeNotInsertedRecords: true }); // life hack.. Should be m.field

  // clean by source field
  await p.iterFeed(
    m.glRef
    .join(m.field, "id", m.glRef, "source_field")
    .find({id: 'ISNULL'}, m.field)
    .raw(), 1000, async (recs) => {
      const ids = recs.map(i => i.global_references_cross.id);
      if (ids.length) log[\`glRef_source_field_\${ids[0]}\`] = await m.glRef.find( { id: ids } ).delete();
    } );

  // clean by target
  // get target models ID list
  const tm_list = await p.iterMap(m.glRef.find().group('target_model', {'count': {'COUNT': 'target_model'}}), rec => rec.target_model);

  for (let i = 0; i < tm_list.length; i++){
    const model = await p.getModel(tm_list[i]);
    const m_alias = model.getValue('alias');
    m.glRef.setOptions({ includeNotInsertedRecords: true }); // life hack.. Should be per each model in the loop

    await p.iterFeed(
      m.glRef
      .join(model, "id", m.glRef, "target_record_id")
      .find({target_model: tm_list[i]}, m.glRef)
      .find({id: 'ISNULL'}, model)
      .raw(), 1000, async (recs) => {
        const ids = recs.map(i => i.global_references_cross.id);
        if (ids.length) log[\`glRef_\${m_alias}_\${ids[0]}\`] = await m.glRef.find( { id: ids } ).delete();
      } );
  }
  p.log.info("cleanGlRef Done", "Cleaner");
}

async function cleanRTL(){
  // RTL
  // RTL by Source field

  m.rtl.setOptions({ includeNotInsertedRecords: true }); // life hack.. Should be m.field
  // clean by source field
  await p.iterFeed(
    m.rtl
    .join(m.field, "id", m.rtl, "source_field")
    .find({id: 'ISNULL'}, m.field)
    .raw(), 1000, async (recs) => {
      const ids = recs.map(i => i.rtl.id);
      if (ids.length) log[\`rtl_source_field_\${ids[0]}\`] = await m.rtl.find( { id: ids } ).delete();
    }
  );


  // clean by source and target record
  // get fields ID list
  const sf_list = await p.iterMap(m.rtl.find().group('source_field', {'count': {'COUNT': 'source_field'}}), rec => rec.source_field);

  for (let i = 0; i < sf_list.length; i++){
    const fld = await m.field.findOne({id: sf_list[i]}).raw();
    if (!fld) continue;
    const s_model_id = fld.model;
    const s_model = await p.getModel(s_model_id);
    const s_model_alias = s_model.getValue('alias');
    const t_model_alias = getOptionTargetModel(fld.options);
    if (!t_model_alias) continue;
    const t_model = await p.getModel(t_model_alias);

    m.rtl.setOptions({ includeNotInsertedRecords: true }); // life hack.. Should be per each model in the loop
    await p.iterFeed(
      m.rtl
      .join(s_model, "id", m.rtl, "source_record_id")
      .find({source_field: sf_list[i]}, m.rtl)
      .find({id: 'ISNULL'}, s_model)
      .raw(), 1000, async (recs) => {
        const ids = recs.map(i => i.rtl.id);
        if (ids.length) log[\`rtl_source_\${s_model_alias}_\${ids[0]}\`] = await m.rtl.find( { id: ids } ).delete();
      } );
    await p.iterFeed(
      m.rtl
      .join(t_model, "id", m.rtl, "target_record_id")
      .find({source_field: sf_list[i]}, m.rtl)
      .find({id: 'ISNULL'}, t_model)
      .raw(), 1000, async (recs) => {
        const ids = recs.map(i => i.rtl.id);
        if (ids.length) log[\`rtl_target_\${t_model_alias}_\${ids[0]}\`] = await m.rtl.find( { id: ids } ).delete();
      } );
  }
  p.log.info("cleanRTL Done", "Cleaner");
}

function getOptionTargetModel(val){
  try{
    return JSON.parse(val).foreign_model;
  }catch(e){}
}

async function cleanAudit(){
  const audit_keep_days = +p.getSetting('data_store_periods.del_recs_audit_after_days');
  const aliases = Object.keys(audit_keep_days);
  const mainModels = await m.model.find( { alias: aliases } );
  for (let i in mainModels) {
    let id = mainModels[i].getValue('id');
    let alias = mainModels[i].getValue('alias');
    let auditModel = await p.getModel(\`audit_\${id}\`);
    let keepDays = audit_keep_days[alias] || 90;
    log[\`audit_unrelated_\${alias}\`] = await auditModel.find( { created_at: {'<=': keepDays} } ).delete();
  }
  p.log.info("cleanAudit Done", "Cleaner");
}`,
      __lock: ['delete'],
      __lock_fields: "alias != 'active'",
    },
  ],
  permissions: [
    { type: 'model', action: 'create', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
  ],
};
