import AttachmentProxy from '../model/record/attachment.js';

export default sandbox => (string, fileName) => {
  const { model = {} } = sandbox;

  const buffer = Buffer.from(string);
  const file_name = fileName || `${model.alias}_${+new Date()}.json`
  const file_size = buffer.byteLength;
  const attributes = { file_name, file_content_type: 'application/json', file_size };
  const attachment = new AttachmentProxy(attributes, model, sandbox);

  attachment.setBuffer(buffer);

  return attachment;
};
