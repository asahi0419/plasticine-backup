import { EventEmitter } from 'events';
import moment from 'moment';

export default class PasterService extends EventEmitter {
  constructor(record) {
    super();
    this.record = record;
  }

  listen() {
    window.addEventListener('paste', this.handler);
  }

  stop() {
    window.removeEventListener('paste', this.handler);
  }

  renameFile(file) {
    const now = moment().format('YYYY-MM-DD_HH:mm:ss');
    const type = file.type.split('/')[1];
    const fileName = `${now}_${this.record.id}.${type}`;
    return new File([file.slice(0, -1, file.type)], fileName, { type: file.type });
  }

  handler = (e) => {
    this.emit('pasting-image', e);

    if (e.clipboardData && e.clipboardData.items) {
      const items = e.clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = this.renameFile(items[i].getAsFile());

          const URLObj = (window.URL || window.webkitURL);
          const source = URLObj.createObjectURL(file);

          const pastedImage = new Image();
          pastedImage.onload = () => this.emit('paste-image', file);
          pastedImage.src = source;
        }
      }
    }
  };
}
