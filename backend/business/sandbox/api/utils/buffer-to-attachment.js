import mime from 'mime-types';

import AttachmentProxy from '../model/record/attachment.js';
import { ParamsNotValidError } from '../../../error/index.js';

export default (sandbox) => async (buffer, options) => {
  if (!buffer) throw new ParamsNotValidError(`Missing parameter 'buffer' in bufferToAttachment(...)`);
  if (!options) throw new ParamsNotValidError(`Missing parameter 'options' in bufferToAttachment(...)`);

  const contentType = options.file_content_type || mime.lookup(options.type);
  if (!contentType) throw new ParamsNotValidError(`Wrong content type received in bufferToAttachment(...)`);

  const attachment = new AttachmentProxy({
    file_name: options.file_name || `file.${mime.extension(contentType) }`,
    file_content_type: contentType,
    file_size: buffer.byteLength,
  }, sandbox.model || {}, sandbox);

  attachment.setBuffer(buffer);

  return attachment;
};
