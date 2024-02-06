import Fetcher from '../../index.js';
import loadExternalData from '../external.js';

const { manager } = h.record;

describe('Record: Fetcher', () => {
  describe('loaders - loadExternalData', () => {
    describe('Plugins', () => {
      describe('Inventory models', () => {
        plugins.inventory_models.connected
          ? it('Plugin is connected', () => expect(plugins.inventory_models.connected).toEqual(true))
          : it('Plugin is disconnected', () => expect(plugins.inventory_models.connected).toEqual(false));

        plugins.inventory_models.connected && it('Should load common template tree when fetch inventory templates', async () => {
          const inventoryTemplateModel = db.getModel('inventory_template');
          const inventoryCategory = await manager('inventory_category').create({ name: 'Test' });
          const inventoryTemplate = await manager('inventory_template').create({ name: 'Test 1', type: 'parent', category: inventoryCategory.id });
          const inventoryTemplateUpdated = await manager('inventory_template').update(inventoryTemplate, { template: '{"attr":[1,2,3]}' });

          const rows = [inventoryTemplateUpdated];
          const fetcher = new Fetcher(inventoryTemplateModel, sandbox);

          await loadExternalData(rows, fetcher);
          expect(fetcher.result.meta.tree).toEqual({ type: 'common', templates: [{ name: inventoryTemplateUpdated.name, template: inventoryTemplateUpdated.template }]  });
        });

        plugins.inventory_models.connected && it('Should load compound template tree when fetch inventory categories', async () => {
          const inventoryCategoryModel = db.getModel('inventory_category');
          const inventoryCategory = await manager('inventory_category').create({ name: 'Test' });
          const inventoryTemplate = await manager('inventory_template').create({ name: 'Test 1', type: 'parent', category: inventoryCategory.id });
          const inventoryTemplateUpdated = await manager('inventory_template').update(inventoryTemplate, { template: '{"attr":[1,2,3]}' });

          const rows = [inventoryCategory];
          const fetcher = new Fetcher(inventoryCategoryModel, sandbox);

          await loadExternalData(rows, fetcher);
          expect(fetcher.result.meta.tree).toEqual({ type: 'compound', templates: [{ name: inventoryTemplateUpdated.name, template: inventoryTemplateUpdated.template }] });
        });
      });
    });
  });
});
