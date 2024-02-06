import { parseOptions } from '../../../../helpers';
import AttachmentViewer from './attachment-viewer';
import Base from './base';

export default class FormObject extends Base {
  constructor(attributes, options = {}, parent) {
    super(attributes, options, parent);

    const record = this.getRecord();

    if (record) {
      if (this.has('__attachment_viewer__')) {
        this.attachmentViewer = new AttachmentViewer({}, null, this);
        this.attachmentViewer.setRecord(record);
      }
    } else {
      console.error('options.record is required');
    }
  }

  setType() {
    this.type = 'form';
  }

  getMode() {
    const { popup, exec_by = {} } = this.options;
    return popup || exec_by.popup || 'full';
  }

  getExecType() {
    const { exec_by = {} } = this.options;
    return exec_by.type;
  }

  getAttachmentViewer() {
    return this.attachmentViewer;
  }

  getOptions() {
    return this.attributes.__metadata.params || {};
  }

  getRecord() {
    return this.options.record;
  }

  has(component) {
    if (component === '__attachment_viewer__') {
      const { components: { list = [] } } = parseOptions(this.attributes.options);

      return list.includes('__attachment_viewer__');
    }
  }
}
