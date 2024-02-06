export default class EmailSaver {
  constructor(email, files, sandbox) {
    this.email = email;
    this.files = files;
    this.sandbox = sandbox;
  }

  async saveEmail() {
    this.sandbox.addVariable('emailAttributes', this.email);
    this.sandbox.addVariable('emailAttachments', this.files);

    try {
      await this.sandbox.executeScript(`
const model = await p.getModel('email');

const record = await model.insert(p.emailAttributes);
const attachments = lodash.filter(p.emailAttachments || [], (a) => {
  return !(['text/x-amp-html', 'application/ics'].includes(a.contentType) || !a.filename);
});

await Promise.each(attachments, async (a = {}) => {
  try {
    const attachment = await utils.bufferToAttachment(a.content, {
      file_name: a.filename,
      file_content_type: a.contentType
    });
    await attachment.relateTo(record);
  } catch (error) {
    p.log.error(\`error saving email with subject \${p.emailAttributes.subject} from \${p.emailAttributes.from} attachments: \${error.message}\`, 'incoming email saver')  
  }
});

return record;
`, 'plain_script');
    } catch (error) {
      
    }
  }
}