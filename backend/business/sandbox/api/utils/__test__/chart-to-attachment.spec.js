const { manager } = h.record;
const { utils } = sandbox.vm;

beforeAll(async () => {
  t.model = await manager('model').create();
  t.chart = await manager('chart').create({ data_source: t.model.id });
});

describe('Sandbox', () => {
  describe('utils.chartToAttachment(alias, options)', () => {
    it('Should validate input', async () => {
      let result;

      result = utils.chartToAttachment();
      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Missing parameter 'alias' in chartToAttachment(...)" });

      result = utils.chartToAttachment(t.chart.alias, {});
      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Missing parameter 'options.type' in chartToAttachment(...)" })

      result = utils.chartToAttachment(t.chart.alias);
      await expect(result).toBeDefined();

      result = utils.chartToAttachment(t.chart.alias, { type: 'png' });
      await expect(result).toBeDefined();
    });

    it('Should convert chart to attachment', async () => {
      const options = { file_name: 'test.png', type: 'png' };
      const attachment = await utils.chartToAttachment(t.chart.alias, options);

      expect(attachment.record.file_content_type).toEqual(`image/${options.type}`);
      expect(attachment.record.file_name).toEqual(options.file_name);
      expect(attachment.record.file_size).toEqual(3);
      expect(JSON.stringify(attachment.buffer)).toEqual(JSON.stringify({ type: 'Buffer', data: [114, 22, 171] }));
    });
  });
});
