import Promise from 'bluebird';
import {reduce, keyBy, split} from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import logger from '../../../logger/index.js';
import createStorage from '../../../storage/factory.js';

export default (sandbox) => async () => {
  try {
    const storage = await createStorage();

    const all = await listAll();
    const unrelated = await listUnrelated(all);
    const incompleted = await listIncomplete();



    await Promise.each(unrelated, async (file) =>{
      await storage.removeObject(file.name)
      await cleanupAttachmentLink(file.name)
    });
    await Promise.each(incompleted, async (file) =>{
      await storage.removeIncompleteUpload(file.name)
      await cleanupAttachmentLink(file.name)

    });

    const totalSize = reduce(await listAll(), (result, file) => (result + file.size), 0);

    return {
      checked_amount: all.length,
      unrelated_deleted: unrelated.length,
      incomplete_deleted: incompleted.length,
      total_files_size: totalSize / (1024 * 1024),
    };
  } catch (error) {
    logger.error(error);
    return;
  }
};

async function listAll() {
  const storage = await createStorage();
  const stream = await storage.listObjects('', true);
  return new Promise((resolve, reject) => {
    const result = [];
    stream.on('error', reject);
    stream.on('data', (data) => result.push(data));
    stream.on('end', () => resolve(result));
  });
}

async function listUnrelated(all) {
  const attachments = await db.model('attachment').select(['id']).where({ __inserted: true });
  const attachmentsById = keyBy(attachments, 'id');

  return reduce(all, (result, file) => {
    const [ namespace, model, record, id ] = file.name.split('/');
    if (!attachmentsById[id]) return result;
    return [ ...result, file ];
  }, []);
}

async function listIncomplete() {
  const storage = await createStorage();
  const stream = await storage.listIncompleteUploads('', true);
  return new Promise((resolve, reject) => {
    const result = [];
    stream.on('error', reject);
    stream.on('data', (data) => result.push(data));
    stream.on('end', () => resolve(result));
  });
}


async function cleanupAttachmentLink(filename){
  const [,modelId,recordId,attachmentId,file]= split(filename, '/')
  await db.model('attachment').where({id:attachmentId}).delete();
  const [record] = await db.model(modelId).where('id',recordId)
  if (record.file) await db.model(modelId).where({id: recordId}).update({file:null})

}