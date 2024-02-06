import lodash from 'lodash-es';

export default async (ids, sandbox) => {
  const { p } = sandbox.vm;

  const geo_metadata = (await p.getModel('geo_metadata')).setOptions({ check_permission: { all: false } });
  const field = (await p.getModel('field')).setOptions({ check_permission: { all: false } });
  const model = (await p.getModel('model')).setOptions({ check_permission: { all: false } });
  const view = (await p.getModel('view')).setOptions({ check_permission: { all: false } });

  const result = {
    list: [],
    models: {},
    metadata: {},
    data: {}
  };

  // prepare vars
  let field_ids = [];
  let model_ids = [];
  let view_ids = [];

  const fields_map = {};
  const models_map = {};
  const views_map = {};

  const geo_metadata_map = {};
  const top_lvl_ids = [];

  // 1. select data from geo_metadata model
  const field_aliases = [
    'id',
    'alias',
    'model',
    'point_a',
    'point_a_ref',
    'point_b',
    'point_b_ref',
    'path',
    'label',
    'type',
    'view',
    'line_by',
  ];

  await p.iterEach(geo_metadata.find().fields(field_aliases).raw(), 5000, rec => {
    geo_metadata_map[rec.id] = rec;
    if (ids.includes(rec.id)) {
      top_lvl_ids.push(rec.id);
      if (rec.view) view_ids.push(rec.view);
    }
    if (rec.point_a) field_ids.push(rec.point_a);
    if (rec.point_b) field_ids.push(rec.point_b);
    if (rec.path) field_ids.push(rec.path);
    model_ids.push(rec.model);
  });

  // 2. select view + model + fields aliases
  // tmp workaround, reason join bugs
  field_ids = lodash.uniq(field_ids);
  model_ids = lodash.uniq(model_ids);
  view_ids = lodash.uniq(view_ids);

  await p.iterEach(field.find({ id: field_ids }).fields(['id', 'alias', 'name']).raw(), 5000, rec => (fields_map[rec.id] = { alias: rec.alias, name: rec.name }));
  await p.iterEach(model.find({ id: model_ids }).fields(['id', 'alias', 'plural']).raw(), 5000, rec => (models_map[rec.id] = { alias: rec.alias, plural: rec.plural }));
  await p.iterEach(view.find({ id: view_ids }).fields(['id', 'alias']).raw(), 5000, rec => (views_map[rec.id] = rec.alias));

  // 3. prepare result data
  for (let i = 0; i < top_lvl_ids.length; i++) {
    const meta_id = top_lvl_ids[i];
    const meta_rec = geo_metadata_map[meta_id];

    const model = meta_rec.model;
    const view = views_map[meta_rec.view] || 'default';
    const type = meta_rec.type;

    const point_a = fields_map[meta_rec.point_a]?.alias;
    const point_a_vis = fields_map[meta_rec.point_a]?.name;
    const point_a_ref = meta_rec.point_a_ref;
    const point_b = meta_rec.point_b ? fields_map[meta_rec.point_b]?.alias : null;
    const point_b_vis = meta_rec.point_b ? fields_map[meta_rec.point_b]?.name : null;
    const point_b_ref = meta_rec.point_b_ref;
    const path = meta_rec.path ? fields_map[meta_rec.path]?.alias : null;
    const label = meta_rec.label;
    const line_by = meta_rec.line_by;

    result.list.push(meta_id);
    result.models[model] = models_map[model];

    if (!result.data[model]) result.data[model] = { 'Point': [], 'LineString': [] };
    result.data[model][type].push(meta_id);

    if (type == 'LineString') {
      addToGeoMetaData(meta_id, {
        model,
        point_a,
        point_a_vis,
        point_a_ref,
        point_b,
        point_b_vis,
        point_b_ref,
        path,
        label,
        type,
        view,
        line_by,
      });

      if (point_a_ref) searchByTree(point_a_ref);
      if (point_b_ref) searchByTree(point_b_ref);
    }

    if (type == 'Point') {
      addToGeoMetaData(meta_id, {
        model,
        point_a,
        point_a_vis,
        point_a_ref,
        label,
        type,
        view
      });

      if (point_a_ref) searchByTree(point_a_ref);
    }
  }

  return result;

  function searchByTree(meta_id) {
    const meta_rec = geo_metadata_map[meta_id];
    const model = meta_rec.model;
    const point_a = fields_map[meta_rec.point_a]?.alias;
    const point_a_vis = fields_map[meta_rec.point_a]?.name;
    const point_a_ref = meta_rec.point_a_ref;
    const label = meta_rec.label;
    const type = meta_rec.type;
    const view = views_map[meta_rec.view] || 'default';

    result.models[model] = models_map[model];

    addToGeoMetaData(meta_id, {
      model,
      point_a,
      point_a_vis,
      point_a_ref,
      label,
      type,
      view,
    });
    if (point_a_ref) searchByTree(point_a_ref);
  }

  function addToGeoMetaData(id, obj) {
    if (!result.metadata[id]) result.metadata[id] = obj;
  }
};
