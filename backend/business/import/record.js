import fs from 'fs';
import Promise from 'bluebird';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { pick, keys, isEqual, isEmpty, map, find, reduce } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import RecordProxy from '../sandbox/api/model/record/index.js';
import * as HELPERS from '../helpers/index.js';

export default async (records, { model, sandbox, mode }) => {
  if (records === undefined) return;

  const fields = await db.model('field')
    .where({ model: model.id, virtual: false })
    .whereNotIn('type', ['reference', 'global_reference']);

  let promise = Promise.resolve();

  records.forEach((record) => {
    promise = promise.then(() => processRecord(model, record, fields, { sandbox, mode }));
  });

  return promise;
};

async function processFileField(model, record, fileFiledAliases=[], sandbox) {
  let targetRecord = new RecordProxy(record, model, sandbox)
  let attachment
  for (let i=0; i < fileFiledAliases.length; i++) {
    let fileFiledAlias = fileFiledAliases[i]
    let filePath = record[fileFiledAlias]
    let fileName = path.basename(filePath)
    let __dirname = dirname(fileURLToPath(import.meta.url));
    let assetPath = path.join(__dirname, '../../assets/document-templates/', filePath)
    let buffer = fs.readFileSync(assetPath)
    attachment = await targetRecord.getAttachmentByName(record[fileFiledAlias])

    if (attachment) {
      let tmpBuffer = await attachment.getBuffer()
      if (tmpBuffer && buffer && tmpBuffer.byteLength !== buffer.byteLength) {
        attachment.setOptions({ check_permission: { all: false }})
        await attachment.delete()
        let options = { file_name: fileName, type: record['format'] || 'docx' }
        let newAttachment = await sandbox.vm.utils.bufferToAttachment(buffer, options)
        await newAttachment.linkTo(targetRecord)
      }
    } else {
      let options = { file_name: fileName, type: record['format'] || 'docx' }
      let newAttachment = await sandbox.vm.utils.bufferToAttachment(buffer, options)
      await newAttachment.linkTo(targetRecord)
    }
  }
}

function getFileFieldAlias(fields = []) {
  let fileFieldAliases = []
  fields.forEach((field) => {
    if (field.type === 'file') fileFieldAliases.push(field.alias)
  })
  return fileFieldAliases
}

async function findRecord(model, attributes, fields, sandbox) {
  const uniqueField = find(fields, { index: 'unique' });
  const clause = pick(attributes, uniqueField ? [uniqueField.alias] : map(fields, 'alias'));

  return sandbox
    .addVariable('model', model)
    .addVariable('clause', clause)
    .executeScript(`return (await p.getModel(p.model.alias))
  .setOptions({ check_permission: { all: false } })
  .findOne(p.clause).raw()`, `find_record`)
}

async function processRecord(model, attributes, fields, { sandbox, mode }) {
  let record;

  if (model.alias === 'user') {
    if (attributes.email) {
      record = await db.model('account').where({ email: attributes.email }).getOne();
    }
  } else {
    record = await findRecord(model, attributes, fields, sandbox);
  }

  if (record) {
    if (['page', 'static_translation', 'scheduled_task', 'document_template', 'web_service'].includes(model.alias)) {
      const changed = await Promise.reduce(Object.keys(attributes), async (result, key) => {
        const field = find(fields, { alias: key })
        if (!field) return result

        const value = attributes[key]

        if (field.type === 'reference_to_list') {
          const { foreign_model } = HELPERS.parseOptions(field.options);
          const records = await db.model(foreign_model).whereIn('id', record[key]);
          if (!records.length) result[key] = value;
        } else {
          if (!isEqual(record[key], value)) {
            if (value !== undefined) {
              result[key] = value;
            }
          }
        }

        return result;
      }, {});

      if (!isEmpty(changed)) {
        await db.model(model, sandbox).updateRecord(record, changed, mode !== 'seeding');
        console.log('\x1b[32m%s\x1b[0m', `${model.name}: record '${record.alias || record.id}' updated. (${keys(changed).join(', ')}) `);
      }
    }
  } else {
    if (model.alias === 'user')
        return db.model(model, sandbox).createRecord(attributes, mode !== 'seeding');

    await db.model(model, sandbox).createRecord(attributes, mode !== 'seeding');
  }

  if (['document_template'].includes(model.alias)) {
    record = await findRecord(model, attributes, fields, sandbox);
    const fileFiledAliases = getFileFieldAlias(fields)
    if (fileFiledAliases.length) {
      try {
        await processFileField(model, record, fileFiledAliases, sandbox)
      } catch (error) {
        // console.log(error)
      }
    }
  }
}
