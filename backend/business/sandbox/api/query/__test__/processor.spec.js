import { find } from 'lodash-es';

import Processor from '../processor.js';
import { reloadCache } from '../../../../db_rule/core/field/index.js';

const { manager } = h.record;

beforeAll(async () => {
  t.model = await manager('model').create();
  t.field = await manager('field').create({ model: t.model.id, type: 'integer' });
});

describe('Processor (Sandbox query)', () => {
  describe('.perform()', () => {
    it('Should set model proxy fields', async () => {
      const model = await sandbox.vm.p.getModel(t.model.alias);
      const processor = await new Processor(model.find({}));
      let fields, field;

      jest.spyOn(processor.builder.modelProxy, 'setFields');
      await processor.perform();
      expect(processor.builder.modelProxy.setFields).toBeCalled();
      jest.clearAllMocks();
    });
    it('Should process only inserted fields', async () => {
      const model = await sandbox.vm.p.getModel(t.model.alias);
      const processor = await new Processor(model.find({}));
      let fields, field;

      await processor.perform();
      fields = processor.context.fieldsGroupedByModel;
      field = find(fields[t.model.id], { id: t.field.id });
      expect(field).toBeDefined();

      await db.model('field').where({ id: t.field.id }).update({ __inserted: false });
      await reloadCache('delete')(field, sandbox);
      await reloadCache('insert')(await db.model('field').where({ id: t.field.id }).getOne(), sandbox);

      await processor.perform();
      fields = processor.context.fieldsGroupedByModel;
      field = find(fields[t.model.id], { id: t.field.id });
      expect(field).toBe(undefined);
    });
  });
});
