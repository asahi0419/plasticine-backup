const { utils } = sandbox.vm;

beforeAll(async () => {
  t.data = Buffer.from('buffer');
});

describe('Sandbox', () => {
  describe('utils.bufferToAttachment(data, options)', () => {
    it('Should validate input', async () => {
      let result;

      result = utils.bufferToAttachment();
      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Missing parameter 'buffer' in bufferToAttachment(...)" });

      result = utils.bufferToAttachment(t.data);
      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Missing parameter 'options' in bufferToAttachment(...)" })

      result = utils.bufferToAttachment(t.data, {});
      await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: "Missing parameter 'options.type' in bufferToAttachment(...)" })

      result = utils.bufferToAttachment(t.data, { type: 'png' });
      await expect(result).toBeDefined();
    });

    it('Should convert buffer to attachment', async () => {
      const options = { file_name: 'test.png', type: 'png' };
      const attachment = await utils.bufferToAttachment(t.data, options);

      expect(attachment.record.file_content_type).toEqual(`image/${options.type}`);
      expect(attachment.record.file_name).toEqual(options.file_name);
      expect(attachment.record.file_size).toEqual(6);
      expect(JSON.stringify(attachment.buffer)).toEqual(JSON.stringify({ type: 'Buffer', data: [98, 117, 102, 102, 101, 114] }));
    });
  });
});
