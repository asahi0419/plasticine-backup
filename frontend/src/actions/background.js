import Messenger from '../messenger';
import PubSub from 'pubsub-js';

import PlasticineApi from '../api';
import { processError } from "./helpers";

export const uploadAttachments = (model, record, files) => async (dispatch) => {
  const topic = `background.status.uploading.${model.id}.${record.id}`;
  PubSub.publish(topic, 'started');
  Messenger.info({ content: i18n.t('started_uploading_n_files', { defaultValue: `Started uploading ${files.length} files`, files: files.length }) });

  try {
    const { data } = await PlasticineApi.uploadAttachments(model, record, files);

    PubSub.publish(topic, 'finished');
    Messenger.info({ content: i18n.t('finished_uploading_n_files', { defaultValue: `Finished uploading ${files.length} files`, files: files.length }) });

    return data;
  } catch (error) {
    processError(error, dispatch)
  }
};
