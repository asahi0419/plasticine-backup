import mime from 'mime-types';
import Promise from 'bluebird';

import db from '../../../data-layer/orm/index.js';
import cleaner from '../../storage/cleaner.js';
import createStorage from '../../storage/factory.js';

const abortActions = (record) => {
  if (record.linked_from) return true;
};

const processAttributes = (record) => {
  if (record.file_name) {
    if (!record.file_content_type) {
      const name_array = record.file_name.split('.');
      if (name_array) {
        record.file_content_type = mime.lookup(name_array.pop());
      }
    }
  }
};

const cleanupLinks = async (record, sandbox) => {
  const links = await db.model('attachment').where({ linked_from: record.id });

  await Promise.each(links, ({ id }) => db.model('attachment', sandbox).destroyRecord({ id }));
};

const updateStorage = async (record, sandbox) => {
  if (sandbox.record.isPersisted()) {
    if (sandbox.record.isChanged('file_name')) {
      const newName = sandbox.record.getValue('file_name');

      const source = await sandbox.record.getPath();
      const target = `${source.slice(0, source.lastIndexOf('/'))}/${newName}`;

      const storage = await createStorage();
      await storage.copyObject(target, source);
      await storage.removeObject(source);
    }
  }
};

const cleanupStorage = (record) => cleaner([record]);

export default {
  abort_actions: abortActions,
  before_insert: [ processAttributes ],
  after_update_validation: [ updateStorage ],
  after_delete: [ cleanupLinks, cleanupStorage ],
};
