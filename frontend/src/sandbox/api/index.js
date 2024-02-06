import moment from 'moment';
import lodash from 'lodash';
import PubSub from 'pubsub-js';
import * as BlobUtil from 'blob-util';
import FileDownload from 'js-file-download';
import { Buffer } from 'buffer';

import store from '../../store';
import pNamespace from './p';
import utilsNamespace from './utils';

export default class Api {
  static create(...args) {
    return new Api(...args);
  }

  constructor(...args) {
    this.context = {
      p: pNamespace(...args),
      utils: utilsNamespace(...args),
      store: store.redux.instance,

      moment,
      lodash,
      Buffer,
      PubSub,
      BlobUtil,
      FileDownload,
    };
  }
}
