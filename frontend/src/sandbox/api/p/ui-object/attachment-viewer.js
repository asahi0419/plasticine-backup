import Base from './base';

export default class AttachmentViewer extends Base {
  setType() {
    this.type = 'attachmentPreviewer';
  }

  getRecord() {
    return this.record;
  }

  setRecord(record) {
    const { attributes: { id: formId } } = this.getParent();
    this.record = record;

    PubSub.publish(`attachment_viewer.${formId}.set_record`, record.record.attributes);
  }
}
