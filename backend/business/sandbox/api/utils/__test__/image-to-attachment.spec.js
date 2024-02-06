const { utils } = sandbox.vm;

beforeAll(async () => {
  t.data = 'image';
});

describe('Sandbox', () => {
  describe('utils.imageToAttachment(data, options)', () => {
    it('Should validate input', async () => {
      let result;

      result = utils.imageToAttachment();
      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Missing parameter 'data' in imageToAttachment(...)" });

      result = utils.imageToAttachment(t.data, {});
      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Missing parameter 'options.type' in imageToAttachment(...)" })

      result = utils.imageToAttachment(t.data);
      await expect(result).toBeDefined();

      result = utils.imageToAttachment(t.data, { type: 'png' });
      await expect(result).toBeDefined();
    });

    it('Should convert image to attachment', async () => {
      const options = { file_name: 'test.png', type: 'png' };
      const attachment = await utils.imageToAttachment(t.data, options);

      expect(attachment.record.file_content_type).toEqual(`image/${options.type}`);
      expect(attachment.record.file_name).toEqual(options.file_name);
      expect(attachment.record.file_size).toEqual(3);
      expect(JSON.stringify(attachment.buffer)).toEqual(JSON.stringify({ type: 'Buffer', data: [138, 102, 160] }));
    });
  });
});
