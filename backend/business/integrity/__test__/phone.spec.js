import IntegrityManager from '../index.js';

const { manager } = h.record;

describe('IntegrityManager: Phone', () => {
  describe('.perform(\'validate\')', () => {
    it('It should throw an exception if dependent users found', async () => {
      const phone = await manager('phone').create({ name: 'Test', number: '1234567890', status: 'new' });
      const field = await db.model('field').where({ model: 3, alias: 'phones' }).getOne();
      const rtl = await manager('rtl').create({ source_field: field.id, source_record_id: 1, target_record_id: phone.id });

      const result = new IntegrityManager(phone, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['user'] }});
    });
  });
});
