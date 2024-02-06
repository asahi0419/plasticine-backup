import { set } from 'lodash-es';

describe('Sandbox', () => {
  describe('utils.stringToAttachment(string, fileName)', () => {
    it('Should convert string to attachment', async () => {
      set(sandbox, 'context.request.model', { alias: 'test_model' });

      const string = 'string';
      const fileName = 'string-attachment';
      const attachment = await sandbox.vm.utils.stringToAttachment(string, fileName);

      expect(attachment.record.file_content_type).toEqual('application/json');
      expect(attachment.record.file_name).toEqual(fileName);
      expect(attachment.record.file_size).toEqual(6);
      expect(JSON.stringify(attachment.buffer)).toEqual(JSON.stringify({ type: 'Buffer', data: [115, 116, 114, 105, 110, 103] }));
    });
  });
});
