import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import fs from 'fs';
import Promise from 'bluebird';
import { filter } from 'lodash-es';

export const onPathExists = async (path, callback) => {
  try {
    const exists = await new Promise((resolve) => {
      fs.exists(path, resolve);
    });

    if (exists) {
      const result = await callback();

      return result;
    }
  } catch (error) {
    // console.log(error);
  }
};

export const getList = async (dirname) => {
  const listDir = `${dirname}/list`;

  let result = [];
  await onPathExists(listDir, async () => {
    const content = fs.readdirSync(listDir);
    const reducer = async (result, dir) => {
      await onPathExists(`${listDir}/${dir}`, async () => {
        const c = (await import(`${listDir}/${dir}/index.js`)).default;
        return (result = [ ...result, c ])
      });
      return result;
    };

    result = await Promise.reduce(content, reducer, []);
  });

  return result;
}

export const getFolderPath = (extension = {}) => {
  return `${__dirname}/${extension.section}/list/${extension.alias}`;
};

export const getFolders = async (extensions = [], flagName = '') => {
  return Promise.reduce(extensions, async (result, extension) => {
    await onPathExists(`${getFolderPath(extension)}/${flagName}`, async () => {
      result.cloned.push(extension);
      result.missed = filter(result.missed, ({ alias }) => alias !== extension.alias);
    });

    return result;
  }, { cloned: [], missed: extensions });
};

export const getRepository = (extension = {}) => {
  const { git = {} } = extension;

  const user = (git.user || '').trim();
  const pass = (git.pass || '').trim();
  const path = (git.path || '').trim();

  const [ protocol, url ] = path.split('//');

  return `${protocol}//${user}:${pass}@${url}/${extension.alias}.git`;
};

export const getObject = async (extension = {}) => {
  let result = {};

  const path = getFolderPath(extension);

  await onPathExists(path, async () => {
    result = (await import(`${path}/index.js`)).default
  });

  return result;
};

export const getRecord = async (extension = {}, context = {}) => {
  const record = await context.db.model('plugin').where({ alias: extension.alias }).getOne();

  if (!record) {
    const status = extension.active ? 'active' : 'inactive';
    const object = await getObject(extension);

    if (object.alias) {
      await context.db.model('plugin').insert({ ...object, status, created_by: context.sandbox.user.id, created_at: new Date() });
      return context.db.model('plugin').where({ alias: extension.alias }).getOne();
    }
  }

  return record;
};
