import merge from 'deepmerge';
import Promise from 'bluebird';
import { keys, pick, uniqWith, reduce, each, map, filter } from 'lodash-es';

import CONFIG from './config.js';
import * as HELPERS from './helpers.js';
import * as PROCESS from './process/index.js';

export const config = CONFIG;

const normalize = (config = CONFIG) => {
  return reduce(config, (result, items, section) => {
    return [ ...result, ...map(items, (item) => ({ ...item, section })) ];
  }, []);
};

export const getSetting = (config = CONFIG) => {
  return reduce(config, (result, items, section) => {
    return { ...result, [section]: map(items, ({ section, ...item }, alias) => ({ alias, install: JSON.parse(item.install || 'false'), active: JSON.parse(item.active || 'false') })) };
  }, {});
};

export const get = async (config = CONFIG) => {
  const merger = { arrayMerge: (t, s) => uniqWith([ ...s, ...t ], (te, se) => te.alias === se.alias) };
  const { getSetting: getSettingCustom } = await import('../business/setting/index.js');

  const extensionsDefault = getSetting(config);
  const extensionsCustom = pick(getSettingCustom('extensions'), keys(config));
  const extensions = merge(extensionsDefault, extensionsCustom, merger);

  return merge(extensionsDefault, extensionsCustom, merger);
};

export const setup = async (config = CONFIG, context = {}) => {
  const extensions = await get(config);
  const folders = await HELPERS.getFolders(normalize(extensions));

  each(folders.missed, (extension) => {
    console.log('\x1b[2m%s\x1b[0m', `[Extensions - Setup] Miss extension, please install (${extension.alias})`)
  });

  await Promise.each(folders.cloned, async (extension) => {
    const command = extension.active ? 'activate' : 'deactivate';
    const status = extension.active ? 'active' : 'inactive';

    const record = await HELPERS.getRecord(extension, context);
    const object = await HELPERS.getObject(extension);

    if (!object.alias) {
      console.log('\x1b[32m%s\x1b[0m', `[Extensions - Setup] Failure ${command} (${extension.alias})`);
      return;
    }


    await PROCESS.flags('.active', extension);
    await PROCESS.dataLayer(command, extension, context);
    await context.db.model('plugin').where({ id: record.id }).update({ ...object, status });

    if (extension.active) {
      console.log('\x1b[32m%s\x1b[0m', `[Extensions - Setup] Success ${command} (${extension.alias})`);
    }
  });

  await context.db.model('setting')
    .where({ alias: 'extensions' })
    .update({ value: JSON.stringify(extensions) });
};

export const init = async (config = CONFIG, context = {}) => {
  const extensions = await get(config);
  const folders = await HELPERS.getFolders(filter(normalize(extensions), 'active'));

  each(folders.missed, (extension) => {
    console.log('\x1b[2m%s\x1b[0m', `[Extensions - Init] Miss extension, please install (${extension.alias})`)
  });

  await Promise.each(filter(folders.cloned, 'active'), async (extension) => {
    const path = `${HELPERS.getFolderPath(extension)}/init/index.js`;

    await HELPERS.onPathExists(path, async () => {
      const result = (await import(path)).default(context);

      if (result) {
        await result;
        console.log('\x1b[32m%s\x1b[0m', `[Extensions - Init] Success (${extension.alias})`);
      } else {
        console.log('\x1b[32m%s\x1b[0m', `[Extensions - Init] Nothing (${extension.alias})`);
      }
    });
  });
};
