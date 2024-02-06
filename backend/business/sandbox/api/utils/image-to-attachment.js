import AttachmentProxy from '../model/record/attachment.js';
import { ParamsNotValidError } from '../../../error/index.js';

const DEFAULT_OPTIONS = { file_name: 'image', type: 'png' };

export default sandbox => async (data, options = DEFAULT_OPTIONS) => {
  if (!data) throw new ParamsNotValidError(`Missing parameter 'data' in imageToAttachment(...)`);
  if (!options.type) throw new ParamsNotValidError(`Missing parameter 'options.type' in imageToAttachment(...)`);

  const { model = {} } = sandbox;

  const buffer = Buffer.from(data, 'base64');
  const file_name = options.file_name || `image.${options.type}`
  const file_size = buffer.byteLength;
  const attributes = { file_name, file_content_type: `image/${options.type}`, file_size };
  const attachment = new AttachmentProxy(attributes, model, sandbox);

  attachment.setBuffer(buffer);

  return attachment;
};
