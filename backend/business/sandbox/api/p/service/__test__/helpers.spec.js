import { map, every } from 'lodash-es';

import { referencedFields } from '../helpers';

describe('p.service', () => {
  describe('Helpers', () => {
    describe('referencedFields(modelId)', () => {
      it('Should return referenced fields by model id', async () => {
        const model = db.getModel('model');

        const result = await referencedFields(model.id);
        const actual = await db.model('field').whereIn('id', map(result, 'id'));

        expect(every(actual, ({ options, type }) => {
          if (['reference', 'reference_to_list'].includes(type)) return options.includes(`"foreign_model":"${model.alias}"`);
          if (['global_reference'].includes(type)) return true;
        })).toEqual(true);
      });
    });
  });
});
