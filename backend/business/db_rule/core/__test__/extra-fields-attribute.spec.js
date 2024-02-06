const { manager } = h.record;

describe('DB Rule: Extra fields attribute', () => {
  describe('processOptions', () => {
    it('Comments: Should set default length if not specified', async () => {
      const efa = await manager('extra_fields_attribute').create({ type: 'comments' });
      const expected = '{"length":1024}';

      expect(efa.options).toEqual(expected);
     });
   });
});
