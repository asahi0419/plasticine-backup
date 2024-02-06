import { each, isObject, isEmpty } from 'lodash-es';

import loader from '../core-lock.js';

describe('Presentation > Shared > Cache > Namespaces > Core > Loaders', () => {
  describe('Core lock', () => {
    it('Should correctly load items', async () => {
      const model = { id: 1 };
      const result = await loader({}, { models: [ model ] });
      expect(isObject(result)).toEqual(true);
      expect(isEmpty(result)).toEqual(false);
      each(result, (o) => expect(o.model).toEqual(model.id));
    });
    it('Should correctly delete item', async () => {
      const items = {
        '1': { attribute: 'attribute', id: 1 },
        '2': { attribute: 'attribute', id: 2 },
      };
      const result = await loader(items, { action: 'delete', payload: { id: 1 } });
      expect(result).toEqual({
        '2': { attribute: 'attribute', id: 2 },
      });
    });
    it('Should correctly update item', async () => {
      const items = {
        '1': { attribute: 'attribute', id: 1 },
      };
      const result = await loader(items, { action: 'update', payload: { attribute: 'updated_attribute', id: 1 } });
      expect(result).toEqual({
        '1': { attribute: 'updated_attribute', id: 1 },
      });
    });
  });
});
