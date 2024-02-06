import AttachmentProxy from '../attachment.js';

const { manager } = h.record;

describe('AttachmentProxy', () => {
  describe('get fields()', () => {
    it('Should return attachment fields', () => {
      const attachment = new AttachmentProxy({}, 'model', sandbox);

      const result = attachment.fields;
      const expected = db.getFields({ model: db.getModel('attachment').id });

      expect(result).toEqual(expected);
    });
  });

  describe('setValue(alias, value)', () => {
    it('Should be able to set value', () => {
      const attachment = new AttachmentProxy({}, 'model', sandbox);

      expect(attachment.getValue('thumbnail')).toEqual();
      expect(attachment.setValue('thumbnail', true)).toEqual(true);
      expect(attachment.getValue('thumbnail')).toEqual(true);
    });
  });

  describe('getContent()', () => {
    it('Should return attachment content', async () => {
      const content = 'string';

      const attachment = new AttachmentProxy({}, 'model', sandbox);
      attachment.setBuffer(Buffer.from(content));
      const expected = await attachment.getContent();

      expect(expected).toEqual(content);
    });
  });

  describe('getFileMeta()', () => {
    it('Should return undefined if no file', async () => {
      const attachment = new AttachmentProxy({}, 'model', sandbox);
      const expected = await attachment.getFileMeta();

      expect(expected).toEqual();
    });
  });
});
