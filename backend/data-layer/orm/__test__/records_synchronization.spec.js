import { cloneDeep } from 'lodash-es';

const { manager } = h.record;
const { cache } = h;

describe('Records Synchronization', () => {
  it('Should create sync records value after model creation', async () => {
    t.model = await manager('model').create();
    const sync = cache.namespaces.core.get('sync');

    expect(sync[t.model.id].records).toEqual(expect.any(Number));
  });

  it('Should update sync records value after record creation', async () => {
    const syncBefore = cloneDeep(cache.namespaces.core.get('sync'));
    t.record = await manager({ id: t.model.id }).manager.create();
    const syncAfter = cache.namespaces.core.get('sync');

    expect(syncAfter[t.model.id].records).not.toBe(syncBefore[t.model.id].records);
  });

  it('Should update sync records value after record update', async () => {
    t.field = await manager('field').create({ model: t.model.id });

    const syncBefore = cloneDeep(cache.namespaces.core.get('sync'));
    await manager({ id: t.model.id }).update(t.record, { [t.field.alias]: 'John Doe' });
    const syncAfter = cache.namespaces.core.get('sync');

    expect(syncAfter[t.model.id].records).not.toBe(syncBefore[t.model.id].records);
  });

  it('Should update sync records value after record delete', async () => {
    const syncBefore = cloneDeep(cache.namespaces.core.get('sync'));
    await manager({ id: t.model.id }).destroy(t.record);
    const syncAfter = cache.namespaces.core.get('sync');

    expect(syncAfter[t.model.id].records).not.toBe(syncBefore[t.model.id].records);
  });
});
