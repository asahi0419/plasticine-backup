import { createRequire } from "module";
const require = createRequire(import.meta.url)

import AttachmentProxy from '../../model/record/attachment.js';
import buildDocxByTemplateFunction from '../build-docx-by-template/index.js';

const HELPERS = require('../build-docx-by-template/helpers.js');

describe('Sandbox', () => {
  describe('utils.buildDocxByTemplate(templateAttachment, data)', () => {
    it('Should return attachment generated by template', async () => {
      const buildDocxByTemplate = buildDocxByTemplateFunction(sandbox);

      const model = db.getModel('model');
      const buffer = { byteLength: 10 };
      const attributes = { file_name: 'file_name', file_size: buffer.byteLength };

      HELPERS.getAttributes = jest.fn(() => attributes);
      HELPERS.getBuffer = jest.fn(() => Promise.resolve(buffer));

      const result = await buildDocxByTemplate({ model }, {});

      expect(result).toBeInstanceOf(AttachmentProxy);
      expect(result.attributes.file_name).toEqual(attributes.file_name);
      expect(result.attributes.file_size).toEqual(attributes.file_size);
      expect(result.buffer).toEqual(buffer);
    });
  });
});
