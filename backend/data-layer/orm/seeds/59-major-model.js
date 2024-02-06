export default {
  name: 'Major model',
  plural: 'Major models',
  alias: 'major_model',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: ['update', 'delete'],
  actions: [
    {
      name: 'New',
      alias: 'new',
      type: 'view_button',
      position: '-100',
      server_script: `const params = p.getRequest();

try {
  const model = await p.getModel(params.modelAlias);
  const record = await model.build(await params.getAttributesFromFilter());
  p.actions.openForm(params.modelAlias, record.attributes);
} catch (error) {
  p.response.error(error)
}`,
      condition_script: 'p.currentUser.canCreate()',
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'Create',
      alias: 'create',
      type: 'form_button',
      position: '-100',
      on_insert: true,
      client_script: 'p.record.submit()',
      server_script: `const params = p.getRequest();

try {
  const record = await params.getRecord();

  if (record) {
    record.assignAttributes(params.record)
    await record.save({ systemActions: params.system_actions });
  } else {
    const model = await p.getModel(params.modelAlias);
    await model.insert(params.record, { systemActions: params.system_actions });
  }

  p.actions.goBack();
} catch (error) {
  p.response.error(error);
}`,
      condition_script: 'p.currentUser.canCreate()',
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'Update',
      alias: 'update',
      type: 'form_button',
      position: '-100',
      on_update: true,
      client_script: 'p.record.submit()',
      server_script: `const params = p.getRequest();

try {
  const record = await params.getRecord();
  if (!record) throw new Error('Record not found');

  record.assignAttributes(params.record);
  await record.save({ systemActions: params.system_actions });

  p.actions.goBack();
} catch(error) {
  p.response.error(error)
}`,
      condition_script: 'p.currentUser.canUpdate()',
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'Delete',
      alias: 'delete',
      type: 'form_button',
      position: '-200',
      on_update: true,
      server_script: `const params = p.getRequest();

try {
  const record = await params.getRecord();
  if (!record) throw new Error('Record not found');

  await record.delete();

  p.actions.goBack();
} catch(error) {
  p.response.error(error)
}`,
      condition_script: 'p.currentUser.canDelete()',
      client_script: "confirm('Are you sure to delete current record?') && p.record.submit(false)",
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'Form embedded',
      alias: 'form_embedded',
      type: 'form_menu_item',
      position: '-100',
      condition_script: 'p.currentUser.isAdmin()',
      server_script: 'const params = p.getRequest();',
      active: true,
      on_insert: true,
      on_update: true,
      __lock: ['delete'],
    },
    {
      name: 'Form metadata',
      alias: 'form_metadata',
      type: 'form_menu_item',
      position: '-100',
      condition_script: 'p.currentUser.isAdmin()',
      server_script: 'const params = p.getRequest();',
      active: true,
      on_insert: true,
      on_update: true,
      __lock: ['delete'],
    },
    {
      name: 'View metadata',
      alias: 'view_metadata',
      type: 'view_menu_item',
      position: '-100',
      condition_script: 'p.currentUser.isAdmin()',
      server_script: 'const params = p.getRequest();',
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'Delete',
      alias: 'list_delete',
      type: 'view_choice',
      position: '-100',
      on_update: true,
      server_script: `const params = p.getRequest();

try {
  const model = await p.getModel(params.modelAlias);
  const records = await model.find({ id: params.ids });

  await Promise.map(records, (record) => record.delete());

  p.actions.openView('__self');
} catch (error) {
  p.response.error(error)
}`,
      condition_script: `if ((p.this.getType() === 'form') && (p.this.getExecType() === 'attachment_view')) {
  return p.currentUser.canDeleteAttachment();
} else {
  return p.currentUser.canDelete();
}`,
      client_script: "confirm('Are you sure to delete selected records?')",
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'Save',
      alias: 'save',
      type: 'context_menu',
      position: '-100',
      on_insert: true,
      on_update: true,
      client_script: 'p.record.submit()',
      server_script: `const params = p.getRequest();

try {
  const record = await params.getRecord();
  if (!record) throw new Error('Record not found');

  record.assignAttributes(params.record);
  await record.save({ systemActions: params.system_actions });

  p.actions.openForm(record.model.alias, record.attributes);
} catch (error) {
  p.response.error(error)
}`,
      condition_script: 'p.currentUser.canUpdate()',
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'New',
      alias: 'rtl_new',
      type: 'view_button',
      position: '-100',
      client_script: `if (p.this.getParent().getType() === 'form' && !p.this.getParent().getRecord().isChanged()) {
  return true;
}
if (confirm(p.translate('rtl_new_confirmation'))) {
  return true;
} else {
  return false;
}`,
      condition_script: 'p.currentUser.canUpdate()',
      server_script: `const params = p.getRequest();
try {
  const model = await p.getModel(params.modelAlias);
  const record = await model.build(await params.getAttributesFromFilter());
  const { embedded_to: { model: parentModelAlias, record_id: parentRecordId, field: parentFieldAlias } } = params.viewOptions || {};
  const parentModel = await p.getModel(parentModelAlias);
  const parentRecord = await parentModel.findOne({ id: parentRecordId });
  const parentField = parentRecord.getField(parentFieldAlias);
  const associate = [parentModel.id, parentRecordId, parentField.id].join('/');
  p.actions.openForm(params.modelAlias, record.attributes, { associate });
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      options: {
        view_type: { grid: true, map: false, card: false, calendar: false, chart: false },
        view_mode: { rtl: true, main_view: false, related_view: false, embedded_view: false, attachment_view: false, reference_view: false, global_reference_view: false }
      },
    },
    {
      name: 'Edit',
      alias: 'rtl_edit',
      type: 'view_button',
      position: '-100',
      server_script: 'false',
      condition_script: 'p.currentUser.canUpdate()',
      client_script: `
const parentRecord = p.this.getParent().getRecord();
const parentFieldAlias = p.this.options.field.alias;
const parentField = parentRecord.getField(parentFieldAlias);
const rtlFieldOptions = parentField.getOptions();
const modelAlias = rtlFieldOptions.foreign_model;
const viewAlias = rtlFieldOptions.view ? rtlFieldOptions.view : null;
const selected = parentRecord.getValue(parentFieldAlias);
const filter = parentField.getFilter();
p.actions.openView(modelAlias, viewAlias, { "popup": "full", "type":"rtl_popup", "selectedRecords": selected, "field": parentFieldAlias, "filter": filter });
return false;`,
      active: true,
      options: {
        view_type: { grid: true, map: false, card: false, calendar: false, chart: false },
        view_mode: { rtl: true, main_view: false, related_view: false, embedded_view: false, attachment_view: false, reference_view: false, global_reference_view: false }
      },
      __lock: ['delete'],
    },
    {
      name: 'Apply',
      alias: 'apply_rtl_records',
      type: 'view_button',
      position: '-100',
      server_script: 'false',
      condition_script: 'p.currentUser.canUpdate()',
      client_script: `if (p.this.options.onChange) {
  p.this.options.onChange(p.this.getSelectedRecords());
} else {
  let parent = p.this.getParent();
  if (parent.type === 'component') parent = lodash.find(parent.children, {type: 'form'});
  const parentRecord = parent.getRecord();
  const parentField = p.this.options.field;
  parentRecord.setValue(parentField, p.this.getSelectedRecords());
}
p.this.close();
return false;`,
      active: true,
      options: {
        view_type: { grid: true, map: false, card: false, calendar: false, chart: false },
        view_mode: { rtl_popup: true, main_view: false, related_view: false, embedded_view: false, attachment_view: false, reference_view: false, global_reference_view: false }
      },
      __lock: ['delete'],
    },
    {
      name: 'Unrelate',
      alias: 'rtl_list_unrelate',
      type: 'view_choice',
      position: '-100',
      server_script: 'false',
      condition_script: 'p.currentUser.canUpdate()',
      client_script: `const parentRecord = p.this.getParent().getRecord();
const parentField = p.this.options.field.alias;
const value = _.difference(parentRecord.getValue(parentField), p.this.getSelectedRecords());
parentRecord.setValue(parentField, value);
return false;`,
      active: true,
      options: {
        view_type: { grid: true, map: false, card: false, calendar: false, chart: false },
        view_mode: { rtl: true, main_view: false, related_view: false, embedded_view: false, attachment_view: false, reference_view: false, global_reference_view: false }
      },
      __lock: ['delete'],
    },
    {
      name: 'Delete',
      alias: 'rtl_list_delete',
      type: 'view_choice',
      position: '-100',
      server_script: `const params = p.getRequest();
try {
  const model = await p.getModel(params.modelAlias);
  const records = await model.find({ id: params.ids });
  const { model: parentModelAlias, record_id: parentRecordId, field: parentField } = params.embedded_to;
  const parentModel = await p.getModel(parentModelAlias);
  const parentRecord = await parentModel.findOne({ id: parentRecordId });
  const newValue = lodash.difference(parentRecord.getValue(parentField), params.ids);
  parentRecord.setValue(parentField, newValue);
  await parentRecord.save();
  await Promise.map(records, (record) => record.delete());
  p.actions.openView('__self');
} catch (error) {
  p.response.error(error)
}`,
      condition_script: 'p.currentUser.canDelete()',
      client_script: `const ids = p.this.getSelectedRecords();
if (confirm(p.translate('rtl_list_delete_confirmation', { ids: ids }))) {
  const parentRecord = p.this.getParent().getRecord();
  const parentField = p.this.options.field.alias;
  const value = _.difference(parentRecord.getValue(parentField), ids);
  parentRecord.setValue(parentField, value);
  return true;
} else {
  return false;
}`,
      active: true,
      options: {
        view_type: { grid: true, map: false, card: false, calendar: false, chart: false },
        view_mode: { rtl: true, main_view: false, related_view: false, embedded_view: false, attachment_view: false, reference_view: false, global_reference_view: false }
      },
      __lock: ['delete'],
    },
    {
      name: 'Map Draw Action',
      alias: 'map_draw',
      type: 'map_draw',
      position: 0,
      condition_script: 'p.this.getParent().getOptions().draw.enable === true',
      server_script: `const request = p.getRequest()
const params = request.ui_params || {}

try {
  await checkPermission(params.attributes);

  const type = getType(params)
  const func = { free: processFreeObject, associated: processAssociatedObject }

  p.response.json({ data: await func[type](params) })
} catch (error) {
  p.response.json({ error })
  p.log.error(error)
}

async function checkPermission(attributes = {}) {
  const { model_id, record_id, appearance_id } = attributes

  const parentModel = await p.getModel(model_id)
  const parentRecord = await parentModel.findOne({ id: record_id })

  return p.utils.getConditionResult(
    'appearance',
    appearance_id,
    'drawing',
    parentRecord,
    { error: { type: 'NoPermissionsError', message: 'Drawing condition is not met' } }
  )
}

function getType(params = {}) {
  const { target = {} } = params;
  const { properties = {} } = target.newValue || {}

  return properties.editable
}

async function processFreeObject(params = {}) {
  const { action, target = {}, attributes } = params;
  const { properties = {} } = target.newValue || {};
  const { id } = properties;

  const model = await p.getModel('free_geo_object', { check_permission: { all: false } });

  if (target.type === 'lineString') {
    if (target.newValue.end_a) {
      attributes.end_a = target.newValue.end_a.geometry.coordinates
    } else {
      attributes.end_a = lodash.first(target.newValue.geometry.coordinates)
    }
  }

  if (action === 'new') return (await model.insert(attributes)).attributes
  if (action === 'change') return model.find({ id }).update(attributes)
  if (action === 'delete') return model.find({ id }).delete()
}

async function processAssociatedObject(params = {}) {
  const { action, target = {} } = params

  if (action === 'change') {
    const c = target.newValue.geometry.coordinates;
    const m = await db.model('geo_metadata').where({ id: target.newValue.properties.gmd_id, __inserted: true }).getOne();
    const r = await (await p.getModel(target.newValue.properties.model))
      .setOptions({ check_permission: { all: false } })
      .findOne({ id: target.newValue.properties.id });

    if (target.type === 'point') {
      await updateAssociatedPoint('a', c, m, r, params);
    }

    if (target.type === 'lineString') {
      const path = db.getField({ id: m?.path })

      if (m?.line_by === 'point_ab') {
        if (path) await r.assignAttributes({ [path.alias]: c }).save();

        const match = lodash.isEqual(lodash.first(target.oldValue.geometry.coordinates), target.newValue.properties.end_a);
        const f = lodash.first(c);
        const l = lodash.last(c);

        if (match) {
          await updateAssociatedPoint('a', f, m, r);
          await updateAssociatedPoint('b', l, m, r);
        } else {
          await updateAssociatedPoint('a', l, m, r);
          await updateAssociatedPoint('b', f, m, r);
        }
      } else {
        if (path) {
          await r.assignAttributes({ [path.alias]: c }).save();
        } else {
          const am = await p.getModel('associated_geo_object', { check_permission: false });
          const ar = await am.findOne({ id: target.newValue.properties.assoc_id });

          const properties = helpers.parseOptions(ar.getValue('properties'))
          await ar.update({ properties: { ...properties, path: c } })
        }
      }
    }

    return r.attributes;
  }

  if (action === 'delete') {
    const model = await p.getModel('associated_geo_object', { check_permission: false });
    return model.find({ id: target.newValue.properties.assoc_id }).delete()
  }
}

async function updateAssociatedPoint(end, value, meta = {}, record = {}) {
  const field = db.getField({ id: meta[\`point_\${end}\`] });

  if (db.schema.GEO_FIELDS.includes(field.type)) {
    await record.assignAttributes({ [field.alias]: value }).save()
  }

  if (field.type === 'reference') {
    const mId = meta[\`point_\${end}_ref\`];
    if (!mId) return;

    const rId = record.getValue(field.alias)
    if (!rId) return;

    const m = await db.model('geo_metadata').where({ id: mId, __inserted: true }).getOne();
    const r = await (await p.getModel(m.model))
      .setOptions({ check_permission: { all: false } })
      .findOne({ id: rId });

    await updateAssociatedPoint('a', value, m, r);
  }
}`,
      response_script: `const target = p.this.getTarget();
const action = p.this.getAction();

const params = p.getResponse()

if (params.data.data) {
  if (action === 'new') {
    const feature = lodash.cloneDeep({
      id: \`\${params.data.data.model_id}:\${params.data.data.id}\`,
      geometry: target.newValue.geometry,
      properties: {
        ...target.newValue.properties,
        'id': params.data.data.id,
        'model': params.data.data.model_id,
      },
    });

    if (target.type === 'lineString') {
      const end_a = target.newValue.end_a
      const end_b = target.newValue.end_b

      if (end_a || end_b) {
        feature.properties['followed-by'] = []
      }

      if (end_a) {
        const newId = \`\${feature.id}:a\`
        p.this.parent.setFeature(
          { section: 'default', id: end_a.id },
          { ...end_a, id: newId, properties: { ...end_a.properties, 'follow-up': feature.id } }
        )
        feature.properties['followed-by'].push(newId)
      }

      if (end_b) {
        const newId = \`\${feature.id}:b\`
        p.this.parent.setFeature(
          { section: 'default', id: end_b.id },
          { ...end_b, id: newId, properties: { ...end_b.properties, 'follow-up': feature.id } }
        )
        feature.properties['followed-by'].push(newId)
      }
    }

    p.this.parent.setFeature({ section: 'Free objects', id: target.newValue.id }, feature)
    p.this.parent.update();
  }

  p.actions.showMessage(p.translate('map_draw_changes_successfully_saved'))
}

if (params.data.error) {
  if (action == 'new') p.this.parent.removeFeature({ section: 'Free objects', id: target.newValue.id });
  if (action == 'change') p.this.parent.setFeature({ section: 'Free objects', id: target.newValue.id }, target.oldValue);
  if (action == 'delete') p.this.parent.addFeature(target.newValue);

  p.this.parent.update();
  p.actions.showMessage({
    type: 'negative',
    content: \`\${p.translate('map_draw_cannot_perform_object_processing')}: \${params.data.error.description}\`
  });
}

return false;`,
      client_script: `const target = p.this.getTarget();
const action = p.this.getAction();

const TYPES_MAP = {
  point: 'geo_point',
  lineString: 'geo_line_string',
  polygon: 'geo_polygon',
}

if (target.newValue.properties.editable) {
  try {
    const type = TYPES_MAP[target.type]
    const attributes = {
      type,
      [type]: target.newValue.geometry.coordinates,
      model_id: p.this.parent.parent.getRecord().getModel().getValue('id'),
      record_id: p.this.parent.parent.getRecord().getValue('id'),
      appearance_id: p.this.parent.getValue('appearance'),
    };
  
    if (target.type === 'lineString') {
      target.newValue.end_a = p.this.parent.getFeature({ section: 'default', id: \`\${target.newValue.id}:a\` })
      target.newValue.end_b = p.this.parent.getFeature({ section: 'default', id: \`\${target.newValue.id}:b\` });
    }
  
    return {
      result: true,
      ui_params: { action, target, attributes },
    }
  } catch (error) {
    console.log(error)
    p.actions.showMessage(error)
  }
}

return false;`,
      active: true,
      options: {
        view_type: { grid: false, map: true, card: false, calendar: false, chart: false },
        view_mode: { rtl: false, main_view: false, related_view: false, embedded_view: true, attachment_view: false, reference_view: false, global_reference_view: false }
      },
      __lock: ['delete'],
    },
  ],
};