import { isObject, isEmpty } from 'lodash-es';

import loader from '../model.js';

describe('Presentation > Shared > Cache > Namespaces > Core > Loaders', () => {
  describe('Model', () => {
    it('Should correctly load items', async () => {
      const result = await loader({});
      expect(isObject(result)).toEqual(true);
      expect(isEmpty(result)).toEqual(false);
      expect(result[1]).toEqual(db.getModel('model'));
      expect(result['model']).toEqual(db.getModel('model'));
    });
    it('Should correctly update items (sync)', async () => {
      const result = await loader({}, { insert: [db.getModel('model')] }, 'sync');
      expect(isObject(result)).toEqual(true);
      expect(isEmpty(result)).toEqual(false);
      expect(result[1]).toEqual(db.getModel('model'));
      expect(result['model']).toEqual(db.getModel('model'));
    });
  });
});
