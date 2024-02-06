import Promise from 'bluebird';
import { each, map, cloneDeep } from 'lodash-es';

const { manager } = h.record;
const { cache } = h;

const META_MODELS = [
  'action',
  'appearance',
  'field',
  'filter',
  'form',
  'layout',
  'permission',
  'privilege',
  'view',
  'ui_rule',
];

describe('Synchronization', () => {
  it('Should create sync object after model creation', async () => {
    const syncBefore = cloneDeep(cache.namespaces.core.get('sync'));
    t.model = await manager('model').create();
    const syncAfter = cache.namespaces.core.get('sync');
    expect(syncAfter).toEqual({ ...syncBefore, [t.model.id]: syncAfter[t.model.id] });
    each(syncAfter[t.model.id], (v) => expect(v).toEqual(expect.any(Number)));
  });

  it('Should update sync meta value after meta record create', async () => {
    await Promise.each(META_MODELS, async (alias) => {
      const syncBefore = cache.namespaces.core.get('sync')[t.model.id][alias];
      t[alias] = await manager(alias).create({ model: t.model.id });
      const syncAfter = cache.namespaces.core.get('sync')[t.model.id][alias];
      expect(syncAfter).not.toBe(syncBefore);
    });
  });

  it('Should update sync meta value after meta record update', async () => {
    await Promise.each(META_MODELS, async (alias) => {
      const syncBefore = cache.namespaces.core.get('sync')[t.model.id][alias];
      t[alias] = await manager(alias).update(t[alias], { updated_at: new Date() });
      const syncAfter = cache.namespaces.core.get('sync')[t.model.id][alias];
      expect(syncAfter).not.toBe(syncBefore);
    });
  });

  it('Should update sync meta value after meta record delete', async () => {
    await Promise.each(META_MODELS, async (alias) => {
      const syncBefore = cache.namespaces.core.get('sync')[t.model.id][alias];
      t[alias] = await manager(alias).destroy(t[alias]);
      const syncAfter = cache.namespaces.core.get('sync')[t.model.id][alias];
      expect(syncAfter).not.toBe(syncBefore);
    });
  });

  it('Should delete sync object after model deletion', async () => {
    expect(cache.namespaces.core.get('sync')[t.model.id]).toBeDefined();
    await manager('model').destroy(t.model);
    expect(cache.namespaces.core.get('sync')[t.model.id]).not.toBeDefined();
  });

 it(`Should show that 'model_create_or_update_trigger' should be affected just the Model table`, async () => {
   const { rows: result } = await db.schema.connection.raw(`
     select event_object_schema as table_schema,
     event_object_table as table_name,
     trigger_schema,
     trigger_name,
     string_agg(event_manipulation, ',') as event,
     action_timing as activation,
     action_condition as condition,
     action_statement as definition
     from information_schema.triggers
     where trigger_name = 'model_create_or_update_trigger'
     group by 1,2,3,4,6,7,8
     order by table_schema,
              table_name;
   `);

   expect(result.length).toEqual(1);
   expect(result[0].table_name).toEqual('object_1');
 });

it(`Should show that 'meta_sync_trigger_fnc' should be affected just the Meta tables`, async () => {
  const { rows: result } = await db.schema.connection.raw(`
    select event_object_schema as table_schema,
    event_object_table as table_name,
    trigger_schema,
    trigger_name,
    string_agg(event_manipulation, ',') as event,
    action_timing as activation,
    action_condition as condition,
    action_statement as definition
    from information_schema.triggers
    where trigger_name = 'meta_create_or_update_trigger'
    group by 1,2,3,4,6,7,8
    order by table_schema,
             table_name;
  `);

  const metaTableNames = map(META_MODELS, alias => db.model(alias).tableName).sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
  const triggerTableNames = map(result, trigger => trigger.table_name).sort((a, b) => a > b ? 1 : a < b ? -1 : 0);

  expect(result.length).toEqual(META_MODELS.length);
  expect(metaTableNames).toEqual(triggerTableNames);

});

  it(`Should show that 'records_sync_trigger' should be affected just the Custom Model tables`, async () => {
    const customModels = await db.model('model').where({ type: 'custom', __inserted: true });

    const { rows: result } = await db.schema.connection.raw(`
    select event_object_schema as table_schema,
    event_object_table as table_name,
    trigger_schema,
    trigger_name,
    string_agg(event_manipulation, ',') as event,
    action_timing as activation,
    action_condition as condition,
    action_statement as definition
    from information_schema.triggers
    where trigger_name = 'records_sync_trigger'
    group by 1,2,3,4,6,7,8
    order by table_schema,
             table_name;
  `);

    const customModelNames = map(customModels, alias => db.model(alias).tableName).sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
    const triggerTableNames = map(result, trigger => trigger.table_name).sort((a, b) => a > b ? 1 : a < b ? -1 : 0);

    expect(customModels.length).toEqual(result.length);
    expect(customModelNames).toEqual(triggerTableNames);
  });
});
