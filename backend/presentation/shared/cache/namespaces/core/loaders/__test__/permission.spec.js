import { each, isObject, isEmpty, isArray } from 'lodash-es';

import loader from '../permission.js';

describe('Presentation > Shared > Cache > Namespaces > Core > Loaders', () => {
  describe('Permission', () => {
    it('Should correctly load items', async () => {
      const model = { id: 1 };
      const result = await loader({}, { models: [ model ] });
      expect(isObject(result)).toEqual(true);
      expect(isEmpty(result)).toEqual(false);
      expect(isArray(result[model.id])).toEqual(true);
      expect(isEmpty(result[model.id])).toEqual(false);
      each(result, (g) => each(g, (o) => expect(o.model).toEqual(model.id)));
    });
    it('Should correctly delete item', async () => {
      const items = {
        '1': [
          { attribute: 'attribute', id: 1, model: 1 },
          { attribute: 'attribute', id: 2, model: 1 },
        ]
      };
      const result = await loader(items, { action: 'delete', payload: { model: 1, id: 1 } });
      expect(result).toEqual({
        '1': [
          { attribute: 'attribute', id: 2, model: 1 },
        ]
      });
    });
    it('Should correctly update item', async () => {
      const items = {
        '1': [
          { attribute: 'attribute', id: 1, model: 1 },
        ]
      };
      const result = await loader(items, { action: 'update', payload: { model: 1, id: 1, attribute: 'attribute_updated' } });
      expect(result).toEqual({
        '1': [
          { attribute: 'attribute_updated', id: 1, model: 1 },
        ]
      });
    });
  });
});
